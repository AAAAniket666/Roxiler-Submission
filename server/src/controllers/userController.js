const { User, Store, Rating } = require('../models');
const { Op } = require('sequelize');

const userController = {
  // Get all users (Admin only)
  getAllUsers: async (req, res) => {
    try {
      const { 
        page = 1, 
        limit = 10, 
        query = '', 
        role = '', 
        sortBy = 'created_at', 
        sortOrder = 'DESC' 
      } = req.query;

      const offset = (page - 1) * limit;
      const whereClause = {};

      // Add search functionality
      if (query) {
        whereClause[Op.or] = [
          { name: { [Op.iLike]: `%${query}%` } },
          { email: { [Op.iLike]: `%${query}%` } },
          { address: { [Op.iLike]: `%${query}%` } },
        ];
      }

      // Add role filter
      if (role) {
        whereClause.role = role;
      }

      // Get users with pagination
      const { count, rows: users } = await User.findAndCountAll({
        where: whereClause,
        attributes: { exclude: ['password'] },
        order: [[sortBy, sortOrder.toUpperCase()]],
        limit: parseInt(limit),
        offset: parseInt(offset),
      });

      const totalPages = Math.ceil(count / limit);

      res.status(200).json({
        success: true,
        message: 'Users retrieved successfully.',
        data: {
          users,
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalItems: count,
            itemsPerPage: parseInt(limit),
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
          },
        },
      });
    } catch (error) {
      console.error('Get all users error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while retrieving users.',
      });
    }
  },

  // Get single user by ID (Admin only)
  getUserById: async (req, res) => {
    try {
      const { id } = req.params;

      const user = await User.findByPk(id, {
        attributes: { exclude: ['password'] },
        include: [
          {
            model: Store,
            as: 'ownedStores',
            attributes: ['id', 'name', 'email', 'average_rating', 'total_ratings'],
          },
          {
            model: Rating,
            as: 'ratings',
            attributes: ['id', 'rating', 'created_at'],
            include: [
              {
                model: Store,
                as: 'store',
                attributes: ['id', 'name'],
              },
            ],
            order: [['created_at', 'DESC']],
            limit: 5,
          },
        ],
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found.',
        });
      }

      res.status(200).json({
        success: true,
        message: 'User retrieved successfully.',
        data: { user },
      });
    } catch (error) {
      console.error('Get user by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while retrieving user.',
      });
    }
  },

  // Create new user (Admin only)
  createUser: async (req, res) => {
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

      res.status(201).json({
        success: true,
        message: 'User created successfully.',
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            address: user.address,
            role: user.role,
            created_at: user.created_at,
          },
        },
      });
    } catch (error) {
      console.error('Create user error:', error);
      
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
        message: 'Internal server error while creating user.',
      });
    }
  },

  // Update user (Admin only)
  updateUser: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, email, address, role } = req.body;

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found.',
        });
      }

      // Check if email is being changed and new email already exists
      if (email && email !== user.email) {
        const existingUser = await User.findOne({ 
          where: { 
            email,
            id: { [Op.ne]: id },
          },
        });
        
        if (existingUser) {
          return res.status(409).json({
            success: false,
            message: 'User with this email already exists.',
          });
        }
      }

      // Update user data
      if (name) user.name = name;
      if (email) user.email = email;
      if (address !== undefined) user.address = address;
      if (role) user.role = role;

      await user.save();

      res.status(200).json({
        success: true,
        message: 'User updated successfully.',
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            address: user.address,
            role: user.role,
            updated_at: user.updated_at,
          },
        },
      });
    } catch (error) {
      console.error('Update user error:', error);
      
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
        message: 'Internal server error while updating user.',
      });
    }
  },

  // Delete user (Admin only)
  deleteUser: async (req, res) => {
    try {
      const { id } = req.params;

      // Prevent admin from deleting themselves
      if (parseInt(id) === req.user.id) {
        return res.status(400).json({
          success: false,
          message: 'You cannot delete your own account.',
        });
      }

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found.',
        });
      }

      await user.destroy();

      res.status(200).json({
        success: true,
        message: 'User deleted successfully.',
      });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while deleting user.',
      });
    }
  },

  // Get users by role (Admin only)
  getUsersByRole: async (req, res) => {
    try {
      const { role } = req.params;
      const { page = 1, limit = 10 } = req.query;

      if (!['admin', 'user', 'store_owner'].includes(role)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid role. Must be admin, user, or store_owner.',
        });
      }

      const offset = (page - 1) * limit;

      const { count, rows: users } = await User.findAndCountAll({
        where: { role },
        attributes: { exclude: ['password'] },
        order: [['created_at', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset),
      });

      const totalPages = Math.ceil(count / limit);

      res.status(200).json({
        success: true,
        message: `Users with role '${role}' retrieved successfully.`,
        data: {
          users,
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalItems: count,
            itemsPerPage: parseInt(limit),
          },
        },
      });
    } catch (error) {
      console.error('Get users by role error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while retrieving users by role.',
      });
    }
  },
};

module.exports = userController;