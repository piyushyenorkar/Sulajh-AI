import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Sparkles, 
  Clock, 
  ArrowRight, 
  AlertOctagon, 
  CheckCircle2, 
  RefreshCw, 
  Lock, 
  Users, 
  Building2, 
  TrendingUp, 
  ChevronRight,
  ExternalLink,
  X,
  Check
} from 'lucide-react';
import { Meter } from './Meter';
import { BANK_OUTAGE_INCIDENTS, OPS_TICKETS, OpsTicket } from '../../data/opsConsoleData';

export interface ManagerWorkspaceProps {
  onSelectTicket: (ticket: OpsTicket) => void;
  onOpenBulkRetry: () => void;
}

export const ManagerWorkspace: React.FC<ManagerWorkspaceProps> = ({
  onSelectTicket,
  onOpenBulkRetry,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'high_value' | 'outages' | 'disputes'>('all');
  const [showBulkRetrySheet, setShowBulkRetrySheet] = useState(false);
  const [batchRetryStep, setBatchRetryStep] = useState<'preview' | 'running' | 'completed'>('preview');
  const [batchProgress, setBatchProgress] = useState(0);

  // High-value escalated cases (> 25k)
  const escalatedTickets = OPS_TICKETS.filter((t) => t.status === 'escalated' || t.amount > 25000);

  const startBatchExecution = () => {
    setBatchRetryStep('running');
    let current = 0;
    const interval = setInterval(() => {
      current += 15;
      if (current >= 142) {
        setBatchProgress(142);
        clearInterval(interval);
        setBatchRetryStep('completed');
      } else {
        setBatchProgress(current);
      }
    }, 200);
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* ─── HEADER AREA (MIRRORS REFERENCE TITLE BLOCK) ─── */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 pb-2">
        
        {/* Left: Status Dot, Breadcrumb, 48px Thin Title, Sub-pills */}
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-blue-700 font-bold">Manager Desk (L2)</span>
            <span className="text-slate-300">•</span>
            <span>Escalations & Incident Command</span>
          </div>

          <h1 className="font-['Sora',sans-serif] font-light text-4xl sm:text-5xl text-slate-900 tracking-tight">
            Settlement operations
          </h1>

          {/* Sub-tabs pills */}
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <button
              type="button"
              onClick={() => setActiveFilter('all')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeFilter === 'all'
                  ? 'bg-[#12141A] text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
              }`}
            >
              <span>Needs manager decision</span>
              <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold ${
                activeFilter === 'all' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-800'
              }`}>
                8
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('high_value')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeFilter === 'high_value'
                  ? 'bg-[#12141A] text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
              }`}
            >
              <span>High value (&gt; ₹25k)</span>
              <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold ${
                activeFilter === 'high_value' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-800'
              }`}>
                5
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('outages')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeFilter === 'outages'
                  ? 'bg-[#12141A] text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
              }`}
            >
              <span>Bank outages</span>
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            </button>
          </div>
        </div>

        {/* Right: Signature Meters + Quick Incident Action */}
        <div className="flex flex-col sm:flex-row xl:flex-col items-start xl:items-end gap-4">
          
          <div className="flex items-center gap-4 sm:gap-6">
            <Meter
              label="Manager queue"
              value="8 / 12"
              pct={66}
              leftCaption="4 pending review"
              rightCaption="SLA 4 h"
              variant="orange"
              widthClass="w-36 sm:w-44"
            />
            <Meter
              label="Autonomous deflection"
              value="71%"
              pct={71}
              leftCaption="126 auto-cleared"
              rightCaption="Target 70%"
              variant="blue"
              widthClass="w-36 sm:w-44"
            />
          </div>

          <button
            type="button"
            onClick={() => setShowBulkRetrySheet(true)}
            className="px-5 py-2.5 rounded-full bg-[#F2531D] hover:bg-[#E04612] text-white text-xs font-bold transition flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>1-Click Bulk Retry (142 cases)</span>
          </button>
        </div>
      </div>

      {/* ─── ACTIVE BANK INCIDENT ALERT STRIP (M-3 PREVIEW) ─── */}
      <div className="bg-gradient-to-r from-red-50 via-rose-50 to-orange-50 rounded-[24px] border border-red-200/90 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <AlertOctagon className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-red-200/80 text-red-900 text-[10px] font-extrabold uppercase tracking-wider">
                Bank Critical Incident
              </span>
              <span className="text-xs text-slate-500 font-mono">INC-HDFC-9921</span>
            </div>
            <h3 className="font-['Outfit',sans-serif] font-bold text-base text-slate-900 mt-0.5">
              HDFC Branch Consolidation & IFSC Code Migration
            </h3>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
              142 merchant IMPS settlements (total <strong>₹38,40,500</strong>) rejected with error code <code>E_BANK_IFSC_INACTIVE</code>. Sulajh AI auto-mapped all 142 old IFSCs to the new centralized IFSC <code>HDFC0000482</code>.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setShowBulkRetrySheet(true)}
            className="px-4 py-2.5 rounded-full bg-white border border-red-300 text-red-700 hover:bg-red-50 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <span>Review & Retry 142 Payouts</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ─── 2-COLUMN WORKSPACE: ESCALATIONS & TEAM TELEMETRY ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column (7 cols): High-Value Escalation Table */}
        <div className="lg:col-span-7 bg-white rounded-[24px] border border-slate-200/90 p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-orange-50 text-[#F2531D] flex items-center justify-center">
                <ShieldAlert className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="font-['Outfit',sans-serif] font-bold text-base text-slate-900">
                  Escalated Cases (&gt; ₹25,000 Cap)
                </h3>
                <span className="text-[11px] text-slate-400">Requires 4-Eye Approval & Manager TOTP</span>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">
              {escalatedTickets.length} cases held
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {escalatedTickets.map((tkt) => (
              <div 
                key={tkt.id}
                onClick={() => onSelectTicket(tkt)}
                className="py-3.5 px-3 rounded-xl hover:bg-slate-50 transition cursor-pointer flex items-center justify-between gap-4 group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center font-bold text-xs shrink-0 group-hover:bg-[#12141A] group-hover:text-white transition">
                    ₹
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900">{tkt.ticketNumber}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-xs font-semibold text-slate-700 truncate">{tkt.merchantName}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {tkt.issueTitle} · <span className="text-[#6D5BD0] font-medium">L1: Priya Sharma</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <div className="font-['Outfit',sans-serif] font-bold text-sm text-slate-900">
                      ₹{tkt.amount.toLocaleString('en-IN')}
                    </div>
                    <span className="text-[10px] font-bold text-amber-600 uppercase">
                      2FA Required
                    </span>
                  </div>
                  <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:text-slate-900 group-hover:bg-slate-200 transition">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column (5 cols): Bank Gateways & Team Telemetry */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Card: Live Bank Health */}
          <div className="bg-white rounded-[24px] border border-slate-200/90 p-5 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Building2 className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="font-['Outfit',sans-serif] font-bold text-base text-slate-900">
                    Bank Clearing Health
                  </h3>
                  <span className="text-[11px] text-slate-400">NPCI / IMPS Settlement Rails</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-red-50 border border-red-200/60 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-xs text-red-900">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span>HDFC Bank (IMPS Rail)</span>
                  </div>
                  <span className="text-[11px] text-red-700">142 payouts held (IFSC code migration)</span>
                </div>
                <span className="text-xs font-mono font-bold text-red-800">82.4% success</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>ICICI Bank</span>
                  </div>
                  <span className="text-[11px] text-slate-500">Normal clearing pace (T+0 instant)</span>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-600">99.8% success</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>State Bank of India</span>
                  </div>
                  <span className="text-[11px] text-slate-500">Normal clearing pace</span>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-600">99.2% success</span>
              </div>
            </div>
          </div>

          {/* Card: Team Telemetry & Deflection */}
          <div className="bg-white rounded-[24px] border border-slate-200/90 p-5 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-800 flex items-center justify-center">
                  <Users className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="font-['Outfit',sans-serif] font-bold text-base text-slate-900">
                    Frontline L1 Staff Telemetry
                  </h3>
                  <span className="text-[11px] text-slate-400">Shift Performance vs Target</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs py-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-800 font-bold text-[10px] flex items-center justify-center">
                    PS
                  </div>
                  <span className="font-semibold text-slate-800">Priya Sharma</span>
                </div>
                <div className="flex items-center gap-4 text-right">
                  <span className="text-slate-500">48 cleared</span>
                  <span className="font-bold text-emerald-600">38s avg</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs py-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-800 font-bold text-[10px] flex items-center justify-center">
                    RV
                  </div>
                  <span className="font-semibold text-slate-800">Rahul Verma</span>
                </div>
                <div className="flex items-center gap-4 text-right">
                  <span className="text-slate-500">42 cleared</span>
                  <span className="font-bold text-emerald-600">44s avg</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs py-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-purple-100 text-[#6D5BD0] font-bold text-[10px] flex items-center justify-center">
                    AI
                  </div>
                  <span className="font-semibold text-[#6D5BD0]">Sulajh Autonomous AI</span>
                </div>
                <div className="flex items-center gap-4 text-right">
                  <span className="text-[#6D5BD0] font-bold">126 auto-cleared</span>
                  <span className="font-bold text-[#6D5BD0]">1.2s avg</span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* ─── M-3 BULK RETRY PREVIEW MODAL / SHEET ─── */}
      {showBulkRetrySheet && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[28px] border border-slate-200 p-6 sm:p-8 max-w-2xl w-full shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-orange-50 text-[#F2531D] flex items-center justify-center">
                  <RefreshCw className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="font-['Outfit',sans-serif] font-bold text-lg text-slate-900">
                    Bulk Payout Retry Preview (142 Settlements)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Incident: HDFC IFSC Consolidation · Total Held: ₹38,40,500
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowBulkRetrySheet(false);
                  setBatchRetryStep('preview');
                  setBatchProgress(0);
                }}
                className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {batchRetryStep === 'preview' && (
              <div className="py-4 space-y-4">
                <div className="p-3.5 bg-blue-50/70 border border-blue-200/60 rounded-xl text-xs text-blue-900">
                  <strong>Safe Batch Action:</strong> Sulajh AI has verified all 142 recipient account numbers against the new IFSC <code>HDFC0000482</code>. Executing will dispatch all 142 IMPS payouts in parallel.
                </div>

                <div className="text-xs font-bold text-slate-700">Sample of 5 affected merchants:</div>
                <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 text-xs">
                  <div className="bg-slate-50 px-3 py-2 grid grid-cols-4 font-semibold text-slate-600">
                    <span>Merchant</span>
                    <span>Hold Amount</span>
                    <span>Old IFSC</span>
                    <span>New Auto-IFSC</span>
                  </div>
                  <div className="px-3 py-2.5 grid grid-cols-4 text-slate-700">
                    <span className="font-medium">Ramesh Kirana</span>
                    <span className="font-bold text-emerald-600">₹4,735.54</span>
                    <span className="line-through text-red-500">HDFC0000041</span>
                    <span className="font-mono text-blue-700 font-bold">HDFC0000482</span>
                  </div>
                  <div className="px-3 py-2.5 grid grid-cols-4 text-slate-700">
                    <span className="font-medium">Gupta Sweets</span>
                    <span className="font-bold text-emerald-600">₹12,400.00</span>
                    <span className="line-through text-red-500">HDFC0000041</span>
                    <span className="font-mono text-blue-700 font-bold">HDFC0000482</span>
                  </div>
                  <div className="px-3 py-2.5 grid grid-cols-4 text-slate-700">
                    <span className="font-medium">Kalyan Footwear</span>
                    <span className="font-bold text-emerald-600">₹8,920.00</span>
                    <span className="line-through text-red-500">HDFC0000041</span>
                    <span className="font-mono text-blue-700 font-bold">HDFC0000482</span>
                  </div>
                  <div className="px-3 py-2.5 grid grid-cols-4 text-slate-700">
                    <span className="font-medium">Sai Medical Store</span>
                    <span className="font-bold text-emerald-600">₹24,150.00</span>
                    <span className="line-through text-red-500">HDFC0000041</span>
                    <span className="font-mono text-blue-700 font-bold">HDFC0000482</span>
                  </div>
                  <div className="px-3 py-2.5 grid grid-cols-4 text-slate-700">
                    <span className="font-medium">Pooja General Store</span>
                    <span className="font-bold text-emerald-600">₹6,800.00</span>
                    <span className="line-through text-red-500">HDFC0000041</span>
                    <span className="font-mono text-blue-700 font-bold">HDFC0000482</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowBulkRetrySheet(false)}
                    className="px-5 py-2.5 rounded-full border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={startBatchExecution}
                    className="px-6 py-2.5 rounded-full bg-[#F2531D] hover:bg-[#E04612] text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-sm"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Execute Batch Retry (142 Settlements)</span>
                  </button>
                </div>
              </div>
            )}

            {batchRetryStep === 'running' && (
              <div className="py-8 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-orange-100 text-[#F2531D] flex items-center justify-center mx-auto animate-spin">
                  <RefreshCw className="w-7 h-7" />
                </div>
                <h4 className="font-['Outfit',sans-serif] font-bold text-lg text-slate-900">
                  Executing Batch Payout Re-dispatch...
                </h4>
                <p className="text-xs text-slate-500">
                  Dispatching IMPS API calls via NPCI gateway with updated IFSC
                </p>
                <div className="max-w-md mx-auto">
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#F2531D] transition-all duration-300"
                      style={{ width: `${(batchProgress / 142) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs font-bold text-slate-600 mt-2">
                    <span>Progress</span>
                    <span>{batchProgress} / 142 Settlements</span>
                  </div>
                </div>
              </div>
            )}

            {batchRetryStep === 'completed' && (
              <div className="py-8 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <Check className="w-8 h-8 stroke-[3]" />
                </div>
                <h4 className="font-['Outfit',sans-serif] font-bold text-xl text-slate-900">
                  Batch Retry Completed Successfully!
                </h4>
                <p className="text-xs text-slate-600 max-w-md mx-auto">
                  All <strong>142 settlements (₹38,40,500)</strong> have been cleared with bank UTR acknowledgments. SMS & WhatsApp confirmations sent to all 142 merchants.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setShowBulkRetrySheet(false);
                    setBatchRetryStep('preview');
                    setBatchProgress(0);
                  }}
                  className="px-6 py-2.5 rounded-full bg-[#12141A] hover:bg-black text-white text-xs font-bold transition cursor-pointer"
                >
                  Done & Back to Overview
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
