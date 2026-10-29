import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import SkillBadge from '../components/SkillBadge';
import {
  Building2, MapPin, DollarSign, Clock, Bookmark, Sparkles, CheckCircle2,
  Calendar, ShieldCheck, ArrowLeft, Send, AlertCircle, FileText, Check, Upload
} from 'lucide-react';

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, role } = useAuth();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Apply modal states
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [applyLoading, setApplyLoading] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);
  const [applyError, setApplyError] = useState('');

  // Save state
  const [isSaved, setIsSaved] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  const fetchJob = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/jobs/${id}`);
      setJob(res.data.job);
      setIsSaved(res.data.job.is_saved);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load job details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJob();
  }, [id]);

  // Load candidate resumes when opening modal
  const openApplyModal = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (role !== 'job_seeker') return;

    try {
      const res = await api.get('/candidate/resumes');
      const candResumes = res.data.resumes || [];
      setResumes(candResumes);
      if (candResumes.length > 0) {
        setSelectedResumeId(candResumes[0].id);
      }
      setApplyModalOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    setApplyLoading(true);
    setApplyError('');

    try {
      await api.post('/candidate/applications', {
        job_id: job.id,
        resume_id: selectedResumeId,
        cover_letter: coverLetter
      });
      setApplySuccess(true);
      fetchJob();
      setTimeout(() => {
        setApplyModalOpen(false);
        setApplySuccess(false);
      }, 2000);
    } catch (err) {
      setApplyError(err.response?.data?.error || 'Application failed to submit.');
    } finally {
      setApplyLoading(false);
    }
  };

  const handleSaveToggle = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (role !== 'job_seeker') return;

    setSaveLoading(true);
    try {
      if (isSaved) {
        await api.delete(`/candidate/saved-jobs/${job.id}`);
        setIsSaved(false);
      } else {
        await api.post(`/candidate/saved-jobs/${job.id}`);
        setIsSaved(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaveLoading(false);
    }
  };

  const formatSalary = (min, max, currency = 'USD') => {
    if (!min && !max) return 'Competitive Salary';
    const symbol = currency === 'USD' ? '$' : currency;
    if (min && max) {
      return `${symbol}${(min / 1000).toFixed(0)}k - ${symbol}${(max / 1000).toFixed(0)}k/yr`;
    }
    if (min) return `From ${symbol}${(min / 1000).toFixed(0)}k/yr`;
    return `Up to ${symbol}${(max / 1000).toFixed(0)}k/yr`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 flex justify-center">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-slate-50 py-16 text-center">
        <div className="max-w-md mx-auto bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-lg font-bold text-slate-900">Job Not Found</h2>
          <p className="text-xs text-slate-500">{error || 'This job posting does not exist or was removed.'}</p>
          <Link to="/jobs" className="inline-block px-4 py-2 rounded-xl text-xs font-semibold text-white gradient-primary">
            Back to Jobs
          </Link>
        </div>
      </div>
    );
  }

  const match = job.match_analysis;

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Back Link */}
        <Link
          to="/jobs"
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back to all vacancies
        </Link>

        {/* Main Job Card Header */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
            <div className="flex items-start space-x-4">
              {job.company_logo ? (
                <img
                  src={job.company_logo}
                  alt={job.company_name}
                  className="w-16 h-16 rounded-2xl object-cover border border-slate-200"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl gradient-primary text-white flex items-center justify-center font-bold text-2xl shadow-sm">
                  {job.company_name?.[0] || 'C'}
                </div>
              )}
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="text-sm font-semibold text-slate-600">{job.company_name}</span>
                  {job.company_verified && (
                    <CheckCircle2 className="w-4 h-4 text-brand-600 fill-brand-100" title="Verified Company" />
                  )}
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                  {job.title}
                </h1>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span className="flex items-center">
                    <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    {job.location} {job.is_remote && '(Remote Eligible)'}
                  </span>
                  <span>•</span>
                  <span>Posted {new Date(job.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  <span>•</span>
                  <span>{job.views_count} views</span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center space-x-3 flex-shrink-0">
              {role === 'job_seeker' && (
                <button
                  type="button"
                  onClick={handleSaveToggle}
                  disabled={saveLoading}
                  className={`p-3 rounded-xl border transition-all ${
                    isSaved
                      ? 'bg-amber-50 text-amber-600 border-amber-200'
                      : 'bg-slate-50 text-slate-400 border-slate-200 hover:text-slate-700'
                  }`}
                  title={isSaved ? 'Remove from saved' : 'Save job'}
                >
                  <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-amber-500' : ''}`} />
                </button>
              )}

              {job.is_applied ? (
                <div className="px-5 py-3 rounded-xl font-bold text-xs bg-teal-50 text-teal-800 border border-teal-200 flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  <span>Application Status: {job.application_status}</span>
                </div>
              ) : role === 'job_seeker' ? (
                <button
                  type="button"
                  onClick={openApplyModal}
                  className="px-6 py-3 rounded-xl font-bold text-sm text-white gradient-primary hover:opacity-95 shadow-md shadow-brand-500/25 flex items-center space-x-2 transition-all active:scale-[0.98]"
                >
                  <Send className="w-4 h-4" />
                  <span>Apply Now</span>
                </button>
              ) : !isAuthenticated ? (
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="px-6 py-3 rounded-xl font-bold text-sm text-white gradient-primary hover:opacity-95 shadow-md shadow-brand-500/25 flex items-center space-x-2 transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span>Sign In to Apply</span>
                </button>
              ) : null}
            </div>
          </div>

          {/* Key Job Specifications */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/70">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Compensation</span>
              <span className="text-sm font-bold text-slate-900 mt-0.5 block">
                {formatSalary(job.salary_min, job.salary_max, job.salary_currency)}
              </span>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/70">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Employment Type</span>
              <span className="text-sm font-bold text-slate-900 mt-0.5 block">{job.employment_type}</span>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/70">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Experience Level</span>
              <span className="text-sm font-bold text-slate-900 mt-0.5 block">{job.experience_level}</span>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/70">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Department</span>
              <span className="text-sm font-bold text-slate-900 mt-0.5 block">{job.category}</span>
            </div>
          </div>
        </div>

        {/* AI MATCH BREAKDOWN PANEL (Candidate Exclusive) */}
        {role === 'job_seeker' && match && (
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 sm:p-7 text-white shadow-lg border border-slate-700/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-700/80">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-500/20 flex items-center justify-center text-teal-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white">JobConnect AI Skill-Match Analysis</h3>
                  <p className="text-xs text-slate-300">Transparent comparison between your profile and job requirements</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <span className="text-xs text-slate-300">Overall Match:</span>
                <span className={`px-3 py-1.5 rounded-xl font-black text-sm border shadow-sm ${
                  match.match_percentage >= 80
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-500/50'
                    : match.match_percentage >= 60
                    ? 'bg-teal-950 text-teal-300 border-teal-500/50'
                    : 'bg-amber-950 text-amber-300 border-amber-500/50'
                }`}>
                  {match.match_percentage}%
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-5">
              {/* Matching Skills */}
              <div>
                <div className="text-xs font-bold text-teal-400 uppercase tracking-wider mb-2 flex items-center">
                  <CheckCircle2 className="w-4 h-4 mr-1.5 text-teal-400" />
                  Matching Skills ({match.matching_skills.length})
                </div>
                {match.matching_skills.length === 0 ? (
                  <p className="text-xs text-slate-400">No exact skills matched yet. Update your profile skills to reflect your experience.</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {match.matching_skills.map(s => (
                      <span key={s} className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-teal-950 text-teal-200 border border-teal-700/80 flex items-center">
                        <Check className="w-3 h-3 mr-1 text-teal-400" />
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Missing Skills */}
              <div>
                <div className="text-xs font-bold text-rose-400 uppercase tracking-wider mb-2 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1.5 text-rose-400" />
                  Missing or Desired Skills ({match.missing_skills.length})
                </div>
                {match.missing_skills.length === 0 ? (
                  <p className="text-xs text-emerald-300 font-medium">You possess 100% of the listed technical requirements!</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {match.missing_skills.map(s => (
                      <span key={s} className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-950/70 text-rose-200 border border-rose-800/80">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <p className="mt-4 text-[11px] text-slate-400 border-t border-slate-800 pt-3 italic">
              Note: {match.explanation} Automatic rejection is strictly prohibited; all human recruiters review qualified candidates regardless of score.
            </p>
          </div>
        )}

        {/* Detailed Layout: Description and Company Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Description */}
          <div className="lg:col-span-2 space-y-6">
            
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900 mb-3">About the Position</h2>
                <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {job.description}
                </div>
              </div>

              {job.responsibilities && (
                <div className="pt-4 border-t border-slate-100">
                  <h2 className="text-lg font-bold text-slate-900 mb-3">Core Responsibilities</h2>
                  <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                    {job.responsibilities}
                  </div>
                </div>
              )}

              {job.requirements && (
                <div className="pt-4 border-t border-slate-100">
                  <h2 className="text-lg font-bold text-slate-900 mb-3">Qualifications & Requirements</h2>
                  <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                    {job.requirements}
                  </div>
                </div>
              )}

              {/* Skills Tags */}
              <div className="pt-4 border-t border-slate-100">
                <h2 className="text-base font-bold text-slate-900 mb-3">Required Technical Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {job.skills_required?.map((s, idx) => (
                    <SkillBadge key={idx} name={s} size="sm" />
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* Company Card Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-4">
              <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
                {job.company_logo ? (
                  <img src={job.company_logo} alt={job.company_name} className="w-12 h-12 rounded-xl object-cover border border-slate-200" />
                ) : (
                  <div className="w-12 h-12 rounded-xl gradient-primary text-white flex items-center justify-center font-bold text-lg">
                    {job.company_name?.[0]}
                  </div>
                )}
                <div>
                  <div className="flex items-center space-x-1">
                    <h3 className="font-bold text-sm text-slate-900">{job.company_name}</h3>
                    {job.company_verified && <CheckCircle2 className="w-3.5 h-3.5 text-brand-600 fill-brand-100" />}
                  </div>
                  <span className="text-xs text-slate-500">{job.company_location || 'Global Headquarters'}</span>
                </div>
              </div>

              <div className="text-xs text-slate-600 leading-relaxed">
                {job.company_description || 'Innovative technology organization looking for visionary engineers to scale world-class software platforms.'}
              </div>

              <Link
                to={`/companies/${job.company_id}`}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 transition-colors block text-center"
              >
                View Full Company Profile & Vacancies
              </Link>
            </div>
          </div>

        </div>

      </div>

      {/* APPLY MODAL */}
      {applyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Apply for Position</h3>
                <p className="text-xs text-slate-500">{job.title} at {job.company_name}</p>
              </div>
              <button
                onClick={() => setApplyModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            {applySuccess ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mx-auto border border-teal-200">
                  <Check className="w-6 h-6 stroke-[3]" />
                </div>
                <h4 className="text-base font-bold text-slate-900">Application Submitted!</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  The hiring team has received your application and resume. You can track progress in your Candidate Dashboard.
                </p>
              </div>
            ) : (
              <form onSubmit={handleApplySubmit} className="space-y-4">
                {applyError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{applyError}</span>
                  </div>
                )}

                {/* Resume Selection */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-700">Select Resume</label>
                    <Link
                      to="/candidate/resumes"
                      className="text-[11px] font-semibold text-brand-600 hover:text-brand-800"
                    >
                      + Upload New Resume
                    </Link>
                  </div>

                  {resumes.length === 0 ? (
                    <div className="p-4 rounded-xl border border-dashed border-slate-300 text-center space-y-2">
                      <p className="text-xs text-slate-500">You haven't uploaded a resume yet.</p>
                      <Link
                        to="/candidate/resumes"
                        className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold text-white gradient-primary"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Resume</span>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {resumes.map(r => (
                        <label
                          key={r.id}
                          className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                            selectedResumeId === r.id
                              ? 'border-brand-500 bg-brand-50/60 ring-1 ring-brand-500'
                              : 'border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center space-x-2.5">
                            <FileText className="w-4 h-4 text-brand-600" />
                            <div>
                              <div className="text-xs font-semibold text-slate-900">{r.original_name}</div>
                              <div className="text-[10px] text-slate-400">
                                Uploaded {new Date(r.created_at).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <input
                            type="radio"
                            name="resumeSelection"
                            checked={selectedResumeId === r.id}
                            onChange={() => setSelectedResumeId(r.id)}
                            className="text-brand-600 focus:ring-brand-500"
                          />
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Cover letter */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Cover Note (Optional)
                  </label>
                  <textarea
                    rows={4}
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    placeholder="Briefly introduce yourself and why you're a great fit for this team..."
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
                  ></textarea>
                </div>

                <div className="pt-2 flex items-center justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setApplyModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={applyLoading}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-white gradient-primary hover:opacity-95 shadow-md flex items-center space-x-1.5 disabled:opacity-50"
                  >
                    {applyLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Submit Application</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
};

export default JobDetail;
