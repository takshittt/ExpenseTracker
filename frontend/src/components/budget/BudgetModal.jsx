import React from "react";

const BudgetModal = ({
  showAddBudgetModal,
  isEditMode,
  newBudget,
  handleCloseBudgetModal,
  handleBudgetInputChange,
  handleSubmitBudget
}) => {
  return (
    showAddBudgetModal && (
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
    )
  );
};

export default BudgetModal; 