import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LogoutIcon from "@mui/icons-material/Logout";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import MusicNoteIcon from "@mui/icons-material/MusicNote";

const AdminHeader = ({ admin, handleLogout }) => {
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
      {/* Logo + Title */}
      <div
        onClick={() => navigate("/admin/dashboard")}
        style={{
          display: "flex",
          alignItems: "center",
          cursor: "pointer",
        }}
      >
        <MusicNoteIcon
          style={{
            fontSize: 36,
            marginRight: 10,
            color: "#f5d36b",
            filter: "drop-shadow(0 0 4px rgba(255,215,130,0.4))",
          }}
        />
        <h1
          style={{
            margin: 0,
            fontSize: "1.7rem",
            fontWeight: "700",
            letterSpacing: "1.5px",
            background: "linear-gradient(90deg, #ffd77b, #e6b84a, #fce3a3)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textShadow: "0 0 6px rgba(255,218,128,0.5)",
          }}
        >
          HarmoniaHub
        </h1>
      </div>

      {/* Right Section */}
      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        <span
          style={{
            fontSize: "1.1rem",
            color: "#f5d36b",
            opacity: 0.9,
            fontWeight: "500",
          }}
        >
          Welcome, {admin?.name || "Admin"}
        </span>

        {/* Dropdown */}
        <div style={{ position: "relative" }} ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{
              padding: "10px 14px",
              backgroundColor: "rgba(255,215,130,0.08)",
              border: "1px solid rgba(255,215,130,0.25)",
              borderRadius: "10px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: "#f5d36b",
              fontWeight: "500",
              transition: "0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor =
                "rgba(255,215,130,0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor =
                "rgba(255,215,130,0.08)";
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
                top: "105%",
                right: 0,
                marginTop: "10px",
                backgroundColor: "#2b2b2b",
                borderRadius: "10px",
                border: "1px solid #b8860b",
                boxShadow: "0 6px 15px rgba(0,0,0,0.5)",
                minWidth: "170px",
                overflow: "hidden",
                zIndex: 1001,
              }}
            >
              <button
                onClick={handleLogoutClick}
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
                  textAlign: "left",
                  transition: "0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#3c3c3c";
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

export default AdminHeader;
