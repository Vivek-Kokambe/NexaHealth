import React, { useCallback, useEffect, useState } from 'react';
import { AlertCircle, Building2, CheckCircle2, Clock3, Layers3, RefreshCw, Save, Stethoscope } from 'lucide-react';
import api from '../../services/api';

const splitList = (value) => value
  .split(/[\n,]/)
  .map((item) => item.trim())
  .filter(Boolean);

export default function HospitalDepartmentsPage() {
  const [hospital, setHospital] = useState(null);
  const [departments, setDepartments] = useState('');
  const [facilities, setFacilities] = useState('');
  const [operatingHours, setOperatingHours] = useState('');
  const [totalBeds, setTotalBeds] = useState('');
  const [icuBeds, setIcuBeds] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const applyHospital = (profile) => {
    setHospital(profile);
    setDepartments((profile.departments || []).map((department) => department.name).join('\n'));
    setFacilities((profile.facilities || []).join('\n'));
    setOperatingHours(profile.operatingHours || '');
    setTotalBeds(profile.totalBeds ?? 0);
    setIcuBeds(profile.icuBeds ?? 0);
  };

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/hospitals/me');
      applyHospital(response.data.hospital);
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message || 'Unable to load hospital departments and services.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setNotice('');

    try {
      const response = await api.patch('/hospitals/me/services', {
        departments: splitList(departments),
        facilities: splitList(facilities),
        operatingHours,
        totalBeds: Number(totalBeds),
        icuBeds: Number(icuBeds),
      });
      applyHospital(response.data.hospital);
      setNotice(response.data.message || 'Departments and services updated.');
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message || 'Unable to save hospital departments and services.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-sm text-slate-500">Loading hospital profile...</div>;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header className="rounded-3xl bg-slate-900 p-6 text-white shadow-card sm:p-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-blue-100">
          <Building2 className="h-4 w-4" /> Hospital profile
        </div>
        <h1 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">Departments & services</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
          Maintain the departments, facilities, operating hours, and bed capacity patients see when they browse your approved hospital. Updates are saved to your hospital profile.
        </p>
        {hospital && (
          <p className="mt-3 text-sm font-semibold text-blue-100">
            {hospital.name} · {hospital.city}, {hospital.state}
          </p>
        )}
      </header>

      {error && (
        <div role="alert" className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> <span>{error}</span>
        </div>
      )}
      {notice && (
        <div role="status" className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> <span>{notice}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-5">
        <section className="space-y-5 rounded-3xl border border-slate-100 bg-white p-6 shadow-card sm:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-primary">
              <Layers3 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900">Departments and specialties</h2>
              <p className="text-xs text-slate-500">Patients can choose from these when making a booking request.</p>
            </div>
          </div>
          <label className="block text-sm font-semibold text-slate-700" htmlFor="hospital-departments">
            Department list
            <textarea
              id="hospital-departments"
              required
              rows={6}
              maxLength={4000}
              value={departments}
              onChange={(event) => setDepartments(event.target.value)}
              placeholder={'Cardiology\nEmergency Care\nPediatrics'}
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-normal outline-none focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
            />
            <span className="mt-1 block text-xs font-normal text-slate-500">One department per line, or separate departments with commas.</span>
          </label>

          <div className="rounded-2xl bg-slate-50 p-4">
            <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
              <Stethoscope className="h-4 w-4" /> Current department roster
            </h3>
            {!hospital?.departments?.length ? (
              <p className="text-sm text-slate-500">No departments have been added yet.</p>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                {hospital.departments.map((department) => (
                  <div key={department.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm">
                    <span className="font-semibold text-slate-800">{department.name}</span>
                    <span className="text-xs text-slate-500">{department._count?.doctors || 0} doctors</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="space-y-5 rounded-3xl border border-slate-100 bg-white p-6 shadow-card sm:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900">Facilities and operating hours</h2>
              <p className="text-xs text-slate-500">Keep public-facing service information accurate.</p>
            </div>
          </div>
          <label className="block text-sm font-semibold text-slate-700" htmlFor="hospital-facilities">
            Available facilities
            <textarea
              id="hospital-facilities"
              rows={5}
              maxLength={3000}
              value={facilities}
              onChange={(event) => setFacilities(event.target.value)}
              placeholder={'24/7 Emergency\nDiagnostic laboratory\nPharmacy'}
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-normal outline-none focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
            />
            <span className="mt-1 block text-xs font-normal text-slate-500">One facility per line, or separate facilities with commas.</span>
          </label>
          <label className="block text-sm font-semibold text-slate-700" htmlFor="hospital-operating-hours">
            <span className="inline-flex items-center gap-2"><Clock3 className="h-4 w-4" /> Operating hours</span>
            <input
              id="hospital-operating-hours"
              required
              maxLength={200}
              value={operatingHours}
              onChange={(event) => setOperatingHours(event.target.value)}
              placeholder="Emergency: 24/7; outpatient: Mon-Sat, 8 AM-8 PM"
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-normal outline-none focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
            />
          </label>
        </section>

        <section className="space-y-5 rounded-3xl border border-slate-100 bg-white p-6 shadow-card sm:p-8">
          <div>
            <h2 className="font-bold text-slate-900">Bed capacity</h2>
            <p className="mt-1 text-xs text-slate-500">Capacity values are displayed as provided; occupancy is not currently tracked.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-semibold text-slate-700" htmlFor="hospital-total-beds">
              Total beds
              <input id="hospital-total-beds" type="number" min="0" max="100000" step="1" required value={totalBeds} onChange={(event) => setTotalBeds(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-normal outline-none focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20" />
            </label>
            <label className="text-sm font-semibold text-slate-700" htmlFor="hospital-icu-beds">
              ICU beds
              <input id="hospital-icu-beds" type="number" min="0" max={totalBeds || 0} step="1" required value={icuBeds} onChange={(event) => setIcuBeds(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-normal outline-none focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20" />
            </label>
          </div>
        </section>

        <div className="flex justify-end">
          <button type="submit" disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60">
            <Save className="h-4 w-4" /> {saving ? 'Saving changes...' : 'Save departments and services'}
          </button>
        </div>
      </form>
    </div>
  );
}
