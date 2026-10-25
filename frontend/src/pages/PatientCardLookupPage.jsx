import React, { useEffect, useRef, useState } from 'react';
import { AlertTriangle, Camera, CreditCard, Radio, Search, ShieldCheck, UserRound } from 'lucide-react';
import api from '../services/api';

const getAge = (dateOfBirth) => {
  if (!dateOfBirth) return null;
  const dateOnly = String(dateOfBirth).slice(0, 10);
  const [year, month, day] = dateOnly.split('-').map(Number);
  const birthDate = new Date(year, month - 1, day);
  if (Number.isNaN(birthDate.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const hasHadBirthdayThisYear = today.getMonth() > birthDate.getMonth()
    || (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate());
  if (!hasHadBirthdayThisYear) age -= 1;
  return age >= 0 ? age : null;
};

const formatDate = (dateOfBirth) => {
  if (!dateOfBirth) return 'Not recorded';
  const [year, month, day] = String(dateOfBirth).slice(0, 10).split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return Number.isNaN(date.getTime()) ? 'Not recorded' : date.toLocaleDateString();
};

export default function PatientCardLookupPage() {
  const [patient, setPatient] = useState(null);
  const [smartCardId, setSmartCardId] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [readerConnected, setReaderConnected] = useState(false);
  const [readerConnecting, setReaderConnecting] = useState(false);
  const [cameraScanning, setCameraScanning] = useState(false);
  const videoRef = useRef(null);
  const serialPortRef = useRef(null);
  const serialReaderRef = useRef(null);
  const cameraStreamRef = useRef(null);
  const cameraIntervalRef = useRef(null);
  const detectingQrRef = useRef(false);

  const lookupPatient = async (payload) => {
    setLoading(true);
    setPatient(null);
    setMessage('');
    try {
      const response = await api.post('/patients/lookup', payload);
      setPatient(response.data.patient);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Could not look up this patient.');
    } finally {
      setLoading(false);
    }
  };

  const stopCamera = () => {
    if (cameraIntervalRef.current) {
      clearInterval(cameraIntervalRef.current);
      cameraIntervalRef.current = null;
    }
    cameraStreamRef.current?.getTracks().forEach((track) => track.stop());
    cameraStreamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    detectingQrRef.current = false;
    setCameraScanning(false);
  };

  const readSerialPort = async (port) => {
    const decoder = new TextDecoderStream();
    const readableClosed = port.readable.pipeTo(decoder.writable);
    const reader = decoder.readable.getReader();
    serialReaderRef.current = reader;
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
            setMessage(trimmedLine.slice('RFID_ERROR:'.length).trim());
            continue;
          }
          const match = trimmedLine.match(/^RFID_UID:([0-9a-f:-]+)$/i);
          if (match) await lookupPatient({ uid: match[1] });
        }
      }
    } catch (error) {
      setReaderConnected(false);
      setMessage(error.message || 'USB RFID reader disconnected.');
    } finally {
      reader.releaseLock();
      await readableClosed.catch(() => {});
      if (serialPortRef.current === port) {
        serialReaderRef.current = null;
        serialPortRef.current = null;
        setReaderConnected(false);
        await port.close().catch(() => {});
      }
    }
  };

  const connectReader = async () => {
    if (readerConnecting || readerConnected) return;
    if (!navigator.serial) {
      setMessage('USB serial requires Chrome or Edge on localhost or HTTPS.');
      return;
    }

    setReaderConnecting(true);
    setMessage('');
    try {
      const port = await navigator.serial.requestPort();
      await port.open({ baudRate: 115200 });
      serialPortRef.current = port;
      setReaderConnected(true);
      setMessage('Reader connected. Present a patient card to look them up.');
      readSerialPort(port);
    } catch (error) {
      if (error.name !== 'NotFoundError') {
        setMessage(error.name === 'NetworkError'
          ? 'Could not open the selected COM port. Close Arduino Serial Monitor/Plotter and any other app using it, then reconnect the ESP32.'
          : error.message || 'Could not connect to the USB RFID reader.');
      }
    } finally {
      setReaderConnecting(false);
    }
  };

  const startQrScanner = async () => {
    if (!('BarcodeDetector' in window)) {
      setMessage('QR camera scanning is not supported by this browser. Enter the Smart Card ID manually instead.');
      return;
    }

    try {
      const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } }
      });
      cameraStreamRef.current = stream;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      setCameraScanning(true);
      setMessage('Camera ready. Point it at the patient’s Smart Card QR code.');
      cameraIntervalRef.current = setInterval(async () => {
        if (detectingQrRef.current || !videoRef.current || videoRef.current.readyState < 2) return;
        detectingQrRef.current = true;
        try {
          const [result] = await detector.detect(videoRef.current);
          if (result?.rawValue) {
            stopCamera();
            await lookupPatient({ qrValue: result.rawValue });
          }
        } catch (error) {
          stopCamera();
          setMessage(error.message || 'Could not scan the QR code.');
        } finally {
          detectingQrRef.current = false;
        }
      }, 250);
    } catch (error) {
      stopCamera();
      setMessage(error.message || 'Could not start the camera. Check browser camera permissions.');
    }
  };

  const handleManualLookup = (event) => {
    event.preventDefault();
    lookupPatient({ smartCardId });
  };

  useEffect(() => () => {
    if (cameraIntervalRef.current) clearInterval(cameraIntervalRef.current);
    cameraStreamRef.current?.getTracks().forEach((track) => track.stop());
    const reader = serialReaderRef.current;
    const port = serialPortRef.current;
    if (reader) {
      reader.cancel().finally(() => port?.close().catch(() => {}));
    } else {
      port?.close().catch(() => {});
    }
  }, []);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
          <ShieldCheck className="h-4 w-4" />
          Authorized staff lookup
        </div>
        <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
          Patient Card Lookup
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Read an RFID card, scan a Smart Card QR code, or enter its ID to view essential patient information.
        </p>
      </header>

      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <p className="flex items-start gap-2">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <span>Patient information is confidential. Access is restricted to authorized healthcare staff and recorded for auditing. Use it only for legitimate care.</span>
        </p>
      </section>

      <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={connectReader}
            disabled={readerConnected || readerConnecting}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Radio className="h-4 w-4" />
            {readerConnected ? 'RFID Reader Connected' : readerConnecting ? 'Connecting...' : 'Connect RFID Reader'}
          </button>
          <button
            type="button"
            onClick={cameraScanning ? stopCamera : startQrScanner}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
          >
            <Camera className="h-4 w-4" />
            {cameraScanning ? 'Stop QR Scanner' : 'Scan QR Code'}
          </button>
        </div>

        <video
          ref={videoRef}
          className={`${cameraScanning ? 'block' : 'hidden'} max-h-80 w-full rounded-xl bg-slate-950 object-contain`}
          muted
          playsInline
        />

        <div className="flex items-center gap-3 text-xs font-medium uppercase tracking-wide text-slate-400">
          <span className="h-px flex-1 bg-slate-200" />
          Or enter card ID
          <span className="h-px flex-1 bg-slate-200" />
        </div>

        <form onSubmit={handleManualLookup} className="flex flex-col gap-2 sm:flex-row">
          <label className="relative flex-1">
            <CreditCard className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              required
              value={smartCardId}
              onChange={(event) => setSmartCardId(event.target.value)}
              placeholder="SCN-YYYY-XXXXXX"
              className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-3 font-mono text-sm uppercase focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-60"
          >
            <Search className="h-4 w-4" />
            {loading ? 'Looking up...' : 'Look Up'}
          </button>
        </form>

        {message && (
          <p role="status" className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
            {message}
          </p>
        )}
      </section>

      {patient && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-primary">
              <UserRound className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">{patient.name}</h2>
              <p className="text-sm text-slate-500">
                {getAge(patient.dateOfBirth) === null ? 'Age not recorded' : `${getAge(patient.dateOfBirth)} years old`}
              </p>
            </div>
          </div>

          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Date of birth</dt>
              <dd className="mt-1 text-sm font-medium text-slate-900">{formatDate(patient.dateOfBirth)}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Blood group</dt>
              <dd className="mt-1 text-sm font-semibold text-rose-700">{patient.bloodGroup || 'Not recorded'}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Allergies</dt>
              <dd className="mt-1 text-sm text-slate-900">
                {patient.allergies?.length ? patient.allergies.join(', ') : 'None recorded'}
              </dd>
            </div>
          </dl>
        </section>
      )}
    </div>
  );
}
