import React from "react"
import { cn } from "@/lib/utils"
import HyperText from "./HyperText"
import cardBgTurquoise from "@/assets/card-bg-turquoise.png"

type HyperTextCardProps = {
  className?: string
}

const HyperTextCard: React.FC<HyperTextCardProps> = ({ className }) => {
  return (
    <div
      className={cn(
        "group relative h-full min-h-[220px] sm:min-h-[240px] md:min-h-[260px]",
        "rounded-2xl border border-white/10 p-6",
        "transition-transform duration-200",
        className
      )}
      style={{
        backgroundImage: `url(${cardBgTurquoise})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 opacity-30 bg-gradient-to-br from-white/[0.02] via-transparent to-white/[0.01] pointer-events-none" />
      <div className="relative z-10 flex h-full items-center justify-center">
        <div className="flex flex-col items-start gap-1 text-2xl font-semibold tracking-tight">
          <span className="text-white">START</span>
          <HyperText text="BUILDING" className="text-white" />
        </div>
      </div>
    </div>
  )
}

export default HyperTextCard

