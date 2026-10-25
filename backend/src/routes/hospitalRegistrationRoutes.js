const express = require("express");
const {
  listApprovedHospitals,
  getApprovedHospital,
  requestHospitalRegistrationOtp,
  verifyHospitalRegistrationOtp,
} = require("../controllers/hospitalRegistrationController");
const {
  listHospitalAppointments,
  updateHospitalAppointment,
} = require("../controllers/appointmentController");
const {
  getHospitalProfile,
  updateHospitalServices,
  getHospitalAnalytics,
} = require("../controllers/hospitalPortalController");
const { authenticate } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", listApprovedHospitals);
router.get("/me", authenticate, requireHospital, getHospitalProfile);
router.get("/me/analytics", authenticate, requireHospital, getHospitalAnalytics);
router.patch("/me/services", authenticate, requireHospital, updateHospitalServices);
router.get("/appointments", authenticate, (req, res, next) => {
  return requireHospital(req, res, next);
}, listHospitalAppointments);
router.patch("/appointments/:appointmentId", authenticate, (req, res, next) => {
  return requireHospital(req, res, next);
}, updateHospitalAppointment);
router.get("/:hospitalId", getApprovedHospital);
router.post("/register/request", requestHospitalRegistrationOtp);
router.post("/register/verify", verifyHospitalRegistrationOtp);

module.exports = router;

function requireHospital(req, res, next) {
  if (req.user.role !== "HOSPITAL") {
    return res.status(403).json({ success: false, message: "Hospital access required" });
  }

  return next();
}
