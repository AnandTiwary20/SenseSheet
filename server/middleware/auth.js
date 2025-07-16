const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/appError');
const { verifyToken } = require('../utils/jwt');

// Middleware to protect routes - requires authentication
const protect = async (req, res, next) => {
  try {
    // 1) Get token from header or cookies
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
      return next(
        new AppError('You are not logged in! Please log in to get access.', 401)
      );
    }

    // 2) Verify token
    const decoded = await verifyToken(token);

    // 3) Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(
        new AppError('The user belonging to this token no longer exists.', 401)
      );
    }

    // 4) Check if user changed password after the token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return next(
        new AppError('User recently changed password! Please log in again.', 401)
      );
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    res.locals.user = currentUser;
    next();
  } catch (error) {
    next(error);
  }
};

// Only for rendered pages, no errors!
const isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      // 1) Verify token
      const decoded = await verifyToken(req.cookies.jwt);

      // 2) Check if user still exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      // 3) Check if user changed password after the token was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      // THERE IS A LOGGED IN USER
      res.locals.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

// Restrict to certain roles
const restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles ['admin', 'lead-guide']. role='user'
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }

    next();
  };
};

// Check if the user is the owner of the resource
const isOwner = (model) => {
  return async (req, res, next) => {
    try {
      const doc = await model.findById(req.params.id);
      
      if (!doc) {
        return next(new AppError('No document found with that ID', 404));
      }
      
      // If the user is an admin, they can access any resource
      if (req.user.role === 'admin') return next();
      
      // Check if the user is the owner of the resource
      if (doc.user && doc.user.toString() !== req.user.id) {
        return next(
          new AppError('You do not have permission to perform this action', 403)
        );
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = {
  protect,
  restrictTo,
  isLoggedIn,
  isOwner
};
