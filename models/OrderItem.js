const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Order = require('./Order');

const OrderItem = sequelize.define('OrderItem', {
  order_item_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  order_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: Order, key: 'order_id' } },
  product_id: { type: DataTypes.INTEGER, allowNull: false },
  product_type: { type: DataTypes.STRING, allowNull: false }, // 'animal', 'supplement'
  quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false }
}, {
  tableName: 'order_items',
  timestamps: false
});

module.exports = OrderItem; 