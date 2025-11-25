/**
 * Centralized error handling middleware.
 * Always responds with status 500 and a consistent JSON structure.
 *
 * @param {Error} err The error object passed down the middleware chain.
 * @param {Request} req Express request object.
 * @param {Response} res Express response object.
 * @param {Function} next Express next middleware function.
 */
function errorHandler(err, req, res, next) {
  // Log the error for debugging purposes
  console.error(err);
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Internal server error',
    },
  });
}

module.exports = errorHandler;