const requireAdmin = (req, res, next) => {
  if (req.user?.role !== "ADMIN") {
    return res.status(403).json({ message: "Administrator access required" });
  }

  return next();
};

module.exports = { requireAdmin };