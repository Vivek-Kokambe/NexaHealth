import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { User, Phone, ShieldCheck, Heart, AlertCircle, Save, CheckCircle2 } from 'lucide-react';

export default function PatientProfilePage() {
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await api.get('/patients/profile');
        if (res.data.success) {
          setProfile({
            name: res.data.user?.name || '',
            phone: res.data.user?.phone || '',
            bloodGroup: res.data.user?.bloodGroup || 'O+',
            allergies: res.data.user?.allergies?.join(', ') || '',
            emergencyName: res.data.user?.emergencyContact?.name || '',
            emergencyPhone: res.data.user?.emergencyContact?.phone || '',
            insuranceProvider: res.data.patient?.insuranceDetails?.provider || '',
            insurancePolicy: res.data.patient?.insuranceDetails?.policyNumber || '',
          });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    try {
      const payload = {
        name: profile.name,
        phone: profile.phone,
        bloodGroup: profile.bloodGroup,
        allergies: profile.allergies.split(',').map(s => s.trim()).filter(Boolean),
        emergencyContact: {
          name: profile.emergencyName,
          phone: profile.emergencyPhone,
        },
        insuranceDetails: {
          provider: profile.insuranceProvider,
          policyNumber: profile.insurancePolicy,
        },
      };

      const res = await api.put('/patients/profile', payload);
      if (res.data.success) {
        setSuccessMsg('Profile and clinical emergency contacts updated successfully.');
        refreshUser();
      }
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-12 text-center text-xs text-slate-500">Loading patient profile...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Personal Health Profile & Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Keep your emergency numbers, allergy alerts, and health insurance information up to date.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-slate-100 space-y-6 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Full Legal Name</label>
            <input
              type="text"
              required
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Primary Phone</label>
            <input
              type="tel"
              required
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Blood Group</label>
            <select
              value={profile.bloodGroup}
              onChange={(e) => setProfile({ ...profile, bloodGroup: e.target.value })}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-rose-600"
            >
              {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Drug & Substance Allergies (Comma separated)</label>
            <input
              type="text"
              value={profile.allergies}
              onChange={(e) => setProfile({ ...profile, allergies: e.target.value })}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="pt-4 border-t border-slate-100">
          <h4 className="font-bold text-slate-900 text-sm mb-3">Emergency Contact Details</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Contact Name / Relation</label>
              <input
                type="text"
                value={profile.emergencyName}
                onChange={(e) => setProfile({ ...profile, emergencyName: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Emergency Telephone</label>
              <input
                type="tel"
                value={profile.emergencyPhone}
                onChange={(e) => setProfile({ ...profile, emergencyPhone: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* Insurance */}
        <div className="pt-4 border-t border-slate-100">
          <h4 className="font-bold text-slate-900 text-sm mb-3">Health Insurance Affiliation</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Insurance Provider</label>
              <input
                type="text"
                value={profile.insuranceProvider}
                onChange={(e) => setProfile({ ...profile, insuranceProvider: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Policy / Member ID</label>
              <input
                type="text"
                value={profile.insurancePolicy}
                onChange={(e) => setProfile({ ...profile, insurancePolicy: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition flex items-center space-x-1.5 shadow-sm disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
