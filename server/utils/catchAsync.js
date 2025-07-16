/**
 * Wraps an async function to catch errors and pass them to Express's error handling middleware.
 * @param {Function} fn - The async function to wrap
 * @returns {Function} A middleware function that handles errors
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    // Execute the async function and catch any errors
    Promise.resolve(fn(req, res, next)).catch((err) => next(err));
  };
};

module.exports = catchAsync;
