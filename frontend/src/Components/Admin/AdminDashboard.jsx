import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { getUser, logout } from "../utils/helper";

const AdminDashboard = () => {
  const user = getUser();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    products: 0,
    suppliers: 0,
    activeSuppliers: 0,
    totalStock: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Base URL for backend API (port 4001)
  const API_BASE = "http://localhost:4001/api/v1";

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // Attempt admin-level data first
      const [productsRes, suppliersRes] = await Promise.all([
        axios.get(`${API_BASE}/admin/products`),
        axios.get(`${API_BASE}/admin/suppliers`),
      ]);

      const products = productsRes.data.products || productsRes.data || [];
      const suppliers = suppliersRes.data.suppliers || suppliersRes.data || [];
      const activeSuppliers = suppliers.filter((s) => s.isActive);

      setStats({
        products: products.length,
        suppliers: suppliers.length,
        activeSuppliers: activeSuppliers.length,
        totalStock: products.reduce(
          (sum, product) => sum + (product.stock || 0),
          0
        ),
      });
    } catch (err) {
      console.error("Error fetching admin data:", err);
      // Try public fallback
      try {
        const [productsRes, suppliersRes] = await Promise.all([
          axios.get(`${API_BASE}/products`),
          axios.get(`${API_BASE}/suppliers`),
        ]);

        const products = productsRes.data.products || productsRes.data || [];
        const suppliers = suppliersRes.data.suppliers || suppliersRes.data || [];

        setStats({
          products: products.length,
          suppliers: suppliers.length,
          activeSuppliers: suppliers.length,
          totalStock: products.reduce(
            (sum, product) => sum + (product.stock || 0),
            0
          ),
        });
      } catch (fallbackError) {
        console.error("Fallback failed:", fallbackError);
        setError("Failed to load dashboard statistics.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout(() => {
      navigate("/login");
    });
  };

  if (loading) return <div className="loading">Loading dashboard...</div>;

  return (
    <div className="admin-dashboard page-container">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <button className="btn btn-danger logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {error && <div className="alert alert-warning">{error}</div>}

      <div className="user-info">
        <h3>Welcome, {user?.name} 👋</h3>
        <p>
          <strong>Email:</strong> {user?.email}
        </p>
        <p>
          <strong>Role:</strong>{" "}
          <span className="role-badge">{user?.role}</span>
        </p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Products</h3>
          <p className="stat-number">{stats.products}</p>
          <Link to="/admin/products" className="stat-link">
            Manage Products
          </Link>
        </div>

        <div className="stat-card">
          <h3>Total Suppliers</h3>
          <p className="stat-number">{stats.suppliers}</p>
          <Link to="/admin/suppliers" className="stat-link">
            Manage Suppliers
          </Link>
        </div>

        <div className="stat-card">
          <h3>Active Suppliers</h3>
          <p className="stat-number">{stats.activeSuppliers}</p>
        </div>

        <div className="stat-card">
          <h3>Total Stock</h3>
          <p className="stat-number">{stats.totalStock}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="admin-actions">
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          <Link to="/admin/products/new" className="action-card">
            ➕ Add New Product
          </Link>
          <Link to="/admin/suppliers/new" className="action-card">
            👥 Add New Supplier
          </Link>
          <Link to="/admin/products" className="action-card">
            📋 View Products
          </Link>
          <Link to="/admin/suppliers" className="action-card">
            🏢 View Suppliers
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
