import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export const ContactSection: React.FC = () => {
  return (
    <section className="relative min-h-[80vh] w-full flex items-center justify-center px-6 z-10 pb-32">
      {/* Gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-transparent z-0" />

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="relative max-w-4xl w-full text-center z-10"
      >
        {/* Card with gradient border effect */}
        <div
          className="relative p-12 md:p-20 rounded-3xl overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(15,12,30,0.8) 0%, rgba(8,8,8,0.9) 100%)",
            border: "1px solid rgba(255,255,255,0.06)",
            backdropFilter: "blur(24px)",
          }}
        >
          {/* Accent glow top */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[200px] pointer-events-none"
            style={{
              background: "radial-gradient(ellipse, rgba(232,255,71,0.06) 0%, transparent 70%)",
            }}
          />

          <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-8 leading-[1.05]">
            Ready to give someone their{" "}
            <br className="hidden md:block" />
            <span className="text-[#e8ff47] drop-shadow-[0_0_20px_rgba(232,255,71,0.12)]">
              independence back?
            </span>
          </h2>

          <p className="text-gray-400 font-sans max-w-xl mx-auto mb-12 text-base leading-relaxed">
            Join the network. Monitor users via the live dashboard or sign up as
            a sighted volunteer to assist visually impaired individuals globally.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
            <Link
              to="/dashboard"
              className="group relative flex items-center gap-3 px-8 py-4 bg-[#e8ff47] text-[#080808] font-bold tracking-wide uppercase text-sm overflow-hidden hover:shadow-[0_0_30px_rgba(232,255,71,0.3)] transition-shadow duration-500"
            >
              <span className="relative z-10">Open Dashboard</span>
              <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
              <div className="absolute inset-0 bg-white/30 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12" />
            </Link>
            <Link
              to="/volunteer"
              className="px-8 py-4 text-white border border-white/10 font-bold tracking-wide uppercase text-sm hover:bg-white/5 hover:border-white/20 transition-all duration-300"
            >
              Become a Volunteer
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
};
