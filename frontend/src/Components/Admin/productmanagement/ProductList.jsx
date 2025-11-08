// HarmoniaHub/frontend/src/Components/admin/productmanagement/ProductList.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import MUIDataTable from "mui-datatables";
import { Button } from '@mui/material';
import Loader from '../../layouts/Loader';

const BASE_URL = 'http://localhost:4001/api/v1';

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [deletedProducts, setDeletedProducts] = useState([]);
  const [showDeleted, setShowDeleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentImageIndexes, setCurrentImageIndexes] = useState({});
  const [selectedRows, setSelectedRows] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const displayedProducts = showDeleted ? deletedProducts : products;

  useEffect(() => {
    fetchActiveProducts();
    if (token) fetchDeletedProducts();
  }, [token]);

  const fetchActiveProducts = async () => {
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
    } finally {
      setLoading(false);
    }
  };

  const fetchDeletedProducts = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/admin/products/trash`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setDeletedProducts(res.data.products || []);
      const initialIndexes = {};
      res.data.products?.forEach(p => {
        if (p.images?.length > 0) initialIndexes[p._id] = 0;
      });
      setCurrentImageIndexes(prev => ({ ...prev, ...initialIndexes }));
    } catch (err) {
      console.error(err);
    }
  };

  const nextImage = (id, total) => {
    setCurrentImageIndexes(prev => ({
      ...prev,
      [id]: (prev[id] + 1) % total
    }));
  };

  const prevImage = (id, total) => {
    setCurrentImageIndexes(prev => ({
      ...prev,
      [id]: (prev[id] - 1 + total) % total
    }));
  };

  const handleBulkDelete = async () => {
    if (selectedRows.length === 0) return alert('No products selected.');
    if (!window.confirm(`Soft delete ${selectedRows.length} selected products?`)) return;

    try {
      await Promise.all(selectedRows.map(i => {
        const id = displayedProducts[i]._id;
        return axios.delete(`${BASE_URL}/admin/products/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      }));
      fetchActiveProducts();
      fetchDeletedProducts();
      setSelectedRows([]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRestore = async () => {
    if (selectedRows.length === 0) return alert('No products selected.');
    if (!window.confirm(`Restore ${selectedRows.length} selected products?`)) return;

    try {
      await Promise.all(selectedRows.map(i => {
        const id = displayedProducts[i]._id;
        return axios.patch(`${BASE_URL}/admin/products/restore/${id}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      }));
      fetchActiveProducts();
      fetchDeletedProducts();
      setSelectedRows([]);
    } catch (err) {
      console.error(err);
    }
  };

  const columns = [
    {
      name: "images",
      label: "Image",
      options: {
        filter: false,
        sort: false,
        customBodyRenderLite: (dataIndex) => {
          const product = displayedProducts[dataIndex];
          const total = product.images?.length || 0;
          const currentIndex = currentImageIndexes[product._id] || 0;
          if (total === 0) return '—';
          return (
            <div style={{ position: 'relative', width: 60, height: 60 }}>
              <img
                src={product.images[currentIndex].url}
                alt={product.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 4 }}
              />
              {total > 1 && (
                <>
                  <button
                    onClick={() => prevImage(product._id, total)}
                    style={{
                      position: 'absolute', left: 2, top: '50%',
                      transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)',
                      color: '#fff', border: 'none', borderRadius: '50%', width: 20, height: 20
                    }}>‹</button>
                  <button
                    onClick={() => nextImage(product._id, total)}
                    style={{
                      position: 'absolute', right: 2, top: '50%',
                      transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)',
                      color: '#fff', border: 'none', borderRadius: '50%', width: 20, height: 20
                    }}>›</button>
                  <div style={{
                    position: 'absolute', bottom: 2, right: 2,
                    background: 'rgba(0,0,0,0.6)', color: '#fff',
                    fontSize: 10, padding: '1px 4px', borderRadius: 8
                  }}>
                    {currentIndex + 1}/{total}
                  </div>
                </>
              )}
            </div>
          );
        }
      }
    },
    { name: "name", label: "Name" },
    { name: "price", label: "Price" },
    { name: "category", label: "Category" },
    { name: "stock", label: "Stock" },
    {
      name: "supplier",
      label: "Supplier",
      options: {
        customBodyRenderLite: (dataIndex) => displayedProducts[dataIndex].supplier?.name || '—'
      }
    },
    {
      name: "_id",
      label: "Actions",
      options: {
        filter: false,
        sort: false,
        display: showDeleted ? 'excluded' : 'true',
        customBodyRenderLite: (dataIndex) => {
          const product = displayedProducts[dataIndex];
          return (
            <>
              <Button onClick={() => navigate(`/admin/products/view/${product._id}`)}>View</Button>
              <Button onClick={() => navigate(`/admin/products/edit/${product._id}`)}>Edit</Button>
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
      height: '80vh', // or '100vh' if you want full viewport
    }}>
      <Loader />
    </div>
  );
}


  return (
    <div style={{ maxWidth: 1200, margin: '24px auto', padding: 16 }}>
      <h2>{showDeleted ? 'Deleted Products (Trash)' : 'Active Products'}</h2>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {!showDeleted && <Button variant="contained" onClick={() => navigate('/admin/products/new')}>➕ Create Product</Button>}
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
        data={displayedProducts}
        columns={columns}
        options={options}
      />
    </div>
  );
}
