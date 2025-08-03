const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Supplement = sequelize.define('Supplement', {
  supplement_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  brand: {
    type: DataTypes.STRING,
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  target_animal: {
    type: DataTypes.STRING,
    allowNull: true
  },
  ingredients: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  dosage_amount: {
    type: DataTypes.STRING,
    allowNull: true
  },
  dosage_unit: {
    type: DataTypes.STRING,
    allowNull: true
  },
  dosage_frequency: {
    type: DataTypes.STRING,
    allowNull: true
  },
  net_weight: {
    type: DataTypes.STRING,
    allowNull: true
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  stock_quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  status: {
    type: DataTypes.ENUM('Available', 'Out of Stock'),
    defaultValue: 'Available'
  },
  date_added: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'supplements',
  timestamps: false
});

// Define associations
Supplement.associate = (models) => {
  Supplement.hasMany(models.SupplementImage, {
    foreignKey: 'supplement_id',
    as: 'images'
  });
};

module.exports = Supplement; 