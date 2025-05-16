import React, { useEffect, useContext } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { UserDataContext } from '../context/UserContext';
import axios from 'axios';

const AuthSuccess = () => {
  const [searchParams] = useSearchParams();
  const { setUser } = useContext(UserDataContext);
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    
    console.log("AuthSuccess: Token present:", !!token);
    
    if (token) {
      // Store token
      localStorage.setItem('token', token);
      
      // Get user profile from API
      const fetchUserProfile = async () => {
        try {
          console.log("Fetching user profile with token");
          
          // Set default Authorization header for all future requests
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Use axios defaults instead of constructing URL
          const response = await axios.get('/auth/profile', {
            headers: {
              Authorization: `Bearer ${token}`
            },
            withCredentials: true
          });
          
          if (response.status === 200) {
            console.log("User profile fetched successfully");
            setUser(response.data.user);
            navigate('/home');
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          // Clear any invalid token
          localStorage.removeItem('token');
          navigate('/signin?error=profile_fetch_failed');
        }
      };
      
      fetchUserProfile();
    } else {
      // No token found, redirect to signin
      console.error("No token found in URL parameters");
      navigate('/signin?error=no_token');
    }
  }, [searchParams, setUser, navigate]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center p-8 bg-white rounded-lg shadow-md">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-lg text-gray-700">Authenticating...</p>
      </div>
    </div>
  );
};

export default AuthSuccess; 