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
  const [backendConnected, setBackendConnected] = useState(true);
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
      setBackendConnected(true);
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
      setBackendConnected(false);
      setError(error.response?.data?.message || "Failed to submit review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ 
      display: "flex", 
      flexDirection: "column", 
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 50%, #2d2d2d 100%)",
      position: "relative",
      overflow: "hidden",
      margin: 0,
      padding: 0 
    }}>
      {/* Gold shimmer overlay */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "radial-gradient(circle at 20% 80%, rgba(212,175,55,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(212,175,55,0.05) 0%, transparent 50%)",
        pointerEvents: "none",
        zIndex: 0
      }}></div>

      <main style={{ 
        flex: 1, 
        padding: "20px 0",
        backgroundColor: "transparent",
        animation: "fadeIn 0.6s ease-in-out",
        position: "relative",
        zIndex: 1,
        margin: 0,
        width: "100%"
      }}>
        <style>
          {`
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(10px); }
              to { opacity: 1; transform: translateY(0); }
            }
            @keyframes pulse {
              0% { transform: scale(1); }
              50% { transform: scale(1.05); }
              100% { transform: scale(1); }
            }
            @keyframes shimmer {
              0% { background-position: -1000px 0; }
              100% { background-position: 1000px 0; }
            }
            @keyframes float {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-5px); }
            }
            
            body {
              margin: 0;
              padding: 0;
              overflow-x: hidden;
              background: transparent;
            }
            * {
              box-sizing: border-box;
            }
          `}
        </style>

        {/* Backend status banner */}
        {!backendConnected && (
          <div style={{
            backgroundColor: 'rgba(212,175,55,0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(212,175,55,0.3)',
            borderRadius: '12px',
            padding: '15px 20px',
            margin: '0 auto 25px',
            textAlign: 'center',
            maxWidth: '600px',
            color: '#d4af37',
            fontWeight: '600',
            animation: 'fadeIn 0.5s ease-out',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
            marginLeft: '20px',
            marginRight: '20px'
          }}>
            <strong>⚠️ Limited Functionality:</strong> Backend connection issue. Some features may not work properly.
          </div>
        )}

        <Box sx={{ 
          maxWidth: "600px", 
          margin: "0 auto",
          padding: "0 20px"
        }}>
          {/* Main Review Card */}
          <Box sx={{ 
            background: "linear-gradient(135deg, rgba(30,30,30,0.95) 0%, rgba(40,40,40,0.95) 100%)",
            padding: "40px 30px",
            borderRadius: "18px",
            boxShadow: "0 12px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(212,175,55,0.2)",
            border: "1px solid rgba(212,175,55,0.3)",
            position: "relative",
            overflow: "hidden",
            animation: "fadeIn 0.8s ease-out",
            marginTop: "20px"
          }}>
            {/* Gold accent line */}
            <div style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "3px",
              background: "linear-gradient(90deg, transparent, #d4af37, transparent)",
              animation: "shimmer 3s infinite linear"
            }}></div>

            {/* Page Header */}
            <Typography variant="h4" sx={{ 
              textAlign: "center",
              marginBottom: "30px",
              background: "linear-gradient(135deg, #d4af37, #f9e076, #d4af37)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundSize: "200% 100%",
              animation: "shimmer 3s infinite linear",
              fontSize: "2.5rem",
              fontWeight: "bold",
              textShadow: "0 2px 4px rgba(0,0,0,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "15px"
            }}>
              ⭐ {isEdit ? "Edit Your Review" : "Write a Review"}
            </Typography>

            {/* Product and Order Info */}
            <Box sx={{ 
              padding: "20px",
              background: "rgba(20,20,20,0.7)",
              borderRadius: "12px",
              border: "1px solid rgba(212,175,55,0.2)",
              backdropFilter: "blur(10px)",
              marginBottom: "25px"
            }}>
              <Typography variant="body1" sx={{ 
                color: "#d4af37",
                fontWeight: "600",
                marginBottom: "10px",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}>
                🏷️ Product ID: <span style={{ color: "rgba(255,255,255,0.9)" }}>{productId}</span>
              </Typography>
              
              {orderId && (
                <Typography variant="body2" sx={{ 
                  color: "#d4af37",
                  fontWeight: "600",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px"
                }}>
                  📦 Order ID: <span style={{ color: "rgba(255,255,255,0.8)" }}>{orderId}</span>
                </Typography>
              )}
            </Box>

            {/* Error and Warning Alerts */}
            {error && (
              <Alert severity="error" sx={{ 
                mb: 2,
                backgroundColor: 'rgba(244,67,54,0.1)',
                color: '#ff6b6b',
                border: '1px solid rgba(244,67,54,0.3)',
                borderRadius: '12px',
                '& .MuiAlert-icon': { color: '#ff6b6b' }
              }}>
                {error}
              </Alert>
            )}

            {warning && (
              <Alert severity="warning" sx={{ 
                mb: 2,
                backgroundColor: 'rgba(212,175,55,0.1)',
                color: '#d4af37',
                border: '1px solid rgba(212,175,55,0.3)',
                borderRadius: '12px',
                '& .MuiAlert-icon': { color: '#d4af37' }
              }}>
                {warning}
              </Alert>
            )}

            {/* Rating Section */}
            <Box sx={{ 
              display: "flex", 
              alignItems: "center", 
              marginBottom: "25px",
              padding: "20px",
              background: "rgba(20,20,20,0.7)",
              borderRadius: "12px",
              border: "1px solid rgba(212,175,55,0.2)",
              backdropFilter: "blur(10px)"
            }}>
              <Typography variant="subtitle1" sx={{ 
                marginRight: "20px",
                color: "#d4af37",
                fontWeight: "bold",
                minWidth: "80px"
              }}>
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
                sx={{
                  '& .MuiRating-icon': {
                    color: '#d4af37',
                    fontSize: '2.5rem'
                  },
                  '& .MuiRating-iconEmpty': {
                    color: 'rgba(212,175,55,0.3)'
                  },
                  '& .MuiRating-iconFilled': {
                    color: '#d4af37'
                  },
                  '& .MuiRating-iconHover': {
                    color: '#f9e076'
                  }
                }}
              />
            </Box>

            {/* Comment Section */}
            <TextField
              label="Your Comment *"
              multiline
              rows={6}
              fullWidth
              value={comment}
              onChange={handleCommentChange}
              margin="normal"
              placeholder="Share your honest experience with this product... (Inappropriate language will be automatically filtered)"
              error={!!error}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: '#ffffff',
                  backgroundColor: 'rgba(20,20,20,0.7)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '12px',
                  border: '1px solid rgba(212,175,55,0.2)',
                  '&:hover': {
                    borderColor: 'rgba(212,175,55,0.4)',
                  },
                  '&.Mui-focused': {
                    borderColor: '#d4af37',
                    boxShadow: '0 0 0 2px rgba(212,175,55,0.2)'
                  },
                  '& fieldset': {
                    border: 'none'
                  }
                },
                '& .MuiInputLabel-root': {
                  color: 'rgba(212,175,55,0.8)',
                  fontWeight: '600'
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#d4af37'
                },
                '& .MuiFormHelperText-root': {
                  color: 'rgba(212,175,55,0.7)',
                  fontSize: '0.85rem'
                }
              }}
              helperText="You can type anything - inappropriate language will be automatically filtered when submitted."
            />

            {/* Information Note */}
            <Typography variant="caption" sx={{ 
              color: "rgba(212,175,55,0.8)", 
              display: "block", 
              marginTop: "15px",
              padding: "12px",
              background: "rgba(212,175,55,0.1)",
              borderRadius: "8px",
              border: "1px solid rgba(212,175,55,0.2)",
              textAlign: "center",
              fontWeight: "600"
            }}>
              💡 Note: Inappropriate language will be automatically filtered and replaced with asterisks in your submitted review.
            </Typography>

            {/* Preview of filtered content */}
            {comment && filter.isProfane(comment) && (
              <Box mt={2} p={2} sx={{ 
                bgcolor: "rgba(20,20,20,0.7)",
                borderRadius: "12px",
                border: "1px solid rgba(212,175,55,0.3)",
                backdropFilter: "blur(10px)"
              }}>
                <Typography variant="caption" sx={{ 
                  color: "#d4af37", 
                  display: "block",
                  fontWeight: "600"
                }}>
                  👀 Preview of how your comment will appear:
                </Typography>
                <Typography variant="body2" sx={{ 
                  fontStyle: "italic", 
                  marginTop: "10px",
                  color: "rgba(255,255,255,0.9)",
                  padding: "12px",
                  background: "rgba(0,0,0,0.3)",
                  borderRadius: "8px",
                  borderLeft: "3px solid #d4af37"
                }}>
                  "{filter.clean(comment)}"
                </Typography>
              </Box>
            )}

            {/* Action Buttons */}
            <Box mt={3} display="flex" gap={2} justifyContent="center">
              <Button
                variant="outlined"
                onClick={() => navigate("/order-history")}
                disabled={submitting}
                sx={{
                  padding: "12px 30px",
                  color: "#d4af37",
                  borderColor: "#d4af37",
                  borderRadius: "12px",
                  fontWeight: "700",
                  fontSize: "16px",
                  transition: "all 0.3s ease",
                  '&:hover': {
                    backgroundColor: "rgba(212,175,55,0.1)",
                    borderColor: "#f9e076",
                    transform: "translateY(-2px)",
                    boxShadow: "0 6px 20px rgba(212,175,55,0.3)"
                  },
                  '&:disabled': {
                    color: "rgba(212,175,55,0.5)",
                    borderColor: "rgba(212,175,55,0.3)"
                  }
                }}
              >
                ↩️ Cancel
              </Button>
              
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={submitting}
                size="large"
                sx={{
                  padding: "12px 30px",
                  background: submitting 
                    ? "linear-gradient(135deg, rgba(212,175,55,0.5) 0%, rgba(249,224,118,0.5) 100%)" 
                    : "linear-gradient(135deg, #d4af37 0%, #f9e076 100%)",
                  color: "#1a1a1a",
                  borderRadius: "12px",
                  fontWeight: "700",
                  fontSize: "16px",
                  transition: "all 0.3s ease",
                  boxShadow: submitting 
                    ? "0 4px 15px rgba(212,175,55,0.2)" 
                    : "0 6px 20px rgba(212,175,55,0.4)",
                  border: "none",
                  cursor: submitting ? "not-allowed" : "pointer",
                  position: "relative",
                  overflow: "hidden",
                  minWidth: "180px",
                  '&:hover:not(:disabled)': {
                    transform: "translateY(-3px)",
                    boxShadow: "0 10px 25px rgba(212,175,55,0.6)",
                    background: "linear-gradient(135deg, #d4af37 0%, #f9e076 100%)"
                  }
                }}
              >
                {submitting ? (
                  <Box display="flex" alignItems="center" gap={1}>
                    <CircularProgress size={20} sx={{ color: "#1a1a1a" }} />
                    <span>Processing...</span>
                  </Box>
                ) : isEdit ? (
                  "✏️ Update Review"
                ) : (
                  "✅ Submit Review"
                )}
              </Button>
            </Box>
          </Box>
        </Box>
      </main>
    </div>
  );
};

export default Review;