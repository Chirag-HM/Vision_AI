import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAccessibility } from '../context/AccessibilityContext';
import { Volume2, VolumeX } from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    isSimpleMode,
    toggleSimpleMode,
    speak,
    isTTSActive,
    toggleTTS,
  } = useAccessibility();

  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on navigation
  useEffect(() => { setIsOpen(false); }, [location.pathname]);

  const navLinks = [
    { path: '/features', label: 'Features' },
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/volunteer', label: 'Volunteer' },
    { path: '/sos', label: 'SOS' },
  ];

  // ── SIMPLE / ACCESSIBLE MODE ──────────────────────────────────────────────
  if (isSimpleMode) {
    return (
      <header className="w-full bg-black border-b-4 border-white text-white p-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <Link to="/" className="text-3xl font-black tracking-wider" onClick={() => speak('Smart Vision Home')}>
            SMART VISION
          </Link>
          <nav className="flex flex-wrap gap-4">
            {navLinks.map(l => (
              <Link key={l.path} to={l.path}
                className={`text-2xl font-bold px-4 py-2 border-2 focus:ring-4 focus:ring-yellow-400 ${location.pathname === l.path ? 'bg-white text-black border-white' : 'border-white text-white'}`}
                onClick={() => speak(`Navigating to ${l.label}`)}>
                {l.label}
              </Link>
            ))}
            <button onClick={toggleTTS}
              className="text-2xl font-bold px-4 py-2 border-2 border-purple-400 bg-purple-900 text-white focus:ring-4 focus:ring-yellow-400"
              aria-label="Toggle Voice">
              {isTTSActive ? 'Voice ON' : 'Voice OFF'}
            </button>
            <button onClick={toggleSimpleMode}
              className="text-2xl font-bold px-4 py-2 border-2 border-red-400 bg-red-900 text-white focus:ring-4 focus:ring-yellow-400">
              Standard Mode
            </button>
          </nav>
        </div>
      </header>
    );
  }

  // ── SIDEWAVE-INSPIRED MINIMAL NAVBAR ──────────────────────────────────────
  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{
          background: scrolled ? 'rgba(8,8,8,0.25)' : 'transparent',
          backdropFilter: scrolled ? 'blur(24px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(255,255,255,0.08)' : '1px solid transparent',
        }}
      >
        <div className="max-w-[1400px] mx-auto px-8 md:px-12 flex items-center justify-between h-16 md:h-20">

          {/* Logo */}
          <Link to="/"
            className="flex items-center gap-2 group"
            onClick={() => speak('Smart Vision')}
          >
            <span className="text-[11px] font-bold tracking-[0.25em] text-white uppercase opacity-90 group-hover:opacity-100 transition-opacity"
              style={{ fontFamily: 'Syne, sans-serif', letterSpacing: '0.2em' }}>
              SMART VISION
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-10">
            {navLinks.map(l => (
              <Link key={l.path} to={l.path}
                onClick={() => speak(`Navigating to ${l.label}`)}
                className="text-[11px] font-semibold tracking-[0.18em] uppercase transition-all duration-200"
                style={{
                  color: location.pathname === l.path ? '#ffffff' : 'rgba(255,255,255,0.45)',
                  fontFamily: 'Inter, sans-serif',
                }}>
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Right controls */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={toggleTTS}
              title={isTTSActive ? 'Disable voice' : 'Enable voice'}
              className="w-9 h-9 flex items-center justify-center rounded-full transition-all"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
              aria-label="Toggle TTS"
            >
              {isTTSActive
                ? <Volume2 className="w-4 h-4" style={{ color: '#e8ff47' }} />
                : <VolumeX className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.4)' }} />}
            </button>

            <button
              onClick={toggleSimpleMode}
              className="text-[11px] font-semibold tracking-[0.14em] uppercase px-5 py-2.5 rounded-full transition-all duration-200 hover:opacity-80"
              style={{
                fontFamily: 'Inter, sans-serif',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.14)',
                color: 'rgba(255,255,255,0.7)',
              }}>
              Accessible Mode
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setIsOpen(o => !o)}
            className="md:hidden flex flex-col gap-[5px] p-2"
            aria-label="Toggle menu"
          >
            <span className={`block w-6 h-px bg-white transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-[6px]' : ''}`} />
            <span className={`block w-4 h-px bg-white transition-all duration-300 ${isOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-6 h-px bg-white transition-all duration-300 ${isOpen ? '-rotate-45 -translate-y-[6px]' : ''}`} />
          </button>
        </div>
      </header>

      {/* Mobile menu fullscreen */}
      {isOpen && (
        <div className="fixed inset-0 z-40 flex flex-col justify-center px-10"
          style={{ background: '#080808' }}>
          <nav className="flex flex-col gap-8">
            {navLinks.map((l, i) => (
              <Link key={l.path} to={l.path}
                onClick={() => speak(`Navigating to ${l.label}`)}
                className="fade-up"
                style={{
                  fontFamily: 'Syne, sans-serif',
                  fontSize: 'clamp(2.5rem, 8vw, 5rem)',
                  fontWeight: 800,
                  color: location.pathname === l.path ? '#fff' : 'rgba(255,255,255,0.35)',
                  animationDelay: `${i * 60}ms`,
                  letterSpacing: '-0.03em',
                }}>
                {l.label}
              </Link>
            ))}
            <div className="flex gap-4 mt-4">
              <button onClick={toggleTTS}
                className="flex items-center gap-2 text-sm px-4 py-2 rounded-full"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: isTTSActive ? '#e8ff47' : 'rgba(255,255,255,0.4)' }}>
                {isTTSActive ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                {isTTSActive ? 'Voice ON' : 'Voice OFF'}
              </button>
              <button onClick={toggleSimpleMode}
                className="text-sm px-4 py-2 rounded-full"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.6)' }}>
                Accessible
              </button>
            </div>
          </nav>
        </div>
      )}
    </>
  );
};
