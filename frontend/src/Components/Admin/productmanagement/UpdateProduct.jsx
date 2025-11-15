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
  FormHelperText
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { toast, ToastContainer } from "react-toastify";
import Loader from '../../layouts/Loader';

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
        theme: "colored"
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
        theme: "colored"
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
        theme: "colored"
      });
      return;
    }

    const validFiles = files.filter(file => {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select only image files", { position: "top-center", theme: "colored" });
        return false;
      }
      if (file.size > 2 * 1024 * 1024) {
        toast.error(`Image ${file.name} should be less than 2MB`, { position: "top-center", theme: "colored" });
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
        theme: "colored"
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
        theme: "colored"
      });
      
      setTimeout(() => navigate("/admin/products"), 1500);
      
    } catch (err) {
      const errorMessage = err?.response?.data?.message || err.message;
      toast.error(`Update failed: ${errorMessage}`, { 
        position: "top-center",
        theme: "colored"
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
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', width: '100%' }}>
        <Loader />
      </Box>
    );
  }

  if (!form.name && !loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', width: '100%' }}>
        <Loader />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", p: 3, border: "1px solid #ddd", borderRadius: 2 }}>
      <Typography variant="h5" mb={2}>Update Product</Typography>

      <form onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <TextField
            label="Name*"
            fullWidth
            value={form.name}
            onChange={(e) => handleFieldChange('name', e.target.value)}
            error={!!errors.name}
            helperText={errors.name}
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
          />
          
          <FormControl fullWidth>
            <InputLabel>Category*</InputLabel>
            <Select
              value={form.category}
              label="Category*"
              onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value }))}
            >
              {categories.map((c) => (
                <MenuItem key={c} value={c}>{c}</MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl fullWidth error={!!errors.supplier}>
            <InputLabel>Supplier*</InputLabel>
            <Select
              value={form.supplier}
              label="Supplier*"
              onChange={(e) => handleFieldChange('supplier', e.target.value)}
            >
              <MenuItem value="">-- Select Supplier --</MenuItem>
              {suppliers.map((s) => (
                <MenuItem key={s._id} value={s._id}>{s.name}</MenuItem>
              ))}
            </Select>
            {errors.supplier && <FormHelperText>{errors.supplier}</FormHelperText>}
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
          />

          <Typography variant="h6">Existing Images</Typography>
          <FormControl error={!!errors.images}>
            <FormHelperText>
              Total images: {totalImages} - {2 - totalImages > 0 ? `${2 - totalImages} more required` : 'Minimum requirement met'}
            </FormHelperText>
            {errors.images && <FormHelperText error>{errors.images}</FormHelperText>}
          </FormControl>
          
          <Grid container spacing={2}>
            {existingImages.length === 0 && (
              <Grid item>
                <Typography color="text.secondary">No existing images</Typography>
              </Grid>
            )}
            {existingImages.map((img, idx) => (
              <Grid item key={idx}>
                <Card sx={{ position: "relative", width: 100, height: 100 }}>
                  <CardMedia
                    component="img"
                    image={img.url}
                    alt={`img-${idx}`}
                    sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                  <IconButton
                    size="small"
                    sx={{ position: "absolute", top: -5, right: -5, bgcolor: "error.main", color: "white" }}
                    onClick={() => removeExistingImage(idx)}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Card>
              </Grid>
            ))}
          </Grid>

          <FormControl error={!!errors.images}>
            <Button variant="contained" component="label">
              Add New Images (Max 5, 2MB each)
              <input type="file" hidden multiple accept="image/*" onChange={handleNewFileChange} />
            </Button>
          </FormControl>
          
          {newPreviews.length > 0 && (
            <Grid container spacing={2}>
              {newPreviews.map((p, i) => (
                <Grid item key={i}>
                  <Card sx={{ position: "relative", width: 100, height: 100 }}>
                    <CardMedia
                      component="img"
                      image={p}
                      alt={`new-${i}`}
                      sx={{ width: "100%", height: "100%", objectFit: "cover", border: "2px solid #007bff" }}
                    />
                    <IconButton
                      size="small"
                      sx={{ position: "absolute", top: -5, right: -5, bgcolor: "error.main", color: "white" }}
                      onClick={() => removeNewFile(i)}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          <Stack direction="row" spacing={2} mt={2}>
            <Button 
              type="submit" 
              variant="contained" 
              disabled={loading || hasErrors}
              startIcon={loading && <CircularProgress size={16} />}
            >
              {loading ? "Updating..." : "Update Product"}
            </Button>
            <Button variant="outlined" onClick={() => navigate("/admin/products")}>
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
        theme="colored"
      />
    </Box>
  );
}