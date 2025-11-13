import React, { useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../../config/firebase";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const GoogleLogin = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
  setMessage("");
  setIsLoading(true);

  try {
    // Sign in with Google using Firebase
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Get the Firebase ID token
    const idToken = await user.getIdToken();

    console.log("🔥 Google login successful:", user.email);
    console.log("📧 ID Token received");

    // Send the token to your backend
    const { data } = await axios.post("http://localhost:4001/api/v1/firebase/auth/google", {
      idToken
    });

    console.log("✅ Backend authentication successful");
    console.log("🔐 JWT Token received:", data.token ? "Yes" : "No");

    // Verify the token structure
    if (!data.token) {
      throw new Error("No JWT token received from backend");
    }

    // Store user data in localStorage
    localStorage.setItem("token", data.token);
    localStorage.setItem(
      "user",
      JSON.stringify({
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
        id: data.user._id,
        avatar: data.user.avatar
      })
    );

    setMessage("Google login successful! Redirecting...");

    // Redirect based on role
    setTimeout(() => {
      if (data.user.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/user/home");
      }
    }, 1000);

  } catch (error) {
    console.error("❌ Google login error:", error);
    
    // Enhanced error handling
    if (error.code === 'auth/popup-closed-by-user') {
      setMessage("Google login was cancelled. Please try again.");
    } else if (error.code === 'auth/popup-blocked') {
      setMessage("Popup was blocked by your browser. Please allow popups for this site.");
    } else if (error.code === 'auth/network-request-failed') {
      setMessage("Network error. Please check your internet connection.");
    } else if (error.response?.status === 401) {
      setMessage("Authentication failed. Please try again.");
    } else if (error.message.includes("No JWT token")) {
      setMessage("Server error: No authentication token received.");
    } else {
      setMessage("Google login failed. Please try again.");
    }
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="form-container">
      <h2>Login with Google</h2>
      
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <p>Sign in to HarmoniaHub using your Google account</p>
      </div>

      {/* Google Login Button */}
      <button 
        onClick={handleGoogleLogin}
        disabled={isLoading}
        style={{ 
          background: '#ffffff',
          color: '#757575',
          width: '100%',
          padding: '12px',
          border: '1px solid #dadce0',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '16px',
          fontWeight: '500',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          transition: 'all 0.3s ease'
        }}
        onMouseOver={(e) => {
          e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
          e.target.style.background = '#f8f9fa';
        }}
        onMouseOut={(e) => {
          e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
          e.target.style.background = '#ffffff';
        }}
      >
        {isLoading ? (
          <>
            <div style={{ width: '20px', height: '20px', border: '2px solid #f3f3f3', borderTop: '2px solid #757575', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            Connecting to Google...
          </>
        ) : (
          <>
            <img 
              src="https://developers.google.com/identity/images/g-logo.png" 
              alt="Google" 
              style={{ width: '20px', height: '20px' }}
            />
            Continue with Google
          </>
        )}
      </button>

      {/* Message Display */}
      {message && (
        <div style={{ 
          color: message.includes("successful") ? "green" : "red", 
          marginTop: "20px", 
          padding: "12px",
          borderRadius: "6px",
          backgroundColor: message.includes("successful") ? "#f0fff0" : "#fff0f0",
          border: `1px solid ${message.includes("successful") ? "#00ff00" : "#ff0000"}`,
          textAlign: 'center'
        }}>
          {message}
        </div>
      )}

      {/* Back to Login */}
      <div style={{ textAlign: 'center', marginTop: '30px' }}>
        <Link 
          to="/login" 
          style={{ 
            color: '#4285f4', 
            textDecoration: 'none',
            fontSize: '14px'
          }}
        >
          ← Back to Login Options
        </Link>
      </div>

      {/* Add CSS for spinner */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default GoogleLogin;