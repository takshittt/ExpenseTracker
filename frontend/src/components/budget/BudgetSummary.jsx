import React from "react";

const BudgetSummary = ({ budgetSummary }) => {
  // Calculate summary statistics
  const calculateSummary = () => {
    if (!budgetSummary || budgetSummary.length === 0) {
      return {
        totalBudget: 0,
        totalSpent: 0,
        percentUsed: 0,
        overBudgetCount: 0,
        nearLimitCount: 0,
        healthyCount: 0
      };
    }

    const summary = budgetSummary.reduce((acc, budget) => {
      // Skip inactive budgets
      if (budget.isActive === false) return acc;
      
      // Add to total budget and spent
      acc.totalBudget += budget.amount || 0;
      acc.totalSpent += budget.spent || 0;
      
      // Count budget status
      const percentUsed = ((budget.spent || 0) / (budget.amount || 1)) * 100;
      if (percentUsed > 100) {
        acc.overBudgetCount++;
      } else if (percentUsed > 80) {
        acc.nearLimitCount++;
      } else {
        acc.healthyCount++;
      }
      
      return acc;
    }, {
      totalBudget: 0,
      totalSpent: 0,
      overBudgetCount: 0,
      nearLimitCount: 0,
      healthyCount: 0
    });
    
    // Calculate overall percentage
    summary.percentUsed = (summary.totalSpent / summary.totalBudget) * 100 || 0;
    
    return summary;
  };
  
  const summary = calculateSummary();
  const percentUsed = summary.percentUsed;
  
  // Determine progress bar color
  let progressColor = "bg-green-500";
  if (percentUsed > 75) progressColor = "bg-yellow-500";
  if (percentUsed > 90) progressColor = "bg-orange-500";
  if (percentUsed > 100) progressColor = "bg-red-500";
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Budget Summary</h2>
      
      {/* Overall Progress */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-1">
          <div className="text-sm font-medium">
            <span className={percentUsed > 100 ? "text-red-600" : "text-gray-700"}>
              ${summary.totalSpent.toFixed(2)}
            </span>
            <span className="text-gray-500"> of ${summary.totalBudget.toFixed(2)}</span>
          </div>
          <span className={`text-sm font-medium ${percentUsed > 100 ? "text-red-600" : "text-gray-600"}`}>
            {percentUsed.toFixed(0)}%
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className={`${progressColor} h-2.5 rounded-full transition-all duration-500 ease-in-out`} 
            style={{ width: `${Math.min(percentUsed, 100)}%` }}
          ></div>
        </div>
      </div>
      
      {/* Budget Status Cards */}
      <div className="grid grid-cols-3 gap-4">
        {/* Healthy Budgets */}
        <div className="bg-green-50 border border-green-100 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-green-600">{summary.healthyCount}</div>
          <div className="text-xs text-green-800">Healthy</div>
        </div>
        
        {/* Near Limit Budgets */}
        <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-yellow-600">{summary.nearLimitCount}</div>
          <div className="text-xs text-yellow-800">Near Limit</div>
        </div>
        
        {/* Over Budget */}
        <div className="bg-red-50 border border-red-100 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-red-600">{summary.overBudgetCount}</div>
          <div className="text-xs text-red-800">Over Budget</div>
        </div>
      </div>
      
      {/* Empty State */}
      {(!budgetSummary || budgetSummary.length === 0) && (
        <div className="mt-4 text-center text-gray-500 text-sm">
          No active budgets. Create a budget to start tracking your expenses.
        </div>
      )}
    </div>
  );
};

export default BudgetSummary; 