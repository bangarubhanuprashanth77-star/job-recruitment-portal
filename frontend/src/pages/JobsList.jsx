import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/client';
import JobCard from '../components/JobCard';
import {
  Search, MapPin, Filter, RotateCcw, SlidersHorizontal,
  Briefcase, DollarSign, Sparkles, ChevronDown
} from 'lucide-react';

const CATEGORIES = [
  'All',
  'Software Development',
  'Artificial Intelligence & ML',
  'Cloud & DevOps',
  'Data Science & Analytics',
  'Cybersecurity',
  'UI/UX & Product Design',
  'Product Management'
];

const EMPLOYMENT_TYPES = ['All', 'Full-time', 'Part-time', 'Contract', 'Internship'];
const EXPERIENCE_LEVELS = ['All', 'Entry-level', 'Mid-level', 'Senior', 'Lead'];

const JobsList = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [keyword, setKeyword] = useState(searchParams.get('q') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [employmentType, setEmploymentType] = useState(searchParams.get('type') || 'All');
  const [experienceLevel, setExperienceLevel] = useState(searchParams.get('experience') || 'All');
  const [isRemote, setIsRemote] = useState(searchParams.get('remote') === 'true');
  const [minSalary, setMinSalary] = useState(searchParams.get('min_salary') ? parseInt(searchParams.get('min_salary')) : 0);
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'recent');

  const [jobs, setJobs] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (keyword) params.append('q', keyword);
      if (location) params.append('location', location);
      if (category && category !== 'All') params.append('category', category);
      if (employmentType && employmentType !== 'All') params.append('type', employmentType);
      if (experienceLevel && experienceLevel !== 'All') params.append('experience', experienceLevel);
      if (isRemote) params.append('remote', 'true');
      if (minSalary > 0) params.append('min_salary', minSalary.toString());
      if (sortBy) params.append('sort', sortBy);

      setSearchParams(params, { replace: true });

      const res = await api.get(`/jobs?${params.toString()}`);
      setJobs(res.data.jobs || []);
      setTotalCount(res.data.count || 0);
    } catch (err) {
      console.error("Failed to load jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [category, employmentType, experienceLevel, isRemote, minSalary, sortBy]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchJobs();
  };

  const handleResetFilters = () => {
    setKeyword('');
    setLocation('');
    setCategory('All');
    setEmploymentType('All');
    setExperienceLevel('All');
    setIsRemote(false);
    setMinSalary(0);
    setSortBy('recent');
    setSearchParams({}, { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Search Banner */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-6 shadow-sm mb-8">
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-5 flex items-center px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 focus-within:border-brand-500 focus-within:bg-white transition-all">
              <Search className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Job title, keywords, or skills..."
                className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
              />
            </div>

            <div className="md:col-span-4 flex items-center px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 focus-within:border-brand-500 focus-within:bg-white transition-all">
              <MapPin className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City, State, or 'Remote'..."
                className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
              />
            </div>

            <div className="md:col-span-3 flex items-center space-x-2">
              <button
                type="submit"
                className="flex-1 py-2.5 px-4 rounded-xl text-sm font-bold text-white gradient-primary hover:opacity-95 shadow-md shadow-brand-500/20 flex items-center justify-center space-x-2 transition-all"
              >
                <Search className="w-4 h-4" />
                <span>Search</span>
              </button>

              <button
                type="button"
                onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
                className="md:hidden p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                <Filter className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Filter Sidebar (Desktop & Mobile) */}
          <div className={`lg:block ${mobileFilterOpen ? 'block' : 'hidden'} space-y-6`}>
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-6">
              
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm">
                  <SlidersHorizontal className="w-4 h-4 text-brand-600" />
                  <span>Filters</span>
                </div>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-xs text-brand-600 hover:text-brand-800 flex items-center font-medium"
                >
                  <RotateCcw className="w-3 h-3 mr-1" />
                  Reset
                </button>
              </div>

              {/* Remote Only Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-800">Remote Only</div>
                  <div className="text-[11px] text-slate-400">Work from anywhere</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isRemote}
                    onChange={(e) => setIsRemote(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-600"></div>
                </label>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-2">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-700 bg-slate-50 focus:bg-white focus:border-brand-500 outline-none"
                >
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Employment Type */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-2">Employment Type</label>
                <div className="space-y-1.5">
                  {EMPLOYMENT_TYPES.map(type => (
                    <label key={type} className="flex items-center space-x-2 text-xs text-slate-600 cursor-pointer hover:text-slate-900">
                      <input
                        type="radio"
                        name="empType"
                        checked={employmentType === type}
                        onChange={() => setEmploymentType(type)}
                        className="text-brand-600 focus:ring-brand-500 rounded"
                      />
                      <span>{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Experience Level */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-2">Experience Level</label>
                <div className="space-y-1.5">
                  {EXPERIENCE_LEVELS.map(exp => (
                    <label key={exp} className="flex items-center space-x-2 text-xs text-slate-600 cursor-pointer hover:text-slate-900">
                      <input
                        type="radio"
                        name="expLevel"
                        checked={experienceLevel === exp}
                        onChange={() => setExperienceLevel(exp)}
                        className="text-brand-600 focus:ring-brand-500 rounded"
                      />
                      <span>{exp}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Minimum Salary Slider */}
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-800 mb-2">
                  <span>Minimum Salary</span>
                  <span className="text-brand-600 font-bold">
                    {minSalary > 0 ? `$${(minSalary / 1000).toFixed(0)}k/yr+` : 'Any'}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200000"
                  step="10000"
                  value={minSalary}
                  onChange={(e) => setMinSalary(parseInt(e.target.value))}
                  className="w-full accent-brand-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>$0</span>
                  <span>$100k</span>
                  <span>$200k+</span>
                </div>
              </div>

            </div>
          </div>

          {/* Job Listings Main Column */}
          <div className="lg:col-span-3 space-y-4">
            
            {/* Header: Result count & Sort */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white px-5 py-3.5 rounded-2xl border border-slate-200/90 shadow-2xs gap-3">
              <div className="text-xs text-slate-600 font-medium">
                Showing <span className="font-bold text-slate-900">{totalCount}</span> active job {totalCount === 1 ? 'posting' : 'postings'}
              </div>

              <div className="flex items-center space-x-2 text-xs">
                <span className="text-slate-500">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 font-medium focus:outline-none"
                >
                  <option value="recent">Most Recent</option>
                  <option value="salary_high">Salary: High to Low</option>
                  <option value="salary_low">Salary: Low to High</option>
                </select>
              </div>
            </div>

            {/* Job Cards List */}
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-44 bg-white rounded-2xl border border-slate-200 animate-pulse"></div>
                ))}
              </div>
            ) : jobs.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200/90 p-12 text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
                  <Briefcase className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">No jobs match your criteria</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Try broadening your filters, clearing the search query, or resetting the salary slider.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 transition-colors"
                >
                  Reset all filters
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {jobs.map(job => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};

export default JobsList;
