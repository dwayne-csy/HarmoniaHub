import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAdmin, isAuthenticated } from './utils/helper';

const AdminRoute = ({ children }) => {
    return isAuthenticated() && isAdmin() ? children : <Navigate to="/login" />;
};

export default AdminRoute;