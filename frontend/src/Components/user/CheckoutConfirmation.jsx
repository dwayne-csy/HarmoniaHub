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
  Alert 
} from "@mui/material";
import Loader from "../layouts/Loader";

const CheckoutConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const cart = location.state?.cart;
  const checkoutType = location.state?.checkoutType; 
  const productId = location.state?.productId;

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [backendConnected, setBackendConnected] = useState(true);

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
        setBackendConnected(true);
        const { data } = await axios.get("http://localhost:4001/api/v1/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(data.user);
      } catch (error) {
        console.error("Failed to fetch user info:", error.response?.data || error.message);
        setBackendConnected(false);
        if (error.response?.status === 401) navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token, navigate]);

  if (loading)
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
        
        <Box display="flex" justifyContent="center" alignItems="center" flex={1} style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: "center" }}>
            <Loader />
            <Typography variant="h6" style={{ color: "#d4af37", marginTop: "15px" }}>
              Loading checkout...
            </Typography>
          </div>
        </Box>
      </div>
    );

  if (!cart || !cart.items.length) {
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
        
        <Box display="flex" justifyContent="center" alignItems="center" flex={1} style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: "center", color: "#ffffff" }}>
            <div style={{ fontSize: "4rem", marginBottom: "20px", opacity: "0.7" }}>
              😔
            </div>
            <Typography variant="h6" style={{ color: "rgba(255,255,255,0.8)" }}>
              No items to checkout.
            </Typography>
          </div>
        </Box>
      </div>
    );
  }

  // Calculate totals
  const itemsPrice = cart.items.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );
  const taxPrice = itemsPrice * TAX_RATE;
  const totalPrice = itemsPrice + taxPrice + SHIPPING_PRICE;

  // Confirm checkout
  const handleConfirmCheckout = async () => {
    if (!token) {
      alert("You must log in first!");
      navigate("/login");
      return;
    }

    if (!user?.address) {
      alert("Please update your profile with a shipping address first!");
      return;
    }

    setCheckoutLoading(true);

    try {
      let res;

      if (checkoutType === "solo" && productId) {
        // Solo checkout
        res = await axios.post(
          "http://localhost:4001/api/v1/checkout/solo",
          { productId, quantity: 1 },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } else {
        // Cart checkout
        res = await axios.post(
          "http://localhost:4001/api/v1/checkout",
          {}, // backend fetches cart from DB
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }

      if (res.data.success) {
        alert("Order placed successfully!");
        navigate("/orders"); // redirect to orders page
      } else {
        alert(res.data.message || "Checkout failed");
      }
    } catch (error) {
      console.error("Checkout failed:", error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || "Checkout failed";
      
      if (error.response?.status === 400) {
        if (errorMessage.includes("Shipping address incomplete")) {
          alert("Please complete your shipping address in your profile before checking out.");
          navigate("/profile");
          return;
        } else if (errorMessage.includes("out of stock")) {
          alert("One or more products are out of stock. Please refresh the page and try again.");
          navigate("/");
          return;
        }
      }
      
      alert(errorMessage);
      if (error.response?.status === 401) navigate("/login");
    } finally {
      setCheckoutLoading(false);
    }
  };

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
              50% { transform: translateY(-5px); }
            }
            
            body {
              margin: 0;
              padding: 0;
              overflow-x: hidden;
              background: transparent;
            }
            * {
              box-sizing: border-box;
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
            maxWidth: '600px',
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
          maxWidth: "800px", 
          margin: "0 auto",
          padding: "0 20px"
        }}>
          {/* Page Header */}
          <Box sx={{ 
            textAlign: "center",
            mb: 4,
            animation: "fadeIn 0.8s ease-out"
          }}>
            <Typography variant="h4" sx={{ 
              display: "flex", 
              justifyContent: "center", 
              alignItems: "center", 
              gap: "10px",
              marginBottom: "10px",
              background: "linear-gradient(135deg, #d4af37, #f9e076, #d4af37)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundSize: "200% 100%",
              animation: "shimmer 3s infinite linear",
              fontSize: "2.5rem",
              fontWeight: "bold",
              textShadow: "0 2px 4px rgba(0,0,0,0.3)"
            }}>
              ✅ Confirm Your Order
            </Typography>
            
            {checkoutType === "solo" && (
              <Alert severity="info" sx={{ 
                mt: 1,
                backgroundColor: 'rgba(212,175,55,0.1)',
                color: '#d4af37',
                border: '1px solid rgba(212,175,55,0.3)',
                borderRadius: '12px',
                maxWidth: '300px',
                margin: '0 auto'
              }}>
                Single Product Checkout
              </Alert>
            )}
          </Box>

          {/* User Info */}
          {user && (
            <Card sx={{ 
              mb: 3, 
              p: 2, 
              border: "1px solid rgba(212,175,55,0.3)",
              borderRadius: "18px",
              background: "linear-gradient(135deg, rgba(30,30,30,0.95) 0%, rgba(40,40,40,0.95) 100%)",
              boxShadow: "0 12px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(212,175,55,0.2)",
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

              <CardContent>
                <Typography variant="h6" sx={{ 
                  color: "#d4af37",
                  fontWeight: "bold",
                  marginBottom: "15px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px"
                }}>
                  👤 Customer Information
                </Typography>
                
                <Box sx={{ 
                  padding: "20px",
                  background: "rgba(20,20,20,0.7)",
                  borderRadius: "12px",
                  border: "1px solid rgba(212,175,55,0.2)",
                  backdropFilter: "blur(10px)"
                }}>
                  <Typography sx={{ 
                    color: "#ffffff", 
                    marginBottom: "10px",
                    fontWeight: "600"
                  }}>
                    📛 Name: <span style={{ color: "rgba(255,255,255,0.9)" }}>{user.name}</span>
                  </Typography>
                  
                  {user.address ? (
                    <>
                      <Typography sx={{ color: "#ffffff", marginBottom: "8px", fontWeight: "600" }}>
                        🏠 Address: <span style={{ color: "rgba(255,255,255,0.9)" }}>{user.address.street}</span>
                      </Typography>
                      <Typography sx={{ color: "#ffffff", marginBottom: "8px", fontWeight: "600" }}>
                        🏙️ City: <span style={{ color: "rgba(255,255,255,0.9)" }}>{user.address.city}</span>
                      </Typography>
                      <Typography sx={{ color: "#ffffff", marginBottom: "8px", fontWeight: "600" }}>
                        📮 Postal Code: <span style={{ color: "rgba(255,255,255,0.9)" }}>{user.address.zipcode}</span>
                      </Typography>
                      <Typography sx={{ color: "#ffffff", marginBottom: "8px", fontWeight: "600" }}>
                        🌍 Country: <span style={{ color: "rgba(255,255,255,0.9)" }}>{user.address.country || "N/A"}</span>
                      </Typography>
                      <Typography sx={{ color: "#ffffff", fontWeight: "600" }}>
                        📞 Phone: <span style={{ color: "rgba(255,255,255,0.9)" }}>{user.contact || "N/A"}</span>
                      </Typography>
                    </>
                  ) : (
                    <Typography color="error" sx={{ 
                      padding: "15px",
                      background: "rgba(255,0,0,0.1)",
                      borderRadius: "8px",
                      border: "1px solid rgba(255,0,0,0.3)",
                      textAlign: "center",
                      fontWeight: "600"
                    }}>
                      ⚠️ No address found. Please update your profile with a shipping address.
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Cart Items */}
          <Typography variant="h5" sx={{ 
            color: "#d4af37",
            fontWeight: "bold",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "10px"
          }}>
            🛍️ Order Items
          </Typography>

          <Stack spacing={2} sx={{ marginBottom: "30px" }}>
            {cart.items.map((item) => (
              <Card key={item.product._id} sx={{ 
                display: "flex", 
                p: 2,
                border: "1px solid rgba(212,175,55,0.3)",
                borderRadius: "18px",
                background: "linear-gradient(135deg, rgba(30,30,30,0.95) 0%, rgba(40,40,40,0.95) 100%)",
                boxShadow: "0 8px 30px rgba(0,0,0,0.3), inset 0 1px 0 rgba(212,175,55,0.2)",
                position: "relative",
                overflow: "hidden",
                animation: "fadeIn 0.8s ease-out",
                transition: "all 0.3s ease",
                '&:hover': {
                  transform: "translateY(-3px)",
                  boxShadow: "0 12px 35px rgba(212,175,55,0.2)"
                }
              }}>
                {/* Gold accent line */}
                <div style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "2px",
                  background: "linear-gradient(90deg, transparent, #d4af37, transparent)",
                }}></div>

                <CardMedia
                  component="img"
                  sx={{ 
                    width: 120, 
                    height: 120, 
                    objectFit: "cover",
                    borderRadius: "12px",
                    border: "2px solid rgba(212,175,55,0.3)",
                    animation: "float 4s ease-in-out infinite"
                  }}
                  image={item.product.images?.[0]?.url || ""}
                  alt={item.product.name}
                />
                <CardContent sx={{ flex: 1, padding: "0 0 0 20px" }}>
                  <Typography variant="h6" sx={{ 
                    color: "#ffffff",
                    fontWeight: "bold",
                    marginBottom: "10px"
                  }}>
                    {item.product.name}
                  </Typography>
                  <Stack spacing={1}>
                    <Typography sx={{ color: "rgba(255,255,255,0.9)" }}>
                      📦 Quantity: {item.quantity}
                    </Typography>
                    <Typography sx={{ color: "rgba(255,255,255,0.9)" }}>
                      💰 Price: ₱{item.product.price}
                    </Typography>
                    <Typography sx={{ 
                      color: "#d4af37",
                      fontWeight: "bold",
                      fontSize: "1.1rem"
                    }}>
                      🎯 Subtotal: ₱{(item.product.price * item.quantity).toFixed(2)}
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>

          {/* Order Summary */}
          <Card sx={{ 
            mt: 3, 
            p: 2, 
            border: "1px solid rgba(212,175,55,0.3)",
            borderRadius: "18px",
            background: "linear-gradient(135deg, rgba(30,30,30,0.95) 0%, rgba(40,40,40,0.95) 100%)",
            boxShadow: "0 12px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(212,175,55,0.2)",
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

            <CardContent>
              <Typography variant="h6" sx={{ 
                color: "#d4af37",
                fontWeight: "bold",
                marginBottom: "20px",
                display: "flex",
                alignItems: "center",
                gap: "10px"
              }}>
                📊 Order Summary
              </Typography>

              <Box sx={{ 
                padding: "20px",
                background: "rgba(20,20,20,0.7)",
                borderRadius: "12px",
                border: "1px solid rgba(212,175,55,0.2)",
                backdropFilter: "blur(10px)"
              }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                  <Typography sx={{ color: "rgba(255,255,255,0.9)", fontWeight: "600" }}>Items Price:</Typography>
                  <Typography sx={{ color: "rgba(255,255,255,0.9)" }}>₱{itemsPrice.toFixed(2)}</Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                  <Typography sx={{ color: "rgba(255,255,255,0.9)", fontWeight: "600" }}>Tax (10%):</Typography>
                  <Typography sx={{ color: "rgba(255,255,255,0.9)" }}>₱{taxPrice.toFixed(2)}</Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", marginBottom: "15px" }}>
                  <Typography sx={{ color: "rgba(255,255,255,0.9)", fontWeight: "600" }}>Shipping:</Typography>
                  <Typography sx={{ color: "rgba(255,255,255,0.9)" }}>₱{SHIPPING_PRICE.toFixed(2)}</Typography>
                </Box>
                <Box sx={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  padding: "15px",
                  background: "rgba(212,175,55,0.1)",
                  borderRadius: "8px",
                  border: "1px solid rgba(212,175,55,0.3)"
                }}>
                  <Typography variant="h5" sx={{ 
                    color: "#d4af37",
                    fontWeight: "bold"
                  }}>
                    Total:
                  </Typography>
                  <Typography variant="h5" sx={{ 
                    color: "#d4af37",
                    fontWeight: "bold"
                  }}>
                    ₱{totalPrice.toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Box mt={3} display="flex" justifyContent="flex-end" gap={2}>
            <Button
              variant="outlined"
              onClick={() => navigate(-1)}
              disabled={checkoutLoading}
              sx={{
                padding: "12px 30px",
                color: "#d4af37",
                borderColor: "#d4af37",
                borderRadius: "12px",
                fontWeight: "700",
                fontSize: "16px",
                transition: "all 0.3s ease",
                '&:hover': {
                  backgroundColor: "rgba(212,175,55,0.1)",
                  borderColor: "#f9e076",
                  transform: "translateY(-2px)",
                  boxShadow: "0 6px 20px rgba(212,175,55,0.3)"
                },
                '&:disabled': {
                  color: "rgba(212,175,55,0.5)",
                  borderColor: "rgba(212,175,55,0.3)"
                }
              }}
            >
              ↩️ Back
            </Button>
            <Button
              variant="contained"
              onClick={handleConfirmCheckout}
              disabled={checkoutLoading || !user?.address}
              sx={{
                padding: "12px 30px",
                background: checkoutLoading || !user?.address 
                  ? "linear-gradient(135deg, rgba(212,175,55,0.5) 0%, rgba(249,224,118,0.5) 100%)" 
                  : "linear-gradient(135deg, #d4af37 0%, #f9e076 100%)",
                color: "#1a1a1a",
                borderRadius: "12px",
                fontWeight: "700",
                fontSize: "16px",
                transition: "all 0.3s ease",
                boxShadow: checkoutLoading || !user?.address 
                  ? "0 4px 15px rgba(212,175,55,0.2)" 
                  : "0 6px 20px rgba(212,175,55,0.4)",
                border: "none",
                cursor: checkoutLoading || !user?.address ? "not-allowed" : "pointer",
                position: "relative",
                overflow: "hidden",
                '&:hover:not(:disabled)': {
                  transform: "translateY(-3px)",
                  boxShadow: "0 10px 25px rgba(212,175,55,0.6)",
                  background: "linear-gradient(135deg, #d4af37 0%, #f9e076 100%)"
                }
              }}
            >
              {checkoutLoading ? "⏳ Processing..." : !user?.address ? "📍 Add Address First" : "✅ Confirm Checkout"}
            </Button>
          </Box>
        </Box>
      </main>
    </div>
  );
};

export default CheckoutConfirmation;