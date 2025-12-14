import React, { useRef } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { GlowingEffect } from "@/components/ui/glowing-effect";

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

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    // Let vertical scroll bubble; only intercept clear horizontal intent
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

  return (
    <div className={`w-full max-w-6xl mx-auto mb-10 ${className}`}>
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
        {Array.from({ length: itemCount }).map((_, idx) => (
          <div
            key={`${title}-${idx}`}
            className="relative min-w-[360px] max-w-[440px] h-[240px] rounded-2xl border border-white/10 bg-gradient-to-b from-[#0d0d0d] via-[#0c0c0c] to-[#0b0b0b] overflow-hidden flex-shrink-0"
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
          </div>
        ))}
      </div>
    </div>
  );
};
