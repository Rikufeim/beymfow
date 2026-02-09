/**
 * Premium Background Library – single source of truth for Beymflow Backgrounds tab.
 * Categories: Soft/Ambient, Futuristic, Dark/Editorial, Expressive, Space, Vivid/Alive, Luxury.
 * Each background: distinct palette per category, production-ready, premium quality.
 */

export type BackgroundCategory =
  | "Soft/Ambient"
  | "Futuristic"
  | "Dark/Editorial"
  | "Expressive"
  | "Space"
  | "Vivid/Alive"
  | "Luxury";

export type GradientStyleId =
  | "halo"
  | "soft-sweep"
  | "orb"
  | "diagonal-blend"
  | "noise-wash"
  | "aurora"
  | "mesh"
  | "spotlight"
  | "wave"
  | "crystal"
  | "sunset"
  | "cosmic";

export interface ColorPreset {
  color1: string;
  color2: string;
  color3: string;
  color4: string;
}

/** Variant params: base + optional effect defaults (subtle, premium) */
export interface BackgroundVariantParams {
  brightness: number;
  grainEnabled: boolean;
  grainIntensity: number;
  environmentEnabled: boolean;
  blurPx?: number;
  vignette?: number;
  contrast?: number;
  saturation?: number;
}

export interface BackgroundVariant {
  id: string;
  label: string;
  params: BackgroundVariantParams;
}

export interface BackgroundEntry {
  id: string;
  name: string;
  category: BackgroundCategory;
  gradientStyle: GradientStyleId;
  tags: string[];
  palettePreset: string;
  variants: BackgroundVariant[];
}

// ─── COLOR PRESETS (palette roles: color1=base, color2=surface/mid, color3=accent, color4=highlight) ───

export const COLOR_PRESETS: Record<string, ColorPreset> = {
  // ── Soft/Ambient: soft neutrals, fog, gentle blues/greens, warm creams; low contrast
  mist: { color1: "#080c10", color2: "#0f1419", color3: "#64748b", color4: "#cbd5e1" },
  fog: { color1: "#0a0e12", color2: "#12181e", color3: "#94a3b8", color4: "#e2e8f0" },
  linen: { color1: "#0f0e0c", color2: "#1c1916", color3: "#a8a29e", color4: "#d6d3d1" },
  sage: { color1: "#080c0a", color2: "#0f1612", color3: "#4ade80", color4: "#86efac" },
  dawn: { color1: "#0c0a0a", color2: "#181414", color3: "#fcd34d", color4: "#fde68a" },
  arctic: { color1: "#051018", color2: "#0c1824", color3: "#0891b2", color4: "#22d3ee" },
  slate: { color1: "#0a0d10", color2: "#14181e", color3: "#475569", color4: "#94a3b8" },
  cream: { color1: "#141210", color2: "#1c1816", color3: "#e7e5e4", color4: "#fafaf9" },
  haze: { color1: "#060a0c", color2: "#0c1218", color3: "#64748b", color4: "#94a3b8" },
  whisper: { color1: "#0a0c0e", color2: "#12161a", color3: "#71717a", color4: "#a1a1aa" },

  // ── Futuristic: cool tech blues, cyans, violets, neon; crisp contrast
  neon: { color1: "#051018", color2: "#0a1424", color3: "#22d3ee", color4: "#c084fc" },
  sapphire: { color1: "#060814", color2: "#0f1624", color3: "#1d4ed8", color4: "#60a5fa" },
  aurora: { color1: "#050812", color2: "#0c1020", color3: "#06b6d4", color4: "#a855f7" },
  electric: { color1: "#040a12", color2: "#0a1420", color3: "#0ea5e9", color4: "#e879f9" },
  ion: { color1: "#05101a", color2: "#0a1828", color3: "#2dd4bf", color4: "#67e8f9" },
  matrix: { color1: "#030a08", color2: "#061210", color3: "#10b981", color4: "#34d399" },
  hologram: { color1: "#050814", color2: "#0c1020", color3: "#6366f1", color4: "#a5b4fc" },
  laser: { color1: "#080514", color2: "#0f0a20", color3: "#8b5cf6", color4: "#c4b5fd" },
  quantum: { color1: "#040810", color2: "#0a1020", color3: "#3b82f6", color4: "#93c5fd" },
  prism: { color1: "#050a14", color2: "#0c1424", color3: "#06b6d4", color4: "#a78bfa" },

  // ── Dark/Editorial: blacks, charcoals, ink blues, muted burgundy/olive; sophisticated
  noir: { color1: "#030304", color2: "#08080a", color3: "#27272a", color4: "#52525b" },
  ink: { color1: "#050506", color2: "#0e0e12", color3: "#18181b", color4: "#3f3f46" },
  charcoal: { color1: "#080808", color2: "#121214", color3: "#374151", color4: "#6b7280" },
  obsidian: { color1: "#050508", color2: "#0c0c0e", color3: "#1e293b", color4: "#475569" },
  midnight: { color1: "#040408", color2: "#0a0a12", color3: "#1e1b4b", color4: "#4338ca" },
  editorial: { color1: "#060606", color2: "#0f0f0f", color3: "#404040", color4: "#737373" },
  press: { color1: "#040404", color2: "#0a0a0a", color3: "#2d2d2d", color4: "#525252" },
  velvet: { color1: "#080608", color2: "#100c10", color3: "#1f1b1f", color4: "#3d3840" },
  burgundy: { color1: "#0a0608", color2: "#120a0c", color3: "#4c1d1d", color4: "#7f1d1d" },
  olive: { color1: "#080a06", color2: "#0f120a", color3: "#365314", color4: "#4d7c0f" },

  // ── Expressive: bold gradients, rich purples/reds/teals; dramatic, tasteful
  rose: { color1: "#0a0608", color2: "#140a10", color3: "#be185d", color4: "#f472b6" },
  ember: { color1: "#0a0604", color2: "#140a06", color3: "#c2410c", color4: "#fb923c" },
  magma: { color1: "#0a0504", color2: "#140608", color3: "#b91c1c", color4: "#f87171" },
  amethyst: { color1: "#0a0614", color2: "#120a1c", color3: "#7c3aed", color4: "#c084fc" },
  coral: { color1: "#0a0606", color2: "#140a0a", color3: "#e11d48", color4: "#fb7185" },
  sunset: { color1: "#0c0806", color2: "#181008", color3: "#b45309", color4: "#fbbf24" },
  forest: { color1: "#050a06", color2: "#0f1410", color3: "#15803d", color4: "#4ade80" },
  nebula: { color1: "#050308", color2: "#0a0614", color3: "#6d28d9", color4: "#a78bfa" },
  gold: { color1: "#0c0a06", color2: "#181206", color3: "#d97706", color4: "#fde047" },
  cosmic: { color1: "#030508", color2: "#080c18", color3: "#4f46e5", color4: "#818cf8" },

  // ── Space: deep navy/black, cosmic purples, star-like highlights
  void: { color1: "#020408", color2: "#060c18", color3: "#1e3a5f", color4: "#3b82f6" },
  stellar: { color1: "#030508", color2: "#080c14", color3: "#3730a3", color4: "#6366f1" },
  eclipse: { color1: "#040408", color2: "#0a0a12", color3: "#312e81", color4: "#818cf8" },
  orbit: { color1: "#050308", color2: "#0a0612", color3: "#5b21b6", color4: "#a78bfa" },
  comet: { color1: "#040a14", color2: "#0a1424", color3: "#0e7490", color4: "#22d3ee" },
  lunar: { color1: "#060608", color2: "#0c0c10", color3: "#4b5563", color4: "#9ca3af" },
  deepSpace: { color1: "#020306", color2: "#060a12", color3: "#1e293b", color4: "#475569" },
  pulsar: { color1: "#040308", color2: "#0a0614", color3: "#7c3aed", color4: "#c084fc" },
  horizon: { color1: "#050810", color2: "#0c1420", color3: "#1d4ed8", color4: "#60a5fa" },
  nebulaSpace: { color1: "#050208", color2: "#0a0412", color3: "#6d28d9", color4: "#a78bfa" },

  // ── Vivid/Alive: lively teal/lime/magenta; energetic, balanced
  candy: { color1: "#0a0610", color2: "#120a18", color3: "#db2777", color4: "#a78bfa" },
  tropical: { color1: "#040a08", color2: "#0a1210", color3: "#059669", color4: "#34d399" },
  mint: { color1: "#051210", color2: "#0a1816", color3: "#0d9488", color4: "#5eead4" },
  ocean: { color1: "#05101a", color2: "#0a1620", color3: "#0e7490", color4: "#2dd4bf" },
  lime: { color1: "#060a06", color2: "#0c1208", color3: "#65a30d", color4: "#a3e635" },
  fuchsia: { color1: "#0a0610", color2: "#140a18", color3: "#c026d3", color4: "#e879f9" },
  peach: { color1: "#0c0806", color2: "#141008", color3: "#ea580c", color4: "#fdba74" },
  aqua: { color1: "#040a0c", color2: "#0a1418", color3: "#0891b2", color4: "#22d3ee" },
  berry: { color1: "#0a060c", color2: "#140a14", color3: "#be185d", color4: "#f472b6" },
  zest: { color1: "#0a0c06", color2: "#121408", color3: "#84cc16", color4: "#bef264" },

  // ── Luxury: black/charcoal base, espresso, navy, emerald, ruby, champagne, platinum; premium
  blackTunnel1: { color1: "#020202", color2: "#080808", color3: "#0f0f0f", color4: "#1a1a1a" },
  blackTunnel2: { color1: "#030303", color2: "#0a0a0a", color3: "#141414", color4: "#262626" },
  blackTunnel3: { color1: "#040404", color2: "#0c0c0c", color3: "#171717", color4: "#2d2d2d" },
  blackTunnel4: { color1: "#050505", color2: "#0e0e0e", color3: "#1a1a1a", color4: "#333333" },
  metallicChampagne: { color1: "#0c0a08", color2: "#141008", color3: "#a16207", color4: "#d4a574" },
  metallicGold: { color1: "#0a0806", color2: "#121008", color3: "#854d0e", color4: "#ca8a04" },
  metallicPlatinum: { color1: "#08080a", color2: "#0f0f12", color3: "#52525b", color4: "#a1a1aa" },
  velvetObsidian1: { color1: "#030304", color2: "#08080a", color3: "#18181b", color4: "#3f3f46" },
  velvetObsidian2: { color1: "#040406", color2: "#0a0a0c", color3: "#1c1c1f", color4: "#3b3b42" },
  luxuryEmerald: { color1: "#020402", color2: "#080c08", color3: "#064e3b", color4: "#0d9488" },
  luxuryRuby: { color1: "#040202", color2: "#0a0606", color3: "#7f1d1d", color4: "#b91c1c" },
  luxurySapphire: { color1: "#020408", color2: "#080c14", color3: "#1e3a8a", color4: "#2563eb" },
  espresso: { color1: "#0a0806", color2: "#141008", color3: "#292524", color4: "#57534e" },
  deepNavy: { color1: "#030508", color2: "#080c14", color3: "#0f172a", color4: "#1e293b" },
};

// ─── SHARED VARIANT TEMPLATES (subtle, premium effects) ───

const softVariant = (brightness = 1.12, grain = false): BackgroundVariant => ({
  id: "soft",
  label: "Soft",
  params: { brightness, grainEnabled: grain, grainIntensity: 0.08, environmentEnabled: true },
});
const deepVariant = (brightness = 0.9, grain = true): BackgroundVariant => ({
  id: "deep",
  label: "Deep",
  params: { brightness, grainEnabled: grain, grainIntensity: 0.2, environmentEnabled: true },
});
const contrastVariant = (brightness = 1.25): BackgroundVariant => ({
  id: "contrast",
  label: "High Contrast",
  params: { brightness, grainEnabled: false, grainIntensity: 0.1, environmentEnabled: true },
});
const minimalVariant = (brightness = 1.02): BackgroundVariant => ({
  id: "minimal",
  label: "Minimal",
  params: { brightness, grainEnabled: false, grainIntensity: 0.04, environmentEnabled: false },
});

/** Luxury variants: very subtle grain, optional vignette */
const luxurySoft = (): BackgroundVariant => ({
  id: "soft",
  label: "Soft",
  params: { brightness: 1.05, grainEnabled: false, grainIntensity: 0.04, environmentEnabled: true, vignette: 0.15 },
});
const luxuryDeep = (): BackgroundVariant => ({
  id: "deep",
  label: "Deep",
  params: { brightness: 0.88, grainEnabled: true, grainIntensity: 0.12, environmentEnabled: true, vignette: 0.25 },
});
const luxuryEditorial = (): BackgroundVariant => ({
  id: "editorial",
  label: "Editorial",
  params: { brightness: 1.08, grainEnabled: true, grainIntensity: 0.1, environmentEnabled: true, contrast: 1.08, vignette: 0.2 },
});
const luxuryMinimal = (): BackgroundVariant => ({
  id: "minimal",
  label: "Minimal",
  params: { brightness: 0.98, grainEnabled: false, grainIntensity: 0.03, environmentEnabled: false },
});

// ─── BACKGROUND LIBRARY ─────────────────────────────────────────────────────

export const BACKGROUND_LIBRARY: BackgroundEntry[] = [
  // ═══ Soft/Ambient (10+) ═══
  { id: "ambient-mist", name: "Ambient Mist", category: "Soft/Ambient", gradientStyle: "soft-sweep", tags: ["Soft", "calm", "mist", "gentle"], palettePreset: "mist", variants: [softVariant(), deepVariant(), contrastVariant(), minimalVariant()] },
  { id: "halo-glow", name: "Halo Glow", category: "Soft/Ambient", gradientStyle: "halo", tags: ["halo", "soft", "glow"], palettePreset: "aurora", variants: [softVariant(1.18), deepVariant(0.92), contrastVariant(1.28), minimalVariant()] },
  { id: "velvet-tide", name: "Velvet Tide", category: "Soft/Ambient", gradientStyle: "aurora", tags: ["calm", "tide", "ambient"], palettePreset: "amethyst", variants: [softVariant(1.16), deepVariant(0.94), contrastVariant(1.26), minimalVariant()] },
  { id: "moonlit-air", name: "Moonlit Air", category: "Soft/Ambient", gradientStyle: "orb", tags: ["ambient", "moonlit", "soft"], palettePreset: "sunset", variants: [softVariant(1.1), deepVariant(0.9), contrastVariant(1.22), minimalVariant()] },
  { id: "quiet-orbit", name: "Quiet Orbit", category: "Soft/Ambient", gradientStyle: "spotlight", tags: ["quiet", "soft", "focus"], palettePreset: "sapphire", variants: [softVariant(1.14), deepVariant(0.94), contrastVariant(1.24), minimalVariant()] },
  { id: "fogline", name: "Fogline", category: "Soft/Ambient", gradientStyle: "noise-wash", tags: ["fog", "soft", "diffuse"], palettePreset: "fog", variants: [softVariant(1.12, true), deepVariant(0.9, true), contrastVariant(1.2), minimalVariant()] },
  { id: "linen-dawn", name: "Linen Dawn", category: "Soft/Ambient", gradientStyle: "soft-sweep", tags: ["linen", "warm", "cream"], palettePreset: "linen", variants: [softVariant(1.15), deepVariant(0.95), contrastVariant(1.2), minimalVariant()] },
  { id: "sage-glow", name: "Sage Glow", category: "Soft/Ambient", gradientStyle: "halo", tags: ["sage", "green", "calm"], palettePreset: "sage", variants: [softVariant(1.14), deepVariant(0.92), contrastVariant(1.24), minimalVariant()] },
  { id: "dawn-whisper", name: "Dawn Whisper", category: "Soft/Ambient", gradientStyle: "aurora", tags: ["dawn", "warm", "golden"], palettePreset: "dawn", variants: [softVariant(1.16), deepVariant(0.9), contrastVariant(1.26), minimalVariant()] },
  { id: "haze-soft", name: "Haze Soft", category: "Soft/Ambient", gradientStyle: "noise-wash", tags: ["haze", "minimal", "soft"], palettePreset: "haze", variants: [softVariant(1.1), deepVariant(0.92), contrastVariant(1.2), minimalVariant()] },
  { id: "whisper-mist", name: "Whisper Mist", category: "Soft/Ambient", gradientStyle: "orb", tags: ["whisper", "neutral", "gentle"], palettePreset: "whisper", variants: [softVariant(1.08), deepVariant(0.94), contrastVariant(1.18), minimalVariant()] },

  // ═══ Futuristic (10+) ═══
  { id: "neon-grid", name: "Neon Grid", category: "Futuristic", gradientStyle: "mesh", tags: ["Neon", "grid", "future"], palettePreset: "neon", variants: [softVariant(1.12), deepVariant(0.9), contrastVariant(1.3), minimalVariant()] },
  { id: "signal-wave", name: "Signal Wave", category: "Futuristic", gradientStyle: "wave", tags: ["signal", "wave", "pulse"], palettePreset: "sapphire", variants: [softVariant(1.14), deepVariant(0.92), contrastVariant(1.28), minimalVariant()] },
  { id: "crystal-core", name: "Crystal Core", category: "Futuristic", gradientStyle: "crystal", tags: ["crystal", "sharp", "clean"], palettePreset: "arctic", variants: [softVariant(1.2), deepVariant(0.9), contrastVariant(1.32), minimalVariant()] },
  { id: "orbit-channel", name: "Orbit Channel", category: "Futuristic", gradientStyle: "orb", tags: ["orbit", "channel", "sleek"], palettePreset: "electric", variants: [softVariant(1.16), deepVariant(0.92), contrastVariant(1.28), minimalVariant()] },
  { id: "horizon-drive", name: "Horizon Drive", category: "Futuristic", gradientStyle: "diagonal-blend", tags: ["horizon", "drive", "tech"], palettePreset: "midnight", variants: [softVariant(1.12), deepVariant(0.9), contrastVariant(1.26), minimalVariant()] },
  { id: "starlight-echo", name: "Starlight Echo", category: "Futuristic", gradientStyle: "cosmic", tags: ["starlight", "cosmic", "depth"], palettePreset: "nebula", variants: [softVariant(1.18), deepVariant(0.88), contrastVariant(1.32), minimalVariant()] },
  { id: "ion-sweep", name: "Ion Sweep", category: "Futuristic", gradientStyle: "wave", tags: ["ion", "teal", "glow"], palettePreset: "ion", variants: [softVariant(1.15), deepVariant(0.9), contrastVariant(1.3), minimalVariant()] },
  { id: "matrix-rain", name: "Matrix Rain", category: "Futuristic", gradientStyle: "diagonal-blend", tags: ["matrix", "green", "tech"], palettePreset: "matrix", variants: [softVariant(1.1), deepVariant(0.88), contrastVariant(1.28), minimalVariant()] },
  { id: "hologram-edge", name: "Hologram Edge", category: "Futuristic", gradientStyle: "crystal", tags: ["hologram", "indigo", "crisp"], palettePreset: "hologram", variants: [softVariant(1.18), deepVariant(0.9), contrastVariant(1.34), minimalVariant()] },
  { id: "laser-focus", name: "Laser Focus", category: "Futuristic", gradientStyle: "spotlight", tags: ["laser", "violet", "neon"], palettePreset: "laser", variants: [softVariant(1.16), deepVariant(0.9), contrastVariant(1.32), minimalVariant()] },
  { id: "quantum-field", name: "Quantum Field", category: "Futuristic", gradientStyle: "mesh", tags: ["quantum", "blue", "tech"], palettePreset: "quantum", variants: [softVariant(1.14), deepVariant(0.92), contrastVariant(1.3), minimalVariant()] },
  { id: "prism-drive", name: "Prism Drive", category: "Futuristic", gradientStyle: "aurora", tags: ["prism", "cyan", "violet"], palettePreset: "prism", variants: [softVariant(1.2), deepVariant(0.88), contrastVariant(1.35), minimalVariant()] },

  // ═══ Dark/Editorial (10+) ═══
  { id: "noir-halo", name: "Noir Halo", category: "Dark/Editorial", gradientStyle: "halo", tags: ["Noir", "editorial", "dark"], palettePreset: "noir", variants: [softVariant(0.95, true), deepVariant(0.82, true), contrastVariant(1.08), minimalVariant(0.9)] },
  { id: "editorial-smoke", name: "Editorial Smoke", category: "Dark/Editorial", gradientStyle: "noise-wash", tags: ["smoke", "editorial", "moody"], palettePreset: "ink", variants: [softVariant(0.98, true), deepVariant(0.8, true), contrastVariant(1.1), minimalVariant(0.9)] },
  { id: "ink-shadow", name: "Ink Shadow", category: "Dark/Editorial", gradientStyle: "soft-sweep", tags: ["ink", "shadow", "deep"], palettePreset: "charcoal", variants: [softVariant(0.96, true), deepVariant(0.78, true), contrastVariant(1.06), minimalVariant(0.9)] },
  { id: "deep-press", name: "Deep Press", category: "Dark/Editorial", gradientStyle: "diagonal-blend", tags: ["press", "structured", "dark"], palettePreset: "obsidian", variants: [softVariant(0.94, true), deepVariant(0.76, true), contrastVariant(1.04), minimalVariant(0.88)] },
  { id: "mono-spot", name: "Mono Spot", category: "Dark/Editorial", gradientStyle: "spotlight", tags: ["mono", "spot", "focused"], palettePreset: "ink", variants: [softVariant(0.98, true), deepVariant(0.8, true), contrastVariant(1.1), minimalVariant(0.9)] },
  { id: "coal-wave", name: "Coal Wave", category: "Dark/Editorial", gradientStyle: "wave", tags: ["coal", "wave", "moody"], palettePreset: "noir", variants: [softVariant(0.96, true), deepVariant(0.78, true), contrastVariant(1.08), minimalVariant(0.9)] },
  { id: "pitch-void", name: "Pitch Void", category: "Dark/Editorial", gradientStyle: "spotlight", tags: ["pitch", "void", "minimal"], palettePreset: "ink", variants: [softVariant(0.98, true), deepVariant(0.78, true), contrastVariant(1.06), minimalVariant(0.88)] },
  { id: "editorial-velvet", name: "Editorial Velvet", category: "Dark/Editorial", gradientStyle: "halo", tags: ["velvet", "sophisticated", "dark"], palettePreset: "velvet", variants: [softVariant(0.96, true), deepVariant(0.8, true), contrastVariant(1.08), minimalVariant(0.9)] },
  { id: "press-burgundy", name: "Press Burgundy", category: "Dark/Editorial", gradientStyle: "noise-wash", tags: ["burgundy", "muted", "editorial"], palettePreset: "burgundy", variants: [softVariant(0.94, true), deepVariant(0.78, true), contrastVariant(1.06), minimalVariant(0.88)] },
  { id: "olive-shadow", name: "Olive Shadow", category: "Dark/Editorial", gradientStyle: "soft-sweep", tags: ["olive", "muted", "sophisticated"], palettePreset: "olive", variants: [softVariant(0.96, true), deepVariant(0.8, true), contrastVariant(1.08), minimalVariant(0.9)] },

  // ═══ Expressive (10+) ═══
  { id: "ember-flare", name: "Ember Flare", category: "Expressive", gradientStyle: "sunset", tags: ["ember", "warm", "bold"], palettePreset: "ember", variants: [softVariant(1.18), deepVariant(0.9), contrastVariant(1.34), minimalVariant()] },
  { id: "rose-burst", name: "Rose Burst", category: "Expressive", gradientStyle: "aurora", tags: ["rose", "expressive", "lush"], palettePreset: "rose", variants: [softVariant(1.2), deepVariant(0.92), contrastVariant(1.36), minimalVariant()] },
  { id: "electric-surge", name: "Electric Surge", category: "Expressive", gradientStyle: "wave", tags: ["electric", "surge", "energy"], palettePreset: "electric", variants: [softVariant(1.16), deepVariant(0.9), contrastVariant(1.38), minimalVariant()] },
  { id: "prism-flux", name: "Prism Flux", category: "Expressive", gradientStyle: "crystal", tags: ["prism", "flux", "vivid"], palettePreset: "forest", variants: [softVariant(1.18), deepVariant(0.9), contrastVariant(1.35), minimalVariant()] },
  { id: "lava-noise", name: "Lava Noise", category: "Expressive", gradientStyle: "noise-wash", tags: ["lava", "textured", "bold"], palettePreset: "magma", variants: [softVariant(1.14, true), deepVariant(0.88, true), contrastVariant(1.32), minimalVariant()] },
  { id: "cosmic-bloom", name: "Cosmic Bloom", category: "Expressive", gradientStyle: "cosmic", tags: ["cosmic", "bloom", "expressive"], palettePreset: "nebula", variants: [softVariant(1.2), deepVariant(0.9), contrastVariant(1.36), minimalVariant()] },
  { id: "flame-dance", name: "Flame Dance", category: "Expressive", gradientStyle: "wave", tags: ["flame", "dance", "bold"], palettePreset: "coral", variants: [softVariant(1.16), deepVariant(0.88), contrastVariant(1.35), minimalVariant()] },
  { id: "neon-punch", name: "Neon Punch", category: "Expressive", gradientStyle: "mesh", tags: ["neon", "punch", "vivid"], palettePreset: "gold", variants: [softVariant(1.18), deepVariant(0.9), contrastVariant(1.38), minimalVariant()] },
  { id: "sunset-blaze", name: "Sunset Blaze", category: "Expressive", gradientStyle: "sunset", tags: ["sunset", "blaze", "warm"], palettePreset: "sunset", variants: [softVariant(1.2), deepVariant(0.9), contrastVariant(1.36), minimalVariant()] },
  { id: "amethyst-dream", name: "Amethyst Dream", category: "Expressive", gradientStyle: "aurora", tags: ["amethyst", "dream", "rich"], palettePreset: "amethyst", variants: [softVariant(1.18), deepVariant(0.9), contrastVariant(1.34), minimalVariant()] },
  { id: "cosmic-storm", name: "Cosmic Storm", category: "Expressive", gradientStyle: "cosmic", tags: ["cosmic", "storm", "dramatic"], palettePreset: "cosmic", variants: [softVariant(1.16), deepVariant(0.88), contrastVariant(1.35), minimalVariant()] },

  // ═══ Space (10+) ═══
  { id: "deep-nebula", name: "Deep Nebula", category: "Space", gradientStyle: "cosmic", tags: ["space", "nebula", "galaxy"], palettePreset: "stellar", variants: [softVariant(1.1, true), deepVariant(0.8, true), contrastVariant(1.3), minimalVariant(0.95)] },
  { id: "starfield", name: "Starfield", category: "Space", gradientStyle: "orb", tags: ["space", "stars", "night"], palettePreset: "noir", variants: [softVariant(1.05, true), deepVariant(0.82, true), contrastVariant(1.25), minimalVariant(0.92)] },
  { id: "aurora-borealis", name: "Aurora Borealis", category: "Space", gradientStyle: "aurora", tags: ["aurora", "northern-lights", "glow"], palettePreset: "aurora", variants: [softVariant(1.15), deepVariant(0.85, true), contrastVariant(1.35), minimalVariant(1.0)] },
  { id: "galaxy-core", name: "Galaxy Core", category: "Space", gradientStyle: "halo", tags: ["galaxy", "core", "bright"], palettePreset: "nebulaSpace", variants: [softVariant(1.12, true), deepVariant(0.78, true), contrastVariant(1.32), minimalVariant(0.96)] },
  { id: "void-horizon", name: "Void Horizon", category: "Space", gradientStyle: "diagonal-blend", tags: ["void", "horizon", "dark"], palettePreset: "midnight", variants: [softVariant(1.08, true), deepVariant(0.76, true), contrastVariant(1.28), minimalVariant(0.9)] },
  { id: "solar-flare", name: "Solar Flare", category: "Space", gradientStyle: "sunset", tags: ["solar", "sun", "flare"], palettePreset: "ember", variants: [softVariant(1.18, true), deepVariant(0.84, true), contrastVariant(1.38), minimalVariant(0.98)] },
  { id: "eclipse-depth", name: "Eclipse Depth", category: "Space", gradientStyle: "spotlight", tags: ["eclipse", "depth", "cinematic"], palettePreset: "eclipse", variants: [softVariant(1.06, true), deepVariant(0.82, true), contrastVariant(1.28), minimalVariant(0.94)] },
  { id: "orbit-drift", name: "Orbit Drift", category: "Space", gradientStyle: "orb", tags: ["orbit", "drift", "cosmic"], palettePreset: "orbit", variants: [softVariant(1.1, true), deepVariant(0.86, true), contrastVariant(1.3), minimalVariant(0.96)] },
  { id: "comet-tail", name: "Comet Tail", category: "Space", gradientStyle: "wave", tags: ["comet", "tail", "teal"], palettePreset: "comet", variants: [softVariant(1.14), deepVariant(0.88, true), contrastVariant(1.32), minimalVariant(1.0)] },
  { id: "lunar-surface", name: "Lunar Surface", category: "Space", gradientStyle: "noise-wash", tags: ["lunar", "surface", "minimal"], palettePreset: "lunar", variants: [softVariant(1.04, true), deepVariant(0.84, true), contrastVariant(1.22), minimalVariant(0.92)] },
  { id: "deep-space-field", name: "Deep Space Field", category: "Space", gradientStyle: "cosmic", tags: ["deep", "field", "navy"], palettePreset: "deepSpace", variants: [softVariant(1.02, true), deepVariant(0.78, true), contrastVariant(1.26), minimalVariant(0.9)] },
  { id: "pulsar-glow", name: "Pulsar Glow", category: "Space", gradientStyle: "halo", tags: ["pulsar", "glow", "violet"], palettePreset: "pulsar", variants: [softVariant(1.12), deepVariant(0.86, true), contrastVariant(1.34), minimalVariant(0.98)] },

  // ═══ Vivid/Alive (10+) ═══
  { id: "pulse-wave", name: "Pulse Wave", category: "Vivid/Alive", gradientStyle: "wave", tags: ["pulse", "energy", "dynamic"], palettePreset: "candy", variants: [softVariant(1.2), deepVariant(0.88), contrastVariant(1.38), minimalVariant()] },
  { id: "neon-aurora", name: "Neon Aurora", category: "Vivid/Alive", gradientStyle: "aurora", tags: ["neon", "aurora", "vivid"], palettePreset: "tropical", variants: [softVariant(1.22), deepVariant(0.9), contrastVariant(1.4), minimalVariant()] },
  { id: "molten-mesh", name: "Molten Mesh", category: "Vivid/Alive", gradientStyle: "mesh", tags: ["molten", "mesh", "warm"], palettePreset: "ember", variants: [softVariant(1.16, true), deepVariant(0.86, true), contrastVariant(1.34), minimalVariant()] },
  { id: "crystal-rain", name: "Crystal Rain", category: "Vivid/Alive", gradientStyle: "crystal", tags: ["crystal", "rain", "sparkle"], palettePreset: "mint", variants: [softVariant(1.18), deepVariant(0.88), contrastVariant(1.36), minimalVariant()] },
  { id: "bloom-burst", name: "Bloom Burst", category: "Vivid/Alive", gradientStyle: "spotlight", tags: ["bloom", "burst", "organic"], palettePreset: "rose", variants: [softVariant(1.2), deepVariant(0.86), contrastVariant(1.38), minimalVariant()] },
  { id: "electric-sunset", name: "Electric Sunset", category: "Vivid/Alive", gradientStyle: "sunset", tags: ["electric", "sunset", "golden"], palettePreset: "sunset", variants: [softVariant(1.22), deepVariant(0.84), contrastVariant(1.4), minimalVariant()] },
  { id: "ocean-pulse", name: "Ocean Pulse", category: "Vivid/Alive", gradientStyle: "wave", tags: ["ocean", "pulse", "teal"], palettePreset: "ocean", variants: [softVariant(1.16), deepVariant(0.9), contrastVariant(1.34), minimalVariant()] },
  { id: "lime-zest", name: "Lime Zest", category: "Vivid/Alive", gradientStyle: "aurora", tags: ["lime", "zest", "fresh"], palettePreset: "lime", variants: [softVariant(1.18), deepVariant(0.88), contrastVariant(1.36), minimalVariant()] },
  { id: "fuchsia-flow", name: "Fuchsia Flow", category: "Vivid/Alive", gradientStyle: "wave", tags: ["fuchsia", "flow", "vivid"], palettePreset: "fuchsia", variants: [softVariant(1.2), deepVariant(0.9), contrastVariant(1.38), minimalVariant()] },
  { id: "peach-glow", name: "Peach Glow", category: "Vivid/Alive", gradientStyle: "halo", tags: ["peach", "glow", "warm"], palettePreset: "peach", variants: [softVariant(1.16), deepVariant(0.9), contrastVariant(1.34), minimalVariant()] },
  { id: "aqua-burst", name: "Aqua Burst", category: "Vivid/Alive", gradientStyle: "spotlight", tags: ["aqua", "burst", "cyan"], palettePreset: "aqua", variants: [softVariant(1.18), deepVariant(0.88), contrastVariant(1.36), minimalVariant()] },
  { id: "berry-splash", name: "Berry Splash", category: "Vivid/Alive", gradientStyle: "aurora", tags: ["berry", "splash", "magenta"], palettePreset: "berry", variants: [softVariant(1.2), deepVariant(0.9), contrastVariant(1.38), minimalVariant()] },
  { id: "zest-energy", name: "Zest Energy", category: "Vivid/Alive", gradientStyle: "mesh", tags: ["zest", "energy", "lime"], palettePreset: "zest", variants: [softVariant(1.18), deepVariant(0.88), contrastVariant(1.36), minimalVariant()] },

  // ═══ Luxury (12+) – black tunnel, metallic, velvet, dark+accent ═══
  { id: "luxury-tunnel-1", name: "Black Tunnel", category: "Luxury", gradientStyle: "spotlight", tags: ["Luxury", "Black", "tunnel", "editorial"], palettePreset: "blackTunnel1", variants: [luxurySoft(), luxuryDeep(), luxuryEditorial(), luxuryMinimal()] },
  { id: "luxury-tunnel-2", name: "Obsidian Passage", category: "Luxury", gradientStyle: "halo", tags: ["Luxury", "Black", "tunnel", "passage"], palettePreset: "blackTunnel2", variants: [luxurySoft(), luxuryDeep(), luxuryEditorial(), luxuryMinimal()] },
  { id: "luxury-tunnel-3", name: "Midnight Corridor", category: "Luxury", gradientStyle: "wave", tags: ["Luxury", "Black", "tunnel", "corridor"], palettePreset: "blackTunnel3", variants: [luxurySoft(), luxuryDeep(), luxuryEditorial(), luxuryMinimal()] },
  { id: "luxury-tunnel-4", name: "Shadow Path", category: "Luxury", gradientStyle: "diagonal-blend", tags: ["Luxury", "Black", "tunnel", "path"], palettePreset: "blackTunnel4", variants: [luxurySoft(), luxuryDeep(), luxuryEditorial(), luxuryMinimal()] },
  { id: "luxury-champagne", name: "Champagne Sheen", category: "Luxury", gradientStyle: "halo", tags: ["Luxury", "Metallic", "champagne", "gold"], palettePreset: "metallicChampagne", variants: [luxurySoft(), luxuryDeep(), luxuryEditorial(), luxuryMinimal()] },
  { id: "luxury-gold", name: "Gold Leaf", category: "Luxury", gradientStyle: "soft-sweep", tags: ["Luxury", "Metallic", "gold", "premium"], palettePreset: "metallicGold", variants: [luxurySoft(), luxuryDeep(), luxuryEditorial(), luxuryMinimal()] },
  { id: "luxury-platinum", name: "Platinum Mist", category: "Luxury", gradientStyle: "noise-wash", tags: ["Luxury", "Metallic", "platinum", "silver"], palettePreset: "metallicPlatinum", variants: [luxurySoft(), luxuryDeep(), luxuryEditorial(), luxuryMinimal()] },
  { id: "luxury-velvet-1", name: "Velvet Obsidian", category: "Luxury", gradientStyle: "halo", tags: ["Luxury", "Velvet", "obsidian", "deep"], palettePreset: "velvetObsidian1", variants: [luxurySoft(), luxuryDeep(), luxuryEditorial(), luxuryMinimal()] },
  { id: "luxury-velvet-2", name: "Obsidian Velvet", category: "Luxury", gradientStyle: "soft-sweep", tags: ["Luxury", "Velvet", "obsidian", "soft"], palettePreset: "velvetObsidian2", variants: [luxurySoft(), luxuryDeep(), luxuryEditorial(), luxuryMinimal()] },
  { id: "luxury-emerald", name: "Emerald Accent", category: "Luxury", gradientStyle: "spotlight", tags: ["Luxury", "emerald", "accent", "dark"], palettePreset: "luxuryEmerald", variants: [luxurySoft(), luxuryDeep(), luxuryEditorial(), luxuryMinimal()] },
  { id: "luxury-ruby", name: "Ruby Accent", category: "Luxury", gradientStyle: "halo", tags: ["Luxury", "ruby", "accent", "dark"], palettePreset: "luxuryRuby", variants: [luxurySoft(), luxuryDeep(), luxuryEditorial(), luxuryMinimal()] },
  { id: "luxury-sapphire", name: "Sapphire Accent", category: "Luxury", gradientStyle: "aurora", tags: ["Luxury", "sapphire", "accent", "dark"], palettePreset: "luxurySapphire", variants: [luxurySoft(), luxuryDeep(), luxuryEditorial(), luxuryMinimal()] },
  { id: "luxury-espresso", name: "Espresso", category: "Luxury", gradientStyle: "noise-wash", tags: ["Luxury", "espresso", "brown", "premium"], palettePreset: "espresso", variants: [luxurySoft(), luxuryDeep(), luxuryEditorial(), luxuryMinimal()] },
  { id: "luxury-navy", name: "Deep Navy", category: "Luxury", gradientStyle: "diagonal-blend", tags: ["Luxury", "navy", "deep", "sophisticated"], palettePreset: "deepNavy", variants: [luxurySoft(), luxuryDeep(), luxuryEditorial(), luxuryMinimal()] },
];

export const CATEGORY_LABELS: BackgroundCategory[] = [
  "Soft/Ambient",
  "Futuristic",
  "Dark/Editorial",
  "Expressive",
  "Space",
  "Vivid/Alive",
  "Luxury",
];
