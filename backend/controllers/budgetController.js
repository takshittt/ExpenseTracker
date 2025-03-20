const Budget = require('../models/budget.model');
const Expense = require('../models/expenses.model');
const mongoose = require('mongoose');

// @desc    Get all budgets for a user
// @route   GET /api/budgets
// @access  Private
exports.getBudgets = async (req, res) => {
  try {
    const budgets = await Budget.find({ user: req.user._id }).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: budgets.length,
      data: budgets
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get budget by ID
// @route   GET /api/budgets/:id
// @access  Private
exports.getBudgetById = async (req, res) => {
  try {
    const budget = await Budget.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: budget
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create new budget
// @route   POST /api/budgets
// @access  Private
exports.createBudget = async (req, res) => {
  try {
    // Add user to request body
    req.body.user = req.user._id;
    
    // Check if budget for this category and period already exists
    const existingBudget = await Budget.findOne({
      user: req.user._id,
      category: req.body.category,
      period: req.body.period,
      isActive: true,
      $or: [
        // Check if start date falls within an existing budget period
        {
          startDate: { $lte: new Date(req.body.startDate) },
          endDate: { $gte: new Date(req.body.startDate) }
        },
        // Check if end date falls within an existing budget period
        {
          startDate: { $lte: new Date(req.body.endDate || req.body.startDate) },
          endDate: { $gte: new Date(req.body.endDate || req.body.startDate) }
        }
      ]
    });
    
    if (existingBudget) {
      return res.status(400).json({
        success: false,
        message: `An active budget for ${req.body.category} already exists during this period`
      });
    }
    
    const budget = await Budget.create(req.body);
    
    res.status(201).json({
      success: true,
      data: budget
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update budget
// @route   PUT /api/budgets/:id
// @access  Private
exports.updateBudget = async (req, res) => {
  try {
    let budget = await Budget.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }
    
    // Update budget
    budget = await Budget.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    
    res.status(200).json({
      success: true,
      data: budget
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete budget
// @route   DELETE /api/budgets/:id
// @access  Private
exports.deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }
    
    await budget.remove();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get budget performance details
// @route   GET /api/budgets/:id/performance
// @access  Private
exports.getBudgetPerformance = async (req, res) => {
  try {
    const budget = await Budget.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }
    
    // Get expenses for this budget period and category
    const query = {
      user: mongoose.Types.ObjectId(req.user._id),
      date: {
        $gte: budget.startDate,
        $lte: budget.endDate || new Date()
      }
    };
    
    // If not overall budget, filter by category
    if (budget.category !== 'Overall') {
      query.category = budget.category;
    }
    
    // Calculate total expenses for this budget
    const expenses = await Expense.aggregate([
      { $match: query },
      { $group: {
          _id: null,
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Calculate daily/weekly expenses for trend analysis
    const expensesByDate = await Expense.aggregate([
      { $match: query },
      { $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          amount: { $sum: '$amount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    const totalSpent = expenses.length > 0 ? expenses[0].total : 0;
    const remaining = budget.amount - totalSpent;
    const percentUsed = (totalSpent / budget.amount) * 100;
    
    res.status(200).json({
      success: true,
      data: {
        budget: {
          _id: budget._id,
          name: budget.name,
          amount: budget.amount,
          category: budget.category,
          period: budget.period,
          startDate: budget.startDate,
          endDate: budget.endDate
        },
        performance: {
          spent: totalSpent,
          remaining: remaining,
          percentUsed: percentUsed,
          status: percentUsed > 100 ? 'exceeded' : percentUsed >= 80 ? 'warning' : 'good',
          transactionCount: expenses.length > 0 ? expenses[0].count : 0
        },
        trend: expensesByDate
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get overall budget summary for all active budgets
// @route   GET /api/budgets/summary
// @access  Private
exports.getBudgetSummary = async (req, res) => {
  try {
    // Get all active budgets
    const activeBudgets = await Budget.find({
      user: req.user._id,
      isActive: true
    });
    
    // Map through budgets and get performance data
    const budgetPromises = activeBudgets.map(async (budget) => {
      // Get expenses for this budget
      const query = {
        user: mongoose.Types.ObjectId(req.user._id),
        date: {
          $gte: budget.startDate,
          $lte: budget.endDate || new Date()
        }
      };
      
      // If not overall budget, filter by category
      if (budget.category !== 'Overall') {
        query.category = budget.category;
      }
      
      // Calculate total expenses for this budget
      const expenses = await Expense.aggregate([
        { $match: query },
        { $group: {
            _id: null,
            total: { $sum: '$amount' }
          }
        }
      ]);
      
      const totalSpent = expenses.length > 0 ? expenses[0].total : 0;
      const remaining = budget.amount - totalSpent;
      const percentUsed = (totalSpent / budget.amount) * 100;
      
      return {
        _id: budget._id,
        name: budget.name,
        category: budget.category,
        period: budget.period,
        amount: budget.amount,
        spent: totalSpent,
        remaining: remaining,
        percentUsed: percentUsed,
        status: percentUsed > 100 ? 'exceeded' : percentUsed >= 80 ? 'warning' : 'good'
      };
    });
    
    const budgetSummaries = await Promise.all(budgetPromises);
    
    res.status(200).json({
      success: true,
      count: budgetSummaries.length,
      data: budgetSummaries
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
