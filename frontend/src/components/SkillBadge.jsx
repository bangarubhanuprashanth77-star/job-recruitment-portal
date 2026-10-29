import React from 'react';
import { Check, X, Tag } from 'lucide-react';

const SkillBadge = ({ name, type = 'neutral', size = 'sm' }) => {
  const sizeClasses = {
    xs: 'px-2 py-0.5 text-[10px]',
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
  };

  if (type === 'matching') {
    return (
      <span className={`inline-flex items-center rounded-lg font-medium bg-teal-50 text-teal-700 border border-teal-200/80 ${sizeClasses[size]}`}>
        <Check className="w-3 h-3 mr-1 text-teal-600 stroke-[2.5]" />
        {name}
      </span>
    );
  }

  if (type === 'missing') {
    return (
      <span className={`inline-flex items-center rounded-lg font-medium bg-rose-50 text-rose-700 border border-rose-200/80 ${sizeClasses[size]}`}>
        <X className="w-3 h-3 mr-1 text-rose-500 stroke-[2.5]" />
        {name}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center rounded-lg font-medium bg-slate-100 text-slate-700 border border-slate-200/70 hover:bg-slate-200/70 transition-colors ${sizeClasses[size]}`}>
      {name}
    </span>
  );
};

export default SkillBadge;
