import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Stethoscope, Star, Calendar, ArrowRight, Award, Clock } from 'lucide-react';
import api from '../services/api';

export default function DoctorDirectoryPage() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSpec, setSelectedSpec] = useState('');

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (selectedSpec) params.specialization = selectedSpec;

      const res = await api.get('/doctors', { params });
      if (res.data.success) {
        setDoctors(res.data.doctors);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [selectedSpec]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchDoctors();
  };

  const specializations = ['All Specializations', 'Cardiology', 'Neurology', 'Pediatrics', 'General Medicine'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Physicians & Specialist Directory</h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Find verified healthcare specialists across affiliated network hospitals and check immediate slot availability.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-card border border-slate-100">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-7 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <input
              type="text"
              placeholder="Search doctor by name, qualification, or hospital..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={selectedSpec}
              onChange={(e) => setSelectedSpec(e.target.value === 'All Specializations' ? '' : e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {specializations.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              className="w-full h-full py-2.5 bg-primary text-white font-bold rounded-xl text-xs hover:bg-primary-dark transition flex items-center justify-center"
            >
              Search
            </button>
          </div>
        </form>
      </div>

      {/* Doctor Cards */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500">Loading specialist registry...</div>
      ) : doctors.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl shadow-card">
          <Stethoscope className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="font-bold text-slate-700">No Specialists Found</h4>
          <p className="text-xs text-slate-500 mt-1">Try resetting the specialization filter or keyword.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doc) => (
            <div
              key={doc._id}
              className="bg-white rounded-2xl p-6 shadow-card border border-slate-100 hover:shadow-card-hover transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Header Profile */}
                <div className="flex items-start space-x-3.5">
                  <img
                    src={doc.profileImage || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=200&q=80'}
                    alt={doc.name}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-blue-100 shadow-sm"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-tealAccent bg-teal-50 px-2 py-0.5 rounded">
                        {doc.specialization}
                      </span>
                      <div className="flex items-center space-x-1 text-xs font-bold text-amber-600">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        <span>{doc.rating || 4.9}</span>
                      </div>
                    </div>
                    <h3 className="font-bold text-slate-900 text-base mt-1 truncate">{doc.name}</h3>
                    <p className="text-[11px] text-slate-500 truncate">{doc.qualifications?.join(', ')}</p>
                  </div>
                </div>

                {/* Hospital & Fee Badges */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5 text-xs">
                  <div className="flex justify-between items-center text-slate-600">
                    <span className="text-slate-400 text-[11px]">Affiliation:</span>
                    <span className="font-semibold text-slate-800 truncate max-w-[170px]">{doc.hospitalName}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span className="text-slate-400 text-[11px]">Experience:</span>
                    <span className="font-semibold text-slate-800">{doc.experience || 10} Years</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span className="text-slate-400 text-[11px]">Consultation Fee:</span>
                    <span className="font-bold text-primary">₹{doc.consultationFee || 800}</span>
                  </div>
                </div>

                {/* Bio */}
                <p className="text-slate-600 text-xs line-clamp-2 leading-relaxed">
                  {doc.bio || 'Experienced consultant specialist committed to precision diagnostic care and evidence-based patient therapies.'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 mt-4 border-t border-slate-100 grid grid-cols-2 gap-2">
                <Link
                  to={`/doctors/${doc._id}`}
                  className="py-2 text-center text-xs font-semibold text-slate-700 bg-slate-50 rounded-xl hover:bg-slate-100 transition"
                >
                  View Profile
                </Link>
                <Link
                  to={`/patient/book?doctorId=${doc._id}&hospitalId=${doc.hospitalId}`}
                  className="py-2 text-center text-xs font-bold text-white bg-primary rounded-xl hover:bg-primary-dark transition flex items-center justify-center space-x-1 shadow-sm"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Book Slot</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
