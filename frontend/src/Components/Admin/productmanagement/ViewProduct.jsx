// HarmoniaHub/frontend/src/Components/admin/productmanagement/ViewProduct.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Button, 
  Box, 
  Typography, 
  Card, 
  CardMedia, 
  Chip,
  Stack,
  IconButton
} from '@mui/material';
import { ArrowBack, Edit } from '@mui/icons-material';
import Loader from '../../layouts/Loader';
import AdminHeader from "../../layouts/admin/AdminHeader";
import AdminFooter from "../../layouts/admin/AdminFooter";

const BASE_URL = 'http://localhost:4001/api/v1';

export default function ViewProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${BASE_URL}/products/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        setProduct(res.data.product);
        setCurrentImageIndex(0);
      } catch (err) {
        console.error(err);
        alert('Failed to fetch product');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, token]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const nextImage = () => {
    if (!product?.images) return;
    setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = () => {
    if (!product?.images) return;
    setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
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
        <AdminHeader admin={user} handleLogout={handleLogout} />
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '80vh', 
          flex: 1,
          margin: 0,
          padding: 0
        }}>
          <Loader />
        </div>
        <AdminFooter />
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ 
        display: "flex", 
        flexDirection: "column", 
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 50%, #2d2d2d 100%)",
        margin: 0,
        padding: 0
      }}>
        <AdminHeader admin={user} handleLogout={handleLogout} />
        <main style={{ 
          flex: 1, 
          padding: "0",
          backgroundColor: "transparent",
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: "relative",
          zIndex: 1,
          margin: 0,
          width: "100%"
        }}>
          <Typography variant="h6" sx={{ color: '#d4af37' }}>
            Product not found.
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

      <AdminHeader admin={user} handleLogout={handleLogout} />
      
      <main style={{ 
        flex: 1, 
        padding: "0",
        backgroundColor: "transparent",
        position: "relative",
        zIndex: 1,
        margin: 0,
        width: "100%"
      }}>
        <style>
          {`
            /* Remove all white backgrounds and gaps */
            * {
              background-color: transparent !important;
            }
            /* Remove body margins */
            body {
              margin: 0;
              padding: 0;
              overflow-x: hidden;
            }
            /* Ensure cards have proper backgrounds */
            .MuiCard-root {
              background: transparent !important;
            }
            /* Fix any Material-UI paper elements */
            .MuiPaper-root {
              background: transparent !important;
            }
          `}
        </style>
        
        <Box sx={{ 
          maxWidth: "100%", 
          margin: "0",
          padding: "20px 0"
        }}>
          <Box sx={{ 
            maxWidth: "1000px", 
            margin: '0 auto',
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
                  {product.name}
                </Typography>
              </Stack>
              
              <Button
                variant="contained"
                startIcon={<Edit />}
                onClick={() => navigate(`/admin/products/edit/${product._id}`)}
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
                Edit Product
              </Button>
            </Stack>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
              {/* Image Section */}
              <Box>
                {product.images?.length > 0 ? (
                  <Box sx={{ position: 'relative', borderRadius: '16px', overflow: 'hidden' }}>
                    <Card sx={{ 
                      border: '2px solid #d4af37', 
                      borderRadius: '16px',
                      background: 'transparent'
                    }}>
                      <CardMedia
                        component="img"
                        image={product.images[currentImageIndex].url}
                        alt={product.name}
                        sx={{ 
                          width: '100%', 
                          height: 400, 
                          objectFit: 'cover'
                        }}
                      />
                    </Card>
                    
                    {product.images.length > 1 && (
                      <>
                        <IconButton
                          onClick={prevImage}
                          sx={{
                            position: 'absolute',
                            left: 16,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'rgba(212,175,55,0.9)',
                            color: '#1a1a1a',
                            border: '2px solid #1a1a1a',
                            '&:hover': { 
                              background: 'rgba(212,175,55,1)',
                              transform: 'translateY(-50%) scale(1.1)'
                            },
                            transition: "all 0.3s ease"
                          }}
                        >
                          ‹
                        </IconButton>
                        <IconButton
                          onClick={nextImage}
                          sx={{
                            position: 'absolute',
                            right: 16,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'rgba(212,175,55,0.9)',
                            color: '#1a1a1a',
                            border: '2px solid #1a1a1a',
                            '&:hover': { 
                              background: 'rgba(212,175,55,1)',
                              transform: 'translateY(-50%) scale(1.1)'
                            },
                            transition: "all 0.3s ease"
                          }}
                        >
                          ›
                        </IconButton>
                        <Box sx={{
                          position: 'absolute',
                          bottom: 16,
                          right: 16,
                          background: 'rgba(0,0,0,0.8)',
                          color: '#d4af37',
                          fontSize: 14,
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontWeight: 'bold'
                        }}>
                          {currentImageIndex + 1}/{product.images.length}
                        </Box>
                      </>
                    )}
                  </Box>
                ) : (
                  <Box sx={{ 
                    width: '100%', 
                    height: 400, 
                    border: '2px dashed rgba(212,175,55,0.5)', 
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'rgba(212,175,55,0.5)',
                    fontSize: '18px',
                    background: 'rgba(20,20,20,0.5)'
                  }}>
                    No Image Available
                  </Box>
                )}
              </Box>

              {/* Product Details */}
              <Box>
                <Stack spacing={3}>
                  <Box>
                    <Typography variant="h6" sx={{ color: '#d4af37', mb: 1 }}>
                      Product Information
                    </Typography>
                    <Stack spacing={2}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography sx={{ color: '#ccc', fontWeight: '500' }}>Price:</Typography>
                        <Chip 
                          label={`₱${product.price}`} 
                          sx={{ 
                            background: 'linear-gradient(135deg, #d4af37, #b8860b)',
                            color: '#1a1a1a',
                            fontWeight: 'bold',
                            fontSize: '16px'
                          }} 
                        />
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography sx={{ color: '#ccc', fontWeight: '500' }}>Stock:</Typography>
                        <Chip 
                          label={product.stock} 
                          sx={{ 
                            background: product.stock > 10 
                              ? 'linear-gradient(135deg, #4CAF50, #45a049)'
                              : product.stock > 0 
                              ? 'linear-gradient(135deg, #FFA726, #f57c00)'
                              : 'linear-gradient(135deg, #F44336, #d32f2f)',
                            color: '#fff',
                            fontWeight: 'bold'
                          }} 
                        />
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography sx={{ color: '#ccc', fontWeight: '500' }}>Category:</Typography>
                        <Chip 
                          label={product.category} 
                          sx={{ 
                            background: 'rgba(212,175,55,0.2)',
                            color: '#d4af37',
                            border: '1px solid rgba(212,175,55,0.3)'
                          }} 
                        />
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography sx={{ color: '#ccc', fontWeight: '500' }}>Supplier:</Typography>
                        <Typography sx={{ color: '#fff', fontWeight: '500' }}>
                          {product.supplier?.name || '—'}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>

                  <Box>
                    <Typography variant="h6" sx={{ color: '#d4af37', mb: 1 }}>
                      Description
                    </Typography>
                    <Box sx={{
                      background: 'rgba(20,20,20,0.8)',
                      padding: '16px',
                      borderRadius: '12px',
                      border: '1px solid rgba(212,175,55,0.2)'
                    }}>
                      <Typography sx={{ color: '#fff', lineHeight: 1.6 }}>
                        {product.description || 'No description provided.'}
                      </Typography>
                    </Box>
                  </Box>
                </Stack>
              </Box>
            </Box>
          </Box>
        </Box>
      </main>

      <AdminFooter />
    </div>
  );
}