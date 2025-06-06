const Expense = require("../models/expenses.model");
const mongoose = require("mongoose");

// @desc    Get all expenses for a user
// @route   GET /api/expenses
// @access  Private
exports.getExpenses = async (req, res) => {
  try {
    // Default pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = { user: req.user._id };

    // Add date filters if provided
    if (req.query.startDate && req.query.endDate) {
      filter.date = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate),
      };
    }

    // Add category filter if provided
    if (req.query.category) {
      filter.category = req.query.category;
    }

    // Add search filter if provided
    if (req.query.search) {
      filter.$or = [
        { title: { $regex: req.query.search, $options: "i" } },
        { description: { $regex: req.query.search, $options: "i" } },
      ];
    }

    // Execute query with pagination
    const expenses = await Expense.find(filter)
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Expense.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: expenses.length,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
      data: expenses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get expense by ID
// @route   GET /api/expenses/:id
// @access  Private
exports.getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    res.status(200).json({
      success: true,
      data: expense,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create new expense
// @route   POST /api/expenses
// @access  Private
exports.createExpense = async (req, res) => {
  try {
    // Add user to request body
    req.body.user = req.user._id;

    const expense = await Expense.create(req.body);

    res.status(201).json({
      success: true,
      data: expense,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update expense
// @route   PUT /api/expenses/:id
// @access  Private
exports.updateExpense = async (req, res) => {
  try {
    let expense = await Expense.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    // Update expense
    expense = await Expense.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: expense,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
// @access  Private
exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    await expense.deleteOne();

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

// @desc    Get expense statistics
// @route   GET /api/expenses/stats
// @access  Private
exports.getExpenseStats = async (req, res) => {
  try {
    // Default to current month if not specified
    const startDate = req.query.startDate
      ? new Date(req.query.startDate)
      : new Date(new Date().setDate(1)); // First day of current month

    const endDate = req.query.endDate
      ? new Date(req.query.endDate)
      : new Date(new Date().setMonth(new Date().getMonth() + 1, 0)); // Last day of current month

    // Total expenses
    const totalExpenses = await Expense.aggregate([
      {
        $match: {
          user: req.user._id,
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    // Expenses by category
    const expensesByCategory = await Expense.aggregate([
      {
        $match: {
          user: req.user._id,
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: "$category",
          amount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { amount: -1 },
      },
    ]);

    // Daily expenses (for chart)
    const dailyExpenses = await Expense.aggregate([
      {
        $match: {
          user: req.user._id,
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          amount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalAmount: totalExpenses.length > 0 ? totalExpenses[0].total : 0,
        totalCount: totalExpenses.length > 0 ? totalExpenses[0].count : 0,
        byCategory: expensesByCategory,
        byDate: dailyExpenses,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all expense categories
// @route   GET /api/expenses/categories
// @access  Public
exports.getCategories = async (req, res) => {
  try {
    // Get categories from the expense schema
    const categories = Expense.schema.path('category').enumValues;
    
    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get category by ID
// @route   GET /api/expenses/categories/:id
// @access  Public
exports.getCategoryById = async (req, res) => {
  try {
    const categories = Expense.schema.path('category').enumValues;
    const categoryId = parseInt(req.params.id);
    
    if (isNaN(categoryId) || categoryId < 0 || categoryId >= categories.length) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }
    
    res.status(200).json({
      success: true,
      data: categories[categoryId],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get expense summary
// @route   GET /api/expenses/summary
// @access  Private
exports.getExpenseSummary = async (req, res) => {
  try {
    // Default to current month if not specified
    const startDate = req.query.startDate
      ? new Date(req.query.startDate)
      : new Date(new Date().setDate(1)); // First day of current month

    const endDate = req.query.endDate
      ? new Date(req.query.endDate)
      : new Date(new Date().setMonth(new Date().getMonth() + 1, 0)); // Last day of current month

    // Convert user id to ObjectId for aggregation
    const userId = mongoose.Types.ObjectId(req.user._id);

    // Total expenses
    const totalExpenses = await Expense.aggregate([
      {
        $match: {
          user: userId,
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    // Expenses by category
    const expensesByCategory = await Expense.aggregate([
      {
        $match: {
          user: userId,
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: "$category",
          amount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { amount: -1 },
      },
    ]);

    // Expenses by payment method
    const expensesByPaymentMethod = await Expense.aggregate([
      {
        $match: {
          user: userId,
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: "$paymentMethod",
          amount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { amount: -1 },
      },
    ]);

    // Monthly trends (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    
    const monthlyTrends = await Expense.aggregate([
      {
        $match: {
          user: userId,
          date: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: { 
            year: { $year: "$date" },
            month: { $month: "$date" }
          },
          amount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalAmount: totalExpenses.length > 0 ? totalExpenses[0].total : 0,
        totalCount: totalExpenses.length > 0 ? totalExpenses[0].count : 0,
        byCategory: expensesByCategory,
        byPaymentMethod: expensesByPaymentMethod,
        monthlyTrends: monthlyTrends,
        dateRange: {
          startDate,
          endDate,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Filter expenses
// @route   GET /api/expenses/filter
// @access  Private
exports.filterExpenses = async (req, res) => {
  try {
    // Default pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = { user: req.user._id };

    // Add date filters if provided
    if (req.query.startDate && req.query.endDate) {
      filter.date = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate),
      };
    }

    // Add category filter if provided
    if (req.query.category) {
      filter.category = req.query.category;
    }
    
    // Add payment method filter if provided
    if (req.query.paymentMethod) {
      filter.paymentMethod = req.query.paymentMethod;
    }
    
    // Add amount range filter if provided
    if (req.query.minAmount || req.query.maxAmount) {
      filter.amount = {};
      if (req.query.minAmount) {
        filter.amount.$gte = parseFloat(req.query.minAmount);
      }
      if (req.query.maxAmount) {
        filter.amount.$lte = parseFloat(req.query.maxAmount);
      }
    }

    // Add search filter if provided
    if (req.query.search) {
      filter.$or = [
        { title: { $regex: req.query.search, $options: "i" } },
        { description: { $regex: req.query.search, $options: "i" } },
      ];
    }

    // Execute query with pagination
    const expenses = await Expense.find(filter)
      .sort({ date: req.query.sortOrder === 'asc' ? 1 : -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Expense.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: expenses.length,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
      data: expenses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
