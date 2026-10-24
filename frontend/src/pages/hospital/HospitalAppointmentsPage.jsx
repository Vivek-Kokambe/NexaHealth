import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Search, Calendar, Clock, Filter } from 'lucide-react';

export default function HospitalAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/hospitals/hosp_1/appointments');
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

  const filtered = appointments.filter(a => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      a.patientName?.toLowerCase().includes(term) ||
      a.smartCardId?.toLowerCase().includes(term) ||
      a.appointmentNumber?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Hospital Appointments & Queue Manager
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Search patients by Smart Card ID, check queue statuses, and monitor attendance.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search Smart Card / Name / Token..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500">Loading appointments...</div>
      ) : (
        <div className="bg-white rounded-3xl shadow-card border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 text-[11px] uppercase font-bold">
                  <th className="p-4">Token #</th>
                  <th className="p-4">Patient</th>
                  <th className="p-4">Smart Card ID</th>
                  <th className="p-4">Doctor</th>
                  <th className="p-4">Date & Time</th>
                  <th className="p-4">Queue Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((apt) => (
                  <tr key={apt._id} className="hover:bg-slate-50/50">
                    <td className="p-4 font-mono font-bold text-primary">{apt.appointmentNumber}</td>
                    <td className="p-4 font-semibold text-slate-800">{apt.patientName}</td>
                    <td className="p-4 font-mono text-slate-600">{apt.smartCardId}</td>
                    <td className="p-4 text-slate-700">{apt.doctorName || 'Specialist'}</td>
                    <td className="p-4 text-slate-500">{apt.appointmentDate} • {apt.appointmentTime}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-100 text-blue-800">
                        {apt.status.replace('_', ' ')}
                      </span>
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
