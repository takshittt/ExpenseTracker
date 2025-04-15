import React from "react";
import { Link } from "react-router-dom";

const Start = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-blue-500 relative">
      {/* Background overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?ixlib=rb-4.0.1')",
          opacity: '0.15'
        }}
      ></div>

      {/* Content container */}
      <div className="relative z-10 text-center px-4">
        <h1 className="text-5xl font-bold text-white mb-6">
          Track Your Expenses
          <span className="block text-2xl mt-2 font-normal">Smart. Simple. Secure.</span>
        </h1>
        
        <p className="text-gray-200 mb-8 max-w-md mx-auto">
          Take control of your finances with our powerful expense tracking solution. Start your journey to financial freedom today.
        </p>

        <div className="space-x-4">
          <Link
            to="/signin"
            className="bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition duration-300"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-purple-600 transition duration-300"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Start;
