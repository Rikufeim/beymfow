import React, { useRef, useEffect, useMemo } from "react";
import type { OverlayRenderProps } from "./types";

interface Star {
  x: number;
  y: number;
  v: number;
  size: number;
  alpha: number;
  layer: number;
}

function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/**
 * Canvas 2D: multi-layer starfield with parallax drift.
 * Real star positions, no sprites — drawn as soft circles.
 */
const Canvas2DOverlay: React.FC<OverlayRenderProps> = ({
  entry,
  variant,
  intensity,
  reduceMotion,
  width,
  height,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const offsetRef = useRef(0);
  const mod = entry.variantMods[variant];

  const layers = useMemo(() => {
    const rng = seeded(42);
    const stars: Star[] = [];
    const layerCount = 3;
    const starsPerLayer = [120, 60, 25];
    const speeds = [0.08, 0.18, 0.4];
    const sizes = [1, 1.5, 2.2];
    const alphas = [0.35, 0.55, 0.85];

    for (let L = 0; L < layerCount; L++) {
      for (let i = 0; i < starsPerLayer[L]; i++) {
        stars.push({
          x: rng() * (width + 200) - 100,
          y: rng() * (height + 400),
          v: speeds[L] * (0.8 + rng() * 0.4),
          size: sizes[L] * (0.7 + rng() * 0.6),
          alpha: alphas[L] * (0.6 + rng() * 0.4),
          layer: L,
        });
      }
    }
    starsRef.current = stars;
    return stars;
  }, [width, height]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || width <= 0 || height <= 0) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let rafId: number;
    let visible = true;

    const onVisibility = () => {
      visible = document.visibilityState === "visible";
    };
    document.addEventListener("visibilitychange", onVisibility);

    const speedScale = reduceMotion ? 0 : mod.speedScale;

    const draw = () => {
      if (visible && speedScale > 0) offsetRef.current += speedScale * 0.5;

      ctx.clearRect(0, 0, width, height);

      const opacity = (intensity / 100) * mod.opacityScale;
      if (opacity <= 0) {
        rafId = requestAnimationFrame(draw);
        return;
      }

      const stars = starsRef.current;
      for (const s of stars) {
        let y = (s.y - offsetRef.current * s.v) % (height + 300);
        if (y < -50) y += height + 300;
        const x = s.x;

        const a = s.alpha * opacity;
        const r = s.size;
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, r * 2);
        gradient.addColorStop(0, `rgba(255,255,255,${a})`);
        gradient.addColorStop(0.4, `rgba(255,255,255,${a * 0.4})`);
        gradient.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, r * 2, 0, Math.PI * 2);
        ctx.fill();
      }

      rafId = requestAnimationFrame(draw);
    };

    rafId = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [width, height, intensity, variant, mod.opacityScale, mod.speedScale, reduceMotion]);

  const opacity = (intensity / 100) * mod.opacityScale;
  if (opacity <= 0) return null;

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="absolute inset-0 w-full h-full pointer-events-none block"
      style={{ opacity: 1 }}
      aria-hidden
    />
  );
};

export default Canvas2DOverlay;
