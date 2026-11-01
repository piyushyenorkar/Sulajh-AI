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
  CheckCircle2,
  Store,
  UserCheck,
  Zap,
  Receipt,
  Building2,
  User
} from 'lucide-react';
import { api } from '../lib/api';
import { PaytmLogo } from '../components/PaytmLogo';

export default function Login() {
  const navigate = useNavigate();

  // Primary view tabs: 'signin' vs 'signup'
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  // Sign In Portal role: 'merchant' vs 'staff'
  const [portalRole, setPortalRole] = useState<'merchant' | 'staff'>('merchant');

  // Login method for merchants: 'password' (standard) vs 'otp'
  const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('password');

  // Sign up method for merchants: 'mobile' (quick phone onboarding) vs 'standard' (full email onboarding)
  const [signupMethod, setSignupMethod] = useState<'mobile' | 'standard'>('mobile');

  // Form states
  const [email, setEmail] = useState('piyushyenorkar1@gmail.com');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState('7498735223');
  const [otp, setOtp] = useState('123456');
  const [otpSent, setOtpSent] = useState(false);

  // Sign up states
  const [signupName, setSignupName] = useState('');
  const [signupBusiness, setSignupBusiness] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupCategory, setSignupCategory] = useState('Grocery / Kirana');

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
  const handleQuickDemoLogin = async (persona: 'merchant' | 'l1_ops' | 'ops_manager' | 'admin') => {
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
      } else if (persona === 'l1_ops') {
        const res = await api.login('vikram.ops@paytm.com', 'password123');
        if (res.ok) {
          navigate('/ops');
        } else {
          setError(res.error?.message || 'L1 Ops Agent login failed');
        }
      } else if (persona === 'ops_manager') {
        const res = await api.login('neha.manager@paytm.com', 'password123');
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
          setError(res.error?.message || 'Ops Manager login failed');
        }
      } else if (persona === 'admin') {
        const res = await api.login('piyush.admin@paytm.com', 'password123');
        if (res.ok && res.requires2FA) {
          const faRes = await api.verifyStaff2FA(res.userId, '654321');
          if (faRes.ok) {
            navigate('/admin');
          } else {
            setError(faRes.error?.message || '2FA verification failed');
          }
        } else if (res.ok) {
          navigate('/admin');
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

  // ─── HANDLERS ─────────────────────────────────────────────────────────────

  // 1. Standard Email + Password Sign In (Merchant or Staff)
  const handleEmailPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.login(email, password);
      if (res.ok) {
        if (res.requires2FA) {
          setRequires2FA(true);
          setPendingUserId(res.userId);
        } else {
          if (res.user?.role === 'merchant') {
            navigate('/dashboard');
          } else {
            navigate('/ops');
          }
        }
      } else {
        setError(res.error?.message || 'Invalid credentials. Please verify your email and password.');
      }
    } catch {
      setError('Unable to reach authentication gateway. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Sign Up (Create New Merchant)
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.signup({
        name: signupName,
        businessName: signupBusiness,
        email: signupEmail,
        password: signupPassword,
        phone: signupPhone,
        category: signupCategory,
      });

      if (res.ok) {
        navigate('/dashboard');
      } else {
        setError(res.error?.message || 'Account registration failed.');
      }
    } catch {
      setError('Registration server unreachable. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Mobile OTP Request
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.requestOtp(phone);
      if (res.ok) {
        setOtpSent(true);
      } else {
        setError(res.error?.message || 'Unable to dispatch verification code.');
      }
    } catch {
      setError('Network communication error.');
    } finally {
      setLoading(false);
    }
  };

  // 4. Mobile OTP Verification
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.verifyOtp(phone, otp);
      if (res.ok) {
        navigate('/dashboard');
      } else {
        setError(res.error?.message || 'Invalid or expired OTP code.');
      }
    } catch {
      setError('Verification service unavailable.');
    } finally {
      setLoading(false);
    }
  };

  // 5. Staff 2FA Verification
  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.verifyStaff2FA(pendingUserId, twoFactorCode);
      if (res.ok) {
        if (res.user?.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/ops');
        }
      } else {
        setError(res.error?.message || 'Invalid two-factor authentication code.');
      }
    } catch {
      setError('2FA verification service error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen lg:h-screen w-full bg-[#FAFAFC] relative flex items-center justify-center p-3 sm:p-6 lg:px-8 lg:py-3 font-sans selection:bg-[#14B8A6]/20 selection:text-[#0F766E] overflow-x-hidden lg:overflow-hidden">
      
      {/* ─── Ambient Spatial Lighting in Brand Teal (#14B8A6) ─── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Soft Teal Ambient Glow (Top Left) */}
        <div className="absolute -top-40 -left-40 w-[640px] h-[640px] bg-[#14B8A6]/[0.07] rounded-full blur-[140px]" />
        
        {/* Soft Cyan Ambient Glow (Bottom Right) */}
        <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-[#0D9488]/[0.06] rounded-full blur-[150px]" />
        
        {/* Micro-dot spatial matrix */}
        <div 
          className="absolute inset-0 opacity-[0.025]" 
          style={{ backgroundImage: 'radial-gradient(#0F766E 1px, transparent 1px)', backgroundSize: '32px 32px' }} 
        />
      </div>

      <div className="relative w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 xl:gap-12 items-center">
        
        {/* ─── LEFT COLUMN: CONCISE ENTERPRISE HIGHLIGHTS (UNCHANGED CONTENT & TEXT SIZE, ADJUSTED PADDING) ─── */}
        <div className="lg:col-span-6 xl:col-span-7 flex flex-col justify-center space-y-4 lg:space-y-4.5 text-slate-800 py-1 lg:py-0">
          
          {/* Header Brand Bar */}
          <div className="flex items-center gap-3">
            <div className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200/80 flex items-center gap-2.5 shadow-sm">
              <PaytmLogo className="h-6 w-auto" />
              <div className="h-4 w-px bg-slate-200" />
              <span className="text-xs font-bold tracking-wider text-[#002970] uppercase">for business</span>
            </div>
            
            <div className="px-3 py-1 rounded-full bg-teal-50 border border-teal-200/70 text-[#0D9488] text-xs font-semibold flex items-center gap-1.5 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#14B8A6] animate-pulse" />
              <span>Autonomous Operations</span>
            </div>
          </div>

          {/* Punchy Headline & Short Subtitle */}
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl xl:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
              Sulajh<span className="text-[#14B8A6]">.AI</span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 font-medium leading-relaxed max-w-xl">
              Instant settlement diagnostics & automated dispute operations for Paytm merchants.
            </p>
          </div>

          {/* 3 Crisp Enterprise Capability Cards in a Single Row (Centered Content) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-0.5">
            
            {/* Box 1: Instant Clearing Diagnostics */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-teal-300 hover:shadow-md transition-all duration-200 flex flex-col items-center text-center group">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#14B8A6] to-[#0D9488] text-white flex items-center justify-center shadow-sm shadow-teal-500/25 ring-4 ring-teal-50 group-hover:scale-105 transition-transform shrink-0">
                <Zap className="w-5 h-5 stroke-[2.2]" />
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 mt-3 leading-snug tracking-tight text-center">
                Instant Clearing Diagnostics
              </h4>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-1 leading-relaxed text-center">
                Real-time root-cause analysis for IFSC mergers, bank holdbacks, and automatic settlement retries.
              </p>
            </div>

            {/* Box 2: Deduction Reconciliation */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-teal-300 hover:shadow-md transition-all duration-200 flex flex-col items-center text-center group">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#14B8A6] to-[#0D9488] text-white flex items-center justify-center shadow-sm shadow-teal-500/25 ring-4 ring-teal-50 group-hover:scale-105 transition-transform shrink-0">
                <Receipt className="w-5 h-5 stroke-[2.2]" />
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 mt-3 leading-snug tracking-tight text-center">
                Deduction Reconciliation
              </h4>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-1 leading-relaxed text-center">
                Line-by-line itemization for MDR rates, 18% GST splits, and Soundbox rentals to eliminate discrepancy doubts.
              </p>
            </div>

            {/* Box 3: Statutory SLA Defense */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-teal-300 hover:shadow-md transition-all duration-200 flex flex-col items-center text-center group">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#14B8A6] to-[#0D9488] text-white flex items-center justify-center shadow-sm shadow-teal-500/25 ring-4 ring-teal-50 group-hover:scale-105 transition-transform shrink-0">
                <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 mt-3 leading-snug tracking-tight text-center">
                Statutory SLA Defense
              </h4>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-1 leading-relaxed text-center">
                NPCI chargeback deadline tracking and autonomous evidence compilation to secure merchant revenue.
              </p>
            </div>

          </div>

          {/* Trust & Compliance Footer */}
          <div className="pt-0.5 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#14B8A6]" />
              <span>RBI Grievance Redressal Compliant</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-[#14B8A6]" />
              <span>256-Bit Bank Encryption</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-[#14B8A6]" />
              <span>10,000+ Active Outlets</span>
            </span>
          </div>

        </div>

        {/* ─── RIGHT COLUMN: BALANCED, COMFORTABLE AUTH CONSOLE ─── */}
        <div className="lg:col-span-6 xl:col-span-5 flex justify-center">
          <div className="w-full max-w-[430px] rounded-3xl bg-white border border-slate-200/90 shadow-[0_20px_50px_-12px_rgba(20,184,166,0.12),0_4px_16px_rgba(0,0,0,0.03)] p-6 sm:p-7 flex flex-col relative transition-all duration-300">
            
            {/* Top Navigation Bar: Tabs + Role Switch */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4 sm:mb-5">
              
              {/* Sign In vs Create Account Pill Selector */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signin');
                    setError(null);
                  }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    authMode === 'signin'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signup');
                    setError(null);
                  }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    authMode === 'signup'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Create Account
                </button>
              </div>

              {/* Merchant vs Paytm Staff Role */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setPortalRole('merchant');
                    setEmail('ramesh@kirana.in');
                    setPassword('Password123!');
                    setError(null);
                  }}
                  title="Merchant Desk"
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                    portalRole === 'merchant'
                      ? 'bg-teal-50 text-[#0D9488] font-bold'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <Store className="w-3.5 h-3.5 text-[#14B8A6]" />
                  <span>Merchant</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPortalRole('staff');
                    setEmail('vikram.ops@paytm.com');
                    setPassword('password123');
                    setError(null);
                  }}
                  title="Paytm Ops & Risk Staff"
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                    portalRole === 'staff'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Staff</span>
                </button>
              </div>

            </div>

            {/* ─── QUICK DEMO PERSONA SWITCHER (JUDGES & 1-CLICK ACCESS) ─── */}
            <div className="mb-3.5 p-2.5 rounded-2xl bg-slate-50 border border-slate-200/90 shadow-2xs">
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>1-Click Role Access (Judges Demo)</span>
                </span>
                <span className="text-[10px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full font-bold">Instant Login</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  disabled={Boolean(quickLoading)}
                  onClick={() => handleQuickDemoLogin('merchant')}
                  className="p-2 rounded-xl bg-white border border-slate-200/90 hover:border-teal-400 hover:bg-teal-50/50 text-left transition flex flex-col justify-between group shadow-2xs cursor-pointer"
                  title="Login as Ramesh Kumar (Kirana Owner)"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-bold text-slate-900 group-hover:text-[#0F766E] flex items-center gap-1">
                      <Store className="w-3 h-3 text-[#14B8A6]" /> Kirana Merchant
                    </span>
                    {quickLoading === 'merchant' && <div className="w-3 h-3 border border-teal-500 border-t-transparent rounded-full animate-spin" />}
                  </div>
                  <span className="text-[10px] text-slate-500 mt-0.5 truncate">Piyush · ₹4,735 Pending</span>
                </button>

                <button
                  type="button"
                  disabled={Boolean(quickLoading)}
                  onClick={() => handleQuickDemoLogin('l1_ops')}
                  className="p-2 rounded-xl bg-white border border-slate-200/90 hover:border-blue-400 hover:bg-blue-50/50 text-left transition flex flex-col justify-between group shadow-2xs cursor-pointer"
                  title="Login as Vikram Singh (Paytm Care Frontline Agent)"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-bold text-slate-900 group-hover:text-blue-700 flex items-center gap-1">
                      <UserCheck className="w-3 h-3 text-blue-500" /> L1 Ops Agent
                    </span>
                    {quickLoading === 'l1_ops' && <div className="w-3 h-3 border border-blue-500 border-t-transparent rounded-full animate-spin" />}
                  </div>
                  <span className="text-[10px] text-slate-500 mt-0.5 truncate">Vikram · 300 Tickets · ₹25k</span>
                </button>

                <button
                  type="button"
                  disabled={Boolean(quickLoading)}
                  onClick={() => handleQuickDemoLogin('ops_manager')}
                  className="p-2 rounded-xl bg-white border border-slate-200/90 hover:border-violet-400 hover:bg-violet-50/50 text-left transition flex flex-col justify-between group shadow-2xs cursor-pointer"
                  title="Login as Neha Gupta (Tier-2 Manager with 4-Eye Approval & 2FA)"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-bold text-slate-900 group-hover:text-violet-700 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-violet-500" /> Ops Manager
                    </span>
                    {quickLoading === 'ops_manager' && <div className="w-3 h-3 border border-violet-500 border-t-transparent rounded-full animate-spin" />}
                  </div>
                  <span className="text-[10px] text-slate-500 mt-0.5 truncate">Neha · 4-Eye Approval (2FA)</span>
                </button>

                <button
                  type="button"
                  disabled={Boolean(quickLoading)}
                  onClick={() => handleQuickDemoLogin('admin')}
                  className="p-2 rounded-xl bg-white border border-slate-200/90 hover:border-slate-400 hover:bg-slate-100/70 text-left transition flex flex-col justify-between group shadow-2xs cursor-pointer"
                  title="Login as Piyush Admin (Global Policy Thresholds & Audit Stream)"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-bold text-slate-900 group-hover:text-slate-950 flex items-center gap-1">
                      <Lock className="w-3 h-3 text-slate-700" /> System Admin
                    </span>
                    {quickLoading === 'admin' && <div className="w-3 h-3 border border-slate-700 border-t-transparent rounded-full animate-spin" />}
                  </div>
                  <span className="text-[10px] text-slate-500 mt-0.5 truncate">Piyush · Guardrails & Risk</span>
                </button>
              </div>
            </div>

            {/* Error Notification Alert */}
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2 animate-slide-down">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
                <span className="leading-tight font-medium">{error}</span>
              </div>
            )}

            {/* ─── FORM CONTAINER (NATURAL, PROPORTIONAL SPACING) ─── */}
            <div className="flex flex-col justify-between">
              
              {/* VIEW 1: SIGN IN (MERCHANT OR STAFF) */}
              {authMode === 'signin' && !requires2FA && (
                <div className="space-y-3.5 sm:space-y-4">
                  
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                      {portalRole === 'merchant' ? 'Sign In to Merchant Hub' : 'Paytm Operations Console'}
                    </h3>
                    <p className="text-sm text-slate-500 mt-0.5">
                      {portalRole === 'merchant' 
                        ? 'Enter your registered credentials to access your store' 
                        : 'Access with authorized Paytm internal credentials'}
                    </p>
                  </div>

                  {/* Merchant Dual Sign In Method: Email & Password vs Mobile OTP */}
                  {portalRole === 'merchant' && (
                    <div className="flex items-center p-1 bg-slate-100 rounded-xl">
                      <button
                        type="button"
                        onClick={() => { setLoginMethod('password'); setError(null); }}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          loginMethod === 'password'
                            ? 'bg-white text-slate-900 shadow-xs'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        <Mail className="w-3.5 h-3.5 text-[#14B8A6]" />
                        <span>Email & Password</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => { setLoginMethod('otp'); setError(null); }}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          loginMethod === 'otp'
                            ? 'bg-white text-slate-900 shadow-xs'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        <Phone className="w-3.5 h-3.5 text-[#14B8A6]" />
                        <span>Mobile OTP</span>
                      </button>
                    </div>
                  )}

                  {/* Standard Password Login Form */}
                  {(portalRole === 'staff' || loginMethod === 'password') && (
                    <form onSubmit={handleEmailPasswordLogin} className="space-y-3 sm:space-y-3.5">
                      
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                          {portalRole === 'merchant' ? 'Business Email or ID' : 'Paytm Corporate Email'}
                        </label>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            name="email"
                            autoComplete="username"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder={portalRole === 'merchant' ? 'ramesh@kirana.in' : 'priya.nair@paytm.com'}
                            required
                            className="w-full pl-10 pr-4 py-2.5 sm:py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/25 focus:border-[#14B8A6] transition"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="block text-sm font-semibold text-slate-700">Password</label>
                          <a 
                            href="#forgot" 
                            onClick={(e) => { e.preventDefault(); setError('Contact merchant support to reset your password.'); }} 
                            className="text-xs text-[#0D9488] hover:text-[#0F766E] hover:underline font-semibold"
                          >
                            Forgot?
                          </a>
                        </div>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            className="w-full pl-10 pr-11 py-2.5 sm:py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/25 focus:border-[#14B8A6] transition"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-0.5">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="w-4 h-4 rounded text-[#14B8A6] focus:ring-[#14B8A6] border-slate-300 accent-[#14B8A6]"
                          />
                          <span className="text-sm text-slate-600">Remember on this device</span>
                        </label>
                      </div>

                      {/* Primary Action Button (Brand Teal #14B8A6) */}
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 px-4 rounded-xl bg-[#14B8A6] hover:bg-[#0D9488] active:bg-[#0F766E] text-white text-sm font-bold tracking-wide shadow-md shadow-teal-500/20 hover:shadow-lg hover:shadow-teal-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer mt-2"
                      >
                        {loading ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            <span>{portalRole === 'merchant' ? 'Sign In to Merchant Hub' : 'Enter Ops Console'}</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>

                      {/* Switch to OTP Login Option for Merchants */}
                      {portalRole === 'merchant' && (
                        <div className="text-center pt-2">
                          <button
                            type="button"
                            onClick={() => { setLoginMethod('otp'); setError(null); }}
                            className="text-xs font-semibold text-[#0D9488] hover:text-[#0F766E] hover:underline cursor-pointer"
                          >
                            Prefer SMS OTP? Sign in via mobile code
                          </button>
                        </div>
                      )}

                    </form>
                  )}

                  {/* Merchant Mobile OTP Form */}
                  {portalRole === 'merchant' && loginMethod === 'otp' && (
                    <div className="space-y-4">
                      {!otpSent ? (
                        <form onSubmit={handleRequestOtp} className="space-y-4">
                          <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                              Registered Mobile Number
                            </label>
                            <div className="relative">
                              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">+91</span>
                              <input
                                type="tel"
                                maxLength={10}
                                value={phone}
                                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                                placeholder="9876543210"
                                required
                                className="w-full pl-12 pr-4 py-2.5 sm:py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/25 focus:border-[#14B8A6] transition"
                              />
                            </div>
                          </div>

                          <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 px-4 rounded-xl bg-[#14B8A6] hover:bg-[#0D9488] active:bg-[#0F766E] text-white text-sm font-bold tracking-wide shadow-md shadow-teal-500/20 hover:shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                          >
                            {loading ? (
                              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                              <>
                                <span>Send Verification Code</span>
                                <ArrowRight className="w-4 h-4" />
                              </>
                            )}
                          </button>

                          <div className="text-center pt-1">
                            <button
                              type="button"
                              onClick={() => { setLoginMethod('password'); setError(null); }}
                              className="text-xs font-semibold text-[#0D9488] hover:text-[#0F766E] hover:underline cursor-pointer"
                            >
                              Back to email & password sign-in
                            </button>
                          </div>
                        </form>
                      ) : (
                        <form onSubmit={handleVerifyOtp} className="space-y-4">
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <label className="block text-sm font-semibold text-slate-700">Enter 6-Digit OTP</label>
                              <button
                                type="button"
                                onClick={() => setOtpSent(false)}
                                className="text-xs text-[#0D9488] hover:underline font-semibold cursor-pointer"
                              >
                                Change Number
                              </button>
                            </div>
                            <input
                              type="text"
                              maxLength={6}
                              value={otp}
                              onChange={(e) => setOtp(e.target.value)}
                              placeholder="123456"
                              required
                              className="w-full px-4 py-3 text-center text-lg font-mono tracking-widest bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/25 focus:border-[#14B8A6] transition"
                            />
                            <p className="text-xs text-slate-400 mt-1.5 text-center">Verification code dispatched to +91 {phone}</p>
                          </div>

                          <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 px-4 rounded-xl bg-[#14B8A6] hover:bg-[#0D9488] active:bg-[#0F766E] text-white text-sm font-bold tracking-wide shadow-md shadow-teal-500/20 hover:shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                          >
                            {loading ? (
                              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                              <>
                                <span>Verify & Access Hub</span>
                                <ArrowRight className="w-4 h-4" />
                              </>
                            )}
                          </button>

                          <div className="text-center pt-1">
                            <button
                              type="button"
                              onClick={() => { setLoginMethod('password'); setError(null); }}
                              className="text-xs font-semibold text-[#0D9488] hover:text-[#0F766E] hover:underline cursor-pointer"
                            >
                              Back to email & password sign-in
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  )}

                </div>
              )}

              {/* VIEW 2: CREATE NEW MERCHANT ACCOUNT (SIGN UP) */}
              {authMode === 'signup' && (
                <form onSubmit={handleSignup} className="space-y-3.5">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 tracking-tight">Create Merchant Account</h3>
                    <p className="text-sm text-slate-500 mt-0.5">Register your business for Sulajh AI operations</p>
                  </div>

                  {/* Sign Up Dual Mode: Quick Mobile Signup vs Full Email Registration */}
                  <div className="flex items-center p-1 bg-slate-100 rounded-xl">
                    <button
                      type="button"
                      onClick={() => { setSignupMethod('mobile'); setError(null); }}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        signupMethod === 'mobile'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <Phone className="w-3.5 h-3.5 text-[#14B8A6]" />
                      <span>Quick Mobile Sign Up</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => { setSignupMethod('standard'); setError(null); }}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        signupMethod === 'standard'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <Mail className="w-3.5 h-3.5 text-[#14B8A6]" />
                      <span>Email Registration</span>
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Owner Full Name</label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={signupName}
                          onChange={(e) => setSignupName(e.target.value)}
                          placeholder="Ramesh Kumar"
                          required
                          className="w-full pl-10 pr-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/25 focus:border-[#14B8A6] transition"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Store / Business Name</label>
                      <div className="relative">
                        <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={signupBusiness}
                          onChange={(e) => setSignupBusiness(e.target.value)}
                          placeholder="Ramesh Kirana & General Store"
                          required
                          className="w-full pl-10 pr-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/25 focus:border-[#14B8A6] transition"
                        />
                      </div>
                    </div>

                    {/* Conditional Fields based on signupMethod */}
                    {signupMethod === 'mobile' ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Registered Mobile</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">+91</span>
                            <input
                              type="tel"
                              maxLength={10}
                              value={signupPhone}
                              onChange={(e) => setSignupPhone(e.target.value.replace(/\D/g, ''))}
                              placeholder="9876543210"
                              required
                              className="w-full pl-10 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/25 focus:border-[#14B8A6] transition"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                          <select
                            value={signupCategory}
                            onChange={(e) => setSignupCategory(e.target.value)}
                            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/25 focus:border-[#14B8A6] transition"
                          >
                            <option value="Grocery / Kirana">Grocery / Kirana</option>
                            <option value="Retail / Apparel">Retail / Apparel</option>
                            <option value="Food & Beverage">Food & Beverage</option>
                            <option value="Electronics & Mobile">Electronics</option>
                            <option value="Pharmacy / Healthcare">Pharmacy</option>
                            <option value="Services">Services</option>
                          </select>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Business Email</label>
                            <input
                              type="email"
                              value={signupEmail}
                              onChange={(e) => setSignupEmail(e.target.value)}
                              placeholder="ramesh@kirana.in"
                              required
                              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/25 focus:border-[#14B8A6] transition"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Number</label>
                            <input
                              type="tel"
                              maxLength={10}
                              value={signupPhone}
                              onChange={(e) => setSignupPhone(e.target.value.replace(/\D/g, ''))}
                              placeholder="9876543210"
                              required
                              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/25 focus:border-[#14B8A6] transition"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                            <select
                              value={signupCategory}
                              onChange={(e) => setSignupCategory(e.target.value)}
                              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/25 focus:border-[#14B8A6] transition"
                            >
                              <option value="Grocery / Kirana">Grocery / Kirana</option>
                              <option value="Retail / Apparel">Retail / Apparel</option>
                              <option value="Food & Beverage">Food & Beverage</option>
                              <option value="Electronics & Mobile">Electronics</option>
                              <option value="Pharmacy / Healthcare">Pharmacy</option>
                              <option value="Services">Services</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                            <input
                              type="password"
                              value={signupPassword}
                              onChange={(e) => setSignupPassword(e.target.value)}
                              placeholder="••••••••"
                              required
                              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/25 focus:border-[#14B8A6] transition"
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 sm:py-3 px-4 rounded-xl bg-[#14B8A6] hover:bg-[#0D9488] active:bg-[#0F766E] text-white text-sm font-bold tracking-wide shadow-md shadow-teal-500/20 hover:shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer mt-1"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>{signupMethod === 'mobile' ? 'Register via Mobile Number' : 'Register Merchant Account'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* VIEW 3: STAFF 2FA VERIFICATION */}
              {requires2FA && (
                <form onSubmit={handleVerify2FA} className="space-y-5">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 tracking-tight">Security 2FA Verification</h3>
                    <p className="text-sm text-slate-500 mt-1">Enter the 6-digit authenticator code from your staff token</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Time-based Token (TOTP)</label>
                    <input
                      type="text"
                      maxLength={6}
                      value={twoFactorCode}
                      onChange={(e) => setTwoFactorCode(e.target.value)}
                      placeholder="654321"
                      required
                      className="w-full px-4 py-3 text-center text-lg font-mono tracking-widest bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/25 focus:border-[#14B8A6] transition"
                    />
                    <p className="text-xs text-slate-400 mt-1.5 text-center">Authorized internal staff 2FA security gateway</p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => { setRequires2FA(false); setPendingUserId(''); }}
                      className="flex-1 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold transition cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-3 px-4 rounded-xl bg-[#14B8A6] hover:bg-[#0D9488] active:bg-[#0F766E] text-white text-sm font-bold transition flex items-center justify-center gap-1.5 disabled:opacity-60 cursor-pointer shadow-md shadow-teal-500/20"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <span>Verify & Enter</span>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* CARD FOOTER */}
              <div className="pt-3 mt-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-medium">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#14B8A6]" />
                  <span>256-Bit SSL Protected</span>
                </span>
                <span>Paytm Enterprise Identity</span>
              </div>

              {/* DEMO CREDENTIALS QUICK REFERENCE */}
              <div className="mt-2.5 pt-2 border-t border-slate-100/80 text-[11px] text-slate-500 space-y-1 bg-slate-50/70 p-2.5 rounded-xl border border-slate-200/60">
                <div className="flex items-center justify-between font-bold text-slate-700 text-[10px] uppercase tracking-wider mb-0.5">
                  <span>Demo Credentials Sheet</span>
                  <span className="text-teal-600 font-semibold lowercase">tap persona chip above for 1-click</span>
                </div>
                <div className="grid grid-cols-1 gap-1 text-[11px] font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 font-sans">L1 Ops:</span>
                    <span className="text-slate-900 font-bold">vikram.ops@paytm.com / password123</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 font-sans">Ops Mgr:</span>
                    <span className="text-slate-900 font-bold">neha.manager@paytm.com (2FA: 654321)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 font-sans">Admin:</span>
                    <span className="text-slate-900 font-bold">piyush.admin@paytm.com (2FA: 654321)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 font-sans">Merchant:</span>
                    <span className="text-slate-900 font-bold">ramesh@kirana.in / Password123!</span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
