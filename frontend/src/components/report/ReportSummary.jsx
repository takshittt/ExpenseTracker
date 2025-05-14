import React from "react";

const ReportSummary = ({ reportData }) => {
  // Calculate summary statistics
  const calculateSummary = () => {
    if (!reportData || reportData.length === 0) {
      return {
        totalIncome: 0,
        totalExpenses: 0,
        netCashflow: 0,
        avgIncome: 0,
        avgExpense: 0,
        topExpenseCategory: "N/A",
        topIncomeCategory: "N/A",
        largestExpense: 0,
        largestIncome: 0
      };
    }

    // Separate income and expenses
    const incomeTransactions = reportData.filter(item => item.transactionType === 'income');
    const expenseTransactions = reportData.filter(item => item.transactionType === 'expense');
    
    // Calculate totals
    const totalIncome = incomeTransactions.reduce((sum, item) => sum + item.amount, 0);
    const totalExpenses = expenseTransactions.reduce((sum, item) => sum + item.amount, 0);
    const netCashflow = totalIncome - totalExpenses;
    
    // Calculate averages
    const avgIncome = incomeTransactions.length > 0 ? totalIncome / incomeTransactions.length : 0;
    const avgExpense = expenseTransactions.length > 0 ? totalExpenses / expenseTransactions.length : 0;
    
    // Find top categories
    const expenseByCategory = {};
    const incomeByCategory = {};
    
    expenseTransactions.forEach(expense => {
      if (!expenseByCategory[expense.category]) {
        expenseByCategory[expense.category] = 0;
      }
      expenseByCategory[expense.category] += expense.amount;
    });
    
    incomeTransactions.forEach(income => {
      if (!incomeByCategory[income.category]) {
        incomeByCategory[income.category] = 0;
      }
      incomeByCategory[income.category] += income.amount;
    });
    
    // Find top categories
    let topExpenseCategory = "N/A";
    let topExpenseAmount = 0;
    
    for (const category in expenseByCategory) {
      if (expenseByCategory[category] > topExpenseAmount) {
        topExpenseAmount = expenseByCategory[category];
        topExpenseCategory = category;
      }
    }
    
    let topIncomeCategory = "N/A";
    let topIncomeAmount = 0;
    
    for (const category in incomeByCategory) {
      if (incomeByCategory[category] > topIncomeAmount) {
        topIncomeAmount = incomeByCategory[category];
        topIncomeCategory = category;
      }
    }
    
    // Find largest single transactions
    const largestExpense = expenseTransactions.length > 0 
      ? Math.max(...expenseTransactions.map(expense => expense.amount))
      : 0;
      
    const largestIncome = incomeTransactions.length > 0 
      ? Math.max(...incomeTransactions.map(income => income.amount))
      : 0;
    
    return {
      totalIncome,
      totalExpenses,
      netCashflow,
      avgIncome,
      avgExpense,
      topExpenseCategory,
      topIncomeCategory,
      largestExpense,
      largestIncome
    };
  };
  
  const summary = calculateSummary();
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Financial Summary</h2>
      
      {reportData && reportData.length > 0 ? (
        <div>
          {/* Top Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Total Income */}
            <div className="bg-green-50 border border-green-100 rounded-lg p-4">
              <h3 className="text-sm font-medium text-green-800 mb-1">Total Income</h3>
              <p className="text-2xl font-bold text-green-700">${summary.totalIncome.toFixed(2)}</p>
            </div>
            
            {/* Total Expenses */}
            <div className="bg-red-50 border border-red-100 rounded-lg p-4">
              <h3 className="text-sm font-medium text-red-800 mb-1">Total Expenses</h3>
              <p className="text-2xl font-bold text-red-700">${summary.totalExpenses.toFixed(2)}</p>
            </div>
            
            {/* Net Cashflow */}
            <div className={`${
              summary.netCashflow >= 0 ? "bg-blue-50 border-blue-100" : "bg-orange-50 border-orange-100"
            } border rounded-lg p-4`}>
              <h3 className={`text-sm font-medium ${
                summary.netCashflow >= 0 ? "text-blue-800" : "text-orange-800"
              } mb-1`}>Net Cashflow</h3>
              <p className={`text-2xl font-bold ${
                summary.netCashflow >= 0 ? "text-blue-700" : "text-orange-700"
              }`}>${Math.abs(summary.netCashflow).toFixed(2)} {summary.netCashflow < 0 ? "(Deficit)" : ""}</p>
            </div>
          </div>
          
          {/* Detailed Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div className="border-b border-gray-200 pb-3">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Average Income</h3>
                <p className="text-lg font-semibold text-gray-800">${summary.avgIncome.toFixed(2)}</p>
              </div>
              
              <div className="border-b border-gray-200 pb-3">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Top Income Category</h3>
                <p className="text-lg font-semibold text-gray-800">{summary.topIncomeCategory}</p>
              </div>
              
              <div className="pb-3">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Largest Income Transaction</h3>
                <p className="text-lg font-semibold text-gray-800">${summary.largestIncome.toFixed(2)}</p>
              </div>
            </div>
            
            {/* Right Column */}
            <div className="space-y-4">
              <div className="border-b border-gray-200 pb-3">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Average Expense</h3>
                <p className="text-lg font-semibold text-gray-800">${summary.avgExpense.toFixed(2)}</p>
              </div>
              
              <div className="border-b border-gray-200 pb-3">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Top Expense Category</h3>
                <p className="text-lg font-semibold text-gray-800">{summary.topExpenseCategory}</p>
              </div>
              
              <div className="pb-3">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Largest Expense Transaction</h3>
                <p className="text-lg font-semibold text-gray-800">${summary.largestExpense.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-500 py-8">
          <p>No data available for the selected filters.</p>
          <p className="mt-1">Adjust your filters and generate a report to see summary statistics.</p>
        </div>
      )}
    </div>
  );
};

export default ReportSummary; 