const GlobalError = require("../helpers/error.handler");
const postgres = require("../postgres");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const catchAsync = require("../helpers/catchAsync");

exports.signup = async (req, res, next) => {
  const sqlQuery = "SELECT * FROM users WHERE email = $1";

  postgres.query(sqlQuery, [req.body.email], (err, user) => {
    if (err) return next(new GlobalError(err, 500));
    if (user.rows.length > 0)
      return next(new GlobalError("Email already exists", 400));

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(req.body.password, salt);

    const addUserQuery =
      "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *";
    const values = [req.body.username, req.body.email, hashedPassword];

    postgres.query(addUserQuery, values, (err, user) => {
      if (err) return next(new GlobalError(err, 500));
      res.status(201).json("User has been created");
    });
  });
};

exports.login = async (req, res, next) => {
  const sqlQuery = "SELECT * FROM users WHERE email = $1 OR username = $2";

  postgres.query(
    sqlQuery,
    [req.body.emailOrUsername, req.body.emailOrUsername],
    (err, user) => {
      if (err) return next(new GlobalError(err, 500));
      if (user.rows.length === 0) {
        return next(new GlobalError("Invalid credentials provided", 400));
      }

      const isPasswordCorrect = bcrypt.compareSync(
        req.body.password,
        user.rows[0].password
      );

      if (!isPasswordCorrect)
        return next(new GlobalError("Invalid credentials provided", 400));

      const accessToken = jwt.sign(
        { id: user.rows[0].id },
        process.env.JWT_SECRET,
        {
          expiresIn: process.env.JWT_EXPIRES,
        }
      );

      const { password, ...otherInfo } = user.rows[0];

      res
        .cookie("accessToken", accessToken, {
          httpOnly: true,
          expires: new Date(
            Date.now() + process.env.COOKIE_EXPIRES * 1 + 24 * 60 * 60 * 1000
          ),
        })
        .status(200)
        .json(otherInfo);
    }
  );
};

exports.logout = catchAsync(async (req, res) => {
  res
    .clearCookie("accessToken", {
      secure: true,
      sameSite: "none",
    })
    .status(200)
    .json("Logout successful");
});
