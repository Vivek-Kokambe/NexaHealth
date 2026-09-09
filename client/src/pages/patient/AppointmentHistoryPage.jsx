import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Calendar, Clock, MapPin, CheckCircle2, AlertCircle, XCircle, ChevronRight } from 'lucide-react';

export default function AppointmentHistoryPage() {
  const { roleData } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/patients/appointments');
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
    fetchAppointments();
  }, []);

  const handleCheckIn = async (id) => {
    try {
      const res = await api.post(`/appointments/${id}/check-in`, {
        smartCardId: roleData?.smartCardId,
      });
      if (res.data.success) {
        alert(res.data.message);
        fetchAppointments();
      }
    } catch (e) {
      alert(e.response?.data?.message || 'Check in failed');
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      const res = await api.delete(`/appointments/${id}`);
      if (res.data.success) {
        alert(res.data.message);
        fetchAppointments();
      }
    } catch (e) {
      alert(e.response?.data?.message || 'Cancel failed');
    }
  };

  const filtered = appointments.filter(a => {
    if (filter === 'upcoming') return ['confirmed', 'waiting', 'checked_in', 'in_consultation'].includes(a.status);
    if (filter === 'past') return ['completed', 'cancelled', 'no_show'].includes(a.status);
    return true;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'in_consultation':
        return <span className="bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase animate-pulse">In Consultation</span>;
      case 'waiting':
        return <span className="bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase">Waiting in Queue</span>;
      case 'checked_in':
        return <span className="bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase">Checked In</span>;
      case 'confirmed':
        return <span className="bg-slate-100 text-slate-800 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase">Confirmed</span>;
      case 'completed':
        return <span className="bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase">Completed</span>;
      case 'cancelled':
        return <span className="bg-rose-100 text-rose-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase">Cancelled</span>;
      default:
        return <span className="bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Appointments & Queue Status</h1>
          <p className="text-xs text-slate-500 mt-1">Manage scheduled visits, check in via Smart Card, and review consultation history.</p>
        </div>

        <Link
          to="/patient/book"
          className="px-4 py-2 bg-primary text-white font-bold text-xs rounded-xl hover:bg-primary-dark transition shadow-sm self-start sm:self-auto"
        >
          + Book New Slot
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 pb-2">
        {['all', 'upcoming', 'past'].map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
              filter === tab ? 'bg-primary text-white' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500">Loading appointments...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center shadow-card border border-slate-100">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <h4 className="font-bold text-slate-700">No Appointments Recorded</h4>
          <p className="text-xs text-slate-500 mt-1">You do not have any {filter} appointments.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((apt) => (
            <div
              key={apt._id}
              className="bg-white rounded-2xl p-5 shadow-card border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs font-bold text-primary">{apt.appointmentNumber}</span>
                  {getStatusBadge(apt.status)}
                </div>

                <h3 className="font-bold text-slate-900 text-base">{apt.doctorName || 'Dr. Specialist'}</h3>
                <p className="text-xs text-slate-600 font-medium">
                  {apt.department} • <span className="text-slate-800 font-semibold">{apt.hospitalName}</span>
                </p>

                <div className="flex items-center space-x-4 text-xs text-slate-500">
                  <span>📅 {apt.appointmentDate}</span>
                  <span>⏰ {apt.appointmentTime}</span>
                  {apt.queuePosition > 0 && (
                    <span className="font-bold text-primary">Queue Token: #{apt.queuePosition}</span>
                  )}
                </div>

                {apt.reason && (
                  <p className="text-[11px] text-slate-500 italic">"{apt.reason}"</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                {apt.status === 'confirmed' && (
                  <button
                    onClick={() => handleCheckIn(apt._id)}
                    className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700 transition shadow-sm"
                  >
                    Check In
                  </button>
                )}

                {['waiting', 'checked_in', 'in_consultation'].includes(apt.status) && (
                  <Link
                    to="/patient/queue"
                    className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 transition shadow-sm"
                  >
                    Track Live Queue
                  </Link>
                )}

                {['confirmed', 'requested'].includes(apt.status) && (
                  <button
                    onClick={() => handleCancel(apt._id)}
                    className="px-3 py-2 text-rose-600 hover:bg-rose-50 font-semibold text-xs rounded-xl transition"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
