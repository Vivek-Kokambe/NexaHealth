const mongoose = require('mongoose');

const hospitalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  name: {
    type: String,
    required: [true, 'Please provide hospital name'],
    trim: true,
    index: true,
  },
  registrationNumber: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
    index: true,
  },
  state: {
    type: String,
    required: true,
  },
  pincode: {
    type: String,
    required: true,
  },
  latitude: {
    type: Number,
    default: 28.6139,
  },
  longitude: {
    type: Number,
    default: 77.2090,
  },
  departments: [{
    type: String,
  }],
  facilities: [{
    type: String,
  }],
  operatingHours: {
    type: String,
    default: '24/7 Emergency & Outpatient 8:00 AM - 8:00 PM',
  },
  logo: {
    type: String,
    default: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=400&q=80',
  },
  rating: {
    type: Number,
    default: 4.8,
  },
  totalBeds: {
    type: Number,
    default: 250,
  },
  icuBedsAvailable: {
    type: Number,
    default: 14,
  },
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'approved',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Hospital', hospitalSchema);
