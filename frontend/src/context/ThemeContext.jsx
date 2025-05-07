import React, { createContext, useState, useEffect } from "react";

// Create the context
export const ThemeContext = createContext();

const ThemeProvider = ({ children }) => {
  // Check if dark mode was previously enabled
  const savedDarkMode = localStorage.getItem("darkMode") === "true";
  const [darkMode, setDarkMode] = useState(savedDarkMode);

  // Apply dark mode class to HTML element
  useEffect(() => {
    const htmlElement = document.documentElement;
    
    if (darkMode) {
      htmlElement.classList.add("dark");
    } else {
      htmlElement.classList.remove("dark");
    }
    
    // Save preference to localStorage
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(prevMode => !prevMode);
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider; 