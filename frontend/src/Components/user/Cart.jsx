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
    <div style={{ 
      display: "flex", 
      flexDirection: "column", 
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 50%, #2d2d2d 100%)",
      position: "relative",
      overflow: "hidden",
      margin: 0,
      padding: 0 
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

      {/* Header Component */}
      <Header 
        user={user}
        cartCount={cartCount}
        backendConnected={backendConnected}
        handleLogout={handleLogout}
      />

      <main style={{ 
        flex: 1, 
        padding: "20px 0",
        backgroundColor: "transparent",
        animation: "fadeIn 0.6s ease-in-out",
        position: "relative",
        zIndex: 1,
        margin: 0,
        width: "100%"
      }}>
        <style>
          {`
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(10px); }
              to { opacity: 1; transform: translateY(0); }
            }
            @keyframes pulse {
              0% { transform: scale(1); }
              50% { transform: scale(1.05); }
              100% { transform: scale(1); }
            }
            @keyframes shimmer {
              0% { background-position: -1000px 0; }
              100% { background-position: 1000px 0; }
            }
            @keyframes float {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-10px); }
            }
            
            body {
              margin: 0;
              padding: 0;
              overflow-x: hidden;
            }
          `}
        </style>

        {/* Backend status banner */}
        {!backendConnected && (
          <div style={{
            backgroundColor: 'rgba(212,175,55,0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(212,175,55,0.3)',
            borderRadius: '12px',
            padding: '15px 20px',
            margin: '0 auto 25px',
            textAlign: 'center',
            maxWidth: '1200px',
            color: '#d4af37',
            fontWeight: '600',
            animation: 'fadeIn 0.5s ease-out',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
            marginLeft: '20px',
            marginRight: '20px'
          }}>
            <strong>⚠️ Limited Functionality:</strong> Backend connection issue. Some features may not work properly.
          </div>
        )}

        <Box sx={{ 
          maxWidth: "1200px", 
          margin: "0 auto",
          padding: "0 20px"
        }}>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
              <CircularProgress sx={{ color: "#d4af37" }} />
            </Box>
          ) : !cart.items.length ? (
            <Paper 
              elevation={3} 
              sx={{ 
                textAlign: "center", 
                p: 5, 
                mt: 3,
                borderRadius: "18px",
                background: "linear-gradient(135deg, rgba(30,30,30,0.9) 0%, rgba(40,40,40,0.9) 100%)",
                border: "1px solid rgba(212,175,55,0.2)",
                boxShadow: "0 8px 25px rgba(0,0,0,0.4), inset 0 1px 0 rgba(212,175,55,0.1)",
                color: "#ffffff",
                position: "relative",
                overflow: "hidden"
              }}
            >
              {/* Gold accent line */}
              <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "3px",
                background: "linear-gradient(90deg, transparent, #d4af37, transparent)",
                animation: "shimmer 3s infinite linear"
              }}></div>

              <Typography variant="h5" sx={{ 
                color: "#d4af37", 
                mb: 2,
                fontWeight: "bold",
                textShadow: "0 2px 4px rgba(0,0,0,0.3)"
              }}>
                🛒 Your cart is empty
              </Typography>
              <Typography variant="body1" sx={{ 
                mb: 3,
                color: "rgba(255,255,255,0.8)"
              }}>
                Start shopping to add items to your cart
              </Typography>
              <Button 
                variant="contained" 
                onClick={() => navigate("/")}
                sx={{
                  borderRadius: "12px",
                  px: 4,
                  py: 1.5,
                  fontWeight: "bold",
                  background: "linear-gradient(135deg, #d4af37 0%, #f9e076 100%)",
                  color: "#1a1a1a",
                  boxShadow: "0 6px 20px rgba(212,175,55,0.4)",
                  transition: "all 0.3s ease",
                  '&:hover': {
                    transform: "translateY(-2px)",
                    boxShadow: "0 10px 25px rgba(212,175,55,0.6)",
                    background: "linear-gradient(135deg, #d4af37 0%, #f9e076 100%)",
                  }
                }}
              >
                Continue Shopping
              </Button>
            </Paper>
          ) : (
            <>
              {/* Cart Header */}
              <div style={{ 
                background: "linear-gradient(135deg, rgba(212,175,55,0.15) 0%, rgba(192,156,39,0.1) 100%)",
                backdropFilter: "blur(15px)",
                padding: "25px 30px", 
                borderRadius: "18px",
                boxShadow: "0 12px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(212,175,55,0.2)",
                marginBottom: "30px",
                border: "1px solid rgba(212,175,55,0.3)",
                position: "relative",
                overflow: "hidden",
                animation: "fadeIn 0.8s ease-out"
              }}>
                {/* Gold accent line */}
                <div style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "3px",
                  background: "linear-gradient(90deg, transparent, #d4af37, transparent)",
                  animation: "shimmer 3s infinite linear"
                }}></div>
                
                <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                  <div style={{
                    width: "50px",
                    height: "50px",
                    background: "linear-gradient(135deg, #d4af37, #f9e076)",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.5rem",
                    boxShadow: "0 4px 15px rgba(212,175,55,0.4)",
                    animation: "float 4s ease-in-out infinite"
                  }}>
                    🛒
                  </div>
                  <div>
                    <Typography 
                      variant="h4" 
                      sx={{ 
                        fontWeight: "bold",
                        background: "linear-gradient(135deg, #d4af37, #f9e076, #d4af37)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundSize: "200% 100%",
                        animation: "shimmer 3s infinite linear",
                        textShadow: "0 2px 4px rgba(0,0,0,0.3)"
                      }}
                    >
                      Your Shopping Cart
                    </Typography>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        color: "rgba(212,175,55,0.8)",
                        mt: 0.5
                      }}
                    >
                      {cart.items.length} item{cart.items.length !== 1 ? 's' : ''} in your cart
                    </Typography>
                  </div>
                </div>
              </div>

              {/* Cart Items */}
              <Stack spacing={3}>
                {cart.items.map((item) => (
                  <Card 
                    key={item.product._id} 
                    sx={{ 
                      display: "flex", 
                      p: 3, 
                      borderRadius: "18px",
                      background: "linear-gradient(135deg, rgba(30,30,30,0.9) 0%, rgba(40,40,40,0.9) 100%)",
                      border: "1px solid rgba(212,175,55,0.2)",
                      boxShadow: "0 8px 25px rgba(0,0,0,0.4), inset 0 1px 0 rgba(212,175,55,0.1)",
                      transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                      position: "relative",
                      overflow: "hidden",
                      '&:hover': {
                        transform: "translateY(-5px)",
                        boxShadow: "0 15px 35px rgba(0,0,0,0.5), inset 0 1px 0 rgba(212,175,55,0.2)",
                        border: "1px solid rgba(212,175,55,0.4)",
                      }
                    }}
                  >
                    <CardMedia
                      component="img"
                      sx={{ 
                        width: 140, 
                        height: 140, 
                        objectFit: "cover",
                        borderRadius: "12px",
                        border: "2px solid rgba(212,175,55,0.3)"
                      }}
                      image={item.product.images?.[0]?.url || ""}
                      alt={item.product.name}
                    />
                    <CardContent sx={{ 
                      flex: 1, 
                      display: "flex", 
                      flexDirection: "column",
                      color: "#ffffff"
                    }}>
                      <Typography variant="h6" sx={{ 
                        fontWeight: "bold", 
                        mb: 1,
                        color: "#d4af37",
                        fontSize: "1.3rem"
                      }}>
                        {item.product.name}
                      </Typography>
                      <Typography variant="h6" sx={{ 
                        mb: 1,
                        background: "linear-gradient(135deg, #d4af37, #f9e076)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        fontWeight: "bold",
                        fontSize: "1.4rem"
                      }}>
                        ₱{item.product.price.toLocaleString()}
                      </Typography>
                      <Typography variant="body2" sx={{ 
                        mb: 2,
                        color: "rgba(255,255,255,0.7)"
                      }}>
                        Category: {item.product.category}
                      </Typography>
                      
                      <Box sx={{ 
                        display: "flex", 
                        alignItems: "center", 
                        justifyContent: "space-between", 
                        mt: "auto" 
                      }}>
                        <Stack direction="row" alignItems="center" spacing={1.5}>
                          <IconButton
                            onClick={() => handleQuantityChange(item.product._id, "decrease")}
                            disabled={item.quantity <= 1}
                            sx={{
                              border: "2px solid rgba(212,175,55,0.4)",
                              borderRadius: "10px",
                              color: "#d4af37",
                              backgroundColor: "rgba(212,175,55,0.1)",
                              '&:hover': {
                                backgroundColor: "rgba(212,175,55,0.2)",
                                transform: "scale(1.1)",
                              },
                              '&.Mui-disabled': {
                                border: "2px solid rgba(255,255,255,0.1)",
                                color: "rgba(255,255,255,0.3)",
                              }
                            }}
                          >
                            <RemoveIcon />
                          </IconButton>
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              minWidth: "50px", 
                              textAlign: "center",
                              fontWeight: "bold",
                              color: "#ffffff",
                              fontSize: "1.2rem"
                            }}
                          >
                            {item.quantity}
                          </Typography>
                          <IconButton
                            onClick={() => handleQuantityChange(item.product._id, "increase")}
                            disabled={item.quantity >= item.product.stock}
                            sx={{
                              border: "2px solid rgba(212,175,55,0.4)",
                              borderRadius: "10px",
                              color: "#d4af37",
                              backgroundColor: "rgba(212,175,55,0.1)",
                              '&:hover': {
                                backgroundColor: "rgba(212,175,55,0.2)",
                                transform: "scale(1.1)",
                              },
                              '&.Mui-disabled': {
                                border: "2px solid rgba(255,255,255,0.1)",
                                color: "rgba(255,255,255,0.3)",
                              }
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
                            borderRadius: "10px",
                            textTransform: "none",
                            fontWeight: "bold",
                            border: "2px solid #ff6b6b",
                            color: "#ff6b6b",
                            backgroundColor: "rgba(255,107,107,0.1)",
                            px: 3,
                            '&:hover': {
                              backgroundColor: "rgba(255,107,107,0.2)",
                              border: "2px solid #ff5252",
                              transform: "translateY(-2px)",
                              boxShadow: "0 4px 15px rgba(255,107,107,0.3)",
                            }
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
                  p: 4, 
                  borderRadius: "18px",
                  background: "linear-gradient(135deg, rgba(30,30,30,0.9) 0%, rgba(40,40,40,0.9) 100%)",
                  border: "1px solid rgba(212,175,55,0.3)",
                  boxShadow: "0 12px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(212,175,55,0.1)",
                  color: "#ffffff",
                  position: "relative",
                  overflow: "hidden"
                }}
              >
                {/* Gold accent line */}
                <div style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "3px",
                  background: "linear-gradient(90deg, transparent, #d4af37, transparent)",
                  animation: "shimmer 3s infinite linear"
                }}></div>

                <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={3}>
                  <Box>
                    <Typography variant="h4" sx={{ 
                      fontWeight: "bold",
                      background: "linear-gradient(135deg, #d4af37, #f9e076, #d4af37)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundSize: "200% 100%",
                      animation: "shimmer 3s infinite linear",
                      textShadow: "0 2px 4px rgba(0,0,0,0.3)"
                    }}>
                      Total: ₱{total.toLocaleString()}
                    </Typography>
                    
                    {/* Cart Summary */}
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)" }}>
                        Items in cart: {cart.items.length}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)" }}>
                        Total quantity: {cart.items.reduce((acc, item) => acc + item.quantity, 0)}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                    <Button 
                      variant="outlined" 
                      onClick={handleRemoveAll}
                      sx={{
                        borderRadius: "12px",
                        px: 4,
                        py: 1.5,
                        fontWeight: "bold",
                        border: "2px solid #ff6b6b",
                        color: "#ff6b6b",
                        backgroundColor: "rgba(255,107,107,0.1)",
                        transition: "all 0.3s ease",
                        '&:hover': {
                          backgroundColor: "rgba(255,107,107,0.2)",
                          border: "2px solid #ff5252",
                          transform: "translateY(-2px)",
                          boxShadow: "0 6px 20px rgba(255,107,107,0.3)",
                        }
                      }}
                    >
                      Remove All
                    </Button>
                    <Button 
                      variant="contained" 
                      onClick={handleCheckout}
                      sx={{
                        borderRadius: "12px",
                        px: 5,
                        py: 1.5,
                        fontWeight: "bold",
                        background: "linear-gradient(135deg, #d4af37 0%, #f9e076 100%)",
                        color: "#1a1a1a",
                        boxShadow: "0 6px 20px rgba(212,175,55,0.4)",
                        transition: "all 0.3s ease",
                        '&:hover': {
                          transform: "translateY(-2px)",
                          boxShadow: "0 10px 25px rgba(212,175,55,0.6)",
                          background: "linear-gradient(135deg, #d4af37 0%, #f9e076 100%)",
                        }
                      }}
                    >
                      Checkout
                    </Button>
                  </Stack>
                </Box>
              </Paper>
            </>
          )}
        </Box>

        {/* Floating Cart Icon */}
        <div
          style={{
            position: "fixed",
            bottom: "30px",
            right: "30px",
            zIndex: "1000",
            animation: "float 4s ease-in-out infinite",
            fontSize: "2.5rem",
            filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.3))",
            opacity: "0.7"
          }}
        >
          🛒
        </div>
      </main>

      {/* Footer Component */}
      <Footer />
    </div>
  );
};

export default Cart;