const express = require('express');
const router = express.Router();
const hospitalController = require('../controllers/hospitalController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', hospitalController.getHospitals);
router.get('/:id', hospitalController.getHospitalById);
router.get('/:id/doctors', hospitalController.getHospitalDoctors);

// Protected routes
router.put('/:id', protect, authorize('hospital', 'admin'), hospitalController.updateHospital);
router.get('/:id/appointments', protect, authorize('hospital', 'admin'), hospitalController.getHospitalAppointments);
router.get('/:id/analytics', protect, authorize('hospital', 'admin'), hospitalController.getHospitalAnalytics);

module.exports = router;
