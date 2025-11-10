const Product = require("../models/ProductModels");

// ✅ Get all reviews from all products
exports.getAllReviews = async (req, res) => {
  try {
    // Fetch all products (no need for populate since name is already stored)
    const products = await Product.find();

    // Flatten all reviews from all products
    const allReviews = products.flatMap((product) =>
      product.reviews.map((review) => ({
        _id: review._id,
        productId: product._id,
        productName: product.name,
        user: review.name || "Deleted User", // Use review.name directly
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
      }))
    );

    res.status(200).json({ success: true, reviews: allReviews });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ success: false, message: "Failed to fetch reviews" });
  }
};

// ✅ Delete a review by review ID and product ID
exports.deleteReview = async (req, res) => {
  try {
    const { productId, reviewId } = req.params;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const reviewIndex = product.reviews.findIndex(
      (rev) => rev._id.toString() === reviewId
    );

    if (reviewIndex === -1) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    // Remove the review
    product.reviews.splice(reviewIndex, 1);

    // Recalculate the average rating
    if (product.reviews.length > 0) {
      product.ratings =
        product.reviews.reduce((acc, item) => acc + item.rating, 0) /
        product.reviews.length;
      product.numOfReviews = product.reviews.length;
    } else {
      product.ratings = 0;
      product.numOfReviews = 0;
    }

    await product.save();

    res.status(200).json({ success: true, message: "Review deleted successfully" });
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({ success: false, message: "Failed to delete review" });
  }
};
