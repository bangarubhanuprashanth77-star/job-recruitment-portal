import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import JobCard from '../components/JobCard';
import {
  Search, MapPin, Briefcase, Sparkles, Building, ArrowRight,
  CheckCircle2, Users, TrendingUp, ShieldCheck, Cpu, Code, Cloud,
  Layers, ChevronRight, Award, Zap
} from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [searchCategory, setSearchCategory] = useState('All');
  
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobsRes, catRes, compRes] = await Promise.all([
          api.get('/jobs/featured'),
          api.get('/jobs/categories'),
          api.get('/companies')
        ]);
        setFeaturedJobs(jobsRes.data.jobs || []);
        setCategories(catRes.data.categories || []);
        setCompanies(compRes.data.companies?.slice(0, 4) || []);
      } catch (err) {
        console.error("Failed to load home page data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.append('q', searchQuery);
    if (searchLocation) params.append('location', searchLocation);
    if (searchCategory && searchCategory !== 'All') params.append('category', searchCategory);
    navigate(`/jobs?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-slate-950 text-white pt-16 pb-20 lg:pt-24 lg:pb-32">
        {/* Background Gradients & Glows */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            
            {/* Pill Tag */}
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-800/90 border border-slate-700/80 text-xs font-semibold text-slate-200 shadow-inner">
              <span className="flex h-2 w-2 rounded-full bg-teal-400 animate-pulse"></span>
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              <span>Next-Generation AI Recruitment & Matchmaking</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Connecting Ambition with Opportunity via <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-teal-300 to-teal-400">Intelligent AI</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed max-w-2xl mx-auto">
              JobConnect transforms recruitment with transparent skill matching, automated resume diagnostics, and role-based workflows for candidates, recruiters, and companies.
            </p>

            {/* SEARCH BAR CARD */}
            <div className="pt-4 max-w-4xl mx-auto">
              <form
                onSubmit={handleSearchSubmit}
                className="bg-white rounded-2xl p-2 sm:p-3 shadow-2xl border border-slate-200/80 grid grid-cols-1 md:grid-cols-12 gap-2 text-slate-900"
              >
                {/* Keyword Input */}
                <div className="md:col-span-5 flex items-center px-3 py-2 bg-slate-50/80 rounded-xl border border-slate-200/60 focus-within:border-brand-500 focus-within:bg-white transition-all">
                  <Search className="w-5 h-5 text-slate-400 mr-2 flex-shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Job title, skills (e.g. React, Python)"
                    className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
                  />
                </div>

                {/* Location Input */}
                <div className="md:col-span-4 flex items-center px-3 py-2 bg-slate-50/80 rounded-xl border border-slate-200/60 focus-within:border-brand-500 focus-within:bg-white transition-all">
                  <MapPin className="w-5 h-5 text-slate-400 mr-2 flex-shrink-0" />
                  <input
                    type="text"
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    placeholder="City, State, or 'Remote'"
                    className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
                  />
                </div>

                {/* Submit Button */}
                <div className="md:col-span-3">
                  <button
                    type="submit"
                    className="w-full h-full py-3 px-5 rounded-xl text-sm font-bold text-white gradient-primary hover:opacity-95 shadow-md shadow-brand-500/30 flex items-center justify-center space-x-2 transition-all active:scale-[0.99]"
                  >
                    <span>Search Jobs</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>

              {/* Quick Tags */}
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400">
                <span className="font-medium text-slate-300">Popular:</span>
                {['React.js', 'Python', 'DevOps', 'Machine Learning', 'Full Stack', 'Remote'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      setSearchQuery(tag);
                      navigate(`/jobs?q=${encodeURIComponent(tag)}`);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* METRICS COUNTER BAR */}
      <section className="bg-white border-b border-slate-200 py-6 sm:py-8 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-slate-100">
            <div className="pt-2 md:pt-0">
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">500+</p>
              <p className="text-xs sm:text-sm font-medium text-slate-500 mt-0.5">Active Tech Jobs</p>
            </div>
            <div className="pt-2 md:pt-0">
              <p className="text-2xl sm:text-3xl font-extrabold text-brand-600">94.2%</p>
              <p className="text-xs sm:text-sm font-medium text-slate-500 mt-0.5">AI Match Accuracy</p>
            </div>
            <div className="pt-2 md:pt-0">
              <p className="text-2xl sm:text-3xl font-extrabold text-teal-600">120+</p>
              <p className="text-xs sm:text-sm font-medium text-slate-500 mt-0.5">Verified Companies</p>
            </div>
            <div className="pt-2 md:pt-0">
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">15,000+</p>
              <p className="text-xs sm:text-sm font-medium text-slate-500 mt-0.5">Resumes Analyzed</p>
            </div>
          </div>
        </div>
      </section>

      {/* AI SPOTLIGHT SECTION */}
      <section className="py-16 sm:py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-teal-900/80 text-teal-300 border border-teal-700/80">
                  <Zap className="w-3.5 h-3.5 mr-1 text-teal-400" />
                  Transparent AI Matching Engine
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
                  No Black-Box Screening. See Exactly Why You Match.
                </h2>
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                  Unlike traditional ATS black-boxes, JobConnect breaks down required competencies into matching skills and missing skills with transparent scoring. Never wonder why you didn't hear back again.
                </p>
                <div className="pt-2 flex flex-wrap gap-4">
                  <Link
                    to="/resume-analyzer"
                    className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-teal-500 hover:bg-teal-400 text-slate-950 transition-colors shadow-lg shadow-teal-500/20"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Try AI Resume Studio</span>
                  </Link>
                  <Link
                    to="/jobs"
                    className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-colors"
                  >
                    <span>Browse Matched Vacancies</span>
                  </Link>
                </div>
              </div>

              {/* Visual Card Simulation */}
              <div className="lg:col-span-5 bg-slate-950/70 backdrop-blur-md rounded-2xl p-5 border border-slate-700/80 shadow-2xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-lg bg-teal-500/20 flex items-center justify-center text-teal-400 font-bold text-xs">
                      AI
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Full Stack Match Breakdown</div>
                      <div className="text-[10px] text-slate-400">Senior React & Python Role</div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-teal-400/20 text-teal-300 border border-teal-500/30">
                    94.5% Match
                  </span>
                </div>

                <div>
                  <div className="text-[11px] font-semibold text-teal-400 mb-1.5 flex items-center">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-teal-400" />
                    Matching Skills (7 Detected)
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {['React.js', 'TypeScript', 'Python', 'PostgreSQL', 'Docker', 'REST APIs', 'Git'].map(s => (
                      <span key={s} className="px-2 py-0.5 rounded text-[10px] font-semibold bg-teal-950 text-teal-300 border border-teal-800">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-semibold text-rose-400 mb-1.5 flex items-center">
                    <span className="w-2 h-2 rounded-full bg-rose-400 mr-1.5"></span>
                    Suggested Skills to Learn
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-950 text-rose-300 border border-rose-800">
                      Kubernetes (Optional)
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
                  <span className="font-semibold text-white">ATS Feedback:</span> Strong action verbs detected (Spearheaded, Architected). Quantified impact on 85% of bullet points.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED JOBS SECTION */}
      <section className="py-16 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600">Top Vacancies</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                Featured Opportunities
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Explore handpicked open roles from leading technology companies.
              </p>
            </div>
            <Link
              to="/jobs"
              className="mt-4 sm:mt-0 inline-flex items-center text-sm font-bold text-brand-600 hover:text-brand-800 group"
            >
              <span>Explore All Jobs</span>
              <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-64 rounded-2xl bg-slate-100 animate-pulse border border-slate-200"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredJobs.map(job => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* TOP HIRING COMPANIES */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600">Enterprise Partners</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Popular Companies Hiring Now
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Join forward-thinking teams with verified culture and transparent benefits.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies.map(comp => (
              <div
                key={comp.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-6 hover:shadow-md hover:border-brand-300 transition-all group"
              >
                <div className="flex items-center space-x-3.5 mb-3.5">
                  <img
                    src={comp.logo}
                    alt={comp.name}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                  />
                  <div>
                    <div className="flex items-center space-x-1">
                      <h3 className="font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                        {comp.name}
                      </h3>
                      {comp.is_verified && (
                        <CheckCircle2 className="w-4 h-4 text-brand-600 fill-brand-100" />
                      )}
                    </div>
                    <span className="text-xs text-slate-500">{comp.industry} • {comp.location}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {comp.description}
                </p>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-md">
                    {comp.jobs_count} Open {comp.jobs_count === 1 ? 'Role' : 'Roles'}
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
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="py-16 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600">Seamless Workflow</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              How JobConnect Powers Recruitment
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Purpose-built workflows for candidates and recruiters to find the ideal match faster.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 relative">
              <div className="w-12 h-12 rounded-xl gradient-primary text-white flex items-center justify-center font-bold text-lg mb-4 shadow-md">
                1
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Upload or Build Profile</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Upload your resume in PDF or DOCX. Our AI engine extracts your technical skills, experience metrics, and highlights areas for improvement.
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 relative">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 text-white flex items-center justify-center font-bold text-lg mb-4 shadow-md">
                2
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Transparent Match Scoring</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Browse positions with personalized skill match percentages. Inspect exactly which requirements match your profile and which are missing.
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 relative">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex items-center justify-center font-bold text-lg mb-4 shadow-md">
                3
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Interview & Hire</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Apply in 1-click. Recruiters evaluate applicants with AI breakdowns, update candidate statuses, and schedule real-time interviews directly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="bg-gradient-to-r from-brand-600 to-teal-600 text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to find your next career breakthrough?
          </h2>
          <p className="text-brand-100 max-w-xl mx-auto text-sm sm:text-base">
            Create your account now to unlock personalized job recommendations, instant resume analysis, and direct recruiter interviews.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              to="/register"
              className="px-6 py-3 rounded-xl font-bold text-sm bg-white text-slate-900 hover:bg-slate-100 shadow-lg transition-all"
            >
              Sign Up as Candidate
            </Link>
            <Link
              to="/register?role=recruiter"
              className="px-6 py-3 rounded-xl font-bold text-sm bg-teal-800 text-white hover:bg-teal-900 border border-teal-700 shadow-lg transition-all"
            >
              Hire Talent as Recruiter
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
