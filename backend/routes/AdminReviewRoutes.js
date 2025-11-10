const express = require("express");
const router = express.Router();

const {
  getAllReviews,
  deleteReview,
} = require("../controllers/AdminReviewController");
const { isAuthenticatedUser, isAdmin } = require("../middlewares/auth");

// Get all reviews
router.get("/admin/reviews", isAuthenticatedUser, isAdmin, getAllReviews);

// Delete a specific review by product ID and review ID
router.delete("/admin/reviews/:productId/:reviewId", isAuthenticatedUser, isAdmin, deleteReview);

module.exports = router;
