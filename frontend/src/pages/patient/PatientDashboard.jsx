import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import api from '../../services/api';
import SmartCardWidget from '../../components/SmartCardWidget';
import QueueTrackerWidget from '../../components/QueueTrackerWidget';
import {
  Calendar,
  Clock,
  FileText,
  CreditCard,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Activity,
  Plus
} from 'lucide-react';

export default function PatientDashboard() {
  const { user } = useAuth();
  const { lastQueueEvent } = useSocket();

  const [cardData, setCardData] = useState(null);
  const [queueData, setQueueData] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [recentRecords, setRecentRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rfidStatus, setRfidStatus] = useState({ isAttached: false, isPairing: false });
  const [rfidMessage, setRfidMessage] = useState('');
  const scanCursor = useRef(new Date().toISOString());
  const serialPort = useRef(null);
  const serialReader = useRef(null);
  const [readerConnected, setReaderConnected] = useState(false);
  const [readerConnecting, setReaderConnecting] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [cardRes, queueRes, aptRes, recRes] = await Promise.allSettled([
        api.get('/patients/smart-card'),
        api.get('/patients/queue'),
        api.get('/patients/appointments'),
        api.get('/patients/medical-records'),
      ]);

      if (cardRes.status === 'fulfilled' && cardRes.value.data.success) {
        setCardData(cardRes.value.data.smartCard);
      }
      if (queueRes.status === 'fulfilled' && queueRes.value.data.success) {
        setQueueData(queueRes.value.data);
      }
      if (aptRes.status === 'fulfilled' && aptRes.value.data.success) {
        setAppointments(aptRes.value.data.appointments || []);
      }
      if (recRes.status === 'fulfilled' && recRes.value.data.success) {
        setRecentRecords(recRes.value.data.records?.slice(0, 2) || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => () => {
    const reader = serialReader.current;
    const port = serialPort.current;
    if (reader) {
      reader.cancel().finally(() => port?.close().catch(() => {}));
    } else {
      port?.close().catch(() => {});
    }
  }, []);

  const processSerialUid = async (uid) => {
    try {
      const response = await api.post('/patients/rfid/scan', { uid });
      if (response.data.status === 'attached') {
        setRfidStatus({ isAttached: true, isPairing: false });
        setRfidMessage('RFID card attached to your patient account.');
      } else if (response.data.status === 'detected') {
        setRfidMessage(`RFID card recognized for ${user?.name || 'your patient account'}.`);
      }
    } catch (error) {
      setRfidMessage(error.response?.data?.message || 'Could not process the RFID scan.');
    }
  };

  const readSerialPort = async (port) => {
    const decoder = new TextDecoderStream();
    const readableClosed = port.readable.pipeTo(decoder.writable);
    const reader = decoder.readable.getReader();
    serialReader.current = reader;
    let buffer = '';

    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += value;
        const lines = buffer.split(/\r?\n/);
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (trimmedLine.startsWith('RFID_ERROR:')) {
            setRfidMessage(trimmedLine.slice('RFID_ERROR:'.length).trim());
            continue;
          }

          const match = trimmedLine.match(/^RFID_UID:([0-9a-f:-]+)$/i);
          if (match) await processSerialUid(match[1]);
        }
      }
    } catch (error) {
      setReaderConnected(false);
      setRfidMessage(error.message || 'USB RFID reader disconnected.');
    } finally {
      reader.releaseLock();
      await readableClosed.catch(() => {});
      if (serialPort.current === port) {
        serialReader.current = null;
        serialPort.current = null;
        setReaderConnected(false);
        await port.close().catch(() => {});
      }
    }
  };

  const handleConnectPhysicalReader = async () => {
    if (readerConnecting || readerConnected) return;

    if (!navigator.serial) {
      setRfidMessage('USB serial requires Chrome or Edge on localhost.');
      return;
    }

    setReaderConnecting(true);
    try {
      const port = await navigator.serial.requestPort();
      await port.open({ baudRate: 115200 });
      serialPort.current = port;
      setReaderConnected(true);
      setRfidMessage('USB reader connected. Start pairing, then present the card.');
      readSerialPort(port);
    } catch (error) {
      if (error.name !== 'NotFoundError') {
        if (error.name === 'NetworkError') {
          setRfidMessage('Could not open the selected COM port. Close Arduino Serial Monitor/Plotter and any other app using the port, then unplug and reconnect the ESP32 before retrying.');
        } else if (error.name === 'InvalidStateError') {
          setRfidMessage('The serial port is already open. Close the app currently using it, then retry.');
        } else if (error.name === 'SecurityError') {
          setRfidMessage('The browser blocked serial access. Use Chrome or Edge on localhost and allow access to the ESP32 port.');
        } else {
          setRfidMessage(error.message || 'Could not connect to the USB RFID reader.');
        }
      }
    } finally {
      setReaderConnecting(false);
    }
  };

  useEffect(() => {
    let active = true;
    let lastPollingErrorMessage = null;
    const pollRfid = async () => {
      try {
        const [statusResponse, scansResponse] = await Promise.all([
          api.get('/patients/rfid/status'),
          api.get('/patients/rfid/scans', { params: { after: scanCursor.current } }),
        ]);

        if (!active) return;
        lastPollingErrorMessage = null;
        setRfidStatus(statusResponse.data);

        for (const event of scansResponse.data.events || []) {
          scanCursor.current = event.scannedAt;
          if (event.type === 'ATTACHED') {
            setRfidMessage('Physical RFID card attached to your patient account.');
          } else if (event.type === 'DETECTED') {
            setRfidMessage(`RFID card recognized for ${user?.name || 'your patient account'}.`);
          }
        }
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || 'Unknown RFID status error';
        if (active && errorMessage !== lastPollingErrorMessage) {
          console.error('Could not refresh RFID status:', error);
          lastPollingErrorMessage = errorMessage;
        }
      }
    };

    pollRfid();
    const intervalId = setInterval(pollRfid, 1500);
    return () => {
      active = false;
      clearInterval(intervalId);
    };
  }, []);

  const handleAttachPhysicalCard = async () => {
    setRfidMessage('');
    scanCursor.current = new Date().toISOString();
    try {
      const response = await api.post('/patients/rfid/pairing');
      setRfidStatus({ isAttached: false, isPairing: true, pairingExpiresAt: response.data.expiresAt });
      setRfidMessage('Ready to pair. Present your RFID card to the reader within 90 seconds.');
    } catch (error) {
      setRfidMessage(error.response?.data?.message || 'Could not start RFID pairing. Please try again.');
    }
  };

  // Update on socket queue events
  useEffect(() => {
    if (lastQueueEvent) {
      fetchDashboardData();
    }
  }, [lastQueueEvent]);

  // Find next upcoming appointment
  const nextAppointment = appointments.find(a => ['confirmed', 'waiting', 'checked_in'].includes(a.status));

  const handleCheckIn = async (aptId) => {
    try {
      const res = await api.post(`/appointments/${aptId}/check-in`, {
        smartCardId: cardData?.smartCardId || roleData?.smartCardId,
      });
      if (res.data.success) {
        alert(res.data.message);
        fetchDashboardData();
      }
    } catch (e) {
      alert(e.response?.data?.message || 'Check-in failed');
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary via-blue-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-blue-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Digital Smart Card Verified</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name}
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 max-w-xl">
            Smart Card ID: <span className="font-mono font-bold text-white bg-white/20 px-2 py-0.5 rounded">{cardData?.smartCardId || user?.smartCardId || 'Not issued'}</span> • Blood Group: <span className="font-bold text-rose-300">{user?.bloodGroup || 'Not recorded'}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/patient/book"
            className="px-4 py-2.5 bg-white text-primary font-bold text-xs rounded-xl shadow hover:bg-blue-50 transition flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Book Visit</span>
          </Link>
          <Link
            to="/patient/smart-card"
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl border border-white/20 transition flex items-center space-x-1.5"
          >
            <CreditCard className="w-4 h-4" />
            <span>View Card</span>
          </Link>
        </div>
      </div>

      {/* Grid: Smart Card Preview + Queue Tracker */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Smart Card Widget */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-sm font-bold text-slate-800">My Smart Card Pass</h3>
            <Link to="/patient/smart-card" className="text-xs text-primary font-medium hover:underline">
              Full Card Details →
            </Link>
          </div>
          <SmartCardWidget cardData={cardData || {
            name: user?.name,
            patientName: user?.name,
            bloodGroup: user?.bloodGroup,
            smartCardId: user?.smartCardId,
            dateOfBirth: user?.patient?.dateOfBirth,
            allergies: user?.patient?.allergies,
            emergencyContact: user?.patient?.emergencyContact,
          }} onConnectPhysicalReader={handleConnectPhysicalReader} readerConnected={readerConnected} readerConnecting={readerConnecting} onAttachPhysicalCard={handleAttachPhysicalCard} rfidAttached={rfidStatus.isAttached} rfidPairing={rfidStatus.isPairing} />
          {rfidMessage && (
            <p role="status" className="text-center text-xs text-teal-800 bg-teal-50 border border-teal-100 rounded-lg px-3 py-2">
              {rfidMessage}
            </p>
          )}
        </div>

        {/* Right: Live Queue & Next Appointment */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-800 mb-3">Live Consultation Queue Telemetry</h3>
            <QueueTrackerWidget queueData={queueData} onRefresh={fetchDashboardData} />
          </div>

          {/* Next Appointment Card */}
          {nextAppointment ? (
            <div className="bg-white rounded-2xl p-5 shadow-card border border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Next Scheduled Consultation</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  nextAppointment.status === 'confirmed' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {nextAppointment.status.replace('_', ' ')}
                </span>
              </div>

              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-base font-bold text-slate-900">{nextAppointment.doctorName || 'Dr. Specialist'}</h4>
                  <p className="text-xs text-slate-500">{nextAppointment.department} • {nextAppointment.hospitalName}</p>
                  <p className="text-xs font-semibold text-primary mt-1">
                    📅 {nextAppointment.appointmentDate} at {nextAppointment.appointmentTime}
                  </p>
                </div>

                {nextAppointment.status === 'confirmed' && (
                  <button
                    onClick={() => handleCheckIn(nextAppointment._id)}
                    className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700 shadow-sm transition"
                  >
                    Check In Now
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-5 shadow-card border border-slate-100 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-800">No Upcoming Appointments</h4>
                <p className="text-xs text-slate-500">Need to see a doctor? Book a slot with top network hospitals.</p>
              </div>
              <Link
                to="/patient/book"
                className="px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-xl"
              >
                Book Now
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Recent Medical Records Snippet */}
      <div className="bg-white rounded-2xl p-6 shadow-card border border-slate-100 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Recent Clinical Encounters</h3>
            <p className="text-xs text-slate-500">Digital records stored under your Smart Card ID</p>
          </div>
          <Link to="/patient/medical-records" className="text-xs font-semibold text-primary hover:underline flex items-center space-x-1">
            <span>View Full Timeline</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentRecords.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">No recent consultations recorded.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentRecords.map((rec) => (
              <div key={rec._id} className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">{rec.diagnosis}</span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {new Date(rec.consultationDate || rec.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-slate-600">
                  Doctor: <span className="font-semibold text-slate-800">{rec.doctorName}</span> ({rec.hospitalName})
                </p>
                {rec.prescription && rec.prescription.length > 0 && (
                  <p className="text-[11px] text-primary font-medium">
                    Rx: {rec.prescription.map(p => p.medication).join(', ')}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
