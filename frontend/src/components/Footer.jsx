import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Sparkles, Heart, Shield, Code, Globe, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-white shadow-lg shadow-teal-500/20">
                <Briefcase className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-xl tracking-tight text-white">
                  Job<span className="text-teal-400">Connect</span>
                </span>
                <span className="text-[11px] text-slate-400">AI-Powered Recruitment Portal</span>
              </div>
            </Link>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Next-generation hiring platform connecting talented professionals with top tech companies through transparent AI skill matching and intelligent resume diagnostics.
            </p>
            <div className="flex items-center space-x-4 pt-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-teal-950/80 text-teal-300 border border-teal-800/80">
                <Sparkles className="w-3.5 h-3.5 mr-1 text-teal-400" />
                Rule-based & AI Matching
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-brand-950/80 text-brand-300 border border-brand-800/80">
                <Shield className="w-3.5 h-3.5 mr-1 text-brand-400" />
                Verified Companies
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-4">For Candidates</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/jobs" className="hover:text-white transition-colors">Browse Vacancies</Link></li>
              <li><Link to="/resume-analyzer" className="hover:text-white transition-colors">AI Resume Scanner</Link></li>
              <li><Link to="/candidate/dashboard" className="hover:text-white transition-colors">Candidate Portal</Link></li>
              <li><Link to="/candidate/applications" className="hover:text-white transition-colors">Track Applications</Link></li>
              <li><Link to="/companies" className="hover:text-white transition-colors">Top Companies</Link></li>
            </ul>
          </div>

          {/* Recruiters */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-4">For Recruiters</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/recruiter/jobs/new" className="hover:text-white transition-colors">Post a Job</Link></li>
              <li><Link to="/recruiter/dashboard" className="hover:text-white transition-colors">Recruiter Analytics</Link></li>
              <li><Link to="/recruiter/jobs" className="hover:text-white transition-colors">Manage Vacancies</Link></li>
              <li><Link to="/recruiter/company" className="hover:text-white transition-colors">Company Profile</Link></li>
            </ul>
          </div>

          {/* System & Tech Stack */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Architecture</h3>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
                <span>React.js & Tailwind CSS</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-400"></span>
                <span>Python Flask REST Backend</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                <span>SQLAlchemy & SQLite DB</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>Resume NLP & PyPDF Parser</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                <span>Interactive Recharts</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} JobConnect Inc. All rights reserved. Built for College Project & Portfolio Demonstration.</p>
          <div className="flex items-center space-x-4 mt-4 sm:mt-0">
            <span className="flex items-center text-slate-400">
              Crafted with <Heart className="w-3.5 h-3.5 mx-1 text-red-500 fill-red-500" /> & AI Intelligence
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
