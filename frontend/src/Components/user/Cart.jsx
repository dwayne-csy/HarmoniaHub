import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Stack,
  CircularProgress,
  Paper,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import Header from "../layouts/user/Header";
import Footer from "../layouts/user/Footer";

const Cart = () => {
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(true);
  const [backendConnected, setBackendConnected] = useState(true);
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCart = async () => {
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        setBackendConnected(true);
        const { data } = await axios.get("http://localhost:4001/api/v1/cart", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCart(data.cart || { items: [] });
        setCartCount(data.cart?.items?.length || 0);
        
        // Fetch user data for header
        const userData = localStorage.getItem("user");
        if (userData) {
          setUser(JSON.parse(userData));
        }
      } catch (error) {
        console.error("Failed to fetch cart:", error);
        setCart({ items: [] });
        setBackendConnected(false);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [token, navigate]);

  const handleQuantityChange = async (productId, action) => {
    try {
      const { data } = await axios.patch(
        "http://localhost:4001/api/v1/cart/update",
        { productId, action },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCart(data.cart || { items: [] });
      setCartCount(data.cart?.items?.length || 0);
    } catch (error) {
      console.error("Failed to update cart:", error);
    }
  };

  const handleRemove = async (productId) => {
    try {
      const { data } = await axios.delete(
        `http://localhost:4001/api/v1/cart/remove/${productId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCart(data.cart || { items: [] });
      setCartCount(data.cart?.items?.length || 0);
    } catch (error) {
      console.error("Failed to remove item:", error);
    }
  };

  const handleRemoveAll = async () => {
    try {
      await axios.delete("http://localhost:4001/api/v1/cart/remove-all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCart({ items: [] });
      setCartCount(0);
    } catch (error) {
      console.error("Failed to remove all items:", error);
    }
  };

  const handleCheckout = () => {
    navigate("/checkout-confirmation", { state: { cart } });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setBackendConnected(true);
    console.log("🚪 User logged out");
    navigate("/login");
  };

  const total = cart.items.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* Header Component */}
      <Header 
        user={user}
        cartCount={cartCount}
        backendConnected={backendConnected}
        handleLogout={handleLogout}
      />

      <main style={{ flex: 1, padding: "20px 30px", backgroundColor: "#f5f5f5" }}>
        {/* Backend status banner */}
        {!backendConnected && (
          <div style={{
            backgroundColor: '#fff3cd',
            border: '1px solid #ffeaa7',
            borderRadius: '4px',
            padding: '10px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            <strong>⚠️ Limited Functionality:</strong> Backend connection issue. Some features may not work properly.
          </div>
        )}

        <Box sx={{ maxWidth: "1200px", margin: "0 auto" }}>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
              <CircularProgress />
            </Box>
          ) : !cart.items.length ? (
            <Paper 
              elevation={3} 
              sx={{ 
                textAlign: "center", 
                p: 5, 
                mt: 3,
                borderRadius: 2,
                backgroundColor: "white"
              }}
            >
              <Typography variant="h5" color="textSecondary" gutterBottom>
                Your cart is empty
              </Typography>
              <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
                Start shopping to add items to your cart
              </Typography>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={() => navigate("/")}
                sx={{
                  borderRadius: 2,
                  px: 4,
                  py: 1
                }}
              >
                Continue Shopping
              </Button>
            </Paper>
          ) : (
            <>
              <Typography 
                variant="h4" 
                sx={{ 
                  mb: 3, 
                  fontWeight: "bold",
                  color: "primary.main"
                }}
              >
                Your Shopping Cart
              </Typography>

              <Stack spacing={2}>
                {cart.items.map((item) => (
                  <Card 
                    key={item.product._id} 
                    sx={{ 
                      display: "flex", 
                      p: 2, 
                      borderRadius: 2,
                      boxShadow: 2,
                      '&:hover': {
                        boxShadow: 4
                      }
                    }}
                  >
                    <CardMedia
                      component="img"
                      sx={{ 
                        width: 120, 
                        height: 120, 
                        objectFit: "cover",
                        borderRadius: 1
                      }}
                      image={item.product.images?.[0]?.url || ""}
                      alt={item.product.name}
                    />
                    <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
                      <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
                        {item.product.name}
                      </Typography>
                      <Typography variant="h6" color="primary" sx={{ mb: 1 }}>
                        ₱{item.product.price.toLocaleString()}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                        Category: {item.product.category}
                      </Typography>
                      
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: "auto" }}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <IconButton
                            onClick={() => handleQuantityChange(item.product._id, "decrease")}
                            disabled={item.quantity <= 1}
                            sx={{
                              border: "1px solid #ddd",
                              borderRadius: 1
                            }}
                          >
                            <RemoveIcon />
                          </IconButton>
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              minWidth: "40px", 
                              textAlign: "center",
                              fontWeight: "bold"
                            }}
                          >
                            {item.quantity}
                          </Typography>
                          <IconButton
                            onClick={() => handleQuantityChange(item.product._id, "increase")}
                            disabled={item.quantity >= item.product.stock}
                            sx={{
                              border: "1px solid #ddd",
                              borderRadius: 1
                            }}
                          >
                            <AddIcon />
                          </IconButton>
                        </Stack>
                        
                        <Button
                          startIcon={<DeleteIcon />}
                          color="error"
                          variant="outlined"
                          onClick={() => handleRemove(item.product._id)}
                          sx={{
                            borderRadius: 2,
                            textTransform: "none"
                          }}
                        >
                          Remove
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Stack>

              {/* Total and Actions Section */}
              <Paper 
                elevation={3} 
                sx={{ 
                  mt: 4, 
                  p: 3, 
                  borderRadius: 2,
                  backgroundColor: "white"
                }}
              >
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                    Total: ₱{total.toLocaleString()}
                  </Typography>
                  
                  <Stack direction="row" spacing={2}>
                    <Button 
                      variant="outlined" 
                      color="error" 
                      onClick={handleRemoveAll}
                      sx={{
                        borderRadius: 2,
                        px: 3,
                        py: 1,
                        fontWeight: "bold"
                      }}
                    >
                      Remove All
                    </Button>
                    <Button 
                      variant="contained" 
                      color="primary" 
                      onClick={handleCheckout}
                      sx={{
                        borderRadius: 2,
                        px: 4,
                        py: 1,
                        fontWeight: "bold",
                        boxShadow: 2,
                        '&:hover': {
                          boxShadow: 4
                        }
                      }}
                    >
                      Checkout
                    </Button>
                  </Stack>
                </Box>
                
                {/* Cart Summary */}
                <Box sx={{ mt: 2, pt: 2, borderTop: "1px solid #e0e0e0" }}>
                  <Typography variant="body2" color="textSecondary">
                    Items in cart: {cart.items.length}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total quantity: {cart.items.reduce((acc, item) => acc + item.quantity, 0)}
                  </Typography>
                </Box>
              </Paper>
            </>
          )}
        </Box>
      </main>

      {/* Footer Component */}
      <Footer />
    </div>
  );
};

export default Cart;