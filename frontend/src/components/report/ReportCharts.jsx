import React from "react";

const ReportCharts = ({ reportData, chartType, setChartType }) => {
  // Chart type options
  const chartTypes = [
    { id: "bar", name: "Bar Chart" },
    { id: "pie", name: "Pie Chart" },
    { id: "line", name: "Line Chart" },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">Report Visualization</h2>
        
        {/* Chart Type Selector */}
        <div className="mt-3 md:mt-0">
          <div className="flex rounded-md shadow-sm">
            {chartTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setChartType(type.id)}
                className={`px-4 py-2 text-sm font-medium ${
                  chartType === type.id
                    ? "bg-indigo-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                } ${
                  type.id === "bar"
                    ? "rounded-l-md"
                    : type.id === "line"
                    ? "rounded-r-md"
                    : ""
                } border border-gray-300`}
              >
                {type.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart Display Area */}
      <div className="h-80 flex items-center justify-center">
        {reportData && reportData.length > 0 ? (
          <div className="w-full h-full">
            {/* This is where you would integrate a chart library like Chart.js or Recharts */}
            {chartType === "bar" && (
              <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                <p className="text-gray-500">Bar Chart Visualization</p>
                {/* Replace with actual Bar Chart component */}
              </div>
            )}
            
            {chartType === "pie" && (
              <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                <p className="text-gray-500">Pie Chart Visualization</p>
                {/* Replace with actual Pie Chart component */}
              </div>
            )}
            
            {chartType === "line" && (
              <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                <p className="text-gray-500">Line Chart Visualization</p>
                {/* Replace with actual Line Chart component */}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="text-lg font-medium">No data to display</p>
            <p className="mt-1">Adjust your filters and generate a report to see visualizations</p>
          </div>
        )}
      </div>
      
      {/* Chart Legend/Key (if applicable) */}
      {reportData && reportData.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Legend</h3>
          <div className="flex flex-wrap gap-4">
            {/* Example legend items - replace with dynamic data */}
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">Income</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">Expenses</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportCharts; 