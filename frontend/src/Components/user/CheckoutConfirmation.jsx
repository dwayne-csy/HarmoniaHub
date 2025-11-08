import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  Box, 
  Button, 
  Typography, 
  Card, 
  CardContent, 
  CardMedia, 
  Stack, 
  CircularProgress 
} from "@mui/material";

const CheckoutConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const cart = location.state?.cart;

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const TAX_RATE = 0.1; // 10%
  const SHIPPING_PRICE = 50; // flat shipping fee

  // Fetch user info
  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const { data } = await axios.get("http://localhost:4001/api/v1/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(data.user);
      } catch (error) {
        console.error("Failed to fetch user info:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token, navigate]);

  if (loading)
    return (
      <Box display="flex" justifyContent="center" mt={5}>
        <CircularProgress />
      </Box>
    );

  if (!cart || !cart.items.length) {
    return <Typography variant="h6" align="center" mt={5}>No items to checkout.</Typography>;
  }

  // Calculate totals
  const itemsPrice = cart.items.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );
  const taxPrice = itemsPrice * TAX_RATE;
  const totalPrice = itemsPrice + taxPrice + SHIPPING_PRICE;

 const handleConfirmCheckout = async () => {
  try {
    const res = await axios.post("http://localhost:4001/api/v1/checkout", {
      cart: cart,
      token: token,
    });

    if (res.data.success) {
      console.log("Checkout successful");
      // navigate or show success
    } else {
      console.log("Checkout failed:", res.data.message);
    }
  } catch (error) {
    console.error("Checkout failed:", error.response?.data || error.message);
  }
};


  return (
    <Box p={3}>
      <Typography variant="h4" mb={3}>Confirm Your Order</Typography>

      {/* User Info */}
      {user ? (
        <Box mb={3} p={2} border="1px solid #ccc" borderRadius={2}>
          <Typography variant="h6">Customer Information</Typography>
          <Typography>Name: {user.name}</Typography>
          {user.address ? (
            <>
              <Typography>Address: {user.address.address}</Typography>
              <Typography>City: {user.address.city}</Typography>
              <Typography>Postal Code: {user.address.postalCode}</Typography>
              <Typography>Country: {user.address.country}</Typography>
              <Typography>Phone: {user.address.phoneNo}</Typography>
            </>
          ) : (
            <Typography color="error">
              No address found. Please update your profile with a shipping address.
            </Typography>
          )}
        </Box>
      ) : null}

      {/* Cart Items */}
      <Stack spacing={2}>
        {cart.items.map(item => (
          <Card key={item.product._id} sx={{ display: "flex", p: 1 }}>
            <CardMedia
              component="img"
              sx={{ width: 120, height: 120, objectFit: "cover" }}
              image={item.product.images?.[0]?.url || ""}
              alt={item.product.name}
            />
            <CardContent sx={{ flex: 1 }}>
              <Typography variant="h6">{item.product.name}</Typography>
              <Typography>Quantity: {item.quantity}</Typography>
              <Typography>Price: ${item.product.price}</Typography>
              <Typography>Subtotal: ${item.product.price * item.quantity}</Typography>
            </CardContent>
          </Card>
        ))}
      </Stack>

      {/* Order Summary */}
      <Box mt={3} p={2} border="1px solid #ccc" borderRadius={2}>
        <Typography variant="h6">Order Summary</Typography>
        <Typography>Items Price: ${itemsPrice.toFixed(2)}</Typography>
        <Typography>Tax: ${taxPrice.toFixed(2)}</Typography>
        <Typography>Shipping: ${SHIPPING_PRICE.toFixed(2)}</Typography>
        <Typography variant="h5" mt={1}>Total: ${totalPrice.toFixed(2)}</Typography>
      </Box>

      <Box mt={3} display="flex" justifyContent="flex-end">
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleConfirmCheckout}
          disabled={!user?.address}
        >
          Confirm Checkout
        </Button>
      </Box>
    </Box>
  );
};

export default CheckoutConfirmation;
