const express = require("express");
const router = express.Router();
const expensesController = require("../controllers/expensesController");
const authMiddleware = require("../middlewares/authMiddleware");

// Apply auth middleware to all expense routes
router.use(authMiddleware.authUser);

// GET /expenses - Retrieve a list of all expenses
router.get("/", expensesController.getExpenses);

// GET /expenses/categories - Retrieve all expense categories
router.get("/categories", expensesController.getCategories);

// GET /expenses/categories/:id - Retrieve a specific expense category
router.get("/categories/:id", expensesController.getCategoryById);

// GET /expenses/summary - Get a summary of expenses
router.get("/summary", expensesController.getExpenseSummary);

// GET /expenses/filter - Filter expenses by criteria
router.get("/filter", expensesController.filterExpenses);

// GET /expenses/:id - Retrieve a specific expense by ID
router.get("/:id", expensesController.getExpenseById);

// POST /expenses - Add a new expense
router.post("/", expensesController.createExpense);

// PUT /expenses/:id - Update an existing expense
router.put("/:id", expensesController.updateExpense);

// DELETE /expenses/:id - Delete an expense
router.delete("/:id", expensesController.deleteExpense);

module.exports = router;
