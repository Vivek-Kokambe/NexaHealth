const bcrypt = require("bcrypt");
const prisma = require("../config/prisma");
const jwt = require("jsonwebtoken");

const crypto = require("crypto");

const { sendOtpEmail } = require("../services/emailService");
const formatBloodGroup = (bloodGroup) => bloodGroup
  ? bloodGroup.replace("_POSITIVE", "+").replace("_NEGATIVE", "-")
  : null;

const serializeUser = (user) => {
  const patient = user.patient;
  const name = patient ? `${patient.firstName} ${patient.lastName}` : null;

  return {
    id: user.id,
    name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    status: user.status,
    ...(patient && {
      bloodGroup: formatBloodGroup(patient.bloodGroup),
      smartCardId: patient.smartCardId,
      patient: {
        ...patient,
        bloodGroup: formatBloodGroup(patient.bloodGroup),
        emergencyContact: {
          name: patient.emergencyContactName,
          phone: patient.emergencyContactPhone
        }
      }
    })
  };
};

const generateSmartCardId = async (transaction) => {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const smartCardId = `SCN-${new Date().getFullYear()}-${crypto.randomInt(100000, 1000000)}`;
    const existingCard = await transaction.patient.findUnique({
      where: { smartCardId },
      select: { id: true }
    });

    if (!existingCard) return smartCardId;
  }

  throw new Error("Unable to generate a unique Smart Card ID");
};

const getPatientCardData = (user) => {
  const patient = user.patient;
  return {
    patientName: `${patient.firstName} ${patient.lastName}`,
    name: `${patient.firstName} ${patient.lastName}`,
    email: user.email,
    phone: user.phone,
    smartCardId: patient.smartCardId,
    dateOfBirth: patient.dateOfBirth,
    gender: patient.gender?.toLowerCase() || null,
    bloodGroup: formatBloodGroup(patient.bloodGroup),
    allergies: patient.allergies,
    emergencyContact: {
      name: patient.emergencyContactName,
      phone: patient.emergencyContactPhone
    },
    cardStatus: user.status.toLowerCase(),
    qrCodeValue: `SMARTCARE://${patient.smartCardId}`
  };
};

const getCurrentUser = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: { patient: true }
    });

    if (!user) return res.status(404).json({ message: "User not found" });
    return res.json({ user: serializeUser(user) });
  } catch (error) {
    console.error("Profile lookup error:", error);
    return res.status(500).json({ message: "Failed to load profile" });
  }
};

const getPatientSmartCard = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: { patient: true }
    });

    if (!user?.patient) {
      return res.status(404).json({ message: "Patient profile not found" });
    }

    return res.json({ success: true, smartCard: getPatientCardData(user) });
  } catch (error) {
    console.error("Smart Card lookup error:", error);
    return res.status(500).json({ message: "Failed to load Smart Card" });
  }
};





const requestRegistrationOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required"
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if account already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        email: normalizedEmail
      }
    });

    if (existingUser) {
      return res.status(409).json({
        message: "An account with this email already exists"
      });
    }

    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 1000000).toString();

    // Hash OTP before storing
    const otpHash = await bcrypt.hash(otp, 10);

    // OTP expires in 15 minutes
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    // Store or replace existing OTP
    await prisma.emailVerification.upsert({
      where: {
        email: normalizedEmail
      },
      update: {
        otpHash,
        expiresAt,
        attempts: 0,
        verifiedAt: null
      },
      create: {
        email: normalizedEmail,
        otpHash,
        expiresAt
      }
    });

    // Send OTP through EmailJS
    await sendOtpEmail(
      normalizedEmail,
      otp,
      expiresAt.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit"
      })
    );

    return res.status(200).json({
      message: "OTP sent successfully"
    });

  } catch (error) {
    console.error("OTP request error:", error);

    return res.status(500).json({
      message: "Failed to send OTP"
    });
  }
};


const verifyRegistrationOtp = async (req, res) => {
  try {
    const {
      email,
      otp,
      password,
      role,
      phone,
      firstName,
      lastName,
      dateOfBirth,
      gender,
      bloodGroup,
      allergies,
      emergencyContactName,
      emergencyContactPhone
    } = req.body;

    if (!email || !otp || !password || !role) {
      return res.status(400).json({
        message: "Email, OTP, password and role are required"
      });
    }

    if (role !== "PATIENT") {
      return res.status(400).json({
        message: "Email OTP registration is currently available for patients only"
      });
    }

    if (!firstName?.trim() || !lastName?.trim()) {
      return res.status(400).json({
        message: "Patient first and last name are required"
      });
    }

    const validGenders = ["MALE", "FEMALE", "OTHER"];
    const validBloodGroups = [
      "A_POSITIVE", "A_NEGATIVE", "B_POSITIVE", "B_NEGATIVE",
      "AB_POSITIVE", "AB_NEGATIVE", "O_POSITIVE", "O_NEGATIVE"
    ];
    const normalizedGender = gender ? gender.toUpperCase() : null;
    const normalizedBloodGroup = bloodGroup
      ? bloodGroup.replace("+", "_POSITIVE").replace("-", "_NEGATIVE")
      : null;
    const parsedDateOfBirth = dateOfBirth ? new Date(dateOfBirth) : null;
    const normalizedAllergies = Array.isArray(allergies)
      ? allergies.filter((allergy) => typeof allergy === "string").map((allergy) => allergy.trim()).filter(Boolean)
      : [];

    if (normalizedGender && !validGenders.includes(normalizedGender)) {
      return res.status(400).json({ message: "Invalid patient gender" });
    }

    if (normalizedBloodGroup && !validBloodGroups.includes(normalizedBloodGroup)) {
      return res.status(400).json({ message: "Invalid patient blood group" });
    }

    if (parsedDateOfBirth && Number.isNaN(parsedDateOfBirth.getTime())) {
      return res.status(400).json({ message: "Invalid patient date of birth" });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Find OTP record
    const verification = await prisma.emailVerification.findUnique({
      where: {
        email: normalizedEmail
      }
    });

    if (!verification) {
      return res.status(400).json({
        message: "No OTP request found for this email"
      });
    }

    // Check expiry
    if (new Date() > verification.expiresAt) {
      return res.status(400).json({
        message: "OTP has expired"
      });
    }

    // Check maximum attempts
    if (verification.attempts >= 5) {
      return res.status(429).json({
        message: "Too many incorrect attempts. Please request a new OTP."
      });
    }

    // Compare OTP with stored hash
    const isValidOtp = await bcrypt.compare(
      otp.toString(),
      verification.otpHash
    );

    if (!isValidOtp) {
      await prisma.emailVerification.update({
        where: {
          email: normalizedEmail
        },
        data: {
          attempts: {
            increment: 1
          }
        }
      });

      return res.status(400).json({
        message: "Invalid OTP"
      });
    }

    // Check again that account wasn't created meanwhile
    const existingUser = await prisma.user.findUnique({
      where: {
        email: normalizedEmail
      }
    });

    if (existingUser) {
      return res.status(409).json({
        message: "An account with this email already exists"
      });
    }

    const normalizedPhone = phone?.trim() || null;
    if (normalizedPhone) {
      const existingPhone = await prisma.user.findUnique({
        where: { phone: normalizedPhone },
        select: { id: true }
      });

      if (existingPhone) {
        return res.status(409).json({
          message: "This phone number is already linked to an account. Use a different phone number."
        });
      }
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.$transaction(async (transaction) => {
      const createdUser = await transaction.user.create({
        data: {
          email: normalizedEmail,
          phone: normalizedPhone,
          passwordHash,
          role: "PATIENT",
          status: "ACTIVE",
          patient: {
            create: {
              firstName: firstName.trim(),
              lastName: lastName.trim(),
              smartCardId: await generateSmartCardId(transaction),
              dateOfBirth: parsedDateOfBirth,
              gender: normalizedGender,
              bloodGroup: normalizedBloodGroup,
              allergies: normalizedAllergies,
              emergencyContactName: emergencyContactName?.trim() || null,
              emergencyContactPhone: emergencyContactPhone?.trim() || phone?.trim() || null
            }
          }
        },
        include: { patient: true }
      });

      await transaction.emailVerification.update({
        where: { email: normalizedEmail },
        data: { verifiedAt: new Date() }
      });

      return createdUser;
    });

    return res.status(201).json({
      message: "Email verified and account created successfully",
      user: serializeUser(user)
    });

  } catch (error) {
    console.error("OTP verification error:", error);

    return res.status(500).json({
      message: "Failed to verify OTP"
    });
  }
};



const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: { patient: true }
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      user.passwordHash
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    if (user.status !== "ACTIVE") {
      return res.status(403).json({
        message: `Account is ${user.status.toLowerCase()}`
      });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "1d"
      }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: serializeUser(user)
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Login failed"
    });
  }
};

module.exports = {

  loginUser,
  requestRegistrationOtp,
  verifyRegistrationOtp,
  getCurrentUser,
  getPatientSmartCard
};