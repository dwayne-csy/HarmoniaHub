import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
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

const UpdateProfile = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [user, setUser] = useState({
    name: "",
    email: "",
    contact: "",
    city: "",
    barangay: "",
    street: "",
    zipcode: "",
  });

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [backendConnected, setBackendConnected] = useState(true);
  const [cartCount, setCartCount] = useState(0);

  // Validation errors state
  const [errors, setErrors] = useState({
    contact: "",
    city: "",
    barangay: "",
    street: "",
    zipcode: "",
    avatar: ""
  });

  // Password change toggle and data
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Fetch current user profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setShowLoader(true);
        const { data } = await axios.get("http://localhost:4001/api/v1/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser({
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
        toast.error("Failed to load profile", {
          position: "top-center",
          theme: "colored"
        });
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
  }, [token, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setBackendConnected(true);
    console.log("🚪 User logged out");
    navigate("/login");
  };

  // Validation functions
  const validateContact = (contact) => {
    if (!contact.trim()) return "Contact number is required";
    if (!/^\d+$/.test(contact)) return "Contact must contain only numbers";
    if (contact.length < 11 || contact.length > 12) return "Contact must be 11 to 12 digits";
    return "";
  };

  const validateCity = (city) => {
    if (!city.trim()) return "City is required";
    if (!/^[A-Z]/.test(city)) return "First letter must be capitalized";
    return "";
  };

  const validateBarangay = (barangay) => {
    if (!barangay.trim()) return "Barangay is required";
    if (!/^[A-Z]/.test(barangay)) return "First letter must be capitalized";
    return "";
  };

  const validateStreet = (street) => {
    if (!street.trim()) return "Street is required";
    if (!/^[A-Z]/.test(street)) return "First letter must be capitalized";
    return "";
  };

  const validateZipcode = (zipcode) => {
    if (!zipcode.trim()) return "Zipcode is required";
    if (!/^\d+$/.test(zipcode)) return "Zipcode must contain only numbers";
    if (zipcode.length !== 4) return "Zipcode must be exactly 4 digits";
    return "";
  };

  const validateAvatar = (avatarFile, currentAvatar) => {
    if (!avatarFile && !currentAvatar) return "Profile image is required";
    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
    
    // Validate field in real-time
    let error = "";
    switch (name) {
      case 'contact':
        error = validateContact(value);
        break;
      case 'city':
        error = validateCity(value);
        break;
      case 'barangay':
        error = validateBarangay(value);
        break;
      case 'street':
        error = validateStreet(value);
        break;
      case 'zipcode':
        error = validateZipcode(value);
        break;
      default:
        break;
    }
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handlePasswordChange = (e) =>
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    
    // Clear previous file and validation
    setAvatarFile(null);
    setErrors(prev => ({ ...prev, avatar: "" }));

    if (!file) {
      const avatarError = validateAvatar(null, avatarPreview);
      setErrors(prev => ({ ...prev, avatar: avatarError }));
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file", {
        position: "top-center",
        theme: "colored"
      });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image size should be less than 2MB", {
        position: "top-center",
        theme: "colored"
      });
      return;
    }

    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.readyState === 2) setAvatarPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Clear avatar error when file is selected
    setErrors(prev => ({ ...prev, avatar: "" }));
  };

  const validateAllFields = () => {
    const newErrors = {
      contact: validateContact(user.contact),
      city: validateCity(user.city),
      barangay: validateBarangay(user.barangay),
      street: validateStreet(user.street),
      zipcode: validateZipcode(user.zipcode),
      avatar: validateAvatar(avatarFile, avatarPreview)
    };

    setErrors(newErrors);
    return Object.values(newErrors).every(error => error === "");
  };

  // Submit profile update
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setShowLoader(true);

    if (!validateAllFields()) {
      toast.error("Please fix all validation errors before submitting.", {
        position: "top-center",
        theme: "colored"
      });
      setLoading(false);
      setShowLoader(false);
      return;
    }

    try {
      const formData = new FormData();
      Object.entries(user).forEach(([key, value]) => formData.append(key, value));
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

      toast.success("Profile updated successfully!", {
        position: "top-center",
        theme: "colored"
      });
      
      setTimeout(() => navigate("/profile"), 1500);
      
    } catch (error) {
      console.error("Update error:", error);
      toast.error(error.response?.data?.message || "Update failed", {
        position: "top-center",
        theme: "colored"
      });
    } finally {
      setLoading(false);
      setShowLoader(false);
    }
  };

  // Change password handler
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setShowLoader(true);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Passwords do not match", {
        position: "top-center",
        theme: "colored"
      });
      setLoading(false);
      setShowLoader(false);
      return;
    }

    try {
      await axios.put(
        "http://localhost:4001/api/v1/password/update",
        passwordData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Password changed successfully!", {
        position: "top-center",
        theme: "colored"
      });
      
      setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
      setShowPasswordForm(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Password update failed", {
        position: "top-center",
        theme: "colored"
      });
    } finally {
      setLoading(false);
      setShowLoader(false);
    }
  };

  const hasErrors = Object.values(errors).some(error => error !== "");

  // Show full page loader when loading profile or submitting
  if (showLoader) {
    return <Loader />;
  }

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

        <Box sx={{ maxWidth: 600, mx: "auto", p: 3 }}>
          <Paper elevation={3} sx={{ p: 4, borderRadius: 2, backgroundColor: "white" }}>
            <Typography variant="h4" component="h1" gutterBottom align="center" color="primary" sx={{ fontWeight: "bold", mb: 3 }}>
              Update Profile
            </Typography>

            {/* Avatar Preview */}
            {avatarPreview && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                <Card sx={{ width: 150, height: 150, borderRadius: '50%', overflow: 'hidden', boxShadow: 3 }}>
                  <CardMedia
                    component="img"
                    image={avatarPreview}
                    alt="Avatar Preview"
                    sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </Card>
              </Box>
            )}

            <form onSubmit={handleSubmit}>
              <Stack spacing={3}>
                <TextField
                  label="Full Name"
                  name="name"
                  value={user.name}
                  onChange={handleChange}
                  required
                  fullWidth
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    }
                  }}
                />
                
                <TextField
                  label="Email"
                  name="email"
                  value={user.email}
                  InputProps={{
                    readOnly: true,
                  }}
                  fullWidth
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: '#f9f9f9'
                    }
                  }}
                />
                
                <TextField
                  label="Contact Number *"
                  name="contact"
                  placeholder="11-12 digits"
                  value={user.contact}
                  onChange={handleChange}
                  error={!!errors.contact}
                  helperText={errors.contact}
                  inputProps={{ maxLength: 12 }}
                  fullWidth
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    }
                  }}
                />
                
                <TextField
                  label="City *"
                  name="city"
                  value={user.city}
                  onChange={handleChange}
                  error={!!errors.city}
                  helperText={errors.city}
                  fullWidth
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    }
                  }}
                />
                
                <TextField
                  label="Barangay *"
                  name="barangay"
                  value={user.barangay}
                  onChange={handleChange}
                  error={!!errors.barangay}
                  helperText={errors.barangay}
                  fullWidth
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    }
                  }}
                />
                
                <TextField
                  label="Street *"
                  name="street"
                  value={user.street}
                  onChange={handleChange}
                  error={!!errors.street}
                  helperText={errors.street}
                  fullWidth
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    }
                  }}
                />
                
                <TextField
                  label="Zipcode *"
                  name="zipcode"
                  placeholder="4 digits"
                  value={user.zipcode}
                  onChange={handleChange}
                  error={!!errors.zipcode}
                  helperText={errors.zipcode}
                  inputProps={{ maxLength: 4 }}
                  fullWidth
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    }
                  }}
                />

                <FormControl error={!!errors.avatar}>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<PhotoCamera />}
                    fullWidth
                    sx={{ 
                      py: 1.5, 
                      borderRadius: 2,
                      borderWidth: 2,
                      '&:hover': {
                        borderWidth: 2,
                        backgroundColor: '#e3f2fd'
                      }
                    }}
                  >
                    Upload Profile Picture *
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </Button>
                  {errors.avatar && (
                    <FormHelperText error sx={{ textAlign: 'center', mt: 1 }}>{errors.avatar}</FormHelperText>
                  )}
                  <FormHelperText sx={{ textAlign: 'center', mt: 1 }}>
                    Supported formats: JPG, PNG, GIF (Max 2MB)
                  </FormHelperText>
                </FormControl>

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading || hasErrors}
                  startIcon={loading && <CircularProgress size={20} />}
                  fullWidth
                  sx={{ 
                    py: 1.5, 
                    borderRadius: 2,
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    boxShadow: 2,
                    '&:hover': {
                      boxShadow: 4,
                      backgroundColor: '#1565c0'
                    }
                  }}
                >
                  {loading ? "Updating Profile..." : "Update Profile"}
                </Button>
              </Stack>
            </form>

            <Divider sx={{ my: 4 }} />

            {/* Password Change Section */}
            <Box sx={{ textAlign: 'center' }}>
              {!showPasswordForm ? (
                <Button
                  onClick={() => setShowPasswordForm(true)}
                  variant="outlined"
                  startIcon={<LockReset />}
                  size="large"
                  sx={{ 
                    borderRadius: 2,
                    px: 3,
                    borderWidth: 2,
                    '&:hover': {
                      borderWidth: 2,
                      backgroundColor: '#e3f2fd'
                    }
                  }}
                >
                  Change Password
                </Button>
              ) : (
                <Paper elevation={2} sx={{ p: 3, borderRadius: 2, border: '1px solid #e0e0e0' }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    Change Password
                  </Typography>
                  <form onSubmit={handlePasswordSubmit}>
                    <Stack spacing={2}>
                      <TextField
                        type="password"
                        name="oldPassword"
                        label="Current Password"
                        value={passwordData.oldPassword}
                        onChange={handlePasswordChange}
                        required
                        fullWidth
                        variant="outlined"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                          }
                        }}
                      />
                      <TextField
                        type="password"
                        name="newPassword"
                        label="New Password"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        required
                        fullWidth
                        variant="outlined"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                          }
                        }}
                      />
                      <TextField
                        type="password"
                        name="confirmPassword"
                        label="Confirm New Password"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        required
                        fullWidth
                        variant="outlined"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                          }
                        }}
                      />
                      <Stack direction="row" spacing={2}>
                        <Button
                          type="submit"
                          variant="contained"
                          disabled={loading}
                          startIcon={loading && <CircularProgress size={20} />}
                          fullWidth
                          sx={{ 
                            borderRadius: 2,
                            py: 1,
                            fontWeight: 'bold'
                          }}
                        >
                          {loading ? "Changing..." : "Save Password"}
                        </Button>
                        <Button
                          type="button"
                          onClick={() => setShowPasswordForm(false)}
                          variant="outlined"
                          fullWidth
                          sx={{ 
                            borderRadius: 2,
                            py: 1
                          }}
                        >
                          Cancel
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

      {/* Footer Component */}
      <Footer />
    </div>
  );
};

export default UpdateProfile;