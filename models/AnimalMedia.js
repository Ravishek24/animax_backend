const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Animal = require('./Animal');

const AnimalMedia = sequelize.define('AnimalMedia', {
  media_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  animal_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Animal,
      key: 'animal_id'
    }
  },
  media_url: {
    type: DataTypes.STRING,
    allowNull: false
  },
  media_type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  tag: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'animal_media',
  timestamps: false
});

module.exports = AnimalMedia; 