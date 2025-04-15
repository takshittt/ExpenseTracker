const express = require("express");
const router = express.Router();
const incomeController = require("../controllers/incomeController");
const { authUser } = require("../middlewares/authMiddleware");

// Apply authentication middleware to all income routes
router.use(authUser);

// Get all incomes & Create new income
router.route("/")
  .get(incomeController.getIncomes)
  .post(incomeController.createIncome);

// Get, update, and delete income by ID
router.route("/:id")
  .get(incomeController.getIncomeById)
  .put(incomeController.updateIncome)
  .delete(incomeController.deleteIncome);

module.exports = router;
