const Joi = require('joi');

// User validation schemas
const userRegistrationSchema = Joi.object({
  name: Joi.string()
    .min(20)
    .max(60)
    .pattern(/^[a-zA-Z\s]+$/)
    .required()
    .messages({
      'string.pattern.base': 'Name can only contain letters and spaces',
      'string.min': 'Name must be at least 20 characters long',
      'string.max': 'Name cannot exceed 60 characters',
    }),
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
    }),
  password: Joi.string()
    .min(8)
    .max(16)
    .pattern(/^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>])/)
    .required()
    .messages({
      'string.pattern.base': 'Password must contain at least one uppercase letter and one special character',
      'string.min': 'Password must be at least 8 characters long',
      'string.max': 'Password cannot exceed 16 characters',
    }),
  address: Joi.string()
    .max(400)
    .optional()
    .messages({
      'string.max': 'Address cannot exceed 400 characters',
    }),
  role: Joi.string()
    .valid('admin', 'user', 'store_owner')
    .optional()
    .default('user'),
});

const userLoginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
    }),
  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Password is required',
    }),
});

// Store validation schemas
const storeCreationSchema = Joi.object({
  name: Joi.string()
    .min(20)
    .max(60)
    .required()
    .messages({
      'string.min': 'Store name must be at least 20 characters long',
      'string.max': 'Store name cannot exceed 60 characters',
    }),
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
    }),
  address: Joi.string()
    .max(400)
    .optional()
    .messages({
      'string.max': 'Address cannot exceed 400 characters',
    }),
  owner_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Owner ID must be a valid number',
      'number.positive': 'Owner ID must be a positive number',
    }),
});

// Rating validation schema
const ratingSchema = Joi.object({
  store_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Store ID must be a valid number',
      'number.positive': 'Store ID must be a positive number',
    }),
  rating: Joi.number()
    .integer()
    .min(1)
    .max(5)
    .required()
    .messages({
      'number.min': 'Rating must be at least 1',
      'number.max': 'Rating cannot exceed 5',
      'number.integer': 'Rating must be a whole number',
    }),
});

// Search and filter validation
const searchSchema = Joi.object({
  query: Joi.string()
    .min(1)
    .max(100)
    .optional()
    .messages({
      'string.max': 'Search query cannot exceed 100 characters',
    }),
  page: Joi.number()
    .integer()
    .min(1)
    .optional()
    .default(1),
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .optional()
    .default(10),
  sortBy: Joi.string()
    .valid('name', 'email', 'created_at', 'average_rating')
    .optional()
    .default('created_at'),
  sortOrder: Joi.string()
    .valid('ASC', 'DESC', 'asc', 'desc')
    .optional()
    .default('DESC'),
});

module.exports = {
  userRegistrationSchema,
  userLoginSchema,
  storeCreationSchema,
  ratingSchema,
  searchSchema,
};