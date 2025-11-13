import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { signInWithPopup, signInWithEmailAndPassword } from "firebase/auth";
import { auth, googleProvider } from "../../config/firebase";

const Login = () => {
  const navigate = useNavigate();
  
  // Regular login state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Firebase login state
  const [firebaseEmail, setFirebaseEmail] = useState("");
  const [firebasePassword, setFirebasePassword] = useState("");
  const [showFirebaseForm, setShowFirebaseForm] = useState(false);
  const [showGoogleForm, setShowGoogleForm] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsLoading(true);

    try {
      const { data } = await axios.post("http://localhost:4001/api/v1/login", { email, password });

      // Store user data in localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem(
        "user",
        JSON.stringify({
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
          id: data.user._id
        })
      );

      setMessage("Login successful!");

      // Redirect based on role
      if (data.user.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/user/home");
      }

    } catch (error) {
      const errorMsg = error.response?.data?.message || "Invalid credentials";

      // Check for specific error messages
      if (errorMsg.includes("inactive")) {
        setMessage("Your account is inactive. Please contact support.");
      } else if (errorMsg.includes("verify")) {
        setMessage("Please verify your email first. Check your inbox for the verification link.");
      } else if (errorMsg.includes("Firebase authentication")) {
        setMessage("This account uses Firebase authentication. Please use the Firebase login options below.");
      } else {
        setMessage(errorMsg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFirebaseLogin = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsLoading(true);

    try {
      // Sign in with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, firebaseEmail, firebasePassword);
      const user = userCredential.user;
      
      // Get the Firebase ID token
      const idToken = await user.getIdToken();

      console.log("🔥 Firebase email login successful:", user.email);

      // Send the token to your backend
      const { data } = await axios.post("http://localhost:4001/api/v1/firebase/login", {
        idToken
      });

      console.log("✅ Backend authentication successful");

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

      setMessage("Firebase login successful! Redirecting...");

      // Redirect based on role
      setTimeout(() => {
        if (data.user.role === "admin") {
          navigate("/admin/dashboard");
        } else {
          navigate("/user/home");
        }
      }, 1000);

    } catch (error) {
      console.error("❌ Firebase email login error:", error);
      
      if (error.code === 'auth/invalid-email') {
        setMessage("Invalid email address format.");
      } else if (error.code === 'auth/user-disabled') {
        setMessage("This account has been disabled.");
      } else if (error.code === 'auth/user-not-found') {
        setMessage("No account found with this email.");
      } else if (error.code === 'auth/wrong-password') {
        setMessage("Incorrect password.");
      } else if (error.code === 'auth/too-many-requests') {
        setMessage("Too many failed attempts. Please try again later.");
      } else if (error.response?.status === 401) {
        setMessage("Authentication failed. Please try again.");
      } else if (error.message.includes("No JWT token")) {
        setMessage("Server error: No authentication token received.");
      } else {
        setMessage("Firebase login failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

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

      // Send the token to your backend
      const { data } = await axios.post("http://localhost:4001/api/v1/firebase/auth/google", {
        idToken
      });

      console.log("✅ Backend authentication successful");

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
      
      if (error.code === 'auth/popup-closed-by-user') {
        setMessage("Google login was cancelled. Please try again.");
      } else if (error.code === 'auth/popup-blocked') {
        setMessage("Popup was blocked by your browser. Please allow popups for this site.");
      } else if (error.code === 'auth/network-request-failed') {
        setMessage("Network error. Please check your internet connection.");
      } else {
        setMessage("Google login failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFirebaseForm = () => {
    setShowFirebaseForm(!showFirebaseForm);
    setShowGoogleForm(false);
    setMessage("");
  };

  const toggleGoogleForm = () => {
    setShowGoogleForm(!showGoogleForm);
    setShowFirebaseForm(false);
    setMessage("");
  };

  return (
    <div className="form-container">
      <h2>Login to HarmoniaHub</h2>
      
      {/* Regular Login Form - Always Visible */}
      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ marginBottom: '15px', color: '#333' }}>Email & Password Login</h3>
        <form onSubmit={handleLogin}>
          <input 
            type="email" 
            placeholder="Email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
          <button type="submit" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Login with Email & Password"}
          </button>
        </form>
      </div>

      {/* Divider */}
      <div style={{ textAlign: 'center', margin: '20px 0', position: 'relative' }}>
        <hr style={{ border: 'none', borderTop: '1px solid #ddd' }} />
        <span style={{ 
          background: '#fff', 
          padding: '0 15px', 
          position: 'absolute', 
          top: '-10px', 
          left: '50%', 
          transform: 'translateX(-50%)',
          color: '#666',
          fontSize: '14px'
        }}>
          OR
        </span>
      </div>

      {/* Firebase Login Section */}
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={toggleFirebaseForm}
          disabled={isLoading}
          style={{ 
            background: showFirebaseForm ? '#3367d6' : '#4285f4',
            color: 'white', 
            padding: '12px', 
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            width: '100%',
            transition: 'all 0.3s ease'
          }}
        >
          <span>🔐</span>
          {showFirebaseForm ? 'Hide Firebase Login' : 'Login with Firebase Email'}
        </button>
        
        {showFirebaseForm && (
          <div style={{ 
            marginTop: '15px', 
            padding: '20px', 
            border: '1px solid #e0e0e0', 
            borderRadius: '8px',
            backgroundColor: '#f8f9fa'
          }}>
            <h4 style={{ margin: '0 0 15px 0', color: '#333' }}>Firebase Email Login</h4>
            <form onSubmit={handleFirebaseLogin}>
              <input 
                type="email" 
                placeholder="Email" 
                value={firebaseEmail}
                onChange={(e) => setFirebaseEmail(e.target.value)} 
                required 
                style={{ marginBottom: '10px' }}
              />
              <input 
                type="password" 
                placeholder="Password" 
                value={firebasePassword}
                onChange={(e) => setFirebasePassword(e.target.value)} 
                required 
                style={{ marginBottom: '15px' }}
              />
              <button type="submit" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign in with Firebase"}
              </button>
            </form>
            <p style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
              Uses Firebase Authentication for secure login
            </p>
          </div>
        )}
      </div>

      {/* Google Login Section */}
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={toggleGoogleForm}
          disabled={isLoading}
          style={{ 
            background: showGoogleForm ? '#c53929' : '#db4437',
            color: 'white', 
            padding: '12px', 
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            width: '100%',
            transition: 'all 0.3s ease'
          }}
        >
          <span>🔍</span>
          {showGoogleForm ? 'Hide Google Login' : 'Login with Google'}
        </button>
        
        {showGoogleForm && (
          <div style={{ 
            marginTop: '15px', 
            padding: '20px', 
            border: '1px solid #e0e0e0', 
            borderRadius: '8px',
            backgroundColor: '#f8f9fa',
            textAlign: 'center'
          }}>
            <h4 style={{ margin: '0 0 15px 0', color: '#333' }}>Google Login</h4>
            <p style={{ marginBottom: '15px', color: '#666' }}>
              Sign in with your Google account
            </p>
            <button 
              onClick={handleGoogleLogin}
              disabled={isLoading}
              style={{ 
                background: '#ffffff',
                color: '#757575',
                padding: '12px 20px',
                border: '1px solid #dadce0',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                width: '100%',
                maxWidth: '250px',
                margin: '0 auto'
              }}
            >
              {isLoading ? (
                <>
                  <div style={{ width: '20px', height: '20px', border: '2px solid #f3f3f3', borderTop: '2px solid #757575', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                  Connecting...
                </>
              ) : (
                <>
                  <img 
                    src="https://developers.google.com/identity/images/g-logo.png" 
                    alt="Google" 
                    style={{ width: '20px', height: '20px' }}
                  />
                  Sign in with Google
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Message Display */}
      {message && (
        <div style={{ 
          color: message.includes("successful") ? "green" : "red", 
          marginTop: "15px", 
          padding: "12px",
          borderRadius: "6px",
          backgroundColor: message.includes("successful") ? "#f0fff0" : "#fff0f0",
          border: `1px solid ${message.includes("successful") ? "#00ff00" : "#ff0000"}`,
          textAlign: 'center'
        }}>
          {message}
        </div>
      )}
      
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <Link to="/forgot-password" style={{ color: '#4285f4', textDecoration: 'none' }}>
          Forgot Password?
        </Link>
      </div>
      
      <p style={{ textAlign: 'center', marginTop: '20px' }}>
        Don't have an account? <Link to="/register" style={{ color: '#4285f4', textDecoration: 'none' }}>Register</Link>
      </p>

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

export default Login;