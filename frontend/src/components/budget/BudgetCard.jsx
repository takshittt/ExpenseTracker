import React from "react";

const BudgetCard = ({ 
  budget, 
  handleEditBudget, 
  handleDeleteBudget,
  showActionMenu,
  toggleActionMenu
}) => {
  const percentUsed = budget.spent / budget.amount * 100 || 0;
  const isOverBudget = percentUsed > 100;
  
  // Determine progress bar color based on percentage used
  let progressColor = "bg-green-500";
  if (percentUsed > 75) progressColor = "bg-yellow-500";
  if (percentUsed > 90) progressColor = "bg-orange-500";
  if (isOverBudget) progressColor = "bg-red-500";
  
  // Format dates for display
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };
  
  return (
    <div className={`bg-white rounded-lg shadow-sm border ${isOverBudget ? 'border-red-200' : 'border-gray-200'} p-4 relative`}>
      {/* Budget Header with Action Menu */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            {budget.name}
            {!budget.isActive && (
              <span className="ml-2 px-1.5 py-0.5 text-xs bg-gray-200 text-gray-600 rounded">
                Inactive
              </span>
            )}
          </h3>
          <p className="text-sm text-gray-500">{budget.category}</p>
        </div>
        
        <div className="relative">
          <button 
            onClick={() => toggleActionMenu(budget._id)}
            className="p-1.5 hover:bg-gray-100 rounded-full"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>
          
          {/* Action Menu */}
          {showActionMenu === budget._id && (
            <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
              <div className="py-1">
                <button 
                  onClick={() => handleEditBudget(budget)}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                  Edit
                </button>
                <button 
                  onClick={() => handleDeleteBudget(budget._id)}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Budget Progress */}
      <div className="mt-4">
        <div className="flex justify-between items-center mb-1">
          <div className="text-sm font-medium">
            <span className={isOverBudget ? "text-red-600" : "text-gray-700"}>
              ${budget.spent?.toFixed(2) || "0.00"}
            </span>
            <span className="text-gray-500"> of ${budget.amount?.toFixed(2) || "0.00"}</span>
          </div>
          <span className={`text-sm font-medium ${isOverBudget ? "text-red-600" : "text-gray-600"}`}>
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
      
      {/* Budget Details */}
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-gray-500">
        <div>
          <span className="block text-gray-400">Period</span>
          <span className="font-medium text-gray-600">{budget.period}</span>
        </div>
        <div>
          <span className="block text-gray-400">Start Date</span>
          <span className="font-medium text-gray-600">{formatDate(budget.startDate)}</span>
        </div>
        {budget.endDate && (
          <div>
            <span className="block text-gray-400">End Date</span>
            <span className="font-medium text-gray-600">{formatDate(budget.endDate)}</span>
          </div>
        )}
        {budget.notifyOnExceed && (
          <div>
            <span className="block text-gray-400">Alert at</span>
            <span className="font-medium text-gray-600">{budget.notificationThreshold || 90}%</span>
          </div>
        )}
      </div>
      
      {/* Budget Description (if exists) */}
      {budget.description && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-500 line-clamp-2">{budget.description}</p>
        </div>
      )}
      
      {/* Color Indicator */}
      <div 
        className="absolute top-0 right-0 w-1.5 h-12 rounded-tr-lg"
        style={{ backgroundColor: budget.color || "#6366F1" }}
      ></div>
    </div>
  );
};

export default BudgetCard; 