import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Shield, Copy, Check, Printer, AlertTriangle, CreditCard, Activity, Wifi } from 'lucide-react';

export default function SmartCardWidget({ cardData, onReportLost }) {
  const [copied, setCopied] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  const smartCardId = cardData?.smartCardId || 'SCN-2026-104582';
  const patientName = cardData?.patientName || cardData?.name || 'Vivek Kokambe';
  const bloodGroup = cardData?.bloodGroup || 'A+';
  const dob = cardData?.dateOfBirth ? new Date(cardData.dateOfBirth).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '1 Jan 2005';
  const emergencyPhone = cardData?.emergencyContact?.phone || 'Not provided';
  const allergies = cardData?.allergies && cardData.allergies.length > 0 ? cardData.allergies : ['Penicillin', 'Peanuts'];
  const cardStatus = cardData?.cardStatus || 'active';
  const qrValue = cardData?.qrCodeValue || `SMARTCARE://${smartCardId}/${patientName.toUpperCase().replace(/\s+/g, '-')}/${bloodGroup}`;

  const handleCopyId = () => {
    navigator.clipboard.writeText(smartCardId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Physical-style Smart Card Container */}
      <div 
        id="printable-card"
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1F2C8F] via-[#1a257c] to-[#0d154d] p-6 text-white shadow-2xl border border-blue-400/20 max-w-lg mx-auto transition-all duration-300 hover:shadow-blue-900/30"
      >
        {/* Holographic Watermark & Circuit Accents */}
        <div className="absolute -right-12 -bottom-12 w-48 h-48 rounded-full bg-blue-500/10 blur-2xl pointer-events-none" />
        <div className="absolute top-0 right-0 p-4 opacity-15 pointer-events-none">
          <Activity className="w-32 h-32" />
        </div>

        {/* Card Header */}
        <div className="flex items-center justify-between relative z-10 border-b border-white/10 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-lg bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20">
              <Shield className="w-5 h-5 text-blue-200" />
            </div>
            <div>
              <h3 className="font-bold tracking-tight text-sm uppercase">SmartCare Health Network</h3>
              <p className="text-[10px] text-blue-200 tracking-wider">UNIFIED NATIONAL PATIENT IDENTITY</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Wifi className="w-5 h-5 text-blue-300/80 rotate-90" />
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
              cardStatus === 'active' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30' : 'bg-amber-500/20 text-amber-300'
            }`}>
              {cardStatus}
            </span>
          </div>
        </div>

        {/* Microchip Simulation */}
        <div className="flex items-center justify-between mt-4 relative z-10">
          <div className="w-11 h-8 rounded bg-gradient-to-tr from-amber-300 to-yellow-500 border border-amber-200/50 shadow-inner flex items-center justify-center">
            <div className="w-8 h-5 border border-amber-600/40 rounded-sm grid grid-cols-2 gap-0.5 p-0.5">
              <div className="border-r border-amber-600/40"></div>
              <div></div>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-blue-200 block uppercase tracking-wider">Card ID</span>
            <span className="font-mono text-lg font-bold tracking-wider text-white select-all">{smartCardId}</span>
          </div>
        </div>

        {/* Patient Details Section */}
        <div className="mt-5 grid grid-cols-12 gap-3 relative z-10 items-end">
          <div className="col-span-8 space-y-2">
            <div>
              <p className="text-[10px] text-blue-200/80 uppercase tracking-wider">Cardholder Name</p>
              <h4 className="text-base font-bold text-white tracking-wide truncate">{patientName}</h4>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <p className="text-[10px] text-blue-200/80 uppercase">Date of Birth</p>
                <p className="font-medium text-slate-100">{dob}</p>
              </div>
              <div>
                <p className="text-[10px] text-blue-200/80 uppercase">Blood Group</p>
                <p className="font-bold text-rose-300">{bloodGroup}</p>
              </div>
            </div>

            <div>
              <p className="text-[10px] text-blue-200/80 uppercase">Emergency Contact</p>
              <p className="text-xs text-slate-200 font-mono">{emergencyPhone}</p>
            </div>
          </div>

          {/* QR Code Container */}
          <div className="col-span-4 flex flex-col items-center justify-center">
            <div 
              onClick={() => setShowQrModal(true)}
              className="cursor-pointer bg-white p-1.5 rounded-lg shadow-md hover:scale-105 transition-transform"
              title="Click to expand QR Code"
            >
              <QRCodeSVG value={qrValue} size={64} level="M" />
            </div>
            <span className="text-[9px] text-blue-200 mt-1 cursor-pointer hover:underline" onClick={() => setShowQrModal(true)}>
              Tap to expand
            </span>
          </div>
        </div>

        {/* Critical Allergies Badge */}
        {allergies.length > 0 && (
          <div className="mt-4 pt-3 border-t border-white/10 flex items-center space-x-2 text-xs">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-300 flex-shrink-0" />
            <div className="flex items-center space-x-1 overflow-x-auto text-[11px]">
              <span className="text-amber-200 font-medium">Allergies:</span>
              {allergies.map((alg, i) => (
                <span key={i} className="bg-rose-500/30 text-rose-200 px-1.5 py-0.5 rounded border border-rose-400/30">
                  {alg}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons (No-print) */}
      <div className="no-print flex flex-wrap items-center justify-center gap-2 pt-2 max-w-lg mx-auto">
        <button
          onClick={handleCopyId}
          className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium bg-white text-slate-700 rounded-lg border border-slate-200 shadow-sm hover:bg-slate-50 transition"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
          <span>{copied ? 'Copied ID!' : 'Copy ID'}</span>
        </button>

        <button
          onClick={handlePrint}
          className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium bg-white text-slate-700 rounded-lg border border-slate-200 shadow-sm hover:bg-slate-50 transition"
        >
          <Printer className="w-3.5 h-3.5 text-slate-500" />
          <span>Print Card</span>
        </button>

        <button
          onClick={() => setShowQrModal(true)}
          className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium bg-white text-slate-700 rounded-lg border border-slate-200 shadow-sm hover:bg-slate-50 transition"
        >
          <CreditCard className="w-3.5 h-3.5 text-slate-500" />
          <span>Show QR</span>
        </button>

        <button
          onClick={onReportLost || (() => alert('Report submitted. Your card status has been flagged for replacement review.'))}
          className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-rose-600 hover:text-rose-700 bg-rose-50 rounded-lg border border-rose-200 transition"
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Report Lost</span>
        </button>
      </div>

      {/* Fullscreen QR Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold text-slate-900">Hospital Check-in QR Code</h3>
            <p className="text-xs text-slate-500">Scan at any registered SmartCare kiosk or doctor terminal for fast check-in.</p>
            <div className="flex justify-center p-4 bg-slate-50 rounded-xl border border-slate-100">
              <QRCodeSVG value={qrValue} size={180} level="H" includeMargin />
            </div>
            <div className="font-mono text-sm font-semibold text-primary">{smartCardId}</div>
            <p className="text-[11px] text-slate-400">Patient: {patientName} • {bloodGroup}</p>
            <button
              onClick={() => setShowQrModal(false)}
              className="w-full py-2 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-dark transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
