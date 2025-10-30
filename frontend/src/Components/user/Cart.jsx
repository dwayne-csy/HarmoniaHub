import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Cart = () => {
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCart = async () => {
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const { data } = await axios.get("http://localhost:4001/api/v1/cart", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCart(data.cart || { items: [] });
      } catch (error) {
        console.error("Failed to fetch cart:", error);
        setCart({ items: [] });
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [token, navigate]);

  const handleQuantityChange = async (productId, action) => {
    try {
      const { data } = await axios.patch(
        "http://localhost:4001/api/v1/cart/update",
        { productId, action }, // action = 'increase' or 'decrease'
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCart(data.cart || { items: [] });
    } catch (error) {
      console.error("Failed to update cart:", error);
    }
  };

  const handleRemove = async (productId) => {
    try {
      const { data } = await axios.delete(
        `http://localhost:4001/api/v1/cart/remove/${productId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCart(data.cart || { items: [] });
    } catch (error) {
      console.error("Failed to remove item:", error);
    }
  };

  if (loading) return <div className="loading">Loading cart...</div>;
  if (!cart.items.length) return <p>Your cart is empty.</p>;

  return (
    <div className="cart-container">
      <h2>Your Shopping Cart</h2>
      {cart.items.map((item) => (
        <div key={item.product._id} className="cart-item">
          <img
            src={item.product.images?.[0]?.url}
            alt={item.product.name}
            className="cart-item-image"
          />
          <div className="cart-item-info">
            <h4>{item.product.name}</h4>
            <p>Price: ${item.product.price}</p>
            <div className="quantity-control">
              <button
                onClick={() => handleQuantityChange(item.product._id, "decrease")}
                disabled={item.quantity <= 1}
              >
                -
              </button>
              <span>{item.quantity}</span>
              <button
                onClick={() => handleQuantityChange(item.product._id, "increase")}
                disabled={item.quantity >= item.product.stock}
              >
                +
              </button>
            </div>
            <button onClick={() => handleRemove(item.product._id)}>Remove</button>
          </div>
        </div>
      ))}
      <h3>
        Total: $
        {cart.items.reduce(
          (acc, item) => acc + item.product.price * item.quantity,
          0
        )}
      </h3>
    </div>
  );
};

export default Cart;
