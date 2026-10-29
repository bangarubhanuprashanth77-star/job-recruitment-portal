import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import JobCard from '../../components/JobCard';
import {
  Briefcase, CheckCircle2, Clock, Calendar, Bookmark, FileText,
  Sparkles, ArrowRight, Video, ChevronRight, AlertCircle, Award
} from 'lucide-react';

const CandidateDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [dashRes, recRes] = await Promise.all([
          api.get('/candidate/dashboard'),
          api.get('/jobs/recommendations')
        ]);
        setData(dashRes.data);
        setRecommendedJobs(recRes.data.recommended_jobs || []);
      } catch (err) {
        console.error("Failed to load candidate dashboard", err);
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
  const recentApps = data?.recent_applications || [];
  const upcomingInterviews = data?.upcoming_interviews || [];

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-brand-600 via-brand-700 to-teal-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 backdrop-blur-md border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-teal-300" />
              <span>Candidate Command Center</span>
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user.first_name}!
            </h1>
            <p className="text-xs sm:text-sm text-brand-100">
              Track your recruitment pipeline, review AI resume diagnostics, and discover roles matching your technical skill set.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/candidate/resumes"
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white text-slate-900 hover:bg-slate-100 shadow-md transition-all flex items-center space-x-1.5"
            >
              <FileText className="w-4 h-4 text-brand-600" />
              <span>Resume Studio</span>
            </Link>
            <Link
              to="/jobs"
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-teal-500 hover:bg-teal-400 text-slate-950 shadow-md transition-all flex items-center space-x-1.5"
            >
              <Briefcase className="w-4 h-4" />
              <span>Browse Jobs</span>
            </Link>
          </div>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Applied</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{stats.total_applications || 0}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Submitted roles</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Under Review</div>
            <div className="text-2xl font-black text-brand-600 mt-1">{stats.under_review || 0}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Hiring team review</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Shortlisted</div>
            <div className="text-2xl font-black text-teal-600 mt-1">{stats.shortlisted || 0}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Passed initial screen</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Interviews</div>
            <div className="text-2xl font-black text-purple-600 mt-1">{stats.interviews_scheduled || 0}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Live meetings</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Hired</div>
            <div className="text-2xl font-black text-emerald-600 mt-1">{stats.hired || 0}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Offers extended</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Saved Jobs</div>
            <div className="text-2xl font-black text-amber-600 mt-1">{stats.saved_jobs || 0}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Bookmarks</div>
          </div>
        </div>

        {/* Two Columns: Upcoming Interviews & Applications */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Recent Applications */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Briefcase className="w-5 h-5 text-brand-600" />
                <span>Recent Applications</span>
              </h2>
              <Link to="/candidate/applications" className="text-xs font-semibold text-brand-600 hover:text-brand-800 flex items-center">
                <span>View All ({stats.total_applications || 0})</span>
                <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
              </Link>
            </div>

            {recentApps.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-500">
                You haven't applied to any positions yet. Explore jobs to submit your first application.
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden divide-y divide-slate-100">
                {recentApps.map(app => (
                  <div key={app.id} className="p-4 sm:p-5 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center space-x-3.5">
                      {app.job?.company_logo ? (
                        <img src={app.job.company_logo} alt={app.job.company_name} className="w-10 h-10 rounded-xl object-cover border border-slate-200" />
                      ) : (
                        <div className="w-10 h-10 rounded-xl gradient-primary text-white flex items-center justify-center font-bold text-sm">
                          {app.job?.company_name?.[0] || 'C'}
                        </div>
                      )}
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{app.job?.title}</h4>
                        <div className="text-xs text-slate-500 flex items-center space-x-2 mt-0.5">
                          <span>{app.job?.company_name}</span>
                          <span>•</span>
                          <span>Applied {new Date(app.applied_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 self-end sm:self-auto">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        app.status === 'Hired' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        app.status === 'Interview Scheduled' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                        app.status === 'Shortlisted' ? 'bg-teal-50 text-teal-700 border border-teal-200' :
                        app.status === 'Under Review' ? 'bg-brand-50 text-brand-700 border border-brand-200' :
                        app.status === 'Rejected' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {app.status}
                      </span>

                      <Link
                        to={`/jobs/${app.job_id}`}
                        className="text-xs font-semibold text-slate-500 hover:text-brand-600"
                      >
                        Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Upcoming Interviews */}
          <div className="lg:col-span-4 space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              <span>Upcoming Interviews</span>
            </h2>

            {upcomingInterviews.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center text-xs text-slate-500 space-y-2">
                <Calendar className="w-8 h-8 text-slate-300 mx-auto" />
                <p>No interviews currently scheduled.</p>
                <p className="text-[11px] text-slate-400">When recruiters schedule rounds, they will appear here with Google Meet links.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingInterviews.map(i => (
                  <div key={i.id} className="bg-white rounded-2xl border border-purple-200/80 p-5 shadow-xs space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                          {i.location_type} Interview
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 mt-1">{i.job_title}</h4>
                        <span className="text-xs text-slate-500">{i.company_name}</span>
                      </div>
                    </div>

                    <div className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1">
                      <div className="font-semibold flex items-center text-slate-900">
                        <Clock className="w-3.5 h-3.5 mr-1.5 text-purple-600" />
                        <span>{new Date(i.scheduled_date).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })} at {i.scheduled_time}</span>
                      </div>
                      {i.notes && <div className="text-[11px] text-slate-500 italic mt-1">"{i.notes}"</div>}
                    </div>

                    {i.meeting_link && (
                      <a
                        href={i.meeting_link}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold text-center block transition-colors"
                      >
                        Join Meeting Link
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Personalized AI Job Recommendations Section */}
        <div className="space-y-4 pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-teal-600" />
                <span>Recommended Jobs for You (AI Match)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Calculated from your technical skills, experience profile, and active vacancies.
              </p>
            </div>
            <Link to="/jobs" className="text-xs font-semibold text-brand-600 hover:text-brand-800 flex items-center">
              <span>View All</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendedJobs.slice(0, 3).map(job => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default CandidateDashboard;
