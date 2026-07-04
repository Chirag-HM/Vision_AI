import React, { useEffect } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useScrollProgress } from "../../hooks/useScrollProgress";
import { Link } from "react-router-dom";

export const HeroSection: React.FC = () => {
  const progress = useScrollProgress();
  const yOffset = progress * 400;
  const heroOpacity = Math.max(0, 1 - progress * 3); // Fade out as user scrolls

  // Mouse parallax for hero content
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 10;
      mouseX.set(x);
      mouseY.set(y);
    };
    window.addEventListener("mousemove", handleMouse, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouse);
  }, [mouseX, mouseY]);

  const textVariants = {
    hidden: { opacity: 0, y: 60, filter: "blur(8px)" },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        delay: 0.3 + i * 0.15,
        duration: 1,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
      },
    }),
  };

  return (
    <section className="relative min-h-[100svh] w-full flex items-center justify-center px-6 py-24 overflow-hidden">
      {/* Radial gradient vignette — ensures text pops over 3D */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 70% 60% at 50% 50%, rgba(8,8,8,0.6) 0%, transparent 70%),
            linear-gradient(to bottom, transparent 60%, rgba(8,8,8,0.8) 100%)
          `,
        }}
      />

      <motion.div
        className="text-center z-10 flex flex-col items-center max-w-5xl relative"
        style={{ y: yOffset, x: springX, opacity: heroOpacity }}
      >
        {/* Floating badge */}
        <motion.div
          custom={0}
          initial="hidden"
          animate="visible"
          variants={textVariants}
          className="mb-8 inline-block"
        >
          <span className="glass px-5 py-2 rounded-full text-[11px] font-semibold tracking-[0.2em] text-[#e8ff47] uppercase inline-flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#e8ff47] animate-pulse" />
            Assistive Technology · Est. 2026
          </span>
        </motion.div>

        {/* Main heading */}
        <h1 className="text-[12vw] md:text-[10vw] lg:text-[8rem] xl:text-[10rem] font-black tracking-tighter mb-6 md:mb-8 leading-[0.85]">
          <motion.span
            custom={1}
            initial="hidden"
            animate="visible"
            variants={textVariants}
            className="block shimmer-text"
          >
            Eyes for
          </motion.span>
          <motion.span
            custom={2}
            initial="hidden"
            animate="visible"
            variants={textVariants}
            className="block text-[#e8ff47] drop-shadow-[0_0_40px_rgba(232,255,71,0.15)]"
          >
            the World.
          </motion.span>
        </h1>

        {/* Subtitle */}
        <motion.p
          custom={3}
          initial="hidden"
          animate="visible"
          variants={textVariants}
          className="text-base md:text-lg text-gray-400 max-w-xl mx-auto mb-12 font-sans leading-relaxed"
        >
          An intelligent walking stick that sees, speaks, and guides — giving
          independence back to the visually impaired through AI & real-time IoT.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          custom={4}
          initial="hidden"
          animate="visible"
          variants={textVariants}
          className="flex flex-wrap gap-4 justify-center"
        >
          <Link
            to="/features"
            className="group relative px-8 py-4 bg-[#e8ff47] text-[#080808] font-bold tracking-wide uppercase text-sm overflow-hidden hover:shadow-[0_0_30px_rgba(232,255,71,0.3)] transition-shadow duration-500"
          >
            <span className="relative z-10">Explore Features</span>
            <div className="absolute inset-0 bg-white/30 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12" />
          </Link>
          <Link
            to="/dashboard"
            className="glass px-8 py-4 text-white font-bold tracking-wide uppercase text-sm hover:bg-white/10 transition-all duration-300 border border-white/10"
          >
            Live Dashboard
          </Link>
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden sm:flex flex-col items-center gap-2 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: heroOpacity > 0.5 ? 1 : 0 }}
        transition={{ duration: 0.5 }}
      >
        <span className="text-[10px] tracking-[0.3em] uppercase text-gray-500 font-sans">
          Scroll
        </span>
        <div className="w-[1px] h-10 bg-gradient-to-b from-gray-500 to-transparent scroll-bounce" />
      </motion.div>
    </section>
  );
};
