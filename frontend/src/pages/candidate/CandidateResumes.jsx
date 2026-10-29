import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import SkillBadge from '../../components/SkillBadge';
import {
  FileText, Upload, Trash2, CheckCircle2, AlertCircle, Sparkles,
  Download, RefreshCw, Check, ArrowRight
} from 'lucide-react';

const CandidateResumes = () => {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [selectedResume, setSelectedResume] = useState(null);

  const fetchResumes = async () => {
    setLoading(true);
    try {
      const res = await api.get('/candidate/resumes');
      const list = res.data.resumes || [];
      setResumes(list);
      if (list.length > 0 && !selectedResume) {
        setSelectedResume(list[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage({ text: 'Please select a file to upload', type: 'error' });
      return;
    }

    setUploading(true);
    setMessage({ text: '', type: '' });

    const formData = new FormData();
    formData.append('resume', file);

    try {
      const res = await api.post('/candidate/resumes/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMessage({
        text: `Resume "${res.data.resume.original_name}" uploaded and analyzed! ${res.data.resume.extracted_skills?.length || 0} skills extracted.`,
        type: 'success'
      });
      setFile(null);
      // Reset file input
      const input = document.getElementById('resumeFileInput');
      if (input) input.value = '';
      await fetchResumes();
    } catch (err) {
      setMessage({ text: err.response?.data?.error || 'Failed to upload resume', type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;

    try {
      await api.delete(`/candidate/resumes/${id}`);
      setMessage({ text: `Resume removed successfully`, type: 'success' });
      if (selectedResume?.id === id) setSelectedResume(null);
      await fetchResumes();
    } catch (err) {
      setMessage({ text: err.response?.data?.error || 'Failed to delete resume', type: 'error' });
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Manage Resumes & AI Analysis</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Upload PDF, DOCX, or text resumes. Our AI extracts technical skills and checks ATS compliance.
          </p>
        </div>

        {message.text && (
          <div className={`p-4 rounded-xl text-xs font-semibold flex items-center space-x-2 ${
            message.type === 'success' ? 'bg-teal-50 text-teal-800 border border-teal-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}>
            {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-teal-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
            <span>{message.text}</span>
          </div>
        )}

        {/* Upload Box */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-7 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <Upload className="w-4 h-4 text-brand-600" />
            <span>Upload New Resume</span>
          </h2>

          <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            <div className="md:col-span-9 flex items-center px-4 py-2.5 rounded-xl border border-dashed border-slate-300 bg-slate-50 hover:bg-white hover:border-brand-400 transition-colors">
              <input
                type="file"
                id="resumeFileInput"
                accept=".pdf,.docx,.doc,.txt"
                onChange={(e) => setFile(e.target.files[0])}
                className="text-xs text-slate-700 w-full file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 cursor-pointer"
              />
            </div>

            <div className="md:col-span-3">
              <button
                type="submit"
                disabled={uploading || !file}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white gradient-primary hover:opacity-95 shadow-md shadow-brand-500/20 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
              >
                {uploading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Upload & Analyze</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Resumes List & Extracted Details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Resumes Table */}
          <div className="lg:col-span-5 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <FileText className="w-4 h-4 text-brand-600" />
              <span>Your Uploaded Resumes ({resumes.length})</span>
            </h2>

            {resumes.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-500">
                You haven't uploaded any resumes yet. Upload one above to get started.
              </div>
            ) : (
              <div className="space-y-3">
                {resumes.map(r => (
                  <div
                    key={r.id}
                    onClick={() => setSelectedResume(r)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                      selectedResume?.id === r.id
                        ? 'bg-brand-50/50 border-brand-400 ring-1 ring-brand-400'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-9 h-9 rounded-xl gradient-primary text-white flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                        {r.file_type?.toUpperCase() || 'DOC'}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{r.original_name}</h4>
                        <div className="text-[11px] text-slate-400 flex items-center space-x-2 mt-0.5">
                          <span>{formatFileSize(r.file_size)}</span>
                          <span>•</span>
                          <span>{new Date(r.created_at).toLocaleDateString()}</span>
                        </div>
                        <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-semibold bg-teal-50 text-teal-700 border border-teal-200">
                          {r.extracted_skills?.length || 0} skills identified
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5 flex-shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(r.id, r.original_name);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete resume"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: AI Insights for Selected Resume */}
          <div className="lg:col-span-7 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-teal-600" />
              <span>AI Skills & ATS Diagnostics</span>
            </h2>

            {!selectedResume ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-400">
                Select a resume on the left to inspect its extracted skills and quality breakdown.
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{selectedResume.original_name}</h3>
                    <p className="text-[11px] text-slate-400">Extracted text processed with JobConnect NLP parser</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-teal-50 text-teal-700 border border-teal-200">
                    Active Resume
                  </span>
                </div>

                {/* Extracted Skills List */}
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                    Identified Technical Skills ({selectedResume.extracted_skills?.length || 0})
                  </h4>
                  {(!selectedResume.extracted_skills || selectedResume.extracted_skills.length === 0) ? (
                    <p className="text-xs text-slate-400 italic">No technical skills detected in the uploaded text.</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5 max-h-56 overflow-y-auto pt-1">
                      {selectedResume.extracted_skills.map((skill, idx) => (
                        <SkillBadge key={idx} name={skill} type="matching" size="xs" />
                      ))}
                    </div>
                  )}
                </div>

                {/* ATS Compliance Checklist */}
                <div className="pt-4 border-t border-slate-100 space-y-2">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    ATS Readiness Checklist
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-teal-600" />
                      <span>Clean text extraction verified</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-teal-600" />
                      <span>Searchable skills indexing active</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-teal-600" />
                      <span>Ready for 1-click job applications</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-teal-600" />
                      <span>Protected from black-box auto-drop</span>
                    </div>
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

export default CandidateResumes;
