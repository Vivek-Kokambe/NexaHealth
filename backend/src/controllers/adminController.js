const prisma = require("../config/prisma");

const listDoctors = async (req, res) => {
  try {
    const doctors = await prisma.doctor.findMany({
      include: { user: true, hospital: true, department: true },
      orderBy: { createdAt: "desc" }
    });

    return res.json({
      success: true,
      doctors: doctors.map((doctor) => ({
        _id: doctor.id,
        name: `${doctor.firstName} ${doctor.lastName}`,
        email: doctor.user.email,
        specialization: doctor.specialization,
        qualifications: doctor.qualifications?.split(",").map((item) => item.trim()).filter(Boolean) || [],
        licenseNumber: doctor.licenseNumber,
        hospitalName: doctor.hospital?.name || "Independent Practitioner",
        approvalStatus: doctor.verificationStatus === "VERIFIED" ? "approved" : doctor.verificationStatus.toLowerCase()
      }))
    });
  } catch (error) {
    console.error("Doctor list error:", error);
    return res.status(500).json({ message: "Failed to load doctor registrations" });
  }
};

const approveDoctor = async (req, res) => {
  const { status } = req.body;
  const nextStatus = status?.toUpperCase();

  if (!["VERIFIED", "REJECTED"].includes(nextStatus)) {
    return res.status(400).json({ message: "Status must be approved or rejected" });
  }

  try {
    const doctor = await prisma.doctor.update({
      where: { id: req.params.id },
      data: {
        verificationStatus: nextStatus,
        user: {
          update: { status: nextStatus === "VERIFIED" ? "ACTIVE" : "SUSPENDED" }
        }
      },
      include: { user: true }
    });

    return res.json({
      success: true,
      message: `Doctor ${status} successfully`,
      doctor: { id: doctor.id, verificationStatus: doctor.verificationStatus.toLowerCase() }
    });
  } catch (error) {
    console.error("Doctor approval error:", error);
    return res.status(404).json({ message: "Doctor registration not found" });
  }
};

module.exports = { listDoctors, approveDoctor };