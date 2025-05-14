import React from "react";

const ReportFilters = ({
  dateRange,
  setDateRange,
  transactionType,
  setTransactionType,
  categoryFilter,
  setCategoryFilter,
  categories,
  handleGenerateReport
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Report Filters</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Date Range Selector */}
        <div>
          <label htmlFor="dateRange" className="block text-sm font-medium text-gray-700 mb-1">
            Date Range
          </label>
          <select
            id="dateRange"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="thisMonth">This Month</option>
            <option value="lastMonth">Last Month</option>
            <option value="last3Months">Last 3 Months</option>
            <option value="last6Months">Last 6 Months</option>
            <option value="thisYear">This Year</option>
            <option value="lastYear">Last Year</option>
            <option value="allTime">All Time</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>
        
        {/* Transaction Type Filter */}
        <div>
          <label htmlFor="transactionType" className="block text-sm font-medium text-gray-700 mb-1">
            Transaction Type
          </label>
          <select
            id="transactionType"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            value={transactionType}
            onChange={(e) => setTransactionType(e.target.value)}
          >
            <option value="all">All Transactions</option>
            <option value="expense">Expenses Only</option>
            <option value="income">Income Only</option>
          </select>
        </div>
        
        {/* Category Filter */}
        <div>
          <label htmlFor="categoryFilter" className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            id="categoryFilter"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
        
        {/* Generate Report Button */}
        <div className="flex items-end">
          <button
            onClick={handleGenerateReport}
            className="w-full px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-md shadow-sm hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Generate Report
          </button>
        </div>
      </div>
      
      {/* Custom Date Range (conditionally rendered) */}
      {dateRange === "custom" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              id="endDate"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportFilters; 