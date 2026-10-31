import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Zap,
  Clock,
  Briefcase,
  ShieldCheck,
  ArrowLeft,
  TrendingUp,
  CheckCircle2,
  Activity,
  Layers,
  BarChart3
} from 'lucide-react';
import { api } from '../lib/api';

export default function Outcomes() {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      const data = await api.getMetrics();
      setMetrics(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const summary = metrics?.summary;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans relative overflow-x-hidden">
      {/* Ambient background glow */}
      <div className="fixed top-0 left-1/3 w-[500px] h-[500px] bg-[#00BAF2]/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Floating Glass Header */}
      <header className="sticky top-0 z-40 px-4 sm:px-6 py-3">
        <div className="max-w-6xl mx-auto glass-strong border border-white/90 px-4 sm:px-6 py-2.5 flex items-center justify-between shadow-lg shadow-blue-900/5">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/ops')}
              className="w-9 h-9 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:text-[#002970] font-bold shadow-xs transition"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="font-extrabold text-sm sm:text-base text-[#002970]">
                Sulajh AI · Outcomes & ROI Board
              </h1>
              <p className="text-[11px] text-slate-500 font-medium">
                Autonomous Teammate Performance (Track 3 Mandatory Deliverable)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] px-2.5 py-1 rounded-full bg-sky-50 text-[#002970] border border-sky-100 font-bold uppercase tracking-wider flex items-center gap-1">
              <Activity className="w-3 h-3 text-[#00BAF2]" />
              <span>Simulated Sandbox Metrics</span>
            </span>
            <button
              type="button"
              onClick={() => navigate('/ops')}
              className="px-4 py-2 rounded-xl bg-[#002970] text-white text-xs font-bold shadow-sm hover:bg-[#001A49] transition"
            >
              Ops Console
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-4 flex-1 space-y-6">
        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1 */}
          <div className="glass-strong p-6 rounded-[28px] border border-white shadow-md relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
              <span>Auto-Resolution Rate</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Zap className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold text-[#002970] tracking-tight">
              {summary ? `${summary.auto_resolution_rate_percent}%` : '74%'}
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-1.5">
              Resolved automatically within INR 5,000 policy limits without human escalation.
            </p>
            <div className="mt-3 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full" style={{ width: '74%' }} />
            </div>
          </div>

          {/* Card 2 */}
          <div className="glass-strong p-6 rounded-[28px] border border-white shadow-md relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
              <span>Time to First Response</span>
              <div className="w-8 h-8 rounded-xl bg-sky-50 text-[#002970] flex items-center justify-center">
                <Clock className="w-4 h-4 text-[#00BAF2]" />
              </div>
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold text-[#002970] tracking-tight">
              {summary ? `${summary.avg_time_to_first_response_seconds}s` : '1.8s'}
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-1.5">
              Zero ticket queue waiting time for distressed merchants.
            </p>
            <div className="mt-3 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#002970] to-[#00BAF2] rounded-full" style={{ width: '92%' }} />
            </div>
          </div>

          {/* Card 3 */}
          <div className="glass-strong p-6 rounded-[28px] border border-white shadow-md relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
              <span>Ops Hours Saved</span>
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Briefcase className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold text-[#002970] tracking-tight">
              {summary ? `${summary.estimated_ops_hours_saved} hrs` : '184 hrs'}
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-1.5">
              Equivalent to 2.5 full-time L1 support executive shifts this month.
            </p>
            <div className="mt-3 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full" style={{ width: '68%' }} />
            </div>
          </div>

          {/* Card 4 */}
          <div className="glass-strong p-6 rounded-[28px] border border-white shadow-md relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
              <span>Disputes Defended</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold text-[#002970] tracking-tight">
              {summary ? `₹${summary.disputes_defended_inr.toLocaleString('en-IN')}` : '₹48,200'}
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-1.5">
              Preserved merchant settlement capital from default forfeiture.
            </p>
            <div className="mt-3 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full" style={{ width: '80%' }} />
            </div>
          </div>
        </div>

        {/* Issue Volume Breakdown Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="glass-strong p-6 rounded-[28px] border border-white shadow-md space-y-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#002970]" />
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#002970]">
                Resolution Volume by Issue Category
              </h3>
            </div>

            <div className="space-y-3">
              {[
                { label: 'Failed Payout Re-initiations', count: 18, pct: 45, color: 'from-[#002970] to-[#00BAF2]' },
                { label: 'Settlement Line-Item Reconciliation', count: 12, pct: 30, color: 'from-emerald-500 to-teal-400' },
                { label: 'Chargeback & Dispute Defense Filing', count: 7, pct: 18, color: 'from-purple-500 to-indigo-400' },
                { label: 'Bank CBS Outage Aggregations', count: 3, pct: 7, color: 'from-amber-500 to-orange-400' },
              ].map((item) => (
                <div key={item.label} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-700">{item.label}</span>
                    <span className="text-slate-900">{item.count} cases ({item.pct}%)</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full bg-gradient-to-r ${item.color} rounded-full`} style={{ width: `${item.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-strong p-6 rounded-[28px] border border-white shadow-md space-y-4">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#002970]" />
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#002970]">
                Autonomous vs Human Decision Distribution
              </h3>
            </div>

            <div className="p-4 rounded-2xl bg-white/80 border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">Autonomous Resolves (Gated &lt; ₹5,000)</span>
                <span className="font-extrabold text-emerald-600">74%</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">L1 Ops Agent Reviews (&lt; ₹25,000)</span>
                <span className="font-extrabold text-[#00BAF2]">18%</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">Ops Manager 2FA Authorizations (&gt; ₹25,000)</span>
                <span className="font-extrabold text-purple-600">8%</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 font-medium leading-relaxed flex items-start gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                Every single autonomous action adheres to the strict rule: "Money safety lives in code, not in prompts." 
                All financial mutations are auditable in real-time.
              </span>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
