import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import {
  Briefcase, CheckCircle2, Clock, Calendar, Video, FileText,
  AlertCircle, ChevronRight, Sparkles, Building
} from 'lucide-react';

const STATUS_STEPS = ['Applied', 'Under Review', 'Shortlisted', 'Interview Scheduled', 'Hired'];

const CandidateApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await api.get('/candidate/applications');
        setApplications(res.data.applications || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

  const filteredApps = statusFilter === 'All'
    ? applications
    : applications.filter(a => a.status === statusFilter);

  const getStepStatus = (currentStatus, stepName) => {
    if (currentStatus === 'Rejected') {
      return stepName === 'Applied' ? 'completed' : 'rejected';
    }
    const currentIndex = STATUS_STEPS.indexOf(currentStatus);
    const stepIndex = STATUS_STEPS.indexOf(stepName);

    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'upcoming';
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
            <h1 className="text-2xl font-extrabold text-slate-900">Application Status Tracker</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Live updates as recruiters review your profile, schedule interviews, and finalize hiring decisions.
            </p>
          </div>

          <Link
            to="/jobs"
            className="px-4 py-2 rounded-xl text-xs font-bold text-white gradient-primary hover:opacity-95 shadow-md flex items-center space-x-1.5 self-start sm:self-auto"
          >
            <Briefcase className="w-4 h-4" />
            <span>Find More Roles</span>
          </Link>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1">
          {['All', 'Applied', 'Under Review', 'Shortlisted', 'Interview Scheduled', 'Hired', 'Rejected'].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                statusFilter === s
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Applications List */}
        {filteredApps.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
            <Briefcase className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-900">No applications found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You haven't submitted any applications under this status yet. Browse vacancies to apply.
            </p>
            <Link to="/jobs" className="inline-block px-4 py-2 rounded-xl text-xs font-semibold text-brand-600 bg-brand-50 hover:bg-brand-100">
              Explore Open Jobs
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredApps.map(app => (
              <div
                key={app.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-5"
              >
                {/* Application Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="flex items-center space-x-3.5">
                    {app.job?.company_logo ? (
                      <img src={app.job.company_logo} alt={app.job.company_name} className="w-12 h-12 rounded-xl object-cover border border-slate-200" />
                    ) : (
                      <div className="w-12 h-12 rounded-xl gradient-primary text-white flex items-center justify-center font-bold text-base">
                        {app.job?.company_name?.[0] || 'C'}
                      </div>
                    )}
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{app.job?.title}</h3>
                      <div className="text-xs text-slate-500 flex items-center space-x-2 mt-0.5">
                        <span className="font-semibold text-slate-700">{app.job?.company_name}</span>
                        <span>•</span>
                        <span>{app.job?.location}</span>
                        <span>•</span>
                        <span>Applied on {new Date(app.applied_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 self-end sm:self-auto">
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-teal-50 text-teal-800 border border-teal-200 flex items-center space-x-1">
                      <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                      <span>{app.match_score}% AI Match</span>
                    </span>

                    <Link
                      to={`/jobs/${app.job_id}`}
                      className="text-xs font-semibold text-brand-600 hover:text-brand-800 flex items-center"
                    >
                      <span>Job Post</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                {/* Status Stepper Timeline */}
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">
                    Application Lifecycle Progress
                  </div>

                  {app.status === 'Rejected' ? (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                      <div>
                        <span className="font-bold">Application Status: Not Selected.</span> We appreciate your interest and encourage you to explore other matching positions.
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {STATUS_STEPS.map((step, idx) => {
                        const statusType = getStepStatus(app.status, step);
                        return (
                          <div
                            key={step}
                            className={`p-2.5 rounded-xl border text-center transition-all ${
                              statusType === 'completed'
                                ? 'bg-teal-50 border-teal-200 text-teal-800 font-bold'
                                : statusType === 'current'
                                ? 'bg-brand-50 border-brand-400 text-brand-800 font-extrabold ring-1 ring-brand-400'
                                : 'bg-slate-50 border-slate-200 text-slate-400'
                            }`}
                          >
                            <div className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Step {idx + 1}</div>
                            <div className="text-xs leading-tight flex items-center justify-center space-x-1">
                              {statusType === 'completed' && <CheckCircle2 className="w-3 h-3 text-teal-600" />}
                              <span>{step}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Recruiter Notes or Interview Details */}
                {app.recruiter_notes && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                    <span className="font-bold text-slate-800">Recruiter Feedback / Notes:</span>
                    <p className="text-slate-600 italic">"{app.recruiter_notes}"</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default CandidateApplications;
