import React from "react";
import { motion } from "framer-motion";
import { Shield, Volume2, MapPin, Eye, Users, Bus } from "lucide-react";

const features = [
  {
    icon: <Shield className="w-5 h-5" />,
    title: "Obstacle Avoidance",
    desc: "Ultrasonic sonar alerts with real-time vibration feedback within a 1m radius.",
    tag: "01",
  },
  {
    icon: <Volume2 className="w-5 h-5" />,
    title: "AI Voice Guidance",
    desc: "YOLO vision model narrates the environment through a wireless earpiece.",
    tag: "02",
  },
  {
    icon: <MapPin className="w-5 h-5" />,
    title: "GPS Telemetry",
    desc: "Live coordinates stream to the caregiver dashboard with interactive mapping.",
    tag: "03",
  },
  {
    icon: <Eye className="w-5 h-5" />,
    title: "Scene Recognition",
    desc: "Camera pipeline identifies text, faces, and hazards at up to 30fps.",
    tag: "04",
  },
  {
    icon: <Users className="w-5 h-5" />,
    title: "Volunteer Network",
    desc: "One-tap WebRTC video call connecting users to sighted helpers globally.",
    tag: "05",
  },
  {
    icon: <Bus className="w-5 h-5" />,
    title: "Transit Alerts",
    desc: "Announces arriving bus route numbers via GTFS API in real-time.",
    tag: "06",
  },
];

export const FeaturesSection: React.FC = () => {
  return (
    <section className="relative min-h-screen w-full px-6 md:px-24 py-32 z-10">
      {/* Top gradient fade for smooth transition from About */}
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#080808]/80 to-transparent pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-20"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-[1px] bg-[#e8ff47]" />
            <span className="text-[11px] tracking-[0.2em] uppercase text-gray-400 font-sans">
              Capabilities
            </span>
          </div>
          <h2 className="text-5xl md:text-7xl font-bold tracking-tighter">
            Built to <br />
            <span className="text-gray-600">empower.</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, i) => (
            <motion.div
              key={feature.tag}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="group relative p-8 rounded-2xl overflow-hidden transition-all duration-500 hover:-translate-y-1"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              {/* Hover glow */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(circle at 30% 20%, rgba(232,255,71,0.04) 0%, transparent 60%)",
                }}
              />

              {/* Tag number */}
              <div className="absolute top-4 right-6 text-5xl font-black italic text-white/[0.04] group-hover:text-white/[0.08] transition-colors duration-500 select-none">
                {feature.tag}
              </div>

              {/* Icon */}
              <div className="w-12 h-12 rounded-xl bg-[#e8ff47]/8 border border-[#e8ff47]/15 flex items-center justify-center text-[#e8ff47] mb-6 group-hover:bg-[#e8ff47]/12 group-hover:border-[#e8ff47]/25 transition-all duration-500">
                {feature.icon}
              </div>

              <h3 className="text-lg font-bold mb-3 tracking-tight">{feature.title}</h3>
              <p className="text-gray-500 font-sans leading-relaxed text-sm">
                {feature.desc}
              </p>

              {/* Bottom accent line */}
              <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#e8ff47]/20 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-700" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
