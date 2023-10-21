import logo from "./logo.svg";
import "./App.css";
import LoginForm from "./pages/LoginForm";
import { Routes, Route, Outlet, useLocation, Navigate } from "react-router-dom";
import { useEffect } from "react";
import Dashboard from "./pages/Dashboard";

function App() {
  const token = localStorage.getItem("token");
  const location = useLocation();

  useEffect(() => {
    if (!token && location.pathname !== "/login") {
      window.location.href = "/login";
    }
  }, [token, location]);

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginForm />} />
        {token ? <Route path="/dashboard" element={<Dashboard />} /> : null}
      </Routes>
    </div>
  );
}

export default App;
