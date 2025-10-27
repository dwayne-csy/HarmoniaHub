// HarmoniaHub/frontend/src/Components/admin/suppliermanagement/UpdateSupplier.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const BASE_URL = 'http://localhost:4001/api/v1';

export default function UpdateSupplier() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [supplier, setSupplier] = useState({
    name: '',
    email: '',
    phone: '',
    address: { city: '', street: '' },
  });
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);

  // ✅ Fetch the supplier to edit (use admin route)
  useEffect(() => {
    async function fetchSupplier() {
      try {
        const res = await axios.get(`${BASE_URL}/admin/suppliers/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (res.data.supplier) {
          // Ensure address object exists
          const fetchedSupplier = {
            ...res.data.supplier,
            address: res.data.supplier.address || { city: '', street: '' },
          };
          setSupplier(fetchedSupplier);
        } else {
          setMsg({ type: 'error', text: 'Supplier not found.' });
        }
      } catch (err) {
        console.error(err);
        setMsg({ type: 'error', text: 'Failed to load supplier data.' });
      } finally {
        setLoading(false);
      }
    }
    fetchSupplier();
  }, [id, token]);

  // ✅ Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith('address.')) {
      const field = name.split('.')[1];
      setSupplier((prev) => ({
        ...prev,
        address: { ...prev.address, [field]: value },
      }));
    } else {
      setSupplier((prev) => ({ ...prev, [name]: value }));
    }
  };

  // ✅ Update supplier data
  async function handleUpdate(e) {
    e.preventDefault();
    try {
      await axios.put(`${BASE_URL}/admin/suppliers/${id}`, supplier, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setMsg({ type: 'success', text: 'Supplier updated successfully.' });
      setTimeout(() => navigate('/admin/suppliers'), 1000);
    } catch (err) {
      console.error(err);
      setMsg({
        type: 'error',
        text: err?.response?.data?.message || 'Failed to update supplier.',
      });
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', marginTop: '40px' }}>
        <p>Loading supplier details...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 600, margin: '24px auto', padding: 16 }}>
      <h2>Update Supplier</h2>

      {msg && (
        <div
          style={{
            color: msg.type === 'error' ? '#a00' : '#0a0',
            marginBottom: 8,
          }}
        >
          {msg.text}
        </div>
      )}

      <form onSubmit={handleUpdate}>
        <div style={{ marginBottom: 10 }}>
          <label>Name:</label>
          <input
            type="text"
            name="name"
            value={supplier.name || ''}
            onChange={handleChange}
            required
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={supplier.email || ''}
            onChange={handleChange}
            required
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Phone:</label>
          <input
            type="text"
            name="phone"
            value={supplier.phone || ''}
            onChange={handleChange}
            required
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>City:</label>
          <input
            type="text"
            name="address.city"
            value={supplier.address?.city || ''}
            onChange={handleChange}
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Street:</label>
          <input
            type="text"
            name="address.street"
            value={supplier.address?.street || ''}
            onChange={handleChange}
          />
        </div>

        <button type="submit" style={{ marginRight: 8 }}>
          Update
        </button>
        <button type="button" onClick={() => navigate('/admin/suppliers')}>
          Cancel
        </button>
      </form>
    </div>
  );
}
