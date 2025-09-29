const { User } = require('../models');
const { generateToken } = require('../utils/jwt');

const authController = {
  // Register new user
  register: async (req, res) => {
    try {
      const { name, email, password, address, role } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'User with this email already exists.',
        });
      }

      // Create new user
      const user = await User.create({
        name,
        email,
        password,
        address,
        role: role || 'user',
      });

      // Generate JWT token
      const token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      res.status(201).json({
        success: true,
        message: 'User registered successfully.',
        data: {
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            address: user.address,
            role: user.role,
          },
        },
      });
    } catch (error) {
      console.error('Registration error:', error);
      
      if (error.name === 'SequelizeValidationError') {
        const errors = error.errors.map(err => ({
          field: err.path,
          message: err.message,
        }));
        
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors,
        });
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error during registration.',
      });
    }
  },

  // Login user
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Find user by email
      const user = await User.findOne({ 
        where: { email },
        attributes: ['id', 'name', 'email', 'password', 'address', 'role'],
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password.',
        });
      }

      // Verify password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password.',
        });
      }

      // Generate JWT token
      const token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      res.status(200).json({
        success: true,
        message: 'Login successful.',
        data: {
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            address: user.address,
            role: user.role,
          },
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during login.',
      });
    }
  },

  // Get current user profile
  getProfile: async (req, res) => {
    try {
      const user = req.user;
      
      res.status(200).json({
        success: true,
        message: 'Profile retrieved successfully.',
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            address: user.address,
            role: user.role,
            created_at: user.created_at,
            updated_at: user.updated_at,
          },
        },
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while retrieving profile.',
      });
    }
  },

  // Update user profile
  updateProfile: async (req, res) => {
    try {
      const userId = req.user.id;
      const { name, address } = req.body;

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found.',
        });
      }

      // Update user data
      if (name) user.name = name;
      if (address !== undefined) user.address = address;

      await user.save();

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully.',
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            address: user.address,
            role: user.role,
          },
        },
      });
    } catch (error) {
      console.error('Update profile error:', error);
      
      if (error.name === 'SequelizeValidationError') {
        const errors = error.errors.map(err => ({
          field: err.path,
          message: err.message,
        }));
        
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors,
        });
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error while updating profile.',
      });
    }
  },

  // Logout user (client-side token removal)
  logout: (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Logged out successfully. Please remove the token from client storage.',
    });
  },
};

module.exports = authController;