import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import api from '../../services/api';
import {
  Users,
  Clock,
  CheckCircle2,
  Calendar,
  Search,
  ArrowRight,
  Stethoscope,
  Activity,
  AlertTriangle
} from 'lucide-react';

export default function DoctorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { lastQueueEvent } = useSocket();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lookupCardId, setLookupCardId] = useState('');

  const fetchDoctorData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/doctors/appointments');
      if (res.data.success) {
        setAppointments(res.data.appointments);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorData();
  }, []);

  useEffect(() => {
    if (lastQueueEvent) {
      fetchDoctorData();
    }
  }, [lastQueueEvent]);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayApts = appointments.filter(a => a.appointmentDate === todayStr || !a.appointmentDate);

  const waitingQueue = todayApts.filter(a => ['waiting', 'checked_in'].includes(a.status));
  const currentInConsult = todayApts.find(a => a.status === 'in_consultation');
  const completedToday = todayApts.filter(a => a.status === 'completed').length;

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const res = await api.put(`/doctors/appointments/${id}/status`, { status: newStatus });
      if (res.data.success) {
        fetchDoctorData();
      }
    } catch (e) {
      alert(e.response?.data?.message || 'Update failed');
    }
  };

  const handleLookupSubmit = (e) => {
    e.preventDefault();
    if (lookupCardId.trim()) {
      navigate(`/doctor/lookup?id=${encodeURIComponent(lookupCardId.trim())}`);
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-tealAccent via-[#0f5c56] to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-0.5 rounded-full bg-white/10 text-teal-200 text-xs font-semibold mb-2">
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Physician Clinical Suite</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome, {user?.name}
          </h1>
          <p className="text-xs sm:text-sm text-teal-100 max-w-xl mt-1">
            Active OPD Session • Manage live waiting patient tokens, review Smart Card records, and create electronic prescriptions.
          </p>
        </div>

        {/* Quick Smart Card Search Input */}
        <form onSubmit={handleLookupSubmit} className="bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20 flex items-center space-x-2 w-full md:w-80">
          <Search className="w-4 h-4 text-teal-200 ml-2" />
          <input
            type="text"
            placeholder="Smart Card ID (e.g. SCN-2026-...)"
            value={lookupCardId}
            onChange={(e) => setLookupCardId(e.target.value)}
            className="bg-transparent text-white placeholder:text-teal-200/70 text-xs w-full focus:outline-none"
          />
          <button
            type="submit"
            className="px-3 py-1.5 bg-white text-tealAccent font-bold text-xs rounded-xl hover:bg-teal-50 transition flex-shrink-0"
          >
            Lookup
          </button>
        </form>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-card border border-slate-100">
          <span className="text-slate-400 text-xs uppercase font-medium">Today's Schedule</span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{todayApts.length}</div>
          <span className="text-[11px] text-slate-500">Booked appointments</span>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-card border border-slate-100">
          <span className="text-slate-400 text-xs uppercase font-medium">Waiting in Lounge</span>
          <div className="text-2xl sm:text-3xl font-black text-amber-600 mt-1">{waitingQueue.length}</div>
          <span className="text-[11px] text-slate-500">Checked-in & queue tokened</span>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-card border border-slate-100">
          <span className="text-slate-400 text-xs uppercase font-medium">In Chamber Now</span>
          <div className="text-2xl sm:text-3xl font-black text-primary mt-1">
            {currentInConsult ? '1 Active' : '0 Free'}
          </div>
          <span className="text-[11px] text-slate-500">{currentInConsult?.patientName || 'Chamber available'}</span>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-card border border-slate-100">
          <span className="text-slate-400 text-xs uppercase font-medium">Completed OPD</span>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1">{completedToday}</div>
          <span className="text-[11px] text-slate-500">Records & Rx logged</span>
        </div>
      </div>

      {/* Active Chamber Patient Banner */}
      {currentInConsult && (
        <div className="bg-blue-50/80 rounded-2xl p-6 border-2 border-primary/30 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="text-xs font-bold uppercase tracking-wider text-primary">Patient Currently in Consultation Chamber</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900">{currentInConsult.patientName}</h3>
            <p className="text-xs text-slate-600">
              Smart Card ID: <span className="font-mono font-bold text-primary">{currentInConsult.smartCardId}</span> • Gender: {currentInConsult.patientGender} • Blood Group: <span className="font-bold text-rose-600">{currentInConsult.patientBloodGroup}</span>
            </p>
            <p className="text-xs text-slate-500 italic">Chief Complaint: "{currentInConsult.reason}"</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              to={`/doctor/lookup?id=${currentInConsult.smartCardId}`}
              className="px-4 py-2 bg-white text-slate-800 text-xs font-bold rounded-xl border border-slate-200 hover:bg-slate-50 transition"
            >
              View Past Records
            </Link>
            <Link
              to={`/doctor/consultation?aptId=${currentInConsult._id}&patId=${currentInConsult.patientId}`}
              className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-dark transition shadow-sm"
            >
              Add Consultation & Rx
            </Link>
            <button
              onClick={() => handleUpdateStatus(currentInConsult._id, 'completed')}
              className="px-3 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition"
            >
              Mark Completed
            </button>
          </div>
        </div>
      )}

      {/* Live Waiting Queue List */}
      <div className="bg-white rounded-2xl p-6 shadow-card border border-slate-100 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Current Patient Waiting Queue</h3>
            <p className="text-xs text-slate-500">Advance queue tokens as patients enter consultation</p>
          </div>
          <Link to="/doctor/queue" className="text-xs font-semibold text-primary hover:underline">
            Manage Queue View →
          </Link>
        </div>

        {waitingQueue.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">No patients currently waiting in queue.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {waitingQueue.map((apt) => (
              <div key={apt._id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-3.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 font-extrabold flex items-center justify-center text-sm border border-amber-200">
                    #{apt.queuePosition || 'Q'}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{apt.patientName}</h4>
                    <p className="text-xs text-slate-500">
                      Card: <span className="font-mono">{apt.smartCardId}</span> • Time: {apt.appointmentTime}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Link
                    to={`/doctor/lookup?id=${apt.smartCardId}`}
                    className="px-3 py-1.5 bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-100 transition"
                  >
                    Medical History
                  </Link>
                  <button
                    onClick={() => handleUpdateStatus(apt._id, 'in_consultation')}
                    className="px-3.5 py-1.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary-dark transition shadow-xs"
                  >
                    Call into Chamber
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
