/* eslint-disable no-unused-vars */
import React, { useContext, useEffect, useState } from "react";
import { UserDataContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const UserProtectWrapper = ({ children }) => {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const { user, setUser } = useContext(UserDataContext);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      navigate("/signin");
      return;
    }

    axios
      .get(`${import.meta.env.VITE_API_URL}/auth/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true
      })
      .then((res) => {
        if (res.status === 200) {
          setUser(res.data.user);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        localStorage.removeItem("token");
        navigate("/signin");
      });
  }, [token, navigate, setUser]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
};

export default UserProtectWrapper;
