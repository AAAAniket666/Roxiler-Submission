const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authenticate = require('../middleware/auth');
const { requireAdmin, requireStoreOwner, requireUser } = require('../middleware/authorize');
const { generalLimiter } = require('../middleware/rateLimiter');

// Apply rate limiting and authentication to all routes
router.use(generalLimiter);
router.use(authenticate);

// Admin dashboard
router.get(
  '/admin/stats',
  requireAdmin,
  dashboardController.getAdminStats
);

// Store owner dashboard
router.get(
  '/store-owner/stats',
  requireStoreOwner,
  dashboardController.getStoreOwnerStats
);

// User dashboard
router.get(
  '/user/stats',
  requireUser,
  dashboardController.getUserStats
);

module.exports = router;