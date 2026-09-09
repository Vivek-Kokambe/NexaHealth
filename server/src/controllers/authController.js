const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils/jwt');
const { generateSmartCardId } = require('../utils/smartCard');
const { getIsMock } = require('../config/db');
const { logAudit } = require('../middleware/auditLogger');
const User = require('../models/User');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Hospital = require('../models/Hospital');
const mockDb = require('../utils/mockStore');

// POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      role = 'patient',
      gender,
      bloodGroup,
      dateOfBirth,
      address,
      emergencyContact,
      allergies,
      // Doctor specific
      hospitalId,
      specialization,
      licenseNumber,
      qualifications,
      consultationFee,
      // Hospital specific
      registrationNumber,
      city,
      state,
      pincode,
      departments,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password.' });
    }

    const emailNormalized = email.toLowerCase().trim();

    if (getIsMock()) {
      const existingUser = mockDb.findOne('users', { email: emailNormalized });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'User with this email already exists.' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = mockDb.create('users', {
        name,
        email: emailNormalized,
        password: hashedPassword,
        phone: phone || '',
        role,
        gender: gender || 'prefer_not_to_say',
        bloodGroup: bloodGroup || 'Unknown',
        dateOfBirth: dateOfBirth || null,
        address: address || {},
        emergencyContact: emergencyContact || {},
        allergies: allergies || [],
        isActive: true,
      });

      let roleData = null;

      if (role === 'patient') {
        const smartCardId = generateSmartCardId();
        roleData = mockDb.create('patients', {
          userId: user._id,
          smartCardId,
          medicalSummary: 'New registered patient profile.',
          insuranceDetails: { provider: '', policyNumber: '', coverageAmount: 0 },
          cardStatus: 'active',
          qrCodeValue: `SMARTCARE://${smartCardId}/${name.toUpperCase().replace(/\s+/g, '-')}/${bloodGroup || 'UNKNOWN'}`,
        });
      } else if (role === 'doctor') {
        roleData = mockDb.create('doctors', {
          userId: user._id,
          hospitalId: hospitalId || 'hosp_1',
          specialization: specialization || 'General Medicine',
          licenseNumber: licenseNumber || `MCI-REG-${Date.now().toString().slice(-5)}`,
          qualifications: qualifications || ['MBBS'],
          experience: 3,
          consultationFee: consultationFee || 500,
          approvalStatus: 'approved', // auto-approve in mock for smooth testing
          availableSlots: [
            { day: 'Monday', startTime: '09:00', endTime: '13:00', slotDurationMinutes: 20, maxPatients: 10 },
            { day: 'Wednesday', startTime: '14:00', endTime: '18:00', slotDurationMinutes: 20, maxPatients: 10 },
          ],
        });
      } else if (role === 'hospital') {
        roleData = mockDb.create('hospitals', {
          userId: user._id,
          name,
          registrationNumber: registrationNumber || `HOSP-REG-${Date.now().toString().slice(-5)}`,
          email: emailNormalized,
          phone: phone || '',
          address: typeof address === 'string' ? address : (address?.street || 'Main Health Avenue'),
          city: city || 'New Delhi',
          state: state || 'Delhi',
          pincode: pincode || '110001',
          departments: departments || ['General Medicine', 'Cardiology', 'Emergency Care'],
          approvalStatus: 'approved',
        });
      }

      const token = generateToken(user._id, user.role);

      await logAudit({
        req,
        action: 'REGISTER_USER',
        entityType: 'User',
        entityId: user._id,
        metadata: { role, email: user.email },
      });

      // sanitized user
      const { password: _, ...sanitizedUser } = user;

      return res.status(201).json({
        success: true,
        token,
        user: sanitizedUser,
        roleData,
        message: 'Registration successful!',
      });
    }

    // Real MongoDB branch
    const existing = await User.findOne({ email: emailNormalized });
    if (existing) {
      return res.status(400).json({ success: false, message: 'User with this email already exists.' });
    }

    const user = await User.create({
      name,
      email: emailNormalized,
      password,
      phone,
      role,
      gender,
      bloodGroup,
      dateOfBirth,
      address,
      emergencyContact,
      allergies,
      isActive: true,
    });

    let roleData = null;
    if (role === 'patient') {
      const smartCardId = generateSmartCardId();
      roleData = await Patient.create({
        userId: user._id,
        smartCardId,
        medicalSummary: 'New patient registered.',
        insuranceDetails: {},
        cardStatus: 'active',
        qrCodeValue: `SMARTCARE://${smartCardId}/${name.toUpperCase().replace(/\s+/g, '-')}/${bloodGroup || 'UNKNOWN'}`,
      });
    } else if (role === 'doctor') {
      roleData = await Doctor.create({
        userId: user._id,
        hospitalId: hospitalId || null,
        specialization: specialization || 'General Medicine',
        licenseNumber: licenseNumber || `MCI-REG-${Date.now().toString().slice(-5)}`,
        qualifications: qualifications || ['MBBS'],
        experience: 3,
        consultationFee: consultationFee || 500,
        approvalStatus: 'approved',
      });
    } else if (role === 'hospital') {
      roleData = await Hospital.create({
        userId: user._id,
        name,
        registrationNumber: registrationNumber || `HOSP-REG-${Date.now().toString().slice(-5)}`,
        email: emailNormalized,
        phone,
        address: typeof address === 'string' ? address : address?.street || '',
        city: city || 'New Delhi',
        state: state || 'Delhi',
        pincode: pincode || '110001',
        departments: departments || ['General Medicine', 'Cardiology'],
        approvalStatus: 'approved',
      });
    }

    const token = generateToken(user._id, user.role);

    await logAudit({
      req,
      action: 'REGISTER_USER',
      entityType: 'User',
      entityId: user._id,
      metadata: { role, email: user.email },
    });

    const userObj = user.toObject();
    delete userObj.password;

    res.status(201).json({
      success: true,
      token,
      user: userObj,
      roleData,
      message: 'Registration successful!',
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    const emailNormalized = email.toLowerCase().trim();

    if (getIsMock()) {
      const user = mockDb.findOne('users', { email: emailNormalized });
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid credentials.' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid credentials.' });
      }

      if (!user.isActive) {
        return res.status(403).json({ success: false, message: 'Your account has been deactivated. Please contact support.' });
      }

      let roleData = null;
      if (user.role === 'patient') {
        roleData = mockDb.findOne('patients', { userId: user._id });
      } else if (user.role === 'doctor') {
        roleData = mockDb.findOne('doctors', { userId: user._id });
      } else if (user.role === 'hospital') {
        roleData = mockDb.findOne('hospitals', { userId: user._id });
      }

      const token = generateToken(user._id, user.role);

      await logAudit({
        req: { ...req, user },
        action: 'LOGIN_SUCCESS',
        entityType: 'User',
        entityId: user._id,
        metadata: { role: user.role, email: user.email },
      });

      const { password: _, ...sanitizedUser } = user;

      return res.json({
        success: true,
        token,
        user: sanitizedUser,
        roleData,
        message: 'Login successful.',
      });
    }

    // Real Mongo
    const user = await User.findOne({ email: emailNormalized }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Your account has been deactivated.' });
    }

    let roleData = null;
    if (user.role === 'patient') {
      roleData = await Patient.findOne({ userId: user._id });
    } else if (user.role === 'doctor') {
      roleData = await Doctor.findOne({ userId: user._id });
    } else if (user.role === 'hospital') {
      roleData = await Hospital.findOne({ userId: user._id });
    }

    const token = generateToken(user._id, user.role);

    await logAudit({
      req: { ...req, user },
      action: 'LOGIN_SUCCESS',
      entityType: 'User',
      entityId: user._id,
      metadata: { role: user.role, email: user.email },
    });

    const userObj = user.toObject();
    delete userObj.password;

    res.json({
      success: true,
      token,
      user: userObj,
      roleData,
      message: 'Login successful.',
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/auth/me
exports.getMe = async (req, res, next) => {
  try {
    const user = req.user;
    let roleData = null;

    if (getIsMock()) {
      if (user.role === 'patient') {
        roleData = mockDb.findOne('patients', { userId: user._id });
      } else if (user.role === 'doctor') {
        roleData = mockDb.findOne('doctors', { userId: user._id });
      } else if (user.role === 'hospital') {
        roleData = mockDb.findOne('hospitals', { userId: user._id });
      }
    } else {
      if (user.role === 'patient') {
        roleData = await Patient.findOne({ userId: user._id });
      } else if (user.role === 'doctor') {
        roleData = await Doctor.findOne({ userId: user._id });
      } else if (user.role === 'hospital') {
        roleData = await Hospital.findOne({ userId: user._id });
      }
    }

    const sanitizedUser = user.toObject ? user.toObject() : { ...user };
    delete sanitizedUser.password;

    res.json({
      success: true,
      user: sanitizedUser,
      roleData,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/forgot-password
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    res.json({
      success: true,
      message: `If an account exists for ${email}, a password reset link and 6-digit verification code has been dispatched. (Demo code: 749210)`,
      demoResetCode: '749210',
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/reset-password
exports.resetPassword = async (req, res, next) => {
  try {
    const { email, code, newPassword } = req.body;
    res.json({
      success: true,
      message: 'Password has been successfully reset. Please log in with your new credentials.',
    });
  } catch (error) {
    next(error);
  }
};
