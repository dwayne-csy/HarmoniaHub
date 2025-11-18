import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { getUser, logout } from "../utils/helper";
import Loader from "../layouts/Loader";
import AdminHeader from "../layouts/admin/AdminHeader";
import AdminFooter from "../layouts/admin/AdminFooter";

// Icons for visual enhancement
const StatsIcons = {
  products: "📦",
  suppliers: "🏢", 
  users: "👥",
  orders: "📋",
  reviews: "⭐"
};

const AdminDashboard = () => {
  const user = getUser();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    products: 0,
    suppliers: 0,
    users: 0,
    orders: 0,
    reviews: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const API_BASE = "http://localhost:4001/api/v1";

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const [productsRes, suppliersRes, usersRes, ordersRes, reviewsRes] =
        await Promise.all([
          axios.get(`${API_BASE}/products`, config),
          axios.get(`${API_BASE}/suppliers`, config),
          axios.get(`${API_BASE}/users`, config),
          axios.get(`${API_BASE}/admin/orders`, config),
          axios.get(`${API_BASE}/admin/reviews`, config),
        ]);

      const products = productsRes.data.products || productsRes.data || [];
      const suppliers = suppliersRes.data.suppliers || suppliersRes.data || [];
      const users = usersRes.data.users || [];
      const orders = ordersRes.data.orders || [];
      const reviews = reviewsRes.data.reviews || [];

      setStats({
        products: products.length,
        suppliers: suppliers.length,
        users: users.length,
        orders: orders.length,
        reviews: reviews.length,
      });
      setIsDataLoaded(true);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load dashboard statistics.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout(() => navigate("/login"));
  };

  const handleViewSalesAnalytics = () => {
    navigate('/admin/sales-analytics');
  };

  if (loading)
    return (
      <div style={{ 
        display: "flex", 
        flexDirection: "column", 
        minHeight: "100vh",
        margin: 0,
        padding: 0 
      }}>
        <AdminHeader admin={user} handleLogout={handleLogout} />
        <div className="loader-container" style={{ 
          flex: 1, 
          display: "flex", 
          justifyContent: "center", 
          alignItems: "center",
          margin: 0,
          padding: 0 
        }}>
          <Loader />
        </div>
        <AdminFooter />
      </div>
    );

  return (
    <div style={{ 
      display: "flex", 
      flexDirection: "column", 
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 50%, #2d2d2d 100%)",
      position: "relative",
      overflow: "hidden",
      margin: 0,
      padding: 0 
    }}>
      {/* Gold shimmer overlay */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "radial-gradient(circle at 20% 80%, rgba(212,175,55,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(212,175,55,0.05) 0%, transparent 50%)",
        pointerEvents: "none",
        zIndex: 0
      }}></div>

      {/* Admin Header */}
      <AdminHeader admin={user} handleLogout={handleLogout} />

      <main style={{ 
        flex: 1, 
        padding: "0", // Remove padding to eliminate white gaps
        backgroundColor: "transparent",
        animation: "fadeIn 0.6s ease-in-out",
        position: "relative",
        zIndex: 1,
        margin: 0,
        width: "100%"
      }}>
        <style>
          {`
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(10px); }
              to { opacity: 1; transform: translateY(0); }
            }
            @keyframes pulse {
              0% { transform: scale(1); }
              50% { transform: scale(1.05); }
              100% { transform: scale(1); }
            }
            @keyframes shimmer {
              0% { background-position: -1000px 0; }
              100% { background-position: 1000px 0; }
            }
            @keyframes float {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-10px); }
            }
            
            /* Remove default body margins */
            body {
              margin: 0;
              padding: 0;
              overflow-x: hidden;
            }
          `}
        </style>
        
        <div className="admin-dashboard" style={{ 
          maxWidth: "100%", 
          margin: "0",
          padding: "20px 0" // Remove side padding to eliminate white gaps
        }}>
          {/* Main Dashboard Header */}
          <div style={{ 
            background: "linear-gradient(135deg, rgba(212,175,55,0.15) 0%, rgba(192,156,39,0.1) 100%)",
            backdropFilter: "blur(15px)",
            padding: "30px", 
            borderRadius: "0", // Remove border radius for full width
            boxShadow: "0 12px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(212,175,55,0.2)",
            marginBottom: "30px",
            border: "1px solid rgba(212,175,55,0.3)",
            position: "relative",
            overflow: "hidden",
            animation: "fadeIn 0.8s ease-out",
            width: "100%"
          }}>
            {/* Gold accent line */}
            <div style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "3px",
              background: "linear-gradient(90deg, transparent, #d4af37, transparent)",
              animation: "shimmer 3s infinite linear"
            }}></div>
            
            <div style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center", 
              flexWrap: "wrap", 
              gap: "20px",
              maxWidth: "1200px",
              margin: "0 auto",
              padding: "0 20px"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                <div style={{
                  width: "60px",
                  height: "60px",
                  background: "linear-gradient(135deg, #d4af37, #f9e076)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.8rem",
                  boxShadow: "0 4px 15px rgba(212,175,55,0.4)",
                  animation: "float 4s ease-in-out infinite"
                }}>
                  {/* crown */}
                  🎵
                </div>
                <div>
                  <span style={{ 
                    backgroundColor: "rgba(212,175,55,0.2)", 
                    color: "#d4af37", 
                    padding: "8px 20px", 
                    borderRadius: "25px", 
                    fontSize: "14px",
                    fontWeight: "bold",
                    border: "1px solid rgba(212,175,55,0.3)",
                    backdropFilter: "blur(10px)"
                  }}>
                    {user?.role}
                  </span>
                </div>
              </div>
              
              <div style={{
                display: "flex",
                gap: "10px",
                alignItems: "center"
              }}>
                <div style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  backgroundColor: isDataLoaded ? "#d4af37" : "#ffd700",
                  animation: isDataLoaded ? "pulse 2s infinite" : "none",
                  boxShadow: "0 0 10px rgba(212,175,55,0.5)"
                }}></div>
                <small style={{ color: "#d4af37", fontWeight: "600" }}>
                  {isDataLoaded ? "" : "Loading Data..."}
                </small>
              </div>
            </div>

            {/* Sales Analytics Button */}
            <div style={{ 
              marginTop: "25px", 
              display: "flex", 
              gap: "15px", 
              flexWrap: "wrap",
              maxWidth: "1200px",
              margin: "25px auto 0",
              padding: "0 20px"
            }}>
              <button
                onClick={handleViewSalesAnalytics}
                style={{
                  padding: "14px 28px",
                  background: "linear-gradient(135deg, #d4af37 0%, #f9e076 100%)",
                  color: "#1a1a1a",
                  border: "none",
                  borderRadius: "12px",
                  fontSize: "15px",
                  fontWeight: "700",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  boxShadow: "0 6px 20px rgba(212,175,55,0.4)",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  position: "relative",
                  overflow: "hidden"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.boxShadow = "0 10px 25px rgba(212,175,55,0.6)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 6px 20px rgba(212,175,55,0.4)";
                }}
              >
                <span style={{ fontSize: "1.2rem" }}>📊</span>
                View Sales Analytics
              </button>
            </div>
          </div>

          {error && (
            <div style={{
              backgroundColor: "rgba(212,175,55,0.1)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(212,175,55,0.3)",
              color: "#d4af37",
              padding: "15px 20px",
              borderRadius: "12px",
              marginBottom: "25px",
              animation: "fadeIn 0.5s ease-out",
              boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
              maxWidth: "1200px",
              margin: "0 auto 25px",
              marginLeft: "20px",
              marginRight: "20px"
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* Stats Grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "25px",
            marginBottom: "30px",
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "0 20px"
          }}>
            {/* Products Card */}
            <div style={{
              background: "linear-gradient(135deg, rgba(30,30,30,0.9) 0%, rgba(40,40,40,0.9) 100%)",
              padding: "25px",
              borderRadius: "18px",
              boxShadow: "0 8px 25px rgba(0,0,0,0.4), inset 0 1px 0 rgba(212,175,55,0.1)",
              textAlign: "center",
              border: "1px solid rgba(212,175,55,0.2)",
              transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
              position: "relative",
              overflow: "hidden"
            }} 
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-8px) scale(1.02)";
              e.currentTarget.style.boxShadow = "0 15px 35px rgba(0,0,0,0.5), inset 0 1px 0 rgba(212,175,55,0.2)";
              e.currentTarget.style.border = "1px solid rgba(212,175,55,0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0) scale(1)";
              e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.4), inset 0 1px 0 rgba(212,175,55,0.1)";
              e.currentTarget.style.border = "1px solid rgba(212,175,55,0.2)";
            }}>
              <div style={{
                position: "absolute",
                top: "15px",
                right: "15px",
                fontSize: "1.8rem",
                opacity: "0.15",
                transform: "scale(2)"
              }}>
                {StatsIcons.products}
              </div>
              <h3 style={{ 
                margin: "0 0 15px 0", 
                color: "#d4af37", 
                fontSize: "1.2rem", 
                fontWeight: "600",
                textShadow: "0 2px 4px rgba(0,0,0,0.3)"
              }}>
                Total Products
              </h3>
              <p style={{ 
                fontSize: "3.2rem", 
                fontWeight: "800", 
                margin: "0 0 20px 0",
                background: "linear-gradient(135deg, #d4af37, #f9e076, #d4af37)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundSize: "200% 100%",
                animation: isDataLoaded ? "shimmer 3s infinite linear" : "none",
                textShadow: "0 4px 8px rgba(0,0,0,0.3)"
              }}>
                {stats.products}
              </p>
              <Link 
                to="/admin/products" 
                style={{
                  display: "inline-block",
                  padding: "12px 24px",
                  background: "linear-gradient(135deg, rgba(212,175,55,0.2) 0%, rgba(212,175,55,0.1) 100%)",
                  color: "#d4af37",
                  textDecoration: "none",
                  borderRadius: "10px",
                  fontSize: "14px",
                  fontWeight: "600",
                  transition: "all 0.3s ease",
                  boxShadow: "0 4px 15px rgba(212,175,55,0.3)",
                  border: "1px solid rgba(212,175,55,0.3)",
                  backdropFilter: "blur(10px)",
                  position: "relative",
                  zIndex: "1"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 6px 20px rgba(212,175,55,0.5)";
                  e.currentTarget.style.background = "linear-gradient(135deg, rgba(212,175,55,0.3) 0%, rgba(212,175,55,0.2) 100%)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 15px rgba(212,175,55,0.3)";
                  e.currentTarget.style.background = "linear-gradient(135deg, rgba(212,175,55,0.2) 0%, rgba(212,175,55,0.1) 100%)";
                }}
              >
                Manage Products
              </Link>
            </div>

            {/* Repeat similar structure for other cards (Suppliers, Users, Orders, Reviews) */}
            {/* Suppliers Card */}
            <div style={{
              background: "linear-gradient(135deg, rgba(30,30,30,0.9) 0%, rgba(40,40,40,0.9) 100%)",
              padding: "25px",
              borderRadius: "18px",
              boxShadow: "0 8px 25px rgba(0,0,0,0.4), inset 0 1px 0 rgba(212,175,55,0.1)",
              textAlign: "center",
              border: "1px solid rgba(212,175,55,0.2)",
              transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
              position: "relative",
              overflow: "hidden"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-8px) scale(1.02)";
              e.currentTarget.style.boxShadow = "0 15px 35px rgba(0,0,0,0.5), inset 0 1px 0 rgba(212,175,55,0.2)";
              e.currentTarget.style.border = "1px solid rgba(212,175,55,0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0) scale(1)";
              e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.4), inset 0 1px 0 rgba(212,175,55,0.1)";
              e.currentTarget.style.border = "1px solid rgba(212,175,55,0.2)";
            }}>
              <div style={{
                position: "absolute",
                top: "15px",
                right: "15px",
                fontSize: "1.8rem",
                opacity: "0.15",
                transform: "scale(2)"
              }}>
                {StatsIcons.suppliers}
              </div>
              <h3 style={{ 
                margin: "0 0 15px 0", 
                color: "#d4af37", 
                fontSize: "1.2rem", 
                fontWeight: "600",
                textShadow: "0 2px 4px rgba(0,0,0,0.3)"
              }}>
                Total Suppliers
              </h3>
              <p style={{ 
                fontSize: "3.2rem", 
                fontWeight: "800", 
                margin: "0 0 20px 0",
                background: "linear-gradient(135deg, #d4af37, #f9e076, #d4af37)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundSize: "200% 100%",
                animation: isDataLoaded ? "shimmer 3s infinite 0.2s linear" : "none",
                textShadow: "0 4px 8px rgba(0,0,0,0.3)"
              }}>
                {stats.suppliers}
              </p>
              <Link 
                to="/admin/suppliers" 
                style={{
                  display: "inline-block",
                  padding: "12px 24px",
                  background: "linear-gradient(135deg, rgba(212,175,55,0.2) 0%, rgba(212,175,55,0.1) 100%)",
                  color: "#d4af37",
                  textDecoration: "none",
                  borderRadius: "10px",
                  fontSize: "14px",
                  fontWeight: "600",
                  transition: "all 0.3s ease",
                  boxShadow: "0 4px 15px rgba(212,175,55,0.3)",
                  border: "1px solid rgba(212,175,55,0.3)",
                  backdropFilter: "blur(10px)",
                  position: "relative",
                  zIndex: "1"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 6px 20px rgba(212,175,55,0.5)";
                  e.currentTarget.style.background = "linear-gradient(135deg, rgba(212,175,55,0.3) 0%, rgba(212,175,55,0.2) 100%)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 15px rgba(212,175,55,0.3)";
                  e.currentTarget.style.background = "linear-gradient(135deg, rgba(212,175,55,0.2) 0%, rgba(212,175,55,0.1) 100%)";
                }}
              >
                Manage Suppliers
              </Link>
            </div>

            {/* Users Card */}
            <div style={{
              background: "linear-gradient(135deg, rgba(30,30,30,0.9) 0%, rgba(40,40,40,0.9) 100%)",
              padding: "25px",
              borderRadius: "18px",
              boxShadow: "0 8px 25px rgba(0,0,0,0.4), inset 0 1px 0 rgba(212,175,55,0.1)",
              textAlign: "center",
              border: "1px solid rgba(212,175,55,0.2)",
              transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
              position: "relative",
              overflow: "hidden"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-8px) scale(1.02)";
              e.currentTarget.style.boxShadow = "0 15px 35px rgba(0,0,0,0.5), inset 0 1px 0 rgba(212,175,55,0.2)";
              e.currentTarget.style.border = "1px solid rgba(212,175,55,0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0) scale(1)";
              e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.4), inset 0 1px 0 rgba(212,175,55,0.1)";
              e.currentTarget.style.border = "1px solid rgba(212,175,55,0.2)";
            }}>
              <div style={{
                position: "absolute",
                top: "15px",
                right: "15px",
                fontSize: "1.8rem",
                opacity: "0.15",
                transform: "scale(2)"
              }}>
                {StatsIcons.users}
              </div>
              <h3 style={{ 
                margin: "0 0 15px 0", 
                color: "#d4af37", 
                fontSize: "1.2rem", 
                fontWeight: "600",
                textShadow: "0 2px 4px rgba(0,0,0,0.3)"
              }}>
                Total Users
              </h3>
              <p style={{ 
                fontSize: "3.2rem", 
                fontWeight: "800", 
                margin: "0 0 20px 0",
                background: "linear-gradient(135deg, #d4af37, #f9e076, #d4af37)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundSize: "200% 100%",
                animation: isDataLoaded ? "shimmer 3s infinite 0.4s linear" : "none",
                textShadow: "0 4px 8px rgba(0,0,0,0.3)"
              }}>
                {stats.users}
              </p>
              <Link 
                to="/admin/users" 
                style={{
                  display: "inline-block",
                  padding: "12px 24px",
                  background: "linear-gradient(135deg, rgba(212,175,55,0.2) 0%, rgba(212,175,55,0.1) 100%)",
                  color: "#d4af37",
                  textDecoration: "none",
                  borderRadius: "10px",
                  fontSize: "14px",
                  fontWeight: "600",
                  transition: "all 0.3s ease",
                  boxShadow: "0 4px 15px rgba(212,175,55,0.3)",
                  border: "1px solid rgba(212,175,55,0.3)",
                  backdropFilter: "blur(10px)",
                  position: "relative",
                  zIndex: "1"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 6px 20px rgba(212,175,55,0.5)";
                  e.currentTarget.style.background = "linear-gradient(135deg, rgba(212,175,55,0.3) 0%, rgba(212,175,55,0.2) 100%)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 15px rgba(212,175,55,0.3)";
                  e.currentTarget.style.background = "linear-gradient(135deg, rgba(212,175,55,0.2) 0%, rgba(212,175,55,0.1) 100%)";
                }}
              >
                Manage Users
              </Link>
            </div>

            {/* Orders Card */}
            <div style={{
              background: "linear-gradient(135deg, rgba(30,30,30,0.9) 0%, rgba(40,40,40,0.9) 100%)",
              padding: "25px",
              borderRadius: "18px",
              boxShadow: "0 8px 25px rgba(0,0,0,0.4), inset 0 1px 0 rgba(212,175,55,0.1)",
              textAlign: "center",
              border: "1px solid rgba(212,175,55,0.2)",
              transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
              position: "relative",
              overflow: "hidden"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-8px) scale(1.02)";
              e.currentTarget.style.boxShadow = "0 15px 35px rgba(0,0,0,0.5), inset 0 1px 0 rgba(212,175,55,0.2)";
              e.currentTarget.style.border = "1px solid rgba(212,175,55,0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0) scale(1)";
              e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.4), inset 0 1px 0 rgba(212,175,55,0.1)";
              e.currentTarget.style.border = "1px solid rgba(212,175,55,0.2)";
            }}>
              <div style={{
                position: "absolute",
                top: "15px",
                right: "15px",
                fontSize: "1.8rem",
                opacity: "0.15",
                transform: "scale(2)"
              }}>
                {StatsIcons.orders}
              </div>
              <h3 style={{ 
                margin: "0 0 15px 0", 
                color: "#d4af37", 
                fontSize: "1.2rem", 
                fontWeight: "600",
                textShadow: "0 2px 4px rgba(0,0,0,0.3)"
              }}>
                Total Orders
              </h3>
              <p style={{ 
                fontSize: "3.2rem", 
                fontWeight: "800", 
                margin: "0 0 20px 0",
                background: "linear-gradient(135deg, #d4af37, #f9e076, #d4af37)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundSize: "200% 100%",
                animation: isDataLoaded ? "shimmer 3s infinite 0.6s linear" : "none",
                textShadow: "0 4px 8px rgba(0,0,0,0.3)"
              }}>
                {stats.orders}
              </p>
              <Link 
                to="/admin/orders" 
                style={{
                  display: "inline-block",
                  padding: "12px 24px",
                  background: "linear-gradient(135deg, rgba(212,175,55,0.2) 0%, rgba(212,175,55,0.1) 100%)",
                  color: "#d4af37",
                  textDecoration: "none",
                  borderRadius: "10px",
                  fontSize: "14px",
                  fontWeight: "600",
                  transition: "all 0.3s ease",
                  boxShadow: "0 4px 15px rgba(212,175,55,0.3)",
                  border: "1px solid rgba(212,175,55,0.3)",
                  backdropFilter: "blur(10px)",
                  position: "relative",
                  zIndex: "1"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 6px 20px rgba(212,175,55,0.5)";
                  e.currentTarget.style.background = "linear-gradient(135deg, rgba(212,175,55,0.3) 0%, rgba(212,175,55,0.2) 100%)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 15px rgba(212,175,55,0.3)";
                  e.currentTarget.style.background = "linear-gradient(135deg, rgba(212,175,55,0.2) 0%, rgba(212,175,55,0.1) 100%)";
                }}
              >
                Manage Orders
              </Link>
            </div>

            {/* Reviews Card */}
            <div style={{
              background: "linear-gradient(135deg, rgba(30,30,30,0.9) 0%, rgba(40,40,40,0.9) 100%)",
              padding: "25px",
              borderRadius: "18px",
              boxShadow: "0 8px 25px rgba(0,0,0,0.4), inset 0 1px 0 rgba(212,175,55,0.1)",
              textAlign: "center",
              border: "1px solid rgba(212,175,55,0.2)",
              transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
              position: "relative",
              overflow: "hidden"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-8px) scale(1.02)";
              e.currentTarget.style.boxShadow = "0 15px 35px rgba(0,0,0,0.5), inset 0 1px 0 rgba(212,175,55,0.2)";
              e.currentTarget.style.border = "1px solid rgba(212,175,55,0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0) scale(1)";
              e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.4), inset 0 1px 0 rgba(212,175,55,0.1)";
              e.currentTarget.style.border = "1px solid rgba(212,175,55,0.2)";
            }}>
              <div style={{
                position: "absolute",
                top: "15px",
                right: "15px",
                fontSize: "1.8rem",
                opacity: "0.15",
                transform: "scale(2)"
              }}>
                {StatsIcons.reviews}
              </div>
              <h3 style={{ 
                margin: "0 0 15px 0", 
                color: "#d4af37", 
                fontSize: "1.2rem", 
                fontWeight: "600",
                textShadow: "0 2px 4px rgba(0,0,0,0.3)"
              }}>
                Total Reviews
              </h3>
              <p style={{ 
                fontSize: "3.2rem", 
                fontWeight: "800", 
                margin: "0 0 20px 0",
                background: "linear-gradient(135deg, #d4af37, #f9e076, #d4af37)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundSize: "200% 100%",
                animation: isDataLoaded ? "shimmer 3s infinite 0.8s linear" : "none",
                textShadow: "0 4px 8px rgba(0,0,0,0.3)"
              }}>
                {stats.reviews}
              </p>
              <Link 
                to="/admin/reviews" 
                style={{
                  display: "inline-block",
                  padding: "12px 24px",
                  background: "linear-gradient(135deg, rgba(212,175,55,0.2) 0%, rgba(212,175,55,0.1) 100%)",
                  color: "#d4af37",
                  textDecoration: "none",
                  borderRadius: "10px",
                  fontSize: "14px",
                  fontWeight: "600",
                  transition: "all 0.3s ease",
                  boxShadow: "0 4px 15px rgba(212,175,55,0.3)",
                  border: "1px solid rgba(212,175,55,0.3)",
                  backdropFilter: "blur(10px)",
                  position: "relative",
                  zIndex: "1"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 6px 20px rgba(212,175,55,0.5)";
                  e.currentTarget.style.background = "linear-gradient(135deg, rgba(212,175,55,0.3) 0%, rgba(212,175,55,0.2) 100%)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 15px rgba(212,175,55,0.3)";
                  e.currentTarget.style.background = "linear-gradient(135deg, rgba(212,175,55,0.2) 0%, rgba(212,175,55,0.1) 100%)";
                }}
              >
                Manage Reviews
              </Link>
            </div>
          </div>
        </div>

        {/* Floating Crown Icon */}
        <div
          style={{
            position: "fixed",
            bottom: "30px",
            right: "30px",
            zIndex: "1000",
            animation: "float 4s ease-in-out infinite",
            fontSize: "2.5rem",
            filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.3))",
            opacity: "0.7"
          }}
        >
          🎵
        </div>
      </main>

      {/* Admin Footer */}
      <AdminFooter />
    </div>
  );
};

export default AdminDashboard;