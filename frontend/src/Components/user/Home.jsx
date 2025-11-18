import React, { useState, useEffect, useCallback, useRef } from "react";
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
import SearchIcon from "@mui/icons-material/Search";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

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
  const [searchQuery, setSearchQuery] = useState("");
  
  // NEW: Stock sorting state
  const [stockSort, setStockSort] = useState(null); // null, 'high-to-low', 'low-to-high'
  
  // Review states
  const [expandedReviews, setExpandedReviews] = useState({});
  const [productReviews, setProductReviews] = useState({});
  const [loadingReviews, setLoadingReviews] = useState({});
  
  // Infinite scroll states
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  
  // Dropdown states
  const [isRatingDropdownOpen, setIsRatingDropdownOpen] = useState(false);
  
  const navigate = useNavigate();
  const observer = useRef();
  const lastProductElementRef = useCallback(node => {
    if (loadingMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMoreProducts();
      }
    });
    if (node) observer.current.observe(node);
  }, [loadingMore, hasMore]);

  // Categories from product model
  const categories = [
    "Idiophones",
    "Membranophones",
    "Chordophones",
    "Aerophones",
    "Electrophones",
    "Keyboard Instruments"
  ];

  // Rating options for dropdown
  const ratingOptions = [
    { value: 0, label: "All Ratings", stars: "⭐" },
    { value: 5, label: "", stars: "⭐⭐⭐⭐⭐" },
    { value: 4, label: "", stars: "⭐⭐⭐⭐" },
    { value: 3, label: "", stars: "⭐⭐⭐" },
    { value: 2, label: "", stars: "⭐⭐" },
    { value: 1, label: "", stars: "⭐" }
  ];

  // Fetch initial data
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

        // Fetch initial products (public route)
        console.log("🛍️ Fetching initial products...");
        const productsRes = await axios.get("http://localhost:4001/api/v1/products");
        const productsData = productsRes.data.products || productsRes.data || [];
        
        // Store all products for infinite scroll
        setAllProducts(productsData);
        
        // Show first 6 products initially (changed from 8 to 6)
        const initialProducts = productsData.slice(0, 6);
        setProducts(initialProducts);
        console.log("✅ Products loaded:", productsData.length);
        console.log("📦 Initial products displayed:", initialProducts.length);

        // Set hasMore based on whether there are more products to load
        setHasMore(productsData.length > 6);

        // Calculate max price for slider
        if (productsData.length > 0) {
          const highest = Math.max(...productsData.map(p => p.price));
          setMaxPrice(Math.ceil(highest / 1000) * 1000); // Round up to nearest 1000
          setPriceRange({ min: 0, max: Math.ceil(highest / 1000) * 1000 });
        }

        const initialIndexes = {};
        initialProducts.forEach((product) => {
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

  // Filter products function - UPDATED with stock sorting
  const filterProducts = (productsList) => {
    let filtered = productsList.filter((product) => {
      // Price filter
      const passesPrice = product.price >= priceRange.min && product.price <= priceRange.max;
      
      // Category filter
      const passesCategory = selectedCategory === "all" || product.category === selectedCategory;
      
      // Rating filter - FIXED: Show products with exactly the selected rating
      const passesRating = selectedRating === 0 || Math.floor(product.ratings) === selectedRating;
      
      // Search filter
      const passesSearch = searchQuery === "" || 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Stock filter
      const inStock = product.stock > 0;
      
      return passesPrice && passesCategory && passesRating && passesSearch && inStock;
    });

    // NEW: Apply stock sorting if selected
    if (stockSort === 'high-to-low') {
      filtered = filtered.sort((a, b) => b.stock - a.stock);
    } else if (stockSort === 'low-to-high') {
      filtered = filtered.sort((a, b) => a.stock - b.stock);
    }

    return filtered;
  };

  // Get filtered products
  const filteredProducts = filterProducts(allProducts);

  // Load more products for infinite scroll - FIXED VERSION
  const loadMoreProducts = useCallback(() => {
    if (loadingMore || !hasMore) return;

    console.log("🔄 Loading more products...", { currentPage, hasMore });

    setLoadingMore(true);
    
    setTimeout(() => {
      const nextPage = currentPage + 1;
      const productsPerPage = 6;
      const startIndex = products.length; // Start from current loaded count
      const endIndex = startIndex + productsPerPage;
      
      console.log("📊 Loading products:", { startIndex, endIndex, total: filteredProducts.length });

      if (startIndex >= filteredProducts.length) {
        console.log("⏹️ No more products to load");
        setHasMore(false);
        setLoadingMore(false);
        return;
      }
      
      const nextProducts = [...products, ...filteredProducts.slice(startIndex, endIndex)];
      console.log("✅ Loaded products:", nextProducts.length);
      
      setProducts(nextProducts);
      setCurrentPage(nextPage);
      
      // Check if there are more products to load
      const hasMoreProducts = endIndex < filteredProducts.length;
      setHasMore(hasMoreProducts);
      console.log("🔍 More products available:", hasMoreProducts);
      
      // Update image indexes for new products
      const newIndexes = { ...currentImageIndexes };
      nextProducts.forEach((product) => {
        if (product.images && product.images.length > 0 && !newIndexes[product._id]) {
          newIndexes[product._id] = 0;
        }
      });
      setCurrentImageIndexes(newIndexes);
      
      setLoadingMore(false);
    }, 800); // Small delay for better UX
  }, [currentPage, loadingMore, hasMore, filteredProducts, products, currentImageIndexes]);

  // Update products when filters change - FIXED VERSION
  useEffect(() => {
    if (allProducts.length === 0) return;
    
    console.log("🔄 Filters changed, updating products...");
    setLoadingProducts(true);
    
    const filtered = filterProducts(allProducts);
    console.log("📊 Filtered products:", filtered.length);
    
    const initialProducts = filtered.slice(0, 6);
    setProducts(initialProducts);
    setCurrentPage(1);
    
    const hasMoreProducts = filtered.length > 6;
    setHasMore(hasMoreProducts);
    console.log("🔍 More products available after filter:", hasMoreProducts);
    
    // Reset image indexes
    const newIndexes = {};
    initialProducts.forEach((product) => {
      if (product.images && product.images.length > 0) {
        newIndexes[product._id] = 0;
      }
    });
    setCurrentImageIndexes(newIndexes);
    
    setLoadingProducts(false);
  }, [priceRange, selectedCategory, selectedRating, searchQuery, stockSort, allProducts]); // Added stockSort to dependencies

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.rating-dropdown')) {
        setIsRatingDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  // NEW: Handle stock sorting
  const handleStockSort = (sortType) => {
    if (stockSort === sortType) {
      // If clicking the same sort type again, remove the sort
      setStockSort(null);
    } else {
      setStockSort(sortType);
    }
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
    setSearchQuery("");
    setStockSort(null); // NEW: Clear stock sort
    setIsRatingDropdownOpen(false);
  };

  // Handle rating selection from dropdown
  const handleRatingSelect = (rating) => {
    setSelectedRating(rating);
    setIsRatingDropdownOpen(false);
  };

  // Get current rating label
  const getCurrentRatingLabel = () => {
    const option = ratingOptions.find(opt => opt.value === selectedRating);
    return option ? option.label : "All Ratings";
  };

  // Get current rating stars
  const getCurrentRatingStars = () => {
    const option = ratingOptions.find(opt => opt.value === selectedRating);
    return option ? option.stars : "⭐";
  };

  // Render star rating with half stars
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<StarIcon key={i} style={{ color: "#d4af37", fontSize: "18px" }} />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<StarHalfIcon key={i} style={{ color: "#d4af37", fontSize: "18px" }} />);
      } else {
        stars.push(<StarBorderIcon key={i} style={{ color: "#666", fontSize: "18px" }} />);
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

  // Get displayed products count
  const displayedProductsCount = products.length;
  const totalFilteredProducts = filteredProducts.length;

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
        user={user}
        cartCount={cartCount}
        backendConnected={backendConnected}
        handleLogout={handleLogout}
      />

      {loadingUser ? (
        <div style={{ textAlign: 'center', padding: '40px', flex: 1 }}>
          <Loader />
          <p style={{ color: "#d4af37", marginTop: "15px" }}>Loading user data...</p>
        </div>
      ) : user ? (
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
              maxWidth: '1200px',
              color: '#d4af37',
              fontWeight: '600',
              animation: 'fadeIn 0.5s ease-out',
              boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
              marginLeft: '20px',
              marginRight: '20px'
            }}>
              <strong>⚠️ Limited Functionality:</strong> Backend connection issue. You can browse products but some features may not work.
              <button 
                onClick={handleRetryBackend}
                style={{
                  marginLeft: '15px',
                  padding: '8px 16px',
                  background: "linear-gradient(135deg, #d4af37 0%, #f9e076 100%)",
                  color: '#1a1a1a',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow = "0 4px 12px rgba(212,175,55,0.4)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "none";
                }}
              >
                Retry Connection
              </button>
            </div>
          )}

          <div style={{ maxWidth: "1400px", margin: "0 auto", width: "100%", padding: "0 20px" }}>
            {/* Hero Section */}
            <div style={{
              background: "linear-gradient(135deg, rgba(212,175,55,0.15) 0%, rgba(192,156,39,0.1) 100%)",
              backdropFilter: "blur(15px)",
              padding: "40px 30px",
              borderRadius: "18px",
              boxShadow: "0 12px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(212,175,55,0.2)",
              marginBottom: "35px",
              border: "1px solid rgba(212,175,55,0.3)",
              position: "relative",
              overflow: "hidden",
              animation: "fadeIn 0.8s ease-out",
              textAlign: "center"
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

              <div style={{
                width: "80px",
                height: "80px",
                background: "linear-gradient(135deg, #d4af37, #f9e076)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "2.5rem",
                boxShadow: "0 4px 15px rgba(212,175,55,0.4)",
                animation: "float 4s ease-in-out infinite",
                margin: "0 auto 20px",
                border: "3px solid rgba(212,175,55,0.5)"
              }}>
                🎵
              </div>

              <h1 style={{
                background: "linear-gradient(135deg, #d4af37, #f9e076, #d4af37)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundSize: "200% 100%",
                animation: "shimmer 3s infinite linear",
                fontSize: "3rem",
                fontWeight: "bold",
                marginBottom: "15px",
                textShadow: "0 2px 4px rgba(0,0,0,0.3)"
              }}>
                HarmoniaHub
              </h1>
              <p style={{
                color: "rgba(255,255,255,0.8)",
                fontSize: "1.2rem",
                marginBottom: "0",
                fontWeight: "500"
              }}>
                Discover Premium Musical Instruments
              </p>
            </div>

            {/* Filter Section */}
            <div style={{
              background: "linear-gradient(135deg, rgba(30,30,30,0.95) 0%, rgba(40,40,40,0.95) 100%)",
              padding: "30px",
              borderRadius: "18px",
              boxShadow: "0 12px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(212,175,55,0.2)",
              marginBottom: "35px",
              border: "1px solid rgba(212,175,55,0.3)",
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

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "25px" }}>
                <h3 style={{ 
                  margin: 0, 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "12px", 
                  color: "#d4af37",
                  fontSize: "1.5rem",
                  fontWeight: "bold"
                }}>
                  <FilterListIcon style={{ color: "#d4af37" }} /> Product Filters
                </h3>
                <button
                  onClick={handleClearFilters}
                  style={{
                    padding: "12px 20px",
                    background: "linear-gradient(135deg, #d4af37 0%, #f9e076 100%)",
                    color: "#1a1a1a",
                    border: "none",
                    borderRadius: "12px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "14px",
                    fontWeight: "700",
                    transition: "all 0.3s ease",
                    boxShadow: "0 4px 15px rgba(212,175,55,0.3)"
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = "translateY(-3px)";
                    e.target.style.boxShadow = "0 8px 25px rgba(212,175,55,0.5)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = "0 4px 15px rgba(212,175,55,0.3)";
                  }}
                >
                  <ClearIcon fontSize="small" /> Clear Filters
                </button>
              </div>

              {/* Search Bar */}
              <div style={{ marginBottom: "25px" }}>
                <div style={{ position: "relative" }}>
                  <SearchIcon style={{
                    position: "absolute",
                    left: "15px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#d4af37",
                    fontSize: "1.5rem"
                  }} />
                  <input
                    type="text"
                    placeholder="Search products by name, category, or description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "15px 20px 15px 50px",
                      background: "rgba(255,255,255,0.05)",
                      border: "2px solid rgba(212,175,55,0.3)",
                      borderRadius: "12px",
                      fontSize: "16px",
                      color: "#ffffff",
                      transition: "all 0.3s ease",
                      boxShadow: "inset 0 2px 8px rgba(0,0,0,0.2)"
                    }}
                    onFocus={(e) => {
                      e.target.style.border = "2px solid rgba(212,175,55,0.6)";
                      e.target.style.boxShadow = "inset 0 2px 8px rgba(0,0,0,0.3), 0 0 0 3px rgba(212,175,55,0.1)";
                    }}
                    onBlur={(e) => {
                      e.target.style.border = "2px solid rgba(212,175,55,0.3)";
                      e.target.style.boxShadow = "inset 0 2px 8px rgba(0,0,0,0.2)";
                    }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "30px" }}>
                {/* Price Range Filter */}
                <div>
                  <label style={{ 
                    fontWeight: "700", 
                    marginBottom: "15px", 
                    display: "block", 
                    color: "#d4af37",
                    fontSize: "1.1rem"
                  }}>
                    Price Range: ₱{priceRange.min.toLocaleString()} - ₱{priceRange.max.toLocaleString()}
                  </label>
                  <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                    <input
                      type="range"
                      min="0"
                      max={maxPrice}
                      value={priceRange.max}
                      onChange={(e) => setPriceRange({ ...priceRange, max: parseInt(e.target.value) })}
                      style={{ 
                        width: "100%", 
                        height: "8px", 
                        borderRadius: "4px",
                        background: "rgba(212,175,55,0.3)",
                        outline: "none",
                        WebkitAppearance: "none"
                      }}
                    />
                    <div style={{ display: "flex", gap: "15px" }}>
                      <input
                        type="number"
                        placeholder="Min"
                        value={priceRange.min}
                        onChange={(e) => setPriceRange({ ...priceRange, min: parseInt(e.target.value) || 0 })}
                        style={{
                          flex: 1,
                          padding: "12px 15px",
                          background: "rgba(255,255,255,0.05)",
                          border: "2px solid rgba(212,175,55,0.3)",
                          borderRadius: "10px",
                          fontSize: "14px",
                          color: "#ffffff",
                          transition: "all 0.3s ease"
                        }}
                        onFocus={(e) => e.target.style.border = "2px solid rgba(212,175,55,0.6)"}
                        onBlur={(e) => e.target.style.border = "2px solid rgba(212,175,55,0.3)"}
                      />
                      <input
                        type="number"
                        placeholder="Max"
                        value={priceRange.max}
                        onChange={(e) => setPriceRange({ ...priceRange, max: parseInt(e.target.value) || maxPrice })}
                        style={{
                          flex: 1,
                          padding: "12px 15px",
                          background: "rgba(255,255,255,0.05)",
                          border: "2px solid rgba(212,175,55,0.3)",
                          borderRadius: "10px",
                          fontSize: "14px",
                          color: "#ffffff",
                          transition: "all 0.3s ease"
                        }}
                        onFocus={(e) => e.target.style.border = "2px solid rgba(212,175,55,0.6)"}
                        onBlur={(e) => e.target.style.border = "2px solid rgba(212,175,55,0.3)"}
                      />
                    </div>
                  </div>
                </div>

                {/* Category Filter */}
                <div>
                  <label style={{ 
                    fontWeight: "700", 
                    marginBottom: "15px", 
                    display: "block", 
                    color: "#d4af37",
                    fontSize: "1.1rem"
                  }}>
                     Category
                  </label>
                  <div style={{ position: "relative" }}>
                    <ExpandMoreIcon style={{
                      position: "absolute",
                      right: "15px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#d4af37",
                      pointerEvents: "none"
                    }} />
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "15px 45px 15px 15px",
                        background: "rgba(255,255,255,0.05)",
                        border: "2px solid rgba(212,175,55,0.3)",
                        borderRadius: "10px",
                        fontSize: "14px",
                        color: "#000000ff",
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                        appearance: "none",
                        WebkitAppearance: "none"
                      }}
                      onFocus={(e) => e.target.style.border = "2px solid rgba(212,175,55,0.6)"}
                      onBlur={(e) => e.target.style.border = "2px solid rgba(212,175,55,0.3)"}
                    >
                      <option value="all">All Categories</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Rating Filter - Dropdown with Scroll */}
                <div className="rating-dropdown">
                  <label style={{ 
                    fontWeight: "700", 
                    marginBottom: "15px", 
                    display: "block", 
                    color: "#d4af37",
                    fontSize: "1.1rem"
                  }}>
                    ⭐ Minimum Rating
                  </label>
                  <div style={{ position: "relative" }}>
                    <button
                      onClick={() => setIsRatingDropdownOpen(!isRatingDropdownOpen)}
                      style={{
                        width: "100%",
                        padding: "15px 45px 15px 15px",
                        background: "rgba(255,255,255,0.05)",
                        border: "2px solid rgba(212,175,55,0.3)",
                        borderRadius: "10px",
                        fontSize: "14px",
                        color: "#ffffff",
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                        textAlign: "left",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                      }}
                      onFocus={(e) => e.target.style.border = "2px solid rgba(212,175,55,0.6)"}
                      onBlur={(e) => e.target.style.border = "2px solid rgba(212,175,55,0.3)"}
                    >
                      <span>
                        {getCurrentRatingStars()} {getCurrentRatingLabel()}
                      </span>
                      <KeyboardArrowDownIcon 
                        style={{ 
                          color: "#d4af37",
                          transition: "transform 0.3s ease",
                          transform: isRatingDropdownOpen ? "rotate(180deg)" : "rotate(0)"
                        }} 
                      />
                    </button>

                    {isRatingDropdownOpen && (
                      <div style={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        right: 0,
                        background: "rgba(30,30,30,0.95)",
                        border: "2px solid rgba(212,175,55,0.3)",
                        borderRadius: "10px",
                        marginTop: "5px",
                        zIndex: 1000,
                        boxShadow: "0 8px 25px rgba(0,0,0,0.4)",
                        backdropFilter: "blur(10px)",
                        overflow: "hidden",
                        maxHeight: "200px", // Added max height for scroll
                        overflowY: "auto" // Added scroll for dropdown
                      }}>
                        {ratingOptions.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => handleRatingSelect(option.value)}
                            style={{
                              width: "100%",
                              padding: "12px 15px",
                              background: selectedRating === option.value 
                                ? "rgba(212,175,55,0.2)" 
                                : "transparent",
                              border: "none",
                              color: selectedRating === option.value ? "#d4af37" : "#ffffff",
                              cursor: "pointer",
                              fontSize: "14px",
                              textAlign: "left",
                              transition: "all 0.3s ease",
                              display: "flex",
                              alignItems: "center",
                              gap: "10px",
                              borderBottom: "1px solid rgba(212,175,55,0.1)"
                            }}
                            onMouseEnter={(e) => {
                              if (selectedRating !== option.value) {
                                e.target.style.background = "rgba(212,175,55,0.1)";
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (selectedRating !== option.value) {
                                e.target.style.background = "transparent";
                              }
                            }}
                          >
                            <span style={{ fontSize: "16px", minWidth: "70px" }}>{option.stars}</span>
                            <span>{option.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* NEW: Stock Sorting Filter */}
                <div>
                  <label style={{ 
                    fontWeight: "700", 
                    marginBottom: "15px", 
                    display: "block", 
                    color: "#d4af37",
                    fontSize: "1.1rem"
                  }}>
                    📦 Sort by Stock
                  </label>
                  <div style={{ 
                    display: "flex", 
                    gap: "12px",
                    alignItems: "center"
                  }}>
                    <button
                      onClick={() => handleStockSort('high-to-low')}
                      style={{
                        flex: 1,
                        padding: "12px 15px",
                        background: stockSort === 'high-to-low' 
                          ? "linear-gradient(135deg, #d4af37 0%, #f9e076 100%)" 
                          : "rgba(255,255,255,0.05)",
                        color: stockSort === 'high-to-low' ? "#1a1a1a" : "#ffffff",
                        border: stockSort === 'high-to-low' 
                          ? "none" 
                          : "2px solid rgba(212,175,55,0.3)",
                        borderRadius: "10px",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: "700",
                        transition: "all 0.3s ease",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        boxShadow: stockSort === 'high-to-low' ? "0 4px 15px rgba(212,175,55,0.4)" : "none"
                      }}
                      onMouseEnter={(e) => {
                        if (stockSort !== 'high-to-low') {
                          e.target.style.background = "rgba(212,175,55,0.1)";
                          e.target.style.transform = "translateY(-2px)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (stockSort !== 'high-to-low') {
                          e.target.style.background = "rgba(255,255,255,0.05)";
                          e.target.style.transform = "translateY(0)";
                        }
                      }}
                    >
                      <ArrowUpwardIcon fontSize="small" />
                      High to Low
                    </button>
                    <button
                      onClick={() => handleStockSort('low-to-high')}
                      style={{
                        flex: 1,
                        padding: "12px 15px",
                        background: stockSort === 'low-to-high' 
                          ? "linear-gradient(135deg, #d4af37 0%, #f9e076 100%)" 
                          : "rgba(255,255,255,0.05)",
                        color: stockSort === 'low-to-high' ? "#1a1a1a" : "#ffffff",
                        border: stockSort === 'low-to-high' 
                          ? "none" 
                          : "2px solid rgba(212,175,55,0.3)",
                        borderRadius: "10px",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: "700",
                        transition: "all 0.3s ease",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        boxShadow: stockSort === 'low-to-high' ? "0 4px 15px rgba(212,175,55,0.4)" : "none"
                      }}
                      onMouseEnter={(e) => {
                        if (stockSort !== 'low-to-high') {
                          e.target.style.background = "rgba(212,175,55,0.1)";
                          e.target.style.transform = "translateY(-2px)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (stockSort !== 'low-to-high') {
                          e.target.style.background = "rgba(255,255,255,0.05)";
                          e.target.style.transform = "translateY(0)";
                        }
                      }}
                    >
                      <ArrowDownwardIcon fontSize="small" />
                      Low to High
                    </button>
                  </div>
                  {stockSort && (
                    <div style={{ 
                      marginTop: "10px", 
                      fontSize: "12px", 
                      color: "rgba(212,175,55,0.8)",
                      textAlign: "center"
                    }}>
                      {stockSort === 'high-to-low' ? "Showing highest stock first" : "Showing lowest stock first"}
                    </div>
                  )}
                </div>
              </div>

              {/* Filter Results Count */}
              <div style={{ 
                marginTop: "25px", 
                fontSize: "16px", 
                color: "rgba(212,175,55,0.8)", 
                textAlign: "center",
                padding: "15px",
                background: "rgba(212,175,55,0.1)",
                borderRadius: "12px",
                border: "1px solid rgba(212,175,55,0.2)",
                fontWeight: "600"
              }}>
                Showing <strong style={{ color: "#d4af37" }}>{displayedProductsCount}</strong> of <strong style={{ color: "#d4af37" }}>{totalFilteredProducts}</strong> available products
                {hasMore && displayedProductsCount < totalFilteredProducts && (
                  <div style={{ marginTop: "8px", fontSize: "14px", color: "rgba(212,175,55,0.7)" }}>
                    Scroll down to load more products...
                  </div>
                )}
              </div>
            </div>
            
            <h2 style={{ 
              background: "linear-gradient(135deg, #d4af37, #f9e076, #d4af37)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundSize: "200% 100%",
              animation: "shimmer 3s infinite linear",
              marginBottom: "30px", 
              fontSize: "2.5rem",
              fontWeight: "bold",
              textAlign: "center",
              textShadow: "0 2px 4px rgba(0,0,0,0.3)"
            }}>
              🎼 Available Products
            </h2>

            {loadingProducts ? (
              <div className="loader-container" style={{ textAlign: "center", padding: "80px" }}>
                <Loader />
                <p style={{ marginTop: "20px", color: "#d4af37", fontSize: "18px", fontWeight: "600" }}>Loading products...</p>
              </div>
            ) : products.length === 0 ? (
              <div style={{ 
                textAlign: "center", 
                padding: "80px",
                background: "linear-gradient(135deg, rgba(30,30,30,0.9) 0%, rgba(40,40,40,0.9) 100%)",
                borderRadius: "18px",
                border: "2px dashed rgba(212,175,55,0.3)",
                animation: "fadeIn 0.8s ease-out"
              }}>
                <div style={{
                  fontSize: "4rem",
                  marginBottom: "20px",
                  opacity: "0.7"
                }}>
                </div>
                <p style={{ fontSize: "20px", color: "rgba(255,255,255,0.8)", marginBottom: "25px", fontWeight: "500" }}>No products match your filters.</p>
                <button
                  onClick={handleClearFilters}
                  style={{
                    padding: "15px 30px",
                    background: "linear-gradient(135deg, #d4af37 0%, #f9e076 100%)",
                    color: "#1a1a1a",
                    border: "none",
                    borderRadius: "12px",
                    cursor: "pointer",
                    fontSize: "16px",
                    fontWeight: "700",
                    transition: "all 0.3s ease",
                    boxShadow: "0 6px 20px rgba(212,175,55,0.4)"
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = "translateY(-3px)";
                    e.target.style.boxShadow = "0 10px 25px rgba(212,175,55,0.6)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = "0 6px 20px rgba(212,175,55,0.4)";
                  }}
                >
                  Clear Filters & Show All Products
                </button>
              </div>
            ) : (
              <>
                <div className="products-grid" style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
                  gap: "30px",
                  padding: "10px 0"
                }}>
                  {products.map((product, index) => {
                    const currentIndex = currentImageIndexes[product._id] || 0;
                    const totalImages = product.images?.length || 0;
                    const hasMultipleImages = totalImages > 1;
                    const isReviewsExpanded = expandedReviews[product._id];
                    const reviews = productReviews[product._id] || [];
                    const isLoadingReviews = loadingReviews[product._id];

                    // Add ref to the last product element for infinite scroll
                    const isLastProduct = index === products.length - 1;
                    
                    return (
                      <div
                        key={product._id}
                        ref={isLastProduct ? lastProductElementRef : null}
                        className="product-card"
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between",
                          padding: "25px",
                          borderRadius: "18px",
                          background: "linear-gradient(135deg, rgba(30,30,30,0.9) 0%, rgba(40,40,40,0.9) 100%)",
                          boxShadow: "0 12px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(212,175,55,0.2)",
                          border: "1px solid rgba(212,175,55,0.3)",
                          transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                          position: "relative",
                          overflow: "hidden",
                          animation: "fadeIn 0.8s ease-out"
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "translateY(-8px) scale(1.02)";
                          e.currentTarget.style.boxShadow = "0 20px 50px rgba(0,0,0,0.5), inset 0 1px 0 rgba(212,175,55,0.2)";
                          e.currentTarget.style.border = "1px solid rgba(212,175,55,0.5)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "translateY(0) scale(1)";
                          e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(212,175,55,0.2)";
                          e.currentTarget.style.border = "1px solid rgba(212,175,55,0.3)";
                        }}
                      >
                        {/* Stock Badge */}
                        <div style={{
                          position: "absolute",
                          top: "20px",
                          right: "20px",
                          background: product.stock > 10 
                            ? "linear-gradient(135deg, #27ae60, #2ecc71)" 
                            : product.stock > 0 
                              ? "linear-gradient(135deg, #f39c12, #f1c40f)"
                              : "linear-gradient(135deg, #e74c3c, #c0392b)",
                          color: "white",
                          padding: "6px 14px",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: "700",
                          zIndex: 2,
                          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                          border: "1px solid rgba(255,255,255,0.2)"
                        }}>
                          {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                        </div>

                        <div style={{ position: "relative" }}>
                          <img
                            src={product.images?.[currentIndex]?.url}
                            alt={product.name}
                            style={{
                              width: "100%",
                              height: "240px",
                              objectFit: "cover",
                              borderRadius: "12px",
                              marginBottom: "20px",
                              border: "2px solid rgba(212,175,55,0.2)",
                              boxShadow: "0 4px 15px rgba(0,0,0,0.3)"
                            }}
                          />
                          {hasMultipleImages && (
                            <>
                              <button
                                onClick={(e) => prevImage(product._id, totalImages, e)}
                                style={{
                                  position: "absolute",
                                  left: "12px",
                                  top: "50%",
                                  transform: "translateY(-50%)",
                                  background: "rgba(212,175,55,0.8)",
                                  color: "#1a1a1a",
                                  border: "none",
                                  borderRadius: "50%",
                                  width: "36px",
                                  height: "36px",
                                  fontSize: "18px",
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  transition: "all 0.3s ease",
                                  fontWeight: "bold",
                                  boxShadow: "0 4px 12px rgba(0,0,0,0.3)"
                                }}
                                onMouseOver={(e) => {
                                  e.target.style.background = "rgba(212,175,55,1)";
                                  e.target.style.transform = "translateY(-50%) scale(1.1)";
                                }}
                                onMouseOut={(e) => {
                                  e.target.style.background = "rgba(212,175,55,0.8)";
                                  e.target.style.transform = "translateY(-50%) scale(1)";
                                }}
                              >
                                ‹
                              </button>
                              <button
                                onClick={(e) => nextImage(product._id, totalImages, e)}
                                style={{
                                  position: "absolute",
                                  right: "12px",
                                  top: "50%",
                                  transform: "translateY(-50%)",
                                  background: "rgba(212,175,55,0.8)",
                                  color: "#1a1a1a",
                                  border: "none",
                                  borderRadius: "50%",
                                  width: "36px",
                                  height: "36px",
                                  fontSize: "18px",
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  transition: "all 0.3s ease",
                                  fontWeight: "bold",
                                  boxShadow: "0 4px 12px rgba(0,0,0,0.3)"
                                }}
                                onMouseOver={(e) => {
                                  e.target.style.background = "rgba(212,175,55,1)";
                                  e.target.style.transform = "translateY(-50%) scale(1.1)";
                                }}
                                onMouseOut={(e) => {
                                  e.target.style.background = "rgba(212,175,55,0.8)";
                                  e.target.style.transform = "translateY(-50%) scale(1)";
                                }}
                              >
                                ›
                              </button>
                            </>
                          )}
                        </div>

                        <div style={{ marginBottom: "25px" }}>
                          <h3 style={{ 
                            fontSize: "1.4rem", 
                            marginBottom: "12px", 
                            color: "#ffffff",
                            fontWeight: "700",
                            lineHeight: "1.3",
                            textShadow: "0 2px 4px rgba(0,0,0,0.3)"
                          }}>
                            {product.name}
                          </h3>
                          
                          <p style={{ 
                            marginBottom: "15px", 
                            fontWeight: "800", 
                            background: "linear-gradient(135deg, #d4af37, #f9e076, #d4af37)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            backgroundSize: "200% 100%",
                            animation: "shimmer 3s infinite linear",
                            fontSize: "1.6rem",
                            textShadow: "0 2px 4px rgba(0,0,0,0.3)"
                          }}>
                            ₱{product.price.toLocaleString()}
                          </p>
                          
                          <div style={{ 
                            display: "flex", 
                            alignItems: "center", 
                            gap: "10px", 
                            marginBottom: "15px",
                            flexWrap: "wrap"
                          }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                              {renderStars(product.ratings)}
                            </div>
                            <span style={{ 
                              fontSize: "15px", 
                              color: "rgba(255,255,255,0.7)",
                              fontWeight: "600"
                            }}>
                              ({product.ratings.toFixed(1)}) • {product.numOfReviews || 0} reviews
                            </span>
                          </div>
                          
                          <p style={{ 
                            marginBottom: "12px", 
                            fontSize: "14px", 
                            color: "rgba(255,255,255,0.8)",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px"
                          }}>
                            <span style={{
                              background: "rgba(212,175,55,0.2)",
                              color: "#d4af37",
                              padding: "6px 12px",
                              borderRadius: "15px",
                              fontSize: "13px",
                              fontWeight: "700",
                              border: "1px solid rgba(212,175,55,0.3)"
                            }}>
                              {product.category}
                            </span>
                          </p>
                        </div>

                        {/* Reviews Section */}
                        <div style={{ marginBottom: "25px" }}>
                          <button
                            onClick={() => toggleReviews(product._id)}
                            disabled={isLoadingReviews}
                            style={{
                              width: "100%",
                              padding: "14px",
                              background: isReviewsExpanded 
                                ? "linear-gradient(135deg, #d4af37 0%, #f9e076 100%)" 
                                : "rgba(212,175,55,0.1)",
                              color: isReviewsExpanded ? "#1a1a1a" : "#d4af37",
                              border: isReviewsExpanded ? "none" : "2px solid rgba(212,175,55,0.4)",
                              borderRadius: "12px",
                              cursor: "pointer",
                              fontSize: "15px",
                              fontWeight: "700",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "10px",
                              transition: "all 0.3s ease",
                              boxShadow: isReviewsExpanded ? "0 4px 15px rgba(212,175,55,0.4)" : "none"
                            }}
                            onMouseOver={(e) => {
                              if (!isReviewsExpanded && !isLoadingReviews) {
                                e.target.style.background = "rgba(212,175,55,0.2)";
                                e.target.style.transform = "translateY(-2px)";
                              }
                            }}
                            onMouseOut={(e) => {
                              if (!isReviewsExpanded && !isLoadingReviews) {
                                e.target.style.background = "rgba(212,175,55,0.1)";
                                e.target.style.transform = "translateY(0)";
                              }
                            }}
                          >
                            {isLoadingReviews ? (
                              <> Loading Reviews...</>
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
                              marginTop: "20px",
                              maxHeight: "220px",
                              overflowY: "auto",
                              border: "1px solid rgba(212,175,55,0.2)",
                              borderRadius: "12px",
                              padding: "20px",
                              background: "rgba(20,20,20,0.6)",
                              backdropFilter: "blur(10px)"
                            }}>
                              {reviews.length === 0 ? (
                                <p style={{ 
                                  textAlign: "center", 
                                  color: "rgba(255,255,255,0.6)", 
                                  fontSize: "15px",
                                  fontStyle: "italic",
                                  margin: "0"
                                }}>
                                    No reviews yet. Be the first to review this product!
                                </p>
                              ) : (
                                reviews.map((review) => (
                                  <div key={review._id} style={{
                                    padding: "15px",
                                    marginBottom: "12px",
                                    background: "rgba(255,255,255,0.05)",
                                    borderRadius: "10px",
                                    border: "1px solid rgba(212,175,55,0.1)",
                                    boxShadow: "0 4px 12px rgba(0,0,0,0.2)"
                                  }}>
                                    <div style={{ 
                                      display: "flex", 
                                      justifyContent: "space-between",
                                      alignItems: "flex-start",
                                      marginBottom: "10px"
                                    }}>
                                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                        <PersonIcon style={{ color: "#d4af37", fontSize: "18px" }} />
                                        <span style={{ fontWeight: "700", fontSize: "15px", color: "#ffffff" }}>
                                          {review.user?.name || review.name}
                                        </span>
                                      </div>
                                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                        <CalendarTodayIcon style={{ color: "rgba(212,175,55,0.7)", fontSize: "16px" }} />
                                        <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)" }}>
                                          {formatDate(review.createdAt)}
                                        </span>
                                      </div>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "10px" }}>
                                      {renderStars(review.rating)}
                                    </div>
                                    <p style={{ 
                                      fontSize: "15px", 
                                      color: "rgba(255,255,255,0.9)",
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
                            gap: "15px",
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
                              gap: "8px",
                              padding: "14px 12px",
                              background: (!backendConnected || product.stock === 0) 
                                ? "rgba(255,255,255,0.1)" 
                                : "linear-gradient(135deg, #d4af37 0%, #f9e076 100%)",
                              color: (!backendConnected || product.stock === 0) ? "rgba(255,255,255,0.3)" : "#1a1a1a",
                              border: "none",
                              borderRadius: "12px",
                              cursor: (!backendConnected || product.stock === 0) ? "not-allowed" : "pointer",
                              fontWeight: "700",
                              fontSize: "15px",
                              transition: "all 0.3s ease",
                              boxShadow: (!backendConnected || product.stock === 0) ? "none" : "0 6px 20px rgba(212,175,55,0.4)"
                            }}
                            onMouseOver={(e) => {
                              if (backendConnected && product.stock > 0) {
                                e.target.style.transform = "translateY(-3px)";
                                e.target.style.boxShadow = "0 10px 25px rgba(212,175,55,0.6)";
                              }
                            }}
                            onMouseOut={(e) => {
                              if (backendConnected && product.stock > 0) {
                                e.target.style.transform = "translateY(0)";
                                e.target.style.boxShadow = "0 6px 20px rgba(212,175,55,0.4)";
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
                              gap: "8px",
                              padding: "14px 12px",
                              background: (processingCheckout === product._id || !backendConnected || product.stock === 0) 
                                ? "rgba(255,255,255,0.1)" 
                                : "linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)",
                              color: (processingCheckout === product._id || !backendConnected || product.stock === 0) 
                                ? "rgba(255,255,255,0.3)" 
                                : "#ffffff",
                              border: "none",
                              borderRadius: "12px",
                              cursor: (processingCheckout === product._id || !backendConnected || product.stock === 0) ? "not-allowed" : "pointer",
                              fontWeight: "700",
                              fontSize: "15px",
                              transition: "all 0.3s ease",
                              boxShadow: (processingCheckout === product._id || !backendConnected || product.stock === 0) ? "none" : "0 6px 20px rgba(39, 174, 96, 0.4)"
                            }}
                            onMouseOver={(e) => {
                              if (backendConnected && product.stock > 0 && processingCheckout !== product._id) {
                                e.target.style.transform = "translateY(-3px)";
                                e.target.style.boxShadow = "0 10px 25px rgba(39, 174, 96, 0.6)";
                              }
                            }}
                            onMouseOut={(e) => {
                              if (backendConnected && product.stock > 0 && processingCheckout !== product._id) {
                                e.target.style.transform = "translateY(0)";
                                e.target.style.boxShadow = "0 6px 20px rgba(39, 174, 96, 0.4)";
                              }
                            }}
                          >
                            {processingCheckout === product._id ? (
                              "🔄 Processing..."
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

                {/* Loading More Indicator */}
                {loadingMore && (
                  <div style={{ textAlign: "center", padding: "40px" }}>
                    <Loader />
                    <p style={{ marginTop: "15px", color: "#d4af37", fontWeight: "600" }}>Loading more products...</p>
                  </div>
                )}

                {/* End of Results Message */}
                {!hasMore && products.length > 0 && (
                  <div style={{ 
                    textAlign: "center", 
                    padding: "40px",
                    color: "rgba(212,175,55,0.8)",
                    fontSize: "16px",
                    fontWeight: "600"
                  }}>
                     You've reached the end of the products list!
                  </div>
                )}
              </>
            )}
          </div>

          {/* Floating Music Icon */}
          <div
            style={{
              position: "fixed",
              bottom: "30px",
              right: "30px",
              zIndex: "1000",
              animation: "float 4s ease-in-out infinite",
              fontSize: "2.5rem",
              filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.3))",
              opacity: "0.7"
            }}
          >
            🎵
          </div>
        </main>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px', flex: 1 }}>
          <h2 style={{ color: "#d4af37" }}>Welcome to HarmoniaHub</h2>
          <p style={{ color: "rgba(255,255,255,0.8)" }}>Please login to view products and make purchases</p>
          <Link 
            to="/login" 
            style={{ 
              marginTop: '20px', 
              display: 'inline-block', 
              padding: '12px 24px',
              background: "linear-gradient(135deg, #d4af37 0%, #f9e076 100%)",
              color: "#1a1a1a",
              borderRadius: "12px",
              textDecoration: "none",
              fontWeight: "700",
              transition: "all 0.3s ease",
              boxShadow: "0 6px 20px rgba(212,175,55,0.4)"
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 10px 25px rgba(212,175,55,0.6)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 6px 20px rgba(212,175,55,0.4)";
            }}
          >
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