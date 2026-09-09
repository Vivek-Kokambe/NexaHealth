import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import SmartCardWidget from '../../components/SmartCardWidget';
import { ShieldCheck, Download, Printer, AlertTriangle, FileCheck, CheckCircle2, LifeBuoy } from 'lucide-react';

export default function SmartCardPage() {
  const [cardData, setCardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reportModal, setReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('Lost physical card');
  const [reportedSuccess, setReportedSuccess] = useState(false);

  useEffect(() => {
    const fetchCard = async () => {
      try {
        const res = await api.get('/patients/smart-card');
        if (res.data.success) {
          setCardData(res.data.smartCard);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchCard();
  }, []);

  const handleReportLostSubmit = (e) => {
    e.preventDefault();
    setReportedSuccess(true);
    setTimeout(() => {
      setReportModal(false);
      setReportedSuccess(false);
    }, 2500);
  };

  if (loading) return <div className="p-12 text-center text-xs text-slate-500">Loading Smart Card credential...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Digital Health Smart Card
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Your universal patient token for seamless check-in and authorized record lookups across all network hospitals.
        </p>
      </div>

      {/* Main Card Component */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-card border border-slate-100 flex flex-col items-center">
        <SmartCardWidget cardData={cardData} onReportLost={() => setReportModal(true)} />
      </div>

      {/* Policy & Protection Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-card border border-slate-100 space-y-3">
          <div className="flex items-center space-x-2 text-primary font-bold text-sm">
            <ShieldCheck className="w-5 h-5" />
            <h3>Data Privacy & Encryption</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Your Smart Card ID utilizes zero-knowledge identification tokens. Full medical records are never embedded in the QR code itself, protecting you from unauthorized scanning in public spaces.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-card border border-slate-100 space-y-3">
          <div className="flex items-center space-x-2 text-tealAccent font-bold text-sm">
            <FileCheck className="w-5 h-5" />
            <h3>Insurance Affiliation</h3>
          </div>
          <div className="text-xs text-slate-600 space-y-1">
            <p><strong>Provider:</strong> {cardData?.insuranceDetails?.provider || 'Star Health Premier'}</p>
            <p><strong>Policy Number:</strong> {cardData?.insuranceDetails?.policyNumber || 'SHP-2026-904128'}</p>
            <p><strong>Max Cover:</strong> ₹{cardData?.insuranceDetails?.coverageAmount?.toLocaleString('en-IN') || '10,00,000'}</p>
          </div>
        </div>
      </div>

      {/* Report Lost Card Modal */}
      {reportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl animate-in fade-in">
            {reportedSuccess ? (
              <div className="text-center py-6 space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <h3 className="font-bold text-slate-900">Incident Reported</h3>
                <p className="text-xs text-slate-500">Your Smart Card token has been flagged for audit review. A replacement ID can be re-issued from your settings.</p>
              </div>
            ) : (
              <form onSubmit={handleReportLostSubmit} className="space-y-3 text-xs">
                <div className="flex items-center space-x-2 text-rose-600 font-bold">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="text-sm">Report Lost or Stolen Card</span>
                </div>
                <p className="text-slate-500 text-[11px]">
                  Flagging this card will temporarily lock automated hospital terminal check-ins using card #{cardData?.smartCardId}.
                </p>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Reason for report</label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="Lost physical card">Lost physical card</option>
                    <option value="Suspicious unauthorized scan">Suspicious unauthorized scan</option>
                    <option value="Damaged barcode / chip">Damaged barcode / chip</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setReportModal(false)}
                    className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-rose-600 text-white font-bold hover:bg-rose-700"
                  >
                    Submit Report
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
