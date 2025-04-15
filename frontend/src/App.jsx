import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import Signin from "./pages/Signin";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import Signout from "./components/Signout";
import UserProtectWrapper from "./pages/UserProtectWrapper";
import Start from './pages/Start';
import Expenses from './pages/Expenses';
import Budget from './pages/Budget';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Start />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/register" element={<Signup />} />
        <Route path="/expenses" element={<Expenses />} />
        <Route path="/home" element={
          <UserProtectWrapper>
            <Home />
          </UserProtectWrapper>
        } />
        <Route path="/budget" element={
          <UserProtectWrapper>
            <Budget />
          </UserProtectWrapper>
        } />
        <Route path="/Signout" element={
          <UserProtectWrapper>
            <Signout />
          </UserProtectWrapper>
        } />
      </Routes>
    </Router>
  );
};

export default App;
