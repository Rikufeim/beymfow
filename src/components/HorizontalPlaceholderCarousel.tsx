import React, { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import NexusLandingPage from "@/components/landing-pages/NexusLandingPage";

interface HorizontalPlaceholderCarouselProps {
  title: string;
  itemCount?: number;
  className?: string;
}

export const HorizontalPlaceholderCarousel: React.FC<HorizontalPlaceholderCarouselProps> = ({
  title,
  itemCount = 6,
  className = "",
}) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [showLandingPage, setShowLandingPage] = useState<number | null>(null);

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 0) {
      e.preventDefault();
      const el = rowRef.current;
      if (!el) return;
      el.scrollBy({ left: e.deltaX, behavior: "smooth" });
    }
  };

  const scrollByAmount = (dir: number) => {
    const el = rowRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.7 * dir;
    el.scrollBy({ left: amount, behavior: "smooth" });
  };

  const handleCardClick = (idx: number) => {
    // Only first card of "Landing Pages" carousel opens the landing page
    if (title === "Landing Pages" && idx === 0) {
      setShowLandingPage(idx);
    }
  };

  // Close modal on ESC
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showLandingPage !== null) {
        setShowLandingPage(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showLandingPage]);

  return (
    <>
      <div className={`w-full mb-10 ${className}`}>
        <div className="flex items-center justify-between px-1 mb-2">
          <h3 className="text-white/85 font-semibold text-lg">{title}</h3>
          <div className="flex items-center gap-4">
            <button
              onClick={() => scrollByAmount(-1)}
              className="h-9 w-9 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/20 hover:border-white/40 flex items-center justify-center transition-all shadow-lg shadow-black/20"
              aria-label="Scroll left"
            >
              <ArrowLeft size={16} />
            </button>
            <button
              onClick={() => scrollByAmount(1)}
              className="h-9 w-9 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/20 hover:border-white/40 flex items-center justify-center transition-all shadow-lg shadow-black/20"
              aria-label="Scroll right"
            >
              <ArrowRight size={16} />
            </button>
            <button
              className="text-white/80 text-sm font-semibold hover:text-white transition-colors flex items-center gap-1"
              onClick={() => navigate("/prompt-lab-page")}
            >
              Open lab <ArrowRight size={14} />
            </button>
          </div>
        </div>
        <div
          ref={rowRef}
          onWheel={handleWheel}
          className="flex flex-nowrap gap-6 overflow-hidden pb-2 px-2"
        >
          {Array.from({ length: itemCount }).map((_, idx) => {
            const isNexusCard = title === "Landing Pages" && idx === 0;
            return (
              <div
                key={`${title}-${idx}`}
                onClick={() => handleCardClick(idx)}
                className={`relative min-w-[360px] max-w-[440px] h-[240px] rounded-2xl border border-white/10 bg-gradient-to-b from-[#0d0d0d] via-[#0c0c0c] to-[#0b0b0b] overflow-hidden flex-shrink-0 ${isNexusCard ? 'cursor-pointer hover:border-[#00ff88]/50 transition-colors' : ''}`}
              >
                <div className="absolute inset-0 opacity-50">
                  <GlowingEffect
                    spread={28}
                    glow
                    disabled={false}
                    proximity={40}
                    inactiveZone={0.01}
                    borderWidth={2}
                    className="opacity-60"
                  />
                </div>
                {isNexusCard ? (
                  <div className="relative h-full w-full px-6 py-5 flex flex-col justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-6 h-6 rounded flex items-center justify-center"
                        style={{
                          background: 'linear-gradient(135deg, #00ff88 0%, #00aa55 100%)',
                        }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-black">
                          <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <span className="text-[#00ff88] font-bold tracking-wider text-sm" style={{ fontFamily: "'Syncopate', sans-serif" }}>
                        NEXUS
                      </span>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-white font-semibold text-lg">Web3 Landing Page</h4>
                      <p className="text-white/50 text-sm">Modern crypto/DeFi landing page with 3D particle effects</p>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#00ff88]/70 text-xs uppercase tracking-wider">Click to preview</span>
                      <div className="h-8 w-24 rounded-full bg-[#00ff88]/20 border border-[#00ff88]/30 flex items-center justify-center">
                        <span className="text-[#00ff88] text-xs font-semibold">View</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="relative h-full w-full px-6 py-5 flex flex-col justify-between">
                    <div className="h-4 w-3/4 rounded-full bg-white/10" />
                    <div className="space-y-3">
                      <div className="h-3.5 w-5/6 rounded-full bg-white/8" />
                      <div className="h-3.5 w-2/3 rounded-full bg-white/6" />
                    </div>
                    <div className="flex justify-end items-center gap-3">
                      <CheckCircle2 className="text-white/50" size={16} />
                      <div className="h-9 w-28 rounded-full bg-white/10" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Landing Page Modal */}
      {showLandingPage !== null && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowLandingPage(null)}
        >
          <div 
            className="relative w-full max-w-6xl h-[90vh] rounded-2xl overflow-hidden border border-white/20 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowLandingPage(null)}
              className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-black/50 border border-white/20 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
              aria-label="Close"
            >
              <X size={20} />
            </button>
            <div className="w-full h-full overflow-y-auto">
              <NexusLandingPage />
            </div>
          </div>
        </div>
      )}
    </>
  );
};