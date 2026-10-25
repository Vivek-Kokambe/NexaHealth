import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  BedDouble,
  Building2,
  CalendarDays,
  Clock3,
  Info,
  RefreshCw,
  Stethoscope,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import api from '../../services/api';

const statusColors = {
  REQUESTED: '#F59E0B',
  CONFIRMED: '#10B981',
  CANCELLED: '#94A3B8',
};

const statusLabel = (status) => ({
  requested: 'Awaiting confirmation',
  confirmed: 'Confirmed',
  cancelled: 'Cancelled',
}[status] || status);

export default function HospitalDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchAnalytics = useCallback(async (background = false) => {
    try {
      if (background) setRefreshing(true);
      else setLoading(true);
      setError('');
      const response = await api.get('/hospitals/me/analytics');
      setData(response.data);
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message || 'Unable to load live hospital analytics.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
    const refreshTimer = window.setInterval(() => fetchAnalytics(true), 15000);
    return () => window.clearInterval(refreshTimer);
  }, [fetchAnalytics]);

  if (loading) {
    return <div className="p-12 text-center text-sm text-slate-500">Loading hospital analytics...</div>;
  }

  const hospital = data?.hospital;
  const analytics = data?.analytics;
  const chartStatuses = [
    { name: 'Awaiting confirmation', value: analytics?.requested || 0, color: statusColors.REQUESTED },
    { name: 'Confirmed', value: analytics?.confirmed || 0, color: statusColors.CONFIRMED },
    { name: 'Cancelled', value: analytics?.cancelled || 0, color: statusColors.CANCELLED },
  ].filter((item) => item.value > 0);
  const departmentData = analytics?.departments || [];

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-5 rounded-3xl bg-gradient-to-r from-indigo-900 via-primary to-slate-900 p-6 text-white shadow-xl sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div>
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-indigo-100">
            <Building2 className="h-3.5 w-3.5" /> Hospital administration
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
            {hospital?.name || 'Hospital dashboard'}{hospital?.city ? `, ${hospital.city}` : ''}
          </h1>
          <p className="mt-1 max-w-xl text-sm text-indigo-100">
            Live appointment requests and department activity for {analytics?.date || 'today'}.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => fetchAnalytics(true)} disabled={refreshing} className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-semibold text-white hover:bg-white/20 disabled:opacity-60">
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
          </button>
          <Link to="/hospital/appointments" className="rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-indigo-900 shadow transition hover:bg-slate-50">
            Appointment requests
          </Link>
        </div>
      </header>

      {error && (
        <div role="alert" className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> <span>{error}</span>
        </div>
      )}

      {!data && !error ? (
        <div className="rounded-2xl bg-white p-8 text-center text-sm text-slate-500">No analytics data is available yet.</div>
      ) : data ? (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <MetricCard icon={CalendarDays} title="Today's requests" value={analytics.totalToday} note={`${analytics.confirmed} confirmed`} color="text-primary" />
            <MetricCard icon={Clock3} title="Awaiting confirmation" value={analytics.requested} note="Needs your review" color="text-amber-600" />
            <MetricCard icon={Stethoscope} title="Registered doctors" value={analytics.doctorCount} note="Linked to this hospital" color="text-indigo-700" />
            <MetricCard icon={BedDouble} title="Bed capacity" value={analytics.totalBeds ?? '—'} note={`${analytics.icuBeds ?? '—'} ICU beds`} color="text-emerald-700" />
          </div>
          <div className="flex items-start gap-2 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-xs leading-5 text-blue-900">
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            <span>Bed capacity reflects configured totals only. Bed occupancy and average wait time are unavailable because the system does not yet collect those measurements.</span>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
            <section className="space-y-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-card lg:col-span-8 sm:p-6">
              <div>
                <h2 className="font-bold text-slate-900">Today's requests by department</h2>
                <p className="mt-1 text-xs text-slate-500">Counts include requests, confirmed visits, and cancellations recorded today.</p>
              </div>
              {departmentData.length === 0 ? (
                <EmptyChart message="Add departments in Departments & Services to start tracking activity." />
              ) : (
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={departmentData} margin={{ top: 8, right: 8, left: -18, bottom: 28 }}>
                      <XAxis dataKey="name" angle={-20} textAnchor="end" interval={0} height={55} fontSize={11} stroke="#94a3b8" />
                      <YAxis allowDecimals={false} fontSize={11} stroke="#94a3b8" />
                      <Tooltip />
                      <Bar dataKey="appointments" fill="#1F2C8F" radius={[6, 6, 0, 0]} name="Appointment requests" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </section>

            <section className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-5 shadow-card lg:col-span-4 sm:p-6">
              <div>
                <h2 className="font-bold text-slate-900">Today's request status</h2>
                <p className="mt-1 text-xs text-slate-500">Live status counts for your hospital.</p>
              </div>
              {chartStatuses.length === 0 ? (
                <EmptyChart message="No appointment activity has been recorded today." />
              ) : (
                <>
                  <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={chartStatuses} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={48} outerRadius={72} paddingAngle={4}>
                          {chartStatuses.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2 text-xs">
                    {chartStatuses.map((item) => (
                      <div key={item.name} className="flex items-center justify-between text-slate-600">
                        <span className="flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                          {item.name}
                        </span>
                        <strong className="text-slate-900">{item.value}</strong>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </section>
          </div>

          <section className="space-y-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-card sm:p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-bold text-slate-900">Today's appointment activity</h2>
                <p className="mt-1 text-xs text-slate-500">
                  Updated {analytics.refreshedAt ? new Date(analytics.refreshedAt).toLocaleTimeString() : 'just now'} · refreshes every 15 seconds
                </p>
              </div>
              <Link to="/hospital/appointments" className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
                Manage requests <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            {analytics.appointments.length === 0 ? (
              <p className="rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-500">No appointments are recorded for today.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[620px] text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-[10px] uppercase text-slate-500">
                      <th className="p-3">Request #</th>
                      <th className="p-3">Patient</th>
                      <th className="p-3">Department</th>
                      <th className="p-3">Preferred time</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {analytics.appointments.map((appointment) => (
                      <tr key={appointment.id}>
                        <td className="p-3 font-mono font-bold text-primary">{appointment.appointmentNumber}</td>
                        <td className="p-3 font-semibold text-slate-800">{appointment.patientName}</td>
                        <td className="p-3 text-slate-700">{appointment.department}</td>
                        <td className="p-3 text-slate-600">{appointment.appointmentTime}</td>
                        <td className="p-3">
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-700">
                            {statusLabel(appointment.status)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      ) : null}
    </div>
  );
}

function MetricCard({ icon: Icon, title, value, note, color }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-card sm:p-5">
      <span className="flex items-center gap-2 text-xs font-medium uppercase text-slate-400">
        <Icon className={`h-4 w-4 ${color}`} /> {title}
      </span>
      <div className={`mt-2 text-2xl font-black sm:text-3xl ${color}`}>{value ?? 0}</div>
      <span className="text-[11px] text-slate-500">{note}</span>
    </div>
  );
}

function EmptyChart({ message }) {
  return (
    <div className="flex h-56 items-center justify-center rounded-xl bg-slate-50 px-5 text-center text-sm text-slate-500">
      {message}
    </div>
  );
}
