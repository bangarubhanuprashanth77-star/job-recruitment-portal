import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import JobCard from '../../components/JobCard';
import { Bookmark, ArrowLeft, Briefcase } from 'lucide-react';

const SavedJobs = () => {
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSaved = async () => {
    setLoading(true);
    try {
      const res = await api.get('/candidate/saved-jobs');
      setSavedJobs(res.data.saved_jobs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSaved();
  }, []);

  const handleSaveToggle = (jobId, isNowSaved) => {
    if (!isNowSaved) {
      setSavedJobs(prev => prev.filter(s => s.job_id !== jobId));
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
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 flex items-center space-x-2">
              <Bookmark className="w-6 h-6 text-amber-500 fill-amber-500" />
              <span>Saved Job Opportunities ({savedJobs.length})</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Review and apply to the positions you bookmarked.
            </p>
          </div>

          <Link
            to="/jobs"
            className="px-4 py-2 rounded-xl text-xs font-bold text-white gradient-primary hover:opacity-95 shadow-md flex items-center space-x-1.5 self-start sm:self-auto"
          >
            <Briefcase className="w-4 h-4" />
            <span>Discover More Roles</span>
          </Link>
        </div>

        {savedJobs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
            <Bookmark className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-900">No saved jobs yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Click the bookmark icon on any job card to save it for later review.
            </p>
            <Link to="/jobs" className="inline-block px-4 py-2 rounded-xl text-xs font-semibold text-brand-600 bg-brand-50 hover:bg-brand-100">
              Browse Job Openings
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedJobs.map(item => (
              item.job ? (
                <JobCard
                  key={item.id}
                  job={{ ...item.job, is_saved: true }}
                  onSaveToggle={handleSaveToggle}
                />
              ) : null
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default SavedJobs;
