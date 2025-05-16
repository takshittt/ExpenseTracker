import { useContext, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { UserDataContext } from '../context/UserContext';
import { isAuthenticated } from '../utils/auth';
import axios from 'axios';

/**
 * Protected route component that checks if user is authenticated
 * If not authenticated, redirects to login page
 */
const ProtectedRoute = ({ children }) => {
  const { user, setUser } = useContext(UserDataContext);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const verifyAuth = async () => {
      // If we already have user data in context, we're authenticated
      if (user && user._id) {
        setAuthenticated(true);
        setLoading(false);
        return;
      }

      // Check if token exists in localStorage
      if (isAuthenticated()) {
        try {
          // Verify token with backend and get user data
          const response = await axios.get('/auth/profile', {
            withCredentials: true
          });
          
          if (response.status === 200) {
            setUser(response.data.user);
            setAuthenticated(true);
          }
        } catch (error) {
          console.error('Authentication verification failed:', error);
          // Token might be invalid or expired
          localStorage.removeItem('token');
          setAuthenticated(false);
        }
      } else {
        setAuthenticated(false);
      }
      
      setLoading(false);
    };

    verifyAuth();
  }, [user, setUser]);

  if (loading) {
    // Show loading spinner while checking authentication
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!authenticated) {
    // Redirect to login page with return path
    return <Navigate to="/signin?error=authentication_required" state={{ from: location.pathname }} replace />;
  }

  // If authenticated, render the protected component
  return children;
};

export default ProtectedRoute; 