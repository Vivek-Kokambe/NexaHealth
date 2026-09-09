const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  smartCardId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  medicalSummary: {
    type: String,
    default: 'General health is good. No chronic ailments noted.',
  },
  insuranceDetails: {
    provider: { type: String, default: '' },
    policyNumber: { type: String, default: '' },
    coverageAmount: { type: Number, default: 0 },
  },
  cardStatus: {
    type: String,
    enum: ['active', 'suspended', 'lost', 'pending'],
    default: 'active',
  },
  qrCodeValue: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Patient', patientSchema);
