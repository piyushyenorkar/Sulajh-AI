import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutGrid,
  BarChart3,
  AlertOctagon,
  ShieldCheck,
  Settings,
  LogOut,
  Search,
  Bell,
  Sparkles,
  CheckCircle2,
  Check,
  X,
  ChevronRight,
  Clock,
  ShieldAlert,
  ArrowRight,
  ArrowUpRight,
  Building2,
  Receipt,
  Zap,
  Activity,
  FileText,
  UserCheck,
  RefreshCw,
  ExternalLink,
  Layers,
  Cpu,
  Lock,
  Flame,
  CheckCheck,
  Timer
} from 'lucide-react';

import { api } from '../lib/api';
import { 
  L1_AGENT_INFO, 
  OPS_KPIS, 
  AI_DEFLECTION_CHART_DATA, 
  BANK_OUTAGE_INCIDENTS, 
  OPS_TICKETS,
  OpsTicket 
} from '../data/opsConsoleData';

export default function OpsConsole() {
  const navigate = useNavigate();

  // Active View on Left Rail: 'queue' | 'analytics' | 'incidents' | 'audit' | 'settings'
  const [activeRailTab, setActiveRailTab] = useState<'queue' | 'analytics' | 'incidents' | 'audit' | 'settings'>('queue');

  // Active Queue Filter
  const [queueFilter, setQueueFilter] = useState<'all' | 'needs_approval' | 'resolved' | 'high_priority'>('needs_approval');

  // Search Filter
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Ticket in Workbench
  const [selectedTicket, setSelectedTicket] = useState<OpsTicket>(OPS_TICKETS[0]);

  // Decision Modal / Action States
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);
  const [bulkRetrySuccess, setBulkRetrySuccess] = useState<string | null>(null);
  const [isProcessingDecision, setIsProcessingDecision] = useState(false);

  // Timeframe for Deflection Chart
  const [chartTimeframe, setChartTimeframe] = useState<'today' | '1w' | '1m'>('today');

  // Hover state on SVG chart
  const [hoveredPoint, setHoveredPoint] = useState<any | null>(null);

  // Auto-authenticate L1 Ops session on load
  useEffect(() => {
    api.ensureOpsSession();
  }, []);

  // Filtered tickets list
  const filteredTickets = OPS_TICKETS.filter((tkt) => {
    const matchesSearch = 
      tkt.merchantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tkt.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tkt.issueTitle.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (queueFilter === 'needs_approval') return tkt.status === 'needs_approval';
    if (queueFilter === 'resolved') return tkt.status === 'resolved';
    if (queueFilter === 'high_priority') return tkt.priority === 'high';
    return true;
  });

  // 1-Click Approve Action
  const handleApproveTicket = (ticket: OpsTicket) => {
    setIsProcessingDecision(true);
    setTimeout(() => {
      setIsProcessingDecision(false);
      ticket.status = 'resolved';
      setActionSuccessMessage(`Ticket ${ticket.ticketNumber} approved! ₹${ticket.amount.toLocaleString('en-IN')} payout released to updated IFSC.`);
      setTimeout(() => setActionSuccessMessage(null), 3500);
    }, 600);
  };

  // Escalate to Ops Manager Action
  const handleEscalateTicket = (ticket: OpsTicket) => {
    setIsProcessingDecision(true);
    setTimeout(() => {
      setIsProcessingDecision(false);
      ticket.status = 'escalated';
      setActionSuccessMessage(`Ticket ${ticket.ticketNumber} escalated to Ops Manager Neha Gupta with pre-verified 4-eye audit pack.`);
      setTimeout(() => setActionSuccessMessage(null), 3500);
    }, 600);
  };

  // 1-Click Bulk Retry Bank Outages
  const handleBulkRetry = (incId: string) => {
    setBulkRetrySuccess('Bulk re-routing instruction dispatched for 42 payouts! Bank clearing feeds synced.');
    setTimeout(() => setBulkRetrySuccess(null), 4000);
  };

  const handleSignOut = () => {
    api.clearSession();
    navigate('/login');
  };

  return (
    <div className="h-screen max-h-screen overflow-hidden flex flex-col md:flex-row antialiased selection:bg-blue-500/20 selection:text-blue-600 font-sans p-2 sm:p-3 md:p-4 lg:p-5 bg-[#0B0B0F]">
      
      {/* ─── SLIM VERTICAL ICON RAIL (LEFT BAR ON DESKTOP, BOTTOM TAB BAR ON MOBILE) ─── */}
      <aside className="w-full md:w-16 lg:w-18 shrink-0 flex md:flex-col items-center justify-between py-2 md:py-6 px-3 md:px-0 z-30 order-2 md:order-1 bg-[#0B0B0F]">
        
        {/* Top: Stylized 4-Point Blue/White Sparkle Brand Logo */}
        <div className="hidden md:flex items-center justify-center mb-6">
          <div 
            onClick={() => setActiveRailTab('queue')}
            className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 via-blue-400 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 cursor-pointer hover:scale-105 transition"
            title="Sulajh AI Ops Console"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 0C12 6.627 6.627 12 0 12C6.627 12 12 17.373 12 24C12 17.373 17.373 12 24 12C17.373 12 12 6.627 12 0Z" />
            </svg>
          </div>
        </div>

        {/* Middle: 5 Circular / Round Icon Buttons */}
        <div className="flex md:flex-col items-center justify-around md:justify-center w-full md:space-y-4">
          
          {/* 1. Queue & Workbench (Active by default -> Solid White Filled Circle) */}
          <button
            type="button"
            onClick={() => setActiveRailTab('queue')}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer ${
              activeRailTab === 'queue'
                ? 'bg-white text-slate-950 shadow-md scale-105'
                : 'text-slate-400 hover:text-white hover:bg-white/10'
            }`}
            title="L1 Ops Queue & Decision Workbench"
          >
            <LayoutGrid className="w-4.5 h-4.5 stroke-[2.2]" />
          </button>

          {/* 2. AI Deflection Velocity & Analytics */}
          <button
            type="button"
            onClick={() => setActiveRailTab('analytics')}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer ${
              activeRailTab === 'analytics'
                ? 'bg-white text-slate-950 shadow-md scale-105'
                : 'text-slate-400 hover:text-white hover:bg-white/10'
            }`}
            title="AI Deflection Velocity & Performance"
          >
            <BarChart3 className="w-4.5 h-4.5 stroke-[2]" />
          </button>

          {/* 3. Bank Switch Outages & Incidents */}
          <button
            type="button"
            onClick={() => setActiveRailTab('incidents')}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer relative ${
              activeRailTab === 'incidents'
                ? 'bg-white text-slate-950 shadow-md scale-105'
                : 'text-slate-400 hover:text-white hover:bg-white/10'
            }`}
            title="Bank Outage War Room & Auto-Heal"
          >
            <AlertOctagon className="w-4.5 h-4.5 stroke-[2]" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          </button>

          {/* 4. Immutable Audit & Compliance Ledger */}
          <button
            type="button"
            onClick={() => setActiveRailTab('audit')}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer ${
              activeRailTab === 'audit'
                ? 'bg-white text-slate-950 shadow-md scale-105'
                : 'text-slate-400 hover:text-white hover:bg-white/10'
            }`}
            title="RBI Compliance & Audit Trail"
          >
            <ShieldCheck className="w-4.5 h-4.5 stroke-[2]" />
          </button>

          {/* 5. Agent Settings & Shift Config */}
          <button
            type="button"
            onClick={() => setActiveRailTab('settings')}
            className={`hidden md:flex w-10 h-10 rounded-full items-center justify-center transition-all duration-200 cursor-pointer ${
              activeRailTab === 'settings'
                ? 'bg-white text-slate-950 shadow-md scale-105'
                : 'text-slate-400 hover:text-white hover:bg-white/10'
            }`}
            title="Ops Preferences & Shift Config"
          >
            <Settings className="w-4.5 h-4.5 stroke-[2]" />
          </button>
        </div>

        {/* Bottom: Logout */}
        <div className="hidden md:flex mt-auto pt-4">
          <button
            type="button"
            onClick={handleSignOut}
            className="w-10 h-10 rounded-full flex items-center justify-center text-slate-500 hover:text-rose-400 hover:bg-white/5 transition-colors cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-4.5 h-4.5 stroke-[2]" />
          </button>
        </div>
      </aside>

      {/* ─── MAIN WHITE PANEL (CONSTRAINED TO SCREEN, NO DOUBLE SCROLLBARS) ───── */}
      <main className="flex-1 h-full max-h-[calc(100vh-1rem)] md:max-h-[calc(100vh-2.5rem)] bg-white rounded-[28px] p-5 sm:p-7 md:p-8 flex flex-col min-h-0 relative shadow-2xl overflow-y-auto order-1 md:order-2 custom-scrollbar">
        
        {/* ─── TOP HEADER ──────────────────────────────────────────────────────── */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-2 shrink-0">
          
          {/* Left Title & Status */}
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
                {activeRailTab === 'queue' && 'L1 Ops Command Center'}
                {activeRailTab === 'analytics' && 'AI Deflection Velocity & Efficiency'}
                {activeRailTab === 'incidents' && 'Bank Outage War Room & Auto-Heal'}
                {activeRailTab === 'audit' && 'RBI Compliance & Audit Trail'}
                {activeRailTab === 'settings' && 'Agent Shift & SLA Controls'}
              </h1>

              {/* Reserved Violet Chip for AI Agent (#6D5BD0) */}
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-50 text-violet-700 font-bold text-xs border border-violet-200 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-[#6D5BD0] animate-pulse" />
                <span>Sulajh AI: 73.4% Auto-Deflection Active</span>
              </span>
            </div>

            <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500 font-medium">
              <span className="font-semibold text-slate-700">{L1_AGENT_INFO.name}</span>
              <span className="text-slate-300">•</span>
              <span className="font-mono text-slate-500">{L1_AGENT_INFO.empId}</span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-500">{L1_AGENT_INFO.shift}</span>
            </div>
          </div>

          {/* Right Controls: Shift Target, Search, Bell, Avatar */}
          <div className="flex items-center gap-3">
            
            {/* Shift Target Pill */}
            <div className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 text-slate-800 text-xs font-semibold">
              <Timer className="w-3.5 h-3.5 text-blue-600" />
              <span>Target: <strong>{L1_AGENT_INFO.processedToday}</strong> / {L1_AGENT_INFO.dailyTarget}</span>
            </div>

            {/* Search Field */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ticket, MID, UTR..."
                className="w-48 sm:w-56 bg-slate-100/80 hover:bg-slate-100 focus:bg-white focus:ring-1 focus:ring-slate-950 rounded-full pl-9 pr-4 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 transition-all outline-none"
              />
            </div>

            {/* Bell Notifications */}
            <button
              type="button"
              onClick={() => setActiveRailTab('incidents')}
              className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition cursor-pointer relative shadow-2xs"
              title="Bank Alerts"
            >
              <Bell className="w-4 h-4 stroke-[2]" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
            </button>

            {/* Agent Avatar */}
            <div 
              onClick={() => setActiveRailTab('settings')}
              className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-sm cursor-pointer hover:ring-2 hover:ring-blue-300 transition"
              title="Vikram Singh (L1 Ops Agent)"
            >
              VS
            </div>
          </div>
        </header>

        {/* ─── ACTION BANNER NOTIFICATION ──────────────────────────────────────── */}
        {actionSuccessMessage && (
          <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center justify-between animate-slide-down shrink-0">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
              <span>{actionSuccessMessage}</span>
            </div>
            <button onClick={() => setActionSuccessMessage(null)} className="text-emerald-700 hover:text-emerald-900">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* ─── VIEW 1: QUEUE & WORKBENCH (PRIMARY L1 WORKSPACE) ────────────────── */}
        {activeRailTab === 'queue' && (
          <div className="space-y-6 flex-1 flex flex-col min-h-0">
            
            {/* ─── ROW 1: FOUR OPERATIONAL KPI CARDS ───────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
              
              {/* KPI 1: AI Deflection Rate (Violet Accent) */}
              <div className="bg-white border border-slate-200/90 rounded-[24px] p-5 flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                  <span>AI Autonomous Closures</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-violet-100 text-[#6D5BD0] font-bold text-[10px]">
                    Zero Agent Touch
                  </span>
                </div>
                <div className="my-2 flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-extrabold text-slate-950 font-mono">
                    {OPS_KPIS.aiResolvedCount}
                  </span>
                  <span className="text-xs font-bold text-[#6D5BD0]">
                    ({OPS_KPIS.aiDeflectionPercent}%)
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  235 of 320 daily tickets closed automatically
                </p>
              </div>

              {/* KPI 2: Pending L1 Review */}
              <div className="bg-white border border-slate-200/90 rounded-[24px] p-5 flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                  <span>Pending L1 Decisions</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-950 text-white font-bold text-[10px]">
                    SLA &lt; 15m
                  </span>
                </div>
                <div className="my-2 flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-extrabold text-slate-950 font-mono">
                    {OPS_KPIS.pendingHumanReview}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    cases in queue
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Pre-investigated with 99% AI confidence
                </p>
              </div>

              {/* KPI 3: Average Resolution Time */}
              <div className="bg-white border border-slate-200/90 rounded-[24px] p-5 flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                  <span>Avg Resolution Speed</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold text-[10px]">
                    -88% vs Manual
                  </span>
                </div>
                <div className="my-2 flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-extrabold text-slate-950 font-mono">
                    {L1_AGENT_INFO.avgResolutionTime}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Down from 42m traditional bank cross-check
                </p>
              </div>

              {/* KPI 4: Verified Payouts Cleared */}
              <div className="bg-white border border-slate-200/90 rounded-[24px] p-5 flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                  <span>Disbursements Cleared</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px]">
                    RBI Compliant
                  </span>
                </div>
                <div className="my-2 flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-extrabold text-slate-950 font-mono">
                    ₹48,25,000
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Zero erroneous holdbacks or duplicate debits
                </p>
              </div>
            </div>

            {/* ─── ROW 2: TWO DARK EMPHASIS CARDS (AI DEFLECTION + OUTAGE PULSE) ─── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 shrink-0">
              
              {/* DARK CARD 1 (8 COLS): AI TICKET DEFLECTION VELOCITY CHART */}
              <div className="lg:col-span-8 bg-[#111217] text-white border border-white/10 rounded-[24px] p-5 sm:p-6 flex flex-col justify-between shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Frontline Intake & AI Deflection Velocity
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                        73% AI Autonomy
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Daily ticket volume vs autonomous resolution without frontline agent effort
                    </p>
                  </div>

                  {/* Segmented Time Control */}
                  <div className="flex items-center bg-white/10 p-0.5 rounded-full border border-white/5 text-xs">
                    {(['today', '1w', '1m'] as const).map((tf) => (
                      <button
                        key={tf}
                        type="button"
                        onClick={() => setChartTimeframe(tf)}
                        className={`px-3 py-1 rounded-full text-[11px] font-bold transition cursor-pointer ${
                          chartTimeframe === tf
                            ? 'bg-white text-slate-950 shadow-sm'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {tf.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Interactive Area Chart SVG */}
                <div className="relative h-44 w-full pt-2">
                  <svg viewBox="0 0 700 160" className="w-full h-full overflow-visible">
                    <defs>
                      <linearGradient id="violetGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6D5BD0" stopOpacity="0.45" />
                        <stop offset="100%" stopColor="#6D5BD0" stopOpacity="0.0" />
                      </linearGradient>
                      <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Grid lines */}
                    <line x1="0" y1="30" x2="700" y2="30" stroke="#ffffff" strokeOpacity="0.07" strokeDasharray="3 3" />
                    <line x1="0" y1="80" x2="700" y2="80" stroke="#ffffff" strokeOpacity="0.07" strokeDasharray="3 3" />
                    <line x1="0" y1="130" x2="700" y2="130" stroke="#ffffff" strokeOpacity="0.07" strokeDasharray="3 3" />

                    {/* Total Tickets Blue Line */}
                    <path
                      d="M 20 140 Q 120 120, 220 90 T 420 50 T 620 25 L 680 18"
                      fill="none"
                      stroke="#3B82F6"
                      strokeWidth="2.5"
                    />

                    {/* AI Autonomous Resolved Violet Fill & Line */}
                    <path
                      d="M 20 148 Q 120 135, 220 110 T 420 80 T 620 52 L 680 44 L 680 160 L 20 160 Z"
                      fill="url(#violetGradient)"
                    />
                    <path
                      d="M 20 148 Q 120 135, 220 110 T 420 80 T 620 52 L 680 44"
                      fill="none"
                      stroke="#6D5BD0"
                      strokeWidth="3"
                    />

                    {/* Data Points */}
                    {AI_DEFLECTION_CHART_DATA.today.map((pt, i) => {
                      const cx = 20 + i * 94;
                      const cy = 148 - (pt.aiResolved / 235) * 104;
                      return (
                        <circle
                          key={i}
                          cx={cx}
                          cy={cy}
                          r={hoveredPoint?.time === pt.time ? 6 : 3.5}
                          className="fill-white stroke-[#6D5BD0] stroke-2 cursor-pointer transition-all"
                          onMouseEnter={() => setHoveredPoint(pt)}
                          onMouseLeave={() => setHoveredPoint(null)}
                        />
                      );
                    })}
                  </svg>

                  {/* Chart Tooltip */}
                  {hoveredPoint && (
                    <div className="absolute top-2 right-4 bg-slate-900 border border-white/20 p-2.5 rounded-xl shadow-xl text-xs z-30">
                      <div className="font-bold text-white mb-1">Time: {hoveredPoint.time}</div>
                      <div className="flex items-center gap-2 text-violet-300 font-mono">
                        <span>✨ AI Resolved:</span>
                        <strong>{hoveredPoint.aiResolved}</strong>
                      </div>
                      <div className="flex items-center gap-2 text-blue-300 font-mono">
                        <span>Total Volume:</span>
                        <strong>{hoveredPoint.totalTickets}</strong>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-3 border-t border-white/10">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5 text-blue-400">
                      <span className="w-2 h-2 rounded-full bg-blue-500" /> Total Intake (320)
                    </span>
                    <span className="flex items-center gap-1.5 text-violet-300">
                      <span className="w-2 h-2 rounded-full bg-[#6D5BD0]" /> AI Handled Autonomously (235)
                    </span>
                  </div>
                  <span className="text-slate-300">~38 Agent Hours Saved Today</span>
                </div>
              </div>

              {/* DARK CARD 2 (4 COLS): LIVE BANK OUTAGE & PULSE */}
              <div className="lg:col-span-4 bg-[#111217] text-white border border-white/10 rounded-[24px] p-5 sm:p-6 flex flex-col justify-between shadow-xl">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Live Bank Gateway Pulse
                    </span>
                    <span className="flex items-center gap-1 text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                      1 Bank Incident
                    </span>
                  </div>

                  <div className="space-y-3">
                    {BANK_OUTAGE_INCIDENTS.map((inc) => (
                      <div key={inc.id} className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-white">{inc.bank}</span>
                          <span className="text-[10px] font-mono text-amber-300 font-semibold">{inc.impactedCount} held</span>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-snug">
                          {inc.aiDiagnosis}
                        </p>
                        {inc.status === 'auto_healed_available' && (
                          <button
                            type="button"
                            onClick={() => handleBulkRetry(inc.id)}
                            className="w-full mt-2 py-2 rounded-full bg-slate-950 hover:bg-slate-900 border border-violet-500/40 text-violet-300 hover:text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                          >
                            <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                            <span>{inc.actionLabel}</span>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {bulkRetrySuccess && (
                    <div className="mt-3 p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-medium animate-fade-in">
                      {bulkRetrySuccess}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-white/10 flex justify-between text-[11px] text-slate-400">
                  <span>HDFC · ICICI · SBI · Axis</span>
                  <span className="text-emerald-400 font-semibold">Switch Health 99.2%</span>
                </div>
              </div>
            </div>

            {/* ─── ROW 3: DUAL-PANE L1 DECISION WORKBENCH (QUEUE VS AI DOSSIER) ─── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 min-h-[500px]">
              
              {/* LEFT PANE (5 COLS): L1 QUEUE STREAM */}
              <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-[24px] p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Pending Action Stream ({filteredTickets.length})
                    </span>

                    {/* Filter Pills */}
                    <div className="flex items-center gap-1">
                      {(['needs_approval', 'all', 'resolved'] as const).map((flt) => (
                        <button
                          key={flt}
                          type="button"
                          onClick={() => setQueueFilter(flt)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition cursor-pointer ${
                            queueFilter === flt
                              ? 'bg-slate-950 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {flt === 'needs_approval' && 'Needs Approval'}
                          {flt === 'all' && 'All'}
                          {flt === 'resolved' && 'Resolved'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tickets List */}
                  <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1 custom-scrollbar">
                    {filteredTickets.map((tkt) => {
                      const isSelected = selectedTicket.id === tkt.id;
                      return (
                        <div
                          key={tkt.id}
                          onClick={() => setSelectedTicket(tkt)}
                          className={`p-3.5 rounded-2xl border transition cursor-pointer relative ${
                            isSelected
                              ? 'bg-blue-50/50 border-blue-400 shadow-sm'
                              : 'bg-slate-50/70 border-slate-200/70 hover:bg-slate-100 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-[10px] text-slate-400 font-semibold">{tkt.ticketNumber}</span>
                                <span className="text-xs font-bold text-slate-950">{tkt.merchantName}</span>
                              </div>
                              <h4 className="text-xs font-semibold text-slate-700 mt-1 line-clamp-1">{tkt.issueTitle}</h4>
                            </div>

                            <span className="font-mono font-extrabold text-xs text-slate-950 shrink-0">
                              ₹{tkt.amount.toLocaleString('en-IN')}
                            </span>
                          </div>

                          {/* AI Pre-investigated Badge (Violet) */}
                          <div className="mt-2.5 flex items-center justify-between text-[10px]">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-violet-50 text-[#6D5BD0] font-bold border border-violet-200">
                              <Sparkles className="w-3 h-3 text-[#6D5BD0]" />
                              <span>AI Ready ({tkt.aiPreInvestigation.confidenceScore}% match)</span>
                            </span>

                            <span className={`font-mono font-semibold ${tkt.slaMinutes <= 15 ? 'text-rose-600' : 'text-slate-500'}`}>
                              {tkt.status === 'resolved' ? '✓ Closed' : `SLA: ${tkt.slaMinutes}m left`}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-between text-[11px] text-slate-400 font-mono">
                  <span>Frontline L1 Queue</span>
                  <span>70% Deflected Autonomously</span>
                </div>
              </div>

              {/* RIGHT PANE (7 COLS): AI 1-CLICK DECISION DOSSIER */}
              <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-[24px] p-5 sm:p-6 flex flex-col justify-between">
                <div>
                  
                  {/* Top Dossier Header */}
                  <div className="flex justify-between items-start pb-4 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-slate-400 font-semibold">{selectedTicket.ticketNumber}</span>
                        <h3 className="font-extrabold text-base text-slate-950">{selectedTicket.merchantName}</h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {selectedTicket.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 font-mono">
                        MID: {selectedTicket.merchantId} · {selectedTicket.bankName} •••• {selectedTicket.accountLast4}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-slate-400 font-medium block">Disputed / Hold Amount</span>
                      <span className="text-xl font-extrabold text-slate-950 font-mono">
                        ₹{selectedTicket.amount.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* ─── VIOLET AI INVESTIGATION DOSSIER CARD (#6D5BD0) ─────────────── */}
                  <div className="my-4 p-4.5 rounded-2xl bg-violet-50/80 border border-violet-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-[#6D5BD0] text-white flex items-center justify-center">
                          <Sparkles className="w-4 h-4 fill-white" />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-xs text-[#6D5BD0] uppercase tracking-wider">
                            Sulajh AI Pre-Investigation Report
                          </h4>
                          <span className="text-[10px] text-slate-500 font-medium">Zero Manual Banking Portal Search Required</span>
                        </div>
                      </div>

                      <span className="px-2.5 py-1 rounded-full bg-white text-[#6D5BD0] font-bold text-xs border border-violet-200 shadow-2xs font-mono">
                        {selectedTicket.aiPreInvestigation.confidenceScore}% Confidence
                      </span>
                    </div>

                    <div className="text-xs space-y-2 text-slate-700">
                      <p className="leading-relaxed font-medium">
                        <strong>Root Cause Diagnosis:</strong> {selectedTicket.aiPreInvestigation.rootCause}
                      </p>
                      
                      {/* Portals cross-checked chip strip */}
                      <div className="flex items-center gap-1.5 flex-wrap pt-1">
                        <span className="text-[10px] font-bold text-slate-500">Portals Cross-Checked:</span>
                        {selectedTicket.aiPreInvestigation.portalsCrossChecked.map((portal, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded bg-white text-slate-700 text-[10px] font-semibold border border-slate-200 shadow-2xs">
                            ✓ {portal}
                          </span>
                        ))}
                      </div>

                      <div className="p-3 rounded-xl bg-white border border-violet-100 text-xs">
                        <span className="text-[#6D5BD0] font-bold block mb-0.5">AI Recommended Action:</span>
                        <p className="text-slate-800 font-medium">{selectedTicket.aiPreInvestigation.recommendedAction}</p>
                      </div>
                    </div>
                  </div>

                  {/* ─── MATHEMATICAL LEDGER BREAKDOWN ─────────────────────────────── */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Mathematical Ledger Audit (Zero Hallucination Verification)
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono">
                      <div>
                        <span className="text-slate-400 text-[10px]">Gross Sales</span>
                        <p className="font-bold text-slate-900">₹{selectedTicket.aiPreInvestigation.ledgerMath.gross.toLocaleString('en-IN')}</p>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px]">MDR Fee (2%)</span>
                        <p className="font-bold text-rose-600">-₹{selectedTicket.aiPreInvestigation.ledgerMath.commission.toLocaleString('en-IN')}</p>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px]">18% GST</span>
                        <p className="font-bold text-rose-600">-₹{selectedTicket.aiPreInvestigation.ledgerMath.gst.toLocaleString('en-IN')}</p>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px]">Net Payout</span>
                        <p className="font-extrabold text-emerald-700">₹{selectedTicket.aiPreInvestigation.ledgerMath.net.toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                  </div>

                </div>

                {/* ─── AGENT ACTION BAR ────────────────────────────────────────── */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-xs text-slate-500 font-medium">Policy Rule: {selectedTicket.aiPreInvestigation.rbiRuleRef}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Escalate button */}
                    <button
                      type="button"
                      onClick={() => handleEscalateTicket(selectedTicket)}
                      disabled={isProcessingDecision}
                      className="px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
                    >
                      Escalate (4-Eye)
                    </button>

                    {/* 1-Click Approve Black Pill */}
                    <button
                      type="button"
                      onClick={() => handleApproveTicket(selectedTicket)}
                      disabled={isProcessingDecision || selectedTicket.status === 'resolved'}
                      className="px-6 py-2.5 rounded-full bg-slate-950 hover:bg-slate-800 disabled:opacity-40 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                    >
                      {selectedTicket.status === 'resolved' ? (
                        <>
                          <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Approved & Disbursed</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                          <span>1-Click Approve & Disburse (₹{selectedTicket.amount.toLocaleString('en-IN')})</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* ─── VIEW 2: AI DEFLECTION VELOCITY & PERFORMANCE ────────────────────── */}
        {activeRailTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8 bg-[#111217] text-white border border-white/10 rounded-[24px] p-6 shadow-xl">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="font-bold text-base">Sulajh AI Cumulative Deflection Impact</h3>
                    <p className="text-xs text-slate-400">Total merchant tickets deflected vs frontline agent time saved</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 font-bold text-xs">
                    73.4% Cumulative Rate
                  </span>
                </div>
                <div className="h-56 flex items-center justify-center text-slate-400 text-xs border border-white/5 rounded-2xl bg-white/5">
                  <div className="text-center space-y-2">
                    <BarChart3 className="w-8 h-8 text-blue-400 mx-auto" />
                    <p className="font-bold text-white">235 of 320 Tickets Handled Autonomously Today</p>
                    <p className="text-slate-400 text-[11px]">Frontline queue load reduced from 300 to ~48 human review cases.</p>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4 bg-white border border-slate-200/90 rounded-[24px] p-6 space-y-4">
                <h3 className="font-bold text-slate-950 text-base">Agent Efficiency Summary</h3>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between p-3 rounded-xl bg-slate-50">
                    <span className="text-slate-500">Average Review Time:</span>
                    <strong className="text-slate-900 font-mono">1m 24s</strong>
                  </div>
                  <div className="flex justify-between p-3 rounded-xl bg-slate-50">
                    <span className="text-slate-500">Manual Portal Cross-Checks:</span>
                    <strong className="text-emerald-700 font-mono">0 (AI Automated)</strong>
                  </div>
                  <div className="flex justify-between p-3 rounded-xl bg-slate-50">
                    <span className="text-slate-500">Accuracy / Hallucination Rate:</span>
                    <strong className="text-emerald-700 font-mono">0.0% (Ledger Verified)</strong>
                  </div>
                  <div className="flex justify-between p-3 rounded-xl bg-violet-50 text-[#6D5BD0] font-bold">
                    <span>Shift Productivity Boost:</span>
                    <span>+4.2x Faster</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── VIEW 3: BANK OUTAGE WAR ROOM ───────────────────────────────────── */}
        {activeRailTab === 'incidents' && (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-gradient-to-r from-rose-50 to-amber-50 border border-rose-200/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <AlertOctagon className="w-5 h-5 text-rose-600" />
                  <h3 className="font-extrabold text-slate-950 text-base">Live Core Banking Outages & Holdback Clusters</h3>
                </div>
                <p className="text-xs text-slate-600 mt-1 max-w-xl">
                  Sulajh AI continuously maps RBI bank clearing anomalies and branch mergers to prevent mass support escalations.
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleBulkRetry('INC-HDFC-01')}
                className="px-5 py-2.5 rounded-full bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer shadow-xs shrink-0 flex items-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>Bulk Re-Route All (42 Payouts)</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {BANK_OUTAGE_INCIDENTS.map((inc) => (
                <div key={inc.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-mono text-xs text-slate-400">{inc.id}</span>
                      <h4 className="font-extrabold text-slate-950 text-base">{inc.bank}</h4>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800">
                      {inc.impactedCount} Merchants Affected
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">{inc.aiDiagnosis}</p>

                  <div className="pt-2 border-t border-slate-200/60 flex justify-between items-center text-xs">
                    <span className="text-slate-500">Total Held Volume:</span>
                    <span className="font-mono font-extrabold text-slate-950">₹{inc.amountTotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── VIEW 4: RBI COMPLIANCE & AUDIT TRAIL ─────────────────────────────── */}
        {activeRailTab === 'audit' && (
          <div className="space-y-5">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <div>
                  <h4 className="font-bold text-slate-950 text-xs">Statutory RBI Circular Audit Log</h4>
                  <p className="text-[11px] text-slate-500">Every AI automated resolution is backed by an immutable ledger citation.</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                100% Audit Verified
              </span>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200/70">
                  <tr>
                    <th className="py-3 px-4">Event Ref</th>
                    <th className="py-3 px-4">Merchant</th>
                    <th className="py-3 px-4">Resolution Type</th>
                    <th className="py-3 px-4">Action Taken</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                    <th className="py-3 px-4 text-center">RBI Rule</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {OPS_TICKETS.map((tkt) => (
                    <tr key={tkt.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4 font-bold text-slate-900">{tkt.ticketNumber}</td>
                      <td className="py-3 px-4 text-slate-700 font-sans">{tkt.merchantName}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-violet-50 text-[#6D5BD0] font-bold text-[10px]">
                          Sulajh AI
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-sans line-clamp-1">{tkt.aiPreInvestigation.recommendedAction}</td>
                      <td className="py-3 px-4 text-right font-extrabold text-slate-950">₹{tkt.amount.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-4 text-center text-slate-400 text-[10px]">{tkt.aiPreInvestigation.rbiRuleRef.slice(0, 18)}...</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ─── VIEW 5: AGENT SETTINGS & SHIFT CONTROLS ──────────────────────────── */}
        {activeRailTab === 'settings' && (
          <div className="max-w-2xl space-y-5">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <h3 className="font-extrabold text-slate-950 text-base">L1 Executive Workstation Profile</h3>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400">Agent Name:</span>
                  <p className="font-bold text-slate-900 mt-0.5">{L1_AGENT_INFO.name}</p>
                </div>
                <div>
                  <span className="text-slate-400">Employee ID:</span>
                  <p className="font-mono font-bold text-slate-900 mt-0.5">{L1_AGENT_INFO.empId}</p>
                </div>
                <div>
                  <span className="text-slate-400">Active Shift:</span>
                  <p className="font-bold text-slate-900 mt-0.5">{L1_AGENT_INFO.shift}</p>
                </div>
                <div>
                  <span className="text-slate-400">Autonomous Limit Threshold:</span>
                  <p className="font-bold text-emerald-700 mt-0.5">₹25,000 (Tier-1 Standard)</p>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 text-xs">
              <h4 className="font-bold text-slate-950">Quick Portals & Connected Roles</h4>
              <div className="flex flex-wrap gap-2.5">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-slate-800 font-bold transition shadow-2xs cursor-pointer flex items-center gap-1.5"
                >
                  <span>Merchant Dashboard</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/chat')}
                  className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-slate-800 font-bold transition shadow-2xs cursor-pointer flex items-center gap-1.5"
                >
                  <span>Merchant Chat Desk</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/admin')}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition shadow-2xs cursor-pointer flex items-center gap-1.5"
                >
                  <span>Risk Admin & Policies</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/demo-control')}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold transition shadow-2xs cursor-pointer flex items-center gap-1.5"
                >
                  <span>Demo Event Injector</span>
                  <ExternalLink className="w-3.5 h-3.5 text-violet-200" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── QUIET FOOTER ────────────────────────────────────────────────────── */}
        <footer className="mt-8 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
            <span>Sulajh AI Tier-1 Ops Console · Event-Driven Architecture</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Shift Target: 300 Tickets</span>
            <span>AI Deflection: 73.4%</span>
            <span className="text-slate-500">v2.4 Production</span>
          </div>
        </footer>

      </main>

    </div>
  );
}
