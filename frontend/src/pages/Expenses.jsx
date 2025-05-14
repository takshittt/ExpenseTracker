import React, { useState, useContext, useEffect } from "react";
import Navbar from "../components/Navbar";
import { ExpensesDataContext } from "../context/ExpensesContext";

// Import components
import ExpenseFilters from "../components/expenses/ExpenseFilters";
import ExpenseList from "../components/expenses/ExpenseList";
import ExpenseSummary from "../components/expenses/ExpenseSummary";
import ExpenseModal from "../components/expenses/ExpenseModal";
import TransactionDetailsModal from "../components/transactions/TransactionDetailsModal";

const Expenses = () => {
  const { expenses, fetchExpenses, createExpense, updateExpense, deleteExpense } = useContext(ExpensesDataContext);
  
  // State for filters
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("dateDesc");
  const [dateFilter, setDateFilter] = useState("all");
  
  // State for modals
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  
  // New expense state
  const [newExpense, setNewExpense] = useState({
    title: "",
    amount: "",
    date: new Date().toISOString().split('T')[0],
    category: "",
    paymentMethod: "Cash",
    description: "",
    recurring: false,
    recurringFrequency: "monthly"
  });
  
  // Fetch expenses on component mount
  useEffect(() => {
    fetchExpenses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Get unique categories from expenses
  const getUniqueCategories = () => {
    if (!expenses) return [];
    return [...new Set(expenses.map(expense => expense.category))].filter(Boolean);
  };
  
  // Filter and sort expenses based on user selections
  const getFilteredExpenses = () => {
    if (!expenses) return [];
    
    let filtered = [...expenses];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(expense => 
        expense.title?.toLowerCase().includes(query) ||
        expense.category?.toLowerCase().includes(query) ||
        expense.description?.toLowerCase().includes(query)
      );
    }
    
    // Apply category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter(expense => expense.category === categoryFilter);
    }
    
    // Apply date filter
    if (dateFilter !== "all") {
      const now = new Date();
      let filterDate;
      
      switch (dateFilter) {
        case "today":
          filterDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          filtered = filtered.filter(expense => {
            const expenseDate = new Date(expense.date);
            return expenseDate >= filterDate;
          });
          break;
        case "thisWeek":
          filterDate = new Date(now);
          filterDate.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
          filtered = filtered.filter(expense => {
            const expenseDate = new Date(expense.date);
            return expenseDate >= filterDate;
          });
          break;
        case "thisMonth":
          filterDate = new Date(now.getFullYear(), now.getMonth(), 1);
          filtered = filtered.filter(expense => {
            const expenseDate = new Date(expense.date);
            return expenseDate >= filterDate;
          });
          break;
        case "last3Months":
          filterDate = new Date(now);
          filterDate.setMonth(now.getMonth() - 3);
          filtered = filtered.filter(expense => {
            const expenseDate = new Date(expense.date);
            return expenseDate >= filterDate;
          });
          break;
        case "thisYear":
          filterDate = new Date(now.getFullYear(), 0, 1);
          filtered = filtered.filter(expense => {
            const expenseDate = new Date(expense.date);
            return expenseDate >= filterDate;
          });
          break;
        default:
          break;
      }
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortOrder) {
        case "dateDesc":
          return new Date(b.date) - new Date(a.date);
        case "dateAsc":
          return new Date(a.date) - new Date(b.date);
        case "amountDesc":
          return b.amount - a.amount;
        case "amountAsc":
          return a.amount - b.amount;
        case "titleAsc":
          return a.title.localeCompare(b.title);
        case "titleDesc":
          return b.title.localeCompare(a.title);
        default:
          return new Date(b.date) - new Date(a.date);
      }
    });
    
    return filtered;
  };
  
  // Handle opening expense modal
  const handleOpenExpenseModal = (expense = null) => {
    if (expense) {
      setIsEditMode(true);
      setSelectedExpense(expense);
      setNewExpense({
        title: expense.title || "",
        amount: expense.amount?.toString() || "",
        date: expense.date ? new Date(expense.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        category: expense.category || "",
        paymentMethod: expense.paymentMethod || "Cash",
        description: expense.description || "",
        recurring: expense.recurring || false,
        recurringFrequency: expense.recurringFrequency || "monthly"
      });
    } else {
      setIsEditMode(false);
      setSelectedExpense(null);
      setNewExpense({
        title: "",
        amount: "",
        date: new Date().toISOString().split('T')[0],
        category: "",
        paymentMethod: "Cash",
        description: "",
        recurring: false,
        recurringFrequency: "monthly"
      });
    }
    setShowExpenseModal(true);
  };
  
  // Handle closing expense modal
  const handleCloseExpenseModal = () => {
    setShowExpenseModal(false);
    setIsEditMode(false);
    setSelectedExpense(null);
  };
  
  // Handle expense input changes
  const handleExpenseInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewExpense({
      ...newExpense,
      [name]: type === "checkbox" ? checked : value
    });
  };
  
  // Handle expense submission
  const handleSubmitExpense = async (e) => {
    e.preventDefault();
    
    try {
      const expenseData = {
        title: newExpense.title,
        amount: parseFloat(newExpense.amount),
        date: new Date(newExpense.date),
        category: newExpense.category,
        paymentMethod: newExpense.paymentMethod,
        description: newExpense.description,
        recurring: newExpense.recurring,
        recurringFrequency: newExpense.recurring ? newExpense.recurringFrequency : null
      };
      
      if (isEditMode && selectedExpense) {
        await updateExpense(selectedExpense._id || selectedExpense.id, expenseData);
      } else {
        await createExpense(expenseData);
      }
      
      handleCloseExpenseModal();
    } catch (error) {
      console.error("Error saving expense:", error);
    }
  };
  
  // Handle expense deletion
  const handleDeleteExpense = async (expenseId) => {
    if (window.confirm("Are you sure you want to delete this expense?")) {
      try {
        await deleteExpense(expenseId);
        setShowDetailsModal(false);
      } catch (error) {
        console.error("Error deleting expense:", error);
      }
    }
  };
  
  // Handle viewing expense details
  const handleViewDetails = (expense) => {
    setSelectedExpense({
      ...expense,
      transactionType: "expense"
    });
    setShowDetailsModal(true);
  };
  
  const filteredExpenses = getFilteredExpenses();
  const uniqueCategories = getUniqueCategories();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Expense Management</h1>
            <p className="text-gray-600 mt-1">Track and manage your expenses</p>
          </div>
          <button
            onClick={() => handleOpenExpenseModal()}
            className="mt-4 md:mt-0 px-4 py-2 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-md shadow-sm hover:from-red-600 hover:to-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add New Expense
            </div>
          </button>
        </div>
        
        {/* Expense Summary */}
        <ExpenseSummary expenses={expenses} />
        
        {/* Filters */}
        <ExpenseFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
          categories={uniqueCategories}
        />
        
        {/* Expense List */}
        <ExpenseList
          expenses={filteredExpenses}
          handleOpenExpenseModal={handleOpenExpenseModal}
          handleDeleteExpense={handleDeleteExpense}
          handleViewDetails={handleViewDetails}
        />
      </main>
      
      {/* Expense Modal */}
      <ExpenseModal
        showExpenseModal={showExpenseModal}
        isEditMode={isEditMode}
        newExpense={newExpense}
        handleCloseExpenseModal={handleCloseExpenseModal}
        handleExpenseInputChange={handleExpenseInputChange}
        handleSubmitExpense={handleSubmitExpense}
      />
      
      {/* Transaction Details Modal */}
      <TransactionDetailsModal
        showDetailsModal={showDetailsModal}
        selectedTransaction={selectedExpense}
        setShowDetailsModal={setShowDetailsModal}
        handleOpenIncomeModal={() => {}}
        handleOpenExpenseModal={handleOpenExpenseModal}
        handleDeleteIncome={() => {}}
        handleDeleteExpense={handleDeleteExpense}
      />
    </div>
  );
};

export default Expenses;
