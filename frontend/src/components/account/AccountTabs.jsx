import React from "react";

const AccountTabs = ({
  activeTab,
  setActiveTab,
  darkMode
}) => {
  return (
    <div className={`flex mb-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
      <button
        onClick={() => setActiveTab('profile')}
        className={`px-4 py-2 font-medium text-sm transition-colors duration-200 relative ${
          activeTab === 'profile'
            ? `${darkMode ? 'text-blue-400' : 'text-blue-600'}`
            : `${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`
        }`}
      >
        <div className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
          Profile
        </div>
        {activeTab === 'profile' && (
          <div className={`absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 transform translate-y-0.5`}></div>
        )}
      </button>
      <button
        onClick={() => setActiveTab('security')}
        className={`px-4 py-2 font-medium text-sm transition-colors duration-200 relative ${
          activeTab === 'security'
            ? `${darkMode ? 'text-blue-400' : 'text-blue-600'}`
            : `${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`
        }`}
      >
        <div className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          Security
        </div>
        {activeTab === 'security' && (
          <div className={`absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 transform translate-y-0.5`}></div>
        )}
      </button>
    </div>
  );
};

export default AccountTabs; 