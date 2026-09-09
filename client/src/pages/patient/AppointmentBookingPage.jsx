import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { Calendar, Clock, Building2, Stethoscope, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';

export default function AppointmentBookingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [step, setStep] = useState(1);
  const [hospitals, setHospitals] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [successApt, setSuccessApt] = useState(null);

  // Selections
  const [selectedHospitalId, setSelectedHospitalId] = useState(searchParams.get('hospitalId') || '');
  const [selectedDoctorId, setSelectedDoctorId] = useState(searchParams.get('doctorId') || '');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState('10:00 AM');
  const [reason, setReason] = useState('Routine checkup & consultation');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [hospRes, docRes] = await Promise.all([
          api.get('/hospitals'),
          api.get('/doctors'),
        ]);
        if (hospRes.data.success) setHospitals(hospRes.data.hospitals);
        if (docRes.data.success) setDoctors(docRes.data.doctors);

        if (searchParams.get('doctorId')) {
          setStep(3); // Jump ahead if doctor pre-selected
        } else if (searchParams.get('hospitalId')) {
          setStep(2);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [searchParams]);

  // Filter doctors by selected hospital
  const filteredDoctors = selectedHospitalId
    ? doctors.filter(d => d.hospitalId === selectedHospitalId || d.hospitalId?._id === selectedHospitalId)
    : doctors;

  const selectedHospital = hospitals.find(h => h._id === selectedHospitalId);
  const selectedDoctor = doctors.find(d => d._id === selectedDoctorId);

  const timeSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
    '11:00 AM', '11:30 AM', '02:00 PM', '02:30 PM',
    '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
  ];

  const handleConfirmBooking = async () => {
    try {
      setBookingLoading(true);
      const payload = {
        hospitalId: selectedHospitalId || selectedDoctor?.hospitalId,
        doctorId: selectedDoctorId,
        department: selectedDoctor?.specialization || 'General Medicine',
        appointmentDate: selectedDate,
        appointmentTime: selectedTime,
        reason,
      };

      const res = await api.post('/appointments', payload);
      if (res.data.success) {
        setSuccessApt(res.data.appointment);
      }
    } catch (e) {
      alert(e.response?.data?.message || 'Booking failed');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-xs text-slate-500">Loading booking channels...</div>;
  }

  // Booking Confirmation Success Screen
  if (successApt) {
    return (
      <div className="max-w-md mx-auto py-12 px-4">
        <div className="bg-white rounded-3xl p-8 shadow-card border border-slate-100 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <h2 className="text-2xl font-black text-slate-900">Appointment Confirmed!</h2>
          <p className="text-xs text-slate-500">Your consultation slot has been reserved with Dr. {selectedDoctor?.name || 'Specialist'}.</p>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-left space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Booking Number:</span>
              <span className="font-mono font-bold text-primary">{successApt.appointmentNumber}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Date & Time:</span>
              <span className="font-semibold text-slate-800">{successApt.appointmentDate} at {successApt.appointmentTime}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Hospital:</span>
              <span className="font-semibold text-slate-800 truncate max-w-[180px]">{selectedHospital?.name || 'SmartCare Hospital'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Check-in Status:</span>
              <span className="font-bold text-blue-600 uppercase text-[10px]">Confirmed (Arrive 15 min early)</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              onClick={() => navigate('/patient/appointments')}
              className="py-2.5 px-3 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200"
            >
              My Appointments
            </button>
            <button
              onClick={() => navigate('/patient/dashboard')}
              className="py-2.5 px-3 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-dark"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Book Doctor Appointment
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Reserve confirmed OPD slots at accredited network hospitals with instant token generation.
        </p>
      </div>

      {/* Stepper Wizard */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4 text-xs font-semibold">
        <span className={step >= 1 ? 'text-primary' : 'text-slate-400'}>1. Hospital</span>
        <span className="text-slate-300">→</span>
        <span className={step >= 2 ? 'text-primary' : 'text-slate-400'}>2. Specialist</span>
        <span className="text-slate-300">→</span>
        <span className={step >= 3 ? 'text-primary' : 'text-slate-400'}>3. Slot & Reason</span>
        <span className="text-slate-300">→</span>
        <span className={step >= 4 ? 'text-primary' : 'text-slate-400'}>4. Review</span>
      </div>

      {/* Step 1: Select Hospital */}
      {step === 1 && (
        <div className="space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">Select Affiliated Hospital</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {hospitals.map((hosp) => (
              <div
                key={hosp._id}
                onClick={() => {
                  setSelectedHospitalId(hosp._id);
                  setStep(2);
                }}
                className={`p-4 rounded-2xl border cursor-pointer transition shadow-xs flex items-center space-x-3 ${
                  selectedHospitalId === hosp._id
                    ? 'border-primary bg-blue-50/60 ring-2 ring-primary/20'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-blue-100 text-primary flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-6 h-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-slate-900 text-xs truncate">{hosp.name}</h4>
                  <p className="text-[11px] text-slate-500 truncate">{hosp.city} • {hosp.departments?.length || 5} Departments</p>
                  <p className="text-[10px] text-emerald-600 font-medium mt-0.5">Rating: {hosp.rating || 4.8} ★</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Select Doctor */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">Select Specialist Doctor</h3>
            <button
              onClick={() => setStep(1)}
              className="text-xs text-slate-500 hover:text-primary flex items-center space-x-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Change Hospital</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredDoctors.map((doc) => (
              <div
                key={doc._id}
                onClick={() => {
                  setSelectedDoctorId(doc._id);
                  if (!selectedHospitalId && doc.hospitalId) setSelectedHospitalId(doc.hospitalId);
                  setStep(3);
                }}
                className={`p-4 rounded-2xl border cursor-pointer transition shadow-xs flex items-center space-x-3 ${
                  selectedDoctorId === doc._id
                    ? 'border-primary bg-blue-50/60 ring-2 ring-primary/20'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <img
                  src={doc.profileImage || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=120&q=80'}
                  alt={doc.name}
                  className="w-12 h-12 rounded-xl object-cover border border-slate-200 flex-shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-bold text-tealAccent uppercase">{doc.specialization}</span>
                  <h4 className="font-bold text-slate-900 text-xs truncate">{doc.name}</h4>
                  <p className="text-[11px] text-slate-500">Fee: ₹{doc.consultationFee} • {doc.experience} yrs exp</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Select Date, Time Slot & Reason */}
      {step === 3 && (
        <div className="bg-white rounded-3xl p-6 shadow-card border border-slate-100 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Select Preferred Date & Slot</h3>
              <p className="text-xs text-slate-500">Consulting with Dr. {selectedDoctor?.name || 'Specialist'}</p>
            </div>
            <button onClick={() => setStep(2)} className="text-xs text-primary font-semibold hover:underline">
              Change Doctor
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Appointment Date</label>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Reason for Visit / Symptoms</label>
              <input
                type="text"
                placeholder="e.g. Chest discomfort, routine checkup"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          {/* Time Slot Grid */}
          <div>
            <label className="font-semibold text-slate-700 text-xs block mb-2">Available Consultation Time Slots</label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {timeSlots.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setSelectedTime(slot)}
                  className={`py-2 px-1 text-center rounded-xl text-xs font-semibold transition ${
                    selectedTime === slot
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => setStep(4)}
              className="px-6 py-2.5 bg-primary text-white font-bold text-xs rounded-xl hover:bg-primary-dark transition flex items-center space-x-1.5"
            >
              <span>Review Details</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Review and Confirm */}
      {step === 4 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-slate-100 space-y-6">
          <h3 className="font-bold text-slate-900 text-base">Review & Confirm Appointment</h3>

          <div className="divide-y divide-slate-100 text-xs space-y-3">
            <div className="flex justify-between py-2">
              <span className="text-slate-500">Hospital:</span>
              <span className="font-bold text-slate-800">{selectedHospital?.name || 'Selected Network Hospital'}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-500">Consulting Specialist:</span>
              <span className="font-bold text-slate-800">{selectedDoctor?.name || 'Attending Physician'} ({selectedDoctor?.specialization})</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-500">Date & Slot:</span>
              <span className="font-bold text-primary">{selectedDate} at {selectedTime}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-500">Consultation Fee:</span>
              <span className="font-bold text-slate-800">₹{selectedDoctor?.consultationFee || 500} (Pay at hospital)</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-500">Reason:</span>
              <span className="text-slate-700 italic">{reason}</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              onClick={() => setStep(3)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Back
            </button>

            <button
              disabled={bookingLoading}
              onClick={handleConfirmBooking}
              className="px-6 py-2.5 bg-primary text-white font-bold text-xs rounded-xl hover:bg-primary-dark shadow-md transition disabled:opacity-50"
            >
              {bookingLoading ? 'Confirming...' : 'Confirm Appointment'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
