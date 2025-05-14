import React from "react";

const ExpenseSummary = ({ expenses }) => {
  // Calculate summary statistics
  const calculateSummary = () => {
    if (!expenses || expenses.length === 0) {
      return {
        totalExpenses: 0,
        averageExpense: 0,
        highestExpense: 0,
        mostFrequentCategory: "N/A",
        recentExpenses: [],
        expensesByCategory: {}
      };
    }

    // Calculate total expenses
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    // Calculate average expense
    const averageExpense = totalExpenses / expenses.length;
    
    // Find highest expense
    const highestExpense = Math.max(...expenses.map(expense => expense.amount));
    
    // Group expenses by category
    const expensesByCategory = {};
    expenses.forEach(expense => {
      const category = expense.category || "Uncategorized";
      if (!expensesByCategory[category]) {
        expensesByCategory[category] = 0;
      }
      expensesByCategory[category] += expense.amount;
    });
    
    // Find most frequent category
    let mostFrequentCategory = "N/A";
    let highestAmount = 0;
    
    Object.entries(expensesByCategory).forEach(([category, amount]) => {
      if (amount > highestAmount) {
        mostFrequentCategory = category;
        highestAmount = amount;
      }
    });
    
    // Get recent expenses (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentExpenses = expenses.filter(expense => 
      new Date(expense.date) >= thirtyDaysAgo
    );
    
    return {
      totalExpenses,
      averageExpense,
      highestExpense,
      mostFrequentCategory,
      recentExpenses,
      expensesByCategory
    };
  };
  
  const summary = calculateSummary();
  
  // Format currency
  const formatCurrency = (amount) => {
    return `$${amount.toFixed(2)}`;
  };
  
  // Get top categories (up to 5)
  const topCategories = Object.entries(summary.expensesByCategory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Expense Summary</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {/* Total Expenses */}
        <div className="bg-red-50 border border-red-100 rounded-lg p-4">
          <h3 className="text-sm font-medium text-red-800 mb-1">Total Expenses</h3>
          <p className="text-2xl font-bold text-red-700">{formatCurrency(summary.totalExpenses)}</p>
        </div>
        
        {/* Average Expense */}
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-800 mb-1">Average Expense</h3>
          <p className="text-2xl font-bold text-blue-700">{formatCurrency(summary.averageExpense)}</p>
        </div>
        
        {/* Highest Expense */}
        <div className="bg-purple-50 border border-purple-100 rounded-lg p-4">
          <h3 className="text-sm font-medium text-purple-800 mb-1">Highest Expense</h3>
          <p className="text-2xl font-bold text-purple-700">{formatCurrency(summary.highestExpense)}</p>
        </div>
        
        {/* Top Category */}
        <div className="bg-green-50 border border-green-100 rounded-lg p-4">
          <h3 className="text-sm font-medium text-green-800 mb-1">Top Expense Category</h3>
          <p className="text-2xl font-bold text-green-700">{summary.mostFrequentCategory}</p>
        </div>
      </div>
      
      {/* Top Categories */}
      {topCategories.length > 0 && (
        <div className="mb-4">
          <h3 className="text-md font-semibold text-gray-700 mb-3">Top Categories</h3>
          <div className="space-y-3">
            {topCategories.map(([category, amount], index) => {
              // Calculate percentage of total
              const percentage = (amount / summary.totalExpenses) * 100;
              
              return (
                <div key={index}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-600">{category}</span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatCurrency(amount)} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Recent Trends */}
      <div>
        <h3 className="text-md font-semibold text-gray-700 mb-3">Recent Trends</h3>
        <p className="text-sm text-gray-600">
          {summary.recentExpenses.length > 0 ? (
            <>
              You've spent <span className="font-medium">{formatCurrency(summary.recentExpenses.reduce((sum, exp) => sum + exp.amount, 0))}</span> in the last 30 days 
              across <span className="font-medium">{summary.recentExpenses.length}</span> transactions.
            </>
          ) : (
            "No expenses recorded in the last 30 days."
          )}
        </p>
      </div>
    </div>
  );
};

export default ExpenseSummary; 