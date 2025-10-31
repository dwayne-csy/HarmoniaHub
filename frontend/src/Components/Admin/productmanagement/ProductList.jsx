// HarmoniaHub/frontend/src/Components/admin/productmanagement/ProductList.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Loader from '../../layouts/Loader'; // import loader

const BASE_URL = 'http://localhost:4001/api/v1';

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [deletedProducts, setDeletedProducts] = useState([]);
  const [showDeleted, setShowDeleted] = useState(false);
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showInitialLoader, setShowInitialLoader] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    // Show initial loader for 1s before page
    const timer = setTimeout(() => setShowInitialLoader(false), 1000);
    fetchActiveProducts();
    if (token) fetchDeletedProducts();

    return () => clearTimeout(timer);
  }, [token]);

  // Fetch active products
  async function fetchActiveProducts() {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/products`);
      setProducts(res.data.products || []);
    } catch (err) {
      console.error(err);
      setMsg({ type: 'error', text: 'Failed to load products.' });
    } finally {
      setLoading(false);
    }
  }

  // Fetch deleted products
  async function fetchDeletedProducts() {
    try {
      const res = await axios.get(`${BASE_URL}/admin/products/trash`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setDeletedProducts(res.data.products || []);
    } catch (err) {
      console.error('Failed to load deleted products:', err);
    }
  }

  // Soft delete
  async function handleDelete(id) {
    if (!window.confirm('Soft delete this product?')) return;
    try {
      await axios.delete(`${BASE_URL}/admin/products/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setMsg({ type: 'success', text: 'Product moved to trash.' });
      fetchActiveProducts();
      fetchDeletedProducts();
    } catch (err) {
      setMsg({ type: 'error', text: err?.response?.data?.message || err.message });
    }
  }

  // Restore
  async function handleRestore(id) {
    if (!window.confirm('Restore this product?')) return;
    try {
      await axios.patch(`${BASE_URL}/admin/products/restore/${id}`, {}, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setMsg({ type: 'success', text: 'Product restored successfully.' });
      fetchActiveProducts();
      fetchDeletedProducts();
    } catch (err) {
      setMsg({ type: 'error', text: err?.response?.data?.message || err.message });
    }
  }

  const displayedProducts = showDeleted ? deletedProducts : products;

  // Initial loader before page
  if (showInitialLoader) {
    return (
      <div className="loader-container">
        <Loader />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1000, margin: '24px auto', padding: 16 }}>
      <h2>{showDeleted ? 'Deleted Products (Trash)' : 'Active Products'}</h2>

      <div style={{ marginBottom: 12 }}>
        {!showDeleted && (
          <button onClick={() => navigate('/admin/products/new')} style={{ padding: '6px 12px' }}>
            ➕ Create Product
          </button>
        )}
        {token && (
          <button onClick={() => setShowDeleted(!showDeleted)} style={{ marginLeft: 8 }}>
            {showDeleted ? 'Show Active' : '🗑️ View Trash'}
          </button>
        )}
      </div>

      {msg && <div style={{ color: msg.type === 'error' ? '#a00' : '#0a0', marginBottom: 8 }}>{msg.text}</div>}

      {loading ? (
        <div className="loader-container">
          <Loader />
        </div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>
              <th>Image</th>
              <th>Name</th>
              <th>Price</th>
              <th>Category</th>
              <th>Stock</th>
              <th>Supplier</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayedProducts.map(p => (
              <tr key={p._id} style={{ borderBottom: '1px solid #f2f2f2' }}>
                <td>
                  {p.images && p.images.length > 0 ? (
                    <img
                      src={p.images[0].url}
                      alt={p.name}
                      style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 4 }}
                    />
                  ) : '—'}
                </td>
                <td>{p.name}</td>
                <td>{p.price}</td>
                <td>{p.category}</td>
                <td>{p.stock}</td>
                <td>{p.supplier ? p.supplier.name : '—'}</td>
                <td>
                  {!showDeleted ? (
                    <>
                      <button onClick={() => navigate(`/admin/products/${p._id}`)}>View</button>
                      <button onClick={() => navigate(`/admin/products/edit/${p._id}`)} style={{ marginLeft: 6 }}>Edit</button>
                      <button onClick={() => handleDelete(p._id)} style={{ marginLeft: 6 }}>🗑️ Soft Delete</button>
                    </>
                  ) : (
                    <button onClick={() => handleRestore(p._id)}>♻️ Restore</button>
                  )}
                </td>
              </tr>
            ))}
            {displayedProducts.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', color: '#666' }}>
                  {showDeleted ? 'No deleted products.' : 'No active products.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
