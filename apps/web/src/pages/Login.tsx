import React, { useState, useEffect } from 'react';
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
  QrCode
} from 'lucide-react';
import { api } from '../lib/api';
import { PaytmLogo } from '../components/PaytmLogo';

// ─── REAL WORKING WALL CLOCK (LIVE SYSTEM TIME TICKING WITH REAL SECONDS HAND) ───
function RealWorkingWallClock() {
  const [time, setTime] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = time.getHours();
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();

  const secondDeg = seconds * 6; // 360 / 60
  const minuteDeg = minutes * 6 + seconds * 0.1; // 360 / 60
  const hourDeg = (hours % 12) * 30 + minutes * 0.5; // 360 / 12

  return (
    <div className="absolute top-10 right-14 flex flex-col items-center select-none z-10 group">
      {/* Wall Pin & Hanging Ring */}
      <div className="relative flex flex-col items-center z-10">
        <div className="w-3 h-3 rounded-full bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 border border-amber-900/90 shadow-[0_2px_4px_rgba(0,0,0,0.35)] flex items-center justify-center">
          <div className="w-1 h-1 rounded-full bg-white/80" />
        </div>
        <div className="w-2.5 h-0.5 bg-black/20 blur-[0.5px] rounded-full mt-0.5" />
      </div>

      {/* Hanging Cord */}
      <div className="w-[1.5px] h-3.5 bg-slate-600/70 -mt-1 mb-0.5" />

      {/* Outer Rim / Bezel */}
      <div className="w-24 h-24 rounded-full bg-[#1A2332] p-1.5 shadow-[0_14px_30px_rgba(0,0,0,0.3)] border-[3.5px] border-[#334155] flex items-center justify-center relative">
        
        {/* Clock Inner Face */}
        <div className="w-full h-full rounded-full bg-[#FAFCFB] relative flex items-center justify-center shadow-inner overflow-hidden border border-slate-200">
          
          {/* Dial Glass Reflection Sheen */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-slate-100/60 pointer-events-none" />

          {/* Dial Numbers: 12, 3, 6, 9 */}
          <span className="absolute top-1 text-[10px] font-black text-slate-800 leading-none">12</span>
          <span className="absolute right-1.5 text-[10px] font-black text-slate-800 leading-none">3</span>
          <span className="absolute bottom-1 text-[10px] font-black text-slate-800 leading-none">6</span>
          <span className="absolute left-1.5 text-[10px] font-black text-slate-800 leading-none">9</span>

          {/* Hour Tick Dots */}
          <div className="absolute top-2.5 right-4.5 w-1 h-1 bg-slate-300 rounded-full" />
          <div className="absolute top-4.5 right-2.5 w-1 h-1 bg-slate-300 rounded-full" />
          <div className="absolute bottom-4.5 right-2.5 w-1 h-1 bg-slate-300 rounded-full" />
          <div className="absolute bottom-2.5 right-4.5 w-1 h-1 bg-slate-300 rounded-full" />
          <div className="absolute bottom-2.5 left-4.5 w-1 h-1 bg-slate-300 rounded-full" />
          <div className="absolute bottom-4.5 left-2.5 w-1 h-1 bg-slate-300 rounded-full" />
          <div className="absolute top-4.5 left-2.5 w-1 h-1 bg-slate-300 rounded-full" />
          <div className="absolute top-2.5 left-4.5 w-1 h-1 bg-slate-300 rounded-full" />

          {/* Hour Hand */}
          <div 
            className="absolute bottom-1/2 left-1/2 -translate-x-1/2 w-[3px] h-5 bg-slate-900 rounded-full origin-bottom shadow-xs transition-transform duration-300"
            style={{ transform: `translateX(-50%) rotate(${hourDeg}deg)` }}
          />

          {/* Minute Hand */}
          <div 
            className="absolute bottom-1/2 left-1/2 -translate-x-1/2 w-[2px] h-7 bg-slate-700 rounded-full origin-bottom shadow-xs transition-transform duration-300"
            style={{ transform: `translateX(-50%) rotate(${minuteDeg}deg)` }}
          />

          {/* Second Hand (Real-time ticking red hand with counterweight) */}
          <div 
            className="absolute bottom-1/2 left-1/2 -translate-x-1/2 w-[1.5px] h-8.5 bg-rose-500 rounded-full origin-bottom transition-transform duration-100 ease-linear z-10"
            style={{ transform: `translateX(-50%) rotate(${secondDeg}deg)` }}
          >
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-[2px] h-2 bg-rose-500 rounded-b-full" />
          </div>

          {/* Center Pivot Nut */}
          <div className="w-2.5 h-2.5 rounded-full bg-rose-600 border border-white shadow-xs z-20 relative" />
        </div>
      </div>
    </div>
  );
}

export default function Login() {
  const navigate = useNavigate();

  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [portalRole, setPortalRole] = useState<'merchant' | 'staff'>('merchant');
  const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('password');

  const [email, setEmail] = useState('piyushyenorkar1@gmail.com');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState('7498735223');
  const [otp, setOtp] = useState('123456');
  const [otpSent, setOtpSent] = useState(false);

  const [signupName, setSignupName] = useState('Piyush Yenorkar');
  const [signupBusiness, setSignupBusiness] = useState("Piyush's Food Plaza & Kirana");
  const [signupEmail, setSignupEmail] = useState('piyushyenorkar1@gmail.com');
  const [signupPassword, setSignupPassword] = useState('123456');
  const [signupPhone, setSignupPhone] = useState('7498735223');

  const [twoFactorCode, setTwoFactorCode] = useState('654321');
  const [requires2FA, setRequires2FA] = useState(false);
  const [pendingUserId, setPendingUserId] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(true);
  const [quickLoading, setQuickLoading] = useState<string | null>(null);

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
      
      {/* ─── SEAMLESS FULL-VIEWPORT ROOM BACKGROUND ─── */}
      <div className="absolute top-0 inset-x-0 h-[64%] bg-gradient-to-b from-[#E7F8EC] via-[#D8F3DF] to-[#C7EED0] pointer-events-none z-0" />
      <div className="absolute bottom-0 inset-x-0 h-[36%] bg-[#1A4530] shadow-inner pointer-events-none z-0" />

      {/* ─── HEADER ─── */}
      <header className="absolute top-0 inset-x-0 z-30 px-6 sm:px-8 py-4 flex items-center justify-between pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-emerald-200/90 flex items-center gap-2 shadow-xs">
            <PaytmLogo className="h-5 w-auto" />
            <div className="h-3.5 w-px bg-slate-300" />
            <span className="text-xs font-bold text-[#002970] tracking-tight">Sulajh.AI</span>
          </div>
        </div>
      </header>

      {/* ─── MAIN 2-COLUMN LAYOUT ─── */}
      <main className="w-full h-full grid grid-cols-1 lg:grid-cols-12 relative z-10">
        
        {/* ═══ LEFT SIDE: 3D MERCHANT ROOM SCENE ═══ */}
        <section className="hidden lg:flex lg:col-span-7 h-full relative overflow-hidden flex-col justify-between p-8 pt-18 select-none">
          
          {/* Background Image Hook */}
          <img 
            src="/merchant-3d.png" 
            alt="Merchant Workspace" 
            className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
            onError={(e) => {
              (e.currentTarget as HTMLElement).style.display = 'none';
            }}
          />

          {/* ─── 3 HANGING WALL PICTURE FRAMES (EQUAL WIDTH & HEIGHT, WALL PINS & WIRES) ─── */}
          <div className="relative z-10 flex items-start gap-4 max-w-xl">
            
            {/* Hanging Frame 1: Instant Clearing */}
            <div className="flex flex-col items-center">
              {/* Wall Pin */}
              <div className="relative flex flex-col items-center z-10">
                <div className="w-3 h-3 rounded-full bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 border border-amber-900/90 shadow-[0_2px_4px_rgba(0,0,0,0.35)] flex items-center justify-center">
                  <div className="w-1 h-1 rounded-full bg-white/80" />
                </div>
                <div className="w-2.5 h-0.5 bg-black/20 blur-[0.5px] rounded-full mt-0.5" />
              </div>

              {/* Hanging Wire Triangle */}
              <svg className="w-36 h-6 -my-0.5 overflow-visible" viewBox="0 0 144 24">
                <line x1="72" y1="2" x2="18" y2="24" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
                <line x1="72" y1="2" x2="126" y2="24" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
                <circle cx="72" cy="3" r="2" fill="none" stroke="#334155" strokeWidth="1" />
              </svg>

              {/* Frame Card with strictly IDENTICAL dimensions: w-[172px] h-[96px] */}
              <div className="w-[172px] h-[96px] bg-white rounded-2xl p-3 shadow-[0_12px_28px_-6px_rgba(20,50,30,0.22)] border-[3px] border-slate-200/95 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 cursor-default flex flex-col justify-between shrink-0">
                <div className="flex items-center justify-between">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 shadow-2xs">
                    <Zap className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.5 rounded-md">
                    T+0 SLA
                  </span>
                </div>
                <div>
                  <p className="text-[12px] font-bold text-slate-900 leading-tight">Instant Clearing</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Real-time Diagnostics</p>
                </div>
              </div>
            </div>

            {/* Hanging Frame 2: Deduction Reconcile */}
            <div className="flex flex-col items-center">
              {/* Wall Pin */}
              <div className="relative flex flex-col items-center z-10">
                <div className="w-3 h-3 rounded-full bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 border border-amber-900/90 shadow-[0_2px_4px_rgba(0,0,0,0.35)] flex items-center justify-center">
                  <div className="w-1 h-1 rounded-full bg-white/80" />
                </div>
                <div className="w-2.5 h-0.5 bg-black/20 blur-[0.5px] rounded-full mt-0.5" />
              </div>

              {/* Hanging Wire Triangle */}
              <svg className="w-36 h-6 -my-0.5 overflow-visible" viewBox="0 0 144 24">
                <line x1="72" y1="2" x2="18" y2="24" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
                <line x1="72" y1="2" x2="126" y2="24" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
                <circle cx="72" cy="3" r="2" fill="none" stroke="#334155" strokeWidth="1" />
              </svg>

              {/* Frame Card with strictly IDENTICAL dimensions: w-[172px] h-[96px] */}
              <div className="w-[172px] h-[96px] bg-white rounded-2xl p-3 shadow-[0_12px_28px_-6px_rgba(20,50,30,0.22)] border-[3px] border-slate-200/95 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 cursor-default flex flex-col justify-between shrink-0">
                <div className="flex items-center justify-between">
                  <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center shrink-0 shadow-2xs">
                    <Receipt className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <span className="text-[9px] font-bold text-teal-700 bg-teal-50 border border-teal-200/60 px-1.5 py-0.5 rounded-md">
                    100% Audit
                  </span>
                </div>
                <div>
                  <p className="text-[12px] font-bold text-slate-900 leading-tight">Deduction Reconcile</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">MDR Rate Splits</p>
                </div>
              </div>
            </div>

            {/* Hanging Frame 3: Statutory Defense */}
            <div className="flex flex-col items-center">
              {/* Wall Pin */}
              <div className="relative flex flex-col items-center z-10">
                <div className="w-3 h-3 rounded-full bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 border border-amber-900/90 shadow-[0_2px_4px_rgba(0,0,0,0.35)] flex items-center justify-center">
                  <div className="w-1 h-1 rounded-full bg-white/80" />
                </div>
                <div className="w-2.5 h-0.5 bg-black/20 blur-[0.5px] rounded-full mt-0.5" />
              </div>

              {/* Hanging Wire Triangle */}
              <svg className="w-36 h-6 -my-0.5 overflow-visible" viewBox="0 0 144 24">
                <line x1="72" y1="2" x2="18" y2="24" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
                <line x1="72" y1="2" x2="126" y2="24" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
                <circle cx="72" cy="3" r="2" fill="none" stroke="#334155" strokeWidth="1" />
              </svg>

              {/* Frame Card with strictly IDENTICAL dimensions: w-[172px] h-[96px] */}
              <div className="w-[172px] h-[96px] bg-white rounded-2xl p-3 shadow-[0_12px_28px_-6px_rgba(20,50,30,0.22)] border-[3px] border-slate-200/95 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 cursor-default flex flex-col justify-between shrink-0">
                <div className="flex items-center justify-between">
                  <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 shadow-2xs">
                    <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <span className="text-[9px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/60 px-1.5 py-0.5 rounded-md">
                    NPCI Guard
                  </span>
                </div>
                <div>
                  <p className="text-[12px] font-bold text-slate-900 leading-tight">Statutory Defense</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Chargeback Deadlines</p>
                </div>
              </div>
            </div>

          </div>

          {/* ─── REAL WORKING WALL CLOCK (LIVE TICKING SECOND HAND) ─── */}
          <RealWorkingWallClock />

          {/* ─── DESK & CHARACTER SCENE ─── */}
          <div className="relative z-10 flex flex-col items-center my-auto">
            
            {/* 3D Character */}
            <div className="relative flex flex-col items-center -mb-7 z-10">
              <div className="w-16 h-18 rounded-[20px] bg-[#E5B596] shadow-md relative flex flex-col items-center border border-[#D4A384]">
                <div className="absolute -top-1 w-17 h-8 bg-[#4A3225] rounded-t-2xl shadow-xs" />
                <div className="flex items-center gap-1 mt-7 z-10">
                  <div className="w-4 h-3.5 rounded-sm border-2 border-slate-800 bg-white/30" />
                  <div className="w-1.5 h-0.5 bg-slate-800" />
                  <div className="w-4 h-3.5 rounded-sm border-2 border-slate-800 bg-white/30" />
                </div>
                <div className="w-8 h-4 bg-[#4A3225] rounded-b-xl mt-1.5 flex items-center justify-center">
                  <div className="w-3.5 h-1 bg-white rounded-full" />
                </div>
              </div>
              <div className="w-26 h-22 rounded-t-3xl bg-[#84CC16] shadow-lg border-t-2 border-[#A3E635] flex items-center justify-center relative">
                <div className="w-6 h-6 rounded-full bg-indigo-600 border border-indigo-700 shadow-xs" />
              </div>
            </div>

            {/* ─── WARM OAK WOOD DESK ─── */}
            <div className="relative z-20 flex flex-col items-center">
              
              {/* Desk Top */}
              <div className="w-92 h-14 rounded-t-[22px] bg-gradient-to-r from-[#D98E52] via-[#E8A56A] to-[#C97C3E] border-t-2 border-[#FBD8B3] shadow-md relative flex items-center justify-between px-7">
                
                {/* Laptop */}
                <div className="w-34 h-22 rounded-t-xl bg-slate-200 border-2 border-slate-400 shadow-md relative flex flex-col items-center justify-center -mt-10">
                  <div className="w-30 h-16 rounded-lg bg-slate-900 border border-slate-700 flex flex-col items-center justify-center text-teal-400 font-mono text-[9px] font-bold">
                    <span>PAYOUT SETTLED</span>
                    <span className="text-white text-[10px] mt-0.5">₹4,735.54</span>
                  </div>
                  <div className="w-38 h-2.5 bg-slate-300 rounded-b-md shadow-xs absolute -bottom-1" />
                </div>

                {/* ─── PAYTM SOUNDBOX (ORIGINAL SIMPLE BLUE + QR ADDED) ─── */}
                <div className="flex items-end gap-3.5 -mt-3">
                  <div className="w-12 h-14 rounded-xl bg-[#00BAF2] border-2 border-white shadow-md flex flex-col items-center justify-between p-1">
                    <div className="w-8 h-6 rounded bg-[#002970] flex items-center justify-center">
                      <Radio className="w-4 h-4 text-white animate-pulse" />
                    </div>
                    <div className="flex items-center justify-between w-full px-0.5">
                      <span className="text-[7px] font-black text-white uppercase tracking-tighter">PAYTM</span>
                      <QrCode className="w-3 h-3 text-white/90" />
                    </div>
                  </div>

                  {/* Coffee Mug */}
                  <div className="w-8 h-9 rounded-b-lg rounded-t-sm bg-indigo-600 shadow-md relative flex items-center justify-center">
                    <div className="absolute -top-3 w-3 h-3 border-r-2 border-white/60 rounded-full animate-bounce" />
                    <div className="w-3 h-4 rounded-r-md border-2 border-indigo-600 absolute -right-3" />
                  </div>
                </div>

              </div>

              {/* Desk Front Apron */}
              <div className="w-92 h-14 rounded-b-[18px] bg-gradient-to-r from-[#8C4F22] via-[#A05C29] to-[#7B4118] border-b-4 border-[#5C2E0E] shadow-2xl relative">
                <div className="absolute top-10 left-8 flex flex-col items-center">
                  <div className="w-3 h-20 bg-white shadow-md border-r border-slate-300" />
                  <div className="w-3.5 h-2 bg-slate-800 rounded-b-md" />
                </div>
                <div className="absolute top-10 right-8 flex flex-col items-center">
                  <div className="w-3 h-20 bg-white shadow-md border-r border-slate-300" />
                  <div className="w-3.5 h-2 bg-slate-800 rounded-b-md" />
                </div>
              </div>

              <div className="w-84 h-6 bg-black/40 blur-md rounded-full -mt-2 pointer-events-none" />
            </div>

            {/* Snake Plant */}
            <div className="absolute -right-8 bottom-4 flex flex-col items-center z-15">
              <div className="flex gap-0.5 items-end">
                <div className="w-3 h-22 rounded-t-full bg-emerald-600 shadow-sm" />
                <div className="w-3.5 h-28 rounded-t-full bg-emerald-500 shadow-sm" />
                <div className="w-3 h-18 rounded-t-full bg-emerald-700 shadow-sm" />
              </div>
              <div className="w-13 h-11 bg-slate-200 rounded-b-xl border-t-2 border-slate-300 shadow-md" />
            </div>

          </div>

          {/* ─── BOTTOM TRUST BAR ─── */}
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

        {/* ═══ RIGHT SIDE: AUTH CARD (FIXED SIZE, EQUAL PADDING TOP & BOTTOM) ═══ */}
        <section className="col-span-1 lg:col-span-5 h-full p-4 sm:p-6 lg:p-8 flex items-center justify-center z-20">
          
          <div className="w-full max-w-[430px] h-[670px] max-h-[94vh] bg-white rounded-[36px] shadow-[0_25px_60px_-15px_rgba(20,50,30,0.35)] border border-white/80 overflow-hidden relative flex flex-col text-slate-900">
            
            {/* Inner scroll container — equal py-7 top & bottom */}
            <div className="w-full h-full py-7 px-6 sm:px-7 flex flex-col gap-4 overflow-y-auto thin-scroll">
              
              {/* ─── CARD HEADER (FIXED AT TOP) ─── */}
              <div className="shrink-0 space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#84CC16] flex items-center justify-center text-white font-bold text-xs shadow-xs">
                    <Sparkles className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <span className="font-['Outfit',sans-serif] font-black text-xl text-slate-900 tracking-tight">
                    Sulajh<span className="text-[#84CC16]">.AI</span>
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight text-center leading-snug">
                  {authMode === 'signin' ? (portalRole === 'merchant' ? 'Welcome back' : 'Staff Sign in') : 'Create account'}
                </h1>
                
                <p className="text-xs text-slate-500 text-center font-medium">
                  {authMode === 'signin' 
                    ? (portalRole === 'merchant' ? 'Access your settlement ledger & AI teammate' : 'Paytm Ops & Risk Management Console')
                    : 'Start autonomous settlement operations for your store'}
                </p>

                {authMode === 'signin' ? (
                  <div className="flex items-center justify-center gap-1 bg-slate-100 p-1 rounded-xl max-w-[260px] mx-auto">
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
                  <div className="py-1.5 px-3 bg-emerald-50 border border-emerald-200/60 rounded-xl text-center">
                    <span className="text-[11px] font-semibold text-emerald-800">
                      Merchant Onboarding Desk · Staff accounts are admin-provisioned
                    </span>
                  </div>
                )}

                {authMode === 'signin' && portalRole === 'merchant' && (
                  <div className="flex justify-center gap-4 text-xs font-semibold">
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

              {/* Error */}
              {error && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2 shrink-0">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
                  <span className="leading-tight font-medium">{error}</span>
                </div>
              )}

              {/* ─── FORM ZONE (AUTO-CENTERED IN AVAILABLE SPACE) ─── */}
              <div className="flex-1 flex flex-col justify-center">
                
                {/* Sign-in: Email & Password */}
                {authMode === 'signin' && (portalRole === 'staff' || loginMethod === 'password') && (
                  <form onSubmit={handleEmailPasswordLogin} className="space-y-3">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email address"
                      required
                      className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#84CC16]/30 focus:border-[#84CC16] transition"
                    />
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
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 sm:py-3.5 rounded-2xl bg-[#84CC16] hover:bg-[#74B513] active:bg-[#65A30D] text-white text-sm font-bold tracking-wide shadow-md shadow-[#84CC16]/25 hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      ) : (
                        <span>Sign in</span>
                      )}
                    </button>
                  </form>
                )}

                {/* Sign-in: Mobile OTP */}
                {authMode === 'signin' && portalRole === 'merchant' && loginMethod === 'otp' && (
                  <form onSubmit={!otpSent ? handleRequestOtp : handleVerifyOtp} className="space-y-3">
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
                    {otpSent && (
                      <input
                        type="text"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="6-Digit OTP (Demo: 123456)"
                        required
                        className="w-full px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#84CC16]/30 focus:border-[#84CC16] transition text-center tracking-widest font-mono font-bold"
                      />
                    )}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 sm:py-3.5 rounded-2xl bg-[#84CC16] hover:bg-[#74B513] text-white text-sm font-bold tracking-wide shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      ) : (
                        <span>{!otpSent ? 'Send OTP code' : 'Verify & Sign in'}</span>
                      )}
                    </button>
                  </form>
                )}

                {/* Sign-up: Merchant Only */}
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
                      className="w-full py-3 rounded-2xl bg-[#84CC16] hover:bg-[#74B513] text-white text-xs font-bold tracking-wide shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {loading ? (
                        <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      ) : (
                        <span>Create account</span>
                      )}
                    </button>
                  </form>
                )}

                {/* Staff 2FA */}
                {requires2FA && (
                  <form onSubmit={handleVerify2FA} className="space-y-3">
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
                      className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold tracking-wide shadow-md transition cursor-pointer"
                    >
                      Verify & Enter Console
                    </button>
                  </form>
                )}

              </div>

              {/* ─── CARD FOOTER (FIXED AT BOTTOM) ─── */}
              <div className="shrink-0 space-y-2">
                <div className="relative flex items-center justify-center">
                  <div className="border-t border-slate-200 w-full" />
                  <span className="bg-white px-3 text-[10px] uppercase font-bold text-slate-400 shrink-0 tracking-wider">
                    or 1-click instant demo
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
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

                <p className="text-[10px] text-slate-400 text-center leading-relaxed">
                  By continuing, you agree to Sulajh AI's{' '}
                  <span className="font-semibold text-slate-600">Terms</span> &{' '}
                  <span className="font-semibold text-slate-600">Privacy Policy</span>.
                </p>

                <div className="text-center pt-1.5 border-t border-slate-100">
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
