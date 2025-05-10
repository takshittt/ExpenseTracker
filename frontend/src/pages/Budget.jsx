import React, { useState, useEffect, useContext, useCallback } from "react";
import Navbar from "../components/Navbar";
import { BudgetDataContext } from "../context/BudgetContext.jsx";
import { ExpensesDataContext } from "../context/ExpensesContext";
import { Link, useLocation } from "react-router-dom";

const Budget = () => {
  const { budgets, budgetSummary, fetchBudgets, createBudget, updateBudget, deleteBudget, fetchBudgetSummary } = useContext(BudgetDataContext);
  const { expenses, fetchExpenses } = useContext(ExpensesDataContext);
  const location = useLocation();
  
  const [showAddBudgetModal, setShowAddBudgetModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [budgetFilter, setBudgetFilter] = useState("all"); // all, active, inactive
  const [periodFilter, setPeriodFilter] = useState("all"); // all, daily, weekly, monthly, yearly
  const [budgetUsage, setBudgetUsage] = useState({}); // Stores calculated usage for each budget
  const [highlightedBudgetId, setHighlightedBudgetId] = useState(null);
  
  const [newBudget, setNewBudget] = useState({
    name: "",
    amount: "",
    category: "",
    period: "Monthly",
    startDate: new Date().toISOString().substring(0, 10),
    endDate: "",
    description: "",
    isActive: true,
    notifyOnExceed: true,
    notificationThreshold: 80,
    color: "#3498db"
  });
  
  // Fetch budgets and expenses when component mounts
  useEffect(() => {
    fetchBudgets();
    fetchExpenses();
    fetchBudgetSummary();

    // Check for budget ID in query params (for highlighting)
    const queryParams = new URLSearchParams(location.search);
    const budgetId = queryParams.get('id');
    if (budgetId) {
      setHighlightedBudgetId(budgetId);
      setTimeout(() => setHighlightedBudgetId(null), 3000); // Clear highlight after 3 seconds
    }
    
    // Check if we were navigated here with a suggested category
    if (location.state && location.state.suggestedCategory) {
      // Auto-open the budget modal with the suggested category
      handleOpenBudgetModal(null, location.state.suggestedCategory);
    }
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);
  
  // Calculate budget usage whenever expenses or budgets change
  useEffect(() => {
    if (budgets.length > 0) {
      calculateBudgetUsage();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expenses, budgets]);

  // Memoized function to calculate budget usage
  const calculateBudgetUsage = useCallback(() => {
    const usage = {};
    
    budgets.forEach(budget => {
      const budgetId = budget._id || budget.id;
      if (!budgetId) return;
      
      // Get the relevant date range based on the budget period
      const dateRange = getDateRangeForBudget(budget);
      const { startDate, endDate } = dateRange;
      
      // Filter expenses by category and date range
      const relevantExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        const isInDateRange = expenseDate >= startDate && expenseDate <= endDate;
        
        // Only include expenses that match this budget's category
        return expense.category === budget.category && isInDateRange;
      });
      
      // Calculate total spent
      const totalSpent = relevantExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      
      // Calculate percentage used
      const percentUsed = budget.amount > 0 ? (totalSpent / budget.amount) * 100 : 0;
      
      // Store the usage data
      usage[budgetId] = {
        spent: totalSpent,
        percentUsed: Math.min(percentUsed, 100), // Cap at 100% for UI purposes
        expenses: relevantExpenses,
        remainingAmount: budget.amount - totalSpent
      };
    });
    
    setBudgetUsage(usage);
  }, [budgets, expenses]);
  
  // Helper function to determine the date range for a budget based on its period
  const getDateRangeForBudget = (budget) => {
    let startDate = new Date(budget.startDate);
    let endDate = budget.endDate ? new Date(budget.endDate) : new Date();
    
    // If no end date specified and it's a periodic budget, calculate based on period
    if (!budget.endDate) {
      const now = new Date();
      
      switch (budget.period) {
        case 'Daily':
          // Just use today
          startDate = new Date(now.setHours(0, 0, 0, 0));
          endDate = new Date(now.setHours(23, 59, 59, 999));
          break;
          
        case 'Weekly':
          // Get beginning of week (Sunday)
          const day = now.getDay(); // 0 for Sunday, 1 for Monday, etc.
          startDate = new Date(now);
          startDate.setDate(now.getDate() - day);
          startDate.setHours(0, 0, 0, 0);
          
          endDate = new Date(startDate);
          endDate.setDate(startDate.getDate() + 6);
          endDate.setHours(23, 59, 59, 999);
          break;
          
        case 'Monthly':
          // Get beginning of month
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
          break;
          
        case 'Yearly':
          // Get beginning of year
          startDate = new Date(now.getFullYear(), 0, 1);
          endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
          break;
          
        default:
          break;
      }
    }
    
    return { startDate, endDate };
  };

  const handleOpenBudgetModal = (budget = null, suggestedCategory = null) => {
    if (budget) {
      setIsEditMode(true);
      setSelectedBudget(budget);
      
      const formattedStartDate = budget.startDate 
        ? new Date(budget.startDate).toISOString().substring(0, 10) 
        : new Date().toISOString().substring(0, 10);
        
      const formattedEndDate = budget.endDate 
        ? new Date(budget.endDate).toISOString().substring(0, 10) 
        : "";
      
      setNewBudget({
        name: budget.name || "",
        amount: budget.amount ? budget.amount.toString() : "",
        category: budget.category || "",
        period: budget.period || "Monthly",
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        description: budget.description || "",
        isActive: budget.isActive !== undefined ? budget.isActive : true,
        notifyOnExceed: budget.notifyOnExceed !== undefined ? budget.notifyOnExceed : true,
        notificationThreshold: budget.notificationThreshold || 80,
        color: budget.color || "#3498db"
      });
    } else {
      setIsEditMode(false);
      setSelectedBudget(null);
      setNewBudget({
        name: suggestedCategory ? `${suggestedCategory} Budget` : "",
        amount: "",
        category: suggestedCategory || "",
        period: "Monthly",
        startDate: new Date().toISOString().substring(0, 10),
        endDate: "",
        description: suggestedCategory ? `Budget for ${suggestedCategory} expenses` : "",
        isActive: true,
        notifyOnExceed: true,
        notificationThreshold: 80,
        color: "#3498db"
      });
    }
    setShowAddBudgetModal(true);
  };
  
  const handleCloseBudgetModal = () => {
    setShowAddBudgetModal(false);
    setIsEditMode(false);
    setSelectedBudget(null);
  };
  
  const handleBudgetInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewBudget({
      ...newBudget,
      [name]: type === "checkbox" ? checked : value,
    });
  };
  
  const handleSubmitBudget = async (e) => {
    e.preventDefault();
    
    try {
      const budgetData = {
        name: newBudget.name,
        amount: parseFloat(newBudget.amount),
        category: newBudget.category,
        period: newBudget.period,
        startDate: new Date(newBudget.startDate),
        endDate: newBudget.endDate ? new Date(newBudget.endDate) : undefined,
        description: newBudget.description,
        isActive: newBudget.isActive,
        notifyOnExceed: newBudget.notifyOnExceed,
        notificationThreshold: parseInt(newBudget.notificationThreshold),
        color: newBudget.color
      };
      
      if (isEditMode && selectedBudget) {
        await updateBudget(selectedBudget.id || selectedBudget._id, budgetData);
      } else {
        await createBudget(budgetData);
      }
      
      handleCloseBudgetModal();
      fetchBudgetSummary(); // Refresh budget summary
    } catch (error) {
      console.error("Error saving budget:", error);
    }
  };
  
  const handleDeleteBudget = async (budgetId) => {
    try {
      if (window.confirm("Are you sure you want to delete this budget?")) {
        await deleteBudget(budgetId);
        fetchBudgetSummary(); // Refresh budget summary
      }
    } catch (error) {
      console.error("Error deleting budget:", error);
    }
  };
  
  // Get filtered budgets based on active status and period
  const getFilteredBudgets = () => {
    let filtered = [...budgets];
    
    // Filter by active status
    if (budgetFilter !== "all") {
      const isActive = budgetFilter === "active";
      filtered = filtered.filter(budget => budget.isActive === isActive);
    }
    
    // Filter by period
    if (periodFilter !== "all") {
      filtered = filtered.filter(budget => 
        budget.period.toLowerCase() === periodFilter.toLowerCase()
      );
    }
    
    return filtered;
  };
  
  // Calculate percentage used for a budget
  const calculatePercentUsed = (budget) => {
    const budgetId = budget._id || budget.id;
    
    // First check our calculated usage
    if (budgetUsage[budgetId]) {
      return budgetUsage[budgetId].percentUsed;
    }
    
    // Fallback to the budgetSummary from context if we have it
    const summary = budgetSummary.find(b => 
      b.category === budget.category && 
      b._id === budgetId
    );
    
    if (summary) {
      return Math.min(summary.percentUsed || 0, 100);
    }
    
    return 0;
  };

  // Get spent amount for a budget
  const getSpentAmount = (budget) => {
    const budgetId = budget._id || budget.id;
    
    // First check our calculated usage
    if (budgetUsage[budgetId]) {
      return budgetUsage[budgetId].spent;
    }
    
    // Fallback to the budgetSummary from context if we have it
    const summary = budgetSummary.find(b => 
      b.category === budget.category && 
      b._id === budgetId
    );
    
    if (summary) {
      return summary.spent || 0;
    }
    
    return 0;
  };
  
  // Get progress bar color based on percentage used
  const getProgressColor = (percentUsed) => {
    if (percentUsed >= 100) return "bg-red-500";
    if (percentUsed >= 80) return "bg-yellow-500";
    return "bg-green-500";
  };
  
  // Get budget progress status class for highlighting
  const getBudgetCardClass = (budget) => {
    const budgetId = budget._id || budget.id;
    const isHighlighted = highlightedBudgetId === budgetId;
    
    let baseClass = `bg-white rounded-lg shadow-sm border ${budget.isActive ? 'border-blue-200' : 'border-gray-200'} overflow-hidden`;
    
    if (isHighlighted) {
      return `${baseClass} ring-2 ring-indigo-500 transform scale-105 transition-all duration-300`;
    }
    
    const usage = budgetUsage[budgetId];
    if (usage) {
      if (usage.percentUsed >= 100) {
        return `${baseClass} border-red-300`;
      } else if (usage.percentUsed >= 80) {
        return `${baseClass} border-yellow-300`;
      }
    }
    
    return baseClass;
  };
  
  // Get list of expense categories that don't have budgets
  const getUnbudgetedCategories = useCallback(() => {
    // Get all unique expense categories
    const expenseCategories = [...new Set(expenses.map(expense => expense.category))];
    
    // Find categories that don't have corresponding budgets
    return expenseCategories.filter(category => 
      !budgets.some(budget => budget.category === category)
    );
  }, [expenses, budgets]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl shadow-md p-8 mb-8 border border-blue-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-blue-200 rounded-full -mt-20 -mr-20 opacity-20"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-200 rounded-full -mb-16 -ml-16 opacity-20"></div>
          
          <div className="relative z-10">
            <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-700">
              Budget Management
            </h1>
            <p className="text-gray-600 mt-3 max-w-2xl text-lg">
              Create and manage your budgets. Set spending limits for different categories and track your progress.
            </p>
            <div className="mt-6">
              <button
                onClick={() => handleOpenBudgetModal()}
                className="inline-flex items-center px-5 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Create New Budget
              </button>
            </div>
          </div>
        </div>
        
        {/* Unbudgeted Categories Alert */}
        {getUnbudgetedCategories().length > 0 && (
          <div className="bg-red-50 border-l-4 border-red-400 p-5 mb-6 rounded-md shadow-sm">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-base font-medium text-red-800">Categories Without Budgets</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p className="mb-3">You have expenses in the following categories without dedicated budgets. Create a budget for each category to track your spending effectively:</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {getUnbudgetedCategories().map(category => (
                      <button
                        key={category}
                        onClick={() => handleOpenBudgetModal(null, category)}
                        className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                      >
                        {category} <span className="ml-1.5">+</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">Status:</label>
              <div className="relative inline-flex">
                <select
                  value={budgetFilter}
                  onChange={(e) => setBudgetFilter(e.target.value)}
                  className="pl-3 pr-8 py-2 text-sm bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="all">All Budgets</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">Period:</label>
              <div className="relative inline-flex">
                <select
                  value={periodFilter}
                  onChange={(e) => setPeriodFilter(e.target.value)}
                  className="pl-3 pr-8 py-2 text-sm bg-gray-50 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="all">All Periods</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        
        {/* Budget Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {getFilteredBudgets().length > 0 ? (
            getFilteredBudgets().map((budget) => {
              const percentUsed = calculatePercentUsed(budget);
              const spentAmount = getSpentAmount(budget);
              const progressColor = getProgressColor(percentUsed);
              const remainingAmount = budget.amount - spentAmount;
              
              return (
                <div 
                  key={budget._id || budget.id} 
                  className={getBudgetCardClass(budget)}
                >
                  <div 
                    className="h-2"
                    style={{ backgroundColor: budget.color }}
                  ></div>
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold text-gray-800 truncate" title={budget.name}>
                        {budget.name}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        budget.period === 'Daily' ? 'bg-red-100 text-red-800' :
                        budget.period === 'Weekly' ? 'bg-orange-100 text-orange-800' :
                        budget.period === 'Monthly' ? 'bg-blue-100 text-blue-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {budget.period}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-500">{budget.category}</span>
                      {!budget.isActive && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                          Inactive
                        </span>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center mb-1 font-medium">
                      <span className="text-2xl text-gray-800">${budget.amount.toFixed(2)}</span>
                      <span className={`${
                        percentUsed >= 100 ? 'text-red-600' :
                        percentUsed >= 80 ? 'text-yellow-600' :
                        'text-green-600'
                      }`}>
                        {percentUsed.toFixed(1)}% used
                      </span>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                      <div 
                        className={`${progressColor} h-2.5 rounded-full transition-all duration-500 ease-in-out`} 
                        style={{ width: `${percentUsed}%` }}
                      ></div>
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-2">
                      <div className="flex justify-between items-center">
                        <span>Spent:</span>
                        <span className="font-medium">${spentAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Remaining:</span>
                        <span className={`font-medium ${remainingAmount < 0 ? 'text-red-600' : remainingAmount < (budget.amount * 0.2) ? 'text-yellow-600' : 'text-green-600'}`}>
                          ${remainingAmount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-4">
                      <div className="flex justify-between">
                        <span>Start Date:</span>
                        <span>{new Date(budget.startDate).toLocaleDateString()}</span>
                      </div>
                      {budget.endDate && (
                        <div className="flex justify-between">
                          <span>End Date:</span>
                          <span>{new Date(budget.endDate).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                      <button
                        onClick={() => handleOpenBudgetModal(budget)}
                        className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteBudget(budget._id || budget.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-12 text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-center mb-4">No budgets found</p>
              <button 
                onClick={() => handleOpenBudgetModal()} 
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
              >
                Create your first budget
              </button>
            </div>
          )}
        </div>
        
        {/* Add/Edit Budget Modal */}
        {showAddBudgetModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-auto my-8 overflow-hidden transform transition-all">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4 text-white">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">
                    {isEditMode ? 'Edit Budget' : 'Create New Budget'}
                  </h3>
                  <button onClick={handleCloseBudgetModal} className="focus:outline-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {/* Modal Body */}
              <form onSubmit={handleSubmitBudget} className="p-4 sm:p-6 overflow-y-auto max-h-[80vh]">
                <div className="space-y-4">
                  {/* Budget Name */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Budget Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="e.g., Groceries, Transportation, etc."
                      value={newBudget.name}
                      onChange={handleBudgetInputChange}
                    />
                  </div>
                  
                  {/* Amount */}
                  <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                      Budget Amount <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        id="amount"
                        name="amount"
                        type="number"
                        min="0"
                        step="0.01"
                        required
                        className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="0.00"
                        value={newBudget.amount}
                        onChange={handleBudgetInputChange}
                      />
                    </div>
                  </div>
                  
                  {/* Two-column layout for Category and Period */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Category */}
                    <div>
                      <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                        Category <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="category"
                        name="category"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        value={newBudget.category}
                        onChange={handleBudgetInputChange}
                      >
                        <option value="">Select a category</option>
                        <option value="Food">Food</option>
                        <option value="Transportation">Transportation</option>
                        <option value="Entertainment">Entertainment</option>
                        <option value="Shopping">Shopping</option>
                        <option value="Utilities">Utilities</option>
                        <option value="Housing">Housing</option>
                        <option value="Healthcare">Healthcare</option>
                        <option value="Personal">Personal</option>
                        <option value="Education">Education</option>
                        <option value="Travel">Travel</option>
                        <option value="Debt">Debt</option>
                        <option value="Investments">Investments</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    
                    {/* Period */}
                    <div>
                      <label htmlFor="period" className="block text-sm font-medium text-gray-700 mb-1">
                        Period <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="period"
                        name="period"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        value={newBudget.period}
                        onChange={handleBudgetInputChange}
                      >
                        <option value="Daily">Daily</option>
                        <option value="Weekly">Weekly</option>
                        <option value="Monthly">Monthly</option>
                        <option value="Yearly">Yearly</option>
                      </select>
                    </div>
                  </div>
                  
                  {/* Date Range */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Start Date */}
                    <div>
                      <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                        Start Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="startDate"
                        name="startDate"
                        type="date"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        value={newBudget.startDate}
                        onChange={handleBudgetInputChange}
                      />
                    </div>
                    
                    {/* End Date (Optional) */}
                    <div>
                      <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                        End Date <span className="text-gray-400">(Optional)</span>
                      </label>
                      <input
                        id="endDate"
                        name="endDate"
                        type="date"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        value={newBudget.endDate}
                        onChange={handleBudgetInputChange}
                      />
                    </div>
                  </div>
                  
                  {/* Color */}
                  <div>
                    <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-1">
                      Color
                    </label>
                    <input
                      id="color"
                      name="color"
                      type="color"
                      className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      value={newBudget.color}
                      onChange={handleBudgetInputChange}
                    />
                  </div>
                  
                  {/* Description */}
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows="2"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Optional details about this budget"
                      value={newBudget.description}
                      onChange={handleBudgetInputChange}
                    ></textarea>
                  </div>
                  
                  {/* Toggles for Active Status & Notifications */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                        Active Budget
                      </label>
                      <div className="relative inline-flex items-center">
                        <input
                          type="checkbox"
                          id="isActive"
                          name="isActive"
                          className="sr-only"
                          checked={newBudget.isActive}
                          onChange={handleBudgetInputChange}
                        />
                        <div
                          className={`w-11 h-6 rounded-full transition ${
                            newBudget.isActive ? "bg-indigo-600" : "bg-gray-300"
                          }`}
                        >
                          <div
                            className={`absolute left-0.5 top-0.5 bg-white w-5 h-5 rounded-full transition-transform transform ${
                              newBudget.isActive ? "translate-x-5" : ""
                            }`}
                          ></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <label htmlFor="notifyOnExceed" className="text-sm font-medium text-gray-700">
                        Notify When Exceeded
                      </label>
                      <div className="relative inline-flex items-center">
                        <input
                          type="checkbox"
                          id="notifyOnExceed"
                          name="notifyOnExceed"
                          className="sr-only"
                          checked={newBudget.notifyOnExceed}
                          onChange={handleBudgetInputChange}
                        />
                        <div
                          className={`w-11 h-6 rounded-full transition ${
                            newBudget.notifyOnExceed ? "bg-indigo-600" : "bg-gray-300"
                          }`}
                        >
                          <div
                            className={`absolute left-0.5 top-0.5 bg-white w-5 h-5 rounded-full transition-transform transform ${
                              newBudget.notifyOnExceed ? "translate-x-5" : ""
                            }`}
                          ></div>
                        </div>
                      </div>
                    </div>
                    
                    {newBudget.notifyOnExceed && (
                      <div>
                        <label htmlFor="notificationThreshold" className="block text-sm font-medium text-gray-700 mb-1">
                          Notification Threshold (%)
                        </label>
                        <input
                          id="notificationThreshold"
                          name="notificationThreshold"
                          type="number"
                          min="1"
                          max="100"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          value={newBudget.notificationThreshold}
                          onChange={handleBudgetInputChange}
                        />
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="mt-6 flex items-center justify-end space-x-3">
                  <button
                    type="button"
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    onClick={handleCloseBudgetModal}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    {isEditMode ? 'Update Budget' : 'Create Budget'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Budget; 