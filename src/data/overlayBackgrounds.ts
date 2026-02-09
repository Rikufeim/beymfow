// ─── BG Library: Real-time visual overlay systems ─────────────────────
// Each overlay declares a render mode. The preview mounts ONE renderer
// (CSS / SVG / Canvas / WebGL) per selected overlay.

export type OverlayRenderMode =
  | "css-lite"       // grain, vignette, subtle haze
  | "svg-noise"      // flow fields, waves, fog (noise-driven)
  | "canvas-2d"      // starfields, particles, parallax
  | "webgl-shader";  // space, nebula, volumetrics

export type OverlayCategory = "Space" | "Soft/Ambient" | "Dark/Editorial";

export const OVERLAY_CATEGORIES: OverlayCategory[] = [
  "Space",
  "Soft/Ambient",
  "Dark/Editorial",
];

export type VariantName = "soft" | "deep" | "highContrast" | "minimal";

export const VARIANT_LABELS: Record<VariantName, string> = {
  soft: "Soft",
  deep: "Deep",
  highContrast: "High Contrast",
  minimal: "Minimal",
};

export interface VariantMod {
  opacityScale: number;
  speedScale: number;
  extraBlurPx?: number;
}

export interface OverlayEntry {
  id: string;
  name: string;
  category: OverlayCategory;
  tags: string[];
  defaultIntensity: number;
  renderMode: OverlayRenderMode;
  /** Passed to the renderer (e.g. "fog-flow" | "atmospheric-waves" for svg-noise) */
  rendererId: string;
  variantMods: Record<VariantName, VariantMod>;
  /** Optional: for css-lite we keep a minimal layer description for CSS export */
  layers?: Array<{
    id: string;
    style: Record<string, string | number>;
    blendMode?: string;
    baseOpacity: number;
  }>;
}

export interface OverlayState {
  enabled: boolean;
  id: string | null;
  variant: VariantName;
  intensity: number;
  reduceMotion: boolean;
}

export const DEFAULT_OVERLAY_STATE: OverlayState = {
  enabled: false,
  id: null,
  variant: "soft",
  intensity: 60,
  reduceMotion: false,
};

// ─── Curated library (few, elite) ────────────────────────────────────

const STD: Record<VariantName, VariantMod> = {
  soft: { opacityScale: 0.55, speedScale: 1.2 },
  deep: { opacityScale: 1.25, speedScale: 0.8 },
  highContrast: { opacityScale: 1.5, speedScale: 1.0 },
  minimal: { opacityScale: 0.25, speedScale: 1.3, extraBlurPx: 2 },
};

const SOFT: Record<VariantName, VariantMod> = {
  soft: { opacityScale: 0.5, speedScale: 1.3 },
  deep: { opacityScale: 1.15, speedScale: 0.85 },
  highContrast: { opacityScale: 1.4, speedScale: 1.0 },
  minimal: { opacityScale: 0.2, speedScale: 1.4, extraBlurPx: 3 },
};

export const GRAIN_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

export const OVERLAY_LIBRARY: OverlayEntry[] = [
  // ── Space (WebGL + Canvas) ─────────────────────────────────────────
  {
    id: "deep-space-field",
    name: "Deep Space Field",
    category: "Space",
    tags: ["space", "cosmic", "stars", "depth", "webgl"],
    defaultIntensity: 75,
    renderMode: "webgl-shader",
    rendererId: "deep-space-field",
    variantMods: STD,
  },
  {
    id: "nebula-core",
    name: "Nebula Core",
    category: "Space",
    tags: ["nebula", "cosmic", "volumetric", "webgl"],
    defaultIntensity: 65,
    renderMode: "webgl-shader",
    rendererId: "nebula-core",
    variantMods: STD,
  },
  {
    id: "star-drift-parallax",
    name: "Star Drift Parallax",
    category: "Space",
    tags: ["stars", "parallax", "drift", "canvas"],
    defaultIntensity: 70,
    renderMode: "canvas-2d",
    rendererId: "star-drift-parallax",
    variantMods: STD,
  },

  // ── Ambient (SVG + noise) ──────────────────────────────────────────
  {
    id: "fog-flow-field",
    name: "Fog Flow Field",
    category: "Soft/Ambient",
    tags: ["fog", "flow", "noise", "svg"],
    defaultIntensity: 55,
    renderMode: "svg-noise",
    rendererId: "fog-flow-field",
    variantMods: SOFT,
  },
  {
    id: "soft-atmospheric-waves",
    name: "Soft Atmospheric Waves",
    category: "Soft/Ambient",
    tags: ["atmospheric", "waves", "noise", "svg"],
    defaultIntensity: 50,
    renderMode: "svg-noise",
    rendererId: "atmospheric-waves",
    variantMods: SOFT,
  },

  // ── Editorial (CSS-lite) ───────────────────────────────────────────
  {
    id: "film-grain-system",
    name: "Film Grain System",
    category: "Dark/Editorial",
    tags: ["grain", "film", "editorial", "noir", "css"],
    defaultIntensity: 45,
    renderMode: "css-lite",
    rendererId: "film-grain",
    variantMods: {
      soft: { opacityScale: 0.5, speedScale: 1.0 },
      deep: { opacityScale: 1.4, speedScale: 0.7 },
      highContrast: { opacityScale: 1.7, speedScale: 0.9 },
      minimal: { opacityScale: 0.28, speedScale: 1.2 },
    },
    layers: [
      {
        id: "grain",
        style: {
          backgroundImage: GRAIN_SVG,
          backgroundRepeat: "repeat",
        },
        blendMode: "overlay",
        baseOpacity: 0.28,
      },
      {
        id: "vignette",
        style: {
          background: "radial-gradient(ellipse 75% 65% at 50% 50%, transparent 35%, rgba(0,0,0,0.15) 65%, rgba(0,0,0,0.4) 100%)",
        },
        blendMode: "multiply",
        baseOpacity: 0.82,
      },
    ],
  },
];

// ─── Filtering ──────────────────────────────────────────────────────

export function filterOverlays(
  entries: OverlayEntry[],
  options: { category?: OverlayCategory; search?: string; tags?: string[] },
): OverlayEntry[] {
  let results = entries;
  if (options.category) results = results.filter((e) => e.category === options.category);
  if (options.tags?.length) {
    const req = options.tags.map((t) => t.toLowerCase());
    results = results.filter((e) =>
      req.every((r) => e.tags.some((t) => t.toLowerCase().includes(r))),
    );
  }
  if (options.search?.trim()) {
    const q = options.search.trim().toLowerCase();
    results = results.filter((e) =>
      `${e.name} ${e.tags.join(" ")} ${e.category}`.toLowerCase().includes(q),
    );
  }
  return results;
}

// ─── Export helpers (CSS for css-lite; others get placeholder) ───────

export function overlayLayersToCss(
  entry: OverlayEntry,
  _variant: VariantName,
  intensity: number,
): string {
  if (entry.renderMode !== "css-lite" || !entry.layers?.length) {
    return `/* ${entry.name} — real-time renderer (${entry.renderMode}). Export via PNG. */`;
  }
  const mod = entry.variantMods[_variant];
  const layersCss = entry.layers
    .map((layer, i) => {
      const opacity = (layer.baseOpacity * mod.opacityScale).toFixed(3);
      const styleParts = Object.entries(layer.style)
        .map(([k, v]) => `  ${k.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)}: ${v};`)
        .join("\n");
      return `.bf-layer-${i} {\n  position: absolute;\n  inset: 0;\n  pointer-events: none;\n  opacity: ${opacity};\n  mix-blend-mode: ${layer.blendMode || "normal"};\n${styleParts}\n}`;
    })
    .join("\n\n");
  return `/* ${entry.name} */\n.bf-overlay-container { position: absolute; inset: 0; pointer-events: none; opacity: ${(intensity / 100).toFixed(2)}; }\n\n${layersCss}`;
}

export function overlayCombinedCss(
  baseCss: string,
  entry: OverlayEntry,
  variant: VariantName,
  intensity: number,
): string {
  const overlay = overlayLayersToCss(entry, variant, intensity);
  return `/* Base */\n.background { position: relative; min-height: 100vh; ${baseCss} }\n\n/* Overlay */\n${overlay}`;
}

export function overlayTokensJson(
  entry: OverlayEntry,
  variant: VariantName,
  intensity: number,
): string {
  return JSON.stringify(
    {
      name: entry.name,
      category: entry.category,
      renderMode: entry.renderMode,
      rendererId: entry.rendererId,
      variant,
      intensity,
    },
    null,
    2,
  );
}
