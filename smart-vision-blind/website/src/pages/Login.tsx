/**
 * src/pages/Login.tsx
 * Glassmorphic login & registration page with role selection.
 */

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
    <div className="min-h-screen bg-[#0a0f2c] flex items-center justify-center px-4 pt-24 pb-16 font-sans">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[30%] w-[600px] h-[400px] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-[10%] w-[400px] h-[300px] bg-purple-600/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-blue-400 mb-4">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black text-white">Smart Vision</h1>
          <p className="text-slate-400 text-sm mt-1">Secure Access Portal</p>
        </div>

        {/* Card */}
        <div className="bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-2xl">
          {/* Mode toggle */}
          <div className="flex bg-black/40 rounded-2xl p-1 mb-8">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${mode === 'login' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              <LogIn className="inline w-4 h-4 mr-1.5" /> Login
            </button>
            <button
              onClick={() => setMode('register')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${mode === 'register' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              <UserPlus className="inline w-4 h-4 mr-1.5" /> Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 pr-12 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                >
                  {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Role selector (register only) */}
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">I am a...</label>
                <div className="grid grid-cols-2 gap-2">
                  {ROLES.map(r => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setRole(r.value)}
                      className={`text-left p-3 rounded-xl border transition-all ${role === r.value ? 'border-blue-500 bg-blue-500/10 text-white' : 'border-white/10 bg-black/20 text-slate-400 hover:border-white/20'}`}
                    >
                      <div className="font-bold text-xs">{r.label}</div>
                      <div className="text-[10px] mt-0.5 opacity-70">{r.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Error / Success messages */}
            {error   && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-xl">{error}</p>}
            {success && <p className="text-emerald-400 text-sm bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 rounded-xl">{success}</p>}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-black py-4 rounded-xl transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : mode === 'login' ? (
                <><LogIn className="w-4 h-4" /> Login</>
              ) : (
                <><UserPlus className="w-4 h-4" /> Create Account</>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
