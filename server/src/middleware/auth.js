const { verifyToken } = require('../utils/jwt');
const { getIsMock } = require('../config/db');
const User = require('../models/User');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Hospital = require('../models/Hospital');
const mockDb = require('../utils/mockStore');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No authentication token provided.',
    });
  }

  try {
    const decoded = verifyToken(token);
    let user;

    if (getIsMock()) {
      user = mockDb.findById('users', decoded.id);
      if (user) {
        // attach role specific entity
        if (user.role === 'patient') {
          req.patient = mockDb.findOne('patients', { userId: user._id });
        } else if (user.role === 'doctor') {
          req.doctor = mockDb.findOne('doctors', { userId: user._id });
        } else if (user.role === 'hospital') {
          req.hospital = mockDb.findOne('hospitals', { userId: user._id });
        }
      }
    } else {
      user = await User.findById(decoded.id);
      if (user) {
        if (user.role === 'patient') {
          req.patient = await Patient.findOne({ userId: user._id });
        } else if (user.role === 'doctor') {
          req.doctor = await Doctor.findOne({ userId: user._id });
        } else if (user.role === 'hospital') {
          req.hospital = await Hospital.findOne({ userId: user._id });
        }
      }
    }

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists or is suspended.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token. Please log in again.',
    });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user ? req.user.role : 'unauthorized'}' is not authorized to access this resource.`,
      });
    }
    next();
  };
};

module.exports = {
  protect,
  authorize,
};
