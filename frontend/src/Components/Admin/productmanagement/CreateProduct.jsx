import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
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
import Loader from '../../layouts/Loader'; // Import the Loader component

const BASE_URL = "http://localhost:4001/api/v1";

const categories = [
  "Idiophones",
  "Membranophones",
  "Chordophones",
  "Aerophones",
  "Electrophones",
  "Keyboard Instruments",
];

export default function CreateProduct() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
    category: categories[0],
    supplier: "",
    stock: "",
  });
  const [suppliers, setSuppliers] = useState([]);
  const [imagesFiles, setImagesFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showLoader, setShowLoader] = useState(false); // For full page loader
  
  // Validation errors state
  const [errors, setErrors] = useState({
    name: "",
    price: "",
    description: "",
    category: "",
    supplier: "",
    stock: "",
    images: ""
  });

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        setShowLoader(true);
        const res = await axios.get(`${BASE_URL}/suppliers/dropdown`);
        if (res.data?.suppliers) setSuppliers(res.data.suppliers);
      } catch (err) {
        console.error("fetch suppliers error", err);
        toast.error("Failed to fetch suppliers", { 
          position: "top-center",
          theme: "colored"
        });
      } finally {
        setShowLoader(false);
      }
    };
    fetchSuppliers();
  }, []);

  // Validation functions
  const validateName = (name) => {
    if (!name.trim()) {
      return "Name is required";
    }
    if (!/^[A-Z]/.test(name)) {
      return "First letter must be capitalized";
    }
    if (/\d/.test(name)) {
      return "Name should not contain numbers";
    }
    return "";
  };

  const validatePrice = (price) => {
    if (!price) {
      return "Price is required";
    }
    if (isNaN(price) || parseFloat(price) <= 0) {
      return "Price must be a positive number";
    }
    return "";
  };

  const validateDescription = (description) => {
    if (!description.trim()) {
      return "Description is required";
    }
    if (description.length < 50) {
      return "Description must be at least 50 characters";
    }
    return "";
  };

  const validateCategory = (category) => {
    if (!category) {
      return "Category is required";
    }
    return "";
  };

  const validateSupplier = (supplier) => {
    if (!supplier) {
      return "Supplier is required";
    }
    return "";
  };

  const validateStock = (stock) => {
    if (!stock) {
      return "Stock is required";
    }
    if (isNaN(stock) || parseInt(stock, 10) < 0) {
      return "Stock must be a non-negative number";
    }
    return "";
  };

  const validateImages = (images) => {
    if (images.length < 2) {
      return "At least 2 images are required";
    }
    return "";
  };

  const validateField = (fieldName, value) => {
    switch (fieldName) {
      case 'name':
        return validateName(value);
      case 'price':
        return validatePrice(value);
      case 'description':
        return validateDescription(value);
      case 'category':
        return validateCategory(value);
      case 'supplier':
        return validateSupplier(value);
      case 'stock':
        return validateStock(value);
      case 'images':
        return validateImages(value);
      default:
        return "";
    }
  };

  const handleFieldChange = (fieldName, value) => {
    setForm(prev => ({ ...prev, [fieldName]: value }));
    
    // Validate the field in real-time
    const error = validateField(fieldName, value);
    setErrors(prev => ({ ...prev, [fieldName]: error }));
  };

  const handleFileChange = (e) => {
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

    const validFiles = [];
    const previews = [];

    files.forEach((file) => {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select only image files", { 
          position: "top-center",
          theme: "colored"
        });
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        toast.error(`Image ${file.name} should be less than 2MB`, { 
          position: "top-center",
          theme: "colored"
        });
        return;
      }
      validFiles.push(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        previews.push(reader.result);
        if (previews.length === validFiles.length) {
          setImagePreviews((prev) => [...prev, ...previews]);
        }
      };
      reader.readAsDataURL(file);
    });

    const newImagesFiles = [...imagesFiles, ...validFiles];
    setImagesFiles(newImagesFiles);
    
    // Validate images count
    const imagesError = validateImages(newImagesFiles);
    setErrors(prev => ({ ...prev, images: imagesError }));
  };

  const removeImage = (index) => {
    setImagesFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    
    // Revalidate images count after removal
    const newImagesFiles = imagesFiles.filter((_, i) => i !== index);
    const imagesError = validateImages(newImagesFiles);
    setErrors(prev => ({ ...prev, images: imagesError }));
  };

  const validateAllFields = () => {
    const newErrors = {
      name: validateName(form.name),
      price: validatePrice(form.price),
      description: validateDescription(form.description),
      category: validateCategory(form.category),
      supplier: validateSupplier(form.supplier),
      stock: validateStock(form.stock),
      images: validateImages(imagesFiles)
    };

    setErrors(newErrors);

    // Check if there are any errors
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

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("price", parseFloat(form.price));
    formData.append("description", form.description);
    formData.append("category", form.category);
    formData.append("supplier", form.supplier);
    formData.append("stock", parseInt(form.stock, 10));
    imagesFiles.forEach((file) => formData.append("images", file));

    try {
      setLoading(true);
      setShowLoader(true);
      
      await axios.post(`${BASE_URL}/admin/products`, formData, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      
      toast.success("Product created successfully!", { 
        position: "top-center",
        theme: "colored"
      });
      
      setTimeout(() => navigate("/admin/products"), 1500);
      
    } catch (error) {
      const text = error?.response?.data?.message || error.message;
      toast.error(`Creation failed: ${text}`, { 
        position: "top-center",
        theme: "colored"
      });
    } finally {
      setLoading(false);
      setShowLoader(false);
    }
  };

  const hasErrors = Object.values(errors).some(error => error !== "");

  // Show full page loader when loading suppliers or submitting
  if (showLoader) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh', // Adjust height as needed
          width: '100%'
        }}
      >
        <Loader />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", p: 3, border: "1px solid #ddd", borderRadius: 2 }}>
      <Typography variant="h5" mb={2}>
        Create Product
      </Typography>

      <form onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <TextField
            label="Name*"
            fullWidth
            value={form.name}
            onChange={(e) => handleFieldChange('name', e.target.value)}
            error={!!errors.name}
            helperText={errors.name}
            onBlur={(e) => handleFieldChange('name', e.target.value)}
          />
          
          <TextField
            label="Price*"
            type="number"
            fullWidth
            value={form.price}
            onChange={(e) => handleFieldChange('price', e.target.value)}
            error={!!errors.price}
            helperText={errors.price}
            onBlur={(e) => handleFieldChange('price', e.target.value)}
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
            onBlur={(e) => handleFieldChange('description', e.target.value)}
          />
          
          <FormControl fullWidth error={!!errors.category}>
            <InputLabel>Category*</InputLabel>
            <Select
              value={form.category}
              label="Category*"
              onChange={(e) => handleFieldChange('category', e.target.value)}
            >
              {categories.map((c) => (
                <MenuItem key={c} value={c}>{c}</MenuItem>
              ))}
            </Select>
            {errors.category && <FormHelperText>{errors.category}</FormHelperText>}
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
            onBlur={(e) => handleFieldChange('stock', e.target.value)}
            inputProps={{ min: 0 }}
          />

          <FormControl error={!!errors.images}>
            <Button variant="contained" component="label">
              Choose Images* (At least 2, Max 5, 2MB each)
              <input type="file" hidden multiple accept="image/*" onChange={handleFileChange} />
            </Button>
            {errors.images && <FormHelperText>{errors.images}</FormHelperText>}
            <FormHelperText>
              {imagesFiles.length} image(s) selected - {2 - imagesFiles.length} more required
            </FormHelperText>
          </FormControl>

          {imagePreviews.length > 0 && (
            <Grid container spacing={2}>
              {imagePreviews.map((preview, index) => (
                <Grid key={index}>
                  <Card sx={{ position: "relative", width: 100, height: 100 }}>
                    <CardMedia
                      component="img"
                      image={preview}
                      alt={`Preview ${index + 1}`}
                      sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                    <IconButton
                      size="small"
                      sx={{ position: "absolute", top: -5, right: -5, bgcolor: "error.main", color: "white" }}
                      onClick={() => removeImage(index)}
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
              {loading ? "Creating..." : "Create Product"}
            </Button>
            <Button variant="outlined" onClick={() => navigate("/admin/products")}>
              Back to List
            </Button>
          </Stack>
        </Stack>
      </form>

      {/* Toast Container with center position */}
      <ToastContainer 
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </Box>
  );
}