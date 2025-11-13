import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Loader from "../layouts/Loader";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import HistoryIcon from "@mui/icons-material/History";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LogoutIcon from "@mui/icons-material/Logout";

const Home = () => {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const [currentImageIndexes, setCurrentImageIndexes] = useState({});
  const [processingCheckout, setProcessingCheckout] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [backendConnected, setBackendConnected] = useState(true);
  const navigate = useNavigate();

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

  return (
    <div className="home-container">
      <header className="home-header">
        <div
          className="header-actions"
          style={{ display: "flex", gap: "15px", justifyContent: "flex-end", alignItems: "center" }}
        >
          {loadingUser ? (
            <div style={{ padding: '10px' }}>Loading user...</div>
          ) : user ? (
            <>
              {/* Welcome message with backend status */}
              <div style={{ display: 'flex', alignItems: 'center', marginRight: '10px', flexDirection: 'column' }}>
                <div>Welcome, {user.name}!</div>
                {!backendConnected && (
                  <div style={{ fontSize: '12px', color: 'orange', marginTop: '2px' }}>
                    ⚠️ Limited functionality
                  </div>
                )}
              </div>

              {/* Order History */}
              <button
                onClick={() => backendConnected ? navigate("/order-history") : alert("Backend connection required")}
                style={{
                  padding: "6px",
                  backgroundColor: "transparent",
                  border: "none",
                  cursor: backendConnected ? "pointer" : "not-allowed",
                  display: "flex",
                  alignItems: "center",
                  color: backendConnected ? "#1976d2" : "#ccc",
                }}
                title={backendConnected ? "Order History" : "Backend connection required"}
              >
                <HistoryIcon fontSize="large" />
              </button>

              {/* Profile */}
              <button
                onClick={() => backendConnected ? navigate("/profile") : alert("Backend connection required")}
                style={{
                  padding: "6px",
                  backgroundColor: "transparent",
                  border: "none",
                  cursor: backendConnected ? "pointer" : "not-allowed",
                  display: "flex",
                  alignItems: "center",
                  color: backendConnected ? "#1976d2" : "#ccc",
                }}
                title={backendConnected ? "Profile" : "Backend connection required"}
              >
                <AccountCircleIcon fontSize="large" />
              </button>

              {/* Cart */}
              <button
                onClick={() => backendConnected ? navigate("/cart") : alert("Backend connection required")}
                style={{
                  padding: "6px",
                  backgroundColor: "transparent",
                  border: "none",
                  cursor: backendConnected ? "pointer" : "not-allowed",
                  display: "flex",
                  alignItems: "center",
                  color: backendConnected ? "#1976d2" : "#ccc",
                  position: "relative",
                }}
                title={backendConnected ? "Cart" : "Backend connection required"}
              >
                <ShoppingCartIcon fontSize="large" />
                {cartCount > 0 && backendConnected && (
                  <span
                    style={{
                      position: "absolute",
                      top: -5,
                      right: -5,
                      backgroundColor: "red",
                      color: "white",
                      borderRadius: "50%",
                      padding: "2px 6px",
                      fontSize: 12,
                    }}
                  >
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Logout */}
              <button
                onClick={handleLogout}
                style={{
                  padding: "6px",
                  backgroundColor: "transparent",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  color: "#d32f2f",
                }}
                title="Logout"
              >
                <LogoutIcon fontSize="large" />
              </button>

              {/* Retry backend connection */}
              {!backendConnected && (
                <button
                  onClick={handleRetryBackend}
                  style={{
                    padding: "6px 12px",
                    backgroundColor: "#ff9800",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "12px",
                  }}
                  title="Retry backend connection"
                >
                  Retry
                </button>
              )}
            </>
          ) : (
            <Link to="/login" className="btn-primary">
              Login
            </Link>
          )}
        </div>
      </header>

      {loadingUser ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Loader />
          <p>Loading user data...</p>
        </div>
      ) : user ? (
        <main className="products-section">
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
              <strong>⚠️ Limited Functionality:</strong> Backend connection issue. You can browse products but some features may not work.
              <button 
                onClick={handleRetryBackend}
                style={{
                  marginLeft: '10px',
                  padding: '4px 8px',
                  backgroundColor: '#ff9800',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Retry Connection
              </button>
            </div>
          )}
          
          <h2>Available Products</h2>

          {loadingProducts ? (
            <div className="loader-container">
              <Loader />
            </div>
          ) : products.length === 0 ? (
            <p>No products available at the moment.</p>
          ) : (
            <div className="products-grid">
              {products
                .filter((product) => product.stock > 0)
                .map((product) => {
                  const currentIndex = currentImageIndexes[product._id] || 0;
                  const totalImages = product.images?.length || 0;
                  const hasMultipleImages = totalImages > 1;

                  return (
                    <div
                      key={product._id}
                      className="product-card"
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        padding: 15,
                        borderRadius: 12,
                        boxShadow: "0px 4px 10px rgba(0,0,0,0.1)",
                        backgroundColor: "#fff",
                        opacity: backendConnected ? 1 : 0.9,
                      }}
                    >
                      <div style={{ position: "relative" }}>
                        <img
                          src={product.images?.[currentIndex]?.url}
                          alt={product.name}
                          style={{
                            width: "100%",
                            height: "180px",
                            objectFit: "cover",
                            borderRadius: 10,
                          }}
                        />
                        {hasMultipleImages && (
                          <>
                            <button
                              onClick={(e) =>
                                prevImage(product._id, totalImages, e)
                              }
                              style={{
                                position: "absolute",
                                left: 5,
                                top: "50%",
                                transform: "translateY(-50%)",
                                background: "rgba(0,0,0,0.4)",
                                color: "white",
                                border: "none",
                                borderRadius: "50%",
                                width: 28,
                                height: 28,
                                fontSize: 14,
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              ‹
                            </button>
                            <button
                              onClick={(e) =>
                                nextImage(product._id, totalImages, e)
                              }
                              style={{
                                position: "absolute",
                                right: 5,
                                top: "50%",
                                transform: "translateY(-50%)",
                                background: "rgba(0,0,0,0.4)",
                                color: "white",
                                border: "none",
                                borderRadius: "50%",
                                width: 28,
                                height: 28,
                                fontSize: 14,
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              ›
                            </button>
                          </>
                        )}
                      </div>

                      <div style={{ marginTop: 10 }}>
                        <h3 style={{ fontSize: "1.1rem", marginBottom: 5 }}>
                          {product.name}
                        </h3>
                        <p style={{ marginBottom: 5 }}>Price: ${product.price}</p>
                        <p style={{ marginBottom: 10, color: "#555" }}>
                          Stock: {product.stock}
                        </p>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          gap: 10,
                          justifyContent: "space-between",
                        }}
                      >
                        <button
                          onClick={() => handleAddToCart(product._id)}
                          disabled={!backendConnected}
                          style={{
                            flex: 1,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 5,
                            padding: "8px 10px",
                            backgroundColor: backendConnected ? "#1976d2" : "#ccc",
                            color: "#fff",
                            border: "none",
                            borderRadius: 8,
                            cursor: backendConnected ? "pointer" : "not-allowed",
                            fontWeight: 500,
                            transition: "0.3s",
                          }}
                        >
                          <ShoppingCartIcon fontSize="small" /> Add to Cart
                        </button>

                        <button
                          onClick={() => handleSoloCheckout(product._id)}
                          disabled={processingCheckout === product._id || !backendConnected}
                          style={{
                            flex: 1,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 5,
                            padding: "8px 10px",
                            backgroundColor: processingCheckout === product._id ? "#6b8e23" : (backendConnected ? "#388e3c" : "#ccc"),
                            color: "#fff",
                            border: "none",
                            borderRadius: 8,
                            cursor: (processingCheckout === product._id || !backendConnected) ? "not-allowed" : "pointer",
                            fontWeight: 500,
                            transition: "0.3s",
                            opacity: (processingCheckout === product._id || !backendConnected) ? 0.7 : 1,
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
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <h2>Welcome to HarmoniaHub</h2>
          <p>Please login to view products and make purchases</p>
          <Link to="/login" className="btn-primary" style={{ marginTop: '20px', display: 'inline-block', padding: '10px 20px' }}>
            Login Now
          </Link>
        </div>
      )}
    </div>
  );
};

export default Home;