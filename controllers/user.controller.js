const catchAsync = require("../helpers/catchAsync");
const GlobalError = require("../helpers/error.handler");
const postgres = require("../postgres");
const bcrypt = require("bcryptjs");

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const sqlQuery = "SELECT id, username, email FROM users";

  postgres.query(sqlQuery, (err, users) => {
    if (err) return next(new GlobalError(err, 500));
    return res.status(200).json({
      results: users.rows.length,
      users: users.rows,
    });
  });
});

exports.getSingleUser = catchAsync(async (req, res, next) => {
  const sqlQuery = "SELECT id, username, email FROM users WHERE id = $1";

  postgres.query(sqlQuery, [req.params.userId], (err, user) => {
    if (err) return next(new GlobalError(err, 500));
    return res.status(200).json(user.rows[0]);
  });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  let hashedPassword;
  let sqlQuery;
  let values;

  if (Number(req.params.userId) !== req.user?.id)
    return next(new GlobalError("You can only update your account", 500));

  if (req.body.password) {
    const salt = bcrypt.genSaltSync(10);
    hashedPassword = bcrypt.hashSync(req.body.password, salt);
    sqlQuery =
      "UPDATE users SET username = $1, email = $2, password = $3 WHERE id = $4 RETURNING id, username, email ";
    values = [
      req.body.username,
      req.body.email,
      hashedPassword,
      req.params.userId,
    ];
  } else {
    sqlQuery =
      "UPDATE users SET username = $1, email = $2 WHERE id = $3 RETURNING id, username, email ";

    values = [req.body.username, req.body.email, req.params.userId];
  }

  postgres.query(sqlQuery, values, (err, user) => {
    if (err) return next(new GlobalError(err, 500));
    return res.status(200).json(user.rows[0]);
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  if (Number(req.params.userId) !== req.user?.id)
    return next(new GlobalError("You can only delete your account", 500));

  const sqlQuery = "DELETE FROM users WHERE id = $1";

  postgres.query(sqlQuery, [req.params.userId], (err, user) => {
    if (err) return next(new GlobalError(err, 500));
    return res.status(200).json("User has been deleted");
  });
});
