// HarmoniaHub/frontend/src/Components/admin/productmanagement/ProductList.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Loader from '../../layouts/Loader';

const BASE_URL = 'http://localhost:4001/api/v1';

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [deletedProducts, setDeletedProducts] = useState([]);
  const [showDeleted, setShowDeleted] = useState(false);
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showInitialLoader, setShowInitialLoader] = useState(true);
  const [currentImageIndexes, setCurrentImageIndexes] = useState({});
  const [selectedProducts, setSelectedProducts] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    const timer = setTimeout(() => setShowInitialLoader(false), 1000);
    fetchActiveProducts();
    if (token) fetchDeletedProducts();
    return () => clearTimeout(timer);
  }, [token]);

  async function fetchActiveProducts() {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/products`);
      setProducts(res.data.products || []);
      const initialIndexes = {};
      res.data.products?.forEach(p => {
        if (p.images?.length > 0) initialIndexes[p._id] = 0;
      });
      setCurrentImageIndexes(initialIndexes);
    } catch (err) {
      console.error(err);
      setMsg({ type: 'error', text: 'Failed to load products.' });
    } finally {
      setLoading(false);
    }
  }

  async function fetchDeletedProducts() {
    try {
      const res = await axios.get(`${BASE_URL}/admin/products/trash`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setDeletedProducts(res.data.products || []);
      const deletedIndexes = {};
      res.data.products?.forEach(p => {
        if (p.images?.length > 0) deletedIndexes[p._id] = 0;
      });
      setCurrentImageIndexes(prev => ({ ...prev, ...deletedIndexes }));
    } catch (err) {
      console.error('Failed to load deleted products:', err);
    }
  }

  const nextImage = (id, total, e) => {
    e.stopPropagation();
    setCurrentImageIndexes(prev => ({
      ...prev,
      [id]: (prev[id] + 1) % total
    }));
  };

  const prevImage = (id, total, e) => {
    e.stopPropagation();
    setCurrentImageIndexes(prev => ({
      ...prev,
      [id]: (prev[id] - 1 + total) % total
    }));
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndexes(prev => {
        const newIndexes = { ...prev };
        [...products, ...deletedProducts].forEach(p => {
          if (p.images && p.images.length > 1) {
            newIndexes[p._id] = (prev[p._id] + 1) % p.images.length;
          }
        });
        return newIndexes;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [products, deletedProducts]);

  const toggleSelect = (id) => {
    setSelectedProducts(prev =>
      prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
    );
  };

  const selectAll = (e) => {
    if (e.target.checked) {
      const ids = displayedProducts.map(p => p._id);
      setSelectedProducts(ids);
    } else {
      setSelectedProducts([]);
    }
  };

  async function handleBulkDelete() {
    if (selectedProducts.length === 0) return alert('No products selected.');
    if (!window.confirm(`Soft delete ${selectedProducts.length} selected products?`)) return;

    try {
      await Promise.all(
        selectedProducts.map(id =>
          axios.delete(`${BASE_URL}/admin/products/${id}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
          })
        )
      );
      setMsg({ type: 'success', text: 'Selected products moved to trash.' });
      setSelectedProducts([]);
      fetchActiveProducts();
      fetchDeletedProducts();
    } catch (err) {
      setMsg({ type: 'error', text: err?.response?.data?.message || err.message });
    }
  }

  async function handleBulkRestore() {
    if (selectedProducts.length === 0) return alert('No products selected.');
    if (!window.confirm(`Restore ${selectedProducts.length} selected products?`)) return;

    try {
      await Promise.all(
        selectedProducts.map(id =>
          axios.patch(`${BASE_URL}/admin/products/restore/${id}`, {}, {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
          })
        )
      );
      setMsg({ type: 'success', text: 'Selected products restored successfully.' });
      setSelectedProducts([]);
      fetchActiveProducts();
      fetchDeletedProducts();
    } catch (err) {
      setMsg({ type: 'error', text: err?.response?.data?.message || err.message });
    }
  }

  const displayedProducts = showDeleted ? deletedProducts : products;

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
          <button
            onClick={() => { setShowDeleted(!showDeleted); setSelectedProducts([]); }}
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
            <tr style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>
              <th>Image</th>
              <th>Name</th>
              <th>Price</th>
              <th>Category</th>
              <th>Stock</th>
              <th>Supplier</th>
              <th>Actions</th>
              <th style={{ textAlign: 'center', minWidth: '150px' }}>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="checkbox"
                      onChange={selectAll}
                      checked={
                        displayedProducts.length > 0 &&
                        selectedProducts.length === displayedProducts.length
                      }
                      title="Click to select or deselect all products"
                    />
                    <label style={{ fontSize: '14px', color: '#333', fontWeight: '500' }}>
                      Select All Products
                    </label>
                  </div>
                  <small style={{ color: '#666', fontSize: '12px' }}>
                    Check to select all items below
                  </small>

                  {!showDeleted && selectedProducts.length > 0 && (
                    <button
                      onClick={handleBulkDelete}
                      style={{
                        backgroundColor: '#c00',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 4,
                        padding: '4px 8px',
                        marginTop: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      🗑️ Delete ({selectedProducts.length})
                    </button>
                  )}

                  {showDeleted && selectedProducts.length > 0 && (
                    <button
                      onClick={handleBulkRestore}
                      style={{
                        backgroundColor: 'green',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 4,
                        padding: '4px 8px',
                        marginTop: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      ♻️ Restore ({selectedProducts.length})
                    </button>
                  )}
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {displayedProducts.map(p => {
              const currentIndex = currentImageIndexes[p._id] || 0;
              const totalImages = p.images?.length || 0;
              const hasMultipleImages = totalImages > 1;

              return (
                <tr key={p._id} style={{ borderBottom: '1px solid #f2f2f2' }}>
                  <td>
                    {totalImages > 0 ? (
                      <div style={{ position: 'relative', width: 60, height: 60 }}>
                        <img
                          src={p.images[currentIndex].url}
                          alt={p.name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            borderRadius: 4
                          }}
                        />
                        {hasMultipleImages && (
                          <>
                            <button
                              onClick={(e) => prevImage(p._id, totalImages, e)}
                              style={{
                                position: 'absolute',
                                left: 2,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                background: 'rgba(0,0,0,0.5)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '50%',
                                width: 20,
                                height: 20,
                                fontSize: 12,
                                cursor: 'pointer'
                              }}
                            >
                              ‹
                            </button>
                            <button
                              onClick={(e) => nextImage(p._id, totalImages, e)}
                              style={{
                                position: 'absolute',
                                right: 2,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                background: 'rgba(0,0,0,0.5)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '50%',
                                width: 20,
                                height: 20,
                                fontSize: 12,
                                cursor: 'pointer'
                              }}
                            >
                              ›
                            </button>
                            <div
                              style={{
                                position: 'absolute',
                                bottom: 2,
                                right: 2,
                                background: 'rgba(0,0,0,0.6)',
                                color: 'white',
                                fontSize: 10,
                                padding: '1px 4px',
                                borderRadius: 8
                              }}
                            >
                              {currentIndex + 1}/{totalImages}
                            </div>
                          </>
                        )}
                      </div>
                    ) : (
                      '—'
                    )}
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
                        <button
                          onClick={() => navigate(`/admin/products/edit/${p._id}`)}
                          style={{ marginLeft: 6 }}
                        >
                          Edit
                        </button>
                      </>
                    ) : (
                      <button onClick={() => handleBulkRestore([p._id])}>♻️ Restore</button>
                    )}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(p._id)}
                      onChange={() => toggleSelect(p._id)}
                    />
                  </td>
                </tr>
              );
            })}
            {displayedProducts.length === 0 && (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', color: '#666' }}>
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
