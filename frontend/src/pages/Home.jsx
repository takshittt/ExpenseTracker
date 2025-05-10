import React, { useState, useContext, useEffect, useRef } from "react";
import Navbar from "../components/Navbar";
import { ExpensesDataContext } from "../context/ExpensesContext";
import { IncomeDataContext } from "../context/incomeContext.jsx";
import { BudgetDataContext } from "../context/BudgetContext.jsx";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const Home = () => {
  const [currentBalance, setCurrentBalance] = useState(2450.75);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [showTransactionTypeModal, setShowTransactionTypeModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [selectedIncome, setSelectedIncome] = useState(null);
  const [showActionMenu, setShowActionMenu] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const { expenses, addExpense, updateExpense, deleteExpense, fetchExpenses } = useContext(ExpensesDataContext);
  const { income, addIncome, updateIncome, deleteIncome, fetchIncome } = useContext(IncomeDataContext);
  const { budgetSummary, fetchBudgetSummary } = useContext(BudgetDataContext);
  const [newExpense, setNewExpense] = useState({
    title: "",
    amount: "",
    category: "Other",
    description: "",
    date: new Date().toISOString().split('T')[0],
    paymentMethod: "Cash",
  });
  
  const [newIncome, setNewIncome] = useState({
    title: "",
    amount: "",
    category: "Salary",
    source: "",
    description: "",
    date: new Date().toISOString().substring(0, 10),
    paymentMethod: "Bank Transfer",
  });
  
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [monthlyBudget, setMonthlyBudget] = useState([]);
  const [showAllTransactionsModal, setShowAllTransactionsModal] = useState(false);
  const [allTransactions, setAllTransactions] = useState([]);
  const [transactionFilter, setTransactionFilter] = useState("all"); // "all", "income", "expense"
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("newest"); // "newest", "oldest", "highest", "lowest"
  const navigate = useNavigate();
  const [updatedBudgetCategory, setUpdatedBudgetCategory] = useState(null);
  const [showBudgetUpdateNotification, setShowBudgetUpdateNotification] = useState(false);
  const notificationTimeoutRef = useRef(null);

  // Use fetchExpenses, fetchIncome, and fetchBudgetSummary when component mounts
  useEffect(() => {
    // Fetch expenses, income, and budget summary when component mounts
    fetchExpenses();
    fetchIncome();
    fetchBudgetSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update monthly budget when budgetSummary changes
  useEffect(() => {
    if (budgetSummary && budgetSummary.length > 0) {
      const formattedBudgets = budgetSummary.map(budget => ({
        category: budget.category,
        budget: budget.amount,
        spent: budget.spent,
        name: budget.name,
        percentUsed: budget.percentUsed,
        id: budget._id
      }));
      setMonthlyBudget(formattedBudgets);
    } else {
      // Clear the monthly budget when there are no budgets in the summary
      setMonthlyBudget([]);
    }
  }, [budgetSummary]);

  // Update recentTransactions when expenses or income change
  useEffect(() => {
    let transactions = [];
    
    if (expenses && expenses.length > 0) {
      // Mark expenses with a type
      const expenseTransactions = expenses.map(expense => ({
        ...expense,
        transactionType: 'expense'
      }));
      transactions = [...transactions, ...expenseTransactions];
    }
    
    if (income && income.length > 0) {
      // Mark income with a type
      const incomeTransactions = income.map(inc => ({
        ...inc,
        transactionType: 'income'
      }));
      transactions = [...transactions, ...incomeTransactions];
    }
    
    // Sort all transactions by date
    const sortedTransactions = transactions.sort((a, b) => 
      new Date(b.date) - new Date(a.date)
    );
    
    // Take the most recent 4 transactions
    setRecentTransactions(sortedTransactions.slice(0, 4));
  }, [expenses, income]);

  // Update current balance when expenses or income change
  useEffect(() => {
    let totalIncome = 0;
    let totalExpenses = 0;

    if (income && income.length > 0) {
      totalIncome = income.reduce((sum, item) => sum + item.amount, 0);
    }

    if (expenses && expenses.length > 0) {
      totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
    }

    setCurrentBalance(totalIncome - totalExpenses);
  }, [income, expenses]);

  // Prepare all transactions for the modal
  useEffect(() => {
    let combinedTransactions = [];
    
    if (expenses && expenses.length > 0) {
      const expenseTransactions = expenses.map(expense => ({
        ...expense,
        transactionType: 'expense'
      }));
      combinedTransactions = [...combinedTransactions, ...expenseTransactions];
    }
    
    if (income && income.length > 0) {
      const incomeTransactions = income.map(inc => ({
        ...inc,
        transactionType: 'income'
      }));
      combinedTransactions = [...combinedTransactions, ...incomeTransactions];
    }
    
    setAllTransactions(combinedTransactions);
  }, [expenses, income]);
  
  // Get filtered and sorted transactions
  const getFilteredTransactions = () => {
    // First filter by type
    let filtered = [...allTransactions];
    
    if (transactionFilter !== "all") {
      filtered = filtered.filter(transaction => 
        transaction.transactionType === transactionFilter
      );
    }
    
    // Then filter by search query if present
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(transaction => 
        transaction.title.toLowerCase().includes(query) || 
        (transaction.description && transaction.description.toLowerCase().includes(query)) ||
        (transaction.transactionType === 'income' ? 
          transaction.source.toLowerCase().includes(query) : 
          transaction.category.toLowerCase().includes(query))
      );
    }
    
    // Apply sorting
    switch (sortOrder) {
      case "newest":
        return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
      case "oldest":
        return filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
      case "highest":
        return filtered.sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount));
      case "lowest":
        return filtered.sort((a, b) => Math.abs(a.amount) - Math.abs(b.amount));
      default:
        return filtered;
    }
  };

  const handleOpenExpenseModal = (expense = null) => {
    if (expense) {
      setIsEditMode(true);
      setSelectedExpense(expense);
      setNewExpense({
        title: expense.title || "",
        amount: expense.amount ? Math.abs(expense.amount).toString() : "",
        category: expense.category || "Other",
        description: expense.description || "",
        date: expense.date ? new Date(expense.date).toISOString().substring(0, 10) : new Date().toISOString().substring(0, 10),
        paymentMethod: expense.paymentMethod || "Cash",
      });
    } else {
      setIsEditMode(false);
      setSelectedExpense(null);
      setNewExpense({
        title: "",
        amount: "",
        category: "Other",
        description: "",
        date: new Date().toISOString().substring(0, 10),
        paymentMethod: "Cash",
      });
    }
    setShowExpenseModal(true);
  };

  const handleOpenIncomeModal = (incomeItem = null) => {
    
    if (incomeItem && (incomeItem._id || incomeItem.id)) {
      
      setIsEditMode(true);
      setSelectedIncome({
        ...incomeItem,
        // Ensure we have a consistent id property
        id: incomeItem._id || incomeItem.id,
        // Explicitly preserve the payment method
        paymentMethod: incomeItem.paymentMethod
      });
      
      // Create the form state with the existing values
      const formState = {
        title: incomeItem.title || "",
        amount: incomeItem.amount ? Math.abs(incomeItem.amount).toString() : "",
        category: incomeItem.category || "Salary",
        source: incomeItem.source || "",
        description: incomeItem.description || "",
        date: incomeItem.date ? new Date(incomeItem.date).toISOString().substring(0, 10) : new Date().toISOString().substring(0, 10),
        // Important: preserve the exact payment method
        paymentMethod: incomeItem.paymentMethod || "Bank Transfer",
      };
      
      
      setNewIncome(formState);
    } else {
      setIsEditMode(false);
      setSelectedIncome(null);
      const defaultIncome = {
        title: "",
        amount: "",
        category: "Salary",
        source: "",
        description: "",
        date: new Date().toISOString().substring(0, 10),
        paymentMethod: "Bank Transfer",
      };
      setNewIncome(defaultIncome);
    }
    setShowIncomeModal(true);
  };

  const handleCloseIncomeModal = () => {
    setShowIncomeModal(false);
    setIsEditMode(false);
    setSelectedIncome(null);
    setNewIncome({
      title: "",
      amount: "",
      category: "Salary",
      source: "",
      description: "",
      date: new Date().toISOString().substring(0, 10),
      paymentMethod: "Bank Transfer",
    });
  };

  const handleCloseExpenseModal = () => {
    setShowExpenseModal(false);
    setIsEditMode(false);
    setSelectedExpense(null);
    setNewExpense({
      title: "",
      amount: "",
      category: "Other",
      description: "",
      date: new Date().toISOString().split('T')[0],
      paymentMethod: "Cash",
    });
  };

  const handleExpenseInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'paymentMethod') {
    }
    setNewExpense({
      ...newExpense,
      [name]: value,
    });
  };

  const handleIncomeInputChange = (name, value) => {
    setNewIncome({
      ...newIncome,
      [name]: value,
    });
  };

  const handleSubmitExpense = async (e) => {
    e.preventDefault();
    
    try {
      const expenseData = {
        title: newExpense.title || "",
        amount: newExpense.amount ? parseFloat(newExpense.amount) : 0,
        category: newExpense.category || "Other",
        description: newExpense.description || "",
        date: newExpense.date ? new Date(newExpense.date) : new Date(),
        paymentMethod: newExpense.paymentMethod || "Cash",
      };
      
      
      const config = {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      };
      
      let response = null;
      const hasExistingBudget = findBudgetForCategory(expenseData.category);
      
      if (isEditMode && selectedExpense) {
        // Update existing expense
        response = await axios.put(`/expenses/${selectedExpense._id}`, expenseData, config);
        updateExpense({
          ...response.data.data,
          id: response.data.data._id
        });
        
        // Log category change if applicable
        if (selectedExpense.category !== expenseData.category) {
        }
      } else {
        // Create new expense
        response = await axios.post("/expenses", expenseData, config);
        addExpense({
          ...response.data.data,
          id: response.data.data._id
        });
      }
      
      // Refresh budget summary to reflect the changes
      fetchBudgetSummary();
      
      // Close the modal
      handleCloseExpenseModal();
      
      // Check if this category has a budget
      if (!hasExistingBudget) {
        // If not, show a prompt to create one
        showBudgetUpdateAlert(expenseData.category, true);
      } else {
        // Regular budget update notification
        showBudgetUpdateAlert(expenseData.category);
      }
      
    } catch (error) {
      console.error("Error saving expense:", error);
      // Handle error (could add error state and show message to user)
    }
  };

  // Helper function to find a budget for a specific category
  const findBudgetForCategory = (category) => {
    // Look for an exact category match
    const categoryBudget = budgetSummary.find(budget => 
      budget.category === category && budget.isActive !== false
    );
    
    return categoryBudget || null;
  };

  const handleSubmitIncome = async (e) => {
    e.preventDefault();
    
    // Log the current form state before submission for debugging
    
    try {
      const incomeData = {
        title: newIncome.title || "",
        amount: newIncome.amount ? parseFloat(newIncome.amount) : 0,
        category: newIncome.category || "Salary",
        source: newIncome.source || "",
        description: newIncome.description || "",
        date: newIncome.date ? new Date(newIncome.date) : new Date(),
        paymentMethod: newIncome.paymentMethod || "Bank Transfer",
      };
      
      
      if (isEditMode && selectedIncome) {
        
        // Make sure we have a valid ID
        if (!selectedIncome.id) {
          console.error("No valid ID found for income update");
          throw new Error("Unable to update income: Missing ID");
        }
        
        // Update existing income
        const updatedIncome = await updateIncome(selectedIncome.id, incomeData);
      } else {
        // Add new income
        const newIncomeResult = await addIncome(incomeData);
      }
      
      // Close the modal
      handleCloseIncomeModal();
    } catch (error) {
      console.error("Error saving income:", error);
      // Handle error
    }
  };
  
  const handleDeleteExpense = async (expenseId) => {
    try {
      // Find the expense before deleting it to get its category
      const expenseToDelete = expenses.find(expense => expense._id === expenseId || expense.id === expenseId);
      
      if (!expenseToDelete) {
        console.error("Could not find expense to delete:", expenseId);
        return;
      }
      
      // Delete the expense
      await axios.delete(`/expenses/${expenseId}`, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      // Remove from local state
      deleteExpense(expenseId);
      
      // Hide action menu
      setShowActionMenu(null);
      
      // Refresh budget summary
      fetchBudgetSummary();
      
      // Check if category has a budget
      const categoryHasBudget = findBudgetForCategory(expenseToDelete.category);
      
      // Show appropriate notification
      if (categoryHasBudget) {
        showBudgetUpdateAlert(expenseToDelete.category); // Simple notification for budgeted category
      } else {
        // If this was the last expense in this category, we might suggest removing it
        const hasMoreExpensesInCategory = expenses.some(
          expense => expense.category === expenseToDelete.category && expense._id !== expenseId
        );
        
        if (hasMoreExpensesInCategory) {
          // Still has expenses but no budget
          showBudgetUpdateAlert(expenseToDelete.category, true);
        } else {
          // Simple notification, no need to create budget for empty category
          showBudgetUpdateAlert(expenseToDelete.category);
        }
      }
      
    } catch (error) {
      console.error("Error deleting expense:", error);
    }
  };
  
  const handleDeleteIncome = async (incomeId) => {
    try {
      await deleteIncome(incomeId);
      setShowActionMenu(null);
    } catch (error) {
      console.error("Error deleting income:", error);
    }
  };
  
  const toggleActionMenu = (expenseId) => {
    if (showActionMenu === expenseId) {
      setShowActionMenu(null);
    } else {
      setShowActionMenu(expenseId);
    }
  };
  
  const handleViewTransactionDetails = (transaction) => {
    
    // Make a clean copy of the transaction to ensure we're not affected by any references
    const transactionCopy = {
      ...transaction,
      // Use a default payment method based on transaction type if missing
      paymentMethod: transaction.paymentMethod || 
        (transaction.transactionType === 'income' ? "Bank Transfer" : "Cash")
    };
    
    setSelectedTransaction(transactionCopy);
    setShowDetailsModal(true);
    setShowActionMenu(null);
  };

  const handleBudgetClick = (budgetId) => {
    // Navigate to budget details or open edit modal
    if (budgetId) {
      navigate(`/budget?id=${budgetId}`);
    } else {
      navigate('/budget');
    }
  };

  // Display a notification and highlight the budget that was updated
  const showBudgetUpdateAlert = (category, isUnbudgetedCategory = false) => {
    // Clear any existing timeout
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }
    
    // Set the category and show the notification
    setUpdatedBudgetCategory(category);
    setShowBudgetUpdateNotification(true);
    
    // If this is an unbudgeted category, prompt to create a budget for it
    if (isUnbudgetedCategory || !findBudgetForCategory(category)) {
      const shouldCreateBudget = window.confirm(
        `No budget found for "${category}" expenses. Would you like to create a budget for this category?`
      );
      
      if (shouldCreateBudget) {
        navigate('/budget', { state: { suggestedCategory: category } });
        return;
      }
    }
    
    // Auto-hide the notification after 5 seconds
    notificationTimeoutRef.current = setTimeout(() => {
      setShowBudgetUpdateNotification(false);
      setUpdatedBudgetCategory(null);
    }, 5000);
  };
  
  // Clean up timeout on component unmount
  useEffect(() => {
    return () => {
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
      }
    };
  }, []);

  // Get CSS classes for budget items that have been recently updated
  const getBudgetItemClasses = (budget) => {
    const isUpdated = budget.category === updatedBudgetCategory || 
                      (updatedBudgetCategory && budget.category === 'Overall');
    
    let baseClasses = "cursor-pointer hover:bg-gray-50 p-2 rounded-md transition";
    
    if (isUpdated && showBudgetUpdateNotification) {
      return `${baseClasses} bg-blue-50 border border-blue-200 animate-pulse`;
    }
    
    return baseClasses;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Budget update notification */}
        {showBudgetUpdateNotification && (
          <div className={`fixed bottom-4 right-4 ${
            findBudgetForCategory(updatedBudgetCategory) 
              ? "bg-blue-500"
              : "bg-red-500"
          } text-white px-4 py-3 rounded-lg shadow-lg z-50 animate-bounce`}>
            <div className="flex items-center">
              {findBudgetForCategory(updatedBudgetCategory) ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              )}
              <span>
                {updatedBudgetCategory ? (
                  findBudgetForCategory(updatedBudgetCategory) ? 
                    `${updatedBudgetCategory} budget updated!` : 
                    `Added expense to unbudgeted category: ${updatedBudgetCategory}`
                ) : 'Budget updated!'}
              </span>
            </div>
          </div>
        )}
        
        {/* Welcome Section */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-md p-8 mb-8 border border-blue-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-blue-200 rounded-full -mt-20 -mr-20 opacity-20"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-200 rounded-full -mb-16 -ml-16 opacity-20"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-700">
                Welcome to ExpenseTracker
              </h1>
              <p className="text-gray-600 mt-3 max-w-xl text-lg">
                Take control of your finances with our easy-to-use tracking tools and insights.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Track Expenses
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Set Budgets
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Generate Reports
                </span>
              </div>
            </div>
            <div className="hidden md:block">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-32 w-32 text-blue-400 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Balance Card */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg shadow-lg p-6 mb-8 text-white">
          <h2 className="text-xl font-semibold opacity-90">Current Balance</h2>
          <p className="text-4xl font-bold mt-2">${currentBalance.toFixed(2)}</p>
          <div className="mt-4 flex space-x-3">
            <button 
              onClick={handleOpenIncomeModal}
              className="bg-white text-blue-600 px-4 py-2 rounded-md font-medium hover:bg-blue-50 transition">Add Income</button>
            <button 
              onClick={() => handleOpenExpenseModal()}
              className="bg-blue-400 bg-opacity-30 text-white px-4 py-2 rounded-md font-medium hover:bg-opacity-40 transition">
              Add Expense
            </button>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Recent Transactions */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Recent Transactions</h2>
              <button 
                onClick={() => setShowAllTransactionsModal(true)}
                className="text-blue-500 hover:text-blue-700 text-sm font-medium">
                View All
              </button>
            </div>
            {recentTransactions.length > 0 ? (
              <div className="space-y-3">
                {recentTransactions.map(transaction => (
                  <div 
                    key={transaction._id || transaction.id} 
                    className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-md transition relative"
                    onClick={() => toggleActionMenu(transaction._id || transaction.id)}
                  >
                    <div>
                      <h3 className="font-medium flex items-center">
                        {transaction.title}
                        {transaction.transactionType === 'income' && (
                          <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-800">
                            Income
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {new Date(transaction.date).toLocaleDateString()} • {transaction.category}
                      </p>
                    </div>
                    <span className={`font-semibold ${transaction.transactionType === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.transactionType === 'income' ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
                    </span>
                    
                    {/* Action Menu */}
                    {showActionMenu === (transaction._id || transaction.id) && (
                      <div className="absolute right-0 top-full mt-1 bg-white shadow-lg rounded-md border border-gray-200 z-10">
                        {transaction.transactionType === 'expense' ? (
                          <>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenExpenseModal(transaction);
                                setShowActionMenu(null);
                              }}
                              className="w-full text-left px-4 py-2 hover:bg-gray-100 transition flex items-center"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Edit
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteExpense(transaction._id || transaction.id);
                              }}
                              className="w-full text-left px-4 py-2 hover:bg-gray-100 transition flex items-center text-red-600"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Delete
                            </button>
                          </>
                        ) : (
                          <>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewTransactionDetails(transaction);
                              }}
                              className="w-full text-left px-4 py-2 hover:bg-gray-100 transition flex items-center"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              View Details
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenIncomeModal(transaction);
                                setShowActionMenu(null);
                              }}
                              className="w-full text-left px-4 py-2 hover:bg-gray-100 transition flex items-center"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Edit
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteIncome(transaction._id || transaction.id);
                              }}
                              className="w-full text-left px-4 py-2 hover:bg-gray-100 transition flex items-center text-red-600"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-center">No transactions yet</p>
                <div className="mt-4 flex space-x-4">
                  <button 
                    onClick={() => handleOpenExpenseModal()} 
                    className="text-red-500 hover:text-red-700 font-medium flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Add Expense
                  </button>
                  <button 
                    onClick={() => handleOpenIncomeModal()} 
                    className="text-green-500 hover:text-green-700 font-medium flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Add Income
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Budget Overview */}
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
        </div>

        {/* Add Expense Modal */}
        {showExpenseModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-auto my-8 overflow-hidden transform transition-all">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-red-500 to-rose-600 px-6 py-4 text-white">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">{isEditMode ? 'Edit Expense' : 'Add New Expense'}</h3>
                  <button onClick={handleCloseExpenseModal} className="focus:outline-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {/* Modal Body */}
              <form onSubmit={handleSubmitExpense} className="p-4 sm:p-6 overflow-y-auto max-h-[80vh]">
                <div className="space-y-4">
                  {/* Title Input */}
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                      Expense Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="title"
                      name="title"
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
                      placeholder="What did you spend on?"
                      value={newExpense.title}
                      onChange={handleExpenseInputChange}
                    />
                  </div>

                  {/* Amount Input */}
                  <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                      Amount <span className="text-red-500">*</span>
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
                        className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
                        placeholder="0.00"
                        value={newExpense.amount}
                        onChange={handleExpenseInputChange}
                      />
                    </div>
                  </div>

                  {/* Two column layout for category and date */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Category Select */}
                    <div>
                      <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                        Category <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="category"
                        name="category"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
                        value={newExpense.category}
                        onChange={handleExpenseInputChange}
                      >
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

                    {/* Date Input */}
                    <div>
                      <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                        Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="date"
                        name="date"
                        type="date"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
                        value={newExpense.date}
                        onChange={handleExpenseInputChange}
                      />
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div>
                    <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-1">
                      Payment Method
                    </label>
                    <select
                      id="paymentMethod"
                      name="paymentMethod"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
                      value={newExpense.paymentMethod}
                      onChange={handleExpenseInputChange}
                    >
                      <option value="Cash">Cash</option>
                      <option value="Credit Card">Credit Card</option>
                      <option value="Debit Card">Debit Card</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Mobile Payment">Mobile Payment</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* Description */}
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
                      placeholder="Optional details about this expense"
                      value={newExpense.description}
                      onChange={handleExpenseInputChange}
                    ></textarea>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex items-center justify-end space-x-3">
                  <button
                    type="button"
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    onClick={handleCloseExpenseModal}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    {isEditMode ? 'Update Expense' : 'Save Expense'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Transaction Details Modal */}
        {showDetailsModal && selectedTransaction && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-auto my-8 overflow-hidden transform transition-all">
              {/* Modal Header */}
              <div className={`px-6 py-4 text-white ${selectedTransaction.transactionType === 'income' ? 'bg-gradient-to-r from-green-500 to-teal-600' : 'bg-gradient-to-r from-red-500 to-rose-600'}`}>
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">
                    {selectedTransaction.transactionType === 'income' ? 'Income' : 'Expense'} Details
                  </h3>
                  <button onClick={() => setShowDetailsModal(false)} className="focus:outline-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {/* Modal Body */}
              <div className="p-4 sm:p-6 overflow-y-auto max-h-[80vh]">
                {/* Transaction Title and Amount */}
                <div className="mb-6 flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-800">{selectedTransaction.title || "Untitled"}</h2>
                  <span className={`text-lg font-bold ${selectedTransaction.transactionType === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {selectedTransaction.transactionType === 'income' ? '+' : '-'}${Math.abs(selectedTransaction.amount || 0).toFixed(2)}
                  </span>
                </div>
                
                <div className="space-y-4 text-gray-700">
                  {/* Transaction Type */}
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-medium">Type:</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${selectedTransaction.transactionType === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {selectedTransaction.transactionType === 'income' ? 'Income' : 'Expense'}
                    </span>
                  </div>
                  
                  {/* Date */}
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-medium">Date:</span>
                    <span>{selectedTransaction.date ? new Date(selectedTransaction.date).toLocaleDateString() : "Not specified"}</span>
                  </div>
                  
                  {/* Category */}
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-medium">Category:</span>
                    <span className="px-2.5 py-0.5 rounded-full text-sm bg-gray-100">
                      {selectedTransaction.category || "Uncategorized"}
                    </span>
                  </div>
                  
                  {/* Source - for income only */}
                  {selectedTransaction.transactionType === 'income' && (
                    <div className="flex justify-between border-b pb-2">
                      <span className="font-medium">Source:</span>
                      <span>{selectedTransaction.source || "Not specified"}</span>
                    </div>
                  )}
                  
                  {/* Payment Method */}
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-medium">Payment Method:</span>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      selectedTransaction.paymentMethod === 'Cash' ? 'bg-yellow-50 text-yellow-700' :
                      selectedTransaction.paymentMethod === 'Credit Card' ? 'bg-blue-50 text-blue-700' :
                      selectedTransaction.paymentMethod === 'Debit Card' ? 'bg-purple-50 text-purple-700' :
                      selectedTransaction.paymentMethod === 'Bank Transfer' ? 'bg-green-50 text-green-700' :
                      selectedTransaction.paymentMethod === 'Mobile Payment' ? 'bg-pink-50 text-pink-700' :
                      selectedTransaction.paymentMethod === 'Check' ? 'bg-indigo-50 text-indigo-700' :
                      'bg-gray-50 text-gray-700'
                    }`}>
                      {selectedTransaction.paymentMethod || "Not specified"}
                    </span>
                  </div>
                  
                  {/* Created/Updated timestamps if available */}
                  {(selectedTransaction.createdAt || selectedTransaction.updatedAt) && (
                    <div className="flex justify-between border-b pb-2">
                      <span className="font-medium">
                        {selectedTransaction.updatedAt ? "Last Updated:" : "Created:"}
                      </span>
                      <span className="text-sm text-gray-500">
                        {selectedTransaction.updatedAt 
                          ? new Date(selectedTransaction.updatedAt).toLocaleString() 
                          : new Date(selectedTransaction.createdAt).toLocaleString()}
                      </span>
                    </div>
                  )}
                  
                  {/* Description */}
                  <div className="pt-2">
                    <p className="font-medium mb-1">Description:</p>
                    <p className="text-gray-600 bg-gray-50 p-3 rounded-md">
                      {selectedTransaction.description || "No description provided"}
                    </p>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="mt-6 flex justify-between">
                  <div>
                    <button
                      onClick={() => {
                        setShowDetailsModal(false);
                        if (selectedTransaction.transactionType === 'income') {
                          handleOpenIncomeModal(selectedTransaction);
                        } else {
                          handleOpenExpenseModal(selectedTransaction);
                        }
                      }}
                      className={`px-4 py-2 rounded-md text-white mr-2 ${
                        selectedTransaction.transactionType === 'income'
                          ? 'bg-green-500 hover:bg-green-600'
                          : 'bg-red-500 hover:bg-red-600'
                      } transition`}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to delete this ${selectedTransaction.transactionType}?`)) {
                          if (selectedTransaction.transactionType === 'income') {
                            handleDeleteIncome(selectedTransaction._id || selectedTransaction.id);
                          } else {
                            handleDeleteExpense(selectedTransaction._id || selectedTransaction.id);
                          }
                          setShowDetailsModal(false);
                        }
                      }}
                      className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-800 transition"
                    >
                      Delete
                    </button>
                  </div>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Income Modal */}
        {showIncomeModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-auto my-8 overflow-hidden transform transition-all">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-green-500 to-teal-600 px-6 py-4 text-white">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">{isEditMode ? 'Edit Income' : 'Add New Income'}</h3>
                  <button onClick={handleCloseIncomeModal} className="focus:outline-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {/* Modal Body */}
              <form onSubmit={handleSubmitIncome} className="p-4 sm:p-6 overflow-y-auto max-h-[80vh]">
                <div className="space-y-4">
                  {/* Title Input */}
                  <div>
                    <label htmlFor="income-title" className="block text-sm font-medium text-gray-700 mb-1">
                      Income Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="income-title"
                      name="title"
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                      placeholder="Salary, Freelance, etc."
                      value={newIncome.title}
                      onChange={(e) => handleIncomeInputChange("title", e.target.value)}
                    />
                  </div>

                  {/* Amount Input */}
                  <div>
                    <label htmlFor="income-amount" className="block text-sm font-medium text-gray-700 mb-1">
                      Amount <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        id="income-amount"
                        name="amount"
                        type="number"
                        min="0"
                        step="0.01"
                        required
                        className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                        placeholder="0.00"
                        value={newIncome.amount}
                        onChange={(e) => handleIncomeInputChange("amount", e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Two column layout for category and date */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Category Select */}
                    <div>
                      <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                        Category <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="category"
                        name="category"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                        value={newIncome.category}
                        onChange={(e) => handleIncomeInputChange("category", e.target.value)}
                      >
                        <option value="Salary">Salary</option>
                        <option value="Freelance">Freelance</option>
                        <option value="Investments">Investments</option>
                        <option value="Business">Business</option>
                        <option value="Gifts">Gifts</option>
                        <option value="Refunds">Refunds</option>
                        <option value="Rental">Rental</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    {/* Source Input */}
                    <div>
                      <label htmlFor="source" className="block text-sm font-medium text-gray-700 mb-1">
                        Source
                      </label>
                      <input
                        id="source"
                        name="source"
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                        placeholder="Company name, platform, etc."
                        value={newIncome.source}
                        onChange={(e) => handleIncomeInputChange("source", e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Date and Payment Method */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Date Input */}
                    <div>
                      <label htmlFor="income-date" className="block text-sm font-medium text-gray-700 mb-1">
                        Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="income-date"
                        name="date"
                        type="date"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                        value={newIncome.date}
                        onChange={(e) => handleIncomeInputChange("date", e.target.value)}
                      />
                    </div>

                    {/* Payment Method */}
                    <div className="mb-4">
                      <label className="block text-gray-700 font-medium mb-2" htmlFor="paymentMethod">
                        Payment Method <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="paymentMethod"
                        name="paymentMethod"
                        className="w-full px-4 py-2 border rounded-lg bg-white text-gray-700 focus:border-blue-500 focus:outline-none"
                        value={newIncome.paymentMethod || "Bank Transfer"}
                        onChange={(e) => {
                          handleIncomeInputChange("paymentMethod", e.target.value);
                        }}
                        required
                      >
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="Cash">Cash</option>
                        <option value="Credit Card">Credit Card</option>
                        <option value="Debit Card">Debit Card</option>
                        <option value="PayPal">PayPal</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label htmlFor="income-description" className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      id="income-description"
                      name="description"
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                      placeholder="Optional details about this income"
                      value={newIncome.description}
                      onChange={(e) => handleIncomeInputChange("description", e.target.value)}
                    ></textarea>
                  </div>
                </div>

                {/* Add this after the payment method dropdown in the income modal */}
                {newIncome.paymentMethod && (
                  <div className="mt-1 text-sm text-gray-500">
                    Selected payment method: "{newIncome.paymentMethod}"
                  </div>
                )}

                {/* Action Buttons */}
                <div className="mt-6 flex items-center justify-end space-x-3">
                  <button
                    type="button"
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    onClick={handleCloseIncomeModal}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    {isEditMode ? 'Update Income' : 'Save Income'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* All Transactions Modal */}
        {showAllTransactionsModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-auto">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4 text-white sticky top-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">All Transactions</h3>
                  <button onClick={() => setShowAllTransactionsModal(false)} className="focus:outline-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {/* Filter and Search Bar */}
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
                  <div className="flex items-center space-x-2">
                    <button 
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${transactionFilter === 'all' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                      onClick={() => setTransactionFilter('all')}
                    >
                      All
                    </button>
                    <button 
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${transactionFilter === 'income' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                      onClick={() => setTransactionFilter('income')}
                    >
                      Income
                    </button>
                    <button 
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${transactionFilter === 'expense' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                      onClick={() => setTransactionFilter('expense')}
                    >
                      Expenses
                    </button>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search transactions..."
                        className="pl-9 pr-3 py-1.5 w-full md:w-64 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    
                    <select 
                      className="pl-3 pr-8 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm appearance-none bg-white"
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value)}
                    >
                      <option value="newest">Newest first</option>
                      <option value="oldest">Oldest first</option>
                      <option value="highest">Highest amount</option>
                      <option value="lowest">Lowest amount</option>
                    </select>
                  </div>
                </div>
              </div>
              
              {/* Transactions List */}
              <div className="overflow-y-auto max-h-[60vh]">
                <div className="px-6 py-2">
                  <div className="grid grid-cols-12 text-xs font-medium text-gray-500 uppercase tracking-wider py-2 border-b border-gray-200">
                    <div className="col-span-4">Title</div>
                    <div className="col-span-2">Date</div>
                    <div className="col-span-2">Category</div>
                    <div className="col-span-2">Amount</div>
                    <div className="col-span-2 text-right">Actions</div>
                  </div>
                  
                  {getFilteredTransactions().length > 0 ? (
                    getFilteredTransactions().map((transaction) => (
                      <div key={transaction._id || transaction.id} className="grid grid-cols-12 py-3 border-b border-gray-100 hover:bg-gray-50 text-sm">
                        <div className="col-span-4 flex items-center">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center mr-3 ${transaction.transactionType === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                            {transaction.transactionType === 'income' ? (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                              </svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                              </svg>
                            )}
                          </div>
                          <span className="truncate font-medium">{transaction.title}</span>
                        </div>
                        <div className="col-span-2 flex items-center text-gray-600">
                          {new Date(transaction.date).toLocaleDateString()}
                        </div>
                        <div className="col-span-2 flex items-center">
                          <span className={`px-2 py-1 rounded-full text-xs ${transaction.transactionType === 'income' ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'}`}>
                            {transaction.category}
                          </span>
                        </div>
                        <div className="col-span-2 flex items-center font-medium">
                          <span className={transaction.transactionType === 'income' ? 'text-green-600' : 'text-red-600'}>
                            {transaction.transactionType === 'income' ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
                          </span>
                        </div>
                        <div className="col-span-2 flex items-center justify-end space-x-2">
                          <button 
                            onClick={() => {
                              handleViewTransactionDetails(transaction);
                              setShowAllTransactionsModal(false);
                            }}
                            className="p-1.5 rounded-md hover:bg-gray-200 transition"
                            title="View Details"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button 
                            onClick={() => {
                              if (transaction.transactionType === 'income') {
                                handleOpenIncomeModal(transaction);
                              } else {
                                handleOpenExpenseModal(transaction);
                              }
                              setShowAllTransactionsModal(false);
                            }}
                            className="p-1.5 rounded-md hover:bg-gray-200 transition"
                            title="Edit"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button 
                            onClick={() => {
                              if (transaction.transactionType === 'income') {
                                handleDeleteIncome(transaction._id || transaction.id);
                              } else {
                                handleDeleteExpense(transaction._id || transaction.id);
                              }
                            }}
                            className="p-1.5 rounded-md hover:bg-gray-200 transition"
                            title="Delete"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center text-gray-500">
                      {searchQuery ? 
                        "No transactions match your search." : 
                        "No transactions found. Add some transactions to see them here!"}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Modal Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  {getFilteredTransactions().length} transaction{getFilteredTransactions().length !== 1 ? 's' : ''} found
                </div>
                <button
                  onClick={() => setShowAllTransactionsModal(false)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;
