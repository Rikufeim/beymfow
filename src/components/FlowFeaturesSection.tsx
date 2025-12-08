import React from "react";
import { useNavigate } from "react-router-dom";
import beymflowBg from "@/assets/beymflow-background.png";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { cn } from "@/lib/utils";

// Määritellään yksinkertainen Button-komponentti tässä tiedostossa,
// koska emme voi tuoda sitä ulkoisesta tiedostosta esikatselussa.
// Projektissasi voit käyttää: import { Button } from "@/components/ui/button";
const Button = ({
  className = "",
  size = "default",
  children,
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
  const sizeStyles = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    lg: "h-11 rounded-md px-8",
    icon: "h-10 w-10"
  };
  return (
    <button className={`${baseStyles} ${sizeStyles[size] || sizeStyles.default} ${className}`} {...props}>
      {children}
    </button>
  );
};

export const FlowFeaturesSection = ({
  className = ""
}) => {
  // Hookin käyttö turvallisesti (jos Router ei ole saatavilla esikatselussa, tämä voi vaatia providerin)
  // Tässä oletetaan, että ympäristössä on Router tai tämä jätetään huomiotta virheen sattuessa.
  let navigate;
  try {
    navigate = useNavigate();
  } catch (e) {
    // Fallback jos Router context puuttuu esikatselusta
    navigate = path => console.log(`Navigating to ${path}`);
  }

  const sharedCardClasses = "grid md:grid-cols-2 items-stretch gap-0";
  const sharedTextClasses = "flex flex-col justify-center gap-6 p-8 md:p-12 lg:p-16 relative overflow-hidden w-full h-full z-10";
  const sharedImageClasses = "relative min-h-[320px] md:min-h-[420px] overflow-hidden w-full h-full cursor-pointer";

  return (
    <section className={`py-8 sm:py-12 md:py-16 lg:py-20 px-0 ${className}`} style={{ minHeight: '400px' }}>
      <div className="w-full space-y-16 md:space-y-24">
        {/* Your vibe coding flow text */}
        <div className="text-center mb-12 lg:mb-16">
          <h2 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl mb-6 lg:mb-8">
            <span className="text-white/85 font-semibold">Your </span>
            <span className="bg-gradient-to-r from-teal-400 to-purple-600 bg-clip-text text-transparent font-medium">vibe coding flow</span>
          </h2>
          <p className="mx-auto max-w-3xl text-lg md:text-xl text-gray-400 tracking-tight leading-relaxed">
            Build and control your whole creative workflow — no clutter, no complexity, just clean, intuitive tools that build prompts as fast as you think.
          </p>
        </div>
        
        {/* Flow Engine Section - Image Right, Text Left (mirrored from Prompt Lab) */}
        <div className={sharedCardClasses}>
          {/* Text Content - Left */}
          <div className="order-1 md:order-1">
            <div className={cn("relative h-full rounded-2xl border border-white/10 p-[1px]")} style={{ transform: 'translateZ(0)', willChange: 'transform' }}>
              <GlowingEffect spread={40} glow disabled={false} proximity={64} inactiveZone={0.01} borderWidth={2} className="opacity-70" />
              <div className={`${sharedTextClasses} rounded-[1.05rem] bg-gradient-to-br from-[#000000] via-[#050505] to-[#000000]`} style={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden' }}>
                {/* Soft warm glow - right corner */}
                <span
                  className="pointer-events-none absolute -top-24 -right-10 h-44 w-44 rounded-full blur-3xl"
                  style={{
                    background: 'radial-gradient(circle, rgba(212,212,212,0.12) 0%, rgba(163,163,163,0.08) 40%, rgba(115,115,115,0.04) 70%, transparent 100%)'
                  }}
                  aria-hidden="true"
                />

                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 lg:mb-6 relative z-10">
                  Flow Engine
                </h2>
                <p className="text-base sm:text-lg text-white/80 mb-6 lg:mb-8 max-w-lg relative z-10 leading-relaxed">
                  The Flow Engine turns your ideas into clean, build-ready prompts for apps, websites, and games. It supports vibe
                  coding and sharpens the way you build, and it works with all major AI models.
                </p>
                <div
                  className="text-sm font-semibold relative z-10 cursor-pointer inline-flex items-center gap-2 transition-all duration-200 group"
                  style={{
                    color: '#ffffff',
                    letterSpacing: '0.01em',
                    WebkitFontSmoothing: 'antialiased',
                    MozOsxFontSmoothing: 'grayscale',
                    textRendering: 'optimizeLegibility',
                  }}
                  onClick={() => navigate("/flow-engine")}
                >
                  <span className="text-white group-hover:text-white transition-opacity duration-200">Click to explore</span>
                  <span className="text-white transition-transform duration-200 group-hover:translate-x-1">→</span>
                </div>
              </div>
            </div>
          </div>

          {/* Image - Right */}
          <div className="order-2 md:order-2">
            <div className={cn("relative h-full rounded-2xl border border-white/10 p-[1px]")} style={{ transform: 'translateZ(0)', willChange: 'transform' }}>
              <GlowingEffect spread={40} glow disabled={false} proximity={64} inactiveZone={0.01} borderWidth={2} className="opacity-70" />
              <div className={`${sharedImageClasses} rounded-[1.05rem] bg-gradient-to-br from-[#000000] via-[#050505] to-[#000000]`} style={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden' }} onClick={() => navigate("/flow-engine")}>
                <img src={beymflowBg} alt="Flow Engine" className="absolute inset-0 w-full h-full object-cover rounded-[1.05rem]" />
              </div>
            </div>
          </div>
        </div>

        {/* Prompt Lab Section - Image Left, Text Right */}
        <div className={sharedCardClasses}>
          {/* Image - Left */}
          <div className="order-2 md:order-1">
            <div className={cn("relative h-full rounded-2xl border border-white/10 p-[1px]")} style={{ transform: 'translateZ(0)', willChange: 'transform' }}>
              <GlowingEffect spread={40} glow disabled={false} proximity={64} inactiveZone={0.01} borderWidth={2} className="opacity-70" />
              <div className={`${sharedImageClasses} rounded-[1.05rem] bg-gradient-to-br from-[#000000] via-[#050505] to-[#000000]`} style={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden' }} onClick={() => navigate("/prompt-lab-page")}>
                <img src={beymflowBg} alt="Prompt Lab" className="absolute inset-0 w-full h-full object-cover rounded-[1.05rem]" />
              </div>
            </div>
          </div>

          {/* Text Content - Right */}
          <div className="order-1 md:order-2">
            <div className={cn("relative h-full rounded-2xl border border-white/10 p-[1px]")} style={{ transform: 'translateZ(0)', willChange: 'transform' }}>
              <GlowingEffect spread={40} glow disabled={false} proximity={64} inactiveZone={0.01} borderWidth={2} className="opacity-70" />
              <div className={`${sharedTextClasses} rounded-[1.05rem] bg-gradient-to-br from-[#000000] via-[#050505] to-[#000000]`} style={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden' }}>
                {/* Soft warm glow - left corner */}
                <span
                  className="pointer-events-none absolute -top-24 -left-10 h-44 w-44 rounded-full blur-3xl"
                  style={{
                    background: 'radial-gradient(circle, rgba(212,212,212,0.12) 0%, rgba(163,163,163,0.08) 40%, rgba(115,115,115,0.04) 70%, transparent 100%)'
                  }}
                  aria-hidden="true"
                />

                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 lg:mb-6 relative z-10">
                  Prompt Lab
                </h2>
                <p className="text-base sm:text-lg text-white/80 mb-6 lg:mb-8 max-w-lg relative z-10 leading-relaxed">
                  Test ideas, refine prompts, and build full workflows that plug into your favorite AI tools.
                </p>
                <div
                  className="text-sm font-semibold relative z-10 cursor-pointer inline-flex items-center gap-2 transition-all duration-200 group"
                  style={{
                    color: '#ffffff',
                    letterSpacing: '0.01em',
                    WebkitFontSmoothing: 'antialiased',
                    MozOsxFontSmoothing: 'grayscale',
                    textRendering: 'optimizeLegibility',
                  }}
                  onClick={() => navigate("/prompt-lab-page")}
                >
                  <span className="text-white group-hover:text-white transition-opacity duration-200">Click to explore</span>
                  <span className="text-white transition-transform duration-200 group-hover:translate-x-1">→</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
