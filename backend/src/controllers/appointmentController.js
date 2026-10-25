const crypto = require("crypto");
const prisma = require("../config/prisma");

const serializeAppointment = (appointment) => ({
  _id: appointment.id,
  appointmentNumber: appointment.appointmentNumber,
  appointmentDate: appointment.appointmentDate.toISOString().slice(0, 10),
  appointmentTime: appointment.appointmentTime,
  department: appointment.department,
  reason: appointment.reason,
  status: appointment.status.toLowerCase(),
  queuePosition: 0,
  hospitalId: appointment.hospitalId,
  hospitalName: appointment.hospital.name,
  doctorName: null,
});

const createAppointment = async (req, res) => {
  try {
    const { hospitalId, department, appointmentDate, appointmentTime, reason } = req.body;

    if (
      typeof hospitalId !== "string"
      || typeof department !== "string"
      || typeof appointmentDate !== "string"
      || typeof appointmentTime !== "string"
    ) {
      return res.status(400).json({ success: false, message: "Hospital, department, date, and time are required" });
    }

    const normalizedDepartment = department.trim();
    const normalizedReason = typeof reason === "string" ? reason.trim() : "";
    const parsedDate = new Date(`${appointmentDate}T00:00:00.000Z`);
    const validDate = /^\d{4}-\d{2}-\d{2}$/.test(appointmentDate)
      && !Number.isNaN(parsedDate.getTime())
      && parsedDate.toISOString().slice(0, 10) === appointmentDate;

    if (!validDate || appointmentDate < new Date().toISOString().slice(0, 10)) {
      return res.status(400).json({ success: false, message: "Choose a valid appointment date today or later" });
    }

    if (!/^(0?[1-9]|1[0-2]):[0-5]\d\s(AM|PM)$/.test(appointmentTime)) {
      return res.status(400).json({ success: false, message: "Choose a valid appointment time" });
    }

    if (!normalizedDepartment || normalizedDepartment.length > 100 || normalizedReason.length > 500) {
      return res.status(400).json({ success: false, message: "Department or visit reason is invalid or too long" });
    }

    const [patient, hospital] = await Promise.all([
      prisma.patient.findUnique({
        where: { userId: req.user.userId },
        select: { id: true },
      }),
      prisma.hospital.findFirst({
        where: { id: hospitalId, verificationStatus: "VERIFIED" },
        include: { departments: { select: { name: true } } },
      }),
    ]);

    if (!patient) {
      return res.status(403).json({ success: false, message: "A registered patient account is required to book" });
    }

    if (!hospital) {
      return res.status(404).json({ success: false, message: "Approved hospital not found" });
    }

    const matchingDepartment = hospital.departments.find(
      (entry) => entry.name.toLowerCase() === normalizedDepartment.toLowerCase()
    );

    if (!matchingDepartment) {
      return res.status(400).json({ success: false, message: "Select a department offered by this hospital" });
    }

    const appointmentNumber = `APT-${new Date().getFullYear()}-${crypto.randomInt(100000, 1000000)}`;
    const appointment = await prisma.appointment.create({
      data: {
        appointmentNumber,
        patientId: patient.id,
        hospitalId: hospital.id,
        department: matchingDepartment.name,
        appointmentDate: parsedDate,
        appointmentTime,
        reason: normalizedReason || "Routine checkup and consultation",
        status: "REQUESTED",
      },
      include: { hospital: { select: { name: true } } },
    });

    return res.status(201).json({
      success: true,
      message: "Appointment request submitted. The hospital will confirm your visit.",
      appointment: serializeAppointment(appointment),
    });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({ success: false, message: "Please retry; the appointment reference could not be reserved" });
    }

    console.error("Appointment request error:", error);
    return res.status(500).json({ success: false, message: "Failed to submit appointment request" });
  }
};

const listPatientAppointments = async (req, res) => {
  try {
    const patient = await prisma.patient.findUnique({
      where: { userId: req.user.userId },
      select: { id: true },
    });

    if (!patient) {
      return res.status(403).json({ success: false, message: "Patient profile not found" });
    }

    const appointments = await prisma.appointment.findMany({
      where: { patientId: patient.id },
      include: { hospital: { select: { name: true } } },
      orderBy: [{ appointmentDate: "desc" }, { createdAt: "desc" }],
    });

    return res.json({ success: true, appointments: appointments.map(serializeAppointment) });
  } catch (error) {
    console.error("Patient appointment list error:", error);
    return res.status(500).json({ success: false, message: "Failed to load appointments" });
  }
};

const cancelPatientAppointment = async (req, res) => {
  try {
    const patient = await prisma.patient.findUnique({
      where: { userId: req.user.userId },
      select: { id: true },
    });

    if (!patient) {
      return res.status(403).json({ success: false, message: "Patient profile not found" });
    }

    const appointment = await prisma.appointment.findFirst({
      where: { id: req.params.appointmentId, patientId: patient.id },
      select: { id: true, status: true },
    });

    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    if (appointment.status !== "REQUESTED") {
      return res.status(409).json({ success: false, message: "Only pending appointment requests can be cancelled" });
    }

    await prisma.appointment.update({
      where: { id: appointment.id },
      data: { status: "CANCELLED" },
    });

    return res.json({ success: true, message: "Appointment request cancelled" });
  } catch (error) {
    console.error("Appointment cancellation error:", error);
    return res.status(500).json({ success: false, message: "Failed to cancel appointment" });
  }
};

const listHospitalAppointments = async (req, res) => {
  try {
    const hospital = await prisma.hospital.findUnique({
      where: { userId: req.user.userId },
      select: { id: true },
    });

    if (!hospital) {
      return res.status(404).json({ success: false, message: "Hospital profile not found" });
    }

    const appointments = await prisma.appointment.findMany({
      where: { hospitalId: hospital.id },
      include: {
        hospital: { select: { name: true } },
        patient: {
          select: {
            firstName: true,
            lastName: true,
            user: { select: { phone: true } },
          },
        },
      },
      orderBy: [{ appointmentDate: "asc" }, { appointmentTime: "asc" }],
    });

    return res.json({
      success: true,
      appointments: appointments.map((appointment) => ({
        ...serializeAppointment(appointment),
        patientName: `${appointment.patient.firstName} ${appointment.patient.lastName}`,
        patientPhone: appointment.patient.user.phone,
      })),
    });
  } catch (error) {
    console.error("Hospital appointment list error:", error);
    return res.status(500).json({ success: false, message: "Failed to load hospital appointment requests" });
  }
};

const updateHospitalAppointment = async (req, res) => {
  try {
    const status = typeof req.body.status === "string" ? req.body.status.toUpperCase() : "";

    if (!["CONFIRMED", "CANCELLED"].includes(status)) {
      return res.status(400).json({ success: false, message: "Status must be CONFIRMED or CANCELLED" });
    }

    const hospital = await prisma.hospital.findUnique({
      where: { userId: req.user.userId },
      select: { id: true },
    });

    if (!hospital) {
      return res.status(404).json({ success: false, message: "Hospital profile not found" });
    }

    const appointment = await prisma.appointment.findFirst({
      where: {
        id: req.params.appointmentId,
        hospitalId: hospital.id,
      },
      select: { id: true, status: true },
    });

    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment request not found" });
    }

    if (appointment.status !== "REQUESTED") {
      return res.status(409).json({ success: false, message: "Only pending appointment requests can be updated" });
    }

    await prisma.appointment.update({
      where: { id: appointment.id },
      data: { status },
    });

    return res.json({
      success: true,
      message: status === "CONFIRMED" ? "Appointment request confirmed" : "Appointment request declined",
      status: status.toLowerCase(),
    });
  } catch (error) {
    console.error("Hospital appointment review error:", error);
    return res.status(500).json({ success: false, message: "Failed to update appointment request" });
  }
};

module.exports = {
  createAppointment,
  listPatientAppointments,
  cancelPatientAppointment,
  listHospitalAppointments,
  updateHospitalAppointment,
};
