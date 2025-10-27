// src/Components/admin/AdminRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { getUser } from '../utils/helper';

const AdminRoutes = ({ children }) => {
  const user = getUser();
  
  // Check if user exists and is an admin
  const isAdmin = user && user.role === 'admin';
  
  return isAdmin ? children : <Navigate to="/login" replace />;
};

export default AdminRoutes;