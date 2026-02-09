import React, { useMemo, useEffect } from "react";
import { GRAIN_SVG } from "@/data/overlayBackgrounds";
import type { OverlayRenderProps } from "./types";

const GRAIN_DRIFT_KEYFRAMES = `
@keyframes bf-grain-drift {
  0% { transform: translate(0, 0); }
  100% { transform: translate(2%, 3%); }
}
`;

let grainKeyframesInjected = false;
function injectGrainKeyframes() {
  if (grainKeyframesInjected) return;
  const el = document.getElementById("bf-css-lite-kf");
  if (el) { grainKeyframesInjected = true; return; }
  const style = document.createElement("style");
  style.id = "bf-css-lite-kf";
  style.textContent = GRAIN_DRIFT_KEYFRAMES;
  document.head.appendChild(style);
  grainKeyframesInjected = true;
}

/**
 * CSS-lite overlay: film grain + vignette.
 * High-quality grain texture with optional slow drift (noise-driven feel via CSS).
 */
const CSSLiteOverlay: React.FC<OverlayRenderProps> = ({
  entry,
  variant,
  intensity,
  reduceMotion,
  width: _w,
  height: _h,
}) => {
  const mod = entry.variantMods[variant];
  const opacity = intensity / 100;

  const grainOpacity = useMemo(() => {
    const base = entry.layers?.find((l) => l.id === "grain")?.baseOpacity ?? 0.28;
    return base * mod.opacityScale;
  }, [entry.layers, mod.opacityScale]);

  const vignetteOpacity = useMemo(() => {
    const base = entry.layers?.find((l) => l.id === "vignette")?.baseOpacity ?? 0.82;
    return base * mod.opacityScale;
  }, [entry.layers, mod.opacityScale]);

  useEffect(() => {
    injectGrainKeyframes();
  }, []);

  if (opacity <= 0) return null;

  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{ opacity }}
      aria-hidden
    >
      {/* Grain */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: GRAIN_SVG,
          backgroundRepeat: "repeat",
          opacity: grainOpacity,
          mixBlendMode: "overlay",
          animation: reduceMotion ? "none" : "bf-grain-drift 12s linear infinite",
        }}
      />
      {/* Vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 75% 65% at 50% 50%, transparent 35%, rgba(0,0,0,0.15) 65%, rgba(0,0,0,0.4) 100%)",
          opacity: vignetteOpacity,
          mixBlendMode: "multiply",
        }}
      />
    </div>
  );
};

export default CSSLiteOverlay;
