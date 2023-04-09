const catchAsync = require("../helpers/catchAsync");
const GlobalError = require("../helpers/error.handler");
const postgres = require("../postgres");

exports.createTransaction = catchAsync(async (req, res, next) => {
  const sqlQuery =
    "INSERT INTO transactions (userId, bookId, transactionId) VALUES ($1, $2, $3)";

  const values = [req.user.id, req.body.bookId, req.body.transactionId];

  postgres.query(sqlQuery, values, (err, transaction) => {
    if (err) return next(new GlobalError(err, 500));
    res.status(201).json("Transaction saved");
  });
});

exports.getUserTransactions = catchAsync(async (req, res, next) => {
  const sqlQuery =
    "SELECT t.transactionid AS transaction_id, t.date AS transaction_date, b.title, b.slug, b.price, b.bookimg, b.category FROM transactions t JOIN books b ON t.bookid = b.id WHERE t.userid = $1";

  postgres.query(sqlQuery, [req.user.id], (err, transaction) => {
    if (err) return next(new GlobalError(err, 500));
    res.status(200).json(transaction.rows);
  });
});

exports.getAllTransactions = catchAsync(async (req, res, next) => {
  const sqlQuery =
    "SELECT t.transactionid AS transaction_id, t.date AS transaction_date, u.username, u.id AS user_id, b.title, b.slug, b.price, b.bookimg, b.category FROM transactions t JOIN users u ON t.userid = u.id JOIN books b ON t.bookid = b.id";

  postgres.query(sqlQuery, (err, transaction) => {
    if (err) return next(new GlobalError(err, 500));
    res.status(200).json(transaction.rows);
  });
});
