// HarmoniaHub/frontend/src/Components/admin/suppliermanagement/UpdateSupplier.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  TextField,
  Button,
  Stack,
  Typography,
  CircularProgress,
  Container,
  IconButton
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loader from '../../layouts/Loader';
import AdminHeader from "../../layouts/admin/AdminHeader";
import AdminFooter from "../../layouts/admin/AdminFooter";

const BASE_URL = "http://localhost:4001/api/v1";

export default function UpdateSupplier() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showLoader, setShowLoader] = useState(false);

  const [supplier, setSupplier] = useState({
    name: "",
    email: "",
    phone: "",
    address: { street: "", city: "", state: "", country: "", zipCode: "" },
  });

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

  useEffect(() => {
    async function fetchSupplier() {
      const token = getValidToken();
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        setShowLoader(true);
        const res = await axios.get(`${BASE_URL}/admin/suppliers/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.supplier) {
          const fetchedSupplier = {
            ...res.data.supplier,
            address: res.data.supplier.address || { street: "", city: "", state: "", country: "", zipCode: "" },
          };
          setSupplier(fetchedSupplier);
        } else {
          toast.error("Supplier not found.", { 
            position: "top-center",
            theme: "dark"
          });
        }
      } catch (err) {
        if (err.response?.status === 401) {
          handleAuthError();
        } else {
          toast.error("Failed to load supplier data.", { 
            position: "top-center",
            theme: "dark"
          });
        }
      } finally {
        setLoading(false);
        setShowLoader(false);
      }
    }

    fetchSupplier();
  }, [id]);

  const handleAuthError = () => {
    toast.error("Session expired. Please login again.", { 
      position: "top-center",
      theme: "dark"
    });
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setTimeout(() => navigate("/login"), 2000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("address.")) {
      const field = name.split(".")[1];
      setSupplier((prev) => ({
        ...prev,
        address: { ...prev.address, [field]: value },
      }));
    } else {
      setSupplier((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setShowLoader(true);

    const token = getValidToken();
    if (!token) {
      setUpdating(false);
      setShowLoader(false);
      return;
    }

    // Validate all required fields
    const requiredFields = [
      "name",
      "email",
      "phone",
      "street",
      "city",
      "state",
      "country",
      "zipCode",
    ];
    for (let field of requiredFields) {
      if (field in supplier) {
        if (!supplier[field]) {
          toast.error(`Please enter ${field}`, { 
            position: "top-center",
            theme: "dark"
          });
          setUpdating(false);
          setShowLoader(false);
          return;
        }
      } else if (field in supplier.address) {
        if (!supplier.address[field]) {
          toast.error(`Please enter ${field}`, { 
            position: "top-center",
            theme: "dark"
          });
          setUpdating(false);
          setShowLoader(false);
          return;
        }
      }
    }

    try {
      await axios.put(`${BASE_URL}/admin/suppliers/${id}`, supplier, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Supplier updated successfully.", { 
        position: "top-center",
        theme: "dark"
      });
      setTimeout(() => navigate("/admin/suppliers"), 1000);
    } catch (err) {
      if (err.response?.status === 401) {
        handleAuthError();
      } else {
        toast.error(err?.response?.data?.message || "Failed to update supplier.", { 
          position: "top-center",
          theme: "dark"
        });
      }
    } finally {
      setUpdating(false);
      setShowLoader(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (showLoader) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        minHeight: '100vh',
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

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        minHeight: '100vh',
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
                Update Supplier
              </Typography>
            </Box>

            <Box sx={{
              background: "rgba(20,20,20,0.8)",
              borderRadius: "12px",
              p: 3,
              border: "1px solid rgba(212,175,55,0.2)",
              boxShadow: "0 8px 25px rgba(0,0,0,0.2)"
            }}>

              <form onSubmit={handleUpdate}>
                <Stack spacing={3}>
                  <TextField
                    label="Name*"
                    name="name"
                    fullWidth
                    required
                    value={supplier.name || ""}
                    onChange={handleChange}
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
                    name="email"
                    type="email"
                    fullWidth
                    required
                    value={supplier.email || ""}
                    onChange={handleChange}
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
                    name="phone"
                    fullWidth
                    required
                    value={supplier.phone || ""}
                    onChange={handleChange}
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
                    name="address.street"
                    fullWidth
                    required
                    value={supplier.address?.street || ""}
                    onChange={handleChange}
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
                    name="address.city"
                    fullWidth
                    required
                    value={supplier.address?.city || ""}
                    onChange={handleChange}
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
                    name="address.state"
                    fullWidth
                    required
                    value={supplier.address?.state || ""}
                    onChange={handleChange}
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
                    name="address.country"
                    fullWidth
                    required
                    value={supplier.address?.country || ""}
                    onChange={handleChange}
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
                    name="address.zipCode"
                    fullWidth
                    required
                    value={supplier.address?.zipCode || ""}
                    onChange={handleChange}
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
                      disabled={updating}
                      startIcon={updating && <CircularProgress size={16} sx={{ color: "#1a1a1a" }} />}
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
                      {updating ? "Updating..." : "Update Supplier"}
                    </Button>
                    <Button 
                      variant="outlined" 
                      onClick={() => navigate("/admin/suppliers")}
                      sx={{
                        borderColor: "#d4af37",
                        color: "#d4af37",
                        fontWeight: "bold",
                        padding: "12px 30px",
                        borderRadius: "10px",
                        "&:hover": {
                          borderColor: "#b8860b",
                          background: "rgba(212,175,55,0.15)",
                          transform: "translateY(-2px)"
                        },
                        transition: "all 0.3s ease"
                      }}
                    >
                      Cancel
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
        </Container>
      </main>

      <AdminFooter />
    </div>
  );
}