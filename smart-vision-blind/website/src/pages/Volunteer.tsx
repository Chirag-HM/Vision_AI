import React, { useState, useEffect, useRef } from 'react';
import { useAccessibility } from '../context/AccessibilityContext';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  MapPin,
  Heart,
  User,
  BellRing,
  PhoneOff,
  Send,
  MessageSquare,
  Clock,
  ShieldCheck,
  CheckCircle2,
  XCircle
} from 'lucide-react';

// --- Types ---
type ViewState = 'registration' | 'dashboard';
type DashboardStatus = 'available' | 'busy';
type RequestState = 'none' | 'incoming' | 'active';

interface ChatMessage {
  id: string;
  sender: 'volunteer' | 'user';
  text: string;
  time: Date;
}

interface HistorySession {
  id: string;
  date: Date;
  userId: string;
  type: string;
  duration: string;
}

// --- Leaflet Custom Icons ---
const userIcon = L.divIcon({
  className: 'custom-user-icon',
  html: `<div class="relative flex items-center justify-center w-8 h-8">
           <span class="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75 animate-ping"></span>
           <span class="relative inline-flex rounded-full h-5 w-5 bg-red-600 border-2 border-white shadow-[0_0_10px_#ef4444]"></span>
         </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16]
});

// Helper component to center map
function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  map.setView(center);
  return null;
}

export const Volunteer: React.FC = () => {
  const { isSimpleMode, speak } = useAccessibility();

  // Navigation State
  const [view, setView] = useState<ViewState>('registration');
  
  // Registration Form State
  const [isLoginMode, setIsLoginMode] = useState(false);
  const [name, setName] = useState('');

  // Dashboard State
  const [status, setStatus] = useState<DashboardStatus>('busy');
  const [requestState, setRequestState] = useState<RequestState>('none');
  
  // Chat State
  const [chatMessage, setChatMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // History State
  const [history, setHistory] = useState<HistorySession[]>([
    { id: '1', date: new Date(Date.now() - 86400000), userId: 'U-782', type: 'Reading text', duration: '4m 12s' },
    { id: '2', date: new Date(Date.now() - 172800000), userId: 'U-105', type: 'Navigation', duration: '12m 05s' },
  ]);

  // Mock Map Location (User asking for help)
  const userLocation: [number, number] = [12.9750, 77.6070];

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Simulate Incoming Request
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    if (view === 'dashboard' && status === 'available' && requestState === 'none') {
      timeout = setTimeout(() => {
        setRequestState('incoming');
        if (!isSimpleMode) speak('Incoming alert: Blind user nearby needs help.');
      }, 5000);
    }
    return () => clearTimeout(timeout);
  }, [view, status, requestState, isSimpleMode, speak]);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) setName('Alex'); // fallback mock name
    setView('dashboard');
    speak(`Welcome to the portal, ${name || 'Alex'}. Your status is currently busy.`);
  };

  const handleAccept = () => {
    setRequestState('active');
    setMessages([
      { id: 'msg1', sender: 'user', text: 'System: Audio stream connected.', time: new Date() },
      { id: 'msg2', sender: 'user', text: 'User: Hello? Can you help me find the bus stop?', time: new Date() }
    ]);
    speak('Session accepted. Voice and location feeds connected.');
  };

  const handleDecline = () => {
    setRequestState('none');
    setStatus('busy');
    speak('Session declined. Status set to busy.');
  };

  const handleEndSession = () => {
    const newSession: HistorySession = {
      id: Date.now().toString(),
      date: new Date(),
      userId: 'U-459',
      type: 'Navigation',
      duration: '3m 45s' // Mock duration
    };
    setHistory([newSession, ...history]);
    setRequestState('none');
    setStatus('available');
    setMessages([]);
    speak('Session ended. Thank you for your assistance.');
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    
    setMessages([...messages, {
      id: Date.now().toString(),
      sender: 'volunteer',
      text: chatMessage,
      time: new Date()
    }]);
    setChatMessage('');

    // Simulate user reply
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        sender: 'user',
        text: 'User: Got it, thank you!',
        time: new Date()
      }]);
    }, 2000);
  };


  // --- 1. ACCESSIBLE SIMPLE MODE (Fallback for VIPs) ---
  if (isSimpleMode) {
    return (
      <main className="max-w-4xl mx-auto px-6 py-12 text-white">
        <h1 className="text-5xl font-black mb-6 border-b-4 border-white pb-4">
          VOLUNTEER PORTAL
        </h1>
        <div className="border-4 border-white p-6 bg-black mb-8">
          <p className="text-3xl font-bold mb-4">
            This portal is primarily for sighted volunteers to provide assistance.
          </p>
          <p className="text-2xl font-bold">
            If you are looking to request help, please use the SOS Panel or Voice Assistant on your device.
          </p>
        </div>
      </main>
    );
  }

  // --- 2. REGISTRATION / LOGIN VIEW ---
  if (view === 'registration') {
    return (
      <div className="min-h-screen bg-[#0a0f2c] pt-24 pb-16 text-white font-sans flex items-center justify-center px-4">
        <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left: Copy & Stats */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-400/20 px-4 py-1.5 rounded-full text-blue-400 font-semibold text-xs tracking-wide">
              <Heart className="w-4 h-4 text-pink-500" /> WebRTC Volunteer Network
            </div>
            
            <h1 className="text-5xl md:text-6xl font-black tracking-tight leading-tight">
              Be Someone's <span className="text-blue-500">Eyes Today</span>
            </h1>
            
            <p className="text-lg text-slate-300 max-w-md">
              Join thousands of volunteers providing real-time visual assistance to blind individuals navigating the world safely.
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/10">
              <div>
                <div className="flex items-center gap-2 text-2xl font-black text-blue-400">
                  <Users className="w-5 h-5" /> 1,200+
                </div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Volunteers</div>
              </div>
              <div>
                <div className="flex items-center gap-2 text-2xl font-black text-amber-500">
                  <MapPin className="w-5 h-5" /> 48
                </div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Cities</div>
              </div>
              <div>
                <div className="flex items-center gap-2 text-2xl font-black text-emerald-400">
                  <ShieldCheck className="w-5 h-5" /> 10k+
                </div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Assists</div>
              </div>
            </div>
          </div>

          {/* Right: Registration/Login Form */}
          <div className="bg-white/[0.02] backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
            {/* Ambient glow */}
            <div className="absolute top-[-20%] right-[-20%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[80px]" />
            
            <h2 className="text-2xl font-black mb-6 relative z-10">
              {isLoginMode ? 'Welcome Back' : 'Register to Help'}
            </h2>

            <form onSubmit={handleRegister} className="space-y-5 relative z-10">
              {!isLoginMode && (
                <>
                  <div className="space-y-4">
                    <input 
                      type="text" 
                      placeholder="Full Name" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <input 
                        type="email" 
                        placeholder="Email Address" 
                        required
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                      />
                      <input 
                        type="text" 
                        placeholder="City" 
                        required
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Skills Checkboxes */}
                  <div className="space-y-2 pt-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">I can assist with:</label>
                    <div className="grid grid-cols-2 gap-3">
                      <label className="flex items-center gap-2 text-sm bg-black/20 p-2 rounded-lg border border-white/5 cursor-pointer hover:bg-white/5">
                        <input type="checkbox" defaultChecked className="accent-blue-500" /> Navigation help
                      </label>
                      <label className="flex items-center gap-2 text-sm bg-black/20 p-2 rounded-lg border border-white/5 cursor-pointer hover:bg-white/5">
                        <input type="checkbox" defaultChecked className="accent-blue-500" /> Reading text
                      </label>
                    </div>
                  </div>
                </>
              )}

              {isLoginMode && (
                <div className="space-y-4">
                  <input 
                    type="email" 
                    placeholder="Email Address" 
                    required
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  <input 
                    type="password" 
                    placeholder="Password" 
                    required
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              )}

              <button 
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl transition-colors shadow-lg shadow-blue-600/30 mt-4"
              >
                {isLoginMode ? 'Login to Portal' : 'Join as Volunteer'}
              </button>
            </form>

            <div className="mt-6 text-center relative z-10">
              <button 
                onClick={() => setIsLoginMode(!isLoginMode)}
                className="text-sm text-slate-400 hover:text-white transition-colors"
              >
                {isLoginMode ? "Need an account? Register" : "Already registered? Login"}
              </button>
            </div>
          </div>

        </div>
      </div>
    );
  }

  // --- 3. VOLUNTEER DASHBOARD VIEW ---
  return (
    <div className="min-h-screen bg-[#0a0f2c] pt-24 pb-16 text-white font-sans px-6">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header & Status Toggle */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/[0.02] backdrop-blur-md border border-white/10 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-blue-600/20 rounded-full border border-blue-500/30">
              <User className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-black">Welcome, {name || 'Alex'}</h1>
              <p className="text-sm text-slate-400">You are currently logged into the support network.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 bg-black/40 p-2 rounded-2xl border border-white/5">
            <button
              onClick={() => setStatus('available')}
              className={`px-6 py-2 rounded-xl font-bold text-sm transition-all ${status === 'available' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-slate-400 hover:text-white'}`}
              disabled={requestState !== 'none'}
            >
              Available
            </button>
            <button
              onClick={() => setStatus('busy')}
              className={`px-6 py-2 rounded-xl font-bold text-sm transition-all ${status === 'busy' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
              disabled={requestState !== 'none'}
            >
              Busy
            </button>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Content Area (Span 8) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Status State Views */}
            <AnimatePresence mode="wait">
              
              {/* IDLE STATE */}
              {requestState === 'none' && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white/[0.02] border border-white/5 rounded-3xl p-12 text-center flex flex-col items-center justify-center min-h-[400px]"
                >
                  {status === 'available' ? (
                    <>
                      <div className="relative mb-6">
                        <div className="w-20 h-20 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center z-10 relative">
                          <Clock className="w-8 h-8 text-blue-400" />
                        </div>
                        <div className="absolute inset-0 rounded-full border border-blue-500/20 animate-ping" />
                      </div>
                      <h2 className="text-xl font-bold mb-2">Waiting for requests...</h2>
                      <p className="text-slate-400 text-sm max-w-md">Keep this page open. We will alert you immediately when a visually impaired user needs assistance in your area.</p>
                    </>
                  ) : (
                    <>
                      <div className="w-20 h-20 rounded-full bg-slate-800/50 border border-slate-700 flex items-center justify-center mb-6">
                        <PhoneOff className="w-8 h-8 text-slate-500" />
                      </div>
                      <h2 className="text-xl font-bold mb-2 text-slate-300">You are marked as Busy</h2>
                      <p className="text-slate-500 text-sm">Toggle your status to "Available" to receive incoming help requests.</p>
                    </>
                  )}
                </motion.div>
              )}

              {/* INCOMING ALERT STATE */}
              {requestState === 'incoming' && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="bg-gradient-to-br from-amber-500/10 to-orange-600/10 border-2 border-amber-500/50 rounded-3xl p-8 shadow-[0_0_50px_rgba(245,158,11,0.2)] animate-[pulse_2s_ease-in-out_infinite]"
                >
                  <div className="flex items-start justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center border border-amber-400/30">
                        <BellRing className="w-8 h-8 text-amber-400 animate-bounce" />
                      </div>
                      <div>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-bold uppercase tracking-wider mb-2 border border-red-500/20">
                          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" /> Urgent Alert
                        </div>
                        <h2 className="text-2xl font-black text-white">Blind user nearby needs help</h2>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-black/40 rounded-2xl p-6 border border-white/5 space-y-4 mb-8">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-medium">Distance:</span>
                      <span className="font-bold text-amber-400">0.4 km away</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-medium">Request Type:</span>
                      <span className="font-bold text-white">Navigation — needs to reach bus stop</span>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button 
                      onClick={handleAccept}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-xl transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-5 h-5" /> ACCEPT REQUEST
                    </button>
                    <button 
                      onClick={handleDecline}
                      className="flex-1 border border-white/20 hover:bg-white/5 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-5 h-5" /> DECLINE
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ACTIVE SESSION STATE */}
              {requestState === 'active' && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/[0.02] border border-emerald-500/30 rounded-3xl shadow-[0_0_40px_rgba(16,185,129,0.1)] overflow-hidden flex flex-col h-[600px]"
                >
                  <div className="bg-emerald-500/10 border-b border-emerald-500/20 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                      </span>
                      <span className="font-black text-emerald-400 tracking-wider uppercase text-sm">Active Session</span>
                    </div>
                    <button 
                      onClick={handleEndSession}
                      className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                    >
                      End Session
                    </button>
                  </div>

                  <div className="flex-1 flex flex-col md:flex-row">
                    {/* Live Map */}
                    <div className="md:w-1/2 h-64 md:h-full border-b md:border-b-0 md:border-r border-white/10 relative z-0">
                      <MapContainer 
                        center={userLocation} 
                        zoom={17} 
                        zoomControl={false}
                        className="w-full h-full"
                      >
                        <ChangeView center={userLocation} />
                        <TileLayer
                          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                        />
                        <Marker position={userLocation} icon={userIcon}>
                          <Popup className="custom-popup font-bold">User Location</Popup>
                        </Marker>
                      </MapContainer>
                      <div className="absolute bottom-4 left-4 z-[1000] bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-xs font-bold text-white shadow-lg flex items-center gap-2">
                         <MapPin className="w-3 h-3 text-red-400" /> User is stationary
                      </div>
                    </div>

                    {/* Chat Box */}
                    <div className="md:w-1/2 h-full flex flex-col bg-black/20">
                      <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        {messages.map((msg) => (
                          <div key={msg.id} className={`flex ${msg.sender === 'volunteer' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${msg.sender === 'volunteer' ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-white/10 text-slate-200 border border-white/5 rounded-bl-sm'}`}>
                              {msg.text}
                            </div>
                          </div>
                        ))}
                        <div ref={chatEndRef} />
                      </div>
                      <div className="p-4 border-t border-white/10 bg-black/40">
                        <form onSubmit={handleSendMessage} className="flex gap-2">
                          <input 
                            type="text" 
                            placeholder="Type instructions to read aloud..."
                            value={chatMessage}
                            onChange={e => setChatMessage(e.target.value)}
                            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500"
                          />
                          <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-xl transition-colors">
                            <Send className="w-5 h-5" />
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>

          {/* Side Content Area: History Table (Span 4) */}
          <div className="lg:col-span-4">
            <div className="bg-white/[0.02] backdrop-blur-md border border-white/5 rounded-3xl p-6 shadow-xl h-full">
              <h3 className="text-lg font-black mb-6 flex items-center gap-2 text-white">
                <MessageSquare className="w-5 h-5 text-blue-400" /> My History
              </h3>
              
              <div className="space-y-4">
                {history.map(session => (
                  <div key={session.id} className="bg-black/30 border border-white/5 rounded-2xl p-4 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400">{session.date.toLocaleDateString()}</span>
                      <span className="text-xs font-black bg-white/10 px-2 py-0.5 rounded text-white">{session.duration}</span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="font-bold text-sm text-blue-400">{session.userId}</span>
                      <span className="text-sm font-medium text-slate-300">{session.type}</span>
                    </div>
                  </div>
                ))}
                
                {history.length === 0 && (
                  <div className="text-center text-slate-500 text-sm py-8 font-medium">
                    No sessions yet.
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
      
      {/* Global overrides */}
      <style>{`
        .leaflet-container { font-family: inherit; }
        .custom-popup .leaflet-popup-content-wrapper {
          background-color: rgba(0,0,0,0.8); color: white; border: 1px solid rgba(255,255,255,0.2);
        }
        .custom-popup .leaflet-popup-tip { background-color: rgba(0,0,0,0.8); }
      `}</style>
    </div>
  );
};
