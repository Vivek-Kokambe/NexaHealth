const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    required: true,
  },
  specialization: {
    type: String,
    required: true,
    index: true,
  },
  qualifications: [{
    type: String,
  }],
  experience: {
    type: Number,
    required: true,
    default: 5,
  },
  consultationFee: {
    type: Number,
    required: true,
    default: 500,
  },
  licenseNumber: {
    type: String,
    required: true,
    unique: true,
  },
  bio: {
    type: String,
    default: '',
  },
  rating: {
    type: Number,
    default: 4.9,
  },
  reviewCount: {
    type: Number,
    default: 38,
  },
  availableSlots: [{
    day: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    slotDurationMinutes: { type: Number, default: 20 },
    maxPatients: { type: Number, default: 15 },
  }],
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'approved',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Doctor', doctorSchema);
