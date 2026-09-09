import React from 'react';
import { Link } from 'react-router-dom';
import {
  CreditCard,
  Clock,
  Calendar,
  ShieldCheck,
  Building2,
  Users,
  CheckCircle2,
  ArrowRight,
  Activity,
  HeartPulse,
  Award,
  Sparkles,
  Stethoscope
} from 'lucide-react';
import SmartCardWidget from '../components/SmartCardWidget';

export default function LandingPage() {
  const sampleCard = {
    patientName: 'Rahul Sharma',
    smartCardId: 'SCN-2026-104582',
    dateOfBirth: '1992-05-14',
    bloodGroup: 'O+',
    emergencyContact: { phone: '+91 99102 33446' },
    allergies: ['Penicillin', 'Peanuts'],
    cardStatus: 'active',
  };

  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 overflow-hidden bg-gradient-to-b from-blue-100/60 via-lightBg to-white border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-blue-100 text-primary text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-secondary" />
                <span>Next-Gen Unified Healthcare Infrastructure</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Connected Care. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-tealAccent">
                  Smarter Health.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed mx-auto lg:mx-0">
                SmartCare Health Network bridges patients, top doctors, and hospitals on a single national standard. Book slots in real time, track hospital queues live, and access complete clinical records through your encrypted digital <strong>Smart Card ID</strong>.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
                <Link
                  to="/patient/book"
                  className="px-6 py-3.5 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-dark shadow-lg shadow-primary/25 transition-all hover:-translate-y-0.5 flex items-center space-x-2"
                >
                  <span>Book an Appointment</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/how-it-works"
                  className="px-6 py-3.5 rounded-xl bg-white text-slate-700 font-bold text-sm border border-slate-300 hover:bg-slate-50 transition shadow-sm"
                >
                  Explore SmartCare
                </Link>
              </div>

              {/* Highlight Stats */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200/80 max-w-lg mx-auto lg:mx-0 text-left">
                <div>
                  <div className="text-2xl font-black text-primary">50k+</div>
                  <div className="text-xs text-slate-500 font-medium">Issued Smart Cards</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-secondary">38%</div>
                  <div className="text-xs text-slate-500 font-medium">Reduced Wait Time</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-tealAccent">100%</div>
                  <div className="text-xs text-slate-500 font-medium">Digital Audit Trail</div>
                </div>
              </div>
            </div>

            {/* Right Card Visualization */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md">
                <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 to-teal-500 rounded-3xl blur-xl opacity-20 animate-pulse"></div>
                <div className="relative">
                  <SmartCardWidget cardData={sampleCard} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-xs font-bold text-secondary uppercase tracking-widest">Platform Capabilities</h2>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">Engineered for Seamless Patient Journeys</p>
          <p className="text-sm text-slate-600 mt-2">No more lost paperwork, repetitive diagnostic scans, or blind hospital queues.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-white rounded-2xl p-6 shadow-card border border-slate-100 hover:shadow-card-hover transition-all group">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <CreditCard className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-2">Smart Medical Card</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every citizen receives a unique Smart Card ID (SCN-YYYY-XXXXXX). It unifies blood group, emergency contacts, allergy warnings, and active medications.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-2xl p-6 shadow-card border border-slate-100 hover:shadow-card-hover transition-all group">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-2">Real-Time Appointments</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Browse top hospital rosters, check actual specialist availability slots, and book instant confirmations without middleman delays.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-2xl p-6 shadow-card border border-slate-100 hover:shadow-card-hover transition-all group">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-2">Live Queue Tracking</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Scan your card on arrival to activate your queue token. Monitor your real-time waiting position and estimated consultation countdown on your mobile.
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-white rounded-2xl p-6 shadow-card border border-slate-100 hover:shadow-card-hover transition-all group">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-2">Secure Medical History</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Your diagnoses, vital signs, prescriptions, and lab tests persist on a tamper-proof digital timeline with strict role-based access rules.
            </p>
          </div>

          {/* Card 5 */}
          <div className="bg-white rounded-2xl p-6 shadow-card border border-slate-100 hover:shadow-card-hover transition-all group">
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-2">Cross-Hospital Access</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Consult specialists across Apollo, Max, Fortis, or local clinics without repeatedly carrying thick folders of paper files.
            </p>
          </div>

          {/* Card 6 */}
          <div className="bg-white rounded-2xl p-6 shadow-card border border-slate-100 hover:shadow-card-hover transition-all group">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <HeartPulse className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-2">Doctor-Patient Synergy</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Empower physicians with instant history lookup, drug allergy alerts, electronic prescription generation, and automated follow-up reminders.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-400">Step-by-Step Workflow</span>
            <h2 className="text-3xl font-extrabold mt-2">How SmartCare Works</h2>
            <p className="text-xs text-slate-400 mt-2">Six seamless steps from onboarding to consultation</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { num: '01', title: 'Register on SmartCare', desc: 'Patients create their verified account with basic demographic and emergency info.' },
              { num: '02', title: 'Receive Smart Card ID', desc: 'Instantly generate your unique digital Smart Card ID with encrypted QR code.' },
              { num: '03', title: 'Find Hospital or Doctor', desc: 'Filter network healthcare providers by specialty, facilities, city, and ratings.' },
              { num: '04', title: 'Book an Appointment', desc: 'Select preferred doctor time slots and receive instant booking confirmation tokens.' },
              { num: '05', title: 'Check In & Track Queue', desc: 'Arrive at the hospital, check in via Smart Card QR, and follow live queue progression.' },
              { num: '06', title: 'Authorized Record Access', desc: 'Doctors review your medical timeline, record diagnosis, and issue digital prescriptions.' },
            ].map((step, idx) => (
              <div key={idx} className="bg-slate-800/80 rounded-2xl p-6 border border-slate-700/60 relative">
                <span className="text-4xl font-black text-blue-500/20 block mb-2">{step.num}</span>
                <h4 className="font-bold text-base text-white mb-2">{step.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-blue-900 via-primary to-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-300">Measurable Impact</span>
              <h3 className="text-2xl sm:text-3xl font-extrabold leading-tight">
                Transforming Healthcare Delivery for Everyone
              </h3>
              <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
                SmartCare eliminates healthcare fragmentation. By centralizing appointments, queues, and clinical histories, we empower care teams to focus on patient outcomes.
              </p>
              <div className="space-y-2.5 pt-2 text-xs">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span><strong>Reduced Waiting Time:</strong> Live queue telemetry eliminates waiting room congestion.</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span><strong>Fewer Repeated Tests:</strong> Cross-hospital history saves families unnecessary diagnostic fees.</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span><strong>Improved Patient Safety:</strong> Real-time drug allergy alerts protect against contraindications.</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/10 text-center">
                <div className="text-3xl font-black text-emerald-400">45%</div>
                <div className="text-xs text-slate-200 mt-1">Faster Patient Onboarding</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/10 text-center">
                <div className="text-3xl font-black text-blue-300">99.4%</div>
                <div className="text-xs text-slate-200 mt-1">Record Retrieval Uptime</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/10 text-center">
                <div className="text-3xl font-black text-amber-300">0</div>
                <div className="text-xs text-slate-200 mt-1">Paper Prescription Loss</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/10 text-center">
                <div className="text-3xl font-black text-rose-300">24/7</div>
                <div className="text-xs text-slate-200 mt-1">Emergency Profile Access</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Role-based CTAs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-slate-900">Get Started with SmartCare Today</h3>
          <p className="text-xs text-slate-500 mt-1">Dedicated workflows designed for every stakeholder</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Patient Card */}
          <div className="bg-white rounded-2xl p-6 shadow-card border border-slate-100 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-primary flex items-center justify-center mb-3">
                <Users className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-base text-slate-900">For Patients</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Take control of your health journey. Receive a Smart Card, book appointments, check live queues, and carry your records anywhere.
              </p>
            </div>
            <Link
              to="/register"
              className="mt-6 w-full py-2.5 text-center text-xs font-bold text-white bg-primary rounded-xl hover:bg-primary-dark transition block"
            >
              Get Your Smart Card
            </Link>
          </div>

          {/* Doctor Card */}
          <div className="bg-white rounded-2xl p-6 shadow-card border border-slate-100 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center mb-3">
                <Stethoscope className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-base text-slate-900">For Doctors</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Streamline OPD consultations. Access authorized patient histories by Smart Card ID, manage queue flow, and issue electronic prescriptions.
              </p>
            </div>
            <Link
              to="/register"
              className="mt-6 w-full py-2.5 text-center text-xs font-bold text-teal-800 bg-teal-50 border border-teal-200 rounded-xl hover:bg-teal-100 transition block"
            >
              Join as Medical Specialist
            </Link>
          </div>

          {/* Hospital Card */}
          <div className="bg-white rounded-2xl p-6 shadow-card border border-slate-100 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-3">
                <Building2 className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-base text-slate-900">For Hospitals</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Modernize hospital operations. Manage multi-department schedules, automate patient queue turnstiles, and view institutional analytics.
              </p>
            </div>
            <Link
              to="/register"
              className="mt-6 w-full py-2.5 text-center text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-xl hover:bg-indigo-100 transition block"
            >
              Affiliate Your Hospital
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
