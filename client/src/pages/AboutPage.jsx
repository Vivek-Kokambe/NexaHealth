import React from 'react';
import { Activity, ShieldCheck, Heart, Award } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold uppercase tracking-widest text-primary">About Our Mission</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">SmartCare Health Network</h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
          Unifying Indian healthcare through intelligent patient cards, connected clinical records, and transparent queue tracking.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-card border border-slate-100 space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed">
        <h3 className="text-lg font-bold text-slate-900">Connected Care. Smarter Health.</h3>
        <p>
          SmartCare Health Network was conceived to resolve one of the largest challenges in modern healthcare: fragmentation. Today, when patients move between different clinics, hospitals, or diagnostic labs, their health records remain stranded in disconnected silos.
        </p>
        <p>
          By equipping every registered patient with a unique <strong>Smart Card ID</strong>, SmartCare establishes a secure, portable digital bridge. Authorized doctors can instantly review critical allergies, past prescriptions, and diagnostic scans, dramatically reducing medical errors and avoiding duplicate diagnostic procedures.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
          <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-100">
            <h4 className="font-bold text-primary mb-1">Our Core Vision</h4>
            <p className="text-xs text-slate-600">Universal access to portable, private, and verified medical data at the point of care.</p>
          </div>
          <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-100">
            <h4 className="font-bold text-emerald-800 mb-1">Queue Transparency</h4>
            <p className="text-xs text-slate-600">Zero waiting room confusion through real-time telemetry and scheduled appointment slots.</p>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 text-xs text-slate-500">
          <strong>Compliance Disclaimer:</strong> SmartCare Health Network is developed as an educational prototype and research demonstration for unified health tech architecture. It is not a certified production medical device.
        </div>
      </div>
    </div>
  );
}
