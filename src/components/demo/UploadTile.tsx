import React from "react"
import { cn } from "@/lib/utils"
import { PixelCursorTrail } from "./PixelCursorTrail"

type UploadTileProps = {
  className?: string
}

const UploadTile: React.FC<UploadTileProps> = ({ className }) => {
  return (
    <div
      className={cn(
        "group relative flex h-full min-h-[260px] items-center justify-center overflow-hidden rounded-2xl",
        "border border-white/10 bg-black p-6",
        "transition-transform duration-200",
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0 opacity-15">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20px_20px,#ffffff0a_1px,transparent_0)] bg-[length:60px_60px]" />
      </div>
      <div className="absolute inset-0">
        <PixelCursorTrail />
      </div>
      <div className="relative z-10 flex h-full w-full items-center justify-center pointer-events-none">
        <span className="sr-only">Pixel trail</span>
      </div>
    </div>
  )
}

export default UploadTile

