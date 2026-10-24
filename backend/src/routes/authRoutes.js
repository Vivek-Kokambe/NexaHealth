const express = require("express");

const {
  loginUser,
  requestRegistrationOtp,
  verifyRegistrationOtp,
  getCurrentUser,
  getPatientSmartCard
} = require("../controllers/authController");

const { authenticate } = require("../middleware/authMiddleware");

const router = express.Router();


router.post("/register/request", requestRegistrationOtp);
router.post("/register/verify", verifyRegistrationOtp);
router.post("/login", loginUser);
router.get("/me", authenticate, getCurrentUser);
router.get("/patient/smart-card", authenticate, getPatientSmartCard);

module.exports = router;