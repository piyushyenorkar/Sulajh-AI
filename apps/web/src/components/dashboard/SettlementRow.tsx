import React from 'react';
import { SettlementTransaction } from '../../data/merchantDashboardData';
import { MoneyAmount } from './MoneyAmount';
import { Building2, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';

interface SettlementRowProps {
  settlement: SettlementTransaction;
  onWhyThisAmount?: (settlement: SettlementTransaction) => void;
}

export const SettlementRow: React.FC<SettlementRowProps> = ({ settlement, onWhyThisAmount }) => {
  const isPaid = settlement.status === 'paid';
  const isFailed = settlement.status === 'failed';
  const isDelayed = settlement.status === 'delayed';

  let Icon = CheckCircle2;
  let iconBg = 'bg-emerald-50 text-emerald-600';
  let amountType: 'credit' | 'debit' | 'neutral' = 'credit';

  if (isFailed) {
    Icon = AlertCircle;
    iconBg = 'bg-rose-50 text-rose-600';
    amountType = 'debit';
  } else if (isDelayed) {
    Icon = Clock;
    iconBg = 'bg-amber-50 text-amber-600';
    amountType = 'neutral';
  }

  return (
    <div className="flex items-center justify-between py-2.5 px-1 hover:bg-slate-50/80 rounded-xl transition-colors group">
      {/* Left: Round icon + ID + Subtitle + Why this amount */}
      <div className="flex items-center gap-3 min-w-0">
        <div className={`w-9 h-9 rounded-full ${iconBg} flex items-center justify-center shrink-0 shadow-2xs`}>
          <Icon className="w-4 h-4 stroke-[2.2]" />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-xs text-slate-900 truncate tracking-tight font-mono">
              {settlement.settlementId}
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px] mt-0.5">
            <span className="text-slate-400 capitalize font-medium">
              {settlement.status === 'paid' ? 'Paid to Bank' : settlement.status === 'failed' ? 'Bank IFSC Holdback' : 'Delayed Clearing'}
            </span>
            <span className="text-slate-300">·</span>
            <button
              type="button"
              onClick={() => onWhyThisAmount && onWhyThisAmount(settlement)}
              className="text-blue-600 hover:text-blue-700 font-semibold cursor-pointer underline underline-offset-2 decoration-blue-300 hover:decoration-blue-600 text-[10px]"
            >
              Why this amount?
            </button>
          </div>
        </div>
      </div>

      {/* Right: Amount & Date */}
      <div className="text-right shrink-0 pl-2">
        <MoneyAmount
          amount={settlement.amount}
          showSign={true}
          type={amountType}
          className="text-xs sm:text-sm font-bold block"
        />
        <span className="text-[10px] text-slate-400 font-medium">
          {settlement.date}
        </span>
      </div>
    </div>
  );
};

