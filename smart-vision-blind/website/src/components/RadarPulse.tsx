import React from 'react';
import { motion } from 'framer-motion';

export const RadarPulse: React.FC = () => {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {/* 3 Sonar Wave Pulses */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute border-2 border-blue-500/20 rounded-full"
          initial={{ width: 100, height: 100, opacity: 0.8 }}
          animate={{
            width: [100, 450],
            height: [100, 450],
            opacity: [0.8, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: i * 1,
            ease: 'easeOut',
          }}
        />
      ))}

      {/* Internal Glowing Radar Core */}
      <motion.div
        className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/30 shadow-lg shadow-blue-500/20"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  );
};
