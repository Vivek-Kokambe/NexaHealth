import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BedDouble,
  Building2,
  CheckCircle2,
  Clock3,
  MapPin,
  ShieldCheck,
} from 'lucide-react';
import api from '../../services/api';

const facilityOptions = [
  '24/7 Emergency',
  'Intensive care unit',
  'Diagnostic laboratory',
  'Radiology and imaging',
  'Pharmacy',
  'Ambulance service',
  'Blood bank',
  'Maternity care',
];

const inputClassName = 'w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20';
const labelClassName = 'mb-1.5 block text-xs font-semibold text-slate-700';

const toList = (value) => value
  .split(',')
  .map((item) => item.trim())
  .filter(Boolean);

export default function HospitalRegistrationPage() {
  const [formData, setFormData] = useState({
    name: '',
    registrationNumber: '',
    hospitalType: 'MULTI_SPECIALTY',
    email: '',
    phone: '',
    password: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    websiteUrl: '',
    totalBeds: '0',
    icuBeds: '0',
    operatingHours: '24/7 Emergency; outpatient services: 8:00 AM - 8:00 PM',
    departments: '',
  });
  const [facilities, setFacilities] = useState([]);
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (event) => {
    setFormData((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleFacilityChange = (facility) => {
    setFacilities((current) => current.includes(facility)
      ? current.filter((item) => item !== facility)
      : [...current, facility]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!otpSent) {
        await api.post('/hospitals/register/request', {
          email: formData.email,
          registrationNumber: formData.registrationNumber,
        });
        setOtpSent(true);
        return;
      }

      await api.post('/hospitals/register/verify', {
        ...formData,
        otp,
        totalBeds: Number(formData.totalBeds),
        icuBeds: Number(formData.icuBeds),
        departments: toList(formData.departments),
        facilities,
      });
      setSuccess(true);
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message || 'Hospital registration failed.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-2xl items-center px-4 py-12">
        <section className="w-full space-y-5 rounded-3xl border border-slate-100 bg-white p-8 text-center shadow-card sm:p-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
            <CheckCircle2 className="h-9 w-9" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Hospital registration received</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Your email has been verified and <strong>{formData.name}</strong> has been added to the
              hospital network for credential review.
            </p>
          </div>
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-left text-sm leading-6 text-amber-900">
            Your account remains pending until the hospital registration is reviewed. You can sign in
            after approval.
          </div>
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white transition hover:bg-primary-dark"
          >
            Return to SmartCare <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <Link to="/register" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-primary">
        <ArrowLeft className="h-4 w-4" /> Registration options
      </Link>

      <header className="mb-8 grid gap-5 rounded-3xl bg-slate-900 p-6 text-white sm:grid-cols-[1fr_auto] sm:items-center sm:p-8">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-blue-100">
            <Building2 className="h-4 w-4" /> Hospital network enrollment
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Register your hospital</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
            Create an institutional profile for your facility. Add its registration and contact details,
            location, departments, capacity, and available services so the SmartCare team can review a
            complete application.
          </p>
        </div>
        <div className="hidden h-20 w-20 items-center justify-center rounded-3xl bg-blue-500/20 text-blue-200 sm:flex">
          <ShieldCheck className="h-10 w-10" />
        </div>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div role="alert" className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!otpSent ? (
          <>
            <section className="space-y-5 rounded-3xl border border-slate-100 bg-white p-6 shadow-card sm:p-8">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-primary">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900">Organization details</h2>
                  <p className="text-xs text-slate-500">Use the official name and registration details.</p>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className={labelClassName} htmlFor="hospital-name">Hospital or facility name *</label>
                  <input id="hospital-name" className={inputClassName} name="name" value={formData.name} onChange={handleChange} required maxLength={120} placeholder="e.g. Northside Multispecialty Hospital" />
                </div>
                <div>
                  <label className={labelClassName} htmlFor="hospital-registration">Hospital registration number *</label>
                  <input id="hospital-registration" className={inputClassName} name="registrationNumber" value={formData.registrationNumber} onChange={handleChange} required maxLength={80} placeholder="Official facility registration number" />
                </div>
                <div>
                  <label className={labelClassName} htmlFor="hospital-type">Facility type *</label>
                  <select id="hospital-type" className={inputClassName} name="hospitalType" value={formData.hospitalType} onChange={handleChange} required>
                    <option value="GENERAL">General hospital</option>
                    <option value="MULTI_SPECIALTY">Multi-specialty hospital</option>
                    <option value="SPECIALTY">Specialty hospital</option>
                    <option value="TEACHING">Teaching hospital</option>
                    <option value="COMMUNITY">Community health facility</option>
                  </select>
                </div>
                <div>
                  <label className={labelClassName} htmlFor="hospital-email">Administrative email *</label>
                  <input id="hospital-email" className={inputClassName} type="email" name="email" value={formData.email} onChange={handleChange} required maxLength={254} autoComplete="email" placeholder="admin@hospital.org" />
                </div>
                <div>
                  <label className={labelClassName} htmlFor="hospital-phone">Contact phone *</label>
                  <input id="hospital-phone" className={inputClassName} type="tel" name="phone" value={formData.phone} onChange={handleChange} required minLength={8} maxLength={20} autoComplete="tel" placeholder="+91 98765 43210" />
                </div>
                <div>
                  <label className={labelClassName} htmlFor="hospital-password">Create password *</label>
                  <input id="hospital-password" className={inputClassName} type="password" name="password" value={formData.password} onChange={handleChange} required minLength={8} maxLength={128} autoComplete="new-password" placeholder="At least 8 characters" />
                </div>
                <div>
                  <label className={labelClassName} htmlFor="hospital-website">Website (optional)</label>
                  <input id="hospital-website" className={inputClassName} type="url" name="websiteUrl" value={formData.websiteUrl} onChange={handleChange} maxLength={255} placeholder="https://www.hospital.org" />
                </div>
              </div>
            </section>

            <section className="space-y-5 rounded-3xl border border-slate-100 bg-white p-6 shadow-card sm:p-8">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900">Location and contact</h2>
                  <p className="text-xs text-slate-500">Provide the facility's full physical address.</p>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className={labelClassName} htmlFor="hospital-address">Street address *</label>
                  <input id="hospital-address" className={inputClassName} name="address" value={formData.address} onChange={handleChange} required maxLength={200} autoComplete="street-address" placeholder="Building, street, locality" />
                </div>
                <div>
                  <label className={labelClassName} htmlFor="hospital-city">City *</label>
                  <input id="hospital-city" className={inputClassName} name="city" value={formData.city} onChange={handleChange} required maxLength={80} autoComplete="address-level2" />
                </div>
                <div>
                  <label className={labelClassName} htmlFor="hospital-state">State or region *</label>
                  <input id="hospital-state" className={inputClassName} name="state" value={formData.state} onChange={handleChange} required maxLength={80} autoComplete="address-level1" />
                </div>
                <div>
                  <label className={labelClassName} htmlFor="hospital-pincode">Postal code *</label>
                  <input id="hospital-pincode" className={inputClassName} name="pincode" value={formData.pincode} onChange={handleChange} required inputMode="numeric" pattern="[0-9]{6}" minLength={6} maxLength={6} autoComplete="postal-code" placeholder="6-digit postal code" />
                </div>
              </div>
            </section>

            <section className="space-y-5 rounded-3xl border border-slate-100 bg-white p-6 shadow-card sm:p-8">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
                  <BedDouble className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900">Services and capacity</h2>
                  <p className="text-xs text-slate-500">Help patients and care teams understand what you provide.</p>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className={labelClassName} htmlFor="hospital-departments">Departments and specialties *</label>
                  <input id="hospital-departments" className={inputClassName} name="departments" value={formData.departments} onChange={handleChange} required maxLength={1000} placeholder="Cardiology, Emergency Care, Pediatrics" />
                  <p className="mt-1 text-[11px] text-slate-500">Separate specialties with commas. Add at least one department.</p>
                </div>
                <div>
                  <label className={labelClassName} htmlFor="hospital-total-beds">Total beds</label>
                  <input id="hospital-total-beds" className={inputClassName} type="number" name="totalBeds" value={formData.totalBeds} onChange={handleChange} required min="0" max="100000" step="1" />
                </div>
                <div>
                  <label className={labelClassName} htmlFor="hospital-icu-beds">ICU beds</label>
                  <input id="hospital-icu-beds" className={inputClassName} type="number" name="icuBeds" value={formData.icuBeds} onChange={handleChange} required min="0" max={formData.totalBeds || undefined} step="1" />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClassName} htmlFor="hospital-hours">
                    <span className="inline-flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5" /> Operating hours *</span>
                  </label>
                  <input id="hospital-hours" className={inputClassName} name="operatingHours" value={formData.operatingHours} onChange={handleChange} required maxLength={200} placeholder="Emergency: 24/7; outpatient: Mon-Sat, 8 AM-8 PM" />
                </div>
              </div>
              <fieldset>
                <legend className={`${labelClassName} mb-2`}>Available facilities</legend>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  {facilityOptions.map((facility) => (
                    <label key={facility} className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 p-3 text-xs text-slate-700 hover:border-primary/40">
                      <input type="checkbox" checked={facilities.includes(facility)} onChange={() => handleFacilityChange(facility)} className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary" />
                      {facility}
                    </label>
                  ))}
                </div>
              </fieldset>
            </section>
          </>
        ) : (
          <section className="mx-auto max-w-xl space-y-5 rounded-3xl border border-slate-100 bg-white p-6 shadow-card sm:p-8">
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-primary">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Verify your hospital email</h2>
              <p className="mt-2 text-sm text-slate-600">
                Enter the 6-digit verification code sent to <strong>{formData.email}</strong>.
              </p>
            </div>
            <div>
              <label className={labelClassName} htmlFor="hospital-otp">Verification code</label>
              <input id="hospital-otp" className={`${inputClassName} text-center text-lg tracking-[0.35em]`} type="text" inputMode="numeric" autoComplete="one-time-code" maxLength={6} pattern="[0-9]{6}" value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, ''))} required autoFocus placeholder="000000" />
            </div>
            <button type="button" onClick={() => { setOtpSent(false); setOtp(''); setError(''); }} className="w-full text-center text-xs font-semibold text-primary hover:underline">
              Change hospital details
            </button>
          </section>
        )}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Link to="/register" className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
            Cancel
          </Link>
          <button type="submit" disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60">
            {loading ? 'Please wait...' : otpSent ? 'Verify email and submit for review' : 'Send verification code'}
            {!loading && <ArrowRight className="h-4 w-4" />}
          </button>
        </div>
      </form>
    </div>
  );
}
