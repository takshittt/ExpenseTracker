import React, { useEffect, useContext } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { UserDataContext } from "../context/UserContext";
import axiosInstance from "../utils/axiosConfig";

const AuthSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setUser } = useContext(UserDataContext);
  const token = searchParams.get("token");

  useEffect(() => {
    const handleAuthSuccess = async () => {
      if (!token) {
        navigate("/signin?error=authentication_failed");
        return;
      }

      try {
        // Store token in localStorage
        localStorage.setItem("token", token);

        // Fetch user profile data
        const response = await axiosInstance.get("/auth/profile");

        if (response.status === 200) {
          // Store user data in context
          setUser(response.data.user);

          // Navigate to home page
          navigate("/home");
        }
      } catch (error) {
        console.error("Error processing authentication:", error);
        navigate("/signin?error=authentication_failed");
      }
    };

    handleAuthSuccess();
  }, [token, navigate, setUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-lg text-gray-600">Completing your sign in...</p>
      </div>
    </div>
  );
};

export default AuthSuccess;
