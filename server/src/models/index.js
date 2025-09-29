const { sequelize } = require('../config/database');
const User = require('./User');
const Store = require('./Store');
const Rating = require('./Rating');

// Define associations
User.hasMany(Store, {
  foreignKey: 'owner_id',
  as: 'ownedStores',
  onDelete: 'CASCADE',
});

Store.belongsTo(User, {
  foreignKey: 'owner_id',
  as: 'owner',
});

User.hasMany(Rating, {
  foreignKey: 'user_id',
  as: 'ratings',
  onDelete: 'CASCADE',
});

Rating.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

Store.hasMany(Rating, {
  foreignKey: 'store_id',
  as: 'ratings',
  onDelete: 'CASCADE',
});

Rating.belongsTo(Store, {
  foreignKey: 'store_id',
  as: 'store',
});

// Export all models and sequelize instance
module.exports = {
  sequelize,
  User,
  Store,
  Rating,
};

// Sync database (only in development)
if (process.env.NODE_ENV === 'development') {
  sequelize.sync({ alter: true }).then(() => {
    console.log('✅ Database synchronized successfully.');
  }).catch((error) => {
    console.error('❌ Error synchronizing database:', error);
  });
}