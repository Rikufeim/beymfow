import React, { useState, useCallback, memo } from "react";
import { MeshGradient, NeuroNoise, GodRays, SmokeRing, GrainGradient, Swirl } from "@paper-design/shaders-react";
import { motion } from "framer-motion";
import { HexColorPicker } from "react-colorful";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";

// ── Shader types ──

export type AnimatedShaderType = "mesh-gradient" | "neuro-noise" | "god-rays" | "smoke-ring" | "grain-gradient" | "swirl";

export interface AnimatedBgSettings {
  enabled: boolean;
  shaderType: AnimatedShaderType;
  presetId: string;
  colors: string[];
  speed: number;
  // Shader-specific
  distortion: number;
  swirl: number;
  brightness: number;
  contrast: number;
  intensity: number;
  density: number;
  noiseScale: number;
  softness: number;
  grainOverlay: number;
}

export const DEFAULT_ANIMATED_BG: AnimatedBgSettings = {
  enabled: false,
  shaderType: "mesh-gradient",
  presetId: "mesh-midnight",
  colors: ["#000000", "#1a1a2e", "#6366f1", "#8b5cf6"],
  speed: 0.3,
  distortion: 0.8,
  swirl: 0.1,
  brightness: 0.5,
  contrast: 0.5,
  intensity: 0.5,
  density: 0.5,
  noiseScale: 1,
  softness: 0.5,
  grainOverlay: 0,
};

// ── Presets ──

interface AnimatedPreset {
  id: string;
  name: string;
  shaderType: AnimatedShaderType;
  colors: string[];
  params: Partial<AnimatedBgSettings>;
}

const ANIMATED_PRESETS: AnimatedPreset[] = [
  // Mesh Gradient
  { id: "mesh-midnight", name: "Midnight", shaderType: "mesh-gradient", colors: ["#000000", "#1a1a2e", "#6366f1", "#8b5cf6"], params: { distortion: 0.8, swirl: 0.1, speed: 0.3 } },
  { id: "mesh-aurora", name: "Aurora", shaderType: "mesh-gradient", colors: ["#0a0a0a", "#064e3b", "#22d3ee", "#a78bfa"], params: { distortion: 0.6, swirl: 0.2, speed: 0.25 } },
  { id: "mesh-ember", name: "Ember", shaderType: "mesh-gradient", colors: ["#1a0000", "#7f1d1d", "#f97316", "#fbbf24"], params: { distortion: 0.7, swirl: 0.15, speed: 0.2 } },
  { id: "mesh-ocean", name: "Ocean", shaderType: "mesh-gradient", colors: ["#0c1222", "#1e3a5f", "#0ea5e9", "#67e8f9"], params: { distortion: 0.9, swirl: 0.05, speed: 0.35 } },
  // Neuro Noise
  { id: "neuro-cyber", name: "Cyber Net", shaderType: "neuro-noise", colors: ["#22d3ee", "#6366f1", "#000000"], params: { brightness: 0.5, contrast: 0.5, speed: 0.3 } },
  { id: "neuro-blood", name: "Bloodstream", shaderType: "neuro-noise", colors: ["#ef4444", "#7f1d1d", "#0a0a0a"], params: { brightness: 0.6, contrast: 0.6, speed: 0.4 } },
  { id: "neuro-ghost", name: "Ghost", shaderType: "neuro-noise", colors: ["#e2e8f0", "#94a3b8", "#0f172a"], params: { brightness: 0.4, contrast: 0.3, speed: 0.15 } },
  // God Rays
  { id: "rays-lightning", name: "Lightning", shaderType: "god-rays", colors: ["#e0e7ff", "#a5b4fc", "#ffffff"], params: { intensity: 0.9, density: 0.8, speed: 0.6 } },
  { id: "rays-solar", name: "Solar Flare", shaderType: "god-rays", colors: ["#fbbf24", "#f97316", "#dc2626"], params: { intensity: 0.6, density: 0.5, speed: 0.2 } },
  { id: "rays-cosmic", name: "Cosmic", shaderType: "god-rays", colors: ["#8b5cf6", "#6366f1", "#3b82f6"], params: { intensity: 0.5, density: 0.4, speed: 0.15 } },
  // Smoke Ring
  { id: "smoke-nebula", name: "Nebula", shaderType: "smoke-ring", colors: ["#8b5cf6", "#ec4899", "#06b6d4", "#000000"], params: { noiseScale: 1.5, speed: 0.2 } },
  { id: "smoke-void", name: "Void", shaderType: "smoke-ring", colors: ["#1e293b", "#6366f1", "#000000", "#0f172a"], params: { noiseScale: 2, speed: 0.1 } },
  // Grain Gradient
  { id: "grain-wave", name: "Grain Wave", shaderType: "grain-gradient", colors: ["#6366f1", "#8b5cf6", "#ec4899"], params: { softness: 0.6, intensity: 0.4, speed: 0.3 } },
  { id: "grain-sphere", name: "Grain Sphere", shaderType: "grain-gradient", colors: ["#22d3ee", "#3b82f6", "#1e293b"], params: { softness: 0.5, intensity: 0.5, speed: 0.2 } },
  // Swirl
  { id: "swirl-vortex", name: "Vortex", shaderType: "swirl", colors: ["#8b5cf6", "#6366f1", "#1e1b4b", "#000000"], params: { speed: 0.25 } },
  { id: "swirl-candy", name: "Candy", shaderType: "swirl", colors: ["#f472b6", "#c084fc", "#38bdf8", "#fbbf24"], params: { speed: 0.3 } },
];

const SHADER_CATEGORIES = [
  { label: "All", filter: () => true },
  { label: "Mesh", filter: (p: AnimatedPreset) => p.shaderType === "mesh-gradient" },
  { label: "Neuro", filter: (p: AnimatedPreset) => p.shaderType === "neuro-noise" },
  { label: "Rays", filter: (p: AnimatedPreset) => p.shaderType === "god-rays" },
  { label: "Smoke", filter: (p: AnimatedPreset) => p.shaderType === "smoke-ring" },
  { label: "Grain", filter: (p: AnimatedPreset) => p.shaderType === "grain-gradient" },
  { label: "Swirl", filter: (p: AnimatedPreset) => p.shaderType === "swirl" },
];

// ── CSS gradient thumbnails – each shader type gets a unique, representative visual ──

function buildPresetGradientCSS(preset: AnimatedPreset): { background: string; extra?: React.CSSProperties } {
  const c = preset.colors;
  const c0 = c[0] || "#111";
  const c1 = c[1] || "#333";
  const c2 = c[2] || c0;
  const c3 = c[3] || c1;

  switch (preset.shaderType) {
    case "mesh-gradient":
      return {
        background: `
          radial-gradient(ellipse 80% 70% at 20% 30%, ${c2}cc 0%, transparent 60%),
          radial-gradient(ellipse 60% 80% at 80% 25%, ${c3}aa 0%, transparent 55%),
          radial-gradient(ellipse 70% 60% at 60% 80%, ${c1}88 0%, transparent 50%),
          radial-gradient(ellipse 50% 50% at 35% 60%, ${c0}66 0%, transparent 45%),
          linear-gradient(160deg, ${c0} 0%, ${c1} 100%)
        `,
        extra: { filter: "blur(2px) saturate(1.3)" },
      };

    case "neuro-noise":
      return {
        background: `
          repeating-radial-gradient(circle at 30% 40%, ${c0}44 0px, transparent 4px, transparent 8px),
          repeating-radial-gradient(circle at 70% 60%, ${c1}33 0px, transparent 3px, transparent 7px),
          repeating-radial-gradient(circle at 50% 50%, ${c0}22 0px, transparent 5px, transparent 12px),
          radial-gradient(ellipse at 40% 35%, ${c0}dd 0%, transparent 60%),
          radial-gradient(ellipse at 65% 65%, ${c1}aa 0%, transparent 50%),
          ${c2}
        `,
        extra: { filter: "contrast(1.2) saturate(1.1)" },
      };

    case "god-rays":
      return {
        background: `
          conic-gradient(from 180deg at 50% 100%, 
            ${c0}ee 0deg, transparent 18deg,
            ${c1}cc 30deg, transparent 48deg,
            ${c2}aa 60deg, transparent 78deg,
            ${c0}88 90deg, transparent 108deg,
            ${c1}66 120deg, transparent 138deg,
            ${c2}44 150deg, transparent 168deg,
            transparent 180deg,
            transparent 360deg
          ),
          radial-gradient(ellipse 100% 60% at 50% 100%, ${c0}88 0%, transparent 70%),
          linear-gradient(0deg, ${c0}44 0%, #000 100%)
        `,
        extra: { filter: "blur(1px) brightness(1.2)" },
      };

    case "smoke-ring":
      return {
        background: `
          radial-gradient(circle at 50% 50%, transparent 10%, ${c0}66 18%, transparent 26%),
          radial-gradient(circle at 50% 50%, transparent 28%, ${c1}44 36%, transparent 44%),
          radial-gradient(circle at 48% 52%, transparent 44%, ${c0}22 52%, transparent 60%),
          radial-gradient(circle at 50% 50%, ${c0}44 0%, ${c1}33 30%, ${c3} 100%)
        `,
        extra: { filter: "blur(2px) saturate(1.4)" },
      };

    case "grain-gradient":
      return {
        background: `
          radial-gradient(ellipse 60% 50% at 25% 30%, ${c0}bb 0%, transparent 60%),
          radial-gradient(ellipse 50% 60% at 75% 70%, ${c1}99 0%, transparent 55%),
          radial-gradient(ellipse 80% 40% at 50% 50%, ${c2}55 0%, transparent 50%),
          linear-gradient(180deg, #0a0a0a 0%, ${c2}33 100%)
        `,
        extra: { filter: "contrast(1.1) saturate(1.2)" },
      };

    case "swirl":
      return {
        background: `
          conic-gradient(from 0deg at 50% 50%, 
            ${c0}ee, ${c1}cc, ${c2}aa, ${c3}cc, ${c0}ee
          ),
          radial-gradient(circle at 50% 50%, transparent 20%, #00000088 80%)
        `,
        extra: { filter: "blur(3px) saturate(1.5) brightness(1.1)" },
      };

    default:
      return { background: `linear-gradient(135deg, ${c0} 0%, ${c1} 100%)` };
  }
}

// ── Mini Preview for preset thumbnails ──

const PresetThumbnail = memo(({ preset }: { preset: AnimatedPreset }) => {
  // Build full settings exactly as applyPreset would, so preview matches 1:1
  const s: AnimatedBgSettings = {
    ...DEFAULT_ANIMATED_BG,
    enabled: true,
    shaderType: preset.shaderType,
    presetId: preset.id,
    colors: [...preset.colors],
    ...preset.params,
  };
  const style: React.CSSProperties = { width: "100%", height: "100%", position: "absolute", inset: 0 };

  const renderShader = () => {
    switch (s.shaderType) {
      case "mesh-gradient":
        return <MeshGradient style={style} colors={s.colors} distortion={s.distortion} swirl={s.swirl} speed={s.speed} grainOverlay={s.grainOverlay} />;
      case "neuro-noise":
        return <NeuroNoise style={style} colorFront={s.colors[0] || "#22d3ee"} colorMid={s.colors[1] || "#6366f1"} colorBack={s.colors[2] || "#000000"} brightness={s.brightness} contrast={s.contrast} speed={s.speed} />;
      case "god-rays":
        return <GodRays style={style} colorBack="#000000" colorBloom={s.colors[0] || "#fbbf24"} colors={s.colors} intensity={s.intensity} density={s.density} speed={s.speed} />;
      case "smoke-ring":
        return <SmokeRing style={style} colorBack={s.colors[s.colors.length - 1] || "#000000"} colors={s.colors.slice(0, -1)} noiseScale={s.noiseScale} speed={s.speed} />;
      case "grain-gradient":
        return <GrainGradient style={style} colorBack="#000000" colors={s.colors} softness={s.softness} intensity={s.intensity} noise={s.grainOverlay} speed={s.speed} />;
      case "swirl":
        return <Swirl style={style} colors={s.colors} speed={s.speed} />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full h-full relative overflow-hidden">
      {renderShader()}
    </div>
  );
});
PresetThumbnail.displayName = "PresetThumbnail";

// ── Full Preview (rendered in the main canvas) ──

export const AnimatedBgPreview = memo(({ settings }: { settings: AnimatedBgSettings }) => {
  if (!settings.enabled) return null;
  const style: React.CSSProperties = { width: "100%", height: "100%" };

  switch (settings.shaderType) {
    case "mesh-gradient":
      return <MeshGradient style={style} colors={settings.colors} distortion={settings.distortion} swirl={settings.swirl} speed={settings.speed} grainOverlay={settings.grainOverlay} />;
    case "neuro-noise":
      return <NeuroNoise style={style} colorFront={settings.colors[0] || "#22d3ee"} colorMid={settings.colors[1] || "#6366f1"} colorBack={settings.colors[2] || "#000000"} brightness={settings.brightness} contrast={settings.contrast} speed={settings.speed} />;
    case "god-rays":
      return <GodRays style={style} colorBack="#000000" colorBloom={settings.colors[0] || "#fbbf24"} colors={settings.colors} intensity={settings.intensity} density={settings.density} speed={settings.speed} />;
    case "smoke-ring":
      return <SmokeRing style={style} colorBack={settings.colors[settings.colors.length - 1] || "#000000"} colors={settings.colors.slice(0, -1)} noiseScale={settings.noiseScale} speed={settings.speed} />;
    case "grain-gradient":
      return <GrainGradient style={style} colorBack="#000000" colors={settings.colors} softness={settings.softness} intensity={settings.intensity} noise={settings.grainOverlay} speed={settings.speed} />;
    case "swirl":
      return <Swirl style={style} colors={settings.colors} speed={settings.speed} />;
    default:
      return null;
  }
});
AnimatedBgPreview.displayName = "AnimatedBgPreview";

// ── Tab Content Component ──

interface AnimatedBackgroundsTabProps {
  settings: AnimatedBgSettings;
  onChange: (settings: AnimatedBgSettings) => void;
}

const COLOR_LABELS: Record<AnimatedShaderType, string[]> = {
  "mesh-gradient": ["Color 1", "Color 2", "Color 3", "Color 4"],
  "neuro-noise": ["Front", "Mid", "Back"],
  "god-rays": ["Ray 1", "Ray 2", "Ray 3"],
  "smoke-ring": ["Color 1", "Color 2", "Color 3", "Background"],
  "grain-gradient": ["Color 1", "Color 2", "Color 3"],
  "swirl": ["Color 1", "Color 2", "Color 3", "Color 4"],
};

export default function AnimatedBackgroundsTab({ settings, onChange }: AnimatedBackgroundsTabProps) {
  const [activeCategory, setActiveCategory] = useState(0);
  const [editingColorIdx, setEditingColorIdx] = useState<number | null>(null);

  const filteredPresets = ANIMATED_PRESETS.filter(SHADER_CATEGORIES[activeCategory].filter);

  const applyPreset = useCallback((preset: AnimatedPreset) => {
    onChange({
      ...settings,
      enabled: true,
      shaderType: preset.shaderType,
      presetId: preset.id,
      colors: [...preset.colors],
      ...preset.params,
    });
    setEditingColorIdx(null);
  }, [onChange, settings]);

  const updateColor = useCallback((index: number, color: string) => {
    const newColors = [...settings.colors];
    newColors[index] = color;
    onChange({ ...settings, colors: newColors });
  }, [onChange, settings]);

  const updateParam = useCallback((key: keyof AnimatedBgSettings, value: number) => {
    onChange({ ...settings, [key]: value });
  }, [onChange, settings]);

  const colorLabels = COLOR_LABELS[settings.shaderType] || ["Color 1", "Color 2", "Color 3", "Color 4"];

  return (
    <div className="h-full min-h-0 flex flex-col gap-3">
      {/* Category filter */}
      <div className="flex items-center gap-0.5 flex-shrink-0 overflow-x-auto [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: "none" }}>
        {SHADER_CATEGORIES.map((cat, idx) => (
          <button
            key={cat.label}
            onClick={() => setActiveCategory(idx)}
            className={cn(
              "px-2 sm:px-2.5 py-1 sm:py-1.5 text-[10px] sm:text-[11px] font-medium transition-all whitespace-nowrap flex-shrink-0 rounded-md",
              activeCategory === idx
                ? "text-white bg-white/10"
                : "text-white/40 hover:text-white/70 hover:bg-white/5"
            )}
          >
            {cat.label}
          </button>
        ))}

        {/* Disable button */}
        {settings.enabled && (
          <button
            onClick={() => onChange({ ...settings, enabled: false })}
            className="ml-auto px-2.5 py-1.5 text-[10px] font-medium text-red-400/70 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-all whitespace-nowrap flex-shrink-0"
          >
            Disable
          </button>
        )}
      </div>

      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto min-h-0 pr-1 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: "none" }}>
        {/* Preset grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 mb-4">
          {filteredPresets.map((preset) => {
            const isActive = settings.enabled && settings.presetId === preset.id;
            return (
              <div key={preset.id} className="flex flex-col gap-1.5">
                <button
                  onClick={() => {
                    if (isActive) {
                      onChange({ ...DEFAULT_ANIMATED_BG });
                    } else {
                      applyPreset(preset);
                    }
                  }}
                  className={cn(
                    "group relative w-full rounded-xl overflow-hidden transition-all duration-300 ease-out focus:outline-none select-none",
                    isActive
                      ? "ring-2 ring-white/40 shadow-lg shadow-white/5"
                      : "hover:ring-1 hover:ring-white/20 hover:shadow-md hover:shadow-white/5 hover:scale-[1.03]"
                  )}
                >
                  <div className="h-24 w-full shrink-0 relative overflow-hidden rounded-xl">
                    <PresetThumbnail preset={preset} />
                  </div>
                  <div className="absolute inset-0 rounded-xl border border-white/0 group-hover:border-white/15 transition-all duration-300 pointer-events-none" />
                </button>
                <span className={cn(
                  "text-[10px] font-medium block truncate transition-all duration-300 px-0.5",
                  isActive ? "text-white" : "text-white/50"
                )}>{preset.name}</span>
              </div>
            );
          })}
        </div>

        {/* Controls - only show when a preset is active */}
        {settings.enabled && (
          <div className="space-y-4 border-t border-white/5 pt-4">
            {/* Color swatches */}
            <div className="space-y-2">
              <h4 className="text-[10px] text-white/40 uppercase tracking-wider font-medium">Colors</h4>
              <div className="flex items-center gap-2 flex-wrap">
                {settings.colors.map((color, idx) => (
                  <button
                    key={idx}
                    onClick={() => setEditingColorIdx(editingColorIdx === idx ? null : idx)}
                    className={cn(
                      "w-7 h-7 rounded-full border-2 transition-all duration-200",
                      editingColorIdx === idx
                        ? "border-white ring-2 ring-white/30 scale-110"
                        : "border-white/30 hover:border-white/60"
                    )}
                    style={{ backgroundColor: color }}
                    title={colorLabels[idx] || `Color ${idx + 1}`}
                  />
                ))}
              </div>

              {editingColorIdx !== null && editingColorIdx < settings.colors.length && (
                <div className="flex items-center gap-3 pt-2">
                  <span className="text-[10px] text-white/50 w-12 whitespace-nowrap">
                    {colorLabels[editingColorIdx] || `Color ${editingColorIdx + 1}`}
                  </span>
                  <div className="flex-1">
                    <HexColorPicker
                      color={settings.colors[editingColorIdx]}
                      onChange={(c) => updateColor(editingColorIdx, c)}
                      style={{ width: "100%", height: 80 }}
                    />
                  </div>
                  <div
                    className="w-10 h-10 rounded-lg border border-white/20"
                    style={{ backgroundColor: settings.colors[editingColorIdx], transition: "background-color 0.3s" }}
                  />
                </div>
              )}
            </div>

            {/* Speed */}
            <div className="space-y-2">
              <h4 className="text-[10px] text-white/40 uppercase tracking-wider font-medium">Animation</h4>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-white/50 w-14">Speed</span>
                <Slider value={[settings.speed]} onValueChange={([v]) => updateParam("speed", v)} min={0.01} max={1} step={0.01} className="flex-1" />
                <span className="text-[10px] text-white/60 w-8 text-right">{(settings.speed * 100).toFixed(0)}%</span>
              </div>
            </div>

            {/* Shader-specific controls */}
            {settings.shaderType === "mesh-gradient" && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-white/50 w-14">Distortion</span>
                  <Slider value={[settings.distortion]} onValueChange={([v]) => updateParam("distortion", v)} min={0} max={1} step={0.01} className="flex-1" />
                  <span className="text-[10px] text-white/60 w-8 text-right">{(settings.distortion * 100).toFixed(0)}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-white/50 w-14">Swirl</span>
                  <Slider value={[settings.swirl]} onValueChange={([v]) => updateParam("swirl", v)} min={0} max={1} step={0.01} className="flex-1" />
                  <span className="text-[10px] text-white/60 w-8 text-right">{(settings.swirl * 100).toFixed(0)}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-white/50 w-14">Grain</span>
                  <Slider value={[settings.grainOverlay]} onValueChange={([v]) => updateParam("grainOverlay", v)} min={0} max={1} step={0.01} className="flex-1" />
                  <span className="text-[10px] text-white/60 w-8 text-right">{(settings.grainOverlay * 100).toFixed(0)}%</span>
                </div>
              </div>
            )}

            {settings.shaderType === "neuro-noise" && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-white/50 w-14">Brightness</span>
                  <Slider value={[settings.brightness]} onValueChange={([v]) => updateParam("brightness", v)} min={0} max={1} step={0.01} className="flex-1" />
                  <span className="text-[10px] text-white/60 w-8 text-right">{(settings.brightness * 100).toFixed(0)}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-white/50 w-14">Contrast</span>
                  <Slider value={[settings.contrast]} onValueChange={([v]) => updateParam("contrast", v)} min={0} max={1} step={0.01} className="flex-1" />
                  <span className="text-[10px] text-white/60 w-8 text-right">{(settings.contrast * 100).toFixed(0)}%</span>
                </div>
              </div>
            )}

            {settings.shaderType === "god-rays" && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-white/50 w-14">Intensity</span>
                  <Slider value={[settings.intensity]} onValueChange={([v]) => updateParam("intensity", v)} min={0} max={1} step={0.01} className="flex-1" />
                  <span className="text-[10px] text-white/60 w-8 text-right">{(settings.intensity * 100).toFixed(0)}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-white/50 w-14">Density</span>
                  <Slider value={[settings.density]} onValueChange={([v]) => updateParam("density", v)} min={0} max={1} step={0.01} className="flex-1" />
                  <span className="text-[10px] text-white/60 w-8 text-right">{(settings.density * 100).toFixed(0)}%</span>
                </div>
              </div>
            )}

            {settings.shaderType === "smoke-ring" && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-white/50 w-14">Scale</span>
                  <Slider value={[settings.noiseScale]} onValueChange={([v]) => updateParam("noiseScale", v)} min={0.1} max={5} step={0.1} className="flex-1" />
                  <span className="text-[10px] text-white/60 w-8 text-right">{settings.noiseScale.toFixed(1)}</span>
                </div>
              </div>
            )}

            {settings.shaderType === "grain-gradient" && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-white/50 w-14">Softness</span>
                  <Slider value={[settings.softness]} onValueChange={([v]) => updateParam("softness", v)} min={0} max={1} step={0.01} className="flex-1" />
                  <span className="text-[10px] text-white/60 w-8 text-right">{(settings.softness * 100).toFixed(0)}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-white/50 w-14">Intensity</span>
                  <Slider value={[settings.intensity]} onValueChange={([v]) => updateParam("intensity", v)} min={0} max={1} step={0.01} className="flex-1" />
                  <span className="text-[10px] text-white/60 w-8 text-right">{(settings.intensity * 100).toFixed(0)}%</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
