import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Components/user/Login";
import Register from "./Components/user/Register";
import Profile from "./Components/user/Profile";
import UpdateProfile from "./Components/user/UpdateProfile";
import ForgotPassword from "./Components/user/ForgotPassword";
import ResetPassword from "./Components/user/ResetPassword";
import Home from "./Components/Home";
import AdminDashboard from "./Components/admin/AdminDashboard"; // Add this import
import AdminRoute from "./Components/AdminRoute"; // Add this import
import { getUser } from "./Components/utils/helper"; // Add this import

const App = () => {
  const token = localStorage.getItem("token");
  const user = getUser(); // Get user data from localStorage

  // Function to determine the appropriate redirect based on user role
  const getDefaultRoute = () => {
    if (!token) return "/login";
    
    if (user && user.role === 'admin') {
      return "/admin/dashboard";
    }
    
    return "/home";
  };

  return (
    <Router>
      <Routes>
        {/* Redirect based on role and authentication status */}
        <Route path="/" element={<Navigate to={getDefaultRoute()} />} />
        
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        
        {/* Protected User Routes */}
        <Route 
          path="/home" 
          element={
            token ? <Home /> : <Navigate to="/login" />
          } 
        />
        <Route 
          path="/profile" 
          element={
            token ? <Profile /> : <Navigate to="/login" />
          } 
        />
        <Route 
          path="/update-profile" 
          element={
            token ? <UpdateProfile /> : <Navigate to="/login" />
          } 
        />
        
        {/* Admin Routes */}
        <Route 
          path="/admin/dashboard" 
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } 
        />
        
        {/* Catch all route - redirect to appropriate page */}
        <Route path="*" element={<Navigate to={getDefaultRoute()} />} />
      </Routes>
    </Router>
  );
};

export default App;