# Expense Tracker Application

A comprehensive financial management application built with React and Node.js that helps users track their expenses, manage budgets, and analyze their financial health.

## Features

- **Dashboard**: Overview of financial status
- **Expenses**: Track and manage daily expenses
- **Budget**: Create and monitor budgets
- **Income**: Record and track income
- **Reports**: Interactive financial analysis with charts and insights

## Report Page

The Report page provides interactive financial analysis with the following features:

- **Overview**: Visual representation of income vs expenses, balance, and key performance indicators
- **Expenses Analysis**: Breakdown of expenses by category with interactive charts
- **Budget Performance**: Track budget compliance and get personalized recommendations
- **Filtering**: Filter financial data by time period and category

## Technologies Used

- **Frontend**: React, React Router, Chart.js, Tailwind CSS
- **Backend**: Node.js, Express, MongoDB
- **State Management**: React Context API
- **Authentication**: JWT

## Getting Started

1. Clone the repository
2. Install dependencies for both frontend and backend:
   ```
   npm install
   cd frontend && npm install
   ```
3. Start the backend server:
   ```
   npm start
   ```
4. Start the frontend development server:
   ```
   cd frontend && npm run dev
   ```

## Development

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

### Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript and enable type-aware lint rules. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
