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

  if (Number(req.params.userId) !== req.user.id)
    return next(new GlobalError("You can only update your account", 500));

  if (req.body.password) {
    if (req.body.password !== req.body.confirmPassword) {
      return next(
        new GlobalError("New password credentials do not match", 500)
      );
    }

    const salt = bcrypt.genSaltSync(10);
    hashedPassword = bcrypt.hashSync(req.body.password, salt);

    if (req.body.password === req.body.oldPassword)
      return next(
        new GlobalError(
          "Please choose a different password from your old password"
        )
      );

    const matchPassword = bcrypt.compareSync(
      req.body.oldPassword,
      req.user.password
    );

    if (!matchPassword)
      return next(new GlobalError("Old password is incorrect", 500));

    sqlQuery =
      "UPDATE users SET username = $1, email = $2, password = $3, img = $4 WHERE id = $5 RETURNING * ";
    values = [
      req.body.username,
      req.body.email,
      hashedPassword,
      req.body.image,
      req.params.userId,
    ];
  } else {
    sqlQuery =
      "UPDATE users SET username = $1, email = $2, img = $3 WHERE id = $4 RETURNING * ";

    values = [
      req.body.username,
      req.body.email,
      req.body.image,
      req.params.userId,
    ];
  }

  postgres.query(sqlQuery, values, (err, user) => {
    if (err) return next(new GlobalError(err, 500));

    const { password, ...otherDetails } = user.rows[0];

    return res.status(200).json({
      message: "Credentials successfully updated",
      user: otherDetails,
    });
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
