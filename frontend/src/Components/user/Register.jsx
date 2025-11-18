import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

const Register = () => {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("firebase"); // "firebase" or "local"
  const navigate = useNavigate();

  // Yup validation schemas
  const firebaseSchema = yup.object({
    name: yup
      .string()
      .required("Full name is required")
      .matches(/^[A-Z][a-z]+ [A-Z][a-z]+$/, "Full name must contain two words, each starting with a capital letter (e.g., John Doe)"),
    email: yup
      .string()
      .required("Email is required")
      .matches(/^[a-zA-Z0-9._%+-]+@(gmail|yahoo|email)\.com$/, "Email must be from @gmail.com, @yahoo.com, or @email.com domains"),
    password: yup
      .string()
      .required("Password is required")
      .min(9, "Password must be at least 9 characters long")
      .matches(/^[A-Z]/, "Password must start with a capital letter")
      .matches(/\d/, "Password must contain at least one number")
      .matches(/[@$!%*?&]/, "Password must contain at least one special character (@$!%*?&)")
  });

const localSchema = yup.object({
  name: yup
    .string()
    .required("Full name is required")
    .matches(/^[A-Z][a-z]+ [A-Z][a-z]+$/, "Full name must contain two words, each starting with a capital letter (e.g., John Doe)"),
  email: yup.string().email("Invalid email format").required("Email is required"),
  password: yup
    .string()
    .required("Password is required")
    .min(9, "Password must be at least 9 characters long")
    .matches(/^[A-Z]/, "Password must start with a capital letter")
    .matches(/\d/, "Password must contain at least one number")
    .matches(/[@$!%*?&]/, "Password must contain at least one special character (@$!%*?&)"),
  confirmPassword: yup.string()
    .required("Please confirm your password")
    .oneOf([yup.ref('password')], 'Passwords must match')
});

  // React Hook Form setup for Firebase
  const { 
    register: registerFirebase, 
    handleSubmit: handleSubmitFirebase, 
    formState: { errors: firebaseErrors },
    watch: watchFirebase
  } = useForm({
    resolver: yupResolver(firebaseSchema),
    mode: "onChange"
  });

  // React Hook Form setup for Local
  const { 
    register: registerLocal, 
    handleSubmit: handleSubmitLocal, 
    formState: { errors: localErrors },
    watch: watchLocal
  } = useForm({
    resolver: yupResolver(localSchema),
    mode: "onChange"
  });

  const watchFirebasePassword = watchFirebase('password');
  const watchLocalPassword = watchLocal('password');

  // Firebase Registration
  const handleFirebaseRegister = async (formData) => {
    setMessage("");
    setIsLoading(true);

    try {
      const { data } = await axios.post("http://localhost:4001/api/v1/register", 
        { 
          ...formData,
          authProvider: "firebase-email"
        }, 
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      setMessage(data.message || "Firebase registration successful! Your account is ready to use.");
      
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

  // Local Registration
  const handleLocalRegister = async (formData) => {
    setMessage("");
    setIsLoading(true);

    try {
      const { data } = await axios.post("http://localhost:4001/api/v1/register", 
        { ...formData }, 
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      setMessage("Registration successful! Please check your email to verify your account.");
      
    } catch (error) {
      setMessage(error.response?.data?.message || "Registration failed");
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

        <div style={{ 
          maxWidth: "500px", 
          width: "100%",
          margin: "0 auto",
          padding: "0 20px"
        }}>
          {/* Main Register Card */}
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
                🎵
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
                Join HarmoniaHub
              </h1>
              <p style={{ 
                color: "rgba(255,255,255,0.8)",
                fontSize: "1.1rem",
                margin: 0
              }}>
                Create your account to start your musical journey
              </p>
            </div>

            {/* Registration Type Tabs */}
            <div style={{ 
              display: 'flex', 
              marginBottom: '25px', 
              borderBottom: '1px solid rgba(212,175,55,0.3)',
              borderRadius: '8px 8px 0 0',
              overflow: 'hidden'
            }}>
              <button
                onClick={() => setActiveTab("firebase")}
                style={{
                  flex: 1,
                  padding: '15px',
                  border: 'none',
                  background: activeTab === "firebase" 
                    ? 'linear-gradient(135deg, rgba(212,175,55,0.3) 0%, rgba(249,224,118,0.2) 100%)' 
                    : 'rgba(20,20,20,0.7)',
                  color: activeTab === "firebase" ? '#f9e076' : 'rgba(255,255,255,0.7)',
                  cursor: 'pointer',
                  borderBottom: activeTab === "firebase" ? '2px solid #d4af37' : 'none',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  backdropFilter: 'blur(10px)'
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== "firebase") {
                    e.target.style.background = 'rgba(212,175,55,0.1)';
                    e.target.style.color = '#d4af37';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== "firebase") {
                    e.target.style.background = 'rgba(20,20,20,0.7)';
                    e.target.style.color = 'rgba(255,255,255,0.7)';
                  }
                }}
              >
                 Firebase Registration
              </button>
              <button
                onClick={() => setActiveTab("local")}
                style={{
                  flex: 1,
                  padding: '15px',
                  border: 'none',
                  background: activeTab === "local" 
                    ? 'linear-gradient(135deg, rgba(212,175,55,0.3) 0%, rgba(249,224,118,0.2) 100%)' 
                    : 'rgba(20,20,20,0.7)',
                  color: activeTab === "local" ? '#f9e076' : 'rgba(255,255,255,0.7)',
                  cursor: 'pointer',
                  borderBottom: activeTab === "local" ? '2px solid #d4af37' : 'none',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  backdropFilter: 'blur(10px)'
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== "local") {
                    e.target.style.background = 'rgba(212,175,55,0.1)';
                    e.target.style.color = '#d4af37';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== "local") {
                    e.target.style.background = 'rgba(20,20,20,0.7)';
                    e.target.style.color = 'rgba(255,255,255,0.7)';
                  }
                }}
              >
                 Local Registration
              </button>
            </div>

            {/* Firebase Registration Form */}
            {activeTab === "firebase" && (
              <div>
                <form onSubmit={handleSubmitFirebase(handleFirebaseRegister)}>
                  <div style={{ marginBottom: firebaseErrors.name ? '5px' : '20px' }}>
                    <input 
                      type="text" 
                      placeholder="Full Name (e.g., John Doe)" 
                      {...registerFirebase("name")}
                      required 
                      style={{
                        width: "100%",
                        padding: "15px 20px",
                        background: "rgba(20,20,20,0.7)",
                        border: firebaseErrors.name ? "1px solid #f44336" : "1px solid rgba(212,175,55,0.3)",
                        borderRadius: "12px",
                        color: "#ffffff",
                        fontSize: "16px",
                        transition: "all 0.3s ease",
                        backdropFilter: "blur(10px)",
                        outline: "none"
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = firebaseErrors.name ? "#f44336" : "#d4af37";
                        e.target.style.boxShadow = firebaseErrors.name ? "0 0 0 2px rgba(244,67,54,0.2)" : "0 0 0 2px rgba(212,175,55,0.2)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = firebaseErrors.name ? "#f44336" : "rgba(212,175,55,0.3)";
                        e.target.style.boxShadow = "none";
                      }}
                    />
                    {firebaseErrors.name && (
                      <div style={{ 
                        color: '#f44336', 
                        fontSize: '12px', 
                        marginBottom: '15px',
                        padding: '5px 10px',
                        background: 'rgba(244,67,54,0.1)',
                        borderRadius: '6px',
                        border: '1px solid rgba(244,67,54,0.3)'
                      }}>
                        {firebaseErrors.name.message}
                      </div>
                    )}
                  </div>

                  <div style={{ marginBottom: firebaseErrors.email ? '5px' : '20px' }}>
                    <input 
                      type="email" 
                      placeholder="Email Address (@gmail.com, @yahoo.com, @email.com)" 
                      {...registerFirebase("email")}
                      required 
                      style={{
                        width: "100%",
                        padding: "15px 20px",
                        background: "rgba(20,20,20,0.7)",
                        border: firebaseErrors.email ? "1px solid #f44336" : "1px solid rgba(212,175,55,0.3)",
                        borderRadius: "12px",
                        color: "#ffffff",
                        fontSize: "16px",
                        transition: "all 0.3s ease",
                        backdropFilter: "blur(10px)",
                        outline: "none"
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = firebaseErrors.email ? "#f44336" : "#d4af37";
                        e.target.style.boxShadow = firebaseErrors.email ? "0 0 0 2px rgba(244,67,54,0.2)" : "0 0 0 2px rgba(212,175,55,0.2)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = firebaseErrors.email ? "#f44336" : "rgba(212,175,55,0.3)";
                        e.target.style.boxShadow = "none";
                      }}
                    />
                    {firebaseErrors.email && (
                      <div style={{ 
                        color: '#f44336', 
                        fontSize: '12px', 
                        marginBottom: '15px',
                        padding: '5px 10px',
                        background: 'rgba(244,67,54,0.1)',
                        borderRadius: '6px',
                        border: '1px solid rgba(244,67,54,0.3)'
                      }}>
                        {firebaseErrors.email.message}
                      </div>
                    )}
                  </div>

                  <div style={{ marginBottom: firebaseErrors.password ? '5px' : '20px' }}>
                    <input 
                      type="password" 
                      placeholder="Password (Start with capital, min 9 chars, include number & special character)" 
                      {...registerFirebase("password")}
                      required 
                      style={{
                        width: "100%",
                        padding: "15px 20px",
                        background: "rgba(20,20,20,0.7)",
                        border: firebaseErrors.password ? "1px solid #f44336" : "1px solid rgba(212,175,55,0.3)",
                        borderRadius: "12px",
                        color: "#ffffff",
                        fontSize: "16px",
                        transition: "all 0.3s ease",
                        backdropFilter: "blur(10px)",
                        outline: "none"
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = firebaseErrors.password ? "#f44336" : "#d4af37";
                        e.target.style.boxShadow = firebaseErrors.password ? "0 0 0 2px rgba(244,67,54,0.2)" : "0 0 0 2px rgba(212,175,55,0.2)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = firebaseErrors.password ? "#f44336" : "rgba(212,175,55,0.3)";
                        e.target.style.boxShadow = "none";
                      }}
                    />
                    {firebaseErrors.password && (
                      <div style={{ 
                        color: '#f44336', 
                        fontSize: '12px', 
                        marginBottom: '15px',
                        padding: '5px 10px',
                        background: 'rgba(244,67,54,0.1)',
                        borderRadius: '6px',
                        border: '1px solid rgba(244,67,54,0.3)'
                      }}>
                        {firebaseErrors.password.message}
                      </div>
                    )}
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
                        Creating Account...
                      </div>
                    ) : (
                      " Register with Firebase"
                    )}
                  </button>
                </form>

                <div style={{ 
                  marginTop: '20px', 
                  padding: '15px', 
                  backgroundColor: 'rgba(212,175,55,0.1)', 
                  borderRadius: '12px',
                  border: '1px solid rgba(212,175,55,0.3)'
                }}>
                  <p style={{ 
                    margin: 0, 
                    fontSize: '14px', 
                    color: '#f9e076',
                    textAlign: 'center',
                    fontWeight: '500'
                  }}>
                    <strong>Firebase Registration:</strong> Uses Firebase Authentication for secure password management. Your account will be automatically verified.
                  </p>
                </div>
              </div>
            )}

            {/* Local Registration Form */}
            {activeTab === "local" && (
              <div>
                <form onSubmit={handleSubmitLocal(handleLocalRegister)}>
                  <div style={{ marginBottom: localErrors.name ? '5px' : '20px' }}>
                    <input 
                      type="text" 
                      placeholder="Full Name" 
                      {...registerLocal("name")}
                      required 
                      style={{
                        width: "100%",
                        padding: "15px 20px",
                        background: "rgba(20,20,20,0.7)",
                        border: localErrors.name ? "1px solid #f44336" : "1px solid rgba(212,175,55,0.3)",
                        borderRadius: "12px",
                        color: "#ffffff",
                        fontSize: "16px",
                        transition: "all 0.3s ease",
                        backdropFilter: "blur(10px)",
                        outline: "none"
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = localErrors.name ? "#f44336" : "#d4af37";
                        e.target.style.boxShadow = localErrors.name ? "0 0 0 2px rgba(244,67,54,0.2)" : "0 0 0 2px rgba(212,175,55,0.2)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = localErrors.name ? "#f44336" : "rgba(212,175,55,0.3)";
                        e.target.style.boxShadow = "none";
                      }}
                    />
                    {localErrors.name && (
                      <div style={{ 
                        color: '#f44336', 
                        fontSize: '12px', 
                        marginBottom: '15px',
                        padding: '5px 10px',
                        background: 'rgba(244,67,54,0.1)',
                        borderRadius: '6px',
                        border: '1px solid rgba(244,67,54,0.3)'
                      }}>
                        {localErrors.name.message}
                      </div>
                    )}
                  </div>

                  <div style={{ marginBottom: localErrors.email ? '5px' : '20px' }}>
                    <input 
                      type="email" 
                      placeholder="Email Address" 
                      {...registerLocal("email")}
                      required 
                      style={{
                        width: "100%",
                        padding: "15px 20px",
                        background: "rgba(20,20,20,0.7)",
                        border: localErrors.email ? "1px solid #f44336" : "1px solid rgba(212,175,55,0.3)",
                        borderRadius: "12px",
                        color: "#ffffff",
                        fontSize: "16px",
                        transition: "all 0.3s ease",
                        backdropFilter: "blur(10px)",
                        outline: "none"
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = localErrors.email ? "#f44336" : "#d4af37";
                        e.target.style.boxShadow = localErrors.email ? "0 0 0 2px rgba(244,67,54,0.2)" : "0 0 0 2px rgba(212,175,55,0.2)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = localErrors.email ? "#f44336" : "rgba(212,175,55,0.3)";
                        e.target.style.boxShadow = "none";
                      }}
                    />
                    {localErrors.email && (
                      <div style={{ 
                        color: '#f44336', 
                        fontSize: '12px', 
                        marginBottom: '15px',
                        padding: '5px 10px',
                        background: 'rgba(244,67,54,0.1)',
                        borderRadius: '6px',
                        border: '1px solid rgba(244,67,54,0.3)'
                      }}>
                        {localErrors.email.message}
                      </div>
                    )}
                  </div>

                  <div style={{ marginBottom: localErrors.password ? '5px' : '20px' }}>
                    <input 
                      type="password" 
                      placeholder="Password (min. 9 characters)" 
                      {...registerLocal("password")}
                      required 
                      style={{
                        width: "100%",
                        padding: "15px 20px",
                        background: "rgba(20,20,20,0.7)",
                        border: localErrors.password ? "1px solid #f44336" : "1px solid rgba(212,175,55,0.3)",
                        borderRadius: "12px",
                        color: "#ffffff",
                        fontSize: "16px",
                        transition: "all 0.3s ease",
                        backdropFilter: "blur(10px)",
                        outline: "none"
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = localErrors.password ? "#f44336" : "#d4af37";
                        e.target.style.boxShadow = localErrors.password ? "0 0 0 2px rgba(244,67,54,0.2)" : "0 0 0 2px rgba(212,175,55,0.2)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = localErrors.password ? "#f44336" : "rgba(212,175,55,0.3)";
                        e.target.style.boxShadow = "none";
                      }}
                    />
                    {localErrors.password && (
                      <div style={{ 
                        color: '#f44336', 
                        fontSize: '12px', 
                        marginBottom: '15px',
                        padding: '5px 10px',
                        background: 'rgba(244,67,54,0.1)',
                        borderRadius: '6px',
                        border: '1px solid rgba(244,67,54,0.3)'
                      }}>
                        {localErrors.password.message}
                      </div>
                    )}
                  </div>

                  <div style={{ marginBottom: localErrors.confirmPassword ? '5px' : '25px' }}>
                    <input 
                      type="password" 
                      placeholder="Confirm Password" 
                      {...registerLocal("confirmPassword")}
                      required 
                      style={{
                        width: "100%",
                        padding: "15px 20px",
                        background: "rgba(20,20,20,0.7)",
                        border: localErrors.confirmPassword ? "1px solid #f44336" : "1px solid rgba(212,175,55,0.3)",
                        borderRadius: "12px",
                        color: "#ffffff",
                        fontSize: "16px",
                        transition: "all 0.3s ease",
                        backdropFilter: "blur(10px)",
                        outline: "none"
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = localErrors.confirmPassword ? "#f44336" : "#d4af37";
                        e.target.style.boxShadow = localErrors.confirmPassword ? "0 0 0 2px rgba(244,67,54,0.2)" : "0 0 0 2px rgba(212,175,55,0.2)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = localErrors.confirmPassword ? "#f44336" : "rgba(212,175,55,0.3)";
                        e.target.style.boxShadow = "none";
                      }}
                    />
                    {localErrors.confirmPassword && (
                      <div style={{ 
                        color: '#f44336', 
                        fontSize: '12px', 
                        marginBottom: '15px',
                        padding: '5px 10px',
                        background: 'rgba(244,67,54,0.1)',
                        borderRadius: '6px',
                        border: '1px solid rgba(244,67,54,0.3)'
                      }}>
                        {localErrors.confirmPassword.message}
                      </div>
                    )}
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
                        Creating Account...
                      </div>
                    ) : (
                      " Register with Local System"
                    )}
                  </button>
                </form>

                <div style={{ 
                  marginTop: '20px', 
                  padding: '15px', 
                  backgroundColor: 'rgba(212,175,55,0.1)', 
                  borderRadius: '12px',
                  border: '1px solid rgba(212,175,55,0.3)'
                }}>
                  <p style={{ 
                    margin: 0, 
                    fontSize: '14px', 
                    color: '#f9e076',
                    textAlign: 'center',
                    fontWeight: '500'
                  }}>
                    <strong>Local Registration:</strong> Uses our traditional email verification system. Check your email for verification link.
                  </p>
                </div>
              </div>
            )}

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
            
            {/* Login Link */}
            <p style={{ textAlign: 'center', marginTop: '25px', color: 'rgba(255,255,255,0.7)' }}>
              Already have an account?{' '}
              <Link 
                to="/login" 
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
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Register;