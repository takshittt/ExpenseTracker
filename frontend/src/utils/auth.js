import axios from 'axios';

/**
 * Set up authentication headers for axios
 * @param {string} token - JWT token
 */
export const setAuthToken = (token) => {
  if (token) {
    // Apply to every request
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    // Delete auth header
    delete axios.defaults.headers.common['Authorization'];
  }
};

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  return !!token;
};

/**
 * Logout user - clear token and remove auth header
 */
export const logout = async () => {
  try {
    // Call the backend to invalidate the token
    await axios.get('/auth/Signout', {
      withCredentials: true
    });
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Clear token from localStorage
    localStorage.removeItem('token');
    
    // Clear auth header
    setAuthToken(false);
  }
};

/**
 * Initialize authentication from localStorage on app load
 */
export const initAuth = () => {
  const token = localStorage.getItem('token');
  if (token) {
    setAuthToken(token);
    return true;
  }
  return false;
}; 