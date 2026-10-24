import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Building2, CheckCircle2, XCircle, AlertCircle, ShieldCheck } from 'lucide-react';

export default function HospitalApprovalsPage() {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHospitals = async () => {
    try {
      setLoading(true);
      const res = await api.get('/hospitals');
      if (res.data.success) {
        setHospitals(res.data.hospitals || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitals();
  }, []);

  const handleAction = async (id, status) => {
    try {
      const res = await api.put(`/admin/hospitals/${id}/approve`, { status });
      if (res.data.success) {
        alert(res.data.message);
        fetchHospitals();
      }
    } catch (e) {
      alert('Action failed');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Hospital Accreditation & Approvals
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Review institutional facilities, verify national registration identifiers, and authorize network onboarding.
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500">Loading hospitals registry...</div>
      ) : (
        <div className="bg-white rounded-3xl shadow-card border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 text-[11px] uppercase font-bold">
                  <th className="p-4">Hospital Name</th>
                  <th className="p-4">Reg Number</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Departments</th>
                  <th className="p-4">Approval Status</th>
                  <th className="p-4 text-right">Verification Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {hospitals.map((hosp) => (
                  <tr key={hosp._id} className="hover:bg-slate-50/50">
                    <td className="p-4 font-bold text-slate-900 flex items-center space-x-2">
                      <Building2 className="w-4 h-4 text-primary" />
                      <span>{hosp.name}</span>
                    </td>
                    <td className="p-4 font-mono text-slate-600">{hosp.registrationNumber}</td>
                    <td className="p-4 text-slate-600">{hosp.city}, {hosp.state}</td>
                    <td className="p-4 text-slate-500">{hosp.departments?.slice(0, 3).join(', ')}...</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        hosp.approvalStatus === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                        hosp.approvalStatus === 'rejected' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {hosp.approvalStatus || 'approved'}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => handleAction(hosp._id, 'approved')}
                        className="px-3 py-1 bg-emerald-600 text-white font-bold text-[11px] rounded-lg hover:bg-emerald-700"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleAction(hosp._id, 'rejected')}
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
