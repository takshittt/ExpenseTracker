const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Budget name is required'],
    trim: true
  },
  amount: {
    type: Number,
    required: [true, 'Budget amount is required'],
    min: [0, 'Budget amount cannot be negative']
  },
  category: {
    type: String,
    enum: ['Overall', 'Food', 'Transportation', 'Entertainment', 'Shopping', 'Utilities', 'Housing', 'Healthcare', 'Personal', 'Education', 'Travel', 'Debt', 'Investments', 'Other'],
    default: 'Overall'
  },
  period: {
    type: String,
    enum: ['Daily', 'Weekly', 'Monthly', 'Yearly'],
    default: 'Monthly'
  },
  startDate: {
    type: Date,
    default: Date.now,
    required: true
  },
  endDate: {
    type: Date
  },
  description: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  notifyOnExceed: {
    type: Boolean,
    default: true
  },
  notificationThreshold: {
    type: Number,
    min: 0,
    max: 100,
    default: 80  // Percentage of budget used when notification should be sent
  },
  color: {
    type: String,
    default: '#3498db'  // Default color for UI representation
  }
}, { timestamps: true });

// Create index for faster queries
budgetSchema.index({ user: 1, category: 1 });
budgetSchema.index({ user: 1, period: 1 });

const Budget = mongoose.model('Budget', budgetSchema);

module.exports = Budget;
