import React from "react";

const ExpenseModal = ({
  showExpenseModal,
  isEditMode,
  newExpense,
  handleCloseExpenseModal,
  handleExpenseInputChange,
  handleSubmitExpense
}) => {
  return (
    showExpenseModal && (
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
    )
  );
};

export default ExpenseModal; 