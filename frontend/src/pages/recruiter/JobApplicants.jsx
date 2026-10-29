import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/client';
import SkillBadge from '../../components/SkillBadge';
import {
  Users, Sparkles, CheckCircle2, Clock, Calendar, Video, FileText,
  AlertCircle, ArrowLeft, Filter, Check, X, Phone, Mail, ChevronDown
} from 'lucide-react';

const STATUS_OPTIONS = ['Applied', 'Under Review', 'Shortlisted', 'Interview Scheduled', 'Hired', 'Rejected'];

const JobApplicants = () => {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [minScore, setMinScore] = useState(0);

  // Status update feedback
  const [updateMsg, setUpdateMsg] = useState({ text: '', type: '' });

  // Interview scheduling modal state
  const [interviewModalOpen, setInterviewModalOpen] = useState(false);
  const [targetApplication, setTargetApplication] = useState(null);
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewTime, setInterviewTime] = useState('02:00 PM');
  const [meetingLink, setMeetingLink] = useState('https://meet.google.com/xyz-jobconnect');
  const [locationType, setLocationType] = useState('Remote');
  const [interviewNotes, setInterviewNotes] = useState('');
  const [scheduling, setScheduling] = useState(false);

  // Resume inspection modal state
  const [activeResumeApp, setActiveResumeApp] = useState(null);

  const fetchApplicants = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter && statusFilter !== 'All') params.append('status', statusFilter);
      if (minScore > 0) params.append('min_score', minScore.toString());

      const res = await api.get(`/recruiter/jobs/${id}/applicants?${params.toString()}`);
      setJob(res.data.job);
      setApplicants(res.data.applicants || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicants();
  }, [id, statusFilter, minScore]);

  const handleStatusChange = async (appId, newStatus) => {
    try {
      await api.put(`/recruiter/applications/${appId}/status`, { status: newStatus });
      setUpdateMsg({ text: `Application status updated to ${newStatus}`, type: 'success' });
      setApplicants(prev => prev.map(a => a.id === appId ? { ...a, status: newStatus } : a));
      setTimeout(() => setUpdateMsg({ text: '', type: '' }), 3000);
    } catch (err) {
      setUpdateMsg({ text: err.response?.data?.error || 'Failed to update status', type: 'error' });
    }
  };

  const openInterviewModal = (app) => {
    setTargetApplication(app);
    // Default date: tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setInterviewDate(tomorrow.toISOString().split('T')[0]);
    setInterviewModalOpen(true);
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    if (!targetApplication) return;

    setScheduling(true);
    try {
      await api.post('/recruiter/interviews', {
        application_id: targetApplication.id,
        scheduled_date: interviewDate,
        scheduled_time: interviewTime,
        meeting_link: meetingLink,
        location_type: locationType,
        notes: interviewNotes
      });
      setUpdateMsg({ text: `Interview scheduled with ${targetApplication.candidate?.full_name}!`, type: 'success' });
      setInterviewModalOpen(false);
      await fetchApplicants();
    } catch (err) {
      setUpdateMsg({ text: err.response?.data?.error || 'Failed to schedule interview', type: 'error' });
    } finally {
      setScheduling(false);
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
        
        <Link to="/recruiter/jobs" className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-900">
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back to Manage Jobs
        </Link>

        {/* Top Header Card */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-brand-50 text-brand-700">
                Applicant Tracking System (ATS)
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500">{job?.category}</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 mt-1">{job?.title}</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Review candidate qualifications, AI match breakdowns, and schedule technical rounds.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <div className="text-right">
              <div className="text-2xl font-black text-slate-900">{applicants.length}</div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Candidates</div>
            </div>
          </div>
        </div>

        {updateMsg.text && (
          <div className={`p-4 rounded-xl text-xs font-semibold flex items-center space-x-2 ${
            updateMsg.type === 'success' ? 'bg-teal-50 text-teal-800 border border-teal-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}>
            {updateMsg.type === 'success' ? <Check className="w-4 h-4 text-teal-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
            <span>{updateMsg.text}</span>
          </div>
        )}

        {/* Filter Controls Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Status Tabs */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 md:pb-0">
            <span className="text-xs font-bold text-slate-400 mr-1 flex items-center">
              <Filter className="w-3.5 h-3.5 mr-1" /> Status:
            </span>
            {['All', ...STATUS_OPTIONS].map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  statusFilter === s
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* AI Score Filter */}
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-teal-700 flex items-center">
              <Sparkles className="w-3.5 h-3.5 mr-1 text-teal-600" />
              Min AI Match:
            </span>
            <select
              value={minScore}
              onChange={(e) => setMinScore(parseFloat(e.target.value))}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-700 bg-slate-50 focus:bg-white focus:border-brand-500 outline-none"
            >
              <option value="0">All Scores (0%+)</option>
              <option value="60">Good Match (60%+)</option>
              <option value="80">Strong Match (80%+)</option>
              <option value="90">Top Match (90%+)</option>
            </select>
          </div>

        </div>

        {/* Applicants List */}
        {applicants.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
            <Users className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-900">No applicants match this criteria</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your status filter or lowering the minimum AI score requirement.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {applicants.map(app => {
              const details = app.match_details || {};
              const matching = details.matching_skills || [];
              const missing = details.missing_skills || [];

              return (
                <div
                  key={app.id}
                  className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs hover:border-brand-300 transition-all space-y-4"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    
                    {/* Candidate Info */}
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 rounded-2xl gradient-primary text-white flex items-center justify-center font-bold text-base shadow-sm flex-shrink-0">
                        {app.candidate?.full_name?.[0] || 'U'}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-base font-bold text-slate-900">{app.candidate?.full_name}</h3>
                          <span className="text-xs text-slate-400">•</span>
                          <span className="text-xs font-semibold text-slate-600">
                            {app.candidate?.years_experience || 0} Years Exp
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 font-medium">{app.candidate?.headline}</p>
                        
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-1">
                          <span className="flex items-center">
                            <Mail className="w-3.5 h-3.5 mr-1" />
                            {app.candidate?.email}
                          </span>
                          {app.candidate?.phone && (
                            <span className="flex items-center">
                              <Phone className="w-3.5 h-3.5 mr-1" />
                              {app.candidate?.phone}
                            </span>
                          )}
                          <span>Applied {new Date(app.applied_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                        </div>
                      </div>
                    </div>

                    {/* AI Score Badge & Interview Button */}
                    <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
                      <div className="px-3 py-1.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 flex items-center space-x-1.5 shadow-2xs">
                        <Sparkles className="w-4 h-4 text-teal-600" />
                        <span className="font-extrabold text-sm">{app.match_score}% AI Match</span>
                      </div>

                      {/* Status Dropdown */}
                      <select
                        value={app.status}
                        onChange={(e) => handleStatusChange(app.id, e.target.value)}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-slate-50 focus:bg-white focus:border-brand-500 outline-none"
                      >
                        {STATUS_OPTIONS.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>

                      {/* Schedule Button */}
                      <button
                        type="button"
                        onClick={() => openInterviewModal(app)}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-xs flex items-center space-x-1 transition-colors"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Schedule Call</span>
                      </button>
                    </div>

                  </div>

                  {/* Skills Breakdown Preview */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div>
                      <div className="text-[11px] font-bold text-teal-700 uppercase tracking-wider mb-1 flex items-center">
                        <Check className="w-3.5 h-3.5 mr-1 text-teal-600" />
                        Matching Skills ({matching.length})
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {matching.slice(0, 6).map(s => (
                          <span key={s} className="px-2 py-0.5 rounded text-[10px] font-semibold bg-teal-100/70 text-teal-800">
                            {s}
                          </span>
                        ))}
                        {matching.length > 6 && (
                          <span className="text-[10px] text-slate-400 self-center">+{matching.length - 6} more</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="text-[11px] font-bold text-rose-700 uppercase tracking-wider mb-1 flex items-center">
                        <X className="w-3.5 h-3.5 mr-1 text-rose-500" />
                        Missing Requirements ({missing.length})
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {missing.length === 0 ? (
                          <span className="text-[11px] text-teal-600 font-medium">None! Meets all job skills.</span>
                        ) : (
                          missing.slice(0, 4).map(s => (
                            <span key={s} className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-100/70 text-rose-800">
                              {s}
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Cover Note & Resume links */}
                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-2">
                    {app.cover_letter ? (
                      <p className="text-slate-600 italic line-clamp-1 max-w-xl">
                        "{app.cover_letter}"
                      </p>
                    ) : (
                      <span className="text-slate-400 text-[11px]">No cover note attached</span>
                    )}

                    {app.resume && (
                      <button
                        type="button"
                        onClick={() => setActiveResumeApp(app)}
                        className="text-brand-600 font-bold hover:underline flex items-center space-x-1"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Inspect Resume ({app.resume.original_name})</span>
                      </button>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* SCHEDULE INTERVIEW MODAL */}
      {interviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Schedule Candidate Interview</h3>
                <p className="text-xs text-slate-500">{targetApplication?.candidate?.full_name}</p>
              </div>
              <button onClick={() => setInterviewModalOpen(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={interviewDate}
                    onChange={(e) => setInterviewDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Time</label>
                  <input
                    type="text"
                    required
                    value={interviewTime}
                    onChange={(e) => setInterviewTime(e.target.value)}
                    placeholder="02:30 PM"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Meeting Type</label>
                <select
                  value={locationType}
                  onChange={(e) => setLocationType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 outline-none"
                >
                  <option value="Remote">Remote (Video Call)</option>
                  <option value="In-Person">In-Person Office</option>
                  <option value="Phone">Phone Screen</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Meeting Link / Room</label>
                <input
                  type="text"
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  placeholder="https://meet.google.com/..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Interview Agenda / Notes</label>
                <textarea
                  rows={3}
                  value={interviewNotes}
                  onChange={(e) => setInterviewNotes(e.target.value)}
                  placeholder="Technical deep dive on React architecture and system design..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-brand-500"
                ></textarea>
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setInterviewModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={scheduling}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-md disabled:opacity-50"
                >
                  {scheduling ? 'Scheduling...' : 'Confirm & Notify Candidate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESUME INSPECTION MODAL */}
      {activeResumeApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {activeResumeApp.candidate?.full_name}'s Resume
                </h3>
                <p className="text-xs text-slate-500">{activeResumeApp.resume?.original_name}</p>
              </div>
              <button onClick={() => setActiveResumeApp(null)} className="text-slate-400 hover:text-slate-700 font-bold">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-800 font-mono whitespace-pre-line leading-relaxed">
              {activeResumeApp.resume?.has_text ? (
                activeResumeApp.resume?.original_name
              ) : null}
              {activeResumeApp.cover_letter && (
                <div className="mb-4 pb-3 border-b border-slate-200 font-sans text-xs">
                  <span className="font-bold text-slate-900 block mb-1">Cover Note:</span>
                  <p className="text-slate-700 italic">{activeResumeApp.cover_letter}</p>
                </div>
              )}
              <div className="font-sans text-xs space-y-3">
                <div>
                  <span className="font-bold text-slate-900 block mb-1">Extracted Technical Skills:</span>
                  <div className="flex flex-wrap gap-1">
                    {activeResumeApp.resume?.extracted_skills?.map((s, idx) => (
                      <SkillBadge key={idx} name={s} type="matching" size="xs" />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setActiveResumeApp(null)}
                className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default JobApplicants;
