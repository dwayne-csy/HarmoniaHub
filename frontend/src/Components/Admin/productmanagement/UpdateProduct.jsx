// HarmoniaHub/frontend/src/Components/admin/productmanagement/UpdateProduct.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import {
  TextField,
  Button,
  MenuItem,
  Typography,
  Box,
  Select,
  InputLabel,
  FormControl,
  CircularProgress,
  Grid,
  IconButton,
  Card,
  CardMedia,
  Stack,
  FormHelperText,
  Container
} from "@mui/material";
import { Close as CloseIcon, ArrowBack } from "@mui/icons-material";
import { toast, ToastContainer } from "react-toastify";
import Loader from '../../layouts/Loader';
import AdminHeader from "../../layouts/admin/AdminHeader";
import AdminFooter from "../../layouts/admin/AdminFooter";

const BASE_URL = "http://localhost:4001/api/v1";

const categories = [
  "Idiophones",
  "Membranophones",
  "Chordophones",
  "Aerophones",
  "Electrophones",
  "Keyboard Instruments",
];

export default function UpdateProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
    category: categories[0],
    supplier: "",
    stock: 0,
  });
  const [suppliers, setSuppliers] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [newPreviews, setNewPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (id) {
      fetchProduct();
      fetchSuppliers();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      setShowLoader(true);
      const res = await axios.get(`${BASE_URL}/products/${id}`);
      const product = res.data.product;
      setForm({
        name: product.name || "",
        price: product.price || "",
        description: product.description || "",
        category: product.category || categories[0],
        supplier: product.supplier?._id || "",
        stock: product.stock || 0,
      });
      setExistingImages(product.images || []);
    } catch (err) {
      toast.error("Failed to load product", { 
        position: "top-center",
        theme: "dark"
      });
    } finally {
      setShowLoader(false);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/suppliers/dropdown`);
      setSuppliers(res.data.suppliers || []);
    } catch (err) {
      toast.error("Failed to fetch suppliers", { 
        position: "top-center",
        theme: "dark"
      });
    }
  };

  const validateName = (name) => {
    if (!name.trim()) return "Name is required";
    if (!/^[A-Z]/.test(name)) return "First letter must be capitalized";
    if (/\d/.test(name)) return "Name should not contain numbers";
    return "";
  };

  const validatePrice = (price) => {
    if (!price) return "Price is required";
    if (isNaN(price) || parseFloat(price) <= 0) return "Price must be a positive number";
    return "";
  };

  const validateDescription = (description) => {
    if (!description.trim()) return "Description is required";
    if (description.length < 50) return "Description must be at least 50 characters";
    return "";
  };

  const validateSupplier = (supplier) => {
    if (!supplier) return "Supplier is required";
    return "";
  };

  const validateStock = (stock) => {
    if (!stock && stock !== 0) return "Stock is required";
    if (isNaN(stock) || parseInt(stock, 10) < 0) return "Stock must be a non-negative number";
    return "";
  };

  const validateImages = (existing, newFiles) => {
    const totalImages = existing.length + newFiles.length;
    if (totalImages < 2) return "At least 2 images are required in total";
    return "";
  };

  const handleFieldChange = (fieldName, value) => {
    setForm(prev => ({ ...prev, [fieldName]: value }));
    
    let error = "";
    switch (fieldName) {
      case 'name': error = validateName(value); break;
      case 'price': error = validatePrice(value); break;
      case 'description': error = validateDescription(value); break;
      case 'supplier': error = validateSupplier(value); break;
      case 'stock': error = validateStock(value); break;
      default: break;
    }
    setErrors(prev => ({ ...prev, [fieldName]: error }));
  };

  const removeExistingImage = (index) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
    const imagesError = validateImages(
      existingImages.filter((_, i) => i !== index), 
      newFiles
    );
    setErrors(prev => ({ ...prev, images: imagesError }));
  };

  const handleNewFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const totalSize = files.reduce((t, f) => t + f.size, 0);
    if (totalSize > 10 * 1024 * 1024) {
      toast.error("Total images size should be less than 10MB", { 
        position: "top-center",
        theme: "dark"
      });
      return;
    }

    const validFiles = files.filter(file => {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select only image files", { position: "top-center", theme: "dark" });
        return false;
      }
      if (file.size > 2 * 1024 * 1024) {
        toast.error(`Image ${file.name} should be less than 2MB`, { position: "top-center", theme: "dark" });
        return false;
      }
      return true;
    });

    const previews = validFiles.map(file => {
      const reader = new FileReader();
      return new Promise(resolve => {
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(previews).then(results => {
      setNewPreviews(prev => [...prev, ...results]);
    });

    const updatedNewFiles = [...newFiles, ...validFiles];
    setNewFiles(updatedNewFiles);
    const imagesError = validateImages(existingImages, updatedNewFiles);
    setErrors(prev => ({ ...prev, images: imagesError }));
  };

  const removeNewFile = (index) => {
    setNewFiles(prev => prev.filter((_, i) => i !== index));
    setNewPreviews(prev => prev.filter((_, i) => i !== index));
    const imagesError = validateImages(existingImages, newFiles.filter((_, i) => i !== index));
    setErrors(prev => ({ ...prev, images: imagesError }));
  };

  const validateAllFields = () => {
    const newErrors = {
      name: validateName(form.name),
      price: validatePrice(form.price),
      description: validateDescription(form.description),
      supplier: validateSupplier(form.supplier),
      stock: validateStock(form.stock),
      images: validateImages(existingImages, newFiles)
    };

    setErrors(newErrors);
    return Object.values(newErrors).every(error => error === "");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateAllFields()) {
      toast.error("Please fix all validation errors before submitting.", { 
        position: "top-center",
        theme: "dark"
      });
      return;
    }

    try {
      setLoading(true);
      setShowLoader(true);

      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("price", parseFloat(form.price));
      formData.append("description", form.description);
      formData.append("category", form.category);
      formData.append("supplier", form.supplier);
      formData.append("stock", parseInt(form.stock, 10));
      formData.append("existingImages", JSON.stringify(existingImages));
      newFiles.forEach((file) => formData.append("images", file));

      await axios.put(`${BASE_URL}/admin/products/${id}`, formData, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      toast.success("Product updated successfully!", { 
        position: "top-center",
        theme: "dark"
      });
      
      setTimeout(() => navigate("/admin/products"), 1500);
      
    } catch (err) {
      const errorMessage = err?.response?.data?.message || err.message;
      toast.error(`Update failed: ${errorMessage}`, { 
        position: "top-center",
        theme: "dark"
      });
    } finally {
      setLoading(false);
      setShowLoader(false);
    }
  };

  const hasErrors = Object.values(errors).some(error => error !== "");
  const totalImages = existingImages.length + newFiles.length;

  if (showLoader) {
    return (
      <div style={{ 
        display: "flex", 
        flexDirection: "column", 
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 50%, #2d2d2d 100%)"
      }}>
        <AdminHeader admin={user} handleLogout={() => navigate("/login")} />
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

  if (!form.name && !loading) {
    return (
      <div style={{ 
        display: "flex", 
        flexDirection: "column", 
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 50%, #2d2d2d 100%)"
      }}>
        <AdminHeader admin={user} handleLogout={() => navigate("/login")} />
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

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
                onClick={() => navigate("/admin/products")}
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
                Update Product
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

                  {/* Styled Input Fields */}
                  <TextField
                    label="Name*"
                    fullWidth
                    value={form.name}
                    onChange={(e) => handleFieldChange('name', e.target.value)}
                    onBlur={(e) => handleFieldChange('name', e.target.value)}
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
                    label="Price*"
                    type="number"
                    fullWidth
                    value={form.price}
                    onChange={(e) => handleFieldChange('price', e.target.value)}
                    error={!!errors.price}
                    helperText={errors.price}
                    inputProps={{ min: 0, step: "0.01" }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        color: "#fff",
                        "& fieldset": { borderColor: "rgba(212,175,55,0.3)" },
                        "&:hover fieldset": { borderColor: "rgba(212,175,55,0.5)" },
                        "&.Mui-focused fieldset": { borderColor: "#d4af37" }
                      },
                      "& .MuiInputLabel-root": { color: "rgba(212,175,55,0.7)" },
                      "& .MuiInputLabel-root.Mui-focused": { color: "#d4af37" },
                      "& .MuiFormHelperText-root": { color: "#f2f2f2ff" }
                    }}
                  />
                  
                  <TextField
                    label="Description*"
                    multiline
                    rows={4}
                    fullWidth
                    value={form.description}
                    onChange={(e) => handleFieldChange('description', e.target.value)}
                    error={!!errors.description}
                    helperText={errors.description || `${form.description.length}/50 characters minimum`}
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
                    <InputLabel>Category*</InputLabel>
                    <Select
                      value={form.category}
                      label="Category*"
                      onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value }))}
                    >
                      {categories.map((c) => (
                        <MenuItem key={c} value={c} sx={{ color: "#000000ff", background: "#2d2d2d" }}>{c}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  
                  <FormControl fullWidth error={!!errors.supplier}
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
                    <InputLabel>Supplier*</InputLabel>
                    <Select
                      value={form.supplier}
                      label="Supplier*"
                      onChange={(e) => handleFieldChange('supplier', e.target.value)}
                    >
                      <MenuItem value="" sx={{ color: "#fff", background: "#2d2d2d" }}>-- Select Supplier --</MenuItem>
                      {suppliers.map((s) => (
                        <MenuItem key={s._id} value={s._id} sx={{ color: "#000000ff", background: "#2d2d2d" }}>{s.name}</MenuItem>
                      ))}
                    </Select>
                    {errors.supplier && <FormHelperText sx={{ color: "#ff6b6b" }}>{errors.supplier}</FormHelperText>}
                  </FormControl>
                  
                  <TextField
                    label="Stock*"
                    type="number"
                    fullWidth
                    value={form.stock}
                    onChange={(e) => handleFieldChange('stock', e.target.value)}
                    error={!!errors.stock}
                    helperText={errors.stock}
                    inputProps={{ min: 0 }}
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

                  {/* Image Management */}
                  <Box>
                    <Typography variant="h6" sx={{ color: '#d4af37', mb: 2 }}>
                      Image Management
                    </Typography>
                    
                    <FormControl error={!!errors.images} fullWidth>
                      <FormHelperText sx={{ color: '#d4af37', mb: 1 }}>
                        Total images: <strong>{totalImages}</strong> - {2 - totalImages > 0 ? `${2 - totalImages} more required` : 'Minimum requirement met'}
                      </FormHelperText>
                      {errors.images && <FormHelperText sx={{ color: "#ff6b6b" }}>{errors.images}</FormHelperText>}
                    </FormControl>

                    {/* Existing Images */}
                    {existingImages.length > 0 && (
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle1" sx={{ color: '#ccc', mb: 1 }}>
                          Existing Images (Click to remove)
                        </Typography>
                        <Grid container spacing={2}>
                          {existingImages.map((img, idx) => (
                            <Grid item key={idx}>
                              <Card sx={{ 
                                position: "relative", 
                                width: 100, 
                                height: 100,
                                border: '2px solid #d4af37',
                                borderRadius: '12px',
                                overflow: 'hidden'
                              }}>
                                <CardMedia
                                  component="img"
                                  image={img.url}
                                  alt={`img-${idx}`}
                                  sx={{ 
                                    width: "100%", 
                                    height: "100%", 
                                    objectFit: "cover" 
                                  }}
                                />
                                <IconButton
                                  size="small"
                                  sx={{ 
                                    position: "absolute", 
                                    top: -5, 
                                    right: -5, 
                                    bgcolor: "error.main", 
                                    color: "white",
                                    '&:hover': { bgcolor: "error.dark" }
                                  }}
                                  onClick={() => removeExistingImage(idx)}
                                >
                                  <CloseIcon fontSize="small" />
                                </IconButton>
                              </Card>
                            </Grid>
                          ))}
                        </Grid>
                      </Box>
                    )}

                    {/* Add New Images */}
                    <FormControl error={!!errors.images}>
                      <Button 
                        variant="contained" 
                        component="label"
                        sx={{
                          background: "linear-gradient(135deg, #d4af37, #b8860b)",
                          color: "#1a1a1a",
                          fontWeight: "bold",
                          padding: "12px 24px",
                          borderRadius: "10px",
                          "&:hover": {
                            background: "linear-gradient(135deg, #e6c453, #c9970b)",
                            transform: "translateY(-2px)",
                            boxShadow: "0 8px 25px rgba(212,175,55,0.4)"
                          },
                          transition: "all 0.3s ease"
                        }}
                      >
                        📸 Add New Images (Max 5, 2MB each)
                        <input type="file" hidden multiple accept="image/*" onChange={handleNewFileChange} />
                      </Button>
                    </FormControl>
                    
                    {/* New Image Previews */}
                    {newPreviews.length > 0 && (
                      <Grid container spacing={2} sx={{ mt: 2 }}>
                        {newPreviews.map((p, i) => (
                          <Grid item key={i}>
                            <Card sx={{ 
                              position: "relative", 
                              width: 100, 
                              height: 100,
                              border: '2px solid #007bff',
                              borderRadius: '12px',
                              overflow: 'hidden'
                            }}>
                              <CardMedia
                                component="img"
                                image={p}
                                alt={`new-${i}`}
                                sx={{ 
                                  width: "100%", 
                                  height: "100%", 
                                  objectFit: "cover" 
                                }}
                              />
                              <IconButton
                                size="small"
                                sx={{ 
                                  position: "absolute", 
                                  top: -5, 
                                  right: -5, 
                                  bgcolor: "error.main", 
                                  color: "white",
                                  '&:hover': { bgcolor: "error.dark" }
                                }}
                                onClick={() => removeNewFile(i)}
                              >
                                <CloseIcon fontSize="small" />
                              </IconButton>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    )}
                  </Box>

                  {/* Submit Buttons */}
                  <Stack direction="row" spacing={2} mt={2}>
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
                      {loading ? "Updating..." : "Update Product"}
                    </Button>
                    <Button 
                      variant="outlined" 
                      onClick={() => navigate("/admin/products")}
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
          </Box>
        </Container>
      </main>

      <AdminFooter />
    </div>
  );
}