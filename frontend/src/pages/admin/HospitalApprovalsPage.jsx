import React, { useCallback, useEffect, useState } from 'react';
import {
  AlertCircle,
  BedDouble,
  Building2,
  CheckCircle2,
  Clock3,
  MapPin,
  RefreshCw,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import api from '../../services/api';

const statusOptions = [
  { value: 'PENDING', label: 'Pending review' },
  { value: 'VERIFIED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'ALL', label: 'All applications' },
];

const statusStyles = {
  PENDING: 'bg-amber-100 text-amber-800',
  VERIFIED: 'bg-emerald-100 text-emerald-800',
  REJECTED: 'bg-rose-100 text-rose-800',
};

const formatDate = (date) => {
  if (!date) return 'Date unavailable';
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(date));
};

export default function HospitalApprovalsPage() {
  const [hospitals, setHospitals] = useState([]);
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [loading, setLoading] = useState(true);
  const [busyHospitalId, setBusyHospitalId] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const fetchHospitals = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.get('/admin/hospitals', { params: { status: statusFilter } });
      setHospitals(response.data.hospitals || []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message || 'Unable to load hospital applications.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchHospitals();
  }, [fetchHospitals]);

  const handleReview = async (hospital, status) => {
    const action = status === 'VERIFIED' ? 'approve' : 'reject';
    const confirmed = window.confirm(`Are you sure you want to ${action} ${hospital.name}?`);
    if (!confirmed) return;

    setBusyHospitalId(hospital.id);
    setError('');
    setNotice('');

    try {
      const response = await api.patch(`/admin/hospitals/${hospital.id}/review`, { status });
      setNotice(response.data.message);
      await fetchHospitals();
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message || `Unable to ${action} this hospital.`);
    } finally {
      setBusyHospitalId('');
    }
  };

  return (
    <div className="space-y-6">
      <header className="rounded-3xl bg-slate-900 p-6 text-white shadow-card sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-blue-100">
              <ShieldCheck className="h-4 w-4" /> Administrator review
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Hospital applications</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
              Review hospital registration credentials and profile details. Approval activates the
              hospital account; rejection prevents that account from signing in.
            </p>
          </div>
          <button
            type="button"
            onClick={fetchHospitals}
            disabled={loading}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
      </header>

      {error && (
        <div role="alert" className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {notice && (
        <div role="status" className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Review queue</h2>
            <p className="mt-1 text-sm text-slate-500">
              {statusFilter === 'PENDING' ? 'Applications waiting for a decision.' : 'Hospital applications matching the selected status.'}
            </p>
          </div>
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <span className="sr-only">Filter applications by status</span>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-slate-100 bg-white p-12 text-center text-sm text-slate-500 shadow-card">
            Loading hospital applications...
          </div>
        ) : hospitals.length === 0 ? (
          <div className="rounded-3xl border border-slate-100 bg-white px-6 py-14 text-center shadow-card">
            <Building2 className="mx-auto h-10 w-10 text-slate-300" />
            <h3 className="mt-3 font-bold text-slate-800">No applications found</h3>
            <p className="mt-1 text-sm text-slate-500">
              {statusFilter === 'PENDING' ? 'There are no hospitals waiting for review.' : 'No hospitals match this status.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {hospitals.map((hospital) => {
              const status = hospital.verificationStatus || 'PENDING';
              const departments = hospital.departments?.map((department) => department.name) || [];
              const isBusy = busyHospitalId === hospital.id;

              return (
                <article key={hospital.id} className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-card">
                  <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6">
                    <div className="flex gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-primary">
                        <Building2 className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">{hospital.name}</h3>
                        <p className="mt-1 text-sm text-slate-600">
                          Registration number: <span className="font-mono font-semibold">{hospital.registrationNumber}</span>
                        </p>
                        <p className="mt-1 text-xs text-slate-500">Submitted {formatDate(hospital.createdAt)}</p>
                      </div>
                    </div>
                    <span className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-bold uppercase ${statusStyles[status] || 'bg-slate-100 text-slate-700'}`}>
                      {status}
                    </span>
                  </div>

                  <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-3">
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wide text-slate-400">Contact & location</h4>
                      <p className="text-sm text-slate-700">{hospital.email}</p>
                      <p className="text-sm text-slate-700">{hospital.phone}</p>
                      <p className="flex gap-2 text-sm leading-5 text-slate-700">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                        <span>{hospital.address}, {hospital.city}, {hospital.state} {hospital.pincode}</span>
                      </p>
                      {hospital.websiteUrl && (
                        <a className="break-all text-sm font-semibold text-primary hover:underline" href={hospital.websiteUrl} target="_blank" rel="noreferrer">
                          {hospital.websiteUrl}
                        </a>
                      )}
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wide text-slate-400">Facility profile</h4>
                      <p className="text-sm text-slate-700">Type: {hospital.hospitalType?.replaceAll('_', ' ') || 'Not provided'}</p>
                      <p className="flex items-center gap-2 text-sm text-slate-700">
                        <BedDouble className="h-4 w-4 text-slate-400" />
                        {hospital.totalBeds ?? '—'} total beds · {hospital.icuBeds ?? '—'} ICU beds
                      </p>
                      <p className="flex items-start gap-2 text-sm text-slate-700">
                        <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                        {hospital.operatingHours || 'Operating hours not provided'}
                      </p>
                      {hospital.user && (
                        <p className="text-xs text-slate-500">
                          Account status: <span className="font-semibold">{hospital.user.status}</span>
                        </p>
                      )}
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wide text-slate-400">Departments & services</h4>
                      {departments.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {departments.map((department) => (
                            <span key={department} className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-800">
                              {department}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-500">No departments provided</p>
                      )}
                      {hospital.facilities?.length > 0 && (
                        <p className="text-sm leading-6 text-slate-600">
                          <span className="font-semibold text-slate-700">Facilities:</span> {hospital.facilities.join(', ')}
                        </p>
                      )}
                    </div>
                  </div>

                  {status === 'PENDING' && (
                    <div className="flex flex-col gap-2 border-t border-slate-100 bg-slate-50/70 p-4 sm:flex-row sm:justify-end">
                      <button
                        type="button"
                        onClick={() => handleReview(hospital, 'REJECTED')}
                        disabled={isBusy}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <XCircle className="h-4 w-4" /> Reject application
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReview(hospital, 'VERIFIED')}
                        disabled={isBusy}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <CheckCircle2 className="h-4 w-4" /> {isBusy ? 'Saving decision...' : 'Approve hospital'}
                      </button>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
