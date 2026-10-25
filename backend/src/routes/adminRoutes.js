const express = require("express");
const { listHospitalsForReview, reviewHospital } = require("../controllers/adminController");
const { authenticate } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authenticate, (req, res, next) => {
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({ message: "Administrator access required" });
  }

  return next();
});

router.get("/hospitals", listHospitalsForReview);
router.patch("/hospitals/:hospitalId/review", reviewHospital);

module.exports = router;
