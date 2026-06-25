/**
 * Custom error class that carries an HTTP status code alongside the message,
 * so the central error handler can respond with the right status.
 */
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ApiError;
