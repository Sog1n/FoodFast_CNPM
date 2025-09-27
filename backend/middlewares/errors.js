const ErrorHandler = require("../utils/errorHandler");

module.exports = (err, req, res, next) => {
  // Nếu không có statusCode thì gán mặc định là 500
  err.statusCode = err.statusCode || 500;

  // Nếu chạy trong môi trường DEVELOPMENT → log chi tiết
  if (process.env.NODE_ENV === "DEVELOPMENT") {
    res.status(err.statusCode).json({
      success: false,
      error: err,
      errMessage: err.message,
      stack: err.stack,
    });
  }

  // Nếu chạy trong môi trường PRODUCTION → ẩn thông tin nhạy cảm
  if (process.env.NODE_ENV === "PRODUCTION") {
    let error = { ...err };
    error.message = err.message;

    // Lỗi: ObjectId không hợp lệ (CastError của Mongoose)
    if (err.name === "CastError") {
      const message = `Resource not found. Invalid: ${err.path}`;
      error = new ErrorHandler(message, 400);
    }

    // Lỗi: ValidationError (validate trong mongoose fail)
    if (err.name === "ValidationError") {
      const message = Object.values(err.errors).map((val) => val.message);
      error = new ErrorHandler(message, 400);
    }

    // Lỗi: Duplicate Key (MongoDB code 11000)
    if (err.code === 11000) {
      const message = `Duplicate ${Object.keys(err.keyValue)} entered`;
      error = new ErrorHandler(message, 400);
    }

    // Lỗi: JWT không hợp lệ
    if (err.name === "JsonWebTokenError") {
      const message = "JSON Web Token is invalid. Try Again!!!";
      error = new ErrorHandler(message, 400);
    }

    // Lỗi: JWT hết hạn
    if (err.name === "TokenExpiredError") {
      const message = "JSON Web Token is expired. Try Again!!!";
      error = new ErrorHandler(message, 400);
    }

    res.status(error.statusCode).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};
