import React, { useState, useEffect } from "react";
import axios from "axios";
import { Box, Typography, TextField, Button, Rating, CircularProgress, Alert } from "@mui/material";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Filter } from "bad-words";

const Review = () => {
  const { productId } = useParams();
  const location = useLocation();
  const { orderId, existingReview } = location.state || {};
  
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // Initialize bad words filter with custom words
  const [filter] = useState(() => {
    const customFilter = new Filter();
    
    // Add Filipino bad words
    const filipinoBadWords = [
      'putangina', 'puta', 'gago', 'tangina', 'bobo', 'ulol', 'lintik', 
      'hayop', 'pakyu', 'burat', 'tite', 'pekpek', 'kantot', 'letche', 
      'siraulo', 'pakshet', 'tarantado', 'punyeta', 'walang hiya', 
      'bwisit', 'yawa', 'peste', 'hindot', 'suso'
    ];
    
    // Add English bad words
    const englishBadWords = [
      'fuck', 'shit', 'asshole', 'bitch', 'bastard', 'dick', 'pussy', 
      'cock', 'cunt', 'whore', 'slut', 'damn', 'hell', 'crap', 'piss', 
      'dickhead', 'motherfucker', 'son of a bitch', 'bullshit', 'jerk'
    ];
    
    customFilter.addWords(...filipinoBadWords, ...englishBadWords);
    return customFilter;
  });

  // Set existing review data if editing
  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating);
      setComment(existingReview.comment);
      setIsEdit(true);
    }
  }, [existingReview]);

  // Function to filter comment (always filter, don't block)
  const filterComment = (text) => {
    if (!text) return { filteredText: text, hasBadWords: false };
    
    // Check if contains bad words
    const hasBadWords = filter.isProfane(text);
    
    if (hasBadWords) {
      // Clean the text by replacing bad words with asterisks
      const cleanedText = filter.clean(text);
      return { 
        filteredText: cleanedText,
        hasBadWords: true
      };
    }
    
    return { filteredText: text, hasBadWords: false };
  };

  const handleCommentChange = (e) => {
    const newComment = e.target.value;
    setComment(newComment);
    setError(""); // Clear previous errors when user types
    
    // Check for bad words in real-time and show warning
    const filtered = filterComment(newComment);
    if (filtered.hasBadWords && newComment.trim()) {
      setWarning("Note: Inappropriate language will be automatically filtered in your submitted review.");
    } else {
      setWarning("");
    }
  };

  const handleSubmit = async () => {
    // Basic validation
    if (!rating) {
      setError("Please provide a rating.");
      return;
    }

    if (!comment.trim()) {
      setError("Please provide a comment.");
      return;
    }

    if (!orderId) {
      setError("Order information is missing.");
      return;
    }

    setSubmitting(true);
    setError("");
    setWarning("");

    try {
      // Always filter the comment before submitting
      const filteredComment = filterComment(comment).filteredText;

      const url = isEdit
        ? "http://localhost:4001/api/v1/review/update"
        : "http://localhost:4001/api/v1/review/create";

      const method = isEdit ? "put" : "post";

      await axios[method](
        url,
        { 
          productId, 
          rating, 
          comment: filteredComment, // Always use filtered text
          orderId 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Show success message with filtering info if applicable
      const hasBadWords = filter.isProfane(comment);
      if (hasBadWords) {
        alert(`${isEdit ? "Review updated" : "Review submitted"} successfully! Note: Inappropriate language has been filtered.`);
      } else {
        alert(`${isEdit ? "Review updated" : "Review submitted"} successfully!`);
      }
      
      navigate("/order-history");
    } catch (error) {
      console.error("Failed to submit review:", error);
      setError(error.response?.data?.message || "Failed to submit review. Please try again.");
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

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {warning && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {warning}
        </Alert>
      )}

      <Box display="flex" alignItems="center" mb={2}>
        <Typography variant="subtitle1" mr={2}>
          Rating: *
        </Typography>
        <Rating
          value={rating}
          onChange={(e, newValue) => {
            setRating(newValue);
            setError(""); // Clear error when rating is selected
          }}
          precision={1}
          size="large"
        />
      </Box>

      <TextField
        label="Your Comment *"
        multiline
        rows={4}
        fullWidth
        value={comment}
        onChange={handleCommentChange}
        margin="normal"
        placeholder="Share your experience with this product..."
        error={!!error}
        helperText="You can type anything - inappropriate language will be automatically filtered when submitted."
      />

      <Typography variant="caption" color="text.secondary" display="block" mt={1}>
        Note: Inappropriate language will be automatically filtered and replaced with asterisks in your submitted review.
      </Typography>

      {/* Preview of filtered content */}
      {comment && filter.isProfane(comment) && (
        <Box mt={2} p={2} bgcolor="#f5f5f5" borderRadius={1}>
          <Typography variant="caption" color="text.secondary" display="block">
            Preview of how your comment will appear:
          </Typography>
          <Typography variant="body2" fontStyle="italic" mt={1}>
            "{filter.clean(comment)}"
          </Typography>
        </Box>
      )}

      <Box mt={3} display="flex" gap={2}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={submitting}
          size="large"
        >
          {submitting ? <CircularProgress size={24} /> : isEdit ? "Update Review" : "Submit Review"}
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