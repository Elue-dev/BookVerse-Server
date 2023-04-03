const catchAsync = require("../helpers/catchAsync");
const GlobalError = require("../helpers/error.handler");
const postgres = require("../postgres");

exports.createComment = catchAsync(async (req, res, next) => {
  const sqlQuery =
    "INSERT INTO comments (comment, userid, bookid) VALUES ($1, $2, $3) RETURNING *";

  const values = [req.body.comment, req.user.id, req.body.bookid];

  postgres.query(sqlQuery, values, async (err, comment) => {
    if (err) return next(new GlobalError(err, 500));

    res.status(201).json({ message: "Comment added", comment: comment.rows });
  });
});

exports.getComments = catchAsync(async (req, res, next) => {
  const sqlQuery =
    "SELECT c.*, u.username, u.img AS userImg FROM comments c JOIN users u ON c.userid = u.id WHERE c.bookid = $1 ORDER BY id DESC";

  postgres.query(sqlQuery, [req.query.bookid], async (err, comments) => {
    if (err) return next(new GlobalError(err, 500));

    res.status(200).json(comments.rows);
  });
});

exports.updateComment = catchAsync(async (req, res, next) => {});

exports.deleteComment = catchAsync(async (req, res, next) => {
  const sqlQuery = "DELETE FROM comments WHERE id = $1 RETURNING *";

  postgres.query(sqlQuery, [req.params.commentId], async (err, comment) => {
    if (err) return next(new GlobalError(err, 500));
    if (comment.rows.length === 0)
      return res
        .status(404)
        .json(`No comment with the id of ${req.params.commentId}`);
  });

  res.status(200).json(`Comment deleted`);
});
