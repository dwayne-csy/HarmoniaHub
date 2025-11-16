import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import HistoryIcon from "@mui/icons-material/History";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import EditIcon from "@mui/icons-material/Edit";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import MusicNoteIcon from "@mui/icons-material/MusicNote";

const Header = ({ user, cartCount, backendConnected, handleLogout }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navIfConnected = (route) => {
    backendConnected ? navigate(route) : alert("Backend connection required");
  };

  const sharedButtonStyle = {
    padding: "10px",
    backgroundColor: "rgba(255,215,130,0.08)",
    border: "1px solid rgba(255,215,130,0.25)",
    borderRadius: "10px",
    cursor: backendConnected ? "pointer" : "not-allowed",
    display: "flex",
    alignItems: "center",
    color: backendConnected ? "#f5d36b" : "rgba(245,211,107,0.4)",
    transition: "0.2s",
    position: "relative",
  };

  const profileButtonStyle = {
    padding: "10px 14px",
    backgroundColor: "rgba(255,215,130,0.08)",
    border: "1px solid rgba(255,215,130,0.25)",
    borderRadius: "10px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "#f5d36b",
    transition: "0.2s",
  };

  return (
    <header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "18px 35px",
        background: "linear-gradient(90deg, #1a1a1a, #2b2b2b)",
        color: "#f5d36b",
        position: "sticky",
        top: 0,
        zIndex: 1000,
        borderBottom: "2px solid #b8860b",
        boxShadow: "0 6px 18px rgba(0,0,0,0.5)",
      }}
    >
      <div
        onClick={() => navigate("/")}
        style={{ display: "flex", alignItems: "center", cursor: "pointer" }}
      >
        <MusicNoteIcon
          style={{
            fontSize: 36,
            marginRight: 10,
            color: "#f5d36b",
          }}
        />
        <h1
          style={{
            margin: 0,
            fontSize: "1.7rem",
            fontWeight: "700",
            background: "linear-gradient(90deg, #ffd77b, #e6b84a, #fce3a3)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          HarmoniaHub
        </h1>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        <span style={{ fontSize: "1.1rem", fontWeight: "500" }}>
          Welcome, {user?.name || "Guest"}
        </span>

        <button
          onClick={() => navIfConnected("/order-history")}
          disabled={!backendConnected}
          style={sharedButtonStyle}
        >
          <HistoryIcon fontSize="large" />
        </button>

        <button
          onClick={() => navIfConnected("/cart")}
          disabled={!backendConnected}
          style={sharedButtonStyle}
        >
          <ShoppingCartIcon fontSize="large" />
          {cartCount > 0 && backendConnected && (
            <span
              style={{
                position: "absolute",
                top: -5,
                right: -5,
                backgroundColor: "#ff4444",
                color: "#fff",
                borderRadius: "50%",
                padding: "2px 6px",
                fontSize: "12px",
                fontWeight: "bold",
              }}
            >
              {cartCount}
            </span>
          )}
        </button>

        <div style={{ position: "relative" }} ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={profileButtonStyle}
          >
            <AccountCircleIcon />
            <ArrowDropDownIcon />
          </button>

          {dropdownOpen && (
            <div
              style={{
                position: "absolute",
                top: "105%",
                right: 0,
                marginTop: "10px",
                backgroundColor: "#2b2b2b",
                borderRadius: "10px",
                border: "1px solid #b8860b",
                minWidth: "180px",
                overflow: "hidden",
                zIndex: 1001,
              }}
            >
              <button
                onClick={() => backendConnected && navigate("/profile")}
                disabled={!backendConnected}
                style={{
                  width: "100%",
                  padding: "13px 16px",
                  background: "transparent",
                  border: "none",
                  cursor: backendConnected ? "pointer" : "not-allowed",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  color: backendConnected ? "#f5d36b" : "rgba(245,211,107,0.4)",
                  fontSize: "15px",
                  borderBottom: "1px solid #444",
                }}
              >
                <EditIcon fontSize="small" /> Profile
              </button>

              <button
                onClick={handleLogout}
                style={{
                  width: "100%",
                  padding: "13px 16px",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  color: "#ff8f8f",
                  fontSize: "15px",
                }}
              >
                <LogoutIcon fontSize="small" /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
