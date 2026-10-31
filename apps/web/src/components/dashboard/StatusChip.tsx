import React from 'react';

export type StatusType = 
  | 'paid' 
  | 'delayed' 
  | 'failed' 
  | 'processing' 
  | 'high' 
  | 'medium' 
  | 'low' 
  | 'on_time'
  | 'open';

interface StatusChipProps {
  status: StatusType | string;
  label?: string;
  className?: string;
}

export const StatusChip: React.FC<StatusChipProps> = ({ status, label, className = '' }) => {
  const normalized = status.toLowerCase().replace(/[\s-]/g, '_');

  let style = 'bg-slate-100 text-slate-700 border-slate-200';
  let dotColor = 'bg-slate-400';
  let displayLabel = label || status;

  switch (normalized) {
    case 'paid':
    case 'settled':
    case 'on_time':
      style = 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
      dotColor = 'bg-emerald-500';
      displayLabel = label || 'Paid on time';
      break;

    case 'delayed':
    case 'under_review':
      style = 'bg-amber-50 text-amber-700 border-amber-200/80';
      dotColor = 'bg-amber-500';
      displayLabel = label || 'Delayed';
      break;

    case 'failed':
    case 'rejected':
      style = 'bg-rose-50 text-rose-700 border-rose-200/80';
      dotColor = 'bg-rose-500';
      displayLabel = label || 'Failed';
      break;

    case 'processing':
    case 'auto_fixing':
      style = 'bg-blue-50 text-blue-700 border-blue-200/80';
      dotColor = 'bg-blue-500 animate-pulse';
      displayLabel = label || 'Auto-Fixing';
      break;

    case 'high':
      style = 'bg-rose-500/10 text-rose-600 border-rose-500/20';
      dotColor = 'bg-rose-500';
      displayLabel = label || 'High Priority';
      break;

    case 'medium':
      style = 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      dotColor = 'bg-amber-500';
      displayLabel = label || 'Medium Priority';
      break;

    case 'low':
      style = 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      dotColor = 'bg-blue-500';
      displayLabel = label || 'Low Priority';
      break;

    default:
      style = 'bg-slate-100 text-slate-700 border-slate-200';
      dotColor = 'bg-slate-400';
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${style} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      <span className="capitalize">{displayLabel}</span>
    </span>
  );
};
