const { default: slugify } = require("slugify");
const catchAsync = require("../helpers/catchAsync");
const GlobalError = require("../helpers/error.handler");
const postgres = require("../postgres");
const moment = require("moment");
const { redisClient, retrieveRedisCache } = require("../redis/redis");

exports.addBook = catchAsync(async (req, res, next) => {
  const cacheKey = "allBooks";
  const cachedBooks = await retrieveRedisCache(cacheKey);

  const slugifiedText = slugify(req.body.title, {
    lower: true,
  });

  const sqlQuery =
    "INSERT INTO books (title, description, price, bookimg, userid, slug, userimg, category) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *";
  const values = [
    req.body.title,
    req.body.description,
    req.body.price,
    req.body.image,
    req.user.id,
    slugifiedText,
    req.user.img,
    req.body.category,
  ];

  postgres.query(sqlQuery, values, async (err, book) => {
    if (err) return next(new GlobalError(err, 500));

    const updatedRedisCache = [...cachedBooks, book.rows[0]];

    await redisClient.set(
      cacheKey,
      JSON.stringify(updatedRedisCache),
      "EX",
      10
    );

    res.status(201).json({ message: "Book added", book: book.rows[0] });
  });
});

exports.getAllBooks = catchAsync(async (req, res, next) => {
  const cacheKey = "allBooks";
  const cachedBooks = await retrieveRedisCache(cacheKey);

  // await redisClient.del(cacheKey);

  if (cachedBooks) {
    res.status(200).json({
      results: cachedBooks.length,
      books: cachedBooks,
    });
  } else {
    const sqlQuery =
      "SELECT b.*, u.username FROM books b JOIN users u ON b.userid = u.id ORDER BY date DESC";

    postgres.query(sqlQuery, async (err, books) => {
      if (err) return next(new GlobalError(err, 500));

      await redisClient.set(cacheKey, JSON.stringify(books.rows), "EX", 10);

      res.status(200).json({ results: books.rows.length, books: books.rows });
    });
  }
});

exports.getUserBooks = catchAsync(async (req, res, next) => {
  const sqlQuery = "SELECT * FROM books WHERE userid = $1 ORDER BY id DESC ";

  postgres.query(sqlQuery, [req.user.id], async (err, book) => {
    const cacheKey = `books-user-${book.rows[0].userid}`;
    const cachedBooks = await retrieveRedisCache(cacheKey);

    if (err) return next(new GlobalError(err, 500));

    if (cachedBooks) {
      res.status(200).json(cachedBooks);
    } else {
      await redisClient.set(cacheKey, JSON.stringify(book.rows), "EX", 10);
      res.status(200).json(book.rows);
    }
  });
});

exports.getSingleBook = catchAsync(async (req, res, next) => {
  const sqlQuery =
    "SELECT b.*, u.username FROM books b JOIN users u ON b.userid = u.id WHERE b.slug = $1";

  postgres.query(sqlQuery, [req.params.slug], async (err, book) => {
    if (err) return next(new GlobalError(err, 500));

    if (book.rows.length === 0)
      return res
        .status(404)
        .json(`No book with the slug of ${req.params.slug}`);

    res.status(200).json(req.query.category ? book.rows : book.rows[0]);
  });
});

exports.updateBook = catchAsync(async (req, res, next) => {
  const cacheKey = `book-update-${req.params.bookId}`;
  const cachedBook = await retrieveRedisCache(cacheKey);

  const redisCachedData = cachedBook ? JSON.parse(cachedBook) : {};

  const sqlQuery =
    "UPDATE books SET title = $1, description = $2, price = $3, bookimg = $4, userid = $5 WHERE id = $6 RETURNING *";
  const values = [
    req.body.title,
    req.body.description,
    req.body.price,
    req.body.image,
    req.user.id,
    req.params.bookId,
  ];

  postgres.query(sqlQuery, values, async (err, book) => {
    if (err) return next(new GlobalError(err, 500));

    if (req.user.id !== book.userid)
      return next(new GlobalError("You can only update books you added", 403));

    if (book.rows.length === 0)
      return res
        .status(404)
        .json(`No book with the id of ${req.params.bookId}`);

    const updatedRedisCache = { ...redisCachedData, ...book.rows[0] };

    await redisClient.set(
      `book-single-${req.params.bookId}`,
      JSON.stringify(updatedRedisCache),
      "EX",
      10
    );

    res
      .status(200)
      .json({ message: "Book updated", updatedBook: book.rows[0] });
  });
});

exports.deleteBook = catchAsync(async (req, res, next) => {
  const userBookCacheKey = `book-user-${req.params.bookId}`;
  const singleBookCacheKey = `book-single-${req.params.bookId}`;
  const allBooksCacheKey = "allBooks";

  const cachedBooks = await retrieveRedisCache(allBooksCacheKey);
  const updatedCachedBooks = cachedBooks?.filter(
    (book) => book.id !== parseInt(req.params.bookId)
  );

  await postgres.query("ALTER TABLE books DISABLE TRIGGER ALL");

  const sqlQuery = "DELETE FROM books WHERE id = $1 RETURNING *";

  postgres.query(sqlQuery, [req.params.bookId], async (err, book) => {
    console.log({ error: err });
    if (err) return next(new GlobalError(err, 500));

    if (req.user.id !== book.userid)
      return next(new GlobalError("You can only delete books you added", 403));

    if (book.rows.length === 0)
      return res
        .status(404)
        .json(`No book with the id of ${req.params.bookId}`);

    await redisClient.del(allBooksCacheKey);
    await redisClient.set(
      allBooksCacheKey,
      JSON.stringify(updatedCachedBooks),
      "EX",
      10
    );

    await postgres.query("ALTER TABLE books ENABLE TRIGGER ALL");

    await redisClient.del(userBookCacheKey);
    await redisClient.del(singleBookCacheKey);

    res.status(200).json(`Book deleted`);
  });
});
