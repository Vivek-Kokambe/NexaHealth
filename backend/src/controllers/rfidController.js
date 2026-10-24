const prisma = require("../config/prisma");

const normalizeUid = (uid) => String(uid || "").replace(/[^0-9a-f]/gi, "").toUpperCase();

const startRfidPairing = async (req, res) => {
  try {
    const patient = await prisma.patient.findUnique({
      where: { userId: req.user.userId },
      select: { id: true, rfidUid: true }
    });

    if (!patient) return res.status(404).json({ message: "Patient profile not found" });
    if (patient.rfidUid) {
      return res.status(409).json({ message: "A physical card is already attached to this account" });
    }

    const now = new Date();
    const otherPairing = await prisma.patient.findFirst({
      where: {
        id: { not: patient.id },
        rfidPairingExpiresAt: { gt: now }
      },
      select: { id: true }
    });

    if (otherPairing) {
      return res.status(409).json({ message: "Another patient is currently pairing a card. Try again shortly." });
    }

    const expiresAt = new Date(now.getTime() + 90_000);
    await prisma.patient.update({
      where: { id: patient.id },
      data: { rfidPairingExpiresAt: expiresAt }
    });

    return res.status(200).json({ message: "Ready to scan RFID card", expiresAt });
  } catch (error) {
    console.error("RFID pairing start error:", error);
    return res.status(500).json({ message: "Could not start card pairing" });
  }
};

const getRfidStatus = async (req, res) => {
  try {
    const patient = await prisma.patient.findUnique({
      where: { userId: req.user.userId },
      select: { rfidUid: true, rfidPairingExpiresAt: true }
    });

    if (!patient) return res.status(404).json({ message: "Patient profile not found" });

    const pairingExpiresAt = patient.rfidPairingExpiresAt > new Date()
      ? patient.rfidPairingExpiresAt
      : null;

    return res.json({
      isAttached: Boolean(patient.rfidUid),
      isPairing: Boolean(pairingExpiresAt),
      pairingExpiresAt
    });
  } catch (error) {
    console.error("RFID status error:", error);
    return res.status(500).json({ message: "Could not load card status" });
  }
};

const getRfidScans = async (req, res) => {
  try {
    const patient = await prisma.patient.findUnique({
      where: { userId: req.user.userId },
      select: { id: true }
    });

    if (!patient) return res.status(404).json({ message: "Patient profile not found" });

    const after = req.query.after ? new Date(req.query.after) : new Date(0);
    if (Number.isNaN(after.getTime())) {
      return res.status(400).json({ message: "Invalid scan cursor" });
    }

    const events = await prisma.rfidScanEvent.findMany({
      where: { patientId: patient.id, scannedAt: { gt: after } },
      orderBy: { scannedAt: "asc" },
      take: 10,
      select: { id: true, type: true, scannedAt: true }
    });

    return res.json({ events });
  } catch (error) {
    console.error("RFID scan lookup error:", error);
    return res.status(500).json({ message: "Could not load card scans" });
  }
};

const receiveRfidScan = async (req, res) => {
  const uid = normalizeUid(req.body.uid);
  if (!/^(?:[0-9A-F]{2}){4,10}$/.test(uid)) {
    return res.status(400).json({ message: "A valid RFID UID is required" });
  }

  try {
    const linkedPatient = await prisma.patient.findUnique({
      where: { rfidUid: uid },
      select: { id: true }
    });

    if (linkedPatient) {
      await prisma.rfidScanEvent.create({
        data: { patientId: linkedPatient.id, type: "DETECTED" }
      });
      return res.json({ status: "detected" });
    }

    const pairingPatient = await prisma.patient.findFirst({
      where: { rfidPairingExpiresAt: { gt: new Date() }, user: { status: "ACTIVE" } },
      orderBy: { rfidPairingExpiresAt: "asc" },
      select: { id: true }
    });

    if (!pairingPatient) return res.json({ status: "unassigned" });

    await prisma.$transaction(async (transaction) => {
      await transaction.patient.update({
        where: { id: pairingPatient.id },
        data: { rfidUid: uid, rfidPairingExpiresAt: null }
      });
      await transaction.rfidScanEvent.create({
        data: { patientId: pairingPatient.id, type: "ATTACHED" }
      });
    });

    return res.json({ status: "attached" });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({ status: "already_assigned", message: "This RFID card is linked to another account" });
    }

    console.error("RFID scan receive error:", error);
    return res.status(500).json({ message: "Could not process RFID scan" });
  }
};

const receivePatientRfidScan = async (req, res) => {
  const uid = normalizeUid(req.body.uid);
  if (!/^(?:[0-9A-F]{2}){4,10}$/.test(uid)) {
    return res.status(400).json({ message: "A valid RFID UID is required" });
  }

  try {
    const patient = await prisma.patient.findUnique({
      where: { userId: req.user.userId },
      select: { id: true, rfidUid: true, rfidPairingExpiresAt: true }
    });

    if (!patient) return res.status(404).json({ message: "Patient profile not found" });

    if (patient.rfidUid === uid) {
      await prisma.rfidScanEvent.create({
        data: { patientId: patient.id, type: "DETECTED" }
      });
      return res.json({ status: "detected" });
    }

    if (patient.rfidUid) {
      return res.status(409).json({ status: "card_already_attached", message: "A physical card is already attached to this account" });
    }

    if (!patient.rfidPairingExpiresAt || patient.rfidPairingExpiresAt <= new Date()) {
      return res.status(409).json({ status: "no_active_pairing", message: "Start card pairing on your dashboard before scanning" });
    }

    await prisma.$transaction(async (transaction) => {
      await transaction.patient.update({
        where: { id: patient.id },
        data: { rfidUid: uid, rfidPairingExpiresAt: null }
      });
      await transaction.rfidScanEvent.create({
        data: { patientId: patient.id, type: "ATTACHED" }
      });
    });

    return res.json({ status: "attached" });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({ status: "already_assigned", message: "This RFID card is linked to another account" });
    }

    console.error("Patient RFID scan error:", error);
    return res.status(500).json({ message: "Could not process RFID scan" });
  }
};

module.exports = {
  startRfidPairing,
  getRfidStatus,
  getRfidScans,
  receiveRfidScan,
  receivePatientRfidScan
};