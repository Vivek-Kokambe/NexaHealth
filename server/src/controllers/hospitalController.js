const { getIsMock } = require('../config/db');
const { logAudit } = require('../middleware/auditLogger');
const Hospital = require('../models/Hospital');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const mockDb = require('../utils/mockStore');

// GET /api/hospitals (Public directory)
exports.getHospitals = async (req, res, next) => {
  try {
    const { city, department, search } = req.query;

    if (getIsMock()) {
      let hosps = mockDb.hospitals.filter(h => h.approvalStatus === 'approved');

      if (city) {
        hosps = hosps.filter(h => h.city.toLowerCase().includes(city.toLowerCase()));
      }
      if (department) {
        hosps = hosps.filter(h => h.departments.some(d => d.toLowerCase().includes(department.toLowerCase())));
      }
      if (search) {
        const term = search.toLowerCase();
        hosps = hosps.filter(h =>
          h.name.toLowerCase().includes(term) ||
          h.city.toLowerCase().includes(term) ||
          h.address.toLowerCase().includes(term)
        );
      }

      return res.json({ success: true, count: hosps.length, hospitals: hosps });
    }

    let query = { approvalStatus: 'approved' };
    if (city) query.city = new RegExp(city, 'i');
    if (department) query.departments = new RegExp(department, 'i');
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { city: new RegExp(search, 'i') },
        { address: new RegExp(search, 'i') },
      ];
    }

    const hospitals = await Hospital.find(query);
    res.json({ success: true, count: hospitals.length, hospitals });
  } catch (err) {
    next(err);
  }
};

// GET /api/hospitals/:id
exports.getHospitalById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (getIsMock()) {
      const hosp = mockDb.findById('hospitals', id) || mockDb.findOne('hospitals', { userId: id });
      if (!hosp) {
        return res.status(404).json({ success: false, message: 'Hospital not found' });
      }

      const doctors = mockDb.find('doctors', { hospitalId: hosp._id });
      const enrichedDoctors = doctors.map(d => {
        const u = mockDb.findById('users', d.userId);
        return {
          ...d,
          name: u ? u.name : 'Dr. Specialist',
          profileImage: u ? u.profileImage : '',
          email: u ? u.email : '',
          phone: u ? u.phone : '',
        };
      });

      return res.json({
        success: true,
        hospital: hosp,
        doctors: enrichedDoctors,
      });
    }

    let hosp = await Hospital.findById(id);
    if (!hosp) {
      hosp = await Hospital.findOne({ userId: id });
    }

    if (!hosp) {
      return res.status(404).json({ success: false, message: 'Hospital not found' });
    }

    const doctors = await Doctor.find({ hospitalId: hosp._id }).populate('userId', 'name email phone profileImage');

    res.json({
      success: true,
      hospital: hosp,
      doctors,
    });
  } catch (err) {
    next(err);
  }
};

// PUT /api/hospitals/:id
exports.updateHospital = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (getIsMock()) {
      const updated = mockDb.findByIdAndUpdate('hospitals', id, updates);
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Hospital not found' });
      }

      await logAudit({
        req,
        action: 'UPDATE_HOSPITAL_DETAILS',
        entityType: 'Hospital',
        entityId: id,
        metadata: updates,
      });

      return res.json({ success: true, hospital: updated, message: 'Hospital details updated.' });
    }

    const updated = await Hospital.findByIdAndUpdate(id, updates, { new: true });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Hospital not found' });
    }

    await logAudit({
      req,
      action: 'UPDATE_HOSPITAL_DETAILS',
      entityType: 'Hospital',
      entityId: id,
      metadata: updates,
    });

    res.json({ success: true, hospital: updated, message: 'Hospital details updated.' });
  } catch (err) {
    next(err);
  }
};

// GET /api/hospitals/:id/doctors
exports.getHospitalDoctors = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (getIsMock()) {
      const docs = mockDb.find('doctors', { hospitalId: id });
      const enriched = docs.map(d => {
        const u = mockDb.findById('users', d.userId);
        return {
          ...d,
          name: u ? u.name : 'Dr. Specialist',
          profileImage: u ? u.profileImage : '',
          email: u ? u.email : '',
          phone: u ? u.phone : '',
        };
      });
      return res.json({ success: true, count: enriched.length, doctors: enriched });
    }

    const doctors = await Doctor.find({ hospitalId: id }).populate('userId', 'name email phone profileImage');
    res.json({ success: true, count: doctors.length, doctors });
  } catch (err) {
    next(err);
  }
};

// GET /api/hospitals/:id/appointments
exports.getHospitalAppointments = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (getIsMock()) {
      const apts = mockDb.find('appointments', { hospitalId: id });
      const enriched = apts.map(apt => {
        const pat = mockDb.findById('patients', apt.patientId);
        const patUser = pat ? mockDb.findById('users', pat.userId) : null;
        const doc = mockDb.findById('doctors', apt.doctorId);
        const docUser = doc ? mockDb.findById('users', doc.userId) : null;
        return {
          ...apt,
          patientName: patUser ? patUser.name : 'Patient',
          smartCardId: pat ? pat.smartCardId : '',
          doctorName: docUser ? docUser.name : 'Doctor',
        };
      });

      return res.json({ success: true, appointments: enriched });
    }

    const appointments = await Appointment.find({ hospitalId: id })
      .populate({
        path: 'patientId',
        populate: { path: 'userId', select: 'name phone' }
      })
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name' }
      })
      .sort({ appointmentDate: -1 });

    res.json({ success: true, appointments });
  } catch (err) {
    next(err);
  }
};

// GET /api/hospitals/:id/analytics
exports.getHospitalAnalytics = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (getIsMock()) {
      const apts = mockDb.find('appointments', { hospitalId: id });
      const docs = mockDb.find('doctors', { hospitalId: id });

      const totalToday = apts.length;
      const waiting = apts.filter(a => ['waiting', 'checked_in'].includes(a.status)).length;
      const inConsultation = apts.filter(a => a.status === 'in_consultation').length;
      const completed = apts.filter(a => a.status === 'completed').length;
      const activeDoctors = docs.length;

      const departmentBreakdown = [
        { name: 'Cardiology', appointments: 12, waitTimeAvg: 18 },
        { name: 'Neurology', appointments: 8, waitTimeAvg: 22 },
        { name: 'Pediatrics', appointments: 15, waitTimeAvg: 12 },
        { name: 'Orthopedics', appointments: 6, waitTimeAvg: 15 },
      ];

      return res.json({
        success: true,
        stats: {
          totalToday,
          waiting,
          inConsultation,
          completed,
          activeDoctors,
          bedOccupancyRate: 84,
          departmentBreakdown,
        },
      });
    }

    const totalToday = await Appointment.countDocuments({ hospitalId: id });
    const waiting = await Appointment.countDocuments({ hospitalId: id, status: { $in: ['waiting', 'checked_in'] } });
    const completed = await Appointment.countDocuments({ hospitalId: id, status: 'completed' });
    const inConsultation = await Appointment.countDocuments({ hospitalId: id, status: 'in_consultation' });
    const activeDoctors = await Doctor.countDocuments({ hospitalId: id });

    res.json({
      success: true,
      stats: {
        totalToday,
        waiting,
        inConsultation,
        completed,
        activeDoctors,
        bedOccupancyRate: 84,
        departmentBreakdown: [
          { name: 'Cardiology', appointments: 12, waitTimeAvg: 18 },
          { name: 'Neurology', appointments: 8, waitTimeAvg: 22 },
          { name: 'Pediatrics', appointments: 15, waitTimeAvg: 12 },
        ],
      },
    });
  } catch (err) {
    next(err);
  }
};
