const hospitals = [
  {
    _id: 'demo-hospital-apollo',
    name: 'Apollo Central Hospital',
    registrationNumber: 'HOSP-MUM-2018-091',
    email: 'apollo@smartcare.org',
    phone: '+91 22 2692 5858',
    address: 'Andheri East, Western Express Highway',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400069',
    departments: ['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Oncology', 'Emergency Care'],
    facilities: ['24/7 Emergency', 'Modular OTs', 'Cath Lab', 'Advanced MRI/CT', 'ICU & NICU', 'Blood Bank', 'Helipad'],
    operatingHours: '24/7 Emergency | OPD: 8:00 AM - 8:00 PM',
    logo: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=800&q=80',
    rating: 4.9,
    totalBeds: 500,
    icuBedsAvailable: 28,
  },
  {
    _id: 'demo-hospital-max',
    name: 'Max Super Specialty Hospital',
    registrationNumber: 'HOSP-NM-2019-142',
    email: 'max@smartcare.org',
    phone: '+91 22 6623 0000',
    address: 'Sector 17, Vashi',
    city: 'Navi Mumbai',
    state: 'Maharashtra',
    pincode: '400703',
    departments: ['Cardiology', 'Neurology', 'Gastroenterology', 'General Surgery', 'Pulmonology'],
    facilities: ['Level-1 Trauma Center', 'Robotic Surgery', 'Dialysis Center', 'PET-CT Scan', 'Pharmacy 24/7'],
    operatingHours: '24/7 Emergency | OPD: 8:30 AM - 7:30 PM',
    logo: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80',
    rating: 4.8,
    totalBeds: 350,
    icuBedsAvailable: 15,
  },
  {
    _id: 'demo-hospital-fortis',
    name: 'Fortis Memorial Research Institute',
    registrationNumber: 'HOSP-MUM-2021-308',
    email: 'fortis@smartcare.org',
    phone: '+91 22 4962 2000',
    address: 'Mulund West, LBS Marg',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400080',
    departments: ['Pediatrics', 'Cardiology', 'Dermatology', 'Obstetrics & Gynecology', 'ENT'],
    facilities: ['Dedicated Pediatric ICU', 'Comprehensive Cancer Center', 'Stem Cell Lab', 'Ambulance GPS Fleet'],
    operatingHours: '24/7 Emergency | OPD: 9:00 AM - 6:00 PM',
    logo: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80',
    rating: 4.7,
    totalBeds: 400,
    icuBedsAvailable: 22,
  },
];

const doctors = [
  {
    _id: 'demo-doctor-ananya',
    hospitalId: 'demo-hospital-apollo',
    hospitalName: 'Apollo Central Hospital',
    name: 'Dr. Ananya Sen',
    specialization: 'Cardiology',
    qualifications: ['MBBS', 'MD (Medicine)', 'DM (Cardiology)', 'FACC (USA)'],
    experience: 14,
    consultationFee: 800,
    licenseNumber: 'MCI-DEL-2012-45892',
    bio: 'Senior Consultant Interventional Cardiologist with extensive experience in coronary interventions and heart failure therapies.',
    rating: 4.9,
    reviewCount: 142,
    profileImage: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80',
    availableSlots: [
      { day: 'Monday', startTime: '09:00', endTime: '13:00' },
      { day: 'Wednesday', startTime: '09:00', endTime: '13:00' },
      { day: 'Friday', startTime: '14:00', endTime: '18:00' },
    ],
  },
  {
    _id: 'demo-doctor-vikram',
    hospitalId: 'demo-hospital-max',
    hospitalName: 'Max Super Specialty Hospital',
    name: 'Dr. Vikram Malhotra',
    specialization: 'Neurology',
    qualifications: ['MBBS', 'MD (Gen Med)', 'DM (Neurology)', 'Fellow Stroke & Neurocritical Care'],
    experience: 16,
    consultationFee: 1000,
    licenseNumber: 'MCI-HAR-2010-33291',
    bio: 'Chief of Neurosciences specializing in stroke prevention, epilepsy, neuro-muscular disorders, and neuro-rehabilitation.',
    rating: 4.8,
    reviewCount: 98,
    profileImage: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80',
    availableSlots: [
      { day: 'Tuesday', startTime: '10:00', endTime: '14:00' },
      { day: 'Thursday', startTime: '10:00', endTime: '14:00' },
      { day: 'Saturday', startTime: '09:00', endTime: '12:30' },
    ],
  },
  {
    _id: 'demo-doctor-sneha',
    hospitalId: 'demo-hospital-fortis',
    hospitalName: 'Fortis Memorial Research Institute',
    name: 'Dr. Sneha Reddy',
    specialization: 'Pediatrics',
    qualifications: ['MBBS', 'DCH', 'DNB (Pediatrics)'],
    experience: 9,
    consultationFee: 600,
    licenseNumber: 'MCI-UP-2017-78119',
    bio: 'Compassionate Pediatrician & Neonatologist dedicated to pediatric immunization and adolescent care.',
    rating: 4.9,
    reviewCount: 215,
    profileImage: 'https://images.unsplash.com/photo-1594824813579-46747b0a79eb?auto=format&fit=crop&w=400&q=80',
    availableSlots: [
      { day: 'Monday', startTime: '11:00', endTime: '16:00' },
      { day: 'Tuesday', startTime: '11:00', endTime: '16:00' },
      { day: 'Friday', startTime: '10:00', endTime: '15:00' },
    ],
  },
];

export const getDemoDoctors = ({ search = '', specialization = '' } = {}) => {
  const searchTerm = search.trim().toLowerCase();
  return doctors.filter((doctor) => {
    const matchesSpecialization = !specialization || doctor.specialization === specialization;
    const searchableText = [doctor.name, doctor.specialization, doctor.hospitalName, ...doctor.qualifications]
      .join(' ')
      .toLowerCase();
    return matchesSpecialization && (!searchTerm || searchableText.includes(searchTerm));
  });
};

export const getDemoDoctor = (id) => doctors.find((doctor) => doctor._id === id) || null;

export const getDemoHospitals = ({ search = '', city = '', department = '' } = {}) => {
  const searchTerm = search.trim().toLowerCase();
  return hospitals.filter((hospital) => {
    const matchesCity = !city || hospital.city === city;
    const matchesDepartment = !department || hospital.departments.includes(department);
    const searchableText = `${hospital.name} ${hospital.address} ${hospital.city}`.toLowerCase();
    return matchesCity && matchesDepartment && (!searchTerm || searchableText.includes(searchTerm));
  });
};

export const getDemoHospitalDetails = (id) => {
  const hospital = hospitals.find((entry) => entry._id === id);
  if (!hospital) return null;
  return {
    hospital,
    doctors: doctors.filter((doctor) => doctor.hospitalId === hospital._id),
  };
};