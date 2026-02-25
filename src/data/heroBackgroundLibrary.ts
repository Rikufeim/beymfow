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
  | "Luxury"
  | "Arctic"
  | "Colors";

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
  | "cosmic"
  | "nebula-cloud"
  | "radial-pulse"
  | "glass-shards"
  | "grid-perspective"
  | "fluid-flow"
  | "cyber-grid"
  | "bokeh-lights"
  | "velvet-wrap"
  | "prism-refraction"
  | "midnight-mist"
  | "solar-wind"
  | "digital-rain"
  | "abstract-curves"
  | "neon-smoke"
  | "geometric-shapes"
  | "silk-drape"
  | "vortex-spin"
  | "glitch-noise"
  | "star-cluster"
  | "liquid-metal";

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
  mist: { color1: "#0a0f18", color2: "#141c28", color3: "#7d8fa6", color4: "#c8d5e4" },
  fog: { color1: "#0c1218", color2: "#161f2a", color3: "#9aabbf", color4: "#dce6f0" },
  linen: { color1: "#121010", color2: "#1e1a18", color3: "#b5a89d", color4: "#dbd3cc" },
  sage: { color1: "#0a0f0c", color2: "#141c16", color3: "#5ce890", color4: "#8ff5b5" },
  dawn: { color1: "#100c0a", color2: "#1c1612", color3: "#fcd04a", color4: "#fde68a" },
  arctic: { color1: "#061420", color2: "#0e2030", color3: "#0ea5c8", color4: "#38e0f5" },
  slate: { color1: "#0c1014", color2: "#181e26", color3: "#5a6b80", color4: "#9aabbf" },
  cream: { color1: "#161412", color2: "#201c18", color3: "#e0ddd8", color4: "#f5f4f2" },
  haze: { color1: "#080e14", color2: "#101820", color3: "#7080a0", color4: "#9aabbf" },
  whisper: { color1: "#0c0e12", color2: "#161a20", color3: "#808898", color4: "#b0b8c8" },

  // ── Futuristic: cool tech blues, cyans, violets, neon; crisp contrast
  neon: { color1: "#06142a", color2: "#0c1e38", color3: "#2ce0f5", color4: "#c890ff" },
  sapphire: { color1: "#080c20", color2: "#121c34", color3: "#2860e8", color4: "#70b0ff" },
  aurora: { color1: "#060c1a", color2: "#0e162a", color3: "#08c8e0", color4: "#b060ff" },
  electric: { color1: "#060e1a", color2: "#0c1a2c", color3: "#18b8f0", color4: "#f080ff" },
  ion: { color1: "#081420", color2: "#0e2034", color3: "#38e0c8", color4: "#70f0ff" },
  matrix: { color1: "#040e0a", color2: "#081a14", color3: "#18cc90", color4: "#40e0a8" },
  hologram: { color1: "#060c1c", color2: "#101828", color3: "#7078f8", color4: "#b0bcff" },
  laser: { color1: "#0a081c", color2: "#14102c", color3: "#9868ff", color4: "#ccb8ff" },
  quantum: { color1: "#060c18", color2: "#0e182c", color3: "#4890ff", color4: "#a0ccff" },
  prism: { color1: "#081020", color2: "#101c30", color3: "#10c8e0", color4: "#b090ff" },

  // ── Dark/Editorial: blacks, charcoals, ink blues, muted burgundy/olive; sophisticated
  noir: { color1: "#050508", color2: "#0c0c10", color3: "#303038", color4: "#585868" },
  ink: { color1: "#070710", color2: "#101018", color3: "#202028", color4: "#484858" },
  charcoal: { color1: "#0a0a0c", color2: "#161618", color3: "#404858", color4: "#788090" },
  obsidian: { color1: "#06060c", color2: "#0e0e14", color3: "#243048", color4: "#506078" },
  midnight: { color1: "#060610", color2: "#0c0c1c", color3: "#2a2460", color4: "#5040d8" },
  editorial: { color1: "#080808", color2: "#141414", color3: "#484848", color4: "#808080" },
  press: { color1: "#060606", color2: "#0e0e0e", color3: "#383838", color4: "#606060" },
  velvet: { color1: "#0a080c", color2: "#141016", color3: "#2a2430", color4: "#484050" },
  burgundy: { color1: "#0c080a", color2: "#160c10", color3: "#602828", color4: "#982828" },
  olive: { color1: "#0a0c08", color2: "#14160c", color3: "#406020", color4: "#609018" },

  // ── Expressive: bold gradients, rich purples/reds/teals; dramatic, tasteful
  rose: { color1: "#0c080c", color2: "#180c14", color3: "#d02068", color4: "#ff80c0" },
  ember: { color1: "#0e0806", color2: "#1a0e08", color3: "#d84818", color4: "#ff9848" },
  magma: { color1: "#0e0606", color2: "#18080a", color3: "#d02828", color4: "#ff7878" },
  amethyst: { color1: "#0c0818", color2: "#160c24", color3: "#8848f0", color4: "#cc90ff" },
  coral: { color1: "#0c0808", color2: "#180c0c", color3: "#f02050", color4: "#ff8090" },
  sunset: { color1: "#100a08", color2: "#1c120a", color3: "#c86010", color4: "#ffc830" },
  forest: { color1: "#060e08", color2: "#101c14", color3: "#1c9048", color4: "#58e888" },
  nebula: { color1: "#08040c", color2: "#10081a", color3: "#7830e0", color4: "#b890ff" },
  gold: { color1: "#100c08", color2: "#1c1408", color3: "#e08808", color4: "#ffe050" },
  cosmic: { color1: "#040810", color2: "#0a1020", color3: "#5850f0", color4: "#9098ff" },

  // ── Space: deep navy/black, cosmic purples, star-like highlights
  void: { color1: "#03060e", color2: "#081020", color3: "#284870", color4: "#4890f0" },
  stellar: { color1: "#04080e", color2: "#0a1018", color3: "#4038b0", color4: "#7070f8" },
  eclipse: { color1: "#06060e", color2: "#0c0c18", color3: "#383890", color4: "#9090ff" },
  orbit: { color1: "#06040c", color2: "#0c0818", color3: "#6830c0", color4: "#b090ff" },
  comet: { color1: "#060e1c", color2: "#0c1c30", color3: "#188098", color4: "#30e0ff" },
  lunar: { color1: "#080810", color2: "#101018", color3: "#586070", color4: "#a8b0b8" },
  deepSpace: { color1: "#030408", color2: "#080c18", color3: "#243040", color4: "#506878" },
  pulsar: { color1: "#060410", color2: "#0c081c", color3: "#8848f0", color4: "#cc90ff" },
  horizon: { color1: "#080e18", color2: "#101c28", color3: "#2858e0", color4: "#70b0ff" },
  nebulaSpace: { color1: "#06040c", color2: "#0c0818", color3: "#7830e0", color4: "#b890ff" },

  // ── Vivid/Alive: lively teal/lime/magenta; energetic, balanced
  candy: { color1: "#0c0814", color2: "#160c20", color3: "#e83080", color4: "#b890ff" },
  tropical: { color1: "#060e0a", color2: "#0c1814", color3: "#10a878", color4: "#40e098" },
  mint: { color1: "#081614", color2: "#0c2020", color3: "#18a898", color4: "#68f0e0" },
  ocean: { color1: "#081420", color2: "#0c1e2c", color3: "#1888a8", color4: "#38e0c8" },
  lime: { color1: "#080e08", color2: "#10180c", color3: "#70b818", color4: "#b0f040" },
  fuchsia: { color1: "#0c0814", color2: "#180c20", color3: "#d030e0", color4: "#f080ff" },
  peach: { color1: "#100c08", color2: "#1a140c", color3: "#f06818", color4: "#ffc080" },
  aqua: { color1: "#060e10", color2: "#0c1820", color3: "#10a0c0", color4: "#30e0f0" },
  berry: { color1: "#0c0810", color2: "#180c18", color3: "#d02060", color4: "#ff78c0" },
  zest: { color1: "#0c1008", color2: "#161c0c", color3: "#90d818", color4: "#c8f860" },

  // ── Luxury: black/charcoal base, espresso, navy, emerald, ruby, champagne, platinum; premium
  blackTunnel1: { color1: "#030304", color2: "#0a0a0c", color3: "#141418", color4: "#222228" },
  blackTunnel2: { color1: "#040408", color2: "#0c0c10", color3: "#181820", color4: "#2c2c34" },
  blackTunnel3: { color1: "#050508", color2: "#0e0e14", color3: "#1c1c24", color4: "#343440" },
  blackTunnel4: { color1: "#060608", color2: "#101014", color3: "#202028", color4: "#3c3c48" },
  metallicChampagne: { color1: "#0e0c0a", color2: "#18120a", color3: "#b87010", color4: "#e0b080" },
  metallicGold: { color1: "#0c0a08", color2: "#16120a", color3: "#986010", color4: "#d89810" },
  metallicPlatinum: { color1: "#0a0a0e", color2: "#141416", color3: "#606068", color4: "#b0b0b8" },
  velvetObsidian1: { color1: "#040408", color2: "#0a0a0e", color3: "#202028", color4: "#484850" },
  velvetObsidian2: { color1: "#050508", color2: "#0c0c10", color3: "#242428", color4: "#444450" },
  luxuryEmerald: { color1: "#030604", color2: "#0a100a", color3: "#086048", color4: "#18a898" },
  luxuryRuby: { color1: "#060404", color2: "#0e0808", color3: "#902828", color4: "#c83030" },
  luxurySapphire: { color1: "#030610", color2: "#0a1020", color3: "#284898", color4: "#3070e8" },
  espresso: { color1: "#0c0a08", color2: "#18120a", color3: "#342c24", color4: "#686058" },
  deepNavy: { color1: "#040810", color2: "#0a1018", color3: "#141e34", color4: "#243448" },

  // ── Arctic: icy blues, whites, pale cyans, frosted teals; cold, crisp, fresh
  arcticFrost: { color1: "#060e18", color2: "#0c1828", color3: "#38a8d8", color4: "#88e0ff" },
  arcticGlacier: { color1: "#080c14", color2: "#101822", color3: "#2890c8", color4: "#60c8f0" },
  arcticAurora: { color1: "#060c18", color2: "#0e142a", color3: "#20b0d0", color4: "#90d8ff" },
  arcticTundra: { color1: "#080e14", color2: "#12182a", color3: "#4898b8", color4: "#80c8e0" },
  arcticIce: { color1: "#08101c", color2: "#101c30", color3: "#58b8d8", color4: "#a0e0f8" },
  arcticBlizzard: { color1: "#0a1220", color2: "#141e34", color3: "#70c0e0", color4: "#b8e8ff" },
  arcticDeep: { color1: "#040810", color2: "#0a1020", color3: "#1870a0", color4: "#38b0e0" },
  arcticMist: { color1: "#0a1018", color2: "#141c28", color3: "#6090b0", color4: "#a0c8e0" },
  arcticNeon: { color1: "#060c1c", color2: "#0c1830", color3: "#00b8e8", color4: "#50f0ff" },
  arcticCrystal: { color1: "#081018", color2: "#101c28", color3: "#48a8c8", color4: "#78d0f0" },
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
  // ═══ Soft/Ambient (20+) ═══
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
  // Additional Soft/Ambient palette presets
  { id: "fog-ambient", name: "Fog", category: "Soft/Ambient", gradientStyle: "soft-sweep", tags: ["fog", "neutral", "calm"], palettePreset: "fog", variants: [softVariant(1.12), deepVariant(), minimalVariant()] },
  { id: "linen-texture", name: "Linen", category: "Soft/Ambient", gradientStyle: "soft-sweep", tags: [" linen", "warm", "neutral"], palettePreset: "linen", variants: [softVariant(1.1), deepVariant(), minimalVariant()] },
  { id: "sage-minimal", name: "Sage", category: "Soft/Ambient", gradientStyle: "soft-sweep", tags: ["sage", "green", "minimal"], palettePreset: "sage", variants: [softVariant(1.12), deepVariant(), minimalVariant()] },
  { id: "dawn-golden", name: "Dawn", category: "Soft/Ambient", gradientStyle: "soft-sweep", tags: ["dawn", "golden", "warm"], palettePreset: "dawn", variants: [softVariant(1.14), deepVariant(), minimalVariant()] },
  { id: "arctic-cool", name: "Arctic", category: "Soft/Ambient", gradientStyle: "soft-sweep", tags: ["arctic", "cool", "teal"], palettePreset: "arctic", variants: [softVariant(1.12), deepVariant(), minimalVariant()] },
  { id: "slate-neutral", name: "Slate", category: "Soft/Ambient", gradientStyle: "soft-sweep", tags: ["slate", "neutral", "minimal"], palettePreset: "slate", variants: [softVariant(1.08), deepVariant(), minimalVariant()] },
  { id: "cream-warm", name: "Cream", category: "Soft/Ambient", gradientStyle: "soft-sweep", tags: ["cream", "warm", "light"], palettePreset: "cream", variants: [softVariant(1.15), deepVariant(), minimalVariant()] },
  { id: "haze-ambient", name: "Haze", category: "Soft/Ambient", gradientStyle: "soft-sweep", tags: ["haze", "minimal", "subtle"], palettePreset: "haze", variants: [softVariant(1.1), deepVariant(), minimalVariant()] },
  { id: "whisper-gentle", name: "Whisper", category: "Soft/Ambient", gradientStyle: "soft-sweep", tags: ["whisper", "gentle", "minimal"], palettePreset: "whisper", variants: [softVariant(1.08), deepVariant(), minimalVariant()] },

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

  // ═══ Arctic (10) – icy blues, frosted teals, glacial whites ═══
  { id: "arctic-frost", name: "Arctic Frost", category: "Arctic", gradientStyle: "aurora", tags: ["arctic", "frost", "icy", "blue"], palettePreset: "arcticFrost", variants: [softVariant(1.2), deepVariant(0.88), contrastVariant(1.35), minimalVariant()] },
  { id: "arctic-glacier", name: "Glacier", category: "Arctic", gradientStyle: "halo", tags: ["glacier", "ice", "blue", "cold"], palettePreset: "arcticGlacier", variants: [softVariant(1.18), deepVariant(0.9), contrastVariant(1.32), minimalVariant()] },
  { id: "arctic-aurora-north", name: "Northern Lights", category: "Arctic", gradientStyle: "aurora", tags: ["aurora", "northern", "lights", "glow"], palettePreset: "arcticAurora", variants: [softVariant(1.22), deepVariant(0.86), contrastVariant(1.38), minimalVariant()] },
  { id: "arctic-tundra", name: "Frozen Tundra", category: "Arctic", gradientStyle: "noise-wash", tags: ["tundra", "frozen", "pale", "cold"], palettePreset: "arcticTundra", variants: [softVariant(1.14, true), deepVariant(0.92, true), contrastVariant(1.28), minimalVariant()] },
  { id: "arctic-ice-field", name: "Ice Field", category: "Arctic", gradientStyle: "mesh", tags: ["ice", "field", "crystal", "blue"], palettePreset: "arcticIce", variants: [softVariant(1.2), deepVariant(0.88), contrastVariant(1.35), minimalVariant()] },
  { id: "arctic-blizzard", name: "Blizzard", category: "Arctic", gradientStyle: "cosmic", tags: ["blizzard", "snow", "white", "cold"], palettePreset: "arcticBlizzard", variants: [softVariant(1.24), deepVariant(0.86), contrastVariant(1.4), minimalVariant()] },
  { id: "arctic-deep-freeze", name: "Deep Freeze", category: "Arctic", gradientStyle: "spotlight", tags: ["deep", "freeze", "dark", "cold"], palettePreset: "arcticDeep", variants: [softVariant(1.1), deepVariant(0.84, true), contrastVariant(1.3), minimalVariant()] },
  { id: "arctic-mist-fall", name: "Arctic Mist", category: "Arctic", gradientStyle: "soft-sweep", tags: ["mist", "soft", "pale", "frost"], palettePreset: "arcticMist", variants: [softVariant(1.16), deepVariant(0.92), contrastVariant(1.26), minimalVariant()] },
  { id: "arctic-neon-ice", name: "Neon Ice", category: "Arctic", gradientStyle: "wave", tags: ["neon", "ice", "cyan", "electric"], palettePreset: "arcticNeon", variants: [softVariant(1.18), deepVariant(0.88), contrastVariant(1.36), minimalVariant()] },
  { id: "arctic-crystal-cave", name: "Crystal Cave", category: "Arctic", gradientStyle: "crystal", tags: ["crystal", "cave", "shimmer", "blue"], palettePreset: "arcticCrystal", variants: [softVariant(1.2), deepVariant(0.9), contrastVariant(1.34), minimalVariant()] },

  // ═══ Colors (Simple Palettes - All Remaining from COLOR_PRESETS) ═══
  // Futuristic colors
  { id: "color-neon", name: "Neon", category: "Colors", gradientStyle: "soft-sweep", tags: ["neon", "cyan", "purple"], palettePreset: "neon", variants: [minimalVariant()] },
  { id: "color-ion", name: "Ion", category: "Colors", gradientStyle: "soft-sweep", tags: ["ion", "teal", "cyan"], palettePreset: "ion", variants: [minimalVariant()] },
  { id: "color-matrix", name: "Matrix", category: "Colors", gradientStyle: "soft-sweep", tags: ["matrix", "green", "tech"], palettePreset: "matrix", variants: [minimalVariant()] },
  { id: "color-hologram", name: "Hologram", category: "Colors", gradientStyle: "soft-sweep", tags: ["hologram", "indigo", "neon"], palettePreset: "hologram", variants: [minimalVariant()] },
  { id: "color-laser", name: "Laser", category: "Colors", gradientStyle: "soft-sweep", tags: ["laser", "violet", "purple"], palettePreset: "laser", variants: [minimalVariant()] },
  { id: "color-quantum", name: "Quantum", category: "Colors", gradientStyle: "soft-sweep", tags: ["quantum", "blue", "tech"], palettePreset: "quantum", variants: [minimalVariant()] },
  { id: "color-prism", name: "Prism", category: "Colors", gradientStyle: "soft-sweep", tags: ["prism", "cyan", "violet"], palettePreset: "prism", variants: [minimalVariant()] },
  // Dark/Editorial colors
  { id: "color-noir", name: "Noir", category: "Colors", gradientStyle: "soft-sweep", tags: ["noir", "black", "dark"], palettePreset: "noir", variants: [minimalVariant(0.9)] },
  { id: "color-ink", name: "Ink", category: "Colors", gradientStyle: "soft-sweep", tags: ["ink", "black", "deep"], palettePreset: "ink", variants: [minimalVariant(0.9)] },
  { id: "color-charcoal", name: "Charcoal", category: "Colors", gradientStyle: "soft-sweep", tags: ["charcoal", "gray", "neutral"], palettePreset: "charcoal", variants: [minimalVariant(0.9)] },
  { id: "color-obsidian", name: "Obsidian", category: "Colors", gradientStyle: "soft-sweep", tags: ["obsidian", "dark", "blue"], palettePreset: "obsidian", variants: [minimalVariant(0.9)] },
  { id: "color-midnight", name: "Midnight", category: "Colors", gradientStyle: "soft-sweep", tags: ["midnight", "navy", "dark"], palettePreset: "midnight", variants: [minimalVariant(0.9)] },
  { id: "color-editorial", name: "Editorial", category: "Colors", gradientStyle: "soft-sweep", tags: ["editorial", "gray", "neutral"], palettePreset: "editorial", variants: [minimalVariant(0.9)] },
  { id: "color-press", name: "Press", category: "Colors", gradientStyle: "soft-sweep", tags: ["press", "dark", "neutral"], palettePreset: "press", variants: [minimalVariant(0.9)] },
  { id: "color-velvet", name: "Velvet", category: "Colors", gradientStyle: "soft-sweep", tags: ["velvet", "purple", "dark"], palettePreset: "velvet", variants: [minimalVariant(0.9)] },
  { id: "color-burgundy", name: "Burgundy", category: "Colors", gradientStyle: "soft-sweep", tags: ["burgundy", "red", "dark"], palettePreset: "burgundy", variants: [minimalVariant(0.9)] },
  { id: "color-olive", name: "Olive", category: "Colors", gradientStyle: "soft-sweep", tags: ["olive", "green", "muted"], palettePreset: "olive", variants: [minimalVariant(0.9)] },
  // Expressive colors
  { id: "color-rose", name: "Rose", category: "Colors", gradientStyle: "soft-sweep", tags: ["rose", "pink", "bold"], palettePreset: "rose", variants: [minimalVariant()] },
  { id: "color-ember", name: "Ember", category: "Colors", gradientStyle: "soft-sweep", tags: ["ember", "orange", "warm"], palettePreset: "ember", variants: [minimalVariant()] },
  { id: "color-magma", name: "Magma", category: "Colors", gradientStyle: "soft-sweep", tags: ["magma", "red", "hot"], palettePreset: "magma", variants: [minimalVariant()] },
  { id: "color-amethyst", name: "Amethyst", category: "Colors", gradientStyle: "soft-sweep", tags: ["amethyst", "purple", "rich"], palettePreset: "amethyst", variants: [minimalVariant()] },
  { id: "color-coral", name: "Coral", category: "Colors", gradientStyle: "soft-sweep", tags: ["coral", "pink", "warm"], palettePreset: "coral", variants: [minimalVariant()] },
  { id: "color-sunset", name: "Sunset", category: "Colors", gradientStyle: "soft-sweep", tags: ["sunset", "golden", "warm"], palettePreset: "sunset", variants: [minimalVariant()] },
  { id: "color-forest", name: "Forest", category: "Colors", gradientStyle: "soft-sweep", tags: ["forest", "green", "natural"], palettePreset: "forest", variants: [minimalVariant()] },
  { id: "color-nebula", name: "Nebula", category: "Colors", gradientStyle: "soft-sweep", tags: ["nebula", "purple", "cosmic"], palettePreset: "nebula", variants: [minimalVariant()] },
  { id: "color-gold", name: "Gold", category: "Colors", gradientStyle: "soft-sweep", tags: ["gold", "yellow", "premium"], palettePreset: "gold", variants: [minimalVariant()] },
  { id: "color-cosmic", name: "Cosmic", category: "Colors", gradientStyle: "soft-sweep", tags: ["cosmic", "indigo", "space"], palettePreset: "cosmic", variants: [minimalVariant()] },
  // Space colors  
  { id: "color-void", name: "Void", category: "Colors", gradientStyle: "soft-sweep", tags: ["void", "navy", "deep"], palettePreset: "void", variants: [minimalVariant(0.95)] },
  { id: "color-stellar", name: "Stellar", category: "Colors", gradientStyle: "soft-sweep", tags: ["stellar", "indigo", "space"], palettePreset: "stellar", variants: [minimalVariant(0.95)] },
  { id: "color-eclipse", name: "Eclipse", category: "Colors", gradientStyle: "soft-sweep", tags: ["eclipse", "indigo", "dark"], palettePreset: "eclipse", variants: [minimalVariant(0.95)] },
  { id: "color-orbit", name: "Orbit", category: "Colors", gradientStyle: "soft-sweep", tags: ["orbit", "violet", "space"], palettePreset: "orbit", variants: [minimalVariant(0.95)] },
  { id: "color-comet", name: "Comet", category: "Colors", gradientStyle: "soft-sweep", tags: ["comet", "cyan", "space"], palettePreset: "comet", variants: [minimalVariant()] },
  { id: "color-lunar", name: "Lunar", category: "Colors", gradientStyle: "soft-sweep", tags: ["lunar", "gray", "minimal"], palettePreset: "lunar", variants: [minimalVariant(0.92)] },
  { id: "color-deepSpace", name: "Deep Space", category: "Colors", gradientStyle: "soft-sweep", tags: ["deep", "navy", "space"], palettePreset: "deepSpace", variants: [minimalVariant(0.9)] },
  { id: "color-pulsar", name: "Pulsar", category: "Colors", gradientStyle: "soft-sweep", tags: ["pulsar", "violet", "glow"], palettePreset: "pulsar", variants: [minimalVariant()] },
  { id: "color-horizon", name: "Horizon", category: "Colors", gradientStyle: "soft-sweep", tags: ["horizon", "blue", "space"], palettePreset: "horizon", variants: [minimalVariant()] },
  { id: "color-nebulaSpace", name: "Nebula Space", category: "Colors", gradientStyle: "soft-sweep", tags: ["nebula", "purple", "space"], palettePreset: "nebulaSpace", variants: [minimalVariant()] },
  // Vivid/Alive colors
  { id: "color-candy", name: "Candy", category: "Colors", gradientStyle: "soft-sweep", tags: ["candy", "magenta", "vivid"], palettePreset: "candy", variants: [minimalVariant()] },
  { id: "color-tropical", name: "Tropical", category: "Colors", gradientStyle: "soft-sweep", tags: ["tropical", "green", "vibrant"], palettePreset: "tropical", variants: [minimalVariant()] },
  { id: "color-mint", name: "Mint", category: "Colors", gradientStyle: "soft-sweep", tags: ["mint", "teal", "fresh"], palettePreset: "mint", variants: [minimalVariant()] },
  { id: "color-ocean", name: "Ocean", category: "Colors", gradientStyle: "soft-sweep", tags: ["ocean", "cyan", "blue"], palettePreset: "ocean", variants: [minimalVariant()] },
  { id: "color-lime", name: "Lime", category: "Colors", gradientStyle: "soft-sweep", tags: ["lime", "green", "bright"], palettePreset: "lime", variants: [minimalVariant()] },
  { id: "color-fuchsia", name: "Fuchsia", category: "Colors", gradientStyle: "soft-sweep", tags: ["fuchsia", "magenta", "vivid"], palettePreset: "fuchsia", variants: [minimalVariant()] },
  { id: "color-peach", name: "Peach", category: "Colors", gradientStyle: "soft-sweep", tags: ["peach", "orange", "warm"], palettePreset: "peach", variants: [minimalVariant()] },
  { id: "color-aqua", name: "Aqua", category: "Colors", gradientStyle: "soft-sweep", tags: ["aqua", "cyan", "bright"], palettePreset: "aqua", variants: [minimalVariant()] },
  { id: "color-berry", name: "Berry", category: "Colors", gradientStyle: "soft-sweep", tags: ["berry", "pink", "vivid"], palettePreset: "berry", variants: [minimalVariant()] },
  { id: "color-zest", name: "Zest", category: "Colors", gradientStyle: "soft-sweep", tags: ["zest", "lime", "energetic"], palettePreset: "zest", variants: [minimalVariant()] },
];

export const CATEGORY_LABELS: BackgroundCategory[] = [
  "Soft/Ambient",
  "Futuristic",
  "Dark/Editorial",
  "Expressive",
  "Space",
  "Vivid/Alive",
  "Luxury",
  "Arctic",
  "Colors",
];
