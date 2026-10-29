import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import {
  Building, Globe, MapPin, Save, CheckCircle2, AlertCircle, Check
} from 'lucide-react';

const INDUSTRIES = [
  'Software & AI',
  'Cloud Computing',
  'Fintech',
  'Cybersecurity',
  'Healthcare',
  'E-Commerce & Retail',
  'Telecommunications',
  'Consulting & Services'
];

const SIZES = ['1-10', '11-50', '51-200', '201-1000', '1000+'];

const CompanyProfile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const [name, setName] = useState('');
  const [logo, setLogo] = useState('');
  const [website, setWebsite] = useState('');
  const [description, setDescription] = useState('');
  const [industry, setIndustry] = useState('Software & AI');
  const [location, setLocation] = useState('Remote');
  const [companySize, setCompanySize] = useState('51-200');
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const res = await api.get('/recruiter/company');
        const c = res.data.company;
        setName(c.name || '');
        setLogo(c.logo || '');
        setWebsite(c.website || '');
        setDescription(c.description || '');
        setIndustry(c.industry || 'Software & AI');
        setLocation(c.location || 'Remote');
        setCompanySize(c.company_size || '51-200');
        setIsVerified(c.is_verified || false);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCompany();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: '', type: '' });

    try {
      await api.put('/recruiter/company', {
        name,
        logo,
        website,
        description,
        industry,
        location,
        company_size: companySize
      });
      setMessage({ text: 'Company profile updated successfully!', type: 'success' });
    } catch (err) {
      setMessage({ text: err.response?.data?.error || 'Failed to update company profile', type: 'error' });
    } finally {
      setSaving(false);
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 flex items-center space-x-2">
              <span>Company Profile</span>
              {isVerified && <CheckCircle2 className="w-5 h-5 text-brand-600 fill-brand-100" title="Verified by JobConnect" />}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              This corporate profile is displayed to candidates browsing your active job openings.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl font-bold text-xs text-white gradient-primary hover:opacity-95 shadow-md shadow-brand-500/20 flex items-center space-x-1.5 self-start sm:self-auto disabled:opacity-50"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>

        {message.text && (
          <div className={`p-4 rounded-xl text-xs font-semibold flex items-center space-x-2 ${
            message.type === 'success' ? 'bg-teal-50 text-teal-800 border border-teal-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}>
            {message.type === 'success' ? <Check className="w-4 h-4 text-teal-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-2xs space-y-5">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Company Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:border-brand-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Industry Sector</label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:border-brand-500 outline-none"
              >
                {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Company Logo URL</label>
              <input
                type="url"
                value={logo}
                onChange={(e) => setLogo(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:border-brand-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Official Website</label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://company.com"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:border-brand-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Headquarters Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="San Francisco, CA or Remote"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:border-brand-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Company Size</label>
              <select
                value={companySize}
                onChange={(e) => setCompanySize(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:border-brand-500 outline-none"
              >
                {SIZES.map(s => <option key={s} value={s}>{s} employees</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Company Overview & Culture</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell candidates about your company mission, products, and culture..."
              className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:border-brand-500 outline-none"
            ></textarea>
          </div>

          {/* Logo Preview */}
          {logo && (
            <div className="pt-2 flex items-center space-x-3">
              <span className="text-xs text-slate-500">Logo Preview:</span>
              <img src={logo} alt="Preview" className="w-12 h-12 rounded-xl object-cover border border-slate-200" />
            </div>
          )}

          <div className="flex justify-end pt-3 border-t border-slate-100">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl font-bold text-xs text-white gradient-primary hover:opacity-95 shadow-md shadow-brand-500/20 flex items-center space-x-1.5 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>Save Company Profile</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

export default CompanyProfile;
