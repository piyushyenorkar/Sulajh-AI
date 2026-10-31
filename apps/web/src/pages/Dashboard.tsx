import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  LayoutGrid, 
  BarChart3, 
  Wallet, 
  ShieldAlert, 
  Settings, 
  LogOut, 
  Search, 
  Bell, 
  ArrowUpRight, 
  Clock, 
  AlertTriangle, 
  Sparkles,
  MessageSquareText,
  User,
  ShieldCheck,
  Zap,
  Receipt,
  CheckCircle2,
  Sliders,
  Building2,
  Radio,
  ExternalLink,
  Download,
  FileSpreadsheet,
  Check,
  ChevronRight,
  TrendingUp,
  Percent,
  Timer
} from 'lucide-react';

import { 
  MERCHANT_INFO, 
  KPIS, 
  LATEST_SETTLEMENT, 
  RECENT_SETTLEMENTS, 
  OPEN_DISPUTES,
  CALM_ALERT,
  SettlementTransaction,
  DisputeItem
} from '../data/merchantDashboardData';

import { KpiCard } from '../components/dashboard/KpiCard';
import { StackedBar } from '../components/dashboard/StackedBar';
import { DarkChartCard } from '../components/dashboard/DarkChartCard';
import { ActivityHeatmap } from '../components/dashboard/ActivityHeatmap';
import { DisputeCard } from '../components/dashboard/DisputeCard';
import { SettlementRow } from '../components/dashboard/SettlementRow';
import { DeductionModal } from '../components/dashboard/DeductionModal';
import { ChatPanel } from '../components/dashboard/ChatPanel';
import { StatusChip } from '../components/dashboard/StatusChip';
import { MoneyAmount } from '../components/dashboard/MoneyAmount';
import { api } from '../lib/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get('tab') as 'dashboard' | 'settlements' | 'passbook' | 'disputes' | 'settings' | null;

  // Active Session Information (Dynamic for current logged in user)
  const session = api.getSession();
  const businessName = session?.user?.businessName || (session?.user?.name ? `${session.user.name}'s Food Plaza` : "Piyush's Food Plaza");
  const ownerName = session?.user?.name || "Piyush";
  const avatarInitials = ownerName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || 'P';
  const bankAccount = session?.user?.bankLast4 ? `HDFC Bank •••• ${session.user.bankLast4}` : 'HDFC Bank •••• 5223';
  const userEmail = session?.user?.email || 'piyush@foodplaza.in';
  const userPhone = session?.user?.phone || '+91 98765 43210';

  // Active Navigation Tab on the Slim Left Rail
  const [activeTab, setActiveTab] = useState<'dashboard' | 'settlements' | 'passbook' | 'disputes' | 'settings'>(tabParam || 'dashboard');

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  // Search Query
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Drawers
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInitialPrompt, setChatInitialPrompt] = useState<string | undefined>(undefined);
  const [selectedSettlement, setSelectedSettlement] = useState<SettlementTransaction | null>(null);
  const [isDeductionModalOpen, setIsDeductionModalOpen] = useState(false);

  // Calm Banner State
  const [showCalmBanner, setShowCalmBanner] = useState(true);

  // Passbook Filter State
  const [passbookFilter, setPassbookFilter] = useState<'all' | 'paid' | 'delayed' | 'failed'>('all');

  // Policy Cap Settings State
  const [policyThreshold, setPolicyThreshold] = useState(5000);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Handlers
  const handleOpenWhyThisAmount = (stl: SettlementTransaction) => {
    setSelectedSettlement(stl);
    setIsDeductionModalOpen(true);
  };

  const handleOpenLatestBreakdown = () => {
    const latestTx = RECENT_SETTLEMENTS[0];
    setSelectedSettlement(latestTx);
    setIsDeductionModalOpen(true);
  };

  const handleTriggerChatWithPrompt = (prompt: string) => {
    navigate(`/chat?prompt=${encodeURIComponent(prompt)}`);
  };

  const handleUploadProof = (dispute: DisputeItem) => {
    handleTriggerChatWithPrompt(`I want to upload delivery evidence for dispute ${dispute.disputeId} of ₹${dispute.amount}`);
  };

  const handleSignOut = () => {
    api.clearSession();
    navigate('/login');
  };

  const handleSaveSettings = () => {
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2500);
  };

  return (
    <div className="h-screen max-h-screen overflow-hidden flex flex-col md:flex-row antialiased selection:bg-blue-500/20 selection:text-blue-600 font-sans p-2 sm:p-3 md:p-4 lg:p-5 bg-[#0B0B0F]">
      
      {/* ─── SLIM VERTICAL ICON RAIL (LEFT BAR ON DESKTOP, BOTTOM TAB BAR ON MOBILE) ─── */}
      <aside className="w-full md:w-16 lg:w-18 shrink-0 flex md:flex-col items-center justify-between py-2 md:py-6 px-3 md:px-0 z-30 order-2 md:order-1 bg-[#0B0B0F]">
        
        {/* Top: Stylized 4-Point Blue/White Sparkle Brand Logo */}
        <div className="hidden md:flex items-center justify-center mb-6">
          <div 
            onClick={() => setActiveTab('dashboard')}
            className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 via-blue-400 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 cursor-pointer hover:scale-105 transition"
            title="Sulajh AI"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 0C12 6.627 6.627 12 0 12C6.627 12 12 17.373 12 24C12 17.373 17.373 12 24 12C17.373 12 12 6.627 12 0Z" />
            </svg>
          </div>
        </div>

        {/* Middle: 6 Circular / Round Icon Buttons */}
        <div className="flex md:flex-col items-center justify-around md:justify-center w-full md:space-y-4">
          
          {/* 1. Dashboard (Active by default -> Solid White Filled Circle) */}
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-white text-slate-950 shadow-md scale-105'
                : 'text-slate-400 hover:text-white hover:bg-white/10'
            }`}
            title="Dashboard Overview"
          >
            <LayoutGrid className="w-4.5 h-4.5 stroke-[2.2]" />
          </button>

          {/* 2. Settlements & Charts */}
          <button
            type="button"
            onClick={() => setActiveTab('settlements')}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer ${
              activeTab === 'settlements'
                ? 'bg-white text-slate-950 shadow-md scale-105'
                : 'text-slate-400 hover:text-white hover:bg-white/10'
            }`}
            title="Settlement Performance"
          >
            <BarChart3 className="w-4.5 h-4.5 stroke-[2]" />
          </button>

          {/* 3. Payouts / Passbook */}
          <button
            type="button"
            onClick={() => setActiveTab('passbook')}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer ${
              activeTab === 'passbook'
                ? 'bg-white text-slate-950 shadow-md scale-105'
                : 'text-slate-400 hover:text-white hover:bg-white/10'
            }`}
            title="Settlement Passbook & Ledger"
          >
            <Wallet className="w-4.5 h-4.5 stroke-[2]" />
          </button>

          {/* 4. Disputes / Defense */}
          <button
            type="button"
            onClick={() => setActiveTab('disputes')}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer ${
              activeTab === 'disputes'
                ? 'bg-white text-slate-950 shadow-md scale-105'
                : 'text-slate-400 hover:text-white hover:bg-white/10'
            }`}
            title="Open Disputes & Defense"
          >
            <ShieldAlert className="w-4.5 h-4.5 stroke-[2]" />
          </button>

          {/* 5. Switch to Full Chat Workspace */}
          <button
            type="button"
            onClick={() => navigate('/chat')}
            className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:text-blue-400 hover:bg-white/10 transition-all cursor-pointer"
            title="Open 24x7 Settlement Chat Desk"
          >
            <MessageSquareText className="w-4.5 h-4.5 stroke-[2]" />
          </button>

          {/* 6. Settings */}
          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`hidden md:flex w-10 h-10 rounded-full items-center justify-center transition-all duration-200 cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-white text-slate-950 shadow-md scale-105'
                : 'text-slate-400 hover:text-white hover:bg-white/10'
            }`}
            title="Settings & Policies"
          >
            <Settings className="w-4.5 h-4.5 stroke-[2]" />
          </button>
        </div>

        {/* Bottom: Logout Icon Button */}
        <div className="hidden md:flex mt-auto pt-4">
          <button
            type="button"
            onClick={handleSignOut}
            className="w-10 h-10 rounded-full flex items-center justify-center text-slate-500 hover:text-rose-400 hover:bg-white/5 transition-colors cursor-pointer"
            title="Exit / Sign Out"
          >
            <LogOut className="w-4.5 h-4.5 stroke-[2]" />
          </button>
        </div>
      </aside>

      {/* ─── MAIN WHITE PANEL (CONSTRAINED TO SCREEN, NO DOUBLE SCROLLBARS) ───── */}
      <main className="flex-1 h-full max-h-[calc(100vh-1rem)] md:max-h-[calc(100vh-2.5rem)] bg-white rounded-[28px] p-5 sm:p-7 md:p-8 flex flex-col min-h-0 relative shadow-2xl overflow-y-auto order-1 md:order-2 custom-scrollbar">
        
        {/* ─── TOP HEADER ──────────────────────────────────────────────────────── */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-2 shrink-0">
          
          {/* Left Title */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
              {activeTab === 'dashboard' && 'Dashboard'}
              {activeTab === 'settlements' && 'Settlement Performance & Bank Speed'}
              {activeTab === 'passbook' && 'Settlement Passbook & Ledger'}
              {activeTab === 'disputes' && 'Dispute Defense Center'}
              {activeTab === 'settings' && 'Account & Policy Guardrails'}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-semibold text-slate-700">
                {businessName}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[11px] font-medium text-slate-400 font-mono">
                {bankAccount}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-[11px] font-medium text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Autonomous Limits Active
              </span>
            </div>
          </div>

          {/* Right Controls: Pill Search, Bell Notification, Avatar */}
          <div className="flex items-center gap-3">
            
            {/* Pill Search Field */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search payouts, UTR, disputes..."
                className="w-48 sm:w-60 bg-slate-100/80 hover:bg-slate-100 focus:bg-white focus:ring-1 focus:ring-slate-950 rounded-full pl-9 pr-4 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 transition-all outline-none"
              />
            </div>

            {/* Bell Icon Button */}
            <button
              type="button"
              onClick={() => handleTriggerChatWithPrompt('Show me recent alerts and settlement notifications')}
              className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition cursor-pointer relative shadow-2xs"
              title="Notifications"
            >
              <Bell className="w-4 h-4 stroke-[2]" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
            </button>

            {/* Merchant Avatar */}
            <div 
              onClick={() => setActiveTab('settings')}
              className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-sm cursor-pointer hover:ring-2 hover:ring-blue-300 transition"
              title={ownerName}
            >
              {avatarInitials}
            </div>
          </div>
        </header>

        {/* ─── CALM SETTLEMENT NOTIFICATION BANNER ─────────────────────────────── */}
        {showCalmBanner && (
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-blue-50/90 via-indigo-50/70 to-slate-50 border border-blue-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs animate-slide-down shrink-0">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-950">
                    Autonomous Settlement Action Active
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
                    Sulajh AI
                  </span>
                </div>
                <p className="text-slate-600 mt-0.5 leading-snug">
                  {CALM_ALERT.message}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              <button
                type="button"
                onClick={() => handleTriggerChatWithPrompt('Mera kal ka pending payout ₹4,735.54 IFSC update karke re-initiate karo')}
                className="px-4 py-1.5 rounded-full bg-slate-950 hover:bg-slate-800 text-white font-semibold text-xs shadow-xs transition cursor-pointer flex items-center gap-1.5"
              >
                <span>Chat with AI</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-blue-400" />
              </button>
              <button
                type="button"
                onClick={() => setShowCalmBanner(false)}
                className="text-slate-400 hover:text-slate-600 text-xs px-2 py-1 cursor-pointer"
                title="Dismiss banner"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* ─── TAB 1: MASTER DASHBOARD ────────────────────────────────────────── */}
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 flex-1">
            
            {/* Left Column (8 COLS): Row 1 KPIs + Row 2 Wide Chart */}
            <div className="lg:col-span-8 flex flex-col gap-5 sm:gap-6">
              
              {/* Row 1: Three KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
                <KpiCard
                  title="Total received this month"
                  amount={KPIS.totalReceivedMonth}
                  badge={{ text: `+${KPIS.monthChangePercent}%`, type: 'black-pill' }}
                  note="vs previous month"
                  icon={<ArrowUpRight className="w-3.5 h-3.5" />}
                />

                <KpiCard
                  title="Pending payouts"
                  amount={KPIS.pendingPayoutsAmount}
                  badge={{ text: `${KPIS.pendingCount} payouts`, type: 'subtle' }}
                  note="Auto-fixing bank IFSC"
                  icon={<Clock className="w-3.5 h-3.5" />}
                />

                <KpiCard
                  title="Deductions this month"
                  amount={KPIS.deductionsThisMonth}
                  note={KPIS.deductionsNote}
                  icon={<Receipt className="w-3.5 h-3.5" />}
                />
              </div>

              {/* Row 2: Wide Dark Chart Card */}
              <DarkChartCard />
            </div>

            {/* Right Column (4 COLS): Tall Card "My Settlements" */}
            <div className="lg:col-span-4 flex flex-col">
              <StackedBar
                breakdown={LATEST_SETTLEMENT.breakdown}
                onOpenBreakdown={handleOpenLatestBreakdown}
                onRequestPayout={() => handleTriggerChatWithPrompt('Transfer my unsettled earnings right now via instant IMPS')}
                statusText={LATEST_SETTLEMENT.status === 'paid' ? 'Settled' : 'Pending'}
                expectedDate={LATEST_SETTLEMENT.expectedDate}
              />
            </div>

            {/* Row 3: Three Balanced Bottom Cards */}
            <div className="lg:col-span-4 flex flex-col">
              <ActivityHeatmap />
            </div>

            <div className="lg:col-span-4 flex flex-col">
              <DisputeCard
                onUploadProof={handleUploadProof}
                onViewAll={() => setActiveTab('disputes')}
              />
            </div>

            <div className="lg:col-span-4 bg-white border border-slate-200/90 rounded-[24px] p-5.5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-slate-500">
                    Recent settlements
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveTab('passbook')}
                    className="text-xs font-semibold text-slate-400 hover:text-slate-700 transition cursor-pointer"
                  >
                    View all (28) →
                  </button>
                </div>

                <div className="divide-y divide-slate-100">
                  {RECENT_SETTLEMENTS.slice(0, 4).map((stl) => (
                    <SettlementRow
                      key={stl.id}
                      settlement={stl}
                      onWhyThisAmount={handleOpenWhyThisAmount}
                    />
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>{bankAccount}</span>
                <span className="text-blue-600 font-semibold cursor-pointer hover:underline" onClick={() => navigate('/chat')}>
                  Open Full Chat Desk →
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 2: SETTLEMENT PERFORMANCE & BANK SPEED ─────────────────────── */}
        {activeTab === 'settlements' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8">
                <DarkChartCard />
              </div>
              <div className="lg:col-span-4">
                <StackedBar
                  breakdown={LATEST_SETTLEMENT.breakdown}
                  onOpenBreakdown={handleOpenLatestBreakdown}
                  onRequestPayout={() => handleTriggerChatWithPrompt('Transfer my unsettled earnings right now via instant IMPS')}
                  statusText={LATEST_SETTLEMENT.status === 'paid' ? 'Settled' : 'Pending'}
                  expectedDate={LATEST_SETTLEMENT.expectedDate}
                />
              </div>
            </div>

            {/* Bank Delivery Speed & Efficiency Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-500">HDFC Bank (Primary Node)</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">99.4% On-time</span>
                </div>
                <div className="text-xl font-extrabold text-slate-950">2.1 hrs</div>
                <p className="text-[11px] text-slate-500">Average UTR clearing delivery timeline</p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-500">ICICI Bank Backup</span>
                  <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold text-[10px]">98.1% On-time</span>
                </div>
                <div className="text-xl font-extrabold text-slate-950">3.4 hrs</div>
                <p className="text-[11px] text-slate-500">Average UTR clearing delivery timeline</p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-500">State Bank of India</span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">91.8% On-time</span>
                </div>
                <div className="text-xl font-extrabold text-slate-950">8.5 hrs</div>
                <p className="text-[11px] text-slate-500">Requires IFSC auto-rerouting on merger days</p>
              </div>
            </div>

            <ActivityHeatmap />
          </div>
        )}

        {/* ─── TAB 3: PASSBOOK & FULL LEDGER ───────────────────────────────────── */}
        {activeTab === 'passbook' && (
          <div className="space-y-5">
            {/* Filter Pills */}
            <div className="flex items-center justify-between flex-wrap gap-3 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                {(['all', 'paid', 'delayed', 'failed'] as const).map((flt) => (
                  <button
                    key={flt}
                    type="button"
                    onClick={() => setPassbookFilter(flt)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                      passbookFilter === flt
                        ? 'bg-slate-950 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {flt === 'all' && 'All Transactions (28)'}
                    {flt === 'paid' && 'Settled (24)'}
                    {flt === 'delayed' && 'Pending Holdback (3)'}
                    {flt === 'failed' && 'Action Required (1)'}
                  </button>
                ))}
              </div>
              <div className="text-xs text-slate-400 font-mono">
                Showing {RECENT_SETTLEMENTS.length} of 28 records
              </div>
            </div>

            {/* Comprehensive Table */}
            <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200/70">
                    <tr>
                      <th className="py-3 px-4">Payout Date</th>
                      <th className="py-3 px-4">UTR / Ref ID</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Gross Sales</th>
                      <th className="py-3 px-4 text-right">Deductions</th>
                      <th className="py-3 px-4 text-right">Net Credited</th>
                      <th className="py-3 px-4 text-center">Hisaab Audit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {RECENT_SETTLEMENTS
                      .filter((st) => passbookFilter === 'all' || st.status === passbookFilter)
                      .map((st) => (
                        <tr key={st.id} className="hover:bg-slate-50/60 transition">
                          <td className="py-3.5 px-4 font-semibold text-slate-900">
                            {st.date}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-slate-500">
                            {st.utr || st.id}
                          </td>
                          <td className="py-3.5 px-4">
                            <StatusChip status={st.status} />
                          </td>
                          <td className="py-3.5 px-4 text-right font-medium text-slate-700">
                            <MoneyAmount amount={st.gross} />
                          </td>
                          <td className="py-3.5 px-4 text-right font-medium text-rose-600">
                            -<MoneyAmount amount={st.gross - st.amount} />
                          </td>
                          <td className="py-3.5 px-4 text-right font-extrabold text-slate-950">
                            <MoneyAmount amount={st.amount} />
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => handleOpenWhyThisAmount(st)}
                              className="text-blue-600 hover:text-blue-800 font-semibold text-[11px] underline cursor-pointer"
                            >
                              Why this amount?
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 4: DISPUTES & DEFENSE ───────────────────────────────────────── */}
        {activeTab === 'disputes' && (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-gradient-to-r from-rose-50 to-amber-50 border border-rose-200/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-rose-600" />
                  <h3 className="font-extrabold text-slate-950 text-base">Active Customer Dispute Defense</h3>
                </div>
                <p className="text-xs text-slate-600 mt-1 max-w-xl">
                  Sulajh AI monitors RBI chargeback SLA clocks 24x7. Submitting delivery proof before the statutory timer closes ensures 100% merchant recovery.
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleTriggerChatWithPrompt('Defend all pending customer disputes')}
                className="px-5 py-2.5 rounded-full bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer shadow-xs shrink-0"
              >
                Defend with AI
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {OPEN_DISPUTES.map((disp: DisputeItem) => (
                <div key={disp.disputeId} className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-mono text-xs text-slate-400">{disp.disputeId}</span>
                      <h4 className="font-extrabold text-slate-950 text-sm mt-0.5">{disp.reason}</h4>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800">
                      {disp.status}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs text-slate-600 pt-2 border-t border-slate-200/60">
                    <span>Disputed Amount:</span>
                    <span className="font-extrabold text-slate-950 text-sm">₹{disp.amount.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="flex justify-between items-center text-xs text-slate-600">
                    <span>SLA Deadline:</span>
                    <span className="font-mono text-rose-600 font-bold">{disp.daysRemaining * 24} hrs remaining</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleUploadProof(disp)}
                    className="w-full mt-2 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Upload Proof & Defend</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── TAB 5: SETTINGS & POLICIES ─────────────────────────────────────── */}
        {activeTab === 'settings' && (
          <div className="max-w-3xl space-y-6">
            
            {/* Merchant Identity */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
              <h3 className="font-extrabold text-slate-950 text-base flex items-center gap-2">
                <Building2 className="w-4 h-4 text-slate-600" />
                <span>Store Profile & Settlement Node</span>
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400">Business / Store Name:</span>
                  <p className="font-bold text-slate-900 mt-0.5">{businessName}</p>
                </div>
                <div>
                  <span className="text-slate-400">Store Owner Name:</span>
                  <p className="font-bold text-slate-900 mt-0.5">{ownerName}</p>
                </div>
                <div>
                  <span className="text-slate-400">Registered Email:</span>
                  <p className="font-mono font-medium text-slate-800 mt-0.5">{userEmail}</p>
                </div>
                <div>
                  <span className="text-slate-400">Registered Mobile:</span>
                  <p className="font-mono font-medium text-slate-800 mt-0.5">{userPhone}</p>
                </div>
                <div>
                  <span className="text-slate-400">Beneficiary Bank:</span>
                  <p className="font-bold text-slate-900 mt-0.5">{bankAccount}</p>
                </div>
                <div>
                  <span className="text-slate-400">Hardware Soundbox:</span>
                  <p className="font-mono font-bold text-slate-900 mt-0.5">{MERCHANT_INFO.soundboxId} (Battery {MERCHANT_INFO.soundboxBattery})</p>
                </div>
              </div>
            </div>

            {/* Autonomous Policy Guardrails */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-extrabold text-slate-950 text-base flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Autonomous Settlement Guardrails</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Amounts under this threshold are auto-cleared against verified bank feeds without human ops queue delay.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-base font-extrabold text-slate-950">₹{policyThreshold.toLocaleString('en-IN')}</span>
                  <span className="text-[10px] text-emerald-600 font-bold block">Autonomous Active</span>
                </div>
              </div>

              <input
                type="range"
                min="1000"
                max="25000"
                step="500"
                value={policyThreshold}
                onChange={(e) => setPolicyThreshold(Number(e.target.value))}
                className="w-full accent-slate-950 cursor-pointer"
              />

              <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                <span>Min: ₹1,000</span>
                <span>Current: ₹{policyThreshold.toLocaleString('en-IN')}</span>
                <span>Max: ₹25,000</span>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex items-center justify-between">
              {settingsSaved ? (
                <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5 animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Preferences saved successfully in Supabase & RBI policy ledger!</span>
                </span>
              ) : (
                <span className="text-xs text-slate-400">Verified against Paytm payment gateway node</span>
              )}

              <button
                type="button"
                onClick={handleSaveSettings}
                className="px-6 py-2.5 rounded-full bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer shadow-xs"
              >
                Save Preferences
              </button>
            </div>
          </div>
        )}

        {/* ─── QUIET FOOTER ────────────────────────────────────────────────────── */}
        <footer className="mt-8 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span>Simulated Paytm data · Production Architecture</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>MID: {MERCHANT_INFO.mid}</span>
            <span>Soundbox: {MERCHANT_INFO.soundboxId} ({MERCHANT_INFO.soundboxBattery})</span>
            <span className="text-slate-500">Sulajh AI v2.4</span>
          </div>
        </footer>

        {/* ─── SULAJH AI SLIDE-OVER CHAT PANEL ─────────────────────────────────── */}
        <ChatPanel
          isOpen={isChatOpen}
          onClose={() => {
            setIsChatOpen(false);
            setChatInitialPrompt(undefined);
          }}
          onOpen={() => setIsChatOpen(true)}
          initialPrompt={chatInitialPrompt}
        />

        {/* ─── DEDUCTIONS BREAKDOWN MODAL SHEET ────────────────────────────────── */}
        <DeductionModal
          isOpen={isDeductionModalOpen}
          settlement={selectedSettlement}
          onClose={() => setIsDeductionModalOpen(false)}
        />

      </main>

    </div>
  );
}
