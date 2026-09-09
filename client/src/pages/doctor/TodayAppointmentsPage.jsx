import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Calendar, Clock, CheckCircle2, User, Search, Stethoscope, ArrowRight } from 'lucide-react';

export default function TodayAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/doctors/appointments');
      if (res.data.success) {
        setAppointments(res.data.appointments || []);
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

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await api.put(`/doctors/appointments/${id}/status`, { status });
      if (res.data.success) {
        fetchAppointments();
      }
    } catch (e) {
      alert('Failed to update status');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Today's Appointments Roster
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Review patient appointments, check queue statuses, and advance consultations.
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500">Loading appointment list...</div>
      ) : appointments.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center shadow-card border border-slate-100">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <h4 className="font-bold text-slate-700">No Appointments Scheduled</h4>
          <p className="text-xs text-slate-500 mt-1">There are no booked patient slots on your calendar.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-card border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/75 text-slate-500 border-b border-slate-200 text-[11px] uppercase font-bold tracking-wider">
                  <th className="p-4">Queue #</th>
                  <th className="p-4">Patient Name</th>
                  <th className="p-4">Smart Card ID</th>
                  <th className="p-4">Slot Time</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {appointments.map((apt) => (
                  <tr key={apt._id} className="hover:bg-slate-50/50">
                    <td className="p-4 font-mono font-bold text-primary">
                      {apt.queuePosition ? `#${apt.queuePosition}` : '—'}
                    </td>
                    <td className="p-4 font-semibold text-slate-800">
                      {apt.patientName}
                      <span className="block text-[10px] text-slate-400 font-normal">{apt.patientPhone}</span>
                    </td>
                    <td className="p-4 font-mono text-slate-600">
                      {apt.smartCardId}
                    </td>
                    <td className="p-4 text-slate-700">
                      {apt.appointmentDate} • {apt.appointmentTime}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        apt.status === 'in_consultation' ? 'bg-emerald-100 text-emerald-800' :
                        apt.status === 'waiting' ? 'bg-amber-100 text-amber-800' :
                        apt.status === 'completed' ? 'bg-slate-100 text-slate-600' : 'bg-blue-50 text-primary'
                      }`}>
                        {apt.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <Link
                        to={`/doctor/lookup?id=${apt.smartCardId}`}
                        className="px-2.5 py-1 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 text-[11px]"
                      >
                        History
                      </Link>

                      {apt.status !== 'in_consultation' && apt.status !== 'completed' && (
                        <button
                          onClick={() => handleUpdateStatus(apt._id, 'in_consultation')}
                          className="px-2.5 py-1 bg-primary text-white font-bold rounded-lg hover:bg-primary-dark text-[11px]"
                        >
                          Call In
                        </button>
                      )}

                      {apt.status === 'in_consultation' && (
                        <Link
                          to={`/doctor/consultation?aptId=${apt._id}&patId=${apt.patientId}`}
                          className="px-2.5 py-1 bg-tealAccent text-white font-bold rounded-lg hover:bg-teal-700 text-[11px]"
                        >
                          Prescribe
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
