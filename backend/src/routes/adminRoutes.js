const express = require("express");
const { authenticate } = require("../middleware/authMiddleware");
const { requireAdmin } = require("../middleware/adminMiddleware");
const {
  listDoctors,
  approveDoctor,
  listHospitalsForReview,
  reviewHospital
} = require("../controllers/adminController");

const router = express.Router();

router.use(authenticate, requireAdmin);
router.get("/doctors", listDoctors);
router.put("/doctors/:id/approve", approveDoctor);
router.get("/hospitals", listHospitalsForReview);
router.patch("/hospitals/:hospitalId/review", reviewHospital);

module.exports = router;
