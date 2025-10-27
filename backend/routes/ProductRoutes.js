const express = require('express');
const upload = require('../utils/Multer');
const {
  createProduct,
  getAllProducts,
  getProduct,
  updateProduct,
  softDeleteProduct,
  getActiveSuppliers,
  getDeletedProducts,   // ✅ add this
  restoreProduct
     
} = require('../controllers/ProductController');

const { isAuthenticatedUser, isAdmin } = require('../middlewares/auth');

const router = express.Router();

// Public routes
router.get('/products', getAllProducts);
router.get('/products/:id', getProduct);
router.get('/suppliers/dropdown', getActiveSuppliers);

// ✅ Admin routes
router.get('/admin/products/trash', isAuthenticatedUser, isAdmin, getDeletedProducts);
router.patch('/admin/products/restore/:id', isAuthenticatedUser, isAdmin, restoreProduct);
router.get('/admin/products/:id', isAuthenticatedUser, isAdmin, getProduct);
router.post('/admin/products', isAuthenticatedUser, isAdmin, createProduct);
router.put('/admin/products/:id', isAuthenticatedUser, isAdmin, updateProduct);
router.delete('/admin/products/:id', isAuthenticatedUser, isAdmin, softDeleteProduct);

module.exports = router;