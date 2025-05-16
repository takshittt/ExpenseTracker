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
          navigate('/signin');
        }
      };
      
      fetchUserProfile();
    } else {
      // No token found, redirect to signin
      console.error("No token found in URL parameters");
      navigate('/signin');
    }
  }, [searchParams, setUser, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="animate-pulse">
          <svg className="mx-auto h-12 w-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Authenticating...
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Please wait while we log you in
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthSuccess; 