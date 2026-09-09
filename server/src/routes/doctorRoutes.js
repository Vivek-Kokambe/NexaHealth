const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const { protect, authorize } = require('../middleware/auth');

// Public search routes
router.get('/', doctorController.getDoctors);
router.get('/:id', doctorController.getDoctorById);

// Protected routes for doctors
router.get('/appointments', protect, authorize('doctor', 'admin'), doctorController.getDoctorAppointments);
router.put('/appointments/:id/status', protect, authorize('doctor', 'hospital', 'admin'), doctorController.updateAppointmentStatus);
router.get('/patients/:smartCardId', protect, authorize('doctor', 'hospital', 'admin'), doctorController.lookupPatientBySmartCard);
router.post('/medical-records', protect, authorize('doctor', 'admin'), doctorController.createMedicalRecord);

module.exports = router;
