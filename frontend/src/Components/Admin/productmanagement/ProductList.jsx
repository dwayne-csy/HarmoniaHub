// HarmoniaHub/frontend/src/Components/admin/productmanagement/ProductList.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import MUIDataTable from "mui-datatables";
import { 
  Button, 
  Box, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Stack, 
  Typography,
  IconButton
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import Loader from '../../layouts/Loader';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import AdminHeader from "../../layouts/admin/AdminHeader";
import AdminFooter from "../../layouts/admin/AdminFooter";

const BASE_URL = 'http://localhost:4001/api/v1';

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [deletedProducts, setDeletedProducts] = useState([]);
  const [showDeleted, setShowDeleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentImageIndexes, setCurrentImageIndexes] = useState({});
  const [selectedIds, setSelectedIds] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [supplierFilter, setSupplierFilter] = useState('');
  const [suppliers, setSuppliers] = useState([]);

  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  const categoryOptions = [
    'Idiophones', 'Membranophones', 'Chordophones', 'Aerophones', 'Electrophones', 'Keyboard Instruments'
  ];

  const displayedProducts = (showDeleted ? deletedProducts : products).filter(p => {
    return (categoryFilter ? p.category === categoryFilter : true) &&
           (supplierFilter ? p.supplier?.name === supplierFilter : true);
  });

  useEffect(() => {
    fetchActiveProducts();
    if (token) fetchDeletedProducts();
    fetchSuppliers();
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

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

  const fetchSuppliers = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/suppliers/dropdown`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setSuppliers(res.data.suppliers?.map(s => s.name) || []);
    } catch (err) {
      console.error('Failed to fetch suppliers:', err);
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
    if (selectedIds.length === 0) return alert('No products selected.');
    if (!window.confirm(`Soft delete ${selectedIds.length} selected products?`)) return;
    try {
      await Promise.all(selectedIds.map(id =>
        axios.delete(`${BASE_URL}/admin/products/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      ));
      fetchActiveProducts();
      fetchDeletedProducts();
      setSelectedIds([]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRestore = async () => {
    if (selectedIds.length === 0) return alert('No products selected.');
    if (!window.confirm(`Restore ${selectedIds.length} selected products?`)) return;
    try {
      await Promise.all(selectedIds.map(id =>
        axios.patch(`${BASE_URL}/admin/products/restore/${id}`, {}, { headers: { Authorization: `Bearer ${token}` } })
      ));
      fetchActiveProducts();
      fetchDeletedProducts();
      setSelectedIds([]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleBulkHardDelete = async () => {
    if (selectedIds.length === 0) return alert('No products selected.');
    if (!window.confirm(`Permanently delete ${selectedIds.length} selected products? This cannot be undone.`)) return;
    try {
      await Promise.all(selectedIds.map(id =>
        axios.delete(`${BASE_URL}/admin/products/delete/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      ));
      fetchDeletedProducts();
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
    doc.text('Product List', 14, 25);

    const tableColumn = ["Name", "Price", "Category", "Stock", "Supplier"];
    const tableRows = [];

    displayedProducts.forEach(product => {
      tableRows.push([
        product.name,
        product.price,
        product.category,
        product.stock,
        product.supplier?.name || '—'
      ]);
    });

    autoTable(doc, { head: [tableColumn], body: tableRows, startY: 30 });
    doc.save('ProductList.pdf');
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
          <div style={{ position: 'relative', width: 60, height: 60, border: '1px solid #D4AF37', borderRadius: 8 }}>
            <img
              src={product.images[currentIndex].url}
              alt={product.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }}
            />
            {total > 1 && (
              <div style={{
                position: 'absolute', bottom: 2, right: 2,
                background: '#D4AF37', color: '#000',
                fontSize: 10, padding: '1px 4px', borderRadius: 8
              }}>
                {currentIndex + 1}/{total}
              </div>
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
  ...(showDeleted ? [] : [{
    name: "_id",
    label: "Actions",
    options: {
      filter: false,
      sort: false,
      customBodyRenderLite: (dataIndex) => {
        const product = displayedProducts[dataIndex];
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
            onClick={() => navigate(`/admin/products/view/${product._id}`)}
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
    rowsSelected: displayedProducts.map((p, i) => selectedIds.includes(p._id) ? i : null).filter(i => i !== null),
    onRowSelectionChange: (currentRowsSelected, allRowsSelected, rowsSelectedIndexes) => {
      const ids = rowsSelectedIndexes.map(i => displayedProducts[i]._id);
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
      body: { noMatch: "No products found", toolTip: "Sort" },
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
              {showDeleted ? 'Deleted Products (Trash)' : 'Product Management'}
            </Typography>
          </Box>

          {/* Filter Section */}
          <Stack direction="row" spacing={2} mb={3}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel sx={{ color: '#d4af37' }}>Category</InputLabel>
              <Select
                value={categoryFilter}
                label="Category"
                onChange={e => setCategoryFilter(e.target.value)}
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
                {categoryOptions.map(c => (
                  <MenuItem key={c} value={c} sx={{ color: '#fff', background: '#2d2d2d' }}>{c}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel sx={{ color: '#d4af37' }}>Supplier</InputLabel>
              <Select
                value={supplierFilter}
                label="Supplier"
                onChange={e => setSupplierFilter(e.target.value)}
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
                {suppliers.map(s => (
                  <MenuItem key={s} value={s} sx={{ color: '#fff', background: '#2d2d2d' }}>{s}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>

          {/* Action Buttons */}
          <Stack direction="row" spacing={2} mb={3} flexWrap="wrap" gap={1}>
            {!showDeleted && (
              <Button
                variant="contained"
                onClick={() => navigate("/admin/products/new")}
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
                ➕ Create Product
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

          {/* Data Table */}
          <MUIDataTable
            data={displayedProducts}
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