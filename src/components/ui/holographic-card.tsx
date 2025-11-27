"use client";

import React, { useRef } from "react";

const HolographicCard: React.FC = () => {
  const cardRef = useRef<HTMLDivElement | null>(null);

  return (
    <div
      ref={cardRef}
      className="relative flex h-72 w-full items-center justify-center overflow-hidden rounded-[2rem] border border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.8)]"
      style={{
        background: `
          radial-gradient(circle at 90% 10%,
            rgba(34, 211, 238, 0.33),
            transparent 55%
          ),
          radial-gradient(circle at 10% 90%,
            rgba(168, 85, 247, 0.33),
            transparent 55%
          ),
          #000000
        `
      }}
    >
      <div className="relative z-10 flex flex-col items-center gap-2 px-6 text-center">
        <span className="inline-flex items-center rounded-full border border-cyan-400/40 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
          Premium Lab Access
        </span>
        <h3 className="text-2xl font-semibold tracking-tight text-white">
          Beymflow Premium
        </h3>
        <p className="max-w-xs text-sm text-slate-300/90">
          A smoother, more fluid premium experience.
        </p>
      </div>
    </div>
  );
};

export default HolographicCard;
