import React, { useState, useContext, useEffect, useRef } from "react";
import Navbar from "../components/Navbar";
import { ExpensesDataContext } from "../context/ExpensesContext";
import { IncomeDataContext } from "../context/incomeContext.jsx";
import { BudgetDataContext } from "../context/BudgetContext.jsx";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

// Import components
import WelcomeSection from "../components/home/WelcomeSection";
import BalanceCard from "../components/home/BalanceCard";
import RecentTransactions from "../components/home/RecentTransactions";
import MonthlyBudget from "../components/home/MonthlyBudget";
import BudgetUpdateNotification from "../components/home/BudgetUpdateNotification";
import ExpenseModal from "../components/expenses/ExpenseModal";
import IncomeModal from "../components/income/IncomeModal";
import TransactionDetailsModal from "../components/transactions/TransactionDetailsModal";
import AllTransactionsModal from "../components/transactions/AllTransactionsModal";

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
        await updateIncome(selectedIncome.id, incomeData);
      } else {
        // Add new income
        await addIncome(incomeData);
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
        {/* Budget Update Notification */}
        <BudgetUpdateNotification 
          showBudgetUpdateNotification={showBudgetUpdateNotification}
          updatedBudgetCategory={updatedBudgetCategory}
          findBudgetForCategory={findBudgetForCategory}
        />
        
        {/* Welcome Section */}
        <WelcomeSection />

        {/* Balance Card */}
        <BalanceCard 
          currentBalance={currentBalance}
          handleOpenIncomeModal={handleOpenIncomeModal}
          handleOpenExpenseModal={handleOpenExpenseModal}
        />

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Recent Transactions */}
          <RecentTransactions 
            recentTransactions={recentTransactions}
            toggleActionMenu={toggleActionMenu}
            showActionMenu={showActionMenu}
            handleOpenExpenseModal={handleOpenExpenseModal}
            handleOpenIncomeModal={handleOpenIncomeModal}
            handleDeleteExpense={handleDeleteExpense}
            handleDeleteIncome={handleDeleteIncome}
            handleViewTransactionDetails={handleViewTransactionDetails}
            setShowAllTransactionsModal={setShowAllTransactionsModal}
          />

          {/* Budget Overview */}
          <MonthlyBudget 
            monthlyBudget={monthlyBudget}
            handleBudgetClick={handleBudgetClick}
            getBudgetItemClasses={getBudgetItemClasses}
          />
        </div>

        {/* Modals */}
        <ExpenseModal 
          showExpenseModal={showExpenseModal}
          isEditMode={isEditMode}
          newExpense={newExpense}
          handleCloseExpenseModal={handleCloseExpenseModal}
          handleExpenseInputChange={handleExpenseInputChange}
          handleSubmitExpense={handleSubmitExpense}
        />

        <IncomeModal 
          showIncomeModal={showIncomeModal}
          isEditMode={isEditMode}
          newIncome={newIncome}
          handleCloseIncomeModal={handleCloseIncomeModal}
          handleIncomeInputChange={handleIncomeInputChange}
          handleSubmitIncome={handleSubmitIncome}
        />

        <TransactionDetailsModal 
          showDetailsModal={showDetailsModal}
          selectedTransaction={selectedTransaction}
          setShowDetailsModal={setShowDetailsModal}
          handleOpenIncomeModal={handleOpenIncomeModal}
          handleOpenExpenseModal={handleOpenExpenseModal}
          handleDeleteIncome={handleDeleteIncome}
          handleDeleteExpense={handleDeleteExpense}
        />

        <AllTransactionsModal 
          showAllTransactionsModal={showAllTransactionsModal}
          setShowAllTransactionsModal={setShowAllTransactionsModal}
          transactionFilter={transactionFilter}
          setTransactionFilter={setTransactionFilter}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          getFilteredTransactions={getFilteredTransactions}
          handleViewTransactionDetails={handleViewTransactionDetails}
          handleOpenIncomeModal={handleOpenIncomeModal}
          handleOpenExpenseModal={handleOpenExpenseModal}
          handleDeleteIncome={handleDeleteIncome}
          handleDeleteExpense={handleDeleteExpense}
        />
      </main>
    </div>
  );
};

export default Home;
