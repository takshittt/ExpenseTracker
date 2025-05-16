const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const app = express();
const cors = require("cors");
const connectDB = require("./config/db");
const cookieParser = require("cookie-parser");
const passport = require("passport");
require("./config/passport");

const PORT = process.env.PORT || 5001;

// Updated CORS configuration to handle multiple origins
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl requests)
    if(!origin) return callback(null, true);
    
    const allowedOrigins = [
      process.env.CLIENT_URL || "http://localhost:5173",
      "https://expense-tracker-vk78.vercel.app"
    ];
    
    console.log(`Received request from origin: ${origin}`);
    
    if(allowedOrigins.indexOf(origin) !== -1 || !origin || origin.includes("expense-tracker-vk78")) {
      callback(null, true);
    } else {
      console.log(`CORS blocked for origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Initialize Passport
app.use(passport.initialize());

connectDB();

const expenseRoutes = require("./routes/expensesRoutes");
const budgetRoutes = require("./routes/budgetRoutes");
const authRoutes = require("./routes/authRoutes");
const incomeRoutes = require("./routes/incomeRoutes");

app.get("/", (req, res) => {
  res.send("Expense Tracker API is running");
});

app.use("/auth", authRoutes);
app.use("/expenses", expenseRoutes);
app.use("/income", incomeRoutes);
app.use("/budgets", budgetRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
