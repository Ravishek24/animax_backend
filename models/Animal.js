const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');
const Category = require('./Category');

const Animal = sequelize.define('Animal', {
  animal_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  seller_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'user_id'
    }
  },
  category_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Category,
      key: 'category_id'
    }
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  is_negotiable: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  lactation_number: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  milk_yield_per_day: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false
  },
  peak_milk_yield_per_day: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false
  },
  is_pregnant: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  months_pregnant: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  calf_status: {
    type: DataTypes.STRING,
    allowNull: false
  },
  selling_timeframe: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false
  },
  location_address: {
    type: DataTypes.STRING,
    allowNull: false
  },
  location_latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: false
  },
  location_longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: false
  },
  listing_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'animals',
  timestamps: false
});

module.exports = Animal; 