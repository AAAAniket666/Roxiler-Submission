const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticate = require('../middleware/auth');
const { requireAdmin } = require('../middleware/authorize');
const { validate, sanitizeInput } = require('../middleware/validation');
const { userRegistrationSchema, searchSchema } = require('../utils/validation');
const { generalLimiter } = require('../middleware/rateLimiter');

// Apply rate limiting and authentication to all routes
router.use(generalLimiter);
router.use(authenticate);
router.use(requireAdmin);

// Get all users with search and pagination
router.get(
  '/',
  sanitizeInput,
  validate(searchSchema, 'query'),
  userController.getAllUsers
);

// Get single user by ID
router.get(
  '/:id',
  userController.getUserById
);

// Create new user
router.post(
  '/',
  sanitizeInput,
  validate(userRegistrationSchema),
  userController.createUser
);

// Update user
router.put(
  '/:id',
  sanitizeInput,
  userController.updateUser
);

// Delete user
router.delete(
  '/:id',
  userController.deleteUser
);

// Get users by role
router.get(
  '/role/:role',
  sanitizeInput,
  userController.getUsersByRole
);

module.exports = router;