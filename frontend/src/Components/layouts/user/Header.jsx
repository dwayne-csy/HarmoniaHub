import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import HistoryIcon from "@mui/icons-material/History";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import EditIcon from "@mui/icons-material/Edit";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

const Header = ({ user, cartCount, backendConnected, handleLogout }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOrderHistory = () => {
    if (backendConnected) {
      navigate("/order-history");
    } else {
      alert("Backend connection required");
    }
  };

  const handleCart = () => {
    if (backendConnected) {
      navigate("/cart");
    } else {
      alert("Backend connection required");
    }
  };

  const handleEditProfile = () => {
    setDropdownOpen(false);
    if (backendConnected) {
      navigate("/profile");
    } else {
      alert("Backend connection required");
    }
  };

  const handleLogoutClick = () => {
    setDropdownOpen(false);
    handleLogout();
  };

  return (
    <header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "15px 30px",
        backgroundColor: "#fff",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        position: "sticky",
        top: 0,
        zIndex: 1000,
      }}
    >
      {/* Left Side - Logo and Welcome */}
      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        <h1
          style={{
            margin: 0,
            fontSize: "1.5rem",
            color: "#1976d2",
            fontWeight: "bold",
            cursor: "pointer",
          }}
          onClick={() => navigate("/")}
        >
          HarmoniaHub
        </h1>
        <span style={{ fontSize: "1rem", color: "#555" }}>
          Welcome, {user?.name || "Guest"}
        </span>
      </div>

      {/* Right Side - Buttons and Dropdown */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "15px",
        }}
      >
        {/* Order History Button */}
        <button
          onClick={handleOrderHistory}
          disabled={!backendConnected}
          style={{
            padding: "8px",
            backgroundColor: "transparent",
            border: "none",
            cursor: backendConnected ? "pointer" : "not-allowed",
            display: "flex",
            alignItems: "center",
            color: backendConnected ? "#1976d2" : "#ccc",
            transition: "color 0.3s",
          }}
          title={backendConnected ? "Order History" : "Backend connection required"}
        >
          <HistoryIcon fontSize="large" />
        </button>

        {/* Cart Button */}
        <button
          onClick={handleCart}
          disabled={!backendConnected}
          style={{
            padding: "8px",
            backgroundColor: "transparent",
            border: "none",
            cursor: backendConnected ? "pointer" : "not-allowed",
            display: "flex",
            alignItems: "center",
            color: backendConnected ? "#1976d2" : "#ccc",
            position: "relative",
            transition: "color 0.3s",
          }}
          title={backendConnected ? "Cart" : "Backend connection required"}
        >
          <ShoppingCartIcon fontSize="large" />
          {cartCount > 0 && backendConnected && (
            <span
              style={{
                position: "absolute",
                top: -2,
                right: -2,
                backgroundColor: "red",
                color: "white",
                borderRadius: "50%",
                padding: "2px 6px",
                fontSize: "12px",
                fontWeight: "bold",
                minWidth: "20px",
                textAlign: "center",
              }}
            >
              {cartCount}
            </span>
          )}
        </button>

        {/* Profile Dropdown */}
        <div style={{ position: "relative" }} ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{
              padding: "8px 12px",
              backgroundColor: "transparent",
              border: "1px solid #1976d2",
              borderRadius: "8px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "5px",
              color: "#1976d2",
              fontWeight: "500",
              transition: "all 0.3s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#e3f2fd";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <AccountCircleIcon />
            <ArrowDropDownIcon />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                right: 0,
                marginTop: "8px",
                backgroundColor: "#fff",
                border: "1px solid #ddd",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                minWidth: "180px",
                overflow: "hidden",
                zIndex: 1001,
              }}
            >
              <button
                onClick={handleEditProfile}
                disabled={!backendConnected}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  backgroundColor: "transparent",
                  border: "none",
                  cursor: backendConnected ? "pointer" : "not-allowed",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  color: backendConnected ? "#333" : "#ccc",
                  fontSize: "14px",
                  textAlign: "left",
                  transition: "background-color 0.2s",
                }}
                onMouseEnter={(e) => {
                  if (backendConnected) {
                    e.currentTarget.style.backgroundColor = "#f5f5f5";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <EditIcon fontSize="small" />
                Edit Profile
              </button>

              <div style={{ height: "1px", backgroundColor: "#eee" }} />

              <button
                onClick={handleLogoutClick}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  backgroundColor: "transparent",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  color: "#d32f2f",
                  fontSize: "14px",
                  textAlign: "left",
                  transition: "background-color 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#ffebee";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <LogoutIcon fontSize="small" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;