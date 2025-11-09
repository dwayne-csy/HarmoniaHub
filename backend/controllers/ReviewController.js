const Product = require('../models/productModel');
const Order = require('../models/orderModel'); // assuming you have orders

// Add a review
exports.addReview = async (req, res) => {
    const { productId, rating, comment } = req.body;
    const userId = req.user._id;
    const userName = req.user.name;

    // Check if user has purchased the product
    const hasPurchased = await Order.findOne({
        user: userId,
        'orderItems.product': productId,
        status: 'Delivered' // only allow review if delivered
    });

    if (!hasPurchased) {
        return res.status(400).json({
            success: false,
            message: 'You can only review products you have purchased'
        });
    }

    const product = await Product.findById(productId);

    const existingReview = product.reviews.find(
        r => r.user.toString() === userId.toString()
    );

    if (existingReview) {
        // update review
        existingReview.rating = rating;
        existingReview.comment = comment;
    } else {
        product.reviews.push({
            user: userId,
            name: userName,
            rating,
            comment
        });
        product.numOfReviews = product.reviews.length;
    }

    // update product rating
    product.ratings =
        product.reviews.reduce((acc, item) => acc + item.rating, 0) /
        product.reviews.length;

    await product.save({ validateBeforeSave: false });

    res.status(200).json({ success: true, review: existingReview || { user: userId, name: userName, rating, comment } });
};

// Get all reviews of a product
exports.getProductReviews = async (req, res) => {
    const product = await Product.findById(req.params.productId);

    if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.status(200).json({ success: true, reviews: product.reviews });
};
