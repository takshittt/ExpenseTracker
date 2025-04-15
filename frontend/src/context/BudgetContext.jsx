import React, { createContext, useReducer, useEffect, useCallback } from "react";
import axios from "axios";

// Create context
export const BudgetDataContext = createContext();

// Define action types
export const ADD_BUDGET = "ADD_BUDGET";
export const UPDATE_BUDGET = "UPDATE_BUDGET";
export const DELETE_BUDGET = "DELETE_BUDGET";
export const SET_BUDGETS = "SET_BUDGETS";
export const SET_BUDGET_STATUS = "SET_BUDGET_STATUS";
export const SET_BUDGET_SUMMARY = "SET_BUDGET_SUMMARY";
export const SET_LOADING = "SET_LOADING";
export const SET_ERROR = "SET_ERROR";

// Initial state
const initialState = {
  budgets: [],
  budgetStatus: null,
  budgetSummary: [],
  loading: false,
  error: null,
};

// Reducer function
const budgetReducer = (state, action) => {
  switch (action.type) {
    case SET_BUDGETS:
      return {
        ...state,
        budgets: action.payload,
        loading: false,
        error: null,
      };
    
    case SET_BUDGET_STATUS:
      return {
        ...state,
        budgetStatus: action.payload,
        loading: false,
        error: null,
      };
    
    case SET_BUDGET_SUMMARY:
      return {
        ...state,
        budgetSummary: action.payload,
        loading: false,
        error: null,
      };
    
    case ADD_BUDGET:
      return {
        ...state,
        budgets: [...state.budgets, action.payload],
        loading: false,
        error: null,
      };
    
    case UPDATE_BUDGET:
      return {
        ...state,
        budgets: state.budgets.map((budget) => 
          budget.id === action.payload.id || budget._id === action.payload._id 
            ? action.payload 
            : budget
        ),
        loading: false,
        error: null,
      };
    
    case DELETE_BUDGET:
      return {
        ...state,
        budgets: state.budgets.filter((budget) => 
          budget.id !== action.payload && budget._id !== action.payload
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
const BudgetContext = ({ children }) => {
  const [state, dispatch] = useReducer(budgetReducer, initialState);

  // Action creators with useCallback
  const fetchBudgets = useCallback(async (filters = {}) => {
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
        withCredentials: true,
        params: filters
      };
      
      const response = await axios.get('/budgets', config);
      
      // Map backend _id to id for frontend consistency
      const budgetsWithId = response.data.data.map(budget => ({
        ...budget,
        id: budget._id
      }));
      
      dispatch({
        type: SET_BUDGETS,
        payload: budgetsWithId,
      });
      
      return budgetsWithId;
    } catch (error) {
      console.error('Error fetching budgets:', error);
      dispatch({
        type: SET_ERROR,
        payload: error.response?.data?.message || error.message,
      });
      throw error;
    }
  }, []);

  const fetchBudgetStatus = useCallback(async (budgetId) => {
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
      
      const response = await axios.get(`/budgets/${budgetId}/status`, config);
      
      dispatch({
        type: SET_BUDGET_STATUS,
        payload: response.data.data,
      });
      
      return response.data.data;
    } catch (error) {
      console.error('Error fetching budget status:', error);
      dispatch({
        type: SET_ERROR,
        payload: error.response?.data?.message || error.message,
      });
      throw error;
    }
  }, []);

  const fetchBudgetSummary = useCallback(async () => {
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
      
      const response = await axios.get('/budgets/summary', config);
      
      dispatch({
        type: SET_BUDGET_SUMMARY,
        payload: response.data.data,
      });
      
      return response.data.data;
    } catch (error) {
      console.error('Error fetching budget summary:', error);
      dispatch({
        type: SET_ERROR,
        payload: error.response?.data?.message || error.message,
      });
      throw error;
    }
  }, []);

  const createBudget = useCallback(async (budgetData) => {
    try {
      dispatch({ type: SET_LOADING });
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true
      };
      
      const response = await axios.post('/budgets', budgetData, config);
      
      const newBudget = {
        ...response.data.data,
        id: response.data.data._id
      };
      
      dispatch({
        type: ADD_BUDGET,
        payload: newBudget,
      });
      
      return newBudget;
    } catch (error) {
      console.error('Error creating budget:', error);
      dispatch({
        type: SET_ERROR,
        payload: error.response?.data?.message || error.message,
      });
      throw error;
    }
  }, []);

  const updateBudget = useCallback(async (budgetId, budgetData) => {
    try {
      dispatch({ type: SET_LOADING });
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true
      };
      
      const response = await axios.put(`/budgets/${budgetId}`, budgetData, config);
      
      const updatedBudget = {
        ...response.data.data,
        id: response.data.data._id
      };
      
      dispatch({
        type: UPDATE_BUDGET,
        payload: updatedBudget,
      });
      
      return updatedBudget;
    } catch (error) {
      console.error('Error updating budget:', error);
      dispatch({
        type: SET_ERROR,
        payload: error.response?.data?.message || error.message,
      });
      throw error;
    }
  }, []);

  const deleteBudget = useCallback(async (budgetId) => {
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
      
      await axios.delete(`/budgets/${budgetId}`, config);
      
      dispatch({
        type: DELETE_BUDGET,
        payload: budgetId,
      });
    } catch (error) {
      console.error('Error deleting budget:', error);
      dispatch({
        type: SET_ERROR,
        payload: error.response?.data?.message || error.message,
      });
      throw error;
    }
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
    <BudgetDataContext.Provider 
      value={{ 
        budgets: state.budgets,
        budgetStatus: state.budgetStatus,
        budgetSummary: state.budgetSummary,
        loading: state.loading,
        error: state.error,
        fetchBudgets,
        fetchBudgetStatus,
        fetchBudgetSummary,
        createBudget,
        updateBudget,
        deleteBudget
      }}
    >
      {children}
    </BudgetDataContext.Provider>
  );
};

export default BudgetContext;
