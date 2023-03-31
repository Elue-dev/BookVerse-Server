const express = require("express");
const {
  getAllBooks,
  addBook,
  getUserBooks,
  getSingleBook,
  updateBook,
  deleteBook,
} = require("../controllers/book.controller");
const { requireAuth } = require("../middlewares/requireAuth");

const router = express.Router();

router.use(requireAuth);

router.route("/").get(getAllBooks).post(addBook);
router.get("/my-books", getUserBooks);

router
  .route("/:bookId")
  .get(getSingleBook)
  .patch(updateBook)
  .delete(deleteBook);

module.exports = router;
