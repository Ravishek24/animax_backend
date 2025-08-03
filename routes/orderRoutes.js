const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const User = require('../models/User');
const { Op } = require('sequelize');

// POST /api/orders - Create a new order
router.post('/', protect, async (req, res) => {
  try {
    const { order_type, items, total_amount } = req.body;
    if (!order_type || !Array.isArray(items) || items.length === 0 || !total_amount) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    // Create order
    const order = await Order.create({
      user_id: req.user.user_id,
      order_type,
      total_amount,
      status: 'pending',
      created_at: new Date(),
      updated_at: new Date()
    });
    // Create order items
    for (const item of items) {
      if (!item.product_id || !item.product_type || !item.quantity || !item.price) {
        return res.status(400).json({ success: false, message: 'Invalid order item' });
      }
      await OrderItem.create({
        order_id: order.order_id,
        product_id: item.product_id,
        product_type: item.product_type,
        quantity: item.quantity,
        price: item.price
      });
    }
    res.status(201).json({ success: true, message: 'Order placed successfully', order_id: order.order_id });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/orders - Get current user's order history
router.get('/', protect, async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { user_id: req.user.user_id },
      include: [
        { model: OrderItem, as: 'items' }
      ],
      order: [['created_at', 'DESC']]
    });
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/orders/:orderId/payment-success - Mark order as paid
router.post('/:orderId/payment-success', protect, async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findOne({ where: { order_id: orderId, user_id: req.user.user_id } });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    order.status = 'paid';
    order.updated_at = new Date();
    await order.save();
    res.json({ success: true, message: 'Order marked as paid' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router; 