import React, { memo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import beymflowBg from "@/assets/beymflow-background.png";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { cn } from "@/lib/utils";
import { usePrefetchRoute } from "@/hooks/usePrefetchRoute";
import { StartBuildingBackground } from "@/components/ui/start-building-background";

// Custom button definition
const Button = ({
  className = "",
  size = "default",
  children,
  ...props
}: any) => {
  const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
  const sizeStyles = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    lg: "h-11 rounded-md px-8",
    icon: "h-10 w-10"
  } as any;
  return (
    <button className={`${baseStyles} ${sizeStyles[size] || sizeStyles.default} ${className}`} {...props}>
      {children}
    </button>
  );
};

export const FlowFeaturesSection = memo(function FlowFeaturesSection({
  className = ""
}: { className?: string; }) {
  const navigate = useNavigate();
  const { prefetchRoute } = usePrefetchRoute();

  const handleNavigate = useCallback((path: string) => {
    navigate(path);
  }, [navigate]);

  const handlePrefetch = useCallback((path: string) => {
    prefetchRoute(path);
  }, [prefetchRoute]);

  const sharedCardClasses = "grid md:grid-cols-2 items-stretch gap-0";
  const sharedTextClasses = "flex flex-col justify-center gap-6 p-8 md:p-12 lg:p-16 relative overflow-hidden w-full h-full z-10";
  const sharedImageClasses = "relative min-h-[320px] md:min-h-[420px] overflow-hidden w-full h-full cursor-pointer";

  return (
    <div className={`py-8 sm:py-12 md:py-16 lg:py-20 px-0 !h-auto min-h-[400px] ${className}`}>
      <div className="w-full space-y-16 md:space-y-24">
        {/* Your vibe coding flow text */}
        <div className="text-center mb-12 lg:mb-16">
          <div className="inline-block relative bg-black/40 backdrop-blur-sm border border-white/10 rounded-3xl p-8 md:p-10 max-w-4xl mx-auto">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-6 lg:mb-8">
              <span className="text-white/85 font-semibold" style={{ fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif' }}>Your </span>
              <span className="bg-gradient-to-r from-teal-400 to-purple-600 bg-clip-text text-transparent font-medium" style={{ fontFamily: "Outfit, sans-serif" }}>vibe coding tools</span>
            </h2>
            <p className="mx-auto max-w-3xl text-lg md:text-xl text-gray-400 tracking-tight leading-relaxed">
              We're constantly building new tools to help you create faster, design smarter, and ship with confidence.
            </p>
          </div>
        </div>

        {/* Flow Section - Image Right, Text Left (mirrored from Prompt Lab) */}
        <div className={sharedCardClasses}>
          {/* Text Content - Left */}
          <div className="order-1 md:order-1">
            <div className={cn("relative h-full rounded-2xl border border-white/10 p-[1px]")}>
              <GlowingEffect spread={40} glow disabled={false} proximity={64} inactiveZone={0.01} borderWidth={2} className="opacity-70" />
              <div className={`${sharedTextClasses} rounded-[1.05rem] bg-gradient-to-br from-[#000000] via-[#050505] to-[#000000]`}>
                {/* Soft warm glow - right corner */}
                <span className="pointer-events-none absolute -top-24 -right-10 h-44 w-44 rounded-full blur-3xl" style={{
                  background: 'radial-gradient(circle, rgba(212,212,212,0.12) 0%, rgba(163,163,163,0.08) 40%, rgba(115,115,115,0.04) 70%, transparent 100%)'
                }} aria-hidden="true" />

                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 lg:mb-6 relative z-10">
                  Flow
                </h2>
                <p className="text-base sm:text-lg text-white/80 mb-6 lg:mb-8 max-w-lg relative z-10 leading-relaxed">
                  The Flow turns your ideas into clean, build-ready prompts for apps, websites, and games. It supports vibe
                  coding and sharpens the way you build, and it works with all major AI models.
                </p>
                <div className="text-sm font-semibold relative z-10 cursor-pointer inline-flex items-center gap-2 transition-all duration-200 group" style={{
                  color: '#ffffff',
                  letterSpacing: '0.01em',
                  WebkitFontSmoothing: 'antialiased',
                  MozOsxFontSmoothing: 'grayscale',
                  textRendering: 'optimizeLegibility'
                }} onClick={() => handleNavigate("/flow-engine")} onMouseEnter={() => handlePrefetch("/flow-engine")}>
                  <span className="text-white group-hover:text-white transition-opacity duration-200">Click to explore</span>
                  <span className="text-white transition-transform duration-200 group-hover:translate-x-1">→</span>
                </div>
              </div>
            </div>
          </div>

          {/* Image - Right */}
          <div className="order-2 md:order-2" onMouseEnter={() => handlePrefetch("/flow-engine")}>
            <div className={cn("relative h-full rounded-2xl border border-white/10 p-[1px]")}>
              <GlowingEffect spread={40} glow disabled={false} proximity={64} inactiveZone={0.01} borderWidth={2} className="opacity-70" />
              <div className={`${sharedImageClasses} rounded-[1.05rem] bg-gradient-to-br from-[#000000] via-[#050505] to-[#000000]`} onClick={() => handleNavigate("/flow-engine")}>
                <img src={beymflowBg} alt="Flow" className="absolute inset-0 w-full h-full object-cover rounded-[1.05rem]" loading="eager" decoding="async" />
              </div>
            </div>
          </div>
        </div>

        {/* Prompt Lab Section - Image Left, Text Right */}
        <div className={sharedCardClasses}>
          {/* Image - Left */}
          <div className="order-2 md:order-1" onMouseEnter={() => handlePrefetch("/landing-pages")}>
            <div className={cn("relative h-full rounded-2xl border border-white/10 p-[1px]")}>
              <GlowingEffect spread={40} glow disabled={false} proximity={64} inactiveZone={0.01} borderWidth={2} className="opacity-70" />
              <div className={`${sharedImageClasses} rounded-[1.05rem] bg-gradient-to-br from-[#000000] via-[#050505] to-[#000000]`} onClick={() => handleNavigate("/landing-pages")}>
                <img src={beymflowBg} alt="Landing Page Library" className="absolute inset-0 w-full h-full object-cover rounded-[1.05rem]" loading="eager" decoding="async" />
              </div>
            </div>
          </div>

          {/* Text Content - Right */}
          <div className="order-1 md:order-2" onMouseEnter={() => handlePrefetch("/landing-pages")}>
            <div className={cn("relative h-full rounded-2xl border border-white/10 p-[1px]")}>
              <GlowingEffect spread={40} glow disabled={false} proximity={64} inactiveZone={0.01} borderWidth={2} className="opacity-70" />
              <div className={`${sharedTextClasses} rounded-[1.05rem] bg-gradient-to-br from-[#000000] via-[#050505] to-[#000000]`}>
                {/* Soft warm glow - left corner */}
                <span className="pointer-events-none absolute -top-24 -left-10 h-44 w-44 rounded-full blur-3xl" style={{
                  background: 'radial-gradient(circle, rgba(212,212,212,0.12) 0%, rgba(163,163,163,0.08) 40%, rgba(115,115,115,0.04) 70%, transparent 100%)'
                }} aria-hidden="true" />

                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 lg:mb-6 relative z-10">Landing page library

                </h2>
                <p className="text-base sm:text-lg text-white/80 mb-6 lg:mb-8 max-w-lg relative z-10 leading-relaxed">Growing landing page library for every need

                </p>
                <div className="text-sm font-semibold relative z-10 cursor-default inline-flex items-center gap-2" style={{
                  color: '#ffffff',
                  letterSpacing: '0.01em',
                  WebkitFontSmoothing: 'antialiased',
                  MozOsxFontSmoothing: 'grayscale',
                  textRendering: 'optimizeLegibility'
                }}>
                  <span className="text-white/60">Coming soon</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});