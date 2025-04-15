import React, { useContext, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { UserDataContext } from "../context/UserContext";

export const Signout = () => {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const { setUser } = useContext(UserDataContext);

  useEffect(() => {
    const performSignout = async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_URL.replace(/\/+$/, "");
        await axios.get(`${baseUrl}/auth/Signout`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        });
        
        localStorage.removeItem("token");
        setUser(null);
        navigate("/signin");
      } catch (error) {
        console.error("Signout failed:", error);
        // Still clear local data even if server request fails
        localStorage.removeItem("token");
        setUser(null);
        navigate("/signin");
      }
    };

    performSignout();
  }, [navigate, setUser, token]);

  return <div className="flex items-center justify-center h-screen">
    <div className="text-center p-8 bg-white rounded-lg shadow-md">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
      <p className="text-lg text-gray-700">Logging out...</p>
    </div>
  </div>;
};

export default Signout;
