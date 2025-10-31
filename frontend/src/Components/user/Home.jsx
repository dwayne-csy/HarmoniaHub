import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Home = () => {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);
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
        setProducts(productsRes.data.products || productsRes.data || []);
      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

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

  if (loading) return <div className="loading">Loading...</div>;

  if (!user) {
    return (
      <div className="home-container">
        <header className="home-header">
          <h1>Welcome to HarmoniaHub</h1>
          <p>Please log in to access your dashboard</p>
          <Link to="/login" className="btn-primary">
            Login
          </Link>
        </header>
      </div>
    );
  }

  return (
    <div className="home-container">
      <header className="home-header">
        <div className="header-actions" style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
          <Link to="/profile" className="btn-profile">
            Profile
          </Link>
          <Link to="/cart" className="btn-cart">
            Cart ({cartCount})
          </Link>
          <button className="btn-logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <main className="products-section">
        <h2>Available Products</h2>
        {products.length === 0 ? (
          <p>No products available at the moment.</p>
        ) : (
          <div className="products-grid">
            {products
              .filter((product) => product.stock > 0)
              .map((product) => (
                <div key={product._id} className="product-card">
                  <img
                    src={product.images?.[0]?.url}
                    alt={product.name}
                    className="product-image"
                  />
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
              ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;
