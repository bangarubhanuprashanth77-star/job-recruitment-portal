import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import {
  Briefcase, AlertTriangle, CheckCircle2, Trash2, ArrowLeft,
  Search, ShieldAlert, Check, X
} from 'lucide-react';

const AdminJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [message, setMessage] = useState({ text: '', type: '' });

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/jobs?status=${statusFilter}`);
      setJobs(res.data.jobs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [statusFilter]);

  const handleModerate = async (jobId, newStatus) => {
    try {
      await api.put(`/admin/jobs/${jobId}/moderate`, { status: newStatus });
      setMessage({ text: `Job listing set to ${newStatus}`, type: 'success' });
      await fetchJobs();
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } catch (err) {
      setMessage({ text: err.response?.data?.error || 'Failed to moderate job', type: 'error' });
    }
  };

  const handleDelete = async (jobId, title) => {
    if (!window.confirm(`Permanently remove job "${title}" from the platform?`)) return;

    try {
      await api.delete(`/admin/jobs/${jobId}`);
      setMessage({ text: `Job permanently removed`, type: 'success' });
      await fetchJobs();
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } catch (err) {
      setMessage({ text: err.response?.data?.error || 'Failed to delete job', type: 'error' });
    }
  };

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
              <Briefcase className="w-6 h-6 text-brand-600" />
              <span>Job Moderation & Content Safety ({jobs.length})</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Review job vacancy descriptions, flag suspicious or fraudulent listings, and ensure compliance.
            </p>
          </div>
        </div>

        {message.text && (
          <div className={`p-4 rounded-xl text-xs font-semibold flex items-center space-x-2 ${
            message.type === 'success' ? 'bg-teal-50 text-teal-800 border border-teal-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}>
            {message.type === 'success' ? <Check className="w-4 h-4 text-teal-600" /> : <AlertTriangle className="w-4 h-4 text-rose-600" />}
            <span>{message.text}</span>
          </div>
        )}

        {/* Status Filters */}
        <div className="flex items-center space-x-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-2xs w-fit">
          {['all', 'active', 'flagged', 'closed'].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                statusFilter === s
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {s.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Jobs Table */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                  <th className="py-3.5 px-4">Job Title</th>
                  <th className="py-3.5 px-4">Company</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Applicants</th>
                  <th className="py-3.5 px-4 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {jobs.map(job => (
                  <tr key={job.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4">
                      <Link to={`/jobs/${job.id}`} className="font-bold text-slate-900 hover:text-brand-600">
                        {job.title}
                      </Link>
                      <div className="text-[11px] text-slate-400">{job.location} • {job.employment_type}</div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700">
                      {job.company_name}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {job.category}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        job.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        job.status === 'flagged' ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {job.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-bold">
                      {job.applications_count}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1.5">
                      {job.status !== 'active' && (
                        <button
                          type="button"
                          onClick={() => handleModerate(job.id, 'active')}
                          className="px-2.5 py-1 rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-[11px]"
                        >
                          Approve
                        </button>
                      )}

                      {job.status !== 'flagged' && (
                        <button
                          type="button"
                          onClick={() => handleModerate(job.id, 'flagged')}
                          className="px-2.5 py-1 rounded-lg border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-700 font-semibold text-[11px]"
                        >
                          Flag Listing
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleDelete(job.id, job.title)}
                        className="px-2.5 py-1 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-[11px]"
                      >
                        Delete
                      </button>
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

export default AdminJobs;
