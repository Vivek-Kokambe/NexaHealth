import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { ShieldAlert, Activity, Search, Clock, FileText } from 'lucide-react';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const res = await api.get('/admin/audit-logs');
        if (res.data.success) {
          setLogs(res.data.logs || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          System Compliance Audit Trail
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Cryptographically signed records of all patient history queries, emergency overrides, and credential approvals.
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500">Retrieving audit chain...</div>
      ) : (
        <div className="bg-white rounded-3xl shadow-card border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 text-[11px] uppercase font-bold">
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">Action Event</th>
                  <th className="p-4">Actor</th>
                  <th className="p-4">Target Entity</th>
                  <th className="p-4">IP Address</th>
                  <th className="p-4">Event Metadata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50/50">
                    <td className="p-4 text-slate-500">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="p-4 font-bold text-primary">
                      {log.action}
                    </td>
                    <td className="p-4 text-slate-800 font-sans">
                      {log.userName}
                      <span className="block text-[10px] uppercase font-bold text-slate-400 font-mono">
                        {log.userRole}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600">
                      {log.entityType} ({log.entityId?.slice(0, 8)}...)
                    </td>
                    <td className="p-4 text-slate-500">{log.ipAddress || '127.0.0.1'}</td>
                    <td className="p-4 text-slate-600 font-sans max-w-xs truncate">
                      {JSON.stringify(log.metadata || {})}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
