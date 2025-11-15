import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Loader from "../layouts/Loader";
import Header from "../layouts/user/Header";
import Footer from "../layouts/user/Footer";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import StarHalfIcon from "@mui/icons-material/StarHalf";
import FilterListIcon from "@mui/icons-material/FilterList";
import ClearIcon from "@mui/icons-material/Clear";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import PersonIcon from "@mui/icons-material/Person";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";

const Home = () => {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const [currentImageIndexes, setCurrentImageIndexes] = useState({});
  const [processingCheckout, setProcessingCheckout] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [backendConnected, setBackendConnected] = useState(true);
  
  // Filter states
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100000 });
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedRating, setSelectedRating] = useState(0);
  const [maxPrice, setMaxPrice] = useState(100000);
  
  // Review states
  const [expandedReviews, setExpandedReviews] = useState({});
  const [productReviews, setProductReviews] = useState({});
  const [loadingReviews, setLoadingReviews] = useState({});
  
  const navigate = useNavigate();

  // Categories from product model
  const categories = [
    "Idiophones",
    "Membranophones",
    "Chordophones",
    "Aerophones",
    "Electrophones",
    "Keyboard Instruments"
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");
        
        console.log("🔍 Home.jsx - Token from localStorage:", token ? "✅ Present" : "❌ Missing");
        console.log("🔍 Home.jsx - User from localStorage:", storedUser ? JSON.parse(storedUser) : "❌ Missing");

        // Set user from localStorage immediately for UI
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          console.log("✅ Using stored user from localStorage:", parsedUser);
        }

        // Validate token with backend if exists
        if (token) {
          try {
            console.log("🔄 Validating token with backend...");
            const { data } = await axios.get("http://localhost:4001/api/v1/me", {
              headers: { Authorization: `Bearer ${token}` },
              timeout: 5000
            });
            
            // Update user with fresh data from backend
            setUser(data.user);
            setBackendConnected(true);
            console.log("✅ Backend token validation successful:", data.user);

            // Fetch cart data
            try {
              const cartRes = await axios.get("http://localhost:4001/api/v1/cart", {
                headers: { Authorization: `Bearer ${token}` },
              });
              setCartCount(cartRes.data.cart?.items?.length || 0);
            } catch (cartError) {
              console.warn("⚠️ Could not fetch cart:", cartError.response?.data);
            }

          } catch (userError) {
            console.error("❌ Backend token validation failed:", userError.response?.status);
            
            if (userError.response?.status === 401) {
              // Token is invalid - clear and redirect to login
              console.log("🔄 Token invalid, clearing storage...");
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              setUser(null);
              navigate("/login");
              return;
            }
            
            setBackendConnected(false);
            // Keep using stored user data for UI, but show limited functionality
            console.log("🔄 Backend connection issue, using cached user data");
          }
        } else {
          // No token - user must login
          console.log("ℹ️ No token found - redirecting to login");
          navigate("/login");
          return;
        }

        // Fetch products (public route)
        console.log("🛍️ Fetching products...");
        const productsRes = await axios.get("http://localhost:4001/api/v1/products");
        const productsData = productsRes.data.products || productsRes.data || [];
        setProducts(productsData);
        console.log("✅ Products loaded:", productsData.length);

        // Calculate max price for slider
        if (productsData.length > 0) {
          const highest = Math.max(...productsData.map(p => p.price));
          setMaxPrice(Math.ceil(highest / 1000) * 1000); // Round up to nearest 1000
          setPriceRange({ min: 0, max: Math.ceil(highest / 1000) * 1000 });
        }

        const initialIndexes = {};
        productsData.forEach((product) => {
          if (product.images && product.images.length > 0) {
            initialIndexes[product._id] = 0;
          }
        });
        setCurrentImageIndexes(initialIndexes);

      } catch (error) {
        console.error("❌ General data fetch error:", error);
      } finally {
        setLoadingProducts(false);
        setLoadingUser(false);
      }
    };

    fetchData();
  }, [navigate]);

  const nextImage = (productId, totalImages, e) => {
    e.stopPropagation();
    setCurrentImageIndexes((prev) => ({
      ...prev,
      [productId]: (prev[productId] + 1) % totalImages,
    }));
  };

  const prevImage = (productId, totalImages, e) => {
    e.stopPropagation();
    setCurrentImageIndexes((prev) => ({
      ...prev,
      [productId]: (prev[productId] - 1 + totalImages) % totalImages,
    }));
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndexes((prev) => {
        const newIndexes = { ...prev };
        products.forEach((product) => {
          if (product.images && product.images.length > 1) {
            newIndexes[product._id] = (prev[product._id] + 1) % product.images.length;
          }
        });
        return newIndexes;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [products]);

  // Fetch reviews for a product
  const fetchProductReviews = async (productId) => {
    if (productReviews[productId]) return; // Already fetched
    
    setLoadingReviews(prev => ({ ...prev, [productId]: true }));
    
    try {
      const response = await axios.get(`http://localhost:4001/api/v1/reviews?productId=${productId}`);
      setProductReviews(prev => ({
        ...prev,
        [productId]: response.data.reviews || []
      }));
    } catch (error) {
      console.error(`Failed to fetch reviews for product ${productId}:`, error);
      setProductReviews(prev => ({
        ...prev,
        [productId]: []
      }));
    } finally {
      setLoadingReviews(prev => ({ ...prev, [productId]: false }));
    }
  };

  // Toggle reviews visibility
  const toggleReviews = async (productId) => {
    const isExpanded = expandedReviews[productId];
    
    if (!isExpanded) {
      await fetchProductReviews(productId);
    }
    
    setExpandedReviews(prev => ({
      ...prev,
      [productId]: !isExpanded
    }));
  };

  const handleAddToCart = async (productId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please log in to add products to your cart.");
      return;
    }
    
    if (!backendConnected) {
      alert("⚠️ Backend connection issue. Some features may not work properly.");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:4001/api/v1/cart/add",
        { productId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCartCount(res.data.cart.items.length);
      alert("Product added to cart!");
    } catch (error) {
      console.error("Failed to add product to cart", error);
      
      if (error.response?.status === 401) {
        alert("Your session has expired. Please login again.");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        navigate("/login");
      } else {
        alert(error.response?.data?.message || "Failed to add product to cart.");
      }
    }
  };

  const handleSoloCheckout = async (productId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please log in to checkout.");
      return;
    }

    if (!backendConnected) {
      alert("⚠️ Backend connection issue. Checkout is currently unavailable.");
      return;
    }

    setProcessingCheckout(productId);

    try {
      const productRes = await axios.get(`http://localhost:4001/api/v1/products/${productId}`);
      const product = productRes.data.product || productRes.data;
      
      if (!product) {
        alert("Product not found.");
        return;
      }

      if (product.stock < 1) {
        alert("Product is out of stock.");
        return;
      }

      const soloCart = {
        items: [
          {
            product: product,
            quantity: 1,
            _id: `solo-${productId}`
          }
        ]
      };

      navigate("/checkout-confirmation", { 
        state: { 
          cart: soloCart,
          checkoutType: "solo",
          productId: productId 
        } 
      });

    } catch (error) {
      console.error("Failed to process checkout:", error);
      
      if (error.response?.status === 401) {
        alert("Your session has expired. Please login again.");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        navigate("/login");
      } else {
        alert("Failed to process checkout. Please try again.");
      }
    } finally {
      setProcessingCheckout(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setBackendConnected(true);
    console.log("🚪 User logged out");
    navigate("/login");
  };

  const handleRetryBackend = () => {
    setLoadingUser(true);
    setBackendConnected(true);
    // This will trigger the useEffect to retry
    setTimeout(() => {
      setLoadingUser(false);
    }, 1000);
  };

  // Clear all filters
  const handleClearFilters = () => {
    setPriceRange({ min: 0, max: maxPrice });
    setSelectedCategory("all");
    setSelectedRating(0);
  };

  // Filter products
  const filteredProducts = products.filter((product) => {
    // Price filter
    const passesPrice = product.price >= priceRange.min && product.price <= priceRange.max;
    
    // Category filter
    const passesCategory = selectedCategory === "all" || product.category === selectedCategory;
    
    // Rating filter
    const passesRating = selectedRating === 0 || product.ratings >= selectedRating;
    
    // Stock filter
    const inStock = product.stock > 0;
    
    return passesPrice && passesCategory && passesRating && inStock;
  });

  // Render star rating with half stars
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<StarIcon key={i} style={{ color: "#ffc107", fontSize: "18px" }} />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<StarHalfIcon key={i} style={{ color: "#ffc107", fontSize: "18px" }} />);
      } else {
        stars.push(<StarBorderIcon key={i} style={{ color: "#ddd", fontSize: "18px" }} />);
      }
    }
    return stars;
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* Header Component */}
      <Header 
        user={user}
        cartCount={cartCount}
        backendConnected={backendConnected}
        handleLogout={handleLogout}
      />

      {loadingUser ? (
        <div style={{ textAlign: 'center', padding: '40px', flex: 1 }}>
          <Loader />
          <p>Loading user data...</p>
        </div>
      ) : user ? (
        <main style={{ flex: 1, padding: "20px 30px", maxWidth: "1400px", margin: "0 auto", width: "100%" }}>
          {/* Backend status banner */}
          {!backendConnected && (
            <div style={{
              backgroundColor: '#fff3cd',
              border: '1px solid #ffeaa7',
              borderRadius: '8px',
              padding: '12px 20px',
              marginBottom: '25px',
              textAlign: 'center',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <strong>⚠️ Limited Functionality:</strong> Backend connection issue. You can browse products but some features may not work.
              <button 
                onClick={handleRetryBackend}
                style={{
                  marginLeft: '15px',
                  padding: '6px 12px',
                  backgroundColor: '#ff9800',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                Retry Connection
              </button>
            </div>
          )}

          {/* Filter Section */}
          <div style={{
            backgroundColor: "#f8f9fa",
            padding: "25px",
            borderRadius: "12px",
            marginBottom: "35px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            border: "1px solid #e9ecef"
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <h3 style={{ margin: 0, display: "flex", alignItems: "center", gap: "10px", color: "#2c3e50" }}>
                <FilterListIcon style={{ color: "#3498db" }} /> Product Filters
              </h3>
              <button
                onClick={handleClearFilters}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#e74c3c",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "14px",
                  fontWeight: "500",
                  transition: "all 0.3s ease",
                  boxShadow: "0 2px 4px rgba(231, 76, 60, 0.3)"
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = "#c0392b"}
                onMouseOut={(e) => e.target.style.backgroundColor = "#e74c3c"}
              >
                <ClearIcon fontSize="small" /> Clear Filters
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "25px" }}>
              {/* Price Range Filter */}
              <div>
                <label style={{ fontWeight: "600", marginBottom: "10px", display: "block", color: "#2c3e50" }}>
                  Price Range: ₱{priceRange.min.toLocaleString()} - ₱{priceRange.max.toLocaleString()}
                </label>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <input
                    type="range"
                    min="0"
                    max={maxPrice}
                    value={priceRange.max}
                    onChange={(e) => setPriceRange({ ...priceRange, max: parseInt(e.target.value) })}
                    style={{ width: "100%", height: "6px", borderRadius: "3px" }}
                  />
                  <div style={{ display: "flex", gap: "12px" }}>
                    <input
                      type="number"
                      placeholder="Min"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange({ ...priceRange, min: parseInt(e.target.value) || 0 })}
                      style={{
                        flex: 1,
                        padding: "10px",
                        border: "1px solid #ddd",
                        borderRadius: "8px",
                        fontSize: "14px",
                        boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)"
                      }}
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange({ ...priceRange, max: parseInt(e.target.value) || maxPrice })}
                      style={{
                        flex: 1,
                        padding: "10px",
                        border: "1px solid #ddd",
                        borderRadius: "8px",
                        fontSize: "14px",
                        boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)"
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <label style={{ fontWeight: "600", marginBottom: "10px", display: "block", color: "#2c3e50" }}>
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    fontSize: "14px",
                    cursor: "pointer",
                    backgroundColor: "white",
                    boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)",
                    transition: "all 0.3s ease"
                  }}
                >
                  <option value="all">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Rating Filter */}
              <div>
                <label style={{ fontWeight: "600", marginBottom: "10px", display: "block", color: "#2c3e50" }}>
                  Minimum Rating
                </label>
                <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
                  {[0, 1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setSelectedRating(rating)}
                      style={{
                        padding: "8px 12px",
                        backgroundColor: selectedRating === rating ? "#3498db" : "#fff",
                        color: selectedRating === rating ? "#fff" : "#333",
                        border: "1px solid #ddd",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: selectedRating === rating ? "600" : "400",
                        transition: "all 0.3s ease",
                        boxShadow: selectedRating === rating ? "0 2px 4px rgba(52, 152, 219, 0.3)" : "none",
                        flex: "1",
                        minWidth: "50px"
                      }}
                      onMouseOver={(e) => {
                        if (selectedRating !== rating) {
                          e.target.style.backgroundColor = "#f8f9fa";
                        }
                      }}
                      onMouseOut={(e) => {
                        if (selectedRating !== rating) {
                          e.target.style.backgroundColor = "#fff";
                        }
                      }}
                    >
                      {rating === 0 ? "All" : `${rating}★`}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Filter Results Count */}
            <div style={{ 
              marginTop: "20px", 
              fontSize: "15px", 
              color: "#7f8c8d", 
              textAlign: "center",
              padding: "12px",
              backgroundColor: "white",
              borderRadius: "8px",
              border: "1px solid #e9ecef"
            }}>
              Showing <strong style={{ color: "#2c3e50" }}>{filteredProducts.length}</strong> of <strong style={{ color: "#2c3e50" }}>{products.filter(p => p.stock > 0).length}</strong> available products
            </div>
          </div>
          
          <h2 style={{ 
            color: "#2c3e50", 
            marginBottom: "25px", 
            fontSize: "28px",
            fontWeight: "700",
            textAlign: "center"
          }}>
            Available Products
          </h2>

          {loadingProducts ? (
            <div className="loader-container" style={{ textAlign: "center", padding: "60px" }}>
              <Loader />
              <p style={{ marginTop: "15px", color: "#7f8c8d" }}>Loading products...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div style={{ 
              textAlign: "center", 
              padding: "60px",
              backgroundColor: "#f8f9fa",
              borderRadius: "12px",
              border: "2px dashed #dee2e6"
            }}>
              <p style={{ fontSize: "18px", color: "#7f8c8d", marginBottom: "20px" }}>No products match your filters.</p>
              <button
                onClick={handleClearFilters}
                style={{
                  padding: "12px 24px",
                  backgroundColor: "#3498db",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "16px",
                  fontWeight: "600",
                  transition: "all 0.3s ease",
                  boxShadow: "0 4px 8px rgba(52, 152, 219, 0.3)"
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = "#2980b9"}
                onMouseOut={(e) => e.target.style.backgroundColor = "#3498db"}
              >
                Clear Filters & Show All Products
              </button>
            </div>
          ) : (
            <div className="products-grid" style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: "25px",
              padding: "10px 0"
            }}>
              {filteredProducts.map((product) => {
                const currentIndex = currentImageIndexes[product._id] || 0;
                const totalImages = product.images?.length || 0;
                const hasMultipleImages = totalImages > 1;
                const isReviewsExpanded = expandedReviews[product._id];
                const reviews = productReviews[product._id] || [];
                const isLoadingReviews = loadingReviews[product._id];

                return (
                  <div
                    key={product._id}
                    className="product-card"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      padding: "20px",
                      borderRadius: "16px",
                      boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
                      backgroundColor: "#fff",
                      opacity: backendConnected ? 1 : 0.9,
                      border: "1px solid #f0f0f0",
                      transition: "all 0.3s ease",
                      position: "relative",
                      overflow: "hidden"
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = "translateY(-5px)";
                      e.currentTarget.style.boxShadow = "0 12px 25px rgba(0,0,0,0.15)";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.1)";
                    }}
                  >
                    {/* Stock Badge */}
                    <div style={{
                      position: "absolute",
                      top: "15px",
                      right: "15px",
                      backgroundColor: product.stock > 10 ? "#27ae60" : product.stock > 0 ? "#f39c12" : "#e74c3c",
                      color: "white",
                      padding: "4px 10px",
                      borderRadius: "20px",
                      fontSize: "12px",
                      fontWeight: "600",
                      zIndex: 2
                    }}>
                      {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                    </div>

                    <div style={{ position: "relative" }}>
                      <img
                        src={product.images?.[currentIndex]?.url}
                        alt={product.name}
                        style={{
                          width: "100%",
                          height: "220px",
                          objectFit: "cover",
                          borderRadius: "12px",
                          marginBottom: "15px"
                        }}
                      />
                      {hasMultipleImages && (
                        <>
                          <button
                            onClick={(e) => prevImage(product._id, totalImages, e)}
                            style={{
                              position: "absolute",
                              left: "10px",
                              top: "50%",
                              transform: "translateY(-50%)",
                              background: "rgba(0,0,0,0.6)",
                              color: "white",
                              border: "none",
                              borderRadius: "50%",
                              width: "32px",
                              height: "32px",
                              fontSize: "16px",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              transition: "all 0.3s ease"
                            }}
                            onMouseOver={(e) => e.target.style.background = "rgba(0,0,0,0.8)"}
                            onMouseOut={(e) => e.target.style.background = "rgba(0,0,0,0.6)"}
                          >
                            ‹
                          </button>
                          <button
                            onClick={(e) => nextImage(product._id, totalImages, e)}
                            style={{
                              position: "absolute",
                              right: "10px",
                              top: "50%",
                              transform: "translateY(-50%)",
                              background: "rgba(0,0,0,0.6)",
                              color: "white",
                              border: "none",
                              borderRadius: "50%",
                              width: "32px",
                              height: "32px",
                              fontSize: "16px",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              transition: "all 0.3s ease"
                            }}
                            onMouseOver={(e) => e.target.style.background = "rgba(0,0,0,0.8)"}
                            onMouseOut={(e) => e.target.style.background = "rgba(0,0,0,0.6)"}
                          >
                            ›
                          </button>
                        </>
                      )}
                    </div>

                    <div style={{ marginBottom: "20px" }}>
                      <h3 style={{ 
                        fontSize: "1.3rem", 
                        marginBottom: "8px", 
                        color: "#2c3e50",
                        fontWeight: "600",
                        lineHeight: "1.3"
                      }}>
                        {product.name}
                      </h3>
                      
                      <p style={{ 
                        marginBottom: "10px", 
                        fontWeight: "700", 
                        color: "#e74c3c", 
                        fontSize: "1.4rem",
                        textShadow: "0 1px 2px rgba(0,0,0,0.1)"
                      }}>
                        ₱{product.price.toLocaleString()}
                      </p>
                      
                      <div style={{ 
                        display: "flex", 
                        alignItems: "center", 
                        gap: "8px", 
                        marginBottom: "10px",
                        flexWrap: "wrap"
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
                          {renderStars(product.ratings)}
                        </div>
                        <span style={{ 
                          fontSize: "14px", 
                          color: "#7f8c8d",
                          fontWeight: "500"
                        }}>
                          ({product.ratings.toFixed(1)}) • {product.numOfReviews || 0} reviews
                        </span>
                      </div>
                      
                      <p style={{ 
                        marginBottom: "8px", 
                        fontSize: "14px", 
                        color: "#7f8c8d",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px"
                      }}>
                        <span style={{
                          backgroundColor: "#3498db",
                          color: "white",
                          padding: "2px 8px",
                          borderRadius: "12px",
                          fontSize: "12px",
                          fontWeight: "500"
                        }}>
                          {product.category}
                        </span>
                      </p>
                    </div>

                    {/* Reviews Section */}
                    <div style={{ marginBottom: "20px" }}>
                      <button
                        onClick={() => toggleReviews(product._id)}
                        disabled={isLoadingReviews}
                        style={{
                          width: "100%",
                          padding: "10px",
                          backgroundColor: isReviewsExpanded ? "#7f8c8d" : "#ecf0f1",
                          color: isReviewsExpanded ? "white" : "#2c3e50",
                          border: "none",
                          borderRadius: "8px",
                          cursor: "pointer",
                          fontSize: "14px",
                          fontWeight: "600",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "8px",
                          transition: "all 0.3s ease"
                        }}
                        onMouseOver={(e) => {
                          if (!isReviewsExpanded) {
                            e.target.style.backgroundColor = "#bdc3c7";
                            e.target.style.color = "white";
                          }
                        }}
                        onMouseOut={(e) => {
                          if (!isReviewsExpanded) {
                            e.target.style.backgroundColor = "#ecf0f1";
                            e.target.style.color = "#2c3e50";
                          }
                        }}
                      >
                        {isLoadingReviews ? (
                          <>Loading Reviews...</>
                        ) : (
                          <>
                            {isReviewsExpanded ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                            {isReviewsExpanded ? "Hide Reviews" : "Show Reviews"} 
                            ({product.numOfReviews || 0})
                          </>
                        )}
                      </button>

                      {isReviewsExpanded && (
                        <div style={{
                          marginTop: "15px",
                          maxHeight: "200px",
                          overflowY: "auto",
                          border: "1px solid #ecf0f1",
                          borderRadius: "8px",
                          padding: "15px",
                          backgroundColor: "#f8f9fa"
                        }}>
                          {reviews.length === 0 ? (
                            <p style={{ 
                              textAlign: "center", 
                              color: "#7f8c8d", 
                              fontSize: "14px",
                              fontStyle: "italic"
                            }}>
                              No reviews yet. Be the first to review this product!
                            </p>
                          ) : (
                            reviews.map((review) => (
                              <div key={review._id} style={{
                                padding: "12px",
                                marginBottom: "10px",
                                backgroundColor: "white",
                                borderRadius: "8px",
                                border: "1px solid #e9ecef",
                                boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
                              }}>
                                <div style={{ 
                                  display: "flex", 
                                  justifyContent: "space-between",
                                  alignItems: "flex-start",
                                  marginBottom: "8px"
                                }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                    <PersonIcon style={{ color: "#3498db", fontSize: "16px" }} />
                                    <span style={{ fontWeight: "600", fontSize: "14px" }}>
                                      {review.user?.name || review.name}
                                    </span>
                                  </div>
                                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                    <CalendarTodayIcon style={{ color: "#95a5a6", fontSize: "14px" }} />
                                    <span style={{ fontSize: "12px", color: "#95a5a6" }}>
                                      {formatDate(review.createdAt)}
                                    </span>
                                  </div>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "8px" }}>
                                  {renderStars(review.rating)}
                                </div>
                                <p style={{ 
                                  fontSize: "14px", 
                                  color: "#2c3e50",
                                  lineHeight: "1.4",
                                  margin: 0
                                }}>
                                  {review.comment}
                                </p>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div
                      style={{
                        display: "flex",
                        gap: "12px",
                        justifyContent: "space-between",
                      }}
                    >
                      <button
                        onClick={() => handleAddToCart(product._id)}
                        disabled={!backendConnected || product.stock === 0}
                        style={{
                          flex: 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "6px",
                          padding: "12px 10px",
                          backgroundColor: (!backendConnected || product.stock === 0) ? "#bdc3c7" : "#3498db",
                          color: "#fff",
                          border: "none",
                          borderRadius: "10px",
                          cursor: (!backendConnected || product.stock === 0) ? "not-allowed" : "pointer",
                          fontWeight: "600",
                          fontSize: "14px",
                          transition: "all 0.3s ease",
                          boxShadow: (!backendConnected || product.stock === 0) ? "none" : "0 4px 8px rgba(52, 152, 219, 0.3)"
                        }}
                        onMouseOver={(e) => {
                          if (backendConnected && product.stock > 0) {
                            e.target.style.backgroundColor = "#2980b9";
                            e.target.style.transform = "translateY(-2px)";
                          }
                        }}
                        onMouseOut={(e) => {
                          if (backendConnected && product.stock > 0) {
                            e.target.style.backgroundColor = "#3498db";
                            e.target.style.transform = "translateY(0)";
                          }
                        }}
                      >
                        <ShoppingCartIcon fontSize="small" /> 
                        {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                      </button>

                      <button
                        onClick={() => handleSoloCheckout(product._id)}
                        disabled={processingCheckout === product._id || !backendConnected || product.stock === 0}
                        style={{
                          flex: 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "6px",
                          padding: "12px 10px",
                          backgroundColor: (processingCheckout === product._id || !backendConnected || product.stock === 0) ? "#bdc3c7" : "#27ae60",
                          color: "#fff",
                          border: "none",
                          borderRadius: "10px",
                          cursor: (processingCheckout === product._id || !backendConnected || product.stock === 0) ? "not-allowed" : "pointer",
                          fontWeight: "600",
                          fontSize: "14px",
                          transition: "all 0.3s ease",
                          boxShadow: (processingCheckout === product._id || !backendConnected || product.stock === 0) ? "none" : "0 4px 8px rgba(39, 174, 96, 0.3)"
                        }}
                        onMouseOver={(e) => {
                          if (backendConnected && product.stock > 0 && processingCheckout !== product._id) {
                            e.target.style.backgroundColor = "#219a52";
                            e.target.style.transform = "translateY(-2px)";
                          }
                        }}
                        onMouseOut={(e) => {
                          if (backendConnected && product.stock > 0 && processingCheckout !== product._id) {
                            e.target.style.backgroundColor = "#27ae60";
                            e.target.style.transform = "translateY(0)";
                          }
                        }}
                      >
                        {processingCheckout === product._id ? (
                          "Processing..."
                        ) : (
                          <>
                            Checkout <ArrowForwardIcon fontSize="small" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px', flex: 1 }}>
          <h2>Welcome to HarmoniaHub</h2>
          <p>Please login to view products and make purchases</p>
          <Link to="/login" className="btn-primary" style={{ marginTop: '20px', display: 'inline-block', padding: '10px 20px' }}>
            Login Now
          </Link>
        </div>
      )}

      {/* Footer Component */}
      <Footer />
    </div>
  );
};

export default Home;