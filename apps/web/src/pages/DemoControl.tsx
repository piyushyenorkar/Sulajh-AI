import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Gamepad2,
  CheckCircle2,
  AlertOctagon,
  Zap,
  Clock,
  ClipboardList,
  Building2,
  RotateCcw,
  ArrowRight,
  ExternalLink,
  ShieldAlert,
  ChevronRight
} from 'lucide-react';
import { api } from '../lib/api';

export default function DemoControl() {
  const navigate = useNavigate();
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [loadingEvent, setLoadingEvent] = useState<string | null>(null);

  const handleTriggerEvent = async (type: string, label: string) => {
    setLoadingEvent(type);
    setStatusMsg(null);

    try {
      const res = await api.triggerMockEvent(type);
      if (res.ok) {
        if (type === 'reset_demo') {
          setStatusMsg('Demo environment reset to initial seed data state.');
        } else if (type === 'bank_outage') {
          setStatusMsg(`Bank Outage Incident #${res.incident_id?.slice(0, 8)} opened with 10 linked cases.`);
        } else {
          setStatusMsg(`Proactive event '${label}' fired! Case #${res.case_id?.slice(0, 8)} opened and Sulajh reached out to merchant.`);
        }
      }
    } catch {
      setStatusMsg('Failed to trigger event');
    } finally {
      setLoadingEvent(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 text-white font-sans p-6 flex flex-col items-center justify-center">
      <div className="max-w-2xl w-full space-y-6 animate-slide-up">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider mb-3">
            <Gamepad2 className="w-4 h-4 text-[#00BAF2]" />
            <span>Live Hackathon Controller</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Sulajh AI Demo Controller</h1>
          <p className="text-slate-400 text-sm mt-1">
            Paytm Build for India Hackathon · Autonomous AI Teammate (Track 3)
          </p>
        </div>

        {statusMsg && (
          <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs font-bold animate-slide-up flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{statusMsg}</span>
          </div>
        )}

        {/* Action Grid */}
        <div className="glass-dark p-6 rounded-[32px] border border-white/10 space-y-4 backdrop-blur-xl">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            1. Trigger Proactive Events (AI Teammate Starts Work Itself)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => handleTriggerEvent('settlement_failed', 'Failed Payout')}
              disabled={loadingEvent !== null}
              className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition text-xs font-medium"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-rose-400 flex items-center gap-1.5">
                  <AlertOctagon className="w-4 h-4" />
                  <span>Failed Settlement</span>
                </span>
                <span className="text-[10px] text-slate-400">Scenario 1</span>
              </div>
              <p className="text-slate-400 text-[11px]">
                Fires NPCI IFSC failure. AI opens case, diagnoses cause, and messages Ramesh first.
              </p>
            </button>

            <button
              onClick={() => handleTriggerEvent('settlement_delayed', 'Delayed Payout')}
              disabled={loadingEvent !== null}
              className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition text-xs font-medium"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-amber-400 flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  <span>Delayed Settlement</span>
                </span>
                <span className="text-[10px] text-slate-400">Scenario 2</span>
              </div>
              <p className="text-slate-400 text-[11px]">
                Simulates sponsor bank clearing congestion past 120 minutes with ETA.
              </p>
            </button>

            <button
              onClick={() => handleTriggerEvent('dispute_due_soon', 'Dispute Due in 48h')}
              disabled={loadingEvent !== null}
              className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition text-xs font-medium"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-purple-400 flex items-center gap-1.5">
                  <ClipboardList className="w-4 h-4" />
                  <span>Dispute Due in 48h</span>
                </span>
                <span className="text-[10px] text-slate-400">Scenario 4</span>
              </div>
              <p className="text-slate-400 text-[11px]">
                Statutory chargeback alert. AI urgently collects delivery proof to defend.
              </p>
            </button>

            <button
              onClick={() => handleTriggerEvent('bank_outage', 'HDFC Bank Outage')}
              disabled={loadingEvent !== null}
              className="p-3.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-left transition text-xs font-medium"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-rose-300 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4" />
                  <span>Bank Outage (10 Failures)</span>
                </span>
                <span className="text-[10px] text-rose-300 font-bold">Scenario 7 / B3</span>
              </div>
              <p className="text-slate-400 text-[11px]">
                Groups 10 failures into 1 incident with 1 broadcast & bulk retry.
              </p>
            </button>
          </div>
        </div>

        {/* Portals & Reset Control */}
        <div className="glass-dark p-6 rounded-[32px] border border-white/10 space-y-4 backdrop-blur-xl">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            2. Jump into Demo Surfaces
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <button
              onClick={() => navigate('/chat')}
              className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold transition flex items-center justify-center gap-1.5 text-sky-300"
            >
              <span>Merchant Chat</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => navigate('/ops')}
              className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold transition flex items-center justify-center gap-1.5 text-blue-300"
            >
              <span>Ops Console</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => navigate('/outcomes')}
              className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold transition flex items-center justify-center gap-1.5 text-emerald-300"
            >
              <span>Outcomes ROI</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => navigate('/admin')}
              className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold transition flex items-center justify-center gap-1.5 text-purple-300"
            >
              <span>Admin Panel</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="pt-3 border-t border-white/10 flex items-center justify-between">
            <span className="text-xs text-slate-400">Reset prototype to fresh initial seed state:</span>
            <button
              onClick={() => handleTriggerEvent('reset_demo', 'Reset Demo')}
              disabled={loadingEvent !== null}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/20 text-xs font-bold transition flex items-center gap-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Demo State</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
