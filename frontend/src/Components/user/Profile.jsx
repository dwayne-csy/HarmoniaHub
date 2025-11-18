import React, { useEffect, useState } from "react";
import axios from "axios";
import Header from "../layouts/user/Header";
import Footer from "../layouts/user/Footer";
import Loader from "../layouts/Loader"; // Import the Loader component

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

      {/* Header Component */}
      <Header 
        user={user}
        cartCount={cartCount}
        backendConnected={backendConnected}
        handleLogout={handleLogout}
      />

      <main style={{ 
        flex: 1, 
        padding: "20px 0",
        backgroundColor: "transparent",
        animation: "fadeIn 0.6s ease-in-out",
        position: "relative",
        zIndex: 1,
        margin: 0,
        width: "100%"
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
              50% { transform: translateY(-10px); }
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
            maxWidth: '600px',
            color: '#d4af37',
            fontWeight: '600',
            animation: 'fadeIn 0.5s ease-out',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
            marginLeft: '20px',
            marginRight: '20px'
          }}>
            <strong>⚠️ Limited Functionality:</strong> Backend connection issue. Some features may not work properly.
          </div>
        )}

        <div className="profile-container" style={{ 
          maxWidth: "600px", 
          margin: "0 auto",
          padding: "0 20px"
        }}>
          {loading ? (
            <div style={{ 
              textAlign: "center", 
              padding: "60px 20px"
            }}>
              <Loader />
              <p style={{
                fontSize: "18px",
                fontWeight: "600",
                color: "#d4af37",
                marginTop: "15px"
              }}>Loading profile...</p>
            </div>
          ) : user ? (
            <div 
              className="profile-card" 
              style={{ 
                textAlign: "center",
                background: "linear-gradient(135deg, rgba(30,30,30,0.95) 0%, rgba(40,40,40,0.95) 100%)",
                padding: "40px 30px",
                borderRadius: "18px",
                boxShadow: "0 12px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(212,175,55,0.2)",
                border: "1px solid rgba(212,175,55,0.3)",
                position: "relative",
                overflow: "hidden",
                animation: "fadeIn 0.8s ease-out"
              }}
            >
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

              {/* Profile Avatar - Use user's avatar if available, otherwise use default icon */}
              {user.avatar?.url ? (
                <div style={{
                  width: "120px",
                  height: "120px",
                  borderRadius: "50%",
                  margin: "0 auto 20px",
                  border: "3px solid rgba(212,175,55,0.5)",
                  boxShadow: "0 4px 15px rgba(212,175,55,0.4)",
                  animation: "float 4s ease-in-out infinite",
                  overflow: "hidden",
                  position: "relative"
                }}>
                  <img
                    src={user.avatar.url}
                    alt={user.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block"
                    }}
                  />
                </div>
              ) : (
                <div style={{
                  width: "120px",
                  height: "120px",
                  background: "linear-gradient(135deg, #d4af37, #f9e076)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "3rem",
                  boxShadow: "0 4px 15px rgba(212,175,55,0.4)",
                  animation: "float 4s ease-in-out infinite",
                  margin: "0 auto 20px",
                  border: "3px solid rgba(212,175,55,0.5)"
                }}>
                  👤
                </div>
              )}

              {/* USER NAME + VERIFIED BADGE */}
              <h2 style={{ 
                display: "flex", 
                justifyContent: "center", 
                alignItems: "center", 
                gap: "10px",
                marginBottom: "20px",
                background: "linear-gradient(135deg, #d4af37, #f9e076, #d4af37)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundSize: "200% 100%",
                animation: "shimmer 3s infinite linear",
                fontSize: "2rem",
                fontWeight: "bold",
                textShadow: "0 2px 4px rgba(0,0,0,0.3)"
              }}>
                {user.name}
                {user.isVerified && (
                  <img
                    src="/images/verified.jpg"
                    alt="Verified"
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "50%",
                      boxShadow: "0 2px 8px rgba(212,175,55,0.5)",
                      border: "1px solid #d4af37"
                    }}
                  />
                )}
              </h2>

              {/* User Information */}
              <div style={{ 
                textAlign: "left", 
                marginBottom: "25px",
                padding: "25px",
                background: "rgba(20,20,20,0.7)",
                borderRadius: "12px",
                border: "1px solid rgba(212,175,55,0.2)",
                backdropFilter: "blur(10px)",
                color: "#ffffff"
              }}>
                <p style={{ 
                  marginBottom: "15px",
                  padding: "12px",
                  background: "rgba(212,175,55,0.1)",
                  borderRadius: "8px",
                  borderLeft: "3px solid #d4af37"
                }}>
                  <strong style={{ color: "#d4af37", display: "block", marginBottom: "5px" }}>Email:</strong> 
                  <span style={{ color: "rgba(255,255,255,0.9)" }}>{user.email}</span>
                </p>
                
                <p style={{ 
                  marginBottom: "15px",
                  padding: "12px",
                  background: "rgba(212,175,55,0.1)",
                  borderRadius: "8px",
                  borderLeft: "3px solid #d4af37"
                }}>
                  <strong style={{ color: "#d4af37", display: "block", marginBottom: "5px" }}>Contact:</strong> 
                  <span style={{ color: "rgba(255,255,255,0.9)" }}>{user.contact || "Not provided"}</span>
                </p>

                {/* Address Section */}
                <div style={{ 
                  marginTop: "20px",
                  padding: "15px",
                  background: "rgba(212,175,55,0.05)",
                  borderRadius: "10px",
                  border: "1px solid rgba(212,175,55,0.1)"
                }}>
                  <strong style={{ 
                    color: "#d4af37", 
                    display: "block", 
                    marginBottom: "15px",
                    fontSize: "1.1rem",
                    textAlign: "center"
                  }}>Address Information</strong>
                  <div style={{ display: "grid", gap: "10px" }}>
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "8px 12px",
                      background: "rgba(0,0,0,0.3)",
                      borderRadius: "6px"
                    }}>
                      <strong style={{ color: "#d4af37" }}>City:</strong> 
                      <span style={{ color: "rgba(255,255,255,0.9)" }}>{user.address?.city || "Not provided"}</span>
                    </div>
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "8px 12px",
                      background: "rgba(0,0,0,0.3)",
                      borderRadius: "6px"
                    }}>
                      <strong style={{ color: "#d4af37" }}>Barangay:</strong> 
                      <span style={{ color: "rgba(255,255,255,0.9)" }}>{user.address?.barangay || "Not provided"}</span>
                    </div>
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "8px 12px",
                      background: "rgba(0,0,0,0.3)",
                      borderRadius: "6px"
                    }}>
                      <strong style={{ color: "#d4af37" }}>Street:</strong> 
                      <span style={{ color: "rgba(255,255,255,0.9)" }}>{user.address?.street || "Not provided"}</span>
                    </div>
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "8px 12px",
                      background: "rgba(0,0,0,0.3)",
                      borderRadius: "6px"
                    }}>
                      <strong style={{ color: "#d4af37" }}>Zipcode:</strong> 
                      <span style={{ color: "rgba(255,255,255,0.9)" }}>{user.address?.zipcode || "Not provided"}</span>
                    </div>
                  </div>
                </div>

                {/* Account Creation Date */}
                <p style={{ 
                  marginTop: "20px", 
                  color: "rgba(212,175,55,0.8)",
                  fontSize: "14px",
                  textAlign: "center",
                  padding: "15px",
                  background: "rgba(212,175,55,0.1)",
                  borderRadius: "10px",
                  border: "1px solid rgba(212,175,55,0.2)",
                  fontWeight: "600"
                }}>
                  <strong style={{ color: "#d4af37" }}>Account Created:</strong>{" "}
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
                  padding: "15px 30px",
                  background: "linear-gradient(135deg, #d4af37 0%, #f9e076 100%)",
                  color: "#1a1a1a",
                  borderRadius: "12px",
                  textDecoration: "none",
                  fontWeight: "700",
                  fontSize: "16px",
                  transition: "all 0.3s ease",
                  boxShadow: "0 6px 20px rgba(212,175,55,0.4)",
                  border: "none",
                  cursor: "pointer",
                  position: "relative",
                  overflow: "hidden"
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = "translateY(-3px)";
                  e.target.style.boxShadow = "0 10px 25px rgba(212,175,55,0.6)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "0 6px 20px rgba(212,175,55,0.4)";
                }}
              >
                Update Profile
              </a>
            </div>
          ) : (
            <div style={{ 
              textAlign: "center", 
              padding: "60px 20px",
              color: "#ffffff"
            }}>
              <div style={{
                fontSize: "4rem",
                marginBottom: "20px",
                opacity: "0.7"
              }}>
                😔
              </div>
              <p style={{ 
                fontSize: "18px", 
                color: "rgba(255,255,255,0.8)",
                marginBottom: "20px"
              }}>
                {!backendConnected ? "Unable to load profile due to connection issues." : "No user data found."}
              </p>
              {!backendConnected && (
                <button
                  onClick={() => window.location.reload()}
                  style={{
                    marginTop: "15px",
                    padding: "12px 24px",
                    background: "linear-gradient(135deg, #d4af37 0%, #f9e076 100%)",
                    color: "#1a1a1a",
                    border: "none",
                    borderRadius: "10px",
                    cursor: "pointer",
                    fontWeight: "600",
                    fontSize: "14px",
                    transition: "all 0.3s ease",
                    boxShadow: "0 4px 15px rgba(212,175,55,0.3)"
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = "translateY(-2px)";
                    e.target.style.boxShadow = "0 6px 20px rgba(212,175,55,0.5)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = "0 4px 15px rgba(212,175,55,0.3)";
                  }}
                >
                  🔄 Retry Connection
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