# Expense Tracker

A full-stack expense tracking application with comprehensive budget management features to help users monitor and manage their financial health.

## Overview

This application provides a complete solution for personal finance management, allowing users to:
- Track daily expenses across multiple categories
- Set and monitor budgets
- Record and manage income
- Visualize spending patterns with detailed reports
- Analyze financial health with interactive dashboards

## Tech Stack

### Backend
- **Node.js** & **Express**: Server framework
- **MongoDB** with **Mongoose**: Database and ORM
- **JWT**: Authentication
- **Express Validator**: Input validation
- **Bcrypt**: Password hashing

### Frontend
- **React**: UI library
- **React Router**: Navigation
- **Context API**: State management
- **Chart.js**: Data visualization
- **Tailwind CSS**: Styling

## Project Structure

```
expenseTracker/
├── backend/                # Server-side code
│   ├── config/             # Database configuration
│   ├── controllers/        # Route handlers
│   ├── middlewares/        # Custom middlewares
│   ├── models/             # MongoDB schemas
│   ├── routes/             # API routes
│   ├── services/           # Business logic
│   └── index.js            # Entry point
│
├── frontend/               # Client-side code
│   ├── public/             # Static assets
│   ├── src/
│   │   ├── assets/         # Images and resources
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # React Context for state
│   │   ├── pages/          # Application views
│   │   ├── App.jsx         # Main component
│   │   └── main.jsx        # Entry point
│   └── index.html          # HTML template
│
└── .env                    # Environment variables
```

## Features

### User Authentication
- Email and password signup/login
- JWT-based authentication
- Password reset functionality

### Expense Management
- Create, edit, and delete expenses
- Categorize expenses (Food, Transport, Entertainment, etc.)
- Filter expenses by date, category, or amount
- Search functionality

### Budget Planning
- Create monthly/weekly budgets
- Category-specific budget limits
- Budget performance tracking
- Spending alerts when nearing limits

### Income Tracking
- Record multiple income sources
- Recurring income management
- Income categories

### Reports & Analytics
- Income vs. Expense comparison
- Category-wise expense breakdown
- Spending trends over time
- Interactive charts and graphs
- Exportable reports

## Getting Started

### Prerequisites
- Node.js (v14+)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd expenseTracker
   ```

2. Install dependencies:
   ```
   npm install
   cd frontend && npm install
   ```

3. Create .env file in the root directory with the following variables:
   ```
   PORT=5001
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   CLIENT_URL=http://localhost:5173
   ```

4. Start the development servers:
   
   Backend:
   ```
   npm run server
   ```
   
   Frontend:
   ```
   cd frontend && npm run dev
   ```

5. Access the application at http://localhost:5173

## License

This project is licensed under the ISC License. 