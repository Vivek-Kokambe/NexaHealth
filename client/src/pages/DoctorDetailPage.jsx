import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Stethoscope, Star, Building2, Calendar, Clock, Award, ShieldCheck, ArrowRight, Check } from 'lucide-react';
import api from '../services/api';

export default function DoctorDetailPage() {
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoc = async () => {
      try {
        const res = await api.get(`/doctors/${id}`);
        if (res.data.success) {
          setDoctor(res.data.doctor);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchDoc();
  }, [id]);

  if (loading) return <div className="p-12 text-center text-xs text-slate-500">Loading doctor credentials...</div>;
  if (!doctor) return <div className="p-12 text-center text-slate-600">Doctor not found.</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Profile Overview Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-slate-100 flex flex-col sm:flex-row items-center sm:items-start space-y-6 sm:space-y-0 sm:space-x-8">
        <img
          src={doctor.profileImage || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80'}
          alt={doctor.name}
          className="w-32 h-32 rounded-2xl object-cover border-4 border-blue-50 shadow-md flex-shrink-0"
        />

        <div className="flex-1 space-y-3 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span className="px-3 py-1 bg-teal-50 text-tealAccent text-xs font-bold rounded-full">
              {doctor.specialization}
            </span>
            <div className="flex items-center space-x-1 text-xs font-bold text-amber-600">
              <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
              <span>{doctor.rating || 4.9} ({doctor.reviewCount || 140} Reviews)</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{doctor.name}</h1>
          <p className="text-xs text-slate-500">{doctor.qualifications?.join(' • ')}</p>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-600 pt-1">
            <div className="flex items-center space-x-1">
              <Building2 className="w-4 h-4 text-slate-400" />
              <span className="font-semibold">{doctor.hospitalName}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Award className="w-4 h-4 text-slate-400" />
              <span>{doctor.experience} Years Experience</span>
            </div>
            <div className="flex items-center space-x-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>MCI Reg: {doctor.licenseNumber}</span>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between sm:justify-start sm:space-x-6 border-t border-slate-100">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-medium">Standard Consultation</span>
              <p className="text-xl font-extrabold text-primary">₹{doctor.consultationFee}</p>
            </div>

            <Link
              to={`/patient/book?doctorId=${doctor._id}&hospitalId=${doctor.hospitalId}`}
              className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl text-xs hover:bg-primary-dark shadow transition flex items-center space-x-2"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Appointment</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Bio & Schedule Slots */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white rounded-2xl p-6 shadow-card border border-slate-100 space-y-4">
          <h3 className="font-bold text-slate-900 text-base">Professional Biography</h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {doctor.bio || 'Consultant physician with specialized background in contemporary clinical diagnosis, medical care planning, and patient-centered rehabilitation.'}
          </p>
        </div>

        {/* Regular OPD Available Slots */}
        <div className="bg-white rounded-2xl p-6 shadow-card border border-slate-100 space-y-4">
          <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2">
            <Clock className="w-4 h-4 text-primary" />
            <span>Weekly OPD Slots</span>
          </h3>
          <div className="space-y-2">
            {doctor.availableSlots && doctor.availableSlots.length > 0 ? (
              doctor.availableSlots.map((slot, i) => (
                <div key={i} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs flex justify-between items-center">
                  <span className="font-semibold text-slate-800">{slot.day}</span>
                  <span className="text-primary font-mono text-[11px] font-bold">{slot.startTime} - {slot.endTime}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400">Slots by prior appointment request.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
