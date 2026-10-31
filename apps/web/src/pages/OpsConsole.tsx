import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardList,
  AlertOctagon,
  Zap,
  Info,
  Building2,
  Lock,
  CheckCircle2,
  Check,
  X,
  ChevronRight,
  BarChart3,
  Gamepad2,
  LogOut,
  Clock,
  ShieldAlert,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { api } from '../lib/api';

export default function OpsConsole() {
  const navigate = useNavigate();
  const session = api.getSession();

  const [activeTab, setActiveTab] = useState<'queue' | 'incidents'>('queue');
  const [cases, setCases] = useState<any[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [caseDetail, setCaseDetail] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  // Decision Modal
  const [decisionModalOpen, setDecisionModalOpen] = useState(false);
  const [decisionType, setDecisionType] = useState<'approved' | 'rejected'>('approved');
  const [decisionReason, setDecisionReason] = useState('');
  const [decisionLoading, setDecisionLoading] = useState(false);
  const [decisionError, setDecisionError] = useState<string | null>(null);

  // Incidents
  const [incidents, setIncidents] = useState<any[]>([]);
  const [bulkRetryLoading, setBulkRetryLoading] = useState(false);
  const [bulkRetrySuccess, setBulkRetrySuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!session || session.user.role === 'merchant') {
      navigate('/login');
      return;
    }
    loadData();
  }, [statusFilter, priorityFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      const casesRes = await api.getCases(statusFilter === 'all' ? undefined : statusFilter);
      if (casesRes.cases) {
        let filtered = casesRes.cases;
        if (priorityFilter !== 'all') {
          filtered = filtered.filter((c: any) => c.priority === priorityFilter);
        }
        setCases(filtered);

        if (!selectedCaseId && filtered.length > 0) {
          selectCase(filtered[0].id);
        }
      }

      const incRes = await api.getIncidents();
      if (incRes.incidents) {
        setIncidents(incRes.incidents);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const selectCase = async (id: string) => {
    setSelectedCaseId(id);
    try {
      const detail = await api.getCaseDetail(id);
      setCaseDetail(detail);
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenDecision = (type: 'approved' | 'rejected') => {
    setDecisionType(type);
    setDecisionReason(type === 'approved' ? 'Verified invoice and customer delivery proof.' : 'Dispute documentation insufficient.');
    setDecisionError(null);
    setDecisionModalOpen(true);
  };

  const handleExecuteDecision = async () => {
    if (!selectedCaseId || !decisionReason.trim()) return;

    setDecisionLoading(true);
    setDecisionError(null);

    try {
      const res = await api.submitCaseDecision(selectedCaseId, decisionType, decisionReason);
      if (res.ok) {
        setDecisionModalOpen(false);
        loadData();
        selectCase(selectedCaseId);
      } else {
        setDecisionError(res.error?.message || 'Failed to submit decision');
      }
    } catch {
      setDecisionError('API error during decision execution');
    } finally {
      setDecisionLoading(false);
    }
  };

  const handleBulkRetry = async (incidentId: string) => {
    setBulkRetryLoading(true);
    setBulkRetrySuccess(null);
    try {
      const res = await api.bulkRetryIncident(incidentId);
      if (res.ok) {
        setBulkRetrySuccess(`Bulk retry executed successfully: ${res.retried_count} payouts re-triggered.`);
        loadData();
      }
    } catch {
      setBulkRetrySuccess('Bulk retry failed.');
    } finally {
      setBulkRetryLoading(false);
    }
  };

  const merchant = caseDetail?.merchant || caseDetail?.case?.merchant;
  const activeApproval = caseDetail?.approval || caseDetail?.timeline?.approvals?.[0];
  const isL1Agent = session?.user.role === 'ops_agent';
  const isOverL1Limit = isL1Agent && activeApproval && activeApproval.amount > 25000;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans relative overflow-x-hidden">
      {/* Top Floating Glass Header */}
      <header className="sticky top-0 z-40 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto glass-strong border border-white/90 px-4 sm:px-6 py-2.5 flex items-center justify-between shadow-lg shadow-blue-900/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#002970] to-[#00BAF2] flex items-center justify-center text-white font-extrabold text-lg shadow-md shadow-sky-500/20">
              स
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base text-[#002970]">
                  Sulajh AI · Ops Command Center
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-[#002970] font-bold border border-blue-200">
                  Track 3 Teammate
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Signed in as: <strong className="text-slate-800">{session?.user.name}</strong> ({session?.user.role === 'ops_manager' ? 'Ops Manager · 2FA Verified' : 'L1 Ops Agent'})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/outcomes')}
              className="px-3 py-1.5 rounded-xl glass-btn text-xs font-bold text-slate-700 hover:text-[#002970] flex items-center gap-1.5"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Outcomes</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/demo-control')}
              className="px-3 py-1.5 rounded-xl glass-btn text-xs font-bold text-[#00BAF2] hover:text-[#002970] flex items-center gap-1.5"
            >
              <Gamepad2 className="w-3.5 h-3.5" />
              <span>Demo Control</span>
            </button>
            <button
              type="button"
              onClick={() => {
                api.clearSession();
                navigate('/login');
              }}
              className="px-3 py-1.5 rounded-xl glass-btn text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Dual-Pane Console */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-3 flex-1 flex flex-col space-y-3">
        {/* Navigation Tabs */}
        <div className="flex items-center justify-between">
          <div className="flex p-1 bg-slate-200/70 rounded-2xl border border-white/80">
            <button
              type="button"
              onClick={() => setActiveTab('queue')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 ${
                activeTab === 'queue'
                  ? 'bg-white text-[#002970] shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ClipboardList className="w-3.5 h-3.5 text-[#002970]" />
              <span>Decisions Queue ({cases.filter((c) => c.status === 'needs_approval').length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('incidents')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 ${
                activeTab === 'incidents'
                  ? 'bg-white text-[#002970] shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <AlertOctagon className="w-3.5 h-3.5 text-rose-500" />
              <span>Bank Outage Incidents</span>
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span>Filter Priority:</span>
            {(['all', 'high', 'medium', 'low'] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPriorityFilter(p)}
                className={`px-2.5 py-1 rounded-lg uppercase text-[10px] tracking-wider transition ${
                  priorityFilter === p
                    ? 'bg-[#002970] text-white'
                    : 'bg-white/80 text-slate-600 hover:bg-white'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'queue' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
            {/* Left Queue List (5 Cols) */}
            <div className="lg:col-span-5 glass-strong p-4 rounded-[28px] border border-white shadow-md flex flex-col space-y-2.5 max-h-[calc(100vh-170px)] overflow-y-auto">
              <div className="flex items-center justify-between px-1 pb-1 border-b border-slate-200/70">
                <span className="text-xs font-extrabold text-[#002970] uppercase tracking-wider">
                  Approval Queue
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  {cases.length} cases in review
                </span>
              </div>

              {cases.map((c) => {
                const isSelected = selectedCaseId === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => selectCase(c.id)}
                    className={`w-full p-3.5 rounded-2xl text-left transition-all duration-200 border ${
                      isSelected
                        ? 'bg-blue-50/90 border-[#00BAF2] ring-1 ring-[#00BAF2] shadow-sm'
                        : 'bg-white/70 border-slate-200/70 hover:bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2.5 h-2.5 rounded-full ${
                          c.priority === 'high' ? 'bg-rose-500 animate-pulse' : c.priority === 'medium' ? 'bg-amber-400' : 'bg-sky-400'
                        }`} />
                        <span className="text-xs font-extrabold text-[#002970] font-mono">
                          #{c.id.slice(0, 8)}
                        </span>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase ${
                        c.status === 'needs_approval'
                          ? 'bg-amber-100 text-amber-800'
                          : c.status === 'resolved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {c.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-0.5">
                      <span>{c.merchant?.business_name || 'Merchant ' + c.merchant_id}</span>
                      {c.approval && (
                        <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          ₹{c.approval.amount.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium mb-1">
                      {c.merchant?.category || 'Paytm Verified Merchant'} · Bank •••• {c.merchant?.bank_last4 || '••••'}
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-2 font-medium">
                      {c.summary || 'Pending investigation by autonomous teammate'}
                    </p>

                    <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400 mt-2 pt-1.5 border-t border-slate-200/50">
                      <span>Type: {c.type}</span>
                      <span>{new Date(c.opened_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Right Decision Pack (7 Cols) */}
            <div className="lg:col-span-7 glass-strong p-6 rounded-[28px] border border-white shadow-xl flex flex-col justify-between max-h-[calc(100vh-170px)] overflow-y-auto">
              {caseDetail ? (
                <div className="space-y-4">
                  {/* Case Header */}
                  <div className="flex items-start justify-between pb-3 border-b border-slate-200">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-extrabold text-[#002970]">
                          Ready-to-Decide Pack
                        </h2>
                        <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          #{caseDetail.case?.id.slice(0, 8)}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          caseDetail.case?.priority === 'high' ? 'bg-rose-100 text-rose-800' : 'bg-sky-100 text-[#002970]'
                        }`}>
                          {caseDetail.case?.priority} Priority
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 font-medium mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span>Merchant: <strong className="text-slate-900">{merchant?.business_name || 'Merchant ' + caseDetail.case?.merchant_id}</strong></span>
                        <span>·</span>
                        <span>Bank ending <strong className="text-slate-800">{merchant?.bank_last4 || '••••'}</strong></span>
                        <span>·</span>
                        <span className="text-slate-500">{merchant?.category || 'Paytm Verified'}</span>
                      </div>
                    </div>

                    <span className={`text-xs font-bold px-3 py-1 rounded-full border flex items-center gap-1.5 ${
                      activeApproval
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : caseDetail.case?.status === 'resolved'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-sky-50 text-[#002970] border-sky-200'
                    }`}>
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span>{activeApproval ? 'Awaiting Decision' : caseDetail.case?.status.replace('_', ' ').toUpperCase()}</span>
                    </span>
                  </div>

                  {/* L1 Warning Banner if Amount > 25K */}
                  {isOverL1Limit && (
                    <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
                      <Lock className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>
                        L1 Limit Locked: Amount of ₹{activeApproval?.amount.toLocaleString('en-IN')} exceeds L1 limit (₹25,000). Only Ops Manager with 2FA can approve.
                      </span>
                    </div>
                  )}

                  {/* Decision Hero Pack when Approval is needed */}
                  {activeApproval ? (
                    <div className="p-4 rounded-3xl bg-gradient-to-br from-white via-sky-50/40 to-blue-50/50 border border-sky-200 shadow-sm space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-[#00BAF2]" />
                          <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#002970]">
                            AI Teammate Recommendation
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-md bg-white border border-sky-200 text-[#002970]">
                            ₹{activeApproval.amount.toLocaleString('en-IN')}
                          </span>
                          <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                            activeApproval.risk_level === 'high'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            Risk Level: {activeApproval.risk_level}
                          </span>
                        </div>
                      </div>

                      <div className="text-xs font-semibold text-slate-800 leading-relaxed bg-white/80 p-3 rounded-2xl border border-white">
                        {activeApproval.summary}
                      </div>

                      <div className="p-3 rounded-2xl bg-emerald-50/90 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <div className="text-[10px] uppercase tracking-wider text-emerald-700 mb-0.5">Suggested Action</div>
                          <div>{activeApproval.recommendation}</div>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-900 text-white font-mono text-[11px] flex items-center justify-between">
                        <span className="text-slate-400">Action on Approve:</span>
                        <span className="text-emerald-400 font-bold truncate max-w-xs">{activeApproval.action_on_approve}</span>
                      </div>
                    </div>
                  ) : (
                    /* In-Progress / Autonomous Teammate Monitoring Banner */
                    <div className="p-4 rounded-3xl bg-gradient-to-br from-white via-slate-50 to-sky-50/30 border border-slate-200 shadow-sm space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-[#00BAF2]" />
                          <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#002970]">
                            Autonomous Teammate Handling Active
                          </span>
                        </div>
                        <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase bg-sky-100 text-[#002970]">
                          Autonomous Mode
                        </span>
                      </div>

                      <div className="text-xs font-medium text-slate-700 leading-relaxed bg-white/90 p-3 rounded-2xl border border-slate-200">
                        {caseDetail.case?.summary}
                      </div>

                      {caseDetail.settlement && (
                        <div className="p-3 rounded-2xl bg-amber-50/90 border border-amber-200 text-amber-900 text-xs font-semibold">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] uppercase tracking-wider text-amber-700">Associated Settlement</span>
                            <span className="font-mono font-bold text-amber-900">₹{caseDetail.settlement.net.toLocaleString('en-IN')}</span>
                          </div>
                          <div className="text-amber-800 text-[11px]">{caseDetail.settlement.failure_reason || 'Pending clearance'}</div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Chat Timeline Preview */}
                  <div className="space-y-2">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 block">
                      Case Conversation History
                    </span>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {caseDetail.timeline?.messages && caseDetail.timeline.messages.length > 0 ? (
                        caseDetail.timeline.messages.map((msg: any) => (
                          <div
                            key={msg.id}
                            className={`p-3 rounded-2xl text-xs ${
                              msg.sender === 'merchant'
                                ? 'bg-blue-50/80 border border-blue-100 text-blue-950 font-medium'
                                : 'bg-white border border-slate-200/80 text-slate-800'
                            }`}
                          >
                            <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                              <strong className="text-slate-700">{msg.sender === 'merchant' ? `Merchant (${merchant?.business_name || 'Merchant'})` : 'Sulajh AI Teammate'}</strong>
                              <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <div>{msg.text}</div>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-center text-xs text-slate-400 font-medium">
                          No merchant chat messages yet for this ticket. Generated from automated system monitoring.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
                    {activeApproval ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleOpenDecision('rejected')}
                          disabled={isOverL1Limit}
                          className="px-5 py-2.5 rounded-2xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-bold transition disabled:opacity-40"
                        >
                          Reject Request
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenDecision('approved')}
                          disabled={isOverL1Limit}
                          className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 text-white text-xs font-extrabold shadow-md shadow-emerald-600/20 transition disabled:opacity-40 flex items-center gap-2"
                        >
                          <span>1-Click Approve</span>
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleOpenDecision('approved')}
                        className="px-5 py-2.5 rounded-2xl bg-[#002970] text-white text-xs font-bold shadow-md hover:bg-[#002970]/90 transition"
                      >
                        Force Complete Case
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-xs font-semibold">
                  <span>Select a case from the queue to inspect decision pack</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Tab 2: Incidents View */
          <div className="glass-strong p-6 rounded-[32px] border border-white shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h2 className="text-base font-extrabold text-[#002970]">
                  Bank Outage & Grouped Incidents
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Aggregates multiple failed payouts for one bank into 1 incident instead of separate tickets.
                </p>
              </div>

              <span className="text-xs px-3 py-1 rounded-full bg-rose-50 text-rose-700 font-bold border border-rose-200">
                CBS Failures Active
              </span>
            </div>

            {bulkRetrySuccess && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold animate-slide-up flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{bulkRetrySuccess}</span>
              </div>
            )}

            <div className="space-y-3">
              {incidents.map((inc) => (
                <div key={inc.id} className="p-5 rounded-3xl bg-white/90 border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Building2 className="w-6 h-6 text-[#002970]" />
                      <div>
                        <div className="text-sm font-extrabold text-[#002970]">{inc.bank} Outage Incident</div>
                        <div className="text-[11px] text-slate-500">Cause: {inc.cause}</div>
                      </div>
                    </div>
                    <span className="text-xs px-3 py-1 rounded-full bg-rose-100 text-rose-800 font-bold">
                      {inc.merchant_count} Affected Merchants
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 text-xs font-medium text-slate-700 flex items-center justify-between">
                    <span>Broadcast Message: "HDFC bank clearing switch has experienced server lag. All payouts queued for retry."</span>
                    <span className="text-emerald-600 font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 stroke-[3]" /> Broadcast Sent
                    </span>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => handleBulkRetry(inc.id)}
                      disabled={bulkRetryLoading}
                      className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-[#002970] to-[#00BAF2] text-white text-xs font-extrabold shadow-md transition disabled:opacity-50"
                    >
                      {bulkRetryLoading ? 'Retrying payouts...' : 'Bulk Retry All 10 Payouts'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Decision Execution Modal */}
      {decisionModalOpen && (
        <div className="fixed inset-0 z-50 glass-modal-overlay flex items-center justify-center p-4 animate-fade-in">
          <div className="glass-modal max-w-md w-full p-6 animate-slide-up border border-white space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-extrabold text-base text-[#002970]">
                Confirm Decision: <span className="uppercase text-emerald-600">{decisionType}</span>
              </h3>
              <button
                type="button"
                onClick={() => setDecisionModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {decisionError && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-bold">
                {decisionError}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Reason for Decision (Logged to Audit Trail)
              </label>
              <textarea
                value={decisionReason}
                onChange={(e) => setDecisionReason(e.target.value)}
                rows={3}
                className="w-full p-3 text-xs font-medium bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#00BAF2]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDecisionModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteDecision}
                disabled={decisionLoading || !decisionReason.trim()}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#002970] to-[#00BAF2] text-white text-xs font-extrabold shadow-md transition disabled:opacity-50"
              >
                {decisionLoading ? 'Executing...' : 'Confirm & Log Audit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
