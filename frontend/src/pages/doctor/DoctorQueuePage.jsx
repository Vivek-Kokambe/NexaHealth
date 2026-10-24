import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import { Clock, Users, ArrowRight, UserCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DoctorQueuePage() {
  const { lastQueueEvent } = useSocket();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchQueue = async () => {
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
    fetchQueue();
  }, []);

  useEffect(() => {
    if (lastQueueEvent) {
      fetchQueue();
    }
  }, [lastQueueEvent]);

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await api.put(`/doctors/appointments/${id}/status`, { status });
      if (res.data.success) {
        fetchQueue();
      }
    } catch (e) {
      alert(e.response?.data?.message || 'Status update failed');
    }
  };

  const queueList = appointments.filter(a => ['waiting', 'checked_in', 'in_consultation'].includes(a.status));

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Live Patient Waiting Queue
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time chamber waiting list. Status adjustments stream instantly to patients' phones via WebSocket.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          <span>Live Sync Active</span>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500">Loading queue telemetry...</div>
      ) : queueList.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center shadow-card border border-slate-100">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <h3 className="font-bold text-slate-700">Waiting Queue is Empty</h3>
          <p className="text-xs text-slate-500 mt-1">Checked-in patients will automatically appear in this waiting queue.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {queueList.map((apt) => {
            const isConsulting = apt.status === 'in_consultation';
            return (
              <div
                key={apt._id}
                className={`bg-white rounded-2xl p-5 shadow-card border transition flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isConsulting ? 'border-2 border-primary bg-blue-50/30' : 'border-slate-100'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-2xl font-black text-lg flex items-center justify-center flex-shrink-0 ${
                    isConsulting ? 'bg-primary text-white' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {isConsulting ? 'NOW' : `#${apt.queuePosition || 1}`}
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-bold text-slate-900 text-base">{apt.patientName}</h4>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        isConsulting ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {apt.status.replace('_', ' ')}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 mt-0.5">
                      Smart Card: <span className="font-mono font-semibold text-slate-700">{apt.smartCardId}</span> • Blood: <span className="text-rose-600 font-bold">{apt.patientBloodGroup || 'O+'}</span>
                    </p>
                    <p className="text-[11px] text-slate-500 italic mt-0.5">Reason: "{apt.reason}"</p>
                  </div>
                </div>

                {/* Queue Actions */}
                <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <Link
                    to={`/doctor/lookup?id=${apt.smartCardId}`}
                    className="px-3 py-1.5 bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-100 border border-slate-200"
                  >
                    Clinical Records
                  </Link>

                  {!isConsulting ? (
                    <button
                      onClick={() => handleUpdateStatus(apt._id, 'in_consultation')}
                      className="px-4 py-1.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-dark transition shadow-xs"
                    >
                      Call into Chamber
                    </button>
                  ) : (
                    <>
                      <Link
                        to={`/doctor/consultation?aptId=${apt._id}&patId=${apt.patientId}`}
                        className="px-3.5 py-1.5 bg-tealAccent text-white text-xs font-bold rounded-xl hover:bg-teal-700 transition"
                      >
                        Prescribe & Record
                      </Link>
                      <button
                        onClick={() => handleUpdateStatus(apt._id, 'completed')}
                        className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700"
                      >
                        Complete
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => handleUpdateStatus(apt._id, 'no_show')}
                    className="px-2.5 py-1.5 text-rose-600 hover:bg-rose-50 text-xs font-semibold rounded-xl"
                  >
                    No-Show
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
