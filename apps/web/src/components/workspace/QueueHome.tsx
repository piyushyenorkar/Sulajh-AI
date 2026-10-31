import React, { useState } from 'react';
import { 
  Sparkles, 
  ChevronRight, 
  Check, 
  Clock, 
  AlertOctagon, 
  ShieldAlert, 
  Filter, 
  ArrowRight, 
  Info, 
  CheckCircle2, 
  Layers,
  ChevronDown
} from 'lucide-react';
import { Meter } from './Meter';
import { OPS_TICKETS, OpsTicket } from '../../data/opsConsoleData';

export interface QueueHomeProps {
  onSelectTicket: (ticket: OpsTicket) => void;
  onOpenNextCase: () => void;
}

export const QueueHome: React.FC<QueueHomeProps> = ({
  onSelectTicket,
  onOpenNextCase,
}) => {
  const [activeQueueFilter, setActiveQueueFilter] = useState<'needs_me' | 'ai_resolved' | 'escalated' | 'waiting'>('needs_me');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedIncident, setExpandedIncident] = useState(false);

  const filteredTickets = OPS_TICKETS.filter((t) => {
    if (activeQueueFilter === 'ai_resolved') return t.status === 'resolved';
    if (activeQueueFilter === 'escalated') return t.status === 'escalated';
    if (activeQueueFilter === 'waiting') return t.status === 'in_review';
    return t.status === 'needs_approval' || t.status === 'in_review';
  }).filter((t) => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'failed') return t.issueType === 'settlement_failed';
    if (selectedCategory === 'chargeback') return t.issueType === 'chargeback';
    if (selectedCategory === 'deduction') return t.issueType === 'deduction_mismatch';
    return true;
  });

  return (
    <div className="flex flex-col gap-6">
      
      {/* ─── HEADER AREA (MIRRORS REFERENCE TITLE BLOCK) ─── */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 pb-2">
        
        {/* Left: Status Dot, Breadcrumb, 48px Thin Title, Sub-pills */}
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-emerald-700 font-bold">Live Queue</span>
            <span className="text-slate-300">•</span>
            <span>Queue / Today</span>
          </div>

          <h1 className="font-['Sora',sans-serif] font-light text-4xl sm:text-5xl text-slate-900 tracking-tight">
            Your queue
          </h1>

          {/* Sub-tabs / Queue Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <button
              type="button"
              onClick={() => setActiveQueueFilter('needs_me')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeQueueFilter === 'needs_me'
                  ? 'bg-[#12141A] text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
              }`}
            >
              <span>Needs me</span>
              <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold ${
                activeQueueFilter === 'needs_me' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-800'
              }`}>
                12
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveQueueFilter('ai_resolved')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeQueueFilter === 'ai_resolved'
                  ? 'bg-[#12141A] text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
              }`}
            >
              <span>AI resolved</span>
              <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold ${
                activeQueueFilter === 'ai_resolved' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-800'
              }`}>
                126
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveQueueFilter('escalated')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeQueueFilter === 'escalated'
                  ? 'bg-[#12141A] text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
              }`}
            >
              <span>Escalated by me</span>
              <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold ${
                activeQueueFilter === 'escalated' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-800'
              }`}>
                6
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveQueueFilter('waiting')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeQueueFilter === 'waiting'
                  ? 'bg-[#12141A] text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
              }`}
            >
              <span>Waiting on merchant</span>
              <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold ${
                activeQueueFilter === 'waiting' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-800'
              }`}>
                11
              </span>
            </button>
          </div>
        </div>

        {/* Right: Two Signature Meters & Action Buttons */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
          
          {/* Meter 1: Cleared today */}
          <Meter
            label="Cleared today"
            value="112 / 300"
            percent={37}
            variant="blue"
            leftCaption="Started 9:00"
            rightCaption="Target 6:00 PM"
          />

          {/* Meter 2: Resolved by Sulajh */}
          <Meter
            label="Resolved by Sulajh"
            value="70%"
            percent={70}
            variant="orange"
            leftCaption="Today so far"
            rightCaption="Needs you: 34"
          />

          {/* Action Buttons */}
          <div className="flex items-center gap-2 self-end mt-2 sm:mt-0">
            <button
              type="button"
              className="px-4 py-2.5 rounded-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filters</span>
            </button>

            <button
              type="button"
              onClick={onOpenNextCase}
              className="px-5 py-2.5 rounded-full bg-[#F2531D] hover:bg-[#D94210] text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <span>Open next case</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>

      {/* ─── THREE-COLUMN BODY ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* ─── COLUMN 1: QUEUE TABLE (WIDE, 6 COLS) ─── */}
        <div className="lg:col-span-6 bg-white rounded-[24px] border border-slate-200/90 p-5 shadow-sm flex flex-col justify-between">
          
          <div>
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <h3 className="font-['Outfit',sans-serif] font-bold text-base text-slate-900">
                Incoming Decision Queue
              </h3>
              <span className="text-xs text-slate-400 font-medium">{filteredTickets.length} cases in stream</span>
            </div>

            {/* Filter Chips */}
            <div className="flex items-center gap-1.5 mb-3 overflow-x-auto no-scrollbar pb-1">
              {[
                { id: 'all', label: 'All Issues' },
                { id: 'failed', label: 'Failed Payout' },
                { id: 'chargeback', label: 'Chargeback' },
                { id: 'deduction', label: 'Deduction Mismatch' },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setSelectedCategory(f.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                    selectedCategory === f.id
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Grouped Bank Incident Row (Expandable) */}
            <div className="mb-3 rounded-2xl bg-amber-50/70 border border-amber-200/80 p-3 text-xs">
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setExpandedIncident(!expandedIncident)}
              >
                <div className="flex items-center gap-2">
                  <AlertOctagon className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="font-bold text-amber-950">
                    HDFC Bank Switch Outage · 42 cases grouped
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-bold text-amber-700">
                  <span>{expandedIncident ? 'Collapse' : 'Expand'}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expandedIncident ? 'rotate-180' : ''}`} />
                </div>
              </div>
              {expandedIncident && (
                <div className="mt-2.5 pt-2 border-t border-amber-200/60 text-[11px] text-amber-900 space-y-1">
                  <p>Branch merger caused 42 payouts to reject on old IFSC codes. Sulajh AI resolved all 42 to active code HDFC0001234.</p>
                  <div className="pt-1 flex justify-end">
                    <button
                      type="button"
                      className="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] shadow-xs cursor-pointer"
                    >
                      1-Click Batch Heal (42 Payouts)
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* List Rows */}
            <div className="space-y-2">
              {filteredTickets.map((t) => (
                <div
                  key={t.id}
                  onClick={() => onSelectTicket(t)}
                  className="p-3.5 rounded-2xl border border-slate-200/80 hover:border-slate-300 hover:bg-slate-50 transition cursor-pointer flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-800 font-bold text-xs flex items-center justify-center shrink-0 group-hover:bg-white group-hover:shadow-xs transition">
                      {t.merchantName.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900 truncate">{t.merchantName}</span>
                        <span className="font-mono text-[10px] text-slate-400 font-medium">{t.ticketNumber}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">{t.issueTitle}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <span className="font-bold text-xs text-slate-900 font-mono block">
                        ₹{t.amount.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">SLA {t.slaMinutes}m</span>
                    </div>

                    <span className="px-2 py-0.5 rounded-full bg-violet-100 text-[#6D5BD0] font-bold text-[10px] whitespace-nowrap">
                      Prepared by Sulajh
                    </span>

                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 transition" />
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* Footer Shortcuts */}
          <div className="pt-3 mt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Shortcuts: <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600 font-mono">J / K</kbd> navigate, <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600 font-mono">A</kbd> approve, <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600 font-mono">R</kbd> reject</span>
            <span>Simulated Paytm data</span>
          </div>

        </div>

        {/* ─── COLUMN 2: TODAY'S FLOW (3 COLS) ─── */}
        <div className="lg:col-span-3 bg-white rounded-[24px] border border-slate-200/90 p-5 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-2">
            <h3 className="font-['Outfit',sans-serif] font-bold text-base text-slate-900">
              Today's Flow
            </h3>
            <span className="text-[11px] text-slate-400">Shift Timeline Milestones</span>
          </div>

          {/* Milestones list */}
          <div className="space-y-3.5 my-2">
            {[
              { time: '09:00', title: 'Shift queue opened', done: true },
              { time: '10:15', title: 'First 50 tickets cleared', done: true },
              { time: '10:45', title: 'HDFC merger outage grouped', done: true },
              { time: '11:20', title: 'Ramesh Kirana pack ready', current: true },
              { time: '13:00', title: 'Mid-shift target: 150', upcoming: true },
            ].map((m, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs">
                {m.done ? (
                  <div className="w-5 h-5 rounded-full bg-[#12141A] text-white flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                ) : m.current ? (
                  <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 font-bold text-[10px] ring-2 ring-blue-100">
                    •
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full border border-slate-300 text-slate-400 flex items-center justify-center shrink-0 text-[10px]">
                    ○
                  </div>
                )}
                <div className="flex-1">
                  <span className={`block font-bold leading-tight ${m.current ? 'text-blue-600' : 'text-slate-900'}`}>
                    {m.title}
                  </span>
                  <span className="text-[10px] text-slate-400">{m.time} IST</span>
                </div>
              </div>
            ))}
          </div>

          {/* Small Stacked Bar: AI vs Human Resolutions */}
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-2">
              <span>Resolutions Split</span>
              <span className="text-violet-700 text-[11px]">73.4% Deflection</span>
            </div>
            <div className="h-3 w-full rounded-full overflow-hidden flex bg-slate-200">
              <div className="h-full bg-violet-600" style={{ width: '73.4%' }} title="AI Resolved: 73.4%" />
              <div className="h-full bg-blue-600" style={{ width: '26.6%' }} title="Human Handled: 26.6%" />
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1.5 font-medium">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-violet-600" /> AI (235)</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-600" /> Agent (85)</span>
            </div>
          </div>
        </div>

        {/* ─── COLUMN 3: YOUR LIMIT & CHECKLIST (3 COLS) ─── */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* Approval Limit Card */}
          <div className="bg-white rounded-[24px] border border-slate-200/90 p-5 shadow-sm space-y-3">
            <h3 className="font-['Outfit',sans-serif] font-bold text-base text-slate-900">
              Your Authority Limit
            </h3>

            <Meter
              label="Ops Agent Tier-1 Cap"
              value="₹25,000"
              percent={74}
              variant="green"
              leftCaption="Autonomous Level"
              rightCaption="Cap: ₹25k"
            />

            <div className="pt-2 border-t border-slate-100 text-xs">
              <span className="font-bold text-slate-700 block mb-1">Escalated to Ops Manager (2):</span>
              <div className="space-y-1.5 text-[11px] text-slate-600 font-mono">
                <div className="flex items-center justify-between p-1.5 bg-slate-50 rounded-lg">
                  <span>#case-4 · Ganesh Elec</span>
                  <span className="font-bold text-slate-900">₹45,000</span>
                </div>
                <div className="flex items-center justify-between p-1.5 bg-slate-50 rounded-lg">
                  <span>#case-9 · Kalyan Gold</span>
                  <span className="font-bold text-slate-900">₹82,000</span>
                </div>
              </div>
            </div>
          </div>

          {/* Checklist before closing case */}
          <div className="bg-white rounded-[24px] border border-slate-200/90 p-5 shadow-sm space-y-2.5">
            <h3 className="font-['Outfit',sans-serif] font-bold text-sm text-slate-900">
              Before You Close a Case:
            </h3>
            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Read Sulajh's root-cause pack</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Check delivery proof if dispute</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Confirm reply sent to merchant</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Internal notes appended</span>
              </div>
            </div>

            {/* Pale Blue Info Note Strip at Bottom */}
            <div className="mt-3 p-2.5 rounded-xl bg-blue-50/70 border border-blue-200/60 flex items-start gap-2 text-[11px] text-blue-900 leading-relaxed">
              <Info className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
              <span>Cases above ₹25,000 auto-route to Ops Manager with 4-Eye Approval.</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

