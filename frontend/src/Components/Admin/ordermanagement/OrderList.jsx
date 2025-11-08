// HarmoniaHub/frontend/src/Components/admin/ordermanagement/OrderList.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import MUIDataTable from "mui-datatables";
import { Button, Stack, FormControl, InputLabel, Select, MenuItem, Box } from "@mui/material";
import Loader from "../../layouts/Loader";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const BASE_URL = "http://localhost:4001/api/v1";

export default function OrderList() {
  const [orders, setOrders] = useState([]);
  const [displayedOrders, setDisplayedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRows, setSelectedRows] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [orders, statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/admin/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data.orders || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...orders];
    if (statusFilter) filtered = filtered.filter(o => o.orderStatus === statusFilter);
    setDisplayedOrders(filtered);
  };

  const handleBulkDelete = async () => {
    if (selectedRows.length === 0) return alert("No orders selected.");
    if (!window.confirm(`Delete ${selectedRows.length} selected orders?`)) return;

    try {
      await Promise.all(
        selectedRows.map(i => {
          const id = displayedOrders[i]._id;
          return axios.delete(`${BASE_URL}/admin/orders/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
        })
      );
      fetchOrders();
      setSelectedRows([]);
    } catch (err) {
      console.error(err);
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("HarmoniaHub", 14, 15);
    doc.setFontSize(12);
    doc.text("Order List", 14, 25);

    const tableColumn = ["Order ID", "User", "Status", "Total Price", "Created At"];
    const tableRows = [];

    displayedOrders.forEach(order => {
      tableRows.push([
        order._id,
        order.user?.name || order.user || "N/A",
        order.orderStatus,
        `$${order.totalPrice?.toFixed(2) || "0.00"}`,
        new Date(order.createdAt).toLocaleString(),
      ]);
    });

    autoTable(doc, { head: [tableColumn], body: tableRows, startY: 30 });
    doc.save("OrderList.pdf");
  };

  const statuses = [...new Set(orders.map(o => o.orderStatus))];

  const columns = [
    { name: "_id", label: "Order ID" },
    { name: "user", label: "User", options: { customBodyRenderLite: dataIndex => displayedOrders[dataIndex].user?.name || "N/A" } },
    { name: "orderStatus", label: "Status" },
    { name: "totalPrice", label: "Total Price", options: { customBodyRenderLite: dataIndex => `$${displayedOrders[dataIndex].totalPrice?.toFixed(2) || "0.00"}` } },
    { name: "createdAt", label: "Created At", options: { customBodyRenderLite: dataIndex => new Date(displayedOrders[dataIndex].createdAt).toLocaleString() } },
    {
      name: "_id",
      label: "Actions",
      options: {
        filter: false,
        sort: false,
        customBodyRenderLite: dataIndex => {
          const order = displayedOrders[dataIndex];
          return (
            <Stack direction="row" spacing={1}>
              <Button onClick={() => navigate(`/admin/orders/view/${order._id}`)}>View</Button>
              <Button onClick={() => navigate(`/admin/orders/edit/${order._id}`)}>Edit</Button>
            </Stack>
          );
        },
      },
    },
  ];

  const options = {
    selectableRows: "multiple",
    selectableRowsOnClick: true,
    onRowSelectionChange: (currentRowsSelected, allRowsSelected, rowsSelected) => setSelectedRows(rowsSelected),
    download: false,
    print: false,
    viewColumns: false,
    filter: false,
    search: true,
    rowsPerPage: 10,
    rowsPerPageOptions: [5, 10, 25, 50],
    elevation: 0,
  };

  if (loading) return <Loader />;

  return (
    <div style={{ maxWidth: 1200, margin: "24px auto", padding: 16 }}>
      <h2>Order Management</h2>

      <Stack direction="row" spacing={2} mb={2} alignItems="center">
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select value={statusFilter} label="Status" onChange={e => setStatusFilter(e.target.value)}>
            <MenuItem value="">All</MenuItem>
            {statuses.map(status => (
              <MenuItem key={status} value={status}>
                {status}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button variant="contained" color="error" onClick={handleBulkDelete}>
          Delete Selected
        </Button>
        <Button variant="contained" color="secondary" onClick={exportPDF}>
          Export PDF
        </Button>
      </Stack>

      <MUIDataTable data={displayedOrders} columns={columns} options={options} />
    </div>
  );
}
