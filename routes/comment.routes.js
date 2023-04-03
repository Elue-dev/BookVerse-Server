const express = require("express");
const {
  getComments,
  createComment,
  updateComment,
  deleteComment,
} = require("../controllers/comment.controller");
const { requireAuth } = require("../middlewares/requireAuth");

const router = express.Router();

router.route("/").get(getComments).post(requireAuth, createComment);

router
  .route("/:commentId")
  .patch(requireAuth, updateComment)
  .delete(requireAuth, deleteComment);

module.exports = router;
