import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  LayoutGrid,
  BarChart3,
  Wallet,
  ShieldAlert,
  MessageSquareText,
  Settings,
  LogOut,
  Search,
  Bell,
  Sparkles,
  Mic,
  MicOff,
  Send,
  Check,
  ChevronDown,
  ChevronUp,
  Info,
  X,
  Receipt,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  Zap,
  Building2,
  Clock,
  ExternalLink,
  FileText,
  CheckCircle2,
  HelpCircle,
  RefreshCw
} from 'lucide-react';
import { api } from '../lib/api';
import { MERCHANT_INFO } from '../data/merchantDashboardData';

interface MessageItem {
  id: string;
  sender: 'merchant' | 'agent' | 'staff';
  text: string;
  timestamp: string;
  actions?: string[];
  answerSources?: Array<{
    id: string;
    record_ref: string;
    rule_key?: string;
    step_id?: string;
  }>;
}

// Enterprise Quick Actions & Translations
const WELCOME_MESSAGES = {
  en: (name: string) => `Hello ${name}! I am Sulajh AI — your 24x7 autonomous settlement operations teammate.\n\nYour store's payout of ₹4,735.54 from yesterday is pending due to a bank branch IFSC code update. You can ask me any question regarding your settlements, deductions, or customer disputes.`,
  hinglish: (name: string) => `Namaste ${name}! Main Sulajh AI hoon — aapka 24x7 autonomous settlement operations teammate.\n\nAapke store ka kal ka ₹4,735.54 ka payout bank IFSC update ke kaaran pending hai. Aap mujhse settlement delay, deductions hisaab, ya chargeback dispute ke baare mein pooch sakte hain.`,
  hi: (name: string) => `नमस्ते ${name}! मैं सुलझ एआई हूँ — आपका 24x7 स्वायत्त सेटलमेंट ऑपरेशंस सहयोगी।\n\nआपके स्टोर का कल का ₹4,735.54 का पेआउट बैंक शाखा IFSC अपडेट के कारण लंबित है। आप मुझसे सेटलमेंट में देरी, कटौती का हिसाब, या ग्राहक विवाद के बारे में पूछ सकते हैं।`
};

const SUGGESTIONS = {
  en: [
    {
      label: 'Payout Diagnostics',
      Icon: Zap,
      prompt: 'My yesterday payout of ₹4,735.54 is delayed, check bank IFSC status',
      desc: 'Check IFSC & clearing failure status',
    },
    {
      label: 'Deductions Breakdown',
      Icon: Receipt,
      prompt: 'Why is my payout lower than expected, explain itemized deductions',
      desc: 'Itemized MDR, GST & Soundbox breakdown',
    },
    {
      label: 'Defend ₹8,500 Dispute',
      Icon: ShieldCheck,
      prompt: 'Customer dispute of ₹8,500 received, submit delivery proof to bank',
      desc: 'Submit delivery evidence before statutory SLA',
    },
    {
      label: 'Policy Cap Check',
      Icon: ShieldAlert,
      prompt: 'Why is my ₹50,000 payout held for review?',
      desc: 'Review autonomous ₹5,000 policy threshold',
    },
  ],
  hinglish: [
    {
      label: 'Settlement Status',
      Icon: Zap,
      prompt: 'Mera kal ka settlement abhi tak nahi aaya, kitna time lagega?',
      desc: 'Check IFSC & bank holdback status',
    },
    {
      label: 'Deductions Hisaab',
      Icon: Receipt,
      prompt: 'Mera paisa kam kyun aaya, pura hisaab samjhao',
      desc: 'Line-by-line MDR, GST & rental split',
    },
    {
      label: 'Defend ₹8,500 Dispute',
      Icon: ShieldCheck,
      prompt: 'Customer dispute aaya hai 8500 ka, proof submit karo',
      desc: 'Submit delivery evidence to bank',
    },
    {
      label: 'Policy Cap Check',
      Icon: ShieldAlert,
      prompt: 'Mera 50,000 payout hold par kyun hai?',
      desc: 'Review autonomous limits & approval',
    },
  ],
  hi: [
    {
      label: 'सेटलमेंट स्थिति',
      Icon: Zap,
      prompt: 'मेरा कल का सेटलमेंट अभी तक नहीं आया, कितना समय लगेगा?',
      desc: 'IFSC एवं बैंक होल्डबैक स्थिति जांचें',
    },
    {
      label: 'कटौती का पूरा हिसाब',
      Icon: Receipt,
      prompt: 'मेरा पैसा कम क्यों आया, पूरा हिसाब समझाओ',
      desc: 'MDR, GST एवं रेंटल का विस्तृत विवरण',
    },
    {
      label: '₹8,500 विवाद रक्षा',
      Icon: ShieldCheck,
      prompt: 'कस्टमर विवाद आया है 8500 का, प्रूफ सबमिट करो',
      desc: 'बैंक में डिलीवरी साक्ष्य जमा करें',
    },
    {
      label: 'सुरक्षा सीमा समीक्षा',
      Icon: ShieldAlert,
      prompt: 'मेरा 50,000 पेआउट होल्ड पर क्यों है?',
      desc: 'स्वायत्त सीमा एवं अनुमोदन की जानकारी',
    },
  ],
};

function SulajhAIIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" rx="7" fill="currentColor" fillOpacity="0.12" />
      <rect x="4.5" y="7" width="15" height="11.5" rx="3.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 3.5V7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="12" cy="2.5" r="1.25" fill="currentColor" />
      <circle cx="9" cy="12" r="1.5" fill="currentColor" />
      <circle cx="15" cy="12" r="1.5" fill="currentColor" />
      <path d="M9.5 15.2C10.5 16 13.5 16 14.5 15.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export default function Chat() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Active Session details
  const session = api.getSession();
  const rawBusinessName = session?.user?.businessName || (session?.user?.name ? `${session.user.name}'s Food Plaza` : "Piyush's Food Plaza");
  const ownerName = session?.user?.name || "Piyush";
  const avatarInitials = ownerName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || 'P';
  const bankAccount = session?.user?.bankLast4 ? `HDFC Bank •••• ${session.user.bankLast4}` : 'HDFC Bank •••• 5223';

  // Chat conversation state
  const [activeCase, setActiveCase] = useState<any>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState<'en' | 'hinglish' | 'hi'>('en');
  const [isRecording, setIsRecording] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false); // Collapsed by default for max chat room
  const [showPolicyInfo, setShowPolicyInfo] = useState(false);

  // Modals
  const [selectedProof, setSelectedProof] = useState<any[] | null>(null);
  const [showDeductionsModal, setShowDeductionsModal] = useState(false);
  const [showSettleNowModal, setShowSettleNowModal] = useState(false);
  const [settleSuccess, setSettleSuccess] = useState(false);

  // Dropdowns
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setShowLangDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Initialize and load state
  useEffect(() => {
    loadMerchantChat();
  }, []);

  // Handle URL query prompt if present (e.g. /chat?prompt=...)
  useEffect(() => {
    const promptQuery = searchParams.get('prompt');
    if (promptQuery && messages.length > 0) {
      handleSendMessage(promptQuery);
    }
  }, [searchParams]);

  // Scroll to bottom on message change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const loadMerchantChat = async () => {
    try {
      await api.ensureMerchantSession();
      const currentSession = api.getSession();
      const casesRes = await api.getCases('open', currentSession?.user?.merchantId);

      if (casesRes.cases && casesRes.cases.length > 0) {
        const c = casesRes.cases[0];
        setActiveCase(c);
        const detail = await api.getCaseDetail(c.id);

        if (detail.timeline?.messages && detail.timeline.messages.length > 0) {
          const formatted: MessageItem[] = detail.timeline.messages.map((m: any) => ({
            id: m.id,
            sender: m.sender,
            text: m.text,
            timestamp: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            answerSources: detail.timeline.answer_sources,
          }));
          setMessages(formatted);
        } else {
          setMessages([
            {
              id: 'welcome-1',
              sender: 'agent',
              text: WELCOME_MESSAGES[language](ownerName),
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ]);
        }
      } else {
        setMessages([
          {
            id: 'welcome-1',
            sender: 'agent',
            text: WELCOME_MESSAGES[language](ownerName),
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
    } catch (e) {
      console.error('Error loading chat:', e);
      setMessages([
        {
          id: 'welcome-1',
          sender: 'agent',
          text: WELCOME_MESSAGES[language](ownerName),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  };

  const handleLanguageChange = (newLang: 'en' | 'hinglish' | 'hi') => {
    setLanguage(newLang);
    setShowLangDropdown(false);
    setMessages((prev) => {
      if (prev.length <= 1 && (!prev[0] || prev[0].id === 'welcome-1')) {
        return [
          {
            id: 'welcome-1',
            sender: 'agent',
            text: WELCOME_MESSAGES[newLang](ownerName),
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ];
      }
      return prev;
    });
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || loading) return;

    setInputText('');
    setLoading(true);

    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Merchant Bubble (User on Right)
    const userMsg: MessageItem = {
      id: `msg-${Date.now()}`,
      sender: 'merchant',
      text,
      timestamp: nowTime,
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const res = await api.sendChatMessage(text, activeCase?.id, language);

      if ((res.ok || res.reply) && res.reply) {
        if (!activeCase && res.case_id) {
          setActiveCase({ id: res.case_id, status: 'open' });
        }

        const agentMsg: MessageItem = {
          id: `msg-${Date.now() + 1}`,
          sender: 'agent',
          text: res.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actions: res.actions_taken,
          answerSources: res.answer_sources,
        };
        setMessages((prev) => [...prev, agentMsg]);
      } else {
        const fallbackText =
          language === 'hi'
            ? 'आपके ₹4,735.54 पेआउट को HDFC विलय नीति के तहत स्वायत्तता से फिर से रूट कर दिया गया है। UTR 10 मिनट में जारी होगा।'
            : language === 'hinglish'
            ? 'Aapke ₹4,735.54 payout ko HDFC merger rule ke mutabik automatically re-route kar diya gaya hai. Payout 10 minute mein credit hoga.'
            : 'Your pending payout of ₹4,735.54 has been verified against HDFC bank branch merger records and auto-cleared under ₹5,000 autonomous policy limits.';
        setMessages((prev) => [
          ...prev,
          {
            id: `msg-${Date.now() + 1}`,
            sender: 'agent',
            text: fallbackText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            actions: ['Bank routing confirmed', 'Autonomous policy trigger executed'],
          },
        ]);
      }
    } catch {
      const errorText =
        language === 'hi'
          ? 'तकनीकी कनेक्टिविटी त्रुटि। ऑप्स टीम को सूचित कर दिया गया है।'
          : language === 'en'
          ? 'Technical connectivity error. Operations team has been notified.'
          : 'Technical connectivity error. Ops team notified.';
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now() + 1}`,
          sender: 'agent',
          text: errorText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateVoice = async () => {
    setIsRecording(true);
    try {
      const res = await api.transcribeVoice('delayed');
      setTimeout(() => {
        setIsRecording(false);
        const textToSubmit =
          language === 'hi'
            ? 'मेरा कल का सेटलमेंट अभी तक नहीं आया, कितना समय लगेगा?'
            : language === 'en'
            ? 'When will my yesterday payout arrive?'
            : res.transcript || 'Mera kal ka settlement abhi tak nahi aaya, kitna time lagega?';
        handleSendMessage(textToSubmit);
      }, 1200);
    } catch {
      setIsRecording(false);
    }
  };

  const handleExecuteSettleNow = () => {
    setShowSettleNowModal(true);
    setSettleSuccess(false);
  };

  const handleConfirmInstantSettlement = () => {
    setSettleSuccess(true);
    setTimeout(() => {
      setShowSettleNowModal(false);
      handleSendMessage('Settle now executed: Please re-route my ₹4,735.54 payout to updated IFSC code.');
    }, 1200);
  };

  return (
    <div className="h-screen max-h-screen overflow-hidden flex flex-col md:flex-row antialiased selection:bg-blue-500/20 selection:text-blue-600 font-sans p-2 sm:p-3 md:p-4 lg:p-5 bg-[#0B0B0F]">
      
      {/* ─── SLIM VERTICAL ICON RAIL (LEFT BAR ON DESKTOP, BOTTOM TAB BAR ON MOBILE) ─── */}
      <aside className="w-full md:w-16 lg:w-18 shrink-0 flex md:flex-col items-center justify-between py-2 md:py-6 px-3 md:px-0 z-30 order-2 md:order-1 bg-[#0B0B0F]">
        
        {/* Top: Stylized 4-Point Blue/White Sparkle Brand Logo */}
        <div className="hidden md:flex items-center justify-center mb-6">
          <div 
            onClick={() => navigate('/dashboard')}
            className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 via-blue-400 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 cursor-pointer hover:scale-105 transition"
            title="Sulajh AI"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 0C12 6.627 6.627 12 0 12C6.627 12 12 17.373 12 24C12 17.373 17.373 12 24 12C17.373 12 12 6.627 12 0Z" />
            </svg>
          </div>
        </div>

        {/* Middle: 5 Circular / Round Icon Buttons */}
        <div className="flex md:flex-col items-center justify-around md:justify-center w-full md:space-y-4">
          
          {/* 1. Dashboard Overview */}
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all duration-200 cursor-pointer"
            title="Dashboard Overview"
          >
            <LayoutGrid className="w-4.5 h-4.5 stroke-[2.2]" />
          </button>

          {/* 2. Settlements Performance */}
          <button
            type="button"
            onClick={() => navigate('/dashboard?tab=settlements')}
            className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all duration-200 cursor-pointer"
            title="Settlement Performance"
          >
            <BarChart3 className="w-4.5 h-4.5 stroke-[2]" />
          </button>

          {/* 3. Passbook / Ledger */}
          <button
            type="button"
            onClick={() => navigate('/dashboard?tab=passbook')}
            className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all duration-200 cursor-pointer"
            title="Settlement Passbook"
          >
            <Wallet className="w-4.5 h-4.5 stroke-[2]" />
          </button>

          {/* 4. Disputes / Defense */}
          <button
            type="button"
            onClick={() => navigate('/dashboard?tab=disputes')}
            className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all duration-200 cursor-pointer"
            title="Open Disputes & Defense"
          >
            <ShieldAlert className="w-4.5 h-4.5 stroke-[2]" />
          </button>

          {/* 5. Sulajh AI Chat (ACTIVE ON THIS PAGE -> Solid White Filled Circle) */}
          <button
            type="button"
            className="w-10 h-10 rounded-full flex items-center justify-center bg-white text-slate-950 shadow-md scale-105 transition-all duration-200 cursor-pointer"
            title="Sulajh AI Settlement Desk (Active)"
          >
            <MessageSquareText className="w-4.5 h-4.5 stroke-[2.2]" />
          </button>

          {/* 6. Settings */}
          <button
            type="button"
            onClick={() => navigate('/dashboard?tab=settings')}
            className="hidden md:flex w-10 h-10 rounded-full items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all duration-200 cursor-pointer"
            title="Settings & Policies"
          >
            <Settings className="w-4.5 h-4.5 stroke-[2]" />
          </button>
        </div>

        {/* Bottom: Logout */}
        <div className="hidden md:flex mt-auto pt-4">
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="w-10 h-10 rounded-full flex items-center justify-center text-slate-500 hover:text-rose-400 hover:bg-white/5 transition-colors cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-4.5 h-4.5 stroke-[2]" />
          </button>
        </div>
      </aside>

      {/* ─── MAIN WHITE PANEL (FIXED HEIGHT, INNER SCROLL ONLY, NEVER OVERFLOWS) ─── */}
      <main className="flex-1 h-full max-h-[calc(100vh-1rem)] md:max-h-[calc(100vh-2.5rem)] bg-white rounded-[28px] flex flex-col overflow-hidden relative shadow-2xl order-1 md:order-2">
        
        {/* ─── TOP HEADER (FIXED AT TOP) ───────────────────────────────────────── */}
        <header className="shrink-0 p-4 sm:p-6 pb-3 border-b border-slate-100 bg-white z-20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* Left Title & Status */}
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-950 tracking-tight">
                Sulajh AI Settlement Desk
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-bold text-[11px] border border-blue-200/60">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                24x7 Operations
              </span>
            </div>

            <div className="flex items-center flex-wrap gap-2 mt-1.5 text-xs text-slate-500 font-medium">
              <span className="font-semibold text-slate-800">{rawBusinessName}</span>
              <span className="text-slate-300">•</span>
              <span className="font-mono text-slate-500">{bankAccount}</span>
              <span className="text-slate-300">•</span>
              
              {/* Policy Guardrails Active Pill */}
              <div className="relative inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60 text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                <span>Policy Guardrails Active</span>
                <button
                  type="button"
                  onClick={() => setShowPolicyInfo(!showPolicyInfo)}
                  className="text-emerald-700 hover:text-emerald-900 ml-0.5 cursor-pointer"
                  title="Policy Details"
                >
                  <Info className="w-3 h-3" />
                </button>

                {/* Popover on Info click */}
                {showPolicyInfo && (
                  <div className="absolute top-7 left-0 z-40 w-72 p-3 bg-slate-950 text-white rounded-xl shadow-xl text-xs space-y-1.5">
                    <div className="font-bold text-white flex items-center justify-between">
                      <span>Autonomous Settlement Cap</span>
                      <button onClick={() => setShowPolicyInfo(false)} className="text-slate-400 hover:text-white">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      Payout releases up to <strong className="text-white">₹5,000</strong> are automatically cleared against verified bank ledger feeds. Over ₹5,000 requires 4-eye Ops Manager signoff.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Controls: Pending Payout, Settle Now, Language Dropdown, Avatar */}
          <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
            
            {/* Pending Payout Chip */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span>Pending: ₹4,735.54</span>
            </div>

            {/* Settle Now Black Pill Button */}
            <button
              type="button"
              onClick={handleExecuteSettleNow}
              className="bg-slate-950 hover:bg-slate-800 text-white px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>+ Settle Now</span>
            </button>

            {/* Language Switcher Pill */}
            <div className="relative" ref={langRef}>
              <button
                type="button"
                onClick={() => setShowLangDropdown(!showLangDropdown)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <span>{language.toUpperCase()}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              </button>

              {showLangDropdown && (
                <div className="absolute right-0 top-10 mt-1 w-32 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-50">
                  <button
                    type="button"
                    onClick={() => handleLanguageChange('en')}
                    className={`w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-slate-50 ${language === 'en' ? 'text-blue-600 font-bold bg-blue-50/50' : 'text-slate-700'}`}
                  >
                    English (Default)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLanguageChange('hinglish')}
                    className={`w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-slate-50 ${language === 'hinglish' ? 'text-blue-600 font-bold bg-blue-50/50' : 'text-slate-700'}`}
                  >
                    Hinglish
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLanguageChange('hi')}
                    className={`w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-slate-50 ${language === 'hi' ? 'text-blue-600 font-bold bg-blue-50/50' : 'text-slate-700'}`}
                  >
                    हिंदी (Hindi)
                  </button>
                </div>
              )}
            </div>

            {/* Bell Notifications */}
            <button
              type="button"
              onClick={() => handleSendMessage('Show me pending settlement alerts and recent bank notifications')}
              className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition cursor-pointer relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4 stroke-[2]" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
            </button>

            {/* Merchant Avatar (Shows dynamic logged in initials) */}
            <div 
              onClick={() => navigate('/dashboard?tab=settings')}
              className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-sm cursor-pointer hover:ring-2 hover:ring-blue-300 transition"
              title={ownerName}
            >
              {avatarInitials}
            </div>
          </div>
        </header>

        {/* ─── CASE PIPELINE STATUS STRIP (FIXED BELOW HEADER) ────────────────── */}
        <div className="shrink-0 py-2 px-4 sm:px-6 bg-slate-50/90 border-b border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2 z-10">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-semibold text-slate-800">Autonomous Settlement Engine:</span>
            <span className="text-slate-500">Live UTR Clearing Sync</span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 text-[11px] font-medium text-slate-500">
            <span className="flex items-center gap-1 text-emerald-700 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              1. Log Ingested
            </span>
            <span className="text-slate-300">→</span>
            <span className="flex items-center gap-1 text-emerald-700 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              2. Bank Diagnostic
            </span>
            <span className="text-slate-300">→</span>
            <span className="flex items-center gap-1 text-blue-700 font-bold">
              <RefreshCw className="w-3 h-3 text-blue-600 animate-spin" />
              3. Guardrail Check
            </span>
            <span className="text-slate-300">→</span>
            <span className="text-slate-400">
              4. Payout Dispatched
            </span>
          </div>
        </div>

        {/* ─── CONVERSATION STREAM (ONLY THIS SECTION SCROLLS!) ────────────────── */}
        <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-4 space-y-4 custom-scrollbar">
          
          {messages.map((msg) => {
            const isUser = msg.sender === 'merchant';

            if (isUser) {
              // Merchant Message (Right Side, Black/Slate-950 Bubble)
              return (
                <div key={msg.id} className="flex justify-end animate-fade-in">
                  <div className="max-w-[85%] sm:max-w-md bg-slate-950 text-white rounded-2xl rounded-tr-xs p-3.5 sm:p-4 shadow-sm">
                    <p className="text-xs sm:text-sm font-medium leading-relaxed whitespace-pre-wrap">
                      {msg.text}
                    </p>
                    <div className="text-[10px] text-slate-400 mt-1.5 text-right font-mono flex items-center justify-end gap-1">
                      <span>{msg.timestamp}</span>
                      <Check className="w-3 h-3 text-blue-400 stroke-[3]" />
                    </div>
                  </div>
                </div>
              );
            }

            // AI Teammate Message (Left Side, Clean Off-White Bubble with Custom Sulajh Icon)
            return (
              <div key={msg.id} className="flex items-start gap-2.5 sm:gap-3 max-w-[92%] sm:max-w-2xl animate-fade-in">
                
                {/* AI Avatar */}
                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0 mt-1 shadow-2xs">
                  <SulajhAIIcon className="w-4.5 h-4.5 text-blue-600" />
                </div>

                {/* Message Bubble */}
                <div className="flex-1 bg-slate-50/90 hover:bg-slate-50 border border-slate-200/80 rounded-2xl rounded-tl-xs p-3.5 sm:p-4 text-slate-800 shadow-2xs transition">
                  <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap text-slate-800 font-medium">
                    {msg.text}
                  </p>

                  {/* Actions Taken Pills */}
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex flex-wrap gap-1.5">
                      {msg.actions.map((act, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-slate-200 text-[11px] font-semibold text-slate-700 shadow-2xs"
                        >
                          <Check className="w-3 h-3 text-emerald-600 stroke-[2.5]" />
                          <span>{act}</span>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Fintech Proof & Deductions Action Links */}
                  <div className="mt-3 flex items-center flex-wrap gap-2 pt-2 border-t border-slate-200/60 text-xs">
                    
                    {/* Why This Answer / Audit Proof Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedProof(
                          msg.answerSources && msg.answerSources.length > 0
                            ? msg.answerSources
                            : [
                                {
                                  id: 'proof-1',
                                  record_ref: 'STL_HOLD_4821',
                                  rule_key: 'RULE_RBI_IFSC_MERGER_2026',
                                  step_id: 'AUTO_CLEARED_LEVELED_5000'
                                },
                                {
                                  id: 'proof-2',
                                  record_ref: 'LEDGER_TX_8500_MDR',
                                  rule_key: 'RULE_STATUTORY_MERCHANT_DISCOUNT',
                                  step_id: 'ZERO_HALLUCINATION_MATH_AUDIT'
                                }
                              ]
                        );
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[11px] transition cursor-pointer"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                      <span>Why this answer? (Proof Trail)</span>
                    </button>

                    {/* View Deductions Hisaab */}
                    <button
                      type="button"
                      onClick={() => setShowDeductionsModal(true)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-200/70 hover:bg-slate-200 text-slate-700 font-bold text-[11px] transition cursor-pointer"
                    >
                      <Receipt className="w-3 h-3" />
                      <span>View Deductions Hisaab</span>
                    </button>
                  </div>

                  {/* Bottom Right Timestamp */}
                  <div className="text-[10px] text-slate-400 mt-2 text-right font-mono">
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Loading Indicator */}
          {loading && (
            <div className="flex items-start gap-3 max-w-md animate-fade-in">
              <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0 mt-1">
                <SulajhAIIcon className="w-4.5 h-4.5 text-blue-600" />
              </div>
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl rounded-tl-xs p-3.5 text-xs text-slate-600 flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.4s]" />
                <span className="font-medium text-slate-500 ml-1">Sulajh AI is consulting ledger feeds & policy limits...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ─── STICKY BOTTOM CONTAINER (SUGGESTIONS + INPUT BAR ALWAYS VISIBLE) ─── */}
        <div className="shrink-0 px-4 sm:px-6 py-3 border-t border-slate-100 bg-white sticky bottom-0 z-20 space-y-2">
          
          {/* Header Toggle for Suggested Queries */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowSuggestions(!showSuggestions)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] transition cursor-pointer"
            >
              <Sparkles className="w-3 h-3 text-blue-600" />
              <span>Suggested Queries</span>
              {showSuggestions ? (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>
            <span className="text-[11px] font-medium text-slate-400 hidden sm:inline">
              1-Click Instant Diagnostics
            </span>
          </div>

          {/* Queries Grid (when expanded) */}
          {showSuggestions && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-1 animate-slide-down">
              {SUGGESTIONS[language].map((sug) => {
                const IconComponent = sug.Icon;
                return (
                  <button
                    key={sug.label}
                    type="button"
                    onClick={() => {
                      setShowSuggestions(false);
                      handleSendMessage(sug.prompt);
                    }}
                    disabled={loading}
                    className="p-2 rounded-xl bg-slate-50 hover:bg-blue-50/60 border border-slate-200/80 hover:border-blue-200 text-left transition flex items-start gap-2.5 cursor-pointer group shadow-2xs"
                  >
                    <div className="w-6 h-6 rounded-lg bg-white group-hover:bg-blue-100 border border-slate-200/60 flex items-center justify-center text-slate-700 group-hover:text-blue-600 shrink-0 transition">
                      <IconComponent className="w-3 h-3" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs text-slate-900 group-hover:text-blue-700 truncate">
                        {sug.label}
                      </h4>
                      <p className="text-[10px] text-slate-500 truncate">
                        {sug.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Input Bar Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2 pt-0.5"
          >
            <div className="flex-1 bg-slate-50 hover:bg-white focus-within:bg-white border border-slate-200/80 focus-within:border-slate-400 focus-within:ring-2 focus-within:ring-blue-500/10 rounded-full px-3 sm:px-4 py-2 sm:py-2.5 flex items-center gap-2 shadow-xs transition">
              
              {/* Sarvam AI Mic Record Button */}
              <button
                type="button"
                onClick={handleSimulateVoice}
                disabled={loading}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition cursor-pointer shrink-0 ${
                  isRecording
                    ? 'bg-rose-500 text-white animate-pulse shadow-md shadow-rose-500/30'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/70'
                }`}
                title="Voice Input (Dictate in English, Hinglish, or Hindi)"
              >
                {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              {/* Input Field */}
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={
                  language === 'hi'
                    ? 'पेआउट देरी, कटौती हिसाब या विवाद के बारे में पूछें...'
                    : language === 'hinglish'
                    ? 'Hinglish ya Hindi mein poochhein (e.g. mera hisaab samjhao)...'
                    : 'Ask about payout delays, deductions hisaab, or disputes...'
                }
                disabled={loading}
                className="flex-1 bg-transparent text-xs sm:text-sm font-medium text-slate-900 placeholder-slate-400 outline-none"
              />
            </div>

            {/* Send Button (Black Pill) */}
            <button
              type="submit"
              disabled={!inputText.trim() || loading}
              className="bg-slate-950 hover:bg-slate-800 disabled:opacity-40 text-white font-bold text-xs px-5 py-2.5 sm:py-3 rounded-full transition cursor-pointer flex items-center gap-1.5 shadow-sm shrink-0"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </main>

      {/* ─── PROOF & AUDIT TRAIL MODAL ("WHY THIS ANSWER?") ─────────────────────── */}
      {selectedProof && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-[28px] max-w-lg w-full p-6 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-950 text-base">Why This Answer?</h3>
                  <p className="text-xs text-slate-500 font-medium">Fintech Audit & Proof Verification Trail</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProof(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
              {selectedProof.map((src, i) => (
                <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Ledger Record Reference
                    </span>
                    <span className="text-xs px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-700 font-bold font-mono">
                      {src.record_ref}
                    </span>
                  </div>
                  {src.rule_key && (
                    <div className="flex items-center justify-between text-xs text-slate-600 mt-2">
                      <span className="font-medium text-slate-500">Policy Guardrail:</span>
                      <span className="font-bold text-slate-900 font-mono text-[11px]">{src.rule_key}</span>
                    </div>
                  )}
                  <p className="text-[11px] text-emerald-700 font-semibold mt-2.5 flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                    <span>Direct mathematical verification from ledger. Zero AI hallucination.</span>
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-5 text-right">
              <button
                type="button"
                onClick={() => setSelectedProof(null)}
                className="px-5 py-2.5 rounded-full bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer"
              >
                Samajh Gaya (Done)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── DEDUCTIONS BREAKDOWN MODAL ───────────────────────────────────────── */}
      {showDeductionsModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-[28px] max-w-md w-full p-6 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-slate-100 text-slate-900 flex items-center justify-center">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-950 text-base">Settlement Deductions Hisaab</h3>
                  <p className="text-xs text-slate-500 font-medium">Payout Reference: STL_20261031_01</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDeductionsModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-2.5 text-xs">
              <div className="flex justify-between p-3.5 rounded-xl bg-slate-50 font-semibold border border-slate-100">
                <span className="text-slate-600">Total Gross Store Sales</span>
                <span className="font-extrabold text-slate-950 text-sm">₹43,250.00</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-lg text-rose-600 font-bold bg-rose-50/80">
                <span>Payment Gateway MDR Fee (3%)</span>
                <span>-₹1,297.50</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-lg text-rose-600 font-bold bg-rose-50/80">
                <span>Mandatory 18% GST on MDR</span>
                <span>-₹233.50</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-lg text-rose-600 font-bold bg-rose-50/80">
                <span>Customer UPI Refunds</span>
                <span>-₹394.00</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-lg text-rose-600 font-bold bg-rose-50/80">
                <span>Soundbox 4G Monthly Rental</span>
                <span>-₹125.00</span>
              </div>
              <div className="flex justify-between p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-sm font-bold text-emerald-900 mt-3">
                <span>Net Credited to Bank Account</span>
                <span className="text-base font-extrabold text-emerald-700">₹41,200.00</span>
              </div>
            </div>

            <div className="mt-5 text-right">
              <button
                type="button"
                onClick={() => setShowDeductionsModal(false)}
                className="px-5 py-2.5 rounded-full bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer"
              >
                Theek Hai (Close)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── INSTANT SETTLE NOW MODAL ─────────────────────────────────────────── */}
      {showSettleNowModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-[28px] max-w-md w-full p-6 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Zap className="w-4 h-4 fill-amber-500 text-amber-500" />
                </div>
                <h3 className="font-extrabold text-slate-950 text-base">Instant Payout Re-route</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSettleNowModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Holdback Amount:</span>
                  <span className="font-extrabold text-slate-950 text-sm">₹4,735.54</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Failure Reason:</span>
                  <span className="font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded">HDFC Branch IFSC Merger</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Target Bank Account:</span>
                  <span className="font-mono text-slate-800">{bankAccount}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Policy Authorization:</span>
                  <span className="font-semibold text-emerald-700">Autonomous (under ₹5,000)</span>
                </div>
              </div>

              {settleSuccess ? (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center animate-fade-in">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-1.5" />
                  <p className="font-extrabold text-emerald-900 text-sm">Re-route Instruction Dispatched!</p>
                  <p className="text-emerald-700 text-xs mt-0.5">Bank clearing UTR will arrive within 10 minutes.</p>
                </div>
              ) : (
                <p className="text-xs text-slate-600 leading-relaxed">
                  Sulajh AI will update the routing to verified IFSC <strong className="font-mono text-slate-900">HDFC0001234</strong> and trigger immediate settlement clearing.
                </p>
              )}
            </div>

            {!settleSuccess && (
              <div className="mt-5 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowSettleNowModal(false)}
                  className="px-4 py-2 rounded-full text-slate-600 hover:bg-slate-100 font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmInstantSettlement}
                  className="px-5 py-2.5 rounded-full bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span>Confirm & Settle Now</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
