const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const patientRoutes = require("./routes/patientRoutes");
const rfidRoutes = require("./routes/rfidRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

app.use(cors());
app.use(express.json({ limit: "7mb" }));

app.get("/", (req, res) => {
  res.json({
    message: "NexaHealth Backend is running 🚀"
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/rfid", rfidRoutes);
app.use("/api/admin", adminRoutes);

module.exports = app;