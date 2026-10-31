import React from 'react';
import { MoneyAmount } from './MoneyAmount';
import { SettlementBreakdown } from '../../data/merchantDashboardData';

interface StackedBarProps {
  breakdown: SettlementBreakdown;
  onOpenBreakdown?: () => void;
  onRequestPayout?: () => void;
  statusText?: string;
  expectedDate?: string;
}

export const StackedBar: React.FC<StackedBarProps> = ({
  breakdown,
  onOpenBreakdown,
  onRequestPayout,
  statusText = 'Settled',
  expectedDate = 'Oct 31, 2026',
}) => {
  const { grossAmount, netPaid, commission, gstOnCommission, soundboxRental, refunds, chargebacks } = breakdown;

  const netPct = Math.round((netPaid / grossAmount) * 100);
  const commPct = Math.round((commission / grossAmount) * 100);
  const gstPct = Math.max(1, Math.round((gstOnCommission / grossAmount) * 100));
  const rentPct = Math.max(1, Math.round((soundboxRental / grossAmount) * 100));
  const refundsPct = Math.round(((refunds + chargebacks) / grossAmount) * 100);

  const segments = [
    { label: 'Net Paid', pct: netPct, amount: netPaid, color: 'bg-[#3B82F6]' },
    { label: 'MDR Commission', pct: commPct, amount: commission, color: 'bg-[#93C5FD]' },
    { label: '18% GST', pct: gstPct, amount: gstOnCommission, color: 'bg-[#1E3A8A]' },
    { label: 'Soundbox Rental', pct: rentPct, amount: soundboxRental, color: 'bg-[#64748B]' },
    { label: 'Refunds / Disputes', pct: refundsPct, amount: refunds + chargebacks, color: 'bg-amber-400' },
  ];

  return (
    <div className="bg-white border border-slate-200/90 rounded-[24px] p-6 flex flex-col justify-between h-full">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500">
            My settlements
          </span>
          <button
            type="button"
            onClick={onRequestPayout}
            className="px-3.5 py-1.5 rounded-full bg-slate-950 hover:bg-slate-800 text-white text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95"
          >
            <span>+ Settle Now</span>
          </button>
        </div>

        {/* Big Latest Settlement Amount */}
        <div className="mt-1 mb-1">
          <div className="flex items-baseline gap-2">
            <MoneyAmount amount={netPaid} className="text-3xl sm:text-[32px] font-black text-slate-950 tracking-tight" />
            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
              ● {statusText}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium mt-1">
            Expected: {expectedDate} · T+1 Cycle
          </p>
        </div>

        {/* Segmented Stacked Horizontal Bar */}
        <div className="mt-6 mb-4">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2">
            <span>Where your money went</span>
            <span className="text-slate-400 font-medium">Gross ₹{grossAmount.toLocaleString('en-IN')}</span>
          </div>

          <div className="h-3.5 w-full rounded-full bg-slate-100 flex overflow-hidden gap-0.5 p-0.5">
            <div style={{ width: `${netPct}%` }} className="h-full rounded-l-full bg-[#3B82F6] transition-all duration-500" title={`Net Paid: ₹${netPaid}`} />
            <div style={{ width: `${commPct}%` }} className="h-full bg-[#93C5FD] transition-all duration-500" title={`MDR: ₹${commission}`} />
            <div style={{ width: `${gstPct}%` }} className="h-full bg-[#1E3A8A] transition-all duration-500" title={`GST: ₹${gstOnCommission}`} />
            <div style={{ width: `${rentPct}%` }} className="h-full bg-[#64748B] transition-all duration-500" title={`Rental: ₹${soundboxRental}`} />
            {refundsPct > 0 && (
              <div style={{ width: `${refundsPct}%` }} className="h-full rounded-r-full bg-amber-400 transition-all duration-500" title={`Refunds: ₹${refunds}`} />
            )}
          </div>
        </div>

        {/* Legend List */}
        <div className="space-y-2.5 pt-2">
          {segments.map((seg) => (
            <div key={seg.label} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-sm ${seg.color} shrink-0`} />
                <span className="text-slate-600 font-medium">{seg.label}</span>
                <span className="text-slate-400 text-[11px]">{seg.pct}%</span>
              </div>
              <span className="font-semibold text-slate-900 tabular-nums">
                ₹{seg.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Button */}
      <div className="mt-6 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={onOpenBreakdown}
          className="w-full py-2.5 rounded-full bg-slate-950 hover:bg-slate-800 text-white text-xs font-semibold tracking-wide transition-all cursor-pointer shadow-sm active:scale-98 flex items-center justify-center gap-2"
        >
          <span>See full breakdown</span>
          <span className="text-slate-400">→</span>
        </button>
      </div>
    </div>
  );
};
