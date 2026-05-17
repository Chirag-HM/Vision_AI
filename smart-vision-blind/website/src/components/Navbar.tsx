import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAccessibility } from '../context/AccessibilityContext';
import { Eye, Menu, X, Volume2, Type, RefreshCw } from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    isSimpleMode,
    toggleSimpleMode,
    toggleHighContrast,
    increaseTextSize,
    decreaseTextSize,
    speak,
  } = useAccessibility();

  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const handleToggleSimple = () => {
    toggleSimpleMode();
  };

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/features', label: 'Features' },
    { path: '/dashboard', label: 'Live Dashboard' },
    { path: '/volunteer', label: 'Volunteer Portal' },
    { path: '/sos', label: 'SOS Emergency' },
  ];

  const handleMenuClick = (label: string) => {
    speak(`Navigating to ${label}`);
    setIsOpen(false);
  };

  // 1. SIMPLE ACCESSIBLE MODE LAYOUT
  if (isSimpleMode) {
    return (
      <header className="w-full bg-black border-b-4 border-white text-white p-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center justify-between w-full md:w-auto">
            <Link
              to="/"
              className="flex items-center gap-2 focus:ring-4 focus:ring-yellow-400 p-2"
              onClick={() => handleMenuClick('Home')}
              aria-label="Smart Vision Home"
            >
              <Eye className="w-10 h-10 text-white" />
              <span className="text-3xl font-black tracking-wider">SMART VISION</span>
            </Link>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 border-2 border-white focus:ring-4 focus:ring-yellow-400"
              aria-label="Toggle Navigation Menu"
            >
              {isOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
            </button>
          </div>

          {/* Navigation links & Accessibility Controls in Simple Mode */}
          <nav className={`${isOpen ? 'flex' : 'hidden'} md:flex flex-col md:flex-row items-center gap-6 w-full md:w-auto mt-4 md:mt-0`}>
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-2xl font-bold p-2 focus:ring-4 focus:ring-yellow-400 border-2 ${
                  location.pathname === link.path ? 'bg-white text-black border-white' : 'border-transparent text-white'
                }`}
                onClick={() => handleMenuClick(link.label)}
              >
                {link.label}
              </Link>
            ))}

            {/* Accessible Quick Controls */}
            <div className="flex flex-wrap justify-center gap-4 mt-4 md:mt-0 border-t-2 md:border-t-0 md:border-l-2 border-white pt-4 md:pt-0 md:pl-6 w-full md:w-auto">
              <button
                onClick={increaseTextSize}
                className="bg-yellow-400 text-black px-4 py-2 text-xl font-bold flex items-center gap-2 border-2 border-yellow-400 hover:bg-yellow-300 focus:ring-4 focus:ring-white"
                aria-label="Increase Text Size"
              >
                <Type className="w-6 h-6" /> Size +
              </button>
              <button
                onClick={decreaseTextSize}
                className="bg-yellow-400 text-black px-4 py-2 text-xl font-bold flex items-center gap-2 border-2 border-yellow-400 hover:bg-yellow-300 focus:ring-4 focus:ring-white"
                aria-label="Decrease Text Size"
              >
                <Type className="w-6 h-6" /> Size -
              </button>
              <button
                onClick={toggleHighContrast}
                className="bg-white text-black px-4 py-2 text-xl font-bold flex items-center gap-2 border-2 border-white hover:bg-gray-200 focus:ring-4 focus:ring-yellow-400"
                aria-label="Toggle High Contrast Contrast"
              >
                Contrast
              </button>
              <button
                onClick={handleToggleSimple}
                className="bg-red-600 text-white px-4 py-2 text-xl font-bold flex items-center gap-2 border-2 border-white hover:bg-red-500 focus:ring-4 focus:ring-yellow-400"
                aria-label="Switch back to Standard Mode"
              >
                <RefreshCw className="w-6 h-6 animate-spin" /> Standard Visual Mode
              </button>
            </div>
          </nav>
        </div>
      </header>
    );
  }

  // 2. MODERN SLICK GLASSMORPHIC LAYOUT
  return (
    <header className="w-full fixed top-0 left-0 bg-[#0a0f2c]/75 backdrop-blur-md border-b border-white/10 text-white py-4 px-6 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg p-1 group"
          onClick={() => speak('Smart Vision Home')}
        >
          <div className="bg-blue-600/20 p-2 rounded-lg group-hover:bg-blue-600/40 transition-colors">
            <Eye className="w-6 h-6 text-blue-500" />
          </div>
          <span className="text-xl font-black bg-gradient-to-r from-white via-slate-200 to-blue-500 bg-clip-text text-transparent">
            SMART VISION
          </span>
        </Link>

        {/* Desktop Links */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`font-semibold hover:text-blue-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg p-1 ${
                location.pathname === link.path ? 'text-blue-500' : 'text-slate-300'
              }`}
              onClick={() => speak(`Navigating to ${link.label}`)}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Action Button & Menu */}
        <div className="hidden md:flex items-center gap-4">
          <button
            onClick={handleToggleSimple}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-blue-900/30 transition-all border border-blue-400/20 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-[#0a0f2c]"
            aria-label="Activate Screen Reader and Simple Accessible Mode"
          >
            <Volume2 className="w-5 h-5 text-blue-300 animate-pulse" /> Accessible Simple Mode
          </button>
        </div>

        {/* Mobile Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 text-slate-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-[#0a0f2c] border-b border-white/10 p-6 flex flex-col gap-4 animate-in fade-in slide-in-from-top duration-200">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-lg font-semibold ${
                location.pathname === link.path ? 'text-blue-500' : 'text-slate-300'
              }`}
              onClick={() => handleMenuClick(link.label)}
            >
              {link.label}
            </Link>
          ))}
          <button
            onClick={handleToggleSimple}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 py-3 rounded-xl font-bold shadow-lg"
          >
            <Volume2 className="w-5 h-5" /> Accessible Simple Mode
          </button>
        </div>
      )}
    </header>
  );
};
