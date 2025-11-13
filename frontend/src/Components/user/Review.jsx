// HarmoniaHub/frontend/src/Components/user/Review.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Box, Typography, TextField, Button, Rating, CircularProgress } from "@mui/material";
import { useNavigate, useParams, useLocation } from "react-router-dom";

const Review = () => {
  const { productId } = useParams();
  const location = useLocation();
  const { orderId, existingReview } = location.state || {};
  
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // Set existing review data if editing
  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating);
      setComment(existingReview.comment);
      setIsEdit(true);
    }
  }, [existingReview]);

  const handleSubmit = async () => {
    if (!rating || !comment) {
      alert("Please provide both rating and comment.");
      return;
    }

    if (!orderId) {
      alert("Order information is missing.");
      return;
    }

    setSubmitting(true);
    try {
      const url = isEdit
        ? "http://localhost:4001/api/v1/review/update"
        : "http://localhost:4001/api/v1/review/create";

      const method = isEdit ? "put" : "post";

      await axios[method](
        url,
        { productId, rating, comment, orderId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(isEdit ? "Review updated successfully!" : "Review submitted successfully!");
      navigate("/order-history");
    } catch (error) {
      console.error("Failed to submit review:", error);
      alert(error.response?.data?.message || "Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box p={3} maxWidth={600} mx="auto">
      <Typography variant="h4" mb={3}>
        {isEdit ? "Edit Your Review" : "Write a Review"}
      </Typography>

      <Typography variant="body1" mb={2}>
        Product ID: {productId}
      </Typography>
      
      {orderId && (
        <Typography variant="body2" mb={2} color="text.secondary">
          Order ID: {orderId}
        </Typography>
      )}

      <Box display="flex" alignItems="center" mb={2}>
        <Typography variant="subtitle1" mr={2}>
          Rating:
        </Typography>
        <Rating
          value={rating}
          onChange={(e, newValue) => setRating(newValue)}
          precision={1}
          size="large"
        />
      </Box>

      <TextField
        label="Your Comment"
        multiline
        rows={4}
        fullWidth
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        margin="normal"
        placeholder="Share your experience with this product..."
      />

      <Box mt={3} display="flex" gap={2}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={submitting}
          size="large"
        >
          {submitting ? "Submitting..." : isEdit ? "Update Review" : "Submit Review"}
        </Button>
        
        <Button
          variant="outlined"
          color="secondary"
          onClick={() => navigate("/order-history")}
          disabled={submitting}
        >
          Cancel
        </Button>
      </Box>
    </Box>
  );
};

export default Review;