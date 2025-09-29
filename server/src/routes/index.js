const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth');
const userRoutes = require('./users');
const storeRoutes = require('./stores');
const ratingRoutes = require('./ratings');
const dashboardRoutes = require('./dashboard');

// API health check
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Store Rating Platform API is running!',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/stores', storeRoutes);
router.use('/ratings', ratingRoutes);
router.use('/dashboard', dashboardRoutes);

// Handle undefined routes
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

module.exports = router;