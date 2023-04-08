const errorHandler = (err, req, res) => {
  const statusCode = res.statusCode ? res.statusCode : 500;

  let errorObj;

  process.env.NODE_ENV === "development"
    ? (errorObj = {
        status: "error",
        message: err.message,
        stack: err.stack,
      })
    : (errorObj = {
        status: "error",
        message: err.message,
      });

  res.status(statusCode).json(errorObj);
};

module.exports = errorHandler;
