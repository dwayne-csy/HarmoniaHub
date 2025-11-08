import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Components/user/Login";
import Register from "./Components/user/Register";
import Profile from "./Components/user/Profile";
import UpdateProfile from "./Components/user/UpdateProfile";
import ForgotPassword from "./Components/user/ForgotPassword";
import ResetPassword from "./Components/user/ResetPassword";
import Home from "./Components/user/Home";
import Cart from "./Components/user/Cart";
import CheckoutConfirmation from "./Components/user/CheckoutConfirmation";
import AdminDashboard from "./Components/admin/AdminDashboard";
import AdminRoutes from "./Components/admin/AdminRoutes";
import { getUser } from "./Components/utils/helper";

// Product Management
import ProductList from "./Components/admin/productmanagement/ProductList";
import CreateProduct from "./Components/admin/productmanagement/CreateProduct";
import UpdateProduct from "./Components/admin/productmanagement/UpdateProduct";
import ViewProduct from "./Components/admin/productmanagement/ViewProduct";

// Supplier Management
import SupplierList from "./Components/admin/suppliermanagement/SupplierList";
import CreateSupplier from "./Components/admin/suppliermanagement/CreateSupplier";
import UpdateSupplier from "./Components/admin/suppliermanagement/UpdateSupplier";
import ViewSupplier from "./Components/admin/suppliermanagement/ViewSupplier";

// User Management
import UserList from "./Components/admin/usermanagement/UserList";
import CreateUser from "./Components/admin/usermanagement/CreateUser";
import ViewUser from "./Components/admin/usermanagement/ViewUser";

// Order Management
import OrderList from "./Components/admin/ordermanagement/OrderList";
import UpdateOrder from "./Components/admin/ordermanagement/UpdateOrder";

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
        {/* Default Route */}
        <Route path="/" element={<Navigate to={getDefaultRoute()} />} />

        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* User Protected Routes */}
        <Route path="/home" element={token ? <Home /> : <Navigate to="/login" />} />
        <Route path="/profile" element={token ? <Profile /> : <Navigate to="/login" />} />
        <Route path="/update-profile" element={token ? <UpdateProfile /> : <Navigate to="/login" />} />
        <Route path="/cart" element={token ? <Cart /> : <Navigate to="/login" />} />
        <Route path="/checkout-confirmation" element={token ? <CheckoutConfirmation /> : <Navigate to="/login" />} />

        {/* Admin Dashboard */}
        <Route path="/admin/dashboard" element={<AdminRoutes><AdminDashboard /></AdminRoutes>} />

        {/* Product Management */}
        <Route path="/admin/products" element={<AdminRoutes><ProductList /></AdminRoutes>} />
        <Route path="/admin/products/new" element={<AdminRoutes><CreateProduct /></AdminRoutes>} />
        <Route path="/admin/products/edit/:id" element={<AdminRoutes><UpdateProduct /></AdminRoutes>} />
        <Route path="/admin/products/view/:id" element={<AdminRoutes><ViewProduct /></AdminRoutes>} />

        {/* Supplier Management */}
        <Route path="/admin/suppliers" element={<AdminRoutes><SupplierList /></AdminRoutes>} />
        <Route path="/admin/suppliers/new" element={<AdminRoutes><CreateSupplier /></AdminRoutes>} />
        <Route path="/admin/suppliers/edit/:id" element={<AdminRoutes><UpdateSupplier /></AdminRoutes>} />
        <Route path="/admin/suppliers/view/:id" element={<AdminRoutes><ViewSupplier /></AdminRoutes>} />

        {/* User Management */}
        <Route path="/admin/users" element={<AdminRoutes><UserList /></AdminRoutes>} />
        <Route path="/admin/users/create" element={<AdminRoutes><CreateUser /></AdminRoutes>} />
        <Route path="/admin/users/view/:id" element={<AdminRoutes><ViewUser /></AdminRoutes>} />

        {/* Order Management */}
        <Route path="/admin/orders" element={<AdminRoutes><OrderList /></AdminRoutes>} />
        <Route path="/admin/orders/update/:id" element={<AdminRoutes><UpdateOrder /></AdminRoutes>} />

        {/* Catch-all Redirect */}
        <Route path="*" element={<Navigate to={getDefaultRoute()} />} />
      </Routes>
    </Router>
  );
};

export default App;
