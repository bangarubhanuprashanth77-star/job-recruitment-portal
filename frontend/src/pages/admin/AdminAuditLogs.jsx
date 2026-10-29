import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import { Shield, ArrowLeft, Filter, Search, Clock, Activity } from 'lucide-react';

const AdminAuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (actionFilter) params.append('action', actionFilter);
      const res = await api.get(`/admin/audit-logs?${params.toString()}`);
      setLogs(res.data.logs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [actionFilter]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 flex justify-center">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        <Link to="/admin/dashboard" className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-900">
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back to Admin Dashboard
        </Link>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 flex items-center space-x-2">
              <Shield className="w-6 h-6 text-purple-600" />
              <span>Administrative Audit Trail & Security Logs ({logs.length})</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Immutable logging of user authentication, job moderation, company verifications, and status changes.
            </p>
          </div>
        </div>

        {/* Action Filter */}
        <div className="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center space-x-2 overflow-x-auto">
          <span className="text-xs font-bold text-slate-400 pl-2">Quick Filter:</span>
          {['', 'LOGIN', 'REGISTER', 'JOB', 'COMPANY', 'APPLICATION', 'INTERVIEW'].map(tag => (
            <button
              key={tag}
              onClick={() => setActionFilter(tag)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                actionFilter === tag
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tag === '' ? 'All Actions' : tag}
            </button>
          ))}
        </div>

        {/* Logs Table */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                  <th className="py-3.5 px-4">Timestamp</th>
                  <th className="py-3.5 px-4">Actor</th>
                  <th className="py-3.5 px-4">Action</th>
                  <th className="py-3.5 px-4">Target Type</th>
                  <th className="py-3.5 px-4">Details</th>
                  <th className="py-3.5 px-4">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {logs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}{' '}
                      {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="py-3 px-4 font-sans font-semibold text-slate-900">
                      <div>{log.actor_name}</div>
                      <span className="text-[10px] text-slate-400 uppercase font-mono">{log.actor_role}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.action.includes('MODERATED') || log.action.includes('DELETED') || log.action.includes('DEACTIVATED')
                          ? 'bg-rose-100 text-rose-800'
                          : log.action.includes('VERIFIED') || log.action.includes('REGISTERED')
                          ? 'bg-teal-100 text-teal-800'
                          : 'bg-brand-50 text-brand-800'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-sans">
                      {log.target_type} #{log.target_id || '-'}
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-700 max-w-sm truncate" title={log.details}>
                      {log.details}
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {log.ip_address || '127.0.0.1'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminAuditLogs;
