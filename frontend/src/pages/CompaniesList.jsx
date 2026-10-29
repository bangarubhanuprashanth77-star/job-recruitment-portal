import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { Building, Search, MapPin, CheckCircle2, ChevronRight, Briefcase } from 'lucide-react';

const INDUSTRIES = ['All', 'Software & AI', 'Cloud Computing', 'Fintech', 'Cybersecurity', 'Healthcare'];

const CompaniesList = () => {
  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState('');
  const [industry, setIndustry] = useState('All');
  const [loading, setLoading] = useState(true);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('q', search);
      if (industry && industry !== 'All') params.append('industry', industry);
      const res = await api.get(`/companies?${params.toString()}`);
      setCompanies(res.data.companies || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [industry]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCompanies();
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-600">Explore Employers</span>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Top Hiring Companies & Startups
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Browse verified tech organizations, learn about company culture, and discover active openings.
          </p>
        </div>

        {/* Filter bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
          <form onSubmit={handleSearch} className="flex-1 flex items-center px-3.5 py-2 bg-slate-50 rounded-xl border border-slate-200 focus-within:border-brand-500 focus-within:bg-white w-full">
            <Search className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search companies by name..."
              className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
            />
          </form>

          <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            {INDUSTRIES.map(ind => (
              <button
                key={ind}
                onClick={() => setIndustry(ind)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  industry === ind
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {ind}
              </button>
            ))}
          </div>
        </div>

        {/* Companies Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-56 bg-white rounded-2xl border border-slate-200 animate-pulse"></div>
            ))}
          </div>
        ) : companies.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 shadow-sm">
            <Building className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-900">No companies found</h3>
            <p className="text-xs text-slate-500 mt-1">Try resetting your search query.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies.map(comp => (
              <div
                key={comp.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-6 hover:shadow-md hover:border-brand-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3.5">
                    <div className="flex items-center space-x-3">
                      {comp.logo ? (
                        <img src={comp.logo} alt={comp.name} className="w-12 h-12 rounded-xl object-cover border border-slate-200" />
                      ) : (
                        <div className="w-12 h-12 rounded-xl gradient-primary text-white flex items-center justify-center font-bold text-base shadow-sm">
                          {comp.name?.[0]}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <h3 className="font-bold text-sm text-slate-900 line-clamp-1">{comp.name}</h3>
                          {comp.is_verified && <CheckCircle2 className="w-4 h-4 text-brand-600 fill-brand-100" />}
                        </div>
                        <span className="text-xs text-slate-500">{comp.industry}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4">
                    {comp.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                    <span className="flex items-center">
                      <MapPin className="w-3 h-3 mr-1 text-slate-400" />
                      {comp.location || 'Remote'}
                    </span>
                    <span>•</span>
                    <span>{comp.company_size || '50-200'} employees</span>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-md">
                    {comp.jobs_count} Open {comp.jobs_count === 1 ? 'Job' : 'Jobs'}
                  </span>
                  <Link
                    to={`/companies/${comp.id}`}
                    className="text-xs font-semibold text-slate-700 hover:text-brand-600 flex items-center"
                  >
                    <span>View Profile</span>
                    <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default CompaniesList;
