const catchAsync = require("../helpers/catchAsync");
const GlobalError = require("../helpers/error.handler");
const postgres = require("../postgres");
const { redisClient } = require("../redis/redis");

exports.addBook = catchAsync(async (req, res, next) => {
  const sqlQuery =
    "INSERT INTO books (title, description, price, userid) VALUES ($1, $2, $3, $4) RETURNING *";
  const values = [
    req.body.title,
    req.body.description,
    req.body.price,
    req.user.id,
  ];

  postgres.query(sqlQuery, values, (err, book) => {
    if (err) return next(new GlobalError(err, 500));
    res.status(201).json(book.rows[0]);
  });
});

exports.getAllBooks = catchAsync(async (req, res, next) => {
  const cacheKey = "allBooks";
  const cachedData = await redisClient.get(cacheKey);
  const parsedCachedRedisData = JSON.parse(cachedData);

  if (cachedData) {
    res.status(200).json({
      source: "From Redis",
      results: parsedCachedRedisData.length,
      books: parsedCachedRedisData,
    });
  } else {
    const sqlQuery =
      "SELECT b.*, u.username FROM books b JOIN users u ON b.userid = u.id ORDER BY id DESC ";

    postgres.query(sqlQuery, async (err, books) => {
      if (err) return next(new GlobalError(err, 500));

      await redisClient.set(cacheKey, JSON.stringify(books.rows), "EX", 10);

      res.status(200).json({
        source: "From Postgress",
        results: books.rows.length,
        books: books.rows,
      });
    });
  }
});

exports.getUserBooks = catchAsync(async (req, res, next) => {
  const sqlQuery = "SELECT * FROM books WHERE userid = $1 ORDER BY id DESC ";

  postgres.query(sqlQuery, [req.user.id], async (err, book) => {
    const cacheKey = `books-user-${book.rows[0].userid}`;
    const CACHE_EXPIRATION_TIME = 10;

    const cachedData = await redisClient.get(cacheKey);
    const parsedCachedRedisData = JSON.parse(cachedData);

    if (err) return next(new GlobalError(err, 500));

    if (cachedData) {
      res.status(200).json({
        source: "from redis",
        books: parsedCachedRedisData,
      });
    } else {
      await redisClient.set(
        cacheKey,
        JSON.stringify(book.rows),
        CACHE_EXPIRATION_TIME
      );

      res.status(200).json(book.rows);
    }
  });
});

exports.getSingleBook = catchAsync(async (req, res, next) => {
  const sqlQuery =
    "SELECT b.*, u.username FROM books b JOIN users u ON b.userid = u.id WHERE b.id = $1";

  postgres.query(sqlQuery, [req.params.bookId], (err, book) => {
    if (err) return next(new GlobalError(err, 500));
    if (book.rows.length === 0)
      return res
        .status(404)
        .json(`No book with the id of ${req.params.bookId}`);

    res.status(200).json(book.rows[0]);
  });
});

exports.updateBook = catchAsync(async (req, res, next) => {
  const sqlQuery =
    "UPDATE books SET title = $1, description = $2, price = $3, userid = $4 WHERE id = $5 RETURNING *";
  const values = [
    req.body.title,
    req.body.description,
    req.body.price,
    req.user.id,
    req.params.bookId,
  ];

  postgres.query(sqlQuery, values, (err, book) => {
    if (err) return next(new GlobalError(err, 500));
    if (book.rows.length === 0)
      return res
        .status(404)
        .json(`No book with the id of ${req.params.bookId}`);
    res.status(200).json(book.rows[0]);
  });
});

exports.deleteBook = catchAsync(async (req, res, next) => {
  const sqlQuery = "DELETE FROM books WHERE id = $1";

  postgres.query(sqlQuery, [req.params.bookId], (err, book) => {
    if (err) return next(new GlobalError(err, 500));
    if (book.rows.length === 0)
      return res
        .status(404)
        .json(`No book with the id of ${req.params.bookId}`);

    res.status(200).json(`Book has been deleted`);
  });
});
