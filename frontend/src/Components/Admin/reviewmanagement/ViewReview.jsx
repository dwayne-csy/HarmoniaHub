import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button, Box, Rating } from '@mui/material';
import Loader from '../../layouts/Loader';
import AdminHeader from '../../layouts/admin/AdminHeader';
import AdminFooter from '../../layouts/admin/AdminFooter';

const BASE_URL = 'http://localhost:4001/api/v1';

export default function ViewReview() {
  const { reviewId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReview = async () => {
      try {
        setLoading(true);
        console.log("Fetching review with ID:", reviewId);
        const res = await axios.get(`${BASE_URL}/admin/reviews/${reviewId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log("Review data received:", res.data);
        setReview(res.data.review);
      } catch (err) {
        console.error("Error fetching review:", err);
        alert('Failed to fetch review');
      } finally {
        setLoading(false);
      }
    };
    
    if (reviewId) {
      fetchReview();
    }
  }, [reviewId, token]);

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <AdminHeader />
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
          <Loader />
        </div>
        <AdminFooter />
      </div>
    );
  }

  if (!review) {
    return (
      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <AdminHeader />
        <div style={{ flex: 1, maxWidth: 800, margin: '24px auto', padding: 16 }}>
          <Button variant="outlined" onClick={() => navigate(-1)} style={{ marginBottom: 16 }}>
            ← Back
          </Button>
          <p>Review not found.</p>
        </div>
        <AdminFooter />
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <AdminHeader />
      <div style={{ flex: 1, maxWidth: 800, margin: '24px auto', padding: 16 }}>
        <Button variant="outlined" onClick={() => navigate(-1)} style={{ marginBottom: 16 }}>
          ← Back
        </Button>
        <h2>Review Details</h2>
        
        <p><strong>Product:</strong> {review.productName || 'N/A'}</p>
        <p><strong>User:</strong> {review.user || 'Anonymous'}</p>
        <p><strong>User Email:</strong> {review.userEmail || 'N/A'}</p>
        
        <Box display="flex" alignItems="center" gap={1} my={2}>
          <strong>Rating:</strong>
          <Rating value={review.rating} readOnly />
          <span>({review.rating}/5)</span>
        </Box>
        
        <p><strong>Comment:</strong> {review.comment || 'No comment provided.'}</p>
        <p><strong>Date Created:</strong> {new Date(review.createdAt).toLocaleDateString()}</p>
        <p><strong>Status:</strong> <span style={{ color: review.isActive ? 'green' : 'red', fontWeight: 'bold' }}>
          {review.isActive ? 'Active' : 'Deleted'}
        </span></p>
        
        {review.updatedAt && review.updatedAt !== review.createdAt && (
          <p><strong>Last Updated:</strong> {new Date(review.updatedAt).toLocaleDateString()}</p>
        )}
      </div>
      <AdminFooter />
    </div>
  );
}