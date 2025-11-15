// HarmoniaHub/frontend/src/Components/admin/userManagement/CreateUser.jsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Box,
  TextField,
  Button,
  Stack,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Container,
  IconButton
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { toast, ToastContainer } from "react-toastify";
import AdminHeader from "../../layouts/admin/AdminHeader";
import AdminFooter from "../../layouts/admin/AdminFooter";

const BASE_URL = "http://localhost:4001/api/v1";

const CreateUser = () => {
  const [user, setUser] = useState({ name: "", email: "", password: "", role: "user" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const currentUser = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const validateField = (name, value) => {
    switch (name) {
      case "name":
        if (!value.trim()) return "Name is required";
        if (!/^[A-Z]/.test(value)) return "First letter must be capitalized";
        return "";
      case "email":
        if (!value) return "Email is required";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Invalid email format";
        return "";
      case "password":
        if (!value) return "Password is required";
        if (value.length < 6) return "Password must be at least 6 characters";
        return "";
      default:
        return "";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields
    const newErrors = {
      name: validateField("name", user.name),
      email: validateField("email", user.email),
      password: validateField("password", user.password)
    };
    
    setErrors(newErrors);
    
    if (Object.values(newErrors).some(error => error !== "")) {
      toast.error("Please fix validation errors", { position: "top-center" });
      return;
    }

    setLoading(true);

    try {
      await axios.post(`${BASE_URL}/users`, user, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("User created successfully!", { 
        position: "top-center",
        theme: "dark"
      });
      setTimeout(() => navigate("/admin/users"), 1500);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create user", { 
        position: "top-center",
        theme: "dark"
      });
    } finally {
      setLoading(false);
    }
  };

  const hasErrors = Object.values(errors).some(error => error !== "");

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 50%, #2d2d2d 100%)",
      position: "relative",
      overflow: "hidden",
      margin: 0,
      padding: 0,
      width: "100vw"
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
        <style>
          {`
            body {
              margin: 0;
              padding: 0;
              overflow-x: hidden;
              background: linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 50%, #2d2d2d 100%);
            }
            html, body, #root {
              margin: 0;
              padding: 0;
              width: 100%;
              min-height: 100vh;
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

            <Container maxWidth="sm" sx={{ padding: "0 10px" }}>
              <Box sx={{
                display: "flex",
                alignItems: "center",
                gap: "15px",
                mb: 3
              }}>
                <IconButton
                  onClick={() => navigate("/admin/users")}
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
                  Create User
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
                      name="name"
                      fullWidth
                      value={user.name}
                      onChange={handleChange}
                      onBlur={(e) => handleChange(e)}
                      error={!!errors.name}
                      helperText={errors.name}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          color: "#fff",
                          "& fieldset": { borderColor: "rgba(212,175,55,0.3)" },
                          "&:hover fieldset": { borderColor: "rgba(212,175,55,0.5)" },
                          "&.Mui-focused fieldset": { borderColor: "#d4af37" }
                        },
                        "& .MuiInputLabel-root": { color: "rgba(212,175,55,0.7)" },
                        "& .MuiInputLabel-root.Mui-focused": { color: "#d4af37" },
                        "& .MuiFormHelperText-root": { color: "#ff6b6b" }
                      }}
                    />
                    
                    <TextField
                      label="Email*"
                      name="email"
                      type="email"
                      fullWidth
                      value={user.email}
                      onChange={handleChange}
                      onBlur={(e) => handleChange(e)}
                      error={!!errors.email}
                      helperText={errors.email}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          color: "#fff",
                          "& fieldset": { borderColor: "rgba(212,175,55,0.3)" },
                          "&:hover fieldset": { borderColor: "rgba(212,175,55,0.5)" },
                          "&.Mui-focused fieldset": { borderColor: "#d4af37" }
                        },
                        "& .MuiInputLabel-root": { color: "rgba(212,175,55,0.7)" },
                        "& .MuiInputLabel-root.Mui-focused": { color: "#d4af37" },
                        "& .MuiFormHelperText-root": { color: "#ff6b6b" }
                      }}
                    />
                    
                    <TextField
                      label="Password*"
                      name="password"
                      type="password"
                      fullWidth
                      value={user.password}
                      onChange={handleChange}
                      onBlur={(e) => handleChange(e)}
                      error={!!errors.password}
                      helperText={errors.password}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          color: "#fff",
                          "& fieldset": { borderColor: "rgba(212,175,55,0.3)" },
                          "&:hover fieldset": { borderColor: "rgba(212,175,55,0.5)" },
                          "&.Mui-focused fieldset": { borderColor: "#d4af37" }
                        },
                        "& .MuiInputLabel-root": { color: "rgba(212,175,55,0.7)" },
                        "& .MuiInputLabel-root.Mui-focused": { color: "#d4af37" },
                        "& .MuiFormHelperText-root": { color: "#ff6b6b" }
                      }}
                    />

                    <FormControl fullWidth
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          color: "#fff",
                          "& fieldset": { borderColor: "rgba(212,175,55,0.3)" },
                          "&:hover fieldset": { borderColor: "rgba(212,175,55,0.5)" },
                          "&.Mui-focused fieldset": { borderColor: "#d4af37" }
                        },
                        "& .MuiInputLabel-root": { color: "rgba(212,175,55,0.7)" },
                        "& .MuiInputLabel-root.Mui-focused": { color: "#d4af37" }
                      }}>
                      <InputLabel>Role*</InputLabel>
                      <Select
                        name="role"
                        value={user.role}
                        label="Role*"
                        onChange={handleChange}
                      >
                        <MenuItem value="user" sx={{ color: "#000000ff", background: "#2d2d2d" }}>User</MenuItem>
                        <MenuItem value="admin" sx={{ color: "#000000ff", background: "#2d2d2d" }}>Admin</MenuItem>
                      </Select>
                    </FormControl>

                    <Button
                      type="submit"
                      variant="contained"
                      disabled={loading || hasErrors}
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
                      {loading ? "Creating..." : "Create User"}
                    </Button>
                  </Stack>
                </form>

                <ToastContainer 
                  position="top-center"
                  autoClose={3000}
                  hideProgressBar={false}
                  closeOnClick
                  pauseOnHover
                  theme="dark"
                  toastStyle={{
                    background: "linear-gradient(135deg, #2d2d2d, #1a1a1a)",
                    color: "#d4af37",
                    border: "1px solid rgba(212,175,55,0.3)"
                  }}
                />
              </Box>
            </Container>
          </Box>
        </Box>
      </main>

      <AdminFooter />
    </div>
  );
};

export default CreateUser;