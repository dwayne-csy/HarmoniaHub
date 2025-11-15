import React from "react";

const AdminFooter = () => {
  return (
    <footer
      style={{
        background: "linear-gradient(90deg, #2b2b2b, #1a1a1a)",
        color: "#f5d36b",
        padding: "28px 20px",
        textAlign: "center",
        width: "100%",
        marginTop: "auto",
        borderTop: "2px solid #b8860b",
        boxShadow: "0 -6px 15px rgba(0,0,0,0.4)",
      }}
    >
      {/* Metallic Gold Title */}
      <p
        style={{
          margin: 0,
          fontSize: "17px",
          fontWeight: "700",
          letterSpacing: "1.5px",
          background: "linear-gradient(90deg, #ffd77b, #e6b84a, #fce3a3)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          textShadow: "0 0 6px rgba(255,218,128,0.5)",
        }}
      >
        H A R M O N I A H U B
      </p>

      {/* Gold Subtext */}
      <p
        style={{
          margin: "10px 0 0 0",
          fontSize: "13px",
          opacity: 0.85,
          color: "#f0c96c",
        }}
      >
        © 2025 All Rights Reserved 
      </p>

      {/* Very subtle small text */}
      <p
        style={{
          margin: "4px 0 0 0",
          fontSize: "11px",
          opacity: 0.55,
        }}
      >
        Crafted with Precision • Powered by Excellence
      </p>
    </footer>
  );
};

export default AdminFooter;
