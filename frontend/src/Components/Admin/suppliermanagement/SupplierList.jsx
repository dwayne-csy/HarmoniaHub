// HarmoniaHub/frontend/src/Components/admin/suppliermanagement/SupplierList.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import MUIDataTable from "mui-datatables";
import { Button, MenuItem, FormControl, Select, InputLabel, Stack, Box } from '@mui/material';
import Loader from '../../layouts/Loader';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const BASE_URL = 'http://localhost:4001/api/v1';

export default function SupplierList() {
  const [suppliers, setSuppliers] = useState([]);
  const [deletedSuppliers, setDeletedSuppliers] = useState([]);
  const [displayedSuppliers, setDisplayedSuppliers] = useState([]);
  const [showDeleted, setShowDeleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedRows, setSelectedRows] = useState([]);
  const [cityFilter, setCityFilter] = useState('');
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchActiveSuppliers();
    if (token) fetchDeletedSuppliers();
  }, [token]);

  useEffect(() => {
    applyFilters();
  }, [suppliers, deletedSuppliers, showDeleted, cityFilter]);

  const fetchActiveSuppliers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/suppliers`);
      setSuppliers(res.data.suppliers || []);
    } catch (err) {
      console.error(err);
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

  const handleBulkDelete = async () => {
    if (selectedRows.length === 0) return alert('No suppliers selected.');
    if (!window.confirm(`Soft delete ${selectedRows.length} selected suppliers?`)) return;

    try {
      await Promise.all(selectedRows.map(i => {
        const id = displayedSuppliers[i]._id;
        return axios.delete(`${BASE_URL}/admin/suppliers/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      }));
      fetchActiveSuppliers();
      fetchDeletedSuppliers();
      setSelectedRows([]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRestore = async () => {
    if (selectedRows.length === 0) return alert('No suppliers selected.');
    if (!window.confirm(`Restore ${selectedRows.length} selected suppliers?`)) return;

    try {
      await Promise.all(selectedRows.map(i => {
        const id = displayedSuppliers[i]._id;
        return axios.patch(`${BASE_URL}/admin/suppliers/restore/${id}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      }));
      fetchActiveSuppliers();
      fetchDeletedSuppliers();
      setSelectedRows([]);
    } catch (err) {
      console.error(err);
    }
  };

  // Export PDF
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
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
    { name: "name", label: "Name" },
    { name: "email", label: "Email" },
    { name: "phone", label: "Phone" },
    { name: "address.city", label: "City", options: { customBodyRenderLite: (dataIndex) => displayedSuppliers[dataIndex].address?.city || '—' } },
    { name: "isActive", label: "Status", options: { customBodyRenderLite: (dataIndex) => displayedSuppliers[dataIndex].isActive ? 'Active' : 'Deleted' } },
    {
      name: "_id",
      label: "Actions",
      options: {
        filter: false,
        sort: false,
        display: !showDeleted,
        customBodyRenderLite: (dataIndex) => {
          const supplier = displayedSuppliers[dataIndex];
          return showDeleted ? (
            <Button variant="contained" color="success" onClick={handleRestore}>♻️ Restore</Button>
          ) : (
            <>
              <Button onClick={() => navigate(`/admin/suppliers/view/${supplier._id}`)}>View</Button>
              <Button onClick={() => navigate(`/admin/suppliers/edit/${supplier._id}`)}>Edit</Button>
            </>
          );
        }
      }
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
    customToolbarSelect: () => <></>,
    selectableRowsHeader: true
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <Loader />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: '24px auto', padding: 16 }}>
      <h2>{showDeleted ? 'Deleted Suppliers (Trash)' : 'Active Suppliers'}</h2>

      {/* Filter */}
      <Stack direction="row" spacing={2} mb={2} alignItems="center">
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>City</InputLabel>
          <Select
            value={cityFilter}
            label="City"
            onChange={e => setCityFilter(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            {cities.map(city => (
              <MenuItem key={city} value={city}>{city}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {!showDeleted && <Button variant="contained" onClick={() => navigate('/admin/suppliers/new')}>➕ Create Supplier</Button>}
        <Button variant="contained" color="primary" onClick={() => setShowDeleted(!showDeleted)}>
          {showDeleted ? 'Show Active' : 'Trash'}
        </Button>
        {showDeleted ? (
          <Button variant="contained" color="success" onClick={handleRestore}>Restore Selected</Button>
        ) : (
          <Button variant="contained" color="error" onClick={handleBulkDelete}>Delete Selected</Button>
        )}
      </div>

      <MUIDataTable
        data={displayedSuppliers}
        columns={columns}
        options={options}
      />

      {/* PDF Export Button below table */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: 2 }}>
        <Button variant="contained" color="secondary" onClick={exportPDF}>
          CSV
        </Button>
      </Box>
    </div>
  );
}
