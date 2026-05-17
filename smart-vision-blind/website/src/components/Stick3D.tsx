import React from 'react';

export const Stick3D: React.FC = () => {
  return (
    <div className="w-full h-[450px] relative flex items-center justify-center overflow-hidden [perspective:1000px] select-none">
      
      {/* Outer 3D Scene */}
      <div 
        className="relative w-32 h-[380px] [transform-style:preserve-3d] animate-[spin3D_16s_linear_infinite] hover:[animation-play-state:paused] cursor-grab active:cursor-grabbing"
        style={{ transform: 'rotateX(-15deg) rotateY(45deg)' }}
      >
        
        {/* 1. MAIN WHITE CANE SHAFT (3D Prism Tube) */}
        {/* Face Front */}
        <div 
          className="absolute left-1/2 top-10 w-2.5 h-[280px] bg-gradient-to-b from-slate-100 to-white border-r border-white/40 shadow-[0_0_20px_rgba(255,255,255,0.4)]"
          style={{ transform: 'translateX(-50%) translateZ(5px)' }}
        />
        {/* Face Back */}
        <div 
          className="absolute left-1/2 top-10 w-2.5 h-[280px] bg-gradient-to-b from-slate-300 to-slate-200"
          style={{ transform: 'translateX(-50%) translateZ(-5px) rotateY(180deg)' }}
        />
        {/* Face Left */}
        <div 
          className="absolute left-1/2 top-10 w-2.5 h-[280px] bg-gradient-to-b from-slate-200 to-slate-100"
          style={{ transform: 'translateX(-50%) translateX(-5px) rotateY(-90deg)' }}
        />
        {/* Face Right */}
        <div 
          className="absolute left-1/2 top-10 w-2.5 h-[280px] bg-gradient-to-b from-slate-200 to-slate-100"
          style={{ transform: 'translateX(-50%) translateX(5px) rotateY(90deg)' }}
        />

        {/* 2. CURVED HANDLE GRIP (Top of stick) */}
        {/* Main Grip */}
        <div 
          className="absolute left-1/2 top-0 w-3.5 h-12 bg-gradient-to-b from-gray-900 to-[#111827] rounded-t-lg border-x border-white/5"
          style={{ transform: 'translateX(-50%) translateZ(6px)' }}
        />
        {/* Curving Hook Piece */}
        <div 
          className="absolute left-[40%] top-[-8px] w-5 h-3 bg-[#111827] rounded-tl-full border-t border-l border-white/10"
          style={{ transform: 'translateZ(6px)' }}
        />

        {/* 3. SLEEK SENSOR MODULE HOUSING (Electric Blue Glass Pod in Middle) */}
        <div 
          className="absolute left-1/2 top-28 w-12 h-20 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 border border-blue-400/30 rounded-2xl shadow-[0_0_30px_rgba(59,130,246,0.5)] [transform-style:preserve-3d]"
          style={{ transform: 'translateX(-50%) translateZ(8px)' }}
        >
          {/* Glowing Green Ultrasound Eyes (Front Facing) */}
          <div className="absolute top-4 left-2 w-3 h-3 bg-[#64FFDA] rounded-full border border-white shadow-[0_0_12px_#64FFDA] animate-pulse" />
          <div className="absolute top-4 right-2 w-3 h-3 bg-[#64FFDA] rounded-full border border-white shadow-[0_0_12px_#64FFDA] animate-pulse" />
          
          {/* Futuristic Amber Accent Line */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-8 h-1 bg-amber-500 rounded-full shadow-[0_0_8px_#f59e0b]" />
        </div>

        {/* 4. GOLD GLOWING LED SAFETY RING (Lower part) */}
        <div 
          className="absolute left-1/2 top-[220px] w-4.5 h-3.5 bg-gradient-to-r from-amber-400 to-amber-500 rounded-md border border-amber-300/30 shadow-[0_0_20px_rgba(245,158,11,0.6)]"
          style={{ transform: 'translateX(-50%) translateZ(6px)' }}
        />

        {/* 5. RED CANE TIP (Bottom) */}
        <div 
          className="absolute left-1/2 top-[280px] w-3 h-4 bg-gradient-to-b from-red-500 to-red-700 rounded-b-md shadow-[0_0_10px_rgba(239,68,68,0.4)]"
          style={{ transform: 'translateX(-50%) translateZ(5px)' }}
        />

        {/* Ambient Floating Dust/Particle Elements behind */}
        <div className="absolute inset-0 pointer-events-none [transform-style:preserve-3d]">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-blue-400 rounded-full opacity-60 shadow-[0_0_8px_#3b82f6]"
              style={{
                top: `${20 + i * 50}px`,
                left: `${Math.sin(i) * 40 + 40}px`,
                transform: `translateZ(${Math.cos(i) * 30}px)`,
              }}
            />
          ))}
        </div>

      </div>

      {/* Embedded CSS for 3D Animations */}
      <style>{`
        @keyframes spin3D {
          0% {
            transform: rotateX(-15deg) rotateY(0deg);
          }
          100% {
            transform: rotateX(-15deg) rotateY(360deg);
          }
        }
      `}</style>

    </div>
  );
};
