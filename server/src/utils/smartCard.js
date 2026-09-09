/**
 * Smart Card ID Generator
 * Format: SCN-YYYY-XXXXXX
 * Example: SCN-2026-104582
 */
function generateSmartCardId() {
  const year = new Date().getFullYear();
  const randomSixDigits = Math.floor(100000 + Math.random() * 900000);
  return `SCN-${year}-${randomSixDigits}`;
}

function generateAppointmentNumber() {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `APT-${year}-${randomNum}`;
}

module.exports = {
  generateSmartCardId,
  generateAppointmentNumber,
};
