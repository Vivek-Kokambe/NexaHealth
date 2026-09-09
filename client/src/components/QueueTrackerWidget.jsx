import React from 'react';
import { Clock, Users, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function QueueTrackerWidget({ queueData, onRefresh }) {
  if (!queueData || !queueData.hasActiveQueue) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-card border border-slate-100 text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 mx-auto flex items-center justify-center">
          <Clock className="w-6 h-6" />
        </div>
        <div>
          <h4 className="font-semibold text-slate-800 text-sm">No Active Queue Status</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            You do not currently have a consultation in the waiting queue. Check in to your today's appointment or book a new slot.
          </p>
        </div>
        <Link
          to="/appointments"
          className="inline-flex items-center space-x-1 text-xs font-semibold text-primary hover:text-secondary pt-1"
        >
          <span>View My Appointments</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    );
  }

  const q = queueData.queueDetails;
  const isConsulting = q.status === 'in_consultation';
  const isWaiting = q.status === 'waiting' || q.status === 'checked_in';

  return (
    <div className="bg-white rounded-2xl p-6 shadow-card border border-slate-100 relative overflow-hidden">
      {/* Real-time sync badge */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
        <div className="flex items-center space-x-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Live Hospital Queue</span>
        </div>
        <span className="text-[11px] font-mono text-slate-400">APT: {q.appointmentNumber}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center items-center py-2">
        {/* Queue Position */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
          <span className="text-xs text-slate-500 font-medium uppercase">Queue Position</span>
          <div className="text-4xl font-extrabold text-primary mt-1">
            {isConsulting ? (
              <span className="text-emerald-600 text-2xl">NOW</span>
            ) : (
              `#${q.queuePosition || 1}`
            )}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {isConsulting ? 'In Doctor Chamber' : `${q.totalWaiting || 1} patients in line`}
          </span>
        </div>

        {/* Estimated Wait Time */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
          <span className="text-xs text-slate-500 font-medium uppercase">Est. Wait Time</span>
          <div className="text-4xl font-extrabold text-amber-600 mt-1 flex items-center justify-center space-x-1">
            <span>{isConsulting ? 0 : (q.estimatedWaitMinutes || 15)}</span>
            <span className="text-sm font-medium text-slate-600">min</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Subject to emergency cases</span>
        </div>

        {/* Status indicator */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
          <span className="text-xs text-slate-500 font-medium uppercase">Current Status</span>
          <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-800">
            {q.status.replace('_', ' ')}
          </div>
          <p className="text-[11px] text-slate-500 mt-2 truncate">{q.hospitalName}</p>
        </div>
      </div>

      {/* Doctor & Chamber Details */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
            Dr
          </div>
          <div>
            <p className="font-semibold text-slate-800">{q.doctorName}</p>
            <p className="text-[11px] text-slate-500">{q.department} Department</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span className="text-slate-500 text-[11px]">Smart Card Auto-Verified</span>
        </div>
      </div>
    </div>
  );
}
