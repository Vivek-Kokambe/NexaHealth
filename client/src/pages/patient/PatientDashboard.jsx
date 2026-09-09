import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import api from '../../services/api';
import SmartCardWidget from '../../components/SmartCardWidget';
import QueueTrackerWidget from '../../components/QueueTrackerWidget';
import {
  Calendar,
  Clock,
  FileText,
  CreditCard,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Activity,
  Plus
} from 'lucide-react';

export default function PatientDashboard() {
  const { user, roleData } = useAuth();
  const { lastQueueEvent } = useSocket();

  const [cardData, setCardData] = useState(null);
  const [queueData, setQueueData] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [recentRecords, setRecentRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [cardRes, queueRes, aptRes, recRes] = await Promise.allSettled([
        api.get('/patients/smart-card'),
        api.get('/patients/queue'),
        api.get('/patients/appointments'),
        api.get('/patients/medical-records'),
      ]);

      if (cardRes.status === 'fulfilled' && cardRes.value.data.success) {
        setCardData(cardRes.value.data.smartCard);
      }
      if (queueRes.status === 'fulfilled' && queueRes.value.data.success) {
        setQueueData(queueRes.value.data);
      }
      if (aptRes.status === 'fulfilled' && aptRes.value.data.success) {
        setAppointments(aptRes.value.data.appointments || []);
      }
      if (recRes.status === 'fulfilled' && recRes.value.data.success) {
        setRecentRecords(recRes.value.data.records?.slice(0, 2) || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Update on socket queue events
  useEffect(() => {
    if (lastQueueEvent) {
      fetchDashboardData();
    }
  }, [lastQueueEvent]);

  // Find next upcoming appointment
  const nextAppointment = appointments.find(a => ['confirmed', 'waiting', 'checked_in'].includes(a.status));

  const handleCheckIn = async (aptId) => {
    try {
      const res = await api.post(`/appointments/${aptId}/check-in`, {
        smartCardId: cardData?.smartCardId || roleData?.smartCardId,
      });
      if (res.data.success) {
        alert(res.data.message);
        fetchDashboardData();
      }
    } catch (e) {
      alert(e.response?.data?.message || 'Check-in failed');
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary via-blue-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-blue-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Digital Smart Card Verified</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name}
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 max-w-xl">
            Smart Card ID: <span className="font-mono font-bold text-white bg-white/20 px-2 py-0.5 rounded">{cardData?.smartCardId || roleData?.smartCardId || 'SCN-2026-104582'}</span> • Blood Group: <span className="font-bold text-rose-300">{user?.bloodGroup || 'A+'}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/patient/book"
            className="px-4 py-2.5 bg-white text-primary font-bold text-xs rounded-xl shadow hover:bg-blue-50 transition flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Book Visit</span>
          </Link>
          <Link
            to="/patient/smart-card"
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl border border-white/20 transition flex items-center space-x-1.5"
          >
            <CreditCard className="w-4 h-4" />
            <span>View Card</span>
          </Link>
        </div>
      </div>

      {/* Grid: Smart Card Preview + Queue Tracker */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Smart Card Widget */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-sm font-bold text-slate-800">My Smart Card Pass</h3>
            <Link to="/patient/smart-card" className="text-xs text-primary font-medium hover:underline">
              Full Card Details →
            </Link>
          </div>
          <SmartCardWidget cardData={cardData || { name: user?.name, bloodGroup: user?.bloodGroup, smartCardId: roleData?.smartCardId }} />
        </div>

        {/* Right: Live Queue & Next Appointment */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-800 mb-3">Live Consultation Queue Telemetry</h3>
            <QueueTrackerWidget queueData={queueData} onRefresh={fetchDashboardData} />
          </div>

          {/* Next Appointment Card */}
          {nextAppointment ? (
            <div className="bg-white rounded-2xl p-5 shadow-card border border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Next Scheduled Consultation</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  nextAppointment.status === 'confirmed' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {nextAppointment.status.replace('_', ' ')}
                </span>
              </div>

              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-base font-bold text-slate-900">{nextAppointment.doctorName || 'Dr. Specialist'}</h4>
                  <p className="text-xs text-slate-500">{nextAppointment.department} • {nextAppointment.hospitalName}</p>
                  <p className="text-xs font-semibold text-primary mt-1">
                    📅 {nextAppointment.appointmentDate} at {nextAppointment.appointmentTime}
                  </p>
                </div>

                {nextAppointment.status === 'confirmed' && (
                  <button
                    onClick={() => handleCheckIn(nextAppointment._id)}
                    className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700 shadow-sm transition"
                  >
                    Check In Now
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-5 shadow-card border border-slate-100 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-800">No Upcoming Appointments</h4>
                <p className="text-xs text-slate-500">Need to see a doctor? Book a slot with top network hospitals.</p>
              </div>
              <Link
                to="/patient/book"
                className="px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-xl"
              >
                Book Now
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Recent Medical Records Snippet */}
      <div className="bg-white rounded-2xl p-6 shadow-card border border-slate-100 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Recent Clinical Encounters</h3>
            <p className="text-xs text-slate-500">Digital records stored under your Smart Card ID</p>
          </div>
          <Link to="/patient/medical-records" className="text-xs font-semibold text-primary hover:underline flex items-center space-x-1">
            <span>View Full Timeline</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentRecords.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">No recent consultations recorded.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentRecords.map((rec) => (
              <div key={rec._id} className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">{rec.diagnosis}</span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {new Date(rec.consultationDate || rec.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-slate-600">
                  Doctor: <span className="font-semibold text-slate-800">{rec.doctorName}</span> ({rec.hospitalName})
                </p>
                {rec.prescription && rec.prescription.length > 0 && (
                  <p className="text-[11px] text-primary font-medium">
                    Rx: {rec.prescription.map(p => p.medication).join(', ')}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
