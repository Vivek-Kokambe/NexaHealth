import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Stethoscope, Building2, CheckCircle2, ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState('patient'); // 'patient' | 'doctor' | 'hospital'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    // Patient
    dateOfBirth: '1996-06-15',
    gender: 'male',
    bloodGroup: 'O+',
    allergies: '',
    emergencyName: '',
    emergencyPhone: '',
    // Doctor
    specialization: 'Cardiology',
    qualifications: 'MBBS, MD',
    licenseNumber: '',
    consultationFee: 700,
    // Hospital
    registrationNumber: '',
    city: 'New Delhi',
    state: 'Delhi',
    address: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role,
      };

      if (role === 'patient') {
        payload.dateOfBirth = formData.dateOfBirth;
        payload.gender = formData.gender;
        payload.bloodGroup = formData.bloodGroup;
        payload.allergies = formData.allergies ? formData.allergies.split(',').map(s => s.trim()) : [];
        payload.emergencyContact = {
          name: formData.emergencyName || 'Next of Kin',
          phone: formData.emergencyPhone || formData.phone,
        };
      } else if (role === 'doctor') {
        payload.specialization = formData.specialization;
        payload.qualifications = formData.qualifications.split(',').map(s => s.trim());
        payload.licenseNumber = formData.licenseNumber || `MCI-REG-${Math.floor(10000 + Math.random() * 90000)}`;
        payload.consultationFee = Number(formData.consultationFee);
      } else if (role === 'hospital') {
        payload.registrationNumber = formData.registrationNumber || `HOSP-REG-${Math.floor(1000 + Math.random() * 9000)}`;
        payload.city = formData.city;
        payload.state = formData.state;
        payload.address = formData.address || 'Medical Health Enclave';
      }

      const res = await register(payload);
      setSuccessData(res);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  if (successData) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-card border border-slate-100 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-extrabold text-slate-900">Registration Successful!</h2>
          <p className="text-xs text-slate-600">
            Welcome to SmartCare Health Network, <strong>{successData.user.name}</strong>.
          </p>

          {role === 'patient' && successData.roleData?.smartCardId && (
            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-left space-y-2">
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">Generated Smart Card ID</span>
              <div className="font-mono text-xl font-extrabold text-primary select-all">
                {successData.roleData.smartCardId}
              </div>
              <p className="text-[11px] text-slate-500">
                Your card has been provisioned and is ready for hospital check-ins and appointments.
              </p>
            </div>
          )}

          <button
            onClick={() => navigate(`/${role}/dashboard`)}
            className="w-full py-3 bg-primary text-white font-bold rounded-xl text-xs hover:bg-primary-dark transition flex items-center justify-center space-x-2"
          >
            <span>Proceed to {role} Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-12 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900">Join SmartCare Health Network</h1>
        <p className="text-xs text-slate-500">Receive your instant digital health identity or affiliate your practice</p>
      </div>

      {/* Role Selection Tabs */}
      <div className="grid grid-cols-3 gap-2 bg-slate-200/60 p-1.5 rounded-2xl">
        <button
          type="button"
          onClick={() => setRole('patient')}
          className={`py-2.5 text-xs font-bold rounded-xl transition flex items-center justify-center space-x-1.5 ${
            role === 'patient' ? 'bg-white text-primary shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Patient</span>
        </button>

        <button
          type="button"
          onClick={() => setRole('doctor')}
          className={`py-2.5 text-xs font-bold rounded-xl transition flex items-center justify-center space-x-1.5 ${
            role === 'doctor' ? 'bg-white text-primary shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Stethoscope className="w-4 h-4" />
          <span>Doctor</span>
        </button>

        <button
          type="button"
          onClick={() => setRole('hospital')}
          className={`py-2.5 text-xs font-bold rounded-xl transition flex items-center justify-center space-x-1.5 ${
            role === 'hospital' ? 'bg-white text-primary shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Hospital</span>
        </button>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-slate-100 space-y-5">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Universal fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                {role === 'hospital' ? 'Hospital Name' : 'Full Name'}
              </label>
              <input
                type="text"
                name="name"
                required
                    placeholder={role === 'hospital' ? 'Max Super Specialty' : 'e.g. Your full name'}
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Email Address</label>
              <input
                type="email"
                name="email"
                required
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Password</label>
              <input
                type="password"
                name="password"
                required
                placeholder="At least 6 characters"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Phone Number</label>
              <input
                type="tel"
                name="phone"
                required
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Role specific additions: Patient */}
          {role === 'patient' && (
            <>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Date of Birth</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Blood Group</label>
                  <select
                    name="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-rose-600"
                  >
                    {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Known Drug or Food Allergies (Comma-separated)</label>
                <input
                  type="text"
                  name="allergies"
                  placeholder="e.g. Penicillin, Peanuts, Sulfa drugs"
                  value={formData.allergies}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Emergency Contact Name</label>
                  <input
                    type="text"
                    name="emergencyName"
                    placeholder="e.g. Sunita Sharma"
                    value={formData.emergencyName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Emergency Contact Phone</label>
                  <input
                    type="tel"
                    name="emergencyPhone"
                    placeholder="+91 98765 43210"
                    value={formData.emergencyPhone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>
            </>
          )}

          {/* Role specific: Doctor */}
          {role === 'doctor' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Specialization</label>
                  <select
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    {['Cardiology', 'Neurology', 'Pediatrics', 'Orthopedics', 'General Medicine', 'Oncology'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Consultation Fee (₹)</label>
                  <input
                    type="number"
                    name="consultationFee"
                    value={formData.consultationFee}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Qualifications</label>
                  <input
                    type="text"
                    name="qualifications"
                    placeholder="e.g. MBBS, MD (Cardiology)"
                    value={formData.qualifications}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">MCI License Number</label>
                  <input
                    type="text"
                    name="licenseNumber"
                    placeholder="MCI-DEL-2022-XXXX"
                    value={formData.licenseNumber}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>
            </>
          )}

          {/* Role specific: Hospital */}
          {role === 'hospital' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Hospital Reg Number</label>
                  <input
                    type="text"
                    name="registrationNumber"
                    placeholder="HOSP-DEL-XXXX"
                    value={formData.registrationNumber}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Street Address</label>
                <input
                  type="text"
                  name="address"
                  placeholder="e.g. B-Block, Sushant Lok Phase 1"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary text-white font-bold rounded-xl text-xs hover:bg-primary-dark shadow-md transition flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <span>Complete Registration</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-2 border-t border-slate-100 text-center text-xs text-slate-500">
          Already registered?{' '}
          <Link to="/login" className="font-bold text-primary hover:underline">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
}
