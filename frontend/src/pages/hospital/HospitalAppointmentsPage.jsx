import React, { useCallback, useEffect, useState } from 'react';
import { AlertCircle, Calendar, CheckCircle2, Clock, RefreshCw, Search, XCircle } from 'lucide-react';
import api from '../../services/api';

export default function HospitalAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busyAppointmentId, setBusyAppointmentId] = useState('');

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/hospitals/appointments');
      setAppointments(response.data.appointments || []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message || 'Unable to load appointment requests.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleRequest = async (appointment, status) => {
    const action = status === 'CONFIRMED' ? 'confirm' : 'decline';
    if (!window.confirm(`Are you sure you want to ${action} request ${appointment.appointmentNumber}?`)) return;

    try {
      setBusyAppointmentId(appointment._id);
      setError('');
      setNotice('');
      const response = await api.patch(`/hospitals/appointments/${appointment._id}`, { status });
      setNotice(response.data.message);
      await fetchAppointments();
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message || `Unable to ${action} this request.`);
    } finally {
      setBusyAppointmentId('');
    }
  };

  const term = search.trim().toLowerCase();
  const filteredAppointments = appointments.filter((appointment) => (
    !term
    || appointment.patientName?.toLowerCase().includes(term)
    || appointment.appointmentNumber?.toLowerCase().includes(term)
    || appointment.department?.toLowerCase().includes(term)
  ));
  const pendingCount = appointments.filter((appointment) => appointment.status === 'requested').length;

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">Appointment requests</h1>
          <p className="mt-1 text-sm text-slate-500">
            Review preferred department, date, and time; confirm or decline requests for your hospital.
          </p>
        </div>
        <button type="button" onClick={fetchAppointments} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </header>

      <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
        <label className="relative block">
          <span className="sr-only">Search appointment requests</span>
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <input
            type="search"
            placeholder="Search patient, department, or request number..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </label>
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-800">
          {pendingCount} awaiting confirmation
        </div>
      </div>

      {error && (
        <div role="alert" className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> <span>{error}</span>
        </div>
      )}
      {notice && (
        <div role="status" className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> <span>{notice}</span>
        </div>
      )}

      {loading ? (
        <div className="rounded-3xl border border-slate-100 bg-white p-12 text-center text-sm text-slate-500 shadow-card">
          Loading appointment requests...
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="rounded-3xl border border-slate-100 bg-white p-12 text-center shadow-card">
          <Calendar className="mx-auto h-10 w-10 text-slate-300" />
          <h2 className="mt-3 font-bold text-slate-800">No appointment requests found</h2>
          <p className="mt-1 text-sm text-slate-500">
            {search ? 'Try a different search.' : 'Requests from patients will appear here.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((appointment) => {
            const isPending = appointment.status === 'requested';
            const isBusy = busyAppointmentId === appointment._id;

            return (
              <article key={appointment._id} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-sm font-bold text-primary">{appointment.appointmentNumber}</span>
                      <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${
                        isPending ? 'bg-amber-100 text-amber-800' : appointment.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {isPending ? 'Awaiting confirmation' : appointment.status}
                      </span>
                    </div>
                    <h2 className="text-base font-bold text-slate-900">{appointment.patientName}</h2>
                    <p className="text-sm text-slate-600">
                      {appointment.department} · {appointment.patientPhone || 'Phone not provided'}
                    </p>
                    <p className="flex items-center gap-2 text-sm text-slate-600">
                      <Calendar className="h-4 w-4 text-slate-400" /> {appointment.appointmentDate}
                      <Clock className="ml-2 h-4 w-4 text-slate-400" /> {appointment.appointmentTime}
                    </p>
                    {appointment.reason && <p className="text-sm text-slate-500">Reason: {appointment.reason}</p>}
                  </div>

                  {isPending && (
                    <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                      <button type="button" onClick={() => handleRequest(appointment, 'CANCELLED')} disabled={isBusy} className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-50">
                        <XCircle className="h-4 w-4" /> Decline
                      </button>
                      <button type="button" onClick={() => handleRequest(appointment, 'CONFIRMED')} disabled={isBusy} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50">
                        <CheckCircle2 className="h-4 w-4" /> {isBusy ? 'Saving...' : 'Confirm'}
                      </button>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
