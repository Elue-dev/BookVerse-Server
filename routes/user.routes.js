const express = require("express");
const {
  getAllUsers,
  getSingleUser,
  updateUser,
  deleteUser,
} = require("../controllers/user.controller");
const { requireAuth } = require("../middlewares/requireAuth");

const router = express.Router();

router.use(requireAuth);

router.route("/").get(getAllUsers);

router
  .route("/:userId")
  .get(getSingleUser)
  .patch(updateUser)
  .delete(deleteUser);

module.exports = router;
