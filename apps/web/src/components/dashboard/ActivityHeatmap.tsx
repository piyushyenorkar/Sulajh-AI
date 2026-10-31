import React, { useState } from 'react';
import { generateHeatmapData, HeatmapDay } from '../../data/merchantDashboardData';

export const ActivityHeatmap: React.FC = () => {
  const [data] = useState<HeatmapDay[]>(() => generateHeatmapData());
  const [hoveredDay, setHoveredDay] = useState<HeatmapDay | null>(null);

  // Group into 12 columns (weeks 0 to 11), each column has 7 days (Sun=0 to Sat=6)
  const weeks: HeatmapDay[][] = [];
  for (let w = 0; w < 12; w++) {
    const weekDays = data.filter((d) => d.weekIndex === w);
    weeks.push(weekDays);
  }

  const totalPaid = data.filter((d) => d.status === 'paid').length;

  return (
    <div className="bg-white border border-slate-200/90 rounded-[24px] p-5.5 flex flex-col justify-between h-full relative group">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-slate-500">
          Payout activity
        </span>
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-950 text-white text-[10px] font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>On time</span>
        </span>
      </div>

      {/* Metric */}
      <div className="mb-4">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-[28px] font-black text-slate-950 tracking-tight">
            {totalPaid}
          </span>
          <span className="text-xs font-semibold text-slate-400">
            payouts
          </span>
        </div>
      </div>

      {/* Heatmap Grid (7 rows x 12 cols) */}
      <div className="relative my-auto">
        <div className="flex gap-1.5 justify-between">
          {weeks.map((week, wIdx) => (
            <div key={wIdx} className="flex flex-col gap-1.5">
              {week.map((day) => {
                let cellColor = 'bg-slate-100 hover:bg-slate-200'; // none
                if (day.status === 'paid') cellColor = 'bg-[#3B82F6] hover:bg-blue-600 shadow-2xs';
                if (day.status === 'delayed' || day.status === 'failed') cellColor = 'bg-[#0B0B0F] hover:bg-slate-800 ring-1 ring-rose-400/50 shadow-xs';

                return (
                  <div
                    key={day.date}
                    onMouseEnter={() => setHoveredDay(day)}
                    onMouseLeave={() => setHoveredDay(null)}
                    className={`w-3.5 sm:w-4 h-3.5 sm:h-4 rounded-md transition-all duration-150 cursor-pointer ${cellColor}`}
                  />
                );
              })}
            </div>
          ))}
        </div>

        {/* Floating Tooltip */}
        {hoveredDay && (
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-950 text-white text-[11px] font-medium px-3 py-1.5 rounded-xl shadow-xl pointer-events-none whitespace-nowrap z-20 flex items-center gap-1.5 animate-fade-in">
            <span className={`w-2 h-2 rounded-full ${hoveredDay.status === 'paid' ? 'bg-[#3B82F6]' : hoveredDay.status === 'none' ? 'bg-slate-400' : 'bg-rose-500'}`} />
            <span>{hoveredDay.date}:</span>
            <span className="font-bold">
              {hoveredDay.status === 'none' ? 'No Settlement (Weekend)' : hoveredDay.status === 'paid' ? `₹${(hoveredDay.amount || 0).toLocaleString('en-IN')} (Paid)` : `₹${(hoveredDay.amount || 0).toLocaleString('en-IN')} (${hoveredDay.status})`}
            </span>
          </div>
        )}
      </div>

      {/* Month Labels Below */}
      <div className="flex justify-between items-center text-[10px] font-semibold text-slate-400 mt-4 pt-2 border-t border-slate-100 uppercase tracking-wider select-none">
        <span>Aug</span>
        <span>Sep</span>
        <span>Oct</span>
      </div>
    </div>
  );
};

