import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import {
  Briefcase, Users, UserCheck, Calendar, TrendingUp, PlusCircle,
  Building, ChevronRight, Sparkles, CheckCircle2, ArrowRight
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell
} from 'recharts';

const PIPELINE_COLORS = {
  'Applied': '#0ea5e9',
  'Under Review': '#6366f1',
  'Shortlisted': '#0d9488',
  'Interview Scheduled': '#a855f7',
  'Hired': '#10b981',
  'Rejected': '#f43f5e'
};

const RecruiterDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/recruiter/dashboard');
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 flex justify-center">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const stats = data?.stats || {};
  const pipeline = data?.pipeline || [];
  const recentApplicants = data?.recent_applicants || [];
  const jobPerformance = data?.job_performance || [];
  const company = data?.company || {};

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header Banner */}
        <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-brand-500/20 text-brand-300 border border-brand-500/30">
                Recruiter Command Hub
              </span>
              {company.is_verified && (
                <span className="flex items-center text-[10px] font-bold text-teal-300">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Verified Employer
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {company.name || 'Your Company'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Manage open vacancies, evaluate candidate AI skill-match scores, and schedule technical interview rounds.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/recruiter/company"
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-all flex items-center space-x-1.5"
            >
              <Building className="w-4 h-4 text-slate-400" />
              <span>Edit Company</span>
            </Link>

            <Link
              to="/recruiter/jobs/new"
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-white gradient-primary hover:opacity-95 shadow-md shadow-brand-500/25 transition-all flex items-center space-x-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post New Vacancy</span>
            </Link>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Active Vacancies</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{stats.active_jobs || 0}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Live on portal</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Applicants</div>
            <div className="text-2xl font-black text-brand-600 mt-1">{stats.total_applicants || 0}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Across all roles</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Shortlisted</div>
            <div className="text-2xl font-black text-teal-600 mt-1">{stats.shortlisted || 0}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">High potential</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Interviews</div>
            <div className="text-2xl font-black text-purple-600 mt-1">{stats.interviews_scheduled || 0}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Scheduled calls</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Hires Made</div>
            <div className="text-2xl font-black text-emerald-600 mt-1">{stats.hired || 0}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Accepted offers</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Postings</div>
            <div className="text-2xl font-black text-slate-700 mt-1">{stats.total_jobs || 0}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">All time</div>
          </div>
        </div>

        {/* Charts and Pipeline Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Recharts Pipeline Distribution */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Candidate Pipeline Funnel</h3>
                <p className="text-[11px] text-slate-400">Distribution of candidates across evaluation stages</p>
              </div>
              <span className="text-xs font-semibold text-slate-500">{stats.total_applicants || 0} Candidates</span>
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pipeline} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="status" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                    cursor={{ fill: '#f8fafc' }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {pipeline.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIPELINE_COLORS[entry.status] || '#0284c7'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Job Performance Overview */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Active Job Performance</h3>
                <p className="text-[11px] text-slate-400">Applicant volume and AI match averages</p>
              </div>
              <Link to="/recruiter/jobs" className="text-xs font-semibold text-brand-600 hover:text-brand-800">
                Manage
              </Link>
            </div>

            {jobPerformance.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-6 text-center">No active jobs yet.</p>
            ) : (
              <div className="space-y-3">
                {jobPerformance.slice(0, 4).map(job => (
                  <div key={job.id} className="p-3 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Link to={`/recruiter/jobs/${job.id}/applicants`} className="text-xs font-bold text-slate-900 hover:text-brand-600 truncate max-w-[200px]">
                        {job.title}
                      </Link>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200">
                        {job.avg_match_score}% Avg Match
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>{job.views} Views • {job.applicants} Applicants</span>
                      <Link
                        to={`/recruiter/jobs/${job.id}/applicants`}
                        className="text-brand-600 font-semibold hover:underline flex items-center"
                      >
                        <span>Review</span>
                        <ChevronRight className="w-3 h-3 ml-0.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Recent Applicants Section */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <Users className="w-4 h-4 text-brand-600" />
                <span>Recent Candidates Across Vacancies</span>
              </h2>
              <p className="text-[11px] text-slate-400">Review applicants ranked by transparent AI skill match percentage</p>
            </div>
            <Link to="/recruiter/jobs" className="text-xs font-semibold text-brand-600 hover:text-brand-800">
              View All Postings
            </Link>
          </div>

          {recentApplicants.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No applications received yet. Vacancies are active and searchable by candidates.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase text-[10px]">
                    <th className="pb-3">Candidate</th>
                    <th className="pb-3">Applied Role</th>
                    <th className="pb-3">Match Score</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentApplicants.map(app => (
                    <tr key={app.id} className="hover:bg-slate-50">
                      <td className="py-3.5 pr-3">
                        <div className="font-bold text-slate-900">{app.candidate?.full_name}</div>
                        <div className="text-[11px] text-slate-400">{app.candidate?.headline || app.candidate?.email}</div>
                      </td>
                      <td className="py-3.5 pr-3 font-medium text-slate-700">
                        {app.job?.title}
                      </td>
                      <td className="py-3.5 pr-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                          <Sparkles className="w-3 h-3 mr-1 text-teal-600" />
                          {app.match_score}%
                        </span>
                      </td>
                      <td className="py-3.5 pr-3">
                        <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                          app.status === 'Hired' ? 'bg-emerald-50 text-emerald-700' :
                          app.status === 'Interview Scheduled' ? 'bg-purple-50 text-purple-700' :
                          app.status === 'Shortlisted' ? 'bg-teal-50 text-teal-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        <Link
                          to={`/recruiter/jobs/${app.job_id}/applicants`}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 transition-colors inline-block"
                        >
                          Evaluate ATS
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default RecruiterDashboard;
