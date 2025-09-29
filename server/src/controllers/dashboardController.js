const { User, Store, Rating } = require('../models');
const { sequelize } = require('../models');
const { Op } = require('sequelize');

const dashboardController = {
  // Admin dashboard statistics
  getAdminStats: async (req, res) => {
    try {
      // Get counts
      const [totalUsers, totalStores, totalRatings] = await Promise.all([
        User.count(),
        Store.count(),
        Rating.count(),
      ]);

      // Get user role distribution
      const usersByRole = await User.findAll({
        attributes: [
          'role',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        ],
        group: ['role'],
        raw: true,
      });

      // Get rating distribution
      const ratingDistribution = await Rating.findAll({
        attributes: [
          'rating',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        ],
        group: ['rating'],
        order: [['rating', 'ASC']],
        raw: true,
      });

      // Get top-rated stores
      const topRatedStores = await Store.findAll({
        where: {
          total_ratings: { [Op.gt]: 0 },
        },
        order: [['average_rating', 'DESC'], ['total_ratings', 'DESC']],
        limit: 10,
        include: [
          {
            model: User,
            as: 'owner',
            attributes: ['name', 'email'],
          },
        ],
      });

      // Get recent activities (last 10 ratings)
      const recentRatings = await Rating.findAll({
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['name'],
          },
          {
            model: Store,
            as: 'store',
            attributes: ['name'],
          },
        ],
        order: [['created_at', 'DESC']],
        limit: 10,
      });

      // Get monthly registration trend (last 6 months)
      const monthlyRegistrations = await User.findAll({
        attributes: [
          [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('created_at')), 'month'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        ],
        where: {
          created_at: {
            [Op.gte]: sequelize.literal("NOW() - INTERVAL '6 months'"),
          },
        },
        group: [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('created_at'))],
        order: [[sequelize.fn('DATE_TRUNC', 'month', sequelize.col('created_at')), 'ASC']],
        raw: true,
      });

      res.status(200).json({
        success: true,
        message: 'Admin dashboard statistics retrieved successfully.',
        data: {
          overview: {
            totalUsers,
            totalStores,
            totalRatings,
          },
          usersByRole: usersByRole.map(item => ({
            role: item.role,
            count: parseInt(item.count),
          })),
          ratingDistribution: ratingDistribution.map(item => ({
            rating: item.rating,
            count: parseInt(item.count),
          })),
          topRatedStores,
          recentRatings,
          monthlyRegistrations: monthlyRegistrations.map(item => ({
            month: item.month,
            count: parseInt(item.count),
          })),
        },
      });
    } catch (error) {
      console.error('Get admin stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while retrieving admin statistics.',
      });
    }
  },

  // Store owner dashboard statistics
  getStoreOwnerStats: async (req, res) => {
    try {
      const owner_id = req.user.id;

      // Get owner's stores
      const stores = await Store.findAll({
        where: { owner_id },
        include: [
          {
            model: Rating,
            as: 'ratings',
            attributes: [],
          },
        ],
      });

      const storeIds = stores.map(store => store.id);

      if (storeIds.length === 0) {
        return res.status(200).json({
          success: true,
          message: 'Store owner dashboard statistics retrieved successfully.',
          data: {
            overview: {
              totalStores: 0,
              totalRatings: 0,
              averageRating: 0,
            },
            stores: [],
            recentRatings: [],
            ratingTrend: [],
          },
        });
      }

      // Get ratings for owner's stores
      const [totalRatings, recentRatings] = await Promise.all([
        Rating.count({
          where: { store_id: { [Op.in]: storeIds } },
        }),
        Rating.findAll({
          where: { store_id: { [Op.in]: storeIds } },
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['name'],
            },
            {
              model: Store,
              as: 'store',
              attributes: ['name'],
            },
          ],
          order: [['created_at', 'DESC']],
          limit: 10,
        }),
      ]);

      // Calculate overall average rating
      const averageRatingResult = await Rating.findOne({
        attributes: [[sequelize.fn('AVG', sequelize.col('rating')), 'averageRating']],
        where: { store_id: { [Op.in]: storeIds } },
        raw: true,
      });

      const overallAverageRating = averageRatingResult.averageRating 
        ? parseFloat(averageRatingResult.averageRating).toFixed(2)
        : 0;

      // Get monthly rating trend (last 6 months)
      const ratingTrend = await Rating.findAll({
        attributes: [
          [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('created_at')), 'month'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
          [sequelize.fn('AVG', sequelize.col('rating')), 'averageRating'],
        ],
        where: {
          store_id: { [Op.in]: storeIds },
          created_at: {
            [Op.gte]: sequelize.literal("NOW() - INTERVAL '6 months'"),
          },
        },
        group: [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('created_at'))],
        order: [[sequelize.fn('DATE_TRUNC', 'month', sequelize.col('created_at')), 'ASC']],
        raw: true,
      });

      res.status(200).json({
        success: true,
        message: 'Store owner dashboard statistics retrieved successfully.',
        data: {
          overview: {
            totalStores: stores.length,
            totalRatings,
            averageRating: parseFloat(overallAverageRating),
          },
          stores,
          recentRatings,
          ratingTrend: ratingTrend.map(item => ({
            month: item.month,
            count: parseInt(item.count),
            averageRating: item.averageRating ? parseFloat(item.averageRating).toFixed(2) : 0,
          })),
        },
      });
    } catch (error) {
      console.error('Get store owner stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while retrieving store owner statistics.',
      });
    }
  },

  // User dashboard statistics
  getUserStats: async (req, res) => {
    try {
      const user_id = req.user.id;

      // Get user's ratings
      const userRatings = await Rating.findAll({
        where: { user_id },
        include: [
          {
            model: Store,
            as: 'store',
            attributes: ['name', 'address'],
          },
        ],
        order: [['created_at', 'DESC']],
        limit: 5,
      });

      // Get user's rating statistics
      const ratingStats = await Rating.findOne({
        attributes: [
          [sequelize.fn('COUNT', sequelize.col('id')), 'totalRatings'],
          [sequelize.fn('AVG', sequelize.col('rating')), 'averageRating'],
        ],
        where: { user_id },
        raw: true,
      });

      // Get top-rated stores for recommendations
      const recommendedStores = await Store.findAll({
        where: {
          total_ratings: { [Op.gt]: 0 },
          id: {
            [Op.notIn]: sequelize.literal(`(
              SELECT store_id 
              FROM ratings 
              WHERE user_id = ${user_id}
            )`),
          },
        },
        order: [['average_rating', 'DESC'], ['total_ratings', 'DESC']],
        limit: 5,
      });

      res.status(200).json({
        success: true,
        message: 'User dashboard statistics retrieved successfully.',
        data: {
          overview: {
            totalRatings: parseInt(ratingStats.totalRatings) || 0,
            averageRating: ratingStats.averageRating 
              ? parseFloat(ratingStats.averageRating).toFixed(2)
              : 0,
          },
          recentRatings: userRatings,
          recommendedStores,
        },
      });
    } catch (error) {
      console.error('Get user stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while retrieving user statistics.',
      });
    }
  },
};

module.exports = dashboardController;