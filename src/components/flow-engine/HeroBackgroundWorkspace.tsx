import React, { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HexColorPicker } from "react-colorful";
import { ArrowLeft, Maximize2, Minimize2, Eye, EyeOff, Sparkles, Sun, Cloudy, Layers, Circle, Triangle, Wind, Save, Check, ChevronUp, ChevronDown, Copy, Code, FileJson, Download, Image, Monitor, Laptop, Smartphone, Globe, Gamepad2, Pencil, PanelRightOpen, PanelRightClose, Palette, GripVertical } from "lucide-react";
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
  grainEnabled: true,
  grainIntensity: 0.35,
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

type TabId = "shape" | "colors" | "components" | "motion" | "view" | "solution" | "export";

const GRADIENT_STYLES = [
  { id: "halo" as const, label: "Halo", icon: Circle },
  { id: "soft-sweep" as const, label: "Soft Sweep", icon: Wind },
  { id: "orb" as const, label: "Orb", icon: Sparkles },
  { id: "diagonal-blend" as const, label: "Diagonal", icon: Triangle },
  { id: "noise-wash" as const, label: "Noise Wash", icon: Layers },
  { id: "aurora" as const, label: "Aurora", icon: Cloudy },
  { id: "mesh" as const, label: "Mesh", icon: Layers },
  { id: "spotlight" as const, label: "Spotlight", icon: Sun },
  { id: "wave" as const, label: "Wave", icon: Wind },
  { id: "crystal" as const, label: "Crystal", icon: Sparkles },
  { id: "sunset" as const, label: "Sunset", icon: Sun },
  { id: "cosmic" as const, label: "Cosmic", icon: Circle },
];

// Solution preview constants
const SOLUTION_TEMPLATES = [
  { id: "landing-page" as const, label: "Landing page", icon: Globe },
  { id: "app" as const, label: "App", icon: Smartphone },
  { id: "mobile-game" as const, label: "Mobile game", icon: Gamepad2 },
];

const SOLUTION_DEVICES = [
  { id: "laptop" as const, label: "Laptop", icon: Laptop },
  { id: "phone" as const, label: "Phone", icon: Smartphone },
  { id: "desktop" as const, label: "Desktop", icon: Monitor },
];

const DEVICE_SIZES: Record<"laptop" | "phone" | "desktop", { width: number; height: number }> = {
  laptop: { width: 1280, height: 800 },
  phone: { width: 375, height: 812 },
  desktop: { width: 1920, height: 1080 },
};

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
    case "aurora":
      bgValue = singleColorMode
        ? `"${color1}"`
        : `"linear-gradient(180deg, ${color1} 0%, ${color2} 20%, transparent 50%), radial-gradient(ellipse 150% 50% at 50% 0%, ${color3}60 0%, transparent 60%), radial-gradient(ellipse 100% 40% at 30% 10%, ${color4}50 0%, transparent 50%), linear-gradient(180deg, ${color1} 0%, ${color2} 100%)"`;
      break;
    case "mesh":
      bgValue = singleColorMode
        ? `"${color1}"`
        : `"radial-gradient(at 40% 20%, ${color3}80 0px, transparent 50%), radial-gradient(at 80% 0%, ${color4}70 0px, transparent 50%), radial-gradient(at 0% 50%, ${color2} 0px, transparent 50%), radial-gradient(at 80% 50%, ${color3}60 0px, transparent 50%), radial-gradient(at 0% 100%, ${color4}80 0px, transparent 50%), radial-gradient(at 80% 100%, ${color2} 0px, transparent 50%), radial-gradient(at 0% 0%, ${color1} 0px, transparent 50%), ${color1}"`;
      break;
    case "spotlight":
      bgValue = singleColorMode
        ? `"${color1}"`
        : `"radial-gradient(ellipse 80% 60% at 50% 30%, ${color3}50 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 50% 30%, ${color4}40 0%, transparent 50%), linear-gradient(180deg, ${color1} 0%, ${color2} 100%)"`;
      break;
    case "wave":
      bgValue = singleColorMode
        ? `"${color1}"`
        : `"linear-gradient(180deg, ${color1} 0%, ${color2} 30%), radial-gradient(ellipse 200% 100% at 50% 100%, ${color3}70 0%, transparent 50%), radial-gradient(ellipse 150% 80% at 50% 120%, ${color4}60 0%, transparent 40%)"`;
      break;
    case "crystal":
      bgValue = singleColorMode
        ? `"${color1}"`
        : `"linear-gradient(125deg, ${color1} 0%, ${color2} 20%, ${color3}40 40%, ${color4}30 60%, ${color2} 80%, ${color1} 100%), linear-gradient(45deg, transparent 30%, ${color3}20 50%, transparent 70%)"`;
      break;
    case "sunset":
      bgValue = singleColorMode
        ? `"${color1}"`
        : `"linear-gradient(180deg, ${color3}90 0%, ${color4}80 25%, ${color2} 50%, ${color1} 100%)"`;
      break;
    case "cosmic":
      bgValue = singleColorMode
        ? `"${color1}"`
        : `"radial-gradient(ellipse at 20% 80%, ${color3}50 0%, transparent 40%), radial-gradient(ellipse at 80% 20%, ${color4}50 0%, transparent 40%), radial-gradient(ellipse at 50% 50%, ${color2}30 0%, transparent 60%), radial-gradient(circle at 30% 30%, ${color3}30 0%, transparent 30%), radial-gradient(circle at 70% 70%, ${color4}30 0%, transparent 30%), ${color1}"`;
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

// Generate full project code as a React component
const generateProjectCode = (settings: HeroBackgroundSettings): string => {
  const { color1, color2, color3, color4, singleColorMode, gradientStyle, brightness, grainEnabled, grainIntensity, environmentEnabled } = settings;
  
  let bgValue: string;
  switch (gradientStyle) {
    case "halo":
      bgValue = singleColorMode
        ? color1
        : `radial-gradient(ellipse 120% 80% at 50% 50%, ${color3}50 0%, ${color2}80 35%, ${color1} 100%)`;
      break;
    case "soft-sweep":
      bgValue = singleColorMode
        ? color1
        : `linear-gradient(135deg, ${color1} 0%, ${color2} 30%, ${color3}60 60%, ${color4}40 100%)`;
      break;
    case "orb":
      bgValue = singleColorMode
        ? color1
        : `radial-gradient(circle at 30% 70%, ${color3}70 0%, transparent 45%), radial-gradient(circle at 70% 30%, ${color4}70 0%, transparent 45%), linear-gradient(180deg, ${color1} 0%, ${color2} 100%)`;
      break;
    case "diagonal-blend":
      bgValue = singleColorMode
        ? color1
        : `linear-gradient(45deg, ${color1} 0%, ${color2} 25%, ${color3}90 50%, ${color4}70 75%, ${color1} 100%)`;
      break;
    case "noise-wash":
      bgValue = singleColorMode
        ? color1
        : `linear-gradient(180deg, ${color1} 0%, ${color2}95 30%, ${color3}50 70%, ${color1} 100%)`;
      break;
    case "aurora":
      bgValue = singleColorMode
        ? color1
        : `linear-gradient(180deg, ${color1} 0%, ${color2} 20%, transparent 50%), radial-gradient(ellipse 150% 50% at 50% 0%, ${color3}60 0%, transparent 60%), radial-gradient(ellipse 100% 40% at 30% 10%, ${color4}50 0%, transparent 50%), linear-gradient(180deg, ${color1} 0%, ${color2} 100%)`;
      break;
    case "mesh":
      bgValue = singleColorMode
        ? color1
        : `radial-gradient(at 40% 20%, ${color3}80 0px, transparent 50%), radial-gradient(at 80% 0%, ${color4}70 0px, transparent 50%), radial-gradient(at 0% 50%, ${color2} 0px, transparent 50%), radial-gradient(at 80% 50%, ${color3}60 0px, transparent 50%), radial-gradient(at 0% 100%, ${color4}80 0px, transparent 50%), radial-gradient(at 80% 100%, ${color2} 0px, transparent 50%), radial-gradient(at 0% 0%, ${color1} 0px, transparent 50%), ${color1}`;
      break;
    case "spotlight":
      bgValue = singleColorMode
        ? color1
        : `radial-gradient(ellipse 80% 60% at 50% 30%, ${color3}50 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 50% 30%, ${color4}40 0%, transparent 50%), linear-gradient(180deg, ${color1} 0%, ${color2} 100%)`;
      break;
    case "wave":
      bgValue = singleColorMode
        ? color1
        : `linear-gradient(180deg, ${color1} 0%, ${color2} 30%), radial-gradient(ellipse 200% 100% at 50% 100%, ${color3}70 0%, transparent 50%), radial-gradient(ellipse 150% 80% at 50% 120%, ${color4}60 0%, transparent 40%)`;
      break;
    case "crystal":
      bgValue = singleColorMode
        ? color1
        : `linear-gradient(125deg, ${color1} 0%, ${color2} 20%, ${color3}40 40%, ${color4}30 60%, ${color2} 80%, ${color1} 100%), linear-gradient(45deg, transparent 30%, ${color3}20 50%, transparent 70%)`;
      break;
    case "sunset":
      bgValue = singleColorMode
        ? color1
        : `linear-gradient(180deg, ${color3}90 0%, ${color4}80 25%, ${color2} 50%, ${color1} 100%)`;
      break;
    case "cosmic":
      bgValue = singleColorMode
        ? color1
        : `radial-gradient(ellipse at 20% 80%, ${color3}50 0%, transparent 40%), radial-gradient(ellipse at 80% 20%, ${color4}50 0%, transparent 40%), radial-gradient(ellipse at 50% 50%, ${color2}30 0%, transparent 60%), radial-gradient(circle at 30% 30%, ${color3}30 0%, transparent 30%), radial-gradient(circle at 70% 70%, ${color4}30 0%, transparent 30%), ${color1}`;
      break;
    default:
      bgValue = color1;
  }

  const grainOverlay = grainEnabled 
    ? `\n      {/* Grain overlay */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: \`url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")\`,
          opacity: ${(grainIntensity * 0.25).toFixed(2)},
          mixBlendMode: "overlay",
        }}
      />`
    : '';

  const environmentGlow = environmentEnabled && !singleColorMode
    ? `\n      {/* Environment light halo */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: \`radial-gradient(ellipse 100% 50% at 50% 25%, ${color3}20 0%, transparent 70%)\`,
        }}
      />`
    : '';

  return `import React from 'react';

export const HeroBackground: React.FC = () => {
  return (
    <div 
      className="fixed inset-0"
      style={{
        background: "${bgValue}",
        filter: "brightness(${brightness})",
        width: "100%",
        height: "100vh",
      }}
    >${grainOverlay}${environmentGlow}
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
  const [activeTab, setActiveTab] = useState<TabId>("colors");
  const [fullscreen, setFullscreen] = useState(true);
  const [showHints, setShowHints] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [minimizedBar, setMinimizedBar] = useState(false);
  const [activeColorPicker, setActiveColorPicker] = useState<string | null>(null);
  const [solutionTemplate, setSolutionTemplate] = useState<"landing-page" | "app" | "mobile-game">("landing-page");
  const [solutionDevice, setSolutionDevice] = useState<"laptop" | "phone" | "desktop">("laptop");
  
  // Component editing state
  const [selectedComponent, setSelectedComponent] = useState<"button-primary" | "button-secondary" | "card" | "input" | null>(null);
  const [showComponentLibrary, setShowComponentLibrary] = useState(false);
  
  // Preview content state for editing via chat
  const [previewContent, setPreviewContent] = useState<{
    heroTitle?: string;
    heroSubtitle?: string;
    heroButton1Text?: string;
    heroButton1Color?: string;
    heroButton1TextColor?: string;
    heroButton2Text?: string;
    heroButton2Color?: string;
    heroButton2TextColor?: string;
    heroTextColor?: string;
    [key: string]: string | undefined;
  }>({});
  const [highlightedElement, setHighlightedElement] = useState<string | null>(null);
  
  // Project state
  const [currentProjectId, setCurrentProjectId] = useState(projectId || `hero-${Date.now()}`);
  const [currentProjectName, setCurrentProjectName] = useState(initialProjectName || generateProjectName());
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(currentProjectName);
  
  // Save state
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedSettingsRef = useRef<string>(JSON.stringify(settings));
  
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
  const liveJSON = useMemo(() => generateSettingsJSON(settings), [settings]);
  const projectCode = useMemo(() => generateProjectCode(settings), [settings]);

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
      case "aurora":
        background = singleColorMode
          ? color1
          : `linear-gradient(180deg, ${color1} 0%, ${color2} 20%, transparent 50%), radial-gradient(ellipse 150% 50% at 50% 0%, ${color3}60 0%, transparent 60%), radial-gradient(ellipse 100% 40% at 30% 10%, ${color4}50 0%, transparent 50%), linear-gradient(180deg, ${color1} 0%, ${color2} 100%)`;
        break;
      case "mesh":
        background = singleColorMode
          ? color1
          : `radial-gradient(at 40% 20%, ${color3}80 0px, transparent 50%), radial-gradient(at 80% 0%, ${color4}70 0px, transparent 50%), radial-gradient(at 0% 50%, ${color2} 0px, transparent 50%), radial-gradient(at 80% 50%, ${color3}60 0px, transparent 50%), radial-gradient(at 0% 100%, ${color4}80 0px, transparent 50%), radial-gradient(at 80% 100%, ${color2} 0px, transparent 50%), radial-gradient(at 0% 0%, ${color1} 0px, transparent 50%), ${color1}`;
        break;
      case "spotlight":
        background = singleColorMode
          ? color1
          : `radial-gradient(ellipse 80% 60% at 50% 30%, ${color3}50 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 50% 30%, ${color4}40 0%, transparent 50%), linear-gradient(180deg, ${color1} 0%, ${color2} 100%)`;
        break;
      case "wave":
        background = singleColorMode
          ? color1
          : `linear-gradient(180deg, ${color1} 0%, ${color2} 30%), radial-gradient(ellipse 200% 100% at 50% 100%, ${color3}70 0%, transparent 50%), radial-gradient(ellipse 150% 80% at 50% 120%, ${color4}60 0%, transparent 40%)`;
        break;
      case "crystal":
        background = singleColorMode
          ? color1
          : `linear-gradient(125deg, ${color1} 0%, ${color2} 20%, ${color3}40 40%, ${color4}30 60%, ${color2} 80%, ${color1} 100%), linear-gradient(45deg, transparent 30%, ${color3}20 50%, transparent 70%)`;
        break;
      case "sunset":
        background = singleColorMode
          ? color1
          : `linear-gradient(180deg, ${color3}90 0%, ${color4}80 25%, ${color2} 50%, ${color1} 100%)`;
        break;
      case "cosmic":
        background = singleColorMode
          ? color1
          : `radial-gradient(ellipse at 20% 80%, ${color3}50 0%, transparent 40%), radial-gradient(ellipse at 80% 20%, ${color4}50 0%, transparent 40%), radial-gradient(ellipse at 50% 50%, ${color2}30 0%, transparent 60%), radial-gradient(circle at 30% 30%, ${color3}30 0%, transparent 30%), radial-gradient(circle at 70% 70%, ${color4}30 0%, transparent 30%), ${color1}`;
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

  // Solution preview component with export panel
  const renderSolutionPreview = () => {
    const deviceSize = DEVICE_SIZES[solutionDevice];
    
    const getContentValue = (key: string, defaultValue: string) => {
      return previewContent[key] || defaultValue;
    };
    
    const isHighlighted = (key: string) => highlightedElement === key;
    
    const previewContentRender = () => {
      switch (solutionTemplate) {
        case "landing-page":
          return (
            <div className="relative w-full text-white">
              {/* Hero Section */}
              <div className="flex flex-col items-center justify-center min-h-screen p-16 text-center">
                <h1 
                  className={cn(
                    "text-5xl font-bold mb-4 transition-all",
                    isHighlighted("heroTitle") && "ring-4 ring-yellow-400 ring-opacity-70 rounded-lg"
                  )}
                  style={{ color: getContentValue("heroTextColor", "#ffffff") }}
                >
                  {getContentValue("heroTitle", "Welcome to Our Product")}
                </h1>
                <p 
                  className={cn(
                    "text-xl mb-8 transition-all",
                    isHighlighted("heroSubtitle") && "ring-4 ring-yellow-400 ring-opacity-70 rounded-lg"
                  )}
                  style={{ color: getContentValue("heroTextColor", "rgba(255, 255, 255, 0.8)") }}
                >
                  {getContentValue("heroSubtitle", "Build amazing experiences with our platform")}
                </p>
                <div className="flex gap-4">
                  <button 
                    className={cn(
                      "px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-all",
                      isHighlighted("heroButton1Text") || isHighlighted("heroButton1Color") || isHighlighted("heroButton1TextColor") 
                        ? "ring-4 ring-yellow-400 ring-opacity-70" 
                        : ""
                    )}
                    style={{ 
                      backgroundColor: getContentValue("heroButton1Color", settings.buttonPrimaryBg),
                      color: getContentValue("heroButton1TextColor", settings.buttonPrimaryText)
                    }}
                  >
                    {getContentValue("heroButton1Text", "Get Started")}
                  </button>
                  <button 
                    className={cn(
                      "px-6 py-3 border rounded-lg font-medium hover:bg-white/10 transition-all",
                      isHighlighted("heroButton2Text") || isHighlighted("heroButton2Color") || isHighlighted("heroButton2TextColor")
                        ? "ring-4 ring-yellow-400 ring-opacity-70"
                        : "border-white/30"
                    )}
                    style={{ 
                      backgroundColor: getContentValue("heroButton2Color", settings.buttonSecondaryBg),
                      color: getContentValue("heroButton2TextColor", settings.buttonSecondaryText),
                      borderColor: getContentValue("heroButton2Color", settings.buttonSecondaryBorder)
                    }}
                  >
                    {getContentValue("heroButton2Text", "Learn More")}
                  </button>
                </div>
              </div>
              
              {/* Features Section */}
              <div className="py-20 px-16">
                <div className="max-w-6xl mx-auto">
                  <h2 className="text-4xl font-bold mb-12 text-center">Features</h2>
                  <div className="grid grid-cols-3 gap-8">
                    {[1, 2, 3].map((i) => (
                      <div 
                        key={i} 
                        className="backdrop-blur-sm rounded-xl p-6 border"
                        style={{
                          backgroundColor: settings.cardBg,
                          borderColor: settings.cardBorder
                        }}
                      >
                        <div className="w-12 h-12 bg-white/20 rounded-lg mb-4" />
                        <div className="h-6 bg-white/30 rounded w-3/4 mb-3" />
                        <div className="h-4 bg-white/20 rounded w-full mb-2" />
                        <div className="h-4 bg-white/20 rounded w-2/3" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Content Section */}
              <div className="py-20 px-16 bg-black/20">
                <div className="max-w-4xl mx-auto">
                  <div className="h-8 bg-white/20 rounded w-1/3 mb-6" />
                  <div className="space-y-4">
                    <div className="h-4 bg-white/20 rounded w-full" />
                    <div className="h-4 bg-white/20 rounded w-5/6" />
                    <div className="h-4 bg-white/20 rounded w-4/5" />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="py-12 px-16 border-t border-white/10 pb-20">
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                  <div className="h-6 bg-white/20 rounded w-32" />
                  <div className="flex gap-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-4 bg-white/20 rounded w-16" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        case "app":
          return (
            <div className="relative w-full text-white pb-8">
              {/* Hero Section */}
              <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
                <div className="w-20 h-20 bg-white/20 rounded-2xl mb-6 mx-auto flex items-center justify-center border border-white/20">
                  <Smartphone size={32} className="text-white/60" />
                </div>
                <h1 
                  className={cn(
                    "text-4xl font-bold mb-4 transition-all",
                    isHighlighted("heroTitle") && "ring-4 ring-yellow-400 ring-opacity-70 rounded-lg"
                  )}
                  style={{ color: getContentValue("heroTextColor", "#ffffff") }}
                >
                  {getContentValue("heroTitle", "App Name")}
                </h1>
                <p 
                  className={cn(
                    "text-lg mb-8 transition-all",
                    isHighlighted("heroSubtitle") && "ring-4 ring-yellow-400 ring-opacity-70 rounded-lg"
                  )}
                  style={{ color: getContentValue("heroTextColor", "rgba(255, 255, 255, 0.8)") }}
                >
                  {getContentValue("heroSubtitle", "Your personal assistant")}
                </p>
                <div className="flex gap-4 justify-center">
                  <button 
                    className={cn(
                      "px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-all",
                      isHighlighted("heroButton1Text") || isHighlighted("heroButton1Color") || isHighlighted("heroButton1TextColor")
                        ? "ring-4 ring-yellow-400 ring-opacity-70"
                        : ""
                    )}
                    style={{ 
                      backgroundColor: getContentValue("heroButton1Color", settings.buttonPrimaryBg),
                      color: getContentValue("heroButton1TextColor", settings.buttonPrimaryText)
                    }}
                  >
                    {getContentValue("heroButton1Text", "Download")}
                  </button>
                  <button 
                    className={cn(
                      "px-6 py-3 border rounded-lg font-medium hover:bg-white/10 transition-all",
                      isHighlighted("heroButton2Text") || isHighlighted("heroButton2Color") || isHighlighted("heroButton2TextColor")
                        ? "ring-4 ring-yellow-400 ring-opacity-70"
                        : "border-white/30"
                    )}
                    style={{ 
                      backgroundColor: getContentValue("heroButton2Color", settings.buttonSecondaryBg),
                      color: getContentValue("heroButton2TextColor", settings.buttonSecondaryText),
                      borderColor: getContentValue("heroButton2Color", settings.buttonSecondaryBorder)
                    }}
                  >
                    {getContentValue("heroButton2Text", "Learn More")}
                  </button>
                </div>
              </div>

              {/* Features Section */}
              <div className="py-20 px-8">
                <div className="max-w-4xl mx-auto">
                  <h2 className="text-3xl font-bold mb-12 text-center">Features</h2>
                  <div className="grid grid-cols-1 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                      <div 
                        key={i} 
                        className="backdrop-blur-sm rounded-xl p-6 border"
                        style={{
                          backgroundColor: settings.cardBg,
                          borderColor: settings.cardBorder
                        }}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white/20 rounded-lg flex-shrink-0" />
                          <div className="flex-1">
                            <div className="h-5 bg-white/30 rounded w-2/3 mb-3" />
                            <div className="h-3 bg-white/20 rounded w-full mb-2" />
                            <div className="h-3 bg-white/20 rounded w-4/5" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Content Section */}
              <div className="py-20 px-8 bg-black/20">
                <div className="max-w-3xl mx-auto text-center">
                  <div className="h-8 bg-white/20 rounded w-1/2 mb-6 mx-auto" />
                  <div className="space-y-4">
                    <div className="h-4 bg-white/20 rounded w-full" />
                    <div className="h-4 bg-white/20 rounded w-5/6 mx-auto" />
                    <div className="h-4 bg-white/20 rounded w-4/5 mx-auto" />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="py-12 px-8 border-t border-white/10">
                <div className="max-w-4xl mx-auto flex flex-col items-center gap-4">
                  <div className="h-6 bg-white/20 rounded w-32" />
                  <div className="flex gap-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-4 bg-white/20 rounded w-16" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        case "mobile-game":
          return (
            <div className="relative w-full text-white pb-8">
              {/* Hero Section */}
              <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
                <div className="w-24 h-24 bg-white/20 rounded-2xl mb-6 mx-auto flex items-center justify-center border border-white/20">
                  <Gamepad2 size={48} className="text-white/60" />
                </div>
                <h1 
                  className={cn(
                    "text-4xl font-bold mb-4 transition-all",
                    isHighlighted("heroTitle") && "ring-4 ring-yellow-400 ring-opacity-70 rounded-lg"
                  )}
                  style={{ color: getContentValue("heroTextColor", "#ffffff") }}
                >
                  {getContentValue("heroTitle", "Game Title")}
                </h1>
                <p 
                  className={cn(
                    "text-lg mb-8 transition-all",
                    isHighlighted("heroSubtitle") && "ring-4 ring-yellow-400 ring-opacity-70 rounded-lg"
                  )}
                  style={{ color: getContentValue("heroTextColor", "rgba(255, 255, 255, 0.8)") }}
                >
                  {getContentValue("heroSubtitle", "Start your adventure")}
                </p>
                <div className="flex flex-col gap-4 w-full max-w-sm">
                  <button 
                    className={cn(
                      "w-full py-4 rounded-xl font-bold text-lg hover:opacity-90 transition-all",
                      isHighlighted("heroButton1Text") || isHighlighted("heroButton1Color") || isHighlighted("heroButton1TextColor")
                        ? "ring-4 ring-yellow-400 ring-opacity-70"
                        : ""
                    )}
                    style={{ 
                      backgroundColor: getContentValue("heroButton1Color", "#ffffff"),
                      color: getContentValue("heroButton1TextColor", "#000000")
                    }}
                  >
                    {getContentValue("heroButton1Text", "Play Now")}
                  </button>
                  <button 
                    className={cn(
                      "w-full py-4 border rounded-xl font-medium hover:bg-white/10 transition-all",
                      isHighlighted("heroButton2Text") || isHighlighted("heroButton2Color") || isHighlighted("heroButton2TextColor")
                        ? "ring-4 ring-yellow-400 ring-opacity-70"
                        : "border-white/30"
                    )}
                    style={{ 
                      backgroundColor: getContentValue("heroButton2Color", "transparent"),
                      color: getContentValue("heroButton2TextColor", "#ffffff"),
                      borderColor: getContentValue("heroButton2Color", "rgba(255, 255, 255, 0.3)")
                    }}
                  >
                    {getContentValue("heroButton2Text", "Leaderboard")}
                  </button>
                </div>
              </div>

              {/* Features Section */}
              <div className="py-20 px-8">
                <div className="max-w-4xl mx-auto">
                  <h2 className="text-3xl font-bold mb-12 text-center">Game Features</h2>
                  <div className="grid grid-cols-2 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-center">
                        <div className="w-16 h-16 bg-white/20 rounded-xl mb-4 mx-auto" />
                        <div className="h-5 bg-white/30 rounded w-3/4 mb-3 mx-auto" />
                        <div className="h-3 bg-white/20 rounded w-full mb-2" />
                        <div className="h-3 bg-white/20 rounded w-2/3 mx-auto" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Content Section */}
              <div className="py-20 px-8 bg-black/20">
                <div className="max-w-3xl mx-auto text-center">
                  <div className="h-8 bg-white/20 rounded w-1/2 mb-6 mx-auto" />
                  <div className="space-y-4">
                    <div className="h-4 bg-white/20 rounded w-full" />
                    <div className="h-4 bg-white/20 rounded w-5/6 mx-auto" />
                    <div className="h-4 bg-white/20 rounded w-4/5 mx-auto" />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="py-12 px-8 border-t border-white/10">
                <div className="max-w-4xl mx-auto flex flex-col items-center gap-4">
                  <div className="h-6 bg-white/20 rounded w-32" />
                  <div className="flex gap-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-4 bg-white/20 rounded w-16" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
      }
    };

    return (
      <div 
        className="absolute left-0 right-0 bottom-0 pointer-events-auto"
        style={{ zIndex: 40, top: '72px', maxHeight: 'calc(100vh - 72px)', overflow: 'hidden' }}
      >
        <div 
          className="relative w-full min-h-full bg-transparent flex justify-center"
        >
          {/* Content - transparent background, shows the hero background behind */}
          <div 
            className="relative z-10"
            style={{ 
              width: deviceSize.width,
              maxWidth: "100%",
            }}
          >
            {previewContentRender()}
          </div>
        </div>
      </div>
    );
  };

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
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                opacity: settings.grainIntensity * 0.25,
                mixBlendMode: "overlay",
              }}
            />
          )}

          {/* Environment light halo - enhanced */}
          {settings.environmentEnabled && !settings.singleColorMode && (
            <div 
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `radial-gradient(ellipse 100% 50% at 50% 25%, ${settings.color3}20 0%, transparent 70%)`,
              }}
            />
          )}
        </div>

        {/* Solution Preview Overlay */}
        {activeTab === "solution" && renderSolutionPreview()}


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
              {(["shape", "colors", "components", "motion", "view", "solution", "export"] as TabId[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    if (minimizedBar) setMinimizedBar(false);
                  }}
                  className={cn(
                    "text-xs font-medium transition-all capitalize cursor-pointer",
                    activeTab === tab
                      ? "text-white"
                      : "text-white/50 hover:text-white/80"
                  )}
                >
                  {tab}
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
                animate={{ height: 200, opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="p-4" style={{ minHeight: '200px', maxHeight: '200px' }}>
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
                                "flex items-center gap-1.5 px-3 py-2 rounded-lg border transition-all text-xs",
                                settings.gradientStyle === style.id
                                  ? "bg-neutral-900 border-white/20 text-white"
                                  : "bg-neutral-900 border-white/10 text-white/70 hover:text-white hover:bg-neutral-800"
                              )}
                            >
                              <Icon size={14} />
                              <span className="text-xs font-medium">{style.label}</span>
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
                                { id: "button-primary", label: "Primary", preview: (
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
                                )},
                                { id: "button-secondary", label: "Secondary", preview: (
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
                                )},
                                { id: "card", label: "Card", preview: (
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
                                )},
                                { id: "input", label: "Input", preview: (
                                  <div 
                                    className="w-full h-6 rounded border px-1.5 flex items-center"
                                    style={{ 
                                      backgroundColor: settings.inputBg,
                                      borderColor: settings.inputBorder,
                                    }}
                                  >
                                    <span className="text-[8px] text-white/30">Input</span>
                                  </div>
                                )},
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

                    {activeTab === "solution" && (
                      <motion.div
                        key="solution"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                      >
                        {/* Template Selection */}
                        <div>
                          <label className="text-xs text-white/50 uppercase tracking-wider mb-3 block">Template:</label>
                          <div className="flex flex-wrap items-center justify-center gap-3">
                            {SOLUTION_TEMPLATES.map((template) => {
                              const Icon = template.icon;
                              return (
                                <button
                                  key={template.id}
                                  onClick={() => setSolutionTemplate(template.id)}
                                  className={cn(
                                    "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all text-xs",
                                    solutionTemplate === template.id
                                      ? "bg-neutral-900 border-white/20 text-white"
                                      : "bg-neutral-900 border-white/10 text-white/70 hover:text-white hover:bg-neutral-800"
                                  )}
                                >
                                  <Icon size={14} />
                                  <span className="text-xs font-medium">{template.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Device Selection */}
                        <div>
                          <label className="text-xs text-white/50 uppercase tracking-wider mb-3 block">Device:</label>
                          <div className="flex flex-wrap items-center justify-center gap-3">
                            {SOLUTION_DEVICES.map((device) => {
                              const Icon = device.icon;
                              return (
                                <button
                                  key={device.id}
                                  onClick={() => setSolutionDevice(device.id)}
                                  className={cn(
                                    "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all text-xs",
                                    solutionDevice === device.id
                                      ? "bg-neutral-900 border-white/20 text-white"
                                      : "bg-neutral-900 border-white/10 text-white/70 hover:text-white hover:bg-neutral-800"
                                  )}
                                >
                                  <Icon size={14} />
                                  <span className="text-xs font-medium">{device.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Manual Editor */}
                        <div className="pt-4 border-t border-white/10 space-y-4">
                          <label className="text-xs text-white/50 uppercase tracking-wider block">Content Editor:</label>
                          
                          {/* Text Color */}
                          <div className="space-y-2">
                            <label className="text-xs text-white/70 block">Text Color:</label>
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                value={previewContent.heroTextColor || "#ffffff"}
                                onChange={(e) => setPreviewContent(prev => ({ ...prev, heroTextColor: e.target.value }))}
                                className="w-10 h-8 rounded border border-white/10 cursor-pointer"
                              />
                              <input
                                type="text"
                                value={previewContent.heroTextColor || "#ffffff"}
                                onChange={(e) => setPreviewContent(prev => ({ ...prev, heroTextColor: e.target.value }))}
                                className="flex-1 bg-neutral-800 border border-white/10 rounded px-2 py-1.5 text-white text-xs focus:outline-none focus:border-white/30"
                                placeholder="#ffffff"
                              />
                            </div>
                          </div>

                          {/* Hero Title */}
                          <div className="space-y-2">
                            <label className="text-xs text-white/70 block">Hero Title:</label>
                            <input
                              type="text"
                              value={previewContent.heroTitle || ""}
                              onChange={(e) => setPreviewContent(prev => ({ ...prev, heroTitle: e.target.value }))}
                              className="w-full bg-neutral-800 border border-white/10 rounded px-2 py-1.5 text-white text-xs focus:outline-none focus:border-white/30"
                              placeholder="Enter hero title"
                            />
                          </div>

                          {/* Hero Subtitle */}
                          <div className="space-y-2">
                            <label className="text-xs text-white/70 block">Hero Subtitle:</label>
                            <input
                              type="text"
                              value={previewContent.heroSubtitle || ""}
                              onChange={(e) => setPreviewContent(prev => ({ ...prev, heroSubtitle: e.target.value }))}
                              className="w-full bg-neutral-800 border border-white/10 rounded px-2 py-1.5 text-white text-xs focus:outline-none focus:border-white/30"
                              placeholder="Enter hero subtitle"
                            />
                          </div>

                          {/* Button 1 */}
                          <div className="space-y-2">
                            <label className="text-xs text-white/70 block">Button 1:</label>
                            <div className="space-y-2">
                              <input
                                type="text"
                                value={previewContent.heroButton1Text || ""}
                                onChange={(e) => setPreviewContent(prev => ({ ...prev, heroButton1Text: e.target.value }))}
                                className="w-full bg-neutral-800 border border-white/10 rounded px-2 py-1.5 text-white text-xs focus:outline-none focus:border-white/30"
                                placeholder="Button text"
                              />
                              <div className="flex items-center gap-2">
                                <div className="flex-1">
                                  <label className="text-xs text-white/60 block mb-1">Background:</label>
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="color"
                                      value={previewContent.heroButton1Color || "#ffffff"}
                                      onChange={(e) => setPreviewContent(prev => ({ ...prev, heroButton1Color: e.target.value }))}
                                      className="w-10 h-8 rounded border border-white/10 cursor-pointer"
                                    />
                                    <input
                                      type="text"
                                      value={previewContent.heroButton1Color || "#ffffff"}
                                      onChange={(e) => setPreviewContent(prev => ({ ...prev, heroButton1Color: e.target.value }))}
                                      className="flex-1 bg-neutral-800 border border-white/10 rounded px-2 py-1.5 text-white text-xs focus:outline-none focus:border-white/30"
                                      placeholder="#ffffff"
                                    />
                                  </div>
                                </div>
                                <div className="flex-1">
                                  <label className="text-xs text-white/60 block mb-1">Text:</label>
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="color"
                                      value={previewContent.heroButton1TextColor || "#000000"}
                                      onChange={(e) => setPreviewContent(prev => ({ ...prev, heroButton1TextColor: e.target.value }))}
                                      className="w-10 h-8 rounded border border-white/10 cursor-pointer"
                                    />
                                    <input
                                      type="text"
                                      value={previewContent.heroButton1TextColor || "#000000"}
                                      onChange={(e) => setPreviewContent(prev => ({ ...prev, heroButton1TextColor: e.target.value }))}
                                      className="flex-1 bg-neutral-800 border border-white/10 rounded px-2 py-1.5 text-white text-xs focus:outline-none focus:border-white/30"
                                      placeholder="#000000"
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Button 2 */}
                          <div className="space-y-2">
                            <label className="text-xs text-white/70 block">Button 2:</label>
                            <div className="space-y-2">
                              <input
                                type="text"
                                value={previewContent.heroButton2Text || ""}
                                onChange={(e) => setPreviewContent(prev => ({ ...prev, heroButton2Text: e.target.value }))}
                                className="w-full bg-neutral-800 border border-white/10 rounded px-2 py-1.5 text-white text-xs focus:outline-none focus:border-white/30"
                                placeholder="Button text"
                              />
                              <div className="flex items-center gap-2">
                                <div className="flex-1">
                                  <label className="text-xs text-white/60 block mb-1">Background:</label>
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="color"
                                      value={previewContent.heroButton2Color || "transparent"}
                                      onChange={(e) => setPreviewContent(prev => ({ ...prev, heroButton2Color: e.target.value }))}
                                      className="w-10 h-8 rounded border border-white/10 cursor-pointer"
                                    />
                                    <input
                                      type="text"
                                      value={previewContent.heroButton2Color || "transparent"}
                                      onChange={(e) => setPreviewContent(prev => ({ ...prev, heroButton2Color: e.target.value }))}
                                      className="flex-1 bg-neutral-800 border border-white/10 rounded px-2 py-1.5 text-white text-xs focus:outline-none focus:border-white/30"
                                      placeholder="transparent"
                                    />
                                  </div>
                                </div>
                                <div className="flex-1">
                                  <label className="text-xs text-white/60 block mb-1">Text:</label>
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="color"
                                      value={previewContent.heroButton2TextColor || "#ffffff"}
                                      onChange={(e) => setPreviewContent(prev => ({ ...prev, heroButton2TextColor: e.target.value }))}
                                      className="w-10 h-8 rounded border border-white/10 cursor-pointer"
                                    />
                                    <input
                                      type="text"
                                      value={previewContent.heroButton2TextColor || "#ffffff"}
                                      onChange={(e) => setPreviewContent(prev => ({ ...prev, heroButton2TextColor: e.target.value }))}
                                      className="flex-1 bg-neutral-800 border border-white/10 rounded px-2 py-1.5 text-white text-xs focus:outline-none focus:border-white/30"
                                      placeholder="#ffffff"
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
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
                              className={`flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-white text-xs font-medium transition-colors ${
                                copiedProjectCode 
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
                                className={`flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-white text-xs font-medium transition-colors ${
                                  copiedCode 
                                    ? "bg-neutral-800 hover:bg-neutral-700" 
                                    : "bg-neutral-900 hover:bg-neutral-800"
                                }`}
                              >
                                {copiedCode ? <Check size={14} /> : <Code size={14} />}
                                {copiedCode ? "Copied!" : "Copy React Code"}
                              </button>
                              <button
                                onClick={handleCopyJSON}
                                className={`flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-white text-xs font-medium transition-colors ${
                                  copiedJSON 
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
