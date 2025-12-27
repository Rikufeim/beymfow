import React, { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Maximize2, Minimize2, Eye, EyeOff, Sparkles, Sun, Cloudy, Layers, Circle, Triangle, Wind, Save, Check, ChevronUp, ChevronDown, Copy, Code, FileJson, Download, Image } from "lucide-react";
import ColorPickerField from "@/components/flow-nodes/ColorPickerField";
import { cn } from "@/lib/utils";
import { HeroExportPanel } from "./HeroExportPanel";
import { 
  saveProject, 
  saveDraft, 
  generateThumbnail, 
  generateProjectName,
  type HeroBackgroundProject 
} from "@/lib/heroProjectStore";
import { toast } from "sonner";

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
  gradientStyle: "halo" | "soft-sweep" | "orb" | "diagonal-blend" | "noise-wash";
  // Motion (future)
  motionEnabled: boolean;
  motionSpeed: number;
}

export const DEFAULT_SETTINGS: HeroBackgroundSettings = {
  color1: "#000000",
  color2: "#1a1a1a",
  color3: "#389cff",
  color4: "#8b5cf6",
  singleColorMode: false,
  brightness: 1.2,
  grainEnabled: true,
  grainIntensity: 0.35,
  environmentEnabled: true,
  gradientStyle: "halo",
  motionEnabled: false,
  motionSpeed: 0.5,
};

// Color presets
const COLOR_PRESETS = {
  carbon: { color1: "#0a0a0a", color2: "#1a1a1a", color3: "#2a2a2a", color4: "#3a3a3a" },
  graphite: { color1: "#1f1f1f", color2: "#2d2d2d", color3: "#3d3d3d", color4: "#4d4d4d" },
  void: { color1: "#000000", color2: "#0a0a1a", color3: "#1a1a3a", color4: "#0a0a2a" },
  neonFog: { color1: "#0a0a0a", color2: "#1a0a2a", color3: "#ff00ff", color4: "#00ffff" },
  creamPastel: { color1: "#fef3e2", color2: "#fce7f3", color3: "#dbeafe", color4: "#dcfce7" },
};

interface HeroBackgroundWorkspaceProps {
  projectId?: string;
  projectName?: string;
  initialSettings?: HeroBackgroundSettings;
  isLoggedIn?: boolean;
  onBack: () => void;
  onSave?: (project: HeroBackgroundProject) => void;
}

type TabId = "shape" | "colors" | "motion" | "view";

const GRADIENT_STYLES = [
  { id: "halo" as const, label: "Halo", icon: Circle },
  { id: "soft-sweep" as const, label: "Soft Sweep", icon: Wind },
  { id: "orb" as const, label: "Orb", icon: Sparkles },
  { id: "diagonal-blend" as const, label: "Diagonal", icon: Triangle },
  { id: "noise-wash" as const, label: "Noise Wash", icon: Layers },
];

// Generate React component code for live preview
const generateLiveCode = (settings: HeroBackgroundSettings): string => {
  const { color1, color2, color3, color4, singleColorMode, gradientStyle, brightness, grainEnabled, grainIntensity, environmentEnabled } = settings;
  
  let bgValue: string;
  switch (gradientStyle) {
    case "halo":
      bgValue = singleColorMode
        ? `"${color1}"`
        : `"radial-gradient(ellipse 120% 80% at 50% 50%, ${color3}50 0%, ${color2}80 35%, ${color1} 100%)"`;
      break;
    case "soft-sweep":
      bgValue = singleColorMode
        ? `"${color1}"`
        : `"linear-gradient(135deg, ${color1} 0%, ${color2} 30%, ${color3}60 60%, ${color4}40 100%)"`;
      break;
    case "orb":
      bgValue = singleColorMode
        ? `"${color1}"`
        : `"radial-gradient(circle at 30% 70%, ${color3}70 0%, transparent 45%), radial-gradient(circle at 70% 30%, ${color4}70 0%, transparent 45%), linear-gradient(180deg, ${color1} 0%, ${color2} 100%)"`;
      break;
    case "diagonal-blend":
      bgValue = singleColorMode
        ? `"${color1}"`
        : `"linear-gradient(45deg, ${color1} 0%, ${color2} 25%, ${color3}90 50%, ${color4}70 75%, ${color1} 100%)"`;
      break;
    case "noise-wash":
      bgValue = singleColorMode
        ? `"${color1}"`
        : `"linear-gradient(180deg, ${color1} 0%, ${color2}95 30%, ${color3}50 70%, ${color1} 100%)"`;
      break;
    default:
      bgValue = `"${color1}"`;
  }

  return `<div
  style={{
    background: ${bgValue},
    filter: "brightness(${brightness})",
    width: "100%",
    height: "100vh",
  }}
>
  ${grainEnabled ? `{/* Grain overlay */}
  <div style={{ opacity: ${(grainIntensity * 0.3).toFixed(2)} }} />` : ""}
  ${environmentEnabled ? `{/* Environment glow */}
  <div style={{ background: "radial-gradient(...)" }} />` : ""}
</div>`;
};

// Generate JSON settings for export
const generateSettingsJSON = (settings: HeroBackgroundSettings): string => {
  return JSON.stringify({
    gradientStyle: settings.gradientStyle,
    colors: {
      color1: settings.color1,
      color2: settings.color2,
      color3: settings.color3,
      color4: settings.color4,
    },
    brightness: settings.brightness,
    grain: settings.grainEnabled ? settings.grainIntensity : 0,
    environment: settings.environmentEnabled,
  }, null, 2);
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
  const [activeTab, setActiveTab] = useState<TabId>("colors");
  const [fullscreen, setFullscreen] = useState(true);
  const [showHints, setShowHints] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [minimizedBar, setMinimizedBar] = useState(false);
  const [activeColorPicker, setActiveColorPicker] = useState<string | null>(null);
  
  // Project state
  const [currentProjectId, setCurrentProjectId] = useState(projectId || `hero-${Date.now()}`);
  const [currentProjectName, setCurrentProjectName] = useState(initialProjectName || generateProjectName());
  
  // Save state
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedSettingsRef = useRef<string>(JSON.stringify(settings));
  
  // Copy state
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedJSON, setCopiedJSON] = useState(false);
  
  // Download state
  const [downloadFormat, setDownloadFormat] = useState<"png" | "jpg">("png");
  const [downloadScale, setDownloadScale] = useState(1);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  // Live code and JSON
  const liveCode = useMemo(() => generateLiveCode(settings), [settings]);
  const liveJSON = useMemo(() => generateSettingsJSON(settings), [settings]);

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

  const updateSetting = useCallback(<K extends keyof HeroBackgroundSettings>(
    key: K,
    value: HeroBackgroundSettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
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
  }, []);

  const handleImportSettings = useCallback((importedSettings: HeroBackgroundSettings) => {
    setSettings(importedSettings);
    toast.success("Settings imported!");
  }, []);

  const handleCopyCode = useCallback(async () => {
    await navigator.clipboard.writeText(liveCode);
    setCopiedCode(true);
    toast.success("Code copied!");
    setTimeout(() => setCopiedCode(false), 2000);
  }, [liveCode]);

  const handleCopyJSON = useCallback(async () => {
    await navigator.clipboard.writeText(liveJSON);
    setCopiedJSON(true);
    toast.success("JSON copied!");
    setTimeout(() => setCopiedJSON(false), 2000);
  }, [liveJSON]);

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
  const handleColorPickerOpen = useCallback((colorKey: string, isOpen: boolean) => {
    if (isOpen) {
      setActiveColorPicker(colorKey);
    } else if (activeColorPicker === colorKey) {
      setActiveColorPicker(null);
    }
  }, [activeColorPicker]);

  // Generate gradient CSS based on settings (improved quality)
  const generateGradientStyle = useCallback((): React.CSSProperties => {
    const { color1, color2, color3, color4, singleColorMode, brightness, gradientStyle, environmentEnabled } = settings;
    
    const brightnessFilter = `brightness(${brightness})`;

    let background: string;

    switch (gradientStyle) {
      case "halo":
        // Improved halo with smoother transitions
        background = singleColorMode
          ? color1
          : `radial-gradient(ellipse 120% 80% at 50% 50%, ${color3}50 0%, ${color2}80 35%, ${color1} 100%)`;
        break;
      case "soft-sweep":
        // Enhanced sweep with better color distribution
        background = singleColorMode
          ? color1
          : `linear-gradient(135deg, ${color1} 0%, ${color2} 30%, ${color3}60 60%, ${color4}40 100%)`;
        break;
      case "orb":
        // More vibrant orbs
        background = singleColorMode
          ? color1
          : `radial-gradient(circle at 30% 70%, ${color3}70 0%, transparent 45%), 
             radial-gradient(circle at 70% 30%, ${color4}70 0%, transparent 45%),
             linear-gradient(180deg, ${color1} 0%, ${color2} 100%)`;
        break;
      case "diagonal-blend":
        // Richer diagonal blend
        background = singleColorMode
          ? color1
          : `linear-gradient(45deg, ${color1} 0%, ${color2} 25%, ${color3}90 50%, ${color4}70 75%, ${color1} 100%)`;
        break;
      case "noise-wash":
        // Enhanced wash effect
        background = singleColorMode
          ? color1
          : `linear-gradient(180deg, ${color1} 0%, ${color2}95 30%, ${color3}50 70%, ${color1} 100%)`;
        break;
      default:
        background = color1;
    }

    // Add environment glow if enabled
    if (environmentEnabled && !singleColorMode) {
      background = `${background}, radial-gradient(ellipse 150% 60% at 50% 0%, ${color3}25 0%, transparent 60%)`;
    }

    return {
      background,
      filter: brightnessFilter,
    };
  }, [settings]);

  return (
    <div className="fixed inset-0 z-50 bg-black">
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
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
              opacity: settings.grainIntensity * 0.25,
              mixBlendMode: "overlay",
            }}
          />
        )}

        {/* Environment light halo - enhanced */}
        {settings.environmentEnabled && (
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse 100% 50% at 50% 25%, ${settings.color3}20 0%, transparent 70%)`,
            }}
          />
        )}
      </div>

      {/* Back button (top-left) */}
      <button
        onClick={onBack}
        className="absolute top-6 left-6 z-50 p-3 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 text-white/70 hover:text-white hover:bg-black/60 transition-all flex items-center gap-2"
      >
        <ArrowLeft size={18} />
        <span className="text-sm font-medium">Back</span>
      </button>

      {/* Project name + save status (top-center) */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3">
        <h1 className="text-white/80 text-lg font-medium tracking-tight">{currentProjectName}</h1>
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
            <div className="flex items-center gap-1">
              {(["shape", "colors", "motion", "view"] as TabId[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    if (minimizedBar) setMinimizedBar(false);
                  }}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize",
                    activeTab === tab
                      ? "bg-white/10 text-white"
                      : "text-white/50 hover:text-white/80 hover:bg-white/5"
                  )}
                >
                  {tab}
                </button>
              ))}
              
            </div>

            {/* Minimize button */}
            <button
              onClick={() => setMinimizedBar(!minimizedBar)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white transition-all"
            >
              {minimizedBar ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              <span className="text-xs font-medium">{minimizedBar ? "Expand" : "Minimize"}</span>
            </button>
          </div>

          {/* Tab Content - collapsible */}
          <AnimatePresence>
            {!minimizedBar && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="p-4 min-h-[140px]">
                  <AnimatePresence mode="wait">
                    {activeTab === "shape" && (
                      <motion.div
                        key="shape"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex flex-wrap items-center justify-center gap-3"
                      >
                        {GRADIENT_STYLES.map((style) => {
                          const Icon = style.icon;
                          return (
                            <button
                              key={style.id}
                              onClick={() => updateSetting("gradientStyle", style.id)}
                              className={cn(
                                "flex items-center gap-2 px-4 py-3 rounded-xl border transition-all",
                                settings.gradientStyle === style.id
                                  ? "bg-white/10 border-white/30 text-white"
                                  : "bg-black/30 border-white/10 text-white/60 hover:text-white hover:border-white/20"
                              )}
                            >
                              <Icon size={18} />
                              <span className="text-sm font-medium">{style.label}</span>
                            </button>
                          );
                        })}
                      </motion.div>
                    )}

                    {activeTab === "colors" && (
                      <motion.div
                        key="colors"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-4"
                      >
                        {/* Color pickers row */}
                        <div className="flex flex-wrap items-start justify-center gap-4">
                          <div className="w-32">
                            <ColorPickerField
                              label="Color 1"
                              value={settings.color1}
                              onChange={(v) => updateSetting("color1", v)}
                              onOpenChange={(isOpen) => handleColorPickerOpen("color1", isOpen)}
                              forceClose={activeColorPicker !== null && activeColorPicker !== "color1"}
                            />
                          </div>
                          {!settings.singleColorMode && (
                            <>
                              <div className="w-32">
                                <ColorPickerField
                                  label="Color 2"
                                  value={settings.color2}
                                  onChange={(v) => updateSetting("color2", v)}
                                  onOpenChange={(isOpen) => handleColorPickerOpen("color2", isOpen)}
                                  forceClose={activeColorPicker !== null && activeColorPicker !== "color2"}
                                />
                              </div>
                              <div className="w-32">
                                <ColorPickerField
                                  label="Color 3"
                                  value={settings.color3}
                                  onChange={(v) => updateSetting("color3", v)}
                                  onOpenChange={(isOpen) => handleColorPickerOpen("color3", isOpen)}
                                  forceClose={activeColorPicker !== null && activeColorPicker !== "color3"}
                                />
                              </div>
                              <div className="w-32">
                                <ColorPickerField
                                  label="Color 4"
                                  value={settings.color4}
                                  onChange={(v) => updateSetting("color4", v)}
                                  onOpenChange={(isOpen) => handleColorPickerOpen("color4", isOpen)}
                                  forceClose={activeColorPicker !== null && activeColorPicker !== "color4"}
                                />
                              </div>
                            </>
                          )}
                        </div>

                        {/* Toggles and presets */}
                        <div className="flex flex-wrap items-center justify-center gap-3 pt-2 border-t border-white/5">
                          {/* Single color mode toggle */}
                          <button
                            onClick={() => updateSetting("singleColorMode", !settings.singleColorMode)}
                            className={cn(
                              "px-3 py-1.5 rounded-lg text-xs font-medium transition-all border",
                              settings.singleColorMode
                                ? "bg-white/10 border-white/30 text-white"
                                : "bg-black/30 border-white/10 text-white/50 hover:text-white/80"
                            )}
                          >
                            Single Color
                          </button>

                          <div className="w-px h-6 bg-white/10" />

                          {/* Presets */}
                          <span className="text-xs text-white/40 uppercase tracking-wider">Presets:</span>
                          {Object.keys(COLOR_PRESETS).map((key) => (
                            <button
                              key={key}
                              onClick={() => applyPreset(key as keyof typeof COLOR_PRESETS)}
                              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-black/30 border border-white/10 text-white/60 hover:text-white hover:border-white/20 transition-all capitalize"
                            >
                              {key.replace(/([A-Z])/g, " $1").trim()}
                            </button>
                          ))}
                        </div>
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
                              "flex items-center gap-2 px-3 py-2 rounded-lg border transition-all",
                              settings.grainEnabled
                                ? "bg-white/10 border-white/30 text-white"
                                : "bg-black/30 border-white/10 text-white/50"
                            )}
                          >
                            <Layers size={16} />
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
                              "flex items-center gap-2 px-3 py-2 rounded-lg border transition-all",
                              settings.environmentEnabled
                                ? "bg-white/10 border-white/30 text-white"
                                : "bg-black/30 border-white/10 text-white/50"
                            )}
                          >
                            <Cloudy size={16} />
                            <span className="text-xs font-medium">Environment Light</span>
                          </button>
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
                              "flex items-center gap-2 px-4 py-3 rounded-xl border transition-all",
                              fullscreen
                                ? "bg-white/10 border-white/30 text-white"
                                : "bg-black/30 border-white/10 text-white/60"
                            )}
                          >
                            {fullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                            <span className="text-sm font-medium">Fullscreen</span>
                          </button>

                          <button
                            onClick={() => setShowHints(!showHints)}
                            className={cn(
                              "flex items-center gap-2 px-4 py-3 rounded-xl border transition-all",
                              showHints
                                ? "bg-white/10 border-white/30 text-white"
                                : "bg-black/30 border-white/10 text-white/60"
                            )}
                          >
                            {showHints ? <Eye size={18} /> : <EyeOff size={18} />}
                            <span className="text-sm font-medium">UI Hints</span>
                          </button>
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
  );
};

export default HeroBackgroundWorkspace;
