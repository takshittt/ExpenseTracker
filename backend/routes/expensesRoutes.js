const express = require('express');
const router = express.Router();
const {
  getExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
  getExpenseStats
} = require('../controllers/expensesController');
const { protect } = require('../middlewares/authMiddleware');

// Apply protection middleware to all routes
router.use(protect);

// Stats route
router.get('/stats', getExpenseStats);

// Main routes
router.route('/')
  .get(getExpenses)
  .post(createExpense);

// Routes with ID parameter
router.route('/:id')
  .get(getExpenseById)
  .put(updateExpense)
  .delete(deleteExpense);

module.exports = router;
