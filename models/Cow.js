const mongoose = require('mongoose');

const cowSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
  },
  breed: {
    type: String,
    required: [true, 'Please specify the breed'],
  },
  age: {
    type: Number,
    required: [true, 'Please specify the age'],
  },
  weight: {
    type: Number,
    required: [true, 'Please specify the weight'],
  },
  price: {
    type: Number,
    required: [true, 'Please specify the price'],
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
  },
  images: [{
    type: String,
    required: [true, 'Please add at least one image'],
  }],
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['available', 'sold', 'pending'],
    default: 'available',
  },
  healthStatus: {
    type: String,
    enum: ['excellent', 'good', 'fair'],
    required: true,
  },
  vaccinationHistory: [{
    vaccine: String,
    date: Date,
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Cow', cowSchema); 