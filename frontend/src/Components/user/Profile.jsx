import React, { useEffect, useState } from "react";
import axios from "axios";
import Header from "../layouts/user/Header";
import Footer from "../layouts/user/Footer";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [backendConnected, setBackendConnected] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) return;

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get("http://localhost:4001/api/v1/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(data.user);
        setBackendConnected(true);
      } catch (error) {
        console.error("Error fetching profile:", error);
        setBackendConnected(false);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setBackendConnected(true);
    console.log("🚪 User logged out");
    window.location.href = "/login";
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* Header Component */}
      <Header 
        user={user}
        cartCount={cartCount}
        backendConnected={backendConnected}
        handleLogout={handleLogout}
      />

      <main style={{ flex: 1, padding: "20px 30px", backgroundColor: "#f5f5f5" }}>
        {/* Backend status banner */}
        {!backendConnected && (
          <div style={{
            backgroundColor: '#fff3cd',
            border: '1px solid #ffeaa7',
            borderRadius: '4px',
            padding: '10px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            <strong>⚠️ Limited Functionality:</strong> Backend connection issue. Some features may not work properly.
          </div>
        )}

        <div className="profile-container" style={{ maxWidth: "600px", margin: "0 auto" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "40px" }}>
              <p>Loading profile...</p>
            </div>
          ) : user ? (
            <div 
              className="profile-card" 
              style={{ 
                textAlign: "center",
                backgroundColor: "white",
                padding: "30px",
                borderRadius: "12px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                border: "1px solid #e0e0e0"
              }}
            >
              {/* Avatar */}
              {user.avatar?.url && (
                <img
                  src={user.avatar.url}
                  alt={user.name}
                  className="avatar"
                  style={{
                    width: "120px",
                    height: "120px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    marginBottom: "20px",
                    border: "3px solid #1976d2",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.2)"
                  }}
                />
              )}

              {/* USER NAME + VERIFIED BADGE */}
              <h2 style={{ 
                display: "flex", 
                justifyContent: "center", 
                alignItems: "center", 
                gap: "8px",
                marginBottom: "15px",
                color: "#1976d2"
              }}>
                {user.name}
                {user.isVerified && (
                  <img
                    src="/images/verified.jpg"
                    alt="Verified"
                    style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                    }}
                  />
                )}
              </h2>

              {/* User Information */}
              <div style={{ 
                textAlign: "left", 
                marginBottom: "20px",
                padding: "20px",
                backgroundColor: "#f8f9fa",
                borderRadius: "8px"
              }}>
                <p style={{ marginBottom: "10px" }}>
                  <strong style={{ color: "#555" }}>Email:</strong> 
                  <span style={{ marginLeft: "8px" }}>{user.email}</span>
                </p>
                
                <p style={{ marginBottom: "10px" }}>
                  <strong style={{ color: "#555" }}>Contact:</strong> 
                  <span style={{ marginLeft: "8px" }}>{user.contact || "Not provided"}</span>
                </p>

                {/* Address Section */}
                <div style={{ marginTop: "15px" }}>
                  <strong style={{ color: "#555", display: "block", marginBottom: "10px" }}>Address:</strong>
                  <div style={{ paddingLeft: "15px" }}>
                    <p style={{ marginBottom: "5px" }}>
                      <strong>City:</strong> {user.address?.city || "Not provided"}
                    </p>
                    <p style={{ marginBottom: "5px" }}>
                      <strong>Barangay:</strong> {user.address?.barangay || "Not provided"}
                    </p>
                    <p style={{ marginBottom: "5px" }}>
                      <strong>Street:</strong> {user.address?.street || "Not provided"}
                    </p>
                    <p style={{ marginBottom: "5px" }}>
                      <strong>Zipcode:</strong> {user.address?.zipcode || "Not provided"}
                    </p>
                  </div>
                </div>

                {/* Account Creation Date */}
                <p style={{ 
                  marginTop: "15px", 
                  color: "#666",
                  fontSize: "14px",
                  textAlign: "center",
                  padding: "10px",
                  backgroundColor: "white",
                  borderRadius: "6px",
                  border: "1px solid #e0e0e0"
                }}>
                  <strong>Account Created:</strong>{" "}
                  {new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>

              {/* Update Profile Button */}
              <a
                href="/update-profile"
                className="btn-update"
                style={{
                  display: "inline-block",
                  marginTop: "15px",
                  padding: "12px 24px",
                  backgroundColor: "#1976d2",
                  color: "#fff",
                  borderRadius: "8px",
                  textDecoration: "none",
                  fontWeight: "600",
                  fontSize: "16px",
                  transition: "all 0.3s ease",
                  boxShadow: "0 2px 4px rgba(25, 118, 210, 0.3)",
                  border: "none",
                  cursor: "pointer"
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "#1565c0";
                  e.target.style.boxShadow = "0 4px 8px rgba(25, 118, 210, 0.4)";
                  e.target.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "#1976d2";
                  e.target.style.boxShadow = "0 2px 4px rgba(25, 118, 210, 0.3)";
                  e.target.style.transform = "translateY(0)";
                }}
              >
                Update Profile
              </a>
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "40px" }}>
              <p style={{ fontSize: "18px", color: "#666" }}>
                {!backendConnected ? "Unable to load profile due to connection issues." : "No user data found."}
              </p>
              {!backendConnected && (
                <button
                  onClick={() => window.location.reload()}
                  style={{
                    marginTop: "15px",
                    padding: "10px 20px",
                    backgroundColor: "#1976d2",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer"
                  }}
                >
                  Retry
                </button>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Footer Component */}
      <Footer />
    </div>
  );
};

export default Profile;