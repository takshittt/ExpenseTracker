import React from "react";

const TransactionDetailsModal = ({
  showDetailsModal,
  selectedTransaction,
  setShowDetailsModal,
  handleOpenIncomeModal,
  handleOpenExpenseModal,
  handleDeleteIncome,
  handleDeleteExpense
}) => {
  return (
    showDetailsModal && selectedTransaction && (
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
    )
  );
};

export default TransactionDetailsModal; 