const catchAsync = require("../helpers/catchAsync");
const GlobalError = require("../helpers/error.handler");
const postgres = require("../postgres");
const bcrypt = require("bcryptjs");
const {
  createTransaction,
  verifyTransaction,
} = require("../services/paystack");
// const paystack = require("paystack")(
//   "sk_test_bd74ab22c4a08442cf81f08ca4f89bf147cef74d"
// );
const Flutterwave = require("flutterwave-node");

const PUBLIC_KEY = "FLWPUBK_TEST-d2fed517c8f5ab296b9fa79a5524a45f-X";
const SECRET_KEY = "FLWSECK_TEST-9b5e128f2f2a4a4e7bc78e2391afa090-X";

const flutterwave = new Flutterwave(PUBLIC_KEY, SECRET_KEY);

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

    const matchPassword = bcrypt.compareSync(
      req.body.oldPassword,
      req.user.password
    );

    if (!matchPassword)
      return next(new GlobalError("Old password is incorrect", 500));

    if (req.body.password === req.body.oldPassword)
      return next(
        new GlobalError(
          "Please choose a different password from your old password"
        )
      );

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

exports.pay = catchAsync(async (req, res) => {
  // let referenceNo;
  // createTransaction(1000, "test@gmail.com")
  //   .then((reference) => {
  //     referenceNo = reference;
  //   })
  //   .then(() => {
  //     verifyTransaction(referenceNo)
  //       .then((transaction) => {
  //         res.status(201).json(transaction);
  //         // Update the user's account with the transaction details
  //       })
  //       .catch((error) => {
  //         console.error("Error verifying transaction:", error);
  //       });
  //   })
  //   .catch((error) => {
  //     console.error("Error creating transaction:", error);
  //     res.status(500).send("Error creating transaction");
  //   });

  // Verify a transaction
  // verifyTransaction(reference)
  //   .then((transaction) => {
  //     console.log("Transaction details:", transaction);
  //     // Update the user's account with the transaction details
  //   })
  //   .catch((error) => {
  //     console.error("Error verifying transaction:", error);
  //   });

  const transaction = await flutterwave.Transfer.initiate({
    account_bank: "044",
    account_number: "0690000040",
    amount: 5500,
    narration: "Akhlm Pstmn Trnsfr xx007",
    currency: "NGN",
    reference: "akhlm-pstmnpyt-rfxx007_PMCKDU_1",
    callback_url: "https://www.flutterwave.com/ng/",
    debit_currency: "NGN",
  });

  res.status(201).json(transaction);
});
