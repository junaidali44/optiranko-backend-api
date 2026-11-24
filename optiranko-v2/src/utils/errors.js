class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

const errors = {
  badRequest: (msg) => new AppError(msg, 400, 'BAD_REQUEST'),
  unauthorized: (msg) => new AppError(msg, 401, 'UNAUTHORIZED'),
  forbidden: (msg) => new AppError(msg, 403, 'FORBIDDEN'),
  notFound: (msg) => new AppError(msg, 404, 'NOT_FOUND'),
  conflict: (msg) => new AppError(msg, 409, 'CONFLICT'),
  tooMany: (msg) => new AppError(msg, 429, 'TOO_MANY_REQUESTS'),
  internal: (msg) => new AppError(msg, 500, 'INTERNAL_ERROR'),
};

module.exports = { AppError, errors };