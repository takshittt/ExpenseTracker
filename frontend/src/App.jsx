import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Signin from "./pages/Signin";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import Signout from "./components/Signout";
import UserProtectWrapper from "./pages/UserProtectWrapper";
import Start from "./pages/Start";
import Expenses from "./pages/Expenses";
import Budget from "./pages/Budget";
import Report from "./pages/Report";
import Account from "./pages/Account";
import AuthSuccess from "./pages/AuthSuccess";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Start />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/register" element={<Signup />} />
        <Route path="/auth-success" element={<AuthSuccess />} />
        <Route path="/expenses" element={<Expenses />} />
        <Route
          path="/home"
          element={
            <UserProtectWrapper>
              <Home />
            </UserProtectWrapper>
          }
        />
        <Route
          path="/budget"
          element={
            <UserProtectWrapper>
              <Budget />
            </UserProtectWrapper>
          }
        />
        <Route
          path="/report"
          element={
            <UserProtectWrapper>
              <Report />
            </UserProtectWrapper>
          }
        />
        <Route
          path="/account"
          element={
            <UserProtectWrapper>
              <Account />
            </UserProtectWrapper>
          }
        />
        <Route
          path="/signout"
          element={
            <UserProtectWrapper>
              <Signout />
            </UserProtectWrapper>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
