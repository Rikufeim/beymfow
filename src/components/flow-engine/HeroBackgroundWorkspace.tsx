import React, { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HexColorPicker } from "react-colorful";
import { ArrowLeft, Maximize2, Minimize2, Eye, EyeOff, Sun, Cloudy, Layers, Save, Check, ChevronUp, ChevronDown, Code, FileJson, Pencil, Palette, GripVertical } from "lucide-react";
import ColorPickerField from "@/components/flow-nodes/ColorPickerField";
import { cn } from "@/lib/utils";
import { HeroExportPanel } from "./HeroExportPanel";
import { buildHeroGradient } from "./heroGradient";
import {
  saveProject,
  saveDraft,
  generateThumbnail,
  generateProjectName,
  type HeroBackgroundProject
} from "@/lib/heroProjectStore";
import { toast } from "sonner";
// ColorPromptInput removed - flow input feature disabled

type FlowMode = "refine" | "reset";

interface FlowPalette {
  base: string;
  surface: string;
  accent: string;
  highlight: string;
  text: string;
}

interface FlowBackgroundParams {
  brightness: number;
  grainEnabled: boolean;
  grainIntensity: number;
  environmentEnabled: boolean;
}

interface FlowState {
  currentBackgroundStyle: HeroBackgroundSettings["gradientStyle"];
  backgroundParams: FlowBackgroundParams;
  palette: FlowPalette;
  lastUserPrompt: string;
  flowMode: FlowMode;
}

// --- Types ---
export interface HeroBackgroundSettings {
  // Colors
  color1: string;
  color2: string;
  color3: string;
  color4: string;
  singleColorMode: boolean;
  // Brightness
  brightness: number;
  // Grain
  grainEnabled: boolean;
  grainIntensity: number;
  // Environment / Light
  environmentEnabled: boolean;
  // Gradient style
  gradientStyle: "halo" | "soft-sweep" | "orb" | "diagonal-blend" | "noise-wash" | "aurora" | "mesh" | "spotlight" | "wave" | "crystal" | "sunset" | "cosmic";
  // Motion (future)
  motionEnabled: boolean;
  motionSpeed: number;
  // Component styling
  buttonPrimaryBg: string;
  buttonPrimaryText: string;
  buttonPrimaryGradient: "none" | "linear" | "radial" | "glossy" | "glow";
  buttonPrimaryGradientColor: string;
  buttonSecondaryBg: string;
  buttonSecondaryText: string;
  buttonSecondaryBorder: string;
  buttonSecondaryGradient: "none" | "linear" | "radial" | "glossy" | "glow";
  buttonSecondaryGradientColor: string;
  cardBg: string;
  cardBorder: string;
  cardGradient: "none" | "linear" | "radial" | "glossy" | "glass";
  cardGradientColor: string;
  inputBg: string;
  inputBorder: string;
  inputText: string;
  focusRingColor: string;
}

export const DEFAULT_SETTINGS: HeroBackgroundSettings = {
  color1: "#000000",
  color2: "#1a1a1a",
  color3: "#389cff",
  color4: "#8b5cf6",
  singleColorMode: false,
  brightness: 1.2,
  grainEnabled: false,
  grainIntensity: 0.18,
  environmentEnabled: true,
  gradientStyle: "halo",
  motionEnabled: false,
  motionSpeed: 0.5,
  // Component defaults
  buttonPrimaryBg: "#ffffff",
  buttonPrimaryText: "#000000",
  buttonPrimaryGradient: "none",
  buttonPrimaryGradientColor: "#389cff",
  buttonSecondaryBg: "transparent",
  buttonSecondaryText: "#ffffff",
  buttonSecondaryBorder: "rgba(255,255,255,0.3)",
  buttonSecondaryGradient: "none",
  buttonSecondaryGradientColor: "#8b5cf6",
  cardBg: "rgba(255,255,255,0.1)",
  cardBorder: "rgba(255,255,255,0.2)",
  cardGradient: "none",
  cardGradientColor: "#389cff",
  inputBg: "#1a1a1a",
  inputBorder: "rgba(255,255,255,0.1)",
  inputText: "#ffffff",
  focusRingColor: "#389cff",
};

// Color presets - Premium, balanced palettes
const COLOR_PRESETS = {
  // Dark & Sophisticated
  obsidian: { color1: "#0c0c0e", color2: "#18181c", color3: "#3b82f6", color4: "#6366f1" },
  midnight: { color1: "#0f0f1a", color2: "#1a1a2e", color3: "#4f46e5", color4: "#7c3aed" },
  charcoal: { color1: "#121214", color2: "#1c1c20", color3: "#64748b", color4: "#94a3b8" },

  // Vibrant & Modern
  aurora: { color1: "#0a0a12", color2: "#0f172a", color3: "#06b6d4", color4: "#8b5cf6" },
  ember: { color1: "#0c0a09", color2: "#1c1917", color3: "#f97316", color4: "#ef4444" },
  forest: { color1: "#0a0f0a", color2: "#14241a", color3: "#22c55e", color4: "#10b981" },

  // Premium Accents
  sapphire: { color1: "#0a0a14", color2: "#101828", color3: "#2563eb", color4: "#3b82f6" },
  amethyst: { color1: "#0f0a14", color2: "#1a1028", color3: "#a855f7", color4: "#c084fc" },
  rose: { color1: "#0f0a0c", color2: "#1c1418", color3: "#ec4899", color4: "#f472b6" },

  // Warm Tones
  sunset: { color1: "#0c0908", color2: "#1a1410", color3: "#f59e0b", color4: "#fb923c" },
  copper: { color1: "#0c0a08", color2: "#1c1610", color3: "#d97706", color4: "#ea580c" },

  // Cool Tones
  arctic: { color1: "#0a0e12", color2: "#0f1720", color3: "#38bdf8", color4: "#22d3ee" },
  slate: { color1: "#0f1115", color2: "#1e2128", color3: "#475569", color4: "#64748b" },

  // Light Themes
  pearl: { color1: "#f8fafc", color2: "#f1f5f9", color3: "#e2e8f0", color4: "#cbd5e1" },
  cream: { color1: "#fefdfb", color2: "#faf8f5", color3: "#f5d0c5", color4: "#dcd0ff" },
};

interface HeroBackgroundWorkspaceProps {
  projectId?: string;
  projectName?: string;
  initialSettings?: HeroBackgroundSettings;
  isLoggedIn?: boolean;
  onBack: () => void;
  onSave?: (project: HeroBackgroundProject) => void;
}

type TabId = "shape" | "colors" | "components" | "motion" | "view" | "export";

const FLOW_TABS: Array<{ id: TabId; label: string }> = [
  { id: "shape", label: "Backgrounds" },
  { id: "colors", label: "Colors" },
  { id: "components", label: "Components" },
  { id: "motion", label: "Motion" },
  { id: "view", label: "View" },
  { id: "export", label: "Export" },
];

const COLOR_WORDS: Record<string, string> = {
  black: "#000000",
  white: "#ffffff",
  gray: "#808080",
  grey: "#808080",
  red: "#ef4444",
  orange: "#f97316",
  yellow: "#eab308",
  green: "#22c55e",
  teal: "#14b8a6",
  blue: "#3b82f6",
  purple: "#8b5cf6",
  pink: "#ec4899",
};

const REFINE_WORDS = ["adjust", "refine", "improve", "softer", "deeper", "calmer", "more", "less", "tweak", "enhance"];
const RESET_WORDS = ["new", "reset", "start over", "completely different", "replace", "redo"];

const CATEGORY_LABELS = ["Soft/Ambient", "Futuristic", "Dark/Editorial", "Expressive"] as const;

type BackgroundCategory = (typeof CATEGORY_LABELS)[number];

interface BackgroundVariant {
  id: string;
  label: string;
  params: FlowBackgroundParams;
}

interface BackgroundEntry {
  id: string;
  name: string;
  category: BackgroundCategory;
  gradientStyle: HeroBackgroundSettings["gradientStyle"];
  tags: string[];
  palettePreset?: keyof typeof COLOR_PRESETS;
  variants: BackgroundVariant[];
}

const BACKGROUND_LIBRARY: BackgroundEntry[] = [
  {
    id: "ambient-mist",
    name: "Ambient Mist",
    category: "Soft/Ambient",
    gradientStyle: "soft-sweep",
    tags: ["calm", "mist", "gentle"],
    palettePreset: "arctic",
    variants: [
      { id: "soft", label: "Soft", params: { brightness: 1.15, grainEnabled: false, grainIntensity: 0.1, environmentEnabled: true } },
      { id: "deep", label: "Deep", params: { brightness: 0.95, grainEnabled: true, grainIntensity: 0.2, environmentEnabled: true } },
      { id: "contrast", label: "High Contrast", params: { brightness: 1.25, grainEnabled: false, grainIntensity: 0.12, environmentEnabled: true } },
      { id: "minimal", label: "Minimal", params: { brightness: 1.05, grainEnabled: false, grainIntensity: 0.05, environmentEnabled: false } },
    ],
  },
  {
    id: "halo-glow",
    name: "Halo Glow",
    category: "Soft/Ambient",
    gradientStyle: "halo",
    tags: ["halo", "soft", "glow"],
    palettePreset: "aurora",
    variants: [
      { id: "soft", label: "Soft", params: { brightness: 1.2, grainEnabled: false, grainIntensity: 0.08, environmentEnabled: true } },
      { id: "deep", label: "Deep", params: { brightness: 0.9, grainEnabled: true, grainIntensity: 0.2, environmentEnabled: true } },
      { id: "contrast", label: "High Contrast", params: { brightness: 1.3, grainEnabled: false, grainIntensity: 0.1, environmentEnabled: true } },
      { id: "minimal", label: "Minimal", params: { brightness: 1.05, grainEnabled: false, grainIntensity: 0.05, environmentEnabled: false } },
    ],
  },
  {
    id: "velvet-tide",
    name: "Velvet Tide",
    category: "Soft/Ambient",
    gradientStyle: "aurora",
    tags: ["calm", "tide", "ambient"],
    palettePreset: "amethyst",
    variants: [
      { id: "soft", label: "Soft", params: { brightness: 1.18, grainEnabled: false, grainIntensity: 0.08, environmentEnabled: true } },
      { id: "deep", label: "Deep", params: { brightness: 0.92, grainEnabled: true, grainIntensity: 0.2, environmentEnabled: true } },
      { id: "contrast", label: "High Contrast", params: { brightness: 1.28, grainEnabled: false, grainIntensity: 0.12, environmentEnabled: true } },
      { id: "minimal", label: "Minimal", params: { brightness: 1.04, grainEnabled: false, grainIntensity: 0.04, environmentEnabled: false } },
    ],
  },
  {
    id: "moonlit-air",
    name: "Moonlit Air",
    category: "Soft/Ambient",
    gradientStyle: "orb",
    tags: ["ambient", "moonlit", "soft"],
    palettePreset: "slate",
    variants: [
      { id: "soft", label: "Soft", params: { brightness: 1.1, grainEnabled: false, grainIntensity: 0.08, environmentEnabled: true } },
      { id: "deep", label: "Deep", params: { brightness: 0.9, grainEnabled: true, grainIntensity: 0.2, environmentEnabled: true } },
      { id: "contrast", label: "High Contrast", params: { brightness: 1.25, grainEnabled: false, grainIntensity: 0.12, environmentEnabled: true } },
      { id: "minimal", label: "Minimal", params: { brightness: 1.02, grainEnabled: false, grainIntensity: 0.04, environmentEnabled: false } },
    ],
  },
  {
    id: "quiet-orbit",
    name: "Quiet Orbit",
    category: "Soft/Ambient",
    gradientStyle: "spotlight",
    tags: ["quiet", "soft", "focus"],
    palettePreset: "sapphire",
    variants: [
      { id: "soft", label: "Soft", params: { brightness: 1.16, grainEnabled: false, grainIntensity: 0.08, environmentEnabled: true } },
      { id: "deep", label: "Deep", params: { brightness: 0.94, grainEnabled: true, grainIntensity: 0.18, environmentEnabled: true } },
      { id: "contrast", label: "High Contrast", params: { brightness: 1.27, grainEnabled: false, grainIntensity: 0.12, environmentEnabled: true } },
      { id: "minimal", label: "Minimal", params: { brightness: 1.04, grainEnabled: false, grainIntensity: 0.04, environmentEnabled: false } },
    ],
  },
  {
    id: "fogline",
    name: "Fogline",
    category: "Soft/Ambient",
    gradientStyle: "noise-wash",
    tags: ["fog", "soft", "diffuse"],
    palettePreset: "arctic",
    variants: [
      { id: "soft", label: "Soft", params: { brightness: 1.12, grainEnabled: true, grainIntensity: 0.18, environmentEnabled: true } },
      { id: "deep", label: "Deep", params: { brightness: 0.9, grainEnabled: true, grainIntensity: 0.26, environmentEnabled: true } },
      { id: "contrast", label: "High Contrast", params: { brightness: 1.22, grainEnabled: true, grainIntensity: 0.2, environmentEnabled: true } },
      { id: "minimal", label: "Minimal", params: { brightness: 1.02, grainEnabled: true, grainIntensity: 0.1, environmentEnabled: false } },
    ],
  },
  {
    id: "neon-grid",
    name: "Neon Grid",
    category: "Futuristic",
    gradientStyle: "mesh",
    tags: ["neon", "grid", "future"],
    palettePreset: "sapphire",
    variants: [
      { id: "soft", label: "Soft", params: { brightness: 1.12, grainEnabled: false, grainIntensity: 0.1, environmentEnabled: true } },
      { id: "deep", label: "Deep", params: { brightness: 0.9, grainEnabled: true, grainIntensity: 0.2, environmentEnabled: true } },
      { id: "contrast", label: "High Contrast", params: { brightness: 1.3, grainEnabled: false, grainIntensity: 0.12, environmentEnabled: true } },
      { id: "minimal", label: "Minimal", params: { brightness: 1.02, grainEnabled: false, grainIntensity: 0.05, environmentEnabled: false } },
    ],
  },
  {
    id: "signal-wave",
    name: "Signal Wave",
    category: "Futuristic",
    gradientStyle: "wave",
    tags: ["signal", "wave", "pulse"],
    palettePreset: "aurora",
    variants: [
      { id: "soft", label: "Soft", params: { brightness: 1.14, grainEnabled: false, grainIntensity: 0.08, environmentEnabled: true } },
      { id: "deep", label: "Deep", params: { brightness: 0.92, grainEnabled: true, grainIntensity: 0.22, environmentEnabled: true } },
      { id: "contrast", label: "High Contrast", params: { brightness: 1.32, grainEnabled: false, grainIntensity: 0.1, environmentEnabled: true } },
      { id: "minimal", label: "Minimal", params: { brightness: 1.05, grainEnabled: false, grainIntensity: 0.04, environmentEnabled: false } },
    ],
  },
  {
    id: "crystal-core",
    name: "Crystal Core",
    category: "Futuristic",
    gradientStyle: "crystal",
    tags: ["crystal", "sharp", "clean"],
    palettePreset: "arctic",
    variants: [
      { id: "soft", label: "Soft", params: { brightness: 1.2, grainEnabled: false, grainIntensity: 0.06, environmentEnabled: true } },
      { id: "deep", label: "Deep", params: { brightness: 0.9, grainEnabled: true, grainIntensity: 0.18, environmentEnabled: true } },
      { id: "contrast", label: "High Contrast", params: { brightness: 1.34, grainEnabled: false, grainIntensity: 0.08, environmentEnabled: true } },
      { id: "minimal", label: "Minimal", params: { brightness: 1.08, grainEnabled: false, grainIntensity: 0.04, environmentEnabled: false } },
    ],
  },
  {
    id: "orbit-channel",
    name: "Orbit Channel",
    category: "Futuristic",
    gradientStyle: "orb",
    tags: ["orbit", "channel", "sleek"],
    palettePreset: "sapphire",
    variants: [
      { id: "soft", label: "Soft", params: { brightness: 1.16, grainEnabled: false, grainIntensity: 0.08, environmentEnabled: true } },
      { id: "deep", label: "Deep", params: { brightness: 0.92, grainEnabled: true, grainIntensity: 0.2, environmentEnabled: true } },
      { id: "contrast", label: "High Contrast", params: { brightness: 1.28, grainEnabled: false, grainIntensity: 0.1, environmentEnabled: true } },
      { id: "minimal", label: "Minimal", params: { brightness: 1.04, grainEnabled: false, grainIntensity: 0.04, environmentEnabled: false } },
    ],
  },
  {
    id: "horizon-drive",
    name: "Horizon Drive",
    category: "Futuristic",
    gradientStyle: "diagonal-blend",
    tags: ["horizon", "drive", "sleek"],
    palettePreset: "midnight",
    variants: [
      { id: "soft", label: "Soft", params: { brightness: 1.12, grainEnabled: false, grainIntensity: 0.08, environmentEnabled: true } },
      { id: "deep", label: "Deep", params: { brightness: 0.9, grainEnabled: true, grainIntensity: 0.2, environmentEnabled: true } },
      { id: "contrast", label: "High Contrast", params: { brightness: 1.3, grainEnabled: false, grainIntensity: 0.12, environmentEnabled: true } },
      { id: "minimal", label: "Minimal", params: { brightness: 1.03, grainEnabled: false, grainIntensity: 0.04, environmentEnabled: false } },
    ],
  },
  {
    id: "starlight-echo",
    name: "Starlight Echo",
    category: "Futuristic",
    gradientStyle: "cosmic",
    tags: ["starlight", "cosmic", "depth"],
    palettePreset: "amethyst",
    variants: [
      { id: "soft", label: "Soft", params: { brightness: 1.18, grainEnabled: false, grainIntensity: 0.08, environmentEnabled: true } },
      { id: "deep", label: "Deep", params: { brightness: 0.88, grainEnabled: true, grainIntensity: 0.24, environmentEnabled: true } },
      { id: "contrast", label: "High Contrast", params: { brightness: 1.32, grainEnabled: false, grainIntensity: 0.1, environmentEnabled: true } },
      { id: "minimal", label: "Minimal", params: { brightness: 1.05, grainEnabled: false, grainIntensity: 0.04, environmentEnabled: false } },
    ],
  },
  {
    id: "noir-halo",
    name: "Noir Halo",
    category: "Dark/Editorial",
    gradientStyle: "halo",
    tags: ["noir", "editorial", "dark"],
    palettePreset: "obsidian",
    variants: [
      { id: "soft", label: "Soft", params: { brightness: 0.95, grainEnabled: true, grainIntensity: 0.18, environmentEnabled: true } },
      { id: "deep", label: "Deep", params: { brightness: 0.82, grainEnabled: true, grainIntensity: 0.26, environmentEnabled: true } },
      { id: "contrast", label: "High Contrast", params: { brightness: 1.1, grainEnabled: true, grainIntensity: 0.2, environmentEnabled: true } },
      { id: "minimal", label: "Minimal", params: { brightness: 0.9, grainEnabled: false, grainIntensity: 0.1, environmentEnabled: false } },
    ],
  },
  {
    id: "editorial-smoke",
    name: "Editorial Smoke",
    category: "Dark/Editorial",
    gradientStyle: "noise-wash",
    tags: ["smoke", "editorial", "moody"],
    palettePreset: "charcoal",
    variants: [
      { id: "soft", label: "Soft", params: { brightness: 0.98, grainEnabled: true, grainIntensity: 0.2, environmentEnabled: true } },
      { id: "deep", label: "Deep", params: { brightness: 0.8, grainEnabled: true, grainIntensity: 0.3, environmentEnabled: true } },
      { id: "contrast", label: "High Contrast", params: { brightness: 1.12, grainEnabled: true, grainIntensity: 0.22, environmentEnabled: true } },
      { id: "minimal", label: "Minimal", params: { brightness: 0.9, grainEnabled: true, grainIntensity: 0.14, environmentEnabled: false } },
    ],
  },
  {
    id: "ink-shadow",
    name: "Ink Shadow",
    category: "Dark/Editorial",
    gradientStyle: "soft-sweep",
    tags: ["ink", "shadow", "deep"],
    palettePreset: "midnight",
    variants: [
      { id: "soft", label: "Soft", params: { brightness: 0.96, grainEnabled: true, grainIntensity: 0.18, environmentEnabled: true } },
      { id: "deep", label: "Deep", params: { brightness: 0.78, grainEnabled: true, grainIntensity: 0.28, environmentEnabled: true } },
      { id: "contrast", label: "High Contrast", params: { brightness: 1.08, grainEnabled: true, grainIntensity: 0.2, environmentEnabled: true } },
      { id: "minimal", label: "Minimal", params: { brightness: 0.9, grainEnabled: false, grainIntensity: 0.1, environmentEnabled: false } },
    ],
  },
  {
    id: "deep-press",
    name: "Deep Press",
    category: "Dark/Editorial",
    gradientStyle: "diagonal-blend",
    tags: ["press", "structured", "dark"],
    palettePreset: "slate",
    variants: [
      { id: "soft", label: "Soft", params: { brightness: 0.94, grainEnabled: true, grainIntensity: 0.2, environmentEnabled: true } },
      { id: "deep", label: "Deep", params: { brightness: 0.76, grainEnabled: true, grainIntensity: 0.3, environmentEnabled: true } },
      { id: "contrast", label: "High Contrast", params: { brightness: 1.06, grainEnabled: true, grainIntensity: 0.22, environmentEnabled: true } },
      { id: "minimal", label: "Minimal", params: { brightness: 0.88, grainEnabled: false, grainIntensity: 0.1, environmentEnabled: false } },
    ],
  },
  {
    id: "mono-spot",
    name: "Mono Spot",
    category: "Dark/Editorial",
    gradientStyle: "spotlight",
    tags: ["mono", "spot", "focused"],
    palettePreset: "charcoal",
    variants: [
      { id: "soft", label: "Soft", params: { brightness: 0.98, grainEnabled: true, grainIntensity: 0.18, environmentEnabled: true } },
      { id: "deep", label: "Deep", params: { brightness: 0.8, grainEnabled: true, grainIntensity: 0.26, environmentEnabled: true } },
      { id: "contrast", label: "High Contrast", params: { brightness: 1.12, grainEnabled: true, grainIntensity: 0.2, environmentEnabled: true } },
      { id: "minimal", label: "Minimal", params: { brightness: 0.9, grainEnabled: false, grainIntensity: 0.1, environmentEnabled: false } },
    ],
  },
  {
    id: "coal-wave",
    name: "Coal Wave",
    category: "Dark/Editorial",
    gradientStyle: "wave",
    tags: ["coal", "wave", "moody"],
    palettePreset: "obsidian",
    variants: [
      { id: "soft", label: "Soft", params: { brightness: 0.96, grainEnabled: true, grainIntensity: 0.18, environmentEnabled: true } },
      { id: "deep", label: "Deep", params: { brightness: 0.78, grainEnabled: true, grainIntensity: 0.28, environmentEnabled: true } },
      { id: "contrast", label: "High Contrast", params: { brightness: 1.1, grainEnabled: true, grainIntensity: 0.2, environmentEnabled: true } },
      { id: "minimal", label: "Minimal", params: { brightness: 0.9, grainEnabled: false, grainIntensity: 0.1, environmentEnabled: false } },
    ],
  },
  {
    id: "ember-flare",
    name: "Ember Flare",
    category: "Expressive",
    gradientStyle: "sunset",
    tags: ["ember", "warm", "bold"],
    palettePreset: "sunset",
    variants: [
      { id: "soft", label: "Soft", params: { brightness: 1.18, grainEnabled: false, grainIntensity: 0.08, environmentEnabled: true } },
      { id: "deep", label: "Deep", params: { brightness: 0.9, grainEnabled: true, grainIntensity: 0.22, environmentEnabled: true } },
      { id: "contrast", label: "High Contrast", params: { brightness: 1.34, grainEnabled: false, grainIntensity: 0.1, environmentEnabled: true } },
      { id: "minimal", label: "Minimal", params: { brightness: 1.05, grainEnabled: false, grainIntensity: 0.04, environmentEnabled: false } },
    ],
  },
  {
    id: "rose-burst",
    name: "Rose Burst",
    category: "Expressive",
    gradientStyle: "aurora",
    tags: ["rose", "expressive", "lush"],
    palettePreset: "rose",
    variants: [
      { id: "soft", label: "Soft", params: { brightness: 1.2, grainEnabled: false, grainIntensity: 0.08, environmentEnabled: true } },
      { id: "deep", label: "Deep", params: { brightness: 0.92, grainEnabled: true, grainIntensity: 0.2, environmentEnabled: true } },
      { id: "contrast", label: "High Contrast", params: { brightness: 1.36, grainEnabled: false, grainIntensity: 0.1, environmentEnabled: true } },
      { id: "minimal", label: "Minimal", params: { brightness: 1.06, grainEnabled: false, grainIntensity: 0.04, environmentEnabled: false } },
    ],
  },
  {
    id: "electric-surge",
    name: "Electric Surge",
    category: "Expressive",
    gradientStyle: "wave",
    tags: ["electric", "surge", "energy"],
    palettePreset: "aurora",
    variants: [
      { id: "soft", label: "Soft", params: { brightness: 1.16, grainEnabled: false, grainIntensity: 0.08, environmentEnabled: true } },
      { id: "deep", label: "Deep", params: { brightness: 0.9, grainEnabled: true, grainIntensity: 0.2, environmentEnabled: true } },
      { id: "contrast", label: "High Contrast", params: { brightness: 1.38, grainEnabled: false, grainIntensity: 0.1, environmentEnabled: true } },
      { id: "minimal", label: "Minimal", params: { brightness: 1.04, grainEnabled: false, grainIntensity: 0.04, environmentEnabled: false } },
    ],
  },
  {
    id: "prism-flux",
    name: "Prism Flux",
    category: "Expressive",
    gradientStyle: "crystal",
    tags: ["prism", "flux", "vivid"],
    palettePreset: "sapphire",
    variants: [
      { id: "soft", label: "Soft", params: { brightness: 1.18, grainEnabled: false, grainIntensity: 0.08, environmentEnabled: true } },
      { id: "deep", label: "Deep", params: { brightness: 0.9, grainEnabled: true, grainIntensity: 0.22, environmentEnabled: true } },
      { id: "contrast", label: "High Contrast", params: { brightness: 1.35, grainEnabled: false, grainIntensity: 0.1, environmentEnabled: true } },
      { id: "minimal", label: "Minimal", params: { brightness: 1.05, grainEnabled: false, grainIntensity: 0.04, environmentEnabled: false } },
    ],
  },
  {
    id: "lava-noise",
    name: "Lava Noise",
    category: "Expressive",
    gradientStyle: "noise-wash",
    tags: ["lava", "textured", "bold"],
    palettePreset: "ember",
    variants: [
      { id: "soft", label: "Soft", params: { brightness: 1.14, grainEnabled: true, grainIntensity: 0.2, environmentEnabled: true } },
      { id: "deep", label: "Deep", params: { brightness: 0.88, grainEnabled: true, grainIntensity: 0.28, environmentEnabled: true } },
      { id: "contrast", label: "High Contrast", params: { brightness: 1.32, grainEnabled: true, grainIntensity: 0.22, environmentEnabled: true } },
      { id: "minimal", label: "Minimal", params: { brightness: 1.02, grainEnabled: true, grainIntensity: 0.12, environmentEnabled: false } },
    ],
  },
  {
    id: "cosmic-bloom",
    name: "Cosmic Bloom",
    category: "Expressive",
    gradientStyle: "cosmic",
    tags: ["cosmic", "bloom", "expressive"],
    palettePreset: "amethyst",
    variants: [
      { id: "soft", label: "Soft", params: { brightness: 1.2, grainEnabled: false, grainIntensity: 0.08, environmentEnabled: true } },
      { id: "deep", label: "Deep", params: { brightness: 0.9, grainEnabled: true, grainIntensity: 0.22, environmentEnabled: true } },
      { id: "contrast", label: "High Contrast", params: { brightness: 1.36, grainEnabled: false, grainIntensity: 0.1, environmentEnabled: true } },
      { id: "minimal", label: "Minimal", params: { brightness: 1.06, grainEnabled: false, grainIntensity: 0.04, environmentEnabled: false } },
    ],
  },
];

const normalizeHex = (value: string) => {
  const cleaned = value.replace("#", "").trim();
  if (cleaned.length === 3) {
    return `#${cleaned
      .split("")
      .map((char) => char + char)
      .join("")}`.toLowerCase();
  }
  return `#${cleaned.padEnd(6, "0")}`.toLowerCase();
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const hexToRgb = (hex: string) => {
  const normalized = normalizeHex(hex).replace("#", "");
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  return { r, g, b };
};

const rgbToHex = (r: number, g: number, b: number) =>
  `#${[r, g, b].map((val) => clamp(Math.round(val), 0, 255).toString(16).padStart(2, "0")).join("")}`;

const rgbToHsl = (r: number, g: number, b: number) => {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;
  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const delta = max - min;
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (delta !== 0) {
    s = delta / (1 - Math.abs(2 * l - 1));
    switch (max) {
      case rNorm:
        h = ((gNorm - bNorm) / delta) % 6;
        break;
      case gNorm:
        h = (bNorm - rNorm) / delta + 2;
        break;
      default:
        h = (rNorm - gNorm) / delta + 4;
        break;
    }
    h *= 60;
    if (h < 0) h += 360;
  }

  return { h, s: s * 100, l: l * 100 };
};

const hslToRgb = (h: number, s: number, l: number) => {
  const sNorm = clamp(s, 0, 100) / 100;
  const lNorm = clamp(l, 0, 100) / 100;
  const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = lNorm - c / 2;
  let r = 0;
  let g = 0;
  let b = 0;

  if (h >= 0 && h < 60) {
    r = c;
    g = x;
  } else if (h >= 60 && h < 120) {
    r = x;
    g = c;
  } else if (h >= 120 && h < 180) {
    g = c;
    b = x;
  } else if (h >= 180 && h < 240) {
    g = x;
    b = c;
  } else if (h >= 240 && h < 300) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
};

const lerp = (start: number, end: number, t: number) => start + (end - start) * t;

const lerpHex = (from: string, to: string, t: number) => {
  const fromRgb = hexToRgb(from);
  const toRgb = hexToRgb(to);
  return rgbToHex(
    lerp(fromRgb.r, toRgb.r, t),
    lerp(fromRgb.g, toRgb.g, t),
    lerp(fromRgb.b, toRgb.b, t),
  );
};

const detectFlowMode = (input: string): FlowMode => {
  const lowered = input.toLowerCase();
  if (RESET_WORDS.some((word) => lowered.includes(word))) {
    return "reset";
  }
  if (REFINE_WORDS.some((word) => lowered.includes(word))) {
    return "refine";
  }
  return "refine";
};

const detectStyleIntent = (input: string): HeroBackgroundSettings["gradientStyle"] | null => {
  const lowered = input.toLowerCase();
  const styleMap: Array<[string, HeroBackgroundSettings["gradientStyle"]]> = [
    ["halo", "halo"],
    ["soft sweep", "soft-sweep"],
    ["orb", "orb"],
    ["diagonal", "diagonal-blend"],
    ["noise", "noise-wash"],
    ["aurora", "aurora"],
    ["mesh", "mesh"],
    ["spotlight", "spotlight"],
    ["wave", "wave"],
    ["crystal", "crystal"],
    ["sunset", "sunset"],
    ["cosmic", "cosmic"],
  ];
  const match = styleMap.find(([keyword]) => lowered.includes(keyword));
  return match ? match[1] : null;
};

const parseColorIntent = (input: string) => {
  const lowered = input.toLowerCase();
  let temperature = 0;
  let saturation = 0;
  let contrast = 0;
  let lightness = 0;

  if (/(warm|sunset|amber|gold|ember)/.test(lowered)) temperature += 0.6;
  if (/(cool|icy|arctic|cyan|teal)/.test(lowered)) temperature -= 0.6;

  if (/(vivid|vibrant|neon|bold|electric)/.test(lowered)) saturation += 0.7;
  if (/(muted|soft|subtle|calm|fog|mist)/.test(lowered)) saturation -= 0.5;

  if (/(high contrast|dramatic|sharp|deep)/.test(lowered)) contrast += 0.6;
  if (/(low contrast|gentle|smooth)/.test(lowered)) contrast -= 0.4;

  if (/(dark|night|moody|noir)/.test(lowered)) lightness -= 0.6;
  if (/(light|bright|airy|glow)/.test(lowered)) lightness += 0.5;

  return { temperature, saturation, contrast, lightness };
};

const adjustHex = (hex: string, amount: number) => {
  const normalized = normalizeHex(hex).replace("#", "");
  const r = Math.min(255, Math.max(0, parseInt(normalized.slice(0, 2), 16) + amount));
  const g = Math.min(255, Math.max(0, parseInt(normalized.slice(2, 4), 16) + amount));
  const b = Math.min(255, Math.max(0, parseInt(normalized.slice(4, 6), 16) + amount));
  return `#${[r, g, b].map((val) => val.toString(16).padStart(2, "0")).join("")}`;
};

const extractPromptColors = (input: string) => {
  const hexMatches = input.match(/#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})/g) ?? [];
  if (hexMatches.length > 0) {
    return hexMatches.map((hex) => normalizeHex(hex));
  }

  const words = input.toLowerCase().split(/[^a-z]+/).filter(Boolean);
  const hits: string[] = [];
  for (const word of words) {
    const match = COLOR_WORDS[word];
    if (match) {
      hits.push(match);
    }
  }
  return hits;
};

const getPaletteFromSettings = (settings: HeroBackgroundSettings): FlowPalette => ({
  base: settings.color1,
  surface: settings.color2,
  accent: settings.color3,
  highlight: settings.color4,
  text: "#ffffff",
});

const getPaletteFromPreset = (presetKey?: keyof typeof COLOR_PRESETS): FlowPalette => {
  const preset = presetKey ? COLOR_PRESETS[presetKey] : DEFAULT_SETTINGS;
  return {
    base: preset.color1,
    surface: preset.color2,
    accent: preset.color3,
    highlight: preset.color4,
    text: "#ffffff",
  };
};

const applyIntentToPalette = (palette: FlowPalette, intent: ReturnType<typeof parseColorIntent>, strength: number) => {
  const adjustColor = (hex: string) => {
    const rgb = hexToRgb(hex);
    const { h, s, l } = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const nextH = (h + intent.temperature * 12 * strength + 360) % 360;
    const nextS = clamp(s + intent.saturation * 18 * strength, 5, 95);
    const contrastShift = intent.contrast * 10 * strength;
    const lightShift = intent.lightness * 12 * strength;
    const nextL = clamp(l + lightShift + contrastShift, 5, 95);
    const { r, g, b } = hslToRgb(nextH, nextS, nextL);
    return rgbToHex(r, g, b);
  };

  return {
    ...palette,
    base: adjustColor(palette.base),
    surface: adjustColor(palette.surface),
    accent: adjustColor(palette.accent),
    highlight: adjustColor(palette.highlight),
  };
};

const buildEvolvedPalette = (
  colors: string[],
  fallback: Pick<HeroBackgroundSettings, "color1" | "color2" | "color3" | "color4">,
) => {
  if (colors.length === 0) {
    return fallback;
  }

  if (colors.length >= 4) {
    return {
      color1: colors[0],
      color2: colors[1],
      color3: colors[2],
      color4: colors[3],
    };
  }

  if (colors.length === 3) {
    return {
      color1: colors[0],
      color2: colors[1],
      color3: colors[2],
      color4: adjustHex(colors[2], 28),
    };
  }

  if (colors.length === 2) {
    return {
      color1: colors[0],
      color2: colors[1],
      color3: adjustHex(colors[1], 24),
      color4: adjustHex(colors[1], 48),
    };
  }

  const base = colors[0];
  return {
    color1: base,
    color2: adjustHex(base, 20),
    color3: adjustHex(base, 40),
    color4: adjustHex(base, 60),
  };
};

// Generate React component code for live preview - Improved color blending with smoother transitions
const generateLiveCode = (settings: HeroBackgroundSettings): string => {
  const { brightness, grainEnabled, grainIntensity } = settings;
  const background = buildHeroGradient(settings);

  return `<div
  style={{
    background: "${background}",
    filter: "brightness(${brightness})",
    width: "100%",
    height: "100vh",
  }}
>
  ${grainEnabled ? `{/* Grain overlay */}
  <div style={{ opacity: ${(grainIntensity * 0.3).toFixed(2)} }} />` : ""}
</div>`;
};

// Generate JSON settings for export
const generateSettingsJSON = (settings: HeroBackgroundSettings, flowState: FlowState): string => {
  return JSON.stringify({
    gradientStyle: settings.gradientStyle,
    colors: {
      color1: settings.color1,
      color2: settings.color2,
      color3: settings.color3,
      color4: settings.color4,
    },
    palette: flowState.palette,
    brightness: settings.brightness,
    grain: settings.grainEnabled ? settings.grainIntensity : 0,
    environment: settings.environmentEnabled,
    backgroundParams: flowState.backgroundParams,
  }, null, 2);
};

// Generate full project code as a React component
const generateProjectCode = (settings: HeroBackgroundSettings): string => {
  const { brightness, grainEnabled, grainIntensity } = settings;
  const background = buildHeroGradient(settings);

  const grainOverlay = grainEnabled
    ? `\n      {/* Grain overlay */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: \`url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='5' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")\`,
          opacity: ${(grainIntensity * 0.25).toFixed(2)},
          mixBlendMode: "overlay",
        }}
      />`
    : '';

  return `import React from 'react';

export const HeroBackground: React.FC = () => {
  return (
    <div 
      className="fixed inset-0"
      style={{
        background: "${background}",
        filter: "brightness(${brightness})",
        width: "100%",
        height: "100vh",
      }}
    >${grainOverlay}
    </div>
  );
};

export default HeroBackground;`;
};

export const HeroBackgroundWorkspace: React.FC<HeroBackgroundWorkspaceProps> = ({
  projectId,
  projectName: initialProjectName,
  initialSettings,
  isLoggedIn = false,
  onBack,
  onSave,
}) => {
  const [settings, setSettings] = useState<HeroBackgroundSettings>(initialSettings || DEFAULT_SETTINGS);
  const [activeTab, setActiveTab] = useState<TabId>("shape");
  const [fullscreen, setFullscreen] = useState(true);
  const [showHints, setShowHints] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [minimizedBar, setMinimizedBar] = useState(false);
  const [activeColorPicker, setActiveColorPicker] = useState<string | null>(null);
  const [flowState, setFlowState] = useState<FlowState>(() => ({
    currentBackgroundStyle: (initialSettings || DEFAULT_SETTINGS).gradientStyle,
    backgroundParams: {
      brightness: (initialSettings || DEFAULT_SETTINGS).brightness,
      grainEnabled: (initialSettings || DEFAULT_SETTINGS).grainEnabled,
      grainIntensity: (initialSettings || DEFAULT_SETTINGS).grainIntensity,
      environmentEnabled: (initialSettings || DEFAULT_SETTINGS).environmentEnabled,
    },
    palette: getPaletteFromSettings(initialSettings || DEFAULT_SETTINGS),
    lastUserPrompt: "",
    flowMode: "refine",
  }));
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<BackgroundCategory>("Soft/Ambient");
  // Component editing state
  const [selectedComponent, setSelectedComponent] = useState<"button-primary" | "button-secondary" | "card" | "input" | null>(null);
  const [showComponentLibrary, setShowComponentLibrary] = useState(false);

  // Project state
  const [currentProjectId, setCurrentProjectId] = useState(projectId || `hero-${Date.now()}`);
  const [currentProjectName, setCurrentProjectName] = useState(initialProjectName || generateProjectName());
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(currentProjectName);

  // Save state
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedSettingsRef = useRef<string>(JSON.stringify(settings));
  const flowUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const paletteAnimationRef = useRef<number | null>(null);

  // Copy state
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedJSON, setCopiedJSON] = useState(false);
  const [copiedProjectCode, setCopiedProjectCode] = useState(false);

  // Download state
  const [downloadFormat, setDownloadFormat] = useState<"png" | "jpg">("png");
  const [downloadScale, setDownloadScale] = useState(1);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  // Live code and JSON
  const liveCode = useMemo(() => generateLiveCode(settings), [settings]);
  const liveJSON = useMemo(() => generateSettingsJSON(settings, flowState), [settings, flowState]);
  const projectCode = useMemo(() => generateProjectCode(settings), [settings]);
  const filteredBackgrounds = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return BACKGROUND_LIBRARY.filter((entry) => {
      if (entry.category !== activeCategory) return false;
      if (!query) return true;
      const haystack = `${entry.name} ${entry.tags.join(" ")}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [activeCategory, searchQuery]);

  // Auto-save with debounce
  const triggerAutoSave = useCallback(async () => {
    const currentSettingsString = JSON.stringify(settings);

    // Skip if settings haven't changed
    if (currentSettingsString === lastSavedSettingsRef.current) {
      return;
    }

    setSaveStatus("saving");

    try {
      const thumbnail = await generateThumbnail(settings);

      const project: HeroBackgroundProject = {
        id: currentProjectId,
        name: currentProjectName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        settings,
        thumbnail,
      };

      if (isLoggedIn) {
        saveProject(project);
      } else {
        saveDraft({ ...project, id: currentProjectId });
      }

      lastSavedSettingsRef.current = currentSettingsString;
      setSaveStatus("saved");

      if (onSave) {
        onSave(project);
      }

      setTimeout(() => setSaveStatus("idle"), 1500);
    } catch (error) {
      console.error("Auto-save failed:", error);
      setSaveStatus("idle");
    }
  }, [settings, currentProjectId, currentProjectName, isLoggedIn, onSave]);

  // Debounced auto-save effect
  useEffect(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      triggerAutoSave();
    }, 800);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [settings, triggerAutoSave]);

  // Save on tab change / export close
  useEffect(() => {
    triggerAutoSave();
  }, [activeTab]);

  // Save before unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Synchronous save attempt
      const project: HeroBackgroundProject = {
        id: currentProjectId,
        name: currentProjectName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        settings,
      };

      if (isLoggedIn) {
        saveProject(project);
      } else {
        saveDraft({ ...project, id: currentProjectId });
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [settings, currentProjectId, currentProjectName, isLoggedIn]);

  // Flow input effect moved below applyFlowInput declaration

  const updateSetting = useCallback(<K extends keyof HeroBackgroundSettings>(
    key: K,
    value: HeroBackgroundSettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setFlowState((prev) => {
      if (key === "gradientStyle") {
        return { ...prev, currentBackgroundStyle: value as HeroBackgroundSettings["gradientStyle"] };
      }
      if (key === "brightness" || key === "grainEnabled" || key === "grainIntensity" || key === "environmentEnabled") {
        const paramKey = key as keyof FlowBackgroundParams;
        return {
          ...prev,
          backgroundParams: {
            ...prev.backgroundParams,
            [paramKey]: value as FlowBackgroundParams[typeof paramKey],
          },
        };
      }
      if (key === "color1" || key === "color2" || key === "color3" || key === "color4") {
        return {
          ...prev,
          palette: {
            ...prev.palette,
            base: key === "color1" ? (value as string) : prev.palette.base,
            surface: key === "color2" ? (value as string) : prev.palette.surface,
            accent: key === "color3" ? (value as string) : prev.palette.accent,
            highlight: key === "color4" ? (value as string) : prev.palette.highlight,
          },
        };
      }
      return prev;
    });
  }, []);

  const animatePaletteTransition = useCallback((from: FlowPalette, to: FlowPalette, duration = 420) => {
    if (paletteAnimationRef.current) {
      cancelAnimationFrame(paletteAnimationRef.current);
    }
    const start = performance.now();
    const step = (now: number) => {
      const progress = clamp((now - start) / duration, 0, 1);
      const eased = progress * (2 - progress);
      const blended: FlowPalette = {
        ...to,
        base: lerpHex(from.base, to.base, eased),
        surface: lerpHex(from.surface, to.surface, eased),
        accent: lerpHex(from.accent, to.accent, eased),
        highlight: lerpHex(from.highlight, to.highlight, eased),
      };
      setSettings((prev) => ({
        ...prev,
        color1: blended.base,
        color2: blended.surface,
        color3: blended.accent,
        color4: blended.highlight,
        singleColorMode: false,
      }));
      if (progress < 1) {
        paletteAnimationRef.current = requestAnimationFrame(step);
      }
    };
    paletteAnimationRef.current = requestAnimationFrame(step);
  }, []);

  const applyFlowInput = useCallback((promptText: string, mode: FlowMode) => {
    if (!promptText.trim()) {
      return;
    }
    const intent = parseColorIntent(promptText);
    const styleIntent = detectStyleIntent(promptText);
    const extracted = extractPromptColors(promptText);
    const basePalette = mode === "reset" ? getPaletteFromPreset("aurora") : flowState.palette;
    const evolved = buildEvolvedPalette(extracted, {
      color1: basePalette.base,
      color2: basePalette.surface,
      color3: basePalette.accent,
      color4: basePalette.highlight,
    });
    const nextPalette = applyIntentToPalette(
      {
        base: evolved.color1,
        surface: evolved.color2,
        accent: evolved.color3,
        highlight: evolved.color4,
        text: basePalette.text,
      },
      intent,
      mode === "reset" ? 1 : 0.6,
    );

    const nextBackgroundParams: FlowBackgroundParams = {
      ...flowState.backgroundParams,
      brightness: clamp(
        flowState.backgroundParams.brightness + intent.lightness * 0.2 + intent.contrast * 0.12,
        0.7,
        1.6,
      ),
      grainEnabled: /(grain|noisy|texture)/.test(promptText.toLowerCase())
        ? true
        : flowState.backgroundParams.grainEnabled,
      grainIntensity: clamp(
        flowState.backgroundParams.grainIntensity + intent.contrast * 0.08,
        0,
        0.6,
      ),
      environmentEnabled: /(glow|ambient|halo|soft)/.test(promptText.toLowerCase())
        ? true
        : flowState.backgroundParams.environmentEnabled,
    };

    const nextStyle = styleIntent ?? flowState.currentBackgroundStyle;
    const currentPalette = getPaletteFromSettings(settings);

    setFlowState((prev) => ({
      ...prev,
      palette: nextPalette,
      backgroundParams: nextBackgroundParams,
      currentBackgroundStyle: nextStyle,
    }));

    animatePaletteTransition(currentPalette, nextPalette);
    setSettings((prev) => ({
      ...prev,
      gradientStyle: nextStyle,
      brightness: nextBackgroundParams.brightness,
      grainEnabled: nextBackgroundParams.grainEnabled,
      grainIntensity: nextBackgroundParams.grainIntensity,
      environmentEnabled: nextBackgroundParams.environmentEnabled,
    }));
  }, [animatePaletteTransition, flowState.backgroundParams, flowState.currentBackgroundStyle, flowState.palette, settings]);

  // Flow input effect - apply prompt changes with debounce
  useEffect(() => {
    if (flowUpdateTimeoutRef.current) {
      clearTimeout(flowUpdateTimeoutRef.current);
    }
    flowUpdateTimeoutRef.current = setTimeout(() => {
      applyFlowInput(flowState.lastUserPrompt, flowState.flowMode);
    }, 160);
    return () => {
      if (flowUpdateTimeoutRef.current) {
        clearTimeout(flowUpdateTimeoutRef.current);
      }
    };
  }, [flowState.lastUserPrompt, flowState.flowMode, applyFlowInput]);

  const handleFlowInputChange = useCallback((value: string) => {
    const mode = detectFlowMode(value);
    setFlowState((prev) => ({
      ...prev,
      lastUserPrompt: value,
      flowMode: mode,
    }));
  }, []);

  const applyPreset = useCallback((presetKey: keyof typeof COLOR_PRESETS) => {
    const preset = COLOR_PRESETS[presetKey];
    setSettings((prev) => ({
      ...prev,
      color1: preset.color1,
      color2: preset.color2,
      color3: preset.color3,
      color4: preset.color4,
      singleColorMode: false,
    }));
    setFlowState((prev) => ({
      ...prev,
      palette: {
        ...prev.palette,
        base: preset.color1,
        surface: preset.color2,
        accent: preset.color3,
        highlight: preset.color4,
      },
    }));
  }, []);

  const applyBackgroundEntry = useCallback((entry: BackgroundEntry, variant: BackgroundVariant) => {
    const currentPalette = getPaletteFromSettings(settings);
    const nextPalette = flowState.flowMode === "reset" ? getPaletteFromPreset(entry.palettePreset) : flowState.palette;

    setFlowState((prev) => ({
      ...prev,
      currentBackgroundStyle: entry.gradientStyle,
      backgroundParams: variant.params,
      palette: nextPalette,
    }));

    animatePaletteTransition(currentPalette, nextPalette);
    setSettings((prev) => ({
      ...prev,
      gradientStyle: entry.gradientStyle,
      brightness: variant.params.brightness,
      grainEnabled: variant.params.grainEnabled,
      grainIntensity: variant.params.grainIntensity,
      environmentEnabled: variant.params.environmentEnabled,
    }));
  }, [animatePaletteTransition, flowState.flowMode, flowState.palette, settings]);

  const handleImportSettings = useCallback((importedSettings: HeroBackgroundSettings) => {
    setSettings(importedSettings);
    setFlowState((prev) => ({
      ...prev,
      currentBackgroundStyle: importedSettings.gradientStyle,
      backgroundParams: {
        brightness: importedSettings.brightness,
        grainEnabled: importedSettings.grainEnabled,
        grainIntensity: importedSettings.grainIntensity,
        environmentEnabled: importedSettings.environmentEnabled,
      },
      palette: getPaletteFromSettings(importedSettings),
    }));
    toast.success("Settings imported!");
  }, []);

  const handleCopyCode = useCallback(async () => {
    await navigator.clipboard.writeText(liveCode);
    setCopiedCode(true);
    toast.success("React code copied to clipboard!");
    setTimeout(() => setCopiedCode(false), 2000);
  }, [liveCode]);

  const handleCopyJSON = useCallback(async () => {
    await navigator.clipboard.writeText(liveJSON);
    setCopiedJSON(true);
    toast.success("Settings JSON copied to clipboard!");
    setTimeout(() => setCopiedJSON(false), 2000);
  }, [liveJSON]);

  const handleCopyProjectCode = useCallback(async () => {
    await navigator.clipboard.writeText(projectCode);
    setCopiedProjectCode(true);
    toast.success("Project code copied to clipboard!");
    setTimeout(() => setCopiedProjectCode(false), 2000);
  }, [projectCode]);

  // Handle project name editing
  const handleStartEditName = useCallback(() => {
    setIsEditingName(true);
    setEditedName(currentProjectName);
  }, [currentProjectName]);

  const handleSaveName = useCallback(() => {
    if (editedName.trim()) {
      setCurrentProjectName(editedName.trim());
      // Trigger auto-save to save the new name
      lastSavedSettingsRef.current = "";
      triggerAutoSave();
    }
    setIsEditingName(false);
  }, [editedName, triggerAutoSave]);

  const handleCancelEditName = useCallback(() => {
    setEditedName(currentProjectName);
    setIsEditingName(false);
  }, [currentProjectName]);

  // Update edited name when currentProjectName changes externally
  useEffect(() => {
    if (!isEditingName) {
      setEditedName(currentProjectName);
    }
  }, [currentProjectName, isEditingName]);

  // Generate live thumbnail for share preview
  const generateLiveThumbnail = useCallback(async (): Promise<string> => {
    const canvas = document.createElement("canvas");
    const width = 1920 * downloadScale;
    const height = 1080 * downloadScale;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return "";

    const { color1, color2, color3, color4, singleColorMode, gradientStyle, brightness, environmentEnabled } = settings;

    // Draw gradient background
    let gradient: CanvasGradient;
    switch (gradientStyle) {
      case "halo":
        gradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width * 0.6);
        if (singleColorMode) {
          gradient.addColorStop(0, color1);
          gradient.addColorStop(1, color1);
        } else {
          gradient.addColorStop(0, color3 + "80");
          gradient.addColorStop(0.35, color2 + "CC");
          gradient.addColorStop(1, color1);
        }
        break;
      case "soft-sweep":
        gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, color1);
        gradient.addColorStop(0.3, color2);
        gradient.addColorStop(0.6, color3 + "99");
        gradient.addColorStop(1, singleColorMode ? color1 : color4 + "66");
        break;
      case "diagonal-blend":
        gradient = ctx.createLinearGradient(0, height, width, 0);
        gradient.addColorStop(0, color1);
        gradient.addColorStop(0.25, color2);
        gradient.addColorStop(0.5, color3 + "E6");
        gradient.addColorStop(0.75, singleColorMode ? color2 : color4 + "B3");
        gradient.addColorStop(1, color1);
        break;
      default:
        gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, color1);
        gradient.addColorStop(0.5, color2);
        gradient.addColorStop(1, color1);
    }

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Environment glow
    if (environmentEnabled && !singleColorMode) {
      const glowGrad = ctx.createRadialGradient(width / 2, height * 0.25, 0, width / 2, height * 0.25, height * 0.5);
      glowGrad.addColorStop(0, color3 + "40");
      glowGrad.addColorStop(1, "transparent");
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, width, height);
    }

    // Apply brightness via compositing
    if (brightness !== 1) {
      ctx.globalCompositeOperation = brightness > 1 ? "lighter" : "multiply";
      ctx.globalAlpha = Math.abs(brightness - 1) * 0.3;
      ctx.fillStyle = brightness > 1 ? "#ffffff" : "#000000";
      ctx.fillRect(0, 0, width, height);
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
    }

    return canvas.toDataURL(downloadFormat === "png" ? "image/png" : "image/jpeg", 0.95);
  }, [settings, downloadScale, downloadFormat]);

  const handleDownloadImage = useCallback(async () => {
    const dataUrl = await generateLiveThumbnail();
    if (!dataUrl) return;

    const link = document.createElement("a");
    link.download = `${currentProjectName.replace(/\s+/g, "-").toLowerCase()}.${downloadFormat}`;
    link.href = dataUrl;
    link.click();
    toast.success("Image downloaded!");
  }, [generateLiveThumbnail, currentProjectName, downloadFormat]);

  // Live preview thumbnail (small version)
  const [liveThumbnail, setLiveThumbnail] = useState<string>("");

  useEffect(() => {
    const generatePreview = async () => {
      const canvas = document.createElement("canvas");
      canvas.width = 320;
      canvas.height = 180;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const { color1, color2, color3, gradientStyle, singleColorMode } = settings;

      let gradient: CanvasGradient;
      switch (gradientStyle) {
        case "halo":
          gradient = ctx.createRadialGradient(160, 90, 0, 160, 90, 160);
          gradient.addColorStop(0, singleColorMode ? color1 : color3 + "80");
          gradient.addColorStop(0.4, color2 + "CC");
          gradient.addColorStop(1, color1);
          break;
        default:
          gradient = ctx.createLinearGradient(0, 0, 320, 180);
          gradient.addColorStop(0, color1);
          gradient.addColorStop(0.5, color2);
          gradient.addColorStop(1, singleColorMode ? color1 : color3 + "80");
      }

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 320, 180);
      setLiveThumbnail(canvas.toDataURL("image/png"));
    };

    generatePreview();
  }, [settings]);

  // Handle color picker open (only one at a time)
  const handleColorPickerOpen = useCallback((colorKey: string) => {
    setActiveColorPicker((prev) => prev === colorKey ? null : colorKey);
  }, []);

  // Generate gradient CSS based on settings (improved quality)
  const generateGradientStyle = useCallback((): React.CSSProperties => {
    const { brightness } = settings;
    const brightnessFilter = `brightness(${brightness})`;
    const background = buildHeroGradient(settings);

    return {
      background,
      filter: brightnessFilter,
    };
  }, [settings]);

  const buildPreviewStyle = useCallback((entry: BackgroundEntry, variant: BackgroundVariant): React.CSSProperties => {
    const palette = getPaletteFromPreset(entry.palettePreset);
    const previewSettings: HeroBackgroundSettings = {
      ...DEFAULT_SETTINGS,
      gradientStyle: entry.gradientStyle,
      color1: palette.base,
      color2: palette.surface,
      color3: palette.accent,
      color4: palette.highlight,
      brightness: variant.params.brightness,
      grainEnabled: variant.params.grainEnabled,
      grainIntensity: variant.params.grainIntensity,
      environmentEnabled: variant.params.environmentEnabled,
    };
    return {
      background: buildHeroGradient(previewSettings),
      filter: `brightness(${variant.params.brightness})`,
    };
  }, []);

  return (
    <>
      {/* Fixed Header Bar - MUST be outside main container to be truly fixed to viewport */}
      <div
        className="flex items-center justify-between px-6 py-4 pointer-events-none"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
          width: '100%'
        }}
      >
        {/* Back button (left) */}
        <button
          onClick={onBack}
          className="px-2.5 py-1.5 rounded-lg bg-neutral-900 border border-white/10 text-white/70 hover:text-white hover:bg-neutral-800 transition-all flex items-center gap-1.5 pointer-events-auto text-xs"
        >
          <ArrowLeft size={14} />
          <span className="text-xs font-medium">Back</span>
        </button>

        {/* Project name + save status (center) */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-3 pointer-events-auto">
          {isEditingName ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                onBlur={handleSaveName}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSaveName();
                  } else if (e.key === "Escape") {
                    handleCancelEditName();
                  }
                }}
                className="bg-black/60 border border-white/20 rounded-lg px-3 py-1.5 text-white/80 text-lg font-medium tracking-tight focus:outline-none focus:border-white/40 min-w-[200px]"
                autoFocus
              />
            </div>
          ) : (
            <div className="flex items-center gap-2 group">
              <h1
                className="text-white/80 text-lg font-medium tracking-tight cursor-pointer hover:text-white transition-colors"
                onClick={handleStartEditName}
              >
                {currentProjectName}
              </h1>
              <button
                onClick={handleStartEditName}
                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-white/10 transition-all"
                title="Edit name"
              >
                <Pencil size={14} className="text-white/60 hover:text-white" />
              </button>
            </div>
          )}
          <div className={cn(
            "flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs transition-all",
            saveStatus === "saving" && "bg-yellow-500/20 text-yellow-400",
            saveStatus === "saved" && "bg-green-500/20 text-green-400",
            saveStatus === "idle" && "bg-white/5 text-white/40"
          )}>
            {saveStatus === "saving" && <Save size={12} className="animate-pulse" />}
            {saveStatus === "saved" && <Check size={12} />}
            {saveStatus === "idle" && <Save size={12} />}
            <span>{saveStatus === "saving" ? "Saving..." : saveStatus === "saved" ? "Saved" : "Auto-save"}</span>
          </div>
        </div>

        {/* Spacer for right side alignment */}
        <div className="w-[120px]" />
      </div>

      <div
        className="fixed bg-black overflow-hidden"
        style={{
          top: '0',
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 50,
          transform: 'none',
          willChange: 'auto'
        }}
      >
        {/* Fullscreen Preview */}
        <div
          className="absolute inset-0 transition-all duration-500"
          style={generateGradientStyle()}
        >
          {/* Grain overlay - improved quality */}
          {settings.grainEnabled && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='5' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                opacity: settings.grainIntensity * 0.25,
                mixBlendMode: "overlay",
              }}
            />
          )}

        </div>

        {/* Hints overlay */}
        {showHints && (
          <div className="absolute inset-0 z-40 pointer-events-none flex items-center justify-center">
            <div className="text-center">
              <p className="text-white/50 text-sm mb-2">Fullscreen Hero Background Preview</p>
              <p className="text-white/30 text-xs">Use controls below to customize</p>
            </div>
          </div>
        )}

        {/* Control Bar (bottom) */}
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="absolute bottom-0 left-0 right-0 z-50"
        >
          <div className="bg-black backdrop-blur-xl border-t border-white/10">

            {/* Tabs + Minimize button */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-white/5">
              <div className="flex items-center gap-4">
                {FLOW_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      if (minimizedBar) setMinimizedBar(false);
                    }}
                    className={cn(
                      "text-xs font-medium transition-all capitalize cursor-pointer",
                      activeTab === tab.id
                        ? "text-white"
                        : "text-white/50 hover:text-white/80"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Minimize button */}
              <button
                onClick={() => setMinimizedBar(!minimizedBar)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-neutral-900 border border-white/10 text-white/70 hover:bg-neutral-800 hover:text-white transition-all text-xs"
              >
                {minimizedBar ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                <span className="text-xs font-medium">{minimizedBar ? "Expand" : "Minimize"}</span>
              </button>
            </div>

            {/* Tab Content - collapsible */}
            <AnimatePresence>
              {!minimizedBar && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 320, opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="p-4" style={{ minHeight: '320px', maxHeight: '320px' }}>
                    <AnimatePresence mode="wait">
                      {activeTab === "shape" && (
                        <motion.div
                          key="shape"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="h-full flex gap-4"
                        >
                          <div className="w-40 flex-shrink-0 border-r border-white/10 pr-3">
                            <label className="text-[10px] text-white/40 uppercase tracking-wider block mb-2">Categories</label>
                            <div className="space-y-2">
                              {CATEGORY_LABELS.map((category) => (
                                <button
                                  key={category}
                                  onClick={() => setActiveCategory(category)}
                                  className={cn(
                                    "w-full text-left px-2.5 py-2 rounded-lg text-[11px] font-medium transition-all border",
                                    activeCategory === category
                                      ? "bg-neutral-900 border-white/20 text-white"
                                      : "bg-neutral-900/50 border-white/10 text-white/60 hover:text-white hover:bg-neutral-800"
                                  )}
                                >
                                  {category}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div className="flex-1 flex flex-col gap-3 overflow-hidden">
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <h3 className="text-sm font-semibold text-white">Background Library</h3>
                                <p className="text-xs text-white/40">Search and apply background styles with variants.</p>
                              </div>
                              <input
                                type="text"
                                value={searchQuery}
                                onChange={(event) => setSearchQuery(event.target.value)}
                                placeholder="Search backgrounds…"
                                className="w-48 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-white/70 placeholder:text-white/30 focus:outline-none focus:border-white/20"
                              />
                            </div>
                            <div className="flex-1 overflow-y-auto pr-2">
                              <div className="grid grid-cols-3 gap-3">
                                {filteredBackgrounds.map((entry) => {
                                  const isActive = flowState.currentBackgroundStyle === entry.gradientStyle;
                                  return (
                                    <div
                                      key={entry.id}
                                      className={cn(
                                        "rounded-xl border p-2 bg-neutral-900/60 transition-all",
                                        isActive ? "border-white/30" : "border-white/10 hover:border-white/20"
                                      )}
                                    >
                                      <button
                                        onClick={() => applyBackgroundEntry(entry, entry.variants[0])}
                                        className="w-full text-left"
                                      >
                                        <div
                                          className="h-20 rounded-lg border border-white/10 mb-2"
                                          style={buildPreviewStyle(entry, entry.variants[0])}
                                        />
                                        <div className="flex items-center justify-between">
                                          <span className="text-xs font-semibold text-white">{entry.name}</span>
                                          <span className="text-[10px] text-white/40">{entry.gradientStyle}</span>
                                        </div>
                                        <div className="mt-1 flex flex-wrap gap-1">
                                          {entry.tags.map((tag) => (
                                            <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-white/50">
                                              {tag}
                                            </span>
                                          ))}
                                        </div>
                                      </button>
                                      <div className="mt-2 flex flex-wrap gap-1.5">
                                        {entry.variants.map((variant) => (
                                          <button
                                            key={variant.id}
                                            onClick={(event) => {
                                              event.stopPropagation();
                                              applyBackgroundEntry(entry, variant);
                                            }}
                                            className="px-2 py-1 rounded-full text-[9px] border border-white/10 text-white/60 hover:text-white hover:border-white/30 transition-all"
                                          >
                                            {variant.label}
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                              {filteredBackgrounds.length === 0 && (
                                <div className="text-xs text-white/40 mt-6">No backgrounds match your search.</div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {activeTab === "colors" && (
                        <motion.div
                          key="colors"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="flex flex-col items-start gap-6 w-full"
                        >
                          {/* Top row: Color swatches and presets */}
                          <div className="flex items-center gap-4 w-full">
                            {/* Color swatches */}
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleColorPickerOpen("color1")}
                                className={cn(
                                  "w-8 h-8 rounded-full border-2 transition-all",
                                  activeColorPicker === "color1"
                                    ? "border-white"
                                    : "border-white/40"
                                )}
                                style={{ backgroundColor: settings.color1 }}
                              />
                              {!settings.singleColorMode && (
                                <>
                                  <button
                                    onClick={() => handleColorPickerOpen("color2")}
                                    className={cn(
                                      "w-8 h-8 rounded-full border-2 transition-all",
                                      activeColorPicker === "color2"
                                        ? "border-white"
                                        : "border-white/40"
                                    )}
                                    style={{ backgroundColor: settings.color2 }}
                                  />
                                  <button
                                    onClick={() => handleColorPickerOpen("color3")}
                                    className={cn(
                                      "w-8 h-8 rounded-full border-2 transition-all",
                                      activeColorPicker === "color3"
                                        ? "border-white"
                                        : "border-white/40"
                                    )}
                                    style={{ backgroundColor: settings.color3 }}
                                  />
                                  <button
                                    onClick={() => handleColorPickerOpen("color4")}
                                    className={cn(
                                      "w-8 h-8 rounded-full border-2 transition-all",
                                      activeColorPicker === "color4"
                                        ? "border-white"
                                        : "border-white/40"
                                    )}
                                    style={{ backgroundColor: settings.color4 }}
                                  />
                                </>
                              )}
                            </div>

                            {/* Separator */}
                            <div className="w-px h-8 bg-white/10" />

                            {/* Presets - Two rows */}
                            <div className="flex flex-col gap-2">
                              <div className="flex items-center gap-2">
                                {Object.keys(COLOR_PRESETS).slice(0, 3).map((key) => (
                                  <button
                                    key={key}
                                    onClick={() => applyPreset(key as keyof typeof COLOR_PRESETS)}
                                    className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-neutral-900 border border-white/10 text-white/70 hover:text-white hover:bg-neutral-800 transition-all uppercase"
                                  >
                                    {key.replace(/([A-Z])/g, " $1").trim()}
                                  </button>
                                ))}
                              </div>
                              <div className="flex items-center gap-2">
                                {Object.keys(COLOR_PRESETS).slice(3).map((key) => (
                                  <button
                                    key={key}
                                    onClick={() => applyPreset(key as keyof typeof COLOR_PRESETS)}
                                    className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-neutral-900 border border-white/10 text-white/70 hover:text-white hover:bg-neutral-800 transition-all uppercase"
                                  >
                                    {key.replace(/([A-Z])/g, " $1").trim()}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Bottom section: COLOR 1 label + large color picker */}
                          {activeColorPicker && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={{ duration: 0.2, ease: "easeOut" }}
                              className="flex items-center gap-3 pt-2 border-t border-white/10 overflow-hidden w-full"
                            >
                              <span className="text-[10px] text-white/50 uppercase tracking-wider whitespace-nowrap">
                                {activeColorPicker.toUpperCase().replace("color", "COLOR ")}
                              </span>
                              <div className="flex-1">
                                <HexColorPicker
                                  color={
                                    activeColorPicker === "color1" ? settings.color1 :
                                      activeColorPicker === "color2" ? settings.color2 :
                                        activeColorPicker === "color3" ? settings.color3 :
                                          settings.color4
                                  }
                                  onChange={(color) => {
                                    if (activeColorPicker === "color1") updateSetting("color1", color);
                                    else if (activeColorPicker === "color2") updateSetting("color2", color);
                                    else if (activeColorPicker === "color3") updateSetting("color3", color);
                                    else updateSetting("color4", color);
                                  }}
                                  style={{ width: "100%", height: 80 }}
                                />
                              </div>
                            </motion.div>
                          )}
                        </motion.div>
                      )}

                      {activeTab === "motion" && (
                        <motion.div
                          key="motion"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="space-y-4"
                        >
                          {/* Brightness */}
                          <div className="flex items-center justify-center gap-6">
                            <div className="flex items-center gap-3">
                              <Sun size={16} className="text-white/50" />
                              <span className="text-xs text-white/50 uppercase tracking-wider w-20">Brightness</span>
                              <input
                                type="range"
                                min="0.6"
                                max="1.6"
                                step="0.05"
                                value={settings.brightness}
                                onChange={(e) => updateSetting("brightness", parseFloat(e.target.value))}
                                className="w-32 accent-white/50"
                              />
                              <span className="text-sm text-white/70 w-10">{settings.brightness.toFixed(2)}</span>
                            </div>
                          </div>

                          {/* Grain */}
                          <div className="flex items-center justify-center gap-6">
                            <button
                              onClick={() => updateSetting("grainEnabled", !settings.grainEnabled)}
                              className={cn(
                                "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all text-xs",
                                settings.grainEnabled
                                  ? "bg-neutral-900 border-white/20 text-white"
                                  : "bg-neutral-900 border-white/10 text-white/70 hover:bg-neutral-800"
                              )}
                            >
                              <Layers size={14} />
                              <span className="text-xs font-medium">Grain</span>
                            </button>
                            {settings.grainEnabled && (
                              <div className="flex items-center gap-3">
                                <span className="text-xs text-white/50">Intensity</span>
                                <input
                                  type="range"
                                  min="0"
                                  max="1"
                                  step="0.05"
                                  value={settings.grainIntensity}
                                  onChange={(e) => updateSetting("grainIntensity", parseFloat(e.target.value))}
                                  className="w-24 accent-white/50"
                                />
                                <span className="text-sm text-white/70 w-8">{settings.grainIntensity.toFixed(2)}</span>
                              </div>
                            )}
                          </div>

                          {/* Environment */}
                          <div className="flex items-center justify-center gap-6">
                            <button
                              onClick={() => updateSetting("environmentEnabled", !settings.environmentEnabled)}
                              className={cn(
                                "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all text-xs",
                                settings.environmentEnabled
                                  ? "bg-neutral-900 border-white/20 text-white"
                                  : "bg-neutral-900 border-white/10 text-white/70 hover:bg-neutral-800"
                              )}
                            >
                              <Cloudy size={14} />
                              <span className="text-xs font-medium">Environment Light</span>
                            </button>
                          </div>
                        </motion.div>
                      )}

                      {activeTab === "components" && (
                        <motion.div
                          key="components"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="overflow-y-auto"
                          style={{ maxHeight: '180px' }}
                        >
                          <div className="flex gap-6">
                            {/* Component Selector (Left) */}
                            <div className="w-48 flex-shrink-0 space-y-3">
                              <label className="text-[10px] text-white/40 uppercase tracking-wider block">Select Component</label>
                              <div className="grid grid-cols-2 gap-2">
                                {[
                                  {
                                    id: "button-primary", label: "Primary", preview: (
                                      <button
                                        className="w-full px-2 py-1 rounded text-[9px] font-medium"
                                        style={{
                                          background: settings.buttonPrimaryGradient === "none"
                                            ? settings.buttonPrimaryBg
                                            : settings.buttonPrimaryGradient === "linear"
                                              ? `linear-gradient(135deg, ${settings.buttonPrimaryBg}, ${settings.buttonPrimaryGradientColor})`
                                              : settings.buttonPrimaryGradient === "radial"
                                                ? `radial-gradient(circle, ${settings.buttonPrimaryGradientColor}, ${settings.buttonPrimaryBg})`
                                                : settings.buttonPrimaryGradient === "glossy"
                                                  ? `linear-gradient(180deg, ${settings.buttonPrimaryGradientColor}40 0%, transparent 50%, ${settings.buttonPrimaryBg}40 100%), ${settings.buttonPrimaryBg}`
                                                  : `${settings.buttonPrimaryBg}`,
                                          color: settings.buttonPrimaryText,
                                          boxShadow: settings.buttonPrimaryGradient === "glow" ? `0 0 20px ${settings.buttonPrimaryGradientColor}60` : undefined
                                        }}
                                      >Primary</button>
                                    )
                                  },
                                  {
                                    id: "button-secondary", label: "Secondary", preview: (
                                      <button
                                        className="w-full px-2 py-1 rounded text-[9px] font-medium border"
                                        style={{
                                          background: settings.buttonSecondaryGradient === "none"
                                            ? settings.buttonSecondaryBg
                                            : settings.buttonSecondaryGradient === "linear"
                                              ? `linear-gradient(135deg, ${settings.buttonSecondaryBg || 'transparent'}, ${settings.buttonSecondaryGradientColor}30)`
                                              : settings.buttonSecondaryBg,
                                          color: settings.buttonSecondaryText,
                                          borderColor: settings.buttonSecondaryBorder,
                                          boxShadow: settings.buttonSecondaryGradient === "glow" ? `0 0 15px ${settings.buttonSecondaryGradientColor}40` : undefined
                                        }}
                                      >Secondary</button>
                                    )
                                  },
                                  {
                                    id: "card", label: "Card", preview: (
                                      <div
                                        className="w-full h-8 rounded border flex items-center justify-center"
                                        style={{
                                          background: settings.cardGradient === "none"
                                            ? settings.cardBg
                                            : settings.cardGradient === "glass"
                                              ? `linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))`
                                              : settings.cardGradient === "linear"
                                                ? `linear-gradient(180deg, ${settings.cardGradientColor}20, transparent)`
                                                : settings.cardBg,
                                          borderColor: settings.cardBorder,
                                          backdropFilter: settings.cardGradient === "glass" ? 'blur(10px)' : undefined
                                        }}
                                      >
                                        <span className="text-[8px] text-white/40">Card</span>
                                      </div>
                                    )
                                  },
                                  {
                                    id: "input", label: "Input", preview: (
                                      <div
                                        className="w-full h-6 rounded border px-1.5 flex items-center"
                                        style={{
                                          backgroundColor: settings.inputBg,
                                          borderColor: settings.inputBorder,
                                        }}
                                      >
                                        <span className="text-[8px] text-white/30">Input</span>
                                      </div>
                                    )
                                  },
                                ].map((comp) => (
                                  <motion.div
                                    key={comp.id}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setSelectedComponent(comp.id as typeof selectedComponent)}
                                    draggable
                                    onDragStart={(e) => {
                                      (e as unknown as React.DragEvent).dataTransfer?.setData("componentType", comp.id);
                                    }}
                                    className={cn(
                                      "p-2 rounded-lg border cursor-pointer transition-all group",
                                      selectedComponent === comp.id
                                        ? "bg-white/10 border-white/30 ring-1 ring-blue-500/50"
                                        : "bg-neutral-900/50 border-white/10 hover:bg-neutral-800/50 hover:border-white/20"
                                    )}
                                  >
                                    <div className="flex items-center justify-between mb-1.5">
                                      <span className="text-[9px] text-white/60 font-medium">{comp.label}</span>
                                      <GripVertical size={10} className="text-white/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                    {comp.preview}
                                  </motion.div>
                                ))}
                              </div>
                            </div>

                            {/* Component Editor (Right) */}
                            <div className="flex-1 space-y-4">
                              {selectedComponent === "button-primary" && (
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between">
                                    <label className="text-xs text-white/70 font-medium">Primary Button</label>
                                    <div className="flex gap-1">
                                      {(["none", "linear", "radial", "glossy", "glow"] as const).map((gradient) => (
                                        <button
                                          key={gradient}
                                          onClick={() => updateSetting("buttonPrimaryGradient", gradient)}
                                          className={cn(
                                            "px-2 py-0.5 rounded text-[9px] font-medium transition-all capitalize",
                                            settings.buttonPrimaryGradient === gradient
                                              ? "bg-white/20 text-white"
                                              : "bg-neutral-800 text-white/50 hover:text-white/70"
                                          )}
                                        >
                                          {gradient}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-3">
                                    <div className="flex items-center gap-2">
                                      <span className="text-[10px] text-white/40 w-12">BG</span>
                                      <input type="color" value={settings.buttonPrimaryBg} onChange={(e) => updateSetting("buttonPrimaryBg", e.target.value)} className="w-6 h-5 rounded border border-white/10 cursor-pointer" />
                                      <input type="text" value={settings.buttonPrimaryBg} onChange={(e) => updateSetting("buttonPrimaryBg", e.target.value)} className="flex-1 bg-neutral-800 border border-white/10 rounded px-1.5 py-0.5 text-white text-[10px] focus:outline-none" />
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-[10px] text-white/40 w-12">Text</span>
                                      <input type="color" value={settings.buttonPrimaryText} onChange={(e) => updateSetting("buttonPrimaryText", e.target.value)} className="w-6 h-5 rounded border border-white/10 cursor-pointer" />
                                      <input type="text" value={settings.buttonPrimaryText} onChange={(e) => updateSetting("buttonPrimaryText", e.target.value)} className="flex-1 bg-neutral-800 border border-white/10 rounded px-1.5 py-0.5 text-white text-[10px] focus:outline-none" />
                                    </div>
                                    {settings.buttonPrimaryGradient !== "none" && (
                                      <div className="flex items-center gap-2 col-span-2">
                                        <span className="text-[10px] text-white/40 w-12">Gradient</span>
                                        <input type="color" value={settings.buttonPrimaryGradientColor} onChange={(e) => updateSetting("buttonPrimaryGradientColor", e.target.value)} className="w-6 h-5 rounded border border-white/10 cursor-pointer" />
                                        <input type="text" value={settings.buttonPrimaryGradientColor} onChange={(e) => updateSetting("buttonPrimaryGradientColor", e.target.value)} className="flex-1 bg-neutral-800 border border-white/10 rounded px-1.5 py-0.5 text-white text-[10px] focus:outline-none" />
                                      </div>
                                    )}
                                  </div>
                                  {/* Live Preview */}
                                  <div className="pt-2 border-t border-white/10">
                                    <span className="text-[9px] text-white/40 uppercase tracking-wider mb-2 block">Preview</span>
                                    <button
                                      className="px-4 py-2 rounded-lg text-xs font-medium transition-all"
                                      style={{
                                        background: settings.buttonPrimaryGradient === "none"
                                          ? settings.buttonPrimaryBg
                                          : settings.buttonPrimaryGradient === "linear"
                                            ? `linear-gradient(135deg, ${settings.buttonPrimaryBg}, ${settings.buttonPrimaryGradientColor})`
                                            : settings.buttonPrimaryGradient === "radial"
                                              ? `radial-gradient(circle, ${settings.buttonPrimaryGradientColor}, ${settings.buttonPrimaryBg})`
                                              : settings.buttonPrimaryGradient === "glossy"
                                                ? `linear-gradient(180deg, ${settings.buttonPrimaryGradientColor}40 0%, transparent 50%, ${settings.buttonPrimaryBg}40 100%), ${settings.buttonPrimaryBg}`
                                                : `${settings.buttonPrimaryBg}`,
                                        color: settings.buttonPrimaryText,
                                        boxShadow: settings.buttonPrimaryGradient === "glow" ? `0 0 20px ${settings.buttonPrimaryGradientColor}60` : undefined
                                      }}
                                    >
                                      Primary Button
                                    </button>
                                  </div>
                                </div>
                              )}

                              {selectedComponent === "button-secondary" && (
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between">
                                    <label className="text-xs text-white/70 font-medium">Secondary Button</label>
                                    <div className="flex gap-1">
                                      {(["none", "linear", "radial", "glossy", "glow"] as const).map((gradient) => (
                                        <button
                                          key={gradient}
                                          onClick={() => updateSetting("buttonSecondaryGradient", gradient)}
                                          className={cn(
                                            "px-2 py-0.5 rounded text-[9px] font-medium transition-all capitalize",
                                            settings.buttonSecondaryGradient === gradient
                                              ? "bg-white/20 text-white"
                                              : "bg-neutral-800 text-white/50 hover:text-white/70"
                                          )}
                                        >
                                          {gradient}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-3">
                                    <div className="flex items-center gap-2">
                                      <span className="text-[10px] text-white/40 w-12">BG</span>
                                      <input type="text" value={settings.buttonSecondaryBg} onChange={(e) => updateSetting("buttonSecondaryBg", e.target.value)} className="flex-1 bg-neutral-800 border border-white/10 rounded px-1.5 py-0.5 text-white text-[10px] focus:outline-none" />
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-[10px] text-white/40 w-12">Text</span>
                                      <input type="color" value={settings.buttonSecondaryText} onChange={(e) => updateSetting("buttonSecondaryText", e.target.value)} className="w-6 h-5 rounded border border-white/10 cursor-pointer" />
                                      <input type="text" value={settings.buttonSecondaryText} onChange={(e) => updateSetting("buttonSecondaryText", e.target.value)} className="flex-1 bg-neutral-800 border border-white/10 rounded px-1.5 py-0.5 text-white text-[10px] focus:outline-none" />
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-[10px] text-white/40 w-12">Border</span>
                                      <input type="text" value={settings.buttonSecondaryBorder} onChange={(e) => updateSetting("buttonSecondaryBorder", e.target.value)} className="flex-1 bg-neutral-800 border border-white/10 rounded px-1.5 py-0.5 text-white text-[10px] focus:outline-none" />
                                    </div>
                                    {settings.buttonSecondaryGradient !== "none" && (
                                      <div className="flex items-center gap-2">
                                        <span className="text-[10px] text-white/40 w-12">Gradient</span>
                                        <input type="color" value={settings.buttonSecondaryGradientColor} onChange={(e) => updateSetting("buttonSecondaryGradientColor", e.target.value)} className="w-6 h-5 rounded border border-white/10 cursor-pointer" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="pt-2 border-t border-white/10">
                                    <span className="text-[9px] text-white/40 uppercase tracking-wider mb-2 block">Preview</span>
                                    <button
                                      className="px-4 py-2 rounded-lg text-xs font-medium transition-all border"
                                      style={{
                                        background: settings.buttonSecondaryGradient === "none"
                                          ? settings.buttonSecondaryBg
                                          : settings.buttonSecondaryGradient === "linear"
                                            ? `linear-gradient(135deg, ${settings.buttonSecondaryBg || 'transparent'}, ${settings.buttonSecondaryGradientColor}30)`
                                            : settings.buttonSecondaryBg,
                                        color: settings.buttonSecondaryText,
                                        borderColor: settings.buttonSecondaryBorder,
                                        boxShadow: settings.buttonSecondaryGradient === "glow" ? `0 0 15px ${settings.buttonSecondaryGradientColor}40` : undefined
                                      }}
                                    >
                                      Secondary Button
                                    </button>
                                  </div>
                                </div>
                              )}

                              {selectedComponent === "card" && (
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between">
                                    <label className="text-xs text-white/70 font-medium">Card</label>
                                    <div className="flex gap-1">
                                      {(["none", "linear", "radial", "glossy", "glass"] as const).map((gradient) => (
                                        <button
                                          key={gradient}
                                          onClick={() => updateSetting("cardGradient", gradient)}
                                          className={cn(
                                            "px-2 py-0.5 rounded text-[9px] font-medium transition-all capitalize",
                                            settings.cardGradient === gradient
                                              ? "bg-white/20 text-white"
                                              : "bg-neutral-800 text-white/50 hover:text-white/70"
                                          )}
                                        >
                                          {gradient}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-3">
                                    <div className="flex items-center gap-2">
                                      <span className="text-[10px] text-white/40 w-12">BG</span>
                                      <input type="text" value={settings.cardBg} onChange={(e) => updateSetting("cardBg", e.target.value)} className="flex-1 bg-neutral-800 border border-white/10 rounded px-1.5 py-0.5 text-white text-[10px] focus:outline-none" />
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-[10px] text-white/40 w-12">Border</span>
                                      <input type="text" value={settings.cardBorder} onChange={(e) => updateSetting("cardBorder", e.target.value)} className="flex-1 bg-neutral-800 border border-white/10 rounded px-1.5 py-0.5 text-white text-[10px] focus:outline-none" />
                                    </div>
                                    {settings.cardGradient !== "none" && settings.cardGradient !== "glass" && (
                                      <div className="flex items-center gap-2 col-span-2">
                                        <span className="text-[10px] text-white/40 w-12">Gradient</span>
                                        <input type="color" value={settings.cardGradientColor} onChange={(e) => updateSetting("cardGradientColor", e.target.value)} className="w-6 h-5 rounded border border-white/10 cursor-pointer" />
                                        <input type="text" value={settings.cardGradientColor} onChange={(e) => updateSetting("cardGradientColor", e.target.value)} className="flex-1 bg-neutral-800 border border-white/10 rounded px-1.5 py-0.5 text-white text-[10px] focus:outline-none" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="pt-2 border-t border-white/10">
                                    <span className="text-[9px] text-white/40 uppercase tracking-wider mb-2 block">Preview</span>
                                    <div
                                      className="w-40 h-16 rounded-lg border p-2"
                                      style={{
                                        background: settings.cardGradient === "none"
                                          ? settings.cardBg
                                          : settings.cardGradient === "glass"
                                            ? `linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))`
                                            : settings.cardGradient === "linear"
                                              ? `linear-gradient(180deg, ${settings.cardGradientColor}20, transparent)`
                                              : settings.cardGradient === "radial"
                                                ? `radial-gradient(circle at top, ${settings.cardGradientColor}30, transparent)`
                                                : settings.cardBg,
                                        borderColor: settings.cardBorder,
                                        backdropFilter: settings.cardGradient === "glass" ? 'blur(10px)' : undefined
                                      }}
                                    >
                                      <div className="h-2 bg-white/20 rounded w-3/4 mb-1" />
                                      <div className="h-2 bg-white/10 rounded w-1/2" />
                                    </div>
                                  </div>
                                </div>
                              )}

                              {selectedComponent === "input" && (
                                <div className="space-y-3">
                                  <label className="text-xs text-white/70 font-medium">Input Field</label>
                                  <div className="grid grid-cols-3 gap-3">
                                    <div className="flex items-center gap-2">
                                      <span className="text-[10px] text-white/40 w-8">BG</span>
                                      <input type="color" value={settings.inputBg} onChange={(e) => updateSetting("inputBg", e.target.value)} className="w-6 h-5 rounded border border-white/10 cursor-pointer" />
                                      <input type="text" value={settings.inputBg} onChange={(e) => updateSetting("inputBg", e.target.value)} className="flex-1 bg-neutral-800 border border-white/10 rounded px-1.5 py-0.5 text-white text-[10px] focus:outline-none" />
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-[10px] text-white/40 w-8">Border</span>
                                      <input type="text" value={settings.inputBorder} onChange={(e) => updateSetting("inputBorder", e.target.value)} className="flex-1 bg-neutral-800 border border-white/10 rounded px-1.5 py-0.5 text-white text-[10px] focus:outline-none" />
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-[10px] text-white/40 w-8">Text</span>
                                      <input type="color" value={settings.inputText} onChange={(e) => updateSetting("inputText", e.target.value)} className="w-6 h-5 rounded border border-white/10 cursor-pointer" />
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-white/40 w-16">Focus Ring</span>
                                    <input type="color" value={settings.focusRingColor} onChange={(e) => updateSetting("focusRingColor", e.target.value)} className="w-6 h-5 rounded border border-white/10 cursor-pointer" />
                                    <input type="text" value={settings.focusRingColor} onChange={(e) => updateSetting("focusRingColor", e.target.value)} className="flex-1 bg-neutral-800 border border-white/10 rounded px-1.5 py-0.5 text-white text-[10px] focus:outline-none" />
                                  </div>
                                  <div className="pt-2 border-t border-white/10">
                                    <span className="text-[9px] text-white/40 uppercase tracking-wider mb-2 block">Preview</span>
                                    <input
                                      type="text"
                                      placeholder="Type something..."
                                      className="w-40 px-3 py-2 rounded-lg text-xs border focus:outline-none"
                                      style={{
                                        backgroundColor: settings.inputBg,
                                        borderColor: settings.inputBorder,
                                        color: settings.inputText,
                                      }}
                                      readOnly
                                    />
                                  </div>
                                </div>
                              )}

                              {!selectedComponent && (
                                <div className="flex items-center justify-center h-full text-white/30 text-xs">
                                  <div className="text-center">
                                    <Palette size={24} className="mx-auto mb-2 opacity-50" />
                                    <p>Select a component to edit</p>
                                    <p className="text-[10px] mt-1">or drag & drop to canvas</p>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Quick Presets */}
                            <div className="w-24 flex-shrink-0 space-y-2">
                              <label className="text-[10px] text-white/40 uppercase tracking-wider block">Presets</label>
                              <div className="space-y-1.5">
                                <button
                                  onClick={() => {
                                    updateSetting("buttonPrimaryBg", "#ffffff");
                                    updateSetting("buttonPrimaryText", "#000000");
                                    updateSetting("buttonPrimaryGradient", "none");
                                    updateSetting("buttonSecondaryBg", "transparent");
                                    updateSetting("buttonSecondaryText", "#ffffff");
                                    updateSetting("buttonSecondaryBorder", "rgba(255,255,255,0.3)");
                                  }}
                                  className="w-full px-2 py-1.5 rounded text-[10px] bg-neutral-800 border border-white/10 text-white/70 hover:text-white hover:bg-neutral-700 transition-all"
                                >
                                  Light
                                </button>
                                <button
                                  onClick={() => {
                                    updateSetting("buttonPrimaryBg", "#000000");
                                    updateSetting("buttonPrimaryText", "#ffffff");
                                    updateSetting("buttonPrimaryGradient", "none");
                                    updateSetting("buttonSecondaryBg", "transparent");
                                    updateSetting("buttonSecondaryText", "#000000");
                                    updateSetting("buttonSecondaryBorder", "rgba(0,0,0,0.3)");
                                  }}
                                  className="w-full px-2 py-1.5 rounded text-[10px] bg-neutral-800 border border-white/10 text-white/70 hover:text-white hover:bg-neutral-700 transition-all"
                                >
                                  Dark
                                </button>
                                <button
                                  onClick={() => {
                                    updateSetting("buttonPrimaryBg", settings.color3);
                                    updateSetting("buttonPrimaryText", "#ffffff");
                                    updateSetting("buttonPrimaryGradient", "linear");
                                    updateSetting("buttonPrimaryGradientColor", settings.color4);
                                    updateSetting("focusRingColor", settings.color3);
                                  }}
                                  className="w-full px-2 py-1.5 rounded text-[10px] bg-neutral-800 border border-white/10 text-white/70 hover:text-white hover:bg-neutral-700 transition-all"
                                >
                                  Gradient
                                </button>
                                <button
                                  onClick={() => {
                                    updateSetting("buttonPrimaryBg", settings.color3);
                                    updateSetting("buttonPrimaryGradient", "glow");
                                    updateSetting("buttonPrimaryGradientColor", settings.color3);
                                    updateSetting("cardGradient", "glass");
                                  }}
                                  className="w-full px-2 py-1.5 rounded text-[10px] bg-neutral-800 border border-white/10 text-white/70 hover:text-white hover:bg-neutral-700 transition-all"
                                >
                                  Glow
                                </button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {activeTab === "view" && (
                        <motion.div
                          key="view"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="flex items-center justify-center gap-6"
                        >
                          {/* View toggles */}
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => setFullscreen(!fullscreen)}
                              className={cn(
                                "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all text-xs",
                                fullscreen
                                  ? "bg-neutral-900 border-white/20 text-white"
                                  : "bg-neutral-900 border-white/10 text-white/70 hover:bg-neutral-800"
                              )}
                            >
                              {fullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                              <span className="text-xs font-medium">Fullscreen</span>
                            </button>

                            <button
                              onClick={() => setShowHints(!showHints)}
                              className={cn(
                                "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all text-xs",
                                showHints
                                  ? "bg-neutral-900 border-white/20 text-white"
                                  : "bg-neutral-900 border-white/10 text-white/70 hover:bg-neutral-800"
                              )}
                            >
                              {showHints ? <Eye size={14} /> : <EyeOff size={14} />}
                              <span className="text-xs font-medium">UI Hints</span>
                            </button>
                          </div>
                        </motion.div>
                      )}

                      {activeTab === "export" && (
                        <motion.div
                          key="export"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="space-y-6"
                        >
                          <div>
                            <h3 className="text-lg font-semibold text-white mb-1">Copy Code</h3>
                            <p className="text-sm text-white/60 mb-6">Copy the project code to clipboard</p>
                          </div>

                          {/* Copy Code */}
                          <div className="space-y-3">
                            <div className="flex flex-col gap-3">
                              <button
                                onClick={handleCopyProjectCode}
                                className={`flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-white text-xs font-medium transition-colors ${copiedProjectCode
                                    ? "bg-neutral-800 hover:bg-neutral-700"
                                    : "bg-neutral-900 hover:bg-neutral-800"
                                  }`}
                              >
                                {copiedProjectCode ? <Check size={14} /> : <Code size={14} />}
                                {copiedProjectCode ? "Project Code Copied!" : "Copy Project Code"}
                              </button>
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={handleCopyCode}
                                  className={`flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-white text-xs font-medium transition-colors ${copiedCode
                                      ? "bg-neutral-800 hover:bg-neutral-700"
                                      : "bg-neutral-900 hover:bg-neutral-800"
                                    }`}
                                >
                                  {copiedCode ? <Check size={14} /> : <Code size={14} />}
                                  {copiedCode ? "Copied!" : "Copy React Code"}
                                </button>
                                <button
                                  onClick={handleCopyJSON}
                                  className={`flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-white text-xs font-medium transition-colors ${copiedJSON
                                      ? "bg-neutral-800 hover:bg-neutral-700"
                                      : "bg-neutral-900 hover:bg-neutral-800"
                                    }`}
                                >
                                  {copiedJSON ? <Check size={14} /> : <FileJson size={14} />}
                                  {copiedJSON ? "Copied!" : "Copy JSON Settings"}
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Settings Summary */}
                          <div className="pt-4 border-t border-white/10 space-y-2">
                            <h4 className="text-sm font-medium text-white/80">Current Settings</h4>
                            <div className="space-y-1 text-xs text-white/60">
                              <div>Style: <span className="text-white/80">{settings.gradientStyle}</span></div>
                              <div>Brightness: <span className="text-white/80">{settings.brightness.toFixed(2)}</span></div>
                              <div>Grain: <span className="text-white/80">{settings.grainEnabled ? 'On' : 'Off'}</span></div>
                              {settings.grainEnabled && (
                                <div>Intensity: <span className="text-white/80">{settings.grainIntensity.toFixed(2)}</span></div>
                              )}
                              <div>Environment: <span className="text-white/80">{settings.environmentEnabled ? 'On' : 'Off'}</span></div>
                            </div>
                          </div>
                        </motion.div>
                      )}

                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Export Panel */}
        <HeroExportPanel
          isOpen={showExport}
          onClose={() => {
            setShowExport(false);
            triggerAutoSave();
          }}
          settings={settings}
          onImportSettings={handleImportSettings}
        />

      </div>
    </>
  );
};

export default HeroBackgroundWorkspace;
