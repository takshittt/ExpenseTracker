import React from "react";

const BalanceCard = ({
  currentBalance,
  handleOpenIncomeModal,
  handleOpenExpenseModal
}) => {
  return (
    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg shadow-lg p-6 mb-8 text-white">
      <h2 className="text-xl font-semibold opacity-90">Current Balance</h2>
      <p className="text-4xl font-bold mt-2">${currentBalance.toFixed(2)}</p>
      <div className="mt-4 flex space-x-3">
        <button 
          onClick={handleOpenIncomeModal}
          className="bg-white text-blue-600 px-4 py-2 rounded-md font-medium hover:bg-blue-50 transition">Add Income</button>
        <button 
          onClick={() => handleOpenExpenseModal()}
          className="bg-blue-400 bg-opacity-30 text-white px-4 py-2 rounded-md font-medium hover:bg-opacity-40 transition">
          Add Expense
        </button>
      </div>
    </div>
  );
};

export default BalanceCard; 