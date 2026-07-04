import React, { useRef, useEffect, lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { useAccessibility } from "../context/AccessibilityContext";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { HeroSection } from "../components/sections/HeroSection";
import { AboutSection } from "../components/sections/AboutSection";
import { FeaturesSection } from "../components/sections/FeaturesSection";
import { ContactSection } from "../components/sections/ContactSection";
import { Footer } from "../components/sections/Footer";
import { Cursor } from "../components/Cursor";

// Lazy-load the heavy 3D scene — it's the biggest bundle chunk
const Scene = lazy(() =>
  import("../components/3d/Scene").then((m) => ({ default: m.Scene }))
);

export const Home: React.FC = () => {
  const { isSimpleMode, speak } = useAccessibility();
  const scrollProgress = useRef<number>(0);

  useEffect(() => {
    if (isSimpleMode) return;

    const onScroll = () => {
      const maxScroll = document.body.scrollHeight - window.innerHeight;
      scrollProgress.current = maxScroll > 0 ? window.scrollY / maxScroll : 0;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isSimpleMode]);

  // ── Simple accessible mode ─────────────────────────────────────────────
  if (isSimpleMode) {
    return (
      <main className="max-w-4xl mx-auto px-6 py-12 text-white" role="main">
        <h1 className="text-5xl font-black mb-6 border-b-4 border-white pb-4">
          SMART VISION — EYES FOR THE WORLD
        </h1>
        <p className="text-3xl font-bold leading-relaxed mb-8">
          An intelligent walking stick that sees, speaks, and guides.
        </p>
        <div className="flex flex-col gap-6 mb-12">
          <Link
            to="/features"
            onClick={() => speak("Features")}
            className="w-full bg-yellow-400 text-black text-3xl font-black py-6 text-center border-4 border-white hover:bg-yellow-300 focus:ring-8 focus:ring-yellow-400 block"
          >
            1. EXPLORE FEATURES
          </Link>
          <Link
            to="/dashboard"
            onClick={() => speak("Dashboard")}
            className="w-full bg-white text-black text-3xl font-black py-6 text-center border-4 border-yellow-400 hover:bg-gray-200 focus:ring-8 focus:ring-yellow-400 block"
          >
            2. LIVE DASHBOARD
          </Link>
          <Link
            to="/sos"
            onClick={() => speak("SOS")}
            className="w-full bg-red-600 text-white text-3xl font-black py-6 text-center border-4 border-white hover:bg-red-500 focus:ring-8 focus:ring-yellow-400 block animate-pulse"
          >
            3. REQUEST SOS HELP
          </Link>
        </div>
      </main>
    );
  }

  // ── Premium 3D Awwwards-style layout ──────────────────────────────────
  return (
    <>
      <Cursor />

      {/* Fixed 3D canvas — behind everything, wrapped in error boundary */}
      <ErrorBoundary
        fallback={
          <div
            className="fixed inset-0 z-0"
            style={{
              background:
                "radial-gradient(ellipse at 50% 120%, #0a1628 0%, #080808 60%)",
            }}
          />
        }
      >
        <Suspense
          fallback={
            <div
              className="fixed inset-0 z-0"
              style={{
                background:
                  "radial-gradient(ellipse at 50% 120%, #0a1628 0%, #080808 60%)",
              }}
            />
          }
        >
          <Scene scrollProgress={scrollProgress} />
        </Suspense>
      </ErrorBoundary>

      {/* Scrollable content layers on top of canvas */}
      <main
        className="relative z-10 w-full overflow-hidden text-white"
        role="main"
      >
        <HeroSection />
        <AboutSection />
        <FeaturesSection />
        <ContactSection />
        <Footer />
      </main>
    </>
  );
};
