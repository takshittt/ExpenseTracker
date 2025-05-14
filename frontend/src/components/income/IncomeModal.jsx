import React from "react";

const IncomeModal = ({
  showIncomeModal,
  isEditMode,
  newIncome,
  handleCloseIncomeModal,
  handleIncomeInputChange,
  handleSubmitIncome
}) => {
  return (
    showIncomeModal && (
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
    )
  );
};

export default IncomeModal; 