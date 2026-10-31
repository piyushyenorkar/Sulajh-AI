import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Download,
  Gamepad2,
  Lightbulb,
  Lock,
  ArrowLeft,
  Check,
  X,
  Edit3,
  Save,
  Layers,
  LogOut,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { api } from '../lib/api';

export default function Admin() {
  const navigate = useNavigate();
  const session = api.getSession();

  const [policies, setPolicies] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Edit policy state
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editingVal, setEditingVal] = useState('');

  useEffect(() => {
    if (!session || session.user.role !== 'admin') {
      navigate('/login');
      return;
    }
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const polRes = await api.getPolicies();
      if (polRes.policies) setPolicies(polRes.policies);

      const suggRes = await api.getPolicySuggestions();
      if (suggRes.suggestions) setSuggestions(suggRes.suggestions);

      const auditRes = await api.getAuditLogs();
      if (auditRes.logs) setAuditLogs(auditRes.logs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePolicy = async (key: string) => {
    try {
      const res = await api.updatePolicy(key, editingVal);
      if (res.ok) {
        setEditingKey(null);
        loadAdminData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleActOnSuggestion = async (id: string, action: 'accept' | 'dismiss') => {
    try {
      const res = await api.actOnSuggestion(id, action);
      if (res.ok) {
        loadAdminData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans relative overflow-x-hidden">
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
                Sulajh AI · Admin & Risk Control Panel
              </h1>
              <p className="text-[11px] text-slate-500 font-medium">
                Versioned Guardrails, AI Policy Suggestions & Append-Only Audit Stream
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/api/audit/export"
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-1.5 rounded-xl glass-btn text-xs font-bold text-[#002970] flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Audit CSV</span>
            </a>
            <button
              type="button"
              onClick={() => navigate('/demo-control')}
              className="px-3.5 py-1.5 rounded-xl glass-btn text-xs font-bold text-[#00BAF2] flex items-center gap-1.5"
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

      {/* Main Admin Content */}
      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-4 flex-1 space-y-6">
        {/* Section 1: AI Policy Suggestions */}
        {suggestions.length > 0 && (
          <div className="glass-strong p-6 rounded-[28px] border border-white shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                  <Lightbulb className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-extrabold uppercase tracking-wider text-[#002970]">
                    AI Policy Suggestion (Learning Loop - B4)
                  </h2>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Synthesized from approval history where human ops consistently approved low-risk payouts.
                  </p>
                </div>
              </div>
              <span className="text-[10px] px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 font-bold border border-purple-200">
                Actionable Recommendation
              </span>
            </div>

            {suggestions.map((s) => (
              <div key={s.id} className="p-4 rounded-2xl bg-white/90 border border-purple-100 flex items-center justify-between shadow-xs">
                <div>
                  <div className="text-xs font-bold text-slate-800">{s.suggestion}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Evidence: {s.evidence}</div>
                </div>

                {s.status === 'pending' ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleActOnSuggestion(s.id, 'dismiss')}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                    >
                      Dismiss
                    </button>
                    <button
                      type="button"
                      onClick={() => handleActOnSuggestion(s.id, 'accept')}
                      className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#002970] to-[#00BAF2] text-white text-xs font-bold shadow-sm"
                    >
                      Accept & Raise Limit
                    </button>
                  </div>
                ) : (
                  <span className="text-xs px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 font-bold capitalize flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{s.status}</span>
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Section 2: Versioned Money Policies */}
        <div className="glass-strong p-6 rounded-[28px] border border-white shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-[#002970]">
              Versioned Money Safety Policies & Guardrails
            </h2>
            <span className="text-[11px] text-slate-500 font-medium">
              Every change creates an immutable new version row in database.
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="pb-2.5">Policy Key</th>
                  <th className="pb-2.5">Current Value</th>
                  <th className="pb-2.5">Version</th>
                  <th className="pb-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {policies.map((p) => {
                  const isEditing = editingKey === p.key;
                  return (
                    <tr key={p.id} className="hover:bg-white/50 transition">
                      <td className="py-3 font-bold font-mono text-[#002970]">{p.key}</td>
                      <td className="py-3 font-semibold text-slate-800">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editingVal}
                            onChange={(e) => setEditingVal(e.target.value)}
                            className="px-2.5 py-1 border border-slate-200 rounded-lg text-xs font-bold"
                            autoFocus
                          />
                        ) : (
                          p.value
                        )}
                      </td>
                      <td className="py-3 font-mono text-slate-500">v{p.version}</td>
                      <td className="py-3 text-right">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setEditingKey(null)}
                              className="px-2.5 py-1 rounded-lg text-slate-500 font-bold"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSavePolicy(p.key)}
                              className="px-3 py-1 rounded-lg bg-[#002970] text-white font-bold flex items-center gap-1"
                            >
                              <Save className="w-3 h-3" />
                              <span>Save</span>
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingKey(p.key);
                              setEditingVal(p.value);
                            }}
                            className="px-3 py-1 rounded-lg glass-btn text-[11px] font-bold text-[#002970] inline-flex items-center gap-1"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Edit</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 3: Append-Only Audit Stream Preview */}
        <div className="glass-strong p-6 rounded-[28px] border border-white shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-[#002970]">
              Append-Only Audit Trail Stream (Live Preview)
            </h2>
            <span className="text-[11px] font-mono font-bold text-emerald-600 flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              <span>Immutable (UPDATE/DELETE BLOCKED)</span>
            </span>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {auditLogs.slice(0, 15).map((log) => (
              <div key={log.id} className="p-3 rounded-xl bg-white/80 border border-slate-200/70 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-bold">
                    {log.actor_type}
                  </span>
                  <span className="font-bold text-slate-800">{log.action}</span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                  <span>{log.case_id ? `Case: ${log.case_id.slice(0, 8)}` : ''}</span>
                  <span>{new Date(log.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
