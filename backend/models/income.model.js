const mongoose = require("mongoose");

const incomeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Income title is required"],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0, "Amount cannot be negative"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: [
        "Salary",
        "Freelance",
        "Investments",
        "Business",
        "Gifts",
        "Refunds",
        "Rental",
        "Other",
      ],
      default: "Other",
    },
    description: {
      type: String,
      trim: true,
    },
    date: {
      type: Date,
      default: Date.now,
      required: true,
    },
    source: {
      type: String,
      trim: true,
    },
    paymentMethod: {
      type: String,
      enum: [
        "Bank Transfer",
        "Cash",
        "Credit Card",
        "Debit Card", 
        "PayPal",
        "Mobile Payment",
        "Check",
        "Other"
      ],
      default: "Bank Transfer",
    },
  },
  { timestamps: true }
);

// Create index for faster queries
incomeSchema.index({ user: 1, date: -1 });

const Income = mongoose.model("Income", incomeSchema);

module.exports = Income;
