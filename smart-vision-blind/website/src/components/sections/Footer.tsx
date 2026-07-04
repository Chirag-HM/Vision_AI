import React from "react";
import { Link } from "react-router-dom";

export const Footer: React.FC = () => {
  return (
    <footer className="relative z-10 border-t border-white/5 bg-[#080808]">
      <div className="max-w-7xl mx-auto px-6 md:px-24 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="md:col-span-2">
            <h3 className="text-2xl font-bold tracking-tight mb-4">
              SMART <span className="text-[#e8ff47]">VISION</span>
            </h3>
            <p className="text-gray-500 font-sans leading-relaxed max-w-md text-sm">
              An open-source assistive technology initiative building
              AI-powered walking sticks for the visually impaired.
              Edge computing. Zero latency. Full independence.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] text-gray-400 mb-6">Navigate</h4>
            <ul className="space-y-3">
              {[
                { label: "Features", to: "/features" },
                { label: "Dashboard", to: "/dashboard" },
                { label: "Volunteer", to: "/volunteer" },
                { label: "SOS Panel", to: "/sos" },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-gray-500 hover:text-white transition-colors text-sm font-sans"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Tech Stack */}
          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] text-gray-400 mb-6">Built With</h4>
            <ul className="space-y-3 text-sm text-gray-500 font-sans">
              <li>Raspberry Pi 4</li>
              <li>YOLO v8 Vision</li>
              <li>FastAPI + WebSocket</li>
              <li>React + Three.js</li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-600 font-sans">
            © {new Date().getFullYear()} Smart Vision. Open Source under MIT License.
          </p>
          <div className="flex items-center gap-6">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-[#e8ff47] transition-colors text-xs uppercase tracking-widest"
            >
              GitHub
            </a>
            <span className="text-gray-800">·</span>
            <span className="text-xs text-gray-600 font-mono">v2.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
