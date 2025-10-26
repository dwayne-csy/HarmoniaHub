const express = require('express');
const {
  registerUser,
  verifyEmail,
  loginUser,
  forgotPassword,
  resetPassword,
  getUserProfile,
  updateProfile,
  updatePassword
} = require('../controllers/UserController');

const { isAuthenticatedUser} = require('../middlewares/auth');

const router = express.Router();

// ====== AUTHENTICATION & ACCOUNT ======
router.post('/register', registerUser);
router.get('/verify-email/:token', verifyEmail);
router.post('/login', loginUser);

// ====== PASSWORD MANAGEMENT ======
router.post('/password/forgot', forgotPassword);
router.put('/password/reset/:token', resetPassword);
router.put('/password/update', isAuthenticatedUser, updatePassword);


// ====== USER PROFILE ======
router.get('/me', isAuthenticatedUser, getUserProfile);
router.put('/me/update', isAuthenticatedUser, updateProfile);

module.exports = router;
