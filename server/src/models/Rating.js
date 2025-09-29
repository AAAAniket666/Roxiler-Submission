const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Rating = sequelize.define('Rating', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  store_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'stores',
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: {
        args: 1,
        msg: 'Rating must be at least 1',
      },
      max: {
        args: 5,
        msg: 'Rating cannot exceed 5',
      },
      isInt: {
        args: true,
        msg: 'Rating must be a whole number',
      },
    },
  },
}, {
  tableName: 'ratings',
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'store_id'],
      name: 'unique_user_store_rating',
    },
    {
      fields: ['user_id'],
    },
    {
      fields: ['store_id'],
    },
    {
      fields: ['rating'],
    },
  ],
});

// Hooks to update store rating statistics
Rating.afterCreate(async (rating, options) => {
  const Store = require('./Store');
  const store = await Store.findByPk(rating.store_id);
  if (store) {
    await store.updateRatingStats();
  }
});

Rating.afterUpdate(async (rating, options) => {
  const Store = require('./Store');
  const store = await Store.findByPk(rating.store_id);
  if (store) {
    await store.updateRatingStats();
  }
});

Rating.afterDestroy(async (rating, options) => {
  const Store = require('./Store');
  const store = await Store.findByPk(rating.store_id);
  if (store) {
    await store.updateRatingStats();
  }
});

module.exports = Rating;