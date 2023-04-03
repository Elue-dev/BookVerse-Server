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

router.route("/").get(getAllBooks).post(requireAuth, addBook);
router.get("/user-books", requireAuth, getUserBooks);
router.get("/:slug", getSingleBook);

router
  .route("/:bookId")
  .patch(requireAuth, updateBook)
  .delete(requireAuth, deleteBook);

module.exports = router;
