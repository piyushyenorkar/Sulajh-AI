import React from 'react';

export interface MeterProps {
  label: string;
  value: string;
  percent?: number; // 0 to 100
  pct?: number; // alias for percent
  variant?: 'blue' | 'orange' | 'green' | 'red' | 'violet';
  leftCaption?: string;
  rightCaption?: string;
  isOverLimit?: boolean;
  widthClass?: string;
}

export const Meter: React.FC<MeterProps> = ({
  label,
  value,
  percent,
  pct,
  variant = 'blue',
  leftCaption,
  rightCaption,
  isOverLimit = false,
  widthClass = 'min-w-[210px] sm:min-w-[240px]',
}) => {
  const actualPercent = percent ?? pct ?? 0;
  const clampedPercent = Math.min(Math.max(actualPercent, 0), 100);

  // Gradient selection matching the EquipFlow reference
  let gradientClass = 'bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-400';
  if (isOverLimit || variant === 'red') {
    gradientClass = 'bg-gradient-to-r from-rose-600 to-red-500';
  } else if (variant === 'orange') {
    gradientClass = 'bg-gradient-to-r from-[#F2531D] via-amber-500 to-orange-400';
  } else if (variant === 'green') {
    gradientClass = 'bg-gradient-to-r from-emerald-600 to-teal-400';
  } else if (variant === 'violet') {
    gradientClass = 'bg-gradient-to-r from-[#6D5BD0] to-indigo-400';
  }

  return (
    <div className={`flex flex-col gap-1.5 ${widthClass}`}>
      {/* Top Header: Label & Display Value */}
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-xs font-semibold text-slate-500 tracking-tight">
          {label}
        </span>
        <span className="font-['Sora',sans-serif] font-light text-xl sm:text-2xl text-slate-900 tracking-tight tabular-nums">
          {value}
        </span>
      </div>

      {/* Signature EquipFlow Meter Bar */}
      <div className="relative w-full h-[18px] rounded-full overflow-hidden bg-hatched border border-slate-200/90 shadow-inner flex items-center">
        {/* Filled Gradient Bar */}
        <div
          className={`h-full ${gradientClass} transition-all duration-500 ease-out`}
          style={{ width: `${clampedPercent}%` }}
        />

        {/* Small Black Marker at the threshold position */}
        {clampedPercent > 0 && clampedPercent < 100 && (
          <div
            className="absolute top-0 bottom-0 w-1.5 bg-slate-950 rounded-full shadow-md -ml-0.5 pointer-events-none"
            style={{ left: `${clampedPercent}%` }}
          />
        )}
      </div>

      {/* Bottom Captions */}
      {(leftCaption || rightCaption) && (
        <div className="flex items-center justify-between text-[11px] font-medium text-slate-400 tracking-tight">
          <span>{leftCaption}</span>
          <span className="text-right">{rightCaption}</span>
        </div>
      )}
    </div>
  );
};

