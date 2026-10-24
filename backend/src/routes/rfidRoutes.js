const express = require("express");
const { receiveRfidScan } = require("../controllers/rfidController");
const { authenticateRfidDevice } = require("../middleware/rfidDeviceAuth");

const router = express.Router();

router.post("/scan", authenticateRfidDevice, receiveRfidScan);

module.exports = router;