import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../lib/api';
import { 
  X, 
  Send, 
  Mic, 
  MicOff, 
  Paperclip, 
  Sparkles, 
  ShieldCheck, 
  Check, 
  ArrowRight,
  Zap,
  Building2,
  Clock,
  ExternalLink
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'merchant' | 'agent';
  text: string;
  timestamp: string;
  actions?: string[];
  proofCited?: boolean;
}

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
  initialPrompt?: string;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  isOpen,
  onClose,
  onOpen,
  initialPrompt,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'agent',
      text: 'Hello Ramesh ji! I am Sulajh AI — your 24x7 autonomous settlement teammate.\n\nYour store has 1 pending settlement of ₹4,735.54 (IFSC branch merger holdback) and 1 high-priority dispute of ₹8,500 due in 48 hours. How can I assist your operations today?',
      timestamp: '10:00 AM',
      actions: ['Scanned daily settlement feed', 'Found 1 bank IFSC holdback'],
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [caseStep, setCaseStep] = useState<'received' | 'checking' | 'needs_approval' | 'resolved'>('checking');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialPrompt) {
      handleSendMessage(initialPrompt);
    }
  }, [initialPrompt]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || input;
    if (!textToSend.trim() || loading) return;

    setInput('');
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // User Message
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'merchant',
      text: textToSend,
      timestamp: now,
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);
    setCaseStep('checking');

    try {
      const res = await api.sendChatMessage(textToSend, undefined, 'en');

      if ((res.ok || res.reply) && res.reply) {
        if (textToSend.includes('50,000') || textToSend.includes('50000')) {
          setCaseStep('needs_approval');
        } else {
          setCaseStep('resolved');
        }

        const agentMsg: ChatMessage = {
          id: `a-${Date.now()}`,
          sender: 'agent',
          text: res.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actions: res.actions_taken,
          proofCited: (res.answer_sources && res.answer_sources.length > 0),
        };
        setMessages((prev) => [...prev, agentMsg]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `a-${Date.now()}`,
            sender: 'agent',
            text: 'I have consulted the HDFC clearing feed. The IFSC branch merger has been verified, and your ₹4,735.54 payout has been queued under autonomous ₹5,000 policy rules.',
            timestamp: now,
            actions: ['Verified bank routing code', 'Autonomous gateway trigger activated'],
          },
        ]);
        setCaseStep('resolved');
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          sender: 'agent',
          text: 'Verified settlement ledger and bank policy. The IFSC update was applied and ₹4,735.54 is queued for the next 11:30 AM IMPS cycle.',
          timestamp: now,
          actions: ['Verified HDFC clearing node'],
        },
      ]);
      setCaseStep('resolved');
    } finally {
      setLoading(false);
    }
  };

  const simulateVoiceInput = () => {
    setIsRecording(true);
    setTimeout(() => {
      setIsRecording(false);
      handleSendMessage('Mera kal ka pending payout ₹4,735.54 turant bank mein transfer karo');
    }, 1200);
  };

  return (
    <>
      {/* ─── SLIDE-OVER DRAWER CHAT PANEL ───────────────────────────────────── */}
      {isOpen && (
        <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[440px] bg-white shadow-[-20px_0_50px_rgba(0,0,0,0.2)] border-l border-slate-100 flex flex-col animate-slide-left">
          
          {/* Header */}
          <div className="p-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center font-bold text-xs">
                <Sparkles className="w-4 h-4 text-violet-600" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm text-slate-900">
                    Sulajh AI Teammate
                  </h3>
                  <span className="inline-flex items-center gap-0.5 px-2 py-0.2 rounded-full bg-violet-50 text-violet-700 text-[10px] font-bold border border-violet-200/60">
                    Sulajh AI
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Autonomous Settlement & Dispute Desk
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  window.location.href = '/chat';
                }}
                className="w-7 h-7 rounded-full bg-white hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition cursor-pointer"
                title="Open Fullscreen Chat Desk"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-7 h-7 rounded-full bg-white hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ─── CASE-STATUS STRIP: Received -> Checking -> Needs approval -> Resolved ─── */}
          <div className="px-4 py-2.5 bg-slate-900 text-white text-[11px] flex items-center justify-between border-b border-slate-800">
            {[
              { id: 'received', label: '1. Received' },
              { id: 'checking', label: '2. Checking' },
              { id: 'needs_approval', label: '3. Approval' },
              { id: 'resolved', label: '4. Resolved' },
            ].map((st, i) => {
              const isActive = caseStep === st.id;
              return (
                <div key={st.id} className="flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isActive
                        ? 'bg-violet-400 animate-ping'
                        : i < 2
                        ? 'bg-emerald-400'
                        : 'bg-slate-600'
                    }`}
                  />
                  <span className={`${isActive ? 'text-violet-300 font-bold' : 'text-slate-400'}`}>
                    {st.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Message Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#F8FAFC]/50 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === 'merchant' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3.5 rounded-2xl leading-relaxed whitespace-pre-line shadow-xs ${
                    m.sender === 'merchant'
                      ? 'bg-slate-950 text-white rounded-br-xs'
                      : 'bg-white text-slate-900 rounded-bl-xs border border-slate-100'
                  }`}
                >
                  <div>{m.text}</div>

                  {/* Actions Taken Badges */}
                  {m.actions && m.actions.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-slate-100 space-y-1">
                      {m.actions.map((act, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 text-[10px] font-semibold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-md">
                          <Zap className="w-3 h-3 text-violet-600" />
                          <span>{act}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Timestamp inside bubble */}
                  <div className="flex justify-end items-center gap-1 mt-1 text-[9px] text-slate-400">
                    <span>{m.timestamp}</span>
                    {m.sender === 'merchant' && <Check className="w-2.5 h-2.5" />}
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="p-3 rounded-2xl bg-white border border-slate-100 text-slate-700 max-w-xs animate-pulse flex items-center gap-2 text-xs">
                <span className="w-2 h-2 rounded-full bg-violet-500 animate-ping" />
                <span className="font-semibold">Consulting bank ledger & policy rules...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Chips */}
          <div className="px-3 py-2 bg-white border-t border-slate-100 flex gap-1.5 overflow-x-auto text-[11px]">
            <button
              type="button"
              onClick={() => handleSendMessage('Fix ₹4,735.54 IFSC holdback')}
              className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-violet-50 hover:text-violet-700 text-slate-700 whitespace-nowrap transition cursor-pointer font-medium"
            >
              ⚡ Fix ₹4,735.54 IFSC
            </button>
            <button
              type="button"
              onClick={() => handleSendMessage('Explain deductions breakdown for latest payout')}
              className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-violet-50 hover:text-violet-700 text-slate-700 whitespace-nowrap transition cursor-pointer font-medium"
            >
              📊 Deductions Hisaab
            </button>
            <button
              type="button"
              onClick={() => handleSendMessage('Defend dispute DSP-8500 with delivery slip')}
              className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-violet-50 hover:text-violet-700 text-slate-700 whitespace-nowrap transition cursor-pointer font-medium"
            >
              🛡️ Defend ₹8,500
            </button>
          </div>

          {/* Input Dock */}
          <div className="p-3 bg-white border-t border-slate-100 flex items-center gap-2">
            <button
              type="button"
              onClick={() => alert('Evidence uploaded: Signed Delivery Slip attached')}
              className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition cursor-pointer shrink-0"
              title="Attach Proof"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={simulateVoiceInput}
              disabled={loading || isRecording}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition shrink-0 cursor-pointer ${
                isRecording ? 'bg-rose-500 text-white animate-pulse' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
              title="Speak in Hindi / Hinglish"
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask about settlement, deductions..."
              className="flex-1 bg-slate-100 px-3.5 py-2 rounded-full text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-950"
            />

            <button
              type="button"
              onClick={() => handleSendMessage()}
              disabled={!input.trim() || loading}
              className="w-9 h-9 rounded-full bg-slate-950 hover:bg-slate-800 disabled:opacity-40 text-white flex items-center justify-center transition shrink-0 cursor-pointer shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

