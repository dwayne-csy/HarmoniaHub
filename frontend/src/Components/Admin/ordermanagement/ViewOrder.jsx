// HarmoniaHub/frontend/src/Components/admin/ordermanagement/ViewOrder.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Button,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Divider,
  Stack,
  IconButton,
  Chip
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import Loader from "../../layouts/Loader";
import AdminHeader from "../../layouts/admin/AdminHeader";
import AdminFooter from "../../layouts/admin/AdminFooter";

const BASE_URL = "http://localhost:4001/api/v1";

export default function ViewOrder() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const currentUser = JSON.parse(localStorage.getItem("user"));

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
    // eslint-disable-next-line
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/admin/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrder(res.data.order);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      "Processing": "linear-gradient(135deg, #FF9800, #F57C00)",
      "Accepted": "linear-gradient(135deg, #2196F3, #1976D2)",
      "Cancelled": "linear-gradient(135deg, #F44336, #d32f2f)",
      "Out for Delivery": "linear-gradient(135deg, #9C27B0, #7B1FA2)",
      "Delivered": "linear-gradient(135deg, #4CAF50, #45a049)"
    };
    return colors[status] || "linear-gradient(135deg, #d4af37, #b8860b)";
  };

  if (loading) {
    return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 50%, #2d2d2d 100%)",
        margin: 0,
        padding: 0
      }}>
        <AdminHeader admin={currentUser} handleLogout={handleLogout} />
        <Box sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
          flex: 1
        }}>
          <Loader />
        </Box>
        <AdminFooter />
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 50%, #2d2d2d 100%)",
        margin: 0,
        padding: 0
      }}>
        <AdminHeader admin={currentUser} handleLogout={handleLogout} />
        <main style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          margin: 0,
          width: "100%"
        }}>
          <Typography variant="h6" sx={{ color: '#d4af37' }}>
            Order not found.
          </Typography>
        </main>
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

      <AdminHeader admin={currentUser} handleLogout={handleLogout} />

      <main style={{
        flex: 1,
        padding: "0",
        backgroundColor: "transparent",
        position: "relative",
        zIndex: 1,
        margin: 0,
        width: "100%"
      }}>
        <Box sx={{
          maxWidth: "100%",
          margin: "0",
          padding: "20px 0"
        }}>
          <Box sx={{
            maxWidth: "100%",
            margin: '0',
            background: "linear-gradient(135deg, rgba(30,30,30,0.95) 0%, rgba(40,40,40,0.95) 100%)",
            backdropFilter: "blur(15px)",
            padding: "30px 20px",
            borderRadius: "0",
            boxShadow: "0 12px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(212,175,55,0.2)",
            border: "1px solid rgba(212,175,55,0.3)",
            position: "relative",
            overflow: "hidden",
            minHeight: "calc(100vh - 140px)"
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

            <Box sx={{ maxWidth: "1200px", margin: "0 auto", padding: "0 10px" }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={4}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <IconButton
                    onClick={() => navigate(-1)}
                    sx={{
                      color: "#d4af37",
                      border: "1px solid rgba(212,175,55,0.3)",
                      background: "rgba(212,175,55,0.1)",
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
                    Order Details
                  </Typography>
                  <Chip
                    label={order.orderStatus}
                    sx={{
                      background: getStatusColor(order.orderStatus),
                      color: "#fff",
                      fontWeight: "bold",
                      fontSize: "14px",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.3)"
                    }}
                  />
                </Stack>
              </Stack>

              {/* Order & User Information */}
              <Box mb={4}>
                <Typography variant="h6" sx={{ color: '#d4af37', mb: 2 }}>
                  Order & Customer Information
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{
                      background: 'rgba(20,20,20,0.8)',
                      padding: '20px',
                      borderRadius: '12px',
                      border: '1px solid rgba(212,175,55,0.2)',
                      boxShadow: "0 4px 15px rgba(0,0,0,0.2)"
                    }}>
                      <Typography variant="subtitle1" sx={{ color: '#d4af37', mb: 1, fontWeight: '600' }}>
                        Order Information
                      </Typography>
                      <Stack spacing={1}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography sx={{ color: '#ccc' }}>Order ID:</Typography>
                          <Typography sx={{ color: '#fff', fontWeight: '500' }}>{order._id}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography sx={{ color: '#ccc' }}>Order Date:</Typography>
                          <Typography sx={{ color: '#fff', fontWeight: '500' }}>
                            {new Date(order.createdAt).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Box sx={{
                      background: 'rgba(20,20,20,0.8)',
                      padding: '20px',
                      borderRadius: '12px',
                      border: '1px solid rgba(212,175,55,0.2)',
                      boxShadow: "0 4px 15px rgba(0,0,0,0.2)"
                    }}>
                      <Typography variant="subtitle1" sx={{ color: '#d4af37', mb: 1, fontWeight: '600' }}>
                        Customer Information
                      </Typography>
                      <Stack spacing={1}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography sx={{ color: '#ccc' }}>Name:</Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography sx={{ color: '#fff', fontWeight: '500' }}>
                              {order.user?.name || "N/A"}
                            </Typography>
                            {order.user?.isVerified && (
                              <Chip
                                label="Verified"
                                size="small"
                                sx={{
                                  background: "linear-gradient(135deg, #4CAF50, #45a049)",
                                  color: "#fff",
                                  fontSize: "10px",
                                  height: "20px"
                                }}
                              />
                            )}
                          </Box>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography sx={{ color: '#ccc' }}>Email:</Typography>
                          <Typography sx={{ color: '#fff', fontWeight: '500' }}>
                            {order.user?.email || "N/A"}
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>
                  </Grid>
                </Grid>
              </Box>

              {/* Shipping Information */}
              {order.shippingInfo && (
                <Box mb={4}>
                  <Typography variant="h6" sx={{ color: '#d4af37', mb: 2 }}>
                    Shipping Information
                  </Typography>
                  <Box sx={{
                    background: 'rgba(20,20,20,0.8)',
                    padding: '20px',
                    borderRadius: '12px',
                    border: '1px solid rgba(212,175,55,0.2)',
                    boxShadow: "0 4px 15px rgba(0,0,0,0.2)"
                  }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography sx={{ color: '#ccc' }}>Address:</Typography>
                        <Typography sx={{ color: '#fff', fontWeight: '500' }}>
                          {order.shippingInfo.address}, {order.shippingInfo.city}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography sx={{ color: '#ccc' }}>Postal Code & Country:</Typography>
                        <Typography sx={{ color: '#fff', fontWeight: '500' }}>
                          {order.shippingInfo.postalCode}, {order.shippingInfo.country}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography sx={{ color: '#ccc' }}>Phone:</Typography>
                        <Typography sx={{ color: '#fff', fontWeight: '500' }}>
                          {order.shippingInfo.phoneNo}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                </Box>
              )}

              <Divider sx={{ my: 4, borderColor: 'rgba(212,175,55,0.3)' }} />

              {/* Products */}
              <Typography variant="h6" sx={{ color: '#d4af37', mb: 3 }}>
                Order Items ({order.orderItems.length})
              </Typography>
              <Grid container spacing={3} mb={4}>
                {order.orderItems.map((item) => (
                  <Grid item xs={12} sm={6} md={4} key={item._id || item.product}>

                    {/* Image Slider */}
                    <ImageSlider images={item.images || [item.image]} name={item.name} />

                    <CardContent>
                      <Typography variant="h6" sx={{ color: '#d4af37', mb: 1, fontSize: '1rem', fontWeight: '600' }}>
                        {item.name}
                      </Typography>
                      <Stack spacing={1}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography sx={{ color: '#ccc' }}>Quantity:</Typography>
                          <Typography sx={{ color: '#fff', fontWeight: '500' }}>
                            {item.quantity}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography sx={{ color: '#ccc' }}>Price:</Typography>
                          <Typography sx={{ color: '#fff', fontWeight: '500' }}>
                            ${item.price.toFixed(2)}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography sx={{ color: '#ccc' }}>Subtotal:</Typography>
                          <Typography sx={{ color: '#d4af37', fontWeight: 'bold' }}>
                            ${(item.price * item.quantity).toFixed(2)}
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Grid>
                ))}
              </Grid>

              <Divider sx={{ my: 4, borderColor: 'rgba(212,175,55,0.3)' }} />

              {/* Pricing Summary */}
              <Box>
                <Typography variant="h6" sx={{ color: '#d4af37', mb: 3 }}>
                  Pricing Summary
                </Typography>
                <Box sx={{
                  background: 'rgba(20,20,20,0.8)',
                  padding: '24px',
                  borderRadius: '12px',
                  border: '1px solid rgba(212,175,55,0.2)',
                  maxWidth: 400,
                  marginLeft: 'auto',
                  boxShadow: "0 4px 15px rgba(0,0,0,0.2)"
                }}>
                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography sx={{ color: '#ccc' }}>Items Total:</Typography>
                      <Typography sx={{ color: '#fff', fontWeight: '500' }}>
                        ${order.itemsPrice.toFixed(2)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography sx={{ color: '#ccc' }}>Tax:</Typography>
                      <Typography sx={{ color: '#fff', fontWeight: '500' }}>
                        ${order.taxPrice.toFixed(2)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography sx={{ color: '#ccc' }}>Shipping Fee:</Typography>
                      <Typography sx={{ color: '#fff', fontWeight: '500' }}>
                        ${order.shippingPrice.toFixed(2)}
                      </Typography>
                    </Box>
                    <Divider sx={{ borderColor: 'rgba(212,175,55,0.3)' }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="h6" sx={{ color: '#d4af37' }}>
                        Total Price:
                      </Typography>
                      <Typography variant="h6" sx={{ color: '#d4af37', fontWeight: 'bold' }}>
                        ${order.totalPrice.toFixed(2)}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </main>

      <AdminFooter />
    </div>
  );
}

// ImageSlider Component
function ImageSlider({ images, name }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [images.length]);

  const next = () => setIndex((prev) => (prev + 1) % images.length);
  const previous = () => setIndex((prev) => (prev - 1 + images.length) % images.length);

  return (
    <Box sx={{
      position: "relative",
      borderRadius: "12px",
      overflow: "hidden",
      marginBottom: 1,
      border: "1px solid rgba(212,175,55,0.3)"
    }}>
      <img
        src={images[index]}
        alt={name}
        style={{
          width: "100%",
          height: "200px",
          objectFit: "cover",
          transition: "opacity 0.6s ease-in-out",
          display: "block"
        }}
      />
      {images.length > 1 && (
        <>
          <IconButton
            onClick={previous}
            sx={{
              position: "absolute",
              top: "50%",
              left: 0,
              transform: "translateY(-50%)",
              color: "#fff",
              background: "rgba(0,0,0,0.3)",
              '&:hover': { background: "rgba(0,0,0,0.5)" }
            }}
          >
            ‹
          </IconButton>
          <IconButton
            onClick={next}
            sx={{
              position: "absolute",
              top: "50%",
              right: 0,
              transform: "translateY(-50%)",
              color: "#fff",
              background: "rgba(0,0,0,0.3)",
              '&:hover': { background: "rgba(0,0,0,0.5)" }
            }}
          >
            ›
          </IconButton>
        </>
      )}
    </Box>
  );
}
