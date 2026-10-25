const express = require("express");
const { authenticate } = require("../middleware/authMiddleware");
const { requireAdmin } = require("../middleware/adminMiddleware");
const { listDoctors, approveDoctor } = require("../controllers/adminController");

const router = express.Router();

router.use(authenticate, requireAdmin);
router.get("/doctors", listDoctors);
router.put("/doctors/:id/approve", approveDoctor);

module.exports = router;