const bcrypt = require('bcryptjs');

class MockDatabase {
  constructor() {
    this.users = [];
    this.patients = [];
    this.doctors = [];
    this.hospitals = [];
    this.appointments = [];
    this.medicalRecords = [];
    this.notifications = [];
    this.auditLogs = [];
    this.isInitialized = false;
  }

  async init() {
    if (this.isInitialized) return;
    
    // Hash passwords
    const adminPass = await bcrypt.hash('admin123', 10);
    const patientPass = await bcrypt.hash('patient123', 10);
    const doctorPass = await bcrypt.hash('doctor123', 10);
    const hospitalPass = await bcrypt.hash('hospital123', 10);

    // 1. Users
    const uAdmin = {
      _id: 'usr_admin_1',
      name: 'Dr. Rajesh Mehta (Chief Admin)',
      email: 'admin@smartcare.org',
      password: adminPass,
      phone: '+91 98100 12345',
      role: 'admin',
      profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
      isActive: true,
      createdAt: new Date('2026-01-01T00:00:00Z'),
    };

    // Hospital Users
    const uHosp1 = {
      _id: 'usr_hosp_1',
      name: 'Apollo Central Hospital',
      email: 'apollo@smartcare.org',
      password: hospitalPass,
      phone: '+91 11 2692 5858',
      role: 'hospital',
      profileImage: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=200&q=80',
      isActive: true,
      createdAt: new Date('2026-01-02T00:00:00Z'),
    };
    const uHosp2 = {
      _id: 'usr_hosp_2',
      name: 'Max Super Specialty Hospital',
      email: 'max@smartcare.org',
      password: hospitalPass,
      phone: '+91 124 662 3000',
      role: 'hospital',
      profileImage: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=200&q=80',
      isActive: true,
      createdAt: new Date('2026-01-03T00:00:00Z'),
    };
    const uHosp3 = {
      _id: 'usr_hosp_3',
      name: 'Fortis Memorial Research Institute',
      email: 'fortis@smartcare.org',
      password: hospitalPass,
      phone: '+91 124 496 2200',
      role: 'hospital',
      profileImage: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=200&q=80',
      isActive: true,
      createdAt: new Date('2026-01-04T00:00:00Z'),
    };

    // Doctor Users
    const uDoc1 = {
      _id: 'usr_doc_1',
      name: 'Dr. Ananya Sen',
      email: 'dr.ananya.sen@smartcare.org',
      password: doctorPass,
      phone: '+91 98201 11223',
      role: 'doctor',
      profileImage: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=200&q=80',
      gender: 'female',
      bloodGroup: 'B+',
      isActive: true,
      createdAt: new Date('2026-01-05T00:00:00Z'),
    };
    const uDoc2 = {
      _id: 'usr_doc_2',
      name: 'Dr. Vikram Malhotra',
      email: 'dr.vikram.malhotra@smartcare.org',
      password: doctorPass,
      phone: '+91 98334 55667',
      role: 'doctor',
      profileImage: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=200&q=80',
      gender: 'male',
      bloodGroup: 'O+',
      isActive: true,
      createdAt: new Date('2026-01-06T00:00:00Z'),
    };
    const uDoc3 = {
      _id: 'usr_doc_3',
      name: 'Dr. Sneha Reddy',
      email: 'dr.sneha.reddy@smartcare.org',
      password: doctorPass,
      phone: '+91 98450 77889',
      role: 'doctor',
      profileImage: 'https://images.unsplash.com/photo-1594824813579-46747b0a79eb?auto=format&fit=crop&w=200&q=80',
      gender: 'female',
      bloodGroup: 'A+',
      isActive: true,
      createdAt: new Date('2026-01-07T00:00:00Z'),
    };

    // Patient Users
    const uPat1 = {
      _id: 'usr_pat_1',
      name: 'Rahul Sharma',
      email: 'rahul.sharma@example.com',
      password: patientPass,
      phone: '+91 99102 33445',
      role: 'patient',
      profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      dateOfBirth: '1992-05-14',
      gender: 'male',
      bloodGroup: 'O+',
      address: { street: 'B-402, Green Valley Apts', city: 'New Delhi', state: 'Delhi', pincode: '110016' },
      emergencyContact: { name: 'Sunita Sharma', relation: 'Spouse', phone: '+91 99102 33446' },
      allergies: ['Penicillin', 'Peanuts'],
      isActive: true,
      createdAt: new Date('2026-01-10T00:00:00Z'),
    };
    const uPat2 = {
      _id: 'usr_pat_2',
      name: 'Priya Patel',
      email: 'priya.patel@example.com',
      password: patientPass,
      phone: '+91 98765 43210',
      role: 'patient',
      profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
      dateOfBirth: '1995-11-22',
      gender: 'female',
      bloodGroup: 'B+',
      address: { street: '45 Lotus Enclave', city: 'Gurgaon', state: 'Haryana', pincode: '122002' },
      emergencyContact: { name: 'Kishore Patel', relation: 'Father', phone: '+91 98765 43211' },
      allergies: ['Sulfa drugs'],
      isActive: true,
      createdAt: new Date('2026-01-12T00:00:00Z'),
    };
    const uPat3 = {
      _id: 'usr_pat_3',
      name: 'Amit Verma',
      email: 'amit.verma@example.com',
      password: patientPass,
      phone: '+91 98112 77881',
      role: 'patient',
      profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
      dateOfBirth: '1988-08-03',
      gender: 'male',
      bloodGroup: 'A+',
      address: { street: 'Flat 12, Tower C, Stellar Park', city: 'Noida', state: 'Uttar Pradesh', pincode: '201301' },
      emergencyContact: { name: 'Neha Verma', relation: 'Sister', phone: '+91 98112 77882' },
      allergies: ['Aspirin'],
      isActive: true,
      createdAt: new Date('2026-01-15T00:00:00Z'),
    };

    this.users = [uAdmin, uHosp1, uHosp2, uHosp3, uDoc1, uDoc2, uDoc3, uPat1, uPat2, uPat3];

    // 2. Hospitals
    this.hospitals = [
      {
        _id: 'hosp_1',
        userId: 'usr_hosp_1',
        name: 'Apollo Central Hospital',
        registrationNumber: 'HOSP-DEL-2018-091',
        email: 'apollo@smartcare.org',
        phone: '+91 11 2692 5858',
        address: 'Sarita Vihar, Delhi Mathura Road',
        city: 'New Delhi',
        state: 'Delhi',
        pincode: '110076',
        latitude: 28.5355,
        longitude: 77.2910,
        departments: ['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Oncology', 'Emergency Care'],
        facilities: ['24/7 Emergency', 'Modular OTs', 'Cath Lab', 'Advanced MRI/CT', 'ICU & NICU', 'Blood Bank', 'Helipad'],
        operatingHours: '24/7 Emergency | OPD: 8:00 AM - 8:00 PM',
        logo: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=400&q=80',
        rating: 4.9,
        totalBeds: 500,
        icuBedsAvailable: 28,
        approvalStatus: 'approved',
        createdAt: new Date('2026-01-02T00:00:00Z'),
      },
      {
        _id: 'hosp_2',
        userId: 'usr_hosp_2',
        name: 'Max Super Specialty Hospital',
        registrationNumber: 'HOSP-HAR-2019-142',
        email: 'max@smartcare.org',
        phone: '+91 124 662 3000',
        address: 'B-Block, Sushant Lok 1',
        city: 'Gurgaon',
        state: 'Haryana',
        pincode: '122001',
        latitude: 28.4682,
        longitude: 77.0805,
        departments: ['Cardiology', 'Neurology', 'Gastroenterology', 'General Surgery', 'Pulmonology'],
        facilities: ['Level-1 Trauma Center', 'Robotic Surgery', 'Dialysis Center', 'PET-CT Scan', 'Pharmacy 24/7'],
        operatingHours: '24/7 Emergency | OPD: 8:30 AM - 7:30 PM',
        logo: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=400&q=80',
        rating: 4.8,
        totalBeds: 350,
        icuBedsAvailable: 15,
        approvalStatus: 'approved',
        createdAt: new Date('2026-01-03T00:00:00Z'),
      },
      {
        _id: 'hosp_3',
        userId: 'usr_hosp_3',
        name: 'Fortis Memorial Research Institute',
        registrationNumber: 'HOSP-UP-2021-308',
        email: 'fortis@smartcare.org',
        phone: '+91 124 496 2200',
        address: 'Sector 62, Institutional Area',
        city: 'Noida',
        state: 'Uttar Pradesh',
        pincode: '201309',
        latitude: 28.6280,
        longitude: 77.3649,
        departments: ['Pediatrics', 'Cardiology', 'Dermatology', 'Obstetrics & Gynecology', 'ENT'],
        facilities: ['Dedicated Pediatric ICU', 'Comprehensive Cancer Center', 'Stem Cell Lab', 'Ambulance GPS Fleet'],
        operatingHours: '24/7 Emergency | OPD: 9:00 AM - 6:00 PM',
        logo: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=400&q=80',
        rating: 4.7,
        totalBeds: 400,
        icuBedsAvailable: 22,
        approvalStatus: 'approved',
        createdAt: new Date('2026-01-04T00:00:00Z'),
      },
    ];

    // 3. Doctors
    this.doctors = [
      {
        _id: 'doc_1',
        userId: 'usr_doc_1',
        hospitalId: 'hosp_1',
        specialization: 'Cardiology',
        qualifications: ['MBBS', 'MD (Medicine)', 'DM (Cardiology)', 'FACC (USA)'],
        experience: 14,
        consultationFee: 800,
        licenseNumber: 'MCI-DEL-2012-45892',
        bio: 'Senior Consultant Interventional Cardiologist with extensive experience in coronary interventions, hypertension management, and heart failure therapies.',
        rating: 4.9,
        reviewCount: 142,
        availableSlots: [
          { day: 'Monday', startTime: '09:00', endTime: '13:00', slotDurationMinutes: 20, maxPatients: 12 },
          { day: 'Wednesday', startTime: '09:00', endTime: '13:00', slotDurationMinutes: 20, maxPatients: 12 },
          { day: 'Friday', startTime: '14:00', endTime: '18:00', slotDurationMinutes: 20, maxPatients: 12 },
        ],
        approvalStatus: 'approved',
        createdAt: new Date('2026-01-05T00:00:00Z'),
      },
      {
        _id: 'doc_2',
        userId: 'usr_doc_2',
        hospitalId: 'hosp_2',
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
        createdAt: new Date('2026-01-06T00:00:00Z'),
      },
      {
        _id: 'doc_3',
        userId: 'usr_doc_3',
        hospitalId: 'hosp_3',
        specialization: 'Pediatrics',
        qualifications: ['MBBS', 'DCH', 'DNB (Pediatrics)'],
        experience: 9,
        consultationFee: 600,
        licenseNumber: 'MCI-UP-2017-78119',
        bio: 'Compassionate Pediatrician & Neonatologist dedicated to pediatric immunization, growth & nutrition assessment, and adolescent care.',
        rating: 4.9,
        reviewCount: 215,
        availableSlots: [
          { day: 'Monday', startTime: '11:00', endTime: '16:00', slotDurationMinutes: 20, maxPatients: 15 },
          { day: 'Tuesday', startTime: '11:00', endTime: '16:00', slotDurationMinutes: 20, maxPatients: 15 },
          { day: 'Friday', startTime: '10:00', endTime: '15:00', slotDurationMinutes: 20, maxPatients: 15 },
        ],
        approvalStatus: 'approved',
        createdAt: new Date('2026-01-07T00:00:00Z'),
      },
    ];

    // 4. Patients
    this.patients = [
      {
        _id: 'pat_1',
        userId: 'usr_pat_1',
        smartCardId: 'SCN-2026-104582',
        medicalSummary: 'Essential mild hypertension under ACE inhibitor therapy. Regular bi-annual cardiological evaluation. Active runner.',
        insuranceDetails: {
          provider: 'Star Health Premier Health Care',
          policyNumber: 'SHP-2026-904128',
          coverageAmount: 1000000,
        },
        cardStatus: 'active',
        qrCodeValue: 'SMARTCARE://SCN-2026-104582/RAHUL-SHARMA/O-POS',
        createdAt: new Date('2026-01-10T00:00:00Z'),
      },
      {
        _id: 'pat_2',
        userId: 'usr_pat_2',
        smartCardId: 'SCN-2026-209841',
        medicalSummary: 'Migraine with aura episodes triggerable by stress. Thyroid profile within target limits on low dose levothyroxine.',
        insuranceDetails: {
          provider: 'HDFC ERGO Optima Secure',
          policyNumber: 'HE-OS-2025-44129',
          coverageAmount: 1500000,
        },
        cardStatus: 'active',
        qrCodeValue: 'SMARTCARE://SCN-2026-209841/PRIYA-PATEL/B-POS',
        createdAt: new Date('2026-01-12T00:00:00Z'),
      },
      {
        _id: 'pat_3',
        userId: 'usr_pat_3',
        smartCardId: 'SCN-2026-384712',
        medicalSummary: 'No chronic cardiovascular or pulmonary pathology. Mild seasonal allergic rhinitis in autumn.',
        insuranceDetails: {
          provider: 'Max Bupa Health Companion',
          policyNumber: 'MB-HC-2024-81109',
          coverageAmount: 750000,
        },
        cardStatus: 'active',
        qrCodeValue: 'SMARTCARE://SCN-2026-384712/AMIT-VERMA/A-POS',
        createdAt: new Date('2026-01-15T00:00:00Z'),
      },
    ];

    // Today's date string YYYY-MM-DD
    const today = new Date().toISOString().split('T')[0];

    // 5. Appointments
    this.appointments = [
      {
        _id: 'apt_1',
        patientId: 'pat_1',
        userId: 'usr_pat_1',
        doctorId: 'doc_1',
        hospitalId: 'hosp_1',
        department: 'Cardiology',
        appointmentDate: today,
        appointmentTime: '10:00 AM',
        appointmentNumber: 'APT-2026-1001',
        reason: 'Quarterly cardiovascular review and blood pressure checkup',
        status: 'in_consultation',
        queuePosition: 1,
        estimatedWaitTime: 0,
        checkedInAt: new Date(Date.now() - 45 * 60000),
        notes: 'Patient reports mild exertion fatigue last week',
        createdAt: new Date('2026-02-01T00:00:00Z'),
      },
      {
        _id: 'apt_2',
        patientId: 'pat_2',
        userId: 'usr_pat_2',
        doctorId: 'doc_1',
        hospitalId: 'hosp_1',
        department: 'Cardiology',
        appointmentDate: today,
        appointmentTime: '10:30 AM',
        appointmentNumber: 'APT-2026-1002',
        reason: 'Palpitations during workout and routine ECG',
        status: 'waiting',
        queuePosition: 2,
        estimatedWaitTime: 15,
        checkedInAt: new Date(Date.now() - 20 * 60000),
        notes: 'Checked in via Smart Card terminal',
        createdAt: new Date('2026-02-02T00:00:00Z'),
      },
      {
        _id: 'apt_3',
        patientId: 'pat_3',
        userId: 'usr_pat_3',
        doctorId: 'doc_2',
        hospitalId: 'hosp_2',
        department: 'Neurology',
        appointmentDate: today,
        appointmentTime: '11:00 AM',
        appointmentNumber: 'APT-2026-1003',
        reason: 'Persistent tension headaches and neck stiffness',
        status: 'checked_in',
        queuePosition: 3,
        estimatedWaitTime: 35,
        checkedInAt: new Date(Date.now() - 10 * 60000),
        notes: 'Waiting in Sector 2 Lounge',
        createdAt: new Date('2026-02-03T00:00:00Z'),
      },
      {
        _id: 'apt_4',
        patientId: 'pat_1',
        userId: 'usr_pat_1',
        doctorId: 'doc_2',
        hospitalId: 'hosp_2',
        department: 'Neurology',
        appointmentDate: '2026-02-15',
        appointmentTime: '11:30 AM',
        appointmentNumber: 'APT-2026-0921',
        reason: 'Migraine follow-up and EEG discussion',
        status: 'completed',
        queuePosition: 0,
        estimatedWaitTime: 0,
        checkedInAt: new Date('2026-02-15T11:15:00Z'),
        notes: 'Completed successfully. Medication adjusted.',
        createdAt: new Date('2026-02-10T00:00:00Z'),
      },
      {
        _id: 'apt_5',
        patientId: 'pat_2',
        userId: 'usr_pat_2',
        doctorId: 'doc_3',
        hospitalId: 'hosp_3',
        department: 'Pediatrics',
        appointmentDate: '2026-03-20',
        appointmentTime: '02:00 PM',
        appointmentNumber: 'APT-2026-1088',
        reason: 'Child immunization booster consultation',
        status: 'confirmed',
        queuePosition: 0,
        estimatedWaitTime: 0,
        notes: 'Upcoming visit scheduled',
        createdAt: new Date('2026-02-20T00:00:00Z'),
      },
    ];

    // 6. Medical Records
    this.medicalRecords = [
      {
        _id: 'rec_1',
        patientId: 'pat_1',
        userId: 'usr_pat_1',
        doctorId: 'doc_1',
        hospitalId: 'hosp_1',
        appointmentId: 'apt_1',
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
        attachments: [
          { title: 'ECG Strip Scan', fileUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80', fileType: 'image/jpeg', uploadDate: new Date('2026-01-20T11:15:00Z') }
        ],
        notes: 'Advised daily 30-minute brisk walk and sodium intake below 2g/day. Return in 4 weeks for BP review.',
        followUpDate: '2026-03-25',
        consentStatus: 'granted',
        accessType: 'normal',
        createdAt: new Date('2026-01-20T12:30:00Z'),
      },
      {
        _id: 'rec_2',
        patientId: 'pat_2',
        userId: 'usr_pat_2',
        doctorId: 'doc_2',
        hospitalId: 'hosp_2',
        appointmentId: 'apt_4',
        consultationDate: new Date('2026-02-15T11:45:00Z'),
        symptoms: ['Throbbing unilateral headache', 'Photophobia', 'Visual aura prior to attack'],
        diagnosis: 'Episodic Migraine without intractable status',
        allergies: ['Sulfa drugs'],
        vitals: {
          bloodPressure: '118/74 mmHg',
          heartRate: 70,
          temperature: '98.6 °F',
          weight: 58,
          oxygenLevel: 99,
        },
        prescription: [
          { medication: 'Rizatriptan', dosage: '10mg', frequency: 'As needed at aura onset', duration: '5 doses', notes: 'Do not exceed 20mg in 24 hours' },
          { medication: 'Propranolol LA', dosage: '40mg', frequency: 'Once daily at bedtime', duration: '60 days', notes: 'Migraine prophylaxis' },
        ],
        labReports: [
          { testName: 'Brain MRI (3-Tesla Non-Contrast)', result: 'Normal cerebral parenchyma, no acute intracranial pathology', normalRange: 'Normal', status: 'Completed', fileUrl: 'https://smartcare.org/reports/mri_priya.pdf', date: new Date('2026-02-15T10:00:00Z') },
        ],
        attachments: [],
        notes: 'Hydration and sleep hygiene counseling provided. Maintain headache diary with trigger tracking.',
        followUpDate: '2026-04-15',
        consentStatus: 'granted',
        accessType: 'normal',
        createdAt: new Date('2026-02-15T12:00:00Z'),
      },
    ];

    // 7. Notifications
    this.notifications = [
      {
        _id: 'notif_1',
        userId: 'usr_pat_1',
        title: 'Appointment In Progress',
        message: 'Dr. Ananya Sen is currently reviewing your medical profile in Consultation Room 4.',
        type: 'appointment',
        isRead: false,
        relatedEntityId: 'apt_1',
        createdAt: new Date(Date.now() - 15 * 60000),
      },
      {
        _id: 'notif_2',
        userId: 'usr_pat_1',
        title: 'Queue Position Update',
        message: 'You have been checked in successfully! Your initial queue position is #1.',
        type: 'queue',
        isRead: true,
        relatedEntityId: 'apt_1',
        createdAt: new Date(Date.now() - 45 * 60000),
      },
      {
        _id: 'notif_3',
        userId: 'usr_doc_1',
        title: 'New Patient in Queue',
        message: 'Patient Priya Patel (SCN-2026-209841) has checked in and is waiting at Queue #2.',
        type: 'queue',
        isRead: false,
        relatedEntityId: 'apt_2',
        createdAt: new Date(Date.now() - 20 * 60000),
      },
      {
        _id: 'notif_4',
        userId: 'usr_admin_1',
        title: 'Registration Approved',
        message: 'Fortis Memorial Research Institute was successfully verified and approved on the platform.',
        type: 'approval',
        isRead: true,
        relatedEntityId: 'hosp_3',
        createdAt: new Date('2026-01-04T12:00:00Z'),
      },
    ];

    // 8. Audit Logs
    this.auditLogs = [
      {
        _id: 'log_1',
        userId: 'usr_doc_1',
        userName: 'Dr. Ananya Sen',
        userRole: 'doctor',
        action: 'ACCESS_PATIENT_MEDICAL_RECORD',
        entityType: 'MedicalRecord',
        entityId: 'rec_1',
        ipAddress: '192.168.1.42',
        metadata: { patientSmartCardId: 'SCN-2026-104582', patientName: 'Rahul Sharma', reason: 'Active Appointment' },
        createdAt: new Date(Date.now() - 40 * 60000),
      },
      {
        _id: 'log_2',
        userId: 'usr_pat_1',
        userName: 'Rahul Sharma',
        userRole: 'patient',
        action: 'PATIENT_CHECK_IN',
        entityType: 'Appointment',
        entityId: 'apt_1',
        ipAddress: '106.210.88.19',
        metadata: { appointmentNumber: 'APT-2026-1001', hospital: 'Apollo Central Hospital' },
        createdAt: new Date(Date.now() - 45 * 60000),
      },
      {
        _id: 'log_3',
        userId: 'usr_admin_1',
        userName: 'Dr. Rajesh Mehta',
        userRole: 'admin',
        action: 'APPROVE_DOCTOR_LICENSE',
        entityType: 'Doctor',
        entityId: 'doc_1',
        ipAddress: '127.0.0.1',
        metadata: { doctorName: 'Dr. Ananya Sen', licenseNumber: 'MCI-DEL-2012-45892' },
        createdAt: new Date('2026-01-05T14:30:00Z'),
      },
    ];

    this.isInitialized = true;
    console.log('[MockDB] Memory store pre-loaded with rich realistic demo data.');
  }

  // Generic helpers
  find(collection, query = {}) {
    return this[collection].filter(item => {
      return Object.keys(query).every(key => {
        if (typeof query[key] === 'object' && query[key] !== null) {
          if (query[key].$regex) {
            const regex = new RegExp(query[key].$regex, query[key].$options || '');
            return regex.test(item[key]);
          }
        }
        return item[key] == query[key];
      });
    });
  }

  findOne(collection, query = {}) {
    const results = this.find(collection, query);
    return results[0] || null;
  }

  findById(collection, id) {
    return this[collection].find(item => item._id === id || String(item._id) === String(id)) || null;
  }

  create(collection, data) {
    const newItem = {
      _id: `${collection.slice(0, 3)}_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...data,
    };
    this[collection].unshift(newItem);
    return newItem;
  }

  findByIdAndUpdate(collection, id, updates) {
    const index = this[collection].findIndex(item => item._id === id || String(item._id) === String(id));
    if (index === -1) return null;
    this[collection][index] = {
      ...this[collection][index],
      ...updates,
      updatedAt: new Date(),
    };
    return this[collection][index];
  }

  findByIdAndDelete(collection, id) {
    const index = this[collection].findIndex(item => item._id === id || String(item._id) === String(id));
    if (index === -1) return null;
    const deleted = this[collection].splice(index, 1);
    return deleted[0];
  }
}

const mockDb = new MockDatabase();
mockDb.init();

module.exports = mockDb;
