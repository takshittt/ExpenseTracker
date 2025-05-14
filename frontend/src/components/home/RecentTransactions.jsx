import React from "react";

const RecentTransactions = ({
  recentTransactions,
  toggleActionMenu,
  showActionMenu,
  handleOpenExpenseModal,
  handleOpenIncomeModal,
  handleDeleteExpense,
  handleDeleteIncome,
  handleViewTransactionDetails,
  setShowAllTransactionsModal
}) => {
  return (
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
                          toggleActionMenu(null);
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
                          toggleActionMenu(null);
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
  );
};

export default RecentTransactions; 