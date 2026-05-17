import React from 'react';
import { useAccessibility } from '../context/AccessibilityContext';
import { motion } from 'framer-motion';
import {
  Mic,
  Activity,
  Bus,
  Compass,
  Camera,
  Users,
  MapPin,
  BellRing
} from 'lucide-react';

interface FeatureItem {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
  ariaLabel: string;
  color: string;
}

export const Features: React.FC = () => {
  const { isSimpleMode, speak } = useAccessibility();

  const featureList: FeatureItem[] = [
    {
      icon: Mic,
      title: 'Voice AI Control',
      desc: 'Real-time OpenAI Whisper converts spoken voice into action commands instantly. Speech commands like "navigate to hospital" or "describe surroundings" are spoken back in natural voices.',
      ariaLabel: 'Feature 1: Voice AI Control. Double tap button on stick to give vocal commands.',
      color: 'border-blue-500/30 text-blue-400 shadow-blue-500/5',
    },
    {
      icon: Activity,
      title: 'Distance Awareness',
      desc: 'HC-SR04 Ultrasonic sensor maps forward obstacles. Triggers light motor vibration for objects under 2m, and ultra-strong pulsing vibration with voice alarms under 1m.',
      ariaLabel: 'Feature 2: Distance Awareness. Radar obstacle warning system.',
      color: 'border-amber-500/30 text-amber-400 shadow-amber-500/5',
    },
    {
      icon: Bus,
      title: 'Live Bus Tracking',
      desc: 'Connects directly to Transit APIs to locate nearby routes and ETAs. Automatically broadcasts local bus arrival announcements directly via the stick speaker when a bus is 2 minutes away.',
      ariaLabel: 'Feature 3: Live Bus Tracking. Announces arrivals.',
      color: 'border-blue-500/30 text-blue-400 shadow-blue-500/5',
    },
    {
      icon: Compass,
      title: 'Active Navigation',
      desc: 'NEO-6M GPS module streams your real-time coordinates. Integrates turn-by-turn routing with clean audio prompts spoken aloud to guide you step-by-step through any street.',
      ariaLabel: 'Feature 4: Active Navigation. Step-by-step vocal directions.',
      color: 'border-amber-500/30 text-amber-400 shadow-amber-500/5',
    },
    {
      icon: Camera,
      title: 'Scene Description',
      desc: 'Raspberry Pi Camera feeds active streams to the cloud. YOLOv8 processes frames to recognize vehicles, crosswalks, obstacles, or people, and narrates descriptions dynamically.',
      ariaLabel: 'Feature 5: Scene Description. Real-time vision-to-speech engine.',
      color: 'border-blue-500/30 text-blue-400 shadow-blue-500/5',
    },
    {
      icon: Users,
      title: 'Volunteer Support',
      desc: 'Need human assistance? Instantly request backup via stick button or voice command. Connects automatically to registered volunteers on our platform via real-time WebRTC audio/video call.',
      ariaLabel: 'Feature 6: Volunteer Support. Connect to a helper in real-time.',
      color: 'border-amber-500/30 text-amber-400 shadow-amber-500/5',
    },
    {
      icon: MapPin,
      title: 'Location Sharing',
      desc: 'Keeps families and caregivers stress-free by sharing real-time precise GPS coordinates via a dedicated dashboard. Leverages highly secure WebSocket channels.',
      ariaLabel: 'Feature 7: Location Sharing. Stream coordinates to family dashboard.',
      color: 'border-blue-500/30 text-blue-400 shadow-blue-500/5',
    },
    {
      icon: BellRing,
      title: 'SOS Panic Alert',
      desc: 'Fitted with a dedicated tactile emergency button. An immediate tap or vocal "SOS" command dispatches emergency SMS and emails containing your exact Mapbox coordinates to emergency contacts.',
      ariaLabel: 'Feature 8: SOS Panic Alert. Tap or voice command to alert family.',
      color: 'border-red-500/30 text-red-400 shadow-red-500/5',
    },
  ];

  // 1. SIMPLE ACCESSIBLE LAYOUT
  if (isSimpleMode) {
    return (
      <main className="max-w-4xl mx-auto px-6 py-12 text-white">
        <h1 className="text-5xl font-black mb-4 border-b-4 border-white pb-4">
          PRODUCT FEATURES LIST
        </h1>
        <p className="text-2xl mb-8">
          Tab through the 8 core features of Smart Vision below. Pressing enter on a feature will read its detailed description aloud.
        </p>

        <div className="space-y-8">
          {featureList.map((item, index) => {
            const Icon = item.icon;
            return (
              <article
                key={index}
                className="border-4 border-white p-6 bg-black focus:ring-4 focus:ring-yellow-400 cursor-pointer"
                tabIndex={0}
                role="button"
                aria-label={item.ariaLabel}
                onClick={() => speak(`${item.title}: ${item.desc}`)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') speak(`${item.title}: ${item.desc}`);
                }}
              >
                <div className="flex items-center gap-4 mb-4">
                  <Icon className="w-12 h-12 text-yellow-400" />
                  <h2 className="text-3xl font-black">{index + 1}. {item.title}</h2>
                </div>
                <p className="text-2xl leading-relaxed">{item.desc}</p>
                <span className="block mt-4 text-xl font-bold text-yellow-400">
                  [Press Enter or Tap to listen]
                </span>
              </article>
            );
          })}
        </div>
      </main>
    );
  }

  // 2. PREMIUM DYNAMIC DARK-THEME LAYOUT
  return (
    <div className="min-h-screen bg-[#0a0f2c] pt-28 pb-16 text-white relative">
      <div className="absolute top-10 right-10 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Header copy */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <h1 className="text-4xl md:text-6xl font-black bg-gradient-to-r from-white to-blue-400 bg-clip-text text-transparent">
            Smart Capabilities
          </h1>
          <p className="text-slate-400 text-lg">
            Inside the AI Walking Stick: eight unified assistive hardware and software technologies working in perfect sync.
          </p>
        </div>

        {/* 8 Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {featureList.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.article
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className={`bg-white/[0.03] backdrop-blur-md border border-white/10 p-6 rounded-3xl flex flex-col justify-between shadow-lg hover:shadow-2xl transition-all duration-300 focus-within:ring-2 focus-within:ring-blue-500 ${item.color}`}
                aria-label={item.ariaLabel}
                onClick={() => speak(`Feature ${index + 1}: ${item.title}`)}
              >
                <div className="space-y-4">
                  <div className="bg-white/5 p-3 rounded-2xl w-fit border border-white/5">
                    <Icon className="w-8 h-8" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">{item.title}</h2>
                  <p className="text-slate-400 leading-relaxed text-sm">{item.desc}</p>
                </div>

                <div className="pt-6 border-t border-white/5 mt-6 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">SYSTEM MODULE {index + 1}</span>
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                </div>
              </motion.article>
            );
          })}
        </div>

      </div>
    </div>
  );
};
