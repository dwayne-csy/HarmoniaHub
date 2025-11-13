import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const Register = () => {
  const [user, setUser] = useState({ name: "", email: "", password: "" });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("firebase"); // "firebase" or "local"
  const navigate = useNavigate();

  const handleChange = (e) => setUser({ ...user, [e.target.name]: e.target.value });

  // Local Registration (existing system)
  const handleLocalRegister = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsLoading(true);

    // Validate passwords match
    if (user.password !== confirmPassword) {
      setMessage("Passwords do not match");
      setIsLoading(false);
      return;
    }

    // Validate password length
    if (user.password.length < 6) {
      setMessage("Password must be at least 6 characters long");
      setIsLoading(false);
      return;
    }

    try {
      const { data } = await axios.post("http://localhost:4001/api/v1/register", 
        { ...user }, 
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      setMessage("Registration successful! Please check your email to verify your account.");
      
      // Clear form
      setUser({ name: "", email: "", password: "" });
      setConfirmPassword("");
      
    } catch (error) {
      setMessage(error.response?.data?.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  // Firebase Registration
  const handleFirebaseRegister = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsLoading(true);

    // Validate passwords match
    if (user.password !== confirmPassword) {
      setMessage("Passwords do not match");
      setIsLoading(false);
      return;
    }

    // Validate password length
    if (user.password.length < 6) {
      setMessage("Password must be at least 6 characters long");
      setIsLoading(false);
      return;
    }

    try {
      const { data } = await axios.post("http://localhost:4001/api/v1/firebase/register", 
        { ...user }, 
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      setMessage("Registration successful! Firebase verification email sent. Please check your email to verify your account.");
      
      // Clear form
      setUser({ name: "", email: "", password: "" });
      setConfirmPassword("");
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/login");
      }, 3000);
      
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Registration failed";
      
      if (errorMsg.includes("already exists")) {
        setMessage("An account with this email already exists. Please try logging in instead.");
      } else if (errorMsg.includes("weak-password")) {
        setMessage("Password should be at least 6 characters long.");
      } else if (errorMsg.includes("invalid-email")) {
        setMessage("Please enter a valid email address.");
      } else {
        setMessage(errorMsg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleRegisterRedirect = () => {
    navigate("/google-login");
  };

  return (
    <div className="form-container">
      <h2>Join HarmoniaHub</h2>
      
      {/* Registration Type Tabs */}
      <div style={{ display: 'flex', marginBottom: '20px', borderBottom: '1px solid #ddd' }}>
        <button
          onClick={() => setActiveTab("firebase")}
          style={{
            flex: 1,
            padding: '12px',
            border: 'none',
            background: activeTab === "firebase" ? '#4285f4' : 'transparent',
            color: activeTab === "firebase" ? 'white' : '#666',
            cursor: 'pointer',
            borderBottom: activeTab === "firebase" ? '2px solid #4285f4' : 'none'
          }}
        >
          🔐 Firebase Registration
        </button>
        <button
          onClick={() => setActiveTab("local")}
          style={{
            flex: 1,
            padding: '12px',
            border: 'none',
            background: activeTab === "local" ? '#666' : 'transparent',
            color: activeTab === "local" ? 'white' : '#666',
            cursor: 'pointer',
            borderBottom: activeTab === "local" ? '2px solid #666' : 'none'
          }}
        >
          📧 Local Registration
        </button>
      </div>

      {/* Firebase Registration Form */}
      {activeTab === "firebase" && (
        <div>
          <form onSubmit={handleFirebaseRegister}>
            <input 
              type="text" 
              name="name" 
              placeholder="Full Name" 
              value={user.name}
              onChange={handleChange} 
              required 
            />
            <input 
              type="email" 
              name="email" 
              placeholder="Email Address" 
              value={user.email}
              onChange={handleChange} 
              required 
            />
            <input 
              type="password" 
              name="password" 
              placeholder="Password (min. 6 characters)" 
              value={user.password}
              onChange={handleChange} 
              required 
              minLength="6"
            />
            <input 
              type="password" 
              placeholder="Confirm Password" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)} 
              required 
            />
            <button type="submit" disabled={isLoading}>
              {isLoading ? "Creating Account..." : "Register with Firebase"}
            </button>
          </form>

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

          {/* Google Registration */}
          <button 
            onClick={handleGoogleRegisterRedirect}
            disabled={isLoading}
            style={{ 
              background: '#db4437', 
              color: 'white', 
              width: '100%', 
              padding: '12px', 
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px'
            }}
          >
            <span>🔍</span>
            Register with Google
          </button>

          <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#e8f4fd', borderRadius: '4px' }}>
            <p style={{ margin: 0, fontSize: '14px', color: '#1976d2' }}>
              <strong>Firebase Registration:</strong> Uses Firebase Authentication for secure email verification and password management.
            </p>
          </div>
        </div>
      )}

      {/* Local Registration Form */}
      {activeTab === "local" && (
        <div>
          <form onSubmit={handleLocalRegister}>
            <input 
              type="text" 
              name="name" 
              placeholder="Full Name" 
              value={user.name}
              onChange={handleChange} 
              required 
            />
            <input 
              type="email" 
              name="email" 
              placeholder="Email Address" 
              value={user.email}
              onChange={handleChange} 
              required 
            />
            <input 
              type="password" 
              name="password" 
              placeholder="Password (min. 6 characters)" 
              value={user.password}
              onChange={handleChange} 
              required 
              minLength="6"
            />
            <input 
              type="password" 
              placeholder="Confirm Password" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)} 
              required 
            />
            <button type="submit" disabled={isLoading}>
              {isLoading ? "Creating Account..." : "Register with Local System"}
            </button>
          </form>

          <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#fff3e0', borderRadius: '4px' }}>
            <p style={{ margin: 0, fontSize: '14px', color: '#e65100' }}>
              <strong>Local Registration:</strong> Uses our traditional email verification system. Check your email for verification link.
            </p>
          </div>
        </div>
      )}

      {/* Message Display */}
      {message && (
        <div style={{ 
          color: message.includes("successful") ? "green" : "red", 
          marginTop: "15px", 
          padding: "10px",
          borderRadius: "4px",
          backgroundColor: message.includes("successful") ? "#f0fff0" : "#fff0f0",
          border: `1px solid ${message.includes("successful") ? "#00ff00" : "#ff0000"}`
        }}>
          {message}
        </div>
      )}

      <p style={{ textAlign: 'center', marginTop: '20px' }}>
        Already have an account? <Link to="/login" style={{ color: '#4285f4', textDecoration: 'none' }}>Login</Link>
      </p>
    </div>
  );
};

export default Register;