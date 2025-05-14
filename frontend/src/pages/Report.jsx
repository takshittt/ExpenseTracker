import React, { useState, useContext, useEffect } from "react";
import Navbar from "../components/Navbar";
import { ExpensesDataContext } from "../context/ExpensesContext";
import { IncomeDataContext } from "../context/incomeContext.jsx";

// Import components
import ReportFilters from "../components/report/ReportFilters";
import ReportSummary from "../components/report/ReportSummary";
import ReportCharts from "../components/report/ReportCharts";
import ReportTable from "../components/report/ReportTable";

const Report = () => {
  const { expenses, fetchExpenses } = useContext(ExpensesDataContext);
  const { income, fetchIncome } = useContext(IncomeDataContext);
  
  const [dateRange, setDateRange] = useState("thisMonth");
  const [transactionType, setTransactionType] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [reportData, setReportData] = useState([]);
  const [chartType, setChartType] = useState("bar");
  const [categories, setCategories] = useState([]);
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [isReportGenerated, setIsReportGenerated] = useState(false);
  
  // Fetch expenses and income on component mount
  useEffect(() => {
    fetchExpenses();
    fetchIncome();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Extract unique categories when expenses or income change
  useEffect(() => {
    const expenseCategories = expenses ? [...new Set(expenses.map(expense => expense.category))] : [];
    const incomeCategories = income ? [...new Set(income.map(inc => inc.category))] : [];
    
    // Combine and deduplicate categories
    const allCategories = [...new Set([...expenseCategories, ...incomeCategories])];
    setCategories(allCategories.sort());
    
  }, [expenses, income]);
  
  // Get date range based on selected option
  const getDateRange = () => {
    const now = new Date();
    let startDate, endDate;
    
    switch (dateRange) {
      case "thisMonth":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case "lastMonth":
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case "last3Months":
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        endDate = now;
        break;
      case "last6Months":
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
        endDate = now;
        break;
      case "thisYear":
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31);
        break;
      case "lastYear":
        startDate = new Date(now.getFullYear() - 1, 0, 1);
        endDate = new Date(now.getFullYear() - 1, 11, 31);
        break;
      case "allTime":
        startDate = new Date(0); // Beginning of time
        endDate = now;
        break;
      case "custom":
        startDate = customStartDate ? new Date(customStartDate) : new Date(0);
        endDate = customEndDate ? new Date(customEndDate) : now;
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = now;
    }
    
    return { startDate, endDate };
  };
  
  // Generate report based on filters
  const handleGenerateReport = () => {
    const { startDate, endDate } = getDateRange();
    let filteredData = [];
    
    // Add expenses if needed
    if (transactionType === "all" || transactionType === "expense") {
      const filteredExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        const isInDateRange = expenseDate >= startDate && expenseDate <= endDate;
        const isInCategory = categoryFilter === "all" || expense.category === categoryFilter;
        
        return isInDateRange && isInCategory;
      }).map(expense => ({
        ...expense,
        transactionType: "expense",
        id: expense._id || expense.id
      }));
      
      filteredData = [...filteredData, ...filteredExpenses];
    }
    
    // Add income if needed
    if (transactionType === "all" || transactionType === "income") {
      const filteredIncome = income.filter(inc => {
        const incomeDate = new Date(inc.date);
        const isInDateRange = incomeDate >= startDate && incomeDate <= endDate;
        const isInCategory = categoryFilter === "all" || inc.category === categoryFilter;
        
        return isInDateRange && isInCategory;
      }).map(inc => ({
        ...inc,
        transactionType: "income",
        id: inc._id || inc.id
      }));
      
      filteredData = [...filteredData, ...filteredIncome];
    }
    
    // Sort by date (newest first)
    filteredData.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    setReportData(filteredData);
    setIsReportGenerated(true);
  };
  
  // Handle custom date changes
  const handleCustomDateChange = (type, value) => {
    if (type === "start") {
      setCustomStartDate(value);
    } else {
      setCustomEndDate(value);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Financial Reports</h1>
            <p className="text-gray-600 mt-1">Analyze your income and expenses</p>
          </div>
        </div>
        
        {/* Filters */}
        <ReportFilters 
          dateRange={dateRange}
          setDateRange={setDateRange}
          transactionType={transactionType}
          setTransactionType={setTransactionType}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          categories={categories}
          handleGenerateReport={handleGenerateReport}
          customStartDate={customStartDate}
          customEndDate={customEndDate}
          handleCustomDateChange={handleCustomDateChange}
        />
        
        {isReportGenerated && (
          <>
            {/* Summary */}
            <ReportSummary reportData={reportData} />
            
            {/* Charts */}
            <ReportCharts 
              reportData={reportData}
              chartType={chartType}
              setChartType={setChartType}
            />
            
            {/* Transaction Table */}
            <ReportTable reportData={reportData} />
          </>
        )}
        
        {/* Empty State */}
        {!isReportGenerated && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No Report Generated</h3>
            <p className="text-gray-500 mb-4">
              Select your filters above and click "Generate Report" to see your financial data.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Report; 