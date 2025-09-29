const { Store, User, Rating } = require('../models');
const { Op } = require('sequelize');

const storeController = {
  // Create new store (Admin only)
  createStore: async (req, res) => {
    try {
      const { name, email, address, owner_id } = req.body;

      // Verify owner exists and is a store_owner or admin
      const owner = await User.findByPk(owner_id);
      if (!owner) {
        return res.status(404).json({
          success: false,
          message: 'Store owner not found.',
        });
      }

      if (owner.role !== 'store_owner' && owner.role !== 'admin') {
        return res.status(400).json({
          success: false,
          message: 'Only users with store_owner or admin role can own a store.',
        });
      }

      // Check if store email already exists
      const existingStore = await Store.findOne({ where: { email } });
      if (existingStore) {
        return res.status(409).json({
          success: false,
          message: 'Store with this email already exists.',
        });
      }

      // Create store
      const store = await Store.create({
        name,
        email,
        address,
        owner_id,
      });

      // Fetch store with owner details
      const storeWithOwner = await Store.findByPk(store.id, {
        include: [
          {
            model: User,
            as: 'owner',
            attributes: ['id', 'name', 'email'],
          },
        ],
      });

      res.status(201).json({
        success: true,
        message: 'Store created successfully.',
        data: { store: storeWithOwner },
      });
    } catch (error) {
      console.error('Create store error:', error);
      
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
        message: 'Internal server error while creating store.',
      });
    }
  },

  // Get all stores with pagination and search
  getAllStores: async (req, res) => {
    try {
      const { 
        page = 1, 
        limit = 10, 
        query = '', 
        sortBy = 'created_at', 
        sortOrder = 'DESC' 
      } = req.query;

      const offset = (page - 1) * limit;
      const whereClause = {};

      // Add search functionality
      if (query) {
        whereClause[Op.or] = [
          { name: { [Op.iLike]: `%${query}%` } },
          { address: { [Op.iLike]: `%${query}%` } },
        ];
      }

      // Get stores with pagination
      const { count, rows: stores } = await Store.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'owner',
            attributes: ['id', 'name', 'email'],
          },
        ],
        order: [[sortBy, sortOrder.toUpperCase()]],
        limit: parseInt(limit),
        offset: parseInt(offset),
      });

      const totalPages = Math.ceil(count / limit);

      res.status(200).json({
        success: true,
        message: 'Stores retrieved successfully.',
        data: {
          stores,
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
      console.error('Get all stores error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while retrieving stores.',
      });
    }
  },

  // Get single store by ID
  getStoreById: async (req, res) => {
    try {
      const { id } = req.params;

      const store = await Store.findByPk(id, {
        include: [
          {
            model: User,
            as: 'owner',
            attributes: ['id', 'name', 'email'],
          },
          {
            model: Rating,
            as: 'ratings',
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['id', 'name'],
              },
            ],
            order: [['created_at', 'DESC']],
            limit: 10, // Show latest 10 ratings
          },
        ],
      });

      if (!store) {
        return res.status(404).json({
          success: false,
          message: 'Store not found.',
        });
      }

      res.status(200).json({
        success: true,
        message: 'Store retrieved successfully.',
        data: { store },
      });
    } catch (error) {
      console.error('Get store by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while retrieving store.',
      });
    }
  },

  // Update store (Admin or Store Owner)
  updateStore: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, email, address } = req.body;

      const store = await Store.findByPk(id);
      if (!store) {
        return res.status(404).json({
          success: false,
          message: 'Store not found.',
        });
      }

      // Check if user has permission to update
      if (req.user.role !== 'admin' && req.user.id !== store.owner_id) {
        return res.status(403).json({
          success: false,
          message: 'You can only update your own store.',
        });
      }

      // Check if email is being changed and new email already exists
      if (email && email !== store.email) {
        const existingStore = await Store.findOne({ 
          where: { 
            email,
            id: { [Op.ne]: id },
          },
        });
        
        if (existingStore) {
          return res.status(409).json({
            success: false,
            message: 'Store with this email already exists.',
          });
        }
      }

      // Update store
      if (name) store.name = name;
      if (email) store.email = email;
      if (address !== undefined) store.address = address;

      await store.save();

      // Fetch updated store with owner details
      const updatedStore = await Store.findByPk(store.id, {
        include: [
          {
            model: User,
            as: 'owner',
            attributes: ['id', 'name', 'email'],
          },
        ],
      });

      res.status(200).json({
        success: true,
        message: 'Store updated successfully.',
        data: { store: updatedStore },
      });
    } catch (error) {
      console.error('Update store error:', error);
      
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
        message: 'Internal server error while updating store.',
      });
    }
  },

  // Delete store (Admin only)
  deleteStore: async (req, res) => {
    try {
      const { id } = req.params;

      const store = await Store.findByPk(id);
      if (!store) {
        return res.status(404).json({
          success: false,
          message: 'Store not found.',
        });
      }

      await store.destroy();

      res.status(200).json({
        success: true,
        message: 'Store deleted successfully.',
      });
    } catch (error) {
      console.error('Delete store error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while deleting store.',
      });
    }
  },

  // Get stores by owner (Store Owner's own stores)
  getMyStores: async (req, res) => {
    try {
      const owner_id = req.user.id;
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      const { count, rows: stores } = await Store.findAndCountAll({
        where: { owner_id },
        include: [
          {
            model: Rating,
            as: 'ratings',
            attributes: ['rating', 'created_at'],
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['name'],
              },
            ],
            order: [['created_at', 'DESC']],
            limit: 5, // Show latest 5 ratings per store
          },
        ],
        order: [['created_at', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset),
      });

      const totalPages = Math.ceil(count / limit);

      res.status(200).json({
        success: true,
        message: 'Your stores retrieved successfully.',
        data: {
          stores,
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalItems: count,
            itemsPerPage: parseInt(limit),
          },
        },
      });
    } catch (error) {
      console.error('Get my stores error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while retrieving your stores.',
      });
    }
  },
};

module.exports = storeController;