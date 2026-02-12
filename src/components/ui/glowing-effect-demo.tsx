"use client";

import type { ReactNode } from "react";
import { Box, Layers, Target, Zap } from "lucide-react";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { cn } from "@/lib/utils";
export function GlowingEffectDemo() {
  return <section className="grid gap-8 md:grid-cols-12 md:items-stretch">
    <div className="md:col-span-5 flex flex-col justify-center space-y-4 bg-black/40 backdrop-blur-sm border border-white/10 rounded-3xl p-8 md:p-10">
      <span className="inline-flex w-fit items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-cyan-300">
        Beymflow Lab
      </span>
      <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-white">Engineered for Pure Flow</h2>
      <p className="text-sm text-white/70 max-w-md md:text-lg">
        Where creativity flows without limits.
        <br />
        Ideas move faster. Systems stay aligned. Output becomes effortless.
      </p>
    </div>

    <ul className="md:col-span-7 grid grid-cols-1 gap-4 sm:grid-cols-2">
      <GridItem icon={<Box className="h-4 w-4 text-cyan-300" />} title="Effortless" description="Creativity should be limitless. Beymflow removes the barriers so your ideas can move out fast." />
      <GridItem icon={<Zap className="h-4 w-4 text-cyan-300" />} title="Fast" description="Idea, execution, and sharing — in seconds." />
      <GridItem icon={<Layers className="h-4 w-4 text-purple-300" />} title="Scalable" description="From a single idea to complete systems. Beymflow grows with your vision." />
      <GridItem icon={<Target className="h-4 w-4 text-purple-300" />} title="Precise" description="Clear direction. Structured input. Reliable results — every time." />
    </ul>
  </section>;
}
interface GridItemProps {
  icon: ReactNode;
  title: string;
  description: ReactNode;
}
const GridItem = ({
  icon,
  title,
  description
}: GridItemProps) => {
  return <li className="min-h-[11rem] list-none">
    <div className={cn("relative h-full rounded-2xl border border-white/10 p-[1px]")}>
      <GlowingEffect spread={40} glow disabled={false} proximity={64} inactiveZone={0.01} borderWidth={2} className="opacity-70" />
      <div className="relative flex h-full flex-col justify-between gap-4 rounded-[1.05rem] bg-gradient-to-br from-[#000000] via-[#050505] to-[#000000] p-5">
        <div className="flex flex-col gap-3">
          <div className="w-fit rounded-lg border border-white/10 bg-white/5 p-2">
            {icon}
          </div>
          <div className="space-y-2">
            <h3 className="text-lg md:text-xl font-semibold tracking-tight text-white">
              {title}
            </h3>
            <p className="text-xs leading-relaxed text-white/70 md:text-lg">
              {description}
            </p>
          </div>
        </div>
      </div>
    </div>
  </li>;
};