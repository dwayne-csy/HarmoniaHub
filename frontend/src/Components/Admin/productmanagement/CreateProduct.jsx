/* --- DARK THEME WITH GOLD ACCENTS --- */

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
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

// Yup Validation Schema
const productSchema = yup.object({
  name: yup
    .string()
    .required("Name is required")
    .matches(/^[A-Z]/, "First letter must be capitalized")
    .matches(/^[^0-9]*$/, "Name should not contain numbers")
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must not exceed 100 characters"),
  price: yup
    .number()
    .typeError("Price must be a number")
    .required("Price is required")
    .positive("Price must be a positive number")
    .min(0.01, "Price must be greater than 0")
    .max(1000000, "Price must not exceed 1,000,000"),
  description: yup
    .string()
    .required("Description is required")
    .min(50, "Description must be at least 50 characters")
    .max(2000, "Description must not exceed 2000 characters"),
  category: yup
    .string()
    .required("Category is required")
    .oneOf(categories, "Invalid category"),
  supplier: yup
    .string()
    .required("Supplier is required"),
  stock: yup
    .number()
    .typeError("Stock must be a number")
    .required("Stock is required")
    .integer("Stock must be a whole number")
    .min(0, "Stock must be a non-negative number")
    .max(10000, "Stock must not exceed 10,000"),
});

export default function CreateProduct() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    trigger
  } = useForm({
    resolver: yupResolver(productSchema),
    defaultValues: {
      name: "",
      price: "",
      description: "",
      category: categories[0],
      supplier: "",
      stock: "",
    },
    mode: "onBlur"
  });

  const [suppliers, setSuppliers] = useState([]);
  const [imagesFiles, setImagesFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        setShowLoader(true);
        const res = await axios.get(`${BASE_URL}/suppliers/dropdown`);
        if (res.data?.suppliers) setSuppliers(res.data.suppliers);
      } catch (err) {
        toast.error("Failed to fetch suppliers");
      } finally {
        setShowLoader(false);
      }
    };
    fetchSuppliers();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const totalSize = files.reduce((t, f) => t + f.size, 0);
    if (totalSize > 10 * 1024 * 1024) {
      toast.error("Total images size should be less than 10MB");
      return;
    }

    const valid = [];
    const previewList = [];

    files.forEach((file) => {
      if (!file.type.startsWith("image/")) {
        toast.error("Only image files allowed");
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        toast.error(`Image ${file.name} must be < 2MB`);
        return;
      }

      valid.push(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        previewList.push(reader.result);
        if (previewList.length === valid.length) {
          setImagePreviews((prev) => [...prev, ...previewList]);
        }
      };
      reader.readAsDataURL(file);
    });

    const newImages = [...imagesFiles, ...valid];
    setImagesFiles(newImages);
  };

  const removeImage = (i) => {
    setImagesFiles(prev => prev.filter((_, idx) => idx !== i));
    setImagePreviews(prev => prev.filter((_, idx) => idx !== i));
  };

  const validateImages = () => {
    if (imagesFiles.length < 2) {
      toast.error("At least 2 images are required");
      return false;
    }
    return true;
  };

  const onSubmit = async (data) => {
    if (!validateImages()) return;

    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("price", parseFloat(data.price));
    formData.append("description", data.description);
    formData.append("category", data.category);
    formData.append("supplier", data.supplier);
    formData.append("stock", parseInt(data.stock, 10));
    imagesFiles.forEach((f) => formData.append("images", f));

    try {
      setShowLoader(true);
      await axios.post(`${BASE_URL}/admin/products`, formData, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      toast.success("Product created successfully!");
      setTimeout(() => navigate("/admin/products"), 1500);
    } catch (error) {
      const text = error?.response?.data?.message || error.message;
      toast.error(`Creation failed: ${text}`);
    } finally {
      setShowLoader(false);
    }
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
                  onClick={() => navigate("/admin/products")}
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
                  Create Product
                </Typography>
              </Box>

              <Box sx={{
                background: "rgba(20,20,20,0.8)",
                borderRadius: "12px",
                p: 3,
                border: "1px solid rgba(212,175,55,0.2)",
                boxShadow: "0 8px 25px rgba(0,0,0,0.2)"
              }}>
                
                <form onSubmit={handleSubmit(onSubmit)}>
                  <Stack spacing={3}>

                    {/* Name Field */}
                    <Controller
                      name="name"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Name*"
                          fullWidth
                          error={!!errors.name}
                          helperText={errors.name?.message}
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
                      )}
                    />

                    {/* Price Field */}
                    <Controller
                      name="price"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Price*"
                          type="number"
                          fullWidth
                          error={!!errors.price}
                          helperText={errors.price?.message}
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
                      )}
                    />

                    {/* Description Field */}
                    <Controller
                      name="description"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Description*"
                          multiline
                          rows={4}
                          fullWidth
                          error={!!errors.description}
                          helperText={errors.description?.message}
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
                      )}
                    />

                    {/* Category Field */}
                    <Controller
                      name="category"
                      control={control}
                      render={({ field }) => (
                        <FormControl fullWidth error={!!errors.category}
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
                            {...field}
                            label="Category*"
                          >
                            {categories.map((c) => (
                              <MenuItem key={c} value={c} sx={{ color: "#000000ff", background: "#2d2d2d" }}>{c}</MenuItem>
                            ))}
                          </Select>
                          {errors.category && <FormHelperText sx={{ color: "#ff6b6b" }}>{errors.category.message}</FormHelperText>}
                        </FormControl>
                      )}
                    />

                    {/* Supplier Field */}
                    <Controller
                      name="supplier"
                      control={control}
                      render={({ field }) => (
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
                            {...field}
                            label="Supplier*"
                          >
                            <MenuItem value="" sx={{ color: "#fff", background: "#2d2d2d" }}>-- Select Supplier --</MenuItem>
                            {suppliers.map((s) => (
                              <MenuItem key={s._id} value={s._id} sx={{ color: "#000000ff", background: "#2d2d2d" }}>{s.name}</MenuItem>
                            ))}
                          </Select>
                          {errors.supplier && <FormHelperText sx={{ color: "#ff6b6b" }}>{errors.supplier.message}</FormHelperText>}
                        </FormControl>
                      )}
                    />

                    {/* Stock Field */}
                    <Controller
                      name="stock"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Stock*"
                          type="number"
                          fullWidth
                          error={!!errors.stock}
                          helperText={errors.stock?.message}
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
                      )}
                    />

                    {/* Image Upload */}
                    <FormControl>
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
                         Choose Images* (Min 2)
                        <input type="file" hidden multiple accept="image/*" onChange={handleFileChange} />
                      </Button>
                      <FormHelperText sx={{ color: "rgba(255,255,255,0.7)" }}>
                        At least 2 images required
                      </FormHelperText>
                    </FormControl>

                    {/* Image Preview Grid */}
                    {imagePreviews.length > 0 && (
                      <Grid container spacing={2}>
                        {imagePreviews.map((img, i) => (
                          <Grid item key={i}>
                            <Card sx={{
                              width: 100,
                              height: 100,
                              position: "relative",
                              border: "2px solid #d4af37",
                              borderRadius: "12px",
                              overflow: "hidden",
                              boxShadow: "0 4px 15px rgba(212,175,55,0.3)"
                            }}>
                              <CardMedia
                                component="img"
                                image={img}
                                alt="preview"
                                sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                              />
                              <IconButton
                                size="small"
                                sx={{
                                  position: "absolute",
                                  top: -5,
                                  right: -5,
                                  background: "#b22222",
                                  color: "white",
                                  "&:hover": { background: "#7a1616" }
                                }}
                                onClick={() => removeImage(i)}
                              >
                                <CloseIcon fontSize="small" />
                              </IconButton>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    )}

                    {/* Submit Button */}
                    <Stack direction="row" spacing={2} mt={2}>
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={isSubmitting || imagesFiles.length < 2}
                        startIcon={isSubmitting && <CircularProgress size={16} sx={{ color: "#1a1a1a" }} />}
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
                        {isSubmitting ? "Creating..." : "Create Product"}
                      </Button>
                    </Stack>

                  </Stack>
                </form>

                <ToastContainer 
                  position="top-center" 
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