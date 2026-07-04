import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth, type UserRole } from '../context/AuthContext';
import { Eye, EyeOff, LogIn, UserPlus, Shield } from 'lucide-react';

type FormMode = 'login' | 'register';

const ROLES: { value: UserRole; label: string; desc: string }[] = [
  { value: 'BLIND_USER',  label: 'Smart Stick User',  desc: 'I use the Smart Vision stick' },
  { value: 'VOLUNTEER',   label: 'Volunteer',          desc: 'I assist users in real time' },
  { value: 'CAREGIVER',   label: 'Caregiver',          desc: 'I monitor a family member' },
  { value: 'ADMIN',       label: 'Administrator',      desc: 'System admin access' },
];

export const Login: React.FC = () => {
  const { login, register } = useAuth();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
        navigate(from, { replace: true });
      } else {
        await register(email, password, role);
        setSuccess('Registration successful! Please log in.');
        setMode('login');
      }
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
