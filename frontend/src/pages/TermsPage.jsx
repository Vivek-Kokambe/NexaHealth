import React from 'react';

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900">Terms of Service</h1>
        <p className="text-xs text-slate-500">Last updated: September 2026</p>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-card border border-slate-100 space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed">
        <section className="space-y-2">
          <h3 className="font-bold text-slate-900 text-base">1. Acceptance of Terms</h3>
          <p>
            By accessing or creating an account on the SmartCare Health Network platform as a Patient, Physician, Hospital Staff, or Administrator, you acknowledge that this system is provided as a proof-of-concept prototype for testing unified health information exchange.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="font-bold text-slate-900 text-base">2. Clinical Responsibility</h3>
          <p>
            Doctors utilizing SmartCare agree to exercise independent medical judgement when reviewing simulated patient history and generating diagnostic notes. In real-world emergency triage, standard clinical protocols take precedence over electronic summaries.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="font-bold text-slate-900 text-base">3. Smart Card Responsibility</h3>
          <p>
            Cardholders are advised to report lost or stolen physical or digital Smart Cards through their dashboard so the unique token may be suspended and regenerated.
          </p>
        </section>
      </div>
    </div>
  );
}
