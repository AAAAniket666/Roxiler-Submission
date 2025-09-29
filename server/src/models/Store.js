const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Store = sequelize.define('Store', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(60),
    allowNull: false,
    validate: {
      len: {
        args: [20, 60],
        msg: 'Store name must be between 20 and 60 characters',
      },
    },
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: {
      args: true,
      msg: 'Store email address already in use',
    },
    validate: {
      isEmail: {
        args: true,
        msg: 'Please provide a valid email address',
      },
    },
  },
  address: {
    type: DataTypes.STRING(400),
    allowNull: true,
    validate: {
      len: {
        args: [0, 400],
        msg: 'Address cannot exceed 400 characters',
      },
    },
  },
  owner_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  },
  average_rating: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: true,
    defaultValue: 0.00,
    validate: {
      min: {
        args: 0,
        msg: 'Average rating cannot be negative',
      },
      max: {
        args: 5,
        msg: 'Average rating cannot exceed 5',
      },
    },
  },
  total_ratings: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: {
        args: 0,
        msg: 'Total ratings cannot be negative',
      },
    },
  },
}, {
  tableName: 'stores',
  indexes: [
    {
      unique: true,
      fields: ['email'],
    },
    {
      fields: ['owner_id'],
    },
    {
      fields: ['name'],
    },
    {
      fields: ['average_rating'],
    },
  ],
});

// Instance methods
Store.prototype.updateRatingStats = async function() {
  const Rating = require('./Rating');
  const ratings = await Rating.findAll({
    where: { store_id: this.id },
    attributes: ['rating'],
  });

  if (ratings.length === 0) {
    this.average_rating = 0.00;
    this.total_ratings = 0;
  } else {
    const sum = ratings.reduce((acc, rating) => acc + rating.rating, 0);
    this.average_rating = (sum / ratings.length).toFixed(2);
    this.total_ratings = ratings.length;
  }

  await this.save();
  return this;
};

module.exports = Store;