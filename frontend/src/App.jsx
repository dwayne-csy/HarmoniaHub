import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Components/user/Login";
import Register from "./Components/user/Register";
import Profile from "./Components/user/Profile";
import UpdateProfile from "./Components/user/UpdateProfile";
import ForgotPassword from "./Components/user/ForgotPassword";
import ResetPassword from "./Components/user/ResetPassword";
import Home from "./Components/user/Home";
import AdminDashboard from "./Components/admin/AdminDashboard";
import AdminRoutes from "./Components/admin/AdminRoutes";
import { getUser } from "./Components/utils/helper";

// Import Product Management Components
import ProductList from "./Components/admin/productmanagement/ProductList";
import CreateProduct from "./Components/admin/productmanagement/CreateProduct";
import UpdateProduct from "./Components/admin/productmanagement/UpdateProduct"; // ✅ Import UpdateProduct

// Import Supplier Management Components
import SupplierList from "./Components/admin/suppliermanagement/SupplierList";
import CreateSupplier from "./Components/admin/suppliermanagement/CreateSupplier";
import UpdateSupplier from "./Components/admin/suppliermanagement/UpdateSupplier";

const App = () => {
  const token = localStorage.getItem("token");
  const user = getUser();

  const getDefaultRoute = () => {
    if (!token) return "/login";
    if (user && user.role === "admin") return "/admin/dashboard";
    return "/home";
  };

  return (
    <Router>
      <Routes>
        {/* Redirect based on role */}
        <Route path="/" element={<Navigate to={getDefaultRoute()} />} />

        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Protected User Routes */}
        <Route path="/home" element={token ? <Home /> : <Navigate to="/login" />} />
        <Route path="/profile" element={token ? <Profile /> : <Navigate to="/login" />} />
        <Route path="/update-profile" element={token ? <UpdateProfile /> : <Navigate to="/login" />} />

        {/* Admin Dashboard */}
        <Route
          path="/admin/dashboard"
          element={
            <AdminRoutes>
              <AdminDashboard />
            </AdminRoutes>
          }
        />

        {/* Product Management */}
        <Route
          path="/admin/products"
          element={
            <AdminRoutes>
              <ProductList />
            </AdminRoutes>
          }
        />
        <Route
          path="/admin/products/new"
          element={
            <AdminRoutes>
              <CreateProduct />
            </AdminRoutes>
          }
        />
        <Route
          path="/admin/products/edit/:id"
          element={
            <AdminRoutes>
              <UpdateProduct /> {/* ✅ Fixed */}
            </AdminRoutes>
          }
        />

        {/* Supplier Management */}
        <Route
          path="/admin/suppliers"
          element={
            <AdminRoutes>
              <SupplierList />
            </AdminRoutes>
          }
        />
        <Route
          path="/admin/suppliers/new"
          element={
            <AdminRoutes>
              <CreateSupplier />
            </AdminRoutes>
          }
        />
        <Route
          path="/admin/suppliers/edit/:id"
          element={
            <AdminRoutes>
              <UpdateSupplier />
            </AdminRoutes>
          }
        />

        {/* Catch all */}
        <Route path="*" element={<Navigate to={getDefaultRoute()} />} />
      </Routes>
    </Router>
  );
};

export default App;
