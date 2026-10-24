import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { FilePlus, Plus, Trash2, Save, CheckCircle2, Stethoscope, Activity, Heart, Thermometer } from 'lucide-react';

export default function AddConsultationPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialAptId = searchParams.get('aptId') || '';
  const initialPatId = searchParams.get('patId') || '';

  const [appointments, setAppointments] = useState([]);
  const [selectedAptId, setSelectedAptId] = useState(initialAptId);
  const [selectedPatId, setSelectedPatId] = useState(initialPatId);

  const [diagnosis, setDiagnosis] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [vitals, setVitals] = useState({
    bloodPressure: '120/80 mmHg',
    heartRate: '72',
    temperature: '98.6 °F',
    weight: '68',
    oxygenLevel: '99',
  });
  const [prescriptions, setPrescriptions] = useState([
    { medication: '', dosage: '500mg', frequency: 'Twice daily', duration: '5 days', notes: 'After meals' },
  ]);
  const [notes, setNotes] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchApts = async () => {
      try {
        const res = await api.get('/doctors/appointments');
        if (res.data.success) {
          setAppointments(res.data.appointments || []);
          if (!selectedAptId && res.data.appointments?.length > 0) {
            setSelectedAptId(res.data.appointments[0]._id);
            setSelectedPatId(res.data.appointments[0].patientId);
          }
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchApts();
  }, []);

  const handleAptSelect = (e) => {
    const aptId = e.target.value;
    setSelectedAptId(aptId);
    const target = appointments.find(a => a._id === aptId);
    if (target) {
      setSelectedPatId(target.patientId);
    }
  };

  const addPrescriptionRow = () => {
    setPrescriptions([...prescriptions, { medication: '', dosage: '', frequency: 'Twice daily', duration: '5 days', notes: '' }]);
  };

  const removePrescriptionRow = (idx) => {
    setPrescriptions(prescriptions.filter((_, i) => i !== idx));
  };

  const updatePrescriptionRow = (idx, field, value) => {
    const updated = [...prescriptions];
    updated[idx][field] = value;
    setPrescriptions(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!diagnosis) {
      alert('Please enter a clinical diagnosis.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        patientId: selectedPatId || 'pat_1',
        appointmentId: selectedAptId || null,
        diagnosis,
        symptoms: symptoms ? symptoms.split(',').map(s => s.trim()) : [],
        vitals: {
          bloodPressure: vitals.bloodPressure,
          heartRate: Number(vitals.heartRate) || 72,
          temperature: vitals.temperature,
          weight: Number(vitals.weight) || 70,
          oxygenLevel: Number(vitals.oxygenLevel) || 99,
        },
        prescription: prescriptions.filter(p => p.medication.trim()),
        notes,
        followUpDate,
      };

      const res = await api.post('/doctors/medical-records', payload);
      if (res.data.success) {
        setSuccess(true);
        setTimeout(() => navigate('/doctor/dashboard'), 2000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save medical record.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Clinical Consultation & Digital Rx
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Record diagnosis, patient vital telemetry, structured prescription instructions, and follow-up directives.
        </p>
      </div>

      {success ? (
        <div className="bg-white rounded-3xl p-10 text-center shadow-card border border-slate-100 space-y-3 animate-in fade-in">
          <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto" />
          <h2 className="text-2xl font-bold text-slate-900">Consultation Record Saved!</h2>
          <p className="text-xs text-slate-500">The medical timeline and prescription has been permanently logged. Redirecting to dashboard...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6 text-xs">
          {/* Patient / Appointment Selector */}
          <div className="bg-white rounded-2xl p-5 shadow-card border border-slate-100 space-y-3">
            <h3 className="font-bold text-slate-900 text-sm">Target Patient Consultation</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Select Patient Appointment</label>
                <select
                  value={selectedAptId}
                  onChange={handleAptSelect}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  {appointments.map(a => (
                    <option key={a._id} value={a._id}>
                      {a.patientName} ({a.smartCardId}) - {a.appointmentTime}
                    </option>
                  ))}
                  <option value="">Manual Consultation (Lookup by ID)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Clinical Diagnosis</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acute Bronchitis / Stage-1 Hypertension"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Reported Symptoms (Comma-separated)</label>
              <input
                type="text"
                placeholder="e.g. Dry cough, low-grade fever, chest tight feeling"
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          {/* Vitals Recording */}
          <div className="bg-white rounded-2xl p-5 shadow-card border border-slate-100 space-y-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
              <Activity className="w-4 h-4 text-primary" />
              <span>Vital Signs at Examination</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div>
                <label className="font-semibold text-slate-600 text-[11px] block mb-1">Blood Pressure</label>
                <input
                  type="text"
                  value={vitals.bloodPressure}
                  onChange={(e) => setVitals({ ...vitals, bloodPressure: e.target.value })}
                  placeholder="120/80"
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-center font-bold"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-600 text-[11px] block mb-1">Heart Rate (BPM)</label>
                <input
                  type="number"
                  value={vitals.heartRate}
                  onChange={(e) => setVitals({ ...vitals, heartRate: e.target.value })}
                  placeholder="72"
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-center font-bold"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-600 text-[11px] block mb-1">Temperature</label>
                <input
                  type="text"
                  value={vitals.temperature}
                  onChange={(e) => setVitals({ ...vitals, temperature: e.target.value })}
                  placeholder="98.6 °F"
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-center font-bold"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-600 text-[11px] block mb-1">Weight (Kg)</label>
                <input
                  type="number"
                  value={vitals.weight}
                  onChange={(e) => setVitals({ ...vitals, weight: e.target.value })}
                  placeholder="70"
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-center font-bold"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-600 text-[11px] block mb-1">SpO2 Oxygen (%)</label>
                <input
                  type="number"
                  value={vitals.oxygenLevel}
                  onChange={(e) => setVitals({ ...vitals, oxygenLevel: e.target.value })}
                  placeholder="99"
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-center font-bold"
                />
              </div>
            </div>
          </div>

          {/* Digital Prescription Builder */}
          <div className="bg-white rounded-2xl p-5 shadow-card border border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">Prescribed Medications (Rx)</h3>
              <button
                type="button"
                onClick={addPrescriptionRow}
                className="text-xs text-primary font-bold hover:underline flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Medication</span>
              </button>
            </div>

            <div className="space-y-2">
              {prescriptions.map((row, idx) => (
                <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                  <div className="sm:col-span-4">
                    <input
                      type="text"
                      placeholder="Medication Name (e.g. Paracetamol)"
                      value={row.medication}
                      onChange={(e) => updatePrescriptionRow(idx, 'medication', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-bold text-primary"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      placeholder="Dosage (500mg)"
                      value={row.dosage}
                      onChange={(e) => updatePrescriptionRow(idx, 'dosage', e.target.value)}
                      className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-center"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <input
                      type="text"
                      placeholder="Frequency (Twice daily)"
                      value={row.frequency}
                      onChange={(e) => updatePrescriptionRow(idx, 'frequency', e.target.value)}
                      className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      placeholder="Duration (5 days)"
                      value={row.duration}
                      onChange={(e) => updatePrescriptionRow(idx, 'duration', e.target.value)}
                      className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-center"
                    />
                  </div>
                  <div className="sm:col-span-1 text-center">
                    {prescriptions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePrescriptionRow(idx)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes & Follow-up */}
          <div className="bg-white rounded-2xl p-5 shadow-card border border-slate-100 space-y-3">
            <h3 className="font-bold text-slate-900 text-sm">Physician Notes & Next Follow-Up</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="font-semibold text-slate-700 block mb-1">Clinical Advice / Lifestyle Notes</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Avoid salt-heavy meals. Rest for 3 days. Return immediately if breathlessness develops."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Recommended Follow-up Date</label>
                <input
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-primary text-white font-bold rounded-xl text-xs hover:bg-primary-dark transition shadow-md flex items-center space-x-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Submitting Record...' : 'Complete & Issue Medical Record'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
