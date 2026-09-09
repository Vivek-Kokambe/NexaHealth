import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { UserCheck, Shield, Stethoscope, Building2, User, ChevronUp, ChevronDown } from 'lucide-react';

export default function RoleQuickSwitcher() {
  const { user, quickDemoLogin } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [switching, setSwitching] = useState(false);

  const roles = [
    {
      id: 'patient',
      label: 'Patient (Rahul)',
      icon: <User className="w-3.5 h-3.5" />,
      color: 'bg-blue-600',
      path: '/patient/dashboard',
    },
    {
      id: 'doctor',
      label: 'Doctor (Dr. Ananya)',
      icon: <Stethoscope className="w-3.5 h-3.5" />,
      color: 'bg-teal-600',
      path: '/doctor/dashboard',
    },
    {
      id: 'hospital',
      label: 'Hospital (Apollo)',
      icon: <Building2 className="w-3.5 h-3.5" />,
      color: 'bg-indigo-600',
      path: '/hospital/dashboard',
    },
    {
      id: 'admin',
      label: 'Admin (Dr. Mehta)',
      icon: <Shield className="w-3.5 h-3.5" />,
      color: 'bg-rose-600',
      path: '/admin/dashboard',
    },
  ];

  const handleSwitch = async (r) => {
    try {
      setSwitching(true);
      await quickDemoLogin(r.id);
      navigate(r.path);
      setIsOpen(false);
    } catch (e) {
      console.error(e);
    } finally {
      setSwitching(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-700/80 overflow-hidden text-xs">
        {/* Toggle Bar */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 px-3.5 py-2.5 hover:bg-slate-800/80 transition w-full text-left"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-semibold text-slate-200">Demo Role Switcher</span>
          {user && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-500/30 text-blue-300">
              {user.role}
            </span>
          )}
          {isOpen ? <ChevronDown className="w-4 h-4 ml-1 text-slate-400" /> : <ChevronUp className="w-4 h-4 ml-1 text-slate-400" />}
        </button>

        {/* Dropdown Options */}
        {isOpen && (
          <div className="p-3 border-t border-slate-800 space-y-1.5 bg-slate-950/90 w-56">
            <p className="text-[10px] text-slate-400 mb-2">Switch instantly between pre-configured prototype personas:</p>
            {roles.map((r) => {
              const isActive = user?.role === r.id;
              return (
                <button
                  key={r.id}
                  disabled={switching}
                  onClick={() => handleSwitch(r)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left transition ${
                    isActive
                      ? 'bg-white/10 text-white font-bold border border-white/20'
                      : 'text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <div className={`p-1 rounded-md text-white ${r.color}`}>
                      {r.icon}
                    </div>
                    <span>{r.label}</span>
                  </div>
                  {isActive && <span className="text-[9px] text-emerald-400 font-bold uppercase">Active</span>}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
