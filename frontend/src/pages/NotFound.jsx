import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-[75vh] flex items-center justify-center bg-slate-50 px-4 text-center">
      <div className="max-w-md space-y-4">
        <div className="w-16 h-16 rounded-2xl gradient-primary text-white flex items-center justify-center font-bold text-2xl mx-auto shadow-lg shadow-brand-500/20">
          <Briefcase className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">404</h1>
        <h2 className="text-lg font-bold text-slate-800">Page Not Found</h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          The page or resource you are looking for doesn't exist or has been relocated.
        </p>
        <Link
          to="/"
          className="inline-flex items-center space-x-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-white gradient-primary hover:opacity-95 shadow-md transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return Home</span>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
