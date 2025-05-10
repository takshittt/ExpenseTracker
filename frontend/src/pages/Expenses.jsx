import React, { useState, useEffect, useContext, useCallback } from 'react';
import Navbar from '../components/Navbar';
import { ExpensesDataContext } from '../context/ExpensesContext';
import axios from 'axios';

const Expenses = () => {
    const { expenses, loading, error, fetchExpenses, deleteExpense, updateExpense } = useContext(ExpensesDataContext);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [currentExpense, setCurrentExpense] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        category: 'Other',
        description: '',
        paymentMethod: 'Cash'
    });

    // Fetch expenses on component mount
    useEffect(() => {
        fetchExpenses();
    }, [fetchExpenses]);

    // Filter expenses based on search term
    const filteredExpenses = expenses.filter(expense => 
        expense.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Handle expense deletion
    const handleDelete = async (id) => {
        try {
            const response = await axios.delete(`/expenses/${id}`);
            if (response.status === 200) {
                deleteExpense(id);
            }
        } catch (err) {
            console.error('Failed to delete expense:', err);
            alert('Failed to delete expense. Please try again later.');
        }
    };

    // Open edit modal with expense data
    const handleEditClick = (expense) => {
        setCurrentExpense(expense);
        setFormData({
            title: expense.title || '',
            amount: expense.amount || '',
            date: expense.date ? new Date(expense.date).toISOString().split('T')[0] : '',
            category: expense.category || '',
            description: expense.description || '',
            paymentMethod: expense.paymentMethod || 'Cash'
        });
        setShowEditModal(true);
    };

    // Open add modal with empty form
    const handleAddClick = () => {
        setFormData({
            title: '',
            amount: '',
            date: new Date().toISOString().split('T')[0],
            category: 'Other',
            description: '',
            paymentMethod: 'Cash'
        });
        setShowAddModal(true);
    };

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    // Submit expense creation
    const handleAddSubmit = async (e) => {
        e.preventDefault();
        try {
            const expenseData = {
                title: formData.title,
                amount: parseFloat(formData.amount),
                category: formData.category,
                description: formData.description,
                date: new Date(formData.date),
                paymentMethod: formData.paymentMethod
            };
            
            const config = {
                withCredentials: true,
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            };

            const response = await axios.post('/expenses', expenseData, config);
            if (response.status === 201) {
                fetchExpenses(); // Refresh the list with the latest expenses
                setShowAddModal(false);
            }
        } catch (err) {
            console.error('Failed to add expense:', err);
            alert('Failed to add expense. Please try again later.');
        }
    };

    // Submit expense update
    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            const expenseData = {
                title: formData.title,
                amount: parseFloat(formData.amount),
                category: formData.category,
                description: formData.description,
                date: new Date(formData.date),
                paymentMethod: formData.paymentMethod
            };
            
            const config = {
                withCredentials: true,
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            };

            const response = await axios.put(`/expenses/${currentExpense._id || currentExpense.id}`, expenseData, config);
            if (response.status === 200) {
                updateExpense(response.data.data);
                setShowEditModal(false);
            }
        } catch (err) {
            console.error('Failed to update expense:', err);
            alert('Failed to update expense. Please try again later.');
        }
    };

    return (
        <div> 
            <Navbar />

            <div className="bg-gray-50 min-h-screen">
                {/* Main Content */}
                <div className="container mx-auto px-4 py-8">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-8">
                        <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Your Expenses</h1>
                        <div className="relative w-full md:w-64">
                            <input
                                type="text"
                                placeholder="Search expenses..."
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <svg
                                className="absolute right-3 top-2.5 h-5 w-5 text-gray-400"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </div>
                    </div>

                    {/* Loading and Error States */}
                    {loading && (
                        <div className="text-center py-10">
                            <svg className="animate-spin h-10 w-10 text-blue-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <p className="text-gray-600">Loading expenses...</p>
                        </div>
                    )}

                    {error && !loading && (
                        <div className="text-center py-10">
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                                <strong className="font-bold">Error: </strong>
                                <span className="block sm:inline">{error}</span>
                            </div>
                        </div>
                    )}

                    {/* Expense Cards */}
                    {!loading && !error && (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {filteredExpenses.length > 0 ? (
                                filteredExpenses.map((expense) => (
                                    <div
                                        key={expense._id || expense.id}
                                        className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300"
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <h2 className="text-lg font-semibold text-gray-800">{expense.title}</h2>
                                            <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                                {expense.category}
                                            </span>
                                        </div>
                                        {expense.description && (
                                            <p className="text-gray-600 mb-4 text-sm">{expense.description}</p>
                                        )}
                                        <div className="flex items-center justify-between">
                                            <p className="text-2xl font-bold text-gray-900">
                                                ${parseFloat(expense.amount).toFixed(2)}
                                            </p>
                                            <div className="text-right">
                                                <p className="text-sm text-gray-500">
                                                    {new Date(expense.date).toLocaleDateString()}
                                                </p>
                                                {expense.paymentMethod && (
                                                    <p className="text-xs text-gray-400 mt-1">
                                                        {expense.paymentMethod}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="mt-4 flex justify-end space-x-2">
                                            <button 
                                                className="p-2 text-blue-500 hover:text-blue-700"
                                                onClick={() => handleEditClick(expense)}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                                </svg>
                                            </button>
                                            <button 
                                                className="p-2 text-red-500 hover:text-red-700"
                                                onClick={() => handleDelete(expense._id || expense.id)}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full text-center py-10">
                                    <p className="text-gray-500 text-lg">No expenses found matching your search.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Summary Section */}
                    {!loading && !error && filteredExpenses.length > 0 && (
                        <div className="mt-10 bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">Expense Summary</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-500">Total Expenses</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        ${filteredExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0).toFixed(2)}
                                    </p>
                                </div>
                                <div className="bg-green-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-500">Average Expense</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        ${(filteredExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0) / 
                                        (filteredExpenses.length || 1)).toFixed(2)}
                                    </p>
                                </div>
                                <div className="bg-purple-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-500">Total Items</p>
                                    <p className="text-2xl font-bold text-gray-900">{filteredExpenses.length}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Add Expense Button */}
                    <div className="fixed bottom-8 right-8">
                        <button 
                            onClick={handleAddClick}
                            className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                        </button>
                    </div>

                    {/* Add Expense Modal */}
                    {showAddModal && (
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
                            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-auto my-8 overflow-hidden transform transition-all">
                                {/* Modal Header */}
                                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4 text-white">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xl font-semibold">Add Expense</h3>
                                        <button onClick={() => setShowAddModal(false)} className="focus:outline-none">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                                
                                {/* Modal Body */}
                                <form onSubmit={handleAddSubmit} className="p-4 sm:p-6 overflow-y-auto max-h-[80vh]">
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
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="What did you spend on?"
                                                value={formData.title}
                                                onChange={handleInputChange}
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
                                                    className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                    placeholder="0.00"
                                                    value={formData.amount}
                                                    onChange={handleInputChange}
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
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                    value={formData.category}
                                                    onChange={handleInputChange}
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
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                    value={formData.date}
                                                    onChange={handleInputChange}
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
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                value={formData.paymentMethod}
                                                onChange={handleInputChange}
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
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Optional details about this expense"
                                                value={formData.description}
                                                onChange={handleInputChange}
                                            ></textarea>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="mt-6 flex items-center justify-end space-x-3">
                                        <button
                                            type="button"
                                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                            onClick={() => setShowAddModal(false)}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                        >
                                            Save Expense
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Edit Expense Modal */}
                    {showEditModal && (
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
                            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-auto my-8 overflow-hidden transform transition-all">
                                {/* Modal Header */}
                                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4 text-white">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xl font-semibold">Edit Expense</h3>
                                        <button onClick={() => setShowEditModal(false)} className="focus:outline-none">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                                
                                {/* Modal Body */}
                                <form onSubmit={handleEditSubmit} className="p-4 sm:p-6 overflow-y-auto max-h-[80vh]">
                                    <div className="space-y-4">
                                        {/* Title Input */}
                                        <div>
                                            <label htmlFor="edit-title" className="block text-sm font-medium text-gray-700 mb-1">
                                                Expense Title <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                id="edit-title"
                                                name="title"
                                                type="text"
                                                required
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="What did you spend on?"
                                                value={formData.title}
                                                onChange={handleInputChange}
                                            />
                                        </div>

                                        {/* Amount Input */}
                                        <div>
                                            <label htmlFor="edit-amount" className="block text-sm font-medium text-gray-700 mb-1">
                                                Amount <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <span className="text-gray-500 sm:text-sm">$</span>
                                                </div>
                                                <input
                                                    id="edit-amount"
                                                    name="amount"
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    required
                                                    className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                    placeholder="0.00"
                                                    value={formData.amount}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                        </div>

                                        {/* Two column layout for category and date */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* Category Select */}
                                            <div>
                                                <label htmlFor="edit-category" className="block text-sm font-medium text-gray-700 mb-1">
                                                    Category <span className="text-red-500">*</span>
                                                </label>
                                                <select
                                                    id="edit-category"
                                                    name="category"
                                                    required
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                    value={formData.category}
                                                    onChange={handleInputChange}
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

                                            {/* Date Input */}
                                            <div>
                                                <label htmlFor="edit-date" className="block text-sm font-medium text-gray-700 mb-1">
                                                    Date <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    id="edit-date"
                                                    name="date"
                                                    type="date"
                                                    required
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                    value={formData.date}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                        </div>

                                        {/* Payment Method */}
                                        <div>
                                            <label htmlFor="edit-paymentMethod" className="block text-sm font-medium text-gray-700 mb-1">
                                                Payment Method
                                            </label>
                                            <select
                                                id="edit-paymentMethod"
                                                name="paymentMethod"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                value={formData.paymentMethod}
                                                onChange={handleInputChange}
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
                                            <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700 mb-1">
                                                Description
                                            </label>
                                            <textarea
                                                id="edit-description"
                                                name="description"
                                                rows="3"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Optional details about this expense"
                                                value={formData.description}
                                                onChange={handleInputChange}
                                            ></textarea>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="mt-6 flex items-center justify-end space-x-3">
                                        <button
                                            type="button"
                                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                            onClick={() => setShowEditModal(false)}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                        >
                                            Update Expense
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Expenses;
