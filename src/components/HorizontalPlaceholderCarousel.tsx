import React, { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, X, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import ComponentShowcasePage from "@/components/ComponentShowcasePage";

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
  const [showComponentPage, setShowComponentPage] = useState<number | null>(null);

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
    if (title === "Landing Pages" && idx === 0) {
      setShowComponentPage(idx);
    }
  };

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showComponentPage !== null) {
        setShowComponentPage(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showComponentPage]);

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
            const isPixelTrailCard = title === "Landing Pages" && idx === 0;
            return (
              <div
                key={`${title}-${idx}`}
                onClick={() => handleCardClick(idx)}
                className={`relative min-w-[360px] max-w-[440px] h-[240px] rounded-2xl border border-white/10 bg-gradient-to-b from-[#0d0d0d] via-[#0c0c0c] to-[#0b0b0b] overflow-hidden flex-shrink-0 ${isPixelTrailCard ? 'cursor-pointer hover:border-purple-500/50 transition-colors group' : ''}`}
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
                {isPixelTrailCard ? (
                  <>
                    {/* Video thumbnail */}
                    <video
                      src="/videos/pixel-trail-demo.mp4"
                      muted
                      loop
                      playsInline
                      autoPlay
                      className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                    <div className="relative h-full w-full px-6 py-5 flex flex-col justify-between z-10">
                      <div className="flex items-center justify-between">
                        <span className="text-purple-400 text-xs uppercase tracking-wider font-medium">Component</span>
                        <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center group-hover:bg-purple-500/20 group-hover:border-purple-500/50 transition-colors">
                          <Play size={14} className="text-white ml-0.5" />
                        </div>
                      </div>
                      <div>
                        <h4 className="text-white font-semibold text-lg mb-1">Pixel Trail</h4>
                        <p className="text-white/50 text-sm">A beautiful smooth cursor pixel trail effect.</p>
                      </div>
                    </div>
                  </>
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

      {/* Component Showcase Modal */}
      {showComponentPage !== null && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm"
          onClick={() => setShowComponentPage(null)}
        >
          <div 
            className="relative w-full h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowComponentPage(null)}
              className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-black/50 border border-white/20 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
              aria-label="Close"
            >
              <X size={20} />
            </button>
            <ComponentShowcasePage
              onBack={() => setShowComponentPage(null)}
              videoSrc="/videos/pixel-trail-demo.mp4"
              title="Pixel Trail"
              description="A beautiful smooth cursor pixel trail effect."
              creator={{
                name: "Jatin Yadav",
                username: "jatin-yadav05"
              }}
              installCommand="https://21st.dev/r/jatin-yadav05/pixel-trail"
              importCode="@/components/ui/pixel-trail"
              usageCode="<PixelCursorTrail />"
            />
          </div>
        </div>
      )}
    </>
  );
};