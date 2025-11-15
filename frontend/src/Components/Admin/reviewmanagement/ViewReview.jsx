import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Button, 
  Box, 
  Rating, 
  Typography, 
  Card, 
  CardContent,
  Stack,
  IconButton,
  Container,
  Chip
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import Loader from '../../layouts/Loader';
import AdminHeader from '../../layouts/admin/AdminHeader';
import AdminFooter from '../../layouts/admin/AdminFooter';

const BASE_URL = 'http://localhost:4001/api/v1';

export default function ViewReview() {
  const { reviewId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReview = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${BASE_URL}/admin/reviews/${reviewId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setReview(res.data.review);
      } catch (err) {
        console.error("Error fetching review:", err);
      } finally {
        setLoading(false);
      }
    };
    
    if (reviewId) {
      fetchReview();
    }
  }, [reviewId, token]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (loading) {
    return (
      <div style={{ 
        display: "flex", 
        flexDirection: "column", 
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 50%, #2d2d2d 100%)"
      }}>
        <AdminHeader admin={user} handleLogout={handleLogout} />
        <Box sx={{ 
          display: "flex", 
          justifyContent: "center", 
          alignItems: "center", 
          minHeight: "60vh",
          flex: 1 
        }}>
          <Loader />
        </Box>
        <AdminFooter />
      </div>
    );
  }

  if (!review) {
    return (
      <div style={{ 
        display: "flex", 
        flexDirection: "column", 
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 50%, #2d2d2d 100%)"
      }}>
        <AdminHeader admin={user} handleLogout={handleLogout} />
        <main style={{ 
          flex: 1, 
          padding: "20px 30px",
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <Typography variant="h6" sx={{ color: '#d4af37' }}>
            Review not found.
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

      <AdminHeader admin={user} handleLogout={handleLogout} />
      
      <main style={{ 
        flex: 1, 
        padding: "20px 30px",
        position: "relative",
        zIndex: 1
      }}>
        <Container maxWidth="md">
          <Box sx={{
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
                      background: "rgba(212,175,55,0.2)"
                    }
                  }}
                >
                  <ArrowBack />
                </IconButton>
                <Typography variant="h4" sx={{ 
                  fontWeight: "bold", 
                  color: "#d4af37",
                  textShadow: "0 2px 4px rgba(0,0,0,0.5)"
                }}>
                  Review Details
                </Typography>
              </Stack>
              
              <Chip 
                label={review.isActive ? 'ACTIVE' : 'DELETED'} 
                sx={{ 
                  background: review.isActive 
                    ? 'linear-gradient(135deg, #4CAF50, #45a049)'
                    : 'linear-gradient(135deg, #F44336, #d32f2f)',
                  color: "#fff",
                  fontWeight: "bold",
                  fontSize: "12px"
                }} 
              />
            </Stack>

            <Box sx={{
              background: "rgba(20,20,20,0.8)",
              borderRadius: "12px",
              p: 3,
              border: "1px solid rgba(212,175,55,0.2)",
              boxShadow: "0 8px 25px rgba(0,0,0,0.2)"
            }}>
              
              <Stack spacing={3}>
                {/* Product Information */}
                <Card sx={{
                  background: "rgba(40,40,40,0.6)",
                  border: "1px solid rgba(212,175,55,0.2)",
                  borderRadius: "12px"
                }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ color: '#d4af37', mb: 2 }}>
                      Product Information
                    </Typography>
                    <Stack spacing={2}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography sx={{ color: '#ccc', fontWeight: '500' }}>Product:</Typography>
                        <Typography sx={{ color: '#fff', fontWeight: '500' }}>
                          {review.productName || 'N/A'}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>

                {/* User Information */}
                <Card sx={{
                  background: "rgba(40,40,40,0.6)",
                  border: "1px solid rgba(212,175,55,0.2)",
                  borderRadius: "12px"
                }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ color: '#d4af37', mb: 2 }}>
                      User Information
                    </Typography>
                    <Stack spacing={2}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography sx={{ color: '#ccc', fontWeight: '500' }}>User:</Typography>
                        <Typography sx={{ color: '#fff', fontWeight: '500' }}>
                          {review.user || 'Anonymous'}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography sx={{ color: '#ccc', fontWeight: '500' }}>Email:</Typography>
                        <Typography sx={{ color: '#fff', fontWeight: '500' }}>
                          {review.userEmail || 'N/A'}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>

                {/* Rating */}
                <Card sx={{
                  background: "rgba(40,40,40,0.6)",
                  border: "1px solid rgba(212,175,55,0.2)",
                  borderRadius: "12px"
                }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ color: '#d4af37', mb: 2 }}>
                      Rating
                    </Typography>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Rating value={review.rating} readOnly size="large" />
                      <Chip 
                        label={`${review.rating}/5`} 
                        sx={{ 
                          background: "linear-gradient(135deg, #d4af37, #b8860b)",
                          color: "#1a1a1a",
                          fontWeight: "bold",
                          fontSize: "16px"
                        }} 
                      />
                    </Box>
                  </CardContent>
                </Card>

                {/* Comment */}
                <Card sx={{
                  background: "rgba(40,40,40,0.6)",
                  border: "1px solid rgba(212,175,55,0.2)",
                  borderRadius: "12px"
                }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ color: '#d4af37', mb: 2 }}>
                      Comment
                    </Typography>
                    <Box sx={{
                      background: 'rgba(20,20,20,0.8)',
                      padding: '16px',
                      borderRadius: '8px',
                      border: '1px solid rgba(212,175,55,0.1)'
                    }}>
                      <Typography sx={{ color: '#fff', lineHeight: 1.6 }}>
                        {review.comment || 'No comment provided.'}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>

                {/* Timeline */}
                <Card sx={{
                  background: "rgba(40,40,40,0.6)",
                  border: "1px solid rgba(212,175,55,0.2)",
                  borderRadius: "12px"
                }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ color: '#d4af37', mb: 2 }}>
                      Timeline
                    </Typography>
                    <Stack spacing={2}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography sx={{ color: '#ccc', fontWeight: '500' }}>Created:</Typography>
                        <Typography sx={{ color: '#fff', fontWeight: '500' }}>
                          {new Date(review.createdAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                      {review.updatedAt && review.updatedAt !== review.createdAt && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography sx={{ color: '#ccc', fontWeight: '500' }}>Last Updated:</Typography>
                          <Typography sx={{ color: '#fff', fontWeight: '500' }}>
                            {new Date(review.updatedAt).toLocaleDateString()}
                          </Typography>
                        </Box>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              </Stack>
            </Box>
          </Box>
        </Container>
      </main>

      <AdminFooter />
    </div>
  );
}