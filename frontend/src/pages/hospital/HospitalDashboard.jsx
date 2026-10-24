import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  Building2,
  Users,
  Clock,
  CheckCircle2,
  Stethoscope,
  Activity,
  Bed,
  Search,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export default function HospitalDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHospitalData = async () => {
      try {
        setLoading(true);
        const hospId = 'hosp_1'; // default demo hospital
        const [statRes, aptRes] = await Promise.all([
          api.get(`/hospitals/${hospId}/analytics`),
          api.get(`/hospitals/${hospId}/appointments`),
        ]);

        if (statRes.data.success) setStats(statRes.data.stats);
        if (aptRes.data.success) setAppointments(aptRes.data.appointments || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchHospitalData();
  }, []);

  const pieData = [
    { name: 'Completed', value: stats?.completed || 1, color: '#10B981' },
    { name: 'Waiting in Queue', value: stats?.waiting || 2, color: '#F59E0B' },
    { name: 'In Chamber', value: stats?.inConsultation || 1, color: '#1F2C8F' },
  ];

  const deptData = stats?.departmentBreakdown || [
    { name: 'Cardiology', appointments: 12, waitTimeAvg: 18 },
    { name: 'Neurology', appointments: 8, waitTimeAvg: 22 },
    { name: 'Pediatrics', appointments: 15, waitTimeAvg: 12 },
    { name: 'Orthopedics', appointments: 6, waitTimeAvg: 15 },
  ];

  return (
    <div className="space-y-8">
      {/* Hospital Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-primary to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-0.5 rounded-full bg-white/10 text-indigo-200 text-xs font-semibold mb-2">
            <Building2 className="w-3.5 h-3.5" />
            <span>Hospital Administration Command</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Apollo Central Hospital, Mumbai
          </h1>
          <p className="text-xs sm:text-sm text-indigo-100 max-w-xl mt-1">
            Real-time outpatient footfall, bed occupancy status, and multi-department queue telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/hospital/appointments"
            className="px-4 py-2.5 bg-white text-indigo-900 font-bold text-xs rounded-xl shadow hover:bg-slate-50 transition"
          >
            Live OPD Queue
          </Link>
          <Link
            to="/hospital/doctors"
            className="px-4 py-2.5 bg-white/10 text-white font-semibold text-xs rounded-xl border border-white/20 hover:bg-white/20 transition"
          >
            Doctors Roster
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-card border border-slate-100">
          <span className="text-slate-400 text-xs uppercase font-medium">Total Appointments</span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">{stats?.totalToday || 5}</div>
          <span className="text-[11px] text-slate-500">Today's scheduled OPD</span>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-card border border-slate-100">
          <span className="text-slate-400 text-xs uppercase font-medium">Waiting Patients</span>
          <div className="text-2xl sm:text-3xl font-black text-amber-600 mt-1">{stats?.waiting || 2}</div>
          <span className="text-[11px] text-slate-500">Checked-in waiting lounge</span>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-card border border-slate-100">
          <span className="text-slate-400 text-xs uppercase font-medium">Active Specialists</span>
          <div className="text-2xl sm:text-3xl font-black text-primary mt-1">{stats?.activeDoctors || 3}</div>
          <span className="text-[11px] text-slate-500">On duty right now</span>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-card border border-slate-100">
          <span className="text-slate-400 text-xs uppercase font-medium">Bed Occupancy</span>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1">{stats?.bedOccupancyRate || 84}%</div>
          <span className="text-[11px] text-slate-500">28 ICU Beds Free</span>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Department Volume Bar Chart */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl shadow-card border border-slate-100 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">Department Patient Volume & Wait Times</h3>
            <span className="text-xs text-slate-400">Average minutes</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData}>
                <XAxis dataKey="name" fontSize={11} stroke="#94a3b8" />
                <YAxis fontSize={11} stroke="#94a3b8" />
                <Tooltip />
                <Bar dataKey="appointments" fill="#1F2C8F" radius={[6, 6, 0, 0]} name="Appointments" />
                <Bar dataKey="waitTimeAvg" fill="#0F766E" radius={[6, 6, 0, 0]} name="Avg Wait Time (min)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Appointment Status Pie Chart */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl shadow-card border border-slate-100 space-y-4 flex flex-col justify-between">
          <h3 className="font-bold text-slate-900 text-base">Queue Breakdown</h3>

          <div className="h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1 text-xs">
            {pieData.map((item, i) => (
              <div key={i} className="flex justify-between items-center text-slate-600">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span>{item.name}</span>
                </div>
                <span className="font-bold text-slate-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Real-time Appointments Table */}
      <div className="bg-white rounded-2xl p-6 shadow-card border border-slate-100 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Today's Hospital Outpatient Queue</h3>
            <p className="text-xs text-slate-500">Live check-in feed across all departments</p>
          </div>
          <Link to="/hospital/appointments" className="text-xs font-semibold text-primary hover:underline">
            View All →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 text-[11px] uppercase font-semibold">
                <th className="p-3">Appointment #</th>
                <th className="p-3">Patient Name</th>
                <th className="p-3">Smart Card ID</th>
                <th className="p-3">Specialist</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {appointments.slice(0, 5).map((apt) => (
                <tr key={apt._id} className="hover:bg-slate-50/50">
                  <td className="p-3 font-mono font-bold text-primary">{apt.appointmentNumber}</td>
                  <td className="p-3 font-semibold text-slate-800">{apt.patientName}</td>
                  <td className="p-3 font-mono text-slate-500">{apt.smartCardId}</td>
                  <td className="p-3 text-slate-700">{apt.doctorName || 'Dr. Specialist'}</td>
                  <td className="p-3">
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
    </div>
  );
}
