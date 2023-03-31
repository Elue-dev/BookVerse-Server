const sendErrorDev = (err, res) => {
  const errorObj =
    process.env.NODE_ENV === "development"
      ? {
          status: err.status,
          message: err.message,
          stack: err.stack,
        }
      : {
          status: err.status,
          message: err.message,
        };

  res.status(err.statusCode).json(errorObj);
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === "production") {
    sendErrorDev(err, res);
  }
};
