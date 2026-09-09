import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Building2, MapPin, Phone, Mail, Star, Clock, CheckCircle2, Stethoscope, ArrowRight } from 'lucide-react';
import api from '../services/api';

export default function HospitalDetailPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHospital = async () => {
      try {
        const res = await api.get(`/hospitals/${id}`);
        if (res.data.success) {
          setData(res.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchHospital();
  }, [id]);

  if (loading) {
    return <div className="p-12 text-center text-xs text-slate-500">Loading hospital profile...</div>;
  }

  if (!data?.hospital) {
    return <div className="p-12 text-center text-slate-600">Hospital not found.</div>;
  }

  const { hospital, doctors } = data;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Hero Banner */}
      <div className="bg-white rounded-3xl overflow-hidden shadow-card border border-slate-100">
        <div className="relative h-64 sm:h-80 bg-slate-900">
          <img
            src={hospital.logo || 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=1200&q=80'}
            alt={hospital.name}
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
          
          <div className="absolute bottom-6 left-6 right-6 text-white flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-600/80 backdrop-blur-md text-xs font-semibold">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{hospital.rating || 4.9} Verified Rating</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold">{hospital.name}</h1>
              <p className="text-xs sm:text-sm text-slate-300 flex items-center space-x-2">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span>{hospital.address}, {hospital.city}, {hospital.state} - {hospital.pincode}</span>
              </p>
            </div>

            <Link
              to={`/patient/book?hospitalId=${hospital._id}`}
              className="px-6 py-3 bg-primary text-white font-bold rounded-xl text-xs hover:bg-primary-dark shadow-lg transition self-start sm:self-end flex items-center space-x-2"
            >
              <span>Book Appointment</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 p-6 bg-white text-center">
          <div>
            <span className="text-slate-400 text-xs uppercase font-medium">Total Bed Capacity</span>
            <p className="text-xl font-extrabold text-slate-900 mt-1">{hospital.totalBeds || 350}+</p>
          </div>
          <div>
            <span className="text-slate-400 text-xs uppercase font-medium">ICU Beds Available</span>
            <p className="text-xl font-extrabold text-emerald-600 mt-1">{hospital.icuBedsAvailable || 18} Active</p>
          </div>
          <div>
            <span className="text-slate-400 text-xs uppercase font-medium">Operating Hours</span>
            <p className="text-xs font-bold text-slate-800 mt-1 truncate px-2">{hospital.operatingHours || '24/7'}</p>
          </div>
          <div>
            <span className="text-slate-400 text-xs uppercase font-medium">Emergency Desk</span>
            <p className="text-xs font-bold text-primary mt-1">{hospital.phone || '+91 11 2692 5858'}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Specialties & Facilities */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-card border border-slate-100 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Departments & Specialties</h3>
            <div className="flex flex-wrap gap-2">
              {hospital.departments?.map((dep, idx) => (
                <span key={idx} className="bg-blue-50 text-primary px-3 py-1 rounded-xl text-xs font-semibold">
                  {dep}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-card border border-slate-100 space-y-3">
            <h3 className="text-base font-bold text-slate-900">Hospital Facilities</h3>
            <ul className="space-y-2 text-xs text-slate-600">
              {hospital.facilities?.map((fac, idx) => (
                <li key={idx} className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>{fac}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Column: Affiliated Specialists */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-card border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Attending Specialists at this Hospital</h3>
            {doctors && doctors.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {doctors.map((doc) => (
                  <div key={doc._id} className="py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3.5">
                      <img
                        src={doc.profileImage || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=120&q=80'}
                        alt={doc.name}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                      />
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{doc.name}</h4>
                        <p className="text-xs text-tealAccent font-semibold">{doc.specialization}</p>
                        <p className="text-[11px] text-slate-400">{doc.experience} yrs exp • ₹{doc.consultationFee} fee</p>
                      </div>
                    </div>

                    <Link
                      to={`/patient/book?doctorId=${doc._id}&hospitalId=${hospital._id}`}
                      className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-dark transition"
                    >
                      Book Slot
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">No doctors currently affiliated with this department.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
