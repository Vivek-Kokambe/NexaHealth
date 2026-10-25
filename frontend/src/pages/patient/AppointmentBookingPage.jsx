import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AlertCircle, ArrowLeft, ArrowRight, Building2, Calendar, CheckCircle2, Clock } from 'lucide-react';
import api from '../../services/api';

const today = () => {
  const date = new Date();
  const localOffset = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - localOffset).toISOString().slice(0, 10);
};

const timeSlots = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '02:00 PM', '02:30 PM',
  '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
];

export default function AppointmentBookingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const requestedHospitalId = searchParams.get('hospitalId') || '';
  const [hospitals, setHospitals] = useState([]);
  const [selectedHospitalId, setSelectedHospitalId] = useState(requestedHospitalId);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedDate, setSelectedDate] = useState(today());
  const [selectedTime, setSelectedTime] = useState('10:00 AM');
  const [reason, setReason] = useState('Routine checkup and consultation');
  const [step, setStep] = useState(requestedHospitalId ? 2 : 1);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState('');
  const [successAppointment, setSuccessAppointment] = useState(null);

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await api.get('/hospitals');
        const approvedHospitals = response.data.hospitals || [];
        setHospitals(approvedHospitals);
        if (requestedHospitalId && !approvedHospitals.some((hospital) => hospital._id === requestedHospitalId)) {
          setError('This hospital is not available for booking. It may still be awaiting approval.');
          setSelectedHospitalId('');
          setStep(1);
        }
      } catch (requestError) {
        setError(requestError.response?.data?.message || requestError.message || 'Unable to load approved hospitals.');
      } finally {
        setLoading(false);
      }
    };

    fetchHospitals();
  }, [requestedHospitalId]);

  const selectedHospital = hospitals.find((hospital) => hospital._id === selectedHospitalId);

  useEffect(() => {
    if (selectedHospital && !selectedHospital.departments.includes(selectedDepartment)) {
      setSelectedDepartment(selectedHospital.departments[0] || '');
    }
  }, [selectedHospital, selectedDepartment]);

  const submitAppointmentRequest = async () => {
    try {
      setBookingLoading(true);
      setError('');
      const response = await api.post('/appointments', {
        hospitalId: selectedHospitalId,
        department: selectedDepartment,
        appointmentDate: selectedDate,
        appointmentTime: selectedTime,
        reason,
      });
      setSuccessAppointment(response.data.appointment);
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message || 'Failed to submit appointment request.');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-sm text-slate-500">Loading approved hospitals...</div>;
  }

  if (successAppointment) {
    return (
      <div className="mx-auto max-w-xl px-4 py-12">
        <section className="space-y-5 rounded-3xl border border-slate-100 bg-white p-8 text-center shadow-card">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle2 className="h-9 w-9" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Appointment request submitted</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Your request was sent to <strong>{selectedHospital?.name}</strong>. The hospital will
              confirm the visit time. This request is not a confirmed appointment yet.
            </p>
          </div>
          <div className="space-y-2 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-left text-sm">
            <div className="flex justify-between gap-3">
              <span className="text-slate-500">Request number</span>
              <span className="font-mono font-bold text-primary">{successAppointment.appointmentNumber}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-slate-500">Department</span>
              <span className="font-semibold text-slate-800">{successAppointment.department}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-slate-500">Requested date & time</span>
              <span className="font-semibold text-slate-800">{successAppointment.appointmentDate} at {successAppointment.appointmentTime}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-slate-500">Status</span>
              <span className="font-bold text-amber-700">Awaiting confirmation</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button onClick={() => navigate('/patient/appointments')} className="rounded-xl bg-slate-100 px-3 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-200">
              My Appointments
            </button>
            <button onClick={() => navigate('/hospitals')} className="rounded-xl bg-primary px-3 py-2.5 text-xs font-bold text-white hover:bg-primary-dark">
              Hospital Directory
            </button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-7">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">Request a Hospital Appointment</h1>
        <p className="mt-1 text-sm text-slate-500">Choose an approved hospital and send your preferred department, date, and time.</p>
      </header>

      {error && (
        <div role="alert" className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> <span>{error}</span>
        </div>
      )}

      <div className="flex items-center justify-between border-b border-slate-200 pb-4 text-xs font-semibold">
        <span className={step >= 1 ? 'text-primary' : 'text-slate-400'}>1. Hospital</span>
        <span className="text-slate-300">→</span>
        <span className={step >= 2 ? 'text-primary' : 'text-slate-400'}>2. Visit details</span>
        <span className="text-slate-300">→</span>
        <span className={step >= 3 ? 'text-primary' : 'text-slate-400'}>3. Review</span>
      </div>

      {step === 1 && (
        <section className="space-y-4">
          <h2 className="text-sm font-bold text-slate-900">Choose an approved hospital</h2>
          {hospitals.length === 0 ? (
            <div className="rounded-2xl border border-slate-100 bg-white p-8 text-center shadow-card">
              <Building2 className="mx-auto h-10 w-10 text-slate-300" />
              <p className="mt-3 text-sm font-semibold text-slate-700">No approved hospitals are available yet.</p>
              <p className="mt-1 text-xs text-slate-500">Hospitals appear here after administrator approval.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {hospitals.map((hospital) => (
                <button
                  key={hospital._id}
                  type="button"
                  onClick={() => {
                    setSelectedHospitalId(hospital._id);
                    setStep(2);
                  }}
                  className={`flex items-center gap-3 rounded-2xl border bg-white p-4 text-left shadow-xs transition ${
                    selectedHospitalId === hospital._id ? 'border-primary bg-blue-50/60 ring-2 ring-primary/20' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-primary">
                    <Building2 className="h-6 w-6" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-xs font-bold text-slate-900">{hospital.name}</span>
                    <span className="mt-1 block truncate text-[11px] text-slate-500">{hospital.city} · {hospital.departments.length} departments</span>
                    <span className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-emerald-700">
                      <CheckCircle2 className="h-3 w-3" /> Approved network hospital
                    </span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      {step === 2 && selectedHospital && (
        <section className="space-y-5 rounded-3xl border border-slate-100 bg-white p-6 shadow-card sm:p-8">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Visit details</h2>
              <p className="mt-1 text-xs text-slate-500">{selectedHospital.name}</p>
            </div>
            {!requestedHospitalId && (
              <button type="button" onClick={() => setStep(1)} className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
                <ArrowLeft className="h-3.5 w-3.5" /> Change hospital
              </button>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-xs font-semibold text-slate-700">
              Department or specialty
              <select
                value={selectedDepartment}
                onChange={(event) => setSelectedDepartment(event.target.value)}
                required
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 font-normal outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                <option value="" disabled>Select a department</option>
                {selectedHospital.departments.map((department) => <option key={department} value={department}>{department}</option>)}
              </select>
            </label>
            <label className="text-xs font-semibold text-slate-700">
              Preferred appointment date
              <span className="relative mt-1.5 block">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input type="date" min={today()} value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} required className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 font-normal outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
              </span>
            </label>
          </div>
          <fieldset>
            <legend className="mb-2 text-xs font-semibold text-slate-700">Preferred time</legend>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {timeSlots.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setSelectedTime(slot)}
                  className={`rounded-xl border px-2 py-2 text-xs font-semibold transition ${
                    selectedTime === slot ? 'border-primary bg-primary text-white shadow-sm' : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Clock className="mr-1 inline h-3.5 w-3.5" />{slot}
                </button>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-slate-500">This is your preferred time. The hospital will confirm availability.</p>
          </fieldset>
          <label className="block text-xs font-semibold text-slate-700">
            Reason for visit
            <textarea value={reason} onChange={(event) => setReason(event.target.value)} maxLength={500} rows={3} placeholder="Briefly describe the reason for your visit" className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 font-normal outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
          </label>
          <div className="flex justify-end">
            <button type="button" disabled={!selectedDepartment || !selectedDate || !selectedTime} onClick={() => setStep(3)} className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50">
              Review request <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </section>
      )}

      {step === 3 && selectedHospital && (
        <section className="space-y-5 rounded-3xl border border-slate-100 bg-white p-6 shadow-card sm:p-8">
          <h2 className="text-base font-bold text-slate-900">Review your appointment request</h2>
          <div className="space-y-3 divide-y divide-slate-100 rounded-2xl bg-slate-50 p-4 text-sm">
            <p className="flex items-start gap-2 pb-3 text-slate-700"><Building2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{selectedHospital.name}<span className="ml-auto text-right text-xs text-slate-500">{selectedHospital.address}, {selectedHospital.city}</span></p>
            <p className="flex justify-between gap-3 pt-3"><span className="text-slate-500">Department</span><span className="font-semibold text-slate-800">{selectedDepartment}</span></p>
            <p className="flex justify-between gap-3 pt-3"><span className="text-slate-500">Preferred date</span><span className="font-semibold text-slate-800">{selectedDate}</span></p>
            <p className="flex justify-between gap-3 pt-3"><span className="text-slate-500">Preferred time</span><span className="font-semibold text-slate-800">{selectedTime}</span></p>
            <p className="pt-3 text-slate-700"><span className="text-slate-500">Reason:</span> {reason || 'Routine checkup and consultation'}</p>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900">
            This submits an appointment request. It is not confirmed until the hospital reviews and confirms the date and time.
          </div>
          <div className="flex flex-col-reverse justify-between gap-2 sm:flex-row">
            <button type="button" onClick={() => setStep(2)} className="inline-flex items-center justify-center gap-1 rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-200">
              <ArrowLeft className="h-4 w-4" /> Edit details
            </button>
            <button type="button" onClick={submitAppointmentRequest} disabled={bookingLoading} className="rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-white hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50">
              {bookingLoading ? 'Submitting request...' : 'Submit appointment request'}
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
