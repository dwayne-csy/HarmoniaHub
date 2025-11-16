import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { signInWithPopup, signInWithEmailAndPassword, getRedirectResult } from "firebase/auth";
import { auth, googleProvider, facebookProvider } from "../../config/firebase";

const Login = () => {
  const navigate = useNavigate();
  
  // Regular login state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Individual loading states for each login method
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isFacebookLoading, setIsFacebookLoading] = useState(false);
  const [isFirebaseLoading, setIsFirebaseLoading] = useState(false);
  
  // Firebase login state
  const [firebaseEmail, setFirebaseEmail] = useState("");
  const [firebasePassword, setFirebasePassword] = useState("");
  const [showFirebaseForm, setShowFirebaseForm] = useState(false);

  // Handle redirect result for Facebook
  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          setIsFacebookLoading(true);
          const user = result.user;
          
          // Get the Firebase ID token
          const idToken = await user.getIdToken();

          console.log("🔥 Facebook login successful:", user.email);

          // Send the token to your backend
          const { data } = await axios.post("http://localhost:4001/api/v1/firebase/auth/facebook", {
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

          setMessage("Facebook login successful! Redirecting...");

          // Redirect based on role
          setTimeout(() => {
            if (data.user.role === "admin") {
              navigate("/admin/dashboard");
            } else {
              navigate("/user/home");
            }
          }, 1000);
        }
      } catch (error) {
        console.error("❌ Facebook redirect error:", error);
        setMessage("Facebook authentication failed. Please try again.");
        setIsFacebookLoading(false);
      }
    };

    handleRedirectResult();
  }, [navigate]);

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
    setIsFirebaseLoading(true);

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
      setIsFirebaseLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setMessage("");
    setIsGoogleLoading(true);

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
      setIsGoogleLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    setMessage("");
    setIsFacebookLoading(true);

    try {
      // Clear any existing auth state to force account selection
      await auth.signOut();
      
      // Add a small delay to ensure signOut completes
      await new Promise(resolve => setTimeout(resolve, 500));

      // Sign in with Facebook using Firebase
      const result = await signInWithPopup(auth, facebookProvider);
      const user = result.user;
      
      // Get the Firebase ID token
      const idToken = await user.getIdToken();

      console.log("🔥 Facebook login successful:", user.email);
      console.log("👤 Facebook user info:", {
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL
      });

      // Send the token to your backend
      const { data } = await axios.post("http://localhost:4001/api/v1/firebase/auth/facebook", {
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

      setMessage("Facebook login successful! Redirecting...");

      // Redirect based on role
      setTimeout(() => {
        if (data.user.role === "admin") {
          navigate("/admin/dashboard");
        } else {
          navigate("/user/home");
        }
      }, 1000);

    } catch (error) {
      console.error("❌ Facebook login error:", error);
      
      // Handle specific Facebook auth errors
      if (error.code === 'auth/popup-closed-by-user') {
        // This is not really an error - user just closed the popup
        console.log("ℹ️ User closed Facebook login popup");
        setMessage(""); // Clear any previous messages
        return; // Just return without showing error message
      } else if (error.code === 'auth/popup-blocked') {
        setMessage("Popup was blocked by your browser. Please allow popups for this site.");
      } else if (error.code === 'auth/network-request-failed') {
        setMessage("Network error. Please check your internet connection.");
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        setMessage("An account already exists with the same email but different sign-in method.");
      } else if (error.code === 'auth/auth-domain-config-required') {
        setMessage("Facebook authentication is not properly configured. Please contact support.");
      } else if (error.code === 'auth/operation-not-allowed') {
        setMessage("Facebook login is not enabled. Please contact support.");
      } else if (error.code === 'auth/unauthorized-domain') {
        setMessage("This domain is not authorized for Facebook login.");
      } else if (error.code === 'auth/invalid-credential') {
        setMessage("Invalid Facebook credentials. Please try again.");
      } else if (error.code === 'auth/configuration-not-found') {
        setMessage("Facebook authentication is not configured. Please contact support.");
      } else {
        setMessage("Facebook login failed. Please try again.");
      }
    } finally {
      setIsFacebookLoading(false);
    }
  };

  const toggleFirebaseForm = () => {
    setShowFirebaseForm(!showFirebaseForm);
    setMessage("");
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

        <div style={{ 
          maxWidth: "500px", 
          width: "100%",
          margin: "0 auto",
          padding: "0 20px"
        }}>
          {/* Main Login Card */}
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
                fontSize: "3rem",
                marginBottom: "15px",
                animation: "float 4s ease-in-out infinite"
              }}>
                🔐
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
                Welcome Back
              </h1>
              <p style={{ 
                color: "rgba(255,255,255,0.8)",
                fontSize: "1.1rem",
                margin: 0
              }}>
                Sign in to your HarmoniaHub account
              </p>
            </div>

            {/* Regular Login Form */}
            <div style={{ marginBottom: '25px' }}>
              <form onSubmit={handleLogin}>
                <div style={{ marginBottom: '20px' }}>
                  <input 
                    type="email" 
                    placeholder="Email Address"
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
                
                <div style={{ marginBottom: '25px' }}>
                  <input 
                    type="password" 
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)} 
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
                      Signing In...
                    </div>
                  ) : (
                    "🔑 Sign In with Email & Password"
                  )}
                </button>
              </form>
            </div>

            {/* Divider */}
            <div style={{ textAlign: 'center', margin: '30px 0', position: 'relative' }}>
              <div style={{ border: 'none', borderTop: '1px solid rgba(212,175,55,0.3)' }}></div>
              <span style={{ 
                background: 'rgba(30,30,30,0.95)', 
                padding: '0 20px', 
                position: 'absolute', 
                top: '-12px', 
                left: '50%', 
                transform: 'translateX(-50%)',
                color: '#d4af37',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                OR CONTINUE WITH
              </span>
            </div>

            {/* Social Login Buttons */}
            <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
              {/* Google Login Button */}
              <button 
                onClick={handleGoogleLogin}
                disabled={isGoogleLoading || isFacebookLoading || isFirebaseLoading}
                style={{ 
                  flex: 1,
                  padding: "15px 20px",
                  background: isGoogleLoading ? "rgba(212,175,55,0.2)" : "rgba(20,20,20,0.7)",
                  color: "#ffffff", 
                  border: isGoogleLoading ? "1px solid #d4af37" : "1px solid rgba(212,175,55,0.3)",
                  borderRadius: "12px",
                  cursor: isGoogleLoading ? "not-allowed" : "pointer",
                  fontSize: "14px",
                  fontWeight: "600",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  transition: "all 0.3s ease",
                  backdropFilter: "blur(10px)",
                  minHeight: "54px"
                }}
                onMouseEnter={(e) => {
                  if (!isGoogleLoading && !isFacebookLoading && !isFirebaseLoading) {
                    e.target.style.background = "rgba(212,175,55,0.1)";
                    e.target.style.borderColor = "#d4af37";
                    e.target.style.transform = "translateY(-2px)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isGoogleLoading && !isFacebookLoading && !isFirebaseLoading) {
                    e.target.style.background = isGoogleLoading ? "rgba(212,175,55,0.2)" : "rgba(20,20,20,0.7)";
                    e.target.style.borderColor = isGoogleLoading ? "#d4af37" : "rgba(212,175,55,0.3)";
                    e.target.style.transform = "translateY(0)";
                  }
                }}
              >
                {isGoogleLoading ? (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #ffffff', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                    Loading...
                  </div>
                ) : (
                  <>
                    <img 
                      src="https://developers.google.com/identity/images/g-logo.png" 
                      alt="Google" 
                      style={{ width: '18px', height: '18px' }}
                    />
                    Google
                  </>
                )}
              </button>

              {/* Facebook Login Button */}
              <button 
                onClick={handleFacebookLogin}
                disabled={isFacebookLoading || isGoogleLoading || isFirebaseLoading}
                style={{ 
                  flex: 1,
                  padding: "15px 20px",
                  background: isFacebookLoading ? "rgba(59,89,152,0.3)" : "rgba(20,20,20,0.7)",
                  color: "#ffffff", 
                  border: isFacebookLoading ? "1px solid #3b5998" : "1px solid rgba(212,175,55,0.3)",
                  borderRadius: "12px",
                  cursor: isFacebookLoading ? "not-allowed" : "pointer",
                  fontSize: "14px",
                  fontWeight: "600",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  transition: "all 0.3s ease",
                  backdropFilter: "blur(10px)",
                  minHeight: "54px"
                }}
                onMouseEnter={(e) => {
                  if (!isFacebookLoading && !isGoogleLoading && !isFirebaseLoading) {
                    e.target.style.background = "rgba(59,89,152,0.1)";
                    e.target.style.borderColor = "#3b5998";
                    e.target.style.transform = "translateY(-2px)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isFacebookLoading && !isGoogleLoading && !isFirebaseLoading) {
                    e.target.style.background = isFacebookLoading ? "rgba(59,89,152,0.3)" : "rgba(20,20,20,0.7)";
                    e.target.style.borderColor = isFacebookLoading ? "#3b5998" : "rgba(212,175,55,0.3)";
                    e.target.style.transform = "translateY(0)";
                  }
                }}
              >
                {isFacebookLoading ? (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #ffffff', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                    Loading...
                  </div>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="#3b5998">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Facebook
                  </>
                )}
              </button>
            </div>

            {/* Account Selection Info */}
            <div style={{ 
              textAlign: 'center', 
              marginBottom: '15px', 
              fontSize: '12px', 
              color: 'rgba(255,255,255,0.6)',
              fontStyle: 'italic'
            }}>
              Click Facebook button to choose from different accounts
            </div>

            {/* Firebase Login Toggle */}
            <div style={{ marginBottom: '20px' }}>
              <button 
                onClick={toggleFirebaseForm}
                disabled={isLoading || isGoogleLoading || isFacebookLoading || isFirebaseLoading}
                style={{ 
                  width: "100%",
                  padding: "15px 20px",
                  background: showFirebaseForm ? "rgba(212,175,55,0.2)" : "rgba(20,20,20,0.7)",
                  color: "#d4af37", 
                  border: "1px solid rgba(212,175,55,0.3)",
                  borderRadius: "12px",
                  cursor: (isLoading || isGoogleLoading || isFacebookLoading || isFirebaseLoading) ? "not-allowed" : "pointer",
                  fontSize: "16px",
                  fontWeight: "600",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  transition: "all 0.3s ease",
                  backdropFilter: "blur(10px)",
                  opacity: (isLoading || isGoogleLoading || isFacebookLoading || isFirebaseLoading) ? 0.6 : 1
                }}
                onMouseEnter={(e) => {
                  if (!isLoading && !isGoogleLoading && !isFacebookLoading && !isFirebaseLoading) {
                    e.target.style.background = "rgba(212,175,55,0.1)";
                    e.target.style.borderColor = "#d4af37";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading && !isGoogleLoading && !isFacebookLoading && !isFirebaseLoading) {
                    e.target.style.background = showFirebaseForm ? "rgba(212,175,55,0.2)" : "rgba(20,20,20,0.7)";
                    e.target.style.borderColor = "rgba(212,175,55,0.3)";
                  }
                }}
              >
                <span>🔥</span>
                {showFirebaseForm ? 'Hide Firebase Login' : 'Sign in with Firebase'}
              </button>
              
              {showFirebaseForm && (
                <div style={{ 
                  marginTop: '15px', 
                  padding: '25px', 
                  border: '1px solid rgba(212,175,55,0.3)', 
                  borderRadius: '12px',
                  backgroundColor: 'rgba(20,20,20,0.7)',
                  backdropFilter: 'blur(10px)'
                }}>
                  <h4 style={{ 
                    margin: '0 0 15px 0', 
                    color: '#d4af37',
                    textAlign: 'center',
                    fontWeight: '600'
                  }}>
                    Firebase Authentication
                  </h4>
                  <form onSubmit={handleFirebaseLogin}>
                    <div style={{ marginBottom: '15px' }}>
                      <input 
                        type="email" 
                        placeholder="Firebase Email" 
                        value={firebaseEmail}
                        onChange={(e) => setFirebaseEmail(e.target.value)} 
                        required 
                        disabled={isFirebaseLoading}
                        style={{
                          width: "100%",
                          padding: "12px 15px",
                          background: "rgba(10,10,10,0.7)",
                          border: "1px solid rgba(212,175,55,0.3)",
                          borderRadius: "8px",
                          color: "#ffffff",
                          fontSize: "14px",
                          transition: "all 0.3s ease",
                          outline: "none",
                          opacity: isFirebaseLoading ? 0.6 : 1
                        }}
                      />
                    </div>
                    <div style={{ marginBottom: '20px' }}>
                      <input 
                        type="password" 
                        placeholder="Firebase Password" 
                        value={firebasePassword}
                        onChange={(e) => setFirebasePassword(e.target.value)} 
                        required 
                        disabled={isFirebaseLoading}
                        style={{
                          width: "100%",
                          padding: "12px 15px",
                          background: "rgba(10,10,10,0.7)",
                          border: "1px solid rgba(212,175,55,0.3)",
                          borderRadius: "8px",
                          color: "#ffffff",
                          fontSize: "14px",
                          transition: "all 0.3s ease",
                          outline: "none",
                          opacity: isFirebaseLoading ? 0.6 : 1
                        }}
                      />
                    </div>
                    <button 
                      type="submit" 
                      disabled={isFirebaseLoading}
                      style={{
                        width: "100%",
                        padding: "12px 15px",
                        background: isFirebaseLoading 
                          ? "linear-gradient(135deg, rgba(212,175,55,0.5) 0%, rgba(249,224,118,0.5) 100%)" 
                          : "linear-gradient(135deg, #d4af37 0%, #f9e076 100%)",
                        color: "#1a1a1a",
                        border: "none",
                        borderRadius: "8px",
                        fontSize: "14px",
                        fontWeight: "600",
                        cursor: isFirebaseLoading ? "not-allowed" : "pointer",
                        transition: "all 0.3s ease"
                      }}
                    >
                      {isFirebaseLoading ? (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                          <div style={{ width: '16px', height: '16px', border: '2px solid rgba(26,26,26,0.3)', borderTop: '2px solid #1a1a1a', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                          Signing in...
                        </div>
                      ) : "Sign in with Firebase"}
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Message Display */}
            {message && (
              <div style={{ 
                color: message.includes("successful") ? "#4caf50" : "#f44336", 
                marginTop: "20px", 
                padding: "15px",
                borderRadius: "12px",
                backgroundColor: message.includes("successful") ? "rgba(76,175,80,0.1)" : "rgba(244,67,54,0.1)",
                border: `1px solid ${message.includes("successful") ? "rgba(76,175,80,0.3)" : "rgba(244,67,54,0.3)"}`,
                textAlign: 'center',
                fontWeight: '600',
                fontSize: '14px'
              }}>
                {message}
              </div>
            )}
            
            {/* Links */}
            <div style={{ marginTop: '25px', textAlign: 'center' }}>
              <Link 
                to="/forgot-password" 
                style={{ 
                  color: '#d4af37', 
                  textDecoration: 'none',
                  fontWeight: '600',
                  fontSize: '14px',
                  transition: 'all 0.3s ease'
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
                Forgot Password?
              </Link>
            </div>
            
            <p style={{ textAlign: 'center', marginTop: '20px', color: 'rgba(255,255,255,0.7)' }}>
              Don't have an account?{' '}
              <Link 
                to="/register" 
                style={{ 
                  color: '#d4af37', 
                  textDecoration: 'none',
                  fontWeight: '600',
                  transition: 'all 0.3s ease'
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
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;