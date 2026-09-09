const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true,
  },
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    required: true,
  },
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
  },
  consultationDate: {
    type: Date,
    default: Date.now,
  },
  symptoms: [{
    type: String,
  }],
  diagnosis: {
    type: String,
    required: true,
  },
  allergies: [{
    type: String,
  }],
  vitals: {
    bloodPressure: { type: String, default: '120/80 mmHg' },
    heartRate: { type: Number, default: 72 },
    temperature: { type: String, default: '98.6 °F' },
    weight: { type: Number, default: 70 }, // kg
    oxygenLevel: { type: Number, default: 99 }, // %
  },
  prescription: [{
    medication: { type: String, required: true },
    dosage: { type: String, default: '500mg' },
    frequency: { type: String, default: 'Twice daily' },
    duration: { type: String, default: '5 days' },
    notes: { type: String, default: 'Take after meals' },
  }],
  labReports: [{
    testName: { type: String, required: true },
    result: { type: String, required: true },
    normalRange: { type: String, default: 'Normal' },
    status: { type: String, default: 'Completed' },
    fileUrl: { type: String, default: '' },
    date: { type: Date, default: Date.now },
  }],
  attachments: [{
    title: { type: String },
    fileUrl: { type: String },
    fileType: { type: String },
    uploadDate: { type: Date, default: Date.now },
  }],
  notes: {
    type: String,
    default: '',
  },
  followUpDate: {
    type: String,
    default: '',
  },
  consentStatus: {
    type: String,
    enum: ['granted', 'revoked', 'emergency_access', 'pending'],
    default: 'granted',
  },
  accessType: {
    type: String,
    enum: ['normal', 'emergency', 'referral'],
    default: 'normal',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);
