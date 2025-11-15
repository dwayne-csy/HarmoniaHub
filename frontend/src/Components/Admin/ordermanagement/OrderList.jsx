// HarmoniaHub/frontend/src/Components/admin/ordermanagement/OrderList.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import MUIDataTable from "mui-datatables";
import { 
  Button, 
  Stack, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Box, 
  Snackbar, 
  Alert,
  Typography,
  IconButton
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { ArrowBack } from "@mui/icons-material";
import Loader from "../../layouts/Loader";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import AdminHeader from "../../layouts/admin/AdminHeader";
import AdminFooter from "../../layouts/admin/AdminFooter";

const BASE_URL = "http://localhost:4001/api/v1";

const statusOptions = ["Processing", "Accepted", "Cancelled", "Out for Delivery", "Delivered"];

export default function OrderList() {
  const [orders, setOrders] = useState([]);
  const [displayedOrders, setDisplayedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [orders, statusFilter]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/admin/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data.orders || []);
    } catch (err) {
      console.error(err);
      showSnackbar("Failed to fetch orders", "error");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...orders];
    if (statusFilter) {
      filtered = filtered.filter((o) => o.orderStatus === statusFilter);
    }
    setDisplayedOrders(filtered);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const response = await axios.put(
        `${BASE_URL}/admin/orders/${orderId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, orderStatus: newStatus } : o))
      );

      setDisplayedOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, orderStatus: newStatus } : o))
      );

      showSnackbar(`Order status updated to ${newStatus}`, "success");
      
    } catch (err) {
      console.error("Failed to update order:", err);
      showSnackbar("Failed to update order status", "error");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return alert('No orders selected.');
    if (!window.confirm(`Permanently delete ${selectedIds.length} selected orders? This cannot be undone.`)) return;

    try {
      await Promise.all(selectedIds.map(id =>
        axios.delete(`${BASE_URL}/admin/orders/${id}`, { 
          headers: { Authorization: `Bearer ${token}` } 
        })
      ));
      
      showSnackbar(`${selectedIds.length} orders deleted successfully`, "success");
      fetchOrders();
      setSelectedIds([]);
    } catch (err) {
      console.error(err);
      showSnackbar("Failed to delete orders", "error");
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.setTextColor(212, 175, 55);
    doc.text("HarmoniaHub", 14, 15);
    doc.setFontSize(12);
    doc.text("Order List", 14, 25);

    const tableColumn = ["Order ID", "User", "Product", "Total Price", "Status"];
    const tableRows = [];

    displayedOrders.forEach((order) => {
      const products = order.orderItems?.map((item) => `${item.quantity}x ${item.name}`).join(", ") || "N/A";
      tableRows.push([
        order._id,
        order.user?.name || "N/A",
        products,
        `₱${order.totalPrice?.toFixed(2) || "0.00"}`,
        order.orderStatus,
      ]);
    });

    autoTable(doc, { head: [tableColumn], body: tableRows, startY: 30 });
    doc.save("OrderList.pdf");
  };

  const columns = [
    { 
      name: "_id", 
      label: "Order ID",
      options: {
        customBodyRenderLite: (dataIndex) => (
          <Typography sx={{ color: '#000000ff', fontWeight: '500' }}>
            {displayedOrders[dataIndex]._id}
          </Typography>
        )
      }
    },
    {
      name: "user",
      label: "User",
      options: {
        customBodyRenderLite: (dataIndex) => (
          <Typography sx={{ color: '#000000ff' }}>
            {displayedOrders[dataIndex].user?.name || "N/A"}
          </Typography>
        ),
      },
    },
    {
      name: "products",
      label: "Product",
      options: {
        filter: false,
        sort: false,
        customBodyRenderLite: (dataIndex) => {
          const order = displayedOrders[dataIndex];
          const products = order.orderItems?.map((item) => `${item.quantity}x ${item.name}`).join(", ");
          return (
            <Typography sx={{ color: '#000000ff' }}>
              {products || "N/A"}
            </Typography>
          );
        },
      },
    },
    {
      name: "totalPrice",
      label: "Total Price",
      options: {
        customBodyRenderLite: (dataIndex) => (
          <Typography sx={{ color: '#000000ff', fontWeight: 'bold' }}>
            ₱{displayedOrders[dataIndex].totalPrice?.toFixed(2) || "0.00"}
          </Typography>
        ),
      },
    },
    {
      name: "orderStatus",
      label: "Status",
      options: {
        filter: false,
        sort: false,
        customBodyRenderLite: (dataIndex) => {
          const order = displayedOrders[dataIndex];
          return (
            <FormControl size="small" fullWidth>
              <Select
                value={order.orderStatus}
                onChange={(e) => handleStatusChange(order._id, e.target.value)}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                onOpen={(e) => e.stopPropagation()}
                sx={{
                  color: "#000000ff",
                  background: getStatusColor(order.orderStatus).background,
                  border: `1px solid ${getStatusColor(order.orderStatus).border}`,
                  borderRadius: "8px",
                  '& .MuiSelect-icon': { color: "#d4af37" }
                }}
              >
                {statusOptions.map((status) => (
                  <MenuItem 
                    key={status} 
                    value={status}
                    sx={{ color: "#000000ff", background: "#2d2d2d" }}
                  >
                    {status}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          );
        },
      },
    },
    {
      name: "actions",
      label: "Action",
      options: {
        filter: false,
        sort: false,
        customBodyRenderLite: (dataIndex) => (
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
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/admin/orders/view/${displayedOrders[dataIndex]._id}`);
            }}
          >
            View
          </Button>
        ),
      },
    },
  ];

  const getStatusColor = (status) => {
    const colors = {
      "Processing": { background: "rgba(255, 152, 0, 0.2)", border: "rgba(255, 152, 0, 0.5)" },
      "Accepted": { background: "rgba(33, 150, 243, 0.2)", border: "rgba(33, 150, 243, 0.5)" },
      "Cancelled": { background: "rgba(244, 67, 54, 0.2)", border: "rgba(244, 67, 54, 0.5)" },
      "Out for Delivery": { background: "rgba(156, 39, 176, 0.2)", border: "rgba(156, 39, 176, 0.5)" },
      "Delivered": { background: "rgba(76, 175, 80, 0.2)", border: "rgba(76, 175, 80, 0.5)" }
    };
    return colors[status] || { background: "rgba(212,175,55,0.1)", border: "rgba(212,175,55,0.3)" };
  };

  const options = {
    selectableRows: "multiple",
    selectableRowsOnClick: true,
    rowsSelected: displayedOrders.map((p, i) => selectedIds.includes(p._id) ? i : null).filter(i => i !== null),
    onRowSelectionChange: (currentRowsSelected, allRowsSelected, rowsSelectedIndexes) => {
      const ids = rowsSelectedIndexes.map(i => displayedOrders[i]._id);
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
    responsive: "standard",
    customToolbarSelect: () => <></>,
    selectableRowsHeader: true,
    textLabels: {
      body: { noMatch: "No orders found", toolTip: "Sort" },
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
        <AdminHeader admin={currentUser} handleLogout={handleLogout} />
        <div style={{ 
          display: "flex", 
          justifyContent: "center", 
          alignItems: "center", 
          height: "80vh",
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

      <AdminHeader admin={currentUser} handleLogout={handleLogout} />
      
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
              Order Management
            </Typography>
          </Box>

          {/* Filter Section */}
          <Stack direction="row" spacing={2} mb={3}>
            <FormControl size="small" sx={{ minWidth: 180 }}>
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
                {statusOptions.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>

          {/* Action Buttons */}
          <Stack direction="row" spacing={2} mb={3} flexWrap="wrap" gap={1}>
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
              Delete Selected ({selectedIds.length})
            </Button>
          </Stack>

          {/* Data Table */}
          <MUIDataTable
            data={displayedOrders}
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

        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </main>

      <AdminFooter />
    </div>
  );
}