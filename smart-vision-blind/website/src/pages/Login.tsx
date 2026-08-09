import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth, type UserRole } from '../context/AuthContext';
import { Eye, EyeOff, LogIn, UserPlus, Shield, Mail, RotateCcw, CheckCircle } from 'lucide-react';

type FormMode = 'login' | 'register' | 'verify-otp';

const ROLES: { value: UserRole; label: string; desc: string }[] = [
  { value: 'BLIND_USER',  label: 'Smart Stick User',  desc: 'I use the Smart Vision stick' },
  { value: 'VOLUNTEER',   label: 'Volunteer',          desc: 'I assist users in real time' },
  { value: 'CAREGIVER',   label: 'Caregiver',          desc: 'I monitor a family member' },
  { value: 'ADMIN',       label: 'Administrator',      desc: 'System admin access' },
];

const OTP_LENGTH = 6;
const OTP_EXPIRE_SECONDS = 5 * 60; // 5 minutes

export const Login: React.FC = () => {
  const { login, register, verifyOtp, resendOtp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const [mode, setMode] = useState<FormMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('BLIND_USER');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // OTP State
  const [otpDigits, setOtpDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [otpTimer, setOtpTimer] = useState(OTP_EXPIRE_SECONDS);
  const [canResend, setCanResend] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── OTP Timer ──────────────────────────────────────────────────────────────
  const startTimer = useCallback(() => {
    setOtpTimer(OTP_EXPIRE_SECONDS);
    setCanResend(false);
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setOtpTimer(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // ── OTP Input Handlers ────────────────────────────────────────────────────
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // only digits

    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1); // take only last char
    setOtpDigits(newDigits);

    // Auto-advance to next input
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (pastedData.length === 0) return;

    const newDigits = [...otpDigits];
    for (let i = 0; i < pastedData.length; i++) {
      newDigits[i] = pastedData[i];
    }
    setOtpDigits(newDigits);

    // Focus the next empty or last input
    const nextIndex = Math.min(pastedData.length, OTP_LENGTH - 1);
    inputRefs.current[nextIndex]?.focus();
  };

  // ── Form Handlers ─────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
        navigate(from, { replace: true });
      } else if (mode === 'register') {
        const msg = await register(email, password, role);
        setSuccess(msg);
        setMode('verify-otp');
        startTimer();
        // Focus first OTP input after a tick
        setTimeout(() => inputRefs.current[0]?.focus(), 100);
      }
    } catch (err: any) {
      const errorDetail = err?.response?.data?.detail;
      if (errorDetail === 'Please verify your email before logging in.') {
        setMode('verify-otp');
        setError('Account unverified. Please enter your OTP or request a new one.');
        // Initialize timer to 0 so the "Resend" button is immediately available if they need a new code
        setOtpTimer(0);
        setCanResend(true);
        setTimeout(() => inputRefs.current[0]?.focus(), 100);
      } else {
        setError(errorDetail || 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const otp = otpDigits.join('');
    if (otp.length !== OTP_LENGTH) {
      setError('Please enter all 6 digits.');
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const msg = await verifyOtp(email, otp);
      setOtpVerified(true);
      setSuccess(msg);
      if (timerRef.current) clearInterval(timerRef.current);

      // Auto-switch to login after a short delay
      setTimeout(() => {
        setMode('login');
        setOtpVerified(false);
        setOtpDigits(Array(OTP_LENGTH).fill(''));
      }, 2500);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Invalid OTP. Please try again.');
      // Shake effect — clear and refocus
      setOtpDigits(Array(OTP_LENGTH).fill(''));
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const msg = await resendOtp(email);
      setSuccess(msg);
      setOtpDigits(Array(OTP_LENGTH).fill(''));
      startTimer();
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to resend OTP.');
    } finally {
      setLoading(false);
    }
  };

  // ── OTP Verification View ─────────────────────────────────────────────────
  if (mode === 'verify-otp') {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 pt-24 pb-16 font-sans relative overflow-hidden text-white">
        <div className="relative z-10 w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/10 mb-6 text-[#e8ff47]">
              {otpVerified ? <CheckCircle className="w-8 h-8 text-emerald-400" /> : <Mail className="w-8 h-8" />}
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight uppercase" style={{ fontFamily: 'var(--font-sans)' }}>
              {otpVerified ? (
                <span className="text-emerald-400">Verified!</span>
              ) : (
                <>Verify <span className="text-[#e8ff47]">Email</span></>
              )}
            </h1>
            <p className="text-gray-500 text-sm mt-2 uppercase tracking-widest">
              {otpVerified ? 'Redirecting to login...' : 'Enter the 6-digit code'}
            </p>
          </div>

          {/* Glass Card */}
          <div className="relative p-8 rounded-3xl overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
              border: otpVerified ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(255,255,255,0.08)',
              backdropFilter: 'blur(20px)',
            }}>
            
            {/* Subtle inner top glow */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            {/* Email indicator */}
            <div className="text-center mb-8">
              <p className="text-gray-400 text-sm">
                Code sent to
              </p>
              <p className="text-white font-bold text-sm mt-1 bg-white/5 inline-block px-4 py-1.5 rounded-full border border-white/10">
                {email}
              </p>
            </div>

            {/* OTP Input Boxes */}
            <form onSubmit={handleVerifyOtp}>
              <div className="flex justify-center gap-3 mb-6" onPaste={handleOtpPaste}>
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={el => { inputRefs.current[idx] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOtpChange(idx, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(idx, e)}
                    disabled={otpVerified}
                    className={`
                      w-12 h-14 text-center text-2xl font-black rounded-xl border
                      focus:outline-none transition-all duration-300
                      ${otpVerified
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                        : digit
                          ? 'bg-[#e8ff47]/10 border-[#e8ff47]/40 text-[#e8ff47]'
                          : 'bg-black/40 border-white/10 text-white'
                      }
                      focus:border-[#e8ff47]/60 focus:ring-1 focus:ring-[#e8ff47]/30
                      focus:shadow-[0_0_15px_rgba(232,255,71,0.15)]
                    `}
                    style={{ caretColor: '#e8ff47' }}
                  />
                ))}
              </div>

              {/* Timer */}
              {!otpVerified && (
                <div className="text-center mb-6">
                  {otpTimer > 0 ? (
                    <div className="flex items-center justify-center gap-2 text-sm">
                      <div className="w-2 h-2 rounded-full bg-[#e8ff47] animate-pulse" />
                      <span className="text-gray-400">Code expires in</span>
                      <span className="font-black text-[#e8ff47] tabular-nums">{formatTimer(otpTimer)}</span>
                    </div>
                  ) : (
                    <p className="text-red-400 text-sm font-bold uppercase tracking-wider">Code expired</p>
                  )}
                </div>
              )}

              {/* Error / Success messages */}
              {error   && <p className="text-red-400 text-xs tracking-wide bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-xl uppercase mb-4">{error}</p>}
              {success && <p className="text-[#e8ff47] text-xs tracking-wide bg-[#e8ff47]/10 border border-[#e8ff47]/20 px-4 py-3 rounded-xl uppercase mb-4">{success}</p>}

              {/* Verify Button */}
              {!otpVerified && (
                <button
                  type="submit"
                  disabled={loading || otpDigits.join('').length !== OTP_LENGTH}
                  className="w-full bg-[#e8ff47] hover:bg-white disabled:opacity-40 text-black font-black uppercase tracking-widest text-xs py-4 rounded-xl transition-all duration-500 hover:shadow-[0_0_30px_rgba(232,255,71,0.3)] flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <><CheckCircle className="w-4 h-4" /> Verify Code</>
                  )}
                </button>
              )}
            </form>

            {/* Resend / Back */}
            {!otpVerified && (
              <div className="mt-6 flex items-center justify-between">
                <button
                  onClick={() => {
                    setMode('register');
                    setOtpDigits(Array(OTP_LENGTH).fill(''));
                    setError('');
                    setSuccess('');
                    if (timerRef.current) clearInterval(timerRef.current);
                  }}
                  className="text-xs text-gray-500 hover:text-white transition-colors uppercase tracking-wider"
                >
                  ← Back
                </button>
                <button
                  onClick={handleResendOtp}
                  disabled={!canResend || loading}
                  className={`
                    flex items-center gap-2 text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-lg transition-all
                    ${canResend
                      ? 'text-[#e8ff47] bg-[#e8ff47]/10 border border-[#e8ff47]/20 hover:bg-[#e8ff47]/20 cursor-pointer'
                      : 'text-gray-600 cursor-not-allowed'
                    }
                  `}
                >
                  <RotateCcw className="w-3 h-3" /> Resend
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Login / Register View ─────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center px-6 pt-24 pb-16 font-sans relative overflow-hidden text-white">
      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/10 mb-6 text-[#e8ff47]">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight uppercase" style={{ fontFamily: 'var(--font-sans)' }}>
            System <span className="text-[#e8ff47]">Access</span>
          </h1>
          <p className="text-gray-500 text-sm mt-2 uppercase tracking-widest">Secure Portal</p>
        </div>

        {/* Glass Card */}
        <div className="relative p-8 rounded-3xl overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(20px)',
          }}>
          
          {/* Subtle inner top glow */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

          {/* Mode toggle */}
          <div className="flex bg-black/50 rounded-2xl p-1.5 mb-8 border border-white/5">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 ${mode === 'login' ? 'bg-[#e8ff47] text-black shadow-[0_0_15px_rgba(232,255,71,0.2)]' : 'text-gray-500 hover:text-white'}`}
            >
              <LogIn className="inline w-4 h-4 mr-2 -mt-0.5" /> Login
            </button>
            <button
              onClick={() => setMode('register')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 ${mode === 'register' ? 'bg-[#e8ff47] text-black shadow-[0_0_15px_rgba(232,255,71,0.2)]' : 'text-gray-500 hover:text-white'}`}
            >
              <UserPlus className="inline w-4 h-4 mr-2 -mt-0.5" /> Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-[0.2em]">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="operator@smartvision.ai"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-[#e8ff47]/50 focus:ring-1 focus:ring-[#e8ff47]/50 transition-all text-sm"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-[0.2em]">Access Code</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 pr-12 text-white placeholder-gray-600 focus:outline-none focus:border-[#e8ff47]/50 focus:ring-1 focus:ring-[#e8ff47]/50 transition-all text-sm tracking-widest"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Role selector (register only) */}
            {mode === 'register' && (
              <div className="pt-2">
                <label className="block text-[10px] font-bold text-gray-400 mb-3 uppercase tracking-[0.2em]">Access Level</label>
                <div className="grid grid-cols-2 gap-3">
                  {ROLES.map(r => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setRole(r.value)}
                      className={`text-left p-4 rounded-xl border transition-all duration-300 ${role === r.value ? 'border-[#e8ff47]/50 bg-[#e8ff47]/10 text-white shadow-[0_0_15px_rgba(232,255,71,0.05)]' : 'border-white/5 bg-black/20 text-gray-500 hover:border-white/20'}`}
                    >
                      <div className="font-bold text-xs uppercase tracking-wider mb-1" style={{ color: role === r.value ? '#e8ff47' : '' }}>
                        {r.label}
                      </div>
                      <div className="text-[10px] opacity-70 leading-relaxed font-sans">{r.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Error / Success messages */}
            {error   && <p className="text-red-400 text-xs tracking-wide bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-xl uppercase">{error}</p>}
            {success && <p className="text-[#e8ff47] text-xs tracking-wide bg-[#e8ff47]/10 border border-[#e8ff47]/20 px-4 py-3 rounded-xl uppercase">{success}</p>}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#e8ff47] hover:bg-white disabled:opacity-60 text-black font-black uppercase tracking-widest text-xs py-4.5 rounded-xl transition-all duration-500 hover:shadow-[0_0_30px_rgba(232,255,71,0.3)] flex items-center justify-center gap-3 mt-4"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : mode === 'login' ? (
                <><LogIn className="w-4 h-4" /> Authenticate</>
              ) : (
                <><UserPlus className="w-4 h-4" /> Initialize Account</>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

