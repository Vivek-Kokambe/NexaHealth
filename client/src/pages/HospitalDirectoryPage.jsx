import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Building2, Phone, Star, ArrowRight, Filter } from 'lucide-react';
import api from '../services/api';

export default function HospitalDirectoryPage() {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedDept, setSelectedDept] = useState('');

  const fetchHospitals = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (selectedCity) params.city = selectedCity;
      if (selectedDept) params.department = selectedDept;

      const res = await api.get('/hospitals', { params });
      if (res.data.success) {
        setHospitals(res.data.hospitals);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitals();
  }, [selectedCity, selectedDept]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchHospitals();
  };

  const cities = ['All Cities', 'New Delhi', 'Gurgaon', 'Noida'];
  const departments = ['All Specialties', 'Cardiology', 'Neurology', 'Pediatrics', 'Orthopedics', 'Emergency Care'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Registered Hospital Network</h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Explore accredited multi-specialty hospitals, browse ICU bed availability, and book appointments.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-card border border-slate-100">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <input
              type="text"
              placeholder="Search by hospital name or locality..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value === 'All Cities' ? '' : e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {cities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="sm:col-span-3">
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value === 'All Specialties' ? '' : e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {departments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <div className="sm:col-span-1">
            <button
              type="submit"
              className="w-full h-full py-2.5 bg-primary text-white font-bold rounded-xl text-xs hover:bg-primary-dark transition flex items-center justify-center"
            >
              Search
            </button>
          </div>
        </form>
      </div>

      {/* Hospital Cards Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500">Loading verified network hospitals...</div>
      ) : hospitals.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl shadow-card">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="font-bold text-slate-700">No Hospitals Found</h4>
          <p className="text-xs text-slate-500 mt-1">Try clearing your search query or selecting "All Cities".</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hospitals.map((hosp) => (
            <div
              key={hosp._id}
              className="bg-white rounded-2xl overflow-hidden shadow-card border border-slate-100 hover:shadow-card-hover transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Hospital Photo */}
                <div className="relative h-44 overflow-hidden bg-slate-100">
                  <img
                    src={hosp.logo || 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=400&q=80'}
                    alt={hosp.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-2 py-1 rounded-lg text-[11px] font-bold text-slate-800 flex items-center space-x-1 shadow-sm">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>{hosp.rating || 4.8}</span>
                  </div>
                  <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-semibold text-white">
                    {hosp.icuBedsAvailable || 14} ICU Beds Open
                  </div>
                </div>

                {/* Details */}
                <div className="p-5 space-y-3">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base leading-snug">{hosp.name}</h3>
                    <div className="flex items-center space-x-1 text-slate-500 text-xs mt-1">
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
                      <span className="truncate">{hosp.address}, {hosp.city}</span>
                    </div>
                  </div>

                  {/* Departments Tag Cloud */}
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-semibold mb-1">Key Specialties</p>
                    <div className="flex flex-wrap gap-1">
                      {hosp.departments?.slice(0, 3).map((dep, idx) => (
                        <span key={idx} className="bg-blue-50 text-primary text-[10px] font-medium px-2 py-0.5 rounded">
                          {dep}
                        </span>
                      ))}
                      {hosp.departments?.length > 3 && (
                        <span className="text-[10px] text-slate-400 py-0.5">+{hosp.departments.length - 3} more</span>
                      )}
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 line-clamp-2">
                    {hosp.operatingHours}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-5 pt-0 border-t border-slate-50 grid grid-cols-2 gap-2 mt-2">
                <Link
                  to={`/hospitals/${hosp._id}`}
                  className="py-2 text-center text-xs font-semibold text-slate-700 bg-slate-50 rounded-xl hover:bg-slate-100 transition"
                >
                  View Details
                </Link>
                <Link
                  to={`/patient/book?hospitalId=${hosp._id}`}
                  className="py-2 text-center text-xs font-bold text-white bg-primary rounded-xl hover:bg-primary-dark transition flex items-center justify-center space-x-1 shadow-sm"
                >
                  <span>Book Visit</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
