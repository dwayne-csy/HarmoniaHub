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
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (token) {
          const { data } = await axios.get("http://localhost:4001/api/v1/me", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUser(data.user);

          const cartRes = await axios.get("http://localhost:4001/api/v1/cart", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setCartCount(cartRes.data.cart?.items?.length || 0);
        }

        const productsRes = await axios.get("http://localhost:4001/api/v1/products");
        const productsData = productsRes.data.products || productsRes.data || [];
        setProducts(productsData);

        const initialIndexes = {};
        productsData.forEach((product) => {
          if (product.images && product.images.length > 0) {
            initialIndexes[product._id] = 0;
          }
        });
        setCurrentImageIndexes(initialIndexes);
      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchData();
  }, [token]);

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
    if (!token) {
      alert("Please log in to add products to your cart.");
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
      alert(error.response?.data?.message || "Failed to add product to cart.");
    }
  };

  const handleCheckoutSolo = (productId) => {
    navigate(`/checkout/solo/${productId}`);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="home-container">
<header className="home-header">
  <div
        className="header-actions"
        style={{ display: "flex", gap: "15px", justifyContent: "flex-end" }}
      >
        {user ? (
          <>
            {/* Order History - icon only */}
            <button
              onClick={() => navigate("/order-history")}
              style={{
                padding: "6px",
                backgroundColor: "transparent",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                color: "#1976d2",
              }}
              title="Order History"
            >
              <HistoryIcon fontSize="large" />
            </button>

            {/* Profile */}
            <button
              onClick={() => navigate("/profile")}
              style={{
                padding: "6px",
                backgroundColor: "transparent",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                color: "#1976d2",
              }}
              title="Profile"
            >
              <AccountCircleIcon fontSize="large" />
            </button>

            {/* Cart */}
            <button
              onClick={() => navigate("/cart")}
              style={{
                padding: "6px",
                backgroundColor: "transparent",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                color: "#1976d2",
                position: "relative",
              }}
              title="Cart"
            >
              <ShoppingCartIcon fontSize="large" />
              {cartCount > 0 && (
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
          </>
        ) : (
          <Link to="/login" className="btn-primary">
            Login
          </Link>
        )}
      </div>
    </header>

      {user && (
        <main className="products-section">
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
                          style={{
                            flex: 1,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 5,
                            padding: "8px 10px",
                            backgroundColor: "#1976d2",
                            color: "#fff",
                            border: "none",
                            borderRadius: 8,
                            cursor: "pointer",
                            fontWeight: 500,
                            transition: "0.3s",
                          }}
                        >
                          <ShoppingCartIcon fontSize="small" /> Add to Cart
                        </button>

                        <button
                          onClick={() => handleCheckoutSolo(product._id)}
                          style={{
                            flex: 1,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 5,
                            padding: "8px 10px",
                            backgroundColor: "#388e3c",
                            color: "#fff",
                            border: "none",
                            borderRadius: 8,
                            cursor: "pointer",
                            fontWeight: 500,
                            transition: "0.3s",
                          }}
                        >
                          Checkout <ArrowForwardIcon fontSize="small" />
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </main>
      )}
    </div>
  );
};

export default Home;
