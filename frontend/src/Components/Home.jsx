import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const Home = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data } = await axios.get("http://localhost:4001/api/v1/me", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(data.user);
      } catch (error) {
        console.error("Failed to fetch user profile");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, [token]);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="home-container">
        <header className="home-header">
          <h1>Welcome to HarmoniaHub</h1>
          <p>Please log in to access your dashboard</p>
          <Link to="/login" className="btn-primary">Login</Link>
        </header>
      </div>
    );
  }

  // User Home Page
  return (
    <div className="home-container">
      <header className="home-header">
        <h1>Welcome back, {user.name}!</h1>
        <p>Your personal space for harmony and productivity</p>
        <div className="user-info">
          <img src={user.avatar.url} alt={user.name} className="user-avatar" />
          <span className="user-role">Role: {user.role}</span>
        </div>
      </header>
      
      <div className="home-content">
        <div className="features">
          <div className="feature-card">
            <h3>Manage Your Profile</h3>
            <p>Update your personal information and avatar</p>
            <Link to="/profile" className="feature-link">Go to Profile</Link>
          </div>
          
          <div className="feature-card">
            <h3>Update Information</h3>
            <p>Keep your account secure and up to date</p>
            <Link to="/update-profile" className="feature-link">Update Profile</Link>
          </div>

          <div className="feature-card">
            <h3>Account Settings</h3>
            <p>Manage your password and security preferences</p>
            <Link to="/update-profile" className="feature-link">Settings</Link>
          </div>
        </div>
        
        <div className="welcome-message">
          <h2>Hello, {user.name}!</h2>
          <p>We're glad to see you again. Here's what you can do:</p>
          <ul className="user-tasks">
            <li>Update your profile information</li>
            <li>Change your profile picture</li>
            <li>Manage your account settings</li>
            <li>Keep your information current</li>
          </ul>
          <div className="quick-stats">
            <div className="stat">
              <h4>Account Status</h4>
              <p>{user.isVerified ? "✓ Verified" : "⚠ Needs Verification"}</p>
            </div>
            <div className="stat">
              <h4>Member Since</h4>
              <p>{new Date(user.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;