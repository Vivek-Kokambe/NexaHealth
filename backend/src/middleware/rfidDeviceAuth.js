const { timingSafeEqual } = require("crypto");

const authenticateRfidDevice = (req, res, next) => {
  const configuredKey = process.env.RFID_DEVICE_KEY || "";
  const providedKey = req.get("x-device-key") || "";

  if (!configuredKey) {
    return res.status(503).json({ message: "RFID device key is not configured" });
  }

  const configuredBuffer = Buffer.from(configuredKey);
  const providedBuffer = Buffer.from(providedKey);
  const validKey = configuredBuffer.length === providedBuffer.length
    && timingSafeEqual(configuredBuffer, providedBuffer);

  if (!validKey) {
    return res.status(401).json({ message: "Invalid RFID device key" });
  }

  return next();
};

module.exports = { authenticateRfidDevice };