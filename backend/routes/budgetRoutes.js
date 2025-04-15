const express = require("express");
const router = express.Router();
const budgetController = require("../controllers/budgetController");
const authMiddleware = require("../middlewares/authMiddleware");

// Apply auth middleware to all budget routes
router.use(authMiddleware.authUser);

// GET /budgets/summary - Get summary of all active budgets
router.get("/summary", budgetController.getBudgetsSummary);

// GET /budgets - Retrieve a list of all budgets
router.get("/", budgetController.getBudgets);

// GET /budgets/:id - Retrieve a specific budget by ID
router.get("/:id", budgetController.getBudgetById);

// GET /budgets/:id/status - Get budget status with expenses
router.get("/:id/status", budgetController.getBudgetStatus);

// POST /budgets - Add a new budget
router.post("/", budgetController.createBudget);

// PUT /budgets/:id - Update a budget
router.put("/:id", budgetController.updateBudget);

// DELETE /budgets/:id - Delete a budget
router.delete("/:id", budgetController.deleteBudget);

module.exports = router;
