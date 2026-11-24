const logger = require('../config/logger');

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const code = err.code || 'INTERNAL_ERROR';

  // Log the REAL error to the server console so we can see it in SSH
  logger.error(`[${req.method} ${req.originalUrl}] ${statusCode} - ${err.message}\n${err.stack}`);

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message: err.isOperational ? err.message : 'Internal server error',
    },
  });
};

module.exports = { errorHandler };