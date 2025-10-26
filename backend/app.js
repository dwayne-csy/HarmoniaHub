const express = require('express');
const app = express();
const cors = require('cors')

// ========== CORS CONFIGURATION ==========
app.use(cors({
    origin: 'http://localhost:5173', // Your frontend URL
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// ========== OTHER MIDDLEWARE ==========
app.use(express.json({limit:'50mb'}));
app.use(express.urlencoded({limit: "50mb", extended: true }));

// ========== ROUTES ==========
const userRoutes = require('./routes/UserRoutes');
app.use('/api/v1', userRoutes);

module.exports = app