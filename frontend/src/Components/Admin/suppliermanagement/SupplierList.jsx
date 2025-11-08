// HarmoniaHub/frontend/src/Components/admin/suppliermanagement/SupplierList.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import MUIDataTable from "mui-datatables";
import { Button } from '@mui/material';
import Loader from '../../layouts/Loader';

const BASE_URL = 'http://localhost:4001/api/v1';

export default function SupplierList() {
  const [suppliers, setSuppliers] = useState([]);
  const [deletedSuppliers, setDeletedSuppliers] = useState([]);
  const [showDeleted, setShowDeleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedRows, setSelectedRows] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const displayedSuppliers = showDeleted ? deletedSuppliers : suppliers;

  useEffect(() => {
    fetchActiveSuppliers();
    if (token) fetchDeletedSuppliers();
  }, [token]);

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
        display: showDeleted ? 'excluded' : 'true',
        customBodyRenderLite: (dataIndex) => {
          const supplier = displayedSuppliers[dataIndex];
          return showDeleted ? (
            <Button variant="contained" color="success" onClick={() => handleRestore([dataIndex])}>♻️ Restore</Button>
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
    elevation: 0
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '80vh',
      }}>
        <Loader />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: '24px auto', padding: 16 }}>
      <h2>{showDeleted ? 'Deleted Suppliers (Trash)' : 'Active Suppliers'}</h2>
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
    </div>
  );
}
