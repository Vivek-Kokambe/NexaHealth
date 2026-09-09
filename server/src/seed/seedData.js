require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Hospital = require('../models/Hospital');
const Appointment = require('../models/Appointment');
const MedicalRecord = require('../models/MedicalRecord');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smartcare_health_network';
    console.log(`Connecting to MongoDB at ${mongoUri}...`);
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected for seeding.');

    // Clear existing data
    await User.deleteMany({});
    await Patient.deleteMany({});
    await Doctor.deleteMany({});
    await Hospital.deleteMany({});
    await Appointment.deleteMany({});
    await MedicalRecord.deleteMany({});
    await Notification.deleteMany({});
    await AuditLog.deleteMany({});

    console.log('Cleared existing collections.');

    // 1. Create Admin
    const adminUser = await User.create({
      name: 'Dr. Rajesh Mehta (Chief Admin)',
      email: 'admin@smartcare.org',
      password: 'admin123',
      phone: '+91 98100 12345',
      role: 'admin',
      profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
      isActive: true,
    });

    // 2. Create Hospitals & Hospital Users
    const hospUser1 = await User.create({
      name: 'Apollo Central Hospital',
      email: 'apollo@smartcare.org',
      password: 'hospital123',
      phone: '+91 22 2692 5858',
      role: 'hospital',
      profileImage: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=200&q=80',
    });
    const hosp1 = await Hospital.create({
      userId: hospUser1._id,
      name: 'Apollo Central Hospital',
      registrationNumber: 'HOSP-MUM-2018-091',
      email: 'apollo@smartcare.org',
      phone: '+91 22 2692 5858',
      address: 'Andheri East, Western Express Highway',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400069',
      latitude: 19.1197,
      longitude: 72.8468,
      departments: ['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Oncology', 'Emergency Care'],
      facilities: ['24/7 Emergency', 'Modular OTs', 'Cath Lab', 'Advanced MRI/CT', 'ICU & NICU', 'Blood Bank', 'Helipad'],
      operatingHours: '24/7 Emergency | OPD: 8:00 AM - 8:00 PM',
      logo: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=400&q=80',
      rating: 4.9,
      totalBeds: 500,
      icuBedsAvailable: 28,
      approvalStatus: 'approved',
    });

    const hospUser2 = await User.create({
      name: 'Max Super Specialty Hospital',
      email: 'max@smartcare.org',
      password: 'hospital123',
      phone: '+91 22 6623 0000',
      role: 'hospital',
      profileImage: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=200&q=80',
    });
    const hosp2 = await Hospital.create({
      userId: hospUser2._id,
      name: 'Max Super Specialty Hospital',
      registrationNumber: 'HOSP-NM-2019-142',
      email: 'max@smartcare.org',
      phone: '+91 22 6623 0000',
      address: 'Sector 17, Vashi',
      city: 'Navi Mumbai',
      state: 'Maharashtra',
      pincode: '400703',
      latitude: 19.0760,
      longitude: 73.0007,
      departments: ['Cardiology', 'Neurology', 'Gastroenterology', 'General Surgery', 'Pulmonology'],
      facilities: ['Level-1 Trauma Center', 'Robotic Surgery', 'Dialysis Center', 'PET-CT Scan', 'Pharmacy 24/7'],
      operatingHours: '24/7 Emergency | OPD: 8:30 AM - 7:30 PM',
      logo: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=400&q=80',
      rating: 4.8,
      totalBeds: 350,
      icuBedsAvailable: 15,
      approvalStatus: 'approved',
    });

    const hospUser3 = await User.create({
      name: 'Fortis Memorial Research Institute',
      email: 'fortis@smartcare.org',
      password: 'hospital123',
      phone: '+91 22 4962 2000',
      role: 'hospital',
      profileImage: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=200&q=80',
    });
    const hosp3 = await Hospital.create({
      userId: hospUser3._id,
      name: 'Fortis Memorial Research Institute',
      registrationNumber: 'HOSP-MUM-2021-308',
      email: 'fortis@smartcare.org',
      phone: '+91 22 4962 2000',
      address: 'Mulund West, LBS Marg',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400080',
      latitude: 19.1726,
      longitude: 72.9565,
      departments: ['Pediatrics', 'Cardiology', 'Dermatology', 'Obstetrics & Gynecology', 'ENT'],
      facilities: ['Dedicated Pediatric ICU', 'Comprehensive Cancer Center', 'Stem Cell Lab', 'Ambulance GPS Fleet'],
      operatingHours: '24/7 Emergency | OPD: 9:00 AM - 6:00 PM',
      logo: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=400&q=80',
      rating: 4.7,
      totalBeds: 400,
      icuBedsAvailable: 22,
      approvalStatus: 'approved',
    });

    // 3. Create Doctors & Doctor Users
    const docUser1 = await User.create({
      name: 'Dr. Ananya Sen',
      email: 'dr.ananya.sen@smartcare.org',
      password: 'doctor123',
      phone: '+91 98201 11223',
      role: 'doctor',
      gender: 'female',
      bloodGroup: 'B+',
      profileImage: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=200&q=80',
    });
    const doc1 = await Doctor.create({
      userId: docUser1._id,
      hospitalId: hosp1._id,
      specialization: 'Cardiology',
      qualifications: ['MBBS', 'MD (Medicine)', 'DM (Cardiology)', 'FACC (USA)'],
      experience: 14,
      consultationFee: 800,
      licenseNumber: 'MCI-DEL-2012-45892',
      bio: 'Senior Consultant Interventional Cardiologist with extensive experience in coronary interventions and heart failure therapies.',
      rating: 4.9,
      reviewCount: 142,
      availableSlots: [
        { day: 'Monday', startTime: '09:00', endTime: '13:00', slotDurationMinutes: 20, maxPatients: 12 },
        { day: 'Wednesday', startTime: '09:00', endTime: '13:00', slotDurationMinutes: 20, maxPatients: 12 },
        { day: 'Friday', startTime: '14:00', endTime: '18:00', slotDurationMinutes: 20, maxPatients: 12 },
      ],
      approvalStatus: 'approved',
    });

    const docUser2 = await User.create({
      name: 'Dr. Vikram Malhotra',
      email: 'dr.vikram.malhotra@smartcare.org',
      password: 'doctor123',
      phone: '+91 98334 55667',
      role: 'doctor',
      gender: 'male',
      bloodGroup: 'O+',
      profileImage: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=200&q=80',
    });
    const doc2 = await Doctor.create({
      userId: docUser2._id,
      hospitalId: hosp2._id,
      specialization: 'Neurology',
      qualifications: ['MBBS', 'MD (Gen Med)', 'DM (Neurology)', 'Fellow Stroke & Neurocritical Care'],
      experience: 16,
      consultationFee: 1000,
      licenseNumber: 'MCI-HAR-2010-33291',
      bio: 'Chief of Neurosciences specializing in stroke prevention, epilepsy, neuro-muscular disorders, and neuro-rehabilitation.',
      rating: 4.8,
      reviewCount: 98,
      availableSlots: [
        { day: 'Tuesday', startTime: '10:00', endTime: '14:00', slotDurationMinutes: 25, maxPatients: 10 },
        { day: 'Thursday', startTime: '10:00', endTime: '14:00', slotDurationMinutes: 25, maxPatients: 10 },
        { day: 'Saturday', startTime: '09:00', endTime: '12:30', slotDurationMinutes: 25, maxPatients: 8 },
      ],
      approvalStatus: 'approved',
    });

    const docUser3 = await User.create({
      name: 'Dr. Sneha Reddy',
      email: 'dr.sneha.reddy@smartcare.org',
      password: 'doctor123',
      phone: '+91 98450 77889',
      role: 'doctor',
      gender: 'female',
      bloodGroup: 'A+',
      profileImage: 'https://images.unsplash.com/photo-1594824813579-46747b0a79eb?auto=format&fit=crop&w=200&q=80',
    });
    const doc3 = await Doctor.create({
      userId: docUser3._id,
      hospitalId: hosp3._id,
      specialization: 'Pediatrics',
      qualifications: ['MBBS', 'DCH', 'DNB (Pediatrics)'],
      experience: 9,
      consultationFee: 600,
      licenseNumber: 'MCI-UP-2017-78119',
      bio: 'Compassionate Pediatrician & Neonatologist dedicated to pediatric immunization and adolescent care.',
      rating: 4.9,
      reviewCount: 215,
      availableSlots: [
        { day: 'Monday', startTime: '11:00', endTime: '16:00', slotDurationMinutes: 20, maxPatients: 15 },
        { day: 'Tuesday', startTime: '11:00', endTime: '16:00', slotDurationMinutes: 20, maxPatients: 15 },
        { day: 'Friday', startTime: '10:00', endTime: '15:00', slotDurationMinutes: 20, maxPatients: 15 },
      ],
      approvalStatus: 'approved',
    });

    // 4. Create Patients & Patient Users
    const patUser1 = await User.create({
      name: 'Vivek Kokambe',
      email: 'vivek.kokambe@example.com',
      password: 'patient123',
      phone: '+91 99754 12406',
      role: 'patient',
      gender: 'male',
      bloodGroup: 'A+',
      dateOfBirth: new Date('2005-04-12'),
      profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      address: {street: 'Panvel', city: 'Navi Mumbai', state: 'Maharashtra', pincode: '410207'},
      emergencyContact: {name: 'Ramesh Kokambe', relation: 'Father', phone: '+91 99754 12407'},
      allergies: ['Penicillin', 'Peanuts'],
    });
    const pat1 = await Patient.create({
      userId: patUser1._id,
      smartCardId: 'SCN-2026-104582',
      medicalSummary: 'Essential mild hypertension under ACE inhibitor therapy. Regular bi-annual cardiological evaluation. Active runner.',
      insuranceDetails: { provider: 'Star Health Premier Health Care', policyNumber: 'SHP-2026-904128', coverageAmount: 1000000 },
      cardStatus: 'active',
      qrCodeValue: 'SMARTCARE://SCN-2026-104582/VIVEK-KOKAMBE/A-POS',
    });

    const patUser2 = await User.create({
      name: 'Priya Patel',
      email: 'priya.patel@example.com',
      password: 'patient123',
      phone: '+91 98765 43210',
      role: 'patient',
      gender: 'female',
      bloodGroup: 'B+',
      dateOfBirth: new Date('1995-11-22'),
      profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
      address: { street: '45 Lotus Enclave', city: 'Gurgaon', state: 'Haryana', pincode: '122002' },
      emergencyContact: { name: 'Kishore Patel', relation: 'Father', phone: '+91 98765 43211' },
      allergies: ['Sulfa drugs'],
    });
    const pat2 = await Patient.create({
      userId: patUser2._id,
      smartCardId: 'SCN-2026-209841',
      medicalSummary: 'Migraine with aura episodes triggerable by stress. Thyroid profile within target limits on low dose levothyroxine.',
      insuranceDetails: { provider: 'HDFC ERGO Optima Secure', policyNumber: 'HE-OS-2025-44129', coverageAmount: 1500000 },
      cardStatus: 'active',
      qrCodeValue: 'SMARTCARE://SCN-2026-209841/PRIYA-PATEL/B-POS',
    });

    const patUser3 = await User.create({
      name: 'Amit Verma',
      email: 'amit.verma@example.com',
      password: 'patient123',
      phone: '+91 98112 77881',
      role: 'patient',
      gender: 'male',
      bloodGroup: 'A+',
      dateOfBirth: new Date('1988-08-03'),
      profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
      address: { street: 'Flat 12, Tower C, Stellar Park', city: 'Noida', state: 'Uttar Pradesh', pincode: '201301' },
      emergencyContact: { name: 'Neha Verma', relation: 'Sister', phone: '+91 98112 77882' },
      allergies: ['Aspirin'],
    });
    const pat3 = await Patient.create({
      userId: patUser3._id,
      smartCardId: 'SCN-2026-384712',
      medicalSummary: 'No chronic cardiovascular or pulmonary pathology. Mild seasonal allergic rhinitis in autumn.',
      insuranceDetails: { provider: 'Max Bupa Health Companion', policyNumber: 'MB-HC-2024-81109', coverageAmount: 750000 },
      cardStatus: 'active',
      qrCodeValue: 'SMARTCARE://SCN-2026-384712/AMIT-VERMA/A-POS',
    });

    const todayStr = new Date().toISOString().split('T')[0];

    // 5. Appointments
    const apt1 = await Appointment.create({
      patientId: pat1._id,
      userId: patUser1._id,
      doctorId: doc1._id,
      hospitalId: hosp1._id,
      department: 'Cardiology',
      appointmentDate: todayStr,
      appointmentTime: '10:00 AM',
      appointmentNumber: 'APT-2026-1001',
      reason: 'Quarterly cardiovascular review and blood pressure checkup',
      status: 'in_consultation',
      queuePosition: 1,
      estimatedWaitTime: 0,
      checkedInAt: new Date(Date.now() - 45 * 60000),
    });

    const apt2 = await Appointment.create({
      patientId: pat2._id,
      userId: patUser2._id,
      doctorId: doc1._id,
      hospitalId: hosp1._id,
      department: 'Cardiology',
      appointmentDate: todayStr,
      appointmentTime: '10:30 AM',
      appointmentNumber: 'APT-2026-1002',
      reason: 'Palpitations during workout and routine ECG',
      status: 'waiting',
      queuePosition: 2,
      estimatedWaitTime: 15,
      checkedInAt: new Date(Date.now() - 20 * 60000),
    });

    const apt3 = await Appointment.create({
      patientId: pat3._id,
      userId: patUser3._id,
      doctorId: doc2._id,
      hospitalId: hosp2._id,
      department: 'Neurology',
      appointmentDate: todayStr,
      appointmentTime: '11:00 AM',
      appointmentNumber: 'APT-2026-1003',
      reason: 'Persistent tension headaches and neck stiffness',
      status: 'checked_in',
      queuePosition: 3,
      estimatedWaitTime: 35,
      checkedInAt: new Date(Date.now() - 10 * 60000),
    });

    // 6. Medical Records
    await MedicalRecord.create({
      patientId: pat1._id,
      userId: patUser1._id,
      doctorId: doc1._id,
      hospitalId: hosp1._id,
      appointmentId: apt1._id,
      consultationDate: new Date('2026-01-20T10:30:00Z'),
      symptoms: ['Mild dizziness', 'Occasional morning headache', 'Exertion dyspnea'],
      diagnosis: 'Stage 1 Primary Hypertension with Sinus Rhythm',
      allergies: ['Penicillin', 'Peanuts'],
      vitals: {
        bloodPressure: '138/88 mmHg',
        heartRate: 76,
        temperature: '98.4 °F',
        weight: 74,
        oxygenLevel: 98,
      },
      prescription: [
        { medication: 'Telmisartan', dosage: '40mg', frequency: 'Once daily (morning)', duration: '30 days', notes: 'Maintain salt restriction' },
        { medication: 'Atorvastatin', dosage: '10mg', frequency: 'Once daily (bedtime)', duration: '30 days', notes: 'Lipid control' },
      ],
      labReports: [
        { testName: 'Lipid Profile & Serum Electrolytes', result: 'Cholesterol: 185 mg/dL, HDL: 48 mg/dL, LDL: 110 mg/dL', normalRange: 'LDL < 100 mg/dL', status: 'Completed', fileUrl: 'https://smartcare.org/reports/lipid_rahul.pdf', date: new Date('2026-01-20T12:00:00Z') },
        { testName: '12-Lead Resting Electrocardiogram (ECG)', result: 'Normal Sinus Rhythm, No ST-T segment elevation', normalRange: 'Normal', status: 'Completed', fileUrl: 'https://smartcare.org/reports/ecg_rahul.pdf', date: new Date('2026-01-20T11:00:00Z') },
      ],
      notes: 'Advised daily 30-minute brisk walk and sodium intake below 2g/day. Return in 4 weeks for BP review.',
      followUpDate: '2026-03-25',
      consentStatus: 'granted',
      accessType: 'normal',
    });

    // 7. Notifications
    await Notification.create({
      userId: patUser1._id,
      title: 'Appointment In Progress',
      message: 'Dr. Ananya Sen is currently reviewing your medical profile in Consultation Room 4.',
      type: 'appointment',
      isRead: false,
      relatedEntityId: String(apt1._id),
    });

    // 8. Audit Log
    await AuditLog.create({
      userId: docUser1._id,
      userName: 'Dr. Ananya Sen',
      userRole: 'doctor',
      action: 'ACCESS_PATIENT_MEDICAL_RECORD',
      entityType: 'MedicalRecord',
      entityId: String(apt1._id),
      metadata: { patientSmartCardId: 'SCN-2026-104582', patientName: 'Vivek Kokambe' },
    });

    console.log('Database seeded successfully with demo accounts and clinical history!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seedData();
