import React, { useState } from 'react';
import { 
  Check, 
  Sparkles, 
  ArrowUpRight, 
  Send, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck, 
  FileText,
  Clock
} from 'lucide-react';

export interface CaseTimelineProps {
  amount: number;
  grossAmount?: number;
  commission?: number;
  gst?: number;
  accountLast4?: string;
  isApproved?: boolean;
  onSendReply?: (text: string) => void;
}

export const CaseTimeline: React.FC<CaseTimelineProps> = ({
  amount = 4735.54,
  grossAmount = 4850.00,
  commission = 97.00,
  gst = 17.46,
  accountLast4 = '4821',
  isApproved = false,
  onSendReply,
}) => {
  const [showAiDetails, setShowAiDetails] = useState(false);
  const [selectedReplyIndex, setSelectedReplyIndex] = useState(0);
  const [selectedReply, setSelectedReply] = useState<string>(
    `Namaste! Aapka ₹${amount.toLocaleString('en-IN')} ka payout bank IFSC code change hone ke kaaran hold pe tha. Maine updated IFSC re-route approve kar diya hai, paisa agle 15 minutes mein aapke khate mein credit ho jaayega.`
  );
  const [replySent, setReplySent] = useState(false);

  const suggestedReplies = [
    `Namaste! Aapka ₹${amount.toLocaleString('en-IN')} ka payout bank IFSC code change hone ke kaaran hold pe tha. Maine updated IFSC re-route approve kar diya hai, paisa agle 15 minutes mein aapke khate mein credit ho jaayega.`,
    `HDFC branch merger ke kaaran aapka UTR reject hua tha. Verification poori ho chuki hai aur payout re-initiate kar diya gaya hai.`,
    `Hello! Your pending settlement of ₹${amount.toLocaleString('en-IN')} has been approved for instant bank re-dispatch.`,
  ];

  const handleSelectOption = (idx: number) => {
    setSelectedReplyIndex(idx);
    setSelectedReply(suggestedReplies[idx]);
  };

  const handleSend = () => {
    if (!selectedReply.trim()) return;
    if (onSendReply) onSendReply(selectedReply);
    setReplySent(true);
    setTimeout(() => setReplySent(false), 3500);
  };

  return (
    <div className="bg-white rounded-[24px] border border-slate-200/90 p-4 sm:p-5 shadow-sm flex flex-col justify-between h-full thin-scroll">
      
      {/* ─── CARD HEADER (MIRRORS PROGRESS HEADER) ─── */}
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-800 flex items-center justify-center">
            <FileText className="w-3.5 h-3.5 stroke-[2.2]" />
          </div>
          <div>
            <h3 className="font-['Outfit',sans-serif] font-bold text-sm sm:text-base text-slate-900 leading-tight">
              Progress Timeline
            </h3>
            <span className="text-[10px] text-slate-400">Deterministic Clearing Ledger</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowAiDetails(!showAiDetails)}
          className="w-8 h-8 rounded-full border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-600 transition cursor-pointer"
          title="Toggle AI Tool Calling Details"
        >
          {showAiDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* ─── VERTICAL TIMELINE WITH CONNECTED CHECK CIRCLES ─── */}
      <div className="space-y-3 my-2 shrink-0">
        
        {/* Step 1: Requested / Ingested (Black Check Circle) */}
        <div className="flex items-start gap-3 relative">
          <div className="w-6 h-6 rounded-full bg-[#12141A] text-white flex items-center justify-center shrink-0 z-10 shadow-xs">
            <Check className="w-3.5 h-3.5 stroke-[2.8]" />
          </div>
          <div className="absolute left-3 top-6 bottom-0 w-px bg-slate-200 -mb-3" />
          <div className="flex-1 pb-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">1. Log Ingested</span>
              <span className="text-[10px] text-slate-400 font-medium">10:45 AM</span>
            </div>
            <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
              NPCI settlement failure webhook logged for settlement #S-8841.
            </p>
          </div>
        </div>

        {/* Step 2: Checked by Sulajh (Black Check Circle + Violet Tag) */}
        <div className="flex items-start gap-3 relative">
          <div className="w-6 h-6 rounded-full bg-[#12141A] text-white flex items-center justify-center shrink-0 z-10 shadow-xs">
            <Check className="w-3.5 h-3.5 stroke-[2.8]" />
          </div>
          <div className="absolute left-3 top-6 bottom-0 w-px bg-slate-200 -mb-3" />
          <div className="flex-1 pb-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-900">2. Checked by Sulajh</span>
                <span className="px-1.5 py-0.2 rounded-full bg-violet-100 text-[#6D5BD0] font-bold text-[9px]">
                  AI Pre-Investigation
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">10:45 AM</span>
            </div>
            <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
              Cross-checked HDFC Clearing API + IMPS Switch. Root cause: IFSC branch merger.
            </p>

            {/* Expandable Tool-Calls Row in Violet */}
            {showAiDetails && (
              <div className="mt-2 p-2.5 rounded-xl bg-violet-50/70 border border-violet-200/80 text-[11px] space-y-1 font-mono text-slate-700 animate-slide-down">
                <div className="flex items-center justify-between text-violet-800 font-bold">
                  <span>tool: get_settlement_status()</span>
                  <span className="text-emerald-700 font-semibold">allow (₹{amount.toFixed(2)} ≤ ₹25,000)</span>
                </div>
                <p className="text-[10px] text-slate-500 font-sans">
                  Rule applied: <code>paytm_settlement_status_v2</code> · Confidence score: 99.4%
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Step 3: Reconciled (Black Check Circle) */}
        <div className="flex items-start gap-3 relative">
          <div className="w-6 h-6 rounded-full bg-[#12141A] text-white flex items-center justify-center shrink-0 z-10 shadow-xs">
            <Check className="w-3.5 h-3.5 stroke-[2.8]" />
          </div>
          <div className="absolute left-3 top-6 bottom-0 w-px bg-slate-200 -mb-3" />
          <div className="flex-1 pb-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">3. Reconciled</span>
              <span className="text-[10px] text-slate-400 font-medium">10:46 AM</span>
            </div>
            <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
              Gross ₹{grossAmount.toFixed(2)} - MDR (₹{commission.toFixed(2)}) - GST (₹{gst.toFixed(2)}) = Net ₹{amount.toFixed(2)}. Tally matched.
            </p>
          </div>
        </div>

        {/* Step 4: Dispatched (Black Check Circle) */}
        <div className="flex items-start gap-3 relative">
          <div className="w-6 h-6 rounded-full bg-[#12141A] text-white flex items-center justify-center shrink-0 z-10 shadow-xs">
            <Check className="w-3.5 h-3.5 stroke-[2.8]" />
          </div>
          <div className="absolute left-3 top-6 bottom-0 w-px bg-slate-200 -mb-3" />
          <div className="flex-1 pb-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">4. Decision Pack Assembled</span>
              <span className="text-[10px] text-slate-400 font-medium">10:46 AM</span>
            </div>
            <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
              Pre-approved pack generated with recommended 1-click IFSC re-route to HDFC0000482.
            </p>
          </div>
        </div>

        {/* Step 5: Dynamic L1 Decision Status */}
        {isApproved ? (
          <div className="flex items-start gap-3 relative">
            <div className="w-6 h-6 rounded-full bg-[#12141A] text-white flex items-center justify-center shrink-0 z-10 shadow-xs">
              <Check className="w-3.5 h-3.5 stroke-[2.8]" />
            </div>
            <div className="absolute left-3 top-6 bottom-0 w-px bg-slate-200 -mb-3" />
            <div className="flex-1 pb-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">5. Approved by L1 Agent (Released)</span>
                <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.2 rounded-full">
                  Cleared Just Now
                </span>
              </div>
              <p className="text-[11px] text-slate-700 font-medium mt-0.5 leading-relaxed">
                1-Click re-initiation signed off under ₹25,000 frontline threshold. Dispatched to bank.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3 relative">
            <div className="w-6 h-6 rounded-full bg-[#2F6BEA] text-white font-bold text-[11px] flex items-center justify-center shrink-0 z-10 shadow-sm ring-4 ring-blue-100">
              5
            </div>
            <div className="absolute left-3 top-6 bottom-0 w-px bg-slate-200 -mb-3" />
            <div className="flex-1 pb-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#2F6BEA]">5. Needs L1 Decision (Current)</span>
                <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.2 rounded-full">Live SLA 14m</span>
              </div>
              <p className="text-[11px] text-slate-700 font-medium mt-0.5 leading-relaxed">
                Awaiting 1-click re-initiation approval. Within your ₹25,000 frontline threshold.
              </p>
            </div>
          </div>
        )}

        {/* Step 6: Dynamic Merchant Notification Status */}
        {isApproved ? (
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 z-10 shadow-xs ring-4 ring-emerald-100">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-900">6. Merchant Notified (Delivered)</span>
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-2 py-0.2 rounded-full">
                  Broadcasted
                </span>
              </div>
              <p className="text-[11px] text-slate-700 mt-0.5 leading-relaxed">
                WhatsApp confirmation sent & Soundbox broadcasted Hindi voice: "Paytm par ₹{amount.toLocaleString('en-IN')} prapt hue".
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full border-2 border-slate-300 text-slate-400 font-bold text-[11px] flex items-center justify-center shrink-0">
              6
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">6. Merchant Notified</span>
                <span className="text-[10px] text-slate-400">Pending</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                WhatsApp & Soundbox voice confirmation triggered upon approval.
              </p>
            </div>
          </div>
        )}

      </div>

      {/* ─── GREY BLOCK: PROOF COLLECTED (MIRRORS DISPATCH PROOF STRIP) ─── */}
      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 my-2 shrink-0">
        <span className="text-[11px] font-bold text-slate-800 block mb-2">
          Dispatch Proof & Ledger Chips:
        </span>
        <div className="flex flex-wrap gap-1.5">
          <span className="px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-[11px] font-semibold text-slate-700 flex items-center gap-1 shadow-2xs">
            <Check className="w-3 h-3 text-emerald-600" /> Settlement verified
          </span>
          <span className="px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-[11px] font-semibold text-slate-700 flex items-center gap-1 shadow-2xs">
            <Check className="w-3 h-3 text-emerald-600" /> 3 records matched
          </span>
          <span className="px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-[11px] font-semibold text-slate-700 flex items-center gap-1 shadow-2xs">
            <ShieldCheck className="w-3 h-3 text-blue-600" /> Policy: allow
          </span>
          <span className="px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-[11px] font-semibold text-slate-700 flex items-center gap-1 shadow-2xs">
            <Check className="w-3 h-3 text-emerald-600" /> Tally matches
          </span>
        </div>
      </div>

      {/* ─── INTERACTIVE REPLY COMPOSER ─── */}
      <div className="pt-2.5 border-t border-slate-100 shrink-0">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-violet-600" /> AI Suggested Replies:
          </span>
          {replySent && (
            <span className="text-[11px] font-bold text-emerald-600 animate-pulse">
              Sent to merchant WhatsApp & Soundbox ✓
            </span>
          )}
        </div>

        <div className="flex gap-1.5 mb-2 overflow-x-auto no-scrollbar pb-0.5">
          {suggestedReplies.map((r, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSelectOption(i)}
              className={`px-3 py-1 rounded-full text-[11px] font-semibold text-left truncate max-w-[140px] border transition cursor-pointer ${
                selectedReplyIndex === i
                  ? 'bg-[#12141A] text-white border-[#12141A] shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              }`}
            >
              Option {i + 1}
            </button>
          ))}
        </div>

        <div className="relative">
          <textarea
            rows={2}
            value={selectedReply}
            onChange={(e) => setSelectedReply(e.target.value)}
            className="w-full p-2.5 pr-20 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 transition resize-none leading-relaxed"
          />
          <button
            type="button"
            onClick={handleSend}
            className="absolute right-2.5 bottom-2.5 px-3 py-1 rounded-lg bg-[#12141A] hover:bg-black text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs"
          >
            <span>Send</span>
            <Send className="w-3 h-3" />
          </button>
        </div>
      </div>

    </div>
  );
};
