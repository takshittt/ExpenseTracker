import React from "react";

const SecurityTab = ({
  darkMode,
  formData,
  handleChange,
  handleUpdatePassword
}) => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-6">Change Password</h2>
        
        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div>
            <label htmlFor="currentPassword" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
              Current Password
            </label>
            <input
              type="password"
              id="currentPassword"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              }`}
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="newPassword" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
                required
              />
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
                required
              />
            </div>
          </div>
          
          <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-blue-50'} mt-4`}>
            <h3 className={`text-sm font-semibold mb-2 ${darkMode ? 'text-white' : 'text-blue-700'}`}>Password Requirements</h3>
            <ul className={`list-disc list-inside text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              <li>At least 6 characters long</li>
              <li>Use a combination of letters, numbers, and symbols</li>
              <li>Avoid using easily guessable information</li>
            </ul>
          </div>
          
          <div className="pt-4">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 w-full md:w-auto"
            >
              Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SecurityTab; 