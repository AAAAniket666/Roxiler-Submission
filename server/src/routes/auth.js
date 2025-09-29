const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authenticate = require('../middleware/auth');
const { validate, sanitizeInput } = require('../middleware/validation');
const { userRegistrationSchema, userLoginSchema } = require('../utils/validation');
const rateLimit = require('express-rate-limit');

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // Limit each IP to 3 login attempts per windowMs
  message: {
    success: false,
    message: 'Too many login attempts. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Public routes
router.post(
  '/register',
  authLimiter,
  sanitizeInput,
  validate(userRegistrationSchema),
  authController.register
);

router.post(
  '/login',
  loginLimiter,
  sanitizeInput,
  validate(userLoginSchema),
  authController.login
);

// Protected routes
router.get(
  '/profile',
  authenticate,
  authController.getProfile
);

router.put(
  '/profile',
  authenticate,
  sanitizeInput,
  authController.updateProfile
);

router.post(
  '/logout',
  authenticate,
  authController.logout
);

module.exports = router;