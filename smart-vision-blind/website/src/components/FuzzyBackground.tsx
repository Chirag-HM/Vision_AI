import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

export const FuzzyBackground: React.FC = () => {
  const location = useLocation();

  // Mouse tracking for interactive background
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 40, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 40, damping: 20 });
  const bgX = useTransform(springX, [-0.5, 0.5], [-200, 200]);
  const bgY = useTransform(springY, [-0.5, 0.5], [-200, 200]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX / window.innerWidth - 0.5);
      mouseY.set(e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  // Do not render on Home page (Hero section) because it has the 3D scene
  if (location.pathname === '/') return null;

  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none bg-[#080808] overflow-hidden">
      {/* Fuzzy Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/login_bg.png" 
          alt="" 
          className="w-full h-full object-cover opacity-90 scale-110 blur-[40px] animate-pulse-slow" 
        />
        {/* Lighter overlay to let the image show through while keeping contrast */}
        <div className="absolute inset-0 bg-[#080808]/30 mix-blend-multiply" />
      </div>

      {/* Interactive Ambient Glow */}
      <motion.div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] pointer-events-none"
        style={{
          x: bgX,
          y: bgY,
          background: 'radial-gradient(circle at 50% 50%, rgba(232,255,71,0.08) 0%, transparent 60%)'
        }}
      />
      <motion.div 
        className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#e8ff47]/5 rounded-full blur-[150px] pointer-events-none" 
        animate={{ 
          x: [0, 100, 0],
          y: [0, -50, 0],
          scale: [1, 1.2, 1]
        }}
        transition={{ 
          duration: 12, 
          repeat: Infinity,
          ease: "easeInOut" 
        }}
      />
      <motion.div 
        className="absolute top-[20%] right-[-5%] w-[400px] h-[400px] bg-white/5 rounded-full blur-[120px] pointer-events-none" 
        animate={{ 
          x: [0, -80, 0],
          y: [0, 60, 0],
          scale: [1, 1.3, 1]
        }}
        transition={{ 
          duration: 15, 
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
      />
    </div>
  );
};
