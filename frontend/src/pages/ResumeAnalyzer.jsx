import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import SkillBadge from '../components/SkillBadge';
import {
  Sparkles, Upload, FileText, CheckCircle2, AlertCircle, ArrowRight,
  TrendingUp, Award, Zap, Check, HelpCircle, BarChart3, RefreshCw
} from 'lucide-react';

const ResumeAnalyzer = () => {
  const { isAuthenticated, role } = useAuth();
  
  const [tab, setTab] = useState('upload'); // 'upload' or 'paste'
  const [file, setFile] = useState(null);
  const [pastedText, setPastedText] = useState('');
  const [targetJobText, setTargetJobText] = useState('');
  
  const [availableJobs, setAvailableJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [matchResult, setMatchResult] = useState(null);
  const [error, setError] = useState('');

  // Fetch some active jobs so user can benchmark easily
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await api.get('/jobs?limit=10');
        setAvailableJobs(res.data.jobs || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchJobs();
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setError('');
    setAnalysisResult(null);
    setMatchResult(null);

    let textToAnalyze = pastedText;

    setAnalyzing(true);
    try {
      if (tab === 'upload') {
        if (!file) {
          setError('Please select a resume file (PDF, DOCX, or TXT)');
          setAnalyzing(false);
          return;
        }

        // Upload resume via candidate endpoint if logged in, or form data
        if (isAuthenticated && role === 'job_seeker') {
          const formData = new FormData();
          formData.append('resume', file);
          const uploadRes = await api.post('/candidate/resumes/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          const resumeData = uploadRes.data.resume;
          textToAnalyze = resumeData.extracted_text;
          setAnalysisResult(uploadRes.data.analysis);
        } else {
          // Send text extraction preview / fallback
          // For demo when not logged in as seeker, read text locally or use sample
          const text = await file.text();
          textToAnalyze = text;
          const res = await api.post('/ai/analyze-resume', { text: textToAnalyze });
          setAnalysisResult(res.data.analysis);
        }
      } else {
        if (!pastedText.trim()) {
          setError('Please paste your resume text');
          setAnalyzing(false);
          return;
        }
        const res = await api.post('/ai/analyze-resume', { text: pastedText });
        setAnalysisResult(res.data.analysis);
      }

      // If target job is selected or entered, run comparison
      if (selectedJobId || targetJobText) {
        const matchRes = await api.post('/ai/match-job', {
          resume_text: textToAnalyze,
          job_id: selectedJobId ? parseInt(selectedJobId) : undefined,
          job_description: targetJobText
        });
        setMatchResult(matchRes.data.result);
      }

    } catch (err) {
      setError(err.response?.data?.error || 'Failed to analyze resume. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSelectPreloadedJob = (jobId) => {
    setSelectedJobId(jobId);
    const chosen = availableJobs.find(j => j.id.toString() === jobId);
    if (chosen) {
      setTargetJobText(chosen.description + "\n\nRequirements:\n" + (chosen.requirements || ''));
    } else {
      setTargetJobText('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header Banner */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>AI Resume Intelligence & Diagnostic Studio</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Optimize Your Resume for High-Impact ATS Match
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            Scan your resume against technical competencies, impact verbs, and targeted job listings. Receive actionable recommendations to maximize your interview conversion rate.
          </p>
        </div>

        {/* Input & Form Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Resume Input */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <FileText className="w-4 h-4 text-brand-600" />
                <span>1. Provide Your Resume</span>
              </h2>

              <div className="flex p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setTab('upload')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    tab === 'upload' ? 'bg-white text-brand-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setTab('paste')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    tab === 'paste' ? 'bg-white text-brand-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Paste Text
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {tab === 'upload' ? (
              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center hover:border-brand-400 transition-colors bg-slate-50/50">
                <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                <div className="text-xs font-bold text-slate-800">
                  {file ? file.name : 'Upload your resume'}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Supports PDF, DOCX, or TXT (Max 16 MB)
                </p>
                <input
                  type="file"
                  id="resumeFileInput"
                  accept=".pdf,.docx,.doc,.txt"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="resumeFileInput"
                  className="mt-4 inline-block px-4 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 cursor-pointer shadow-2xs"
                >
                  {file ? 'Choose Different File' : 'Browse Computer'}
                </label>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Paste Resume Content
                </label>
                <textarea
                  rows={9}
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  placeholder="Paste your resume sections, technical skills, and work history here..."
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs font-mono focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
                ></textarea>
              </div>
            )}

            {/* Benchmark Against Job */}
            <div className="pt-3 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                  <span>2. Target Job Description (Optional)</span>
                </h3>
                <span className="text-[10px] text-slate-400">Benchmark skill match</span>
              </div>

              <div>
                <select
                  value={selectedJobId}
                  onChange={(e) => handleSelectPreloadedJob(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:border-brand-500 outline-none mb-2"
                >
                  <option value="">-- Choose from active JobConnect vacancies --</option>
                  {availableJobs.map(j => (
                    <option key={j.id} value={j.id}>
                      {j.title} ({j.company_name})
                    </option>
                  ))}
                </select>

                <textarea
                  rows={4}
                  value={targetJobText}
                  onChange={(e) => {
                    setTargetJobText(e.target.value);
                    setSelectedJobId('');
                  }}
                  placeholder="Or paste custom job requirements here to calculate real-time match %..."
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:border-brand-500 outline-none"
                ></textarea>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAnalyze}
              disabled={analyzing}
              className="w-full py-3 rounded-xl text-sm font-bold text-white gradient-primary hover:opacity-95 shadow-md shadow-brand-500/20 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
            >
              {analyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin mr-1" />
                  <span>Scanning & Analyzing Resume...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Run AI Resume Diagnostics</span>
                </>
              )}
            </button>
          </div>

          {/* Right Column: AI Analysis Report */}
          <div className="lg:col-span-5 space-y-5">
            {!analysisResult ? (
              <div className="bg-white rounded-2xl border border-slate-200/90 p-8 text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto border border-teal-100">
                  <Sparkles className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Awaiting Resume Input</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                    Upload or paste your resume and click 'Run AI Diagnostics' to see your comprehensive ATS score and suggestions.
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl text-left border border-slate-200/70 text-xs space-y-1.5 text-slate-600">
                  <div className="font-semibold text-slate-800">What we evaluate:</div>
                  <div className="flex items-center space-x-1.5">
                    <Check className="w-3.5 h-3.5 text-teal-600" />
                    <span>Technical & Soft Skills Extraction</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Check className="w-3.5 h-3.5 text-teal-600" />
                    <span>Quantified Achievement Metrics</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Check className="w-3.5 h-3.5 text-teal-600" />
                    <span>Action Verbs & ATS Readability</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Check className="w-3.5 h-3.5 text-teal-600" />
                    <span>Role-specific Missing Skills Gap</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-5 animate-in fade-in duration-200">
                
                {/* Score Card */}
                <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-400">ATS Quality Score</div>
                      <div className="text-xs text-slate-500">Based on standard screening criteria</div>
                    </div>
                    <div className="text-right">
                      <span className="text-3xl font-black text-brand-600">
                        {analysisResult.overall_score || 0}
                      </span>
                      <span className="text-xs text-slate-400">/100</span>
                    </div>
                  </div>

                  {/* Component Breakdown Bars */}
                  <div className="space-y-2 text-xs">
                    <div>
                      <div className="flex justify-between font-medium text-slate-700 mb-0.5">
                        <span>Section Completeness</span>
                        <span>{analysisResult.section_scores?.completeness || 85}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-teal-500 rounded-full" style={{ width: `${analysisResult.section_scores?.completeness || 85}%` }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between font-medium text-slate-700 mb-0.5">
                        <span>Action Verbs & Impact</span>
                        <span>{analysisResult.section_scores?.impact || 70}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-brand-500 rounded-full" style={{ width: `${analysisResult.section_scores?.impact || 70}%` }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between font-medium text-slate-700 mb-0.5">
                        <span>Quantified Metrics & Achievements</span>
                        <span>{analysisResult.section_scores?.metrics || 60}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500 rounded-full" style={{ width: `${analysisResult.section_scores?.metrics || 60}%` }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between font-medium text-slate-700 mb-0.5">
                        <span>Skills Density</span>
                        <span>{analysisResult.section_scores?.skills_density || 80}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${analysisResult.section_scores?.skills_density || 80}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Target Match Breakdown if job was benchmarked */}
                {matchResult && (
                  <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-6 shadow-md border border-slate-700/80 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-700">
                      <div className="text-xs font-bold text-teal-400 uppercase tracking-wider">
                        Target Role Match Score
                      </div>
                      <span className="text-2xl font-black text-white">
                        {matchResult.match_percentage}%
                      </span>
                    </div>

                    <div>
                      <div className="text-xs font-bold text-teal-400 mb-1 flex items-center">
                        <Check className="w-3.5 h-3.5 mr-1 text-teal-400" />
                        Matching Skills ({matchResult.matching_skills?.length || 0})
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {matchResult.matching_skills?.map(s => (
                          <span key={s} className="px-2 py-0.5 rounded text-[10px] font-semibold bg-teal-950 text-teal-300 border border-teal-800">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs font-bold text-rose-400 mb-1 flex items-center">
                        <AlertCircle className="w-3.5 h-3.5 mr-1 text-rose-400" />
                        Missing Skills ({matchResult.missing_skills?.length || 0})
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {matchResult.missing_skills?.map(s => (
                          <span key={s} className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-950 text-rose-300 border border-rose-800">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Extracted Skills */}
                <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-3">
                  <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Extracted Technical Skills ({analysisResult.extracted_skills?.length || 0})
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
                    {analysisResult.extracted_skills?.map((skill, idx) => (
                      <SkillBadge key={idx} name={skill} size="xs" />
                    ))}
                  </div>
                </div>

                {/* Suggestions List */}
                <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-3">
                  <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Actionable Improvement Suggestions
                  </div>
                  <div className="space-y-2">
                    {analysisResult.suggestions?.map((sugg, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-1">
                        <div className="flex items-center space-x-1.5">
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                            sugg.priority === 'High' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {sugg.priority} Priority
                          </span>
                          <span className="font-semibold text-slate-800">{sugg.category}</span>
                        </div>
                        <p className="text-slate-600 leading-relaxed">{sugg.message}</p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default ResumeAnalyzer;
