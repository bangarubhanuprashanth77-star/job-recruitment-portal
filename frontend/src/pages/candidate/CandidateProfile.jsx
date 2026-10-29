import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import {
  User, Briefcase, GraduationCap, Link2, Plus, Trash2,
  Check, AlertCircle, Save, Sparkles, MapPin, Phone, Github, Linkedin, Globe
} from 'lucide-react';

const POPULAR_SKILLS = [
  'React.js', 'TypeScript', 'JavaScript', 'Python', 'Node.js',
  'PostgreSQL', 'Docker', 'AWS', 'Kubernetes', 'REST APIs',
  'Tailwind CSS', 'Git', 'Machine Learning', 'PyTorch', 'MongoDB'
];

const CandidateProfile = () => {
  const { user, refreshUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [currentTitle, setCurrentTitle] = useState('');
  const [yearsExperience, setYearsExperience] = useState(0);

  const [skills, setSkills] = useState([]);
  const [newSkillInput, setNewSkillInput] = useState('');

  const [education, setEducation] = useState([]);
  const [experience, setExperience] = useState([]);

  const [githubUrl, setGithubUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/candidate/profile');
        const p = res.data.profile || {};
        const u = res.data.user || {};

        setFirstName(u.first_name || '');
        setLastName(u.last_name || '');
        setPhone(u.phone || '');
        setHeadline(p.headline || '');
        setBio(p.bio || '');
        setLocation(p.location || '');
        setCurrentTitle(p.current_title || '');
        setYearsExperience(p.years_experience || 0);
        setSkills(p.skills || []);
        setEducation(p.education || []);
        setExperience(p.experience || []);
        setGithubUrl(p.github_url || '');
        setLinkedinUrl(p.linkedin_url || '');
        setPortfolioUrl(p.portfolio_url || '');
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleAddSkill = (skillToAdd) => {
    const trimmed = (skillToAdd || newSkillInput).trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setNewSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  // Education helpers
  const handleAddEducation = () => {
    setEducation([...education, { degree: '', school: '', year: '' }]);
  };

  const handleUpdateEducation = (index, field, value) => {
    const updated = [...education];
    updated[index][field] = value;
    setEducation(updated);
  };

  const handleRemoveEducation = (index) => {
    setEducation(education.filter((_, i) => i !== index));
  };

  // Experience helpers
  const handleAddExperience = () => {
    setExperience([...experience, { title: '', company: '', duration: '', description: '' }]);
  };

  const handleUpdateExperience = (index, field, value) => {
    const updated = [...experience];
    updated[index][field] = value;
    setExperience(updated);
  };

  const handleRemoveExperience = (index) => {
    setExperience(experience.filter((_, i) => i !== index));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: '', type: '' });

    try {
      await api.put('/candidate/profile', {
        first_name: firstName,
        last_name: lastName,
        phone,
        headline,
        bio,
        location,
        current_title: currentTitle,
        years_experience: parseFloat(yearsExperience) || 0,
        skills,
        education,
        experience,
        github_url: githubUrl,
        linkedin_url: linkedinUrl,
        portfolio_url: portfolioUrl
      });
      await refreshUser();
      setMessage({ text: 'Profile updated successfully!', type: 'success' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setMessage({ text: err.response?.data?.error || 'Failed to save profile', type: 'error' });
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
            <h1 className="text-2xl font-extrabold text-slate-900">Professional Profile</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Keep your profile up to date to improve your AI skill-match ranking with recruiters.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl font-bold text-xs text-white gradient-primary hover:opacity-95 shadow-md shadow-brand-500/20 flex items-center space-x-1.5 self-start sm:self-auto disabled:opacity-50"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Profile</span>
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

        <form onSubmit={handleSave} className="space-y-6">
          
          {/* Basic Personal Information */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center space-x-2">
              <User className="w-4 h-4 text-brand-600" />
              <span>Basic Information</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">First Name</label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:border-brand-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Last Name</label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:border-brand-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:border-brand-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="San Francisco, CA (or Remote)"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:border-brand-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Current Job Title</label>
                <input
                  type="text"
                  value={currentTitle}
                  onChange={(e) => setCurrentTitle(e.target.value)}
                  placeholder="e.g. Senior Full Stack Engineer"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:border-brand-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Total Years Experience</label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={yearsExperience}
                  onChange={(e) => setYearsExperience(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:border-brand-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Professional Headline</label>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="e.g. Senior React & Node.js Developer passionate about cloud architecture"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:border-brand-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Bio / Executive Summary</label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Brief summary of your professional journey and career goals..."
                className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:border-brand-500 outline-none"
              ></textarea>
            </div>
          </div>

          {/* Technical Skills Manager */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-teal-600" />
                <span>Technical Skills ({skills.length})</span>
              </h2>
              <span className="text-[11px] text-slate-400">Used for real-time AI job matching</span>
            </div>

            {/* Input to add custom skill */}
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={newSkillInput}
                onChange={(e) => setNewSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
                placeholder="Add a skill (e.g. Docker, GraphQL, PyTorch)..."
                className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:border-brand-500 outline-none"
              />
              <button
                type="button"
                onClick={() => handleAddSkill()}
                className="px-4 py-2 rounded-xl text-xs font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 transition-colors"
              >
                Add
              </button>
            </div>

            {/* Current Active Skills */}
            <div className="flex flex-wrap gap-2 pt-1">
              {skills.map(s => (
                <span
                  key={s}
                  className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200"
                >
                  <span>{s}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(s)}
                    className="hover:text-rose-600 ml-1 font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            {/* Quick Add Suggestions */}
            <div className="pt-2 border-t border-slate-100">
              <span className="text-[11px] text-slate-400 block mb-1.5">Suggestions:</span>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_SKILLS.filter(s => !skills.includes(s)).slice(0, 8).map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleAddSkill(s)}
                    className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                  >
                    + {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Work Experience */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <Briefcase className="w-4 h-4 text-brand-600" />
                <span>Work Experience</span>
              </h2>
              <button
                type="button"
                onClick={handleAddExperience}
                className="text-xs font-bold text-brand-600 hover:text-brand-800 flex items-center"
              >
                <Plus className="w-3.5 h-3.5 mr-0.5" />
                <span>Add Position</span>
              </button>
            </div>

            {experience.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No work experience entries added yet.</p>
            ) : (
              <div className="space-y-4">
                {experience.map((exp, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 relative">
                    <button
                      type="button"
                      onClick={() => handleRemoveExperience(idx)}
                      className="absolute top-3 right-3 text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Job Title</label>
                        <input
                          type="text"
                          value={exp.title || ''}
                          onChange={(e) => handleUpdateExperience(idx, 'title', e.target.value)}
                          placeholder="Software Engineer"
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Company</label>
                        <input
                          type="text"
                          value={exp.company || ''}
                          onChange={(e) => handleUpdateExperience(idx, 'company', e.target.value)}
                          placeholder="Acme Corp"
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Duration</label>
                        <input
                          type="text"
                          value={exp.duration || ''}
                          onChange={(e) => handleUpdateExperience(idx, 'duration', e.target.value)}
                          placeholder="2022 - Present"
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Key Accomplishments</label>
                      <textarea
                        rows={2}
                        value={exp.description || ''}
                        onChange={(e) => handleUpdateExperience(idx, 'description', e.target.value)}
                        placeholder="Led development of core features boosting performance by 25%..."
                        className="w-full p-2.5 rounded-lg border border-slate-200 text-xs bg-white"
                      ></textarea>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Education */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <GraduationCap className="w-4 h-4 text-purple-600" />
                <span>Education</span>
              </h2>
              <button
                type="button"
                onClick={handleAddEducation}
                className="text-xs font-bold text-brand-600 hover:text-brand-800 flex items-center"
              >
                <Plus className="w-3.5 h-3.5 mr-0.5" />
                <span>Add Degree</span>
              </button>
            </div>

            {education.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No education history added yet.</p>
            ) : (
              <div className="space-y-3">
                {education.map((edu, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 relative grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => handleRemoveEducation(idx)}
                      className="absolute top-3 right-3 text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Degree / Major</label>
                      <input
                        type="text"
                        value={edu.degree || ''}
                        onChange={(e) => handleUpdateEducation(idx, 'degree', e.target.value)}
                        placeholder="B.S. in Computer Science"
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">University / College</label>
                      <input
                        type="text"
                        value={edu.school || ''}
                        onChange={(e) => handleUpdateEducation(idx, 'school', e.target.value)}
                        placeholder="Stanford University"
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Graduation Year</label>
                      <input
                        type="text"
                        value={edu.year || ''}
                        onChange={(e) => handleUpdateEducation(idx, 'year', e.target.value)}
                        placeholder="2023"
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Social & Portfolio Links */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center space-x-2">
              <Link2 className="w-4 h-4 text-brand-600" />
              <span>Online Presence & Links</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center">
                  <Github className="w-3.5 h-3.5 mr-1 text-slate-500" />
                  GitHub URL
                </label>
                <input
                  type="url"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/username"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-brand-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center">
                  <Linkedin className="w-3.5 h-3.5 mr-1 text-brand-600" />
                  LinkedIn URL
                </label>
                <input
                  type="url"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-brand-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center">
                  <Globe className="w-3.5 h-3.5 mr-1 text-teal-600" />
                  Portfolio Website
                </label>
                <input
                  type="url"
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  placeholder="https://yourdomain.dev"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-brand-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Bottom Save Action */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 rounded-xl font-bold text-xs text-white gradient-primary hover:opacity-95 shadow-md shadow-brand-500/20 flex items-center space-x-2 transition-all disabled:opacity-50"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Profile Changes</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

export default CandidateProfile;
