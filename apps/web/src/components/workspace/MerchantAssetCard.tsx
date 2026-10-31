import React, { useState } from 'react';
import { 
  Store, 
  ArrowUpRight, 
  CheckSquare, 
  Square, 
  Info, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

export interface MerchantAssetCardProps {
  merchantName: string;
  merchantId: string;
  category: string;
  openDisputesCount?: number;
  failedPayoutsCount?: number;
  riskFlag?: string;
  accountLast4?: string;
  amount: number;
}

export const MerchantAssetCard: React.FC<MerchantAssetCardProps> = ({
  merchantName,
  merchantId,
  category,
  openDisputesCount = 2,
  failedPayoutsCount = 1,
  riskFlag = 'None',
  accountLast4 = '4821',
  amount = 4735.54,
}) => {
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({
    0: true, // Read Sulajh's summary
    1: true, // Check ledger tally
    2: true, // Check bank details ending 4821
    3: false, // Reply to the merchant
  });

  const toggleCheck = (index: number) => {
    setCheckedItems((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      
      {/* ─── CARD 1: MERCHANT ON FILE (MIRRORS ASSET ON BOARD IN REFERENCE) ─── */}
      <div className="bg-white rounded-[24px] border border-slate-200/90 p-5 sm:p-6 shadow-sm">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-3.5 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-800 flex items-center justify-center">
              <Store className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="font-['Outfit',sans-serif] font-bold text-base text-slate-900 leading-tight">
                Merchant on File
              </h3>
              <span className="text-[11px] text-slate-400">KYC & Banking Profile</span>
            </div>
          </div>

          <button
            type="button"
            className="w-7 h-7 rounded-full border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-800 transition"
            title="Open merchant full dossier"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Merchant Item Row (Mirrors Excavator Item Card) */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 mb-3 flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white font-bold text-base flex items-center justify-center shadow-xs shrink-0">
            {merchantName.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-sm text-slate-900 truncate">
              {merchantName}
            </h4>
            <p className="text-[11px] text-slate-500 font-mono truncate">
              {merchantId} · {category}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-semibold text-emerald-700">Verified Soundbox Merchant</span>
            </div>
          </div>
        </div>

        {/* Three Grey Stat Tiles (Mirrors Hour meter, Fuel, Damage in Reference) */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] font-medium text-slate-400 block uppercase tracking-wider">
              Open Disputes
            </span>
            <span className="font-['Sora',sans-serif] font-bold text-base text-slate-900 mt-0.5 block">
              {openDisputesCount}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] font-medium text-slate-400 block uppercase tracking-wider">
              Failed Payouts
            </span>
            <span className="font-['Sora',sans-serif] font-bold text-base text-amber-600 mt-0.5 block">
              {failedPayoutsCount}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] font-medium text-slate-400 block uppercase tracking-wider">
              Risk Flag
            </span>
            <span className="font-['Sora',sans-serif] font-bold text-base text-emerald-600 mt-0.5 block">
              {riskFlag}
            </span>
          </div>
        </div>

      </div>

      {/* ─── CARD 2: BEFORE YOU APPROVE (MIRRORS ON ARRIVAL IN REFERENCE) ─── */}
      <div className="bg-white rounded-[24px] border border-slate-200/90 p-5 sm:p-6 shadow-sm flex-1 flex flex-col justify-between">
        
        <div>
          {/* Header */}
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
            <h3 className="font-['Outfit',sans-serif] font-bold text-base text-slate-900 leading-tight">
              Before You Approve
            </h3>
          </div>

          {/* Checklist with Rounded-Corner Checkboxes */}
          <div className="space-y-2.5 my-2">
            {[
              "Read Sulajh's diagnostic root-cause summary",
              `Check the ledger tally (Gross ₹4,850 - MDR = ₹${amount.toLocaleString('en-IN')})`,
              `Check beneficiary bank details ending in ${accountLast4}`,
              "Send confirmation reply to merchant WhatsApp & Soundbox",
            ].map((item, idx) => (
              <label
                key={idx}
                className="flex items-start gap-2.5 text-xs text-slate-700 cursor-pointer select-none group"
                onClick={() => toggleCheck(idx)}
              >
                <div className="mt-0.5 shrink-0">
                  {checkedItems[idx] ? (
                    <div className="w-4 h-4 rounded-md bg-[#12141A] text-white flex items-center justify-center">
                      <CheckSquare className="w-3.5 h-3.5" />
                    </div>
                  ) : (
                    <div className="w-4 h-4 rounded-md border border-slate-300 group-hover:border-slate-400 bg-white" />
                  )}
                </div>
                <span className={`leading-snug ${checkedItems[idx] ? 'text-slate-900 font-medium' : 'text-slate-500'}`}>
                  {item}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Pale Blue Info Note Strip at Bottom (Mirrors Info Note in Reference) */}
        <div className="mt-4 p-3 rounded-xl bg-blue-50/70 border border-blue-200/70 flex items-start gap-2.5 text-[11px] text-blue-900 leading-relaxed">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <span>
            Approving re-initiates the payout and notifies the merchant. This action is permanently recorded in the <strong>append-only audit ledger</strong>.
          </span>
        </div>

      </div>

    </div>
  );
};

