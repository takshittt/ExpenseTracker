const express = require('express');
const router = express.Router();
const {
  getBudgets,
  getBudgetById,
  createBudget,
  updateBudget,
  deleteBudget,
  getBudgetPerformance,
  getBudgetSummary
} = require('../controllers/budgetController');
const { protect } = require('../middlewares/authMiddleware');

// Apply protection middleware to all routes
router.use(protect);

// Summary route
router.get('/summary', getBudgetSummary);

// Main routes
router.route('/')
  .get(getBudgets)
  .post(createBudget);

// Performance route
router.get('/:id/performance', getBudgetPerformance);

// Routes with ID parameter
router.route('/:id')
  .get(getBudgetById)
  .put(updateBudget)
  .delete(deleteBudget);

module.exports = router;
