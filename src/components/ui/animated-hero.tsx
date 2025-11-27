"use client";

import React, { useEffect, useRef, ReactNode, useState } from "react";
const getCurrentTime = () => typeof performance !== "undefined" && typeof performance.now === "function" ? performance.now() : Date.now();
type TitleContent = string | ReactNode;
interface ParticleHeroProps {
  title?: TitleContent;
  subtitle?: string;
  description?: string;
  primaryButton?: {
    text: string;
    onClick: () => void;
  };
  secondaryButton?: {
    text: string;
    onClick: () => void;
  };
  interactiveHint?: string;
  className?: string;
  particleCount?: number;
  children?: ReactNode;
  reverseButtons?: boolean;
}
export const ParticleHero: React.FC<ParticleHeroProps> = ({
  title = "BEYMFLOW",
  subtitle = "Power for creators",
  description = "Flow for everyone. Turn raw ideas into polished prompts, content, and systems inside one lab-powered workspace.",
  primaryButton,
  secondaryButton,
  interactiveHint = "Move to shape the flow",
  className = "",
  particleCount = 15,
  children,
  reverseButtons = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement[]>([]);
  const particlesMetaRef = useRef<{
    scale: number;
    opacity: number;
    hue: number;
    lightness: number;
    glowSize: number;
    dampening: number;
    ease: number;
  }[]>([]);
  const particlesStateRef = useRef<Float32Array>(new Float32Array());
  const animationFrameRef = useRef<number>();
  const staticTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoResumeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cursorRef = useRef({
    x: 0,
    y: 0
  });
  const targetCursorRef = useRef({
    x: 0,
    y: 0
  });
  const staticCursorRef = useRef({
    x: 0,
    y: 0
  });
  const isAutoModeRef = useRef(true);
  const isStaticAnimationRef = useRef(false);
  const startTimeRef = useRef(getCurrentTime());
  const lastMouseMoveRef = useRef(getCurrentTime());
  const lastFrameTimeRef = useRef(getCurrentTime());
  const [shouldAnimate, setShouldAnimate] = useState(true);
  const rows = particleCount;
  const totalParticles = rows * rows;

  // Initialize particles
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    container.innerHTML = "";
    const fragment = document.createDocumentFragment();
    const particleNodes: HTMLDivElement[] = [];
    const particleMetaList: typeof particlesMetaRef.current = [];
    const offsets = new Float32Array(totalParticles * 2);
    for (let i = 0; i < totalParticles; i++) {
      const particle = document.createElement("div");
      particle.className = "particle absolute rounded-full will-change-transform";

      // Calculate grid position
      const row = Math.floor(i / rows);
      const col = i % rows;
      const centerRow = Math.floor(rows / 2);
      const centerCol = Math.floor(rows / 2);

      // Distance from center for stagger effects
      const distanceFromCenter = Math.sqrt(Math.pow(row - centerRow, 2) + Math.pow(col - centerCol, 2));

      // Staggered scale (larger in center)
      const scale = Math.max(0.12, 1.2 - distanceFromCenter * 0.12);

      // Staggered opacity (more opaque in center)
      const opacity = Math.max(0.06, 1 - distanceFromCenter * 0.1);

      // Color intensity based on distance (teal–purple hue)
      const lightness = Math.max(28, 82 - distanceFromCenter * 4);
      const hue = 215 + distanceFromCenter * 2; // Cooler monochromatic palette

      // Glow intensity
      const glowSize = Math.max(0.5, 6 - distanceFromCenter * 0.5);
      const dampening = Math.max(0.28, 1 - distanceFromCenter * 0.08);
      const ease = Math.min(0.16, 0.08 + distanceFromCenter * 0.015);
      particle.style.cssText = `
        width: 0.35rem;
        height: 0.35rem;
        left: ${col * 1.8}rem;
        top: ${row * 1.8}rem;
        transform: translate3d(0, 0, 0) scale(${scale});
        opacity: ${opacity};
        background: hsl(${hue}, 90%, ${lightness}%);
        box-shadow: 0 0 ${glowSize * 0.25}rem 0 hsl(${hue}, 60%, 65%);
        mix-blend-mode: screen;
        z-index: ${Math.round(totalParticles - distanceFromCenter * 5)};
        transition: none;
      `;
      fragment.appendChild(particle);
      particleNodes.push(particle);
      particleMetaList.push({
        scale,
        opacity,
        hue,
        lightness,
        glowSize,
        dampening,
        ease
      });
    }
    container.appendChild(fragment);
    particlesRef.current = particleNodes;
    particlesMetaRef.current = particleMetaList;
    particlesStateRef.current = offsets;
  }, [rows, totalParticles]);

  // Continuous animation
  useEffect(() => {
    if (!shouldAnimate) {
      return;
    }
    lastFrameTimeRef.current = getCurrentTime();
    const animate = () => {
      const timestamp = getCurrentTime();
      const delta = timestamp - lastFrameTimeRef.current;
      lastFrameTimeRef.current = timestamp;
      const frameScale = Math.min(delta / (1000 / 60), 1.5);
      const currentTime = (timestamp - startTimeRef.current) * 0.001;
      if (isAutoModeRef.current) {
        const x = Math.sin(currentTime * 0.3) * 200 + Math.sin(currentTime * 0.17) * 100;
        const y = Math.cos(currentTime * 0.2) * 150 + Math.cos(currentTime * 0.23) * 80;
        targetCursorRef.current = {
          x,
          y
        };
      } else if (isStaticAnimationRef.current) {
        const timeSinceLastMove = timestamp - lastMouseMoveRef.current;
        if (timeSinceLastMove > 200) {
          const animationStrength = Math.min((timeSinceLastMove - 200) / 1000, 1);
          const subtleX = Math.sin(currentTime * 1.5) * 20 * animationStrength;
          const subtleY = Math.cos(currentTime * 1.2) * 16 * animationStrength;
          targetCursorRef.current = {
            x: staticCursorRef.current.x + subtleX,
            y: staticCursorRef.current.y + subtleY
          };
        }
      }
      const pointerEase = 1 - Math.exp(-frameScale * 0.08);
      cursorRef.current = {
        x: cursorRef.current.x + (targetCursorRef.current.x - cursorRef.current.x) * pointerEase,
        y: cursorRef.current.y + (targetCursorRef.current.y - cursorRef.current.y) * pointerEase
      };
      const particles = particlesRef.current;
      const meta = particlesMetaRef.current;
      const offsets = particlesStateRef.current;
      for (let i = 0; i < particles.length; i++) {
        const particle = particles[i];
        const particleMeta = meta[i];
        const offsetIndex = i * 2;
        const targetX = cursorRef.current.x * particleMeta.dampening;
        const targetY = cursorRef.current.y * particleMeta.dampening;
        const followEase = 1 - Math.exp(-frameScale * (0.1 + particleMeta.ease));
        const nextOffsetX = offsets[offsetIndex] + (targetX - offsets[offsetIndex]) * followEase;
        const nextOffsetY = offsets[offsetIndex + 1] + (targetY - offsets[offsetIndex + 1]) * followEase;
        offsets[offsetIndex] = nextOffsetX;
        offsets[offsetIndex + 1] = nextOffsetY;
        particle.style.transform = `translate3d(${nextOffsetX}px, ${nextOffsetY}px, 0) scale(${particleMeta.scale})`;
      }
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    animationFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [shouldAnimate]);
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => {
      setShouldAnimate(!mediaQuery.matches);
    };
    updatePreference();
    const addListener = mediaQuery.addEventListener?.bind(mediaQuery);
    const removeListener = mediaQuery.removeEventListener?.bind(mediaQuery);
    if (addListener) {
      addListener("change", updatePreference);
    } else {
      mediaQuery.addListener(updatePreference);
    }
    return () => {
      if (removeListener) {
        removeListener("change", updatePreference);
      } else {
        mediaQuery.removeListener(updatePreference);
      }
    };
  }, []);
  useEffect(() => {
    return () => {
      if (staticTimeoutRef.current) {
        clearTimeout(staticTimeoutRef.current);
      }
      if (autoResumeTimeoutRef.current) {
        clearTimeout(autoResumeTimeoutRef.current);
      }
    };
  }, []);

  // Mouse/touch movement handler
  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    const event = "touches" in e ? e.touches[0] : e;
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const newCursor = {
      x: (event.clientX - centerX) * 0.8,
      y: (event.clientY - centerY) * 0.8
    };
    targetCursorRef.current = newCursor;
    staticCursorRef.current = newCursor;
    isAutoModeRef.current = false;
    isStaticAnimationRef.current = false;
    lastMouseMoveRef.current = getCurrentTime();
    if (staticTimeoutRef.current) {
      clearTimeout(staticTimeoutRef.current);
    }
    staticTimeoutRef.current = setTimeout(() => {
      isStaticAnimationRef.current = true;
    }, 500);
    if (autoResumeTimeoutRef.current) {
      clearTimeout(autoResumeTimeoutRef.current);
    }
    autoResumeTimeoutRef.current = setTimeout(() => {
      if (getCurrentTime() - lastMouseMoveRef.current >= 4000) {
        isAutoModeRef.current = true;
        isStaticAnimationRef.current = false;
        startTimeRef.current = getCurrentTime();
      }
    }, 4000);
  };
  return <section className={`relative w-full min-h-screen bg-black overflow-hidden ${className}`} onMouseMove={handlePointerMove} onTouchMove={handlePointerMove}>
      {/* Particle Animation Background */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div ref={containerRef} className="relative" style={{
        width: `${rows * 1.8}rem`,
        height: `${rows * 1.8}rem`
      }} />
      </div>

      {/* Hero Content Overlay */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6">
        {children ? children : <div className="mx-auto max-w-6xl text-center">
            {/* Main Title */}
            <div className="mb-16">
              <h1 className="mb-8 text-6xl font-black tracking-tight leading-[0.9] md:text-7xl lg:text-8xl">
                <span className="bg-gradient-to-r from-cyan-400 via-sky-400 to-purple-500 bg-clip-text text-transparent drop-shadow-[0_0_40px_rgba(59,130,246,0.45)]">
                  {typeof title === "string" ? title.split("\n").map((line, index) => <span key={index} className="block text-slate-50 text-7xl">
                          {line}
                        </span>) : title}
                </span>
              </h1>

              {/* Subtitle */}
              <div className="space-y-4">
                <h2 className="text-lg font-medium uppercase tracking-[0.24em] text-slate-100/80 md:text-xl">
                  {subtitle}
                </h2>
                <div className="mx-auto h-px w-24 bg-gradient-to-r from-transparent via-cyan-400/70 to-transparent"></div>
              </div>

              
            </div>

            {/* Description */}
            {description && <div className="mb-16">
                <p className="mx-auto max-w-3xl text-base font-light leading-relaxed text-slate-100/70 md:text-lg">
                  {description}
                </p>
              </div>}

            {/* Call to Action */}
            <div className="space-y-8">
              <div className={reverseButtons ? "flex flex-col items-center justify-center gap-6 sm:flex-row-reverse" : "flex flex-col items-center justify-center gap-6 sm:flex-row"}>
                {primaryButton && <button onClick={primaryButton.onClick} className="group relative inline-flex items-center justify-center overflow-hidden rounded-full px-10 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-slate-900 shadow-[0_0_40px_rgba(56,189,248,0.45)]">
                    <span className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-sky-400 to-purple-500 transition-transform duration-500 group-hover:scale-105" />
                    <span className="relative z-10">{primaryButton.text}</span>
                  </button>}

                {secondaryButton && <button onClick={secondaryButton.onClick} className="rounded-full border border-white/20 px-9 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-100/80 transition-all duration-300 hover:border-cyan-400/60 hover:text-cyan-300/90 backdrop-blur-sm">
                    {secondaryButton.text}
                  </button>}
              </div>

              {/* Interactive hint */}
              {interactiveHint && <div className="flex items-center justify-center gap-6 text-[0.7rem] uppercase tracking-[0.3em] text-slate-200/40">
                  <div className="h-px w-10 bg-gradient-to-r from-transparent to-slate-400/30" />
                  <span className="animate-pulse">{interactiveHint}</span>
                  <div className="h-px w-10 bg-gradient-to-l from-transparent to-slate-500/30" />
                </div>}
            </div>
          </div>}
      </div>

      {/* Ambient Effects intentionally removed for a fully black background */}
    </section>;
};