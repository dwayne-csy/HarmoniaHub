// HarmoniaHub/frontend/src/Components/admin/suppliermanagement/ViewSupplier.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  Button, 
  Box, 
  Typography, 
  Card, 
  CardContent,
  Stack,
  IconButton,
  Chip
} from "@mui/material";
import { ArrowBack, Edit, LocationOn, Phone, Email, Business } from "@mui/icons-material";
import Loader from "../../layouts/Loader";
import AdminHeader from "../../layouts/admin/AdminHeader";
import AdminFooter from "../../layouts/admin/AdminFooter";

const BASE_URL = "http://localhost:4001/api/v1";

export default function ViewSupplier() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [supplier, setSupplier] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchSupplier = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${BASE_URL}/suppliers/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        setSupplier(res.data.supplier || null);
      } catch (err) {
        console.error(err);
        alert('Failed to fetch supplier details');
      } finally {
        setLoading(false);
      }
    };

    fetchSupplier();
  }, [id, token]);

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
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '80vh', 
          flex: 1 
        }}>
          <Loader />
        </div>
        <AdminFooter />
      </div>
    );
  }

  if (!supplier) {
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
            Supplier not found.
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
                {supplier.name}
              </Typography>
            </Stack>
            
            <Button
              variant="contained"
              startIcon={<Edit />}
              onClick={() => navigate(`/admin/suppliers/edit/${supplier._id}`)}
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
              Edit Supplier
            </Button>
          </Stack>

          <Stack spacing={4}>
            {/* Supplier Information Card */}
            <Card sx={{
              background: "rgba(20,20,20,0.8)",
              border: "1px solid rgba(212,175,55,0.2)",
              borderRadius: "12px",
              overflow: "hidden"
            }}>
              <CardContent>
                <Typography variant="h6" sx={{ color: '#d4af37', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Business /> Supplier Information
                </Typography>
                
                <Stack spacing={3}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography sx={{ color: '#ccc', fontWeight: '500', display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Business /> Company Name:
                    </Typography>
                    <Typography sx={{ color: '#fff', fontWeight: '500' }}>
                      {supplier.name}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography sx={{ color: '#ccc', fontWeight: '500', display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Email /> Email:
                    </Typography>
                    <Typography sx={{ color: '#fff', fontWeight: '500' }}>
                      {supplier.email}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography sx={{ color: '#ccc', fontWeight: '500', display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Phone /> Phone:
                    </Typography>
                    <Typography sx={{ color: '#fff', fontWeight: '500' }}>
                      {supplier.phone}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography sx={{ color: '#ccc', fontWeight: '500' }}>
                      Status:
                    </Typography>
                    <Chip 
                      label={supplier.isActive ? 'Active' : 'Inactive'} 
                      sx={{ 
                        background: supplier.isActive 
                          ? 'linear-gradient(135deg, #4CAF50, #45a049)'
                          : 'linear-gradient(135deg, #F44336, #d32f2f)',
                        color: '#fff',
                        fontWeight: 'bold'
                      }} 
                    />
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            {/* Address Information Card */}
            <Card sx={{
              background: "rgba(20,20,20,0.8)",
              border: "1px solid rgba(212,175,55,0.2)",
              borderRadius: "12px",
              overflow: "hidden"
            }}>
              <CardContent>
                <Typography variant="h6" sx={{ color: '#d4af37', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationOn /> Address Information
                </Typography>
                
                <Stack spacing={3}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography sx={{ color: '#ccc', fontWeight: '500' }}>
                      Street:
                    </Typography>
                    <Typography sx={{ color: '#fff', fontWeight: '500' }}>
                      {supplier.address?.street || '—'}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography sx={{ color: '#ccc', fontWeight: '500' }}>
                      City:
                    </Typography>
                    <Chip 
                      label={supplier.address?.city || '—'} 
                      sx={{ 
                        background: 'rgba(212,175,55,0.2)',
                        color: '#d4af37',
                        border: '1px solid rgba(212,175,55,0.3)'
                      }} 
                    />
                  </Box>
                  
                  {supplier.address?.state && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography sx={{ color: '#ccc', fontWeight: '500' }}>
                        State:
                      </Typography>
                      <Typography sx={{ color: '#fff', fontWeight: '500' }}>
                        {supplier.address.state}
                      </Typography>
                    </Box>
                  )}
                  
                  {supplier.address?.postalCode && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography sx={{ color: '#ccc', fontWeight: '500' }}>
                        Postal Code:
                      </Typography>
                      <Typography sx={{ color: '#fff', fontWeight: '500' }}>
                        {supplier.address.postalCode}
                      </Typography>
                    </Box>
                  )}
                  
                  {supplier.address?.country && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography sx={{ color: '#ccc', fontWeight: '500' }}>
                        Country:
                      </Typography>
                      <Typography sx={{ color: '#fff', fontWeight: '500' }}>
                        {supplier.address.country}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Box>
      </main>

      <AdminFooter />
    </div>
  );
}