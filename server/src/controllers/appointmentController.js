const { getIsMock } = require('../config/db');
const { generateAppointmentNumber } = require('../utils/smartCard');
const { logAudit } = require('../middleware/auditLogger');
const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Hospital = require('../models/Hospital');
const Notification = require('../models/Notification');
const mockDb = require('../utils/mockStore');

// POST /api/appointments
exports.createAppointment = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { hospitalId, doctorId, department, appointmentDate, appointmentTime, reason } = req.body;

    if (!hospitalId || !doctorId || !appointmentDate || !appointmentTime) {
      return res.status(400).json({ success: false, message: 'Please provide hospital, doctor, date, and time.' });
    }

    const appointmentNumber = generateAppointmentNumber();

    if (getIsMock()) {
      let patient = mockDb.findOne('patients', { userId });
      if (!patient) {
        // fallback to default or create on the fly
        patient = mockDb.create('patients', {
          userId,
          smartCardId: `SCN-2026-${Math.floor(100000 + Math.random() * 900000)}`,
          cardStatus: 'active',
        });
      }

      const doc = mockDb.findById('doctors', doctorId);
      const hosp = mockDb.findById('hospitals', hospitalId);
      const docUser = doc ? mockDb.findById('users', doc.userId) : null;

      const newApt = mockDb.create('appointments', {
        patientId: patient._id,
        userId,
        doctorId,
        hospitalId,
        department: department || (doc ? doc.specialization : 'General Medicine'),
        appointmentDate,
        appointmentTime,
        appointmentNumber,
        reason: reason || 'Routine consultation',
        status: 'confirmed',
        queuePosition: 0,
        estimatedWaitTime: 0,
        createdAt: new Date(),
      });

      // Notifications
      mockDb.create('notifications', {
        userId,
        title: 'Appointment Confirmed',
        message: `Your appointment with ${docUser ? docUser.name : 'your doctor'} at ${hosp ? hosp.name : 'hospital'} on ${appointmentDate} at ${appointmentTime} is confirmed. Booking ID: ${appointmentNumber}`,
        type: 'appointment',
        relatedEntityId: newApt._id,
      });

      if (docUser) {
        mockDb.create('notifications', {
          userId: docUser._id,
          title: 'New Patient Booking',
          message: `Patient ${req.user.name} booked a slot for ${appointmentDate} at ${appointmentTime}. (ID: ${appointmentNumber})`,
          type: 'appointment',
          relatedEntityId: newApt._id,
        });
      }

      await logAudit({
        req,
        action: 'BOOK_APPOINTMENT',
        entityType: 'Appointment',
        entityId: newApt._id,
        metadata: { appointmentNumber, appointmentDate, appointmentTime },
      });

      return res.status(201).json({
        success: true,
        appointment: newApt,
        message: 'Appointment successfully confirmed!',
      });
    }

    let patient = await Patient.findOne({ userId });
    if (!patient) {
      patient = await Patient.create({
        userId,
        smartCardId: `SCN-2026-${Math.floor(100000 + Math.random() * 900000)}`,
        cardStatus: 'active',
      });
    }

    const newApt = await Appointment.create({
      patientId: patient._id,
      userId,
      doctorId,
      hospitalId,
      department: department || 'General Medicine',
      appointmentDate,
      appointmentTime,
      appointmentNumber,
      reason: reason || 'Routine consultation',
      status: 'confirmed',
    });

    await Notification.create({
      userId,
      title: 'Appointment Confirmed',
      message: `Your appointment on ${appointmentDate} at ${appointmentTime} is confirmed. Booking ID: ${appointmentNumber}`,
      type: 'appointment',
      relatedEntityId: newApt._id,
    });

    await logAudit({
      req,
      action: 'BOOK_APPOINTMENT',
      entityType: 'Appointment',
      entityId: newApt._id,
      metadata: { appointmentNumber, appointmentDate, appointmentTime },
    });

    res.status(201).json({
      success: true,
      appointment: newApt,
      message: 'Appointment successfully confirmed!',
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/appointments/:id
exports.getAppointmentById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (getIsMock()) {
      const apt = mockDb.findById('appointments', id);
      if (!apt) {
        return res.status(404).json({ success: false, message: 'Appointment not found' });
      }

      const pat = mockDb.findById('patients', apt.patientId);
      const patUser = pat ? mockDb.findById('users', pat.userId) : null;
      const doc = mockDb.findById('doctors', apt.doctorId);
      const docUser = doc ? mockDb.findById('users', doc.userId) : null;
      const hosp = mockDb.findById('hospitals', apt.hospitalId);

      return res.json({
        success: true,
        appointment: {
          ...apt,
          patientName: patUser ? patUser.name : 'Patient',
          patientPhone: patUser ? patUser.phone : '',
          smartCardId: pat ? pat.smartCardId : '',
          doctorName: docUser ? docUser.name : 'Doctor',
          doctorSpecialization: doc ? doc.specialization : '',
          hospitalName: hosp ? hosp.name : 'Hospital',
          hospitalAddress: hosp ? hosp.address : '',
        },
      });
    }

    const apt = await Appointment.findById(id)
      .populate({
        path: 'patientId',
        populate: { path: 'userId', select: 'name phone' }
      })
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name' }
      })
      .populate('hospitalId', 'name address city');

    if (!apt) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    res.json({ success: true, appointment: apt });
  } catch (err) {
    next(err);
  }
};

// PUT /api/appointments/:id (Reschedule or update)
exports.updateAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { appointmentDate, appointmentTime, reason, notes } = req.body;

    if (getIsMock()) {
      const updated = mockDb.findByIdAndUpdate('appointments', id, {
        ...(appointmentDate && { appointmentDate }),
        ...(appointmentTime && { appointmentTime }),
        ...(reason && { reason }),
        ...(notes && { notes }),
      });

      if (!updated) {
        return res.status(404).json({ success: false, message: 'Appointment not found' });
      }

      await logAudit({
        req,
        action: 'RESCHEDULE_APPOINTMENT',
        entityType: 'Appointment',
        entityId: id,
        metadata: { appointmentDate, appointmentTime },
      });

      return res.json({ success: true, appointment: updated, message: 'Appointment details updated.' });
    }

    const updated = await Appointment.findByIdAndUpdate(
      id,
      {
        ...(appointmentDate && { appointmentDate }),
        ...(appointmentTime && { appointmentTime }),
        ...(reason && { reason }),
        ...(notes && { notes }),
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    await logAudit({
      req,
      action: 'RESCHEDULE_APPOINTMENT',
      entityType: 'Appointment',
      entityId: id,
      metadata: { appointmentDate, appointmentTime },
    });

    res.json({ success: true, appointment: updated, message: 'Appointment details updated.' });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/appointments/:id (Cancel)
exports.cancelAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (getIsMock()) {
      const updated = mockDb.findByIdAndUpdate('appointments', id, {
        status: 'cancelled',
        queuePosition: 0,
      });

      if (!updated) {
        return res.status(404).json({ success: false, message: 'Appointment not found' });
      }

      await logAudit({
        req,
        action: 'CANCEL_APPOINTMENT',
        entityType: 'Appointment',
        entityId: id,
        metadata: { appointmentNumber: updated.appointmentNumber },
      });

      return res.json({ success: true, message: 'Appointment cancelled successfully.' });
    }

    const updated = await Appointment.findByIdAndUpdate(
      id,
      { status: 'cancelled', queuePosition: 0 },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    await logAudit({
      req,
      action: 'CANCEL_APPOINTMENT',
      entityType: 'Appointment',
      entityId: id,
      metadata: { appointmentNumber: updated.appointmentNumber },
    });

    res.json({ success: true, message: 'Appointment cancelled successfully.' });
  } catch (err) {
    next(err);
  }
};

// POST /api/appointments/:id/check-in
// Check in using Smart Card ID or QR code simulation
exports.checkInAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { smartCardId } = req.body;

    if (getIsMock()) {
      const apt = mockDb.findById('appointments', id);
      if (!apt) {
        return res.status(404).json({ success: false, message: 'Appointment not found' });
      }

      // Count patients already in queue for this doctor today
      const currentWaitingCount = mockDb.appointments.filter(a =>
        a.doctorId === apt.doctorId &&
        ['waiting', 'in_consultation', 'checked_in'].includes(a.status) &&
        a._id !== id
      ).length;

      const newPosition = currentWaitingCount + 1;
      const estimatedWaitTime = (newPosition - 1) * 15; // 15 mins per patient

      const updated = mockDb.findByIdAndUpdate('appointments', id, {
        status: 'waiting',
        queuePosition: newPosition,
        estimatedWaitTime,
        checkedInAt: new Date(),
      });

      mockDb.create('notifications', {
        userId: apt.userId,
        title: 'Check-in Confirmed',
        message: `You are checked in! You are currently #${newPosition} in queue. Estimated wait time: ${estimatedWaitTime} mins.`,
        type: 'queue',
        relatedEntityId: id,
      });

      await logAudit({
        req,
        action: 'PATIENT_CHECK_IN',
        entityType: 'Appointment',
        entityId: id,
        metadata: { smartCardId, queuePosition: newPosition, waitTime: estimatedWaitTime },
      });

      // Socket.IO broadcast
      if (global.io) {
        global.io.emit('queueUpdate', {
          appointmentId: id,
          status: 'waiting',
          queuePosition: newPosition,
          estimatedWaitTime,
        });
      }

      return res.json({
        success: true,
        appointment: updated,
        queuePosition: newPosition,
        estimatedWaitTime,
        message: `Successfully checked in! Your queue token is #${newPosition}.`,
      });
    }

    const apt = await Appointment.findById(id);
    if (!apt) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    const currentWaitingCount = await Appointment.countDocuments({
      doctorId: apt.doctorId,
      status: { $in: ['waiting', 'in_consultation', 'checked_in'] },
      _id: { $ne: id },
    });

    const newPosition = currentWaitingCount + 1;
    const estimatedWaitTime = (newPosition - 1) * 15;

    apt.status = 'waiting';
    apt.queuePosition = newPosition;
    apt.estimatedWaitTime = estimatedWaitTime;
    apt.checkedInAt = new Date();
    await apt.save();

    await Notification.create({
      userId: apt.userId,
      title: 'Check-in Confirmed',
      message: `You are checked in! Queue #${newPosition}. Estimated wait time: ${estimatedWaitTime} mins.`,
      type: 'queue',
      relatedEntityId: id,
    });

    await logAudit({
      req,
      action: 'PATIENT_CHECK_IN',
      entityType: 'Appointment',
      entityId: id,
      metadata: { smartCardId, queuePosition: newPosition, waitTime: estimatedWaitTime },
    });

    if (global.io) {
      global.io.emit('queueUpdate', {
        appointmentId: id,
        status: 'waiting',
        queuePosition: newPosition,
        estimatedWaitTime,
      });
    }

    res.json({
      success: true,
      appointment: apt,
      queuePosition: newPosition,
      estimatedWaitTime,
      message: `Successfully checked in! Your queue token is #${newPosition}.`,
    });
  } catch (err) {
    next(err);
  }
};
