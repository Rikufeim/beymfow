import React from "react";
import { DottedGlowBackground } from "@/components/ui/dotted-glow-background";

export default function DottedGlowBackgroundDemo() {
  return (
    <div
      className="relative flex size-60 items-end justify-end overflow-hidden rounded-3xl border border-purple-500/30 bg-black px-4 shadow-[0_0_60px_rgba(45,212,191,0.35)] ring-1 ring-purple-500/30 md:size-100"
    >
      <img
        src="https://assets.aceternity.com/logos/calcom.png"
        className="absolute inset-0 z-20 m-auto size-10 md:size-20"
        alt="Beymflow Prompt Lab"
      />
      <div className="relative z-20 flex w-full justify-between px-2 py-3 backdrop-blur-[3px] md:px-4">
        <p className="text-xs font-normal text-cyan-300 md:text-sm">
          Beymflow Prompt Lab • Codex Background
        </p>
        <p className="text-xs font-normal text-purple-300 md:text-sm">
          &rarr;
        </p>
      </div>
      <DottedGlowBackground
        className="pointer-events-none mask-radial-to-90% mask-radial-at-center"
        opacity={0.9}
        gap={12}
        radius={1.8}
        // Turquoise dots
        color="rgba(45, 212, 191, 0.55)"
        darkColor="rgba(34, 211, 238, 0.8)"
        // Purple / indigo glow
        glowColor="rgba(168, 85, 247, 0.95)"
        darkGlowColor="rgba(129, 140, 248, 0.95)"
        // Subtle radial depth on black background
        backgroundOpacity={0.4}
        speedMin={0.3}
        speedMax={1.6}
        speedScale={1.1}
      />
    </div>
  );
}
