import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Building2, Star, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../services/api';

export default function HospitalDirectoryPage() {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedDept, setSelectedDept] = useState('');

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await api.get('/hospitals');
        setHospitals(response.data.hospitals || []);
      } catch (requestError) {
        setError(requestError.response?.data?.message || requestError.message || 'Unable to load approved hospitals.');
      } finally {
        setLoading(false);
      }
    };

    fetchHospitals();
  }, []);

  const cities = useMemo(
    () => [...new Set(hospitals.map((hospital) => hospital.city).filter(Boolean))].sort(),
    [hospitals]
  );
  const departments = useMemo(
    () => [...new Set(hospitals.flatMap((hospital) => hospital.departments || []))].sort(),
    [hospitals]
  );
  const filteredHospitals = useMemo(() => {
    const term = submittedSearch.trim().toLowerCase();
    return hospitals.filter((hospital) => {
      const matchesSearch = !term
        || `${hospital.name} ${hospital.address} ${hospital.city}`.toLowerCase().includes(term);
      const matchesCity = !selectedCity || hospital.city === selectedCity;
      const matchesDepartment = !selectedDept || hospital.departments?.includes(selectedDept);
      return matchesSearch && matchesCity && matchesDepartment;
    });
  }, [hospitals, submittedSearch, selectedCity, selectedDept]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    setSubmittedSearch(search);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 px-4 py-10 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Registered Hospital Network</h1>
        <p className="mt-1 text-xs text-slate-600 sm:text-sm">
          Explore administrator-approved hospitals, available specialties, and facility information before requesting an appointment.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-card sm:p-5">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-12">
          <div className="relative sm:col-span-5">
            <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by hospital name or locality..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-4 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="sm:col-span-3">
            <select
              value={selectedCity}
              onChange={(event) => setSelectedCity(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">All Cities</option>
              {cities.map((city) => <option key={city} value={city}>{city}</option>)}
            </select>
          </div>
          <div className="sm:col-span-3">
            <select
              value={selectedDept}
              onChange={(event) => setSelectedDept(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">All Specialties</option>
              {departments.map((department) => <option key={department} value={department}>{department}</option>)}
            </select>
          </div>
          <div className="sm:col-span-1">
            <button type="submit" className="flex h-full w-full items-center justify-center rounded-xl bg-primary py-2.5 text-xs font-bold text-white transition hover:bg-primary-dark">
              Search
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div role="alert" className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-sm text-slate-500">Loading approved hospitals...</div>
      ) : filteredHospitals.length === 0 ? (
        <div className="rounded-2xl bg-white p-12 text-center shadow-card">
          <Building2 className="mx-auto mb-3 h-12 w-12 text-slate-300" />
          <h4 className="font-bold text-slate-700">No Approved Hospitals Found</h4>
          <p className="mt-1 text-xs text-slate-500">
            Approved hospital registrations will appear here and can accept appointment requests.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredHospitals.map((hospital) => (
            <article key={hospital._id} className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-card transition-all hover:shadow-card-hover">
              <div>
                <div className="relative flex h-36 items-center justify-center overflow-hidden bg-gradient-to-br from-blue-100 via-slate-50 to-indigo-100">
                  <Building2 className="h-16 w-16 text-primary/30" />
                  <div className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-lg bg-white/95 px-2 py-1 text-[10px] font-bold text-emerald-700 shadow-sm">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Approved
                  </div>
                  {hospital.totalBeds != null && (
                    <div className="absolute bottom-3 left-3 rounded-lg bg-slate-900/85 px-2.5 py-1 text-[10px] font-semibold text-white">
                      {hospital.totalBeds} total beds
                    </div>
                  )}
                </div>

                <div className="space-y-3 p-5">
                  <div>
                    <h2 className="text-base font-bold leading-snug text-slate-900">{hospital.name}</h2>
                    <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                      <span className="truncate">{hospital.address}, {hospital.city}</span>
                    </div>
                  </div>
                  <div>
                    <p className="mb-1 text-[10px] font-semibold uppercase text-slate-400">Departments & Specialties</p>
                    <div className="flex flex-wrap gap-1">
                      {hospital.departments?.slice(0, 3).map((department) => (
                        <span key={department} className="rounded bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-primary">
                          {department}
                        </span>
                      ))}
                      {hospital.departments?.length > 3 && (
                        <span className="py-0.5 text-[10px] text-slate-400">+{hospital.departments.length - 3} more</span>
                      )}
                    </div>
                  </div>
                  <div className="space-y-1 text-[11px] text-slate-500">
                    <p>{hospital.operatingHours || 'Contact hospital for operating hours'}</p>
                    {hospital.icuBedsAvailable != null && <p>ICU capacity: {hospital.icuBedsAvailable} beds</p>}
                    {hospital.rating && (
                      <p className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" /> {hospital.rating}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-2 grid grid-cols-2 gap-2 border-t border-slate-50 p-5 pt-3">
                <Link to={`/hospitals/${hospital._id}`} className="rounded-xl bg-slate-50 py-2 text-center text-xs font-semibold text-slate-700 transition hover:bg-slate-100">
                  View Details
                </Link>
                <Link to={`/patient/book?hospitalId=${encodeURIComponent(hospital._id)}`} className="flex items-center justify-center gap-1 rounded-xl bg-primary py-2 text-xs font-bold text-white shadow-sm transition hover:bg-primary-dark">
                  Book Visit <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
