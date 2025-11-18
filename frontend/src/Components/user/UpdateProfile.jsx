import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  Box,
  TextField,
  Button,
  Typography,
  Card,
  CardMedia,
  Divider,
  FormControl,
  FormHelperText,
  CircularProgress,
  Stack,
  Paper
} from "@mui/material";
import { PhotoCamera, LockReset } from "@mui/icons-material";
import { toast, ToastContainer } from "react-toastify";
import Loader from "../layouts/Loader";
import Header from "../layouts/user/Header";
import Footer from "../layouts/user/Footer";

// Yup Validation Schema for Profile
const profileSchema = yup.object({
  name: yup
    .string()
    .required("Name is required")
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must not exceed 50 characters"),
  email: yup
    .string()
    .email("Invalid email format")
    .required("Email is required"),
  contact: yup
    .string()
    .required("Contact number is required")
    .matches(/^\d+$/, "Contact must contain only numbers")
    .min(11, "Contact must be at least 11 digits")
    .max(12, "Contact must be at most 12 digits"),
  city: yup
    .string()
    .required("City is required")
    .matches(/^[A-Z]/, "First letter must be capitalized")
    .min(2, "City must be at least 2 characters")
    .max(50, "City must not exceed 50 characters"),
  barangay: yup
    .string()
    .required("Barangay is required")
    .matches(/^[A-Z]/, "First letter must be capitalized")
    .min(2, "Barangay must be at least 2 characters")
    .max(50, "Barangay must not exceed 50 characters"),
  street: yup
    .string()
    .required("Street is required")
    .matches(/^[A-Z]/, "First letter must be capitalized")
    .min(2, "Street must be at least 2 characters")
    .max(100, "Street must not exceed 100 characters"),
  zipcode: yup
    .string()
    .required("Zipcode is required")
    .matches(/^\d{4}$/, "Zipcode must be exactly 4 digits"),
});

// Yup Validation Schema for Password
const passwordSchema = yup.object({
  oldPassword: yup
    .string()
    .required("Current password is required")
    .min(6, "Current password must be at least 6 characters"),
  newPassword: yup
    .string()
    .required("New password is required")
    .min(6, "New password must be at least 6 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    )
    .notOneOf([yup.ref('oldPassword')], "New password must be different from current password"),
  confirmPassword: yup
    .string()
    .required("Please confirm your password")
    .oneOf([yup.ref('newPassword')], "Passwords must match"),
});

const UpdateProfile = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // Profile Form
  const {
    control: profileControl,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors, isSubmitting: isProfileSubmitting },
    reset: resetProfile
  } = useForm({
    resolver: yupResolver(profileSchema),
    mode: "onBlur",
    defaultValues: {
      name: "",
      email: "",
      contact: "",
      city: "",
      barangay: "",
      street: "",
      zipcode: "",
    }
  });

  // Password Form
  const {
    control: passwordControl,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors, isSubmitting: isPasswordSubmitting },
    reset: resetPassword
  } = useForm({
    resolver: yupResolver(passwordSchema),
    mode: "onBlur",
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    }
  });

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [showLoader, setShowLoader] = useState(false);
  const [backendConnected, setBackendConnected] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  // Fetch current user profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setShowLoader(true);
        const { data } = await axios.get("http://localhost:4001/api/v1/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Reset form with user data
        resetProfile({
          name: data.user.name,
          email: data.user.email,
          contact: data.user.contact || "",
          city: data.user.address?.city || "",
          barangay: data.user.address?.barangay || "",
          street: data.user.address?.street || "",
          zipcode: data.user.address?.zipcode || "",
        });

        setAvatarPreview(data.user.avatar?.url || "");
        setBackendConnected(true);
      } catch (error) {
        toast.error("Failed to load profile");
        console.error(error);
        setBackendConnected(false);
      } finally {
        setShowLoader(false);
      }
    };
    
    if (token) {
      fetchProfile();
    } else {
      navigate("/login");
    }
  }, [token, navigate, resetProfile]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setBackendConnected(true);
    navigate("/login");
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setAvatarFile(null);

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image size should be less than 2MB");
      return;
    }

    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.readyState === 2) setAvatarPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Submit profile update
  const onProfileSubmit = async (data) => {
    setShowLoader(true);

    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => formData.append(key, value));
      if (avatarFile) formData.append("avatar", avatarFile);

      await axios.put(
        "http://localhost:4001/api/v1/me/update",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success("Profile updated successfully!");
      setTimeout(() => navigate("/profile"), 1500);
      
    } catch (error) {
      console.error("Update error:", error);
      toast.error(error.response?.data?.message || "Update failed");
    } finally {
      setShowLoader(false);
    }
  };

  // Change password handler
  const onPasswordSubmit = async (data) => {
    setShowLoader(true);

    try {
      await axios.put(
        "http://localhost:4001/api/v1/password/update",
        data,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Password changed successfully!");
      resetPassword();
      setShowPasswordForm(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Password update failed");
    } finally {
      setShowLoader(false);
    }
  };

  // Show full page loader when loading profile or submitting
  if (showLoader) {
    return <Loader />;
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

      {/* Header Component */}
      <Header 
        user={{ name: "User" }}
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
              50% { transform: translateY(-10px); }
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
          maxWidth: 600, 
          mx: "auto", 
          p: 3,
          padding: "0 20px"
        }}>
          <Paper elevation={3} sx={{ 
            p: 4, 
            borderRadius: "18px", 
            background: "linear-gradient(135deg, rgba(30,30,30,0.95) 0%, rgba(40,40,40,0.95) 100%)",
            border: "1px solid rgba(212,175,55,0.3)",
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

            <Typography 
              variant="h4" 
              component="h1" 
              gutterBottom 
              align="center" 
              sx={{ 
                fontWeight: "bold", 
                mb: 3,
                background: "linear-gradient(135deg, #d4af37, #f9e076, #d4af37)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundSize: "200% 100%",
                animation: "shimmer 3s infinite linear",
                textShadow: "0 2px 4px rgba(0,0,0,0.3)"
              }}
            >
              ✏️ Update Profile
            </Typography>

            {/* Avatar Preview */}
            {avatarPreview && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                <Card sx={{ 
                  width: 150, 
                  height: 150, 
                  borderRadius: '50%', 
                  overflow: 'hidden', 
                  boxShadow: "0 4px 15px rgba(212,175,55,0.4)",
                  border: "3px solid rgba(212,175,55,0.5)",
                  animation: "float 4s ease-in-out infinite"
                }}>
                  <CardMedia
                    component="img"
                    image={avatarPreview}
                    alt="Avatar Preview"
                    sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </Card>
              </Box>
            )}

            <form onSubmit={handleProfileSubmit(onProfileSubmit)}>
              <Stack spacing={3}>
                {/* Name Field */}
                <Controller
                  name="name"
                  control={profileControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Full Name"
                      required
                      fullWidth
                      variant="outlined"
                      error={!!profileErrors.name}
                      helperText={profileErrors.name?.message}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          backgroundColor: 'rgba(255,255,255,0.05)',
                          color: '#ffffff',
                          '& fieldset': { borderColor: 'rgba(212,175,55,0.3)' },
                          '&:hover fieldset': { borderColor: 'rgba(212,175,55,0.5)' },
                          '&.Mui-focused fieldset': { borderColor: '#d4af37' },
                        },
                        '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                        '& .MuiInputLabel-root.Mui-focused': { color: '#d4af37' },
                        '& .MuiOutlinedInput-input': { color: '#ffffff' },
                        '& .MuiFormHelperText-root': { color: '#ff6b6b' }
                      }}
                    />
                  )}
                />
                
                {/* Email Field */}
                <Controller
                  name="email"
                  control={profileControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Email"
                      InputProps={{ readOnly: true }}
                      fullWidth
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          backgroundColor: 'rgba(255,255,255,0.03)',
                          color: 'rgba(255,255,255,0.5)',
                          '& fieldset': { borderColor: 'rgba(212,175,55,0.2)' },
                        },
                        '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.5)' },
                        '& .MuiOutlinedInput-input': { color: 'rgba(255,255,255,0.5)' }
                      }}
                    />
                  )}
                />
                
                {/* Contact Field */}
                <Controller
                  name="contact"
                  control={profileControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Contact Number *"
                      placeholder="11-12 digits"
                      inputProps={{ maxLength: 12 }}
                      fullWidth
                      variant="outlined"
                      error={!!profileErrors.contact}
                      helperText={profileErrors.contact?.message}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          backgroundColor: 'rgba(255,255,255,0.05)',
                          color: '#ffffff',
                          '& fieldset': { borderColor: 'rgba(212,175,55,0.3)' },
                          '&:hover fieldset': { borderColor: 'rgba(212,175,55,0.5)' },
                          '&.Mui-focused fieldset': { borderColor: '#d4af37' },
                          '&.Mui-error fieldset': { borderColor: '#ff6b6b' }
                        },
                        '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                        '& .MuiInputLabel-root.Mui-focused': { color: '#d4af37' },
                        '& .MuiOutlinedInput-input': { color: '#ffffff' },
                        '& .MuiFormHelperText-root': { color: '#ff6b6b' }
                      }}
                    />
                  )}
                />
                
                {/* City Field */}
                <Controller
                  name="city"
                  control={profileControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="City *"
                      fullWidth
                      variant="outlined"
                      error={!!profileErrors.city}
                      helperText={profileErrors.city?.message}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          backgroundColor: 'rgba(255,255,255,0.05)',
                          color: '#ffffff',
                          '& fieldset': { borderColor: 'rgba(212,175,55,0.3)' },
                          '&:hover fieldset': { borderColor: 'rgba(212,175,55,0.5)' },
                          '&.Mui-focused fieldset': { borderColor: '#d4af37' },
                          '&.Mui-error fieldset': { borderColor: '#ff6b6b' }
                        },
                        '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                        '& .MuiInputLabel-root.Mui-focused': { color: '#d4af37' },
                        '& .MuiOutlinedInput-input': { color: '#ffffff' },
                        '& .MuiFormHelperText-root': { color: '#ff6b6b' }
                      }}
                    />
                  )}
                />
                
                {/* Barangay Field */}
                <Controller
                  name="barangay"
                  control={profileControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Barangay *"
                      fullWidth
                      variant="outlined"
                      error={!!profileErrors.barangay}
                      helperText={profileErrors.barangay?.message}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          backgroundColor: 'rgba(255,255,255,0.05)',
                          color: '#ffffff',
                          '& fieldset': { borderColor: 'rgba(212,175,55,0.3)' },
                          '&:hover fieldset': { borderColor: 'rgba(212,175,55,0.5)' },
                          '&.Mui-focused fieldset': { borderColor: '#d4af37' },
                          '&.Mui-error fieldset': { borderColor: '#ff6b6b' }
                        },
                        '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                        '& .MuiInputLabel-root.Mui-focused': { color: '#d4af37' },
                        '& .MuiOutlinedInput-input': { color: '#ffffff' },
                        '& .MuiFormHelperText-root': { color: '#ff6b6b' }
                      }}
                    />
                  )}
                />
                
                {/* Street Field */}
                <Controller
                  name="street"
                  control={profileControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Street *"
                      fullWidth
                      variant="outlined"
                      error={!!profileErrors.street}
                      helperText={profileErrors.street?.message}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          backgroundColor: 'rgba(255,255,255,0.05)',
                          color: '#ffffff',
                          '& fieldset': { borderColor: 'rgba(212,175,55,0.3)' },
                          '&:hover fieldset': { borderColor: 'rgba(212,175,55,0.5)' },
                          '&.Mui-focused fieldset': { borderColor: '#d4af37' },
                          '&.Mui-error fieldset': { borderColor: '#ff6b6b' }
                        },
                        '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                        '& .MuiInputLabel-root.Mui-focused': { color: '#d4af37' },
                        '& .MuiOutlinedInput-input': { color: '#ffffff' },
                        '& .MuiFormHelperText-root': { color: '#ff6b6b' }
                      }}
                    />
                  )}
                />
                
                {/* Zipcode Field */}
                <Controller
                  name="zipcode"
                  control={profileControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Zipcode *"
                      placeholder="4 digits"
                      inputProps={{ maxLength: 4 }}
                      fullWidth
                      variant="outlined"
                      error={!!profileErrors.zipcode}
                      helperText={profileErrors.zipcode?.message}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          backgroundColor: 'rgba(255,255,255,0.05)',
                          color: '#ffffff',
                          '& fieldset': { borderColor: 'rgba(212,175,55,0.3)' },
                          '&:hover fieldset': { borderColor: 'rgba(212,175,55,0.5)' },
                          '&.Mui-focused fieldset': { borderColor: '#d4af37' },
                          '&.Mui-error fieldset': { borderColor: '#ff6b6b' }
                        },
                        '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                        '& .MuiInputLabel-root.Mui-focused': { color: '#d4af37' },
                        '& .MuiOutlinedInput-input': { color: '#ffffff' },
                        '& .MuiFormHelperText-root': { color: '#ff6b6b' }
                      }}
                    />
                  )}
                />

                <FormControl>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<PhotoCamera />}
                    fullWidth
                    sx={{ 
                      py: 1.5, 
                      borderRadius: 2,
                      border: "2px solid rgba(212,175,55,0.4)",
                      color: "#d4af37",
                      backgroundColor: "rgba(212,175,55,0.1)",
                      fontWeight: "600",
                      fontSize: "1rem",
                      transition: "all 0.3s ease",
                      '&:hover': {
                        border: "2px solid rgba(212,175,55,0.6)",
                        backgroundColor: "rgba(212,175,55,0.2)",
                        transform: "translateY(-2px)",
                        boxShadow: "0 6px 20px rgba(212,175,55,0.3)",
                      }
                    }}
                  >
                    📷 Upload Profile Picture *
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </Button>
                  <FormHelperText sx={{ textAlign: 'center', mt: 1, color: 'rgba(255,255,255,0.5)' }}>
                    Supported formats: JPG, PNG, GIF (Max 2MB)
                  </FormHelperText>
                </FormControl>

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={isProfileSubmitting}
                  startIcon={isProfileSubmitting && <CircularProgress size={20} sx={{ color: '#1a1a1a' }} />}
                  fullWidth
                  sx={{ 
                    py: 1.5, 
                    borderRadius: "12px",
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    background: "linear-gradient(135deg, #d4af37 0%, #f9e076 100%)",
                    color: "#1a1a1a",
                    boxShadow: "0 6px 20px rgba(212,175,55,0.4)",
                    transition: "all 0.3s ease",
                    '&:hover': {
                      boxShadow: "0 10px 25px rgba(212,175,55,0.6)",
                      transform: "translateY(-2px)",
                      background: "linear-gradient(135deg, #d4af37 0%, #f9e076 100%)",
                    },
                    '&:disabled': {
                      background: "rgba(255,255,255,0.1)",
                      color: "rgba(255,255,255,0.3)",
                      boxShadow: "none",
                      transform: "none",
                    }
                  }}
                >
                  {isProfileSubmitting ? "🔄 Updating Profile..." : "💾 Update Profile"}
                </Button>
              </Stack>
            </form>

            <Divider sx={{ my: 4, backgroundColor: 'rgba(212,175,55,0.3)' }} />

            {/* Password Change Section */}
            <Box sx={{ textAlign: 'center' }}>
              {!showPasswordForm ? (
                <Button
                  onClick={() => setShowPasswordForm(true)}
                  variant="outlined"
                  startIcon={<LockReset />}
                  size="large"
                  sx={{ 
                    borderRadius: "12px",
                    px: 3,
                    border: "2px solid rgba(212,175,55,0.4)",
                    color: "#d4af37",
                    backgroundColor: "rgba(212,175,55,0.1)",
                    fontWeight: "600",
                    transition: "all 0.3s ease",
                    '&:hover': {
                      border: "2px solid rgba(212,175,55,0.6)",
                      backgroundColor: "rgba(212,175,55,0.2)",
                      transform: "translateY(-2px)",
                      boxShadow: "0 6px 20px rgba(212,175,55,0.3)",
                    }
                  }}
                >
                  🔒 Change Password
                </Button>
              ) : (
                <Paper elevation={2} sx={{ 
                  p: 3, 
                  borderRadius: "12px", 
                  border: '1px solid rgba(212,175,55,0.3)',
                  background: "rgba(20,20,20,0.6)",
                  backdropFilter: "blur(10px)",
                  color: "#ffffff"
                }}>
                  <Typography variant="h6" gutterBottom sx={{ 
                    fontWeight: 'bold', 
                    color: '#d4af37',
                    textAlign: 'center'
                  }}>
                    🔒 Change Password
                  </Typography>
                  <form onSubmit={handlePasswordSubmit(onPasswordSubmit)}>
                    <Stack spacing={2}>
                      {/* Current Password */}
                      <Controller
                        name="oldPassword"
                        control={passwordControl}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            type="password"
                            label="Current Password"
                            required
                            fullWidth
                            variant="outlined"
                            error={!!passwordErrors.oldPassword}
                            helperText={passwordErrors.oldPassword?.message}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                backgroundColor: 'rgba(255,255,255,0.05)',
                                color: '#ffffff',
                                '& fieldset': { borderColor: 'rgba(212,175,55,0.3)' },
                                '&:hover fieldset': { borderColor: 'rgba(212,175,55,0.5)' },
                                '&.Mui-focused fieldset': { borderColor: '#d4af37' },
                              },
                              '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                              '& .MuiInputLabel-root.Mui-focused': { color: '#d4af37' },
                              '& .MuiOutlinedInput-input': { color: '#ffffff' },
                              '& .MuiFormHelperText-root': { color: '#ff6b6b' }
                            }}
                          />
                        )}
                      />

                      {/* New Password */}
                      <Controller
                        name="newPassword"
                        control={passwordControl}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            type="password"
                            label="New Password"
                            required
                            fullWidth
                            variant="outlined"
                            error={!!passwordErrors.newPassword}
                            helperText={passwordErrors.newPassword?.message}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                backgroundColor: 'rgba(255,255,255,0.05)',
                                color: '#ffffff',
                                '& fieldset': { borderColor: 'rgba(212,175,55,0.3)' },
                                '&:hover fieldset': { borderColor: 'rgba(212,175,55,0.5)' },
                                '&.Mui-focused fieldset': { borderColor: '#d4af37' },
                              },
                              '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                              '& .MuiInputLabel-root.Mui-focused': { color: '#d4af37' },
                              '& .MuiOutlinedInput-input': { color: '#ffffff' },
                              '& .MuiFormHelperText-root': { color: '#ff6b6b' }
                            }}
                          />
                        )}
                      />

                      {/* Confirm Password */}
                      <Controller
                        name="confirmPassword"
                        control={passwordControl}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            type="password"
                            label="Confirm New Password"
                            required
                            fullWidth
                            variant="outlined"
                            error={!!passwordErrors.confirmPassword}
                            helperText={passwordErrors.confirmPassword?.message}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                backgroundColor: 'rgba(255,255,255,0.05)',
                                color: '#ffffff',
                                '& fieldset': { borderColor: 'rgba(212,175,55,0.3)' },
                                '&:hover fieldset': { borderColor: 'rgba(212,175,55,0.5)' },
                                '&.Mui-focused fieldset': { borderColor: '#d4af37' },
                              },
                              '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                              '& .MuiInputLabel-root.Mui-focused': { color: '#d4af37' },
                              '& .MuiOutlinedInput-input': { color: '#ffffff' },
                              '& .MuiFormHelperText-root': { color: '#ff6b6b' }
                            }}
                          />
                        )}
                      />

                      <Stack direction="row" spacing={2}>
                        <Button
                          type="submit"
                          variant="contained"
                          disabled={isPasswordSubmitting}
                          startIcon={isPasswordSubmitting && <CircularProgress size={20} sx={{ color: '#1a1a1a' }} />}
                          fullWidth
                          sx={{ 
                            borderRadius: "10px",
                            py: 1,
                            fontWeight: 'bold',
                            background: "linear-gradient(135deg, #d4af37 0%, #f9e076 100%)",
                            color: "#1a1a1a",
                            boxShadow: "0 4px 15px rgba(212,175,55,0.3)",
                            transition: "all 0.3s ease",
                            '&:hover': {
                              boxShadow: "0 6px 20px rgba(212,175,55,0.5)",
                              transform: "translateY(-2px)",
                              background: "linear-gradient(135deg, #d4af37 0%, #f9e076 100%)",
                            }
                          }}
                        >
                          {isPasswordSubmitting ? "🔄 Changing..." : "💾 Save Password"}
                        </Button>
                        <Button
                          type="button"
                          onClick={() => {
                            setShowPasswordForm(false);
                            resetPassword();
                          }}
                          variant="outlined"
                          fullWidth
                          sx={{ 
                            borderRadius: "10px",
                            py: 1,
                            border: "2px solid rgba(212,175,55,0.4)",
                            color: "#d4af37",
                            backgroundColor: "rgba(212,175,55,0.1)",
                            transition: "all 0.3s ease",
                            '&:hover': {
                              border: "2px solid rgba(212,175,55,0.6)",
                              backgroundColor: "rgba(212,175,55,0.2)",
                              transform: "translateY(-2px)",
                              boxShadow: "0 4px 15px rgba(212,175,55,0.3)",
                            }
                          }}
                        >
                          ❌ Cancel
                        </Button>
                      </Stack>
                    </Stack>
                  </form>
                </Paper>
              )}
            </Box>
          </Paper>

          {/* Toast Container */}
          <ToastContainer 
            position="top-center"
            autoClose={3000}
            hideProgressBar={false}
            closeOnClick
            pauseOnHover
            theme="colored"
          />
        </Box>
      </main>

      <Footer />
    </div>
  );
};

export default UpdateProfile;