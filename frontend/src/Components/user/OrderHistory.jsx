import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  CircularProgress,
  Button,
  Chip,
} from "@mui/material";
import HistoryIcon from "@mui/icons-material/History";
import StarIcon from "@mui/icons-material/Star";
import Header from "../layouts/user/Header";
import Footer from "../layouts/user/Footer";

const BASE_URL = "http://localhost:4001/api/v1";

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [productReviews, setProductReviews] = useState({});
  const [loading, setLoading] = useState(true);
  const [backendConnected, setBackendConnected] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrdersAndReviews = async () => {
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        setBackendConnected(true);
        // Fetch user's orders
        const { data } = await axios.get(`${BASE_URL}/orders/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const ordersData = data.orders || [];
        setOrders(ordersData);

        const reviewMap = {};

        // Fetch user's reviews for all products in orders
        for (const order of ordersData) {
          for (const item of order.orderItems) {
            // Get the product ID - handle both string and populated object
            const productId = typeof item.product === 'object' 
              ? item.product._id 
              : item.product;
            
            try {
              const { data: reviewData } = await axios.get(
                `${BASE_URL}/review/user/${productId}`,
                { headers: { Authorization: `Bearer ${token}` } }
              );
              reviewMap[productId] = reviewData.review;
            } catch (err) {
              console.warn(`Failed to fetch review for product ${productId}`, err);
              reviewMap[productId] = null;
            }
          }
        }

        setProductReviews(reviewMap);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
        setBackendConnected(false);
      } finally {
        setLoading(false);
      }
    };

    fetchOrdersAndReviews();
  }, [token, navigate, user._id]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setBackendConnected(true);
    console.log("🚪 User logged out");
    navigate("/login");
  };

  const handleReview = (productId, orderId, existingReview = null) => {
    if (existingReview) {
      // Edit existing review - pass the existing review data
      navigate(`/review/${productId}`, { 
    state: { 
      orderId, 
      existingReview
        } 
      });
    } else {
      // Write new review
      navigate(`/review/${productId}`, { 
        state: { orderId } 
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Delivered":
        return "success";
      case "Processing":
        return "warning";
      case "Out for Delivery":
        return "info";
      case "Accepted":
        return "primary";
      case "Cancelled":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "Out for Delivery":
        return "Out for Delivery";
      default:
        return status;
    }
  };

  // Helper function to get product details safely
  const getProductDetails = (item) => {
    if (typeof item.product === 'object') {
      // Product is populated
      return {
        id: item.product._id,
        name: item.product.name,
        image: item.image // Use the image from order item
      };
    } else {
      // Product is just an ID
      return {
        id: item.product,
        name: item.name,
        image: item.image
      };
    }
  };

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

        <Header 
          user={user}
          cartCount={cartCount}
          backendConnected={backendConnected}
          handleLogout={handleLogout}
        />
        <Box display="flex" justifyContent="center" alignItems="center" flex={1} style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: "center", color: "#d4af37" }}>
            <div style={{ fontSize: "3rem", marginBottom: "20px", animation: "pulse 2s infinite" }}>
              📦
            </div>
            <Typography variant="h6" style={{ color: "#d4af37" }}>
              Loading your orders...
            </Typography>
          </div>
        </Box>
        <Footer />
      </div>
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
          maxWidth: "1200px", 
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
              <HistoryIcon sx={{ fontSize: "2.5rem" }} />
              Your Order History
            </Typography>
            <Typography variant="h6" sx={{ 
              color: "rgba(255,255,255,0.8)",
              fontWeight: "400"
            }}>
              Track and manage all your purchases
            </Typography>
          </Box>

          {!orders.length ? (
            <Box sx={{ 
              textAlign: "center", 
              padding: "60px 20px",
              color: "#ffffff",
              animation: "fadeIn 0.8s ease-out"
            }}>
              <div style={{
                fontSize: "4rem",
                marginBottom: "20px",
                opacity: "0.7",
                animation: "float 4s ease-in-out infinite"
              }}>
                📦
              </div>
              <Typography variant="h6" sx={{ 
                color: "rgba(255,255,255,0.8)",
                marginBottom: "20px"
              }}>
                You have no orders yet.
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate("/home")}
                sx={{
                  marginTop: "15px",
                  padding: "12px 30px",
                  background: "linear-gradient(135deg, #d4af37 0%, #f9e076 100%)",
                  color: "#1a1a1a",
                  borderRadius: "12px",
                  fontWeight: "700",
                  fontSize: "16px",
                  transition: "all 0.3s ease",
                  boxShadow: "0 6px 20px rgba(212,175,55,0.4)",
                  border: "none",
                  cursor: "pointer",
                  position: "relative",
                  overflow: "hidden",
                  '&:hover': {
                    transform: "translateY(-3px)",
                    boxShadow: "0 10px 25px rgba(212,175,55,0.6)",
                    background: "linear-gradient(135deg, #d4af37 0%, #f9e076 100%)"
                  }
                }}
              >
                Start Shopping
              </Button>
            </Box>
          ) : (
            <Stack spacing={3}>
              {orders.map((order) => (
                <Card key={order._id} sx={{ 
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
                    {/* Order Header */}
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                      <Box>
                        <Typography variant="h6" gutterBottom sx={{ 
                          color: "#d4af37",
                          fontWeight: "bold"
                        }}>
                          Order #: {order._id.slice(-8).toUpperCase()}
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          color: "rgba(255,255,255,0.8)",
                          padding: "8px 12px",
                          background: "rgba(212,175,55,0.1)",
                          borderRadius: "8px",
                          display: "inline-block"
                        }}>
                          📅 Placed on: {new Date(order.createdAt).toLocaleDateString()} at{" "}
                          {new Date(order.createdAt).toLocaleTimeString()}
                        </Typography>
                        {order.deliveredAt && (
                          <Typography variant="body2" sx={{ 
                            color: "rgba(255,255,255,0.8)",
                            marginTop: "5px"
                          }}>
                            🎉 Delivered on: {new Date(order.deliveredAt).toLocaleDateString()}
                          </Typography>
                        )}
                      </Box>
                      <Box textAlign="right">
                        <Chip 
                          label={getStatusText(order.orderStatus)} 
                          color={getStatusColor(order.orderStatus)}
                          variant="filled"
                          sx={{ 
                            mb: 1,
                            fontWeight: "bold",
                            fontSize: "14px"
                          }}
                        />
                        <Typography variant="h6" sx={{ 
                          color: "#d4af37",
                          fontWeight: "bold",
                          background: "linear-gradient(135deg, #d4af37, #f9e076)",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent"
                        }}>
                          Total: ₱{order.totalPrice?.toFixed(2)}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Shipping Info */}
                    <Box mb={2} p={1.5} sx={{ 
                      backgroundColor: "rgba(20,20,20,0.7)",
                      borderRadius: "12px",
                      border: "1px solid rgba(212,175,55,0.2)",
                      backdropFilter: "blur(10px)"
                    }}>
                      <Typography variant="subtitle2" gutterBottom sx={{ 
                        color: "#d4af37",
                        fontWeight: "bold"
                      }}>
                        📦 Shipping Address:
                      </Typography>
                      <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.9)" }}>
                        {order.shippingInfo.address}, {order.shippingInfo.city}, {order.shippingInfo.postalCode}, {order.shippingInfo.country}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.9)" }}>
                        📞 Phone: {order.shippingInfo.phoneNo}
                      </Typography>
                    </Box>

                    {/* Order Items */}
                    <Box>
                      <Typography variant="subtitle1" gutterBottom sx={{ 
                        color: "#d4af37",
                        fontWeight: "bold",
                        fontSize: "1.2rem"
                      }}>
                        🛍️ Order Items:
                      </Typography>
                      <Stack spacing={2} mt={1}>
                        {order.orderItems?.map((item, index) => {
                          const productDetails = getProductDetails(item);
                          const myReview = productReviews[productDetails.id];
                          const isDelivered = order.orderStatus === "Delivered";
                          
                          return (
                            <Box
                              key={item._id || `${productDetails.id}-${index}`}
                              p={2}
                              sx={{ 
                                border: "1px solid rgba(212,175,55,0.2)",
                                borderRadius: "12px",
                                backgroundColor: "rgba(20,20,20,0.7)",
                                backdropFilter: "blur(10px)",
                                transition: "all 0.3s ease",
                                '&:hover': {
                                  transform: "translateY(-2px)",
                                  boxShadow: "0 8px 25px rgba(212,175,55,0.2)"
                                }
                              }}
                            >
                              <Box display="flex" gap={2} alignItems="flex-start">
                                {/* Product Image */}
                                <Box 
                                  component="img"
                                  src={productDetails.image}
                                  alt={productDetails.name}
                                  sx={{ 
                                    width: 80, 
                                    height: 80, 
                                    objectFit: 'cover',
                                    borderRadius: "8px",
                                    border: "2px solid rgba(212,175,55,0.3)",
                                    animation: "float 4s ease-in-out infinite"
                                  }}
                                />
                                
                                {/* Product Details */}
                                <Box flex={1}>
                                  <Typography variant="subtitle1" sx={{ 
                                    fontWeight: "bold",
                                    color: "#ffffff",
                                    marginBottom: "5px"
                                  }}>
                                    {productDetails.name}
                                  </Typography>
                                  <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)" }}>
                                    📦 Quantity: {item.quantity} × ₱{item.price?.toFixed(2)}
                                  </Typography>
                                  <Typography variant="body2" sx={{ 
                                    color: "#d4af37",
                                    fontWeight: "bold"
                                  }}>
                                    💰 Subtotal: ₱{(item.quantity * item.price)?.toFixed(2)}
                                  </Typography>
                                  
                                  {/* Review Section */}
                                  {isDelivered && (
                                    <Box mt={1} p={1.5} sx={{ 
                                      backgroundColor: "rgba(212,175,55,0.1)",
                                      borderRadius: "8px",
                                      border: "1px solid rgba(212,175,55,0.2)"
                                    }}>
                                      {myReview ? (
                                        <Box>
                                          <Box display="flex" alignItems="center" gap={1} mb={1}>
                                            <Typography variant="body2" sx={{ color: "#d4af37", fontWeight: "bold" }}>
                                              Your Rating:
                                            </Typography>
                                            {[...Array(5)].map((_, i) => (
                                              <StarIcon 
                                                key={i} 
                                                sx={{ 
                                                  color: i < myReview.rating ? "#d4af37" : "rgba(255,255,255,0.3)",
                                                  fontSize: "20px"
                                                }} 
                                              />
                                            ))}
                                          </Box>
                                          <Typography variant="body2" sx={{ 
                                            fontStyle: "italic",
                                            color: "rgba(255,255,255,0.9)",
                                            padding: "8px",
                                            backgroundColor: "rgba(0,0,0,0.3)",
                                            borderRadius: "6px"
                                          }}>
                                            "{myReview.comment}"
                                          </Typography>
                                          <Button
                                            variant="outlined"
                                            size="small"
                                            sx={{ 
                                              mt: 1,
                                              color: "#d4af37",
                                              borderColor: "#d4af37",
                                              borderRadius: "8px",
                                              fontWeight: "bold",
                                              '&:hover': {
                                                backgroundColor: "rgba(212,175,55,0.1)",
                                                borderColor: "#f9e076"
                                              }
                                            }}
                                            onClick={() => handleReview(productDetails.id, order._id, myReview)}
                                          >
                                            ✏️ Update Review
                                          </Button>
                                        </Box>
                                      ) : (
                                        <Button
                                          variant="contained"
                                          size="small"
                                          sx={{ 
                                            mt: 1,
                                            background: "linear-gradient(135deg, #d4af37 0%, #f9e076 100%)",
                                            color: "#1a1a1a",
                                            borderRadius: "8px",
                                            fontWeight: "bold",
                                            padding: "8px 16px",
                                            '&:hover': {
                                              transform: "translateY(-2px)",
                                              boxShadow: "0 6px 20px rgba(212,175,55,0.4)",
                                              background: "linear-gradient(135deg, #d4af37 0%, #f9e076 100%)"
                                            }
                                          }}
                                          onClick={() => handleReview(productDetails.id, order._id)}
                                        >
                                          ⭐ Write Review
                                        </Button>
                                      )}
                                    </Box>
                                  )}
                                  
                                  {!isDelivered && (
                                    <Typography variant="body2" sx={{ 
                                      color: "rgba(255,255,255,0.6)",
                                      mt: 1,
                                      fontStyle: "italic"
                                    }}>
                                      📝 Review available after delivery
                                    </Typography>
                                  )}
                                </Box>
                              </Box>
                            </Box>
                          );
                        })}
                      </Stack>
                    </Box>

                    {/* Payment Info */}
                    {order.paymentInfo && (
                      <Box mt={2} p={1.5} sx={{ 
                        backgroundColor: "rgba(20,20,20,0.7)",
                        borderRadius: "12px",
                        border: "1px solid rgba(212,175,55,0.2)",
                        backdropFilter: "blur(10px)"
                      }}>
                        <Typography variant="subtitle2" gutterBottom sx={{ 
                          color: "#d4af37",
                          fontWeight: "bold"
                        }}>
                          💳 Payment Information:
                        </Typography>
                        <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.9)" }}>
                          Status: {order.paymentInfo.status || "N/A"}
                        </Typography>
                        {order.paidAt && (
                          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.9)" }}>
                            💰 Paid on: {new Date(order.paidAt).toLocaleDateString()}
                          </Typography>
                        )}
                      </Box>
                    )}
                  </CardContent>
                </Card>
              ))}
            </Stack>
          )}

          <Box mt={3} display="flex" justifyContent="center">
            <Button 
              variant="contained" 
              onClick={() => navigate("/home")}
              sx={{
                padding: "12px 30px",
                background: "linear-gradient(135deg, #d4af37 0%, #f9e076 100%)",
                color: "#1a1a1a",
                borderRadius: "12px",
                fontWeight: "700",
                fontSize: "16px",
                transition: "all 0.3s ease",
                boxShadow: "0 6px 20px rgba(212,175,55,0.4)",
                border: "none",
                cursor: "pointer",
                position: "relative",
                overflow: "hidden",
                '&:hover': {
                  transform: "translateY(-3px)",
                  boxShadow: "0 10px 25px rgba(212,175,55,0.6)",
                  background: "linear-gradient(135deg, #d4af37 0%, #f9e076 100%)"
                }
              }}
            >
              🏠 Back to Home
            </Button>
          </Box>
        </Box>
      </main>

      {/* Footer Component */}
      <Footer />
    </div>
  );
};

export default OrderHistory;