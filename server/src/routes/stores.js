const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const authenticate = require('../middleware/auth');
const { requireAdmin, requireUserOrStoreOwner, requireStoreOwner } = require('../middleware/authorize');
const { validate, sanitizeInput } = require('../middleware/validation');
const { storeCreationSchema, searchSchema } = require('../utils/validation');
const { generalLimiter } = require('../middleware/rateLimiter');

// Apply general rate limiting to all routes
router.use(generalLimiter);

// Public routes
router.get(
  '/',
  sanitizeInput,
  validate(searchSchema, 'query'),
  storeController.getAllStores
);

router.get(
  '/:id',
  storeController.getStoreById
);

// Protected routes
router.post(
  '/',
  authenticate,
  requireAdmin,
  sanitizeInput,
  validate(storeCreationSchema),
  storeController.createStore
);

router.put(
  '/:id',
  authenticate,
  requireUserOrStoreOwner,
  sanitizeInput,
  storeController.updateStore
);

router.delete(
  '/:id',
  authenticate,
  requireAdmin,
  storeController.deleteStore
);

router.get(
  '/owner/my-stores',
  authenticate,
  requireStoreOwner,
  sanitizeInput,
  storeController.getMyStores
);

module.exports = router;