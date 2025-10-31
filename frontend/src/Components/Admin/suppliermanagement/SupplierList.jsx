// HarmoniaHub/frontend/src/Components/admin/suppliermanagement/SupplierList.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Loader from '../../layouts/Loader'; 

const BASE_URL = 'http://localhost:4001/api/v1';

export default function SupplierList() {
  const [suppliers, setSuppliers] = useState([]);
  const [deletedSuppliers, setDeletedSuppliers] = useState([]);
  const [showDeleted, setShowDeleted] = useState(false);
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showInitialLoader, setShowInitialLoader] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    // show initial loader for 1s
    const timer = setTimeout(() => setShowInitialLoader(false), 1000);
    fetchActiveSuppliers();
    if (token) fetchDeletedSuppliers();

    return () => clearTimeout(timer);
  }, [token]);

  // Fetch active suppliers
  async function fetchActiveSuppliers() {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/suppliers`);
      setSuppliers(res.data.suppliers || []);
    } catch (err) {
      console.error(err);
      setMsg({ type: 'error', text: 'Failed to load suppliers.' });
    } finally {
      setLoading(false);
    }
  }

  // Fetch deleted suppliers
  async function fetchDeletedSuppliers() {
    try {
      const res = await axios.get(`${BASE_URL}/admin/suppliers/trash`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setDeletedSuppliers(res.data.suppliers || []);
    } catch (err) {
      console.error('Failed to load deleted suppliers:', err);
    }
  }

  // Soft delete
  async function handleDelete(id) {
    if (!window.confirm('Soft delete this supplier?')) return;
    try {
      await axios.delete(`${BASE_URL}/admin/suppliers/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setMsg({ type: 'success', text: 'Supplier moved to trash.' });
      fetchActiveSuppliers();
      fetchDeletedSuppliers();
    } catch (err) {
      setMsg({ type: 'error', text: err?.response?.data?.message || err.message });
    }
  }

  // Restore
  async function handleRestore(id) {
    if (!window.confirm('Restore this supplier?')) return;
    try {
      await axios.patch(`${BASE_URL}/admin/suppliers/restore/${id}`, {}, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setMsg({ type: 'success', text: 'Supplier restored successfully.' });
      fetchActiveSuppliers();
      fetchDeletedSuppliers();
    } catch (err) {
      setMsg({ type: 'error', text: 'Failed to restore user.' });
    }
  }

  const displayedSuppliers = showDeleted ? deletedSuppliers : suppliers;

  // Show initial loader before page
  if (showInitialLoader) {
    return (
      <div className="loader-container">
        <Loader />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: '24px auto', padding: 16 }}>
      <h2>{showDeleted ? 'Deleted Suppliers (Trash)' : 'Active Suppliers'}</h2>

      <div style={{ marginBottom: 12 }}>
        {!showDeleted && (
          <button onClick={() => navigate('/admin/suppliers/new')}>
            ➕ Create Supplier
          </button>
        )}
        {token && (
          <button
            onClick={() => setShowDeleted(!showDeleted)}
            style={{ marginLeft: 8 }}
          >
            {showDeleted ? 'Show Active' : '🗑️ View Trash'}
          </button>
        )}
      </div>

      {msg && (
        <div style={{ color: msg.type === 'error' ? '#a00' : '#0a0', marginBottom: 8 }}>
          {msg.text}
        </div>
      )}

      {loading ? (
        <div className="loader-container">
          <Loader />
        </div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #ddd', textAlign: 'left' }}>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>City</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayedSuppliers.map((s) => (
              <tr key={s._id} style={{ borderBottom: '1px solid #f2f2f2' }}>
                <td>{s.name}</td>
                <td>{s.email}</td>
                <td>{s.phone}</td>
                <td>{s.address?.city || '—'}</td>
                <td>{s.isActive ? 'Active' : 'Deleted'}</td>
                <td>
                  {showDeleted ? (
                    <button onClick={() => handleRestore(s._id)}>♻️ Restore</button>
                  ) : (
                    <>
                      <button
                        onClick={() => navigate(`/admin/suppliers/edit/${s._id}`)}
                        style={{ marginLeft: 6 }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(s._id)}
                        style={{ marginLeft: 6 }}
                      >
                        🗑️ Soft Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {displayedSuppliers.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', color: '#666' }}>
                  {showDeleted ? 'No deleted suppliers.' : 'No active suppliers.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
