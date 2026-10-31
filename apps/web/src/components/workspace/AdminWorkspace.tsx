import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Settings, 
  Download, 
  Sparkles, 
  Check, 
  X, 
  Layers, 
  Sliders, 
  Users, 
  FileText, 
  Lock, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw,
  GitCommit
} from 'lucide-react';
import { Meter } from './Meter';

export interface AdminWorkspaceProps {
  onBackToQueue?: () => void;
}

export const AdminWorkspace: React.FC<AdminWorkspaceProps> = () => {
  const [activeAdminTab, setActiveAdminTab] = useState<'policy' | 'tools' | 'users' | 'audit' | 'ai_quality'>('policy');

  // Policy Sliders state
  const [l1ApprovalCap, setL1ApprovalCap] = useState(25000);
  const [chargebackSlaHours, setChargebackSlaHours] = useState(48);
  const [aiConfidenceThreshold, setAiConfidenceThreshold] = useState(85);
  const [policySavedToast, setPolicySavedToast] = useState(false);
  const [showDiffModal, setShowDiffModal] = useState(false);

  // 12 Tools State
  const [tools, setTools] = useState([
    { id: 'check_settlement_status', name: 'check_settlement_status', mode: 'autonomous', desc: 'Queries live settlement ledger & bank UTR status', callsToday: 1420 },
    { id: 'explain_deductions', name: 'explain_deductions', mode: 'autonomous', desc: 'Itemizes MDR, 18% GST, and Soundbox rentals', callsToday: 890 },
    { id: 'defend_chargeback', name: 'defend_chargeback', mode: 'autonomous', desc: 'Compiles proof and auto-submits before bank SLA', callsToday: 145 },
    { id: 'verify_ifsc_merge', name: 'verify_ifsc_merge', mode: 'autonomous', desc: 'Validates inactive IFSC against RBI master list', callsToday: 320 },
    { id: 'retry_failed_payout', name: 'retry_failed_payout', mode: 'approval', desc: 'Re-dispatches failed IMPS payout (Cap enforced)', callsToday: 215 },
    { id: 'policy_check_cap', name: 'policy_check_cap', mode: 'autonomous', desc: 'Enforces hard policy limits in Python/TS engine', callsToday: 1980 },
    { id: 'initiate_refund', name: 'initiate_refund', mode: 'approval', desc: 'Processes customer refund from merchant balance', callsToday: 84 },
    { id: 'hold_payout_risk', name: 'hold_payout_risk', mode: 'autonomous', desc: 'Freezes suspicious payout if fraud score > 80', callsToday: 12 },
    { id: 'fetch_utr_logs', name: 'fetch_utr_logs', mode: 'autonomous', desc: 'Retrieves low-level NPCI clearing raw packets', callsToday: 760 },
    { id: 'generate_merchant_statement', name: 'generate_merchant_statement', mode: 'autonomous', desc: 'Generates signed PDF tax reconciliation report', callsToday: 340 },
    { id: 'escalate_to_manager', name: 'escalate_to_manager', mode: 'autonomous', desc: 'Routes high-value (> ₹25k) cases to L2 desk', callsToday: 28 },
    { id: 'notify_soundbox_voice', name: 'notify_soundbox_voice', mode: 'autonomous', desc: 'Speaks Hindi status update on merchant soundbox', callsToday: 512 },
  ]);

  // AI Policy Suggestions
  const [suggestions, setSuggestions] = useState([
    {
      id: 'sugg-1',
      title: 'Auto-bypass 4-Eye for HDFC Branch Consolidation',
      reason: '142 recurring identical failures detected today with error E_BANK_IFSC_INACTIVE. AI verified all account numbers.',
      confidence: 96,
      suggestedCap: '₹50,000',
      status: 'pending'
    },
    {
      id: 'sugg-2',
      title: 'Reduce Chargeback Auto-Defend Window to 24h',
      reason: 'Merchants submitting invoices within 6 hours win 94% of disputes. Shortening SLA prevents default losses.',
      confidence: 91,
      suggestedCap: '24 Hours',
      status: 'pending'
    }
  ]);

  // Audit Logs (Sample for dense view)
  const auditLogs = [
    { id: 'AUD-991', time: '11:15:22 AM', actor: 'Priya Sharma (L1)', action: 'APPROVE_PAYOUT', target: 'CASE-1042', amount: '₹4,735.54', hash: 'e3b0c442...98b' },
    { id: 'AUD-990', time: '11:14:02 AM', actor: 'Sulajh AI', action: 'TOOL_INVOKE:verify_ifsc_merge', target: 'HDFC0000041', amount: '-', hash: '8f434346...32a' },
    { id: 'AUD-989', time: '11:08:45 AM', actor: 'Vikram Malhotra (L2)', action: '2FA_APPROVE_PAYOUT', target: 'CASE-1089', amount: '₹45,000.00', hash: '1a79a4d6...5fc' },
    { id: 'AUD-988', time: '11:05:10 AM', actor: 'Sulajh AI', action: 'TOOL_INVOKE:policy_check_cap', target: 'CASE-1089', amount: '₹45,000.00', hash: '7c98e210...94e' },
    { id: 'AUD-987', time: '10:58:30 AM', actor: 'Sulajh AI', action: 'AUTO_DEFEND_CHARGEBACK', target: 'DSP-8821', amount: '₹8,500.00', hash: '2b45e901...33d' },
    { id: 'AUD-986', time: '10:45:12 AM', actor: 'Admin (System)', action: 'UPDATE_POLICY_CAP', target: 'L1_APPROVAL_MAX', amount: '₹25,000.00', hash: '09a8b7c6...12e' },
  ];

  const handleSavePolicies = () => {
    setPolicySavedToast(true);
    setTimeout(() => setPolicySavedToast(false), 3000);
  };

  const handleToggleToolMode = (toolId: string) => {
    setTools(prev => prev.map(t => {
      if (t.id === toolId) {
        const nextMode = t.mode === 'autonomous' ? 'approval' : 'autonomous';
        return { ...t, mode: nextMode };
      }
      return t;
    }));
  };

  const handleActSuggestion = (id: string, action: 'accept' | 'dismiss') => {
    setSuggestions(prev => prev.filter(s => s.id !== id));
  };

  const downloadCsv = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "LogID,Time,Actor,Action,Target,Amount,Hash\n"
      + auditLogs.map(e => `${e.id},${e.time},${e.actor},${e.action},${e.target},${e.amount},${e.hash}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `sulajh_audit_trail_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* ─── HEADER AREA (MIRRORS REFERENCE TITLE BLOCK) ─── */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 pb-2">
        
        {/* Left: Status Dot, Breadcrumb, 48px Thin Title, Sub-pills */}
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-emerald-700 font-bold">Admin Control Room</span>
            <span className="text-slate-300">•</span>
            <span>Policy Engine v2.4 (Active)</span>
          </div>

          <h1 className="font-['Sora',sans-serif] font-light text-4xl sm:text-5xl text-slate-900 tracking-tight">
            System guardrails
          </h1>

          {/* Sub-tabs pills */}
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <button
              type="button"
              onClick={() => setActiveAdminTab('policy')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeAdminTab === 'policy'
                  ? 'bg-[#12141A] text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
              }`}
            >
              <span>Policy limits</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            </button>

            <button
              type="button"
              onClick={() => setActiveAdminTab('tools')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeAdminTab === 'tools'
                  ? 'bg-[#12141A] text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
              }`}
            >
              <span>12 Tools allow-list</span>
              <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold ${
                activeAdminTab === 'tools' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-800'
              }`}>
                12
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveAdminTab('audit')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeAdminTab === 'audit'
                  ? 'bg-[#12141A] text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
              }`}
            >
              <span>Audit trail</span>
              <span className="text-[10px] font-mono text-slate-400">Append-only</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveAdminTab('ai_quality')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeAdminTab === 'ai_quality'
                  ? 'bg-[#12141A] text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#6D5BD0]" />
              <span>AI policy suggestions</span>
              {suggestions.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-purple-500 text-white text-[10px] flex items-center justify-center font-bold">
                  {suggestions.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Right: Signature Meters + Save button */}
        <div className="flex flex-col sm:flex-row xl:flex-col items-start xl:items-end gap-4">
          
          <div className="flex items-center gap-4 sm:gap-6">
            <Meter
              label="Autonomous volume"
              value="₹4.2 Cr"
              pct={88}
              leftCaption="42,800 operations"
              rightCaption="SLA 99.4%"
              variant="blue"
              widthClass="w-36 sm:w-44"
            />
            <Meter
              label="Guardrail integrity"
              value="100%"
              pct={100}
              leftCaption="0 breached"
              rightCaption="12 tools active"
              variant="blue"
              widthClass="w-36 sm:w-44"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowDiffModal(true)}
              className="px-4 py-2.5 rounded-full bg-white border border-slate-200 text-slate-700 hover:border-slate-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <GitCommit className="w-3.5 h-3.5" />
              <span>Diff v2.3 vs v2.4</span>
            </button>

            <button
              type="button"
              onClick={handleSavePolicies}
              className="px-5 py-2.5 rounded-full bg-[#F2531D] hover:bg-[#E04612] text-white text-xs font-bold transition flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>Publish Policy Changes</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── TOAST NOTIFICATION ─── */}
      {policySavedToast && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3 flex items-center gap-2 text-xs text-emerald-800 shadow-sm animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Policy published! Version updated to <strong>v2.4.1</strong> with immutable cryptographic hash <code>sha256-4b92c8...</code></span>
        </div>
      )}

      {/* ─── TAB 1: POLICY LIMITS & SLIDERS (A-3) ─── */}
      {activeAdminTab === 'policy' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Sliders Card (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-[24px] border border-slate-200/90 p-5 sm:p-6 shadow-sm flex flex-col gap-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-orange-50 text-[#F2531D] flex items-center justify-center">
                  <Sliders className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="font-['Outfit',sans-serif] font-bold text-base text-slate-900">
                    Deterministic Hard Limits
                  </h3>
                  <span className="text-[11px] text-slate-400">Enforced directly in policyEngine.ts</span>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-600 px-2.5 py-1 bg-emerald-50 rounded-full border border-emerald-200/60">
                Active Enforcing
              </span>
            </div>

            {/* Slider 1: L1 Auto-Approval Cap */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800">L1 Ops Agent Auto-Approval Cap</span>
                  <p className="text-[11px] text-slate-500">Payouts above this amount escalate to Ops Manager with 4-Eye & 2FA</p>
                </div>
                <span className="font-mono font-bold text-base text-slate-900">
                  ₹{l1ApprovalCap.toLocaleString('en-IN')}
                </span>
              </div>
              <input
                type="range"
                min={10000}
                max={50000}
                step={5000}
                value={l1ApprovalCap}
                onChange={(e) => setL1ApprovalCap(Number(e.target.value))}
                className="w-full accent-[#F2531D] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                <span>₹10,000 (Conservative)</span>
                <span>Current: ₹25,000 (Paytm Default)</span>
                <span>₹50,000 (High Velocity)</span>
              </div>
            </div>

            {/* Slider 2: Auto-Defend Chargeback SLA */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800">Auto-Defend Chargeback SLA Window</span>
                  <p className="text-[11px] text-slate-500">Sulajh AI auto-submits POD evidence to bank before statutory SLA expires</p>
                </div>
                <span className="font-mono font-bold text-base text-slate-900">
                  {chargebackSlaHours} Hours
                </span>
              </div>
              <input
                type="range"
                min={12}
                max={72}
                step={6}
                value={chargebackSlaHours}
                onChange={(e) => setChargebackSlaHours(Number(e.target.value))}
                className="w-full accent-[#F2531D] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                <span>12 Hours (Fast)</span>
                <span>Current: 48 Hours</span>
                <span>72 Hours (Relaxed)</span>
              </div>
            </div>

            {/* Slider 3: AI Deflection Confidence Threshold */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800">AI Confidence Routing Threshold</span>
                  <p className="text-[11px] text-slate-500">Responses below this score hand off to human L1 queue with prepared draft</p>
                </div>
                <span className="font-mono font-bold text-base text-slate-900">
                  {aiConfidenceThreshold}%
                </span>
              </div>
              <input
                type="range"
                min={70}
                max={95}
                step={5}
                value={aiConfidenceThreshold}
                onChange={(e) => setAiConfidenceThreshold(Number(e.target.value))}
                className="w-full accent-[#F2531D] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                <span>70% (Higher Deflection)</span>
                <span>Current: 85% (Balanced)</span>
                <span>95% (Strict Human-in-the-Loop)</span>
              </div>
            </div>

          </div>

          {/* Policy Meta & Version History (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            <div className="bg-white rounded-[24px] border border-slate-200/90 p-5 sm:p-6 shadow-sm">
              <h3 className="font-['Outfit',sans-serif] font-bold text-base text-slate-900 mb-2">
                Policy Version Ledger
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                All policy edits are signed with actor keys and immutably appended to audit logs.
              </p>

              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/60">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-blue-900">v2.4 (Active Production)</span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-200 text-blue-800 text-[10px] font-bold">CURRENT</span>
                  </div>
                  <p className="text-[11px] text-blue-800 mt-1">
                    Added automatic HDFC IFSC branch merger re-route rule with UTR hash verification.
                  </p>
                  <div className="text-[10px] font-mono text-blue-600 mt-1">By: Piyush (Admin) · 10:45 AM</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">v2.3 (Archived)</span>
                    <span className="text-[10px] text-slate-400">Oct 28</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1">
                    Raised L1 approval ceiling from ₹15,000 to ₹25,000 following 99.8% audit accuracy.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">v2.2 (Archived)</span>
                    <span className="text-[10px] text-slate-400">Oct 14</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1">
                    Initial production release with 12 sandboxed tools and dual English + Hinglish LLM.
                  </p>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ─── TAB 2: 12 TOOLS ALLOW-LIST (A-4) ─── */}
      {activeAdminTab === 'tools' && (
        <div className="bg-white rounded-[24px] border border-slate-200/90 p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                <Layers className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="font-['Outfit',sans-serif] font-bold text-base text-slate-900">
                  Tool Allow-List (12 Deterministic APIs)
                </h3>
                <span className="text-[11px] text-slate-400">Configured in apps/api/src/agent/tools.ts</span>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">
              All 12 Sandboxed
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tools.map((t) => (
              <div 
                key={t.id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-start justify-between gap-3 hover:border-slate-300 transition"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <code className="text-xs font-mono font-bold text-slate-900">{t.name}</code>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      t.mode === 'autonomous' ? 'bg-emerald-100 text-emerald-800' : 'bg-orange-100 text-orange-800'
                    }`}>
                      {t.mode === 'autonomous' ? 'Autonomous' : 'Human Approval'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{t.desc}</p>
                  <div className="text-[10px] text-slate-400 font-mono mt-2">
                    {t.callsToday.toLocaleString('en-IN')} invocations today · 0 errors
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggleToolMode(t.id)}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-bold shrink-0 transition cursor-pointer ${
                    t.mode === 'autonomous'
                      ? 'bg-slate-200 text-slate-800 hover:bg-slate-300'
                      : 'bg-[#F2531D] text-white hover:bg-[#E04612]'
                  }`}
                >
                  {t.mode === 'autonomous' ? 'Require Approval' : 'Make Autonomous'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── TAB 3: AUDIT TRAIL STREAM (A-5) ─── */}
      {activeAdminTab === 'audit' && (
        <div className="bg-white rounded-[24px] border border-slate-200/90 p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-800 flex items-center justify-center">
                <FileText className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="font-['Outfit',sans-serif] font-bold text-base text-slate-900">
                  Append-Only Audit Stream
                </h3>
                <span className="text-[11px] text-slate-400">Cryptographically chained · Zero edit or deletion permitted</span>
              </div>
            </div>

            <button
              type="button"
              onClick={downloadCsv}
              className="px-4 py-2 rounded-full bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                  <th className="py-2.5 px-3">Log ID</th>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Actor</th>
                  <th className="py-2.5 px-3">Action / Event</th>
                  <th className="py-2.5 px-3">Target</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                  <th className="py-2.5 px-3 font-mono">Chained Hash</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-3 font-mono font-bold text-slate-800">{log.id}</td>
                    <td className="py-3 px-3 text-slate-500">{log.time}</td>
                    <td className="py-3 px-3 font-medium text-slate-700">{log.actor}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 font-mono text-[11px]">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-600">{log.target}</td>
                    <td className="py-3 px-3 text-right font-bold text-slate-900">{log.amount}</td>
                    <td className="py-3 px-3 font-mono text-slate-400 text-[10px]">{log.hash}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── TAB 4: AI QUALITY & POLICY SUGGESTIONS (A-6) ─── */}
      {activeAdminTab === 'ai_quality' && (
        <div className="bg-white rounded-[24px] border border-slate-200/90 p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-purple-50 text-[#6D5BD0] flex items-center justify-center">
                <Sparkles className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="font-['Outfit',sans-serif] font-bold text-base text-slate-900">
                  AI-Discovered Policy Enhancements
                </h3>
                <span className="text-[11px] text-slate-400">Synthesized from 1,200+ resolved settlement tickets</span>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-purple-50 text-[#6D5BD0] text-xs font-semibold">
              {suggestions.length} actionable insights
            </span>
          </div>

          {suggestions.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              All AI suggestions have been reviewed and resolved!
            </div>
          ) : (
            <div className="space-y-4">
              {suggestions.map((s) => (
                <div key={s.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-['Outfit',sans-serif] font-bold text-sm text-slate-900">{s.title}</span>
                      <span className="px-2 py-0.5 rounded-full bg-purple-100 text-[#6D5BD0] text-[10px] font-bold">
                        {s.confidence}% AI Confidence
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">{s.reason}</p>
                    <div className="text-[11px] font-medium text-slate-500">
                      Recommended setting: <strong className="text-slate-900">{s.suggestedCap}</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleActSuggestion(s.id, 'dismiss')}
                      className="px-4 py-2 rounded-full border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-100 cursor-pointer"
                    >
                      Dismiss
                    </button>
                    <button
                      type="button"
                      onClick={() => handleActSuggestion(s.id, 'accept')}
                      className="px-5 py-2 rounded-full bg-[#F2531D] hover:bg-[#E04612] text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Accept Rule</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── POLICY DIFF MODAL ─── */}
      {showDiffModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[28px] border border-slate-200 p-6 sm:p-8 max-w-xl w-full shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-800 flex items-center justify-center">
                  <GitCommit className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="font-['Outfit',sans-serif] font-bold text-lg text-slate-900">
                    Policy Diff Comparison
                  </h3>
                  <p className="text-xs text-slate-500">v2.3 (Base) vs v2.4 (Active Candidate)</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDiffModal(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-3 font-mono text-xs">
              <div className="p-3 bg-red-50 text-red-800 rounded-xl">
                - L1_AUTO_APPROVE_MAX: 15000
                <br />
                - HDFC_IFSC_AUTO_MIGRATION: false
              </div>
              <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl">
                + L1_AUTO_APPROVE_MAX: 25000 (Approved by Risk Lead)
                <br />
                + HDFC_IFSC_AUTO_MIGRATION: true (Target: HDFC0000482)
                <br />
                + CHARGEBACK_AUTO_DEFEND_HOURS: 48
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="button"
                onClick={() => setShowDiffModal(false)}
                className="px-6 py-2.5 rounded-full bg-[#12141A] text-white text-xs font-bold hover:bg-black cursor-pointer"
              >
                Close Diff
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

