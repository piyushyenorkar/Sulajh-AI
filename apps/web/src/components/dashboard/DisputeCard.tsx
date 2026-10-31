import React, { useState } from 'react';
import { DisputeItem, OPEN_DISPUTES } from '../../data/merchantDashboardData';
import { StatusChip } from './StatusChip';
import { MoneyAmount } from './MoneyAmount';
import { ChevronLeft, ChevronRight, Upload, ShieldAlert } from 'lucide-react';

interface DisputeCardProps {
  onUploadProof?: (dispute: DisputeItem) => void;
  onViewAll?: () => void;
}

export const DisputeCard: React.FC<DisputeCardProps> = ({ onUploadProof, onViewAll }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const disputes = OPEN_DISPUTES;

  const current = disputes[currentIndex];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % disputes.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + disputes.length) % disputes.length);
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-[24px] p-5.5 flex flex-col justify-between h-full group">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">
            Open disputes
          </span>
          <span className="w-5 h-5 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center text-[10px] font-bold">
            {disputes.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onViewAll}
            className="text-xs font-semibold text-slate-400 hover:text-slate-700 transition cursor-pointer"
          >
            View all
          </button>
          
          {/* Prev / Next buttons */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handlePrev}
              className="w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition cursor-pointer"
              title="Previous dispute"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition cursor-pointer"
              title="Next dispute"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Dark Dispute Card (Styled like the reference screenshot's Trending Card) */}
      <div className="bg-[#121318] border border-white/5 rounded-[20px] p-4.5 text-white flex flex-col justify-between relative overflow-hidden my-auto shadow-md">
        
        {/* Glow */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-rose-500/10 rounded-full blur-[40px] pointer-events-none" />

        {/* Dispute Top Bar */}
        <div className="flex items-start justify-between gap-2 mb-2 relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-rose-400 shrink-0">
              <ShieldAlert className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <span className="font-bold text-xs text-white block tracking-tight font-mono">
                {current.disputeId}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                {current.customerName}
              </span>
            </div>
          </div>

          <StatusChip status={current.priority} />
        </div>

        {/* Amount & Due Date Countdown */}
        <div className="my-2 relative z-10">
          <MoneyAmount
            amount={current.amount}
            className="text-2xl font-black text-white tracking-tight"
          />
          <div className="flex items-center gap-1.5 text-[11px] text-amber-400 font-semibold mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
            <span>SLA: {current.dueDate}</span>
          </div>
        </div>

        {/* Mini Evidence Progress Line */}
        <div className="my-2 relative z-10">
          <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
            <span>Evidence on file</span>
            <span className="font-mono">{current.evidenceUploaded} of {current.evidenceRequired} docs</span>
          </div>
          <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                current.evidenceUploaded >= current.evidenceRequired ? 'bg-emerald-400' : 'bg-amber-400'
              }`}
              style={{ width: `${(current.evidenceUploaded / current.evidenceRequired) * 100}%` }}
            />
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between relative z-10">
          <span className="text-[10px] text-slate-400">
            {currentIndex + 1} of {disputes.length}
          </span>
          <button
            type="button"
            onClick={() => onUploadProof && onUploadProof(current)}
            className="px-3 py-1 rounded-full bg-white hover:bg-slate-100 text-slate-950 font-bold text-xs transition cursor-pointer flex items-center gap-1 shadow-sm active:scale-95"
          >
            <Upload className="w-3 h-3 text-slate-950" />
            <span>Upload proof</span>
          </button>
        </div>
      </div>
    </div>
  );
};

