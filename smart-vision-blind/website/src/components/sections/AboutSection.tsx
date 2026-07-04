import React, { useRef } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";

// Animated counter component
function AnimatedStat({ value, suffix = "", label }: { value: string; suffix?: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <div ref={ref}>
      <motion.div
        className="text-3xl md:text-4xl font-bold text-white mb-2"
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <span className="text-[#e8ff47]">{value}</span>
        {suffix}
      </motion.div>
      <div className="text-[10px] uppercase tracking-[0.2em] text-gray-500">{label}</div>
    </div>
  );
}

export const AboutSection: React.FC = () => {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0.15, 0.35, 0.65, 0.85], [0, 1, 1, 0]);
  const y = useTransform(scrollYProgress, [0.15, 0.35], [80, 0]);
  const scale = useTransform(scrollYProgress, [0.15, 0.35, 0.65, 0.85], [0.96, 1, 1, 0.96]);

  return (
    <section ref={containerRef} className="relative h-[150vh] w-full z-10">
      <div className="sticky top-0 h-screen w-full flex items-center px-6 md:px-24">
        <motion.div
          style={{ opacity, y, scale }}
          className="relative p-10 md:p-16 rounded-3xl max-w-2xl overflow-hidden"
        >
          {/* Glass background with stronger visibility */}
          <div
            className="absolute inset-0 rounded-3xl"
            style={{
              background: "linear-gradient(135deg, rgba(8,8,8,0.75) 0%, rgba(20,15,40,0.6) 100%)",
              border: "1px solid rgba(255,255,255,0.08)",
              backdropFilter: "blur(30px)",
              WebkitBackdropFilter: "blur(30px)",
            }}
          />

          {/* Accent glow on top-left corner */}
          <div
            className="absolute -top-20 -left-20 w-60 h-60 rounded-full pointer-events-none"
            style={{
              background: "radial-gradient(circle, rgba(232,255,71,0.06) 0%, transparent 70%)",
            }}
          />

          {/* Content */}
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-[1px] bg-[#e8ff47]" />
              <span className="text-[11px] tracking-[0.2em] uppercase text-gray-400 font-sans">
                The Technology
              </span>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold mb-8 leading-[1.05]">
              Edge-computed vision <br />
              <span className="text-gray-500">at 30 frames per second.</span>
            </h2>

            <div className="space-y-5 text-gray-400 font-sans leading-relaxed text-[15px]">
              <p>
                Vision AI combines an HC-SR04 ultrasonic sonar with a
                high-definition camera module, all processed locally on a
                Raspberry Pi. No internet required for core survival features.
              </p>
              <p>
                Our custom-trained YOLO v8 pipeline instantly identifies
                obstacles, text, and faces, translating visual data into spatial
                audio cues through your earpiece.
              </p>
            </div>

            {/* Stats */}
            <div className="mt-10 grid grid-cols-3 gap-6 border-t border-white/8 pt-8">
              <AnimatedStat value="98%" label="Object Detection" />
              <AnimatedStat value="<50" suffix="ms" label="Audio Latency" />
              <AnimatedStat value="30" suffix="fps" label="Edge Processing" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
