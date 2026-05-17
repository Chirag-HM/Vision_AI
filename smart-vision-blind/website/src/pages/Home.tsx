import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAccessibility } from '../context/AccessibilityContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Eye, 
  ArrowRight, 
  Play, 
  AlertTriangle, 
  Bus, 
  UserCheck, 
  Shield, 
  Volume2, 
  MapPin, 
  Users,
  X
} from 'lucide-react';

export const Home: React.FC = () => {
  const { isSimpleMode, speak } = useAccessibility();
  const [showDemoModal, setShowDemoModal] = useState(false);

  // Play audio descriptions on user hover
  const handleHoverSpeak = (text: string) => {
    if (!isSimpleMode) speak(text);
  };

  // 1. ACCESSIBLE SIMPLE MODE LAYOUT (High contrast, large fonts)
  if (isSimpleMode) {
    return (
      <main className="max-w-4xl mx-auto px-6 py-12 text-white" role="main">
        <h1 className="text-5xl font-black mb-6 border-b-4 border-white pb-4">
          SMART VISION — EYES FOR THE WORLD
        </h1>
        <p className="text-3xl font-bold leading-relaxed mb-8">
          An intelligent walking stick that sees, speaks, and guides — giving independence back to the visually impaired.
        </p>

        {/* Primary Large Tactile Navigation Menu */}
        <div className="flex flex-col gap-6 mb-12">
          <Link
            to="/features"
            className="w-full bg-yellow-400 text-black text-3xl font-black py-6 rounded-none text-center border-4 border-white hover:bg-yellow-300 focus:ring-8 focus:ring-yellow-400 block"
            onClick={() => speak("Navigating to Product Features Grid")}
          >
            1. EXPLORE PRODUCT FEATURES
          </Link>
          <Link
            to="/dashboard"
            className="w-full bg-white text-black text-3xl font-black py-6 rounded-none text-center border-4 border-yellow-400 hover:bg-gray-200 focus:ring-8 focus:ring-yellow-400 block"
            onClick={() => speak("Navigating to Live Caregiver Dashboard")}
          >
            2. OPEN LIVE DASHBOARD
          </Link>
          <Link
            to="/sos"
            className="w-full bg-red-600 text-white text-3xl font-black py-6 rounded-none text-center border-4 border-white hover:bg-red-500 focus:ring-8 focus:ring-yellow-400 block animate-pulse"
            onClick={() => speak("Navigating to Crisis SOS Emergency Panel")}
          >
            3. REQUEST IMMEDIATE SOS HELP
          </Link>
        </div>

        {/* Tactile Information Highlights */}
        <section aria-label="Quick Highlights" className="border-t-4 border-white pt-8">
          <h2 className="text-4xl font-black mb-6">WHY CHOOSE SMART VISION?</h2>
          <ul className="space-y-6">
            <li className="p-6 border-2 border-white">
              <strong className="text-2xl block mb-2">Distance Sonar Awareness:</strong>
              <p className="text-xl">Vibrates strongly when obstacles are closer than 1 meter. Keeps you completely safe from collisions.</p>
            </li>
            <li className="p-6 border-2 border-white">
              <strong className="text-2xl block mb-2">Real-time Bus Tracking:</strong>
              <p className="text-xl">Announces arriving bus route numbers directly through standard bluetooth earpieces.</p>
            </li>
            <li className="p-6 border-2 border-white">
              <strong className="text-2xl block mb-2">24/7 Caregiver Location:</strong>
              <p className="text-xl">Streams live GPS coordinates securely to the cloud so emergency contacts know you are safe.</p>
            </li>
          </ul>
        </section>
      </main>
    );
  }

  // 2. PREMIUM STUNNING HERO LANDING PAGE
  return (
    <div className="relative min-h-screen bg-[#0a0f2c] overflow-hidden pt-24 text-white font-sans">
      
      {/* Dynamic Starry Dot Background */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-25">
        {[...Array(40)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-white rounded-full"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 2 + 1}px`,
              height: `${Math.random() * 2 + 1}px`,
              boxShadow: '0 0 8px rgba(255, 255, 255, 0.8)',
            }}
          />
        ))}
      </div>

      {/* Dynamic Glow Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[140px] pointer-events-none z-0" />

      {/* Hero Content Section */}
      <section className="max-w-7xl mx-auto px-6 py-16 min-h-[calc(100vh-140px)] grid grid-cols-1 lg:grid-cols-10 gap-12 items-center relative z-10">
        
        {/* Left Side Column (60% Width / lg:col-span-6) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="lg:col-span-6 space-y-8 text-left"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-400/20 px-4 py-1.5 rounded-full text-blue-400 font-semibold text-xs tracking-wide">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
            AI-Powered Assistive Tech
          </div>

          {/* Heading */}
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-none">
              Eyes for the <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">World</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-300 font-medium max-w-xl leading-relaxed">
              An intelligent walking stick that sees, speaks, and guides — giving independence back to the visually impaired.
            </p>
          </div>

          {/* Call to Actions (Explore & Watch) */}
          <div className="flex flex-wrap items-center gap-4">
            <Link
              to="/features"
              className="group flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-8 py-4 rounded-2xl font-bold transition-all hover:scale-105 shadow-lg shadow-blue-900/30"
              onMouseEnter={() => handleHoverSpeak("Link: Explore Smart Vision Features")}
            >
              Explore Features 
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <button
              onClick={() => {
                setShowDemoModal(true);
                speak("Opening Video demonstration modal.");
              }}
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-8 py-4 rounded-2xl font-bold transition-all hover:scale-105"
            >
              <Play className="w-5 h-5 text-blue-400" /> Watch Demo
            </button>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/10 max-w-md">
            <div>
              <div className="text-2xl md:text-3xl font-extrabold text-blue-400">500+</div>
              <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Active Users</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-extrabold text-amber-500">98%</div>
              <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">YOLO Accuracy</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-extrabold text-blue-400">24/7</div>
              <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Live Support</div>
            </div>
          </div>
        </motion.div>

        {/* Right Side Column (40% Width / lg:col-span-4) */}
        <div className="lg:col-span-4 relative flex items-center justify-center min-h-[400px]">
          
          {/* Continuous CSS Radar Rings */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-24 h-24 rounded-full border border-blue-500/20 absolute animate-[radarPulse_4s_ease-out_infinite]" />
            <div className="w-24 h-24 rounded-full border border-blue-500/20 absolute animate-[radarPulse_4s_ease-out_infinite_1.3s]" />
            <div className="w-24 h-24 rounded-full border border-blue-500/20 absolute animate-[radarPulse_4s_ease-out_infinite_2.6s]" />
          </div>

          {/* Glowing Smart Stick Sphere */}
          <div className="relative w-48 h-48 bg-gradient-to-tr from-blue-600/80 via-blue-700/80 to-indigo-900/90 rounded-full flex items-center justify-center shadow-[0_0_80px_rgba(59,130,246,0.6)] border border-blue-400/30 group cursor-pointer hover:scale-105 transition-all duration-500">
            <div className="absolute inset-2 bg-gradient-to-bl from-cyan-400/20 to-transparent rounded-full filter blur-xs" />
            <div className="text-center z-10 px-4">
              <Eye className="w-12 h-12 text-cyan-300 mx-auto animate-pulse mb-2" />
              <span className="font-black text-sm tracking-widest text-white uppercase block">Vision Core</span>
            </div>
          </div>

          {/* Floating Badges (Framer Motion Bobbing) */}
          {/* Badge 1: Obstacle Detected */}
          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-4 -right-4 bg-slate-950/80 border border-red-500/30 p-3 rounded-2xl flex items-center gap-2 backdrop-blur-md shadow-xl"
          >
            <div className="p-1.5 bg-red-500/20 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-red-400 animate-bounce" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Distance Sonar</div>
              <div className="text-xs font-black text-white">Obstacle Detected 0.8m</div>
            </div>
          </motion.div>

          {/* Badge 2: Bus Arrival Alert */}
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
            className="absolute left-[-20px] top-1/2 -translate-y-1/2 bg-slate-950/80 border border-blue-500/30 p-3 rounded-2xl flex items-center gap-2 backdrop-blur-md shadow-xl"
          >
            <div className="p-1.5 bg-blue-500/20 rounded-lg">
              <Bus className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Bus Transit</div>
              <div className="text-xs font-black text-white">Bus 500C in 2 min</div>
            </div>
          </motion.div>

          {/* Badge 3: Volunteer Connected */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut', delay: 1.0 }}
            className="absolute bottom-4 right-2 bg-slate-950/80 border border-green-500/30 p-3 rounded-2xl flex items-center gap-2 backdrop-blur-md shadow-xl"
          >
            <div className="p-1.5 bg-green-500/20 rounded-lg">
              <UserCheck className="w-4 h-4 text-green-400" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">WebRTC Guidance</div>
              <div className="text-xs font-black text-white">Volunteer Connected</div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* Feature Highlights Strip (4 columns / icons with labels) */}
      <section className="bg-black/20 border-t border-white/5 py-12 px-6 relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8">
          
          <div className="flex items-center gap-4 bg-white/[0.02] border border-white/5 p-4 rounded-2xl hover:bg-white/[0.05] transition-all cursor-default">
            <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20 text-blue-400">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-sm text-white">Obstacle Avoidance</div>
              <div className="text-xs text-slate-400">Real-time sonar distance radar</div>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-white/[0.02] border border-white/5 p-4 rounded-2xl hover:bg-white/[0.05] transition-all cursor-default">
            <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20 text-blue-400">
              <Volume2 className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-sm text-white">Voice Guidance</div>
              <div className="text-xs text-slate-400">AI audio alerts and descriptions</div>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-white/[0.02] border border-white/5 p-4 rounded-2xl hover:bg-white/[0.05] transition-all cursor-default">
            <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20 text-blue-400">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-sm text-white">GPS Telemetry</div>
              <div className="text-xs text-slate-400">Caregiver Map tracking system</div>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-white/[0.02] border border-white/5 p-4 rounded-2xl hover:bg-white/[0.05] transition-all cursor-default">
            <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20 text-blue-400">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-sm text-white">Volunteer Network</div>
              <div className="text-xs text-slate-400">Direct WebRTC visual call helpers</div>
            </div>
          </div>

        </div>
      </section>

      {/* Video Demo Modal Dialog */}
      <AnimatePresence>
        {showDemoModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-xs"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-slate-900 border border-white/10 rounded-3xl overflow-hidden max-w-3xl w-full shadow-2xl relative"
            >
              <button 
                onClick={() => setShowDemoModal(false)}
                className="absolute top-4 right-4 bg-black/40 hover:bg-black/60 p-2 rounded-full transition-colors text-white z-10"
                aria-label="Close video demo"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="p-8 space-y-4">
                <div className="flex items-center gap-3">
                  <Play className="w-6 h-6 text-blue-500" />
                  <h3 className="text-xl font-bold">Smart Vision Demonstration Video</h3>
                </div>
                
                {/* Embed high-fidelity video simulation */}
                <div className="aspect-video w-full rounded-2xl bg-black relative overflow-hidden border border-white/5 flex items-center justify-center">
                  <div className="text-center space-y-3 z-10 px-4">
                    <p className="text-sm text-slate-400 font-mono">Simulating visual feedback earpiece announcement...</p>
                    <p className="text-base font-bold text-blue-400 italic">"Caution: Obstacle detected 0.8 meters ahead. Turn 15 degrees right."</p>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/10 to-indigo-600/10 animate-pulse pointer-events-none" />
                </div>

                <div className="text-xs text-slate-500 leading-relaxed">
                  This demo video explains the hardware integration of standard HC-SR04 ultrasonic sensors, a Raspberry Pi Camera Module, and local YOLO object classifiers with custom speech synthesis algorithms.
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Embedded CSS Radar Keyframe Styles */}
      <style>{`
        @keyframes radarPulse {
          0% {
            transform: scale(1);
            opacity: 0.8;
          }
          100% {
            transform: scale(4);
            opacity: 0;
          }
        }
      `}</style>

    </div>
  );
};
