const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Expense title is required'],
    trim: true
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Food', 'Transportation', 'Entertainment', 'Shopping', 'Utilities', 'Housing', 'Healthcare', 'Personal', 'Education', 'Travel', 'Debt', 'Investments', 'Other'],
    default: 'Other'
  },
  description: {
    type: String,
    trim: true
  },
  date: {
    type: Date,
    default: Date.now,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Credit Card', 'Debit Card', 'Bank Transfer', 'Mobile Payment', 'Other'],
    default: 'Cash'
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringFrequency: {
    type: String,
    enum: ['None', 'Daily', 'Weekly', 'Monthly', 'Yearly'],
    default: 'None'
  },
  tags: [{
    type: String,
    trim: true
  }],
  receipt: {
    type: String,  // URL to receipt image
    default: ''
  },
  location: {
    type: String,
    trim: true
  }
}, { timestamps: true });

// Create index for faster queries
expenseSchema.index({ user: 1, date: -1 });
expenseSchema.index({ category: 1 });

const Expense = mongoose.model('Expense', expenseSchema);

module.exports = Expense;
