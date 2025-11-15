import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import MUIDataTable from "mui-datatables";
import { 
  Button, 
  Box, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Stack, 
  Typography,
  IconButton
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import Loader from "../../layouts/Loader";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import StarIcon from "@mui/icons-material/Star";
import AdminHeader from "../../layouts/admin/AdminHeader";
import AdminFooter from "../../layouts/admin/AdminFooter";

const BASE_URL = "http://localhost:4001/api/v1";

export default function ReviewList() {
  const [reviews, setReviews] = useState([]);
  const [deletedReviews, setDeletedReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [showDeleted, setShowDeleted] = useState(false);
  const [productFilter, setProductFilter] = useState("");
  const [starFilter, setStarFilter] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  useEffect(() => {
    fetchReviews();
    fetchDeletedReviews();
  }, [token]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/admin/reviews`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReviews(res.data.reviews || []);
    } catch (err) {
      console.error("Failed to fetch reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDeletedReviews = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/admin/reviews/deleted`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDeletedReviews(res.data.reviews || []);
    } catch (err) {
      console.error("Failed to fetch deleted reviews:", err);
    }
  };

  const displayedReviews = showDeleted ? deletedReviews : reviews;

  const productOptions = [...new Set(reviews.map((r) => r.productName).filter(Boolean))];

  const applyFilters = (productValue, starValue) => {
    let result = displayedReviews;
    if (productValue) result = result.filter((r) => r.productName === productValue);
    if (starValue) result = result.filter((r) => r.rating === starValue);
    setFilteredReviews(result);
  };

  useEffect(() => {
    applyFilters(productFilter, starFilter);
  }, [reviews, deletedReviews, showDeleted]);

  const handleFilterChange = (e) => {
    const value = e.target.value;
    setProductFilter(value);
    applyFilters(value, starFilter);
  };

  const handleStarFilterChange = (e) => {
    const value = parseInt(e.target.value);
    setStarFilter(value);
    applyFilters(productFilter, value);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`${showDeleted ? 'Permanently delete' : 'Move to trash'} ${selectedIds.length} selected reviews?`)) return;

    try {
      if (showDeleted) {
        // Permanently delete
        await Promise.all(
          selectedIds.map((reviewId) =>
            axios.delete(`${BASE_URL}/admin/reviews/delete/${reviewId}`, {
              headers: { Authorization: `Bearer ${token}` },
            })
          )
        );
      } else {
        // Soft delete
        await Promise.all(
          selectedIds.map((reviewId) =>
            axios.patch(`${BASE_URL}/admin/reviews/softdelete/${reviewId}`, {}, {
              headers: { Authorization: `Bearer ${token}` },
            })
          )
        );
      }

      fetchReviews();
      fetchDeletedReviews();
      setSelectedIds([]);
    } catch (err) {
      console.error("Bulk delete failed:", err);
    }
  };

  const handleBulkRestore = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Restore ${selectedIds.length} selected reviews?`)) return;

    try {
      await Promise.all(
        selectedIds.map((reviewId) =>
          axios.patch(`${BASE_URL}/admin/reviews/restore/${reviewId}`, {}, {
            headers: { Authorization: `Bearer ${token}` },
          })
        )
      );

      fetchReviews();
      fetchDeletedReviews();
      setSelectedIds([]);
    } catch (err) {
      console.error("Bulk restore failed:", err);
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.setTextColor(212, 175, 55);
    doc.text("HarmoniaHub", 14, 15);
    doc.setFontSize(12);
    doc.text("Product Reviews", 14, 25);

    const tableColumn = ["Product", "User", "Rating", "Comment", "Date"];
    const tableRows = [];

    filteredReviews.forEach((rev) => {
      tableRows.push([
        rev.productName || "N/A",
        rev.user || "Anonymous",
        "★".repeat(rev.rating),
        rev.comment || "",
        new Date(rev.createdAt).toLocaleDateString(),
      ]);
    });

    autoTable(doc, { head: [tableColumn], body: tableRows, startY: 30 });
    doc.save("Reviews.pdf");
  };

  const columns = [
  {
    name: "productName",
    label: "Product",
    options: {
      customBodyRenderLite: (dataIndex) => (
        <Typography sx={{ color: "#000000ff" }}>
          {filteredReviews[dataIndex].productName || "N/A"}
        </Typography>
      ),
    },
  },
  {
    name: "user",
    label: "User",
    options: {
      customBodyRenderLite: (dataIndex) => (
        <Typography sx={{ color: "#000000ff" }}>
          {filteredReviews[dataIndex].user || "Anonymous"}
        </Typography>
      ),
    },
  },
  {
    name: "rating",
    label: "Rating",
    options: {
      customBodyRenderLite: (dataIndex) => {
        const rating = filteredReviews[dataIndex].rating;
        return (
          <Box display="flex">
            {[...Array(rating)].map((_, i) => (
              <StarIcon key={i} style={{ color: "#FFD700" }} />
            ))}
          </Box>
        );
      },
    },
  },
  {
    name: "comment",
    label: "Comment",
    options: {
      customBodyRenderLite: (dataIndex) => (
        <Typography sx={{ color: "#000000ff", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis" }}>
          {filteredReviews[dataIndex].comment || "—"}
        </Typography>
      ),
    },
  },
  {
    name: "createdAt",
    label: "Date",
    options: {
      customBodyRenderLite: (dataIndex) => (
        <Typography sx={{ color: "#000000ff" }}>
          {new Date(filteredReviews[dataIndex].createdAt).toLocaleDateString()}
        </Typography>
      ),
    },
  },
  ...(showDeleted ? [] : [{
    name: "actions",
    label: "Actions",
    options: {
      filter: false,
      sort: false,
      customBodyRenderLite: (dataIndex) => {
        const rev = filteredReviews[dataIndex];
        return (
          <Button
            sx={{ 
              background: "linear-gradient(135deg, #d4af37, #b8860b)",
              color: "#1a1a1a",
              fontWeight: "bold",
              '&:hover': { 
                background: "linear-gradient(135deg, #e6c453, #c9970b)",
                transform: "translateY(-2px)"
              },
              transition: "all 0.3s ease"
            }}
            onClick={() => navigate(`/admin/reviews/view/${rev._id}`)}
          >
            View
          </Button>
        );
      },
    },
  }])
];

  const options = {
    selectableRows: "multiple",
    selectableRowsOnClick: true,
    onRowSelectionChange: (currentRowsSelected, allRowsSelected, rowsSelectedIndexes) => {
      const selected = rowsSelectedIndexes.map((i) => filteredReviews[i]._id);
      setSelectedIds(selected);
    },
    download: false,
    print: false,
    viewColumns: false,
    filter: false,
    search: true,
    rowsPerPage: 10,
    rowsPerPageOptions: [5, 10, 25, 50],
    elevation: 0,
    selectableRowsHideCheckboxes: false,
    customToolbarSelect: () => null,
    textLabels: {
      body: { noMatch: "No reviews found", toolTip: "Sort" },
      pagination: { next: "Next", previous: "Previous", rowsPerPage: "Rows per page:" },
      toolbar: { search: "Search", downloadCsv: "Download CSV", print: "Print", viewColumns: "View Columns", filterTable: "Filter Table" },
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: "flex", 
        flexDirection: "column", 
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 50%, #2d2d2d 100%)"
      }}>
        <AdminHeader admin={user} handleLogout={handleLogout} />
        <Box sx={{ 
          display: "flex", 
          justifyContent: "center", 
          alignItems: "center", 
          minHeight: "60vh",
          flex: 1 
        }}>
          <Loader />
        </Box>
        <AdminFooter />
      </div>
    );
  }

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 50%, #2d2d2d 100%)",
      position: "relative",
      overflow: "hidden"
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

      <AdminHeader admin={user} handleLogout={handleLogout} />
      
      <main style={{ 
        flex: 1, 
        padding: "20px 30px",
        position: "relative",
        zIndex: 1
      }}>
        <Box sx={{ 
          maxWidth: 1200, 
          margin: '24px auto',
          background: "linear-gradient(135deg, rgba(30,30,30,0.95) 0%, rgba(40,40,40,0.95) 100%)",
          backdropFilter: "blur(15px)",
          padding: "30px",
          borderRadius: "18px",
          boxShadow: "0 12px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(212,175,55,0.2)",
          border: "1px solid rgba(212,175,55,0.3)",
          position: "relative",
          overflow: "hidden"
        }}>
          
          {/* Gold accent line */}
          <div style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "3px",
            background: "linear-gradient(90deg, transparent, #d4af37, transparent)"
          }}></div>

          {/* Back Button and Title Section */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
           <IconButton
  onClick={() => navigate("/admin/dashboard")}
  sx={{
    color: "#d4af37",
    background: "rgba(212,175,55,0.1)",
    border: "1px solid rgba(212,175,55,0.3)",
    mr: 2,
    '&:hover': {
      background: "rgba(212,175,55,0.2)",
      transform: "translateY(-2px)",
      boxShadow: "0 4px 12px rgba(212,175,55,0.3)"
    },
    transition: "all 0.3s ease"
  }}
>
  <ArrowBack />
</IconButton>
            
            <Typography variant="h4" sx={{ 
              fontWeight: "bold", 
              color: "#d4af37",
              textShadow: "0 2px 4px rgba(0,0,0,0.5)"
            }}>
              {showDeleted ? 'Deleted Reviews (Trash)' : 'Review Management'}
            </Typography>
          </Box>

          {/* Filter Section */}
          <Stack direction="row" spacing={2} mb={3}>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel sx={{ color: "#d4af37" }}>Filter by Product</InputLabel>
              <Select
                value={productFilter}
                label="Filter by Product"
                onChange={handleFilterChange}
                sx={{
                  color: "#fff",
                  "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(212,175,55,0.3)" },
                  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(212,175,55,0.5)" },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#d4af37" },
                  "& .MuiSvgIcon-root": { color: "#d4af37" }
                }}
              >
                <MenuItem value="">All Products</MenuItem>
                {productOptions.map((p) => (
                  <MenuItem key={p} value={p} sx={{ color: "#fff", background: "#2d2d2d" }}>
                    {p}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel sx={{ color: "#d4af37" }}>Filter by Star</InputLabel>
              <Select
                value={starFilter}
                label="Filter by Star"
                onChange={handleStarFilterChange}
                sx={{
                  color: "#fff",
                  "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(212,175,55,0.3)" },
                  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(212,175,55,0.5)" },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#d4af37" },
                  "& .MuiSvgIcon-root": { color: "#d4af37" }
                }}
              >
                <MenuItem value={0} sx={{ color: "#fff", background: "#2d2d2d" }}>
                  All Stars
                </MenuItem>
                {[1, 2, 3, 4, 5].map((s) => (
                  <MenuItem key={s} value={s} sx={{ color: "#fff", background: "#2d2d2d" }}>
                    {s} <StarIcon style={{ color: "#FFD700", verticalAlign: "middle", marginLeft: 8 }} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>

          {/* Action Buttons */}
          <Stack direction="row" spacing={2} mb={3} flexWrap="wrap" gap={1}>
            <Button
              variant="contained"
              onClick={() => setShowDeleted(!showDeleted)}
              sx={{
                background: showDeleted 
                  ? "linear-gradient(135deg, #4CAF50, #45a049)"
                  : "linear-gradient(135deg, #d4af37, #b8860b)",
                color: "#1a1a1a",
                fontWeight: "bold",
                "&:hover": {
                  background: showDeleted 
                    ? "linear-gradient(135deg, #66bb6a, #4caf50)"
                    : "linear-gradient(135deg, #e6c453, #c9970b)",
                  transform: "translateY(-2px)",
                  boxShadow: "0 8px 25px rgba(212,175,55,0.4)"
                },
                transition: "all 0.3s ease"
              }}
            >
              {showDeleted ? 'Show Active' : 'Trash'}
            </Button>

            {showDeleted ? (
              <>
                <Button
                  variant="contained"
                  onClick={handleBulkRestore}
                  disabled={selectedIds.length === 0}
                  sx={{
                    background: "linear-gradient(135deg, #28a745, #218838)",
                    color: "#fff",
                    fontWeight: "bold",
                    "&:hover": {
                      background: "linear-gradient(135deg, #34ce57, #28a745)",
                      transform: "translateY(-2px)"
                    },
                    "&:disabled": {
                      background: "rgba(40, 167, 69, 0.3)",
                      color: "rgba(255,255,255,0.5)"
                    },
                    transition: "all 0.3s ease"
                  }}
                >
                  Restore Selected
                </Button>
                <Button
                  variant="contained"
                  onClick={handleBulkDelete}
                  disabled={selectedIds.length === 0}
                  sx={{
                    background: "linear-gradient(135deg, #dc3545, #c82333)",
                    color: "#fff",
                    fontWeight: "bold",
                    "&:hover": {
                      background: "linear-gradient(135deg, #e74c3c, #dc3545)",
                      transform: "translateY(-2px)"
                    },
                    "&:disabled": {
                      background: "rgba(220, 53, 69, 0.3)",
                      color: "rgba(255,255,255,0.5)"
                    },
                    transition: "all 0.3s ease"
                  }}
                >
                  Delete Selected
                </Button>
              </>
            ) : (
              <Button
                variant="contained"
                onClick={handleBulkDelete}
                disabled={selectedIds.length === 0}
                sx={{
                  background: "linear-gradient(135deg, #dc3545, #c82333)",
                  color: "#fff",
                  fontWeight: "bold",
                  "&:hover": {
                    background: "linear-gradient(135deg, #e74c3c, #dc3545)",
                    transform: "translateY(-2px)"
                  },
                  "&:disabled": {
                    background: "rgba(220, 53, 69, 0.3)",
                    color: "rgba(255,255,255,0.5)"
                  },
                  transition: "all 0.3s ease"
                }}
              >
                Delete Selected
              </Button>
            )}
          </Stack>

          {/* Data Table */}
          <MUIDataTable
            data={filteredReviews}
            columns={columns}
            options={options}
          />

          {/* Export Button */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: 2 }}>
            <Button
              variant="contained"
              onClick={exportPDF}
              sx={{
                background: "linear-gradient(135deg, #d4af37, #b8860b)",
                color: "#1a1a1a",
                fontWeight: "bold",
                "&:hover": {
                  background: "linear-gradient(135deg, #e6c453, #c9970b)",
                  transform: "translateY(-2px)",
                  boxShadow: "0 8px 25px rgba(212,175,55,0.4)"
                },
                transition: "all 0.3s ease"
              }}
            >
              Export PDF
            </Button>
          </Box>
        </Box>
      </main>

      <AdminFooter />
    </div>
  );
}