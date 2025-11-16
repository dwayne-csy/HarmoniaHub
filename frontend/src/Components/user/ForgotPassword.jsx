import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [backendConnected, setBackendConnected] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    
    try {
      setBackendConnected(true);
      const { data } = await axios.post("http://localhost:4001/api/v1/password/forgot", { email });
      setMessage(data.message || "Password reset link has been sent to your email!");
    } catch (error) {
      setBackendConnected(false);
      setMessage(error.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

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

      <main style={{ 
        flex: 1, 
        padding: "20px 0",
        backgroundColor: "transparent",
        animation: "fadeIn 0.6s ease-in-out",
        position: "relative",
        zIndex: 1,
        margin: 0,
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
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
              50% { transform: translateY(-5px); }
            }
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            
            body {
              margin: 0;
              padding: 0;
              overflow-x: hidden;
              background: transparent;
            }
            * {
              box-sizing: border-box;
            }
          `}
        </style>

        {/* Backend status banner */}
        {!backendConnected && (
          <div style={{
            backgroundColor: 'rgba(212,175,55,0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(212,175,55,0.3)',
            borderRadius: '12px',
            padding: '15px 20px',
            margin: '0 auto 25px',
            textAlign: 'center',
            maxWidth: '500px',
            color: '#d4af37',
            fontWeight: '600',
            animation: 'fadeIn 0.5s ease-out',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
            position: 'absolute',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 2
          }}>
            <strong>⚠️ Connection Issue:</strong> Unable to reach server. Please check your connection.
          </div>
        )}

        <div style={{ 
          maxWidth: "500px", 
          width: "100%",
          margin: "0 auto",
          padding: "0 20px"
        }}>
          {/* Main Forgot Password Card */}
          <div style={{ 
            background: "linear-gradient(135deg, rgba(30,30,30,0.95) 0%, rgba(40,40,40,0.95) 100%)",
            padding: "40px 30px",
            borderRadius: "18px",
            boxShadow: "0 12px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(212,175,55,0.2)",
            border: "1px solid rgba(212,175,55,0.3)",
            position: "relative",
            overflow: "hidden",
            animation: "fadeIn 0.8s ease-out"
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

            {/* Header */}
            <div style={{ textAlign: "center", marginBottom: "30px" }}>
              <div style={{
                fontSize: "4rem",
                marginBottom: "20px",
                animation: "float 4s ease-in-out infinite"
              }}>
                🔒
              </div>
              <h1 style={{ 
                margin: "0 0 10px 0",
                background: "linear-gradient(135deg, #d4af37, #f9e076, #d4af37)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundSize: "200% 100%",
                animation: "shimmer 3s infinite linear",
                fontSize: "2.5rem",
                fontWeight: "bold",
                textShadow: "0 2px 4px rgba(0,0,0,0.3)"
              }}>
                Reset Password
              </h1>
              <p style={{ 
                color: "rgba(255,255,255,0.8)",
                fontSize: "1.1rem",
                margin: 0,
                lineHeight: "1.5"
              }}>
                Enter your email address to receive a password reset link
              </p>
            </div>

            {/* Forgot Password Form */}
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '25px' }}>
                <label style={{ 
                  display: 'block', 
                  color: '#d4af37',
                  fontWeight: '600',
                  marginBottom: '10px',
                  fontSize: '1rem'
                }}>
                  📧 Email Address
                </label>
                <input 
                  type="email" 
                  placeholder="Enter your registered email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                  style={{
                    width: "100%",
                    padding: "15px 20px",
                    background: "rgba(20,20,20,0.7)",
                    border: "1px solid rgba(212,175,55,0.3)",
                    borderRadius: "12px",
                    color: "#ffffff",
                    fontSize: "16px",
                    transition: "all 0.3s ease",
                    backdropFilter: "blur(10px)",
                    outline: "none"
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#d4af37";
                    e.target.style.boxShadow = "0 0 0 2px rgba(212,175,55,0.2)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "rgba(212,175,55,0.3)";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>
              
              <button 
                type="submit" 
                disabled={isLoading}
                style={{
                  width: "100%",
                  padding: "15px 20px",
                  background: isLoading 
                    ? "linear-gradient(135deg, rgba(212,175,55,0.5) 0%, rgba(249,224,118,0.5) 100%)" 
                    : "linear-gradient(135deg, #d4af37 0%, #f9e076 100%)",
                  color: "#1a1a1a",
                  border: "none",
                  borderRadius: "12px",
                  fontSize: "16px",
                  fontWeight: "700",
                  cursor: isLoading ? "not-allowed" : "pointer",
                  transition: "all 0.3s ease",
                  boxShadow: "0 6px 20px rgba(212,175,55,0.4)",
                  position: "relative",
                  overflow: "hidden"
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.target.style.transform = "translateY(-2px)";
                    e.target.style.boxShadow = "0 8px 25px rgba(212,175,55,0.6)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading) {
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = "0 6px 20px rgba(212,175,55,0.4)";
                  }
                }}
              >
                {isLoading ? (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                    <div style={{ width: '20px', height: '20px', border: '2px solid rgba(26,26,26,0.3)', borderTop: '2px solid #1a1a1a', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                    Sending Reset Link...
                  </div>
                ) : (
                  "📨 Send Reset Link"
                )}
              </button>
            </form>

            {/* Message Display */}
            {message && (
              <div style={{ 
                color: message.includes("sent") || message.includes("success") ? "#4caf50" : "#f44336", 
                marginTop: "20px", 
                padding: "15px",
                borderRadius: "12px",
                backgroundColor: message.includes("sent") || message.includes("success") ? "rgba(76,175,80,0.1)" : "rgba(244,67,54,0.1)",
                border: `1px solid ${message.includes("sent") || message.includes("success") ? "rgba(76,175,80,0.3)" : "rgba(244,67,54,0.3)"}`,
                textAlign: 'center',
                fontWeight: '600',
                fontSize: '14px',
                lineHeight: '1.4'
              }}>
                {message.includes("sent") || message.includes("success") ? "✅ " : "❌ "}
                {message}
              </div>
            )}

            {/* Back to Login Link */}
            <div style={{ marginTop: '30px', textAlign: 'center' }}>
              <Link 
                to="/login" 
                style={{ 
                  color: '#d4af37', 
                  textDecoration: 'none',
                  fontWeight: '600',
                  fontSize: '14px',
                  transition: 'all 0.3s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = '#f9e076';
                  e.target.style.textDecoration = 'underline';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = '#d4af37';
                  e.target.style.textDecoration = 'none';
                }}
              >
                ← Back to Login
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ForgotPassword;