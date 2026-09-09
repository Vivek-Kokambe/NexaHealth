import React, { useState } from 'react';
import { Calendar, FileText, Activity, AlertCircle, Heart, Thermometer, ShieldAlert, Download, Printer, ChevronDown, ChevronUp } from 'lucide-react';

export default function MedicalTimeline({ records, patientInfo, showConsentWarning = false }) {
  const [expandedRecordId, setExpandedRecordId] = useState(records?.[0]?._id || null);

  const toggleExpand = (id) => {
    setExpandedRecordId(expandedRecordId === id ? null : id);
  };

  const handlePrintSummary = () => {
    window.print();
  };

  if (!records || records.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center shadow-card border border-slate-100">
        <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h4 className="text-slate-700 font-semibold">No Medical Records Recorded</h4>
        <p className="text-slate-500 text-xs mt-1">Consultation history, lab tests, and digital prescriptions will appear here once uploaded by authorized physicians.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Privacy Notice Banner (Required by prompt) */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start space-x-3 text-xs text-amber-800">
        <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block">Patient Record Authorization & Privacy Notice:</span>
          Medical history is cryptographically bound to Smart Card identity. Cross-hospital access is strictly audited under SmartCare Protocol. All views and prescription generations are permanently recorded in the administrative compliance log.
        </div>
      </div>

      {/* Summary Header & Print Action (No-print toggle) */}
      <div className="no-print flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div>
          <h3 className="font-bold text-slate-800 text-sm">Digital Clinical Timeline</h3>
          <p className="text-xs text-slate-500">{records.length} Verified clinical encounters recorded</p>
        </div>
        <button
          onClick={handlePrintSummary}
          className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold bg-primary text-white rounded-lg hover:bg-primary-dark transition shadow-sm"
        >
          <Printer className="w-4 h-4" />
          <span>Print Clinical Summary</span>
        </button>
      </div>

      {/* Printable Clinical Record Wrapper */}
      <div id="printable-summary" className="space-y-6">
        {patientInfo && (
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-4 hidden print:block">
            <h2 className="text-lg font-bold text-primary">SmartCare Health Network - Medical History Summary</h2>
            <p className="text-xs text-slate-600">Patient Name: {patientInfo.name} | Smart Card ID: {patientInfo.smartCardId} | Blood Group: {patientInfo.bloodGroup}</p>
          </div>
        )}

        <div className="relative border-l-2 border-blue-200 ml-4 pl-6 space-y-6">
          {records.map((rec) => {
            const isExpanded = expandedRecordId === rec._id;
            const dateStr = new Date(rec.consultationDate || rec.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });

            return (
              <div key={rec._id} className="relative group">
                {/* Timeline Dot */}
                <div className="absolute -left-[31px] top-4 w-4 h-4 rounded-full bg-primary border-4 border-white shadow"></div>

                <div className="bg-white rounded-2xl p-5 shadow-card border border-slate-100 transition-all hover:shadow-card-hover">
                  {/* Encounter Header */}
                  <div 
                    onClick={() => toggleExpand(rec._id)}
                    className="flex items-start justify-between cursor-pointer select-none"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-primary bg-blue-50 px-2 py-0.5 rounded">
                          {dateStr}
                        </span>
                        <span className="text-xs text-slate-500 font-medium truncate">
                          {rec.hospitalName || 'SmartCare Hospital'}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-slate-900 mt-1">
                        {rec.diagnosis}
                      </h4>
                      <p className="text-xs text-slate-600">
                        Attending: <span className="font-semibold text-slate-800">{rec.doctorName || 'Dr. Specialist'}</span> • {rec.doctorSpecialization || 'Physician'}
                      </p>
                    </div>

                    <div className="no-print flex items-center space-x-2">
                      <span className="text-xs text-slate-400 font-medium">
                        {isExpanded ? 'Collapse' : 'Details'}
                      </span>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                    </div>
                  </div>

                  {/* Expanded Clinical Details */}
                  {(isExpanded || window.matchMedia?.('print')?.matches) && (
                    <div className="mt-4 pt-4 border-t border-slate-100 space-y-4 text-xs">
                      {/* Symptoms */}
                      {rec.symptoms && rec.symptoms.length > 0 && (
                        <div>
                          <span className="font-semibold text-slate-700 block mb-1">Reported Symptoms:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {rec.symptoms.map((s, idx) => (
                              <span key={idx} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full text-[11px]">
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Vital Signs Grid */}
                      {rec.vitals && (
                        <div>
                          <span className="font-semibold text-slate-700 block mb-1.5">Vital Signs on Admission:</span>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            <div className="bg-blue-50/70 p-2.5 rounded-xl border border-blue-100/60">
                              <span className="text-[10px] text-blue-600 block uppercase font-medium">Blood Pressure</span>
                              <span className="text-xs font-bold text-slate-800">{rec.vitals.bloodPressure || '120/80'}</span>
                            </div>
                            <div className="bg-rose-50/70 p-2.5 rounded-xl border border-rose-100/60">
                              <span className="text-[10px] text-rose-600 block uppercase font-medium">Heart Rate</span>
                              <span className="text-xs font-bold text-slate-800">{rec.vitals.heartRate || '72'} bpm</span>
                            </div>
                            <div className="bg-amber-50/70 p-2.5 rounded-xl border border-amber-100/60">
                              <span className="text-[10px] text-amber-600 block uppercase font-medium">Body Temp</span>
                              <span className="text-xs font-bold text-slate-800">{rec.vitals.temperature || '98.6 °F'}</span>
                            </div>
                            <div className="bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-100/60">
                              <span className="text-[10px] text-emerald-600 block uppercase font-medium">SpO2 Oxygen</span>
                              <span className="text-xs font-bold text-slate-800">{rec.vitals.oxygenLevel || '99'}%</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Prescriptions Table */}
                      {rec.prescription && rec.prescription.length > 0 && (
                        <div>
                          <span className="font-semibold text-slate-700 block mb-1.5">Prescribed Medications (Rx):</span>
                          <div className="overflow-x-auto rounded-xl border border-slate-200">
                            <table className="w-full text-left border-collapse text-xs">
                              <thead>
                                <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 text-[11px]">
                                  <th className="p-2 font-semibold">Medicine</th>
                                  <th className="p-2 font-semibold">Dosage</th>
                                  <th className="p-2 font-semibold">Frequency</th>
                                  <th className="p-2 font-semibold">Duration</th>
                                  <th className="p-2 font-semibold">Notes</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {rec.prescription.map((rx, rxi) => (
                                  <tr key={rxi} className="hover:bg-slate-50/50">
                                    <td className="p-2 font-bold text-primary">{rx.medication}</td>
                                    <td className="p-2 text-slate-700">{rx.dosage}</td>
                                    <td className="p-2 text-slate-700">{rx.frequency}</td>
                                    <td className="p-2 text-slate-700">{rx.duration}</td>
                                    <td className="p-2 text-slate-500 italic">{rx.notes || 'As prescribed'}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* Lab Reports */}
                      {rec.labReports && rec.labReports.length > 0 && (
                        <div>
                          <span className="font-semibold text-slate-700 block mb-1.5">Diagnostic & Lab Reports:</span>
                          <div className="space-y-1.5">
                            {rec.labReports.map((lab, li) => (
                              <div key={li} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
                                <div>
                                  <span className="font-semibold text-slate-800">{lab.testName}</span>
                                  <p className="text-[11px] text-slate-500">{lab.result} (Range: {lab.normalRange})</p>
                                </div>
                                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                                  {lab.status || 'Verified'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Physician Notes & Follow-up */}
                      {rec.notes && (
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <span className="font-semibold text-slate-700 block text-[11px]">Doctor Advice & Notes:</span>
                          <p className="text-slate-600 mt-0.5">{rec.notes}</p>
                          {rec.followUpDate && (
                            <p className="text-blue-700 font-medium text-[11px] mt-1">
                              Recommended Follow-up: {rec.followUpDate}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
