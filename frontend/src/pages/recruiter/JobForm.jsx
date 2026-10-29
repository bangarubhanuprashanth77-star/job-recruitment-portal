import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../api/client';
import {
  Briefcase, Sparkles, Save, ArrowLeft, Check, AlertCircle, Plus, X
} from 'lucide-react';

const CATEGORIES = [
  'Software Development',
  'Artificial Intelligence & ML',
  'Cloud & DevOps',
  'Data Science & Analytics',
  'Cybersecurity',
  'UI/UX & Product Design',
  'Product Management',
  'Quality Assurance & Testing'
];

const EMPLOYMENT_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship'];
const EXPERIENCE_LEVELS = ['Entry-level', 'Mid-level', 'Senior', 'Lead', 'Executive'];

const POPULAR_TECH_SKILLS = [
  'React.js', 'TypeScript', 'JavaScript', 'Python', 'Node.js',
  'PostgreSQL', 'Docker', 'AWS', 'Kubernetes', 'REST APIs',
  'Tailwind CSS', 'Machine Learning', 'PyTorch', 'Microservices', 'Git'
];

const JobForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [error, setError] = useState('');

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Software Development');
  const [employmentType, setEmploymentType] = useState('Full-time');
  const [experienceLevel, setExperienceLevel] = useState('Mid-level');
  const [location, setLocation] = useState('Remote');
  const [isRemote, setIsRemote] = useState(true);
  const [salaryMin, setSalaryMin] = useState(120000);
  const [salaryMax, setSalaryMax] = useState(160000);
  const [description, setDescription] = useState('');
  const [responsibilities, setResponsibilities] = useState('');
  const [requirements, setRequirements] = useState('');
  const [skillsRequired, setSkillsRequired] = useState(['React.js', 'TypeScript', 'Node.js']);
  const [newSkillInput, setNewSkillInput] = useState('');

  useEffect(() => {
    if (isEditing) {
      const fetchJob = async () => {
        try {
          const res = await api.get(`/jobs/${id}`);
          const j = res.data.job;
          setTitle(j.title || '');
          setCategory(j.category || 'Software Development');
          setEmploymentType(j.employment_type || 'Full-time');
          setExperienceLevel(j.experience_level || 'Mid-level');
          setLocation(j.location || 'Remote');
          setIsRemote(j.is_remote);
          setSalaryMin(j.salary_min || '');
          setSalaryMax(j.salary_max || '');
          setDescription(j.description || '');
          setResponsibilities(j.responsibilities || '');
          setRequirements(j.requirements || '');
          setSkillsRequired(j.skills_required || []);
        } catch (err) {
          setError('Failed to load existing job details');
        } finally {
          setLoading(false);
        }
      };
      fetchJob();
    }
  }, [id, isEditing]);

  const handleAddSkill = (skillToAdd) => {
    const trimmed = (skillToAdd || newSkillInput).trim();
    if (trimmed && !skillsRequired.includes(trimmed)) {
      setSkillsRequired([...skillsRequired, trimmed]);
      setNewSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkillsRequired(skillsRequired.filter(s => s !== skillToRemove));
  };

  const handleGenerateAiDescription = async () => {
    if (!title.trim()) {
      setError('Please provide a Job Title first so AI can generate relevant specifications.');
      return;
    }

    setAiGenerating(true);
    setError('');
    try {
      const res = await api.post('/ai/generate-job-description', {
        title,
        category,
        experience_level: experienceLevel
      });
      const generated = res.data;
      setDescription(generated.description || '');
      setResponsibilities(generated.responsibilities || '');
      setRequirements(generated.requirements || '');
      if (generated.suggested_skills && generated.suggested_skills.length > 0) {
        setSkillsRequired(generated.suggested_skills);
      }
    } catch (err) {
      setError('Failed to auto-generate description. Please type manually.');
    } finally {
      setAiGenerating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError('Job title and role description are required.');
      return;
    }

    setSaving(true);
    setError('');

    const payload = {
      title,
      category,
      employment_type: employmentType,
      experience_level: experienceLevel,
      location,
      is_remote: isRemote,
      salary_min: parseInt(salaryMin) || null,
      salary_max: parseInt(salaryMax) || null,
      description,
      responsibilities,
      requirements,
      skills_required: skillsRequired
    };

    try {
      if (isEditing) {
        await api.put(`/recruiter/jobs/${id}`, payload);
      } else {
        await api.post('/recruiter/jobs', payload);
      }
      navigate('/recruiter/jobs');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save job posting.');
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
        
        <Link to="/recruiter/jobs" className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-900">
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back to My Vacancies
        </Link>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">
              {isEditing ? 'Edit Job Posting' : 'Post a New Vacancy'}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Specify skills and requirements so our AI engine accurately ranks qualified applicants.
            </p>
          </div>

          {/* AI Generator Helper Button */}
          <button
            type="button"
            onClick={handleGenerateAiDescription}
            disabled={aiGenerating}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-teal-50 text-teal-800 border border-teal-300 hover:bg-teal-100 shadow-xs flex items-center space-x-1.5 transition-all self-start sm:self-auto disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-teal-600" />
            <span>{aiGenerating ? 'Generating Specifications...' : 'Auto-Generate with AI'}</span>
          </button>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-2xs space-y-6">
          
          {/* Basic Details */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center space-x-2">
              <Briefcase className="w-4 h-4 text-brand-600" />
              <span>Job Overview</span>
            </h2>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Job Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Senior Full Stack Engineer"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:border-brand-500 outline-none"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Employment Type</label>
                <select
                  value={employmentType}
                  onChange={(e) => setEmploymentType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:border-brand-500 outline-none"
                >
                  {EMPLOYMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Experience Level</label>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:border-brand-500 outline-none"
                >
                  {EXPERIENCE_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. San Francisco, CA or Remote"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:border-brand-500 outline-none"
                />
              </div>

              <div className="flex items-center space-x-2 pt-5">
                <input
                  type="checkbox"
                  id="isRemoteCheckbox"
                  checked={isRemote}
                  onChange={(e) => setIsRemote(e.target.checked)}
                  className="rounded text-brand-600 focus:ring-brand-500 w-4 h-4"
                />
                <label htmlFor="isRemoteCheckbox" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  Remote Eligible Role
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Minimum Annual Salary ($ USD)</label>
                <input
                  type="number"
                  step="5000"
                  value={salaryMin}
                  onChange={(e) => setSalaryMin(e.target.value)}
                  placeholder="100000"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:border-brand-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Maximum Annual Salary ($ USD)</label>
                <input
                  type="number"
                  step="5000"
                  value={salaryMax}
                  onChange={(e) => setSalaryMax(e.target.value)}
                  placeholder="150000"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:border-brand-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Required Skills Management */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700">
                Required Technical Competencies ({skillsRequired.length})
              </label>
              <span className="text-[11px] text-teal-600 font-medium">Used to score candidate applications</span>
            </div>

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
                placeholder="Type skill & press Enter (e.g. React, Python, Docker)..."
                className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:border-brand-500 outline-none"
              />
              <button
                type="button"
                onClick={() => handleAddSkill()}
                className="px-4 py-2 rounded-xl text-xs font-bold text-brand-700 bg-brand-50 hover:bg-brand-100"
              >
                Add Skill
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {skillsRequired.map(s => (
                <span
                  key={s}
                  className="inline-flex items-center space-x-1 px-3 py-1 rounded-lg text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200"
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

            <div className="pt-1">
              <span className="text-[10px] text-slate-400 block mb-1">Quick Add:</span>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_TECH_SKILLS.filter(s => !skillsRequired.includes(s)).slice(0, 8).map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleAddSkill(s)}
                    className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-600"
                  >
                    + {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Role Description */}
          <div className="space-y-4 pt-3 border-t border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Role Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={4}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the opportunity, company mission, and team objectives..."
                className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:border-brand-500 outline-none"
              ></textarea>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Core Responsibilities
              </label>
              <textarea
                rows={4}
                value={responsibilities}
                onChange={(e) => setResponsibilities(e.target.value)}
                placeholder="• Architect and ship scalable microservices...&#10;• Optimize database queries...&#10;• Mentor engineers..."
                className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:border-brand-500 outline-none font-mono text-[11px]"
              ></textarea>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Qualifications & Requirements
              </label>
              <textarea
                rows={4}
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                placeholder="• 4+ years of professional development experience...&#10;• Strong proficiency with React and TypeScript...&#10;• Experience with AWS cloud infrastructure..."
                className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:border-brand-500 outline-none font-mono text-[11px]"
              ></textarea>
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
            <Link
              to="/recruiter/jobs"
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl font-bold text-xs text-white gradient-primary hover:opacity-95 shadow-md shadow-brand-500/20 flex items-center space-x-1.5 transition-all disabled:opacity-50"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{isEditing ? 'Update Job Vacancy' : 'Publish Job Vacancy'}</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

export default JobForm;
