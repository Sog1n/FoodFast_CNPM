class ErrorHandler extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;

    // Lưu stack trace (giúp debug dễ hơn)
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ErrorHandler;
