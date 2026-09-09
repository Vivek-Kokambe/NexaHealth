import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../../services/api';
import MedicalTimeline from '../../components/MedicalTimeline';
import { Search, ShieldAlert, AlertTriangle, User, FilePlus, Lock, CheckCircle2 } from 'lucide-react';

export default function PatientLookupPage() {
  const [searchParams] = useSearchParams();
  const initialId = searchParams.get('id') || '';

  const [smartCardId, setSmartCardId] = useState(initialId);
  const [isEmergency, setIsEmergency] = useState(false);
  const [patientData, setPatientData] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [complianceNotice, setComplianceNotice] = useState('');

  const handleLookup = async (idToSearch, emergencyFlag) => {
    if (!idToSearch) return;
    setLoading(true);
    setError('');
    setPatientData(null);
    try {
      const res = await api.get(`/doctors/patients/${encodeURIComponent(idToSearch.trim())}`, {
        params: { emergencyAccess: emergencyFlag ? 'true' : 'false' },
      });
      if (res.data.success) {
        setPatientData(res.data.patient);
        setRecords(res.data.records || []);
        setComplianceNotice(res.data.complianceNotice || '');
      }
    } catch (err) {
      setError(err.response?.data?.message || `No patient found with Smart Card ID '${idToSearch}'`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialId) {
      handleLookup(initialId, false);
    }
  }, [initialId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    handleLookup(smartCardId, isEmergency);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Patient Smart Card Lookup
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Authorized clinical history verification. Enter patient's unique Smart Card token to inspect previous diagnoses, allergies, and prescriptions.
        </p>
      </div>

      {/* Lookup Form */}
      <div className="bg-white rounded-3xl p-6 shadow-card border border-slate-100 space-y-4">
        {/* Compliance Warning Banner */}
        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start space-x-2.5">
          <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">Patient Record Audit Warning:</span>
            Accessing patient health information requires active clinical consent. Every record lookup is timestamped and recorded in the permanent institutional compliance audit trail.
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="text"
                required
                placeholder="Enter Smart Card ID (e.g. SCN-2026-104582)"
                value={smartCardId}
                onChange={(e) => setSmartCardId(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-primary text-white font-bold text-xs rounded-xl hover:bg-primary-dark transition shadow-sm disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Authorize & Open'}
            </button>
          </div>

          <div className="flex items-center space-x-2 pt-1 text-xs text-slate-600">
            <input
              type="checkbox"
              id="emergencyCheck"
              checked={isEmergency}
              onChange={(e) => setIsEmergency(e.target.checked)}
              className="rounded border-slate-300 text-rose-600 focus:ring-rose-500"
            />
            <label htmlFor="emergencyCheck" className="text-rose-700 font-semibold cursor-pointer">
              Emergency Trauma Override (Bypass routine consent if patient is unconscious/incapacitated)
            </label>
          </div>
        </form>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Patient Record Display */}
      {patientData && (
        <div className="space-y-6">
          {/* Patient Overview Card */}
          <div className="bg-white rounded-3xl p-6 shadow-card border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs font-extrabold text-white bg-primary px-2.5 py-0.5 rounded-lg">
                  {patientData.smartCardId}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                  {patientData.cardStatus}
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-900">{patientData.name}</h2>
              <div className="flex flex-wrap gap-4 text-xs text-slate-600 pt-1">
                <span>DOB: {new Date(patientData.dateOfBirth).toLocaleDateString()}</span>
                <span>Gender: {patientData.gender}</span>
                <span>Blood Group: <strong className="text-rose-600">{patientData.bloodGroup}</strong></span>
                <span>Phone: {patientData.phone}</span>
              </div>

              {/* Allergies Highlight */}
              {patientData.allergies?.length > 0 && (
                <div className="pt-2 flex items-center space-x-1.5 text-xs">
                  <span className="font-bold text-rose-600 flex items-center space-x-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Known Allergies:</span>
                  </span>
                  {patientData.allergies.map((alg, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-bold border border-rose-200 text-[11px]">
                      {alg}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex md:flex-col gap-2">
              <Link
                to={`/doctor/consultation?patId=${patientData.patientId}`}
                className="px-4 py-2.5 bg-tealAccent text-white font-bold text-xs rounded-xl hover:bg-teal-700 transition flex items-center justify-center space-x-1.5 shadow-sm"
              >
                <FilePlus className="w-4 h-4" />
                <span>Add Consultation</span>
              </Link>
            </div>
          </div>

          {/* Medical Timeline */}
          <div>
            <h3 className="font-bold text-slate-900 text-base mb-3">Complete Clinical Timeline</h3>
            <MedicalTimeline records={records} patientInfo={patientData} showConsentWarning={true} />
          </div>
        </div>
      )}
    </div>
  );
}
