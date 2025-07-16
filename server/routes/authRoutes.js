const express = require('express');
const router = express.Router();
const { google } = require('googleapis');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/config');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const { createAndSendToken } = require('../utils/jwt');

// @route   GET /api/auth/google
// @desc    Authenticate with Google
// @access  Public
router.get('/google', (req, res) => {
  try {
    const oauth2Client = new google.auth.OAuth2(
      config.google.clientId,
      config.google.clientSecret,
      config.google.redirectUri
    );

    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email',
      ],
    });

    res.redirect(url);
  } catch (error) {
    console.error('Error generating Google auth URL:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error initializing Google authentication'
    });
  }
});

// @route   GET /api/auth/google/callback
// @desc    Google auth callback
// @access  Public
router.get('/google/callback', catchAsync(async (req, res, next) => {
  if (!req.query.code) {
    return next(new AppError('Authorization code not provided', 400));
  }

  const oauth2Client = new google.auth.OAuth2(
    config.google.clientId,
    config.google.clientSecret,
    config.google.redirectUri
  );

  // Exchange code for tokens
  const { tokens } = await oauth2Client.getToken(req.query.code);
  oauth2Client.setCredentials(tokens);

  // Get user info
  const oauth2 = google.oauth2({
    auth: oauth2Client,
    version: 'v2',
  });

  const { data } = await oauth2.userinfo.get();
  
  if (!data.email || !data.name) {
    return next(new AppError('Could not retrieve user information from Google', 400));
  }

  // Find or create user using our model method
  const user = await User.findOrCreateFromGoogle({
    sub: data.id,
    name: data.name,
    email: data.email,
    picture: data.picture
  });

  // Create and send token
  createAndSendToken(user, 200, res);

  // Redirect to frontend with token in URL (for OAuth flow)
  const token = jwt.sign(
    { id: user._id },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
  
  res.redirect(`${config.frontendUrl}/auth/success?token=${token}`);
}));

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(new AppError('You are not logged in! Please log in to get access.', 401));
  }

  // Verify token
  const decoded = await jwt.verify(token, config.jwt.secret);

  // Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError('The user belonging to this token no longer exists.', 401));
  }

  // Grant access to protected route
  res.status(200).json({
    status: 'success',
    data: {
      user: currentUser
    }
  });
}));

// @route   GET /api/auth/logout
// @desc    Logout user
// @access  Private
router.get('/logout', (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  
  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully',
  });
});

// @route   POST /api/auth/refresh-token
// @desc    Refresh access token
// @access  Public
router.post('/refresh-token', catchAsync(async (req, res, next) => {
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    return next(new AppError('No refresh token provided', 400));
  }

  // Verify refresh token
  const decoded = await jwt.verify(refreshToken, config.jwt.refreshSecret);
  
  // Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError('The user belonging to this token no longer exists.', 401));
  }

  // Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(new AppError('User recently changed password! Please log in again.', 401));
  }

  // Create new access token
  const accessToken = jwt.sign(
    { id: currentUser._id },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );

  // Send new access token
  res.status(200).json({
    status: 'success',
    accessToken,
    expiresIn: config.jwt.expiresIn
  });
}));

module.exports = router;
