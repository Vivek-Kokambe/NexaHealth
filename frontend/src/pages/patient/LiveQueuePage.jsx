import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import QueueTrackerWidget from '../../components/QueueTrackerWidget';
import { Activity, Bell, Info, ShieldCheck } from 'lucide-react';

export default function LiveQueuePage() {
  const { lastQueueEvent } = useSocket();
  const [queueData, setQueueData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const res = await api.get('/patients/queue');
      if (res.data.success) {
        setQueueData(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  useEffect(() => {
    if (lastQueueEvent) {
      fetchQueue();
    }
  }, [lastQueueEvent]);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Live Patient Queue Telemetry
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Connected directly to the attending physician's desk. Position and wait estimates update dynamically.
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500">Connecting to queue server...</div>
      ) : (
        <QueueTrackerWidget queueData={queueData} onRefresh={fetchQueue} />
      )}

      {/* Guidelines Box */}
      <div className="bg-white rounded-2xl p-6 shadow-card border border-slate-100 space-y-4">
        <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
          <Info className="w-4 h-4 text-primary" />
          <span>Hospital Waiting Room Guidelines</span>
        </h3>
        <ul className="space-y-2 text-xs text-slate-600 leading-relaxed">
          <li className="flex items-start space-x-2">
            <span className="text-primary font-bold">•</span>
            <span>When your position reads <strong>#1</strong> or status changes to <strong>In Consultation</strong>, proceed directly to your assigned consultation suite.</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-primary font-bold">•</span>
            <span>Keep your Smart Card QR code accessible on your mobile device for immediate clinical verification.</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-primary font-bold">•</span>
            <span>Emergency trauma triage may occasionally cause short pauses in routine OPD consultations.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
