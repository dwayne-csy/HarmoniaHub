import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../config/firebase";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const FirebaseLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleFirebaseLogin = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsLoading(true);

    try {
      // Sign in with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Get the Firebase ID token
      const idToken = await user.getIdToken();

      console.log("🔥 Firebase login successful:", user.email);

      // Send the token to your backend
      const { data } = await axios.post("http://localhost:4001/api/v1/firebase/login", {
        idToken
      });

      console.log("✅ Backend authentication successful");

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

      setMessage("Login successful! Redirecting...");

      // Redirect based on role
      setTimeout(() => {
        if (data.user.role === "admin") {
          navigate("/admin/dashboard");
        } else {
          navigate("/user/home");
        }
      }, 1000);

    } catch (error) {
      console.error("❌ Firebase login error:", error);
      
      if (error.code === 'auth/invalid-credential') {
        setMessage("Invalid email or password.");
      } else if (error.code === 'auth/user-not-found') {
        setMessage("No account found with this email.");
      } else if (error.code === 'auth/wrong-password') {
        setMessage("Incorrect password.");
      } else if (error.code === 'auth/invalid-email') {
        setMessage("Invalid email address.");
      } else if (error.code === 'auth/too-many-requests') {
        setMessage("Too many failed attempts. Please try again later.");
      } else if (error.code === 'auth/user-disabled') {
        setMessage("This account has been disabled.");
      } else {
        setMessage("Login failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2>Login with Firebase</h2>
      
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <p>Sign in with your email and password</p>
      </div>

      <form onSubmit={handleFirebaseLogin}>
        <input 
          type="email" 
          placeholder="Email Address" 
          value={email}
          onChange={(e) => setEmail(e.target.value)} 
          required 
          disabled={isLoading}
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={password}
          onChange={(e) => setPassword(e.target.value)} 
          required 
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Signing in..." : "Sign in with Firebase"}
        </button>
      </form>

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

      {/* Additional Options */}
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <Link 
          to="/forgot-password" 
          style={{ 
            color: '#4285f4', 
            textDecoration: 'none',
            fontSize: '14px'
          }}
        >
          Forgot Password?
        </Link>
      </div>

      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <Link 
          to="/login" 
          style={{ 
            color: '#666', 
            textDecoration: 'none',
            fontSize: '14px'
          }}
        >
          ← Back to Login Options
        </Link>
      </div>
    </div>
  );
};

export default FirebaseLogin;