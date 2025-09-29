const { Rating, Store, User } = require('../models');
const { sequelize } = require('../models');

const ratingController = {
  // Submit or update rating
  submitRating: async (req, res) => {
    try {
      const { store_id, rating } = req.body;
      const user_id = req.user.id;

      // Check if store exists
      const store = await Store.findByPk(store_id);
      if (!store) {
        return res.status(404).json({
          success: false,
          message: 'Store not found.',
        });
      }

      // Check if store owner is trying to rate their own store
      if (store.owner_id === user_id) {
        return res.status(400).json({
          success: false,
          message: 'You cannot rate your own store.',
        });
      }

      // Check if user has already rated this store
      const existingRating = await Rating.findOne({
        where: { user_id, store_id },
      });

      let ratingRecord;
      let message;

      if (existingRating) {
        // Update existing rating
        existingRating.rating = rating;
        ratingRecord = await existingRating.save();
        message = 'Rating updated successfully.';
      } else {
        // Create new rating
        ratingRecord = await Rating.create({
          user_id,
          store_id,
          rating,
        });
        message = 'Rating submitted successfully.';
      }

      // Fetch the rating with related data
      const ratingWithDetails = await Rating.findByPk(ratingRecord.id, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name'],
          },
          {
            model: Store,
            as: 'store',
            attributes: ['id', 'name', 'average_rating', 'total_ratings'],
          },
        ],
      });

      res.status(existingRating ? 200 : 201).json({
        success: true,
        message,
        data: { rating: ratingWithDetails },
      });
    } catch (error) {
      console.error('Submit rating error:', error);
      
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
        message: 'Internal server error while submitting rating.',
      });
    }
  },

  // Get ratings for a specific store
  getStoreRatings: async (req, res) => {
    try {
      const { storeId } = req.params;
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      // Check if store exists
      const store = await Store.findByPk(storeId);
      if (!store) {
        return res.status(404).json({
          success: false,
          message: 'Store not found.',
        });
      }

      // Get ratings with pagination
      const { count, rows: ratings } = await Rating.findAndCountAll({
        where: { store_id: storeId },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name'],
          },
        ],
        order: [['created_at', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset),
      });

      const totalPages = Math.ceil(count / limit);

      res.status(200).json({
        success: true,
        message: 'Store ratings retrieved successfully.',
        data: {
          store: {
            id: store.id,
            name: store.name,
            average_rating: store.average_rating,
            total_ratings: store.total_ratings,
          },
          ratings,
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalItems: count,
            itemsPerPage: parseInt(limit),
          },
        },
      });
    } catch (error) {
      console.error('Get store ratings error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while retrieving store ratings.',
      });
    }
  },

  // Get user's ratings
  getUserRatings: async (req, res) => {
    try {
      const user_id = req.user.id;
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      const { count, rows: ratings } = await Rating.findAndCountAll({
        where: { user_id },
        include: [
          {
            model: Store,
            as: 'store',
            attributes: ['id', 'name', 'address'],
          },
        ],
        order: [['created_at', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset),
      });

      const totalPages = Math.ceil(count / limit);

      res.status(200).json({
        success: true,
        message: 'Your ratings retrieved successfully.',
        data: {
          ratings,
          pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalItems: count,
            itemsPerPage: parseInt(limit),
          },
        },
      });
    } catch (error) {
      console.error('Get user ratings error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while retrieving your ratings.',
      });
    }
  },

  // Delete a rating
  deleteRating: async (req, res) => {
    try {
      const { id } = req.params;
      const user_id = req.user.id;

      const rating = await Rating.findByPk(id);
      if (!rating) {
        return res.status(404).json({
          success: false,
          message: 'Rating not found.',
        });
      }

      // Check if user owns the rating or is admin
      if (req.user.role !== 'admin' && rating.user_id !== user_id) {
        return res.status(403).json({
          success: false,
          message: 'You can only delete your own ratings.',
        });
      }

      await rating.destroy();

      res.status(200).json({
        success: true,
        message: 'Rating deleted successfully.',
      });
    } catch (error) {
      console.error('Delete rating error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while deleting rating.',
      });
    }
  },

  // Get user's rating for a specific store
  getUserStoreRating: async (req, res) => {
    try {
      const { storeId } = req.params;
      const user_id = req.user.id;

      const rating = await Rating.findOne({
        where: { user_id, store_id: storeId },
        include: [
          {
            model: Store,
            as: 'store',
            attributes: ['id', 'name'],
          },
        ],
      });

      if (!rating) {
        return res.status(404).json({
          success: false,
          message: 'You have not rated this store yet.',
        });
      }

      res.status(200).json({
        success: true,
        message: 'Your rating for this store retrieved successfully.',
        data: { rating },
      });
    } catch (error) {
      console.error('Get user store rating error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while retrieving your rating.',
      });
    }
  },
};

module.exports = ratingController;