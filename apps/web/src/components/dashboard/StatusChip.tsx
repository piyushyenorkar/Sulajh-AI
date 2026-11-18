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

  let style = 'bg-slate-200/80 text-slate-800';
  let dotColor = 'bg-slate-500';
  let displayLabel = label || status;

  switch (normalized) {
    case 'paid':
    case 'settled':
    case 'on_time':
      style = 'bg-emerald-100/90 text-emerald-800';
      dotColor = 'bg-emerald-600';
      displayLabel = label || 'Paid on time';
      break;

    case 'delayed':
    case 'under_review':
      style = 'bg-amber-100/90 text-amber-900';
      dotColor = 'bg-amber-600';
      displayLabel = label || 'Delayed';
      break;

    case 'failed':
    case 'rejected':
      style = 'bg-rose-100/90 text-rose-800';
      dotColor = 'bg-rose-600';
      displayLabel = label || 'Failed';
      break;

    case 'processing':
    case 'auto_fixing':
      style = 'bg-blue-100/90 text-blue-900';
      dotColor = 'bg-blue-600 animate-pulse';
      displayLabel = label || 'Auto-Fixing';
      break;

    case 'high':
      style = 'bg-rose-100 text-rose-800';
      dotColor = 'bg-rose-600';
      displayLabel = label || 'High Priority';
      break;

    case 'medium':
      style = 'bg-amber-100 text-amber-900';
      dotColor = 'bg-amber-600';
      displayLabel = label || 'Medium Priority';
      break;

    case 'low':
      style = 'bg-blue-100 text-blue-800';
      dotColor = 'bg-blue-600';
      displayLabel = label || 'Low Priority';
      break;

    default:
      style = 'bg-slate-200/80 text-slate-800';
      dotColor = 'bg-slate-500';
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${style} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      <span className="capitalize">{displayLabel}</span>
    </span>
  );
};

