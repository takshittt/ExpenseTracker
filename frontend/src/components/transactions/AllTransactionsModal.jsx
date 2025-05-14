import React from "react";

const AllTransactionsModal = ({
  showAllTransactionsModal,
  setShowAllTransactionsModal,
  transactionFilter,
  setTransactionFilter,
  searchQuery,
  setSearchQuery,
  sortOrder,
  setSortOrder,
  getFilteredTransactions,
  handleViewTransactionDetails,
  handleOpenIncomeModal,
  handleOpenExpenseModal,
  handleDeleteIncome,
  handleDeleteExpense
}) => {
  return (
    showAllTransactionsModal && (
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
    )
  );
};

export default AllTransactionsModal; 