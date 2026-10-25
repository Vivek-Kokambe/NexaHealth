const express = require("express");

const { getPatientSmartCard } = require("../controllers/authController");
const { listPatientAppointments } = require("../controllers/appointmentController");
const {
	startRfidPairing,
	getRfidStatus,
	getRfidScans,
	receivePatientRfidScan
} = require("../controllers/rfidController");
const { authenticate } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/smart-card", authenticate, getPatientSmartCard);
router.get("/appointments", authenticate, listPatientAppointments);
router.post("/rfid/pairing", authenticate, startRfidPairing);
router.get("/rfid/status", authenticate, getRfidStatus);
router.get("/rfid/scans", authenticate, getRfidScans);
router.post("/rfid/scan", authenticate, receivePatientRfidScan);

module.exports = router;