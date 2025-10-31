import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Loader from "../../layouts/Loader";

const BASE_URL = "http://localhost:4001/api/v1";

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [deletedUsers, setDeletedUsers] = useState([]);
  const [showDeleted, setShowDeleted] = useState(false);
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showInitialLoader, setShowInitialLoader] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    const timer = setTimeout(() => setShowInitialLoader(false), 1000); // 1s initial loader
    fetchActiveUsers();
    if (token) fetchDeletedUsers();
    return () => clearTimeout(timer);
  }, [token]);

  // Fetch active users
  async function fetchActiveUsers() {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/users/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data.users || []);
    } catch (err) {
      console.error(err);
      setMsg({ type: "error", text: "Failed to load users." });
    } finally {
      setLoading(false);
    }
  }

  // Fetch deleted users
  async function fetchDeletedUsers() {
    try {
      const res = await axios.get(`${BASE_URL}/users/deleted`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDeletedUsers(res.data.users || []);
    } catch (err) {
      console.error("Failed to load deleted users:", err);
    }
  }

  // Role change
  async function handleRoleChange(id, newRole) {
    try {
      await axios.patch(
        `${BASE_URL}/users/role/${id}`,
        { role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMsg({ type: "success", text: "Role updated successfully." });
      fetchActiveUsers();
    } catch {
      setMsg({ type: "error", text: "Failed to update role." });
    }
  }

  // Status change
  async function handleStatusChange(id, newStatus) {
    try {
      await axios.patch(
        `${BASE_URL}/users/status/${id}`,
        { isActive: newStatus === "Active" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMsg({ type: "success", text: "Status updated successfully." });
      fetchActiveUsers();
    } catch {
      setMsg({ type: "error", text: "Failed to update status." });
    }
  }

  // Soft delete
  async function handleDelete(id) {
    if (!window.confirm("Soft delete this user?")) return;
    try {
      await axios.delete(`${BASE_URL}/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMsg({ type: "success", text: "User moved to trash." });
      fetchActiveUsers();
      fetchDeletedUsers();
    } catch {
      setMsg({ type: "error", text: "Failed to delete user." });
    }
  }

  // Restore
  async function handleRestore(id) {
    if (!window.confirm("Restore this user?")) return;
    try {
      await axios.patch(`${BASE_URL}/users/restore/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMsg({ type: "success", text: "User restored successfully." });
      fetchActiveUsers();
      fetchDeletedUsers();
    } catch {
      setMsg({ type: "error", text: "Failed to restore user." });
    }
  }

  const displayedUsers = showDeleted ? deletedUsers : users;

  // Show initial loader
  if (showInitialLoader) {
    return (
      <div className="loader-container">
        <Loader />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1000, margin: "30px auto", padding: "20px" }}>
      <h2>{showDeleted ? "Deleted Users (Trash)" : "Active Users"}</h2>

      <div style={{ marginBottom: 12 }}>
        {!showDeleted && (
          <button
            onClick={() => navigate("/admin/users/create")}
            style={{
              padding: "8px 14px",
              background: "#007bff",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            ➕ Create User
          </button>
        )}
        <button
          onClick={() => setShowDeleted(!showDeleted)}
          style={{
            marginLeft: 10,
            padding: "8px 14px",
            background: showDeleted ? "#28a745" : "#6c757d",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          {showDeleted ? "👥 Show Active Users" : "🗑️ View Trash"}
        </button>
      </div>

      {msg && (
        <div
          style={{
            backgroundColor: msg.type === "error" ? "#f8d7da" : "#d4edda",
            color: msg.type === "error" ? "#721c24" : "#155724",
            padding: "10px",
            borderRadius: "6px",
            marginBottom: "10px",
          }}
        >
          {msg.text}
        </div>
      )}

      {loading ? (
        <div className="loader-container">
          <Loader />
        </div>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff" }}>
          <thead>
            <tr style={{ background: "#f1f3f5", borderBottom: "1px solid #ddd" }}>
              <th style={{ padding: 12 }}>Name</th>
              <th>Address</th>
              <th>Role</th>
              <th>Status</th>
              <th style={{ textAlign: "center" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayedUsers.map((u) => (
              <tr key={u._id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: 12, fontWeight: 600, display: "flex", alignItems: "center" }}>
                  {u.name}
                  {u.isVerified && (
                    <img
                      src="/images/verified.jpg"
                      alt="Verified"
                      style={{ width: 16, height: 16, marginLeft: 6, borderRadius: "50%" }}
                    />
                  )}
                </td>
                <td>
                  {u.address
                    ? `${u.address.city}, ${u.address.barangay}, ${u.address.street}, ${u.address.zipcode}`
                    : "—"}
                </td>
                <td style={{ textAlign: "center" }}>
                  {!showDeleted ? (
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u._id, e.target.value)}
                      style={{
                        padding: "5px 8px",
                        borderRadius: "5px",
                        border: "1px solid #ccc",
                        backgroundColor: u.role === "admin" ? "#fde8e8" : "#e8f8ee",
                        color: u.role === "admin" ? "#b10000" : "#0a640a",
                        fontWeight: "500",
                      }}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  ) : (
                    u.role
                  )}
                </td>
                <td style={{ textAlign: "center" }}>
                  {!showDeleted ? (
                    <select
                      value={u.isActive ? "Active" : "Inactive"}
                      onChange={(e) => handleStatusChange(u._id, e.target.value)}
                      style={{
                        padding: "5px 8px",
                        borderRadius: "5px",
                        border: "1px solid #ccc",
                        backgroundColor: u.isActive ? "#e8f8ee" : "#fde8e8",
                        color: u.isActive ? "#155724" : "#721c24",
                        fontWeight: "500",
                      }}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  ) : (
                    u.isActive ? "Active" : "Inactive"
                  )}
                </td>
                <td style={{ textAlign: "center" }}>
                  {showDeleted ? (
                    <button
                      onClick={() => handleRestore(u._id)}
                      style={{
                        background: "#28a745",
                        color: "#fff",
                        border: "none",
                        borderRadius: "5px",
                        padding: "5px 10px",
                        cursor: "pointer",
                      }}
                    >
                      ♻️ Restore
                    </button>
                  ) : (
                    <button
                      onClick={() => handleDelete(u._id)}
                      style={{
                        background: "#dc3545",
                        color: "#fff",
                        border: "none",
                        borderRadius: "5px",
                        padding: "5px 10px",
                        cursor: "pointer",
                      }}
                    >
                      🗑️Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {displayedUsers.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: "center", color: "#666", padding: "15px" }}>
                  {showDeleted ? "No deleted users." : "No active users."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
