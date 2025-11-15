import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { 
  Box, 
  TextField, 
  Button, 
  Stack, 
  Typography, 
  Container,
  IconButton,
  CircularProgress
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loader from '../../layouts/Loader';
import AdminHeader from "../../layouts/admin/AdminHeader";
import AdminFooter from "../../layouts/admin/AdminFooter";

const BASE_URL = "http://localhost:4001/api/v1";

export default function CreateSupplier() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    country: "",
    zipCode: "",
  });
  const [loading, setLoading] = useState(false);
  const [showLoader, setShowLoader] = useState(false);

  const getValidToken = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login to continue", { 
        position: "top-center",
        theme: "dark"
      });
      navigate("/login");
      return null;
    }
    return token;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setShowLoader(true);

    const token = getValidToken();
    if (!token) {
      setLoading(false);
      setShowLoader(false);
      return;
    }

    // Validate required fields
    const requiredFields = ["name","email","phone","street","city","state","country","zipCode"];
    for (let field of requiredFields) {
      if (!form[field]) {
        toast.error(`Please enter ${field}`, { 
          position: "top-center",
          theme: "dark"
        });
        setLoading(false);
        setShowLoader(false);
        return;
      }
    }

    const payload = {
      name: form.name,
      email: form.email,
      phone: form.phone,
      address: {
        street: form.street,
        city: form.city,
        state: form.state,
        country: form.country,
        zipCode: form.zipCode,
      },
    };

    try {
      await axios.post(`${BASE_URL}/admin/suppliers`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Supplier created successfully.", { 
        position: "top-center",
        theme: "dark"
      });
      setTimeout(() => navigate("/admin/suppliers"), 1000);
    } catch (err) {
      if (err.response?.status === 401) {
        handleAuthError();
      } else {
        toast.error(err?.response?.data?.message || err.message, { 
          position: "top-center",
          theme: "dark"
        });
      }
    } finally {
      setLoading(false);
      setShowLoader(false);
    }
  };

  const handleAuthError = () => {
    toast.error("Session expired. Please login again.", { 
      position: "top-center",
      theme: "dark"
    });
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setTimeout(() => navigate("/login"), 2000);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleFieldChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  if (showLoader) {
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
        <Box sx={{ 
          display: "flex", 
          justifyContent: "center", 
          alignItems: "center", 
          minHeight: "60vh",
          flex: 1,
          margin: 0,
          padding: 0
        }}>
          <Loader />
        </Box>
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
            /* Remove default body margins */
            body {
              margin: 0;
              padding: 0;
              overflow-x: hidden;
            }
          `}
        </style>
        
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

            <Box sx={{ maxWidth: "800px", margin: "0 auto", padding: "0 10px" }}>
              <Box sx={{
                display: "flex",
                alignItems: "center",
                gap: "15px",
                mb: 3
              }}>
                <IconButton
                  onClick={() => navigate("/admin/suppliers")}
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
                  Create Supplier
                </Typography>
              </Box>

              <Box sx={{
                background: "rgba(20,20,20,0.8)",
                borderRadius: "12px",
                p: 3,
                border: "1px solid rgba(212,175,55,0.2)",
                boxShadow: "0 8px 25px rgba(0,0,0,0.2)"
              }}>

                <form onSubmit={handleSubmit}>
                  <Stack spacing={3}>
                    <TextField 
                      label="Name*" 
                      fullWidth 
                      value={form.name} 
                      onChange={e => handleFieldChange('name', e.target.value)} 
                      required
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          color: "#fff",
                          "& fieldset": { borderColor: "rgba(212,175,55,0.3)" },
                          "&:hover fieldset": { borderColor: "rgba(212,175,55,0.5)" },
                          "&.Mui-focused fieldset": { borderColor: "#d4af37" }
                        },
                        "& .MuiInputLabel-root": { color: "rgba(212,175,55,0.7)" },
                        "& .MuiInputLabel-root.Mui-focused": { color: "#d4af37" }
                      }}
                    />
                    <TextField 
                      label="Email*" 
                      type="email" 
                      fullWidth 
                      value={form.email} 
                      onChange={e => handleFieldChange('email', e.target.value)} 
                      required
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          color: "#fff",
                          "& fieldset": { borderColor: "rgba(212,175,55,0.3)" },
                          "&:hover fieldset": { borderColor: "rgba(212,175,55,0.5)" },
                          "&.Mui-focused fieldset": { borderColor: "#d4af37" }
                        },
                        "& .MuiInputLabel-root": { color: "rgba(212,175,55,0.7)" },
                        "& .MuiInputLabel-root.Mui-focused": { color: "#d4af37" }
                      }}
                    />
                    <TextField 
                      label="Phone*" 
                      fullWidth 
                      value={form.phone} 
                      onChange={e => handleFieldChange('phone', e.target.value)} 
                      required
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          color: "#fff",
                          "& fieldset": { borderColor: "rgba(212,175,55,0.3)" },
                          "&:hover fieldset": { borderColor: "rgba(212,175,55,0.5)" },
                          "&.Mui-focused fieldset": { borderColor: "#d4af37" }
                        },
                        "& .MuiInputLabel-root": { color: "rgba(212,175,55,0.7)" },
                        "& .MuiInputLabel-root.Mui-focused": { color: "#d4af37" }
                      }}
                    />
                    <TextField 
                      label="Street*" 
                      fullWidth 
                      value={form.street} 
                      onChange={e => handleFieldChange('street', e.target.value)} 
                      required
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          color: "#fff",
                          "& fieldset": { borderColor: "rgba(212,175,55,0.3)" },
                          "&:hover fieldset": { borderColor: "rgba(212,175,55,0.5)" },
                          "&.Mui-focused fieldset": { borderColor: "#d4af37" }
                        },
                        "& .MuiInputLabel-root": { color: "rgba(212,175,55,0.7)" },
                        "& .MuiInputLabel-root.Mui-focused": { color: "#d4af37" }
                      }}
                    />
                    <TextField 
                      label="City*" 
                      fullWidth 
                      value={form.city} 
                      onChange={e => handleFieldChange('city', e.target.value)} 
                      required
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          color: "#fff",
                          "& fieldset": { borderColor: "rgba(212,175,55,0.3)" },
                          "&:hover fieldset": { borderColor: "rgba(212,175,55,0.5)" },
                          "&.Mui-focused fieldset": { borderColor: "#d4af37" }
                        },
                        "& .MuiInputLabel-root": { color: "rgba(212,175,55,0.7)" },
                        "& .MuiInputLabel-root.Mui-focused": { color: "#d4af37" }
                      }}
                    />
                    <TextField 
                      label="State*" 
                      fullWidth 
                      value={form.state} 
                      onChange={e => handleFieldChange('state', e.target.value)} 
                      required
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          color: "#fff",
                          "& fieldset": { borderColor: "rgba(212,175,55,0.3)" },
                          "&:hover fieldset": { borderColor: "rgba(212,175,55,0.5)" },
                          "&.Mui-focused fieldset": { borderColor: "#d4af37" }
                        },
                        "& .MuiInputLabel-root": { color: "rgba(212,175,55,0.7)" },
                        "& .MuiInputLabel-root.Mui-focused": { color: "#d4af37" }
                      }}
                    />
                    <TextField 
                      label="Country*" 
                      fullWidth 
                      value={form.country} 
                      onChange={e => handleFieldChange('country', e.target.value)} 
                      required
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          color: "#fff",
                          "& fieldset": { borderColor: "rgba(212,175,55,0.3)" },
                          "&:hover fieldset": { borderColor: "rgba(212,175,55,0.5)" },
                          "&.Mui-focused fieldset": { borderColor: "#d4af37" }
                        },
                        "& .MuiInputLabel-root": { color: "rgba(212,175,55,0.7)" },
                        "& .MuiInputLabel-root.Mui-focused": { color: "#d4af37" }
                      }}
                    />
                    <TextField 
                      label="Zip Code*" 
                      fullWidth 
                      value={form.zipCode} 
                      onChange={e => handleFieldChange('zipCode', e.target.value)} 
                      required
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          color: "#fff",
                          "& fieldset": { borderColor: "rgba(212,175,55,0.3)" },
                          "&:hover fieldset": { borderColor: "rgba(212,175,55,0.5)" },
                          "&.Mui-focused fieldset": { borderColor: "#d4af37" }
                        },
                        "& .MuiInputLabel-root": { color: "rgba(212,175,55,0.7)" },
                        "& .MuiInputLabel-root.Mui-focused": { color: "#d4af37" }
                      }}
                    />

                    <Stack direction="row" spacing={2} mt={2}>
                      <Button 
                        type="submit" 
                        variant="contained"
                        disabled={loading}
                        startIcon={loading && <CircularProgress size={16} sx={{ color: "#1a1a1a" }} />}
                        sx={{
                          background: "linear-gradient(135deg, #d4af37, #b8860b)",
                          color: "#1a1a1a",
                          fontWeight: "bold",
                          padding: "12px 30px",
                          borderRadius: "10px",
                          "&:hover": {
                            background: "linear-gradient(135deg, #e6c453, #c9970b)",
                            transform: "translateY(-2px)",
                            boxShadow: "0 8px 25px rgba(212,175,55,0.4)"
                          },
                          "&:disabled": {
                            background: "rgba(212,175,55,0.3)",
                            color: "rgba(255,255,255,0.5)"
                          },
                          transition: "all 0.3s ease"
                        }}
                      >
                        {loading ? "Creating..." : "Create Supplier"}
                      </Button>

                    </Stack>
                  </Stack>
                </form>

                <ToastContainer 
                  position="top-center" 
                  autoClose={3000} 
                  hideProgressBar
                  theme="dark"
                  toastStyle={{
                    background: "linear-gradient(135deg, #2d2d2d, #1a1a1a)",
                    color: "#d4af37",
                    border: "1px solid rgba(212,175,55,0.3)"
                  }}
                />
              </Box>
            </Box>
          </Box>
        </Box>
      </main>

      <AdminFooter />
    </div>
  );
}