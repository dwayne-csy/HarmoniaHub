// HarmoniaHub/frontend/src/Components/admin/usermanagement/ViewUser.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Typography,
  Button,
  Card,
  CardMedia,
  Chip,
  Stack,
  IconButton,
  Container
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import Loader from "../../layouts/Loader";
import AdminHeader from "../../layouts/admin/AdminHeader";
import AdminFooter from "../../layouts/admin/AdminFooter";

const BASE_URL = "http://localhost:4001/api/v1";

export default function ViewUser() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const currentUser = JSON.parse(localStorage.getItem("user"));

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser();
  }, [id]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const fetchUser = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data.user);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch user data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: "flex", 
        flexDirection: "column", 
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 50%, #2d2d2d 100%)"
      }}>
        <AdminHeader admin={currentUser} handleLogout={handleLogout} />
        <div style={{ 
          display: "flex", 
          justifyContent: "center", 
          alignItems: "center", 
          height: "80vh",
          flex: 1 
        }}>
          <Loader />
        </div>
        <AdminFooter />
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ 
        display: "flex", 
        flexDirection: "column", 
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 50%, #2d2d2d 100%)"
      }}>
        <AdminHeader admin={currentUser} handleLogout={handleLogout} />
        <main style={{ 
          flex: 1, 
          padding: "20px 30px",
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <Typography variant="h6" sx={{ color: '#d4af37' }}>
            User not found.
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

      <AdminHeader admin={currentUser} handleLogout={handleLogout} />
      
      <main style={{ 
        flex: 1, 
        padding: "20px 30px",
        position: "relative",
        zIndex: 1
      }}>
        <Container maxWidth="md">
          <Box sx={{ 
            maxWidth: 800, 
            margin: '24px auto',
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
                  {user.name}
                </Typography>
                {user.isVerified && (
                  <Chip
                    label="Verified"
                    sx={{
                      background: "linear-gradient(135deg, #4CAF50, #45a049)",
                      color: "#fff",
                      fontWeight: "bold"
                    }}
                  />
                )}
              </Stack>
            </Stack>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 4, alignItems: 'start' }}>
              
              {/* Avatar Section */}
              <Box>
                <Card sx={{ 
                  border: '2px solid #d4af37', 
                  borderRadius: '16px',
                  overflow: 'hidden'
                }}>
                  <CardMedia
                    component="img"
                    image={user.avatar?.url || "https://res.cloudinary.com/demo/image/upload/v1690000000/default-avatar.png"}
                    alt={user.name}
                    sx={{ 
                      width: '100%', 
                      height: 300, 
                      objectFit: 'cover'
                    }}
                  />
                </Card>
              </Box>

              {/* User Details */}
              <Box>
                <Stack spacing={3}>
                  
                  {/* Basic Information */}
                  <Box>
                    <Typography variant="h6" sx={{ color: '#d4af37', mb: 2 }}>
                      Basic Information
                    </Typography>
                    <Stack spacing={2}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography sx={{ color: '#ccc', fontWeight: '500' }}>Email:</Typography>
                        <Typography sx={{ color: '#fff', fontWeight: '500' }}>{user.email}</Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography sx={{ color: '#ccc', fontWeight: '500' }}>Contact:</Typography>
                        <Typography sx={{ color: '#fff', fontWeight: '500' }}>
                          {user.contact || '—'}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography sx={{ color: '#ccc', fontWeight: '500' }}>Role:</Typography>
                        <Chip 
                          label={user.role} 
                          sx={{ 
                            background: user.role === "admin" 
                              ? "linear-gradient(135deg, #d4af37, #b8860b)"
                              : "rgba(212,175,55,0.2)",
                            color: user.role === "admin" ? "#1a1a1a" : "#d4af37",
                            fontWeight: "bold"
                          }} 
                        />
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography sx={{ color: '#ccc', fontWeight: '500' }}>Status:</Typography>
                        <Chip 
                          label={user.isActive ? "Active" : "Inactive"} 
                          sx={{ 
                            background: user.isActive 
                              ? "linear-gradient(135deg, #4CAF50, #45a049)"
                              : "linear-gradient(135deg, #F44336, #d32f2f)",
                            color: "#fff",
                            fontWeight: "bold"
                          }} 
                        />
                      </Box>
                    </Stack>
                  </Box>

                  {/* Address Information */}
                  <Box>
                    <Typography variant="h6" sx={{ color: '#d4af37', mb: 2 }}>
                      Address Information
                    </Typography>
                    <Box sx={{
                      background: 'rgba(20,20,20,0.8)',
                      padding: '16px',
                      borderRadius: '12px',
                      border: '1px solid rgba(212,175,55,0.2)'
                    }}>
                      {user.address?.street || user.address?.barangay || user.address?.city || user.address?.zipcode ? (
                        <Stack spacing={1}>
                          {user.address?.street && (
                            <Typography sx={{ color: '#fff' }}>
                              <strong>Street:</strong> {user.address.street}
                            </Typography>
                          )}
                          {user.address?.barangay && (
                            <Typography sx={{ color: '#fff' }}>
                              <strong>Barangay:</strong> {user.address.barangay}
                            </Typography>
                          )}
                          {user.address?.city && (
                            <Typography sx={{ color: '#fff' }}>
                              <strong>City:</strong> {user.address.city}
                            </Typography>
                          )}
                          {user.address?.zipcode && (
                            <Typography sx={{ color: '#fff' }}>
                              <strong>Zipcode:</strong> {user.address.zipcode}
                            </Typography>
                          )}
                        </Stack>
                      ) : (
                        <Typography sx={{ color: '#ccc', fontStyle: 'italic' }}>
                          No address information provided
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  {/* Account Information */}
                  <Box>
                    <Typography variant="h6" sx={{ color: '#d4af37', mb: 2 }}>
                      Account Information
                    </Typography>
                    <Stack spacing={2}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography sx={{ color: '#ccc', fontWeight: '500' }}>Member Since:</Typography>
                        <Typography sx={{ color: '#fff', fontWeight: '500' }}>
                          {new Date(user.createdAt).toLocaleDateString()}
                        </Typography>
                      </Box>

                    </Stack>
                  </Box>

                </Stack>
              </Box>
            </Box>

            {/* Back Button */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>

            </Box>
          </Box>
        </Container>
      </main>

      <AdminFooter />
    </div>
  );
}