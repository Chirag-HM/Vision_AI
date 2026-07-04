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
}

export const Features: React.FC = () => {
  const { isSimpleMode, speak } = useAccessibility();

  const featureList: FeatureItem[] = [
    {
      icon: Mic,
      title: 'Voice AI Control',
      desc: 'Real-time OpenAI Whisper converts spoken voice into action commands instantly. Speech commands like "navigate to hospital" or "describe surroundings" are spoken back in natural voices.',
      ariaLabel: 'Feature 1: Voice AI Control. Double tap button on stick to give vocal commands.',
    },
    {
      icon: Activity,
      title: 'Distance Awareness',
      desc: 'HC-SR04 Ultrasonic sensor maps forward obstacles. Triggers light motor vibration for objects under 2m, and ultra-strong pulsing vibration with voice alarms under 1m.',
      ariaLabel: 'Feature 2: Distance Awareness. Radar obstacle warning system.',
    },
    {
      icon: Bus,
      title: 'Live Bus Tracking',
      desc: 'Connects directly to Transit APIs to locate nearby routes and ETAs. Automatically broadcasts local bus arrival announcements directly via the stick speaker when a bus is 2 minutes away.',
      ariaLabel: 'Feature 3: Live Bus Tracking. Announces arrivals.',
    },
    {
      icon: Compass,
      title: 'Active Navigation',
      desc: 'NEO-6M GPS module streams your real-time coordinates. Integrates turn-by-turn routing with clean audio prompts spoken aloud to guide you step-by-step through any street.',
      ariaLabel: 'Feature 4: Active Navigation. Step-by-step vocal directions.',
    },
    {
      icon: Camera,
      title: 'Scene Description',
      desc: 'Raspberry Pi Camera feeds active streams to the cloud. YOLOv8 processes frames to recognize vehicles, crosswalks, obstacles, or people, and narrates descriptions dynamically.',
      ariaLabel: 'Feature 5: Scene Description. Real-time vision-to-speech engine.',
    },
    {
      icon: Users,
      title: 'Volunteer Support',
      desc: 'Need human assistance? Instantly request backup via stick button or voice command. Connects automatically to registered volunteers on our platform via real-time WebRTC audio/video call.',
      ariaLabel: 'Feature 6: Volunteer Support. Connect to a helper in real-time.',
    },
    {
      icon: MapPin,
      title: 'Location Sharing',
      desc: 'Keeps families and caregivers stress-free by sharing real-time precise GPS coordinates via a dedicated dashboard. Leverages highly secure WebSocket channels.',
      ariaLabel: 'Feature 7: Location Sharing. Stream coordinates to family dashboard.',
    },
    {
      icon: BellRing,
      title: 'SOS Panic Alert',
      desc: 'Fitted with a dedicated tactile emergency button. An immediate tap or vocal "SOS" command dispatches emergency SMS and emails containing your exact Mapbox coordinates to emergency contacts.',
      ariaLabel: 'Feature 8: SOS Panic Alert. Tap or voice command to alert family.',
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
                className="border-4 border-white p-6 bg-black focus:ring-4 focus:ring-[#e8ff47] cursor-pointer"
                tabIndex={0}
                role="button"
                aria-label={item.ariaLabel}
                onClick={() => speak(`${item.title}: ${item.desc}`)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') speak(`${item.title}: ${item.desc}`);
                }}
              >
                <div className="flex items-center gap-4 mb-4">
                  <Icon className="w-12 h-12 text-[#e8ff47]" />
                  <h2 className="text-3xl font-black">{index + 1}. {item.title}</h2>
                </div>
                <p className="text-2xl leading-relaxed">{item.desc}</p>
                <span className="block mt-4 text-xl font-bold text-[#e8ff47]">
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
    <div className="min-h-screen pt-32 pb-24 text-white relative overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 relative z-10">
        
        {/* Header copy */}
        <div className="text-center max-w-3xl mx-auto mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="w-12 h-[1px] bg-[#e8ff47]" />
              <span className="text-[11px] tracking-[0.3em] uppercase text-gray-400 font-sans">
                Technology Core
              </span>
              <div className="w-12 h-[1px] bg-[#e8ff47]" />
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter uppercase mb-8">
              Smart <br className="md:hidden" />
              <span className="text-[#e8ff47] drop-shadow-[0_0_30px_rgba(232,255,71,0.15)]">Capabilities</span>
            </h1>
            
            <p className="text-gray-400 text-lg md:text-xl font-sans leading-relaxed">
              Inside the AI Walking Stick: eight unified assistive hardware and software technologies working in perfect sync.
            </p>
          </motion.div>
        </div>

        {/* 8 Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {featureList.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.article
                key={index}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 + index * 0.05, ease: [0.16, 1, 0.3, 1] }}
                className="group relative bg-white/[0.02] backdrop-blur-md border border-white/[0.05] p-8 rounded-3xl flex flex-col justify-between transition-all duration-500 hover:-translate-y-2 hover:bg-white/[0.04]"
                aria-label={item.ariaLabel}
                onClick={() => speak(`Feature ${index + 1}: ${item.title}`)}
                role="button"
                tabIndex={0}
              >
                {/* Hover Glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none rounded-3xl"
                  style={{ background: 'radial-gradient(circle at 50% 0%, rgba(232,255,71,0.08) 0%, transparent 70%)' }}
                />

                <div className="space-y-6 relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center group-hover:bg-[#e8ff47]/10 group-hover:border-[#e8ff47]/20 transition-all duration-500">
                    <Icon className="w-6 h-6 text-white group-hover:text-[#e8ff47] transition-colors duration-500" />
                  </div>
                  
                  <div>
                    <h2 className="text-xl font-bold text-white mb-3 tracking-tight group-hover:text-[#e8ff47] transition-colors duration-300">{item.title}</h2>
                    <p className="text-gray-500 leading-relaxed text-sm font-sans">{item.desc}</p>
                  </div>
                </div>

                <div className="pt-6 mt-8 flex items-center justify-between relative z-10">
                  <div className="absolute top-0 left-0 right-0 h-[1px] bg-white/5 group-hover:bg-gradient-to-r group-hover:from-transparent group-hover:via-[#e8ff47]/30 group-hover:to-transparent transition-all duration-500" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-600 group-hover:text-gray-400 transition-colors">
                    Module 0{index + 1}
                  </span>
                  <div className="w-1.5 h-1.5 rounded-full bg-white/20 group-hover:bg-[#e8ff47] group-hover:animate-pulse transition-colors" />
                </div>
              </motion.article>
            );
          })}
        </div>

      </div>
    </div>
  );
};
