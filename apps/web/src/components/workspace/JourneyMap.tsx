import React, { useState } from 'react';
import { 
  Network, 
  Store, 
  Sparkles, 
  Building2, 
  Landmark, 
  Radio, 
  Play, 
  Pause, 
  Volume2,
  Check,
  ChevronDown,
  MessageSquare,
  ArrowDown
} from 'lucide-react';

export interface JourneyMapProps {
  merchantName: string;
  merchantPhoneMasked: string;
  bankName: string;
  accountLast4: string;
  openedTime: string;
  merchantNote: string;
  merchantNoteEn?: string;
  currentStepIndex?: number;
  isApproved?: boolean;
  onOpenFullChat?: () => void;
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
  isApproved = false,
  onOpenFullChat,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  return (
    <div className="bg-white rounded-[24px] border border-slate-200/90 p-4 sm:p-5 shadow-sm flex flex-col justify-between h-full thin-scroll">
      
      {/* ─── CARD HEADER ─── */}
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
            <Network className="w-3.5 h-3.5 stroke-[2.2]" />
          </div>
          <div>
            <h3 className="font-['Outfit',sans-serif] font-bold text-sm sm:text-base text-slate-900 leading-tight">
              Settlement Journey
            </h3>
            <span className="text-[10px] text-slate-400">End-to-End Clearing Trace</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold">
          <span className={`w-1.5 h-1.5 rounded-full ${isApproved ? 'bg-emerald-500' : 'bg-blue-600 animate-pulse'}`} />
          <span>{isApproved ? 'Disbursed • IMPS' : 'Live • IMPS / UPI'}</span>
        </div>
      </div>

      {/* ─── VERTICAL JOURNEY DIAGRAM (CLEAN, HIGH-CONTRAST, CALM NEUTRALS) ─── */}
      <div className="my-2.5 py-0.5 space-y-0 relative shrink-0">
        
        {/* Continuous Clean Vertical Route Line */}
        <div className="absolute left-[13px] top-4 bottom-4 w-0.5 bg-slate-200" />

        {/* Station 1: Merchant Store */}
        <div className="flex items-start gap-3 relative pb-3">
          <div className="w-7 h-7 rounded-full bg-[#12141A] text-white flex items-center justify-center shrink-0 z-10 shadow-2xs ring-4 ring-white">
            <Store className="w-3.5 h-3.5" />
          </div>
          <div className="flex-1 bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">{merchantName}</span>
              <span className="text-[10px] font-mono text-slate-400">08:15 AM</span>
            </div>
            <p className="text-[11px] text-slate-600 mt-0.5">
              Settlement initiated via Paytm Soundbox QR • T+0 Cycle
            </p>
            <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-mono font-medium">
              ₹4,735.54 • Hold Flagged
            </div>
          </div>
        </div>

        {/* Station 2: Sulajh AI Autonomous Engine */}
        <div className="flex items-start gap-3 relative pb-3">
          <div className="w-7 h-7 rounded-full bg-[#12141A] text-white flex items-center justify-center shrink-0 z-10 shadow-2xs ring-4 ring-white">
            <Sparkles className="w-3.5 h-3.5 text-violet-300" />
          </div>
          <div className="flex-1 bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-900">Sulajh AI Engine</span>
                <span className="px-1.5 py-0.2 rounded bg-violet-50 text-[#6D5BD0] border border-violet-100 font-semibold text-[9px]">
                  99.4% AI Match
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">10:45 AM</span>
            </div>
            <p className="text-[11px] text-slate-600 mt-0.5">
              Root cause: HDFC Branch merger. IFSC auto-remapped to <strong className="text-slate-900 font-semibold">HDFC0000482</strong>.
            </p>
            <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-mono font-medium">
              Rule: RBI/2026/04-IFSC-AUTO
            </div>
          </div>
        </div>

        {/* Station 3: Paytm Core Settlement Engine */}
        <div className="flex items-start gap-3 relative pb-3">
          <div className="w-7 h-7 rounded-full bg-[#12141A] text-white flex items-center justify-center shrink-0 z-10 shadow-2xs ring-4 ring-white">
            <Building2 className="w-3.5 h-3.5" />
          </div>
          <div className="flex-1 bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">Paytm Settlement Gateway</span>
              <span className="text-[10px] font-mono text-slate-400">10:46 AM</span>
            </div>
            <p className="text-[11px] text-slate-600 mt-0.5">
              Ledger verified: Gross ₹4,850 - MDR ₹97 - GST ₹17.46 = <strong className="text-slate-900 font-semibold">Net ₹4,735.54</strong>
            </p>
            <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-mono font-medium">
              IMPS Rails Staged • Ping 1.2s
            </div>
          </div>
        </div>

        {/* Station 4: Target Beneficiary Bank */}
        <div className="flex items-start gap-3 relative">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 shadow-2xs ring-4 ${
            isApproved
              ? 'bg-emerald-600 text-white ring-emerald-50'
              : 'bg-[#2F6BEA] text-white ring-blue-50'
          }`}>
            {isApproved ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Landmark className="w-3.5 h-3.5" />}
          </div>
          <div className="flex-1 bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">{bankName}</span>
              <span className="text-[10px] font-mono text-slate-400">{isApproved ? 'Just now' : 'Pending L1'}</span>
            </div>
            <p className="text-[11px] text-slate-600 mt-0.5">
              Account ending in <strong className="text-slate-900 font-semibold">•••• {accountLast4}</strong> (IFSC: HDFC0000482)
            </p>
            <div className="mt-1.5 inline-flex items-center gap-1">
              {isApproved ? (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-[10px] font-semibold">
                  ✓ Disbursed via IMPS (UTR #8841290)
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200/80 text-[10px] font-semibold">
                  Awaiting 1-Click L1 Release
                </span>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* ─── BOTTOM METADATA & VOICE TRANSCRIPT ─── */}
      <div className="space-y-2.5 pt-2.5 border-t border-slate-100 shrink-0">
        
        {/* Raised by & Handled by in 2 columns */}
        <div className="grid grid-cols-2 gap-2.5 text-xs">
          <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
            <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider block">Raised by</span>
            <p className="font-bold text-slate-900 truncate mt-0.5">{merchantName}</p>
            <p className="text-[10px] font-mono text-slate-500">{merchantPhoneMasked}</p>
          </div>

          <div className="bg-violet-50 p-2 rounded-xl border border-violet-100">
            <span className="text-[9px] text-violet-400 font-semibold uppercase tracking-wider block">Handled by</span>
            <p className="font-bold text-[#6D5BD0] truncate mt-0.5">Sulajh AI Engine</p>
            <p className="text-[10px] text-violet-600 font-medium">Auto-pre-screened</p>
          </div>
        </div>

        {/* Merchant Voice Note Audio Card */}
        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-xs font-bold text-slate-700">
              <Volume2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Merchant Voice Note</span>
            </div>
            <button
              type="button"
              onClick={() => setIsPlayingAudio(!isPlayingAudio)}
              className="px-2 py-0.5 rounded-full bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-[10px] font-bold flex items-center gap-1 transition cursor-pointer shadow-2xs"
            >
              {isPlayingAudio ? (
                <>
                  <Pause className="w-2.5 h-2.5 text-[#F2531D]" />
                  <span>0:08 / 0:14</span>
                </>
              ) : (
                <>
                  <Play className="w-2.5 h-2.5 fill-slate-700 text-slate-700" />
                  <span>Play (0:14)</span>
                </>
              )}
            </button>
          </div>

          <p className="text-xs font-medium text-slate-800 italic leading-relaxed">
            "{merchantNote}"
          </p>

          {merchantNoteEn && (
            <p className="text-[10px] text-slate-500 leading-normal border-t border-slate-200/60 pt-0.5">
              <strong>Translation:</strong> {merchantNoteEn}
            </p>
          )}
        </div>

        {/* Open Full Merchant Conversation Button */}
        {onOpenFullChat && (
          <button
            type="button"
            onClick={onOpenFullChat}
            className="w-full py-1.5 rounded-xl bg-violet-100/70 hover:bg-violet-100 border border-violet-200 text-[#6D5BD0] font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-2xs"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Open Full Merchant Conversation (6 messages) →</span>
          </button>
        )}

      </div>

    </div>
  );
};
