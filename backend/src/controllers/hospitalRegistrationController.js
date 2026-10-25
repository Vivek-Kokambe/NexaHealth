const bcrypt = require("bcrypt");
const crypto = require("crypto");
const prisma = require("../config/prisma");
const { sendOtpEmail } = require("../services/emailService");

const serializePublicHospital = (hospital) => ({
  _id: hospital.id,
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
  icuBedsAvailable: hospital.icuBeds,
  operatingHours: hospital.operatingHours,
  facilities: hospital.facilities,
  departments: hospital.departments.map((department) => department.name),
  verificationStatus: hospital.verificationStatus,
});

const listApprovedHospitals = async (req, res) => {
  try {
    const { search = "", city = "", department = "" } = req.query;
    const filters = [{ verificationStatus: "VERIFIED" }];

    if (typeof search === "string" && search.trim()) {
      filters.push({
        OR: [
          { name: { contains: search.trim(), mode: "insensitive" } },
          { address: { contains: search.trim(), mode: "insensitive" } },
          { city: { contains: search.trim(), mode: "insensitive" } },
        ],
      });
    }

    if (typeof city === "string" && city.trim()) {
      filters.push({ city: { equals: city.trim(), mode: "insensitive" } });
    }

    if (typeof department === "string" && department.trim()) {
      filters.push({
        departments: { some: { name: { equals: department.trim(), mode: "insensitive" } } },
      });
    }

    const hospitals = await prisma.hospital.findMany({
      where: { AND: filters },
      include: { departments: { orderBy: { name: "asc" } } },
      orderBy: [{ city: "asc" }, { name: "asc" }],
    });

    return res.json({ success: true, hospitals: hospitals.map(serializePublicHospital) });
  } catch (error) {
    console.error("Public hospital directory error:", error);
    return res.status(500).json({ success: false, message: "Failed to load approved hospitals" });
  }
};

const getApprovedHospital = async (req, res) => {
  try {
    const hospital = await prisma.hospital.findFirst({
      where: { id: req.params.hospitalId, verificationStatus: "VERIFIED" },
      include: { departments: { orderBy: { name: "asc" } } },
    });

    if (!hospital) {
      return res.status(404).json({ success: false, message: "Approved hospital not found" });
    }

    return res.json({
      success: true,
      hospital: serializePublicHospital(hospital),
      doctors: [],
    });
  } catch (error) {
    console.error("Public hospital profile error:", error);
    return res.status(500).json({ success: false, message: "Failed to load hospital profile" });
  }
};

const normalizeList = (values) => {
  if (!Array.isArray(values)) return [];

  return [...new Set(
    values
      .filter((value) => typeof value === "string")
      .map((value) => value.trim())
      .filter(Boolean)
  )];
};

const serializeHospitalUser = (user) => ({
  id: user.id,
  name: user.hospital.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  status: user.status,
  hospital: user.hospital,
});

const requestHospitalRegistrationOtp = async (req, res) => {
  try {
    const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const registrationNumber = typeof req.body.registrationNumber === "string"
      ? req.body.registrationNumber.trim()
      : "";

    if (!email || !registrationNumber) {
      return res.status(400).json({ message: "Hospital email and registration number are required" });
    }

    if (!/^\S+@\S+\.\S+$/.test(email) || email.length > 254 || registrationNumber.length > 80) {
      return res.status(400).json({ message: "Enter a valid hospital email and registration number" });
    }

    const [existingUser, existingHospital] = await Promise.all([
      prisma.user.findUnique({ where: { email } }),
      prisma.hospital.findFirst({
        where: {
          OR: [{ email }, { registrationNumber }],
        },
        select: { id: true },
      }),
    ]);

    if (existingUser || existingHospital) {
      return res.status(409).json({ message: "An account or hospital with these details already exists" });
    }

    const otp = crypto.randomInt(100000, 1000000).toString();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.emailVerification.upsert({
      where: { email },
      update: { otpHash, expiresAt, attempts: 0, verifiedAt: null },
      create: { email, otpHash, expiresAt },
    });

    await sendOtpEmail(
      email,
      otp,
      expiresAt.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
    );

    return res.status(200).json({ message: "Verification code sent successfully" });
  } catch (error) {
    console.error("Hospital OTP request error:", error);
    return res.status(500).json({ message: "Failed to send verification code" });
  }
};

const verifyHospitalRegistrationOtp = async (req, res) => {
  try {
    const {
      email: submittedEmail,
      otp,
      password,
      name,
      registrationNumber,
      phone,
      address,
      city,
      state,
      pincode,
      hospitalType,
      websiteUrl,
      totalBeds: submittedTotalBeds,
      icuBeds: submittedIcuBeds,
      operatingHours,
      departments: submittedDepartments,
      facilities: submittedFacilities,
    } = req.body;

    const email = typeof submittedEmail === "string" ? submittedEmail.trim().toLowerCase() : "";
    const normalizedName = typeof name === "string" ? name.trim() : "";
    const normalizedRegistrationNumber = typeof registrationNumber === "string"
      ? registrationNumber.trim()
      : "";
    const normalizedPhone = typeof phone === "string" ? phone.trim() : "";
    const normalizedAddress = typeof address === "string" ? address.trim() : "";
    const normalizedCity = typeof city === "string" ? city.trim() : "";
    const normalizedState = typeof state === "string" ? state.trim() : "";
    const normalizedPincode = typeof pincode === "string" ? pincode.trim() : "";
    const normalizedHospitalType = typeof hospitalType === "string" ? hospitalType.trim() : "";
    const normalizedOperatingHours = typeof operatingHours === "string" ? operatingHours.trim() : "";
    const departments = normalizeList(submittedDepartments);
    const facilities = normalizeList(submittedFacilities);
    const totalBeds = Number(submittedTotalBeds);
    const icuBeds = Number(submittedIcuBeds);
    const normalizedWebsiteUrl = typeof websiteUrl === "string" ? websiteUrl.trim() : "";

    if (!email || !otp || !password || !normalizedName || !normalizedRegistrationNumber
      || !normalizedPhone || !normalizedAddress || !normalizedCity || !normalizedState
      || !normalizedPincode || !normalizedHospitalType || !normalizedOperatingHours) {
      return res.status(400).json({ message: "Complete all required hospital and account details" });
    }

    if (!/^\S+@\S+\.\S+$/.test(email) || email.length > 254) {
      return res.status(400).json({ message: "Enter a valid hospital email address" });
    }

    if (normalizedName.length > 120 || normalizedRegistrationNumber.length > 80
      || normalizedPhone.length < 8 || normalizedPhone.length > 20
      || normalizedAddress.length > 200 || normalizedCity.length > 80
      || normalizedState.length > 80 || normalizedOperatingHours.length > 200) {
      return res.status(400).json({ message: "One or more hospital details exceed the allowed length" });
    }

    if (!["GENERAL", "MULTI_SPECIALTY", "SPECIALTY", "TEACHING", "COMMUNITY"].includes(normalizedHospitalType)) {
      return res.status(400).json({ message: "Select a valid hospital type" });
    }

    if (typeof password !== "string" || password.length < 8 || password.length > 128) {
      return res.status(400).json({ message: "Password must be between 8 and 128 characters" });
    }

    if (!/^\d{6}$/.test(normalizedPincode)) {
      return res.status(400).json({ message: "Enter a valid 6-digit postal code" });
    }

    if (!/^\d{6}$/.test(String(otp))) {
      return res.status(400).json({ message: "Enter the 6-digit verification code" });
    }

    if (departments.length === 0 || departments.length > 50 || departments.some((department) => department.length > 80)) {
      return res.status(400).json({ message: "Provide between 1 and 50 departments or specialties, each up to 80 characters" });
    }

    if (!Number.isInteger(totalBeds) || totalBeds < 0
      || totalBeds > 100000 || !Number.isInteger(icuBeds) || icuBeds < 0 || icuBeds > totalBeds) {
      return res.status(400).json({ message: "Enter valid bed counts; ICU beds cannot exceed total beds" });
    }

    if (facilities.length > 30 || facilities.some((facility) => facility.length > 100)) {
      return res.status(400).json({ message: "Provide up to 30 facilities, each up to 100 characters" });
    }

    if (normalizedWebsiteUrl) {
      try {
        const parsedUrl = new URL(normalizedWebsiteUrl);
        if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
          return res.status(400).json({ message: "Website must use HTTP or HTTPS" });
        }
      } catch {
        return res.status(400).json({ message: "Enter a valid hospital website URL" });
      }
    }

    const verification = await prisma.emailVerification.findUnique({ where: { email } });

    if (!verification) {
      return res.status(400).json({ message: "No verification code was requested for this email" });
    }

    if (new Date() > verification.expiresAt) {
      return res.status(400).json({ message: "Verification code has expired" });
    }

    if (verification.attempts >= 5) {
      return res.status(429).json({ message: "Too many incorrect attempts. Request a new code." });
    }

    const isValidOtp = await bcrypt.compare(String(otp), verification.otpHash);

    if (!isValidOtp) {
      await prisma.emailVerification.update({
        where: { email },
        data: { attempts: { increment: 1 } },
      });
      return res.status(400).json({ message: "Invalid verification code" });
    }

    const [existingUser, existingHospital, existingPhone] = await Promise.all([
      prisma.user.findUnique({ where: { email } }),
      prisma.hospital.findFirst({
        where: {
          OR: [{ email }, { registrationNumber: normalizedRegistrationNumber }],
        },
        select: { id: true },
      }),
      prisma.user.findUnique({ where: { phone: normalizedPhone }, select: { id: true } }),
    ]);

    if (existingUser || existingHospital || existingPhone) {
      return res.status(409).json({ message: "An account, phone number, or hospital registration already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.$transaction(async (transaction) => {
      const createdUser = await transaction.user.create({
        data: {
          email,
          phone: normalizedPhone,
          passwordHash,
          role: "HOSPITAL",
          status: "PENDING",
          hospital: {
            create: {
              name: normalizedName,
              registrationNumber: normalizedRegistrationNumber,
              email,
              phone: normalizedPhone,
              address: normalizedAddress,
              city: normalizedCity,
              state: normalizedState,
              pincode: normalizedPincode,
              hospitalType: normalizedHospitalType,
              websiteUrl: normalizedWebsiteUrl || null,
              totalBeds,
              icuBeds,
              operatingHours: normalizedOperatingHours,
              facilities,
              departments: {
                create: departments.map((departmentName) => ({ name: departmentName })),
              },
            },
          },
        },
        include: { hospital: { include: { departments: true } } },
      });

      await transaction.emailVerification.update({
        where: { email },
        data: { verifiedAt: new Date() },
      });

      return createdUser;
    });

    return res.status(201).json({
      message: "Email verified and hospital registration submitted for review",
      user: serializeHospitalUser(user),
    });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({ message: "An account or hospital with these details already exists" });
    }

    console.error("Hospital registration verification error:", error);
    return res.status(500).json({ message: "Failed to verify hospital registration" });
  }
};

module.exports = {
  listApprovedHospitals,
  getApprovedHospital,
  requestHospitalRegistrationOtp,
  verifyHospitalRegistrationOtp,
};
