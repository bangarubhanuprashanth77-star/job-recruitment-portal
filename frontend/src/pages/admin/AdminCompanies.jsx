import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import {
  Building, CheckCircle2, ArrowLeft, ShieldCheck, Globe, MapPin, Check, AlertCircle
} from 'lucide-react';

const AdminCompanies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/companies');
      setCompanies(res.data.companies || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleToggleVerify = async (company) => {
    try {
      const res = await api.put(`/admin/companies/${company.id}/verify`, {
        is_verified: !company.is_verified
      });
      setMessage({ text: res.data.message, type: 'success' });
      setCompanies(prev => prev.map(c => c.id === company.id ? { ...c, is_verified: !c.is_verified } : c));
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } catch (err) {
      setMessage({ text: err.response?.data?.error || 'Failed to update company verification', type: 'error' });
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
        
        <Link to="/admin/dashboard" className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-900">
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back to Admin Dashboard
        </Link>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 flex items-center space-x-2">
              <Building className="w-6 h-6 text-brand-600" />
              <span>Company Verification Management ({companies.length})</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Verify authentic business credentials to grant trusted recruiter checkmarks.
            </p>
          </div>
        </div>

        {message.text && (
          <div className={`p-4 rounded-xl text-xs font-semibold flex items-center space-x-2 ${
            message.type === 'success' ? 'bg-teal-50 text-teal-800 border border-teal-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}>
            {message.type === 'success' ? <Check className="w-4 h-4 text-teal-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
            <span>{message.text}</span>
          </div>
        )}

        {/* Companies Table */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                  <th className="py-3.5 px-4">Company</th>
                  <th className="py-3.5 px-4">Recruiter Contact</th>
                  <th className="py-3.5 px-4">Industry & Location</th>
                  <th className="py-3.5 px-4">Vacancies</th>
                  <th className="py-3.5 px-4">Verification Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {companies.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-3">
                        {c.logo ? (
                          <img src={c.logo} alt={c.name} className="w-9 h-9 rounded-xl object-cover border border-slate-200" />
                        ) : (
                          <div className="w-9 h-9 rounded-xl gradient-primary text-white flex items-center justify-center font-bold text-xs">
                            {c.name?.[0]}
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-slate-900 flex items-center space-x-1">
                            <span>{c.name}</span>
                            {c.is_verified && <CheckCircle2 className="w-3.5 h-3.5 text-brand-600 fill-brand-100" />}
                          </div>
                          {c.website && (
                            <a href={c.website} target="_blank" rel="noreferrer" className="text-[11px] text-brand-600 hover:underline">
                              {c.website.replace('https://', '')}
                            </a>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <div className="font-medium text-slate-800">{c.recruiter_name}</div>
                      <div className="text-[11px] text-slate-400">{c.recruiter_email}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <div>{c.industry}</div>
                      <div className="text-[11px] text-slate-400">{c.location} • {c.company_size}</div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {c.jobs_count}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${
                        c.is_verified
                          ? 'bg-teal-50 text-teal-800 border border-teal-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {c.is_verified ? 'Verified Employer' : 'Unverified'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleToggleVerify(c)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                          c.is_verified
                            ? 'border-slate-200 text-slate-600 hover:bg-slate-50'
                            : 'border-teal-300 bg-teal-50 hover:bg-teal-100 text-teal-800'
                        }`}
                      >
                        {c.is_verified ? 'Revoke Badge' : 'Verify Badge'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminCompanies;
