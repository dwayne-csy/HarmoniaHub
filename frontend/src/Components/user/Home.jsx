import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Loader from "../layouts/Loader"; // import loader

const Home = () => {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true); // loader for products only
  const [cartCount, setCartCount] = useState(0);
  const [currentImageIndexes, setCurrentImageIndexes] = useState({}); // Track current image index for each product
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
        
        // Initialize image indexes for all products
        const initialIndexes = {};
        productsData.forEach(product => {
          if (product.images && product.images.length > 0) {
            initialIndexes[product._id] = 0;
          }
        });
        setCurrentImageIndexes(initialIndexes);
      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        setLoadingProducts(false); // stop loader after products fetch
      }
    };

    fetchData();
  }, [token]);

  // Navigation functions for image carousel
  const nextImage = (productId, totalImages, e) => {
    e.stopPropagation(); // Prevent card click events
    setCurrentImageIndexes(prev => ({
      ...prev,
      [productId]: (prev[productId] + 1) % totalImages
    }));
  };

  const prevImage = (productId, totalImages, e) => {
    e.stopPropagation(); // Prevent card click events
    setCurrentImageIndexes(prev => ({
      ...prev,
      [productId]: (prev[productId] - 1 + totalImages) % totalImages
    }));
  };

  // Auto-slide effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndexes(prev => {
        const newIndexes = { ...prev };
        
        // Update all products with multiple images
        products.forEach(product => {
          if (product.images && product.images.length > 1) {
            newIndexes[product._id] = (prev[product._id] + 1) % product.images.length;
          }
        });
        
        return newIndexes;
      });
    }, 3000); // Change image every 3 seconds

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

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="home-container">
      <header className="home-header">
        <div
          className="header-actions"
          style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}
        >
          {user ? (
            <>
              <Link to="/profile" className="btn-profile">
                Profile
              </Link>
              <Link to="/cart" className="btn-cart">
                Cart ({cartCount})
              </Link>
              <button className="btn-logout" onClick={handleLogout}>
                Logout
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

          {loadingProducts ? ( // loader affects only products
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
                    <div key={product._id} className="product-card">
                      <div style={{ position: 'relative' }}>
                        <img
                          src={product.images?.[currentIndex]?.url}
                          alt={product.name}
                          className="product-image"
                        />
                        
                        {/* Navigation arrows for multiple images */}
                        {hasMultipleImages && (
                          <>
                            <button
                              onClick={(e) => prevImage(product._id, totalImages, e)}
                              style={{
                                position: 'absolute',
                                left: 5,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                background: 'rgba(0,0,0,0.5)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '50%',
                                width: 25,
                                height: 25,
                                fontSize: 14,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              ‹
                            </button>
                            <button
                              onClick={(e) => nextImage(product._id, totalImages, e)}
                              style={{
                                position: 'absolute',
                                right: 5,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                background: 'rgba(0,0,0,0.5)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '50%',
                                width: 25,
                                height: 25,
                                fontSize: 14,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              ›
                            </button>
                            
                            {/* Image counter */}
                            <div style={{
                              position: 'absolute',
                              bottom: 5,
                              right: 5,
                              background: 'rgba(0,0,0,0.6)',
                              color: 'white',
                              fontSize: 10,
                              padding: '2px 6px',
                              borderRadius: 8
                            }}>
                              {currentIndex + 1}/{totalImages}
                            </div>
                          </>
                        )}
                      </div>
                      <h3>{product.name}</h3>
                      <p>Price: ${product.price}</p>
                      <p>Stock: {product.stock}</p>
                      <button
                        className="btn btn-primary"
                        onClick={() => handleAddToCart(product._id)}
                      >
                        Add to Cart
                      </button>
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