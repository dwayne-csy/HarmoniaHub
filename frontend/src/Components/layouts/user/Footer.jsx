import React from "react";

const Footer = () => {
  return (
    <footer
      style={{
        background: "linear-gradient(90deg, #2b2b2b, #1a1a1a)",
        color: "#f5d36b",
        padding: "26px 20px",
        textAlign: "center",
        width: "100%",
        marginTop: "auto",
        borderTop: "2px solid #b8860b",
        boxShadow: "0 -6px 15px rgba(0,0,0,0.4)",
      }}
    >
      <p
        style={{
          margin: 0,
          fontSize: "16px",
          fontWeight: "700",
          letterSpacing: "1.2px",
          background: "linear-gradient(90deg, #ffd77b, #e6b84a, #fce3a3)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        HarmoniaHub
      </p>

      <p
        style={{
          marginTop: "8px",
          fontSize: "12px",
          opacity: 0.85,
          color: "#f0c96c",
        }}
      >
        © 2025 All Rights Reserved
      </p>
    </footer>
  );
};

export default Footer;
