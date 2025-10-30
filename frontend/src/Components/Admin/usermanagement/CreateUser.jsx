import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const CreateUser = () => {
  const [user, setUser] = useState({ name: "", email: "", password: "", role: "user" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleChange = (e) => setUser({ ...user, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      await axios.post("http://localhost:4001/api/v1/users", user, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage("User created successfully!");
      setTimeout(() => navigate("/admin/users"), 1000);
    } catch (error) {
      console.error(error);
      setMessage(error.response?.data?.message || "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <h2>Create New User</h2>
      {message && <p>{message}</p>}
      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Name" value={user.name} onChange={handleChange} required />
        <input name="email" placeholder="Email" type="email" value={user.email} onChange={handleChange} required />
        <input name="password" placeholder="Password" type="password" value={user.password} onChange={handleChange} required />
        <select name="role" value={user.role} onChange={handleChange}>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        <button type="submit" disabled={loading}>{loading ? "Creating..." : "Create User"}</button>
      </form>
    </div>
  );
};

export default CreateUser;
