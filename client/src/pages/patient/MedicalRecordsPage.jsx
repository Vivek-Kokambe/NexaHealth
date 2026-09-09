import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import MedicalTimeline from '../../components/MedicalTimeline';
import { FileText, Printer, ShieldAlert } from 'lucide-react';

export default function MedicalRecordsPage() {
  const { user, roleData } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        setLoading(true);
        const res = await api.get('/patients/medical-records');
        if (res.data.success) {
          setRecords(res.data.records);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchRecords();
  }, []);

  const patientInfo = {
    name: user?.name,
    smartCardId: roleData?.smartCardId,
    bloodGroup: user?.bloodGroup,
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="no-print">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Digital Medical Records & History
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Chronological clinical consultations, vital sign trends, prescriptions, and laboratory reports linked to Smart Card #{roleData?.smartCardId || 'SCN-2026-104582'}.
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500">Retrieving encrypted medical history...</div>
      ) : (
        <MedicalTimeline records={records} patientInfo={patientInfo} showConsentWarning={false} />
      )}
    </div>
  );
}
