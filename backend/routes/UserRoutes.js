const express = require('express');
const upload = require('../utils/Multer');
const {
  registerUser,
  verifyEmail,
  loginUser,
  forgotPassword,
  resetPassword,
  getUserProfile,
  updateProfile,
  updatePassword,
  // Firebase Auth
  firebaseEmailLogin,
  firebaseGoogleAuth,
  firebaseFacebookAuth, 
  checkEmailVerification,
  resendVerificationEmail
} = require('../controllers/UserController');

const { isAuthenticatedUser } = require('../middlewares/auth');

const router = express.Router();

// AUTH
router.post('/register', registerUser);
router.get('/verify-email/:token', verifyEmail);
router.post('/login', loginUser);

// FIREBASE AUTH
router.post('/firebase/login', firebaseEmailLogin);
router.post('/firebase/auth/google', firebaseGoogleAuth);
router.post('/firebase/auth/facebook', firebaseFacebookAuth); 

// VERIFICATION
router.post('/check-verification', checkEmailVerification);
router.post('/resend-verification', resendVerificationEmail);

// PASSWORD
router.post('/password/forgot', forgotPassword);
router.put('/password/reset/:token', resetPassword);
router.put('/password/update', isAuthenticatedUser, updatePassword);

// PROFILE
router.get('/me', isAuthenticatedUser, getUserProfile);
router.put('/me/update', isAuthenticatedUser, upload.single('avatar'), updateProfile);

module.exports = router;