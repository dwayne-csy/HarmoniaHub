import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await axios.get("http://localhost:4001/api/v1/users", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(data.users);
    } catch (error) {
      console.error(error);
      setMessage("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id) => {
    try {
      await axios.patch(`http://localhost:4001/api/v1/users/status/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers();
    } catch (error) {
      console.error(error);
      setMessage("Failed to update status");
    }
  };

  const softDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:4001/api/v1/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers();
    } catch (error) {
      console.error(error);
      setMessage("Failed to delete user");
    }
  };

  const restoreUser = async (id) => {
    try {
      await axios.patch(`http://localhost:4001/api/v1/users/restore/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers();
    } catch (error) {
      console.error(error);
      setMessage("Failed to restore user");
    }
  };

  if (loading) return <p>Loading users...</p>;

  return (
    <div className="page-container">
      <h2>Users</h2>
      {message && <p className="error">{message}</p>}
      <button onClick={() => navigate("/admin/users/create")}>Create New User</button>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u._id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>{u.isActive ? "Active" : "Inactive"}</td>
              <td>
                <button onClick={() => toggleStatus(u._id)}>
                  {u.isActive ? "Deactivate" : "Activate"}
                </button>
                <button onClick={() => softDelete(u._id)}>Delete</button>
                {!u.isActive && u.isDeleted && (
                  <button onClick={() => restoreUser(u._id)}>Restore</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserList;
