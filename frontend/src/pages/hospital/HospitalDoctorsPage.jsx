import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Stethoscope, Star, CheckCircle2, Plus, ArrowRight } from 'lucide-react';

export default function HospitalDoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        const res = await api.get('/hospitals/hosp_1/doctors');
        if (res.data.success) {
          setDoctors(res.data.doctors || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Hospital Specialist Roster
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Doctors authorized for OPD sessions, slot allocations, and electronic prescribing.
          </p>
        </div>

        <button
          onClick={() => alert('New doctor onboarding request sent to administrative credentialing team.')}
          className="px-4 py-2 bg-primary text-white font-bold text-xs rounded-xl hover:bg-primary-dark transition shadow-sm"
        >
          + Add Specialist
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500">Loading specialist team...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {doctors.map((doc) => (
            <div key={doc._id} className="bg-white rounded-2xl p-5 shadow-card border border-slate-100 flex items-start space-x-4">
              <img
                src={doc.profileImage || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=120&q=80'}
                alt={doc.name}
                className="w-14 h-14 rounded-2xl object-cover border border-slate-200"
              />
              <div className="space-y-1 text-xs flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-tealAccent uppercase bg-teal-50 px-2 py-0.5 rounded">
                    {doc.specialization}
                  </span>
                  <div className="flex items-center space-x-1 text-amber-600 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>{doc.rating || 4.9}</span>
                  </div>
                </div>

                <h3 className="font-bold text-slate-900 text-sm">{doc.name}</h3>
                <p className="text-slate-500">{doc.qualifications?.join(', ')}</p>
                <p className="text-[11px] text-slate-600 font-medium">Fee: ₹{doc.consultationFee} • {doc.experience} Years Experience</p>
                <div className="pt-2 flex items-center justify-between text-[11px]">
                  <span className="text-emerald-700 font-bold">Status: Active & Credentialed</span>
                  <button
                    onClick={() => alert(`Reviewing clinical activity for ${doc.name}`)}
                    className="text-primary font-bold hover:underline"
                  >
                    View Duty Slots
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
