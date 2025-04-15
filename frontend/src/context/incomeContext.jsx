import React, { createContext, useReducer, useEffect, useCallback } from "react";
import axios from "axios";

// Create context
export const IncomeDataContext = createContext();

// Define action types
export const ADD_INCOME = "ADD_INCOME";
export const UPDATE_INCOME = "UPDATE_INCOME";
export const DELETE_INCOME = "DELETE_INCOME";
export const SET_INCOME = "SET_INCOME";
export const SET_LOADING = "SET_LOADING";
export const SET_ERROR = "SET_ERROR";

// Initial state
const initialState = {
  income: [],
  loading: false,
  error: null,
};

// Reducer function
const incomeReducer = (state, action) => {
  switch (action.type) {
    case SET_INCOME:
      return {
        ...state,
        income: action.payload,
        loading: false,
        error: null,
      };
    
    case ADD_INCOME:
      return {
        ...state,
        income: [...state.income, action.payload],
        loading: false,
        error: null,
      };
    
    case UPDATE_INCOME:
      return {
        ...state,
        income: state.income.map((inc) => 
          inc.id === action.payload.id || inc._id === action.payload._id 
            ? action.payload 
            : inc
        ),
        loading: false,
        error: null,
      };
    
    case DELETE_INCOME:
      return {
        ...state,
        income: state.income.filter((inc) => 
          inc.id !== action.payload && inc._id !== action.payload
        ),
        loading: false,
        error: null,
      };
      
    case SET_LOADING:
      return {
        ...state,
        loading: true,
        error: null,
      };
      
    case SET_ERROR:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    
    default:
      return state;
  }
};

// Context Provider component
const IncomeContext = ({ children }) => {
  const [state, dispatch] = useReducer(incomeReducer, initialState);

  // Action creators with useCallback
  const fetchIncome = useCallback(async () => {
    try {
      dispatch({ type: SET_LOADING });
      
      // Get auth token for authorized requests
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        },
        withCredentials: true
      };
      
      const response = await axios.get('/income', config);
      
      // Map backend _id to id for frontend consistency
      // Also ensure payment method is properly set for each income item
      const incomeWithId = response.data.data.map(inc => ({
        ...inc,
        id: inc._id,
        paymentMethod: inc.paymentMethod || "Bank Transfer" // Default to Bank Transfer if missing
      }));
      
      
      dispatch({
        type: SET_INCOME,
        payload: incomeWithId,
      });
    } catch (error) {
      console.error('Error fetching income:', error);
      dispatch({
        type: SET_ERROR,
        payload: error.response?.data?.message || error.message,
      });
    }
  }, []);

  const addIncome = useCallback(async (incomeData) => {
    try {
      dispatch({ type: SET_LOADING });
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      
      // Ensure payment method is explicitly set before sending to server
      const dataToSend = {
        ...incomeData,
        paymentMethod: incomeData.paymentMethod || "Bank Transfer"
      };
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true
      };
      
      const response = await axios.post('/income', dataToSend, config);
      
      // If payment method is missing from response, add it manually
      const newIncome = {
        ...response.data.data,
        id: response.data.data._id,
        paymentMethod: response.data.data.paymentMethod || dataToSend.paymentMethod
      };
      
      
      dispatch({
        type: ADD_INCOME,
        payload: newIncome,
      });
      
      return newIncome;
    } catch (error) {
      console.error('Error adding income:', error);
      dispatch({
        type: SET_ERROR,
        payload: error.response?.data?.message || error.message,
      });
      throw error;
    }
  }, []);

  const updateIncome = useCallback(async (id, incomeData) => {
    try {
      // Validate ID
      if (!id) {
        console.error("Cannot update income: ID is undefined or null");
        throw new Error("Income ID is required for update");
      }
      
      dispatch({ type: SET_LOADING });
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      
      // Ensure payment method is explicitly set before sending to server
      const dataToSend = {
        ...incomeData,
        paymentMethod: incomeData.paymentMethod || "Bank Transfer"
      };
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true
      };
      
      const response = await axios.put(`/income/${id}`, dataToSend, config);
      
      // If payment method is missing from response, add it manually
      const updatedIncome = {
        ...response.data.data,
        id: response.data.data._id,
        paymentMethod: response.data.data.paymentMethod || dataToSend.paymentMethod
      };
      
      
      dispatch({
        type: UPDATE_INCOME,
        payload: updatedIncome,
      });
      
      return updatedIncome;
    } catch (error) {
      console.error("Error updating income:", error);
      const errorMessage = error.response?.data?.message || error.message;
      console.error("Error details:", errorMessage);
      
      dispatch({
        type: SET_ERROR,
        payload: errorMessage,
      });
      throw error;
    }
  }, []);

  const deleteIncome = useCallback(async (id) => {
    try {
      dispatch({ type: SET_LOADING });
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        },
        withCredentials: true
      };
      
      await axios.delete(`/income/${id}`, config);
      
      dispatch({
        type: DELETE_INCOME,
        payload: id,
      });
    } catch (error) {
      console.error('Error deleting income:', error);
      dispatch({
        type: SET_ERROR,
        payload: error.response?.data?.message || error.message,
      });
      throw error;
    }
  }, []);

  return (
    <IncomeDataContext.Provider 
      value={{ 
        income: state.income, 
        loading: state.loading,
        error: state.error,
        fetchIncome,
        addIncome,
        updateIncome,
        deleteIncome
      }}
    >
      {children}
    </IncomeDataContext.Provider>
  );
};

export default IncomeContext;
