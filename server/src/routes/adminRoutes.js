const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('admin'));

router.get('/dashboard', adminController.getDashboard);
router.get('/users', adminController.getUsers);
router.put('/users/:id/status', adminController.updateUserStatus);
router.get('/hospitals/pending', adminController.getPendingHospitals);
router.put('/hospitals/:id/approve', adminController.approveHospital);
router.get('/doctors/pending', adminController.getPendingDoctors);
router.put('/doctors/:id/approve', adminController.approveDoctor);
router.get('/audit-logs', adminController.getAuditLogs);
router.get('/complaints', adminController.getComplaints);
router.put('/complaints/:id', adminController.updateComplaint);

module.exports = router;
