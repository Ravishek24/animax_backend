const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Supplement = require('./Supplement');

const SupplementImage = sequelize.define('SupplementImage', {
  image_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  supplement_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Supplement,
      key: 'supplement_id'
    }
  },
  image_url: {
    type: DataTypes.STRING,
    allowNull: false
  },
  is_primary: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'supplement_images',
  timestamps: false
});

module.exports = SupplementImage; 