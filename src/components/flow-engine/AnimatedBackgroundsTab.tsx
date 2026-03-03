import React, { useState, useCallback, memo } from "react";
import { MeshGradient, NeuroNoise, GodRays, SmokeRing, GrainGradient, Swirl } from "@paper-design/shaders-react";
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

// ── CSS gradient fallback for preset thumbnails ──
// Each shader type gets a distinctive visual pattern that hints at the actual animation

function buildPresetGradientCSS(preset: AnimatedPreset): string {
  const c = preset.colors;
  switch (preset.shaderType) {
    case "mesh-gradient":
      return `
        radial-gradient(ellipse 70% 60% at 25% 40%, ${c[2] || c[0]}bb 0%, transparent 55%),
        radial-gradient(ellipse 60% 70% at 75% 30%, ${c[3] || c[1]}99 0%, transparent 50%),
        radial-gradient(ellipse 50% 50% at 50% 70%, ${c[1]}77 0%, transparent 45%),
        linear-gradient(135deg, ${c[0]} 0%, ${c[1]}dd 100%)
      `;
    case "neuro-noise":
      return `
        repeating-radial-gradient(circle at 50% 50%, transparent 0, transparent 8px, ${c[0]}30 9px, transparent 10px),
        radial-gradient(ellipse at 40% 40%, ${c[0]}cc 0%, ${c[1]}88 40%, ${c[2]} 100%)
      `;
    case "god-rays":
      return `
        conic-gradient(from 200deg at 50% 110%, ${c[0]}ee 0deg, transparent 30deg, ${c[1]}aa 60deg, transparent 90deg, ${c[2]}88 120deg, transparent 150deg, ${c[0]}66 180deg, transparent 360deg),
        radial-gradient(ellipse 120% 80% at 50% 100%, ${c[0]}99 0%, #000 70%)
      `;
    case "smoke-ring":
      return `
        radial-gradient(circle at 50% 50%, transparent 15%, ${c[0]}55 25%, transparent 35%),
        radial-gradient(circle at 50% 50%, transparent 35%, ${c[1]}44 45%, transparent 55%),
        radial-gradient(circle at 50% 50%, ${c[0]}33 0%, ${c[1]}22 40%, ${c[c.length - 1]} 100%)
      `;
    case "grain-gradient":
      return `
        radial-gradient(ellipse at 30% 30%, ${c[0]}aa 0%, transparent 50%),
        radial-gradient(ellipse at 70% 70%, ${c[1]}88 0%, transparent 50%),
        linear-gradient(160deg, ${c[2] || c[0]}66 0%, #000 100%)
      `;
    case "swirl":
      return `
        conic-gradient(from 0deg at 50% 50%, ${c[0]}dd, ${c[1]}bb, ${c[2] || c[0]}99, ${c[3] || c[1]}bb, ${c[0]}dd),
        radial-gradient(circle at 50% 50%, transparent 30%, #00000080 100%)
      `;
    default:
      return `linear-gradient(135deg, ${c[0] || '#111'} 0%, ${c[1] || '#333'} 100%)`;
  }
}

// ── Mini Preview for preset thumbnails ──

const PresetThumbnail = memo(({ preset }: { preset: AnimatedPreset }) => {
  return (
    <div className="w-full h-full relative overflow-hidden">
      <div
        className="absolute inset-0"
        style={{ background: buildPresetGradientCSS(preset) }}
      />
      {/* Subtle noise overlay for texture */}
      <div
        className="absolute inset-0 opacity-[0.12] mix-blend-overlay pointer-events-none"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }}
      />
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
