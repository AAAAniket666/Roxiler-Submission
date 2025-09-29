const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
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
        msg: 'Name must be between 20 and 60 characters',
      },
      isAlpha: {
        args: true,
        msg: 'Name can only contain letters and spaces',
      },
    },
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: {
      args: true,
      msg: 'Email address already in use',
    },
    validate: {
      isEmail: {
        args: true,
        msg: 'Please provide a valid email address',
      },
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: {
        args: [8, 16],
        msg: 'Password must be between 8 and 16 characters',
      },
      isStrongPassword(value) {
        const hasUppercase = /[A-Z]/.test(value);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);
        
        if (!hasUppercase) {
          throw new Error('Password must contain at least one uppercase letter');
        }
        if (!hasSpecialChar) {
          throw new Error('Password must contain at least one special character');
        }
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
  role: {
    type: DataTypes.ENUM('admin', 'user', 'store_owner'),
    allowNull: false,
    defaultValue: 'user',
    validate: {
      isIn: {
        args: [['admin', 'user', 'store_owner']],
        msg: 'Role must be admin, user, or store_owner',
      },
    },
  },
}, {
  tableName: 'users',
  indexes: [
    {
      unique: true,
      fields: ['email'],
    },
    {
      fields: ['role'],
    },
  ],
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
        user.password = await bcrypt.hash(user.password, saltRounds);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
        user.password = await bcrypt.hash(user.password, saltRounds);
      }
    },
  },
});

// Instance methods
User.prototype.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

User.prototype.toJSON = function() {
  const values = Object.assign({}, this.get());
  delete values.password;
  return values;
};

module.exports = User;