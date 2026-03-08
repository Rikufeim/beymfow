import React, { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HexColorPicker } from "react-colorful";
import { toPng, toJpeg } from "html-to-image";
import { ArrowLeft, Maximize2, Minimize2, Eye, EyeOff, Sun, Cloudy, Layers, Save, Check, ChevronUp, ChevronDown, Code, FileJson, Pencil, Palette, GripVertical, GripHorizontal, Download, Upload, ImageIcon, X, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { setColorPromptPayload, buildColorSummary } from "@/lib/colorPromptBridge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import ColorPickerField from "@/components/flow-nodes/ColorPickerField";
import AnimatedBackgroundsTab, { AnimatedBgPreview, DEFAULT_ANIMATED_BG, type AnimatedBgSettings } from "./AnimatedBackgroundsTab";
import { cn } from "@/lib/utils";
import { buildHeroGradient } from "./heroGradient";
import {
  saveProject,
  saveDraft,
  generateThumbnail,
  generateProjectName,
  type HeroBackgroundProject
} from "@/lib/heroProjectStore";
import { toast } from "sonner";
import {
  BACKGROUND_LIBRARY,
  COLOR_PRESETS,
  CATEGORY_LABELS,
  type BackgroundEntry,
  type BackgroundVariant,
  type BackgroundCategory,
} from "@/data/heroBackgroundLibrary";
// BG Library (overlay) removed - Color Codes uses gradient + grain only

// Static SVG noise data URI — avoid re-creating on every render
const NOISE_SVG_URI = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`;
const GRAIN_SVG_URI = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='5' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`;

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
  blurPx?: number;
  vignette?: number;
  contrast?: number;
  saturation?: number;
}

interface FlowState {
  currentBackgroundStyle: HeroBackgroundSettings["gradientStyle"];
  backgroundParams: FlowBackgroundParams;
  palette: FlowPalette;
  lastUserPrompt: string;
  flowMode: FlowMode;
  selectedCategory?: BackgroundCategory;
  selectedBackgroundId?: string;
}

// --- Types ---
export type GradientType = "linear" | "radial" | "conic";
export type BlendModeOption = "normal" | "overlay" | "soft-light" | "multiply" | "screen";
export type GrainSize = "fine" | "medium" | "coarse";
export type ImageSimulateMode = "hero" | "card" | "fullscreen";

export interface HeroBackgroundSettings {
  // Colors
  color1: string;
  color2: string;
  color3: string;
  color4: string;
  singleColorMode: boolean;
  // Brightness & filters (Motion tab)
  brightness: number;
  contrast: number;
  saturation: number;
  blurPx: number;
  vignette: number;
  // Grain
  grainEnabled: boolean;
  grainIntensity: number;
  // Environment / Light
  environmentEnabled: boolean;
  // Gradient style
  gradientStyle: "halo" | "soft-sweep" | "orb" | "diagonal-blend" | "noise-wash" | "aurora" | "mesh" | "spotlight" | "wave" | "crystal" | "sunset" | "cosmic" | "nebula-cloud" | "radial-pulse" | "glass-shards" | "grid-perspective" | "fluid-flow" | "cyber-grid" | "bokeh-lights" | "velvet-wrap" | "prism-refraction" | "midnight-mist" | "solar-wind" | "digital-rain" | "abstract-curves" | "neon-smoke" | "geometric-shapes" | "silk-drape" | "vortex-spin" | "glitch-noise" | "star-cluster" | "liquid-metal";
  // Advanced gradient controls
  gradientType: GradientType;
  gradientAngle: number;
  blendMode: BlendModeOption;
  // Pattern controls
  noiseAmount: number;
  grainSize: GrainSize;
  textureOpacity: number;
  // Advanced controls
  radialFocusX: number;
  radialFocusY: number;
  exposure: number;
  gamma: number;
  // Motion (future)
  motionEnabled: boolean;
  motionSpeed: number;
  // Component styling
  buttonPrimaryBg: string;
  buttonPrimaryText: string;
  buttonPrimaryGradient: "none" | "linear" | "radial" | "glossy" | "glow";
  buttonPrimaryGradientColor: string;
  buttonPrimaryRadius: number;
  buttonPrimaryPaddingX: number;
  buttonPrimaryPaddingY: number;
  buttonSecondaryBg: string;
  buttonSecondaryText: string;
  buttonSecondaryBorder: string;
  buttonSecondaryGradient: "none" | "linear" | "radial" | "glossy" | "glow";
  buttonSecondaryGradientColor: string;
  buttonSecondaryRadius: number;
  buttonSecondaryPaddingX: number;
  buttonSecondaryPaddingY: number;
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
  contrast: 1,
  saturation: 1,
  blurPx: 0,
  vignette: 0,
  grainEnabled: false,
  grainIntensity: 0.18,
  environmentEnabled: true,
  gradientStyle: "halo",
  // Advanced gradient controls
  gradientType: "linear",
  gradientAngle: 135,
  blendMode: "normal",
  // Pattern controls
  noiseAmount: 0,
  grainSize: "medium",
  textureOpacity: 0.5,
  // Advanced controls
  radialFocusX: 50,
  radialFocusY: 50,
  exposure: 1,
  gamma: 1,
  motionEnabled: false,
  motionSpeed: 0.5,
  // Component defaults
  buttonPrimaryBg: "#ffffff",
  buttonPrimaryText: "#000000",
  buttonPrimaryGradient: "none",
  buttonPrimaryGradientColor: "#389cff",
  buttonPrimaryRadius: 8,
  buttonPrimaryPaddingX: 24,
  buttonPrimaryPaddingY: 10,
  buttonSecondaryBg: "transparent",
  buttonSecondaryText: "#ffffff",
  buttonSecondaryBorder: "rgba(255,255,255,0.3)",
  buttonSecondaryGradient: "none",
  buttonSecondaryGradientColor: "#8b5cf6",
  buttonSecondaryRadius: 8,
  buttonSecondaryPaddingX: 24,
  buttonSecondaryPaddingY: 10,
  cardBg: "rgba(255,255,255,0.1)",
  cardBorder: "rgba(255,255,255,0.2)",
  cardGradient: "none",
  cardGradientColor: "#389cff",
  inputBg: "#1a1a1a",
  inputBorder: "rgba(255,255,255,0.1)",
  inputText: "#ffffff",
  focusRingColor: "#389cff",
};

interface HeroBackgroundWorkspaceProps {
  projectId?: string;
  projectName?: string;
  initialSettings?: HeroBackgroundSettings;
  initialAnimatedBg?: AnimatedBgSettings;
  isLoggedIn?: boolean;
  onBack: () => void;
  onSave?: (project: HeroBackgroundProject) => void;
}

type TabId = "shape" | "animated" | "layout" | "style" | "motion" | "components" | "export";

const FLOW_TABS: Array<{ id: TabId; label: string }> = [
  { id: "shape", label: "Backgrounds" },
  { id: "animated", label: "Animated" },
  { id: "style", label: "Style" },
  { id: "motion", label: "Motion" },
  { id: "components", label: "Components" },
  { id: "export", label: "Export" },
];

// Layout categories for grouping gradient styles
const LAYOUT_CATEGORIES = [
  { label: "All", filter: () => true },
  { label: "Smooth", filter: (id: string) => ["halo", "soft-sweep", "orb", "spotlight"].includes(id) },
  { label: "Angular", filter: (id: string) => ["diagonal-blend", "crystal", "sunset"].includes(id) },
  { label: "Organic", filter: (id: string) => ["aurora", "wave"].includes(id) },
];

// Background shapes – only visually distinctive styles that render clearly in thumbnails
type GradientStyleId = HeroBackgroundSettings["gradientStyle"];
const SHAPE_STYLES: Array<{ id: GradientStyleId; label: string }> = [
  { id: "halo", label: "Halo" },
  { id: "soft-sweep", label: "Soft Sweep" },
  { id: "orb", label: "Orb" },
  { id: "diagonal-blend", label: "Diagonal" },
  { id: "aurora", label: "Aurora" },
  { id: "spotlight", label: "Spotlight" },
  { id: "wave", label: "Wave" },
  { id: "crystal", label: "Crystal" },
  { id: "sunset", label: "Sunset" },
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

const getPaletteFromPreset = (presetKey?: string): FlowPalette => {
  const preset = presetKey && COLOR_PRESETS[presetKey] ? COLOR_PRESETS[presetKey] : DEFAULT_SETTINGS;
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

// Sanitize multi-line gradient strings into a single line for safe embedding in JS/CSS strings
const sanitizeGradient = (bg: string): string => bg.replace(/\s*\n\s*/g, ' ').replace(/\s{2,}/g, ' ').trim();

// Generate React component code for live preview - Full implementation
const generateLiveCode = (settings: HeroBackgroundSettings, animBg?: AnimatedBgSettings): string => {
  // If animated background is enabled, generate shader-based code
  if (animBg?.enabled) {
    const { importLine, component } = generateAnimatedBgCode(animBg);
    return `import React from "react";
${importLine}

/**
 * HeroBackground Component
 * Generated by Beymflow Hero Background Generator
 * 
 * Shader: ${animBg.shaderType}
 * Colors: ${animBg.colors.join(", ")}
 */

interface HeroBackgroundProps {
  children?: React.ReactNode;
  className?: string;
}

export const HeroBackground: React.FC<HeroBackgroundProps> = ({ children, className }) => {
  return (
    <div className={\`relative w-full h-screen overflow-hidden \${className || ""}\`}>
      {/* Animated shader background */}
      <div className="absolute inset-0">
        ${component}
      </div>
      
      {/* Content */}
      {children && (
        <div className="relative z-10 h-full">
          {children}
        </div>
      )}
    </div>
  );
};

export default HeroBackground;

// Dependencies: npm install @paper-design/shaders-react
// Usage:
// <HeroBackground>
//   <YourHeroContent />
// </HeroBackground>
`;
  }

  const gradientCSS = sanitizeGradient(buildHeroGradient(settings));
  const grainSVG = `data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E`;

  // Build filter string
  const filterParts = [`brightness(${(settings.brightness * (settings.exposure ?? 1)).toFixed(2)})`];
  const effectiveContrast = (settings.contrast ?? 1) * (settings.gamma ?? 1);
  if (effectiveContrast !== 1) filterParts.push(`contrast(${effectiveContrast.toFixed(2)})`);
  if (settings.saturation !== 1 && settings.saturation !== undefined) filterParts.push(`saturate(${settings.saturation})`);
  if (settings.blurPx && settings.blurPx > 0) filterParts.push(`blur(${settings.blurPx}px)`);
  const filterString = filterParts.join(" ");

  const vignetteOverlay = (settings.vignette && settings.vignette > 0)
    ? `
      {/* Vignette overlay */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 75% 65% at 50% 50%, transparent 35%, rgba(0,0,0,0.15) 65%, rgba(0,0,0,0.5) 100%)",
          opacity: ${settings.vignette},
          mixBlendMode: "multiply",
        }}
      />`
    : "";

  const grainOverlay = settings.grainEnabled
    ? `
      {/* Grain overlay */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: \`url("${grainSVG}")\`,
          opacity: ${(settings.grainIntensity * 0.3).toFixed(3)},
          mixBlendMode: "overlay" as const,
        }}
      />`
    : "";

  return `import React from "react";

/**
 * HeroBackground Component
 * Generated by Beymflow Hero Background Generator
 * 
 * Style: ${settings.gradientStyle}
 * Colors: ${settings.singleColorMode ? settings.color1 : `${settings.color1}, ${settings.color2}, ${settings.color3}, ${settings.color4}`}
 */

interface HeroBackgroundProps {
  children?: React.ReactNode;
  className?: string;
}

export const HeroBackground: React.FC<HeroBackgroundProps> = ({ children, className }) => {
  return (
    <div 
      className={\`relative w-full h-screen overflow-hidden \${className || ""}\`}
      style={{
        background: "${gradientCSS}",
        filter: "${filterString}",${settings.blendMode && settings.blendMode !== "normal" ? `\n        mixBlendMode: "${settings.blendMode}",` : ""}
      }}
    >${grainOverlay}${vignetteOverlay}
      
      {/* Content */}
      {children && (
        <div className="relative z-10 h-full">
          {children}
        </div>
      )}
    </div>
  );
};

export default HeroBackground;

// Usage:
// <HeroBackground>
//   <YourHeroContent />
// </HeroBackground>
`;
};

// Generate JSON settings for export
const generateSettingsJSON = (settings: HeroBackgroundSettings, flowState: FlowState): string => {
  return JSON.stringify({
    gradientStyle: settings.gradientStyle,
    category: flowState.selectedCategory,
    backgroundId: flowState.selectedBackgroundId,
    colors: {
      color1: settings.color1,
      color2: settings.color2,
      color3: settings.color3,
      color4: settings.color4,
    },
    palette: flowState.palette,
    paletteRoles: { base: "color1", mid: "color2", accent: "color3", highlight: "color4" },
    brightness: settings.brightness,
    grain: settings.grainEnabled ? settings.grainIntensity : 0,
    environment: settings.environmentEnabled,
    backgroundParams: flowState.backgroundParams,
    effects: {
      blurPx: settings.blurPx ?? 0,
      vignette: settings.vignette ?? 0,
      contrast: settings.contrast ?? 1,
      saturation: settings.saturation ?? 1,
    },
  }, null, 2);
};

// Generate full project code as a React component
const generateProjectCode = (settings: HeroBackgroundSettings, animBg?: AnimatedBgSettings): string => {
  // If animated background is enabled, generate shader-based code
  if (animBg?.enabled) {
    const { importLine, component } = generateAnimatedBgCode(animBg);
    return `import React from 'react';
${importLine}

export const HeroBackground: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Animated shader background */}
      <div className="absolute inset-0">
        ${component}
      </div>
      {children && (
        <div className="relative z-10 h-full">
          {children}
        </div>
      )}
    </div>
  );
};

export default HeroBackground;

// Dependencies: npm install @paper-design/shaders-react`;
  }
  const background = sanitizeGradient(buildHeroGradient(settings));

  // Build filter string matching the live preview exactly
  const effectiveBrightness = settings.brightness * (settings.exposure ?? 1);
  const effectiveContrast = (settings.contrast ?? 1) * (settings.gamma ?? 1);
  const filterParts = [`brightness(${effectiveBrightness.toFixed(2)})`];
  if (effectiveContrast !== 1) filterParts.push(`contrast(${effectiveContrast.toFixed(2)})`);
  if (settings.saturation !== 1 && settings.saturation !== undefined) filterParts.push(`saturate(${settings.saturation})`);
  if (settings.blurPx && settings.blurPx > 0) filterParts.push(`blur(${settings.blurPx}px)`);
  const filterString = filterParts.join(" ");

  const grainOverlay = settings.grainEnabled
    ? `\n      {/* Grain overlay */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: \`url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='5' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")\`,
          opacity: ${(settings.grainIntensity * 0.25).toFixed(2)},
          mixBlendMode: "overlay",
        }}
      />`
    : '';

  const vignetteOverlay = (settings.vignette && settings.vignette > 0)
    ? `\n      {/* Vignette overlay */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 75% 65% at 50% 50%, transparent 35%, rgba(0,0,0,0.15) 65%, rgba(0,0,0,0.5) 100%)",
          opacity: ${settings.vignette},
          mixBlendMode: "multiply",
        }}
      />`
    : '';

  return `import React from 'react';

export const HeroBackground: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <div 
      className="relative w-full h-screen overflow-hidden"
      style={{
        background: "${background}",
        filter: "${filterString}",${settings.blendMode && settings.blendMode !== "normal" ? `\n        mixBlendMode: "${settings.blendMode}",` : ""}
      }}
    >${grainOverlay}${vignetteOverlay}
      {children && (
        <div className="relative z-10 h-full">
          {children}
        </div>
      )}
    </div>
  );
};

export default HeroBackground;`;
};

// Generate code for animated shader backgrounds
const generateAnimatedBgCode = (abg: AnimatedBgSettings): { importLine: string; component: string } => {
  const colorsStr = JSON.stringify(abg.colors);
  
  switch (abg.shaderType) {
    case "mesh-gradient":
      return {
        importLine: `import { MeshGradient } from "@paper-design/shaders-react";`,
        component: `<MeshGradient style={{ width: "100%", height: "100%" }} colors={${colorsStr}} distortion={${abg.distortion}} swirl={${abg.swirl}} speed={${abg.speed}} grainOverlay={${abg.grainOverlay}} />`,
      };
    case "neuro-noise":
      return {
        importLine: `import { NeuroNoise } from "@paper-design/shaders-react";`,
        component: `<NeuroNoise style={{ width: "100%", height: "100%" }} colorFront="${abg.colors[0] || "#22d3ee"}" colorMid="${abg.colors[1] || "#6366f1"}" colorBack="${abg.colors[2] || "#000000"}" brightness={${abg.brightness}} contrast={${abg.contrast}} speed={${abg.speed}} />`,
      };
    case "god-rays":
      return {
        importLine: `import { GodRays } from "@paper-design/shaders-react";`,
        component: `<GodRays style={{ width: "100%", height: "100%" }} colorBack="#000000" colorBloom="${abg.colors[0] || "#fbbf24"}" colors={${colorsStr}} intensity={${abg.intensity}} density={${abg.density}} speed={${abg.speed}} />`,
      };
    case "smoke-ring": {
      const bgColor = abg.colors[abg.colors.length - 1] || "#000000";
      const ringColors = JSON.stringify(abg.colors.slice(0, -1));
      return {
        importLine: `import { SmokeRing } from "@paper-design/shaders-react";`,
        component: `<SmokeRing style={{ width: "100%", height: "100%" }} colorBack="${bgColor}" colors={${ringColors}} noiseScale={${abg.noiseScale}} speed={${abg.speed}} />`,
      };
    }
    case "grain-gradient":
      return {
        importLine: `import { GrainGradient } from "@paper-design/shaders-react";`,
        component: `<GrainGradient style={{ width: "100%", height: "100%" }} colorBack="#000000" colors={${colorsStr}} softness={${abg.softness}} intensity={${abg.intensity}} noise={${abg.grainOverlay}} speed={${abg.speed}} />`,
      };
    case "swirl":
      return {
        importLine: `import { Swirl } from "@paper-design/shaders-react";`,
        component: `<Swirl style={{ width: "100%", height: "100%" }} colors={${colorsStr}} speed={${abg.speed}} />`,
      };
    default:
      return { importLine: "", component: "" };
  }
};

// Helper for robust clipboard copying with fallback
const robustCopyToClipboard = async (text: string): Promise<boolean> => {
  if (!text) return false;

  try {
    // 1. Try standard API
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.warn("Clipboard API failed, trying fallback", err);
    try {
      // 2. Fallback to textarea
      const textArea = document.createElement("textarea");
      textArea.value = text;

      // Ensure it's not visible but part of DOM
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      textArea.style.top = "0";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);

      textArea.focus();
      textArea.select();

      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    } catch (fallbackErr) {
      console.error("Copy failed completely", fallbackErr);
      return false;
    }
  }
};

export const HeroBackgroundWorkspace: React.FC<HeroBackgroundWorkspaceProps> = ({
  projectId,
  projectName: initialProjectName,
  initialSettings,
  initialAnimatedBg,
  isLoggedIn = false,
  onBack,
  onSave,
}) => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<HeroBackgroundSettings>(initialSettings || DEFAULT_SETTINGS);
  const [activeTab, setActiveTab] = useState<TabId>("shape");
  const [fullscreen, setFullscreen] = useState(true);
  const [showHints, setShowHints] = useState(false);
  // Drop Zone state
  const [droppedImage, setDroppedImage] = useState<string | null>(null);
  const [imageSimulateMode, setImageSimulateMode] = useState<ImageSimulateMode>("hero");
  const [imageBlurMask, setImageBlurMask] = useState(false);
  const [autoAdjustBg, setAutoAdjustBg] = useState(true);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showHeroPreview, setShowHeroPreview] = useState(false);

  const [animatedBg, setAnimatedBg] = useState<AnimatedBgSettings>(initialAnimatedBg || DEFAULT_ANIMATED_BG);
  const activeTabRef = useRef<TabId>("shape");

  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

  const [showExport, setShowExport] = useState(false);
  const [minimizedBar, setMinimizedBar] = useState(false);
  const [activeColorPicker, setActiveColorPicker] = useState<string | null>(null);

  // Resizable panel state
  const [panelHeight, setPanelHeight] = useState(250);
  const [isDragging, setIsDragging] = useState(false);

  // Handle panel resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const newHeight = window.innerHeight - e.clientY - 48;
      setPanelHeight(Math.max(150, Math.min(newHeight, window.innerHeight - 100)));
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      const touch = e.touches[0];
      const newHeight = window.innerHeight - touch.clientY - 48;
      setPanelHeight(Math.max(150, Math.min(newHeight, window.innerHeight - 100)));
    };

    const handleEnd = () => {
      setIsDragging(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleEnd);
      document.body.style.cursor = 'row-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging]);
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
  const [activeLayoutCategory, setActiveLayoutCategory] = useState(0);
  const previewContainerRef = useRef<HTMLDivElement>(null);

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
  const [copiedCss, setCopiedCss] = useState(false);
  const [copiedTailwind, setCopiedTailwind] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  // Download state
  const [downloadFormat, setDownloadFormat] = useState<"png" | "jpg">("png");
  const [downloadScale, setDownloadScale] = useState(1);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  // Live code and JSON
  const liveCode = useMemo(() => generateLiveCode(settings, animatedBg), [settings, animatedBg]);
  const liveJSON = useMemo(() => generateSettingsJSON(settings, flowState), [settings, flowState]);
  const projectCode = useMemo(() => generateProjectCode(settings, animatedBg), [settings, animatedBg]);
  const filteredBackgrounds = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return BACKGROUND_LIBRARY.filter((entry) => {
      if (entry.category !== activeCategory) return false;
      if (!query) return true;
      const haystack = `${entry.name} ${entry.tags.join(" ")}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [activeCategory, searchQuery]);

  // Pre-compute preview styles for filtered backgrounds to avoid calling buildHeroGradient per card per render
  const previewStylesMap = useMemo(() => {
    const map = new Map<string, React.CSSProperties>();
    for (const entry of filteredBackgrounds) {
      const palette = getPaletteFromPreset(entry.palettePreset);
      const p = entry.variants[0].params;
      const previewSettings: HeroBackgroundSettings = {
        ...DEFAULT_SETTINGS,
        gradientStyle: entry.gradientStyle,
        color1: palette.base,
        color2: palette.surface,
        color3: palette.accent,
        color4: palette.highlight,
        brightness: p.brightness,
        grainEnabled: p.grainEnabled,
        grainIntensity: p.grainIntensity,
        environmentEnabled: p.environmentEnabled,
        contrast: p.contrast ?? 1,
        saturation: p.saturation ?? 1,
      };
      const generatedBackground = buildHeroGradient(previewSettings);
      const hasInvalidBackground = /undefined|null/.test(generatedBackground);
      const fallbackBackground = `radial-gradient(circle at 18% 22%, ${palette.accent}66 0%, transparent 45%), radial-gradient(circle at 82% 78%, ${palette.highlight}55 0%, transparent 45%), linear-gradient(135deg, ${palette.base} 0%, ${palette.surface} 100%)`;
      const filterParts = [`brightness(${Math.max(1.05, p.brightness)})`];
      if (p.contrast != null && p.contrast !== 1) filterParts.push(`contrast(${p.contrast})`);
      if (p.saturation != null && p.saturation !== 1) filterParts.push(`saturate(${p.saturation})`);
      map.set(entry.id, {
        background: hasInvalidBackground ? fallbackBackground : generatedBackground,
        backgroundColor: palette.base,
        filter: filterParts.join(" "),
      });
    }
    return map;
  }, [filteredBackgrounds]);

  // Pre-compute layout shape preview backgrounds
  const shapePreviewMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const shape of SHAPE_STYLES) {
      const previewSettings: HeroBackgroundSettings = {
        ...settings,
        gradientStyle: shape.id,
        environmentEnabled: true,
        singleColorMode: false,
        brightness: 1,
        contrast: 1,
        saturation: 1,
        blurPx: 0,
        exposure: 1,
        gamma: 1,
      };
      map.set(shape.id, buildHeroGradient(previewSettings));
    }
    return map;
  }, [settings.color1, settings.color2, settings.color3, settings.color4]);

  const triggerAutoSave = useCallback(async () => {
    const currentSettingsString = JSON.stringify(settings) + JSON.stringify(animatedBg);

    // Skip if settings haven't changed
    if (currentSettingsString === lastSavedSettingsRef.current) {
      return;
    }

    setSaveStatus("saving");

    try {
      let thumbnail: string | undefined;

      // Always capture the actual rendered preview for accurate thumbnails
      // Use the [data-hero-preview] wrapper which contains both animated bg and gradient layers
      const heroPreviewEl = document.querySelector("[data-hero-preview]") as HTMLElement;
      if (heroPreviewEl) {
        try {
          const { toJpeg } = await import("html-to-image");
          // Ensure latest visual frame (especially shader/canvas-based animated backgrounds) is painted
          await new Promise<void>((resolve) => {
            requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
          });
          thumbnail = await toJpeg(heroPreviewEl, {
            quality: 0.7,
            width: 512,
            height: 288,
            pixelRatio: 1,
            cacheBust: true,
          });
        } catch (e) {
          console.warn("DOM thumbnail capture failed, using canvas fallback", e);
          thumbnail = await generateThumbnail(settings);
        }
      } else {
        thumbnail = await generateThumbnail(settings);
      }

      const project: HeroBackgroundProject = {
        id: currentProjectId,
        name: currentProjectName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        settings,
        animatedBg: animatedBg.enabled ? animatedBg : undefined,
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
  }, [settings, animatedBg, currentProjectId, currentProjectName, isLoggedIn, onSave]);

  // Debounced auto-save effect — longer debounce to avoid blocking UI
  useEffect(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      triggerAutoSave();
    }, 3000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [settings, animatedBg, triggerAutoSave]);

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
        animatedBg: animatedBg.enabled ? animatedBg : undefined,
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

  const applyPreset = useCallback((presetKey: string) => {
    const preset = COLOR_PRESETS[presetKey];
    if (!preset) return;

    // "Poista kaikki efektit": reset effects to neutral/defaults
    const nextSettingsBase = {
      brightness: 1.0,
      contrast: 1.0,
      saturation: 1.0,
      blurPx: 0,
      vignette: 0,
      grainEnabled: false,
      environmentEnabled: false,
      singleColorMode: false,
    };

    // Smooth transition
    const currentPalette = getPaletteFromSettings(settings);
    const nextPalette = {
      base: preset.color1,
      surface: preset.color2,
      accent: preset.color3,
      highlight: preset.color4,
      text: "#ffffff"
    };

    // Updates settings state with new colors after animation starts, 
    // but initially we set effects to neutral + start animation
    setSettings((prev) => ({
      ...prev,
      ...nextSettingsBase,
      // Colors will be updated by animatePaletteTransition steps, 
      // but we set target immediately in flowState
    }));

    setFlowState((prev) => ({
      ...prev,
      palette: nextPalette,
      backgroundParams: {
        ...prev.backgroundParams,
        brightness: 1.0,
        grainEnabled: false,
        environmentEnabled: false,
      }
    }));

    animatePaletteTransition(currentPalette, nextPalette);
  }, [animatePaletteTransition, settings]);

  const applyBackgroundEntry = useCallback((entry: BackgroundEntry, variant: BackgroundVariant) => {
    const currentPalette = getPaletteFromSettings(settings);
    const nextPalette = getPaletteFromPreset(entry.palettePreset);
    const p = variant.params;

    setFlowState((prev) => ({
      ...prev,
      currentBackgroundStyle: entry.gradientStyle,
      backgroundParams: p,
      palette: nextPalette,
      selectedCategory: entry.category,
      selectedBackgroundId: entry.id,
    }));

    // Disable animated background when selecting a static background
    setAnimatedBg({ ...DEFAULT_ANIMATED_BG });

    animatePaletteTransition(currentPalette, nextPalette);

    setSettings((prev) => ({
      ...prev,
      gradientStyle: entry.gradientStyle,
      color1: nextPalette.base,
      color2: nextPalette.surface,
      color3: nextPalette.accent,
      color4: nextPalette.highlight,
      singleColorMode: false,
      brightness: p.brightness,
      grainEnabled: p.grainEnabled,
      grainIntensity: p.grainIntensity,
      environmentEnabled: p.environmentEnabled,
      blurPx: p.blurPx ?? prev.blurPx,
      vignette: p.vignette ?? prev.vignette,
      contrast: p.contrast ?? prev.contrast,
      saturation: p.saturation ?? prev.saturation,
    }));
  }, [animatePaletteTransition, settings]);

  const handleAnimatedBgChange = useCallback((newSettings: AnimatedBgSettings) => {
    setAnimatedBg((prev) => {
      if (activeTabRef.current !== "animated") {
        return prev.enabled ? { ...prev, enabled: false } : prev;
      }
      return newSettings;
    });
  }, []);

  const handleImportSettings = useCallback((importedSettings: HeroBackgroundSettings) => {
    setSettings({ ...DEFAULT_SETTINGS, ...importedSettings });
    setFlowState((prev) => ({
      ...prev,
      currentBackgroundStyle: importedSettings.gradientStyle,
      backgroundParams: {
        brightness: importedSettings.brightness,
        grainEnabled: importedSettings.grainEnabled,
        grainIntensity: importedSettings.grainIntensity,
        environmentEnabled: importedSettings.environmentEnabled,
        blurPx: importedSettings.blurPx,
        vignette: importedSettings.vignette,
        contrast: importedSettings.contrast,
        saturation: importedSettings.saturation,
      },
      palette: getPaletteFromSettings(importedSettings),
    }));
    toast.success("Settings imported!");
  }, []);

  const handleCopyCode = useCallback(async () => {
    const success = await robustCopyToClipboard(liveCode);
    if (success) {
      setCopiedCode(true);
      toast.success("React code copied to clipboard!");
      console.log("React Code copied successfully");
      setTimeout(() => setCopiedCode(false), 2500);
    } else {
      toast.error("Failed to copy code. Please try manually.");
    }
  }, [liveCode]);

  const handleCopyJSON = useCallback(async () => {
    const success = await robustCopyToClipboard(liveJSON);
    if (success) {
      setCopiedJSON(true);
      toast.success("Settings JSON copied to clipboard!");
      setTimeout(() => setCopiedJSON(false), 2500);
    } else {
      toast.error("Failed to copy JSON.");
    }
  }, [liveJSON]);

  const handleCopyProjectCode = useCallback(async () => {
    const success = await robustCopyToClipboard(projectCode);
    if (success) {
      setCopiedProjectCode(true);
      toast.success("Project code copied to clipboard!");
      setTimeout(() => setCopiedProjectCode(false), 2500);
    } else {
      toast.error("Failed to copy Project code.");
    }
  }, [projectCode]);

  const generateCssExport = useCallback((): string => {
    const bg = sanitizeGradient(buildHeroGradient(settings));
    const b = settings.brightness * (settings.exposure ?? 1);
    const c = (settings.contrast ?? 1) * (settings.gamma ?? 1);
    const s = settings.saturation ?? 1;
    const filterParts = [`brightness(${b})`];
    if (c !== 1) filterParts.push(`contrast(${c})`);
    if (s !== 1) filterParts.push(`saturate(${s})`);
    if (settings.blurPx && settings.blurPx > 0) filterParts.push(`blur(${settings.blurPx}px)`);
    const blendLine = settings.blendMode !== "normal" ? `\n  mix-blend-mode: ${settings.blendMode};` : "";
    return `.hero-background {\n  background: ${bg};\n  filter: ${filterParts.join(' ')};${blendLine}\n  width: 100%;\n  min-height: 100vh;\n  position: relative;\n}`;
  }, [settings]);

  const generateTailwindExport = useCallback((): string => {
    const b = settings.brightness * (settings.exposure ?? 1);
    const c = (settings.contrast ?? 1) * (settings.gamma ?? 1);
    const s = settings.saturation ?? 1;
    const filterParts = [`brightness(${b})`];
    if (c !== 1) filterParts.push(`contrast(${c})`);
    if (s !== 1) filterParts.push(`saturate(${s})`);
    if (settings.blurPx && settings.blurPx > 0) filterParts.push(`blur(${settings.blurPx}px)`);
    const blendLine = settings.blendMode && settings.blendMode !== "normal" ? `\n    mixBlendMode: "${settings.blendMode}",` : "";
    return `{/* Tailwind utility classes + inline style */}\n<div\n  className="relative w-full min-h-screen"\n  style={{\n    background: "${sanitizeGradient(buildHeroGradient(settings))}",\n    filter: "${filterParts.join(' ')}",${blendLine}\n  }}\n/>`;
  }, [settings]);

  const handleCopyCss = useCallback(async () => {
    const success = await robustCopyToClipboard(generateCssExport());
    if (success) {
      setCopiedCss(true);
      toast.success("CSS copied!");
      setTimeout(() => setCopiedCss(false), 2500);
    }
  }, [generateCssExport]);

  const handleCopyTailwind = useCallback(async () => {
    const success = await robustCopyToClipboard(generateTailwindExport());
    if (success) {
      setCopiedTailwind(true);
      toast.success("Tailwind code copied!");
      setTimeout(() => setCopiedTailwind(false), 2500);
    }
  }, [generateTailwindExport]);

  const generatePromptExport = useCallback((): string => {
    const lines: string[] = [];
    if (animatedBg.enabled) {
      lines.push(`Create a full-screen animated background using the "${animatedBg.shaderType}" shader from @paper-design/shaders-react.`);
      lines.push(`Colors: ${animatedBg.colors.join(", ")}.`);
      lines.push(`Speed: ${animatedBg.speed}, Distortion: ${animatedBg.distortion}, Brightness: ${animatedBg.brightness}.`);
      if (animatedBg.shaderType === "mesh-gradient") lines.push(`Swirl: ${animatedBg.swirl}.`);
      if (animatedBg.shaderType === "neuro-noise") lines.push(`Noise scale: ${animatedBg.noiseScale}.`);
      if (animatedBg.shaderType === "god-rays") lines.push(`Intensity: ${animatedBg.intensity}.`);
    } else {
      lines.push(`Create a full-screen hero background with a "${settings.gradientStyle}" gradient style.`);
      lines.push(`Colors: ${settings.color1}, ${settings.color2}, ${settings.color3}, ${settings.color4}.`);
      lines.push(`Brightness: ${settings.brightness.toFixed(2)}, Contrast: ${(settings.contrast ?? 1).toFixed(2)}, Saturation: ${(settings.saturation ?? 1).toFixed(2)}.`);
      if (settings.grainEnabled) lines.push(`Enable a subtle grain/noise overlay at intensity ${settings.grainIntensity.toFixed(2)}.`);
      if ((settings.vignette ?? 0) > 0) lines.push(`Add a vignette effect at opacity ${settings.vignette}.`);
      if (settings.blendMode !== "normal") lines.push(`Use "${settings.blendMode}" blend mode.`);
    }
    lines.push(`\nThe background should be responsive (w-full, min-h-screen) and accept children as content overlay.`);
    lines.push(`Wrap it as a reusable React component called HeroBackground.`);
    return lines.join("\n");
  }, [settings, animatedBg]);

  const handleCopyPrompt = useCallback(async () => {
    const success = await robustCopyToClipboard(generatePromptExport());
    if (success) {
      setCopiedPrompt(true);
      toast.success("Prompt copied!");
      setTimeout(() => setCopiedPrompt(false), 2500);
    }
  }, [generatePromptExport]);

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

  // Generate live thumbnail by capturing the actual preview element
  const generateLiveThumbnail = useCallback(async (): Promise<string> => {
    const el = previewContainerRef.current;
    if (!el) return "";

    try {
      const scale = downloadScale;
      const options = {
        width: el.offsetWidth * scale,
        height: el.offsetHeight * scale,
        style: {
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          width: `${el.offsetWidth}px`,
          height: `${el.offsetHeight}px`,
        },
        quality: 0.95,
        pixelRatio: 1,
        // Filter out UI overlays (hints, drop zone, hero preview text, bottom fade)
        filter: (node: HTMLElement) => {
          if (!node.classList) return true;
          if (node.classList.contains('pointer-events-none') && node.style?.height === '30%') return false;
          return true;
        },
      };

      if (downloadFormat === "jpg") {
        return await toJpeg(el, { ...options, backgroundColor: '#000000' });
      }
      return await toPng(el, options);
    } catch (err) {
      console.error("Screenshot failed:", err);
      return "";
    }
  }, [downloadScale, downloadFormat]);

  const handleDownloadImage = useCallback(async () => {
    toast.info("Capturing preview...");
    const dataUrl = await generateLiveThumbnail();
    if (!dataUrl) {
      toast.error("Failed to capture image");
      return;
    }

    const link = document.createElement("a");
    link.download = `${currentProjectName.replace(/\s+/g, "-").toLowerCase()}.${downloadFormat}`;
    link.href = dataUrl;
    link.click();
    toast.success("Image downloaded!");
  }, [generateLiveThumbnail, currentProjectName, downloadFormat]);

  // Live preview thumbnail (small version)
  // Live thumbnail removed — was causing unnecessary canvas work on every settings change

  // Handle color picker open (only one at a time) - don't reset effects
  const handleColorPickerOpen = useCallback((colorKey: string) => {
    setActiveColorPicker((prev) => prev === colorKey ? null : colorKey);
  }, []);

  // Extract dominant color from an image using canvas
  const extractDominantColor = useCallback((dataUrl: string): Promise<{ r: number; g: number; b: number }> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 16;
        canvas.height = 16;
        const ctx = canvas.getContext("2d");
        if (!ctx) { resolve({ r: 0, g: 0, b: 0 }); return; }
        ctx.drawImage(img, 0, 0, 16, 16);
        const data = ctx.getImageData(0, 0, 16, 16).data;
        let rSum = 0, gSum = 0, bSum = 0, count = 0;
        for (let i = 0; i < data.length; i += 4) {
          rSum += data[i]; gSum += data[i + 1]; bSum += data[i + 2]; count++;
        }
        resolve({ r: Math.round(rSum / count), g: Math.round(gSum / count), b: Math.round(bSum / count) });
      };
      img.src = dataUrl;
    });
  }, []);

  // Handle image drop
  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.match(/image\/(png|jpe?g|webp)/)) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target?.result as string;
      setDroppedImage(dataUrl);
      if (autoAdjustBg) {
        const dominant = await extractDominantColor(dataUrl);
        const hex = rgbToHex(dominant.r, dominant.g, dominant.b);
        const { h, s, l } = rgbToHsl(dominant.r, dominant.g, dominant.b);
        const darkBase = hslToRgb(h, Math.min(s * 0.6, 30), Math.min(l * 0.15, 8));
        const midSurface = hslToRgb(h, Math.min(s * 0.5, 25), Math.min(l * 0.25, 15));
        updateSetting("color1", rgbToHex(darkBase.r, darkBase.g, darkBase.b));
        updateSetting("color2", rgbToHex(midSurface.r, midSurface.g, midSurface.b));
        updateSetting("color3", hex);
        updateSetting("color4", adjustHex(hex, 30));
      }
    };
    reader.readAsDataURL(file);
  }, [autoAdjustBg, extractDominantColor, updateSetting]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  // Memoize gradient style to avoid calling buildHeroGradient on every render
  const gradientStyle = useMemo((): React.CSSProperties => {
    const b = settings.brightness * (settings.exposure ?? 1);
    const c = settings.contrast ?? 1;
    const s = settings.saturation ?? 1;
    const g = settings.gamma ?? 1;
    const blurPx = settings.blurPx ?? 0;
    const parts = [`brightness(${b})`, `contrast(${c * g})`, `saturate(${s})`];
    if (blurPx > 0) parts.push(`blur(${blurPx}px)`);
    const background = buildHeroGradient(settings);
    return {
      background,
      filter: parts.join(" "),
      mixBlendMode: settings.blendMode !== "normal" ? settings.blendMode as React.CSSProperties["mixBlendMode"] : undefined,
    };
  }, [settings]);

  const handleBackWithSave = useCallback(async () => {
    try {
      await triggerAutoSave();
    } finally {
      onBack();
    }
  }, [triggerAutoSave, onBack]);

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
          width: '100%',
          background: 'transparent',
        }}
      >
        {/* Back button (left) */}
        <button
          onClick={handleBackWithSave}
          className="px-2.5 py-1.5 rounded-lg bg-neutral-900/80 text-white/70 hover:text-white hover:bg-neutral-800 transition-all flex items-center gap-1.5 pointer-events-auto text-xs flex-shrink-0"
        >
          <ArrowLeft size={14} />
          <span className="text-xs font-medium hidden sm:inline">Back</span>
        </button>

        {/* Project name + save status (center) */}
        <div className="flex items-center gap-2 sm:gap-3 pointer-events-auto min-w-0 flex-1 justify-center">
          {isEditingName ? (
            <div className="flex items-center gap-2 min-w-0">
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
                className="bg-black/60 border border-white/20 rounded-lg px-3 py-1.5 text-white/80 text-sm sm:text-lg font-medium tracking-tight focus:outline-none focus:border-white/40 w-full max-w-[200px]"
                autoFocus
              />
            </div>
          ) : (
            <div className="flex items-center gap-2 group min-w-0">
              <h1
                className="text-white/80 text-sm sm:text-lg font-medium tracking-tight cursor-pointer hover:text-white transition-colors truncate max-w-[120px] sm:max-w-none"
                onClick={handleStartEditName}
              >
                {currentProjectName}
              </h1>
              <button
                onClick={handleStartEditName}
                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-white/10 transition-all flex-shrink-0"
                title="Edit name"
              >
                <Pencil size={14} className="text-white/60 hover:text-white" />
              </button>
            </div>
          )}
          <div className={cn(
            "flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs transition-all flex-shrink-0",
            saveStatus === "saving" && "bg-yellow-500/20 text-yellow-400",
            saveStatus === "saved" && "bg-green-500/20 text-green-400",
            saveStatus === "idle" && "bg-white/5 text-white/40"
          )}>
            {saveStatus === "saving" && <Save size={12} className="animate-pulse" />}
            {saveStatus === "saved" && <Check size={12} />}
            {saveStatus === "idle" && <Save size={12} />}
            <span className="hidden sm:inline">{saveStatus === "saving" ? "Saving..." : saveStatus === "saved" ? "Saved" : "Auto-save"}</span>
          </div>
        </div>

        {/* Spacer for right side alignment */}
        <div className="w-8 sm:w-[120px] flex-shrink-0" />
      </div>

      <div
        data-hero-preview
        className="fixed overflow-hidden"
        style={{
          top: '0',
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 50,
          transform: 'none',
          willChange: 'auto',
          background: [
            'radial-gradient(ellipse 120% 80% at 50% 0%, rgba(60,40,90,0.25) 0%, transparent 50%)',
            'radial-gradient(ellipse 100% 60% at 50% 10%, rgba(30,30,60,0.2) 0%, transparent 45%)',
            'radial-gradient(circle at 50% 0%, rgba(255,255,255,0.03) 0%, transparent 25%)',
            'linear-gradient(to top, #030308 0%, #060612 18%, #0a0a1a 38%, #0d0d22 55%, #10102a 72%, #141438 88%, #18183f 100%)',
          ].join(', '),
        }}
      >
        {/* Animated shader background (renders behind/instead of gradient) */}
        {animatedBg.enabled && (
          <div className="absolute inset-0 z-[0]">
            <AnimatedBgPreview settings={animatedBg} />
          </div>
        )}

        {/* Fullscreen Preview */}
        <div
          ref={previewContainerRef}
          className="absolute inset-0 z-[1]"
          style={animatedBg.enabled ? {} : gradientStyle}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {/* Drag overlay */}
          {isDragOver && (
            <div className="absolute inset-0 z-[50] flex items-center justify-center bg-black/50 backdrop-blur-sm border-2 border-dashed border-white/40 rounded-xl">
              <div className="text-center">
                <Upload size={48} className="mx-auto mb-3 text-white/60" />
                <p className="text-white/80 text-lg font-medium">Drop your hero image here</p>
                <p className="text-white/40 text-sm mt-1">PNG, JPG, WebP supported</p>
              </div>
            </div>
          )}

          {/* Dropped image overlay */}
          {droppedImage && (
            <div className={cn(
              "absolute z-[4] pointer-events-none",
              imageSimulateMode === "fullscreen" && "inset-0",
              imageSimulateMode === "hero" && "inset-0 flex items-center justify-center",
              imageSimulateMode === "card" && "inset-0 flex items-center justify-center",
            )}>
              {imageBlurMask && (
                <div className="absolute inset-0 backdrop-blur-md bg-black/20" />
              )}
              <img
                src={droppedImage}
                alt="Hero preview"
                className={cn(
                  "relative",
                  imageSimulateMode === "fullscreen" && "w-full h-full object-cover",
                  imageSimulateMode === "hero" && "max-w-md max-h-64 rounded-2xl",
                  imageSimulateMode === "card" && "max-w-xs max-h-48 rounded-xl",
                )}
                style={{
                  filter: `drop-shadow(0 20px 40px rgba(0,0,0,0.5))`,
                  boxShadow: imageSimulateMode !== "fullscreen" ? `0 0 60px ${settings.color3}30, 0 20px 40px rgba(0,0,0,0.4)` : undefined,
                }}
              />
              <button
                onClick={() => setDroppedImage(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white/70 hover:text-white hover:bg-black/70 transition-all pointer-events-auto z-10"
              >
                <X size={16} />
              </button>
            </div>
          )}
          {/* Grain overlay - improved quality */}
          {settings.grainEnabled && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: GRAIN_SVG_URI,
                opacity: settings.grainIntensity * 0.25,
                mixBlendMode: "overlay",
              }}
            />
          )}

          {/* Anti-banding noise removed for performance */}

          {/* Vignette overlay (Motion tab) */}
          {(settings.vignette ?? 0) > 0 && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: "radial-gradient(ellipse 75% 65% at 50% 50%, transparent 35%, rgba(0,0,0,0.15) 65%, rgba(0,0,0,0.5) 100%)",
                opacity: settings.vignette,
                mixBlendMode: "multiply",
              }}
            />
          )}

          {/* Live Preview Hero Content */}
          {showHeroPreview && (
            <div className="absolute inset-0 z-[5] pointer-events-none flex items-center justify-center">
              <div className="text-center max-w-2xl px-8">
                <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 tracking-tight drop-shadow-lg" style={{ textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}>
                  Your Hero Title
                </h1>
                <p className="text-lg md:text-xl text-white/70 mb-8 max-w-lg mx-auto drop-shadow-md" style={{ textShadow: '0 1px 10px rgba(0,0,0,0.4)' }}>
                  A compelling subtitle that describes your product or service in a few words.
                </p>
                <div className="flex items-center justify-center gap-4">
                  <div className="px-6 py-3 rounded-xl text-sm font-semibold bg-white text-black shadow-lg shadow-white/20">
                    Get Started
                  </div>
                  <div className="px-6 py-3 rounded-xl text-sm font-semibold border border-white/30 text-white backdrop-blur-sm bg-white/5">
                    Learn More
                  </div>
                </div>
                {/* WCAG Contrast indicator */}
                <div className="mt-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-sm border border-white/10">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    settings.brightness >= 0.8 && settings.brightness <= 1.5 ? "bg-green-400" : "bg-yellow-400"
                  )} />
                  <span className="text-[10px] text-white/60">
                    {settings.brightness >= 0.8 && settings.brightness <= 1.5 ? "Good contrast" : "Check contrast"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Subtle bottom fade for control panel blend */}
          <div
            className="absolute bottom-0 left-0 right-0 pointer-events-none z-10"
            style={{
              height: '30%',
              background: 'linear-gradient(to top, rgba(12,12,20,0.6) 0%, transparent 100%)',
            }}
          />

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
          <div className="bg-[#0c0c14]/80 backdrop-blur-2xl border-t border-white/[0.06] relative">
            {/* Drag Handle */}
            <div
              className="absolute -top-3 left-1/2 -translate-x-1/2 w-32 h-6 cursor-row-resize flex items-center justify-center z-50 group hover:bg-white/5 rounded-full transition-colors touch-none"
              onMouseDown={(e) => {
                e.preventDefault();
                setIsDragging(true);
                setMinimizedBar(false);
              }}
              onTouchStart={(e) => {
                setIsDragging(true);
                setMinimizedBar(false);
              }}
            >
              <div className="w-12 h-1 bg-white/20 rounded-full group-hover:bg-white/40 transition-colors" />
            </div>

            {/* Tabs + Minimize button */}
            <div className="flex items-center justify-between px-2 sm:px-4 py-2">
              <div className="flex items-center gap-0.5 sm:gap-1 overflow-x-auto [&::-webkit-scrollbar]:hidden flex-1 min-w-0" style={{ scrollbarWidth: "none" }}>
                {FLOW_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      if (minimizedBar) setMinimizedBar(false);
                    }}
                    className={cn(
                      "px-2 sm:px-3 py-1.5 text-[10px] sm:text-[11px] font-medium transition-all capitalize cursor-pointer rounded-md whitespace-nowrap flex-shrink-0",
                      activeTab === tab.id
                        ? "text-white bg-white/10"
                        : "text-white/40 hover:text-white/70 hover:bg-white/5"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Minimize button */}
              <button
                onClick={() => setMinimizedBar(!minimizedBar)}
                className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-md bg-white/[0.03] border border-white/[0.06] text-white/40 hover:bg-white/[0.06] hover:text-white/70 transition-all text-xs flex-shrink-0 ml-1"
              >
                {minimizedBar ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                <span className="text-[10px] font-medium hidden sm:inline">{minimizedBar ? "Expand" : "Minimize"}</span>
              </button>
            </div>

            {/* Tab Content - collapsible, compact single-row layout so background shows more */}
            <AnimatePresence>
              {!minimizedBar && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: panelHeight, opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: isDragging ? 0 : 0.2 }}
                  className="overflow-visible"
                >
                  <div className="px-4 py-3 flex flex-col" style={{ height: panelHeight }}>
                    <AnimatePresence mode="wait">
                      {activeTab === "shape" && (
                        <motion.div
                          key="shape"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="h-full min-h-0 flex flex-col"
                        >
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 flex-shrink-0 mb-3">

                            <div className="flex items-center gap-0.5 sm:gap-1 flex-wrap overflow-x-auto [&::-webkit-scrollbar]:hidden w-full sm:w-auto" style={{ scrollbarWidth: "none" }}>
                              {CATEGORY_LABELS.map((cat) => (
                                <button
                                  key={cat}
                                  onClick={() => setActiveCategory(cat)}
                                  className={cn(
                                    "px-2 sm:px-2.5 py-1 sm:py-1.5 text-[10px] sm:text-[11px] font-medium transition-all duration-300 ease-out whitespace-nowrap flex-shrink-0",
                                    activeCategory === cat
                                      ? "text-white opacity-100"
                                      : "text-white/40 opacity-60 hover:opacity-100 hover:text-white/70"
                                  )}
                                >
                                  {cat}
                                </button>
                              ))}
                            </div>
                            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search…" className="sm:ml-auto w-full sm:w-32 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-[11px] text-white/70 placeholder:text-white/30 focus:outline-none focus:border-white/20" />
                          </div>
                          <div className="flex-1 overflow-y-auto min-h-0 pr-1 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: "none" }}>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                              {filteredBackgrounds.map((entry) => {
                                const isActive = flowState.currentBackgroundStyle === entry.gradientStyle && flowState.selectedBackgroundId === entry.id;
                                const previewStyle = previewStylesMap.get(entry.id) || {};
                                const palette = getPaletteFromPreset(entry.palettePreset);
                                return (
                                  <div key={entry.id} className="flex flex-col gap-1.5">
                                    <button
                                      onClick={() => applyBackgroundEntry(entry, entry.variants[0])}
                                      className={cn(
                                        "group relative w-full rounded-xl overflow-hidden transition-all duration-300 ease-out focus:outline-none select-none",
                                        isActive
                                          ? "ring-2 ring-white/40 shadow-lg shadow-white/5 scale-100"
                                          : "hover:ring-1 hover:ring-white/20 hover:shadow-md hover:shadow-white/5 hover:scale-[1.03]"
                                      )}
                                    >
                                      <div
                                        className="h-24 w-full shrink-0 relative"
                                        style={{
                                          ...previewStyle,
                                          filter: `${previewStyle.filter || ''} brightness(1.55) saturate(1.25)`.trim(),
                                        }}
                                      >
                                        {/* Visibility lift so every preset has a clear thumbnail silhouette */}
                                        <div
                                          className="absolute inset-0 pointer-events-none"
                                          style={{
                                            background: `radial-gradient(circle at 20% 20%, ${palette.accent}30 0%, transparent 45%), radial-gradient(circle at 80% 80%, ${palette.highlight}25 0%, transparent 45%)`,
                                          }}
                                        />
                                        {/* Anti-banding noise */}
                                        <div
                                          className="absolute inset-0 opacity-[0.08] pointer-events-none mix-blend-overlay"
                                          style={{ backgroundImage: NOISE_SVG_URI }}
                                        />
                                      </div>
                                      {/* Hover glow border */}
                                      <div className="absolute inset-0 rounded-xl border border-white/0 group-hover:border-white/15 transition-all duration-300 pointer-events-none" />
                                    </button>
                                    <span className={cn(
                                      "text-[10px] font-medium block truncate transition-all duration-300 px-0.5",
                                      isActive ? "text-white" : "text-white/50 group-hover:text-white/80"
                                    )}>{entry.name}</span>
                                  </div>
                                );
                              })}
                            </div>
                            {filteredBackgrounds.length === 0 && (
                              <div className="flex items-center justify-center py-8 text-white/40 text-sm">No backgrounds match your search.</div>
                            )}

                            {/* Inline Colors Section */}
                            <div className="mt-4 pt-3 border-t border-white/[0.06]">
                              <h4 className="text-[10px] text-white/40 uppercase tracking-wider font-medium mb-2">Colors</h4>
                              <div className="flex items-center gap-2 flex-wrap">
                                {[
                                  { key: "color1", label: "Base", value: settings.color1 },
                                  { key: "color2", label: "Surface", value: settings.color2 },
                                  ...(!settings.singleColorMode ? [
                                    { key: "color3", label: "Accent", value: settings.color3 },
                                    { key: "color4", label: "Highlight", value: settings.color4 },
                                  ] : []),
                                ].map(({ key, label, value }) => (
                                  <button
                                    key={key}
                                    onClick={() => handleColorPickerOpen(key)}
                                    className={cn(
                                      "flex items-center gap-1.5 px-2 py-1 rounded-lg transition-all",
                                      activeColorPicker === key
                                        ? "bg-white/10 ring-1 ring-white/20"
                                        : "hover:bg-white/5"
                                    )}
                                  >
                                    <span
                                      className={cn(
                                        "w-5 h-5 rounded-full border-2 transition-all flex-shrink-0",
                                        activeColorPicker === key ? "border-white scale-110" : "border-white/30"
                                      )}
                                      style={{ backgroundColor: value }}
                                    />
                                    <span className="text-[9px] text-white/50">{label}</span>
                                  </button>
                                ))}
                              </div>

                              {activeColorPicker && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  className="mt-2 flex items-start gap-3"
                                >
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
                                    style={{ width: 120, height: 90 }}
                                  />
                                  <input
                                    type="text"
                                    value={
                                      activeColorPicker === "color1" ? settings.color1 :
                                        activeColorPicker === "color2" ? settings.color2 :
                                          activeColorPicker === "color3" ? settings.color3 :
                                            settings.color4
                                    }
                                    onChange={(e) => {
                                      const hex = e.target.value;
                                      const val = hex.startsWith("#") ? hex : "#" + hex;
                                      if (activeColorPicker === "color1") updateSetting("color1", val);
                                      else if (activeColorPicker === "color2") updateSetting("color2", val);
                                      else if (activeColorPicker === "color3") updateSetting("color3", val);
                                      else updateSetting("color4", val);
                                    }}
                                    className="w-20 rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1 text-[10px] text-white/80 font-mono focus:outline-none focus:border-white/20"
                                    placeholder="#000000"
                                  />
                                </motion.div>
                              )}
                            </div>

                            {/* Layout section - moved from separate tab */}
                            <div className="mt-4 pt-3 border-t border-white/[0.06]">
                              <h4 className="text-[10px] text-white/40 uppercase tracking-wider font-medium mb-2">Layout</h4>
                              <div className="flex items-center gap-1 mb-2 overflow-x-auto [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: "none" }}>
                                {LAYOUT_CATEGORIES.map((cat, idx) => (
                                  <button
                                    key={cat.label}
                                    onClick={() => setActiveLayoutCategory(idx)}
                                    className={cn(
                                      "px-2 py-1 text-[10px] font-medium transition-all whitespace-nowrap flex-shrink-0 rounded-md",
                                      activeLayoutCategory === idx
                                        ? "text-white bg-white/10"
                                        : "text-white/40 hover:text-white/70 hover:bg-white/5"
                                    )}
                                  >
                                    {cat.label}
                                  </button>
                                ))}
                              </div>
                              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                {SHAPE_STYLES
                                  .filter((s) => LAYOUT_CATEGORIES[activeLayoutCategory].filter(s.id))
                                  .map((shape) => {
                                  const isActive = settings.gradientStyle === shape.id;
                                  const previewBg = shapePreviewMap.get(shape.id) || "";
                                  return (
                                    <div key={shape.id} className="flex flex-col gap-1">
                                      <button
                                        onClick={() => updateSetting("gradientStyle", shape.id)}
                                        className={cn(
                                          "group relative w-full rounded-lg overflow-hidden transition-all duration-300 focus:outline-none",
                                          isActive
                                            ? "ring-2 ring-white/40 shadow-lg shadow-white/5"
                                            : "hover:ring-1 hover:ring-white/20 hover:scale-[1.03]"
                                        )}
                                      >
                                        <div
                                          className="h-14 w-full relative"
                                          style={{
                                            background: previewBg,
                                            filter: "brightness(1.6) saturate(1.4)",
                                          }}
                                        >
                                          <div
                                            className="absolute inset-0 opacity-[0.06] pointer-events-none mix-blend-overlay"
                                            style={{ backgroundImage: NOISE_SVG_URI }}
                                          />
                                        </div>
                                      </button>
                                      <span className={cn(
                                        "text-[9px] font-medium truncate px-0.5 transition-all",
                                        isActive ? "text-white" : "text-white/40"
                                      )}>{shape.label}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {activeTab === "animated" && (
                        <motion.div
                          key="animated"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="h-full min-h-0 flex flex-col"
                        >
                          <AnimatedBackgroundsTab
                            settings={animatedBg}
                            onChange={handleAnimatedBgChange}
                          />
                        </motion.div>
                      )}


                      {activeTab === "style" && (
                        <motion.div
                          key="style"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="h-full min-h-0 flex flex-col"
                        >
                          <div className="flex-1 overflow-y-auto min-h-0 pr-1 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: "none" }}>
                            <div className="space-y-4">
                              {/* Gradient Controls */}
                              <div className="space-y-2">
                                <h4 className="text-[10px] text-white/40 uppercase tracking-wider font-medium">Gradient</h4>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] text-white/50 w-14">Type</span>
                                  <div className="flex gap-1">
                                    {(["linear", "radial", "conic"] as GradientType[]).map((t) => (
                                      <button key={t} onClick={() => updateSetting("gradientType", t)} className={cn("px-2 py-1 rounded text-[10px] font-medium capitalize transition-all", settings.gradientType === t ? "bg-white/15 text-white border border-white/20" : "bg-neutral-900 text-white/50 border border-white/10 hover:text-white/70")}>{t}</button>
                                    ))}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] text-white/50 w-14">Angle</span>
                                  <Slider value={[settings.gradientAngle]} onValueChange={([v]) => updateSetting("gradientAngle", v)} min={0} max={360} step={1} className="flex-1" />
                                  <span className="text-[10px] text-white/60 w-8 text-right">{settings.gradientAngle}°</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] text-white/50 w-14">Blend</span>
                                  <div className="flex gap-1 flex-wrap">
                                    {(["normal", "overlay", "soft-light", "multiply", "screen"] as BlendModeOption[]).map((m) => (
                                      <button key={m} onClick={() => updateSetting("blendMode", m)} className={cn("px-1.5 py-0.5 rounded text-[9px] font-medium capitalize transition-all", settings.blendMode === m ? "bg-white/15 text-white border border-white/20" : "bg-neutral-900 text-white/50 border border-white/10 hover:text-white/70")}>{m}</button>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              {/* Pattern Controls */}
                              <div className="space-y-2 border-t border-white/5 pt-3">
                                <h4 className="text-[10px] text-white/40 uppercase tracking-wider font-medium">Pattern</h4>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] text-white/50 w-14">Noise</span>
                                  <Slider value={[settings.noiseAmount]} onValueChange={([v]) => updateSetting("noiseAmount", v)} min={0} max={100} step={1} className="flex-1" />
                                  <span className="text-[10px] text-white/60 w-8 text-right">{settings.noiseAmount}%</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] text-white/50 w-14">Grain</span>
                                  <div className="flex gap-1">
                                    {(["fine", "medium", "coarse"] as GrainSize[]).map((s) => (
                                      <button key={s} onClick={() => updateSetting("grainSize", s)} className={cn("px-2 py-0.5 rounded text-[9px] font-medium capitalize transition-all", settings.grainSize === s ? "bg-white/15 text-white border border-white/20" : "bg-neutral-900 text-white/50 border border-white/10 hover:text-white/70")}>{s}</button>
                                    ))}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] text-white/50 w-14">Texture</span>
                                  <Slider value={[settings.textureOpacity]} onValueChange={([v]) => updateSetting("textureOpacity", v)} min={0} max={1} step={0.01} className="flex-1" />
                                  <span className="text-[10px] text-white/60 w-8 text-right">{(settings.textureOpacity * 100).toFixed(0)}%</span>
                                </div>
                              </div>

                              {/* Advanced Controls */}
                              <div className="space-y-2 border-t border-white/5 pt-3">
                                <h4 className="text-[10px] text-white/40 uppercase tracking-wider font-medium">Advanced</h4>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] text-white/50 w-14">Vignette</span>
                                  <Switch checked={(settings.vignette ?? 0) > 0} onCheckedChange={(checked) => updateSetting("vignette", checked ? 0.4 : 0)} />
                                  {(settings.vignette ?? 0) > 0 && (
                                    <>
                                      <Slider value={[settings.vignette ?? 0]} onValueChange={([v]) => updateSetting("vignette", v)} min={0} max={1} step={0.05} className="flex-1" />
                                      <span className="text-[10px] text-white/60 w-8 text-right">{((settings.vignette ?? 0) * 100).toFixed(0)}%</span>
                                    </>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] text-white/50 w-14">Soft Light</span>
                                  <Switch checked={settings.environmentEnabled} onCheckedChange={(v) => updateSetting("environmentEnabled", v)} />
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] text-white/50 w-14">Focus X</span>
                                  <Slider value={[settings.radialFocusX]} onValueChange={([v]) => updateSetting("radialFocusX", v)} min={0} max={100} step={1} className="flex-1" />
                                  <span className="text-[10px] text-white/60 w-8 text-right">{settings.radialFocusX}%</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] text-white/50 w-14">Focus Y</span>
                                  <Slider value={[settings.radialFocusY]} onValueChange={([v]) => updateSetting("radialFocusY", v)} min={0} max={100} step={1} className="flex-1" />
                                  <span className="text-[10px] text-white/60 w-8 text-right">{settings.radialFocusY}%</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] text-white/50 w-14">Exposure</span>
                                  <Slider value={[settings.exposure]} onValueChange={([v]) => updateSetting("exposure", v)} min={0.5} max={2} step={0.05} className="flex-1" />
                                  <span className="text-[10px] text-white/60 w-8 text-right">{settings.exposure.toFixed(2)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] text-white/50 w-14">Gamma</span>
                                  <Slider value={[settings.gamma]} onValueChange={([v]) => updateSetting("gamma", v)} min={0.5} max={2} step={0.05} className="flex-1" />
                                  <span className="text-[10px] text-white/60 w-8 text-right">{settings.gamma.toFixed(2)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {activeTab === "motion" && (
                        <motion.div
                          key="motion"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="h-full min-h-0 flex flex-col"
                        >
                          <h4 className="text-[10px] text-white/40 uppercase tracking-wider font-medium mb-3 flex-shrink-0">Motion & Effects</h4>
                          <div className="flex-1 overflow-y-auto min-h-0 pr-1 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: "none" }}>
                            <div className="space-y-3">
                              {/* Sliders Grid */}
                              <div className="grid grid-cols-2 gap-x-6 gap-y-2.5">
                                <div className="flex items-center gap-2">
                                  <Sun size={11} className="text-white/40 flex-shrink-0" />
                                  <span className="text-[10px] text-white/50 w-12">Bright</span>
                                  <Slider value={[settings.brightness]} onValueChange={([v]) => updateSetting("brightness", v)} min={0.4} max={2} step={0.02} className="flex-1" />
                                  <span className="text-[10px] text-white/50 w-8 text-right">{settings.brightness.toFixed(2)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] text-white/50 w-12 ml-4">Contrast</span>
                                  <Slider value={[settings.contrast ?? 1]} onValueChange={([v]) => updateSetting("contrast", v)} min={0.5} max={2} step={0.05} className="flex-1" />
                                  <span className="text-[10px] text-white/50 w-8 text-right">{(settings.contrast ?? 1).toFixed(2)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] text-white/50 w-12 ml-4">Saturate</span>
                                  <Slider value={[settings.saturation ?? 1]} onValueChange={([v]) => updateSetting("saturation", v)} min={0} max={2} step={0.05} className="flex-1" />
                                  <span className="text-[10px] text-white/50 w-8 text-right">{(settings.saturation ?? 1).toFixed(2)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] text-white/50 w-12 ml-4">Blur</span>
                                  <Slider value={[settings.blurPx ?? 0]} onValueChange={([v]) => updateSetting("blurPx", v)} min={0} max={20} step={1} className="flex-1" />
                                  <span className="text-[10px] text-white/50 w-8 text-right">{settings.blurPx ?? 0}px</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] text-white/50 w-12 ml-4">Vignette</span>
                                  <Slider value={[settings.vignette ?? 0]} onValueChange={([v]) => updateSetting("vignette", v)} min={0} max={1} step={0.05} className="flex-1" />
                                  <span className="text-[10px] text-white/50 w-8 text-right">{((settings.vignette ?? 0) * 100).toFixed(0)}%</span>
                                </div>
                                {settings.grainEnabled && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-white/50 w-12 ml-4">Grain</span>
                                    <Slider value={[settings.grainIntensity]} onValueChange={([v]) => updateSetting("grainIntensity", v)} min={0} max={0.8} step={0.02} className="flex-1" />
                                    <span className="text-[10px] text-white/50 w-8 text-right">{(settings.grainIntensity * 100).toFixed(0)}%</span>
                                  </div>
                                )}
                              </div>

                              {/* Toggles */}
                              <div className="flex items-center gap-2 pt-1">
                                <button onClick={() => updateSetting("environmentEnabled", !settings.environmentEnabled)} className={cn("flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-[10px] font-medium transition-all", settings.environmentEnabled ? "bg-white/10 border-white/15 text-white" : "bg-white/[0.03] border-white/[0.06] text-white/40 hover:text-white/60")}><Cloudy size={11} /> Ambient</button>
                                <button onClick={() => updateSetting("grainEnabled", !settings.grainEnabled)} className={cn("flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-[10px] font-medium transition-all", settings.grainEnabled ? "bg-white/10 border-white/15 text-white" : "bg-white/[0.03] border-white/[0.06] text-white/40 hover:text-white/60")}><Layers size={11} /> Grain</button>
                                <div className="w-px h-5 bg-white/[0.06]" />
                              </div>

                              {/* Quick Actions */}
                              <div className="flex items-center gap-1.5 pt-1">
                                <button onClick={() => { updateSetting("brightness", 1.0); updateSetting("contrast", 1); updateSetting("saturation", 1); updateSetting("blurPx", 0); updateSetting("vignette", 0); updateSetting("grainEnabled", false); updateSetting("environmentEnabled", false); }} className="px-2.5 py-1 rounded-md text-[10px] font-medium bg-white/[0.03] border border-white/[0.06] text-white/50 hover:text-white hover:bg-white/[0.06] transition-all">
                                  Reset All
                                </button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {activeTab === "components" && (
                        <motion.div
                          key="components"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="h-full min-h-0 flex flex-col overflow-y-auto [&::-webkit-scrollbar]:hidden"
                          style={{ scrollbarWidth: "none" }}
                        >
                          {(() => {
                            const bg = settings.buttonPrimaryBg;
                            const text = settings.buttonPrimaryText;
                            const gradient = settings.buttonPrimaryGradient;
                            const gradientColor = settings.buttonPrimaryGradientColor;
                            const radius = settings.buttonPrimaryRadius;
                            const px = settings.buttonPrimaryPaddingX;
                            const py = settings.buttonPrimaryPaddingY;

                            const getBackground = () => {
                              if (gradient === "none") return bg;
                              if (gradient === "linear") return `linear-gradient(135deg, ${bg}, ${gradientColor})`;
                              if (gradient === "radial") return `radial-gradient(circle, ${gradientColor}, ${bg})`;
                              if (gradient === "glossy") return `linear-gradient(180deg, ${gradientColor}40 0%, transparent 50%, ${bg}40 100%), ${bg}`;
                              return bg;
                            };
                            const getBoxShadow = () => gradient === "glow" ? `0 0 20px ${gradientColor}60` : undefined;

                            const SHAPE_PRESETS = [
                              { label: "Sharp", radius: 0, px: 20, py: 8 },
                              { label: "Rounded", radius: 8, px: 24, py: 10 },
                              { label: "Pill", radius: 999, px: 28, py: 10 },
                            ];

                            return (
                              <div className="flex flex-col items-center gap-6">
                                {/* Centered live button preview */}
                                <div className="flex items-center justify-center w-full py-6">
                                  <button
                                    className="text-sm font-medium transition-all"
                                    style={{
                                      background: getBackground(),
                                      color: text,
                                      borderRadius: `${radius}px`,
                                      padding: `${py}px ${px}px`,
                                      boxShadow: getBoxShadow(),
                                    }}
                                  >
                                    Button
                                  </button>
                                </div>

                                {/* Editing controls below */}
                                <div className="w-full space-y-5">
                                  {/* Shape */}
                                  <div>
                                    <span className="text-[9px] text-white/40 uppercase tracking-wider mb-2 block">Shape</span>
                                    <div className="flex items-center gap-2">
                                      {SHAPE_PRESETS.map((preset) => (
                                        <button
                                          key={preset.label}
                                          onClick={() => {
                                            updateSetting("buttonPrimaryRadius", preset.radius);
                                            updateSetting("buttonPrimaryPaddingX", preset.px);
                                            updateSetting("buttonPrimaryPaddingY", preset.py);
                                          }}
                                          className={cn(
                                            "flex-1 py-1.5 rounded text-[10px] font-medium transition-all",
                                            radius === preset.radius
                                              ? "bg-white/15 text-white"
                                              : "bg-white/[0.04] text-white/40 hover:text-white/60"
                                          )}
                                        >
                                          {preset.label}
                                        </button>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Style */}
                                  <div>
                                    <span className="text-[9px] text-white/40 uppercase tracking-wider mb-2 block">Style</span>
                                    <div className="flex items-center gap-1.5">
                                      {(["none", "linear", "glossy", "glow"] as const).map((g) => (
                                        <button
                                          key={g}
                                          onClick={() => updateSetting("buttonPrimaryGradient", g)}
                                          className={cn(
                                            "flex-1 py-1.5 rounded text-[10px] font-medium transition-all capitalize",
                                            gradient === g ? "bg-white/20 text-white" : "bg-white/[0.04] text-white/40 hover:text-white/60"
                                          )}
                                        >{g}</button>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Colors */}
                                  <div>
                                    <span className="text-[9px] text-white/40 uppercase tracking-wider mb-2 block">Colors</span>
                                    <div className="flex items-center gap-4">
                                      <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="color" value={bg} onChange={(e) => updateSetting("buttonPrimaryBg", e.target.value)} className="w-6 h-6 rounded-md cursor-pointer border border-white/10" />
                                        <span className="text-[10px] text-white/50">Fill</span>
                                      </label>
                                      <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="color" value={text} onChange={(e) => updateSetting("buttonPrimaryText", e.target.value)} className="w-6 h-6 rounded-md cursor-pointer border border-white/10" />
                                        <span className="text-[10px] text-white/50">Text</span>
                                      </label>
                                      {gradient !== "none" && (
                                        <label className="flex items-center gap-2 cursor-pointer">
                                          <input type="color" value={gradientColor} onChange={(e) => updateSetting("buttonPrimaryGradientColor", e.target.value)} className="w-6 h-6 rounded-md cursor-pointer border border-white/10" />
                                          <span className="text-[10px] text-white/50">Gradient</span>
                                        </label>
                                      )}
                                    </div>
                                  </div>

                                  {/* Size */}
                                  <div>
                                    <span className="text-[9px] text-white/40 uppercase tracking-wider mb-2 block">Size</span>
                                    <div className="space-y-2">
                                      <div className="flex items-center gap-3">
                                        <span className="text-[10px] text-white/40 w-5">H</span>
                                        <input type="range" min={4} max={20} value={py} onChange={(e) => updateSetting("buttonPrimaryPaddingY", Number(e.target.value))} className="flex-1 accent-white/60 h-1" />
                                        <span className="text-[10px] text-white/40 w-5 text-right">{py}</span>
                                      </div>
                                      <div className="flex items-center gap-3">
                                        <span className="text-[10px] text-white/40 w-5">W</span>
                                        <input type="range" min={12} max={48} value={px} onChange={(e) => updateSetting("buttonPrimaryPaddingX", Number(e.target.value))} className="flex-1 accent-white/60 h-1" />
                                        <span className="text-[10px] text-white/40 w-5 text-right">{px}</span>
                                      </div>
                                      <div className="flex items-center gap-3">
                                        <span className="text-[10px] text-white/40 w-5">R</span>
                                        <input type="range" min={0} max={50} value={Math.min(radius, 50)} onChange={(e) => updateSetting("buttonPrimaryRadius", Number(e.target.value))} className="flex-1 accent-white/60 h-1" />
                                        <span className="text-[10px] text-white/40 w-5 text-right">{Math.min(radius, 50)}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })()}
                        </motion.div>
                      )}

                      {activeTab === "export" && (
                        <motion.div
                          key="export"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="h-full min-h-0 flex flex-col"
                        >
                          <h4 className="text-[10px] text-white/40 uppercase tracking-wider font-medium mb-2 flex-shrink-0">Export</h4>
                          <div className="flex items-center gap-2 flex-wrap">
                            <button onClick={handleCopyProjectCode} className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-[10px] font-medium transition-all ${copiedProjectCode ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-neutral-900 border-white/10 text-white/70 hover:bg-neutral-800 hover:border-white/20"}`}>{copiedProjectCode ? <Check size={12} /> : <Code size={12} />}{copiedProjectCode ? "Copied!" : "React Component"}</button>
                            <button onClick={handleCopyCode} className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-[10px] font-medium transition-all ${copiedCode ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-neutral-900 border-white/10 text-white/70 hover:bg-neutral-800 hover:border-white/20"}`}>{copiedCode ? <Check size={12} /> : <Code size={12} />}{copiedCode ? "Copied!" : "Full React"}</button>
                            <button onClick={handleCopyCss} className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-[10px] font-medium transition-all ${copiedCss ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-neutral-900 border-white/10 text-white/70 hover:bg-neutral-800 hover:border-white/20"}`}>{copiedCss ? <Check size={12} /> : <Code size={12} />}{copiedCss ? "Copied!" : "CSS"}</button>
                            <button onClick={handleCopyTailwind} className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-[10px] font-medium transition-all ${copiedTailwind ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-neutral-900 border-white/10 text-white/70 hover:bg-neutral-800 hover:border-white/20"}`}>{copiedTailwind ? <Check size={12} /> : <Code size={12} />}{copiedTailwind ? "Copied!" : "Tailwind"}</button>
                            <button onClick={handleCopyJSON} className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-[10px] font-medium transition-all ${copiedJSON ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-neutral-900 border-white/10 text-white/70 hover:bg-neutral-800 hover:border-white/20"}`}>{copiedJSON ? <Check size={12} /> : <FileJson size={12} />}{copiedJSON ? "Copied!" : "JSON"}</button>
                            <div className="w-px h-5 bg-white/10" />
                            <button onClick={handleDownloadImage} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-[10px] font-medium bg-neutral-900 border-white/10 text-white/70 hover:bg-neutral-800 hover:border-white/20 transition-all"><Download size={12} /> PNG {downloadScale > 1 ? `${Math.round(1920*downloadScale)}×${Math.round(1080*downloadScale)}` : '1920×1080'}</button>
                            <select value={downloadScale} onChange={(e) => setDownloadScale(parseFloat(e.target.value))} className="px-2 py-1.5 rounded-lg border text-[10px] bg-neutral-900 border-white/10 text-white/70 focus:outline-none">
                              <option value={1}>1x</option>
                              <option value={2}>2x (4K)</option>
                              <option value={3}>3x</option>
                            </select>
                            <div className="w-px h-5 bg-white/10" />
                            <button
                              onClick={() => {
                                const colors = { color1: settings.color1, color2: settings.color2, color3: settings.color3, color4: settings.color4 };
                                setColorPromptPayload({
                                  colors,
                                  gradientStyle: settings.gradientStyle,
                                  brightness: settings.brightness,
                                  grainEnabled: settings.grainEnabled,
                                  summary: buildColorSummary(colors, settings.gradientStyle),
                                  timestamp: Date.now(),
                                });
                                toast.success("Colors sent to Prompt Generator");
                                navigate("/flow/prompt-generator");
                              }}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[10px] font-medium bg-purple-500/15 border-purple-500/30 text-purple-300 hover:bg-purple-500/25 hover:border-purple-500/40 transition-all"
                            >
                              <Sparkles size={12} />
                              Generate Color Prompt
                            </button>
                          </div>
                          <p className="text-[9px] text-white/40 mt-1.5">Style: {settings.gradientStyle} · Brightness: {settings.brightness.toFixed(2)} · Grain: {settings.grainEnabled ? "On" : "Off"}</p>
                        </motion.div>
                      )}

                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>



      </div>
    </>
  );
};

export default HeroBackgroundWorkspace;
