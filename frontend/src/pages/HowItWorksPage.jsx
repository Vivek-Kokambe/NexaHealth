import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, CreditCard, Calendar, Clock, FileText, ShieldAlert, ArrowRight } from 'lucide-react';

export default function HowItWorksPage() {
  const steps = [
    {
      num: '01',
      title: 'Sign Up & Instant Identity Provisioning',
      desc: 'Patients register with essential identity details, blood group, emergency numbers, and medication allergies. The system instantly mints a cryptographically secure Smart Card ID (SCN-YYYY-XXXXXX).',
      badge: 'Step 1 • Registration',
    },
    {
      num: '02',
      title: 'Digital Smart Card Activation',
      desc: 'Access your virtual Smart Card directly in your patient dashboard. You can download the digital pass to your device, print a hard copy, or store the QR code for instant NFC and camera scanner recognition.',
      badge: 'Step 2 • Identity Issuance',
    },
    {
      num: '03',
      title: 'Find Doctors & Book Appointments',
      desc: 'Search our network directory by medical specialization, hospital reputation, or location. Pick from confirmed doctor schedule slots to instantly book your appointment and receive a unique booking number.',
      badge: 'Step 3 • Scheduling',
    },
    {
      num: '04',
      title: 'Contactless Arrival & Turnstile Check-In',
      desc: 'On arrival at the hospital, scan your Smart Card ID or QR code at reception or an automated check-in kiosk. The system timestamps your arrival and assigns your exact queue token.',
      badge: 'Step 4 • Check-In',
    },
    {
      num: '05',
      title: 'Live Queue & Wait-Time Telemetry',
      desc: 'Watch real-time queue progression directly on your mobile device. See exactly how many patients are ahead of you and receive live push updates when you are next in line to see the physician.',
      badge: 'Step 5 • Live Queue',
    },
    {
      num: '06',
      title: 'Clinical Consultation & Encrypted Records',
      desc: 'With your authorized consent, the doctor accesses past diagnoses, vitals, and lab tests. Following your consultation, new digital prescriptions and follow-up plans are automatically saved to your permanent timeline.',
      badge: 'Step 6 • Care & Records',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-widest text-primary">Connected Care Architecture</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">How SmartCare Works</h1>
        <p className="text-xs sm:text-sm text-slate-600">
          A step-by-step walkthrough of how SmartCare Health Network unifies patient onboarding, queue monitoring, and clinical history.
        </p>
      </div>

      <div className="space-y-6">
        {steps.map((s, idx) => (
          <div key={idx} className="bg-white rounded-2xl p-6 sm:p-8 shadow-card border border-slate-100 flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-6">
            <span className="text-4xl sm:text-5xl font-black text-blue-200 flex-shrink-0">{s.num}</span>
            <div className="space-y-2 flex-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-secondary bg-blue-50 px-2.5 py-0.5 rounded-full">
                {s.badge}
              </span>
              <h3 className="text-lg font-bold text-slate-900">{s.title}</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* CTA Box */}
      <div className="bg-gradient-to-r from-primary to-secondary rounded-3xl p-8 text-white text-center space-y-4 shadow-xl">
        <h3 className="text-2xl font-bold">Ready to experience seamless healthcare?</h3>
        <p className="text-xs text-blue-100 max-w-md mx-auto">Create your free SmartCare account today and receive your unique Smart Card ID immediately.</p>
        <Link
          to="/register"
          className="inline-flex items-center space-x-2 px-6 py-3 bg-white text-primary font-bold text-xs rounded-xl shadow hover:bg-blue-50 transition"
        >
          <span>Get Your Smart Card Now</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
