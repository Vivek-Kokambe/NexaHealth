const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const hospitalRegistrationRoutes = require("./routes/hospitalRegistrationRoutes");
const patientRoutes = require("./routes/patientRoutes");
const rfidRoutes = require("./routes/rfidRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "NexaHealth Backend is running 🚀"
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/hospitals", hospitalRegistrationRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/rfid", rfidRoutes);

module.exports = app;