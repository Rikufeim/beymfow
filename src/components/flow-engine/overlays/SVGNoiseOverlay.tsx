import React, { useRef, useEffect, useMemo } from "react";
import { createNoise2D } from "simplex-noise";
import type { OverlayRenderProps } from "./types";

const POINT_SPACING = 10;
const AMPLITUDE = 12;
const NOISE_SCALE = 0.002;
const MOUSE_AMP = 8;

function useVisibilityPause(callback: () => void, deps: React.DependencyList) {
  const rafRef = useRef<number>();
  const visibleRef = useRef(true);

  useEffect(() => {
    const onVisibility = () => {
      visibleRef.current = document.visibilityState === "visible";
    };
    document.addEventListener("visibilitychange", onVisibility);
    visibleRef.current = document.visibilityState === "visible";
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  useEffect(() => {
    let running = true;
    const tick = () => {
      if (!running) return;
      if (visibleRef.current) callback();
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      running = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, deps);
}

/**
 * SVG overlay with noise-driven point grid deformation.
 * Real procedural motion — no fake CSS waves.
 */
const SVGNoiseOverlay: React.FC<OverlayRenderProps> = ({
  entry,
  variant,
  intensity,
  reduceMotion,
  width,
  height,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const pointsRef = useRef<{ x: number; y: number; baseX: number; baseY: number }[]>([]);
  const noise2D = useMemo(() => createNoise2D(() => Math.random()), []);
  const mod = entry.variantMods[variant];
  const speedScale = reduceMotion ? 0 : mod.speedScale;
  const timeRef = useRef(0);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });

  const isFog = entry.rendererId === "fog-flow-field";
  const isWaves = entry.rendererId === "atmospheric-waves";

  // Initial grid
  const grid = useMemo(() => {
    const pts: { baseX: number; baseY: number }[] = [];
    for (let y = 0; y <= height + POINT_SPACING; y += POINT_SPACING) {
      for (let x = 0; x <= width + POINT_SPACING; x += POINT_SPACING) {
        pts.push({ baseX: x, baseY: y });
      }
    }
    pointsRef.current = pts.map((p) => ({ ...p, x: p.baseX, y: p.baseY }));
    return pts;
  }, [width, height]);

  useVisibilityPause(() => {
    timeRef.current += 0.016 * speedScale;
    const t = timeRef.current;
    const pts = pointsRef.current;
    if (!pts.length) return;

    for (let i = 0; i < pts.length; i++) {
      const p = pts[i];
      const nx = p.baseX * NOISE_SCALE;
      const ny = p.baseY * NOISE_SCALE;
      const n1 = noise2D(nx + t * 0.15, ny);
      const n2 = noise2D(nx + 100, ny + t * 0.2);
      const n3 = isWaves ? noise2D(nx * 2 + t * 0.25, ny * 2) : 0;

      let dx = n1 * AMPLITUDE * (isFog ? 1.2 : 1);
      let dy = n2 * AMPLITUDE * (isFog ? 0.8 : 1.1);
      if (isWaves) {
        dy += n3 * 6;
        dx += noise2D(ny + t * 0.1, nx) * 4;
      }

      const mx = (mouseRef.current.x - 0.5) * MOUSE_AMP;
      const my = (mouseRef.current.y - 0.5) * MOUSE_AMP;
      const dist = Math.hypot(p.baseX / width - mouseRef.current.x, p.baseY / height - mouseRef.current.y);
      const influence = Math.max(0, 1 - dist * 2);
      dx += mx * influence;
      dy += my * influence;

      p.x = p.baseX + dx;
      p.y = p.baseY + dy;
    }

    const cols = (width / POINT_SPACING | 0) + 1;
    const rows = (height / POINT_SPACING | 0) + 1;
    const getPt = (c: number, r: number) => pts[r * cols + c];
    let d = "";
    for (let r = 0; r < rows - 1; r++) {
      for (let c = 0; c < cols - 1; c++) {
        const a = getPt(c, r);
        const b = getPt(c + 1, r);
        const c_ = getPt(c + 1, r + 1);
        const d_ = getPt(c, r + 1);
        if (a && b && c_ && d_) {
          d += `M ${a.x} ${a.y} L ${b.x} ${b.y} L ${c_.x} ${c_.y} L ${d_.x} ${d_.y} Z `;
        }
      }
    }
    const pathEl = svgRef.current?.querySelector("#bf-noise-mesh");
    if (pathEl && pathEl instanceof SVGPathElement) pathEl.setAttribute("d", d.trim());
  }, [noise2D, speedScale, width, height, isFog, isWaves]);

  useEffect(() => {
    const container = svgRef.current?.closest(".bf-overlay-container");
    if (!container) return;
    const onMove = (e: MouseEvent) => {
      const rect = (e.currentTarget as Element).getBoundingClientRect();
      mouseRef.current.x = (e.clientX - rect.left) / rect.width;
      mouseRef.current.y = (e.clientY - rect.top) / rect.height;
    };
    container.addEventListener("mousemove", onMove);
    return () => container.removeEventListener("mousemove", onMove);
  }, []);

  const opacity = (intensity / 100) * mod.opacityScale;
  if (opacity <= 0) return null;

  const fillColor = isFog
    ? "rgba(255,255,255,0.04)"
    : "rgba(255,255,255,0.035)";
  const strokeColor = isFog
    ? "rgba(255,255,255,0.06)"
    : "rgba(255,255,255,0.05)";

  const initialD = useMemo(() => {
    const cols = Math.floor(width / POINT_SPACING) + 1;
    const rows = Math.floor(height / POINT_SPACING) + 1;
    let pathD = "";
    for (let r = 0; r < rows - 1; r++) {
      for (let c = 0; c < cols - 1; c++) {
        const ax = c * POINT_SPACING, ay = r * POINT_SPACING;
        const bx = (c + 1) * POINT_SPACING, by = r * POINT_SPACING;
        const cx = (c + 1) * POINT_SPACING, cy = (r + 1) * POINT_SPACING;
        const dx = c * POINT_SPACING, dy = (r + 1) * POINT_SPACING;
        pathD += `M ${ax} ${ay} L ${bx} ${by} L ${cx} ${cy} L ${dx} ${dy} Z `;
      }
    }
    return pathD.trim() || "M 0 0";
  }, [width, height]);

  return (
    <svg
      ref={svgRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      width={width}
      height={height}
      style={{ opacity }}
      aria-hidden
    >
      <defs>
        <linearGradient id="bf-svg-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.02)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.06)" />
        </linearGradient>
      </defs>
      <path
        id="bf-noise-mesh"
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={0.3}
        strokeLinejoin="round"
        d={initialD}
      />
    </svg>
  );
};

export default SVGNoiseOverlay;
