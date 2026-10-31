import React, { useState } from 'react';
import { 
  Check, 
  Send, 
  ArrowUpRight, 
  Clock, 
  ShieldCheck, 
  ShieldAlert, 
  Lock, 
  Sparkles, 
  AlertOctagon, 
  PhoneCall, 
  CheckCheck, 
  ArrowLeft,
  X,
  MessageSquare,
  FileText
} from 'lucide-react';
import { Meter } from './Meter';
import { JourneyMap } from './JourneyMap';
import { CaseTimeline } from './CaseTimeline';
import { MerchantAssetCard } from './MerchantAssetCard';
import { FullMerchantChatView } from './FullMerchantChatView';
import { OpsTicket } from '../../data/opsConsoleData';

export interface CaseWorkspaceHeroProps {
  ticket: OpsTicket;
  currentRole: 'ops_agent' | 'ops_manager' | 'admin';
  onBackToQueue: () => void;
  onApproveSuccess?: (message: string) => void;
  onEscalate?: (ticket: OpsTicket) => void;
}

export const CaseWorkspaceHero: React.FC<CaseWorkspaceHeroProps> = ({
  ticket,
  currentRole,
  onBackToQueue,
  onApproveSuccess,
  onEscalate,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'chat' | 'settlement' | 'documents' | 'activity'>('overview');
  const [isApproved, setIsApproved] = useState(ticket.status === 'resolved');
  const [showTwoFactorModal, setShowTwoFactorModal] = useState(false);
  const [totpCode, setTotpCode] = useState('');
  const [totpError, setTotpError] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lockCountdown, setLockCountdown] = useState(270); // 4m 30s lock

  // High-value cases require Manager + 4-Eye + 2FA
  const isHighValue = ticket.amount > 25000;
  const requiresManager2FA = isHighValue && currentRole !== 'ops_agent';

  // Format lock timer
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handlePrimaryAction = () => {
    if (isHighValue && currentRole === 'ops_agent') {
      if (onEscalate) onEscalate(ticket);
      return;
    }

    if (requiresManager2FA) {
      setShowTwoFactorModal(true);
      return;
    }

    executeApproval();
  };

  const executeApproval = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsApproved(true);
      ticket.status = 'resolved';
      if (onApproveSuccess) {
        onApproveSuccess(`Case ${ticket.ticketNumber} approved! ₹${ticket.amount.toLocaleString('en-IN')} released to ${ticket.merchantName}.`);
      }
    }, 900);
  };

  const handleVerify2FA = (e: React.FormEvent) => {
    e.preventDefault();
    if (totpCode.trim() === '654321' || totpCode.length === 6) {
      setShowTwoFactorModal(false);
      executeApproval();
    } else {
      setTotpError(true);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* ─── LOCK / HOLD BANNER (FOR MANAGERS) ─── */}
      {isHighValue && (
        <div className="bg-amber-50 border border-amber-200/80 rounded-2xl px-4 py-3 flex items-center justify-between text-xs text-amber-900">
          <div className="flex items-center gap-2 font-medium">
            <Lock className="w-4 h-4 text-amber-600" />
            <span>
              <strong>Case Lock Active:</strong> Held by you for <strong>{formatTime(lockCountdown)}</strong>. Other staff cannot make conflicting approvals.
            </span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-amber-200/60 text-amber-800 font-bold text-[11px]">
            4-Eye Policy Enforced
          </span>
        </div>
      )}

      {/* ─── HEADER AREA (MIRRORS REFERENCE TITLE BLOCK) ─── */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 pb-2">
        
        {/* Left: Status Dot, Breadcrumb, 48px Thin Title, Sub-pills */}
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <span className={`w-2 h-2 rounded-full ${isApproved ? 'bg-emerald-500' : 'bg-blue-600 animate-pulse'}`} />
            <span className={isApproved ? 'text-emerald-700 font-bold' : 'text-blue-700 font-bold'}>
              {isApproved ? 'Resolved' : ticket.status === 'escalated' ? 'Manager Review' : 'Needs approval'}
            </span>
            <span className="text-slate-300">•</span>
            <span>Settlement / {ticket.ticketNumber} · for REQ-{ticket.settlementId || '1203'}</span>
          </div>

          <h1 className="font-['Sora',sans-serif] font-light text-4xl sm:text-5xl text-slate-900 tracking-tight">
            {ticket.ticketNumber} · {ticket.merchantName}
          </h1>

          {/* Sub-tabs pills (Mirrors Overview / Merchant Chat / Settlement / Documents / Activity) */}
          <div className="flex flex-wrap items-center gap-2 mt-4">
            {/* Tab 1: Overview */}
            <button
              type="button"
              onClick={() => setActiveSubTab('overview')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                activeSubTab === 'overview'
                  ? 'bg-[#12141A] text-white shadow-xs'
                  : 'bg-[#ECEEF2] hover:bg-slate-200 text-slate-800'
              }`}
            >
              Overview
            </button>

            {/* Tab 2: Settlement 1 */}
            <button
              type="button"
              onClick={() => setActiveSubTab('settlement')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === 'settlement'
                  ? 'bg-[#12141A] text-white shadow-xs'
                  : 'bg-[#ECEEF2] hover:bg-slate-200 text-slate-800'
              }`}
            >
              <span>Settlement</span>
              <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold ${
                activeSubTab === 'settlement' ? 'bg-white/20 text-white' : 'bg-slate-300 text-slate-800'
              }`}>
                1
              </span>
            </button>

            {/* Tab 3: Documents 2 */}
            <button
              type="button"
              onClick={() => setActiveSubTab('documents')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === 'documents'
                  ? 'bg-[#12141A] text-white shadow-xs'
                  : 'bg-[#ECEEF2] hover:bg-slate-200 text-slate-800'
              }`}
            >
              <span>Documents</span>
              <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold ${
                activeSubTab === 'documents' ? 'bg-white/20 text-white' : 'bg-slate-300 text-slate-800'
              }`}>
                2
              </span>
            </button>

            {/* Tab 4: Activity */}
            <button
              type="button"
              onClick={() => setActiveSubTab('activity')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                activeSubTab === 'activity'
                  ? 'bg-[#12141A] text-white shadow-xs'
                  : 'bg-[#ECEEF2] hover:bg-slate-200 text-slate-800'
              }`}
            >
              Activity
            </button>

            {/* Tab 5: Merchant Chat with count chip */}
            <button
              type="button"
              onClick={() => setActiveSubTab('chat')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === 'chat'
                  ? 'bg-[#12141A] text-white shadow-xs'
                  : 'bg-[#ECEEF2] hover:bg-slate-200 text-slate-800'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-violet-500" />
              <span>Merchant Chat</span>
              <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold ${
                activeSubTab === 'chat' ? 'bg-white/20 text-white' : 'bg-purple-100 text-[#6D5BD0]'
              }`}>
                {ticket.chatHistory?.length || 6}
              </span>
            </button>
          </div>
        </div>

        {/* Right: Signature Meters + Action Pill Buttons */}
        <div className="flex flex-col sm:flex-row xl:flex-col items-start xl:items-end gap-4">
          
          {/* Dual Meters row */}
          <div className="flex items-center gap-4 sm:gap-6">
            <Meter
              label="SLA clearance"
              value="1 d 4 h"
              pct={72}
              leftCaption="Opened 2 h ago"
              rightCaption="SLA 24 h"
              variant="blue"
              widthClass="w-36 sm:w-44"
            />
            <Meter
              label={currentRole === 'ops_agent' ? 'Amount vs L1 cap' : 'Amount vs auto limit'}
              value={`₹${(ticket.amount / 1000).toFixed(1)}k`}
              pct={Math.min(100, Math.round((ticket.amount / (currentRole === 'ops_agent' ? 25000 : 100000)) * 100))}
              leftCaption={currentRole === 'ops_agent' ? 'Cap ₹25,000' : 'Cap ₹1,00,000'}
              rightCaption={isHighValue ? 'Exceeds cap' : 'Within cap'}
              variant={isHighValue ? 'orange' : 'blue'}
              widthClass="w-36 sm:w-44"
            />
          </div>

          {/* Action Pills */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onBackToQueue}
              className="px-4 py-2.5 rounded-full bg-white border border-slate-200 text-slate-700 hover:border-slate-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to queue</span>
            </button>

            {isApproved ? (
              <div className="px-5 py-2.5 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>Payout Released</span>
              </div>
            ) : isHighValue && currentRole === 'ops_agent' ? (
              <button
                type="button"
                onClick={() => onEscalate && onEscalate(ticket)}
                className="px-5 py-2.5 rounded-full bg-[#12141A] hover:bg-black text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                <span>Escalate to Manager (&gt; ₹25k)</span>
              </button>
            ) : (
              <button
                type="button"
                disabled={isProcessing}
                onClick={handlePrimaryAction}
                className="px-5 py-2.5 rounded-full bg-[#F2531D] hover:bg-[#E04612] text-white text-xs font-bold transition flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? (
                  <span className="animate-spin text-white">⟳</span>
                ) : (
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                )}
                <span>
                  {requiresManager2FA ? 'Approve with 2FA TOTP' : 'Approve payout'}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ─── CONDITIONAL VIEW: FULL MERCHANT CHAT vs 3-COLUMN WORKSPACE ─── */}
      {activeSubTab === 'chat' ? (
        /* Full Merchant Chat Thread View */
        <FullMerchantChatView
          ticket={ticket}
          onBackToOverview={() => setActiveSubTab('overview')}
          onSendMessage={(msg) => {
            if (onApproveSuccess) {
              onApproveSuccess(`Message dispatched to ${ticket.merchantName} via WhatsApp & Soundbox.`);
            }
          }}
        />
      ) : (
        /* 3-Column Workspace Grid (EquipFlow Hero Layout) - Exact Same Smaller Height (570px) with 1.5px Internal Scroll */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Column 1 (4 cols): Settlement Journey Route Map */}
          <div className="lg:col-span-4 h-[570px] max-h-[570px] flex flex-col overflow-hidden">
            <JourneyMap
              merchantName={ticket.merchantName}
              merchantPhoneMasked="+91 98200 ••••4"
              bankName={ticket.bankName}
              accountLast4={ticket.accountLast4}
              openedTime="Today 8:15 AM"
              merchantNote={ticket.merchantQuery || "Mera kal ka settlement abhi tak nahi aaya, ₹4,735.54 pending dikha raha hai."}
              merchantNoteEn={ticket.merchantQueryEn || "Yesterday's payout has not arrived yet, ₹4,735.54 is showing pending."}
              currentStepIndex={isApproved ? 3 : 2}
              isApproved={isApproved}
              onOpenFullChat={() => setActiveSubTab('chat')}
            />
          </div>

          {/* Column 2 (4 cols): Progress Timeline Ledger & Reply Composer */}
          <div className="lg:col-span-4 h-[570px] max-h-[570px] flex flex-col overflow-hidden">
            <CaseTimeline
              amount={ticket.amount}
              grossAmount={ticket.amount + 114.46}
              commission={97.00}
              gst={17.46}
              accountLast4={ticket.accountLast4}
              isApproved={isApproved}
              onSendReply={(reply) => {
                if (onApproveSuccess) {
                  onApproveSuccess(`Reply dispatched to ${ticket.merchantName} via WhatsApp & Soundbox.`);
                }
              }}
            />
          </div>

          {/* Column 3 (4 cols): Merchant On File + Checklist */}
          <div className="lg:col-span-4 h-[570px] max-h-[570px] flex flex-col overflow-hidden">
            <MerchantAssetCard
              merchantName={ticket.merchantName}
              merchantId={ticket.merchantId}
              category={ticket.issueType === 'settlement_failed' ? 'Kirana / Retail' : 'Electronics'}
              openDisputesCount={ticket.issueType === 'chargeback' ? 2 : 1}
              failedPayoutsCount={ticket.status === 'resolved' ? 0 : 1}
              riskFlag="Clean (Tier 1)"
              accountLast4={ticket.accountLast4}
              amount={ticket.amount}
            />
          </div>
        </div>
      )}

      {/* ─── 2FA TOTP MODAL (FOR HIGH VALUE MANAGER APPROVALS) ─── */}
      {showTwoFactorModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] border border-slate-200 p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-orange-50 text-[#F2531D] flex items-center justify-center">
                  <Lock className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="font-['Outfit',sans-serif] font-bold text-base text-slate-900">
                    4-Eye Manager 2FA Sign-off
                  </h3>
                  <span className="text-[11px] text-slate-400">Policy: Payouts &gt; ₹25,000 require TOTP</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowTwoFactorModal(false)}
                className="w-7 h-7 rounded-full hover:bg-slate-100 text-slate-400 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4">
              <div className="p-3 bg-slate-50 rounded-xl mb-4 text-xs text-slate-600 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Ticket:</span>
                  <span className="font-mono font-bold text-slate-800">{ticket.ticketNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Beneficiary:</span>
                  <span className="font-bold text-slate-800">{ticket.merchantName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Release Amount:</span>
                  <span className="font-bold text-emerald-600">₹{ticket.amount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">L1 Reviewer:</span>
                  <span className="font-medium text-slate-700">Priya Sharma (10:45 AM)</span>
                </div>
              </div>

              <form onSubmit={handleVerify2FA} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Enter Authenticator 6-Digit Code:
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="654321"
                    value={totpCode}
                    onChange={(e) => {
                      setTotpCode(e.target.value.replace(/\D/g, ''));
                      setTotpError(false);
                    }}
                    className="w-full text-center tracking-[0.5em] font-mono text-xl py-2.5 rounded-xl border border-slate-300 focus:border-[#F2531D] focus:ring-1 focus:ring-[#F2531D] outline-none"
                    autoFocus
                  />
                  <p className="text-[11px] text-slate-400 mt-1 text-center">
                    Demo bypass: Enter <strong>654321</strong> or any 6 digits
                  </p>
                  {totpError && (
                    <p className="text-xs text-red-500 font-semibold mt-1 text-center">
                      Invalid 2FA code. Please enter 654321.
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowTwoFactorModal(false)}
                    className="flex-1 py-2.5 rounded-full border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-full bg-[#F2531D] hover:bg-[#E04612] text-white text-xs font-bold cursor-pointer"
                  >
                    Confirm & Dispatch
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
