import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import UserContext from "./context/UserContext.jsx";
import ExpensesContext from "./context/ExpensesContext.jsx";
import IncomeContext from "./context/incomeContext.jsx";
import BudgetContext from "./context/BudgetContext.jsx";
import ThemeProvider from "./context/ThemeContext.jsx";
import "./utils/axiosConfig.js";
import { initAuth } from "./utils/auth.js";

// Initialize authentication on app load
initAuth();

createRoot(document.getElementById("root")).render(
  <ThemeProvider>
    <UserContext>
      <ExpensesContext>
        <IncomeContext>
          <BudgetContext>
            <App />
          </BudgetContext>
        </IncomeContext>
      </ExpensesContext>
    </UserContext>
  </ThemeProvider>
);
