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

const listHospitalsForReview = async (req, res) => {
  try {
    const status = typeof req.query.status === "string" ? req.query.status.toUpperCase() : "PENDING";
    const validStatuses = ["PENDING", "VERIFIED", "REJECTED", "ALL"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Status must be PENDING, VERIFIED, REJECTED, or ALL" });
    }

    const hospitals = await prisma.hospital.findMany({
      ...(status !== "ALL" && { where: { verificationStatus: status } }),
      include: {
        departments: { orderBy: { name: "asc" } },
        user: { select: { id: true, email: true, phone: true, status: true, createdAt: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json({ hospitals });
  } catch (error) {
    console.error("Admin hospital review list error:", error);
    return res.status(500).json({ message: "Failed to load hospital applications" });
  }
};

const reviewHospital = async (req, res) => {
  try {
    const { status } = req.body;
    const nextStatus = typeof status === "string" ? status.toUpperCase() : "";

    if (!["VERIFIED", "REJECTED"].includes(nextStatus)) {
      return res.status(400).json({ message: "Status must be VERIFIED or REJECTED" });
    }

    const hospital = await prisma.hospital.findUnique({
      where: { id: req.params.hospitalId },
      select: { id: true, userId: true, verificationStatus: true, name: true },
    });

    if (!hospital) {
      return res.status(404).json({ message: "Hospital application not found" });
    }

    if (hospital.verificationStatus !== "PENDING") {
      return res.status(409).json({ message: "Only pending hospital applications can be reviewed" });
    }

    if (!hospital.userId) {
      return res.status(409).json({ message: "This hospital is not linked to an account and cannot be reviewed" });
    }

    const accountStatus = nextStatus === "VERIFIED" ? "ACTIVE" : "SUSPENDED";

    await prisma.$transaction([
      prisma.hospital.update({
        where: { id: hospital.id },
        data: { verificationStatus: nextStatus },
      }),
      prisma.user.update({
        where: { id: hospital.userId },
        data: { status: accountStatus },
      }),
    ]);

    return res.json({
      message: nextStatus === "VERIFIED"
        ? `${hospital.name} has been approved and can now sign in`
        : `${hospital.name} has been rejected`,
      hospitalId: hospital.id,
      status: nextStatus,
      accountStatus,
    });
  } catch (error) {
    console.error("Admin hospital review action error:", error);
    return res.status(500).json({ message: "Failed to update hospital application" });
  }
};

module.exports = {
  listDoctors,
  approveDoctor,
  listHospitalsForReview,
  reviewHospital,
};
