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
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <Header 
          user={user}
          cartCount={cartCount}
          backendConnected={backendConnected}
          handleLogout={handleLogout}
        />
        <Box display="flex" justifyContent="center" alignItems="center" flex={1}>
          <CircularProgress />
        </Box>
        <Footer />
      </div>
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

        <Box p={3} sx={{ maxWidth: "1200px", margin: "0 auto" }}>
          <Typography variant="h4" mb={3} display="flex" alignItems="center" gap={1}>
            <HistoryIcon /> Your Order History
          </Typography>

          {!orders.length ? (
            <Typography variant="h6" align="center" mt={5}>
              You have no orders yet.
            </Typography>
          ) : (
            <Stack spacing={3}>
              {orders.map((order) => (
                <Card key={order._id} sx={{ p: 2, border: "1px solid #e0e0e0", borderRadius: 2 }}>
                  <CardContent>
                    {/* Order Header */}
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                      <Box>
                        <Typography variant="h6" gutterBottom>
                          Order #: {order._id.slice(-8).toUpperCase()}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Placed on: {new Date(order.createdAt).toLocaleDateString()} at{" "}
                          {new Date(order.createdAt).toLocaleTimeString()}
                        </Typography>
                        {order.deliveredAt && (
                          <Typography variant="body2" color="text.secondary">
                            Delivered on: {new Date(order.deliveredAt).toLocaleDateString()}
                          </Typography>
                        )}
                      </Box>
                      <Box textAlign="right">
                        <Chip 
                          label={getStatusText(order.orderStatus)} 
                          color={getStatusColor(order.orderStatus)}
                          variant="outlined"
                          sx={{ mb: 1 }}
                        />
                        <Typography variant="h6" color="primary">
                          Total: ₱{order.totalPrice?.toFixed(2)}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Shipping Info */}
                    <Box mb={2} p={1.5} bgcolor="grey.50" borderRadius={1}>
                      <Typography variant="subtitle2" gutterBottom>
                        Shipping Address:
                      </Typography>
                      <Typography variant="body2">
                        {order.shippingInfo.address}, {order.shippingInfo.city}, {order.shippingInfo.postalCode}, {order.shippingInfo.country}
                      </Typography>
                      <Typography variant="body2">
                        Phone: {order.shippingInfo.phoneNo}
                      </Typography>
                    </Box>

                    {/* Order Items */}
                    <Box>
                      <Typography variant="subtitle1" gutterBottom>
                        Order Items:
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
                              border="1px solid #e0e0e0"
                              borderRadius={2}
                              sx={{ backgroundColor: "background.paper" }}
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
                                    borderRadius: 1
                                  }}
                                />
                                
                                {/* Product Details */}
                                <Box flex={1}>
                                  <Typography variant="subtitle1" fontWeight="bold">
                                    {productDetails.name}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    Quantity: {item.quantity} × ₱{item.price?.toFixed(2)}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    Subtotal: ₱{(item.quantity * item.price)?.toFixed(2)}
                                  </Typography>
                                  
                                  {/* Review Section */}
                                  {isDelivered && (
                                    <Box mt={1}>
                                      {myReview ? (
                                        <Box>
                                          <Box display="flex" alignItems="center" gap={1} mb={1}>
                                            <Typography variant="body2">Your Rating:</Typography>
                                            {[...Array(5)].map((_, i) => (
                                              <StarIcon 
                                                key={i} 
                                                color={i < myReview.rating ? "warning" : "disabled"} 
                                                fontSize="small" 
                                              />
                                            ))}
                                          </Box>
                                          <Typography variant="body2" sx={{ fontStyle: "italic" }}>
                                            "{myReview.comment}"
                                          </Typography>
                                          <Button
                                            variant="outlined"
                                            color="success"
                                            size="small"
                                            sx={{ mt: 1 }}
                                            onClick={() => handleReview(productDetails.id, order._id, myReview)}
                                          >
                                            Update Review
                                          </Button>
                                        </Box>
                                      ) : (
                                        <Button
                                          variant="contained"
                                          color="secondary"
                                          size="small"
                                          sx={{ mt: 1 }}
                                          onClick={() => handleReview(productDetails.id, order._id)}
                                        >
                                          Write Review
                                        </Button>
                                      )}
                                    </Box>
                                  )}
                                  
                                  {!isDelivered && (
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                      Review available after delivery
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
                      <Box mt={2} p={1.5} bgcolor="grey.50" borderRadius={1}>
                        <Typography variant="subtitle2" gutterBottom>
                          Payment Information:
                        </Typography>
                        <Typography variant="body2">
                          Status: {order.paymentInfo.status || "N/A"}
                        </Typography>
                        {order.paidAt && (
                          <Typography variant="body2">
                            Paid on: {new Date(order.paidAt).toLocaleDateString()}
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
            <Button variant="contained" color="primary" onClick={() => navigate("/home")}>
              Back to Home
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