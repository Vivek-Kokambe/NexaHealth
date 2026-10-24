import React from 'react';
import { CreditCard, Clock, ShieldCheck, Activity, Users, Database, Layers, Stethoscope, Lock, Smartphone } from 'lucide-react';

export default function FeaturesPage() {
  const featureList = [
    {
      icon: CreditCard,
      title: 'Universal Smart Card ID',
      desc: 'Each patient receives a portable digital card with QR encoding, linking basic demographics, blood groups, and life-critical allergy badges without public leakage of private diagnoses.',
    },
    {
      icon: Clock,
      title: 'Socket.IO Live Queue Synchronization',
      desc: 'Real-time WebSocket event loop streams doctor chamber status updates. Patients see accurate queue positions, estimated consultation wait times, and turn reminders.',
    },
    {
      icon: ShieldCheck,
      title: 'Consent-Governed Cross-Hospital History',
      desc: 'Allows authorized healthcare personnel across affiliated hospitals to view relevant past encounters while logging all access events into an immutable administrative audit trail.',
    },
    {
      icon: Stethoscope,
      title: 'Physician Clinical Workbench',
      desc: 'Doctors can input structured clinical findings: vital signs, diagnoses, digital prescriptions (Rx) with dosage rules, and attachments directly into the patient record.',
    },
    {
      icon: Smartphone,
      title: 'Responsive Cross-Device Experience',
      desc: 'Optimized for desktop clinic terminals, tablets for hospital staff, and mobile-friendly bottom navigation for patients waiting in hospital lounges.',
    },
    {
      icon: Lock,
      title: 'Role-Based Access Control (RBAC)',
      desc: 'Granular permissions segregate Patient, Doctor, Hospital Administrator, and Platform Superadmin views with strict JWT authentication and password hashing.',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-widest text-primary">Technical & Clinical Capabilities</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">Platform Features</h1>
        <p className="text-xs sm:text-sm text-slate-600">
          Everything required to power a modern national digital healthcare network with zero downtime.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {featureList.map((f, i) => {
          const Icon = f.icon;
          return (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-card border border-slate-100 hover:shadow-card-hover transition">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-primary flex items-center justify-center mb-4">
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900 mb-2">{f.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{f.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
