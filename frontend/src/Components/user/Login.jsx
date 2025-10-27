import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post("http://localhost:4001/api/v1/login", { email, password });
      
      // Store user data in localStorage with proper structure
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify({
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
        id: data.user._id
      }));
      
      setMessage("Login successful!");
      
      // Redirect based on role
      if (data.user.role === 'admin') {
        navigate("/admin/dashboard");
      } else {
        navigate("/user/home");
      }
      
    } catch (error) {
      setMessage(error.response?.data?.message || "Invalid credentials");
    }
  };

  return (
    <div className="form-container">
      <h2>Login</h2>
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
        <button type="submit">Login</button>
      </form>
      <p>{message}</p>
      <Link to="/forgot-password">Forgot Password?</Link>
      <p>Don't have an account? <Link to="/register">Register</Link></p>
    </div>
  );
};

export default Login;