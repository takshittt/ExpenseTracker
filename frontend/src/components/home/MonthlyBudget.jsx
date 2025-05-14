import React from "react";
import { Link } from "react-router-dom";

const MonthlyBudget = ({
  monthlyBudget,
  handleBudgetClick,
  getBudgetItemClasses
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Monthly Budget</h2>
        <Link to="/budget" className="text-blue-500 hover:text-blue-700 text-sm font-medium">Manage Budget</Link>
      </div>
      {monthlyBudget.length > 0 ? (
        <div className="space-y-4">
          {monthlyBudget.map((item, index) => {
            const percentage = item.percentUsed || 0;
            let progressColor = "bg-green-500";
            if (percentage > 75) progressColor = "bg-yellow-500";
            if (percentage > 90) progressColor = "bg-red-500";
            
            return (
              <div key={item.id || index} 
                className={getBudgetItemClasses(item)}
                onClick={() => handleBudgetClick(item.id)}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium">{item.name || item.category}</span>
                  <span className="text-sm">${item.spent?.toFixed(2) || 0} of ${item.budget?.toFixed(2) || 0}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`${progressColor} h-2 rounded-full transition-all duration-500 ease-in-out`} 
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-center mb-2">No budgets set up yet</p>
          <Link 
            to="/budget"
            className="mt-2 text-blue-500 hover:text-blue-700 font-medium inline-flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Create your first budget
          </Link>
        </div>
      )}
    </div>
  );
};

export default MonthlyBudget; 