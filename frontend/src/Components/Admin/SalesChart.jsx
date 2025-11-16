// frontend/src/Components/admin/analytics/SalesChart.jsx
import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import axios from 'axios';
import AdminHeader from '../layouts/admin/AdminHeader';
import AdminFooter from '../layouts/admin/AdminFooter';
import { getUser, logout } from '../utils/helper';
import { useNavigate } from 'react-router-dom';

const COLORS = ['#d4af37', '#f9e076', '#b8860b', '#ffd700', '#daa520', '#f0e68c', '#eee8aa', '#fffacd', '#f5f5dc', '#ffebcd'];

const SalesChart = () => {
  const user = getUser();
  const navigate = useNavigate();
  const [salesData, setSalesData] = useState([]);
  const [productData, setProductData] = useState([]);
  const [recentBuyers, setRecentBuyers] = useState([]);
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0
  });
  const [chartType, setChartType] = useState('line');
  const [filterType, setFilterType] = useState('monthly');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' for dual view

  const handleLogout = () => {
    logout(() => navigate("/login"));
  };

  // Generate years for dropdown
  const generateYears = () => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 6 }, (_, i) => currentYear - i);
  };

  // Fetch sales data from backend
  const fetchSalesData = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required. Please login again.');
        setLoading(false);
        return;
      }

      let apiUrl;
      let params = {};

      if (filterType === 'dateRange' && dateRange.startDate && dateRange.endDate) {
        apiUrl = `http://localhost:4001/api/v1/order/sales/date-range`;
        params = {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          groupBy: 'monthly'
        };
      } else {
        apiUrl = `http://localhost:4001/api/v1/order/sales/monthly`;
        params = {
          year: selectedYear,
          type: filterType
        };
      }

      const queryString = new URLSearchParams(params).toString();
      const fullUrl = `${apiUrl}?${queryString}`;
      
      console.log('📊 Making API call to:', fullUrl);

      const response = await axios.get(fullUrl, { 
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      });

      console.log('✅ API Response received:', response.data);

      if (response.data.success) {
        const data = response.data.data;
        setSalesData(data.sales || []);
        setSummary(data.summary || {
          totalRevenue: 0,
          totalOrders: 0,
          averageOrderValue: 0
        });
      } else {
        setError(response.data.message || 'Failed to fetch sales data');
      }

    } catch (error) {
      console.error('❌ Error fetching sales data:', error);
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch product sales data for pie chart
  const fetchProductData = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required. Please login again.');
        setLoading(false);
        return;
      }

      const params = {};
      if (dateRange.startDate && dateRange.endDate) {
        params.startDate = dateRange.startDate;
        params.endDate = dateRange.endDate;
      }

      const queryString = new URLSearchParams(params).toString();
      const apiUrl = `http://localhost:4001/api/v1/order/sales/products?${queryString}`;

      console.log('📊 Fetching product data from:', apiUrl);

      const response = await axios.get(apiUrl, { 
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      });

      console.log('✅ Product data received:', response.data);

      if (response.data.success) {
        setProductData(response.data.data.products || []);
      } else {
        setError(response.data.message || 'Failed to fetch product data');
      }

    } catch (error) {
      console.error('❌ Error fetching product data:', error);
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch recent buyers data
  const fetchRecentBuyers = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const apiUrl = `http://localhost:4001/api/v1/order/sales/recent-buyers?limit=20`;
      
      const response = await axios.get(apiUrl, { 
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      });

      if (response.data.success) {
        setRecentBuyers(response.data.data.recentBuyers || []);
      }
    } catch (error) {
      console.error('❌ Error fetching recent buyers:', error);
    }
  };

  const handleApiError = (error) => {
    if (error.code === 'ECONNABORTED') {
      setError('Request timeout. Please check if the server is running.');
    } else if (error.response) {
      if (error.response.status === 404) {
        setError('Sales analytics endpoint not found (404). Please check backend routes.');
      } else if (error.response.status === 401) {
        setError('Authentication failed. Please login again.');
      } else if (error.response.status === 500) {
        setError('Server error: ' + (error.response.data?.error || 'Check backend console'));
      } else {
        setError(`Server error: ${error.response.status} - ${error.response.data?.message || 'Unknown error'}`);
      }
    } else if (error.request) {
      setError('Cannot connect to server. Please make sure backend is running on port 4001.');
    } else {
      setError('Unexpected error: ' + error.message);
    }
  };

  // Load data when component mounts or filters change
  useEffect(() => {
    fetchSalesData();
    fetchProductData();
    fetchRecentBuyers();
  }, [filterType, selectedYear, dateRange]);

  const handleFilterTypeChange = (type) => {
    setFilterType(type);
  };

  const handleYearChange = (e) => {
    setSelectedYear(parseInt(e.target.value));
  };

  const handleDateRangeChange = (field, value) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRefresh = () => {
    fetchSalesData();
    fetchProductData();
    fetchRecentBuyers();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num || 0);
  };

  const renderSalesChart = () => {
    if (loading) {
      return (
        <div style={styles.chartLoading}>
          <div style={styles.loadingSpinner}></div>
          <p>Loading sales data...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div style={styles.chartError}>
          <h3>❌ Error Loading Data</h3>
          <p>{error}</p>
          <button onClick={handleRefresh} style={styles.retryBtn}>
            Try Again
          </button>
        </div>
      );
    }

    if (salesData.length === 0) {
      return (
        <div style={styles.chartEmpty}>
          <h3>📊 No Sales Data Available</h3>
          <p>No delivered orders found for the selected period.</p>
        </div>
      );
    }

    const chartData = salesData.map(item => ({
      period: item.period,
      sales: item.totalSales || 0,
      orders: item.orderCount || 0
    }));

    if (chartType === 'line') {
      return (
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
            <XAxis 
              dataKey="period" 
              angle={-45}
              textAnchor="end"
              height={60}
              tick={{ fontSize: 10, fill: '#d4af37' }}
            />
            <YAxis 
              tickFormatter={(value) => formatCurrency(value)}
              tick={{ fontSize: 10, fill: '#d4af37' }}
            />
            <Tooltip 
              formatter={(value, name) => [
                name === 'sales' ? formatCurrency(value) : formatNumber(value),
                name === 'sales' ? 'Sales' : 'Orders'
              ]}
              labelFormatter={(label) => `Period: ${label}`}
              contentStyle={styles.tooltip}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="sales" 
              stroke="#d4af37" 
              strokeWidth={2}
              dot={{ fill: '#d4af37', strokeWidth: 2, r: 3 }}
              activeDot={{ r: 5, stroke: '#d4af37', strokeWidth: 2 }}
              name="Total Sales"
            />
            <Line 
              type="monotone" 
              dataKey="orders" 
              stroke="#f9e076" 
              strokeWidth={2}
              dot={{ fill: '#f9e076', strokeWidth: 2, r: 3 }}
              activeDot={{ r: 5, stroke: '#f9e076', strokeWidth: 2 }}
              name="Order Count"
            />
          </LineChart>
        </ResponsiveContainer>
      );
    } else {
      return (
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
            <XAxis 
              dataKey="period" 
              angle={-45}
              textAnchor="end"
              height={60}
              tick={{ fontSize: 10, fill: '#d4af37' }}
            />
            <YAxis 
              tickFormatter={(value) => formatCurrency(value)}
              tick={{ fontSize: 10, fill: '#d4af37' }}
            />
            <Tooltip 
              formatter={(value, name) => [
                name === 'sales' ? formatCurrency(value) : formatNumber(value),
                name === 'sales' ? 'Sales' : 'Orders'
              ]}
              labelFormatter={(label) => `Period: ${label}`}
              contentStyle={styles.tooltip}
            />
            <Legend />
            <Bar 
              dataKey="sales" 
              fill="#d4af37" 
              name="Total Sales"
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              dataKey="orders" 
              fill="#f9e076" 
              name="Order Count"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      );
    }
  };

  const renderProductChart = () => {
    if (loading) {
      return (
        <div style={styles.chartLoading}>
          <div style={styles.loadingSpinner}></div>
          <p>Loading product data...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div style={styles.chartError}>
          <h3>❌ Error Loading Data</h3>
          <p>{error}</p>
          <button onClick={handleRefresh} style={styles.retryBtn}>
            Try Again
          </button>
        </div>
      );
    }

    if (productData.length === 0) {
      return (
        <div style={styles.chartEmpty}>
          <h3>📦 No Product Sales Data</h3>
          <p>No product sales found for the selected period.</p>
        </div>
      );
    }

    const pieData = productData.slice(0, 8).map(item => ({
      name: item.productName?.length > 15 ? item.productName.substring(0, 15) + '...' : item.productName,
      value: item.totalRevenue,
      quantity: item.totalQuantity
    }));

    return (
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            labelLine={true}
            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value, name, props) => [
              formatCurrency(value),
              'Revenue'
            ]}
            contentStyle={styles.tooltip}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div style={styles.mainContainer}>
      {/* Admin Header */}
      <AdminHeader admin={user} handleLogout={handleLogout} />

      <div style={styles.salesChartContainer}>
        {/* Header */}
        <div style={styles.chartHeader}>
          <div style={styles.headerContent}>
            <div style={styles.titleSection}>
              <div style={styles.iconContainer}>
                📊
              </div>
              <div>
                <h2 style={styles.chartTitle}>Sales Analytics Dashboard</h2>
                <p style={styles.chartSubtitle}>Real-time sales performance and product insights</p>
              </div>
            </div>
            <div style={styles.statusIndicator}>
              <div style={{
                ...styles.statusDot,
                backgroundColor: !loading && !error ? '#d4af37' : '#ffd700'
              }}></div>
              <small style={styles.statusText}>
                {loading ? 'Loading...' : error ? 'Error' : 'System Online'}
              </small>
            </div>
          </div>

          {/* Summary Cards */}
          <div style={styles.summaryCards}>
            <div style={styles.summaryCard}>
              <div style={styles.summaryIcon}>💰</div>
              <div>
                <h3 style={styles.summaryCardTitle}>Total Revenue</h3>
                <p style={styles.revenue}>{formatCurrency(summary.totalRevenue)}</p>
              </div>
            </div>
            <div style={styles.summaryCard}>
              <div style={styles.summaryIcon}>📦</div>
              <div>
                <h3 style={styles.summaryCardTitle}>Total Orders</h3>
                <p style={styles.orders}>{formatNumber(summary.totalOrders)}</p>
              </div>
            </div>
            <div style={styles.summaryCard}>
              <div style={styles.summaryIcon}>📊</div>
              <div>
                <h3 style={styles.summaryCardTitle}>Avg Order Value</h3>
                <p style={styles.aov}>{formatCurrency(summary.averageOrderValue)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div style={styles.chartControls}>
          <div style={styles.controlsLeft}>
            <div style={styles.controlGroup}>
              <label style={styles.controlLabel}>Chart Type:</label>
              <select 
                value={chartType} 
                onChange={(e) => setChartType(e.target.value)}
                style={styles.controlSelect}
              >
                <option value="line">Line Chart</option>
                <option value="bar">Bar Chart</option>
              </select>
            </div>

            <div style={styles.controlGroup}>
              <label style={styles.controlLabel}>View Type:</label>
              <select 
                value={filterType} 
                onChange={(e) => handleFilterTypeChange(e.target.value)}
                style={styles.controlSelect}
              >
                <option value="monthly">Monthly View</option>
                <option value="yearly">Yearly View</option>
                <option value="dateRange">Date Range</option>
              </select>
            </div>

            {filterType !== 'dateRange' && (
              <div style={styles.controlGroup}>
                <label style={styles.controlLabel}>Year:</label>
                <select 
                  value={selectedYear} 
                  onChange={handleYearChange}
                  style={styles.controlSelect}
                >
                  {generateYears().map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            )}

            {filterType === 'dateRange' && (
              <>
                <div style={styles.controlGroup}>
                  <label style={styles.controlLabel}>Start Date:</label>
                  <input
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
                    style={styles.controlInput}
                  />
                </div>
                <div style={styles.controlGroup}>
                  <label style={styles.controlLabel}>End Date:</label>
                  <input
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
                    style={styles.controlInput}
                  />
                </div>
              </>
            )}
          </div>

          <button onClick={handleRefresh} style={styles.refreshBtn}>
            🔄 Refresh Data
          </button>
        </div>

        {/* Dual Chart Layout */}
        <div style={styles.chartsGrid}>
          {/* Sales Trend Chart */}
          <div style={styles.chartCard}>
            <div style={styles.chartHeaderSmall}>
              <h3 style={styles.chartTitleSmall}>📈 Sales Trends</h3>
              <div style={styles.chartLegend}>
                <div style={styles.legendItem}>
                  <div style={{...styles.legendColor, backgroundColor: '#d4af37'}}></div>
                  <span>Sales</span>
                </div>
                <div style={styles.legendItem}>
                  <div style={{...styles.legendColor, backgroundColor: '#f9e076'}}></div>
                  <span>Orders</span>
                </div>
              </div>
            </div>
            <div style={styles.chartContainerSmall}>
              {renderSalesChart()}
            </div>
          </div>

          {/* Product Performance Chart */}
          <div style={styles.chartCard}>
            <div style={styles.chartHeaderSmall}>
              <h3 style={styles.chartTitleSmall}>🥧 Top Products</h3>
              <div style={styles.productCount}>
                {productData.length} products
              </div>
            </div>
            <div style={styles.chartContainerSmall}>
              {renderProductChart()}
            </div>
          </div>
        </div>

        {/* Data Tables */}
        <div style={styles.tablesGrid}>
          {/* Sales Data Table */}
          <div style={styles.tableCard}>
            <h3 style={styles.tableTitle}>Sales Data</h3>
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.tableHeader}>Period</th>
                    <th style={styles.tableHeader}>Sales</th>
                    <th style={styles.tableHeader}>Orders</th>
                  </tr>
                </thead>
                <tbody>
                  {salesData.map((item, index) => (
                    <tr key={index} style={index % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd}>
                      <td style={styles.tableCell}>{item.period}</td>
                      <td style={styles.tableCell}>{formatCurrency(item.totalSales)}</td>
                      <td style={styles.tableCell}>{formatNumber(item.orderCount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Product Data Table */}
          <div style={styles.tableCard}>
            <h3 style={styles.tableTitle}>Top Products</h3>
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.tableHeader}>Product</th>
                    <th style={styles.tableHeader}>Qty</th>
                    <th style={styles.tableHeader}>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {productData.map((product, index) => (
                    <tr key={product.productId || index} style={index % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd}>
                      <td style={styles.tableCell}>
                        {product.productName?.length > 20 
                          ? product.productName.substring(0, 20) + '...' 
                          : product.productName}
                      </td>
                      <td style={styles.tableCell}>{formatNumber(product.totalQuantity)}</td>
                      <td style={styles.tableCell}>{formatCurrency(product.totalRevenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Recent Buyers Section */}
        <div style={styles.recentBuyersSection}>
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>🛍️ Recent Buyers</h3>
            <div style={styles.buyersCount}>
              {recentBuyers.length} transactions
            </div>
          </div>
          
          <div style={styles.buyersGridContainer}>
            <div style={styles.buyersGrid}>
              {recentBuyers.map((buyer, index) => (
                <div key={buyer._id || index} style={styles.buyerCard}>
                  <div style={styles.buyerHeader}>
                    <div style={styles.buyerAvatar}>
                      {buyer.userName?.charAt(0).toUpperCase() || 'G'}
                    </div>
                    <div style={styles.buyerInfo}>
                      <h4 style={styles.buyerName}>{buyer.userName}</h4>
                      <p style={styles.buyerEmail}>{buyer.userEmail}</p>
                    </div>
                    <div style={styles.purchaseDate}>
                      {new Date(buyer.purchaseDate).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div style={styles.purchaseItems}>
                    {buyer.items.slice(0, 3).map((item, itemIndex) => (
                      <div key={itemIndex} style={styles.purchaseItem}>
                        <span style={styles.itemName}>
                          {item.productName?.length > 25 
                            ? item.productName.substring(0, 25) + '...' 
                            : item.productName}
                        </span>
                        <div style={styles.itemDetails}>
                          <span style={styles.itemQuantity}>x{item.quantity}</span>
                          <span style={styles.itemPrice}>{formatCurrency(item.totalPrice)}</span>
                        </div>
                      </div>
                    ))}
                    {buyer.items.length > 3 && (
                      <div style={styles.moreItems}>
                        +{buyer.items.length - 3} more items
                      </div>
                    )}
                  </div>
                  
                  <div style={styles.orderTotal}>
                    <span>Order Total:</span>
                    <strong style={styles.totalAmount}>
                      {formatCurrency(buyer.items.reduce((sum, item) => sum + item.totalPrice, 0))}
                    </strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Admin Footer */}
      <AdminFooter />
    </div>
  );
};

// Gold Metallic Theme Styles
const styles = {
  mainContainer: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 50%, #2d2d2d 100%)',
    margin: 0,
    padding: 0,
  },
  salesChartContainer: {
    flex: 1,
    padding: '20px',
    background: 'transparent',
    position: 'relative',
    zIndex: 1,
  },
  chartHeader: {
    background: 'linear-gradient(135deg, rgba(212,175,55,0.15) 0%, rgba(192,156,39,0.1) 100%)',
    backdropFilter: 'blur(15px)',
    padding: '25px',
    borderRadius: '16px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(212,175,55,0.2)',
    marginBottom: '25px',
    border: '1px solid rgba(212,175,55,0.3)',
    position: 'relative',
    overflow: 'hidden',
  },
  headerContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '20px',
  },
  titleSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  iconContainer: {
    width: '50px',
    height: '50px',
    background: 'linear-gradient(135deg, #d4af37, #f9e076)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
    boxShadow: '0 4px 15px rgba(212,175,55,0.4)',
  },
  chartTitle: {
    margin: '0 0 5px 0',
    color: '#d4af37',
    fontSize: '1.8rem',
    fontWeight: '700',
    background: 'linear-gradient(135deg, #d4af37, #f9e076)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  chartSubtitle: {
    margin: 0,
    color: '#f9e076',
    fontSize: '0.9rem',
    opacity: 0.8,
  },
  statusIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  statusDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    boxShadow: '0 0 10px rgba(212,175,55,0.5)',
  },
  statusText: {
    color: '#d4af37',
    fontWeight: '600',
    fontSize: '0.8rem',
  },
  summaryCards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px',
  },
  summaryCard: {
    background: 'linear-gradient(135deg, rgba(30,30,30,0.9) 0%, rgba(40,40,40,0.9) 100%)',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.3), inset 0 1px 0 rgba(212,175,55,0.1)',
    border: '1px solid rgba(212,175,55,0.2)',
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    transition: 'all 0.3s ease',
  },
  summaryCardHover: {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(212,175,55,0.2)',
    border: '1px solid rgba(212,175,55,0.4)',
  },
  summaryIcon: {
    fontSize: '2rem',
    opacity: 0.9,
  },
  summaryCardTitle: {
    margin: '0 0 8px 0',
    color: '#d4af37',
    fontSize: '0.9rem',
    fontWeight: '600',
    opacity: 0.9,
  },
  revenue: {
    margin: 0,
    fontSize: '1.4rem',
    fontWeight: 'bold',
    color: '#f9e076',
    background: 'linear-gradient(135deg, #f9e076, #d4af37)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  orders: {
    margin: 0,
    fontSize: '1.4rem',
    fontWeight: 'bold',
    color: '#f9e076',
    background: 'linear-gradient(135deg, #f9e076, #d4af37)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  aov: {
    margin: 0,
    fontSize: '1.4rem',
    fontWeight: 'bold',
    color: '#f9e076',
    background: 'linear-gradient(135deg, #f9e076, #d4af37)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  chartControls: {
    background: 'linear-gradient(135deg, rgba(30,30,30,0.9) 0%, rgba(40,40,40,0.9) 100%)',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.3), inset 0 1px 0 rgba(212,175,55,0.1)',
    border: '1px solid rgba(212,175,55,0.2)',
    marginBottom: '25px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '15px',
  },
  controlsLeft: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '20px',
    alignItems: 'center',
  },
  controlGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  controlLabel: {
    fontWeight: '600',
    fontSize: '0.8rem',
    color: '#d4af37',
  },
  controlSelect: {
    padding: '8px 12px',
    background: 'rgba(20,20,20,0.8)',
    border: '1px solid rgba(212,175,55,0.3)',
    borderRadius: '6px',
    fontSize: '0.8rem',
    color: '#f9e076',
    minWidth: '120px',
  },
  controlInput: {
    padding: '8px 12px',
    background: 'rgba(20,20,20,0.8)',
    border: '1px solid rgba(212,175,55,0.3)',
    borderRadius: '6px',
    fontSize: '0.8rem',
    color: '#f9e076',
    minWidth: '120px',
  },
  refreshBtn: {
    padding: '10px 20px',
    background: 'linear-gradient(135deg, #d4af37 0%, #f9e076 100%)',
    color: '#1a1a1a',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(212,175,55,0.3)',
  },
  refreshBtnHover: {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 16px rgba(212,175,55,0.4)',
  },
  chartsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '25px',
    marginBottom: '25px',
  },
  chartCard: {
    background: 'linear-gradient(135deg, rgba(30,30,30,0.9) 0%, rgba(40,40,40,0.9) 100%)',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.3), inset 0 1px 0 rgba(212,175,55,0.1)',
    border: '1px solid rgba(212,175,55,0.2)',
  },
  chartHeaderSmall: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
  },
  chartTitleSmall: {
    margin: 0,
    color: '#d4af37',
    fontSize: '1.1rem',
    fontWeight: '600',
  },
  chartLegend: {
    display: 'flex',
    gap: '15px',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '0.8rem',
    color: '#f9e076',
  },
  legendColor: {
    width: '12px',
    height: '12px',
    borderRadius: '2px',
  },
  productCount: {
    fontSize: '0.8rem',
    color: '#d4af37',
    fontWeight: '600',
    background: 'rgba(212,175,55,0.1)',
    padding: '4px 8px',
    borderRadius: '4px',
  },
  chartContainerSmall: {
    height: '250px',
  },
  tablesGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '25px',
  },
  tableCard: {
    background: 'linear-gradient(135deg, rgba(30,30,30,0.9) 0%, rgba(40,40,40,0.9) 100%)',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.3), inset 0 1px 0 rgba(212,175,55,0.1)',
    border: '1px solid rgba(212,175,55,0.2)',
  },
  tableTitle: {
    margin: '0 0 15px 0',
    color: '#d4af37',
    fontSize: '1.1rem',
    fontWeight: '600',
  },
  tableContainer: {
    maxHeight: '300px',
    overflowY: 'auto',
    overflowX: 'hidden',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.8rem',
  },
  tableHeader: {
    padding: '10px',
    textAlign: 'left',
    borderBottom: '2px solid rgba(212,175,55,0.3)',
    fontWeight: 'bold',
    color: '#d4af37',
    fontSize: '0.75rem',
    position: 'sticky',
    top: 0,
    backgroundColor: 'rgba(30,30,30,0.95)',
    zIndex: 1,
  },
  tableRowEven: {
    backgroundColor: 'rgba(212,175,55,0.05)',
  },
  tableRowOdd: {
    backgroundColor: 'transparent',
  },
  tableCell: {
    padding: '10px',
    borderBottom: '1px solid rgba(212,175,55,0.1)',
    color: '#f9e076',
    fontSize: '0.75rem',
  },
  recentBuyersSection: {
    background: 'linear-gradient(135deg, rgba(30,30,30,0.9) 0%, rgba(40,40,40,0.9) 100%)',
    padding: '25px',
    borderRadius: '12px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.3), inset 0 1px 0 rgba(212,175,55,0.1)',
    border: '1px solid rgba(212,175,55,0.2)',
    marginTop: '25px',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  sectionTitle: {
    margin: 0,
    color: '#d4af37',
    fontSize: '1.3rem',
    fontWeight: '600',
  },
  buyersCount: {
    fontSize: '0.8rem',
    color: '#d4af37',
    fontWeight: '600',
    background: 'rgba(212,175,55,0.1)',
    padding: '6px 12px',
    borderRadius: '6px',
  },
  buyersGridContainer: {
    maxHeight: '500px',
    overflowY: 'auto',
    overflowX: 'hidden',
  },
  buyersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px',
    padding: '5px',
  },
  buyerCard: {
    background: 'rgba(20,20,20,0.6)',
    padding: '20px',
    borderRadius: '10px',
    border: '1px solid rgba(212,175,55,0.15)',
    transition: 'all 0.3s ease',
    minHeight: '180px',
  },
  buyerHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '15px',
    paddingBottom: '15px',
    borderBottom: '1px solid rgba(212,175,55,0.1)',
  },
  buyerAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #d4af37, #f9e076)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#1a1a1a',
    fontWeight: 'bold',
    fontSize: '0.9rem',
  },
  buyerInfo: {
    flex: 1,
  },
  buyerName: {
    margin: '0 0 4px 0',
    color: '#f9e076',
    fontSize: '0.9rem',
    fontWeight: '600',
  },
  buyerEmail: {
    margin: 0,
    color: '#d4af37',
    fontSize: '0.75rem',
    opacity: 0.8,
  },
  purchaseDate: {
    fontSize: '0.7rem',
    color: '#d4af37',
    background: 'rgba(212,175,55,0.1)',
    padding: '4px 8px',
    borderRadius: '4px',
  },
  purchaseItems: {
    marginBottom: '15px',
    maxHeight: '120px',
    overflowY: 'auto',
  },
  purchaseItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
    borderBottom: '1px solid rgba(212,175,55,0.05)',
  },
  itemName: {
    color: '#f9e076',
    fontSize: '0.8rem',
    flex: 1,
  },
  itemDetails: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  itemQuantity: {
    color: '#d4af37',
    fontSize: '0.75rem',
    background: 'rgba(212,175,55,0.1)',
    padding: '2px 6px',
    borderRadius: '3px',
  },
  itemPrice: {
    color: '#f9e076',
    fontSize: '0.8rem',
    fontWeight: '600',
    minWidth: '60px',
    textAlign: 'right',
  },
  moreItems: {
    textAlign: 'center',
    color: '#d4af37',
    fontSize: '0.75rem',
    padding: '8px',
    background: 'rgba(212,175,55,0.05)',
    borderRadius: '4px',
    marginTop: '5px',
  },
  orderTotal: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '12px',
    borderTop: '1px solid rgba(212,175,55,0.1)',
    color: '#d4af37',
    fontSize: '0.85rem',
    fontWeight: '600',
  },
  totalAmount: {
    color: '#f9e076',
    fontSize: '1rem',
    background: 'linear-gradient(135deg, #f9e076, #d4af37)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  chartLoading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: '#d4af37',
  },
  chartError: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    textAlign: 'center',
    color: '#ff6b6b',
  },
  chartEmpty: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    textAlign: 'center',
    color: '#d4af37',
  },
  retryBtn: {
    padding: '8px 16px',
    background: 'linear-gradient(135deg, #d4af37 0%, #f9e076 100%)',
    color: '#1a1a1a',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    marginTop: '10px',
    fontSize: '0.8rem',
    fontWeight: '600',
  },
  tooltip: {
    backgroundColor: '#1a1a1a',
    border: '1px solid rgba(212,175,55,0.3)',
    borderRadius: '6px',
    color: '#f9e076',
  },
  loadingSpinner: {
    border: '3px solid rgba(212,175,55,0.3)',
    borderTop: '3px solid #d4af37',
    borderRadius: '50%',
    width: '30px',
    height: '30px',
    animation: 'spin 1s linear infinite',
    marginBottom: '10px',
  },
};

// Add CSS animation for loading spinner
const styleSheet = document.styleSheets[0];
const keyframes = `
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`;
try {
  styleSheet.insertRule(keyframes, styleSheet.cssRules.length);
} catch (e) {
  console.log('Could not insert keyframes rule');
}

export default SalesChart;