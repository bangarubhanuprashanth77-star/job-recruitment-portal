import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client';
import JobCard from '../components/JobCard';
import { Building, MapPin, Globe, CheckCircle2, ArrowLeft, Briefcase } from 'lucide-react';

const CompanyDetail = () => {
  const { id } = useParams();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const res = await api.get(`/companies/${id}`);
        setCompany(res.data.company);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCompany();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 py-16 flex justify-center">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-slate-50 py-16 text-center">
        <h2 className="text-base font-bold text-slate-800">Company Not Found</h2>
        <Link to="/companies" className="text-xs text-brand-600 mt-2 inline-block">Back to Companies</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        <Link to="/companies" className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-900">
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back to all companies
        </Link>

        {/* Company Overview Card */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              {company.logo ? (
                <img src={company.logo} alt={company.name} className="w-16 h-16 rounded-2xl object-cover border border-slate-200" />
              ) : (
                <div className="w-16 h-16 rounded-2xl gradient-primary text-white flex items-center justify-center font-bold text-2xl shadow-sm">
                  {company.name?.[0]}
                </div>
              )}
              <div>
                <div className="flex items-center space-x-1.5">
                  <h1 className="text-2xl font-extrabold text-slate-900">{company.name}</h1>
                  {company.is_verified && <CheckCircle2 className="w-5 h-5 text-brand-600 fill-brand-100" />}
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                  <span>{company.industry}</span>
                  <span>•</span>
                  <span className="flex items-center">
                    <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    {company.location || 'Remote'}
                  </span>
                  <span>•</span>
                  <span>{company.company_size || '50-200'} employees</span>
                </div>
              </div>
            </div>

            {company.website && (
              <a
                href={company.website}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors self-start sm:self-auto"
              >
                <Globe className="w-4 h-4 text-slate-500" />
                <span>Visit Website</span>
              </a>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 text-xs sm:text-sm text-slate-700 leading-relaxed">
            {company.description}
          </div>
        </div>

        {/* Active Jobs by this Company */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <Briefcase className="w-5 h-5 text-brand-600" />
              <span>Open Vacancies at {company.name} ({company.jobs?.length || 0})</span>
            </h2>
          </div>

          {company.jobs?.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-500">
              There are currently no active openings posted by this company. Check back soon!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {company.jobs.map(job => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default CompanyDetail;
