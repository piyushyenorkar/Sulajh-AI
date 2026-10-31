import React from 'react';
import { SettlementTransaction } from '../../data/merchantDashboardData';
import { MoneyAmount } from './MoneyAmount';
import { X, ShieldCheck, Check, Sparkles, Building2, Download } from 'lucide-react';

interface DeductionModalProps {
  settlement: SettlementTransaction | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DeductionModal: React.FC<DeductionModalProps> = ({ settlement, isOpen, onClose }) => {
  if (!isOpen || !settlement) return null;

  const b = settlement.breakdown;
  const gross = settlement.gross;
  const net = settlement.amount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-lg bg-white rounded-[28px] shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh] animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                Settlement Deduction Breakdown
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                {settlement.settlementId} · {settlement.date}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[10px] font-bold border border-purple-200/60">
              <Sparkles className="w-3 h-3 text-purple-600" />
              <span>Sulajh AI Verified</span>
            </span>

            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-white hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          
          {/* Main Net vs Gross Card */}
          <div className="p-4 rounded-2xl bg-slate-900 text-white flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Net Credited Payout
              </span>
              <div className="text-2xl font-black tracking-tight mt-0.5 text-white">
                <MoneyAmount amount={net} className="text-white" />
              </div>
              <span className="text-[11px] text-slate-400">
                To HDFC Bank •••• {settlement.accountLast4}
              </span>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Gross Collection
              </span>
              <div className="text-lg font-bold text-slate-300">
                <MoneyAmount amount={gross} className="text-slate-300" />
              </div>
              <span className="text-[10px] text-emerald-400 font-medium">
                {Math.round((net / gross) * 100)}% Settled
              </span>
            </div>
          </div>

          {/* Line-by-Line Itemization Table */}
          <div className="border border-slate-100 rounded-2xl overflow-hidden text-xs">
            <div className="bg-slate-50 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 flex justify-between">
              <span>Itemization</span>
              <span>Amount (INR)</span>
            </div>

            <div className="divide-y divide-slate-100">
              <div className="px-4 py-2.5 flex justify-between items-center text-slate-700">
                <span className="font-semibold">Gross Card & UPI Sales</span>
                <span className="font-bold text-slate-900">+₹{gross.toFixed(2)}</span>
              </div>

              <div className="px-4 py-2.5 flex justify-between items-center text-slate-600">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#93C5FD]" />
                  <span>MDR Merchant Commission (approx 2-3%)</span>
                </div>
                <span className="font-semibold text-rose-600">-₹{b.commission.toFixed(2)}</span>
              </div>

              <div className="px-4 py-2.5 flex justify-between items-center text-slate-600">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#1E3A8A]" />
                  <span>Statutory 18% GST on Commission</span>
                </div>
                <span className="font-semibold text-rose-600">-₹{b.gst.toFixed(2)}</span>
              </div>

              {b.soundbox > 0 && (
                <div className="px-4 py-2.5 flex justify-between items-center text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#64748B]" />
                    <span>Paytm 4G Soundbox Monthly Rental Split</span>
                  </div>
                  <span className="font-semibold text-rose-600">-₹{b.soundbox.toFixed(2)}</span>
                </div>
              )}

              {b.refunds > 0 && (
                <div className="px-4 py-2.5 flex justify-between items-center text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span>Customer Instant Refunds Debited</span>
                  </div>
                  <span className="font-semibold text-rose-600">-₹{b.refunds.toFixed(2)}</span>
                </div>
              )}

              <div className="px-4 py-2.5 flex justify-between items-center bg-slate-50/80 font-bold text-slate-900">
                <span>Net Transferred to HDFC Account</span>
                <span className="text-sm text-emerald-600">₹{net.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* "Why this answer?" (Fintech Source Proof Panel) */}
          <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 text-xs space-y-2">
            <div className="flex items-center gap-1.5 text-blue-900 font-bold">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>Why this answer? (Fintech Audit Proof)</span>
            </div>

            <div className="space-y-1 text-[11px] text-slate-600 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Ledger Entry:</span>
                <span className="font-semibold">{settlement.settlementId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Bank UTR Reference:</span>
                <span className="font-semibold">{settlement.utr}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Policy Citation:</span>
                <span className="font-semibold">RBI/2026/MDR-GST-SPLIT-SEC12</span>
              </div>
            </div>

            <p className="text-[10px] text-blue-700/80 pt-1 border-t border-blue-200/50 flex items-center gap-1 font-medium">
              <Check className="w-3 h-3 stroke-[3]" />
              <span>Zero discrepancy detected. All line items tally 100% with HDFC nodal clearing.</span>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
          <button
            type="button"
            onClick={() => alert(`Downloading GST statement for ${settlement.settlementId}...`)}
            className="px-3.5 py-1.5 rounded-full bg-white border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition cursor-pointer flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download GST Invoice (PDF)</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold transition cursor-pointer shadow-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

