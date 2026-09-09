const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
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
  department: {
    type: String,
    required: true,
  },
  appointmentDate: {
    type: String,
    required: true, // YYYY-MM-DD
    index: true,
  },
  appointmentTime: {
    type: String,
    required: true, // HH:mm
  },
  appointmentNumber: {
    type: String,
    required: true,
    unique: true,
  },
  reason: {
    type: String,
    default: 'Routine checkup & consultation',
  },
  status: {
    type: String,
    enum: [
      'requested',
      'confirmed',
      'checked_in',
      'waiting',
      'in_consultation',
      'completed',
      'cancelled',
      'no_show'
    ],
    default: 'confirmed',
  },
  queuePosition: {
    type: Number,
    default: 0,
  },
  estimatedWaitTime: {
    type: Number,
    default: 0, // in minutes
  },
  checkedInAt: {
    type: Date,
  },
  notes: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Appointment', appointmentSchema);
