// HarmoniaHub/frontend/src/Components/admin/ordermanagement/UpdateOrder.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Typography,
  Select,
  MenuItem,
  Button,
  CircularProgress,
  Alert,
} from "@mui/material";

const UpdateOrder = () => {
  const { id } = useParams(); // order ID from URL
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");

  // Fetch order details
  const fetchOrder = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`http://localhost:4001/api/v1/admin/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrder(data.order);
      setStatus(data.order.orderStatus);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to fetch order");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleUpdate = async () => {
    if (!status) return;
    try {
      setUpdating(true);
      await axios.put(
        `http://localhost:4001/api/v1/admin/orders/${id}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate("/admin/orders"); // redirect back to orders list
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to update order");
    } finally {
      setUpdating(false);
    }
  };

  if (loading)
    return (
      <Box display="flex" justifyContent="center" mt={5}>
        <CircularProgress />
      </Box>
    );

  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box p={3}>
      <Typography variant="h4" mb={3}>Update Order</Typography>

      <Typography variant="h6">Order ID: {order._id}</Typography>
      <Typography>User ID: {order.user}</Typography>
      <Typography>Current Status: {order.orderStatus}</Typography>
      <Typography>Total Price: ${order.totalPrice.toFixed(2)}</Typography>

      <Box mt={2} display="flex" gap={2} alignItems="center">
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          size="small"
        >
          <MenuItem value="Processing">Processing</MenuItem>
          <MenuItem value="Accepted">Accepted</MenuItem>
          <MenuItem value="Cancelled">Cancelled</MenuItem>
          <MenuItem value="Out For Delivery">Out For Delivery</MenuItem>
          <MenuItem value="Delivered">Delivered</MenuItem>
        </Select>
        <Button
          variant="contained"
          color="primary"
          onClick={handleUpdate}
          disabled={updating}
        >
          {updating ? "Updating..." : "Update Status"}
        </Button>
      </Box>
    </Box>
  );
};

export default UpdateOrder;
