import React, { useState, useEffect, useRef } from 'react';
import { useAccessibility } from '../context/AccessibilityContext';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Wifi,
  Battery,
  MapPin,
  Bus,
  AlertTriangle,
  Mic,
  Phone,
  Activity,
  RefreshCw,
  Navigation,
  Clock,
  Shield,
  Heart
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Custom Hooks ---
function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback);
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);
  useEffect(() => {
    if (delay !== null) {
      const id = setInterval(() => savedCallback.current(), delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

// --- Leaflet Custom Icons ---
// Pulsing Blue Dot for User
const userIcon = L.divIcon({
  className: 'custom-user-icon',
  html: `<div class="relative flex items-center justify-center w-6 h-6">
           <span class="absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75 animate-ping"></span>
           <span class="relative inline-flex rounded-full h-4 w-4 bg-blue-600 border-2 border-white shadow-[0_0_10px_#3b82f6]"></span>
         </div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

// Orange Bus Marker
const busIcon = L.divIcon({
  className: 'custom-bus-icon',
  html: `<div class="bg-amber-500 rounded-full p-1.5 border-2 border-white shadow-lg text-white">
           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bus"><path d="M8 6v6"/><path d="M15 6v6"/><path d="M2 12h19.6"/><path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3"/><circle cx="7" cy="18" r="2"/><path d="M9 18h5"/><circle cx="16" cy="18" r="2"/></svg>
         </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16]
});

// Helper component to center map programmatically
function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  map.setView(center);
  return null;
}

// --- Types ---
type EventType = 'obstacle' | 'bus' | 'voice' | 'volunteer';

interface LiveEvent {
  id: string;
  type: EventType;
  message: string;
  timestamp: Date;
}

interface BusStop {
  id: string;
  name: string;
  distance: string;
  nextBus: string;
  eta: number; // in seconds
  lat: number;
  lng: number;
}

export const Dashboard: React.FC = () => {
  const { isSimpleMode, speak } = useAccessibility();

  // Simulated State
  const [battery, setBattery] = useState(82);
  const signal = 'Excellent (4G)';
  const [lastSeen, setLastSeen] = useState(new Date());
  
  // Real-time GPS Location (MG Road, Bengaluru)
  const [userLocation, setUserLocation] = useState<[number, number]>([12.9750, 77.6070]);
  const locationName = 'MG Road, Bengaluru';

  // Events Feed
  const [events, setEvents] = useState<LiveEvent[]>([
    { id: '1', type: 'volunteer', message: 'Volunteer call ended', timestamp: new Date(Date.now() - 5 * 60000) },
    { id: '2', type: 'voice', message: 'Voice command: navigate home', timestamp: new Date(Date.now() - 60000) },
    { id: '3', type: 'bus', message: 'Bus 500C arriving in 3 mins', timestamp: new Date(Date.now() - 15000) },
    { id: '4', type: 'obstacle', message: 'Obstacle detected — 0.6m ahead', timestamp: new Date(Date.now() - 2000) }
  ]);

  // Bus Stops
  const [busStops, setBusStops] = useState<BusStop[]>([
    { id: 'b1', name: 'Trinity Circle Stop', distance: '120m', nextBus: '500C', eta: 180, lat: 12.9735, lng: 77.6150 },
    { id: 'b2', name: 'Boulevard Stop', distance: '300m', nextBus: '335E', eta: 420, lat: 12.9765, lng: 77.6010 }
  ]);

  // Stats
  const [stats, setStats] = useState({ obstacles: 24, distance: 1.2, assists: 2 });

  // Refresh Bus Data
  const [isRefreshing, setIsRefreshing] = useState(false);
  const handleRefreshBus = () => {
    setIsRefreshing(true);
    speak("Refreshing bus transit schedules.");
    setTimeout(() => {
      setBusStops(stops => stops.map(stop => ({
        ...stop,
        eta: Math.max(0, stop.eta - Math.floor(Math.random() * 30))
      })));
      setIsRefreshing(false);
    }, 1000);
  };

  // --- Real-Time Simulation Hook ---
  useInterval(() => {
    // 1. Slightly move the user to simulate walking
    setUserLocation(prev => [
      prev[0] + (Math.random() * 0.00005 - 0.00002), 
      prev[1] + (Math.random() * 0.00005 - 0.00002)
    ]);
    
    // 2. Decrement bus ETAs
    setBusStops(prev => prev.map(stop => ({
      ...stop,
      eta: Math.max(0, stop.eta - 5)
    })));

    // 3. Update Last Seen
    setLastSeen(new Date());

    // 4. Randomly add new events occasionally (10% chance every 5s)
    if (Math.random() > 0.9) {
      const newEvent: LiveEvent = {
        id: Date.now().toString(),
        type: 'obstacle',
        message: 'Obstacle detected — 0.8m left',
        timestamp: new Date()
      };
      setEvents(prev => [newEvent, ...prev].slice(0, 10)); // keep last 10
      setStats(prev => ({ ...prev, obstacles: prev.obstacles + 1 }));
    }
    
    // 5. Slowly drain battery
    if (Math.random() > 0.95) {
      setBattery(prev => Math.max(0, prev - 1));
    }
  }, 5000);

  // --- Helper to format relative time ---
  const getRelativeTime = (date: Date) => {
    const diffInSeconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    const diffInMins = Math.floor(diffInSeconds / 60);
    if (diffInMins < 60) return `${diffInMins} min ago`;
    return `${Math.floor(diffInMins / 60)}h ago`;
  };

  // --- Helper for Event Icons ---
  const getEventIcon = (type: EventType) => {
    switch (type) {
      case 'obstacle': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'bus': return <Bus className="w-5 h-5 text-blue-500" />;
      case 'voice': return <Mic className="w-5 h-5 text-green-500" />;
      case 'volunteer': return <Phone className="w-5 h-5 text-amber-500" />;
    }
  };

  const getEventColor = (type: EventType) => {
    switch (type) {
      case 'obstacle': return 'border-red-500/30 bg-red-500/5 text-red-100';
      case 'bus': return 'border-blue-500/30 bg-blue-500/5 text-blue-100';
      case 'voice': return 'border-green-500/30 bg-green-500/5 text-green-100';
      case 'volunteer': return 'border-amber-500/30 bg-amber-500/5 text-amber-100';
    }
  };

  // --- 1. ACCESSIBLE SIMPLE MODE (Fallback) ---
  if (isSimpleMode) {
    return (
      <main className="max-w-4xl mx-auto px-6 py-12 text-white">
        <h1 className="text-5xl font-black mb-6 border-b-4 border-white pb-4">
          CAREGIVER LIVE TRACKING DASHBOARD
        </h1>
        
        {/* Simplified Status */}
        <div className="border-4 border-white p-6 bg-black mb-8 space-y-4">
          <h2 className="text-3xl font-black">1. DEVICE STATUS</h2>
          <p className="text-2xl font-bold">Status: <span className="text-green-400">ONLINE</span></p>
          <p className="text-2xl font-bold">Battery: {battery}%</p>
          <p className="text-2xl font-bold">Location: {locationName}</p>
        </div>

        {/* Simplified Events */}
        <div className="border-4 border-white p-6 bg-black mb-8 space-y-4">
          <h2 className="text-3xl font-black">2. RECENT ALERTS</h2>
          <ul className="space-y-4">
            {events.slice(0, 3).map(ev => (
              <li key={ev.id} className="p-4 border-2 border-white text-2xl font-bold">
                {ev.message} ({getRelativeTime(ev.timestamp)})
              </li>
            ))}
          </ul>
        </div>
      </main>
    );
  }

  // --- 2. PREMIUM DARK-THEMED DASHBOARD ---
  return (
    <div className="min-h-screen pt-24 pb-16 text-white font-sans relative overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6">
        
        {/* Top Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-white to-blue-400 bg-clip-text text-transparent">
              Live Dashboard
            </h1>
            <p className="text-sm text-slate-400 font-medium">Real-time telemetry and navigation center</p>
          </div>
          <button 
            className="flex items-center gap-2 bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600/30 px-4 py-2 rounded-xl text-sm font-bold transition-all self-start md:self-auto"
            onClick={() => setUserLocation([12.9750, 77.6070])}
          >
            <MapPin className="w-4 h-4" /> Recenter Map
          </button>
        </div>

        {/* 3-COLUMN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
          
          {/* COLUMN 1: Device Status (Span 3) */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Status Card */}
            <div className="bg-white/[0.02] backdrop-blur-md border border-white/5 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-400" />
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">System Status</h2>
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                    <span className="text-2xl font-black text-white tracking-tight">Device Online</span>
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                {/* Battery */}
                <div>
                  <div className="flex justify-between text-sm mb-2 font-bold">
                    <span className="text-slate-300 flex items-center gap-2"><Battery className="w-4 h-4 text-emerald-400" /> Battery Level</span>
                    <span className={battery > 20 ? 'text-emerald-400' : 'text-red-400'}>{battery}%</span>
                  </div>
                  <div className="h-2 w-full bg-black/50 rounded-full overflow-hidden border border-white/5">
                    <motion.div 
                      className={`h-full rounded-full ${battery > 20 ? 'bg-gradient-to-r from-green-500 to-emerald-400' : 'bg-red-500 animate-pulse'}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${battery}%` }}
                      transition={{ duration: 1 }}
                    />
                  </div>
                </div>

                {/* Signal */}
                <div className="flex items-center justify-between p-3 bg-black/30 rounded-xl border border-white/5">
                  <span className="text-xs text-slate-400 font-bold uppercase flex items-center gap-2">
                    <Wifi className="w-4 h-4 text-blue-400" /> Connectivity
                  </span>
                  <span className="text-sm font-black text-white">{signal}</span>
                </div>

                {/* Mode */}
                <div className="flex items-center justify-between p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                  <span className="text-xs text-blue-400 font-bold uppercase flex items-center gap-2">
                    <Navigation className="w-4 h-4" /> Current Mode
                  </span>
                  <span className="text-sm font-black text-blue-100">Navigation</span>
                </div>

                {/* Last Seen */}
                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium pt-2 border-t border-white/5">
                  <Clock className="w-3.5 h-3.5" /> Last updated: {lastSeen.toLocaleTimeString()}
                </div>
              </div>
            </div>

          </div>

          {/* COLUMN 2: Live Map (Span 6) */}
          <div className="lg:col-span-6 bg-white/[0.02] backdrop-blur-md border border-white/5 rounded-3xl p-1.5 shadow-xl flex flex-col h-[500px] lg:h-auto overflow-hidden">
            <div className="flex-1 rounded-[1.3rem] overflow-hidden relative z-0">
              <MapContainer 
                center={userLocation} 
                zoom={16} 
                zoomControl={false}
                className="w-full h-full"
              >
                <ChangeView center={userLocation} />
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                />
                
                {/* User Marker */}
                <Marker position={userLocation} icon={userIcon}>
                  <Popup className="custom-popup">
                    <div className="font-bold text-slate-800">Smart Stick User</div>
                    <div className="text-xs text-slate-600">{locationName}</div>
                  </Popup>
                </Marker>

                {/* Bus Stop Markers */}
                {busStops.map(stop => (
                  <Marker key={stop.id} position={[stop.lat, stop.lng]} icon={busIcon}>
                    <Popup className="custom-popup">
                      <div className="font-bold text-slate-800">{stop.name}</div>
                      <div className="text-xs text-slate-600">Bus {stop.nextBus} — {Math.floor(stop.eta / 60)}m {stop.eta % 60}s</div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
              
              {/* Map Overlay HUD */}
              <div className="absolute top-4 left-4 z-[1000] bg-black/60 backdrop-blur-md border border-white/10 px-4 py-2 rounded-xl shadow-lg flex items-center gap-2 pointer-events-none">
                <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-white">Live Tracking Active</span>
              </div>
            </div>
            <div className="px-5 py-3 bg-black/40 flex items-center gap-3">
              <MapPin className="w-5 h-5 text-blue-400" />
              <div className="font-bold text-sm text-slate-200 truncate flex-1">
                Current Location: <span className="text-white">{locationName}</span>
              </div>
              <div className="text-xs font-mono text-slate-500">
                {userLocation[0].toFixed(4)}, {userLocation[1].toFixed(4)}
              </div>
            </div>
          </div>

          {/* COLUMN 3: Live Feed (Span 3) */}
          <div className="lg:col-span-3 bg-white/[0.02] backdrop-blur-md border border-white/5 rounded-3xl p-6 shadow-xl flex flex-col h-[500px] lg:h-auto">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-400" /> Live Feed
              </h2>
              <span className="text-xs font-bold text-slate-500 bg-white/5 px-2 py-1 rounded-md">Real-time</span>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
              <AnimatePresence initial={false}>
                {events.map((ev) => (
                  <motion.div
                    key={ev.id}
                    initial={{ opacity: 0, y: -20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className={`p-3.5 rounded-2xl border flex items-start gap-3 backdrop-blur-sm shadow-lg ${getEventColor(ev.type)}`}
                  >
                    <div className="mt-0.5 bg-white/10 p-1.5 rounded-lg">
                      {getEventIcon(ev.type)}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-bold leading-tight mb-1">{ev.message}</div>
                      <div className="text-[10px] uppercase font-bold tracking-wider opacity-60">
                        {getRelativeTime(ev.timestamp)}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

        </div>

        {/* BOTTOM ROW: Stats & Bus Tracking */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Stat Cards (Span 3 columns on large screens via internal grid) */}
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-red-500/10 to-orange-500/5 border border-red-500/20 rounded-3xl p-6 shadow-xl flex flex-col justify-between hover:bg-red-500/10 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-red-500/20 rounded-xl"><Shield className="w-6 h-6 text-red-400" /></div>
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Obstacles Avoided</h3>
              </div>
              <div className="text-5xl font-black text-white">{stats.obstacles}</div>
              <div className="text-xs text-red-400 font-medium mt-2">Today</div>
            </div>

            <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/5 border border-blue-500/20 rounded-3xl p-6 shadow-xl flex flex-col justify-between hover:bg-blue-500/10 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-blue-500/20 rounded-xl"><MapPin className="w-6 h-6 text-blue-400" /></div>
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Distance Walked</h3>
              </div>
              <div className="text-5xl font-black text-white">{stats.distance}<span className="text-2xl text-slate-500 ml-1">km</span></div>
              <div className="text-xs text-blue-400 font-medium mt-2">Today</div>
            </div>

            <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-green-500/20 rounded-3xl p-6 shadow-xl flex flex-col justify-between hover:bg-green-500/10 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-green-500/20 rounded-xl"><Heart className="w-6 h-6 text-green-400" /></div>
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Volunteer Assists</h3>
              </div>
              <div className="text-5xl font-black text-white">{stats.assists}</div>
              <div className="text-xs text-green-400 font-medium mt-2">Today</div>
            </div>
          </div>

          {/* Bus Tracking Panel (Span 1) */}
          <div className="lg:col-span-1 bg-white/[0.02] backdrop-blur-md border border-white/5 rounded-3xl p-6 shadow-xl flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Bus className="w-5 h-5 text-amber-500" /> Transit Info
              </h2>
              <button 
                onClick={handleRefreshBus}
                disabled={isRefreshing}
                className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/5 disabled:opacity-50"
                aria-label="Refresh bus times"
              >
                <RefreshCw className={`w-4 h-4 text-slate-300 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="space-y-4 flex-1">
              {busStops.map(stop => (
                <div key={stop.id} className="bg-black/30 border border-white/5 p-4 rounded-2xl relative overflow-hidden">
                  <div className={`absolute left-0 top-0 w-1 h-full ${stop.eta < 120 ? 'bg-red-500' : 'bg-amber-500'}`} />
                  <div className="flex justify-between items-start mb-2 pl-2">
                    <div className="font-bold text-sm text-white truncate max-w-[120px]">{stop.name}</div>
                    <div className="text-xs font-black bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20">
                      {stop.nextBus}
                    </div>
                  </div>
                  <div className="flex justify-between items-end pl-2">
                    <div className="text-xs text-slate-500 font-medium">{stop.distance} away</div>
                    <div className="text-right">
                      <div className={`text-xl font-black leading-none ${stop.eta < 120 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                        {Math.floor(stop.eta / 60)}m {stop.eta % 60}s
                      </div>
                      <div className="text-[10px] uppercase font-bold text-slate-500 mt-1">ETA</div>
                    </div>
                  </div>
                </div>
              ))}
              {busStops.length === 0 && (
                <div className="text-center text-sm text-slate-500 py-4 font-medium">
                  No bus stops nearby.
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Global styles for Custom Map Markers and Scrollbars */}
      <style>{`
        .custom-popup .leaflet-popup-content-wrapper {
          background-color: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(8px);
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.5);
          padding: 2px;
        }
        .custom-popup .leaflet-popup-tip {
          background-color: rgba(255, 255, 255, 0.95);
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
};
