import React from "react";
import { cn } from "@/lib/utils";
import { GlowingEffect } from "@/components/ui/glowing-effect";

export interface PromptCardProps {
  id: string;
  title: string;
  subtitle: string;
  onClick: () => void;
  className?: string;
}

export function PromptCard({
  id,
  title,
  subtitle,
  onClick,
  className,
}: PromptCardProps) {
  // Generate initials from title
  const getInitials = (text: string) => {
    return text
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div 
      className={cn("flex-shrink-0 w-[240px] sm:w-[260px] h-full prompt-card-3d group/card", className)} 
      style={{ 
        transformStyle: 'preserve-3d', 
        transition: 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94), z-index 0.3s linear', 
        willChange: 'transform',
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        transformOrigin: 'center center',
        position: 'relative',
        zIndex: 0,
        transform: 'translateZ(0)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.zIndex = '10';
        e.currentTarget.style.transform = 'translateZ(0) scale(1.02)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.zIndex = '0';
        e.currentTarget.style.transform = 'translateZ(0) scale(1)';
      }}
    >
      <div className={cn("relative h-full rounded-2xl p-[1px]")} style={{ transform: 'translateZ(0)', willChange: 'transform', transformStyle: 'preserve-3d' }}>
        <GlowingEffect 
          spread={40} 
          glow={true}
          disabled={false} 
          proximity={64} 
          inactiveZone={0.01} 
          borderWidth={2} 
          className="opacity-70"
        />
        <div 
          onClick={onClick}
          className={cn(
            "group relative flex flex-col gap-2 p-4 sm:p-5",
            "rounded-[1.05rem] bg-black",
            "cursor-pointer transition-all duration-300 ease-out",
            "w-full",
            "h-full",
            "will-change-transform",
            "overflow-hidden"
          )}
          style={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden', transformStyle: 'preserve-3d' }}
        >
          {/* Content */}
          <div className="relative z-10 flex flex-col h-full">
            {/* Title and Subtitle */}
            <div className="flex flex-col gap-1.5">
              <h3 className="text-sm sm:text-base font-semibold text-white/70 group-hover:text-white leading-tight transition-colors duration-300 whitespace-nowrap overflow-hidden text-ellipsis">
                {title}
              </h3>
              <p className="text-xs text-white/90 leading-relaxed line-clamp-2">
                {subtitle}
              </p>
            </div>

            {/* View Prompt Text */}
            <div className="mt-auto pt-1">
              <div className="inline-flex items-center gap-2 text-xs text-white/80 group-hover:text-white transition-colors">
                <span>View prompt</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

