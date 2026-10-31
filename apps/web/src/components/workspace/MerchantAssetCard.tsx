import React, { useState } from 'react';
import { 
  Store, 
  ArrowUpRight, 
  CheckSquare, 
  Info, 
  CheckCircle2, 
  ShieldCheck 
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
  riskFlag = 'Clean (Tier 1)',
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
    <div className="bg-white rounded-[24px] border border-slate-200/90 p-4 sm:p-5 shadow-sm flex flex-col justify-between h-full thin-scroll">
      
      <div>
        {/* ─── SECTION 1: MERCHANT ON FILE ─── */}
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-800 flex items-center justify-center">
              <Store className="w-3.5 h-3.5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="font-['Outfit',sans-serif] font-bold text-sm sm:text-base text-slate-900 leading-tight">
                Merchant on File
              </h3>
              <span className="text-[10px] text-slate-400">KYC & Banking Profile</span>
            </div>
          </div>

          <button
            type="button"
            className="w-7 h-7 rounded-full border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-500 hover:text-slate-900 transition cursor-pointer"
            title="Open merchant full dossier"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Merchant Item Row (Mirrors CAT Excavator in Reference) */}
        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 my-2.5 flex items-center gap-2.5 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white font-bold text-sm flex items-center justify-center shadow-xs shrink-0">
            {merchantName.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate">
              {merchantName}
            </h4>
            <p className="text-[10px] text-slate-500 font-mono truncate">
              {merchantId} · {category}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-semibold text-emerald-700">Verified Soundbox Merchant</span>
            </div>
          </div>
        </div>

        {/* Three Stat Tiles (Mirrors Hour meter, Fuel, Damage in Reference) */}
        <div className="grid grid-cols-3 gap-2 text-center mb-3 shrink-0">
          <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[9px] font-semibold text-slate-400 block uppercase tracking-wider">
              Open Disputes
            </span>
            <span className="font-['Sora',sans-serif] font-bold text-sm sm:text-base text-slate-900 mt-0.5 block">
              {openDisputesCount}
            </span>
          </div>

          <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[9px] font-semibold text-slate-400 block uppercase tracking-wider">
              Failed Payouts
            </span>
            <span className="font-['Sora',sans-serif] font-bold text-sm sm:text-base text-amber-600 mt-0.5 block">
              {failedPayoutsCount}
            </span>
          </div>

          <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[9px] font-semibold text-slate-400 block uppercase tracking-wider">
              Risk Flag
            </span>
            <span className="font-['Sora',sans-serif] font-bold text-sm sm:text-base text-emerald-600 mt-0.5 block">
              Clean
            </span>
          </div>
        </div>

        {/* ─── SECTION 2: BEFORE YOU APPROVE (MIRRORS ON ARRIVAL) ─── */}
        <div className="pt-2.5 border-t border-slate-100 shrink-0">
          <div className="flex items-center gap-1.5 mb-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
            <h3 className="font-['Outfit',sans-serif] font-bold text-xs sm:text-sm text-slate-900 leading-tight">
              Before You Approve
            </h3>
          </div>

          {/* Checklist with Rounded-Corner Checkboxes */}
          <div className="space-y-2 my-1.5">
            {[
              "Read Sulajh's diagnostic root-cause summary",
              `Check the ledger tally (Gross ₹${(amount + 114.46).toFixed(2)} - MDR = ₹${amount.toLocaleString('en-IN')})`,
              `Check beneficiary bank details ending in ${accountLast4}`,
              "Send confirmation reply to merchant WhatsApp & Soundbox",
            ].map((item, idx) => (
              <label
                key={idx}
                className="flex items-start gap-2 text-xs text-slate-700 cursor-pointer select-none group"
                onClick={() => toggleCheck(idx)}
              >
                <div className="mt-0.5 shrink-0">
                  {checkedItems[idx] ? (
                    <div className="w-3.5 h-3.5 rounded-md bg-[#12141A] text-white flex items-center justify-center">
                      <CheckSquare className="w-3 h-3" />
                    </div>
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-md border border-slate-300 group-hover:border-slate-400 bg-white" />
                  )}
                </div>
                <span className={`leading-tight text-[11px] sm:text-xs ${checkedItems[idx] ? 'text-slate-900 font-medium' : 'text-slate-500'}`}>
                  {item}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Pale Blue Info Note Strip at Bottom */}
      <div className="mt-3 p-2.5 rounded-xl bg-blue-50/80 border border-blue-200/80 flex items-start gap-2 text-[11px] text-blue-950 leading-relaxed shrink-0">
        <Info className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
        <span>
          Approving re-initiates the payout and notifies the merchant. Recorded in the <strong>append-only audit ledger</strong>.
        </span>
      </div>

    </div>
  );
};
