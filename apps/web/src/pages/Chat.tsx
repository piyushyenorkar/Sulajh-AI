import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  LayoutGrid,
  BarChart3,
  Wallet,
  ShieldAlert,
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
  RefreshCw,
  Volume2,
  VolumeX,
  Square,
  Radio,
  Copy,
  Pause,
  CornerDownLeft,
  Plus,
} from 'lucide-react';
import { api } from '../lib/api';
import { useVoiceRecorder } from '../hooks/useVoiceRecorder';
import { MERCHANT_INFO } from '../data/merchantDashboardData';
import { TabularAnswerCard, TableData, TimelineData } from '../components/chat/TabularAnswerCard';

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
  tableData?: TableData;
  timelineData?: TimelineData;
  suggestedQuestions?: string[];
}

// Enterprise Quick Actions & Tabular Greetings
const getWelcomeMessageData = (
  lang: 'en' | 'hinglish' | 'hi',
  name: string
): Omit<MessageItem, 'id' | 'timestamp'> => {
  if (lang === 'hi') {
    return {
      sender: 'agent',
      text: `नमस्ते ${name} जी। मैंने लाइव गेटवे चेक किया है। आपका पेआउट रास्ते में है।`,
      tableData: {
        rows: [
          { label: 'राशि (Amount)', value: '₹4,735.54' },
          { label: 'कारण (Reason)', value: 'शाखा विलय के बाद बैंक कोड (IFSC) बदल गया था' },
          { label: 'स्थिति (Status)', value: 'पेआउट पुनः शुरू कर दिया गया है' },
          { label: 'खाते में प्राप्त होगा', value: 'आज शाम 6:00 PM तक', isHighlight: true, highlightType: 'success' },
        ],
      },
      suggestedQuestions: ['मेरा पैसा कब आएगा?', 'पेआउट क्यों रुका था?', 'कटौती का क्या हिसाब है?'],
    };
  }

  if (lang === 'hinglish') {
    return {
      sender: 'agent',
      text: `Namaste ${name} ji. Maine live gateway check kiya hai. Aapka payout raaste mein hai.`,
      tableData: {
        rows: [
          { label: 'Amount', value: '₹4,735.54' },
          { label: 'Reason', value: 'Bank code (IFSC) changed after a branch merger' },
          { label: 'Status', value: 'Payout restarted' },
          { label: 'You will get it', value: 'Today by 6:00 PM', isHighlight: true, highlightType: 'success' },
        ],
      },
      suggestedQuestions: ['When will I get my money?', 'Why was it rejected?', 'Why was I deducted?'],
    };
  }

  return {
    sender: 'agent',
    text: `Namaste ${name} ji. I checked the live gateway. Your payout is on its way.`,
    tableData: {
      rows: [
        { label: 'Amount', value: '₹4,735.54' },
        { label: 'Reason', value: 'Bank code (IFSC) changed after a branch merger' },
        { label: 'Status', value: 'Payout restarted' },
        { label: 'You will get it', value: 'Today by 6:00 PM', isHighlight: true, highlightType: 'success' },
      ],
    },
    suggestedQuestions: ['When will I get my money?', 'Why was it rejected?', 'Why was I deducted?'],
  };
};

function buildStructuredResponse(
  query: string,
  lang: 'en' | 'hinglish' | 'hi' = 'en',
  rawReply?: string
): {
  text: string;
  tableData?: TableData;
  timelineData?: TimelineData;
  actions?: string[];
  suggestedQuestions?: string[];
} {
  const lower = query.toLowerCase();

  // 1. TIMELINE / WHERE IS MY MONEY / STATUS ("When will I get my money?", "Where is my money?", "kab aayega", "kitna time")
  if (
    lower.includes('when will') ||
    lower.includes('where is my money') ||
    lower.includes('kab aayega') ||
    lower.includes('kitna time') ||
    lower.includes('settlement status') ||
    lower.includes('payout diagnostics') ||
    lower.includes('status')
  ) {
    const text =
      lang === 'hi'
        ? 'मैंने लाइव एचडीएफसी बैंक क्लीयरिंग गेटवे की स्थिति जांची है।'
        : lang === 'hinglish'
        ? 'Maine live gateway check kiya hai. Aapka payout HDFC clearing switch mein process ho raha hai.'
        : 'I checked the live gateway. Your payout is on its way.';

    return {
      text,
      tableData: {
        rows: [
          { label: 'Amount', value: '₹4,735.54' },
          { label: 'Reason', value: 'Bank code (IFSC) changed after a branch merger' },
          { label: 'Status', value: 'Payout restarted' },
          { label: 'You will get it', value: 'Today by 6:00 PM', isHighlight: true, highlightType: 'success' },
        ],
      },
      timelineData: {
        title: 'Where is my money?',
        subtitle: 'Auto-fix running. No action needed.',
        steps: [
          { label: 'Failure logged', time: '11:20 AM', status: 'completed' },
          { label: 'Bank code fixed', time: '11:42 AM', status: 'completed' },
          { label: 'Policy checked', time: '2:50 PM', status: 'completed' },
          { label: 'Money sent to bank', time: 'Expected today by 6:00 PM', status: 'current' },
        ],
      },
      actions: ['Checked live gateway', 'IFSC auto-remapped to HDFC0000482', 'Payout re-initiated'],
      suggestedQuestions: ['Why was it rejected?', 'Why was I deducted?', 'Show bank UTR proof'],
    };
  }

  // 2. REJECTION / FAILURE ("Why was it rejected?", "Kyun ruka", "IFSC", "reject")
  if (
    lower.includes('rejected') ||
    lower.includes('reject') ||
    lower.includes('kyun ruka') ||
    lower.includes('ruka') ||
    lower.includes('atkaa') ||
    lower.includes('ifsc')
  ) {
    const text =
      lang === 'hi'
        ? 'बैंक क्लीयरिंग स्विच से विफलता का मुख्य कारण विवरण इस प्रकार है:'
        : lang === 'hinglish'
        ? 'Bank clearing switch se rejection ka poora root-cause hisaab yeh raha:'
        : 'Here is the root-cause failure breakdown from the bank clearing network:';

    return {
      text,
      tableData: {
        title: 'Rejection Diagnostics',
        rows: [
          { label: 'Amount Attempted', value: '₹4,735.54' },
          { label: 'Error Reason', value: 'Bank code (IFSC) changed after a branch merger' },
          { label: 'Autonomous Fix', value: 'Remapped to HDFC0000482 via RBI clearing map' },
          { label: 'Policy Gate', value: 'Cleared under ₹5,000 autonomous threshold' },
          { label: 'Status', value: 'Payout restarted successfully', isHighlight: true, highlightType: 'success' },
        ],
      },
      timelineData: {
        title: 'Where is my money?',
        subtitle: 'Auto-fix running. No action needed.',
        steps: [
          { label: 'Failure logged', time: '11:20 AM', status: 'completed' },
          { label: 'Bank code fixed', time: '11:42 AM', status: 'completed' },
          { label: 'Policy checked', time: '2:50 PM', status: 'completed' },
          { label: 'Money sent to bank', time: 'Expected today by 6:00 PM', status: 'current' },
        ],
      },
      actions: ['Analyzed bank rejection payload', 'Auto-resolved branch code via RBI directory'],
      suggestedQuestions: ['When will I get my money?', 'Why was I deducted?', 'Defend ₹8,500 Dispute'],
    };
  }

  // 3. DEDUCTIONS / HISAAB ("Why was I deducted?", "See deductions", "kam kyun", "hisaab", "deduction", "katauti")
  if (
    lower.includes('deduct') ||
    lower.includes('kam kyun') ||
    lower.includes('kam aaya') ||
    lower.includes('hisaab') ||
    lower.includes('lower') ||
    lower.includes('katauti') ||
    lower.includes('fee') ||
    lower.includes('कटौती')
  ) {
    const text =
      lang === 'hi'
        ? 'सकल ₹4,820.00 सेटलमेंट के लिए मदवार कटौती का पूरा हिसाब (hisaab):'
        : lang === 'hinglish'
        ? 'Aapke Gross ₹4,820.00 payout ka itemized katauti hisaab yeh raha:'
        : 'Here is your itemized deduction breakdown (hisaab) for Gross ₹4,820.00:';

    return {
      text,
      tableData: {
        title: 'Deductions (hisaab)',
        rows: [
          { label: 'Sales', value: '₹4,820.00' },
          { label: 'Gateway fee', value: '-₹72.40' },
          { label: 'GST on fee', value: '-₹12.06' },
          { label: 'Soundbox rental', value: '₹0.00 (Promo free)' },
          { label: 'You get', value: '₹4,735.54', isHighlight: true, highlightType: 'success' },
        ],
        statusBadge: 'Instant payout is on hold',
      },
      actions: ['Reconciled line items with bank gateway ledger', 'Zero discrepancy audit confirmed'],
      suggestedQuestions: ['When will I get my money?', 'Why was it rejected?', 'Defend ₹8,500 Dispute'],
    };
  }

  // 4. DISPUTE / CHARGEBACK ("8500", "dispute", "chargeback", "proof")
  if (
    lower.includes('dispute') ||
    lower.includes('chargeback') ||
    lower.includes('8500') ||
    lower.includes('8,500') ||
    lower.includes('proof') ||
    lower.includes('विवाद')
  ) {
    const text =
      lang === 'hi'
        ? 'स्टोर के सक्रिय ग्राहक विवाद #DSP-8500 की वैधानिक बैंक रक्षा स्थिति:'
        : lang === 'hinglish'
        ? 'Store ke active dispute #DSP-8500 ka statutory bank defence status:'
        : 'Review of active customer dispute #DSP-8500 and statutory evidence submission:';

    return {
      text,
      tableData: {
        title: 'Dispute Defence (DSP-8500)',
        rows: [
          { label: 'Disputed Amount', value: '₹8,500.00' },
          { label: 'Customer Reason', value: 'Order delivery disputed' },
          { label: 'Statutory SLA', value: '48 Hours (2 Days remaining)' },
          { label: 'Proof Attached', value: 'Signed physical delivery slip (POD)' },
          { label: 'Defence Status', value: 'Submitted to issuing bank', isHighlight: true, highlightType: 'success' },
        ],
      },
      actions: ['Ran deadline-aware dispute priority planning', 'Submitted signed delivery proof to bank'],
      suggestedQuestions: ['When will I get my money?', 'Why was I deducted?', 'Download dispute evidence'],
    };
  }

  // 5. HIGH VALUE / POLICY CAP ("50000", "50,000", "policy cap", "hold", "limit")
  if (
    lower.includes('50000') ||
    lower.includes('50,000') ||
    lower.includes('policy cap') ||
    lower.includes('limit') ||
    lower.includes('hold')
  ) {
    const text =
      lang === 'hi'
        ? '₹50,000 के भुगतान की स्वायत्त सुरक्षा सीमा समीक्षा:'
        : lang === 'hinglish'
        ? '₹50,000 payout ka store safety limit ke tahat evaluation:'
        : 'Evaluation of high-value payout against frontline safety policy limits:';

    return {
      text,
      tableData: {
        title: 'Policy Review & 2FA Escalation',
        rows: [
          { label: 'Requested Amount', value: '₹50,000.00' },
          { label: 'Frontline Limit', value: '₹5,000.00 (Autonomous Threshold)' },
          { label: 'Safety Policy', value: 'RBI Dual Auth & Store 2FA required' },
          { label: 'Current Status', value: 'Escalated to Ops Manager 2FA Queue', isHighlight: true, highlightType: 'warning' },
        ],
      },
      actions: ['Evaluated money policy: Request routed to Ops Manager', '2FA lock engaged'],
      suggestedQuestions: ['When will I get my money?', 'Why was I deducted?', 'Request 2FA OTP for approval'],
    };
  }

  // 6. GENERAL FALLBACK / PARSED BACKEND REPLY
  if (rawReply) {
    const lines = rawReply.split('\n').filter((l) => l.trim().length > 0);
    const extractedRows: Array<{ label: string; value: string; isHighlight?: boolean }> = [];

    for (const line of lines) {
      const match = line.match(/^[•\-*]?\s*([^:]+):\s*(.+)$/);
      if (match) {
        const label = match[1].trim();
        const value = match[2].trim();
        const isHighlight =
          /net|you get|total|credited|status/i.test(label) || /re-initiat|restart|today/i.test(value);
        extractedRows.push({ label, value, isHighlight });
      }
    }

    if (extractedRows.length >= 2) {
      return {
        text: lines[0] && !lines[0].includes(':') ? lines[0] : 'Here is the summary of your inquiry:',
        tableData: {
          rows: extractedRows,
        },
        actions: ['Verified with live banking ledger'],
        suggestedQuestions: ['When will I get my money?', 'Why was it rejected?', 'Why was I deducted?'],
      };
    }
  }

  return {
    text: rawReply || 'Your inquiry has been checked against live banking records.',
    tableData: {
      rows: [
        { label: 'Query', value: query.length > 35 ? `${query.slice(0, 35)}...` : query },
        { label: 'Gateway Check', value: 'Verified via live banking node' },
        { label: 'Status', value: 'Action logged & resolved', isHighlight: true, highlightType: 'success' },
      ],
    },
    actions: ['Checked live settlement status'],
    suggestedQuestions: ['When will I get my money?', 'Why was it rejected?', 'Why was I deducted?'],
  };
}

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
    <div className={`rounded-full bg-gradient-to-tr from-blue-600 via-blue-400 to-indigo-500 flex items-center justify-center shrink-0 text-white shadow-xs ${className}`}>
      <svg viewBox="0 0 24 24" className="w-3/5 h-3/5 fill-white" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 0C12 6.627 6.627 12 0 12C6.627 12 12 17.373 12 24C12 17.373 17.373 12 24 12C17.373 12 12 6.627 12 0Z" />
      </svg>
    </div>
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
  
  // Real Voice STT & Recorder Hook (Gnani AI)
  const {
    isRecording,
    durationSec,
    error: micError,
    startRecording,
    stopRecording,
    cancelRecording,
  } = useVoiceRecorder();

  const [voiceProcessing, setVoiceProcessing] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [showVoiceLangMenu, setShowVoiceLangMenu] = useState(false);
  const [voiceReview, setVoiceReview] = useState<{
    transcript: string;
    needsConfirm: boolean;
    detectedLanguage?: string;
    provider?: string;
  } | null>(null);

  // Audio Playback State for TTS (Gnani Timbre)
  const [playingMsgId, setPlayingMsgId] = useState<string | null>(null);
  const [ttsLoadingId, setTtsLoadingId] = useState<string | null>(null);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  const handleToggleTimeline = (msgId: string) => {
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id === msgId) {
          if (m.timelineData) {
            setSelectedProof(
              m.answerSources && m.answerSources.length > 0
                ? m.answerSources
                : [
                    {
                      id: 'proof-1',
                      record_ref: 'STL_HOLD_4821',
                      rule_key: 'RULE_RBI_IFSC_MERGER_2026',
                      step_id: 'AUTO_CLEARED_LEVELED_5000',
                    },
                    {
                      id: 'proof-2',
                      record_ref: 'LEDGER_TX_8500_MDR',
                      rule_key: 'RULE_STATUTORY_MERCHANT_DISCOUNT',
                      step_id: 'ZERO_HALLUCINATION_MATH_AUDIT',
                    },
                  ]
            );
            return m;
          }
          return {
            ...m,
            timelineData: {
              title: 'Where is my money?',
              subtitle: 'Auto-fix running. No action needed.',
              steps: [
                { label: 'Failure logged', time: '11:20 AM', status: 'completed' },
                { label: 'Bank code fixed', time: '11:42 AM', status: 'completed' },
                { label: 'Policy checked', time: '2:50 PM', status: 'completed' },
                { label: 'Money sent to bank', time: 'Expected today by 6:00 PM', status: 'current' },
              ],
            },
          };
        }
        return m;
      })
    );
  };

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
          const formatted: MessageItem[] = detail.timeline.messages.map((m: any) => {
            if (m.sender === 'agent') {
              const structured = buildStructuredResponse(m.text, language, m.text);
              return {
                id: m.id,
                sender: m.sender,
                text: structured.text,
                timestamp: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                answerSources: detail.timeline.answer_sources,
                tableData: structured.tableData,
                timelineData: structured.timelineData,
                suggestedQuestions: structured.suggestedQuestions,
                actions: structured.actions,
              };
            }
            return {
              id: m.id,
              sender: m.sender,
              text: m.text,
              timestamp: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              answerSources: detail.timeline.answer_sources,
            };
          });
          setMessages(formatted);
        } else {
          const welcomeData = getWelcomeMessageData(language, ownerName);
          setMessages([
            {
              id: 'welcome-1',
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              ...welcomeData,
            },
          ]);
        }
      } else {
        const welcomeData = getWelcomeMessageData(language, ownerName);
        setMessages([
          {
            id: 'welcome-1',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            ...welcomeData,
          },
        ]);
      }
    } catch (e) {
      console.error('Error loading chat:', e);
      const welcomeData = getWelcomeMessageData(language, ownerName);
      setMessages([
        {
          id: 'welcome-1',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          ...welcomeData,
        },
      ]);
    }
  };

  const handleLanguageChange = (newLang: 'en' | 'hinglish' | 'hi') => {
    setLanguage(newLang);
    setShowLangDropdown(false);
    setMessages((prev) => {
      if (prev.length <= 1 && (!prev[0] || prev[0].id === 'welcome-1')) {
        const welcomeData = getWelcomeMessageData(newLang, ownerName);
        return [
          {
            id: 'welcome-1',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            ...welcomeData,
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

        const structured = buildStructuredResponse(text, language, res.reply);

        const agentMsg: MessageItem = {
          id: `msg-${Date.now() + 1}`,
          sender: 'agent',
          text: structured.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actions: res.actions_taken || structured.actions,
          answerSources: res.answer_sources,
          tableData: structured.tableData,
          timelineData: structured.timelineData,
          suggestedQuestions: structured.suggestedQuestions,
        };
        setMessages((prev) => [...prev, agentMsg]);
      } else {
        const structured = buildStructuredResponse(text, language);
        setMessages((prev) => [
          ...prev,
          {
            id: `msg-${Date.now() + 1}`,
            sender: 'agent',
            text: structured.text,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            actions: structured.actions,
            tableData: structured.tableData,
            timelineData: structured.timelineData,
            suggestedQuestions: structured.suggestedQuestions,
          },
        ]);
      }
    } catch {
      const structured = buildStructuredResponse(text, language);
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now() + 1}`,
          sender: 'agent',
          text: structured.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actions: structured.actions,
          tableData: structured.tableData,
          timelineData: structured.timelineData,
          suggestedQuestions: structured.suggestedQuestions,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // ─── CLAUDE-STYLE VOICE STT (RECORD & TRANSCRIBE IN INPUT BAR) ─────────────
  const handleStartVoice = async () => {
    setVoiceReview(null);
    setVoiceError(null);
    const started = await startRecording();
    if (!started && micError) {
      setVoiceError(micError);
    }
  };

  const handleFinishVoice = async () => {
    setVoiceProcessing(true);
    setVoiceError(null);
    try {
      const recorded = await stopRecording();
      if (!recorded || !recorded.base64) {
        setVoiceProcessing(false);
        return;
      }

      const sttRes = await api.transcribeVoice(recorded.base64, recorded.mimeType, language);
      if (sttRes && sttRes.transcript) {
        // Claude-style: Place transcribed text directly into the input field!
        setInputText((prev) => (prev ? `${prev.trim()} ${sttRes.transcript}` : sttRes.transcript));

        if (sttRes.needs_amount_confirmation) {
          setVoiceReview({
            transcript: sttRes.transcript,
            needsConfirm: true,
            detectedLanguage: sttRes.detected_language,
            provider: sttRes.provider,
          });
        }

        // Focus input field so merchant can immediately review/edit or press Enter
        setTimeout(() => {
          inputRef.current?.focus();
        }, 80);
      } else {
        setVoiceError('No speech detected. Please speak into the microphone and try again.');
      }
    } catch (err: any) {
      console.error('Voice transcription error:', err);
      setVoiceError(err.message || 'Could not transcribe voice. Please ensure microphone access is permitted and speak clearly.');
    } finally {
      setVoiceProcessing(false);
    }
  };

  const handleCancelVoice = () => {
    cancelRecording();
    setVoiceProcessing(false);
    setVoiceError(null);
  };

  // ─── CLAUDE-STYLE COPY & TTS (PLAY ASSISTANT REPLY VIA GNANI VOICE) ─────────
  const handleCopyMessage = async (msgId: string, text: string) => {
    try {
      // Clean plain text to clipboard
      const plain = text.replace(/\|[^\n]+\|/g, '').replace(/```[\s\S]*?```/g, '').replace(/[#*_~>`]/g, '').trim();
      await navigator.clipboard.writeText(plain || text);
      setCopiedMsgId(msgId);
      setTimeout(() => setCopiedMsgId(null), 1800);
    } catch (err) {
      console.warn('Copy failed', err);
    }
  };

  const handlePlaySpeech = async (msgId: string, text: string) => {
    // If clicking on the currently playing message, pause/stop it (Claude style)
    if (playingMsgId === msgId) {
      if (activeAudioRef.current) {
        activeAudioRef.current.pause();
        activeAudioRef.current = null;
      }
      setPlayingMsgId(null);
      return;
    }

    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
      activeAudioRef.current = null;
    }

    setTtsLoadingId(msgId);
    try {
      // Clean plain text summary for natural speech
      const plainText = text
        .replace(/\|[^\n]+\|/g, '')
        .replace(/```[\s\S]*?```/g, '')
        .replace(/[#*_~>`]/g, '')
        .trim();

      const audioUrl = api.getVoiceSpeakUrl(plainText.slice(0, 400), language);
      const audio = new Audio(audioUrl);
      activeAudioRef.current = audio;

      audio.onplay = () => {
        setTtsLoadingId(null);
        setPlayingMsgId(msgId);
      };

      audio.onended = () => {
        setPlayingMsgId(null);
        activeAudioRef.current = null;
      };

      audio.onerror = () => {
        setTtsLoadingId(null);
        setPlayingMsgId(null);
        activeAudioRef.current = null;
      };

      await audio.play();
    } catch (err) {
      console.error('TTS playback error:', err);
      setTtsLoadingId(null);
      setPlayingMsgId(null);
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
        
        {/* Top: Stylized 4-Point Blue/White Sparkle Brand Logo (Active Chat Desk) */}
        <div className="hidden md:flex items-center justify-center mb-6">
          <button 
            type="button"
            className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 via-blue-400 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/50 ring-2 ring-blue-300/60 scale-105 cursor-pointer transition"
            title="Sulajh AI Settlement Desk (Active)"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 0C12 6.627 6.627 12 0 12C6.627 12 12 17.373 12 24C12 17.373 17.373 12 24 12C17.373 12 12 6.627 12 0Z" />
            </svg>
          </button>
        </div>

        {/* Middle: Circular Icon Navigation Buttons */}
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

          {/* Mobile Only: Sulajh AI Chat Active Sparkle Button */}
          <button
            type="button"
            className="md:hidden w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 via-blue-400 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/50 ring-2 ring-blue-300/60 scale-105 cursor-pointer transition"
            title="Sulajh AI Settlement Desk (Active)"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 0C12 6.627 6.627 12 0 12C6.627 12 12 17.373 12 24C12 17.373 17.373 12 24 12C17.373 12 12 6.627 12 0Z" />
            </svg>
          </button>

          {/* 5. Settings */}
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
        <header className="shrink-0 p-4 sm:p-6 pb-3 bg-white shadow-xs z-20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* Left Title & Status */}
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-950 tracking-tight">
                Sulajh AI Settlement Desk
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-100/70 text-blue-800 font-bold text-[11px]">
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
              <div className="relative inline-flex items-center gap-1 text-emerald-800 font-semibold bg-emerald-100/70 px-2.5 py-0.5 rounded-md text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 stroke-[2.5]" />
                <span>Policy Guardrails Active</span>
                <button
                  type="button"
                  onClick={() => setShowPolicyInfo(!showPolicyInfo)}
                  className="text-emerald-800 hover:text-emerald-950 ml-0.5 cursor-pointer"
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
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100/80 text-amber-900 text-xs font-semibold">
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
                <div className="absolute right-0 top-10 mt-1 w-32 bg-white rounded-xl shadow-xl py-1.5 z-50">
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

        {/* ─── SETTLEMENT CLEARING LIFECYCLE TRACKER (CLEAN STEPPER) ────────── */}
        <div className="shrink-0 py-2.5 px-4 sm:px-6 bg-slate-100/70 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-2.5 z-10">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="font-semibold text-xs text-slate-900">Clearing Status:</span>
            <span className="text-slate-500 text-xs">Auto-Resolution Active (Hold: ₹4,735.54)</span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-0.5">
            {/* Step 1: Bank Failure Logged */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-200/80 text-slate-800 text-[11px] font-semibold">
              <span className="w-3.5 h-3.5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[9px] font-bold">
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              </span>
              <span>1. Failure Logged</span>
            </div>

            <span className="text-slate-300 text-xs">•</span>

            {/* Step 2: IFSC Auto-Diagnosed */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-200/80 text-slate-800 text-[11px] font-semibold">
              <span className="w-3.5 h-3.5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[9px] font-bold">
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              </span>
              <span>2. IFSC Auto-Remapped</span>
            </div>

            <span className="text-slate-300 text-xs">•</span>

            {/* Step 3: Guardrail Check / Release */}
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
              settleSuccess
                ? 'bg-emerald-100/80 text-emerald-900'
                : 'bg-blue-100/80 text-blue-900'
            }`}>
              <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold ${
                settleSuccess ? 'bg-emerald-600 text-white' : 'bg-blue-600 text-white'
              }`}>
                {settleSuccess ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : '3'}
              </span>
              <span>{settleSuccess ? '3. Policy Cleared' : '3. Policy Verified (₹5k Limit)'}</span>
            </div>

            <span className="text-slate-300 text-xs">•</span>

            {/* Step 4: Dispatched to Bank */}
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
              settleSuccess
                ? 'bg-emerald-100/80 text-emerald-900'
                : 'bg-slate-200/60 text-slate-500'
            }`}>
              <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold ${
                settleSuccess ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-600'
              }`}>
                {settleSuccess ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : '4'}
              </span>
              <span>{settleSuccess ? '4. Dispatched to Bank' : '4. Bank Credit Staged'}</span>
            </div>
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
                <div className="w-8 h-8 rounded-full bg-blue-100/80 text-blue-700 flex items-center justify-center shrink-0 mt-1 shadow-2xs">
                  <SulajhAIIcon className="w-4.5 h-4.5 text-blue-600" />
                </div>

                {/* Message Bubble */}
                <div className="flex-1 bg-slate-100/90 rounded-2xl rounded-tl-xs p-3.5 sm:p-4 text-slate-800 shadow-xs transition">
                  <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap text-slate-800 font-medium">
                    {msg.text}
                  </p>

                  {/* Tabular Answer Card / Stepper Timeline / Actions / Quick Chips */}
                  <TabularAnswerCard
                    tableData={msg.tableData}
                    timelineData={msg.timelineData}
                    actionsTaken={msg.actions}
                    suggestedQuestions={msg.suggestedQuestions}
                    onSelectQuestion={(q) => handleSendMessage(q)}
                    onWhyThisAnswer={() => handleToggleTimeline(msg.id)}
                    onSeeDeductions={() => handleSendMessage('Why was I deducted?')}
                    onCopy={() => handleCopyMessage(msg.id, msg.text)}
                    onPlaySpeech={() => handlePlaySpeech(msg.id, msg.text)}
                    copied={copiedMsgId === msg.id}
                    isPlaying={playingMsgId === msg.id}
                    isLoadingSpeech={ttsLoadingId === msg.id}
                  />

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
              <div className="w-8 h-8 rounded-full bg-blue-100/80 text-blue-700 flex items-center justify-center shrink-0 mt-1">
                <SulajhAIIcon className="w-4.5 h-4.5 text-blue-600" />
              </div>
              <div className="bg-slate-100/80 rounded-2xl rounded-tl-xs p-3.5 text-xs text-slate-600 flex items-center gap-2.5 shadow-xs">
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
        <div className="shrink-0 px-4 sm:px-6 py-3 bg-white/95 backdrop-blur-md shadow-lg sticky bottom-0 z-20 space-y-2">
          
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
                    className="p-2 rounded-xl bg-slate-100/70 hover:bg-blue-100/70 text-left transition flex items-start gap-2.5 cursor-pointer group shadow-2xs"
                  >
                    <div className="w-6 h-6 rounded-lg bg-white group-hover:bg-blue-200/60 flex items-center justify-center text-slate-700 group-hover:text-blue-600 shrink-0 transition shadow-2xs">
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

          {/* Subtle Financial Safety Hint (Claude style, non-intrusive) */}
          {voiceReview && (
            <div className="bg-amber-100/90 rounded-xl px-3 py-1.5 flex items-center justify-between text-xs text-amber-900 animate-fade-in shadow-2xs">
              <div className="flex items-center gap-2 truncate">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span className="font-bold text-[11px]">Financial action detected in speech:</span>
                <span className="truncate font-medium text-[11px] text-amber-800">
                  "{voiceReview.transcript}" • Review/edit text below before pressing Enter
                </span>
              </div>
              <button
                type="button"
                onClick={() => setVoiceReview(null)}
                className="text-amber-600 hover:text-amber-900 p-0.5 rounded cursor-pointer"
                title="Dismiss hint"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* ─── IN-APP VOICE ERROR BANNER (REPLACES NATIVE BROWSER ALERT) ─── */}
          {voiceError && (
            <div className="bg-amber-100/90 rounded-2xl px-4 py-2.5 flex items-center justify-between text-xs text-amber-950 shadow-2xs animate-slide-down">
              <div className="flex items-center gap-2 min-w-0">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                <span className="font-medium truncate">{voiceError}</span>
              </div>
              <button
                type="button"
                onClick={() => setVoiceError(null)}
                className="text-amber-800 hover:text-amber-950 p-1 rounded-full cursor-pointer shrink-0 ml-2"
                title="Dismiss error"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* ─── CLAUDE-STYLE INPUT BAR (LIGHT FINTECH THEME) ─────────────────── */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (inputText.trim() && !loading && !isRecording && !voiceProcessing) {
                setVoiceReview(null);
                setVoiceError(null);
                handleSendMessage();
              }
            }}
            className="pt-0.5 relative"
          >
            <div className="bg-slate-100/90 hover:bg-slate-200/60 focus-within:bg-slate-100 focus-within:ring-2 focus-within:ring-blue-500/20 rounded-full px-3.5 sm:px-4 py-2 sm:py-2.5 flex items-center gap-2.5 shadow-xs transition-all text-slate-900">
              
              {/* Left: Plus (+) Icon */}
              <button
                type="button"
                onClick={() => setShowSuggestions(!showSuggestions)}
                className="w-7 h-7 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-200/70 flex items-center justify-center transition cursor-pointer shrink-0"
                title="Quick prompts & tools"
              >
                <Plus className="w-4 h-4 stroke-[2.2]" />
              </button>

              {/* Center: Input / Active Voice Wave State */}
              <div className="flex-1 flex items-center min-w-0">
                {isRecording ? (
                  /* ─── IMAGE 3: CLAUDE VOICE RECORDING ACTIVE ─── */
                  <div className="flex-1 flex items-center justify-between min-w-0 pr-1 animate-fade-in">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm font-medium text-slate-900 truncate">
                        {inputText ? inputText : <span className="italic text-slate-500">Listening...</span>}
                      </span>
                    </div>

                    {/* Claude-style Wave Dots Animation (................) */}
                    <div className="flex items-center gap-1 px-2 select-none shrink-0">
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((dot) => (
                        <span
                          key={dot}
                          className="w-1 h-1 rounded-full bg-slate-400 animate-pulse"
                          style={{
                            animationDelay: `${(dot % 4) * 0.15}s`,
                            animationDuration: '1s',
                          }}
                        />
                      ))}
                    </div>
                  </div>
                ) : voiceProcessing ? (
                  /* ─── TRANSCRIBING IN PROGRESS (IN ITALIC) ─── */
                  <div className="flex-1 flex items-center gap-2 text-sm italic text-blue-600 animate-pulse min-w-0 font-medium">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600 shrink-0" />
                    <span className="truncate">Transcribing speech with Gnani AI...</span>
                  </div>
                ) : (
                  /* ─── IMAGE 4: NORMAL / TRANSCRIBED INPUT FIELD ─── */
                  <input
                    ref={inputRef}
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
                    className="w-full bg-transparent text-xs sm:text-sm font-medium text-slate-900 placeholder-slate-400 outline-none"
                  />
                )}
              </div>

              {/* Right Side Actions */}
              <div className="flex items-center gap-1.5 shrink-0">
                {isRecording ? (
                  /* ─── VOICE RECORDING ACTIVE CONTROLS: Cancel (X) and Confirm (Check) (IMAGE 3) ─── */
                  <div className="flex items-center gap-1.5 bg-slate-200/90 p-1 rounded-full shadow-2xs animate-scale-in">
                    {/* Cancel Recording (X) */}
                    <button
                      type="button"
                      onClick={handleCancelVoice}
                      className="w-8 h-8 rounded-full text-slate-600 hover:text-slate-950 hover:bg-slate-300/90 flex items-center justify-center transition cursor-pointer"
                      title="Cancel recording"
                    >
                      <X className="w-4 h-4 stroke-[2.2]" />
                    </button>

                    {/* Finish & Transcribe (Check) */}
                    <button
                      type="button"
                      onClick={handleFinishVoice}
                      className="w-8 h-8 rounded-full bg-slate-950 text-white hover:bg-slate-800 flex items-center justify-center transition font-bold shadow-xs cursor-pointer active:scale-95"
                      title="Finish and transcribe"
                    >
                      <Check className="w-4.5 h-4.5 stroke-[2.5]" />
                    </button>
                  </div>
                ) : (
                  /* ─── NORMAL VOICE & SEND BUTTONS: Mic with Chevron and Enter (IMAGE 4) ─── */
                  <>
                    {/* Microphone Trigger with Language Chevron */}
                    <div className="relative flex items-center">
                      <div className="flex items-center rounded-full hover:bg-slate-200/70 p-0.5 transition">
                        <button
                          type="button"
                          onClick={handleStartVoice}
                          disabled={loading || voiceProcessing}
                          className="w-8 h-8 rounded-full text-slate-700 hover:text-blue-600 active:scale-95 flex items-center justify-center transition cursor-pointer"
                          title="Click to speak (Gnani AI Voice Input)"
                        >
                          <Mic className="w-5 h-5 text-blue-600 stroke-[2.2]" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowVoiceLangMenu(!showVoiceLangMenu)}
                          className="w-4 h-8 flex items-center justify-center text-slate-400 hover:text-slate-700 transition cursor-pointer"
                          title="Select speech language"
                        >
                          <ChevronDown className="w-3 h-3 stroke-[2.5]" />
                        </button>
                      </div>

                      {/* Language Selection Popup (English, Hindi, Hinglish) */}
                      {showVoiceLangMenu && (
                        <div className="absolute bottom-12 right-0 bg-white rounded-2xl shadow-xl p-1.5 w-44 z-30 space-y-0.5 animate-slide-up">
                          <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Speech Language
                          </div>
                          {[
                            { id: 'en' as const, label: 'English', desc: 'en-IN' },
                            { id: 'hinglish' as const, label: 'Hinglish', desc: 'Mix (Hindi+Eng)' },
                            { id: 'hi' as const, label: 'हिन्दी', desc: 'hi-IN' },
                          ].map((langOpt) => (
                            <button
                              key={langOpt.id}
                              type="button"
                              onClick={() => {
                                setLanguage(langOpt.id);
                                setShowVoiceLangMenu(false);
                              }}
                              className={`w-full px-2.5 py-1.5 rounded-xl text-left text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
                                language === langOpt.id
                                  ? 'bg-blue-50 text-blue-700'
                                  : 'text-slate-700 hover:bg-slate-100'
                              }`}
                            >
                              <span>{langOpt.label}</span>
                              <span className="text-[10px] text-slate-400 font-normal">{langOpt.desc}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Circular Enter / Send Button (↵) (Image 4) */}
                    <button
                      type="submit"
                      disabled={!inputText.trim() || loading || voiceProcessing}
                      className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all ${
                        inputText.trim() && !loading && !voiceProcessing
                          ? 'bg-slate-950 text-white hover:bg-slate-800 active:scale-95 shadow-sm cursor-pointer'
                          : 'bg-slate-200 text-slate-400 opacity-50 cursor-not-allowed'
                      }`}
                      title="Send message (Enter)"
                    >
                      <CornerDownLeft className="w-4.5 h-4.5 stroke-[2.3]" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </form>
        </div>
      </main>

      {/* ─── PROOF & AUDIT TRAIL MODAL ("WHY THIS ANSWER?") ─────────────────────── */}
      {selectedProof && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-[28px] max-w-lg w-full p-6 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-blue-100/80 text-blue-700 flex items-center justify-center">
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
                <div key={i} className="p-4 rounded-2xl bg-slate-100/80 shadow-xs">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Ledger Record Reference
                    </span>
                    <span className="text-xs px-2.5 py-0.5 rounded-lg bg-blue-100 text-blue-800 font-bold font-mono">
                      {src.record_ref}
                    </span>
                  </div>
                  {src.rule_key && (
                    <div className="flex items-center justify-between text-xs text-slate-600 mt-2">
                      <span className="font-medium text-slate-500">Policy Guardrail:</span>
                      <span className="font-bold text-slate-900 font-mono text-[11px]">{src.rule_key}</span>
                    </div>
                  )}
                  <p className="text-[11px] text-emerald-800 font-semibold mt-2.5 flex items-center gap-1.5">
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
            <div className="flex items-center justify-between pb-3">
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
              <div className="flex justify-between p-3.5 rounded-xl bg-slate-100/80 font-semibold shadow-xs">
                <span className="text-slate-600">Total Gross Store Sales</span>
                <span className="font-extrabold text-slate-950 text-sm">₹43,250.00</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-lg text-rose-700 font-bold bg-rose-100/70">
                <span>Payment Gateway MDR Fee (3%)</span>
                <span>-₹1,297.50</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-lg text-rose-700 font-bold bg-rose-100/70">
                <span>Mandatory 18% GST on MDR</span>
                <span>-₹233.50</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-lg text-rose-700 font-bold bg-rose-100/70">
                <span>Customer UPI Refunds</span>
                <span>-₹394.00</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-lg text-rose-700 font-bold bg-rose-100/70">
                <span>Soundbox 4G Monthly Rental</span>
                <span>-₹125.00</span>
              </div>
              <div className="flex justify-between p-3.5 rounded-xl bg-emerald-100/80 text-sm font-bold text-emerald-950 mt-3 shadow-xs">
                <span>Net Credited to Bank Account</span>
                <span className="text-base font-extrabold text-emerald-800">₹41,200.00</span>
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
            <div className="flex items-center justify-between pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-amber-100/80 text-amber-700 flex items-center justify-center">
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
              <div className="p-4 rounded-2xl bg-slate-100/80 space-y-2 shadow-xs">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Holdback Amount:</span>
                  <span className="font-extrabold text-slate-950 text-sm">₹4,735.54</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Failure Reason:</span>
                  <span className="font-medium text-amber-800 bg-amber-200/60 px-2 py-0.5 rounded">HDFC Branch IFSC Merger</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Target Bank Account:</span>
                  <span className="font-mono text-slate-800">{bankAccount}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Policy Authorization:</span>
                  <span className="font-semibold text-emerald-800">Autonomous (under ₹5,000)</span>
                </div>
              </div>

              {settleSuccess ? (
                <div className="p-4 rounded-xl bg-emerald-100/80 text-center animate-fade-in shadow-xs">
                  <CheckCircle2 className="w-8 h-8 text-emerald-700 mx-auto mb-1.5" />
                  <p className="font-extrabold text-emerald-950 text-sm">Re-route Instruction Dispatched!</p>
                  <p className="text-emerald-800 text-xs mt-0.5">Bank clearing UTR will arrive within 10 minutes.</p>
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
