// HarmoniaHub/frontend/src/Components/admin/userManagement/UserList.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import MUIDataTable from "mui-datatables";
import { 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Stack, 
  Box,
  Typography,
  Chip,
  IconButton
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import Loader from "../../layouts/Loader";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import AdminHeader from "../../layouts/admin/AdminHeader";
import AdminFooter from "../../layouts/admin/AdminFooter";

const BASE_URL = "http://localhost:4001/api/v1";

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [deletedUsers, setDeletedUsers] = useState([]);
  const [showDeleted, setShowDeleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [verifiedFilter, setVerifiedFilter] = useState('');

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  const displayedUsers = (showDeleted ? deletedUsers : users).filter(u =>
    (roleFilter ? u.role === roleFilter : true) &&
    (statusFilter ? (statusFilter === "Active" ? u.isActive : !u.isActive) : true) &&
    (verifiedFilter ? (verifiedFilter === "Verified" ? u.isVerified : !u.isVerified) : true)
  );

  useEffect(() => {
    fetchActiveUsers();
    if (token) fetchDeletedUsers();
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const fetchActiveUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/users/all`, { headers: { Authorization: `Bearer ${token}` } });
      setUsers(res.data.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDeletedUsers = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/users/deleted`, { headers: { Authorization: `Bearer ${token}` } });
      setDeletedUsers(res.data.users || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRoleChange = async (id, newRole) => {
    try {
      await axios.patch(`${BASE_URL}/users/role/${id}`, { role: newRole }, { headers: { Authorization: `Bearer ${token}` } });
      fetchActiveUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.patch(`${BASE_URL}/users/status/${id}`, { isActive: newStatus === "Active" }, { headers: { Authorization: `Bearer ${token}` } });
      fetchActiveUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return alert("No users selected.");
    if (!window.confirm(`Soft delete ${selectedIds.length} selected users?`)) return;
    try {
      await Promise.all(selectedIds.map(id =>
        axios.delete(`${BASE_URL}/users/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      ));
      fetchActiveUsers();
      fetchDeletedUsers();
      setSelectedIds([]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRestore = async () => {
    if (selectedIds.length === 0) return alert("No users selected.");
    if (!window.confirm(`Restore ${selectedIds.length} selected users?`)) return;
    try {
      await Promise.all(selectedIds.map(id =>
        axios.patch(`${BASE_URL}/users/restore/${id}`, {}, { headers: { Authorization: `Bearer ${token}` } })
      ));
      fetchActiveUsers();
      fetchDeletedUsers();
      setSelectedIds([]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleBulkHardDelete = async () => {
    if (selectedIds.length === 0) return alert("No users selected.");
    if (!window.confirm(`Permanently delete ${selectedIds.length} selected users? This cannot be undone.`)) return;
    try {
      await Promise.all(selectedIds.map(id =>
        axios.delete(`${BASE_URL}/users/delete/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      ));
      fetchDeletedUsers();
      setSelectedIds([]);
    } catch (err) {
      console.error(err);
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.setTextColor(212, 175, 55);
    doc.text('HarmoniaHub', 14, 15);
    doc.setFontSize(12);
    doc.text('User List', 14, 25);

    const tableColumn = ["Name", "Email", "Role", "Status", "Verified"];
    const tableRows = [];

    displayedUsers.forEach(u => {
      tableRows.push([
        u.name,
        u.email,
        u.role,
        u.isActive ? "Active" : "Inactive",
        u.isVerified ? "Verified" : "Not Verified"
      ]);
    });

    autoTable(doc, { head: [tableColumn], body: tableRows, startY: 30 });
    doc.save('UserList.pdf');
  };


  const columns = [
    {
      name: "name",
      label: "Name",
      options: {
        customBodyRenderLite: (dataIndex) => {
          const u = displayedUsers[dataIndex];
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography sx={{ color: '#000000ff' }}>{u.name}</Typography>
              {u.isVerified && (
                <img 
                  src="/images/verified.jpg" 
                  alt="Verified" 
                  style={{ 
                    width: "20px", 
                    height: "20px",
                    borderRadius: "50%"
                  }} 
                />
              )}
            </Box>
          );
        }
      }
    },
    { name: "email", label: "Email" },
    {
      name: "role",
      label: "Role",
      options: {
        customBodyRenderLite: (dataIndex) => {
          const u = displayedUsers[dataIndex];
          return !showDeleted ? (
            <Select
              value={u.role}
              onChange={(e) => handleRoleChange(u._id, e.target.value)}
              size="small"
              sx={{
                color: "#000000ff",
                background: "rgba(212,175,55,0.1)",
                border: "1px solid rgba(212,175,55,0.3)",
                borderRadius: "8px",
                '& .MuiSelect-icon': { color: "#d4af37" }
              }}
            >
              <MenuItem value="user" sx={{ color: "#000000ff", background: "#2d2d2d" }}>User</MenuItem>
              <MenuItem value="admin" sx={{ color: "#000000ff", background: "#2d2d2d" }}>Admin</MenuItem>
            </Select>
          ) : (
            <Chip 
              label={u.role} 
              sx={{ 
                background: u.role === "admin" 
                  ? "linear-gradient(135deg, #d4af37, #b8860b)"
                  : "rgba(212,175,55,0.2)",
                color: u.role === "admin" ? "#1a1a1a" : "#d4af37",
                fontWeight: "bold"
              }} 
            />
          );
        }
      }
    },
    {
      name: "isActive",
      label: "Status",
      options: {
        customBodyRenderLite: (dataIndex) => {
          const u = displayedUsers[dataIndex];
          return !showDeleted ? (
            <Select
              value={u.isActive ? "Active" : "Inactive"}
              onChange={(e) => handleStatusChange(u._id, e.target.value)}
              size="small"
              sx={{
                color: "#000000ff",
                background: u.isActive 
                  ? "rgba(76, 175, 80, 0.2)"
                  : "rgba(244, 67, 54, 0.2)",
                border: u.isActive 
                  ? "1px solid rgba(76, 175, 80, 0.5)"
                  : "1px solid rgba(244, 67, 54, 0.5)",
                borderRadius: "8px",
                '& .MuiSelect-icon': { color: "#d4af37" }
              }}
            >
              <MenuItem value="Active" sx={{ color: "#000000ff", background: "#2d2d2d" }}>Active</MenuItem>
              <MenuItem value="Inactive" sx={{ color: "#fff", background: "#2d2d2d" }}>Inactive</MenuItem>
            </Select>
          ) : (
            <Chip 
              label={u.isActive ? "Active" : "Inactive"} 
              sx={{ 
                background: u.isActive 
                  ? "linear-gradient(135deg, #4CAF50, #45a049)"
                  : "linear-gradient(135deg, #F44336, #d32f2f)",
                color: "#fff",
                fontWeight: "bold"
              }} 
            />
          );
        }
      }
    },
    ...(showDeleted ? [] : [{
      name: "_id",
      label: "Actions",
      options: {
        filter: false,
        sort: false,
        customBodyRenderLite: (dataIndex) => {
          const u = displayedUsers[dataIndex];
          return (
            <Button
              sx={{ 
                background: "linear-gradient(135deg, #d4af37, #b8860b)",
                color: "#1a1a1a",
                fontWeight: "bold",
                '&:hover': { 
                  background: "linear-gradient(135deg, #e6c453, #c9970b)",
                  transform: "translateY(-2px)"
                },
                transition: "all 0.3s ease"
              }}
              onClick={() => navigate(`/admin/users/view/${u._id}`)}
            >
              View
            </Button>
          );
        }
      }
    }])
  ];

  const options = {
    selectableRows: "multiple",
    selectableRowsOnClick: true,
    rowsSelected: displayedUsers.map((u, i) => selectedIds.includes(u._id) ? i : null).filter(i => i !== null),
    onRowSelectionChange: (currentRowsSelected, allRowsSelected, rowsSelectedIndexes) => {
      const ids = rowsSelectedIndexes.map(i => displayedUsers[i]._id);
      setSelectedIds(ids);
    },
    download: false,
    print: false,
    viewColumns: false,
    filter: false,
    search: true,
    rowsPerPage: 10,
    rowsPerPageOptions: [5, 10, 25, 50],
    elevation: 0,
    customToolbarSelect: () => <></>,
    selectableRowsHeader: true,
    textLabels: {
      body: { noMatch: "No users found", toolTip: "Sort" },
      pagination: { next: "Next", previous: "Previous", rowsPerPage: "Rows per page:" },
      toolbar: { search: "Search", downloadCsv: "Download CSV", print: "Print", viewColumns: "View Columns", filterTable: "Filter Table" },
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: "flex", 
        flexDirection: "column", 
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 50%, #2d2d2d 100%)",
        margin: 0,
        padding: 0
      }}>
        <AdminHeader admin={user} handleLogout={handleLogout} />
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '80vh', 
          flex: 1,
          margin: 0,
          padding: 0
        }}>
          <Loader />
        </div>
        <AdminFooter />
      </div>
    );
  }

  return (
    <div style={{ 
      display: "flex", 
      flexDirection: "column", 
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 50%, #2d2d2d 100%)",
      position: "relative",
      overflow: "hidden",
      margin: 0,
      padding: 0,
      width: "100vw"
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

      <AdminHeader admin={user} handleLogout={handleLogout} />
      
      <main style={{ 
        flex: 1, 
        padding: "0",
        backgroundColor: "transparent",
        position: "relative",
        zIndex: 1,
        margin: 0,
        width: "100%"
      }}>
        <style>
          {`
            body {
              margin: 0;
              padding: 0;
              overflow-x: hidden;
              background: linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 50%, #2d2d2d 100%);
            }
            html, body, #root {
              margin: 0;
              padding: 0;
              width: 100%;
              min-height: 100vh;
            }
            /* MUI DataTable overrides */
            .MuiTable-root {
              background-color: transparent !important;
            }
            .MuiTableHead-root {
              background-color: rgba(30, 30, 30, 0.9) !important;
            }
            .MuiTableRow-root {
              background-color: transparent !important;
            }
            .MuiTableCell-head {
              background-color: rgba(40, 40, 40, 0.9) !important;
              color: #d4af37 !important;
              border-bottom: 1px solid rgba(212,175,55,0.3) !important;
            }
            .MuiTableCell-body {
              background-color: transparent !important;
              color: #ffffff !important;
              border-bottom: 1px solid rgba(212,175,55,0.2) !important;
            }
            .MuiTableSortLabel-root:hover {
              color: #d4af37 !important;
            }
            .MuiTableSortLabel-icon {
              color: #d4af37 !important;
            }
            .MuiCheckbox-root {
              color: #d4af37 !important;
            }
            .MuiTablePagination-root {
              color: #d4af37 !important;
            }
            .MuiTablePagination-selectIcon {
              color: #d4af37 !important;
            }
            .MuiInputBase-root {
              color: #000000ff !important;
            }
            .MuiTableContainer-root {
              background-color: transparent !important;
              box-shadow: none !important;
            }
          `}
        </style>
        
        <Box sx={{ 
          maxWidth: "100%", 
          margin: "0",
          padding: "20px 0"
        }}>
          <Box sx={{ 
            maxWidth: "100%", 
            margin: '0',
            background: "linear-gradient(135deg, rgba(30,30,30,0.95) 0%, rgba(40,40,40,0.95) 100%)",
            backdropFilter: "blur(15px)",
            padding: "30px 20px",
            borderRadius: "0",
            boxShadow: "0 12px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(212,175,55,0.2)",
            border: "1px solid rgba(212,175,55,0.3)",
            position: "relative",
            overflow: "hidden",
            minHeight: "calc(100vh - 140px)"
          }}>
            
            {/* Gold accent line */}
            <div style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "3px",
              background: "linear-gradient(90deg, transparent, #d4af37, transparent)"
            }}></div>

            {/* Back Button and Title Section */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, maxWidth: "1200px", margin: "0 auto", padding: "0 10px" }}>
              <IconButton
                onClick={() => navigate("/admin/dashboard")}
                sx={{
                  color: "#d4af37",
                  background: "rgba(212,175,55,0.1)",
                  border: "1px solid rgba(212,175,55,0.3)",
                  mr: 2,
                  '&:hover': {
                    background: "rgba(212,175,55,0.2)",
                    transform: "translateY(-2px)",
                    boxShadow: "0 4px 12px rgba(212,175,55,0.3)"
                  },
                  transition: "all 0.3s ease"
                }}
              >
                <ArrowBack />
              </IconButton>
              
              <Typography variant="h4" sx={{ 
                fontWeight: "bold", 
                color: "#d4af37",
                textShadow: "0 2px 4px rgba(0,0,0,0.5)"
              }}>
                {showDeleted ? 'Deleted Users (Trash)' : 'User Management'}
              </Typography>
            </Box>

            {/* Filter Section */}
            <Box sx={{ maxWidth: "1200px", margin: "0 auto", padding: "0 10px" }}>
              <Stack direction="row" spacing={2} mb={3}>
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel sx={{ color: '#d4af37' }}>Role</InputLabel>
                  <Select
                    value={roleFilter}
                    label="Role"
                    onChange={e => setRoleFilter(e.target.value)}
                    sx={{ 
                      color: '#fff', 
                      borderColor: '#D4AF37',
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(212,175,55,0.3)' },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(212,175,55,0.5)' },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#d4af37' },
                      '& .MuiSvgIcon-root': { color: '#D4AF37' }
                    }}
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="user">User</MenuItem>
                    <MenuItem value="admin">Admin</MenuItem>
                  </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel sx={{ color: '#d4af37' }}>Status</InputLabel>
                  <Select
                    value={statusFilter}
                    label="Status"
                    onChange={e => setStatusFilter(e.target.value)}
                    sx={{ 
                      color: '#fff', 
                      borderColor: '#D4AF37',
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(212,175,55,0.3)' },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(212,175,55,0.5)' },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#d4af37' },
                      '& .MuiSvgIcon-root': { color: '#D4AF37' }
                    }}
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="Active">Active</MenuItem>
                    <MenuItem value="Inactive">Inactive</MenuItem>
                  </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel sx={{ color: '#d4af37' }}>Verified</InputLabel>
                  <Select
                    value={verifiedFilter}
                    label="Verified"
                    onChange={e => setVerifiedFilter(e.target.value)}
                    sx={{ 
                      color: '#fff', 
                      borderColor: '#D4AF37',
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(212,175,55,0.3)' },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(212,175,55,0.5)' },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#d4af37' },
                      '& .MuiSvgIcon-root': { color: '#D4AF37' }
                    }}
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="Verified">Verified</MenuItem>
                    <MenuItem value="Not Verified">Not Verified</MenuItem>
                  </Select>
                </FormControl>
              </Stack>

              {/* Action Buttons */}
              <Stack direction="row" spacing={2} mb={3} flexWrap="wrap" gap={1}>
                {!showDeleted && (
                  <Button
                    variant="contained"
                    onClick={() => navigate("/admin/users/create")}
                    sx={{
                      background: "linear-gradient(135deg, #d4af37, #b8860b)",
                      color: "#1a1a1a",
                      fontWeight: "bold",
                      "&:hover": {
                        background: "linear-gradient(135deg, #e6c453, #c9970b)",
                        transform: "translateY(-2px)",
                        boxShadow: "0 8px 25px rgba(212,175,55,0.4)"
                      },
                      transition: "all 0.3s ease"
                    }}
                  >
                    ➕ Create User
                  </Button>
                )}
                
                <Button
                  variant="contained"
                  onClick={() => setShowDeleted(!showDeleted)}
                  sx={{
                    background: showDeleted 
                      ? "linear-gradient(135deg, #4CAF50, #45a049)"
                      : "linear-gradient(135deg, #d4af37, #b8860b)",
                    color: "#1a1a1a",
                    fontWeight: "bold",
                    "&:hover": {
                      background: showDeleted 
                        ? "linear-gradient(135deg, #66bb6a, #4caf50)"
                        : "linear-gradient(135deg, #e6c453, #c9970b)",
                      transform: "translateY(-2px)",
                      boxShadow: "0 8px 25px rgba(212,175,55,0.4)"
                    },
                    transition: "all 0.3s ease"
                  }}
                >
                  {showDeleted ? 'Show Active' : 'Trash'}
                </Button>

                {showDeleted ? (
                  <>
                    <Button
                      variant="contained"
                      onClick={handleRestore}
                      disabled={selectedIds.length === 0}
                      sx={{
                        background: "linear-gradient(135deg, #28a745, #218838)",
                        color: "#fff",
                        fontWeight: "bold",
                        "&:hover": {
                          background: "linear-gradient(135deg, #34ce57, #28a745)",
                          transform: "translateY(-2px)"
                        },
                        "&:disabled": {
                          background: "rgba(40, 167, 69, 0.3)",
                          color: "rgba(255,255,255,0.5)"
                        },
                        transition: "all 0.3s ease"
                      }}
                    >
                      Restore Selected
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleBulkHardDelete}
                      disabled={selectedIds.length === 0}
                      sx={{
                        background: "linear-gradient(135deg, #dc3545, #c82333)",
                        color: "#fff",
                        fontWeight: "bold",
                        "&:hover": {
                          background: "linear-gradient(135deg, #e74c3c, #dc3545)",
                          transform: "translateY(-2px)"
                        },
                        "&:disabled": {
                          background: "rgba(220, 53, 69, 0.3)",
                          color: "rgba(255,255,255,0.5)"
                        },
                        transition: "all 0.3s ease"
                      }}
                    >
                      Delete Selected
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="contained"
                    onClick={handleBulkDelete}
                    disabled={selectedIds.length === 0}
                    sx={{
                      background: "linear-gradient(135deg, #dc3545, #c82333)",
                      color: "#fff",
                      fontWeight: "bold",
                      "&:hover": {
                        background: "linear-gradient(135deg, #e74c3c, #dc3545)",
                        transform: "translateY(-2px)"
                      },
                      "&:disabled": {
                        background: "rgba(220, 53, 69, 0.3)",
                        color: "rgba(255,255,255,0.5)"
                      },
                      transition: "all 0.3s ease"
                    }}
                  >
                    Delete Selected
                  </Button>
                )}
              </Stack>
            </Box>

            {/* Data Table - Full Width */}
            <Box sx={{ width: "100%", padding: "0 10px" }}>
              <MUIDataTable
                data={displayedUsers}
                columns={columns}
                options={options}
              />
            </Box>

            {/* Export Button */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: 2, maxWidth: "1200px", margin: "0 auto", padding: "0 10px" }}>
              <Button
                variant="contained"
                onClick={exportPDF}
                sx={{
                  background: "linear-gradient(135deg, #d4af37, #b8860b)",
                  color: "#1a1a1a",
                  fontWeight: "bold",
                  "&:hover": {
                    background: "linear-gradient(135deg, #e6c453, #c9970b)",
                    transform: "translateY(-2px)",
                    boxShadow: "0 8px 25px rgba(212,175,55,0.4)"
                  },
                  transition: "all 0.3s ease"
                }}
              >
                Export PDF
              </Button>
            </Box>
          </Box>
        </Box>
      </main>

      <AdminFooter />
    </div>
  );
}