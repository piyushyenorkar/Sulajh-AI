import React from 'react';
import { Network, Store, Sparkles, Building2, Landmark, Radio } from 'lucide-react';

export interface JourneyMapProps {
  merchantName: string;
  merchantPhoneMasked: string;
  bankName: string;
  accountLast4: string;
  openedTime: string;
  merchantNote: string;
  merchantNoteEn?: string;
  currentStepIndex?: number; // 0: Merchant, 1: AI, 2: Paytm Engine, 3: Bank
}

export const JourneyMap: React.FC<JourneyMapProps> = ({
  merchantName,
  merchantPhoneMasked,
  bankName,
  accountLast4,
  openedTime,
  merchantNote,
  merchantNoteEn,
  currentStepIndex = 2,
}) => {
  return (
    <div className="bg-white rounded-[24px] border border-slate-200/90 p-5 sm:p-6 shadow-sm flex flex-col justify-between h-full">
      
      {/* ─── CARD HEADER ─── */}
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
            <Network className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <h3 className="font-['Outfit',sans-serif] font-bold text-base text-slate-900 leading-tight">
              Settlement Journey
            </h3>
            <span className="text-[11px] text-slate-400">End-to-End Clearing Trace</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
          <span>Live • IMPS / UPI</span>
        </div>
      </div>

      {/* ─── VISUAL ROUTE CANVAS (REPLACING WESTFIELD ROUTE MAP) ─── */}
      <div className="relative w-full h-[220px] rounded-2xl bg-[#F8FAFC] border border-slate-200/80 p-4 overflow-hidden flex flex-col justify-between">
        
        {/* Subtle dot matrix grid */}
        <div 
          className="absolute inset-0 opacity-40 pointer-events-none" 
          style={{ backgroundImage: 'radial-gradient(#CBD5E1 1px, transparent 1px)', backgroundSize: '16px 16px' }} 
        />

        {/* SVG Flow Curve */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <path
            d="M 60 170 C 130 170, 150 70, 240 70 C 310 70, 330 150, 420 150"
            fill="none"
            stroke="#2F6BEA"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <path
            d="M 420 150 C 460 150, 480 80, 520 80"
            fill="none"
            stroke="#94A3B8"
            strokeWidth="2.5"
            strokeDasharray="4 4"
            strokeLinecap="round"
          />
        </svg>

        {/* Node 1: Merchant Store (Bottom Left) */}
        <div className="absolute left-6 bottom-5 flex flex-col items-center">
          <div className="w-10 h-10 rounded-full bg-slate-950 text-white flex items-center justify-center shadow-md">
            <Store className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-bold text-slate-800 mt-1">Merchant</span>
          <span className="text-[10px] text-slate-400">{merchantName.split(' ')[0]}</span>
        </div>

        {/* Node 2: Sulajh AI (Top Middle-Left) */}
        <div className="absolute left-[38%] top-5 flex flex-col items-center -translate-x-1/2">
          <div className="w-10 h-10 rounded-full bg-violet-600 text-white flex items-center justify-center shadow-md ring-4 ring-violet-100">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-bold text-violet-700 mt-1">Sulajh AI</span>
          <span className="text-[10px] text-violet-500">Auto-Diagnosed</span>
        </div>

        {/* Node 3: Paytm Settlement Engine (Active Pulsing Node) */}
        <div className="absolute left-[70%] bottom-8 flex flex-col items-center -translate-x-1/2">
          <div className="relative">
            <div className="w-11 h-11 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg ring-4 ring-blue-100">
              <Building2 className="w-5 h-5" />
            </div>
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-white animate-ping" />
          </div>
          <span className="text-[11px] font-bold text-blue-700 mt-1">Paytm Engine</span>
          <span className="text-[10px] text-blue-500">Needs L1 Action</span>
        </div>

        {/* Node 4: Target Bank (Top Right) */}
        <div className="absolute right-5 top-7 flex flex-col items-center">
          <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center border border-slate-300">
            <Landmark className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-bold text-slate-700 mt-1">{bankName.split(' ')[0]}</span>
          <span className="text-[10px] text-slate-400">•••• {accountLast4}</span>
        </div>

        {/* Subtle Map Controls on bottom right */}
        <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur rounded-lg border border-slate-200/80 px-2 py-1 flex items-center gap-1.5 text-[10px] text-slate-500 shadow-2xs">
          <Radio className="w-3 h-3 text-emerald-500" />
          <span>Live IMPS Gateway</span>
        </div>

      </div>

      {/* ─── BOTTOM FACTS (MIRRORS DRIVER, RECEIVER, DISPATCHED, NOTES) ─── */}
      <div className="grid grid-cols-2 gap-4 mt-5 pt-4 border-t border-slate-100 text-xs">
        
        {/* Fact 1: Raised by */}
        <div>
          <span className="text-slate-400 font-medium block mb-1">Raised by:</span>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-slate-100 font-bold text-[10px] text-slate-700 flex items-center justify-center">
              RK
            </div>
            <div>
              <p className="font-bold text-slate-900 leading-tight">{merchantName}</p>
              <p className="text-[11px] text-slate-400">{merchantPhoneMasked}</p>
            </div>
          </div>
        </div>

        {/* Fact 2: Handled by */}
        <div>
          <span className="text-slate-400 font-medium block mb-1">Handled by:</span>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="font-bold text-[#6D5BD0] leading-tight">Sulajh AI Teammate</p>
              <p className="text-[11px] text-slate-400">Pre-screened & verified</p>
            </div>
          </div>
        </div>

        {/* Fact 3: Dispatched / Opened */}
        <div>
          <span className="text-slate-400 font-medium block mb-1">Opened at:</span>
          <p className="font-bold text-slate-900">{openedTime} Today</p>
          <p className="text-[11px] text-slate-400">Channel: Soundbox & App</p>
        </div>

        {/* Fact 4: Transport Notes / Merchant Note */}
        <div>
          <span className="text-slate-400 font-medium block mb-1">Merchant voice note:</span>
          <p className="font-medium text-slate-700 italic text-[11px] leading-relaxed">
            "{merchantNote}"
          </p>
          {merchantNoteEn && (
            <p className="text-[10px] text-slate-400 mt-0.5">
              En: {merchantNoteEn}
            </p>
          )}
        </div>

      </div>

    </div>
  );
};

