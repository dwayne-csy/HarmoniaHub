const express = require('express');
const { 
    checkout,
    soloCheckout,
} = require('../controllers/CheckoutController');
const { isAuthenticatedUser } = require('../middlewares/auth');

const router = express.Router();

// Checkout endpoint
router.post('/checkout', isAuthenticatedUser, checkout);
router.post('/checkout/solo', isAuthenticatedUser, soloCheckout);


module.exports = router;
