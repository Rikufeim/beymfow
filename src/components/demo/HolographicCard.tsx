import React, { useRef } from "react"
import { cn } from "@/lib/utils"

type HolographicCardProps = {
  className?: string
}

const HolographicCard: React.FC<HolographicCardProps> = ({ className }) => {
  const cardRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current
    if (!card) return

    // Skip heavy 3D effects on coarse pointers (mobile/tablet) for smoother UX.
    if (window.matchMedia("(pointer: coarse)").matches) return

    const rect = card.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    const centerX = rect.width / 2
    const centerY = rect.height / 2

    const rotateX = ((y - centerY) / centerY) * -8
    const rotateY = ((x - centerX) / centerX) * 8

    card.style.setProperty("--x", `${x}px`)
    card.style.setProperty("--y", `${y}px`)
    card.style.setProperty("--bg-x", `${(x / rect.width) * 100}%`)
    card.style.setProperty("--bg-y", `${(y / rect.height) * 100}%`)
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.01,1.01,1.01)`
  }

  const handleMouseLeave = () => {
    const card = cardRef.current
    if (!card) return
    if (window.matchMedia("(pointer: coarse)").matches) return
    card.style.removeProperty("--x")
    card.style.removeProperty("--y")
    card.style.removeProperty("--bg-x")
    card.style.removeProperty("--bg-y")
    card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)"
  }

  return (
    <div
      ref={cardRef}
      className={cn(
        "holo-card relative w-full overflow-hidden rounded-2xl border border-white/10",
        "bg-black p-6",
        "h-[220px] sm:h-[260px] md:h-[280px]",
        "transition-transform duration-300 ease-out will-change-transform",
        className
      )}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: "perspective(1000px)",
        transformStyle: "preserve-3d",
        transition: "transform 180ms ease-out",
      }}
    >
      <div className="relative z-10 flex h-full items-center justify-center">
        <p className="text-xl font-semibold text-white">Hover over me</p>
      </div>

      <style>
        {`
          .holo-card {
            --x: 50%;
            --y: 50%;
            --bg-x: 50%;
            --bg-y: 50%;
            background-image: none;
          }
          .holo-card::before,
          .holo-card::after {
            content: none;
          }
        `}
      </style>
    </div>
  )
}

export default HolographicCard

