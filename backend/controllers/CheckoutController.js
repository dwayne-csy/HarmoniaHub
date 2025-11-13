// backend/controllers/CheckoutController.js
const Order = require("../models/OrderModels");
const User = require("../models/UserModels");
const Cart = require("../models/CartModels");
const Product = require("../models/ProductModels"); // Import product model

exports.checkout = async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch user
    const user = await User.findById(userId);
    if (!user) 
      return res.status(404).json({ success: false, message: "User not found" });

    // Fetch user's cart
    const cart = await Cart.findOne({ user: userId }).populate("items.product");
    if (!cart || !cart.items.length)
      return res.status(400).json({ success: false, message: "Cart is empty" });

    // Map user address to shippingInfo
    const shippingInfo = {
      address: `${user.address.street || ""}, ${user.address.barangay || ""}`,
      city: user.address.city || "",
      postalCode: user.address.zipcode || "",
      country: "Philippines",
      phoneNo: user.contact || "",
    };

    // Validate shipping info
    if (!shippingInfo.address || !shippingInfo.city || !shippingInfo.postalCode || !shippingInfo.country || !shippingInfo.phoneNo) {
      return res.status(400).json({
        success: false,
        message: "Shipping address incomplete. Please update your profile with a valid address and contact number.",
      });
    }

    // Calculate totals
    const TAX_RATE = 0.1;
    const SHIPPING_PRICE = 50;

    const itemsPrice = cart.items.reduce(
      (acc, item) => acc + item.product.price * item.quantity,
      0
    );
    const taxPrice = itemsPrice * TAX_RATE;
    const totalPrice = itemsPrice + taxPrice + SHIPPING_PRICE;

    // Create order items
    const orderItems = cart.items.map((item) => ({
      name: item.product.name,
      quantity: item.quantity,
      price: item.product.price,
      image: item.product.images?.[0]?.url || "",
      product: item.product._id,
    }));

    // Create order
    const order = await Order.create({
      user: userId,
      orderItems,
      shippingInfo,
      itemsPrice,
      taxPrice,
      shippingPrice: SHIPPING_PRICE,
      totalPrice,
      orderStatus: "Processing",
    });

    // Decrease stock for each product
    for (const item of cart.items) {
      const product = await Product.findById(item.product._id);
      if (!product) continue;

      // Reduce stock
      product.stock = Math.max(product.stock - item.quantity, 0);
      await product.save();
    }

    // Clear user's cart
    cart.items = [];
    await cart.save();

    res.status(201).json({ success: true, order });
  } catch (error) {
    console.error("Checkout error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};



exports.soloCheckout = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId, quantity = 1 } = req.body;

    // Fetch user
    const user = await User.findById(userId);
    if (!user) 
      return res.status(404).json({ success: false, message: "User not found" });

    // Fetch product
    const product = await Product.findById(productId);
    if (!product) 
      return res.status(404).json({ success: false, message: "Product not found" });

    if (product.stock < quantity) 
      return res.status(400).json({ success: false, message: "Product out of stock" });

    // Map user address to shippingInfo
    const shippingInfo = {
      address: `${user.address.street || ""}, ${user.address.barangay || ""}`,
      city: user.address.city || "",
      postalCode: user.address.zipcode || "",
      country: "Philippines",
      phoneNo: user.contact || "",
    };

    // Validate shipping info
    if (!shippingInfo.address || !shippingInfo.city || !shippingInfo.postalCode || !shippingInfo.country || !shippingInfo.phoneNo) {
      return res.status(400).json({
        success: false,
        message: "Shipping address incomplete. Please update your profile with a valid address and contact number.",
      });
    }

    // Calculate totals
    const TAX_RATE = 0.1;
    const SHIPPING_PRICE = 50;

    const itemsPrice = product.price * quantity;
    const taxPrice = itemsPrice * TAX_RATE;
    const totalPrice = itemsPrice + taxPrice + SHIPPING_PRICE;

    // Create order item
    const orderItems = [{
      name: product.name,
      quantity: quantity,
      price: product.price,
      image: product.images?.[0]?.url || "",
      product: product._id,
    }];

    // Create order
    const order = await Order.create({
      user: userId,
      orderItems,
      shippingInfo,
      itemsPrice,
      taxPrice,
      shippingPrice: SHIPPING_PRICE,
      totalPrice,
      orderStatus: "Processing",
    });

    // Decrease stock
    product.stock = Math.max(product.stock - quantity, 0);
    await product.save();

    res.status(201).json({ success: true, order });
  } catch (error) {
    console.error("Solo checkout error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};