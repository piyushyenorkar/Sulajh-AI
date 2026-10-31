import React, { useState } from 'react';
import { 
  MessageSquare, 
  Send, 
  Sparkles, 
  Paperclip, 
  Play, 
  Pause, 
  Volume2, 
  FileText, 
  Check, 
  CheckCheck, 
  ShieldCheck, 
  ArrowLeft, 
  Radio, 
  Store,
  ChevronDown,
  ChevronUp,
  Download
} from 'lucide-react';
import { CaseChatMessage, OpsTicket } from '../../data/opsConsoleData';

export interface FullMerchantChatViewProps {
  ticket: OpsTicket;
  onBackToOverview?: () => void;
  onSendMessage?: (text: string) => void;
}

export const FullMerchantChatView: React.FC<FullMerchantChatViewProps> = ({
  ticket,
  onBackToOverview,
  onSendMessage,
}) => {
  const [messages, setMessages] = useState<CaseChatMessage[]>(ticket.chatHistory || []);
  const [inputText, setInputText] = useState('');
  const [activeVoicePlaying, setActiveVoicePlaying] = useState<string | null>(null);
  const [expandedProofId, setExpandedProofId] = useState<string | null>(null);
  const [showQuickPills, setShowQuickPills] = useState(true);

  const quickReplies = [
    `Namaste ${ticket.merchantName.split(' ')[0]} ji! Maine updated IFSC re-route approve kar diya hai, paisa agle 15 minutes mein credit ho jaayega.`,
    `Aapka courier delivery proof verify ho chuka hai. Humne bank dispute defend kar diya hai aur payout dispatch process start hai.`,
    `Hello! Your pending settlement has been approved and dispatched via instant IMPS clearing.`,
  ];

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg: CaseChatMessage = {
      id: `agent-msg-${Date.now()}`,
      sender: 'agent',
      senderName: 'Vikram Singh (L1 Agent)',
      text: inputText.trim(),
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText('');

    if (onSendMessage) {
      onSendMessage(inputText.trim());
    }
  };

  const toggleVoiceAudio = (msgId: string) => {
    setActiveVoicePlaying((current) => (current === msgId ? null : msgId));
  };

  return (
    <div className="bg-white rounded-[24px] border border-slate-200/90 shadow-sm flex flex-col h-[750px] overflow-hidden">
      
      {/* ─── TOP CHAT HEADER ─── */}
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          {onBackToOverview && (
            <button
              type="button"
              onClick={onBackToOverview}
              className="w-8 h-8 rounded-full border border-slate-200 hover:bg-white flex items-center justify-center text-slate-600 transition cursor-pointer"
              title="Back to Overview"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}

          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-orange-600 text-white font-bold text-sm flex items-center justify-center shadow-xs">
            {ticket.merchantName.slice(0, 2).toUpperCase()}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-['Outfit',sans-serif] font-bold text-base text-slate-900 leading-tight">
                {ticket.merchantName}
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Verified Merchant
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
              <span>{ticket.merchantId}</span>
              <span>•</span>
              <span className="flex items-center gap-1 text-slate-700 font-medium">
                <Radio className="w-3 h-3 text-emerald-500" /> WhatsApp & Soundbox Live Thread
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <span className="text-xs text-slate-400 font-medium block">Case Amount</span>
            <span className="font-['Sora',sans-serif] font-bold text-base text-slate-900">
              ₹{ticket.amount.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-violet-50 border border-violet-200/60 text-xs font-semibold text-[#6D5BD0] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Automated Stream</span>
          </div>
        </div>
      </div>

      {/* ─── CHAT MESSAGES SCROLLABLE BODY ─── */}
      <div className="flex-1 p-6 overflow-y-auto space-y-5 bg-[#F9FAFB]/70">
        
        {/* Timeline Start Marker */}
        <div className="flex items-center justify-center my-2">
          <span className="px-3.5 py-1 rounded-full bg-white border border-slate-200 text-slate-500 text-[11px] font-semibold shadow-2xs">
            Today • Ticket {ticket.ticketNumber} Opened at {ticket.openedAt}
          </span>
        </div>

        {messages.map((msg) => {
          const isMerchant = msg.sender === 'merchant';
          const isAi = msg.sender === 'ai';
          const isAgent = msg.sender === 'agent';

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isMerchant ? 'items-start' : 'items-end'}`}
            >
              {/* Sender Name & Timestamp Header */}
              <div className="flex items-center gap-2 mb-1 px-1">
                <span className={`text-[11px] font-bold ${
                  isMerchant ? 'text-slate-700' : isAi ? 'text-[#6D5BD0]' : 'text-blue-700'
                }`}>
                  {msg.senderName}
                </span>
                <span className="text-[10px] text-slate-400">{msg.timestamp}</span>
                {msg.channel && (
                  <span className="px-1.5 py-0.2 rounded bg-slate-200/60 text-slate-600 text-[9px] font-semibold capitalize">
                    via {msg.channel}
                  </span>
                )}
              </div>

              {/* Message Bubble Card */}
              <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 shadow-2xs ${
                isMerchant
                  ? 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs'
                  : isAi
                  ? 'bg-gradient-to-br from-violet-50/90 to-purple-50/50 border border-violet-200/80 text-slate-800 rounded-tr-xs'
                  : 'bg-[#12141A] text-white rounded-tr-xs shadow-sm'
              }`}>
                
                {/* Voice Audio Note Player (If audio message) */}
                {msg.voiceDuration && (
                  <div className={`mb-3 p-2.5 rounded-xl border flex items-center justify-between gap-3 ${
                    isMerchant ? 'bg-slate-50 border-slate-200' : 'bg-white/10 border-white/20'
                  }`}>
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => toggleVoiceAudio(msg.id)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition cursor-pointer ${
                          isMerchant ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-white text-slate-900'
                        }`}
                      >
                        {activeVoicePlaying === msg.id ? (
                          <Pause className="w-3.5 h-3.5 fill-current" />
                        ) : (
                          <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                        )}
                      </button>

                      {/* Visual Waveform */}
                      <div className="flex items-center gap-1 h-5">
                        {[40, 70, 30, 90, 60, 100, 45, 80, 50, 75, 35, 65, 85].map((h, i) => (
                          <span
                            key={i}
                            className={`w-1 rounded-full transition-all duration-300 ${
                              activeVoicePlaying === msg.id
                                ? 'bg-[#F2531D] animate-pulse'
                                : isMerchant ? 'bg-slate-300' : 'bg-white/40'
                            }`}
                            style={{ height: `${h}%` }}
                          />
                        ))}
                      </div>
                    </div>

                    <span className={`text-[11px] font-mono font-bold ${
                      isMerchant ? 'text-slate-600' : 'text-slate-300'
                    }`}>
                      {activeVoicePlaying === msg.id ? '0:06 / ' : ''}{msg.voiceDuration}
                    </span>
                  </div>
                )}

                {/* Main Text Content */}
                <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                  {msg.text}
                </p>

                {/* File Attachment Chip (e.g. Courier POD or Invoice) */}
                {msg.attachment && (
                  <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {msg.attachment.name}
                        </p>
                        <p className="text-[10px] text-slate-500 font-mono">
                          {msg.attachment.size} • Verified Proof Attachment
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold flex items-center gap-1 transition cursor-pointer shadow-2xs"
                    >
                      <Download className="w-3 h-3" />
                      <span>View</span>
                    </button>
                  </div>
                )}

                {/* AI Proof Trail Expandable Strip (If AI response) */}
                {msg.proofTrail && (
                  <div className="mt-2.5 pt-2 border-t border-violet-200/60">
                    <button
                      type="button"
                      onClick={() => setExpandedProofId(expandedProofId === msg.id ? null : msg.id)}
                      className="text-[11px] font-bold text-[#6D5BD0] hover:text-violet-800 flex items-center gap-1 cursor-pointer"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Why this answer? (Proof Trail & Rules)</span>
                      {expandedProofId === msg.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>

                    {expandedProofId === msg.id && (
                      <div className="mt-2 p-2.5 rounded-xl bg-white/90 border border-violet-200 text-[11px] space-y-1 font-mono text-slate-700 animate-slide-down">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Tool Executed:</span>
                          <span className="font-bold text-[#6D5BD0]">{msg.proofTrail.toolName}()</span>
                        </div>
                        {msg.proofTrail.ruleRef && (
                          <div className="flex justify-between">
                            <span className="text-slate-500">Policy Rule:</span>
                            <span className="text-slate-800">{msg.proofTrail.ruleRef}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-slate-500">Confidence Score:</span>
                          <span className="font-bold text-emerald-600">{msg.proofTrail.confidence}%</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

              </div>
            </div>
          );
        })}

      </div>

      {/* ─── BOTTOM STAFF COMPOSER & QUICK REPLIES ─── */}
      <div className="p-4 border-t border-slate-200 bg-white shrink-0 space-y-3">
        
        {/* Quick Suggested Replies Strip */}
        {showQuickPills && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
              <span className="flex items-center gap-1 text-[#6D5BD0]">
                <Sparkles className="w-3.5 h-3.5" /> 1-Click Suggested Replies (Merchant Language):
              </span>
              <button
                type="button"
                onClick={() => setShowQuickPills(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                Hide
              </button>
            </div>

            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {quickReplies.map((qr, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setInputText(qr)}
                  className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200/60 text-xs font-semibold text-slate-700 text-left truncate max-w-[280px] shrink-0 transition cursor-pointer shadow-2xs"
                >
                  {qr}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message Input Form */}
        <form onSubmit={handleSend} className="flex items-center gap-3">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type message to merchant (dispatches to WhatsApp & Soundbox)..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-100 focus:bg-white border border-transparent focus:border-slate-300 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 outline-none transition"
          />

          <button
            type="submit"
            disabled={!inputText.trim()}
            className="px-5 py-2.5 rounded-xl bg-[#12141A] hover:bg-black text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-40"
          >
            <span>Send to Merchant</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>

        <p className="text-[11px] text-slate-400 text-center">
          Messages sent here are delivered directly to the merchant's <strong>WhatsApp</strong> and spoken aloud on their <strong>Paytm Soundbox</strong>.
        </p>

      </div>

    </div>
  );
};

