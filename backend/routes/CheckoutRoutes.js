const express = require('express');
const { checkout, getMyOrders } = require('../controllers/CheckoutController');
const { isAuthenticatedUser } = require('../middlewares/auth');

const router = express.Router();

// Checkout endpoint
router.post('/checkout', isAuthenticatedUser, checkout);

// Get all orders for logged-in user
router.get('/orders', isAuthenticatedUser, getMyOrders);

module.exports = router;
