const express = require("express");
const {
  createAppointment,
  cancelPatientAppointment,
} = require("../controllers/appointmentController");
const { authenticate } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authenticate, (req, res, next) => {
  if (req.user.role !== "PATIENT") {
    return res.status(403).json({ success: false, message: "Patient access required" });
  }

  return next();
});

router.post("/", createAppointment);
router.delete("/:appointmentId", cancelPatientAppointment);

module.exports = router;
