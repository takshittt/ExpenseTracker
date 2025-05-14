import React, { useContext, useState } from 'react';
import { UserDataContext } from '../context/UserContext';
import { ThemeContext } from '../context/ThemeContext';
import Navbar from '../components/Navbar';

// Import components
import AccountHeader from '../components/account/AccountHeader';
import AccountTabs from '../components/account/AccountTabs';
import ProfileTab from '../components/account/ProfileTab';
import SecurityTab from '../components/account/SecurityTab';

const Account = () => {
  const { user, setUser } = useContext(UserDataContext);
  const { darkMode } = useContext(ThemeContext);
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    
    // Here you would typically make an API call to update the user's profile
    setUser({
      ...user,
      name: formData.name
    });
    
    setMessage({ type: 'success', text: 'Profile updated successfully!' });
    setIsEditing(false);
    
    // Clear message after 3 seconds
    setTimeout(() => {
      setMessage({ type: '', text: '' });
    }, 3000);
  };

  const handleUpdatePassword = (e) => {
    e.preventDefault();
    
    // Validate passwords
    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    
    if (formData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password should be at least 6 characters long' });
      return;
    }
    
    // Here you would typically make an API call to update the user's password
    setMessage({ type: 'success', text: 'Password updated successfully!' });
    
    // Reset password fields
    setFormData(prev => ({
      ...prev,
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }));
    
    // Clear message after 3 seconds
    setTimeout(() => {
      setMessage({ type: '', text: '' });
    }, 3000);
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'}`}>
      <Navbar />
      
      <div className="container mx-auto px-4 py-10">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <AccountHeader 
            user={user}
            darkMode={darkMode}
            message={message}
          />
          
          {/* Tabs */}
          <AccountTabs 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            darkMode={darkMode}
          />
          
          {/* Content */}
          <div className={`bg-white shadow-lg rounded-lg overflow-hidden ${darkMode ? 'bg-gray-800' : ''}`}>
            {activeTab === 'profile' && (
              <ProfileTab 
                user={user}
                darkMode={darkMode}
                isEditing={isEditing}
                formData={formData}
                handleChange={handleChange}
                handleUpdateProfile={handleUpdateProfile}
                setIsEditing={setIsEditing}
              />
            )}
            
            {activeTab === 'security' && (
              <SecurityTab 
                darkMode={darkMode}
                formData={formData}
                handleChange={handleChange}
                handleUpdatePassword={handleUpdatePassword}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account; 