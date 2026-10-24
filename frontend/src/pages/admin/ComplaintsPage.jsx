import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Headphones, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/complaints');
      if (res.data.success) {
        setComplaints(res.data.complaints || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleResolve = async (id) => {
    try {
      const res = await api.put(`/admin/complaints/${id}`, { status: 'resolved' });
      if (res.data.success) {
        alert(res.data.message);
        fetchComplaints();
      }
    } catch (e) {
      alert('Failed to resolve complaint');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Support Requests & Grievance Desk
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Resolve patient Smart Card inquiries, hospital operational tickets, and physician requests.
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500">Loading support queue...</div>
      ) : (
        <div className="space-y-4">
          {complaints.map((c) => (
            <div key={c._id} className="bg-white rounded-2xl p-6 shadow-card border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-800 text-sm">{c.subject}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    c.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {c.status}
                  </span>
                  <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] uppercase font-bold">
                    {c.category}
                  </span>
                </div>

                <p className="text-slate-600 leading-relaxed">{c.message}</p>
                <p className="text-[11px] text-slate-400">
                  Raised by: <strong className="text-slate-700">{c.userName}</strong> ({c.userEmail}) • {new Date(c.createdAt).toLocaleDateString()}
                </p>
              </div>

              {c.status !== 'resolved' && (
                <button
                  onClick={() => handleResolve(c._id)}
                  className="px-4 py-2 bg-primary text-white font-bold rounded-xl text-xs hover:bg-primary-dark transition self-start md:self-auto shadow-xs"
                >
                  Mark Resolved
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
