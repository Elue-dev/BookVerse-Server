const express = require("express");
const {
  getUserTransactions,
  createTransaction,
  getAllTransactions,
} = require("../controllers/transaction.controller");
const { requireAuth } = require("../middlewares/requireAuth");

const router = express.Router();

router.use(requireAuth);

router.route("/").get(getUserTransactions).post(createTransaction);
router.route("/all").get(getAllTransactions);

module.exports = router;
