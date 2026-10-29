import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import SkillBadge from './SkillBadge';
import {
  Building2, MapPin, DollarSign, Clock, Bookmark, Sparkles, CheckCircle2, ChevronRight
} from 'lucide-react';

const JobCard = ({ job, onSaveToggle }) => {
  const { isAuthenticated, role } = useAuth();
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(job.is_saved || false);
  const [saveLoading, setSaveLoading] = useState(false);

  const handleBookmark = async (e) => {
    e.preventDefault();
    e.stopPropagation();

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
      if (onSaveToggle) onSaveToggle(job.id, !isSaved);
    } catch (err) {
      console.error("Failed to toggle save job", err);
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

  const matchScore = job.match_score;
  const getMatchScoreBadge = (score) => {
    if (score == null) return null;
    let badgeClass = 'bg-slate-100 text-slate-700 border-slate-200';
    if (score >= 85) badgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    else if (score >= 65) badgeClass = 'bg-teal-50 text-teal-700 border-teal-200';
    else if (score >= 45) badgeClass = 'bg-amber-50 text-amber-700 border-amber-200';

    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${badgeClass} shadow-sm`}>
        <Sparkles className="w-3 h-3 mr-1 text-teal-600" />
        {score}% Match
      </span>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 hover:border-brand-300 p-5 shadow-sm hover:shadow-md transition-all duration-200 group relative flex flex-col justify-between">
      <div>
        {/* Top Header: Company info, match score & save */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center space-x-3">
            {job.company_logo ? (
              <img
                src={job.company_logo}
                alt={job.company_name}
                className="w-12 h-12 rounded-xl object-cover border border-slate-200"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl gradient-primary text-white flex items-center justify-center font-bold text-base shadow-sm">
                {job.company_name?.[0] || 'C'}
              </div>
            )}
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-xs font-semibold text-slate-600 truncate max-w-[150px] sm:max-w-xs">
                  {job.company_name}
                </span>
                {job.company_verified && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand-600 fill-brand-100" title="Verified Company" />
                )}
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-1">
                {job.title}
              </h3>
            </div>
          </div>

          <div className="flex items-center space-x-2 flex-shrink-0">
            {getMatchScoreBadge(matchScore)}

            {role === 'job_seeker' && (
              <button
                onClick={handleBookmark}
                disabled={saveLoading}
                className={`p-2 rounded-xl border transition-colors ${
                  isSaved
                    ? 'bg-amber-50 text-amber-600 border-amber-200'
                    : 'bg-slate-50 text-slate-400 border-slate-200 hover:text-slate-600 hover:bg-slate-100'
                }`}
                title={isSaved ? 'Remove from saved' : 'Save job'}
              >
                <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-500' : ''}`} />
              </button>
            )}
          </div>
        </div>

        {/* Badges: Location, Type, Salary */}
        <div className="mt-3.5 flex flex-wrap items-center gap-2 text-xs text-slate-600">
          <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-medium">
            <MapPin className="w-3 h-3 mr-1 text-slate-400" />
            {job.location}
          </span>
          {job.is_remote && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 font-semibold text-[11px] border border-teal-200/60">
              Remote
            </span>
          )}
          <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-medium">
            <Clock className="w-3 h-3 mr-1 text-slate-400" />
            {job.employment_type}
          </span>
          <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-medium">
            {job.experience_level}
          </span>
          <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-brand-50 text-brand-800 font-semibold border border-brand-200/50">
            <DollarSign className="w-3 h-3 mr-0.5 text-brand-600" />
            {formatSalary(job.salary_min, job.salary_max, job.salary_currency)}
          </span>
        </div>

        {/* Job Snippet */}
        <p className="mt-3 text-xs text-slate-500 line-clamp-2 leading-relaxed">
          {job.description}
        </p>

        {/* Skills Tag Pills */}
        <div className="mt-3.5 flex flex-wrap gap-1.5">
          {job.skills_required?.slice(0, 4).map((skill, idx) => {
            const isMatch = job.matching_skills?.includes(skill);
            return (
              <SkillBadge
                key={idx}
                name={skill}
                type={isMatch ? 'matching' : 'neutral'}
                size="xs"
              />
            );
          })}
          {job.skills_required?.length > 4 && (
            <span className="text-[10px] text-slate-400 self-center font-medium pl-1">
              +{job.skills_required.length - 4} more
            </span>
          )}
        </div>
      </div>

      {/* Footer info & View Link */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center space-x-2 text-[11px] text-slate-400">
          <span>{job.category}</span>
          <span>•</span>
          <span>{new Date(job.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
        </div>

        <div className="flex items-center space-x-2">
          {job.is_applied && (
            <span className="inline-flex items-center text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
              <CheckCircle2 className="w-3 h-3 mr-1 text-teal-600" />
              Applied
            </span>
          )}

          <Link
            to={`/jobs/${job.id}`}
            className="inline-flex items-center text-xs font-semibold text-brand-600 hover:text-brand-800 group-hover:translate-x-0.5 transition-all"
          >
            <span>View Details</span>
            <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default JobCard;
