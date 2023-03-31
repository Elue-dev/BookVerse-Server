class GlobalError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;

    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";

    this.isOperational = true;

    process.env.NODE_ENV === "development" &&
      Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = GlobalError;
