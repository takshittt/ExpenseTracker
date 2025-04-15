import React, { createContext, useReducer, useEffect, useCallback } from "react";
import axios from "axios";

// Create context
export const ExpensesDataContext = createContext();

// Define action types
export const ADD_EXPENSE = "ADD_EXPENSE";
export const UPDATE_EXPENSE = "UPDATE_EXPENSE";
export const DELETE_EXPENSE = "DELETE_EXPENSE";
export const SET_EXPENSES = "SET_EXPENSES";
export const SET_LOADING = "SET_LOADING";
export const SET_ERROR = "SET_ERROR";

// Initial state
const initialState = {
  expenses: [],
  loading: false,
  error: null,
};

// Reducer function
const expensesReducer = (state, action) => {
  switch (action.type) {
    case SET_EXPENSES:
      return {
        ...state,
        expenses: action.payload,
        loading: false,
        error: null,
      };
    
    case ADD_EXPENSE:
      return {
        ...state,
        expenses: [...state.expenses, action.payload],
        loading: false,
        error: null,
      };
    
    case UPDATE_EXPENSE:
      return {
        ...state,
        expenses: state.expenses.map((expense) => 
          expense.id === action.payload.id || expense._id === action.payload._id 
            ? action.payload 
            : expense
        ),
        loading: false,
        error: null,
      };
    
    case DELETE_EXPENSE:
      return {
        ...state,
        expenses: state.expenses.filter((expense) => 
          expense.id !== action.payload && expense._id !== action.payload
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

// Configure axios default base URL
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

// Context Provider component
const ExpensesContext = ({ children }) => {
  const [state, dispatch] = useReducer(expensesReducer, initialState);

  // Action creators with useCallback
  const fetchExpenses = useCallback(async () => {
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
      
      const response = await axios.get('/expenses', config);
      
      // Map backend _id to id for frontend consistency
      // Also ensure payment method is properly set for each expense
      const expensesWithId = response.data.data.map(exp => ({
        ...exp,
        id: exp._id,
        paymentMethod: exp.paymentMethod || "Cash" // Default to Cash if missing
      }));
      
      
      dispatch({
        type: SET_EXPENSES,
        payload: expensesWithId,
      });
    } catch (error) {
      console.error('Error fetching expenses:', error);
      dispatch({
        type: SET_ERROR,
        payload: error.response?.data?.message || error.message,
      });
    }
  }, []);

  const addExpense = useCallback(async (expenseData) => {
    try {
      
      // Make sure payment method is preserved
      const expenseWithPaymentMethod = {
        ...expenseData,
        paymentMethod: expenseData.paymentMethod || "Cash"
      };
      
      
      dispatch({
        type: ADD_EXPENSE,
        payload: expenseWithPaymentMethod,
      });
      
      return expenseWithPaymentMethod;
    } catch (error) {
      console.error("Error in addExpense:", error);
      throw error;
    }
  }, []);

  const updateExpense = useCallback(async (expenseData) => {
    try {
      
      // Ensure payment method is included
      const expenseWithPaymentMethod = {
        ...expenseData,
        paymentMethod: expenseData.paymentMethod || "Cash"
      };
      
      
      dispatch({
        type: UPDATE_EXPENSE,
        payload: expenseWithPaymentMethod,
      });
      
      return expenseWithPaymentMethod;
    } catch (error) {
      console.error("Error in updateExpense:", error);
      throw error;
    }
  }, []);

  const deleteExpense = useCallback((id) => {
    dispatch({
      type: DELETE_EXPENSE,
      payload: id,
    });
  }, []);

  // Set up axios interceptors for authentication
  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        config.withCredentials = true;
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    return () => {
      // Clean up interceptor when component unmounts
      axios.interceptors.request.eject(requestInterceptor);
    };
  }, []);

  return (
    <ExpensesDataContext.Provider 
      value={{ 
        expenses: state.expenses, 
        loading: state.loading,
        error: state.error,
        fetchExpenses,
        addExpense,
        updateExpense,
        deleteExpense
      }}
    >
      {children}
    </ExpensesDataContext.Provider>
  );
};

export default ExpensesContext;