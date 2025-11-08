// HarmoniaHub/frontend/src/Components/admin/userManagement/UserList.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import MUIDataTable from "mui-datatables";
import { Button } from "@mui/material";
import Loader from "../../layouts/Loader";

const BASE_URL = "http://localhost:4001/api/v1";

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [deletedUsers, setDeletedUsers] = useState([]);
  const [showDeleted, setShowDeleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedRows, setSelectedRows] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const displayedUsers = showDeleted ? deletedUsers : users;

  useEffect(() => {
    fetchActiveUsers();
    if (token) fetchDeletedUsers();
  }, [token]);

  const fetchActiveUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/users/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDeletedUsers = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/users/deleted`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDeletedUsers(res.data.users || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRoleChange = async (id, newRole) => {
    try {
      await axios.patch(
        `${BASE_URL}/users/role/${id}`,
        { role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchActiveUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.patch(
        `${BASE_URL}/users/status/${id}`,
        { isActive: newStatus === "Active" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchActiveUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (selectedRows.length === 0) return alert("No users selected.");
    if (!window.confirm(`Soft delete ${selectedRows.length} selected users?`)) return;
    try {
      await Promise.all(selectedRows.map(i => {
        const id = displayedUsers[i]._id;
        return axios.delete(`${BASE_URL}/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }));
      fetchActiveUsers();
      fetchDeletedUsers();
      setSelectedRows([]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRestore = async () => {
    if (selectedRows.length === 0) return alert("No users selected.");
    if (!window.confirm(`Restore ${selectedRows.length} selected users?`)) return;
    try {
      await Promise.all(selectedRows.map(i => {
        const id = displayedUsers[i]._id;
        return axios.patch(`${BASE_URL}/users/restore/${id}`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }));
      fetchActiveUsers();
      fetchDeletedUsers();
      setSelectedRows([]);
    } catch (err) {
      console.error(err);
    }
  };

  const columns = [
    { name: "name", label: "Name" },
    {
      name: "role",
      label: "Role",
      options: {
        customBodyRenderLite: (dataIndex) => {
          const u = displayedUsers[dataIndex];
          return !showDeleted ? (
            <select
              value={u.role}
              onChange={(e) => handleRoleChange(u._id, e.target.value)}
              style={{
                padding: "4px 8px",
                borderRadius: 5,
                border: "1px solid #ccc",
              }}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          ) : (
            u.role
          );
        },
      },
    },
    {
      name: "status",
      label: "Status",
      options: {
        customBodyRenderLite: (dataIndex) => {
          const u = displayedUsers[dataIndex];
          return !showDeleted ? (
            <select
              value={u.isActive ? "Active" : "Inactive"}
              onChange={(e) => handleStatusChange(u._id, e.target.value)}
              style={{
                padding: "4px 8px",
                borderRadius: 5,
                border: "1px solid #ccc",
              }}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          ) : (
            u.isActive ? "Active" : "Inactive"
          );
        },
      },
    },
   {
  name: "_id",
  label: "Actions",
  options: {
    filter: false,
    sort: false,
    display: showDeleted ? "excluded" : "true",
    customBodyRenderLite: (dataIndex) => {
      const u = displayedUsers[dataIndex];
      return showDeleted ? (
        <Button
          variant="contained"
          color="success"
          onClick={() => handleRestore()}
        >
          Restore
        </Button>
      ) : (
        <Button
          onClick={() => navigate(`/admin/users/view/${u._id}`)}
        >
          View
        </Button>

      );
    },
  },
}
  ];

  const options = {
    selectableRows: "multiple",
    selectableRowsOnClick: true,
    onRowSelectionChange: (currentRowsSelected, allRowsSelected, rowsSelected) => {
      setSelectedRows(rowsSelected);
    },
    download: false,
    print: false,
    viewColumns: false,
    filter: false,
    search: true,
    rowsPerPage: 10,
    rowsPerPageOptions: [5, 10, 25, 50],
    elevation: 0,
  };

  if (loading) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "80vh",
      }}>
        <Loader />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: "24px auto", padding: 16 }}>
      <h2>{showDeleted ? "Deleted Users (Trash)" : "Active Users"}</h2>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {!showDeleted && (
          <Button variant="contained" onClick={() => navigate("/admin/users/create")}>
            ➕ Create User
          </Button>
        )}
        <Button variant="contained" color={showDeleted ? "success" : "primary"} onClick={() => setShowDeleted(!showDeleted)}>
          {showDeleted ? "Show Active" : "Trash"}
        </Button>
        {showDeleted ? (
          <Button variant="contained" color="success" onClick={handleRestore}>
            Restore Selected
          </Button>
        ) : (
          <Button variant="contained" color="error" onClick={handleDelete}>
            Delete Selected
          </Button>
        )}
      </div>

      <MUIDataTable
        data={displayedUsers}
        columns={columns}
        options={options}
      />
    </div>
  );
}
