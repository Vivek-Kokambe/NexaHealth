import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Calendar, Clock, CheckCircle2, ShieldCheck, Layers } from 'lucide-react';

export default function DoctorSchedulePage() {
  const { user } = useAuth();

  const slots = [
    { day: 'Monday', time: '09:00 AM - 01:00 PM', capacity: 12, room: 'Chamber 4B' },
    { day: 'Wednesday', time: '09:00 AM - 01:00 PM', capacity: 12, room: 'Chamber 4B' },
    { day: 'Friday', time: '02:00 PM - 06:00 PM', capacity: 12, room: 'Cardio Suite 2' },
    { day: 'Saturday', time: '10:00 AM - 01:00 PM (Emergency)', capacity: 6, room: 'OPD Annex' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Physician Availability & Schedule Slots
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Weekly outpatient consultation hours configured for hospital appointments.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {slots.map((slot, idx) => (
          <div key={idx} className="bg-white rounded-2xl p-5 shadow-card border border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 text-sm">{slot.day}</span>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                Active Slot
              </span>
            </div>

            <div className="space-y-1 text-xs text-slate-600">
              <div className="flex items-center space-x-1.5 text-primary font-bold">
                <Clock className="w-4 h-4" />
                <span>{slot.time}</span>
              </div>
              <p>Chamber Location: <strong className="text-slate-800">{slot.room}</strong></p>
              <p>Patient Quota per Session: <strong>{slot.capacity} Patients</strong></p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
