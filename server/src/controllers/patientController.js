const { getIsMock } = require('../config/db');
const { logAudit } = require('../middleware/auditLogger');
const User = require('../models/User');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const MedicalRecord = require('../models/MedicalRecord');
const mockDb = require('../utils/mockStore');

// GET /api/patients/profile
exports.getProfile = async (req, res, next) => {
  try {
    const userId = req.user._id;
    if (getIsMock()) {
      const user = mockDb.findById('users', userId);
      const patient = mockDb.findOne('patients', { userId });
      const { password, ...safeUser } = user || {};
      return res.json({ success: true, user: safeUser, patient });
    }

    const user = await User.findById(userId);
    const patient = await Patient.findOne({ userId });
    res.json({ success: true, user, patient });
  } catch (err) {
    next(err);
  }
};

// PUT /api/patients/profile
exports.updateProfile = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { name, phone, bloodGroup, allergies, emergencyContact, address, insuranceDetails } = req.body;

    if (getIsMock()) {
      const updatedUser = mockDb.findByIdAndUpdate('users', userId, {
        ...(name && { name }),
        ...(phone && { phone }),
        ...(bloodGroup && { bloodGroup }),
        ...(allergies && { allergies }),
        ...(emergencyContact && { emergencyContact }),
        ...(address && { address }),
      });

      const patient = mockDb.findOne('patients', { userId });
      let updatedPatient = patient;
      if (patient && insuranceDetails) {
        updatedPatient = mockDb.findByIdAndUpdate('patients', patient._id, {
          insuranceDetails: { ...patient.insuranceDetails, ...insuranceDetails },
        });
      }

      await logAudit({
        req,
        action: 'UPDATE_PATIENT_PROFILE',
        entityType: 'User',
        entityId: userId,
        metadata: { name, phone },
      });

      const { password, ...safeUser } = updatedUser;
      return res.json({ success: true, user: safeUser, patient: updatedPatient, message: 'Profile updated successfully' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        ...(name && { name }),
        ...(phone && { phone }),
        ...(bloodGroup && { bloodGroup }),
        ...(allergies && { allergies }),
        ...(emergencyContact && { emergencyContact }),
        ...(address && { address }),
      },
      { new: true }
    );

    let updatedPatient = null;
    if (insuranceDetails) {
      updatedPatient = await Patient.findOneAndUpdate(
        { userId },
        { insuranceDetails },
        { new: true }
      );
    } else {
      updatedPatient = await Patient.findOne({ userId });
    }

    res.json({ success: true, user: updatedUser, patient: updatedPatient, message: 'Profile updated successfully' });
  } catch (err) {
    next(err);
  }
};

// GET /api/patients/smart-card
exports.getSmartCard = async (req, res, next) => {
  try {
    const userId = req.user._id;

    if (getIsMock()) {
      const user = mockDb.findById('users', userId);
      const patient = mockDb.findOne('patients', { userId });
      if (!patient) {
        return res.status(404).json({ success: false, message: 'Smart Card profile not found' });
      }

      return res.json({
        success: true,
        smartCard: {
          patientName: user.name,
          dateOfBirth: user.dateOfBirth || '2005-01-01',
          bloodGroup: user.bloodGroup || 'A+',
          gender: user.gender || 'male',
          smartCardId: patient.smartCardId,
          cardStatus: patient.cardStatus,
          allergies: user.allergies || [],
          emergencyContact: user.emergencyContact || {},
          insuranceDetails: patient.insuranceDetails || {},
          qrCodeValue: patient.qrCodeValue || `SMARTCARE://${patient.smartCardId}/${user.name}`,
          issuedDate: patient.createdAt,
          lastUpdated: patient.updatedAt || patient.createdAt,
        },
      });
    }

    const user = await User.findById(userId);
    const patient = await Patient.findOne({ userId });
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Smart Card profile not found' });
    }

    res.json({
      success: true,
      smartCard: {
        patientName: user.name,
        dateOfBirth: user.dateOfBirth,
        bloodGroup: user.bloodGroup,
        gender: user.gender,
        smartCardId: patient.smartCardId,
        cardStatus: patient.cardStatus,
        allergies: user.allergies,
        emergencyContact: user.emergencyContact,
        insuranceDetails: patient.insuranceDetails,
        qrCodeValue: patient.qrCodeValue,
        issuedDate: patient.createdAt,
        lastUpdated: patient.updatedAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/patients/medical-records
exports.getMedicalRecords = async (req, res, next) => {
  try {
    const userId = req.user._id;

    if (getIsMock()) {
      const patient = mockDb.findOne('patients', { userId });
      const records = patient
        ? mockDb.find('medicalRecords', { patientId: patient._id })
        : mockDb.find('medicalRecords', { userId });

      // Enrich with doctor and hospital info
      const enriched = records.map(r => {
        const doc = mockDb.findById('doctors', r.doctorId);
        const docUser = doc ? mockDb.findById('users', doc.userId) : null;
        const hosp = mockDb.findById('hospitals', r.hospitalId);
        return {
          ...r,
          doctorName: docUser ? docUser.name : 'Attending Specialist',
          doctorSpecialization: doc ? doc.specialization : 'Specialist',
          hospitalName: hosp ? hosp.name : 'SmartCare Medical Center',
        };
      });

      return res.json({ success: true, records: enriched });
    }

    const patient = await Patient.findOne({ userId });
    const query = patient ? { patientId: patient._id } : { userId };
    const records = await MedicalRecord.find(query)
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name profileImage' }
      })
      .populate('hospitalId', 'name city address')
      .sort({ consultationDate: -1 });

    res.json({ success: true, records });
  } catch (err) {
    next(err);
  }
};

// GET /api/patients/appointments
exports.getAppointments = async (req, res, next) => {
  try {
    const userId = req.user._id;

    if (getIsMock()) {
      const patient = mockDb.findOne('patients', { userId });
      const appointments = patient
        ? mockDb.find('appointments', { patientId: patient._id })
        : mockDb.find('appointments', { userId });

      const enriched = appointments.map(apt => {
        const doc = mockDb.findById('doctors', apt.doctorId);
        const docUser = doc ? mockDb.findById('users', doc.userId) : null;
        const hosp = mockDb.findById('hospitals', apt.hospitalId);
        return {
          ...apt,
          doctorName: docUser ? docUser.name : 'Dr. Specialist',
          doctorSpecialization: doc ? doc.specialization : apt.department,
          doctorImage: docUser ? docUser.profileImage : '',
          hospitalName: hosp ? hosp.name : 'SmartCare Partner Hospital',
          hospitalCity: hosp ? hosp.city : '',
        };
      });

      return res.json({ success: true, appointments: enriched });
    }

    const patient = await Patient.findOne({ userId });
    const query = patient ? { patientId: patient._id } : { userId };
    const appointments = await Appointment.find(query)
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name profileImage specialization' }
      })
      .populate('hospitalId', 'name city address')
      .sort({ appointmentDate: -1 });

    res.json({ success: true, appointments });
  } catch (err) {
    next(err);
  }
};

// GET /api/patients/queue
exports.getLiveQueue = async (req, res, next) => {
  try {
    const userId = req.user._id;

    if (getIsMock()) {
      const patient = mockDb.findOne('patients', { userId });
      const today = new Date().toISOString().split('T')[0];
      
      // Find today's active appointment
      const activeApt = mockDb.appointments.find(a => 
        (patient && a.patientId === patient._id || a.userId === userId) &&
        ['checked_in', 'waiting', 'in_consultation'].includes(a.status)
      );

      if (!activeApt) {
        return res.json({
          success: true,
          hasActiveQueue: false,
          message: 'No active queue entry for today. Check in to your appointment to join the live queue.',
        });
      }

      // Calculate queue count ahead
      const sameDoctorQueue = mockDb.appointments.filter(a => 
        a.doctorId === activeApt.doctorId && 
        ['waiting', 'in_consultation'].includes(a.status)
      );

      const doc = mockDb.findById('doctors', activeApt.doctorId);
      const docUser = doc ? mockDb.findById('users', doc.userId) : null;
      const hosp = mockDb.findById('hospitals', activeApt.hospitalId);

      return res.json({
        success: true,
        hasActiveQueue: true,
        queueDetails: {
          appointmentId: activeApt._id,
          appointmentNumber: activeApt.appointmentNumber,
          doctorName: docUser ? docUser.name : 'Dr. Specialist',
          department: activeApt.department,
          hospitalName: hosp ? hosp.name : 'Partner Hospital',
          status: activeApt.status,
          queuePosition: activeApt.queuePosition || 1,
          estimatedWaitMinutes: activeApt.estimatedWaitTime || 15,
          checkedInAt: activeApt.checkedInAt,
          totalWaiting: sameDoctorQueue.length,
        },
      });
    }

    const patient = await Patient.findOne({ userId });
    const today = new Date().toISOString().split('T')[0];
    const activeApt = await Appointment.findOne({
      patientId: patient ? patient._id : userId,
      status: { $in: ['checked_in', 'waiting', 'in_consultation'] }
    }).populate({
      path: 'doctorId',
      populate: { path: 'userId', select: 'name' }
    }).populate('hospitalId', 'name');

    if (!activeApt) {
      return res.json({
        success: true,
        hasActiveQueue: false,
        message: 'No active queue session found.',
      });
    }

    res.json({
      success: true,
      hasActiveQueue: true,
      queueDetails: {
        appointmentId: activeApt._id,
        appointmentNumber: activeApt.appointmentNumber,
        doctorName: activeApt.doctorId?.userId?.name || 'Dr. Specialist',
        department: activeApt.department,
        hospitalName: activeApt.hospitalId?.name || 'SmartCare Hospital',
        status: activeApt.status,
        queuePosition: activeApt.queuePosition,
        estimatedWaitMinutes: activeApt.estimatedWaitTime,
        checkedInAt: activeApt.checkedInAt,
      },
    });
  } catch (err) {
    next(err);
  }
};
