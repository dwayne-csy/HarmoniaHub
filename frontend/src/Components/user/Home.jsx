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
        // Fetch user profile
        if (token) {
          const { data } = await axios.get("http://localhost:4001/api/v1/me", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUser(data.user);

          // Optional: fetch cart to get current count
          const cartRes = await axios.get("http://localhost:4001/api/v1/cart", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setCartCount(cartRes.data.cart?.items?.length || 0);
        }

        // Fetch products
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
        { productId }, // <-- send productId in the body
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update cart count in UI
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
        <h1>Welcome back, {user.name}!</h1>
        <p>Your personal space for harmony and productivity</p>
        <div className="user-info">
          <img src={user.avatar?.url} alt={user.name} className="user-avatar" />
          <span className="user-role">Role: {user.role}</span>
          <Link to="/cart" className="btn-cart">
            Cart ({cartCount})
          </Link>
        </div>
        <button className="btn-logout" onClick={handleLogout}>
          Logout
        </button>
      </header>

      <div className="welcome-message">
        <h2>Hello, {user.name}!</h2>
        <p>Here's your account information:</p>
        <ul className="user-tasks">
          <li>Account Status: {user.isVerified ? "✓ Verified" : "⚠ Needs Verification"}</li>
          <li>Member Since: {new Date(user.createdAt).toLocaleDateString()}</li>
        </ul>
      </div>

      <div className="products-section">
        <h2>Available Products</h2>
        {products.length === 0 ? (
          <p>No products available at the moment.</p>
        ) : (
          <div className="products-grid">
            {products.map((product) => (
              <div key={product._id} className="product-card">
                <img src={product.images?.[0]?.url} alt={product.name} className="product-image" />
                <h3>{product.name}</h3>
                <p>Price: ${product.price}</p>
                <p>Stock: {product.stock}</p>
                <button
                  className="btn btn-primary"
                  onClick={() => handleAddToCart(product._id)}
                  disabled={product.stock === 0}
                >
                  {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
