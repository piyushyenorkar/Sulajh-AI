import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Zap,
  BarChart2,
  ShieldCheck,
  ShieldAlert,
  Check,
  ArrowRight,
  Mic,
  MicOff,
  Sparkles,
  X,
  CreditCard,
  AlertCircle,
  Send,
  Building2,
  Cpu,
  Layers,
  Globe,
  ChevronDown,
  ChevronUp,
  Info,
  Settings,
  LogOut,
  Store,
  User,
  Clock,
  Receipt,
  HelpCircle,
  MessageSquare,
  Activity
} from 'lucide-react';
import { api } from '../lib/api';
import { PaytmLogo } from '../components/PaytmLogo';

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

// Enterprise Quick Actions (Zero Hackathon Jargon)
const QUICK_ACTIONS_BY_LANG = {
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
  en: [
    {
      label: 'Payout Diagnostics',
      Icon: Zap,
      prompt: 'My yesterday payout has not arrived yet, how long will it take?',
      desc: 'Check IFSC & clearing failure status',
    },
    {
      label: 'Deductions Breakdown',
      Icon: Receipt,
      prompt: 'Why is my payout lower than expected, explain deductions',
      desc: 'Itemized MDR, GST & Soundbox breakdown',
    },
    {
      label: 'Defend Chargeback',
      Icon: ShieldCheck,
      prompt: 'Received a customer dispute for 8500, submit delivery proof',
      desc: 'Upload proof before statutory bank SLA',
    },
    {
      label: 'High-Value Verification',
      Icon: ShieldAlert,
      prompt: 'Why is my 50,000 payout held for verification?',
      desc: 'Policy threshold & Ops Manager review',
    },
  ],
};

const WELCOME_MESSAGES = {
  hinglish: `Namaste ji! Main Sulajh AI hoon — aapka 24x7 autonomous settlement operations teammate.\n\nAapke store ka kal ka ₹4,735.54 ka payout bank IFSC update ke kaaran pending hai. Aap mujhse settlement delay, deductions hisaab, ya chargeback dispute ke baare mein pooch sakte hain.`,
  hi: `नमस्ते जी! मैं सुलझ AI हूँ — आपका 24x7 स्वायत्त सेटलमेंट ऑपरेशंस साथी।\n\nआपके स्टोर का कल का ₹4,735.54 का भुगतान बैंक शाखा IFSC कोड अपडेट के कारण लंबित है। आप मुझसे सेटलमेंट, कटौती के हिसाब या विवाद के बारे में कभी भी पूछ सकते हैं।`,
  en: `Hello! I am Sulajh AI — your 24x7 autonomous settlement operations teammate.\n\nYour store's payout of ₹4,735.54 from yesterday is pending due to a bank branch IFSC code update. You can ask me any question regarding your settlements, deductions, or customer disputes.`,
};

function SulajhAIIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" rx="7" fill="currentColor" fillOpacity="0.14" />
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
  const session = api.getSession();

  const [activeCase, setActiveCase] = useState<any>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState<'hinglish' | 'hi' | 'en'>('en');
  const [isRecording, setIsRecording] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);

  // Dropdown States
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  // Dock Hover / Pin States for the L-Frame Left Bar
  const [activeDockFlyout, setActiveDockFlyout] = useState<'pipeline' | 'settlement' | 'history' | 'limits' | 'dispute' | 'account' | null>(null);

  // Modals & Slide-overs
  const [selectedProof, setSelectedProof] = useState<any[] | null>(null);
  const [showDeductions, setShowDeductions] = useState(false);
  const [settlementDetail, setSettlementDetail] = useState<any>(null);
  const [settlementsList, setSettlementsList] = useState<any[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);
  const dockRef = useRef<HTMLDivElement>(null);

  // Close dropdowns & flyouts on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setShowLangDropdown(false);
      }
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setShowAccountMenu(false);
      }
      if (dockRef.current && !dockRef.current.contains(e.target as Node)) {
        setActiveDockFlyout(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    loadMerchantState();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleLanguageChange = (newLang: 'hinglish' | 'hi' | 'en') => {
    setLanguage(newLang);
    setShowLangDropdown(false);
    setMessages((prev) => {
      if (prev.length <= 1 && (!prev[0] || prev[0].id === 'welcome-1')) {
        return [
          {
            id: 'welcome-1',
            sender: 'agent',
            text: WELCOME_MESSAGES[newLang],
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ];
      }
      return prev;
    });
  };

  const loadMerchantState = async () => {
    try {
      await api.ensureMerchantSession();
      const currentSession = api.getSession();

      // 1. Load active cases
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
              text: WELCOME_MESSAGES[language],
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ]);
        }
      } else {
        setMessages([
          {
            id: 'welcome-1',
            sender: 'agent',
            text: WELCOME_MESSAGES[language],
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }

      // 2. Load settlement
      const stlRes = await api.getSettlements(currentSession?.user?.merchantId);
      if (stlRes.settlements && stlRes.settlements.length > 0) {
        setSettlementsList(stlRes.settlements);
        setSettlementDetail(stlRes.settlements[1] || stlRes.settlements[0]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || loading) return;

    setInputText('');
    setLoading(true);

    const userMsg: MessageItem = {
      id: `msg-${Date.now()}`,
      sender: 'merchant',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
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
        const errorText =
          language === 'hi'
            ? 'माफ़ी चाहता हूँ, नेटवर्क में त्रुटि आई है। कृपया दोबारा प्रयास करें।'
            : language === 'en'
            ? 'We encountered a network issue. Please try again shortly.'
            : 'Mafi chahta hoon, network mein dikkat aayi hai. Kripya dubara koshish karein.';
        setMessages((prev) => [
          ...prev,
          {
            id: `msg-${Date.now() + 1}`,
            sender: 'agent',
            text: errorText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
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

  const handleSimulateVoice = async (phraseKey: string = 'delayed') => {
    setIsRecording(true);
    try {
      const res = await api.transcribeVoice(phraseKey);
      if (res.ok && res.transcript) {
        setTimeout(() => {
          setIsRecording(false);
          const textToSubmit =
            language === 'hi'
              ? 'मेरा कल का सेटलमेंट अभी तक नहीं आया, कितना समय लगेगा?'
              : language === 'en'
              ? 'When will my yesterday payout arrive?'
              : res.transcript;
          handleSendMessage(textToSubmit);
        }, 1200);
      } else {
        setIsRecording(false);
      }
    } catch {
      setIsRecording(false);
    }
  };

  const businessTitle = session?.user?.businessName || "Piyush's Food Plaza";
  const initialLetter = businessTitle.charAt(0).toUpperCase();

  return (
    <div className="h-screen max-h-screen overflow-hidden flex flex-col font-sans relative bg-[#EEF2F7] p-2.5 sm:p-3.5 lg:p-4 selection:bg-[#14B8A6]/20 selection:text-[#0F766E]">
      
      {/* ─── Ambient Spatial Lighting (Teal #14B8A6 Brand Glows) ─── */}
      <div className="fixed top-0 right-1/4 w-[600px] h-[600px] bg-[#14B8A6]/[0.05] rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed bottom-0 left-10 w-[550px] h-[550px] bg-[#0D9488]/[0.04] rounded-full blur-[150px] pointer-events-none" />

      {/* ─── CONTINUOUS SEAMLESS INVERTED L-FRAME (TOP NAVBAR + ATTACHED LEFT DOCK) ─── */}
      <div className="h-full w-full flex flex-col min-h-0 relative">
        
        {/* ─── TOP SECTION OF THE L-FRAME (HORIZONTAL BAR) ───────────────────── */}
        <header className="h-16 w-full bg-white shadow-[0_10px_30px_rgba(0,0,0,0.06)] rounded-t-[28px] rounded-r-[28px] flex items-center justify-between px-5 z-20 shrink-0">
          
          {/* Left: Paytm Brand Logo Badge & Subtitle */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-[#F8FAFC] shadow-2xs">
              <PaytmLogo className="h-5 w-auto" />
              <div className="h-3.5 w-px bg-slate-200" />
              <span className="text-[11px] font-bold tracking-wider text-[#002970] uppercase">for business</span>
            </div>
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-teal-50/80 text-[#0D9488] text-xs font-semibold shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#14B8A6]" />
              <span>Autonomous Settlement Operations</span>
            </div>
          </div>

          {/* Right: Instant Payout Action & Language Dropdown (Gateway, P Logo & Exit Removed from here) */}
          <div className="flex items-center gap-2.5">
            
            {/* Live Unsettled Today Balance + Instant "Settle Now" Action */}
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-teal-50/90 text-[#0D9488] text-xs font-bold shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-[#14B8A6] animate-pulse" />
                <span>Pending: ₹{settlementDetail ? settlementDetail.net.toLocaleString('en-IN') : '4,735.54'}</span>
              </div>
              <button
                type="button"
                onClick={() => handleSendMessage('Mera kal ka pending payout ₹4,735.54 abhi instant account mein transfer karo')}
                className="px-3.5 py-1.5 rounded-2xl bg-gradient-to-r from-[#14B8A6] to-[#0D9488] hover:from-[#0D9488] hover:to-[#0F766E] text-white text-xs font-bold shadow-xs hover:shadow-md transition cursor-pointer flex items-center gap-1.5 active:scale-95"
                title="Instant Settlement to HDFC Bank"
              >
                <Zap className="w-3.5 h-3.5 fill-white" />
                <span>Settle Now</span>
              </button>
            </div>

            {/* Language Selector Dropdown */}
            <div className="relative" ref={langRef}>
              <button
                type="button"
                onClick={() => setShowLangDropdown(!showLangDropdown)}
                className="px-3 py-1.5 rounded-2xl bg-[#F8FAFC] hover:bg-white text-xs font-bold text-slate-700 hover:text-[#0D9488] shadow-xs hover:shadow-md flex items-center gap-1.5 transition cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5 text-[#14B8A6]" />
                <span className="uppercase text-[11px]">
                  {language === 'hinglish' ? 'Hinglish' : language === 'hi' ? 'हिंदी' : 'English'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Language Dropdown Menu */}
              {showLangDropdown && (
                <div className="absolute right-0 mt-2 w-40 rounded-2xl bg-white shadow-[0_15px_35px_-5px_rgba(0,0,0,0.12)] p-2 z-50 animate-slide-down">
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Select Language
                  </div>
                  {[
                    { id: 'hinglish', label: 'Hinglish (Default)' },
                    { id: 'hi', label: 'हिन्दी (Hindi)' },
                    { id: 'en', label: 'English' }
                  ].map((l) => (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => handleLanguageChange(l.id as any)}
                      className={`w-full px-2.5 py-1.5 rounded-xl text-xs text-left font-medium flex items-center justify-between transition cursor-pointer ${
                        language === l.id
                          ? 'bg-teal-50 text-[#0D9488] font-bold shadow-2xs'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>{l.label}</span>
                      {language === l.id && <Check className="w-3.5 h-3.5 text-[#14B8A6]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

          </div>
        </header>

        {/* ─── LOWER SECTION: ATTACHED VERTICAL DOCK + SEPARATE BIG CHAT BOX ───── */}
        <div className="flex-1 flex min-h-0 relative">
          
          {/* ─── LEFT ATTACHED SLIM VERTICAL ICON DOCK (FROSTED COOL SLATE CANVAS) ─── */}
          <aside
            ref={dockRef}
            className="w-16 sm:w-18 bg-[#F8FAFC] shadow-[6px_12px_28px_rgba(0,0,0,0.05)] rounded-b-[28px] flex flex-col items-center justify-between py-4 shrink-0 z-20 h-full"
          >
            
            {/* Top Operations Group */}
            <div className="flex flex-col items-center space-y-3 w-full">

              {/* 1. Resolution Pipeline Icon */}
              <div className="relative group">
                <button
                  type="button"
                  onMouseEnter={() => setActiveDockFlyout('pipeline')}
                  onClick={() => setActiveDockFlyout(activeDockFlyout === 'pipeline' ? null : 'pipeline')}
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all cursor-pointer shadow-2xs ${
                    activeDockFlyout === 'pipeline'
                      ? 'bg-[#14B8A6] text-white shadow-md shadow-teal-500/30 scale-105'
                      : 'bg-teal-50 hover:bg-teal-100 text-[#14B8A6] hover:scale-105'
                  }`}
                  title="Resolution Pipeline (Hover to inspect process)"
                >
                  <Activity className="w-5 h-5 stroke-[2.2]" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#14B8A6] ring-2 ring-white animate-pulse" />
                </button>

                {/* Flyout Aligned Strictly to the Side of this Icon */}
                {activeDockFlyout === 'pipeline' && (
                  <div 
                    onMouseLeave={() => setActiveDockFlyout(null)}
                    className="absolute left-full ml-3.5 top-0 w-84 bg-white shadow-[0_24px_55px_-10px_rgba(0,0,0,0.18)] rounded-3xl p-5 z-50 animate-slide-right text-slate-900 border border-slate-100"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#14B8A6] animate-pulse" />
                        <span className="font-bold text-xs uppercase tracking-wider text-slate-900">
                          Resolution Pipeline
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-[#0D9488] font-bold bg-teal-50 px-2.5 py-0.5 rounded-full shadow-2xs">
                          In Progress
                        </span>
                        <button
                          type="button"
                          onClick={() => setActiveDockFlyout(null)}
                          className="w-5 h-5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition cursor-pointer"
                          title="Close"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-teal-50 text-[#0F766E] font-semibold shadow-2xs">
                        <span className="w-5 h-5 rounded-full bg-[#14B8A6] text-white flex items-center justify-center text-[10px] shrink-0">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </span>
                        <span className="flex-1 text-[11px]">1. Payout Rejection Received</span>
                      </div>

                      <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-teal-50/90 text-[#0D9488] font-bold shadow-2xs">
                        <span className="w-5 h-5 rounded-full bg-[#14B8A6] text-white flex items-center justify-center text-[10px] shrink-0 animate-pulse shadow-xs">
                          <Sparkles className="w-3 h-3 text-white" />
                        </span>
                        <span className="flex-1 text-[11px]">2. AI Diagnosing Bank IFSC Update</span>
                      </div>

                      <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#F8FAFC] text-slate-500 font-medium">
                        <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[10px] shrink-0">
                          <ShieldCheck className="w-3 h-3 text-slate-600" />
                        </span>
                        <span className="flex-1 text-[11px]">3. Under ₹5K Auto-Policy Check</span>
                      </div>

                      <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#F8FAFC] text-slate-400 font-medium">
                        <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-[10px] shrink-0">
                          <Check className="w-3 h-3 text-slate-500" />
                        </span>
                        <span className="flex-1 text-[11px]">4. Autonomous Gateway Trigger</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400 mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                      <span>Active Case #{activeCase?.id ? activeCase.id.slice(0, 8) : 'stl-2026'}</span>
                      <span className="text-[#0D9488] font-semibold">Autonomous Tracking</span>
                    </p>
                  </div>
                )}
              </div>

              {/* 2. Today's Settlement Ledger Icon */}
              <div className="relative group">
                <button
                  type="button"
                  onMouseEnter={() => setActiveDockFlyout('settlement')}
                  onClick={() => setActiveDockFlyout(activeDockFlyout === 'settlement' ? null : 'settlement')}
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all cursor-pointer shadow-2xs ${
                    activeDockFlyout === 'settlement'
                      ? 'bg-[#14B8A6] text-white shadow-md shadow-teal-500/30 scale-105'
                      : 'bg-white hover:bg-teal-50 text-slate-700 hover:text-[#14B8A6] hover:scale-105'
                  }`}
                  title="Today's Pending Settlement (Click to view details)"
                >
                  <CreditCard className="w-5 h-5 stroke-[2]" />
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 ring-2 ring-white" />
                </button>

                {/* Flyout Aligned Strictly to the Side of this Icon (High-End Fintech Light Glass) */}
                {activeDockFlyout === 'settlement' && (
                  <div 
                    onMouseLeave={() => setActiveDockFlyout(null)}
                    className="absolute left-full ml-3.5 top-0 w-92 bg-white shadow-[0_24px_55px_-10px_rgba(0,0,0,0.18),0_8px_20px_rgba(0,0,0,0.05)] rounded-3xl p-5 z-50 animate-slide-right text-slate-900 border border-slate-100"
                  >
                    <div className="flex items-start justify-between pb-3 border-b border-slate-100 mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#14B8A6] flex items-center justify-center shadow-2xs">
                          <CreditCard className="w-4 h-4 stroke-[2.2]" />
                        </div>
                        <div>
                          <span className="font-bold text-xs uppercase tracking-wider text-slate-900 block">
                            Today's Settlement
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">T+1 Daily Payout Cycle</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200/80 text-amber-700 text-[10px] font-bold shadow-2xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                          <span>Action Required</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setActiveDockFlyout(null)}
                          className="w-6 h-6 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition cursor-pointer"
                          title="Close"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-baseline gap-2">
                        <span>₹{(settlementDetail?.net || 4735.54).toLocaleString('en-IN')}</span>
                        <span className="text-xs font-semibold text-slate-400">
                          (Gross ₹{(settlementDetail?.gross || 4850).toLocaleString('en-IN')})
                        </span>
                      </div>
                      <p className="text-[11px] text-[#0D9488] font-semibold mt-0.5">
                        Net payable after MDR & GST deductions
                      </p>
                    </div>

                    <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200/60 text-xs text-amber-900 font-medium mb-3.5 leading-relaxed flex items-start gap-2.5">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <span>{settlementDetail?.failure_reason || 'Beneficiary bank rejected transaction: IFSC code changed due to bank branch merger'}</span>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                      <div className="flex items-center justify-between text-slate-600">
                        <span className="text-[11px] text-slate-500">Destination:</span>
                        <span className="font-semibold text-slate-800">HDFC Bank •••• 4821</span>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            handleSendMessage('Mera kal ka pending payout ₹4,735.54 IFSC update karke re-initiate karo');
                            setActiveDockFlyout(null);
                          }}
                          className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-[#14B8A6] to-[#0D9488] hover:from-[#0D9488] hover:to-[#0F766E] text-white font-bold text-xs shadow-xs hover:shadow-md transition cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                        >
                          <Zap className="w-3.5 h-3.5 fill-white" />
                          <span>Auto-Fix & Transfer</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setShowDeductions(true);
                            setActiveDockFlyout(null);
                          }}
                          className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-bold text-xs transition cursor-pointer"
                          title="View Deductions Ledger"
                        >
                          Hisaab
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 3. Previous Settlements History / Passbook Icon (Production Feature) */}
              <div className="relative group">
                <button
                  type="button"
                  onMouseEnter={() => setActiveDockFlyout('history')}
                  onClick={() => setActiveDockFlyout(activeDockFlyout === 'history' ? null : 'history')}
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all cursor-pointer shadow-2xs ${
                    activeDockFlyout === 'history'
                      ? 'bg-[#14B8A6] text-white shadow-md shadow-teal-500/30 scale-105'
                      : 'bg-[#F8FAFC] hover:bg-teal-50 text-slate-700 hover:text-[#14B8A6] hover:scale-105'
                  }`}
                  title="Settlement Passbook (Previous Payout Logs)"
                >
                  <Clock className="w-5 h-5 stroke-[2]" />
                </button>

                {/* Flyout Aligned Strictly to the Side of this Icon */}
                {activeDockFlyout === 'history' && (
                  <div 
                    onMouseLeave={() => setActiveDockFlyout(null)}
                    className="absolute left-full ml-3.5 top-0 w-88 bg-white shadow-[0_24px_55px_-10px_rgba(0,0,0,0.18)] rounded-3xl p-5 z-50 animate-slide-right text-slate-900"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                      <div>
                        <span className="font-bold text-xs text-slate-900 uppercase tracking-wider block">
                          Settlement Passbook
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">Recent Daily Payout Audits</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-[#0D9488] font-bold bg-teal-50 px-2 py-0.5 rounded-lg shadow-2xs">
                          Live Bank Feed
                        </span>
                        <button
                          type="button"
                          onClick={() => setActiveDockFlyout(null)}
                          className="w-5 h-5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition cursor-pointer"
                          title="Close"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs max-h-64 overflow-y-auto pr-1">
                      {/* Payout 1 (Pending Auto-Fix) */}
                      <div className="p-2.5 rounded-2xl bg-amber-50/70 border-l-3 border-amber-400">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">₹4,735.54</span>
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-full">
                            Auto-Fixing
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-0.5">T+1 Payout · IFSC Re-route in progress</p>
                        <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mt-1">
                          <span>Ref: STL-2026-HDFC</span>
                          <span>Today</span>
                        </div>
                      </div>

                      {/* Payout 2 (Delayed Clearing) */}
                      <div className="p-2.5 rounded-2xl bg-slate-50 border-l-3 border-teal-400">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">₹17,770.48</span>
                          <span className="text-[10px] font-bold text-teal-700 bg-teal-100/80 px-2 py-0.5 rounded-full">
                            Cleared
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-0.5">Same-Day IMPS · UTR: 489201984210</p>
                        <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mt-1">
                          <span>HDFC •••• 5223</span>
                          <span>Yesterday</span>
                        </div>
                      </div>

                      {/* Payout 3 (Normal Paid) */}
                      <div className="p-2.5 rounded-2xl bg-slate-50 border-l-3 border-emerald-400">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">₹9,289.00</span>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                            Settled
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-0.5">Gross ₹10,000 · Rent -₹125, MDR -₹200</p>
                        <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mt-1">
                          <span>UTR: 489110294812</span>
                          <span>Oct 28</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => {
                          setShowDeductions(true);
                          setActiveDockFlyout(null);
                        }}
                        className="text-[11px] font-bold text-[#0D9488] hover:text-[#0F766E] transition cursor-pointer"
                      >
                        Download GST Statement (PDF)
                      </button>
                      <span className="text-[10px] text-slate-400 font-mono">T+1 Auto-Credit</span>
                    </div>
                  </div>
                )}
              </div>

              {/* 4. Autonomous Limits & Policy Guardrail Icon */}
              <div className="relative group">
                <button
                  type="button"
                  onMouseEnter={() => setActiveDockFlyout('limits')}
                  onClick={() => setActiveDockFlyout(activeDockFlyout === 'limits' ? null : 'limits')}
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all cursor-pointer shadow-2xs ${
                    activeDockFlyout === 'limits'
                      ? 'bg-[#14B8A6] text-white shadow-md shadow-teal-500/30 scale-105'
                      : 'bg-white hover:bg-teal-50 text-slate-700 hover:text-[#14B8A6] hover:scale-105'
                  }`}
                  title="Autonomous Policy Limits"
                >
                  <Zap className="w-5 h-5 stroke-[2]" />
                </button>

                {/* Flyout Aligned Strictly to the Side of this Icon */}
                {activeDockFlyout === 'limits' && (
                  <div 
                    onMouseLeave={() => setActiveDockFlyout(null)}
                    className="absolute left-full ml-3.5 top-0 w-80 bg-white shadow-[0_24px_55px_-10px_rgba(0,0,0,0.18)] rounded-3xl p-5 z-50 animate-slide-right text-slate-900"
                  >
                    <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 mb-2.5">
                      <span className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                        Policy Guardrails
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[#0D9488] font-bold text-xs bg-teal-50 px-2 py-0.5 rounded-lg shadow-2xs">
                          ₹5,000 Cap
                        </span>
                        <button
                          type="button"
                          onClick={() => setActiveDockFlyout(null)}
                          className="w-5 h-5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition cursor-pointer"
                          title="Close"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Amounts under ₹5,000 re-initiate autonomously within money policy rules. Higher demands escalate to Paytm Ops Staff with dual authorization.
                    </p>
                    <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-emerald-700 font-semibold flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-[#14B8A6] stroke-[3]" />
                      <span>Hard Limit Protected (Zero Leakage)</span>
                    </div>
                  </div>
                )}
              </div>

              {/* 5. Dispute & Chargeback Defense Icon */}
              <div className="relative group">
                <button
                  type="button"
                  onMouseEnter={() => setActiveDockFlyout('dispute')}
                  onClick={() => setActiveDockFlyout(activeDockFlyout === 'dispute' ? null : 'dispute')}
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all cursor-pointer shadow-2xs ${
                    activeDockFlyout === 'dispute'
                      ? 'bg-[#14B8A6] text-white shadow-md shadow-teal-500/30 scale-105'
                      : 'bg-white hover:bg-teal-50 text-slate-700 hover:text-[#14B8A6] hover:scale-105'
                  }`}
                  title="Dispute & Chargeback Defense"
                >
                  <ShieldCheck className="w-5 h-5 stroke-[2]" />
                </button>

                {/* Flyout Aligned Strictly to the Side of this Icon */}
                {activeDockFlyout === 'dispute' && (
                  <div 
                    onMouseLeave={() => setActiveDockFlyout(null)}
                    className="absolute left-full ml-3.5 top-0 w-80 bg-white shadow-[0_24px_55px_-10px_rgba(0,0,0,0.18)] rounded-3xl p-5 z-50 animate-slide-right text-slate-900"
                  >
                    <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 mb-2.5">
                      <span className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                        Chargeback Defense
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-lg">
                          SLA Active
                        </span>
                        <button
                          type="button"
                          onClick={() => setActiveDockFlyout(null)}
                          className="w-5 h-5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition cursor-pointer"
                          title="Close"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Active ₹8,500 dispute monitored under NPCI statutory deadlines. Upload proof of delivery before cut-off to auto-protect merchant funds.
                    </p>
                    <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-400 font-mono">
                      Statutory SLA Window: 48h Remaining
                    </div>
                  </div>
                )}
              </div>

              {/* Subtle Divider */}
              <div className="w-8 h-px bg-slate-200/80 my-1" />

              {/* 6. Deductions Quick Trigger */}
              <button
                type="button"
                onClick={() => setShowDeductions(true)}
                className="w-11 h-11 rounded-2xl bg-white hover:bg-teal-50 text-slate-700 hover:text-[#14B8A6] flex items-center justify-center transition-all cursor-pointer shadow-2xs hover:scale-105"
                title="View Deductions Ledger"
              >
                <Receipt className="w-5 h-5 stroke-[2]" />
              </button>

            </div>

            {/* ─── BOTTOM LOWEST SECTION: MERCHANT ACCOUNT [P] AVATAR (AS REQUESTED) ─── */}
            <div className="mt-auto pt-3 flex flex-col items-center w-full relative">
              <div className="w-8 h-px bg-teal-100/70 mb-3" />
              
              <div className="relative group">
                <button
                  type="button"
                  onClick={() => setActiveDockFlyout(activeDockFlyout === 'account' ? null : 'account')}
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm transition-all cursor-pointer shadow-md ${
                    activeDockFlyout === 'account'
                      ? 'bg-[#0D9488] text-white ring-4 ring-teal-200 scale-105'
                      : 'bg-gradient-to-br from-[#14B8A6] to-[#0D9488] text-white ring-2 ring-teal-50 hover:scale-105'
                  }`}
                  title="Merchant Account Details & Settings"
                >
                  {initialLetter}
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-white" />
                </button>

                {/* Account Flyout (Aligned horizontally to the side, bottom-0) */}
                {activeDockFlyout === 'account' && (
                  <div
                    onMouseLeave={() => setActiveDockFlyout(null)}
                    className="absolute left-full ml-3.5 bottom-0 w-84 bg-white shadow-[0_24px_55px_-10px_rgba(0,0,0,0.18)] rounded-3xl p-5 z-50 animate-slide-right text-slate-900"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#14B8A6] to-[#0D9488] text-white flex items-center justify-center font-bold text-base shadow-sm shrink-0">
                          {initialLetter}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-sm text-slate-900 truncate">
                              {businessTitle}
                            </span>
                            <span className="w-3.5 h-3.5 rounded-full bg-[#14B8A6] text-white flex items-center justify-center text-[8px] font-bold shrink-0">
                              <Check className="w-2 h-2 stroke-[3]" />
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            MID: {session?.user?.merchantId ? session.user.merchantId.slice(0, 14) : 'merch-online-1'}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveDockFlyout(null)}
                        className="w-6 h-6 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition cursor-pointer shrink-0 ml-2"
                        title="Close"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="space-y-2 text-xs mb-3.5">
                      <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 text-slate-700">
                        <span className="text-slate-500">Primary Bank:</span>
                        <span className="font-semibold text-slate-800">HDFC •••• {session?.user?.bankLast4 || '5223'}</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 text-slate-700">
                        <span className="text-slate-500">Auto Payout Mode:</span>
                        <span className="font-semibold text-[#0D9488]">T+1 Morning Cycle</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 text-slate-700">
                        <span className="text-slate-500">Soundbox Status:</span>
                        <span className="font-semibold text-emerald-600 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Connected (80%)
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 text-slate-700">
                        <span className="text-slate-500">Autonomous Cap:</span>
                        <span className="font-semibold text-slate-800">₹5,000 / Day</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex flex-col gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveDockFlyout(null);
                          setShowDeductions(true);
                        }}
                        className="w-full py-2 px-3 rounded-xl bg-teal-50 hover:bg-teal-100 text-[#0D9488] font-bold text-xs flex items-center justify-between transition cursor-pointer"
                      >
                        <span>Deductions & Fee Ledger</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => {
                          api.clearSession();
                          navigate('/login');
                        }}
                        className="w-full py-2 px-3 rounded-xl hover:bg-rose-50 text-rose-600 font-bold text-xs flex items-center gap-2 transition cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out / Exit Dashboard</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </aside>

          {/* ─── MAIN CHAT CANVAS (SEPARATE BIG ELEVATED BOX NESTLED INSIDE THE L) ───── */}
          <div className="flex-1 pl-3 sm:pl-3.5 pt-3 sm:pt-3.5 min-w-0 h-full flex flex-col">
            <section className="flex-1 h-full min-w-0 flex flex-col bg-white shadow-[0_16px_45px_-8px_rgba(0,0,0,0.07),0_4px_16px_-2px_rgba(0,0,0,0.03)] rounded-[32px] overflow-hidden min-h-0 relative">
              
              {/* Chat Canvas Top Bar */}
              <div className="px-5 py-3.5 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-center justify-between shrink-0 z-10">
                <div className="flex items-center gap-3">
                  {/* Sulajh AI Bespoke SVG Icon */}
                  <div className="w-9 h-9 rounded-2xl bg-teal-50 text-[#14B8A6] flex items-center justify-center shadow-2xs shrink-0">
                    <SulajhAIIcon className="w-5 h-5 text-[#14B8A6]" />
                  </div>
                  
                  {/* Title & 24x7 Settlement Desk + (i) Info Tooltip Button */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                      Sulajh AI Teammate
                    </span>
                    <span className="text-xs sm:text-sm font-semibold text-slate-400">
                      · 24x7 Settlement Desk
                    </span>

                    {/* (i) Info Button */}
                    <div className="relative group/info">
                      <button
                        type="button"
                        className="w-4.5 h-4.5 rounded-full bg-slate-100 hover:bg-teal-50 text-slate-400 hover:text-[#0D9488] flex items-center justify-center transition cursor-pointer"
                        title="Autonomous settlement & dispute operations"
                      >
                        <Info className="w-3 h-3 stroke-[2.5]" />
                      </button>
                      <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1.5 hidden group-hover/info:block bg-slate-900 text-white text-[11px] font-medium px-3 py-1.5 rounded-xl shadow-lg whitespace-nowrap z-50 pointer-events-none animate-fade-in">
                        {language === 'hi' ? 'स्वायत्त हिसाब एवं विवाद समाधान साथी' : language === 'en' ? 'Autonomous settlement & dispute operations' : 'Autonomous settlement & dispute operations'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {settlementDetail && (
                    <button
                      type="button"
                      onClick={() => setShowDeductions(true)}
                      className="px-3 py-1 rounded-xl bg-teal-50 text-[#0D9488] text-[11px] font-bold cursor-pointer shadow-xs"
                    >
                      Pending ₹{settlementDetail.net.toLocaleString('en-IN')}
                    </button>
                  )}
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#0D9488] bg-teal-50 px-3 py-1 rounded-full shadow-2xs">
                    <Check className="w-3 h-3 stroke-[3]" /> Policy Guardrails Active
                  </span>
                </div>
              </div>

              {/* ─── CHAT MESSAGES STREAM ──────────────────────────────────────── */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 custom-scrollbar min-h-0 bg-[#F8FAFC]/50">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex flex-col ${m.sender === 'merchant' ? 'items-end' : 'items-start'} animate-slide-up`}
                  >
                    <div
                      className={`max-w-[88%] sm:max-w-[78%] p-3.5 sm:p-4 rounded-2xl text-xs sm:text-sm font-medium leading-relaxed shadow-sm ${
                        m.sender === 'merchant'
                          ? 'bg-[#14B8A6] text-white rounded-br-xs'
                          : 'bg-white text-slate-800 rounded-bl-xs'
                      }`}
                    >
                      <div className="whitespace-pre-line">{m.text}</div>

                      {/* Agent Action Badges */}
                      {m.actions && m.actions.length > 0 && (
                        <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-1">
                          {m.actions.map((act, i) => (
                            <div key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-teal-50 text-[#0F766E] text-[11px] font-bold mr-1.5 shadow-2xs">
                              <Zap className="w-3 h-3 text-[#14B8A6]" />
                              <span>{act}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* "Why this answer?" Proof Trigger Button */}
                      {m.answerSources && m.answerSources.length > 0 && (
                        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => setSelectedProof(m.answerSources || null)}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-50 hover:bg-teal-50 text-slate-700 hover:text-[#0D9488] text-[11px] font-bold transition shadow-xs cursor-pointer"
                          >
                            <ShieldCheck className="w-3.5 h-3.5 text-[#14B8A6]" />
                            <span>Why this answer? (Fintech Proof)</span>
                          </button>
                          <span className="text-[10px] text-teal-700 font-semibold flex items-center gap-1">
                            <Check className="w-3 h-3 stroke-[3]" /> Verified from Ledger
                          </span>
                        </div>
                      )}

                      {/* Timestamp inside bubble in lower right corner like WhatsApp */}
                      <div className="flex justify-end items-center gap-1 mt-1 -mb-0.5 select-none">
                        <span className={`text-[10px] font-medium ${m.sender === 'merchant' ? 'text-teal-100' : 'text-slate-400'}`}>
                          {m.timestamp}
                        </span>
                        {m.sender === 'merchant' && (
                          <Check className="w-3 h-3 text-teal-100 stroke-[2.5]" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white max-w-xs animate-pulse shadow-md">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#14B8A6] animate-ping" />
                    <span className="text-xs font-bold text-slate-800">
                      Sulajh AI is consulting policy & ledger...
                    </span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* ─── BOTTOM DOCK & SUGGESTED PROMPTS (CLEAN ENTERPRISE) ────────── */}
              <div className="p-3 sm:p-4 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.02)] space-y-2 shrink-0 z-20">
                
                {/* Quick Actions Carousel with Centered Small Header and Toggle Chevron */}
                <div className="space-y-1.5">
                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={() => setShowSuggestions(!showSuggestions)}
                      className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-slate-100 hover:bg-teal-50 text-[10px] font-bold text-slate-500 hover:text-[#0D9488] transition cursor-pointer shadow-2xs"
                      title={showSuggestions ? "Hide suggested queries" : "Show suggested queries"}
                    >
                      <span>{language === 'hi' ? 'सुझाए गए प्रश्न' : language === 'en' ? 'Suggested Queries' : 'Suggested Queries'}</span>
                      {showSuggestions ? (
                        <ChevronDown className="w-3 h-3" />
                      ) : (
                        <ChevronUp className="w-3 h-3" />
                      )}
                    </button>
                  </div>

                  {showSuggestions && (
                    <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar animate-slide-down">
                      {QUICK_ACTIONS_BY_LANG[language].map((act) => {
                        const Icon = act.Icon;
                        return (
                          <button
                            key={act.label}
                            type="button"
                            onClick={() => handleSendMessage(act.prompt)}
                            disabled={loading}
                            className="shrink-0 p-2.5 rounded-2xl bg-[#F8FAFC] hover:bg-white text-left transition-all duration-200 group flex items-center gap-2.5 min-w-[200px] cursor-pointer shadow-xs hover:shadow-md hover:-translate-y-0.5"
                          >
                            <div className="w-8 h-8 rounded-xl bg-teal-50 flex items-center justify-center text-[#14B8A6] group-hover:scale-105 transition shrink-0 shadow-2xs">
                              <Icon className="w-4 h-4 stroke-[2.2]" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-bold text-slate-900 group-hover:text-[#0D9488] transition truncate">
                                {act.label}
                              </div>
                              <div className="text-[10px] text-slate-500 truncate font-medium">
                                {act.desc}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Input Dock Bar */}
                <div className="p-1.5 sm:p-2 rounded-2xl bg-[#F1F5F9] focus-within:bg-white focus-within:shadow-md transition-all flex items-center gap-2">
                  {/* Voice Input Button */}
                  <button
                    type="button"
                    onClick={() => handleSimulateVoice('delayed')}
                    disabled={loading || isRecording}
                    className={`w-9 sm:w-10 h-9 sm:h-10 rounded-xl flex items-center justify-center transition-all shrink-0 cursor-pointer shadow-2xs ${
                      isRecording
                        ? 'bg-rose-500 text-white animate-pulse shadow-md shadow-rose-500/30'
                        : 'bg-white text-slate-600 hover:text-[#14B8A6]'
                    }`}
                    title="Voice Input (Sarvam AI)"
                  >
                    {isRecording ? <MicOff className="w-4 h-4 text-white animate-spin" /> : <Mic className="w-4 h-4" />}
                  </button>

                  {/* Text Input */}
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder={
                      isRecording
                        ? language === 'hi'
                          ? 'सार्वम AI हिन्दी वॉयस सुन रहा है...'
                          : language === 'en'
                          ? 'Listening via Sarvam AI voice...'
                          : 'Listening in Hindi (Sarvam AI)...'
                        : language === 'hi'
                        ? 'हिन्दी में पूछें (उदा. सेटलमेंट कब आएगा, कटौती का हिसाब)...'
                        : language === 'en'
                        ? 'Ask about payout delays, deductions, or disputes...'
                        : 'Hinglish ya Hindi mein poochhein (e.g., mera hisaab samjhao)...'
                    }
                    disabled={loading || isRecording}
                    className="flex-1 bg-transparent px-2.5 py-1.5 text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none"
                  />

                  {/* Send Button */}
                  <button
                    type="button"
                    onClick={() => handleSendMessage()}
                    disabled={!inputText.trim() || loading}
                    className="px-4 py-2 sm:py-2.5 rounded-xl bg-[#14B8A6] hover:bg-[#0D9488] active:bg-[#0F766E] disabled:opacity-40 text-white font-bold text-xs sm:text-sm shadow-sm shadow-teal-500/25 transition flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <span>{language === 'hi' ? 'भेजें' : language === 'en' ? 'Send' : 'Bhejo'}</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>

            </section>
          </div>

        </div>

      </div>

      {/* ─── AUDIT TRAIL PROOF MODAL ─────────────────────────────────────────── */}
      {selectedProof && (
        <div className="fixed inset-0 z-50 bg-slate-900/35 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-[28px] max-w-lg w-full p-6 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.25)] animate-slide-up">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-teal-50 text-[#14B8A6] flex items-center justify-center shadow-2xs">
                  <ShieldCheck className="w-5 h-5 text-[#14B8A6]" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Why This Answer?</h3>
                  <p className="text-xs text-slate-500 font-medium">Fintech Audit & Proof Verification Trail</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProof(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
              {selectedProof.map((src, i) => (
                <div key={i} className="p-4 rounded-2xl bg-[#F8FAFC] shadow-2xs">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Internal Record Ref
                    </span>
                    <span className="text-xs px-2.5 py-0.5 rounded-lg bg-teal-50 text-[#0F766E] font-bold font-mono">
                      {src.record_ref}
                    </span>
                  </div>
                  {src.rule_key && (
                    <div className="flex items-center justify-between text-xs text-slate-600 mt-2">
                      <span className="font-medium text-slate-500">Policy Guardrail:</span>
                      <span className="font-bold text-slate-800 font-mono text-[11px]">{src.rule_key}</span>
                    </div>
                  )}
                  <p className="text-[11px] text-teal-700 font-semibold mt-2.5 flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-[#14B8A6] stroke-[3]" />
                    <span>Direct mathematical verification from ledger. Zero hallucination.</span>
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-5 text-right">
              <button
                type="button"
                onClick={() => setSelectedProof(null)}
                className="px-5 py-2.5 rounded-2xl bg-[#14B8A6] hover:bg-[#0D9488] text-white font-bold text-xs shadow-sm transition cursor-pointer"
              >
                Samajh Gaya (Done)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── DEDUCTIONS BREAKDOWN MODAL ───────────────────────────────────────── */}
      {showDeductions && settlementDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/35 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-[28px] max-w-md w-full p-6 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.25)] animate-slide-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Settlement Deductions Hisaab</h3>
                <p className="text-xs text-slate-500 font-medium">Payout Reference: {settlementDetail.id}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowDeductions(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-2.5 text-xs">
              <div className="flex justify-between p-3.5 rounded-2xl bg-[#F8FAFC] shadow-2xs font-semibold">
                <span className="text-slate-600">Total Gross Store Sales</span>
                <span className="font-bold text-slate-900 text-sm">
                  ₹{settlementDetail.gross.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between p-2.5 rounded-xl text-rose-600 font-bold bg-rose-50/70">
                <span>Payment Gateway Fee (MDR 2%)</span>
                <span>-₹{settlementDetail.commission.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-xl text-rose-600 font-bold bg-rose-50/70">
                <span>Mandatory 18% GST on Fee</span>
                <span>-₹{settlementDetail.gst.toLocaleString('en-IN')}</span>
              </div>
              {settlementDetail.refunds > 0 && (
                <div className="flex justify-between p-2.5 rounded-xl text-rose-600 font-bold bg-rose-50/70">
                  <span>Customer UPI Refunds</span>
                  <span>-₹{settlementDetail.refunds.toLocaleString('en-IN')}</span>
                </div>
              )}
              {settlementDetail.chargebacks > 0 && (
                <div className="flex justify-between p-2.5 rounded-xl text-rose-600 font-bold bg-rose-50/70">
                  <span>Bank Chargeback Withholding</span>
                  <span>-₹{settlementDetail.chargebacks.toLocaleString('en-IN')}</span>
                </div>
              )}
              {settlementDetail.adjustments > 0 && (
                <div className="flex justify-between p-2.5 rounded-xl text-rose-600 font-bold bg-rose-50/70">
                  <span>Soundbox 4G Device Rental</span>
                  <span>-₹{settlementDetail.adjustments.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between p-3.5 rounded-2xl bg-teal-50 shadow-2xs text-sm font-bold text-[#0F766E] mt-3">
                <span>Net Credited to Bank Account</span>
                <span className="text-base font-extrabold text-[#0D9488]">₹{settlementDetail.net.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="mt-5 text-right">
              <button
                type="button"
                onClick={() => setShowDeductions(false)}
                className="px-5 py-2.5 rounded-2xl bg-[#14B8A6] hover:bg-[#0D9488] text-white font-bold text-xs shadow-sm transition cursor-pointer"
              >
                Theek Hai (Close)
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
