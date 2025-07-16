const jwt = require('jsonwebtoken');
const config = require('../config/config');
const AppError = require('./appError');

// Generate JWT token
const signToken = (id) => {
  return jwt.sign(
    { id },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
};

// Verify JWT token
const verifyToken = async (token) => {
  try {
    if (!token) {
      throw new Error('No token provided');
    }
    
    const decoded = await jwt.verify(token, config.jwt.secret);
    return decoded;
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      throw new AppError('Invalid token. Please log in again!', 401);
    }
    if (error.name === 'TokenExpiredError') {
      throw new AppError('Your token has expired! Please log in again.', 401);
    }
    throw error;
  }
};

// Create and send token, set cookie
const createAndSendToken = (user, statusCode, res) => {
  // 1) Generate token
  const token = signToken(user._id);
  
  // 2) Set cookie options
  const cookieOptions = {
    expires: new Date(
      Date.now() + config.jwt.cookieExpiresIn * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  };

  // 3) Remove password from output
  user.password = undefined;

  // 4) Send response with token
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};

module.exports = {
  signToken,
  verifyToken,
  createAndSendToken
};
