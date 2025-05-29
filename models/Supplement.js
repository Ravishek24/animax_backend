const mongoose = require('mongoose');

const supplementSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
  },
  price: {
    type: Number,
    required: [true, 'Please specify the price'],
  },
  stock: {
    type: Number,
    required: [true, 'Please specify the stock quantity'],
    min: 0,
  },
  category: {
    type: String,
    required: [true, 'Please specify the category'],
    enum: ['vitamin', 'mineral', 'protein', 'other'],
  },
  image: {
    type: String,
    required: [true, 'Please add an image'],
  },
  manufacturer: {
    type: String,
    required: [true, 'Please specify the manufacturer'],
  },
  expiryDate: {
    type: Date,
    required: [true, 'Please specify the expiry date'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Supplement', supplementSchema); 