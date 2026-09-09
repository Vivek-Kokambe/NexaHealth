import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Stethoscope, CheckCircle2, XCircle, Star } from 'lucide-react';

export default function DoctorApprovalsPage() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const res = await api.get('/doctors');
      if (res.data.success) {
        setDoctors(res.data.doctors || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleAction = async (id, status) => {
    try {
      const res = await api.put(`/admin/doctors/${id}/approve`, { status });
      if (res.data.success) {
        alert(res.data.message);
        fetchDoctors();
      }
    } catch (e) {
      alert('Action failed');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Doctor License Verification & Credentialing
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Verify medical licenses with the Medical Council of India registry and authorize prescription privileges.
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500">Loading specialist credentials...</div>
      ) : (
        <div className="bg-white rounded-3xl shadow-card border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 text-[11px] uppercase font-bold">
                  <th className="p-4">Physician Name</th>
                  <th className="p-4">Specialization</th>
                  <th className="p-4">License Number</th>
                  <th className="p-4">Hospital Affiliation</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Verification Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {doctors.map((doc) => (
                  <tr key={doc._id} className="hover:bg-slate-50/50">
                    <td className="p-4 font-bold text-slate-900 flex items-center space-x-2">
                      <Stethoscope className="w-4 h-4 text-tealAccent" />
                      <span>{doc.name}</span>
                    </td>
                    <td className="p-4 text-slate-700 font-medium">{doc.specialization}</td>
                    <td className="p-4 font-mono text-slate-600">{doc.licenseNumber}</td>
                    <td className="p-4 text-slate-600">{doc.hospitalName}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        doc.approvalStatus === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                        doc.approvalStatus === 'rejected' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {doc.approvalStatus || 'approved'}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => handleAction(doc._id, 'approved')}
                        className="px-3 py-1 bg-emerald-600 text-white font-bold text-[11px] rounded-lg hover:bg-emerald-700"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleAction(doc._id, 'rejected')}
                        className="px-3 py-1 bg-rose-50 text-rose-700 font-bold text-[11px] rounded-lg hover:bg-rose-100"
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
