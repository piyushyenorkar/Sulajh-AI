import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  Lock, 
  ArrowRight, 
  Mail, 
  Phone, 
  Eye, 
  EyeOff, 
  AlertCircle,
  Store, 
  UserCheck, 
  Zap, 
  Sparkles,
  Building2,
  CheckCircle2,
  Radio,
  Receipt,
  Volume2,
  QrCode
} from 'lucide-react';
import { api } from '../lib/api';
import { PaytmLogo } from '../components/PaytmLogo';

export default function Login() {
  const navigate = useNavigate();

  // Primary view tabs: 'signin' vs 'signup'
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  // Sign In Portal role: 'merchant' vs 'staff' (Note: Staff cannot sign up)
  const [portalRole, setPortalRole] = useState<'merchant' | 'staff'>('merchant');

  // Login method for merchants: 'password' (standard) vs 'otp'
  const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('password');

  // Form states
  const [email, setEmail] = useState('piyushyenorkar1@gmail.com');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState('7498735223');
  const [otp, setOtp] = useState('123456');
  const [otpSent, setOtpSent] = useState(false);

  // Sign up states (merchant only)
  const [signupName, setSignupName] = useState('Piyush Yenorkar');
  const [signupBusiness, setSignupBusiness] = useState("Piyush's Food Plaza & Kirana");
  const [signupEmail, setSignupEmail] = useState('piyushyenorkar1@gmail.com');
  const [signupPassword, setSignupPassword] = useState('123456');
  const [signupPhone, setSignupPhone] = useState('7498735223');

  // Staff 2FA state
  const [twoFactorCode, setTwoFactorCode] = useState('654321');
  const [requires2FA, setRequires2FA] = useState(false);
  const [pendingUserId, setPendingUserId] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(true);
  const [quickLoading, setQuickLoading] = useState<string | null>(null);

  // 1-Click Quick Demo Login for instant evaluation during presentations
  const handleQuickDemoLogin = async (persona: 'merchant' | 'admin') => {
    setError(null);
    setQuickLoading(persona);
    try {
      if (persona === 'merchant') {
        const res = await api.login('piyushyenorkar1@gmail.com', '123456');
        if (res.ok) {
          navigate('/dashboard');
        } else {
          const fallback = await api.login('ramesh@kirana.in', 'Password123!');
          if (fallback.ok) navigate('/dashboard');
          else setError(res.error?.message || 'Merchant login failed');
        }
      } else if (persona === 'admin') {
        const res = await api.login('piyush.admin@paytm.com', 'password123');
        if (res.ok && res.requires2FA) {
          const faRes = await api.verifyStaff2FA(res.userId, '654321');
          if (faRes.ok) {
            navigate('/ops');
          } else {
            setError(faRes.error?.message || '2FA verification failed');
          }
        } else if (res.ok) {
          navigate('/ops');
        } else {
          setError(res.error?.message || 'Admin login failed');
        }
      }
    } catch {
      setError('Connection failed. Please retry.');
    } finally {
      setQuickLoading(null);
    }
  };

  // ─── AUTH HANDLERS ────────────────────────────────────────────────────────
  const handleEmailPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await api.login(email.trim(), password);
      if (res.ok) {
        if (res.requires2FA) {
          setRequires2FA(true);
          setPendingUserId(res.userId);
          return;
        }

        const role = res.user?.role;
        if (role === 'merchant') {
          navigate('/dashboard');
        } else if (role === 'admin' || role === 'ops_manager' || role === 'ops_agent') {
          navigate('/ops');
        } else {
          navigate('/dashboard');
        }
      } else {
        setError(res.error?.message || 'Invalid email or password.');
      }
    } catch (err: any) {
      setError(err?.message || 'Login failed. Please check network connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await api.requestOtp(phone);
      if (res.ok) {
        setOtpSent(true);
      } else {
        setError(res.error?.message || 'Failed to send OTP.');
      }
    } catch {
      setError('OTP delivery service temporarily unavailable');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.verifyOtp(phone, otp);
      if (res.ok) {
        navigate('/dashboard');
      } else {
        setError(res.error?.message || 'Invalid OTP code.');
      }
    } catch {
      setError('Verification service unavailable');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupName.trim() || !signupBusiness.trim()) {
      setError('Please provide your name and business name.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await api.signup({
        name: signupName.trim(),
        email: signupEmail.trim(),
        password: signupPassword,
        phone: signupPhone,
        businessName: signupBusiness.trim(),
        category: 'Grocery / Kirana'
      });
      if (res.ok) {
        navigate('/dashboard');
      } else {
        setError(res.error?.message || 'Account registration failed.');
      }
    } catch {
      setError('Registration service currently unavailable.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.verifyStaff2FA(pendingUserId, twoFactorCode);
      if (res.ok) {
        const role = res.user?.role;
        if (role === 'admin' || role === 'ops_manager' || role === 'ops_agent') {
          navigate('/ops');
        } else {
          navigate('/dashboard');
        }
      } else {
        setError(res.error?.message || 'Invalid 2FA code. Try 654321.');
      }
    } catch {
      setError('2FA verification failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-screen overflow-hidden relative font-sans antialiased selection:bg-[#84CC16]/20 selection:text-slate-900 bg-[#E7F8EC]">
      
      {/* ─── SEAMLESS FULL-VIEWPORT ROOM BACKGROUND (SHARED ACROSS ENTIRE WIDTH) ─── */}
      <div className="absolute top-0 inset-x-0 h-[64%] bg-gradient-to-b from-[#E7F8EC] via-[#D8F3DF] to-[#C7EED0] pointer-events-none z-0" />
      <div className="absolute bottom-0 inset-x-0 h-[36%] bg-[#1A4530] shadow-inner pointer-events-none z-0" />

      {/* ─── TOP APP HEADER BAR (NO NPCI TAG, CLEAN LOGO BADGE) ─── */}
      <header className="absolute top-0 inset-x-0 z-30 px-6 sm:px-8 py-4 flex items-center justify-between pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-emerald-200/90 flex items-center gap-2 shadow-xs">
            <PaytmLogo className="h-5 w-auto" />
            <div className="h-3.5 w-px bg-slate-300" />
            <span className="text-xs font-bold text-[#002970] tracking-tight">Sulajh.AI</span>
          </div>
        </div>
      </header>

      {/* ─── MAIN 2-COLUMN VIEWPORT FLUSH TO MARGINS ─── */}
      <main className="w-full h-full grid grid-cols-1 lg:grid-cols-12 relative z-10">
        
        {/* ══════════════════════════════════════════════════════════════════════
            LEFT SIDE: 3D MERCHANT ROOM SCENE + AUTHENTIC WALL FRAMES
           ══════════════════════════════════════════════════════════════════════ */}
        <section className="hidden lg:flex lg:col-span-7 h-full relative overflow-hidden flex-col justify-between p-8 pt-18 select-none">
          
          {/* Background Image Hook (User can drop merchant-3d.png into public/) */}
          <img 
            src="/merchant-3d.png" 
            alt="Merchant Workspace" 
            className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
            onError={(e) => {
              (e.currentTarget as HTMLElement).style.display = 'none';
            }}
          />

          {/* ─── 3 PROPER WALL HANGING FRAMES (PICTURE FRAMES ON THE WALL) ─── */}
          <div className="relative z-10 flex items-start gap-4 max-w-xl">
            
            {/* Wall Frame 1 */}
            <div className="flex flex-col items-center group">
              {/* Brass Wall Nail & Wire */}
              <div className="w-2.5 h-2.5 rounded-full bg-amber-700 border border-amber-900 shadow-xs mb-0.5" />
              <div className="w-8 h-3 border-t-2 border-slate-600/50 -mt-1.5" />
              {/* Picture Frame Molding */}
              <div className="p-1.5 bg-[#3B2516] rounded-xl shadow-[0_12px_24px_-4px_rgba(20,50,30,0.28)] border border-[#26170D] hover:-translate-y-1 transition duration-200 cursor-default">
                <div className="bg-[#FAFDF9] rounded-lg p-2.5 flex items-center gap-2.5 border border-emerald-900/10 min-w-[155px]">
                  <div className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 shadow-2xs">
                    <Zap className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                  <div>
                    <p className="text-[11px] font-extrabold text-slate-800 leading-tight">Instant Clearing</p>
                    <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded inline-block mt-0.5">T+0 Diagnostics</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Wall Frame 2 */}
            <div className="flex flex-col items-center group">
              {/* Brass Wall Nail & Wire */}
              <div className="w-2.5 h-2.5 rounded-full bg-amber-700 border border-amber-900 shadow-xs mb-0.5" />
              <div className="w-8 h-3 border-t-2 border-slate-600/50 -mt-1.5" />
              {/* Picture Frame Molding */}
              <div className="p-1.5 bg-[#3B2516] rounded-xl shadow-[0_12px_24px_-4px_rgba(20,50,30,0.28)] border border-[#26170D] hover:-translate-y-1 transition duration-200 cursor-default">
                <div className="bg-[#FAFDF9] rounded-lg p-2.5 flex items-center gap-2.5 border border-emerald-900/10 min-w-[165px]">
                  <div className="w-6 h-6 rounded-md bg-teal-100 text-teal-700 flex items-center justify-center shrink-0 shadow-2xs">
                    <Receipt className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                  <div>
                    <p className="text-[11px] font-extrabold text-slate-800 leading-tight">Deduction Reconcile</p>
                    <span className="text-[9px] font-bold text-teal-700 bg-teal-50 px-1.5 py-0.2 rounded inline-block mt-0.5">100% MDR Audit</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Wall Frame 3 */}
            <div className="flex flex-col items-center group">
              {/* Brass Wall Nail & Wire */}
              <div className="w-2.5 h-2.5 rounded-full bg-amber-700 border border-amber-900 shadow-xs mb-0.5" />
              <div className="w-8 h-3 border-t-2 border-slate-600/50 -mt-1.5" />
              {/* Picture Frame Molding */}
              <div className="p-1.5 bg-[#3B2516] rounded-xl shadow-[0_12px_24px_-4px_rgba(20,50,30,0.28)] border border-[#26170D] hover:-translate-y-1 transition duration-200 cursor-default">
                <div className="bg-[#FAFDF9] rounded-lg p-2.5 flex items-center gap-2.5 border border-emerald-900/10 min-w-[155px]">
                  <div className="w-6 h-6 rounded-md bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 shadow-2xs">
                    <ShieldCheck className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                  <div>
                    <p className="text-[11px] font-extrabold text-slate-800 leading-tight">Statutory Defense</p>
                    <span className="text-[9px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded inline-block mt-0.5">NPCI Chargebacks</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Minimalist Wall Clock (Upper Wall) */}
          <div className="absolute top-16 right-16 w-14 h-14 rounded-full bg-white/95 border-[3px] border-slate-700/80 shadow-md flex items-center justify-center z-10">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-800 relative">
              <div className="absolute bottom-0 left-[2px] w-[2px] h-4 bg-slate-800 origin-bottom rotate-45" />
              <div className="absolute bottom-0 left-[2px] w-[2px] h-5 bg-slate-700 origin-bottom -rotate-60" />
            </div>
          </div>

          {/* ─── ISOMETRIC DESK & 3D CHARACTER SCENE ─── */}
          <div className="relative z-10 flex flex-col items-center my-auto">
            
            {/* 3D Character Figure */}
            <div className="relative flex flex-col items-center -mb-7 z-10">
              {/* Head & Glasses */}
              <div className="w-16 h-18 rounded-[20px] bg-[#E5B596] shadow-md relative flex flex-col items-center border border-[#D4A384]">
                {/* Hair */}
                <div className="absolute -top-1 w-17 h-8 bg-[#4A3225] rounded-t-2xl shadow-xs" />
                {/* Glasses */}
                <div className="flex items-center gap-1 mt-7 z-10">
                  <div className="w-4 h-3.5 rounded-sm border-2 border-slate-800 bg-white/30" />
                  <div className="w-1.5 h-0.5 bg-slate-800" />
                  <div className="w-4 h-3.5 rounded-sm border-2 border-slate-800 bg-white/30" />
                </div>
                {/* Friendly Smile & Beard */}
                <div className="w-8 h-4 bg-[#4A3225] rounded-b-xl mt-1.5 flex items-center justify-center">
                  <div className="w-3.5 h-1 bg-white rounded-full" />
                </div>
              </div>

              {/* Lime/Mint Sweater Torso */}
              <div className="w-26 h-22 rounded-t-3xl bg-[#84CC16] shadow-lg border-t-2 border-[#A3E635] flex items-center justify-center relative">
                <div className="w-6 h-6 rounded-full bg-indigo-600 border border-indigo-700 shadow-xs" />
              </div>
            </div>

            {/* ─── WARM SCANDINAVIAN OAK WOOD DESK (DOES NOT MERGE WITH DARK GREEN FLOOR) ─── */}
            <div className="relative z-20 flex flex-col items-center">
              
              {/* Desk Top Surface: Warm Amber Oak Wood with 3D Bevel */}
              <div className="w-92 h-14 rounded-t-[22px] bg-gradient-to-r from-[#D98E52] via-[#E8A56A] to-[#C97C3E] border-t-2 border-[#FBD8B3] shadow-md relative flex items-center justify-between px-7">
                
                {/* Sleek Laptop Screen with Settlement Payout */}
                <div className="w-34 h-22 rounded-t-xl bg-slate-200 border-2 border-slate-400 shadow-md relative flex flex-col items-center justify-center -mt-10">
                  <div className="w-30 h-16 rounded-lg bg-slate-900 border border-slate-700 flex flex-col items-center justify-center text-teal-400 font-mono text-[9px] font-bold">
                    <span>PAYOUT SETTLED</span>
                    <span className="text-white text-[10px] mt-0.5">₹4,735.54</span>
                  </div>
                  <div className="w-38 h-2.5 bg-slate-300 rounded-b-md shadow-xs absolute -bottom-1" />
                </div>

                {/* Right Side Accessories: Paytm Soundbox with Physical Keypad & Coffee Mug */}
                <div className="flex items-end gap-3 -mt-6">
                  
                  {/* Real Paytm Soundbox with Keypad & Speaker Grille */}
                  <div className="w-13 h-17 rounded-xl bg-[#002970] border-2 border-[#00BAF2] shadow-lg flex flex-col items-center justify-between p-1 relative">
                    {/* Speaker Grille */}
                    <div className="w-9 h-3.5 rounded bg-[#001A49] flex items-center justify-center gap-0.5">
                      <div className="w-1 h-1 rounded-full bg-white/40" />
                      <div className="w-1 h-1 rounded-full bg-white/60" />
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <div className="w-1 h-1 rounded-full bg-white/60" />
                      <div className="w-1 h-1 rounded-full bg-white/40" />
                    </div>

                    {/* Soundbox Keypad (Volume +, -, Play/Replay) */}
                    <div className="w-9 bg-[#003882] rounded py-0.5 px-1 flex items-center justify-around border border-[#00BAF2]/40 shadow-inner">
                      <span className="text-[8px] font-extrabold text-white leading-none hover:text-[#00BAF2] cursor-default">+</span>
                      <span className="text-[8px] font-extrabold text-white leading-none hover:text-[#00BAF2] cursor-default">-</span>
                      <span className="text-[7px] font-bold text-emerald-300 leading-none hover:text-emerald-200 cursor-default">▶</span>
                    </div>

                    {/* Paytm Brand & mini QR stand */}
                    <div className="flex items-center justify-between w-full px-0.5">
                      <span className="text-[7px] font-black text-white uppercase tracking-tighter">PAYTM</span>
                      <QrCode className="w-2.5 h-2.5 text-white/80" />
                    </div>
                  </div>

                  {/* Purple Coffee Mug */}
                  <div className="w-7 h-8 rounded-b-lg rounded-t-sm bg-indigo-600 shadow-md relative flex items-center justify-center">
                    <div className="absolute -top-3 w-3 h-3 border-r-2 border-white/60 rounded-full animate-bounce" />
                    <div className="w-2.5 h-3.5 rounded-r-md border-2 border-indigo-600 absolute -right-2.5" />
                  </div>

                </div>

              </div>

              {/* Desk Front Apron: Deep Polished Teak Wood Facia */}
              <div className="w-92 h-14 rounded-b-[18px] bg-gradient-to-r from-[#8C4F22] via-[#A05C29] to-[#7B4118] border-b-4 border-[#5C2E0E] shadow-2xl relative">
                {/* Desk Legs (Crisp White Metal with Dark Rubber Feet) */}
                <div className="absolute top-10 left-8 flex flex-col items-center">
                  <div className="w-3 h-20 bg-white shadow-md border-r border-slate-300" />
                  <div className="w-3.5 h-2 bg-slate-800 rounded-b-md" />
                </div>
                <div className="absolute top-10 right-8 flex flex-col items-center">
                  <div className="w-3 h-20 bg-white shadow-md border-r border-slate-300" />
                  <div className="w-3.5 h-2 bg-slate-800 rounded-b-md" />
                </div>
              </div>

              {/* Soft Ambient Table Shadow on Floor */}
              <div className="w-84 h-6 bg-black/40 blur-md rounded-full -mt-2 pointer-events-none" />

            </div>

            {/* Indoor Snake Plant (Right of Desk) */}
            <div className="absolute -right-8 bottom-4 flex flex-col items-center z-15">
              <div className="flex gap-0.5 items-end">
                <div className="w-3 h-22 rounded-t-full bg-emerald-600 shadow-sm" />
                <div className="w-3.5 h-28 rounded-t-full bg-emerald-500 shadow-sm" />
                <div className="w-3 h-18 rounded-t-full bg-emerald-700 shadow-sm" />
              </div>
              <div className="w-13 h-11 bg-slate-200 rounded-b-xl border-t-2 border-slate-300 shadow-md" />
            </div>

          </div>

          {/* ─── BOTTOM TRUST & COMPLIANCE BAR (SHIFTED RIGHT, CENTERED UNDER THE TABLE) ─── */}
          <div className="relative z-10 w-full flex justify-center items-center pb-2">
            <div className="flex items-center gap-4 text-xs font-semibold text-emerald-100/95 bg-emerald-950/75 backdrop-blur-md py-2 px-5 rounded-full border border-emerald-800/40 shadow-sm">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>RBI Grievance Redressal</span>
              </span>
              <span className="text-emerald-500">•</span>
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>256-Bit Bank Encryption</span>
              </span>
              <span className="text-emerald-500">•</span>
              <span className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>10,000+ Outlets</span>
              </span>
            </div>
          </div>

        </section>

        {/* ══════════════════════════════════════════════════════════════════════
            RIGHT SIDE: CONSTANT-SIZE WHITE AUTH CARD FLOATING ON ROOM BACKGROUND
            - Fixed stable height & width (no jumping or size jitter)
            - Content distributed evenly with zero congested spacing
            - Outer overflow-hidden prevents scrollbar marks from leaking
            - Internal 1px flush scrollbar with hidden buttons
           ══════════════════════════════════════════════════════════════════════ */}
        <section className="col-span-1 lg:col-span-5 h-full p-4 sm:p-6 lg:p-8 flex items-center justify-center z-20">
          
          {/* Constant Locked Dimensions Card: Exactly 430px wide, 670px high */}
          <div className="w-full max-w-[430px] h-[670px] max-h-[94vh] bg-white rounded-[36px] shadow-[0_25px_60px_-15px_rgba(20,50,30,0.35)] border border-white/80 overflow-hidden relative flex flex-col text-slate-900">
            
            {/* Scrollable Inner Container (1px sleek scrollbar, perfectly contained inside) */}
            <div className="w-full h-full p-6 sm:p-7 flex flex-col justify-between overflow-y-auto thin-scroll">
              
              {/* ─── CARD HEADER ZONE ─── */}
              <div className="shrink-0">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-lg bg-[#84CC16] flex items-center justify-center text-white font-bold text-xs shadow-xs">
                    <Sparkles className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <span className="font-['Outfit',sans-serif] font-black text-xl text-slate-900 tracking-tight">
                    Sulajh<span className="text-[#84CC16]">.AI</span>
                  </span>
                </div>

                {/* Big Centered Heading */}
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight text-center leading-snug">
                  {authMode === 'signin' ? (portalRole === 'merchant' ? 'Welcome back' : 'Staff Sign in') : 'Create account'}
                </h1>
                
                <p className="text-xs text-slate-500 text-center mt-1 font-medium">
                  {authMode === 'signin' 
                    ? (portalRole === 'merchant' ? 'Access your settlement ledger & AI teammate' : 'Paytm Ops & Risk Management Console')
                    : 'Start autonomous settlement operations for your store'}
                </p>

                {/* Role Toggle: Shown ONLY in Sign-in (Staff cannot self-register) */}
                {authMode === 'signin' ? (
                  <div className="flex items-center justify-center gap-1 mt-3 bg-slate-100 p-1 rounded-xl max-w-[260px] mx-auto">
                    <button
                      type="button"
                      onClick={() => {
                        setPortalRole('merchant');
                        setEmail('piyushyenorkar1@gmail.com');
                        setPassword('123456');
                        setError(null);
                      }}
                      className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                        portalRole === 'merchant' 
                          ? 'bg-white text-slate-900 shadow-xs' 
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      <Store className="w-3.5 h-3.5 text-[#84CC16]" />
                      <span>Merchant</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPortalRole('staff');
                        setEmail('piyushyenorkar02@gmail.com');
                        setPassword('123456');
                        setError(null);
                      }}
                      className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                        portalRole === 'staff' 
                          ? 'bg-slate-900 text-white shadow-xs' 
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Staff</span>
                    </button>
                  </div>
                ) : (
                  /* Staff Restriction Notice in Sign Up */
                  <div className="mt-2.5 py-1.5 px-3 bg-emerald-50 border border-emerald-200/60 rounded-xl text-center">
                    <span className="text-[11px] font-semibold text-emerald-800">
                      Merchant Onboarding Desk · Staff accounts are admin-provisioned
                    </span>
                  </div>
                )}

                {/* Sub-tabs for Merchant Sign-in: Password vs OTP */}
                {authMode === 'signin' && portalRole === 'merchant' && (
                  <div className="flex justify-center gap-4 mt-2.5 text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => { setLoginMethod('password'); setError(null); }}
                      className={`pb-1 transition cursor-pointer border-b-2 ${
                        loginMethod === 'password'
                          ? 'border-[#84CC16] text-slate-900 font-bold'
                          : 'border-transparent text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      Email & Password
                    </button>
                    <button
                      type="button"
                      onClick={() => { setLoginMethod('otp'); setError(null); }}
                      className={`pb-1 transition cursor-pointer border-b-2 ${
                        loginMethod === 'otp'
                          ? 'border-[#84CC16] text-slate-900 font-bold'
                          : 'border-transparent text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      Mobile OTP
                    </button>
                  </div>
                )}
              </div>

              {/* Error Alert Box */}
              {error && (
                <div className="my-2 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2 shrink-0">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
                  <span className="leading-tight font-medium">{error}</span>
                </div>
              )}

              {/* ─── FORM ZONE: PROPERLY BALANCED IN CARD CENTER ─── */}
              <div className="my-auto py-2">
                
                {/* 1. SIGN-IN: EMAIL & PASSWORD (MERCHANT OR STAFF) */}
                {authMode === 'signin' && (portalRole === 'staff' || loginMethod === 'password') && (
                  <form onSubmit={handleEmailPasswordLogin} className="space-y-3">
                    <div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email address"
                        required
                        className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#84CC16]/30 focus:border-[#84CC16] transition"
                      />
                    </div>

                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        required
                        className="w-full pl-4 pr-11 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#84CC16]/30 focus:border-[#84CC16] transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Remember me & Forgot Password */}
                    <div className="flex items-center justify-between text-xs px-1 text-slate-500">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="w-3.5 h-3.5 rounded text-[#84CC16] focus:ring-[#84CC16] border-slate-300"
                        />
                        <span>Remember on this device</span>
                      </label>
                      <button type="button" className="text-slate-500 hover:text-[#84CC16] hover:underline font-medium">
                        Forgot?
                      </button>
                    </div>

                    {/* Primary Lime Green CTA Button */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 sm:py-3.5 rounded-full sm:rounded-2xl bg-[#84CC16] hover:bg-[#74B513] active:bg-[#65A30D] text-white text-sm font-bold tracking-wide shadow-md shadow-[#84CC16]/25 hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer mt-1"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      ) : (
                        <span>Sign in</span>
                      )}
                    </button>
                  </form>
                )}

                {/* 2. SIGN-IN: MOBILE OTP */}
                {authMode === 'signin' && portalRole === 'merchant' && loginMethod === 'otp' && (
                  <form onSubmit={!otpSent ? handleRequestOtp : handleVerifyOtp} className="space-y-3">
                    <div>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">+91</span>
                        <input
                          type="tel"
                          maxLength={10}
                          value={phone}
                          onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                          placeholder="Phone number"
                          required
                          className="w-full pl-13 pr-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#84CC16]/30 focus:border-[#84CC16] transition"
                        />
                      </div>
                    </div>

                    {otpSent && (
                      <div className="relative">
                        <input
                          type="text"
                          maxLength={6}
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          placeholder="6-Digit OTP (Demo: 123456)"
                          required
                          className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#84CC16]/30 focus:border-[#84CC16] transition text-center tracking-widest font-mono font-bold"
                        />
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 sm:py-3.5 rounded-full sm:rounded-2xl bg-[#84CC16] hover:bg-[#74B513] text-white text-sm font-bold tracking-wide shadow-md transition flex items-center justify-center gap-2 cursor-pointer mt-1"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      ) : (
                        <span>{!otpSent ? 'Send OTP code' : 'Verify & Sign in'}</span>
                      )}
                    </button>
                  </form>
                )}

                {/* 3. SIGN-UP: MERCHANT ONLY (FITS EXACT SAME HEIGHT WITH STREAMLINED GRID) */}
                {authMode === 'signup' && (
                  <form onSubmit={handleSignup} className="space-y-2.5">
                    <input
                      type="text"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      placeholder="Your full name"
                      required
                      className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#84CC16]/30 transition"
                    />

                    <input
                      type="text"
                      value={signupBusiness}
                      onChange={(e) => setSignupBusiness(e.target.value)}
                      placeholder="Shop or business name"
                      required
                      className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#84CC16]/30 transition"
                    />

                    <input
                      type="email"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      placeholder="Email address"
                      required
                      className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#84CC16]/30 transition"
                    />

                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="tel"
                        maxLength={10}
                        value={signupPhone}
                        onChange={(e) => setSignupPhone(e.target.value.replace(/\D/g, ''))}
                        placeholder="Mobile (10 digits)"
                        required
                        className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#84CC16]/30 transition"
                      />
                      <input
                        type="password"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        placeholder="Password (6+ chars)"
                        required
                        className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#84CC16]/30 transition"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 rounded-full sm:rounded-2xl bg-[#84CC16] hover:bg-[#74B513] text-white text-xs font-bold tracking-wide shadow-md transition flex items-center justify-center gap-2 cursor-pointer mt-1"
                    >
                      {loading ? (
                        <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      ) : (
                        <span>Create account</span>
                      )}
                    </button>
                  </form>
                )}

                {/* 4. STAFF 2FA OVERLAY */}
                {requires2FA && (
                  <form onSubmit={handleVerify2FA} className="space-y-3 mt-2">
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-center">
                      <p className="text-xs text-amber-800 font-semibold">Staff 2FA Verification Required</p>
                      <p className="text-[11px] text-amber-600 mt-0.5">Use Demo 2FA Code: <span className="font-bold text-amber-900">654321</span></p>
                    </div>
                    <input
                      type="text"
                      maxLength={6}
                      value={twoFactorCode}
                      onChange={(e) => setTwoFactorCode(e.target.value)}
                      placeholder="654321"
                      required
                      className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl text-center font-mono font-bold tracking-widest text-slate-900"
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 rounded-full sm:rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold tracking-wide shadow-md transition cursor-pointer"
                    >
                      Verify & Enter Console
                    </button>
                  </form>
                )}

              </div>

              {/* ─── CARD FOOTER ZONE: 1-CLICK INSTANT DEMO & BOTTOM LINK ─── */}
              <div className="shrink-0 pt-1">
                <div className="relative my-2 flex items-center justify-center">
                  <div className="border-t border-slate-200 w-full" />
                  <span className="bg-white px-3 text-[10px] uppercase font-bold text-slate-400 shrink-0 tracking-wider">
                    or 1-click instant demo
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {/* Demo Merchant Button */}
                  <button
                    type="button"
                    disabled={Boolean(quickLoading)}
                    onClick={() => handleQuickDemoLogin('merchant')}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-[#84CC16] hover:bg-lime-50/40 text-left transition flex items-center justify-between group cursor-pointer shadow-2xs"
                    title="1-Click Login as Piyush Merchant"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <div className="w-7 h-7 rounded-lg bg-lime-100 text-[#65A30D] flex items-center justify-center shrink-0">
                        <Store className="w-3.5 h-3.5" />
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-bold text-slate-900 leading-none group-hover:text-[#65A30D]">Merchant</p>
                        <p className="text-[10px] text-slate-500 truncate mt-0.5">Piyush · ₹4,735</p>
                      </div>
                    </div>
                    {quickLoading === 'merchant' && (
                      <div className="w-3.5 h-3.5 border-2 border-[#84CC16] border-t-transparent rounded-full animate-spin" />
                    )}
                  </button>

                  {/* Demo Admin Button */}
                  <button
                    type="button"
                    disabled={Boolean(quickLoading)}
                    onClick={() => handleQuickDemoLogin('admin')}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/40 text-left transition flex items-center justify-between group cursor-pointer shadow-2xs"
                    title="1-Click Login as Piyush Admin"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-3.5 h-3.5" />
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-bold text-slate-900 leading-none group-hover:text-indigo-700">Admin Hub</p>
                        <p className="text-[10px] text-slate-500 truncate mt-0.5">L1 / L2 / Audit</p>
                      </div>
                    </div>
                    {quickLoading === 'admin' && (
                      <div className="w-3.5 h-3.5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    )}
                  </button>
                </div>

                {/* Terms notice */}
                <p className="text-[10px] text-slate-400 text-center mt-2 leading-relaxed">
                  By continuing, you agree to Sulajh AI's{' '}
                  <span className="font-semibold text-slate-600">Terms</span> &{' '}
                  <span className="font-semibold text-slate-600">Privacy Policy</span>.
                </p>

                {/* Bottom Toggle Between Sign In & Sign Up */}
                <div className="text-center mt-1.5 pt-1.5 border-t border-slate-100">
                  {authMode === 'signin' ? (
                    <p className="text-xs text-slate-600 font-medium">
                      Don't have an account?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode('signup');
                          setPortalRole('merchant');
                          setError(null);
                        }}
                        className="font-bold text-[#84CC16] hover:text-[#65A30D] hover:underline cursor-pointer"
                      >
                        Sign up
                      </button>
                    </p>
                  ) : (
                    <p className="text-xs text-slate-600 font-medium">
                      Have an account?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode('signin');
                          setError(null);
                        }}
                        className="font-bold text-[#84CC16] hover:text-[#65A30D] hover:underline cursor-pointer"
                      >
                        Log in
                      </button>
                    </p>
                  )}
                </div>

              </div>

            </div>

          </div>
        </section>

      </main>

    </div>
  );
}
