// HarmoniaHub/frontend/src/Components/admin/suppliermanagement/SupplierList.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import MUIDataTable from "mui-datatables";
import { 
  Button, 
  MenuItem, 
  FormControl, 
  Select, 
  InputLabel, 
  Stack, 
  Box, 
  IconButton,
  Typography,
  Chip
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import Loader from '../../layouts/Loader';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import AdminHeader from "../../layouts/admin/AdminHeader";
import AdminFooter from "../../layouts/admin/AdminFooter";

const BASE_URL = 'http://localhost:4001/api/v1';

export default function SupplierList() {
  const [suppliers, setSuppliers] = useState([]);
  const [deletedSuppliers, setDeletedSuppliers] = useState([]);
  const [displayedSuppliers, setDisplayedSuppliers] = useState([]);
  const [showDeleted, setShowDeleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [cityFilter, setCityFilter] = useState('');
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchActiveSuppliers();
    if (token) fetchDeletedSuppliers();
  }, [token]);

  useEffect(() => {
    applyFilters();
  }, [suppliers, deletedSuppliers, showDeleted, cityFilter]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const fetchActiveSuppliers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/suppliers`);
      setSuppliers(res.data.suppliers || []);
    } catch (err) {
      console.error(err);
      alert('Failed to load suppliers');
    } finally {
      setLoading(false);
    }
  };

  const fetchDeletedSuppliers = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/admin/suppliers/trash`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setDeletedSuppliers(res.data.suppliers || []);
    } catch (err) {
      console.error(err);
    }
  };

  const applyFilters = () => {
    const list = showDeleted ? deletedSuppliers : suppliers;
    let filtered = [...list];

    if (cityFilter) filtered = filtered.filter(s => s.address?.city === cityFilter);

    setDisplayedSuppliers(filtered);
  };

  const handleBulkSoftDelete = async () => {
    if (selectedIds.length === 0) return alert('No suppliers selected.');
    if (!window.confirm(`Soft delete ${selectedIds.length} selected suppliers?`)) return;

    try {
      await Promise.all(selectedIds.map(id =>
        axios.delete(`${BASE_URL}/admin/suppliers/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      ));
      fetchActiveSuppliers();
      fetchDeletedSuppliers();
      setSelectedIds([]);
      alert('Suppliers deleted successfully');
    } catch (err) {
      console.error(err);
      alert('Failed to delete suppliers');
    }
  };

  const handleRestore = async () => {
    if (selectedIds.length === 0) return alert('No suppliers selected.');
    if (!window.confirm(`Restore ${selectedIds.length} selected suppliers?`)) return;

    try {
      await Promise.all(selectedIds.map(id =>
        axios.patch(`${BASE_URL}/admin/suppliers/restore/${id}`, {}, { headers: { Authorization: `Bearer ${token}` } })
      ));
      fetchActiveSuppliers();
      fetchDeletedSuppliers();
      setSelectedIds([]);
      alert('Suppliers restored successfully');
    } catch (err) {
      console.error(err);
      alert('Failed to restore suppliers');
    }
  };

  const handlePermanentDelete = async () => {
    if (selectedIds.length === 0) return alert('No suppliers selected.');
    if (!window.confirm(`Permanently delete ${selectedIds.length} selected suppliers? This cannot be undone.`)) return;

    try {
      await Promise.all(selectedIds.map(id =>
        axios.delete(`${BASE_URL}/admin/suppliers/delete/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      ));
      fetchDeletedSuppliers();
      setSelectedIds([]);
      alert('Selected suppliers permanently deleted.');
    } catch (err) {
      console.error(err);
      alert('Failed to delete selected suppliers.');
    }
  };

  const handleView = (id) => {
    navigate(`/admin/suppliers/view/${id}`);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.setTextColor(212, 175, 55);
    doc.text('HarmoniaHub', 14, 15);
    doc.setFontSize(12);
    doc.text('Supplier List', 14, 25);

    const tableColumn = ["Name", "Email", "Phone", "City", "Status"];
    const tableRows = [];

    displayedSuppliers.forEach(supplier => {
      tableRows.push([
        supplier.name,
        supplier.email,
        supplier.phone,
        supplier.address?.city || '—',
        supplier.isActive ? 'Active' : 'Deleted'
      ]);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30
    });

    doc.save('SupplierList.pdf');
  };

  const cities = [...new Set(suppliers.concat(deletedSuppliers).map(s => s.address?.city).filter(Boolean))];

  const columns = [
  { 
    name: "name", 
    label: "Name",
    options: {
      customBodyRender: (value) => (
        <Typography sx={{ color: '#000000ff', fontWeight: '500', fontSize: '14px' }}>
          {value}
        </Typography>
      )
    }
  },
  { 
    name: "email", 
    label: "Email",
    options: {
      customBodyRender: (value) => (
        <Typography sx={{ color: '#000000ff', fontSize: '14px' }}>
          {value}
        </Typography>
      )
    }
  },
  { 
    name: "phone", 
    label: "Phone",
    options: {
      customBodyRender: (value) => (
        <Typography sx={{ color: '#000000ff', fontSize: '14px' }}>
          {value}
        </Typography>
      )
    }
  },
  { 
    name: "address.city", 
    label: "City", 
    options: { 
      customBodyRenderLite: (dataIndex) => (
        <Chip 
          label={displayedSuppliers[dataIndex].address?.city || '—'} 
          size="small"
          sx={{ 
            background: 'rgba(212,175,55,0.2)',
            color: '#d4af37',
            border: '1px solid rgba(212,175,55,0.3)',
            fontSize: '12px',
            fontWeight: 'bold'
          }} 
        />
      ) 
    } 
  },
  { 
    name: "isActive", 
    label: "Status", 
    options: { 
      customBodyRenderLite: (dataIndex) => (
        <Chip 
          label={displayedSuppliers[dataIndex].isActive ? 'Active' : 'Inactive'} 
          size="small"
          sx={{ 
            background: displayedSuppliers[dataIndex].isActive 
              ? 'linear-gradient(135deg, #4CAF50, #45a049)'
              : 'linear-gradient(135deg, #F44336, #d32f2f)',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: '12px'
          }} 
        />
      ) 
    } 
  },
  ...(showDeleted ? [] : [{
    name: "_id",
    label: "Actions",
    options: {
      filter: false,
      sort: false,
      customBodyRenderLite: (dataIndex) => {
        const supplier = displayedSuppliers[dataIndex];
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
            onClick={() => handleView(supplier._id)}
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
    rowsSelected: displayedSuppliers.map((p, i) => selectedIds.includes(p._id) ? i : null).filter(i => i !== null),
    onRowSelectionChange: (currentRowsSelected, allRowsSelected, rowsSelectedIndexes) => {
      const ids = rowsSelectedIndexes.map(i => displayedSuppliers[i]._id);
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
      body: { noMatch: "No suppliers found", toolTip: "Sort" },
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
        background: "linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 50%, #2d2d2d 100%)"
      }}>
        <AdminHeader admin={user} handleLogout={handleLogout} />
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '80vh', 
          flex: 1 
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
      overflow: "hidden"
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
        padding: "20px 30px",
        position: "relative",
        zIndex: 1
      }}>
        <Box sx={{ 
          maxWidth: 1200, 
          margin: '24px auto',
          background: "linear-gradient(135deg, rgba(30,30,30,0.95) 0%, rgba(40,40,40,0.95) 100%)",
          backdropFilter: "blur(15px)",
          padding: "30px",
          borderRadius: "18px",
          boxShadow: "0 12px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(212,175,55,0.2)",
          border: "1px solid rgba(212,175,55,0.3)",
          position: "relative",
          overflow: "hidden"
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
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
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
              {showDeleted ? 'Deleted Suppliers (Trash)' : 'Supplier Management'}
            </Typography>
          </Box>

          {/* Filter Section */}
          <Stack direction="row" spacing={2} mb={3}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel sx={{ color: '#d4af37' }}>City</InputLabel>
              <Select
                value={cityFilter}
                label="City"
                onChange={e => setCityFilter(e.target.value)}
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
                {cities.map(city => (
                  <MenuItem key={city} value={city} sx={{ color: '#fff', background: '#2d2d2d' }}>{city}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>

          {/* Action Buttons */}
          <Stack direction="row" spacing={2} mb={3} flexWrap="wrap" gap={1}>
            {!showDeleted && (
              <Button
                variant="contained"
                onClick={() => navigate("/admin/suppliers/new")}
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
                ➕ Create Supplier
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
                  onClick={handlePermanentDelete}
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
                onClick={handleBulkSoftDelete}
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

          {/* Data Table */}
          <MUIDataTable
            data={displayedSuppliers}
            columns={columns}
            options={options}
          />

          {/* Export Button */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: 2 }}>
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
      </main>

      <AdminFooter />
    </div>
  );
}