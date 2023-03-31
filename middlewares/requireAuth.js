const GlobalError = require("../helpers/error.handler");
const postgres = require("../postgres");
const jwt = require("jsonwebtoken");
const catchAsync = require("../helpers/catchAsync");

exports.requireAuth = catchAsync(async (req, res, next) => {
  let token;
  let headers = req.headers.authorization;

  if (headers?.startsWith("Bearer")) {
    token = headers.split(" ")[1];
  } else if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    return next(new GlobalError("You are not authenticated", 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const getUserFromDB = await postgres.query(
      "SELECT * FROM users WHERE id = $1",
      [decoded.id]
    );
    req.user = getUserFromDB.rows[0];
  } catch (error) {
    return next(new GlobalError("Session expired. Please log in again", 401));
  }

  next();
});
