import React from 'react';
import { ShieldCheck, Lock } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900">Privacy & Data Governance Policy</h1>
        <p className="text-xs text-slate-500">Effective Date: September 2026 • SmartCare Health Network</p>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-card border border-slate-100 space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed">
        <div className="p-4 rounded-xl bg-blue-50 text-blue-900 flex items-start space-x-3 text-xs">
          <ShieldCheck className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <strong>Student Project Prototype Notice:</strong>
            SmartCare Health Network is an academic demonstration and engineering prototype. Fictitious demo data is utilized. No real patient health information (PHI) should be transmitted or stored on this demonstration deployment.
          </div>
        </div>

        <section className="space-y-2">
          <h3 className="font-bold text-slate-900 text-base">1. Patient Ownership of Medical History</h3>
          <p>
            Under the SmartCare architecture, the patient remains the exclusive owner of their health record. Diagnoses, lab reports, and medication histories are associated directly with the Smart Card ID and may only be queried by accredited medical providers under active appointments or explicitly logged emergency override protocols.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="font-bold text-slate-900 text-base">2. Cross-Hospital Audit Logging</h3>
          <p>
            Whenever a physician accesses a patient's medical timeline, a cryptographic entry is added to the system Audit Log detailing the physician's identity, timestamp, hospital facility, IP address, and clinical purpose. Patients can inspect these access records in their profile at any time.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="font-bold text-slate-900 text-base">3. Smart Card ID Disclosure Safeguards</h3>
          <p>
            Public directory lookups never expose private medical diagnoses or lab reports. The Smart Card visual layer displays only emergency-vital information: blood group, critical drug allergies, and primary emergency telephone contacts.
          </p>
        </section>
      </div>
    </div>
  );
}
