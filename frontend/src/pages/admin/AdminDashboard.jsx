import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  Shield,
  Building2,
  Stethoscope,
  Users,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Activity,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar
} from 'recharts';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await api.get('/admin/dashboard');
        if (res.data.success) {
          setStats(res.data.stats);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const weeklyData = stats?.weeklyAppointments || [
    { day: 'Mon', count: 48, completed: 42 },
    { day: 'Tue', count: 62, completed: 58 },
    { day: 'Wed', count: 55, completed: 51 },
    { day: 'Thu', count: 71, completed: 68 },
    { day: 'Fri', count: 80, completed: 74 },
    { day: 'Sat', count: 45, completed: 40 },
    { day: 'Sun', count: 22, completed: 20 },
  ];

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-primary to-rose-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-0.5 rounded-full bg-white/10 text-rose-300 text-xs font-semibold mb-2">
            <Shield className="w-3.5 h-3.5" />
            <span>National Platform Oversight</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Administrator Command Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mt-1">
            Supervise accredited hospital registrations, verify specialist medical licenses, and audit system-wide health data access.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/admin/hospitals"
            className="px-4 py-2.5 bg-white text-slate-900 font-bold text-xs rounded-xl shadow hover:bg-slate-50 transition"
          >
            Hospital Approvals
          </Link>
          <Link
            to="/admin/audit-logs"
            className="px-4 py-2.5 bg-white/10 text-white font-semibold text-xs rounded-xl border border-white/20 hover:bg-white/20 transition flex items-center space-x-1"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Audit Trail</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-2xl shadow-card border border-slate-100">
          <span className="text-slate-400 text-[10px] uppercase font-bold">Total Users</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{stats?.totalUsers || 10}</div>
          <span className="text-[10px] text-slate-500">Registered</span>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-card border border-slate-100">
          <span className="text-slate-400 text-[10px] uppercase font-bold">Smart Cards</span>
          <div className="text-2xl font-black text-primary mt-1">{stats?.totalPatients || 3}</div>
          <span className="text-[10px] text-slate-500">Issued tokens</span>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-card border border-slate-100">
          <span className="text-slate-400 text-[10px] uppercase font-bold">Specialists</span>
          <div className="text-2xl font-black text-tealAccent mt-1">{stats?.totalDoctors || 3}</div>
          <span className="text-[10px] text-slate-500">Verified doctors</span>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-card border border-slate-100">
          <span className="text-slate-400 text-[10px] uppercase font-bold">Hospitals</span>
          <div className="text-2xl font-black text-indigo-600 mt-1">{stats?.totalHospitals || 3}</div>
          <span className="text-[10px] text-slate-500">Partner facilities</span>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-card border border-slate-100">
          <span className="text-slate-400 text-[10px] uppercase font-bold">Total Visits</span>
          <div className="text-2xl font-black text-amber-600 mt-1">{stats?.totalAppointments || 5}</div>
          <span className="text-[10px] text-slate-500">OPD sessions</span>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-card border border-slate-100">
          <span className="text-slate-400 text-[10px] uppercase font-bold">Pending Checks</span>
          <div className="text-2xl font-black text-rose-600 mt-1">
            {(stats?.pendingHospitals || 0) + (stats?.pendingDoctors || 0)}
          </div>
          <span className="text-[10px] text-rose-600 font-semibold">Requires action</span>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Weekly Platform Activity Chart */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl shadow-card border border-slate-100 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Weekly Platform OPD Volume</h3>
              <p className="text-xs text-slate-500">Scheduled vs Completed consultations</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData}>
                <XAxis dataKey="day" fontSize={11} stroke="#94a3b8" />
                <YAxis fontSize={11} stroke="#94a3b8" />
                <Tooltip />
                <Area type="monotone" dataKey="count" stroke="#1F2C8F" fill="#1F2C8F" fillOpacity={0.15} name="Total Bookings" />
                <Area type="monotone" dataKey="completed" stroke="#10B981" fill="#10B981" fillOpacity={0.2} name="Completed Visits" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Action Tasks */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl shadow-card border border-slate-100 space-y-4">
          <h3 className="font-bold text-slate-900 text-base">Administrative Tasks</h3>

          <div className="space-y-3 text-xs">
            <Link
              to="/admin/hospitals"
              className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 block transition"
            >
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-800">Review Hospital Credentials</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">Accreditation checks & operational license validation</p>
            </Link>

            <Link
              to="/admin/doctors"
              className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 block transition"
            >
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-800">Verify Doctor Licenses</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">Medical Council registration number verification</p>
            </Link>

            <Link
              to="/admin/audit-logs"
              className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 block transition"
            >
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-800">Inspect Compliance Audit Trail</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">Track every medical record query & login event</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
