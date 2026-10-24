import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  CreditCard,
  Calendar,
  Clock,
  FileText,
  Pill,
  FolderOpen,
  User,
  Users,
  Search,
  Building2,
  Stethoscope,
  ShieldAlert,
  BarChart3,
  CheckCircle,
  Headphones,
  Settings,
  Layers
} from 'lucide-react';

export default function Sidebar() {
  const { user } = useAuth();
  if (!user) return null;

  const getNavItems = () => {
    switch (user.role) {
      case 'patient':
        return [
          { name: 'Dashboard', path: '/patient/dashboard', icon: LayoutDashboard },
          { name: 'Smart Card', path: '/patient/smart-card', icon: CreditCard },
          { name: 'Book Appointment', path: '/patient/book', icon: Calendar },
          { name: 'My Appointments', path: '/patient/appointments', icon: Clock },
          { name: 'Live Queue Tracking', path: '/patient/queue', icon: Clock },
          { name: 'Medical Records', path: '/patient/medical-records', icon: FileText },
          { name: 'Prescriptions', path: '/patient/prescriptions', icon: Pill },
          { name: 'Reports & Documents', path: '/patient/reports', icon: FolderOpen },
          { name: 'Profile & Settings', path: '/patient/profile', icon: User },
        ];
      case 'doctor':
        return [
          { name: 'Dashboard', path: '/doctor/dashboard', icon: LayoutDashboard },
          { name: 'Today’s Appointments', path: '/doctor/appointments', icon: Calendar },
          { name: 'Live Patient Queue', path: '/doctor/queue', icon: Clock },
          { name: 'Smart Card Lookup', path: '/doctor/lookup', icon: Search },
          { name: 'Add Consultation', path: '/doctor/consultation', icon: FileText },
          { name: 'My Schedule & Slots', path: '/doctor/schedule', icon: Layers },
          { name: 'Doctor Profile', path: '/doctor/profile', icon: Stethoscope },
        ];
      case 'hospital':
        return [
          { name: 'Dashboard', path: '/hospital/dashboard', icon: LayoutDashboard },
          { name: 'Hospital Profile', path: '/hospital/profile', icon: Building2 },
          { name: 'Doctors Management', path: '/hospital/doctors', icon: Stethoscope },
          { name: 'Appointments & Queue', path: '/hospital/appointments', icon: Clock },
          { name: 'Patient Directory', path: '/hospital/patients', icon: Users },
          { name: 'Hospital Analytics', path: '/hospital/analytics', icon: BarChart3 },
          { name: 'Departments & Services', path: '/hospital/departments', icon: Layers },
        ];
      case 'admin':
        return [
          { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
          { name: 'Hospital Approvals', path: '/admin/hospitals', icon: Building2 },
          { name: 'Doctor Approvals', path: '/admin/doctors', icon: Stethoscope },
          { name: 'User Management', path: '/admin/users', icon: Users },
          { name: 'Platform Audit Logs', path: '/admin/audit-logs', icon: ShieldAlert },
          { name: 'Complaints & Support', path: '/admin/complaints', icon: Headphones },
          { name: 'System Analytics', path: '/admin/analytics', icon: BarChart3 },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <aside className="w-64 bg-white border-r border-slate-200/80 min-h-[calc(100vh-4rem)] flex flex-col justify-between p-4 shadow-xs">
      <div className="space-y-6">
        {/* User Role Banner */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center space-x-3">
          <img
            src={user.profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80'}
            alt={user.name}
            className="w-10 h-10 rounded-xl object-cover border border-slate-200"
          />
          <div className="min-w-0">
            <h5 className="font-bold text-slate-800 text-xs truncate">{user.name}</h5>
            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-primary">
              {user.role} Portal
            </span>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? 'bg-primary text-white shadow-sm shadow-primary/20'
                      : 'text-slate-600 hover:text-primary hover:bg-slate-50'
                  }`
                }
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400 text-center">
        <p className="font-semibold text-slate-600">SmartCare v1.0.0</p>
        <p className="text-[10px] text-slate-400">HIPAA & HL7 Fast-Track Compliant Demo</p>
      </div>
    </aside>
  );
}
