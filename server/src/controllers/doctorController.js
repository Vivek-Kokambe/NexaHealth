const { getIsMock } = require('../config/db');
const { logAudit } = require('../middleware/auditLogger');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Hospital = require('../models/Hospital');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const MedicalRecord = require('../models/MedicalRecord');
const Notification = require('../models/Notification');
const mockDb = require('../utils/mockStore');

// GET /api/doctors (Public directory)
exports.getDoctors = async (req, res, next) => {
  try {
    const { specialization, hospitalId, search, minRating } = req.query;

    if (getIsMock()) {
      let docs = mockDb.doctors.filter(d => d.approvalStatus === 'approved');

      if (specialization) {
        docs = docs.filter(d => d.specialization.toLowerCase().includes(specialization.toLowerCase()));
      }
      if (hospitalId) {
        docs = docs.filter(d => d.hospitalId === hospitalId);
      }
      if (minRating) {
        docs = docs.filter(d => d.rating >= Number(minRating));
      }

      // Enrich with user and hospital info
      let results = docs.map(d => {
        const u = mockDb.findById('users', d.userId);
        const h = mockDb.findById('hospitals', d.hospitalId);
        return {
          ...d,
          name: u ? u.name : 'Medical Specialist',
          profileImage: u ? u.profileImage : '',
          email: u ? u.email : '',
          phone: u ? u.phone : '',
          hospitalName: h ? h.name : 'SmartCare Partner Hospital',
          hospitalCity: h ? h.city : '',
        };
      });

      if (search) {
        const term = search.toLowerCase();
        results = results.filter(d =>
          d.name.toLowerCase().includes(term) ||
          d.specialization.toLowerCase().includes(term) ||
          d.hospitalName.toLowerCase().includes(term)
        );
      }

      return res.json({ success: true, count: results.length, doctors: results });
    }

    let query = { approvalStatus: 'approved' };
    if (specialization) query.specialization = new RegExp(specialization, 'i');
    if (hospitalId) query.hospitalId = hospitalId;
    if (minRating) query.rating = { $gte: Number(minRating) };

    const doctors = await Doctor.find(query)
      .populate('userId', 'name email phone profileImage')
      .populate('hospitalId', 'name city address');

    let formatted = doctors.map(d => ({
      ...d.toObject(),
      name: d.userId?.name,
      profileImage: d.userId?.profileImage,
      email: d.userId?.email,
      phone: d.userId?.phone,
      hospitalName: d.hospitalId?.name,
      hospitalCity: d.hospitalId?.city,
    }));

    if (search) {
      const term = search.toLowerCase();
      formatted = formatted.filter(d =>
        d.name?.toLowerCase().includes(term) ||
        d.specialization?.toLowerCase().includes(term) ||
        d.hospitalName?.toLowerCase().includes(term)
      );
    }

    res.json({ success: true, count: formatted.length, doctors: formatted });
  } catch (err) {
    next(err);
  }
};

// GET /api/doctors/:id
exports.getDoctorById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (getIsMock()) {
      const doc = mockDb.findById('doctors', id) || mockDb.findOne('doctors', { userId: id });
      if (!doc) {
        return res.status(404).json({ success: false, message: 'Doctor not found' });
      }

      const u = mockDb.findById('users', doc.userId);
      const h = mockDb.findById('hospitals', doc.hospitalId);

      return res.json({
        success: true,
        doctor: {
          ...doc,
          name: u ? u.name : 'Dr. Specialist',
          profileImage: u ? u.profileImage : '',
          email: u ? u.email : '',
          phone: u ? u.phone : '',
          hospitalName: h ? h.name : 'SmartCare Partner Hospital',
          hospitalCity: h ? h.city : '',
          hospitalAddress: h ? h.address : '',
        },
      });
    }

    let doc = await Doctor.findById(id)
      .populate('userId', 'name email phone profileImage')
      .populate('hospitalId', 'name city address facilities operatingHours');

    if (!doc) {
      doc = await Doctor.findOne({ userId: id })
        .populate('userId', 'name email phone profileImage')
        .populate('hospitalId', 'name city address facilities operatingHours');
    }

    if (!doc) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    res.json({
      success: true,
      doctor: {
        ...doc.toObject(),
        name: doc.userId?.name,
        profileImage: doc.userId?.profileImage,
        email: doc.userId?.email,
        phone: doc.userId?.phone,
        hospitalName: doc.hospitalId?.name,
        hospitalCity: doc.hospitalId?.city,
        hospitalAddress: doc.hospitalId?.address,
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/doctors/appointments (For authenticated doctor)
exports.getDoctorAppointments = async (req, res, next) => {
  try {
    const doctor = req.doctor;
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }

    if (getIsMock()) {
      const apts = mockDb.find('appointments', { doctorId: doctor._id });
      const enriched = apts.map(apt => {
        const pat = mockDb.findById('patients', apt.patientId);
        const patUser = pat ? mockDb.findById('users', pat.userId) : null;
        return {
          ...apt,
          patientName: patUser ? patUser.name : 'Patient',
          patientPhone: patUser ? patUser.phone : '',
          patientAge: 32,
          patientGender: patUser ? patUser.gender : 'Unspecified',
          patientBloodGroup: patUser ? patUser.bloodGroup : 'Unknown',
          smartCardId: pat ? pat.smartCardId : '',
        };
      });

      return res.json({ success: true, appointments: enriched });
    }

    const appointments = await Appointment.find({ doctorId: doctor._id })
      .populate({
        path: 'patientId',
        populate: { path: 'userId', select: 'name phone gender bloodGroup dateOfBirth' }
      })
      .sort({ appointmentDate: 1, queuePosition: 1 });

    const formatted = appointments.map(apt => ({
      ...apt.toObject(),
      patientName: apt.patientId?.userId?.name || 'Patient',
      patientPhone: apt.patientId?.userId?.phone || '',
      patientGender: apt.patientId?.userId?.gender || '',
      patientBloodGroup: apt.patientId?.userId?.bloodGroup || '',
      smartCardId: apt.patientId?.smartCardId || '',
    }));

    res.json({ success: true, appointments: formatted });
  } catch (err) {
    next(err);
  }
};

// PUT /api/doctors/appointments/:id/status
exports.updateAppointmentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, queuePosition, estimatedWaitTime } = req.body;

    const validStatuses = ['waiting', 'checked_in', 'in_consultation', 'completed', 'cancelled', 'no_show'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status code' });
    }

    let updatedApt = null;

    if (getIsMock()) {
      updatedApt = mockDb.findByIdAndUpdate('appointments', id, {
        ...(status && { status }),
        ...(queuePosition !== undefined && { queuePosition }),
        ...(estimatedWaitTime !== undefined && { estimatedWaitTime }),
      });

      if (!updatedApt) {
        return res.status(404).json({ success: false, message: 'Appointment not found' });
      }

      // Notify patient
      const pat = mockDb.findById('patients', updatedApt.patientId);
      if (pat) {
        mockDb.create('notifications', {
          userId: pat.userId,
          title: `Appointment Status: ${status.replace('_', ' ').toUpperCase()}`,
          message: `Your appointment with Dr. ${req.user.name} is now ${status.replace('_', ' ')}.`,
          type: 'queue',
          relatedEntityId: updatedApt._id,
        });
      }

      // Audit Log
      await logAudit({
        req,
        action: 'UPDATE_APPOINTMENT_QUEUE_STATUS',
        entityType: 'Appointment',
        entityId: id,
        metadata: { newStatus: status, doctor: req.user.name },
      });

      // Emit Socket.IO update if global.io available
      if (global.io) {
        global.io.emit('queueUpdate', {
          appointmentId: id,
          status,
          queuePosition,
          estimatedWaitTime,
        });
      }

      return res.json({ success: true, appointment: updatedApt, message: `Status updated to ${status}` });
    }

    updatedApt = await Appointment.findByIdAndUpdate(
      id,
      {
        ...(status && { status }),
        ...(queuePosition !== undefined && { queuePosition }),
        ...(estimatedWaitTime !== undefined && { estimatedWaitTime }),
      },
      { new: true }
    ).populate('patientId');

    if (!updatedApt) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    if (updatedApt.patientId?.userId) {
      await Notification.create({
        userId: updatedApt.patientId.userId,
        title: `Appointment Status: ${status.replace('_', ' ').toUpperCase()}`,
        message: `Your appointment is now marked as ${status.replace('_', ' ')}.`,
        type: 'queue',
        relatedEntityId: updatedApt._id,
      });
    }

    await logAudit({
      req,
      action: 'UPDATE_APPOINTMENT_QUEUE_STATUS',
      entityType: 'Appointment',
      entityId: id,
      metadata: { newStatus: status, doctor: req.user.name },
    });

    if (global.io) {
      global.io.emit('queueUpdate', {
        appointmentId: id,
        status,
        queuePosition,
        estimatedWaitTime,
      });
    }

    res.json({ success: true, appointment: updatedApt, message: `Status updated to ${status}` });
  } catch (err) {
    next(err);
  }
};

// GET /api/doctors/patients/:smartCardId
// Look up patient medical records using Smart Card ID
exports.lookupPatientBySmartCard = async (req, res, next) => {
  try {
    const { smartCardId } = req.params;
    const { emergencyAccess } = req.query;

    if (getIsMock()) {
      const patient = mockDb.findOne('patients', { smartCardId: smartCardId.trim() });
      if (!patient) {
        return res.status(404).json({ success: false, message: `No patient registered with Smart Card ID '${smartCardId}'` });
      }

      const user = mockDb.findById('users', patient.userId);
      const records = mockDb.find('medicalRecords', { patientId: patient._id });

      const enrichedRecords = records.map(r => {
        const doc = mockDb.findById('doctors', r.doctorId);
        const docUser = doc ? mockDb.findById('users', doc.userId) : null;
        const hosp = mockDb.findById('hospitals', r.hospitalId);
        return {
          ...r,
          doctorName: docUser ? docUser.name : 'Attending Specialist',
          hospitalName: hosp ? hosp.name : 'SmartCare Network Hospital',
        };
      });

      // Audit log the medical record lookup
      await logAudit({
        req,
        action: emergencyAccess === 'true' ? 'EMERGENCY_OVERRIDE_RECORD_ACCESS' : 'LOOKUP_PATIENT_BY_SMART_CARD',
        entityType: 'Patient',
        entityId: patient._id,
        metadata: {
          smartCardId,
          patientName: user.name,
          doctorName: req.user.name,
          emergencyAccess: emergencyAccess === 'true',
        },
      });

      return res.json({
        success: true,
        patient: {
          patientId: patient._id,
          smartCardId: patient.smartCardId,
          name: user.name,
          dateOfBirth: user.dateOfBirth || '2005-01-01',
          gender: user.gender || 'male',
          bloodGroup: user.bloodGroup || 'A+',
          phone: user.phone,
          allergies: user.allergies || [],
          emergencyContact: user.emergencyContact || {},
          cardStatus: patient.cardStatus,
          medicalSummary: patient.medicalSummary,
          insuranceDetails: patient.insuranceDetails,
        },
        records: enrichedRecords,
        complianceNotice: 'Authorized medical record lookup logged for auditing. Patient privacy guaranteed under SmartCare Network Protocol.',
      });
    }

    const patient = await Patient.findOne({ smartCardId: smartCardId.trim() }).populate('userId');
    if (!patient) {
      return res.status(404).json({ success: false, message: `No patient registered with Smart Card ID '${smartCardId}'` });
    }

    const records = await MedicalRecord.find({ patientId: patient._id })
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name' }
      })
      .populate('hospitalId', 'name city')
      .sort({ consultationDate: -1 });

    await logAudit({
      req,
      action: emergencyAccess === 'true' ? 'EMERGENCY_OVERRIDE_RECORD_ACCESS' : 'LOOKUP_PATIENT_BY_SMART_CARD',
      entityType: 'Patient',
      entityId: patient._id,
      metadata: {
        smartCardId,
        patientName: patient.userId?.name,
        doctorName: req.user.name,
        emergencyAccess: emergencyAccess === 'true',
      },
    });

    res.json({
      success: true,
      patient: {
        patientId: patient._id,
        smartCardId: patient.smartCardId,
        name: patient.userId?.name,
        dateOfBirth: patient.userId?.dateOfBirth,
        gender: patient.userId?.gender,
        bloodGroup: patient.userId?.bloodGroup,
        phone: patient.userId?.phone,
        allergies: patient.userId?.allergies,
        emergencyContact: patient.userId?.emergencyContact,
        cardStatus: patient.cardStatus,
        medicalSummary: patient.medicalSummary,
        insuranceDetails: patient.insuranceDetails,
      },
      records,
      complianceNotice: 'Authorized clinical record lookup logged in compliance with SmartCare Network standards.',
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/doctors/medical-records
// Create consultation record
exports.createMedicalRecord = async (req, res, next) => {
  try {
    const doctor = req.doctor;
    const {
      patientId,
      appointmentId,
      symptoms,
      diagnosis,
      allergies,
      vitals,
      prescription,
      labReports,
      attachments,
      notes,
      followUpDate,
    } = req.body;

    if (!patientId || !diagnosis) {
      return res.status(400).json({ success: false, message: 'Patient ID and Diagnosis are required.' });
    }

    if (getIsMock()) {
      const patient = mockDb.findById('patients', patientId);
      const newRecord = mockDb.create('medicalRecords', {
        patientId,
        userId: patient ? patient.userId : null,
        doctorId: doctor ? doctor._id : 'doc_1',
        hospitalId: doctor ? doctor.hospitalId : 'hosp_1',
        appointmentId: appointmentId || null,
        consultationDate: new Date(),
        symptoms: symptoms || [],
        diagnosis,
        allergies: allergies || [],
        vitals: vitals || {
          bloodPressure: '120/80 mmHg',
          heartRate: 72,
          temperature: '98.6 °F',
          weight: 70,
          oxygenLevel: 99,
        },
        prescription: prescription || [],
        labReports: labReports || [],
        attachments: attachments || [],
        notes: notes || '',
        followUpDate: followUpDate || '',
        consentStatus: 'granted',
        accessType: 'normal',
      });

      // Update appointment to completed if provided
      if (appointmentId) {
        mockDb.findByIdAndUpdate('appointments', appointmentId, {
          status: 'completed',
          queuePosition: 0,
        });
      }

      // Notify patient
      if (patient) {
        mockDb.create('notifications', {
          userId: patient.userId,
          title: 'New Consultation Record Added',
          message: `Dr. ${req.user.name} added a clinical report & prescription to your digital medical history.`,
          type: 'record',
          relatedEntityId: newRecord._id,
        });
      }

      await logAudit({
        req,
        action: 'CREATE_MEDICAL_RECORD',
        entityType: 'MedicalRecord',
        entityId: newRecord._id,
        metadata: { diagnosis, doctorName: req.user.name },
      });

      return res.status(201).json({
        success: true,
        record: newRecord,
        message: 'Medical record and prescription saved successfully.',
      });
    }

    const patient = await Patient.findById(patientId);
    const newRecord = await MedicalRecord.create({
      patientId,
      userId: patient ? patient.userId : null,
      doctorId: doctor ? doctor._id : null,
      hospitalId: doctor ? doctor.hospitalId : null,
      appointmentId,
      symptoms,
      diagnosis,
      allergies,
      vitals,
      prescription,
      labReports,
      attachments,
      notes,
      followUpDate,
    });

    if (appointmentId) {
      await Appointment.findByIdAndUpdate(appointmentId, {
        status: 'completed',
        queuePosition: 0,
      });
    }

    if (patient?.userId) {
      await Notification.create({
        userId: patient.userId,
        title: 'New Consultation Record Added',
        message: `Dr. ${req.user.name} added a clinical report to your medical record.`,
        type: 'record',
        relatedEntityId: newRecord._id,
      });
    }

    await logAudit({
      req,
      action: 'CREATE_MEDICAL_RECORD',
      entityType: 'MedicalRecord',
      entityId: newRecord._id,
      metadata: { diagnosis, doctorName: req.user.name },
    });

    res.status(201).json({
      success: true,
      record: newRecord,
      message: 'Medical record created successfully.',
    });
  } catch (err) {
    next(err);
  }
};
