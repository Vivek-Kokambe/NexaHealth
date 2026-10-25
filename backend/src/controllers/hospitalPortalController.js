const prisma = require("../config/prisma");

const toHospitalSummary = (hospital) => ({
  id: hospital.id,
  name: hospital.name,
  registrationNumber: hospital.registrationNumber,
  email: hospital.email,
  phone: hospital.phone,
  address: hospital.address,
  city: hospital.city,
  state: hospital.state,
  pincode: hospital.pincode,
  hospitalType: hospital.hospitalType,
  websiteUrl: hospital.websiteUrl,
  totalBeds: hospital.totalBeds,
  icuBeds: hospital.icuBeds,
  operatingHours: hospital.operatingHours,
  facilities: hospital.facilities,
  verificationStatus: hospital.verificationStatus,
  departments: hospital.departments,
});

const getHospitalProfile = async (req, res) => {
  try {
    const hospital = await prisma.hospital.findUnique({
      where: { userId: req.user.userId },
      include: {
        departments: {
          include: { _count: { select: { doctors: true } } },
          orderBy: { name: "asc" },
        },
      },
    });

    if (!hospital) {
      return res.status(404).json({ success: false, message: "Hospital profile not found" });
    }

    return res.json({ success: true, hospital: toHospitalSummary(hospital) });
  } catch (error) {
    console.error("Hospital profile lookup error:", error);
    return res.status(500).json({ success: false, message: "Failed to load hospital profile" });
  }
};

const updateHospitalServices = async (req, res) => {
  try {
    const { departments: submittedDepartments, facilities: submittedFacilities, operatingHours } = req.body;
    const { totalBeds: submittedTotalBeds, icuBeds: submittedIcuBeds } = req.body;

    if (!Array.isArray(submittedDepartments) || !Array.isArray(submittedFacilities)) {
      return res.status(400).json({ success: false, message: "Departments and facilities must be lists" });
    }

    const departments = [...new Set(submittedDepartments
      .filter((value) => typeof value === "string")
      .map((value) => value.trim())
      .filter(Boolean))];
    const facilities = [...new Set(submittedFacilities
      .filter((value) => typeof value === "string")
      .map((value) => value.trim())
      .filter(Boolean))];
    const totalBeds = Number(submittedTotalBeds);
    const icuBeds = Number(submittedIcuBeds);
    const normalizedOperatingHours = typeof operatingHours === "string" ? operatingHours.trim() : "";

    if (departments.length === 0 || departments.length > 50 || departments.some((name) => name.length > 80)) {
      return res.status(400).json({ success: false, message: "Add 1 to 50 departments, each no more than 80 characters" });
    }

    if (facilities.length > 30 || facilities.some((name) => name.length > 100)) {
      return res.status(400).json({ success: false, message: "Add no more than 30 facilities, each no more than 100 characters" });
    }

    if (!normalizedOperatingHours || normalizedOperatingHours.length > 200) {
      return res.status(400).json({ success: false, message: "Operating hours are required and must be no more than 200 characters" });
    }

    if (!Number.isInteger(totalBeds) || totalBeds < 0 || totalBeds > 100000
      || !Number.isInteger(icuBeds) || icuBeds < 0 || icuBeds > totalBeds) {
      return res.status(400).json({ success: false, message: "Enter valid bed counts; ICU beds cannot exceed total beds" });
    }

    const normalizedDepartments = departments.map((name) => name.toLocaleLowerCase());
    if (new Set(normalizedDepartments).size !== normalizedDepartments.length) {
      return res.status(400).json({ success: false, message: "Department names must be unique" });
    }

    const hospital = await prisma.$transaction(async (transaction) => {
      const currentHospital = await transaction.hospital.findUnique({
        where: { userId: req.user.userId },
        include: {
          departments: { include: { _count: { select: { doctors: true } } } },
        },
      });

      if (!currentHospital) return null;

      const wantedNames = new Set(normalizedDepartments);
      const removals = currentHospital.departments.filter(
        (department) => !wantedNames.has(department.name.toLocaleLowerCase())
      );
      const linkedDepartment = removals.find((department) => department._count.doctors > 0);

      if (linkedDepartment) {
        const error = new Error(`Move doctors out of ${linkedDepartment.name} before removing that department`);
        error.code = "DEPARTMENT_IN_USE";
        throw error;
      }

      const existingNames = new Set(currentHospital.departments.map((department) => department.name.toLocaleLowerCase()));
      const additions = departments.filter((name) => !existingNames.has(name.toLocaleLowerCase()));

      if (removals.length > 0) {
        await transaction.department.deleteMany({
          where: { id: { in: removals.map((department) => department.id) } },
        });
      }

      if (additions.length > 0) {
        await transaction.department.createMany({
          data: additions.map((name) => ({ hospitalId: currentHospital.id, name })),
        });
      }

      return transaction.hospital.update({
        where: { id: currentHospital.id },
        data: {
          facilities,
          operatingHours: normalizedOperatingHours,
          totalBeds,
          icuBeds,
        },
        include: {
          departments: {
            include: { _count: { select: { doctors: true } } },
            orderBy: { name: "asc" },
          },
        },
      });
    });

    if (!hospital) {
      return res.status(404).json({ success: false, message: "Hospital profile not found" });
    }

    return res.json({
      success: true,
      message: "Departments and services updated",
      hospital: toHospitalSummary(hospital),
    });
  } catch (error) {
    if (error.code === "DEPARTMENT_IN_USE") {
      return res.status(409).json({ success: false, message: error.message });
    }

    console.error("Hospital services update error:", error);
    return res.status(500).json({ success: false, message: "Failed to update hospital services" });
  }
};

const getHospitalAnalytics = async (req, res) => {
  try {
    const hospital = await prisma.hospital.findUnique({
      where: { userId: req.user.userId },
      include: {
        departments: { orderBy: { name: "asc" } },
        _count: { select: { doctors: true } },
      },
    });

    if (!hospital) {
      return res.status(404).json({ success: false, message: "Hospital profile not found" });
    }

    const now = new Date();
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const tomorrow = new Date(today);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

    const appointments = await prisma.appointment.findMany({
      where: {
        hospitalId: hospital.id,
        appointmentDate: { gte: today, lt: tomorrow },
      },
      select: {
        id: true,
        appointmentNumber: true,
        appointmentDate: true,
        appointmentTime: true,
        department: true,
        status: true,
        createdAt: true,
        patient: {
          select: {
            firstName: true,
            lastName: true,
            user: { select: { phone: true } },
          },
        },
      },
      orderBy: [{ appointmentTime: "asc" }, { createdAt: "asc" }],
    });

    const statusCounts = appointments.reduce((counts, appointment) => {
      counts[appointment.status] = (counts[appointment.status] || 0) + 1;
      return counts;
    }, {});

    const departments = hospital.departments.map((department) => ({
      name: department.name,
      appointments: appointments.filter(
        (appointment) => appointment.department.toLocaleLowerCase() === department.name.toLocaleLowerCase()
      ).length,
    }));

    return res.json({
      success: true,
      hospital: toHospitalSummary(hospital),
      analytics: {
        date: today.toISOString().slice(0, 10),
        totalToday: appointments.length,
        requested: statusCounts.REQUESTED || 0,
        confirmed: statusCounts.CONFIRMED || 0,
        cancelled: statusCounts.CANCELLED || 0,
        doctorCount: hospital._count.doctors,
        totalBeds: hospital.totalBeds,
        icuBeds: hospital.icuBeds,
        departments,
        appointments: appointments.map((appointment) => ({
          id: appointment.id,
          appointmentNumber: appointment.appointmentNumber,
          appointmentDate: appointment.appointmentDate.toISOString().slice(0, 10),
          appointmentTime: appointment.appointmentTime,
          department: appointment.department,
          status: appointment.status.toLowerCase(),
          patientName: `${appointment.patient.firstName} ${appointment.patient.lastName}`,
          patientPhone: appointment.patient.user.phone,
        })),
        refreshedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Hospital analytics lookup error:", error);
    return res.status(500).json({ success: false, message: "Failed to load hospital analytics" });
  }
};

module.exports = {
  getHospitalProfile,
  updateHospitalServices,
  getHospitalAnalytics,
};
