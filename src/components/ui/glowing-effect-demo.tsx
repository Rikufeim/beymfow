"use client";

import type { ReactNode } from "react";
import { Box, Layers, Target, Zap } from "lucide-react";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { cn } from "@/lib/utils";

export function GlowingEffectDemo() {
  return (
    <section className="grid gap-8 md:grid-cols-12 md:items-stretch">
      <div className="md:col-span-5 flex flex-col justify-center space-y-4">
        <span className="inline-flex w-fit items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-cyan-300">
          Beymflow Lab
        </span>
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-white">
          Engineered for Pure Flow.
        </h2>
        <p className="text-sm md:text-base text-white/70 max-w-md">
          A focused layer where prompts, tools, and workflows behave like a
          single system. Less drag, more signal.
        </p>
      </div>

      <ul className="md:col-span-7 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <GridItem
          icon={<Box className="h-4 w-4 text-cyan-300" />}
          title="Effortless"
          description="Beymflow makes creation feel light. Build ideas, brands, and content faster than ever — without the technical weight slowing you down."
        />
        <GridItem
          icon={<Zap className="h-4 w-4 text-cyan-300" />}
          title="Fast"
          description="Every tool and prompt is engineered for speed. More output, less friction. Speed becomes your new creative advantage."
        />
        <GridItem
          icon={<Layers className="h-4 w-4 text-purple-300" />}
          title="Scalable"
          description="Whether you’re starting out or already seasoned, Beymflow grows with you. Your tools expand as your vision expands."
        />
        <GridItem
          icon={<Target className="h-4 w-4 text-purple-300" />}
          title="Precise"
          description="Every command, every workflow, every idea is refined for clarity. You get consistent, reliable results — every single time."
        />
      </ul>
    </section>
  );
}

interface GridItemProps {
  icon: ReactNode;
  title: string;
  description: ReactNode;
}

const GridItem = ({ icon, title, description }: GridItemProps) => {
  return (
    <li className="min-h-[11rem] list-none">
      <div className={cn("relative h-full rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 via-white/0 to-purple-500/10 p-[1px]")}
      >
        <GlowingEffect
          spread={40}
          glow
          disabled={false}
          proximity={64}
          inactiveZone={0.01}
          borderWidth={2}
          className="opacity-70"
        />
        <div className="relative flex h-full flex-col justify-between gap-4 rounded-[1.05rem] bg-black/80 p-5 shadow-[0_0_40px_rgba(0,0,0,0.75)] backdrop-blur">
          <div className="flex flex-col gap-3">
            <div className="w-fit rounded-lg border border-white/10 bg-white/5 p-2">
              {icon}
            </div>
            <div className="space-y-2">
              <h3 className="text-lg md:text-xl font-semibold tracking-tight text-white">
                {title}
              </h3>
              <p className="text-xs md:text-sm leading-relaxed text-white/70">
                {description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
};
