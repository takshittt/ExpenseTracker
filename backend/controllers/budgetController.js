const Budget = require("../models/budget.model");
const Expense = require("../models/expenses.model");
const mongoose = require("mongoose");

// @desc    Get all budgets for a user
// @route   GET /api/budgets
// @access  Private
exports.getBudgets = async (req, res) => {
  try {
    // Default pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = { user: req.user._id };

    // Add category filter if provided
    if (req.query.category) {
      filter.category = req.query.category;
    }

    // Add period filter if provided
    if (req.query.period) {
      filter.period = req.query.period;
    }
    
    // Add active filter if provided
    if (req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive === 'true';
    }

    // Execute query with pagination
    const budgets = await Budget.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Budget.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: budgets.length,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
      data: budgets,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
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
      user: req.user._id,
    });

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: "Budget not found",
      });
    }

    res.status(200).json({
      success: true,
      data: budget,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
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

    // Check if startDate is provided
    if (!req.body.startDate) {
      req.body.startDate = new Date();
    }

    const budget = await Budget.create(req.body);

    res.status(201).json({
      success: true,
      data: budget,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
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
      user: req.user._id,
    });

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: "Budget not found",
      });
    }

    // Update budget
    budget = await Budget.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: budget,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
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
      user: req.user._id,
    });

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: "Budget not found",
      });
    }

    await budget.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get budget status with expenses
// @route   GET /api/budgets/:id/status
// @access  Private
exports.getBudgetStatus = async (req, res) => {
  try {
    const budget = await Budget.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: "Budget not found",
      });
    }

    // Calculate date range based on budget period
    let startDate = new Date(budget.startDate);
    let endDate = budget.endDate ? new Date(budget.endDate) : new Date();

    if (!budget.endDate) {
      // If no end date is specified, calculate based on period
      const now = new Date();
      
      switch (budget.period) {
        case 'Daily':
          // Just use today
          startDate = new Date(now.setHours(0, 0, 0, 0));
          endDate = new Date(now.setHours(23, 59, 59, 999));
          break;
        case 'Weekly':
          // Get beginning of week (Sunday)
          const day = now.getDay();
          startDate = new Date(now);
          startDate.setDate(now.getDate() - day);
          startDate.setHours(0, 0, 0, 0);
          
          endDate = new Date(startDate);
          endDate.setDate(startDate.getDate() + 6);
          endDate.setHours(23, 59, 59, 999);
          break;
        case 'Monthly':
          // Get beginning of month
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
          break;
        case 'Yearly':
          // Get beginning of year
          startDate = new Date(now.getFullYear(), 0, 1);
          endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
          break;
      }
    }

    // Get expenses in the category during the time period
    const filter = {
      user: req.user._id,
      date: { $gte: startDate, $lte: endDate }
    };

    // If not an overall budget, filter by category
    if (budget.category !== 'Overall') {
      filter.category = budget.category;
    }

    const expenses = await Expense.find(filter);
    
    // Calculate total spent
    const totalSpent = expenses.reduce((acc, expense) => acc + expense.amount, 0);
    
    // Calculate remaining budget
    const remaining = budget.amount - totalSpent;
    
    // Calculate percentage used
    const percentUsed = (totalSpent / budget.amount) * 100;
    
    // Check if budget exceeded
    const isExceeded = totalSpent > budget.amount;

    res.status(200).json({
      success: true,
      data: {
        budget,
        stats: {
          totalSpent,
          remaining,
          percentUsed,
          isExceeded,
          expenseCount: expenses.length
        },
        expenses: expenses.slice(0, 5) // Include latest 5 expenses
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all active budgets summary for dashboard
// @route   GET /api/budgets/summary
// @access  Private
exports.getBudgetsSummary = async (req, res) => {
  try {
    // Get all active budgets
    const budgets = await Budget.find({
      user: req.user._id,
      isActive: true
    });

    const budgetSummaries = await Promise.all(budgets.map(async (budget) => {
      // Calculate date range based on budget period
      let startDate = new Date(budget.startDate);
      let endDate = budget.endDate ? new Date(budget.endDate) : new Date();

      if (!budget.endDate) {
        // If no end date is specified, calculate based on period
        const now = new Date();
        
        switch (budget.period) {
          case 'Daily':
            // Just use today
            startDate = new Date(now.setHours(0, 0, 0, 0));
            endDate = new Date(now.setHours(23, 59, 59, 999));
            break;
          case 'Weekly':
            // Get beginning of week (Sunday)
            const day = now.getDay();
            startDate = new Date(now);
            startDate.setDate(now.getDate() - day);
            startDate.setHours(0, 0, 0, 0);
            
            endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 6);
            endDate.setHours(23, 59, 59, 999);
            break;
          case 'Monthly':
            // Get beginning of month
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
            break;
          case 'Yearly':
            // Get beginning of year
            startDate = new Date(now.getFullYear(), 0, 1);
            endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
            break;
        }
      }

      // Get expenses in the category during the time period
      const filter = {
        user: req.user._id,
        date: { $gte: startDate, $lte: endDate }
      };

      // If not an overall budget, filter by category
      if (budget.category !== 'Overall') {
        filter.category = budget.category;
      }

      const totalSpent = await Expense.aggregate([
        { $match: filter },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]);

      const spent = totalSpent.length > 0 ? totalSpent[0].total : 0;
      const remaining = budget.amount - spent;
      const percentUsed = (spent / budget.amount) * 100;

      return {
        _id: budget._id,
        name: budget.name,
        category: budget.category,
        period: budget.period,
        amount: budget.amount,
        spent,
        remaining,
        percentUsed,
        isExceeded: spent > budget.amount,
        color: budget.color
      };
    }));

    res.status(200).json({
      success: true,
      count: budgetSummaries.length,
      data: budgetSummaries,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
