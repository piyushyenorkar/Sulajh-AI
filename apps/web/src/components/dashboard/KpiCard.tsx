import React from 'react';
import { MoneyAmount } from './MoneyAmount';

interface KpiCardProps {
  title: string;
  amount: number;
  badge?: {
    text: string;
    type?: 'black-pill' | 'subtle';
  };
  note?: string;
  icon?: React.ReactNode;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  amount,
  badge,
  note,
  icon,
}) => {
  return (
    <div className="bg-white border border-slate-200/90 rounded-[24px] p-5.5 flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md group">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="text-xs font-semibold text-slate-500 tracking-normal">
          {title}
        </span>
        {icon && (
          <div className="w-7 h-7 rounded-full bg-slate-50 text-slate-500 flex items-center justify-center text-xs group-hover:text-blue-600 transition-colors">
            {icon}
          </div>
        )}
      </div>

      {/* Main Metric Value */}
      <div className="flex items-baseline gap-2.5 my-1">
        <MoneyAmount amount={amount} className="text-2xl sm:text-[28px] font-extrabold text-slate-950 tracking-tight" />
        
        {badge && badge.type === 'black-pill' && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-950 text-white text-[10px] font-bold tracking-tight">
            {badge.text}
          </span>
        )}

        {badge && badge.type === 'subtle' && (
          <span className="text-xs font-medium text-slate-500">
            {badge.text}
          </span>
        )}
      </div>

      {/* Bottom Muted Note */}
      {note && (
        <p className="text-[11px] text-slate-400 mt-2 font-medium capitalize truncate">
          {note}
        </p>
      )}
    </div>
  );
};
