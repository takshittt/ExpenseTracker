import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import UserContext from "./context/UserContext.jsx";
import ExpensesContext from "./context/ExpensesContext.jsx";
import IncomeContext from "./context/incomeContext.jsx";
import BudgetContext from "./context/BudgetContext.jsx";

createRoot(document.getElementById("root")).render(
  <UserContext>
    <ExpensesContext>
      <IncomeContext>
        <BudgetContext>
          <App />
        </BudgetContext>
      </IncomeContext>
    </ExpensesContext>
  </UserContext>
);
