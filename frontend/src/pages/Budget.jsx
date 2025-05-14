import React, { useState, useContext, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import { BudgetDataContext } from "../context/BudgetContext";
import axios from "axios";

// Import components
import BudgetModal from "../components/budget/BudgetModal";
import BudgetCard from "../components/budget/BudgetCard";
import BudgetSummary from "../components/budget/BudgetSummary";

const Budget = () => {
  const location = useLocation();
  const { budgets, budgetSummary, fetchBudgets, fetchBudgetSummary } = useContext(BudgetDataContext);
  const [showAddBudgetModal, setShowAddBudgetModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [showActionMenu, setShowActionMenu] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all"); // "all", "active", "inactive"
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("name"); // "name", "amount", "spent", "percentUsed"
  const [newBudget, setNewBudget] = useState({
    name: "",
    amount: "",
    category: "",
    period: "Monthly",
    startDate: new Date().toISOString().split('T')[0],
    endDate: "",
    description: "",
    color: "#6366F1", // Default indigo color
    isActive: true,
    notifyOnExceed: false,
    notificationThreshold: 90
  });
  
  // Fetch budgets on component mount
  useEffect(() => {
    fetchBudgets();
    fetchBudgetSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Check for suggested category from Home page
  useEffect(() => {
    if (location.state?.suggestedCategory) {
      setNewBudget(prev => ({
        ...prev,
        name: location.state.suggestedCategory,
        category: location.state.suggestedCategory
      }));
      setShowAddBudgetModal(true);
    }
  }, [location.state]);
  
  // Filter and sort budgets
  const getFilteredBudgets = () => {
    let filtered = [...budgets];
    
    // Apply status filter
    if (filterStatus !== "all") {
      const isActive = filterStatus === "active";
      filtered = filtered.filter(budget => budget.isActive === isActive);
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(budget => 
        budget.name.toLowerCase().includes(query) || 
        budget.category.toLowerCase().includes(query) ||
        (budget.description && budget.description.toLowerCase().includes(query))
      );
    }
    
    // Apply sorting
    switch (sortOption) {
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "amount":
        filtered.sort((a, b) => b.amount - a.amount);
        break;
      case "spent":
        filtered.sort((a, b) => b.spent - a.spent);
        break;
      case "percentUsed":
        filtered.sort((a, b) => {
          const percentA = (a.spent / a.amount) * 100 || 0;
          const percentB = (b.spent / b.amount) * 100 || 0;
          return percentB - percentA;
        });
        break;
      default:
        break;
    }
    
    return filtered;
  };
  
  const handleOpenAddBudgetModal = () => {
    setIsEditMode(false);
    setSelectedBudget(null);
    setNewBudget({
      name: "",
      amount: "",
      category: "",
      period: "Monthly",
      startDate: new Date().toISOString().split('T')[0],
      endDate: "",
      description: "",
      color: "#6366F1", // Default indigo color
      isActive: true,
      notifyOnExceed: false,
      notificationThreshold: 90
    });
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
      [name]: type === "checkbox" ? checked : value
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
        endDate: newBudget.endDate ? new Date(newBudget.endDate) : null,
        description: newBudget.description,
        color: newBudget.color,
        isActive: newBudget.isActive,
        notifyOnExceed: newBudget.notifyOnExceed,
        notificationThreshold: newBudget.notificationThreshold ? parseInt(newBudget.notificationThreshold) : 90
      };
      
      const config = {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      };
      
      if (isEditMode && selectedBudget) {
        // Update existing budget
        await axios.put(`/budgets/${selectedBudget._id}`, budgetData, config);
      } else {
        // Create new budget
        await axios.post("/budgets", budgetData, config);
      }
      
      // Refresh budgets
      fetchBudgets();
      fetchBudgetSummary();
      
      // Close modal
      handleCloseBudgetModal();
    } catch (error) {
      console.error("Error saving budget:", error);
    }
  };
  
  const handleEditBudget = (budget) => {
    setIsEditMode(true);
    setSelectedBudget(budget);
    setNewBudget({
      name: budget.name || "",
      amount: budget.amount?.toString() || "",
      category: budget.category || "",
      period: budget.period || "Monthly",
      startDate: budget.startDate ? new Date(budget.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      endDate: budget.endDate ? new Date(budget.endDate).toISOString().split('T')[0] : "",
      description: budget.description || "",
      color: budget.color || "#6366F1",
      isActive: budget.isActive !== false, // Default to true if undefined
      notifyOnExceed: budget.notifyOnExceed || false,
      notificationThreshold: budget.notificationThreshold?.toString() || "90"
    });
    setShowAddBudgetModal(true);
    setShowActionMenu(null);
  };
  
  const handleDeleteBudget = async (budgetId) => {
    if (!window.confirm("Are you sure you want to delete this budget?")) {
      return;
    }
    
    try {
      await axios.delete(`/budgets/${budgetId}`, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      // Refresh budgets
      fetchBudgets();
      fetchBudgetSummary();
      
      // Hide action menu
      setShowActionMenu(null);
    } catch (error) {
      console.error("Error deleting budget:", error);
    }
  };
  
  const toggleActionMenu = (budgetId) => {
    if (showActionMenu === budgetId) {
      setShowActionMenu(null);
    } else {
      setShowActionMenu(budgetId);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Budget Management</h1>
            <p className="text-gray-600 mt-1">Create and manage your spending budgets</p>
          </div>
          <button
            onClick={handleOpenAddBudgetModal}
            className="mt-4 md:mt-0 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-md shadow-sm hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Create New Budget
            </div>
          </button>
        </div>
        
        {/* Budget Summary */}
        <div className="mb-8">
          <BudgetSummary budgetSummary={budgetSummary} />
        </div>
        
        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search */}
            <div className="w-full md:w-1/3">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search budgets..."
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
              {/* Status Filter */}
              <div className="w-full md:w-auto">
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">All Budgets</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Inactive Only</option>
                </select>
              </div>
              
              {/* Sort Options */}
              <div className="w-full md:w-auto">
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                >
                  <option value="name">Sort by Name</option>
                  <option value="amount">Sort by Amount</option>
                  <option value="spent">Sort by Spent</option>
                  <option value="percentUsed">Sort by % Used</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        
        {/* Budget Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {getFilteredBudgets().map(budget => (
            <BudgetCard 
              key={budget._id}
              budget={budget}
              handleEditBudget={handleEditBudget}
              handleDeleteBudget={handleDeleteBudget}
              showActionMenu={showActionMenu}
              toggleActionMenu={toggleActionMenu}
            />
          ))}
          
          {/* Empty State */}
          {getFilteredBudgets().length === 0 && (
            <div className="col-span-full bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No budgets found</h3>
              <p className="text-gray-500 mb-4">
                {searchQuery || filterStatus !== "all" ? 
                  "Try changing your search or filter settings." : 
                  "Create your first budget to start tracking your expenses."}
              </p>
              <button
                onClick={handleOpenAddBudgetModal}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Create New Budget
              </button>
            </div>
          )}
        </div>
      </main>
      
      {/* Budget Modal */}
      <BudgetModal
        showAddBudgetModal={showAddBudgetModal}
        isEditMode={isEditMode}
        newBudget={newBudget}
        handleCloseBudgetModal={handleCloseBudgetModal}
        handleBudgetInputChange={handleBudgetInputChange}
        handleSubmitBudget={handleSubmitBudget}
      />
    </div>
  );
};

export default Budget; 