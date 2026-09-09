const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('patient', 'admin'));

router.get('/profile', patientController.getProfile);
router.put('/profile', patientController.updateProfile);
router.get('/smart-card', patientController.getSmartCard);
router.get('/medical-records', patientController.getMedicalRecords);
router.get('/appointments', patientController.getAppointments);
router.get('/queue', patientController.getLiveQueue);

module.exports = router;
