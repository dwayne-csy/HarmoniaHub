const express = require('express');
const {
  getVerifiedUsers,
  createUser,
  toggleUserStatus,
  softDeleteUser,
  restoreUser,
  getAllUsers,
  changeUserRole,
  getDeletedUsers,
} = require('../controllers/ManageUserController');

const { isAuthenticatedUser, isAdmin } = require('../middlewares/auth');

const router = express.Router();

// Admin-only routes
router.get('/users/deleted', isAuthenticatedUser, isAdmin, getDeletedUsers); // GET all soft-deleted users
router.get('/users/all', getAllUsers);
router.get('/users', isAuthenticatedUser, isAdmin, getVerifiedUsers); // GET all verified users
router.post('/users', isAuthenticatedUser, isAdmin, createUser); // Create user
router.patch('/users/status/:id', isAuthenticatedUser, isAdmin, toggleUserStatus); // Toggle active/inactive
router.delete('/users/:id', isAuthenticatedUser, isAdmin, softDeleteUser); // Soft delete
router.patch('/users/restore/:id', isAuthenticatedUser, isAdmin, restoreUser); // Restore
router.patch('/users/role/:id', isAuthenticatedUser, isAdmin, changeUserRole); // ✅ Change user role (admin/user)

module.exports = router;
