const { getIsMock } = require('../config/db');
const { logAudit } = require('../middleware/auditLogger');
const User = require('../models/User');
const Hospital = require('../models/Hospital');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const MedicalRecord = require('../models/MedicalRecord');
const AuditLog = require('../models/AuditLog');
const mockDb = require('../utils/mockStore');

// In-memory support/complaints tickets
let supportTickets = [
  {
    _id: 'tkt_1',
    userEmail: 'vivek.kokambe@example.com',
    userName: 'Vivek Kokambe',
    userRole: 'patient',
    category: 'Smart Card',
    subject: 'Request for secondary card issue',
    message: 'Can I add a dependent minor onto my Smart Card profile?',
    status: 'open',
    priority: 'medium',
    createdAt: new Date('2026-02-14T10:00:00Z'),
  },
  {
    _id: 'tkt_2',
    userEmail: 'dr.vikram.malhotra@smartcare.org',
    userName: 'Dr. Vikram Malhotra',
    userRole: 'doctor',
    category: 'Schedule',
    subject: 'Holiday slot update request',
    message: 'Need to block alternate Saturdays for annual medical conference.',
    status: 'resolved',
    priority: 'low',
    createdAt: new Date('2026-02-12T14:30:00Z'),
  },
];

// GET /api/admin/dashboard
exports.getDashboard = async (req, res, next) => {
  try {
    if (getIsMock()) {
      const totalUsers = mockDb.users.length;
      const totalPatients = mockDb.patients.length;
      const totalDoctors = mockDb.doctors.length;
      const totalHospitals = mockDb.hospitals.length;
      const totalAppointments = mockDb.appointments.length;
      const totalRecords = mockDb.medicalRecords.length;

      const pendingHospitals = mockDb.hospitals.filter(h => h.approvalStatus === 'pending').length;
      const pendingDoctors = mockDb.doctors.filter(d => d.approvalStatus === 'pending').length;

      const weeklyAppointments = [
        { day: 'Mon', count: 48, completed: 42 },
        { day: 'Tue', count: 62, completed: 58 },
        { day: 'Wed', count: 55, completed: 51 },
        { day: 'Thu', count: 71, completed: 68 },
        { day: 'Fri', count: 80, completed: 74 },
        { day: 'Sat', count: 45, completed: 40 },
        { day: 'Sun', count: 22, completed: 20 },
      ];

      const queueDistribution = [
        { status: 'Completed', count: 184 },
        { status: 'In Consultation', count: 14 },
        { status: 'Waiting in Queue', count: 29 },
        { status: 'Confirmed / Upcoming', count: 45 },
        { status: 'Cancelled', count: 12 },
      ];

      return res.json({
        success: true,
        stats: {
          totalUsers,
          totalPatients,
          totalDoctors,
          totalHospitals,
          totalAppointments,
          totalRecords,
          pendingHospitals,
          pendingDoctors,
          openTickets: supportTickets.filter(t => t.status === 'open').length,
          weeklyAppointments,
          queueDistribution,
        },
      });
    }

    const totalUsers = await User.countDocuments();
    const totalPatients = await Patient.countDocuments();
    const totalDoctors = await Doctor.countDocuments();
    const totalHospitals = await Hospital.countDocuments();
    const totalAppointments = await Appointment.countDocuments();
    const totalRecords = await MedicalRecord.countDocuments();
    const pendingHospitals = await Hospital.countDocuments({ approvalStatus: 'pending' });
    const pendingDoctors = await Doctor.countDocuments({ approvalStatus: 'pending' });

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalPatients,
        totalDoctors,
        totalHospitals,
        totalAppointments,
        totalRecords,
        pendingHospitals,
        pendingDoctors,
        openTickets: supportTickets.filter(t => t.status === 'open').length,
        weeklyAppointments: [
          { day: 'Mon', count: 48, completed: 42 },
          { day: 'Tue', count: 62, completed: 58 },
          { day: 'Wed', count: 55, completed: 51 },
          { day: 'Thu', count: 71, completed: 68 },
          { day: 'Fri', count: 80, completed: 74 },
          { day: 'Sat', count: 45, completed: 40 },
          { day: 'Sun', count: 22, completed: 20 },
        ],
        queueDistribution: [
          { status: 'Completed', count: 184 },
          { status: 'In Consultation', count: 14 },
          { status: 'Waiting in Queue', count: 29 },
          { status: 'Upcoming', count: 45 },
        ],
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/users
exports.getUsers = async (req, res, next) => {
  try {
    const { role, search } = req.query;

    if (getIsMock()) {
      let userList = mockDb.users.map(u => {
        const { password, ...safe } = u;
        return safe;
      });

      if (role) {
        userList = userList.filter(u => u.role === role);
      }
      if (search) {
        const term = search.toLowerCase();
        userList = userList.filter(u =>
          u.name.toLowerCase().includes(term) ||
          u.email.toLowerCase().includes(term)
        );
      }

      return res.json({ success: true, count: userList.length, users: userList });
    }

    let query = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
      ];
    }

    const users = await User.find(query).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, users });
  } catch (err) {
    next(err);
  }
};

// PUT /api/admin/users/:id/status
exports.updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (getIsMock()) {
      const updated = mockDb.findByIdAndUpdate('users', id, { isActive });
      if (!updated) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      await logAudit({
        req,
        action: isActive ? 'ACTIVATE_USER_ACCOUNT' : 'SUSPEND_USER_ACCOUNT',
        entityType: 'User',
        entityId: id,
        metadata: { targetUser: updated.email, isActive },
      });

      const { password, ...safe } = updated;
      return res.json({ success: true, user: safe, message: `Account ${isActive ? 'activated' : 'suspended'}.` });
    }

    const updated = await User.findByIdAndUpdate(id, { isActive }, { new: true }).select('-password');
    if (!updated) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await logAudit({
      req,
      action: isActive ? 'ACTIVATE_USER_ACCOUNT' : 'SUSPEND_USER_ACCOUNT',
      entityType: 'User',
      entityId: id,
      metadata: { targetUser: updated.email, isActive },
    });

    res.json({ success: true, user: updated, message: `Account ${isActive ? 'activated' : 'suspended'}.` });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/hospitals/pending
exports.getPendingHospitals = async (req, res, next) => {
  try {
    if (getIsMock()) {
      const pending = mockDb.hospitals.filter(h => h.approvalStatus === 'pending');
      return res.json({ success: true, hospitals: pending });
    }

    const hospitals = await Hospital.find({ approvalStatus: 'pending' });
    res.json({ success: true, hospitals });
  } catch (err) {
    next(err);
  }
};

// PUT /api/admin/hospitals/:id/approve
exports.approveHospital = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status = 'approved' } = req.body;

    if (getIsMock()) {
      const updated = mockDb.findByIdAndUpdate('hospitals', id, { approvalStatus: status });
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Hospital not found' });
      }

      await logAudit({
        req,
        action: `HOSPITAL_REGISTRATION_${status.toUpperCase()}`,
        entityType: 'Hospital',
        entityId: id,
        metadata: { hospitalName: updated.name, status },
      });

      return res.json({ success: true, hospital: updated, message: `Hospital marked as ${status}.` });
    }

    const updated = await Hospital.findByIdAndUpdate(id, { approvalStatus: status }, { new: true });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Hospital not found' });
    }

    await logAudit({
      req,
      action: `HOSPITAL_REGISTRATION_${status.toUpperCase()}`,
      entityType: 'Hospital',
      entityId: id,
      metadata: { hospitalName: updated.name, status },
    });

    res.json({ success: true, hospital: updated, message: `Hospital marked as ${status}.` });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/doctors/pending
exports.getPendingDoctors = async (req, res, next) => {
  try {
    if (getIsMock()) {
      const pending = mockDb.doctors.filter(d => d.approvalStatus === 'pending');
      const enriched = pending.map(d => {
        const u = mockDb.findById('users', d.userId);
        const h = mockDb.findById('hospitals', d.hospitalId);
        return {
          ...d,
          name: u ? u.name : 'Dr. Candidate',
          email: u ? u.email : '',
          hospitalName: h ? h.name : 'SmartCare Network',
        };
      });
      return res.json({ success: true, doctors: enriched });
    }

    const doctors = await Doctor.find({ approvalStatus: 'pending' })
      .populate('userId', 'name email phone')
      .populate('hospitalId', 'name');

    res.json({ success: true, doctors });
  } catch (err) {
    next(err);
  }
};

// PUT /api/admin/doctors/:id/approve
exports.approveDoctor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status = 'approved' } = req.body;

    if (getIsMock()) {
      const updated = mockDb.findByIdAndUpdate('doctors', id, { approvalStatus: status });
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Doctor not found' });
      }

      await logAudit({
        req,
        action: `DOCTOR_CREDENTIALS_${status.toUpperCase()}`,
        entityType: 'Doctor',
        entityId: id,
        metadata: { licenseNumber: updated.licenseNumber, status },
      });

      return res.json({ success: true, doctor: updated, message: `Doctor credentials marked as ${status}.` });
    }

    const updated = await Doctor.findByIdAndUpdate(id, { approvalStatus: status }, { new: true });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    await logAudit({
      req,
      action: `DOCTOR_CREDENTIALS_${status.toUpperCase()}`,
      entityType: 'Doctor',
      entityId: id,
      metadata: { licenseNumber: updated.licenseNumber, status },
    });

    res.json({ success: true, doctor: updated, message: `Doctor credentials marked as ${status}.` });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/audit-logs
exports.getAuditLogs = async (req, res, next) => {
  try {
    if (getIsMock()) {
      return res.json({ success: true, logs: mockDb.auditLogs });
    }

    const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, logs });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/complaints
exports.getComplaints = async (req, res, next) => {
  try {
    res.json({ success: true, complaints: supportTickets });
  } catch (err) {
    next(err);
  }
};

// PUT /api/admin/complaints/:id
exports.updateComplaint = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const tkt = supportTickets.find(t => t._id === id);
    if (!tkt) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    tkt.status = status || 'resolved';
    res.json({ success: true, ticket: tkt, message: `Ticket status updated to ${tkt.status}.` });
  } catch (err) {
    next(err);
  }
};
