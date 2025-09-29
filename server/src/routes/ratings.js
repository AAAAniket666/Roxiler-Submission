const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/ratingController');
const authenticate = require('../middleware/auth');
const { requireUser, requireUserOrStoreOwner } = require('../middleware/authorize');
const { validate, sanitizeInput } = require('../middleware/validation');
const { ratingSchema } = require('../utils/validation');
const { generalLimiter, strictLimiter } = require('../middleware/rateLimiter');

// Apply rate limiting
router.use(generalLimiter);

// Submit or update rating
router.post(
  '/',
  strictLimiter, // More restrictive for rating submissions
  authenticate,
  requireUser,
  sanitizeInput,
  validate(ratingSchema),
  ratingController.submitRating
);

// Get ratings for a specific store
router.get(
  '/store/:storeId',
  sanitizeInput,
  ratingController.getStoreRatings
);

// Get user's ratings
router.get(
  '/my-ratings',
  authenticate,
  requireUser,
  sanitizeInput,
  ratingController.getUserRatings
);

// Get user's rating for a specific store
router.get(
  '/my-rating/store/:storeId',
  authenticate,
  requireUser,
  ratingController.getUserStoreRating
);

// Delete a rating
router.delete(
  '/:id',
  authenticate,
  requireUserOrStoreOwner,
  ratingController.deleteRating
);

module.exports = router;