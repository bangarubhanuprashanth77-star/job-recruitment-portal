import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import {
  Briefcase, PlusCircle, Users, Eye, Edit, Trash2,
  CheckCircle2, AlertCircle, ChevronRight, Clock, MapPin
} from 'lucide-react';

const ManageJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/recruiter/jobs');
      setJobs(res.data.jobs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleDelete = async (jobId, title) => {
    if (!window.confirm(`Are you sure you want to permanently delete the job vacancy "${title}"?`)) return;

    try {
      await api.delete(`/recruiter/jobs/${jobId}`);
      setMessage({ text: `Job "${title}" deleted successfully`, type: 'success' });
      await fetchJobs();
    } catch (err) {
      setMessage({ text: err.response?.data?.error || 'Failed to delete job', type: 'error' });
    }
  };

  const handleToggleStatus = async (job) => {
    const newStatus = job.status === 'active' ? 'closed' : 'active';
    try {
      await api.put(`/recruiter/jobs/${job.id}`, { status: newStatus });
      setMessage({ text: `Job status updated to ${newStatus}`, type: 'success' });
      await fetchJobs();
    } catch (err) {
      setMessage({ text: err.response?.data?.error || 'Failed to update status', type: 'error' });
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
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Manage Job Postings</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Review active listings, track candidate volume, and update vacancies.
            </p>
          </div>

          <Link
            to="/recruiter/jobs/new"
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-white gradient-primary hover:opacity-95 shadow-md shadow-brand-500/20 flex items-center space-x-1.5 self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post New Vacancy</span>
          </Link>
        </div>

        {message.text && (
          <div className={`p-4 rounded-xl text-xs font-semibold flex items-center space-x-2 ${
            message.type === 'success' ? 'bg-teal-50 text-teal-800 border border-teal-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}>
            {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-teal-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
            <span>{message.text}</span>
          </div>
        )}

        {/* Jobs List */}
        {jobs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
            <Briefcase className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-900">No job postings created yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Publish your first vacancy to start receiving AI-matched applications from top candidates.
            </p>
            <Link
              to="/recruiter/jobs/new"
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white gradient-primary"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create First Job</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map(job => (
              <div
                key={job.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs hover:border-brand-300 transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-base font-bold text-slate-900">{job.title}</h3>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        job.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        job.status === 'closed' ? 'bg-slate-100 text-slate-600' :
                        'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {job.status}
                      </span>
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span>{job.category}</span>
                      <span>•</span>
                      <span className="flex items-center">
                        <MapPin className="w-3 h-3 mr-1 text-slate-400" />
                        {job.location} {job.is_remote && '(Remote)'}
                      </span>
                      <span>•</span>
                      <span>{job.employment_type}</span>
                      <span>•</span>
                      <span>Posted {new Date(job.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  </div>

                  {/* Quick Applicant count badge */}
                  <Link
                    to={`/recruiter/jobs/${job.id}/applicants`}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold text-xs border border-brand-200 transition-colors self-start sm:self-auto"
                  >
                    <Users className="w-4 h-4" />
                    <span>{job.applications_count} Candidates</span>
                    <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                  </Link>
                </div>

                {/* Footer Controls */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center space-x-3 text-slate-500">
                    <span className="flex items-center">
                      <Eye className="w-3.5 h-3.5 mr-1 text-slate-400" />
                      {job.views_count} Views
                    </span>
                    <span>•</span>
                    <span className="font-semibold text-slate-700">
                      ${((job.salary_min || 0) / 1000).toFixed(0)}k - ${((job.salary_max || 0) / 1000).toFixed(0)}k/yr
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(job)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
                    >
                      {job.status === 'active' ? 'Mark as Closed' : 'Reactivate Job'}
                    </button>

                    <Link
                      to={`/recruiter/jobs/${job.id}/edit`}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-brand-600 hover:bg-slate-50"
                      title="Edit job posting"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleDelete(job.id, job.title)}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                      title="Delete job posting"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default ManageJobs;
