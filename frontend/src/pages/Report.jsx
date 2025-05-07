import React, { useContext, useEffect, useState } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { BudgetDataContext } from '../context/BudgetContext';
import { ExpensesDataContext } from '../context/ExpensesContext';
import { IncomeDataContext } from '../context/incomeContext';
import { UserDataContext } from '../context/UserContext';
import Navbar from '../components/Navbar';

// Register ChartJS components
ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

const Report = () => {
  const { budgets, budgetSummary, fetchBudgets, fetchBudgetSummary } = useContext(BudgetDataContext);
  const { expenses, fetchExpenses } = useContext(ExpensesDataContext);
  const { income, fetchIncome } = useContext(IncomeDataContext);
  const { user } = useContext(UserDataContext);
  
  const [activeTab, setActiveTab] = useState('overview');
  const [timeFilter, setTimeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  // Derived state
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [filteredIncome, setFilteredIncome] = useState([]);
  const [filteredBudgets, setFilteredBudgets] = useState([]);
  
  // Summary metrics
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    savingsRate: 0,
    budgetComplianceRate: 0
  });

  // Fetch data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchExpenses();
        await fetchIncome();
        await fetchBudgets();
        await fetchBudgetSummary();
      } catch (error) {
        console.error("Error loading report data:", error);
      }
    };
    
    loadData();
  }, [fetchExpenses, fetchIncome, fetchBudgets, fetchBudgetSummary]);
  
  // Apply filters and calculate summary statistics
  useEffect(() => {
    // Filter by time period
    const now = new Date();
    const filterDate = new Date();
    
    switch(timeFilter) {
      case 'month':
        filterDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        filterDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        filterDate.setFullYear(now.getFullYear() - 1);
        break;
      default: // 'all'
        filterDate.setFullYear(1970); // Beginning of time
    }
    
    // Apply time filter
    const timeFilteredExpenses = expenses.filter(exp => new Date(exp.date) >= filterDate);
    const timeFilteredIncome = income.filter(inc => new Date(inc.date) >= filterDate);
    
    // Apply category filter
    const filtered = {
      expenses: categoryFilter === 'all' 
        ? timeFilteredExpenses 
        : timeFilteredExpenses.filter(exp => exp.category === categoryFilter),
      income: timeFilteredIncome,
      budgets: budgets
    };
    
    setFilteredExpenses(filtered.expenses);
    setFilteredIncome(filtered.income);
    setFilteredBudgets(filtered.budgets);
    
    // Calculate summary statistics
    const totalIncome = filtered.income.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const totalExpenses = filtered.expenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const balance = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;
    
    // Budget compliance calculation
    let budgetComplianceRate = 0;
    if (filtered.budgets.length > 0) {
      const budgetsWithExpenses = filtered.budgets.map(budget => {
        const budgetExpenses = filtered.expenses.filter(exp => 
          exp.category === budget.category
        ).reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);
        
        return {
          ...budget,
          spent: budgetExpenses,
          compliance: budget.amount > 0 ? Math.min(100, (budgetExpenses / budget.amount) * 100) : 0
        };
      });
      
      budgetComplianceRate = budgetsWithExpenses.reduce((sum, budget) => 
        sum + (budget.compliance <= 100 ? 100 : 0), 0) / budgetsWithExpenses.length;
    }
    
    setSummary({
      totalIncome,
      totalExpenses,
      balance,
      savingsRate,
      budgetComplianceRate
    });
    
  }, [expenses, income, budgets, timeFilter, categoryFilter]);

  // Prepare expense category data for pie chart
  const expensesByCategoryData = {
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
          '#8FBC8F',
          '#E6E6FA',
          '#FFB6C1',
          '#00FFFF'
        ],
        borderWidth: 1,
      },
    ],
  };
  
  // Group expenses by category
  const expensesByCategory = {};
  filteredExpenses.forEach(expense => {
    const category = expense.category || 'Uncategorized';
    expensesByCategory[category] = (expensesByCategory[category] || 0) + Number(expense.amount);
  });
  
  // Populate chart data
  Object.entries(expensesByCategory).forEach(([category, amount]) => {
    expensesByCategoryData.labels.push(category);
    expensesByCategoryData.datasets[0].data.push(amount);
  });
  
  // Prepare income vs expenses data for bar chart
  const incomeVsExpensesData = {
    labels: ['Income', 'Expenses', 'Balance'],
    datasets: [
      {
        label: 'Amount',
        data: [summary.totalIncome, summary.totalExpenses, summary.balance],
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 99, 132, 0.6)',
          summary.balance >= 0 ? 'rgba(54, 162, 235, 0.6)' : 'rgba(255, 159, 64, 0.6)'
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)',
          summary.balance >= 0 ? 'rgba(54, 162, 235, 1)' : 'rgba(255, 159, 64, 1)'
        ],
        borderWidth: 1,
      },
    ],
  };
  
  // Get unique expense categories for filter
  const uniqueCategories = [...new Set(expenses.map(exp => exp.category))];

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Financial Report</h1>
          <p className="text-gray-600 mb-6">Welcome back, {user.name || 'User'}! Here's your financial summary.</p>
          
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Time Period</label>
              <select 
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
              >
                <option value="all">All Time</option>
                <option value="month">Last Month</option>
                <option value="quarter">Last Quarter</option>
                <option value="year">Last Year</option>
              </select>
            </div>
            
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select 
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">All Categories</option>
                {uniqueCategories.map((cat, idx) => (
                  <option key={idx} value={cat}>{cat || 'Uncategorized'}</option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow p-4 text-white">
              <h3 className="font-medium text-lg">Total Income</h3>
              <p className="text-2xl font-bold">${summary.totalIncome.toFixed(2)}</p>
            </div>
            
            <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg shadow p-4 text-white">
              <h3 className="font-medium text-lg">Total Expenses</h3>
              <p className="text-2xl font-bold">${summary.totalExpenses.toFixed(2)}</p>
            </div>
            
            <div className={`bg-gradient-to-r ${summary.balance >= 0 ? 'from-green-500 to-green-600' : 'from-orange-500 to-orange-600'} rounded-lg shadow p-4 text-white`}>
              <h3 className="font-medium text-lg">Balance</h3>
              <p className="text-2xl font-bold">${summary.balance.toFixed(2)}</p>
            </div>
            
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow p-4 text-white">
              <h3 className="font-medium text-lg">Savings Rate</h3>
              <p className="text-2xl font-bold">{summary.savingsRate.toFixed(2)}%</p>
            </div>
          </div>
          
          {/* Navigation Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="flex space-x-8">
              <button
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('overview')}
              >
                Overview
              </button>
              <button
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'expenses'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('expenses')}
              >
                Expenses Analysis
              </button>
              <button
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'budgets'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('budgets')}
              >
                Budget Performance
              </button>
            </nav>
          </div>
          
          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Income vs Expenses</h3>
                <div className="h-80">
                  <Bar 
                    data={incomeVsExpensesData} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false
                        }
                      }
                    }} 
                  />
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Key Performance Indicators</h3>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-700">Savings Rate</span>
                      <span className="text-gray-900 font-medium">{summary.savingsRate.toFixed(2)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${Math.min(100, Math.max(0, summary.savingsRate))}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-700">Budget Compliance</span>
                      <span className="text-gray-900 font-medium">{summary.budgetComplianceRate.toFixed(2)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-green-600 h-2.5 rounded-full" 
                        style={{ width: `${Math.min(100, Math.max(0, summary.budgetComplianceRate))}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <h4 className="font-medium text-gray-800 mb-2">Financial Health Summary</h4>
                    <p className="text-gray-600">
                      {summary.balance >= 0 
                        ? `You're in a healthy financial position with a positive balance of $${summary.balance.toFixed(2)}.` 
                        : `You have a negative balance of $${Math.abs(summary.balance).toFixed(2)}. Consider reducing expenses or increasing income.`
                      }
                      {summary.savingsRate > 20 
                        ? ` Your savings rate of ${summary.savingsRate.toFixed(2)}% is excellent!` 
                        : summary.savingsRate > 10 
                          ? ` Your savings rate of ${summary.savingsRate.toFixed(2)}% is good, but there's room for improvement.` 
                          : ` Try to increase your savings rate above 10% for better financial security.`
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'expenses' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Expenses by Category</h3>
                <div className="h-80 flex items-center justify-center">
                  {filteredExpenses.length > 0 ? (
                    <Pie 
                      data={expensesByCategoryData} 
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                      }} 
                    />
                  ) : (
                    <p className="text-gray-500">No expense data available for the selected filters.</p>
                  )}
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Top Expense Categories</h3>
                {filteredExpenses.length > 0 ? (
                  <div className="space-y-4">
                    {Object.entries(expensesByCategory)
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 5)
                      .map(([category, amount], idx) => (
                        <div key={idx}>
                          <div className="flex justify-between mb-1">
                            <span className="text-gray-700">{category || 'Uncategorized'}</span>
                            <span className="text-gray-900 font-medium">${amount.toFixed(2)}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className="bg-blue-600 h-2.5 rounded-full" 
                              style={{ width: `${(amount / Math.max(...Object.values(expensesByCategory))) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No expense data available for the selected filters.</p>
                )}
              </div>
              
              <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Expenses</h3>
                {filteredExpenses.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredExpenses
                          .sort((a, b) => new Date(b.date) - new Date(a.date))
                          .slice(0, 5)
                          .map((expense, idx) => (
                            <tr key={idx}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(expense.date).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {expense.category || 'Uncategorized'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {expense.description || '-'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                ${Number(expense.amount).toFixed(2)}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500">No expense data available for the selected filters.</p>
                )}
              </div>
            </div>
          )}
          
          {activeTab === 'budgets' && (
            <div className="space-y-8">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Budget vs Actual Spending</h3>
                {filteredBudgets.length > 0 ? (
                  <div className="space-y-6">
                    {filteredBudgets.map((budget, idx) => {
                      const budgetExpenses = filteredExpenses
                        .filter(exp => exp.category === budget.category)
                        .reduce((sum, exp) => sum + Number(exp.amount), 0);
                      
                      const percentSpent = budget.amount > 0 ? (budgetExpenses / budget.amount) * 100 : 0;
                      const status = percentSpent <= 100 ? 'Under Budget' : 'Over Budget';
                      const statusColor = percentSpent <= 85 
                        ? 'text-green-600' 
                        : percentSpent <= 100 
                          ? 'text-yellow-600' 
                          : 'text-red-600';
                      
                      return (
                        <div key={idx}>
                          <div className="flex justify-between mb-1">
                            <span className="text-gray-700">{budget.category || 'Uncategorized'}</span>
                            <span className={`font-medium ${statusColor}`}>
                              {status} (${budgetExpenses.toFixed(2)} / ${Number(budget.amount).toFixed(2)})
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className={`h-2.5 rounded-full ${
                                percentSpent <= 85 
                                  ? 'bg-green-600' 
                                  : percentSpent <= 100 
                                    ? 'bg-yellow-500' 
                                    : 'bg-red-600'
                              }`}
                              style={{ width: `${Math.min(100, percentSpent)}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500">No budget data available.</p>
                )}
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Budget Recommendations</h3>
                {filteredExpenses.length > 0 && filteredBudgets.length > 0 ? (
                  <div className="space-y-4">
                    <p className="text-gray-600 mb-4">
                      Based on your spending patterns, here are some recommendations for your budgets:
                    </p>
                    
                    <div className="space-y-4">
                      {filteredBudgets
                        .map(budget => {
                          const budgetExpenses = filteredExpenses
                            .filter(exp => exp.category === budget.category)
                            .reduce((sum, exp) => sum + Number(exp.amount), 0);
                          
                          const percentSpent = budget.amount > 0 ? (budgetExpenses / budget.amount) * 100 : 0;
                          
                          let recommendation = '';
                          if (percentSpent > 110) {
                            recommendation = `Consider increasing your budget for ${budget.category} by ${Math.round((percentSpent - 100) / 10) * 10}% based on your spending patterns.`;
                          } else if (percentSpent < 50) {
                            recommendation = `You're significantly under budget for ${budget.category}. Consider reallocating some funds to other categories.`;
                          } else {
                            recommendation = `Your budget for ${budget.category} is well aligned with your spending.`;
                          }
                          
                          return {
                            category: budget.category,
                            recommendation,
                            percentSpent
                          };
                        })
                        .sort((a, b) => Math.abs(100 - b.percentSpent) - Math.abs(100 - a.percentSpent))
                        .map((item, idx) => (
                          <div key={idx} className="p-4 border rounded-lg">
                            <h4 className="font-medium text-gray-800">{item.category}</h4>
                            <p className="text-gray-600">{item.recommendation}</p>
                          </div>
                        ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">Insufficient data to provide budget recommendations.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Report; 