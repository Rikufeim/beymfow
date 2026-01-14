import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, Check, Code, FileJson, Download, Upload, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { HeroBackgroundSettings } from "./HeroBackgroundWorkspace";

interface HeroExportPanelProps {
  isOpen: boolean;
  onClose: () => void;
  settings: HeroBackgroundSettings;
  onImportSettings: (settings: HeroBackgroundSettings) => void;
}

// Generate CSS gradient based on settings (matches workspace preview exactly)
const generateGradientCSS = (settings: HeroBackgroundSettings): string => {
  const { color1, color2, color3, color4, singleColorMode, gradientStyle, environmentEnabled } = settings;

  let background: string;

  switch (gradientStyle) {
    case "halo":
      background = singleColorMode
        ? color1
        : `radial-gradient(ellipse at 50% 50%, ${color3}40 0%, ${color2}60 40%, ${color1} 100%)`;
      break;
    case "soft-sweep":
      background = singleColorMode
        ? color1
        : `linear-gradient(135deg, ${color1} 0%, ${color2} 30%, ${color3}50 60%, ${color4}30 100%)`;
      break;
    case "orb":
      background = singleColorMode
        ? color1
        : `radial-gradient(circle at 30% 70%, ${color3}60 0%, transparent 50%), radial-gradient(circle at 70% 30%, ${color4}60 0%, transparent 50%), linear-gradient(180deg, ${color1} 0%, ${color2} 100%)`;
      break;
    case "diagonal-blend":
      background = singleColorMode
        ? color1
        : `linear-gradient(45deg, ${color1} 0%, ${color2} 25%, ${color3}80 50%, ${color4}60 75%, ${color1} 100%)`;
      break;
    case "noise-wash":
      background = singleColorMode
        ? color1
        : `linear-gradient(180deg, ${color1} 0%, ${color2}90 30%, ${color3}40 70%, ${color1} 100%)`;
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

  if (environmentEnabled && !singleColorMode) {
    background = `${background}, radial-gradient(ellipse at 50% 0%, ${color3}20 0%, transparent 70%)`;
  }

  return background;
};

// Generate React component code
const generateReactComponent = (settings: HeroBackgroundSettings): string => {
  const gradientCSS = generateGradientCSS(settings);
  const grainSVG = `data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E`;

  return `import React from "react";

/**
 * HeroBackground Component
 * Generated by Beymflow Hero Background Generator
 * 
 * Settings: ${settings.gradientStyle} style
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
        background: \`${gradientCSS}\`,
        filter: "brightness(${settings.brightness})",
      }}
    >
      {/* Grain overlay */}
      ${settings.grainEnabled ? `<div 
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: \`url("${grainSVG}")\`,
          opacity: ${(settings.grainIntensity * 0.3).toFixed(3)},
          mixBlendMode: "overlay",
        }}
      />` : ""}
      
      {/* Environment light halo */}
      ${settings.environmentEnabled ? `<div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: \`radial-gradient(ellipse at 50% 30%, ${settings.color3}15 0%, transparent 60%)\`,
        }}
      />` : ""}
      
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

// Generate settings JSON
const generateSettingsJSON = (settings: HeroBackgroundSettings): string => {
  return JSON.stringify({
    version: "1.0",
    generator: "beymflow-hero-background",
    settings: {
      colors: {
        color1: settings.color1,
        color2: settings.color2,
        color3: settings.color3,
        color4: settings.color4,
        singleColorMode: settings.singleColorMode,
      },
      effects: {
        brightness: settings.brightness,
        grainEnabled: settings.grainEnabled,
        grainIntensity: settings.grainIntensity,
        environmentEnabled: settings.environmentEnabled,
      },
      style: {
        gradientStyle: settings.gradientStyle,
        motionEnabled: settings.motionEnabled,
        motionSpeed: settings.motionSpeed,
      },
    },
  }, null, 2);
};

// Parse imported JSON to settings
const parseSettingsJSON = (json: string): HeroBackgroundSettings | null => {
  try {
    const parsed = JSON.parse(json);
    if (parsed.settings) {
      return {
        color1: parsed.settings.colors?.color1 || "#000000",
        color2: parsed.settings.colors?.color2 || "#1a1a1a",
        color3: parsed.settings.colors?.color3 || "#389cff",
        color4: parsed.settings.colors?.color4 || "#8b5cf6",
        singleColorMode: parsed.settings.colors?.singleColorMode || false,
        brightness: parsed.settings.effects?.brightness || 1.2,
        grainEnabled: parsed.settings.effects?.grainEnabled ?? true,
        grainIntensity: parsed.settings.effects?.grainIntensity || 0.35,
        environmentEnabled: parsed.settings.effects?.environmentEnabled ?? true,
        gradientStyle: parsed.settings.style?.gradientStyle || "halo",
        motionEnabled: parsed.settings.style?.motionEnabled || false,
        motionSpeed: parsed.settings.style?.motionSpeed || 0.5,
        // Component defaults
        buttonPrimaryBg: parsed.settings.components?.buttonPrimaryBg || "#ffffff",
        buttonPrimaryText: parsed.settings.components?.buttonPrimaryText || "#000000",
        buttonPrimaryGradient: parsed.settings.components?.buttonPrimaryGradient || "none",
        buttonPrimaryGradientColor: parsed.settings.components?.buttonPrimaryGradientColor || "#389cff",
        buttonSecondaryBg: parsed.settings.components?.buttonSecondaryBg || "transparent",
        buttonSecondaryText: parsed.settings.components?.buttonSecondaryText || "#ffffff",
        buttonSecondaryBorder: parsed.settings.components?.buttonSecondaryBorder || "rgba(255,255,255,0.3)",
        buttonSecondaryGradient: parsed.settings.components?.buttonSecondaryGradient || "none",
        buttonSecondaryGradientColor: parsed.settings.components?.buttonSecondaryGradientColor || "#8b5cf6",
        cardBg: parsed.settings.components?.cardBg || "rgba(255,255,255,0.1)",
        cardBorder: parsed.settings.components?.cardBorder || "rgba(255,255,255,0.2)",
        cardGradient: parsed.settings.components?.cardGradient || "none",
        cardGradientColor: parsed.settings.components?.cardGradientColor || "#389cff",
        inputBg: parsed.settings.components?.inputBg || "#1a1a1a",
        inputBorder: parsed.settings.components?.inputBorder || "rgba(255,255,255,0.1)",
        inputText: parsed.settings.components?.inputText || "#ffffff",
        focusRingColor: parsed.settings.components?.focusRingColor || "#389cff",
      };
    }
    return null;
  } catch {
    return null;
  }
};

export const HeroExportPanel: React.FC<HeroExportPanelProps> = ({
  isOpen,
  onClose,
  settings,
  onImportSettings,
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedJSON, setCopiedJSON] = useState(false);
  const [importJSON, setImportJSON] = useState("");
  const [showImport, setShowImport] = useState(false);

  const handleCopyCode = useCallback(async () => {
    const code = generateReactComponent(settings);
    await navigator.clipboard.writeText(code);
    setCopiedCode(true);
    toast.success("React component copied to clipboard!");
    setTimeout(() => setCopiedCode(false), 2000);
  }, [settings]);

  const handleCopyJSON = useCallback(async () => {
    const json = generateSettingsJSON(settings);
    await navigator.clipboard.writeText(json);
    setCopiedJSON(true);
    toast.success("Settings JSON copied to clipboard!");
    setTimeout(() => setCopiedJSON(false), 2000);
  }, [settings]);

  const handleImport = useCallback(() => {
    const parsed = parseSettingsJSON(importJSON);
    if (parsed) {
      onImportSettings(parsed);
      setImportJSON("");
      setShowImport(false);
      toast.success("Settings imported successfully!");
    } else {
      toast.error("Invalid settings JSON");
    }
  }, [importJSON, onImportSettings]);

  const componentCode = generateReactComponent(settings);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="w-full max-w-4xl max-h-[85vh] bg-neutral-950 border border-white/10 rounded-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-500/20 text-orange-400">
                  <Code size={18} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">React Component</h2>
                  <p className="text-xs text-white/50">Export your hero background as code</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/5 text-white/50 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Setup section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Code size={14} className="text-white/50" />
                    <span className="text-sm text-white/70">Install dependencies</span>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText("npm install react");
                      toast.success("Install command copied!");
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white transition-all"
                  >
                    Set up
                  </button>
                </div>
                <div className="bg-black/50 rounded-lg p-3 border border-white/5">
                  <code className="text-xs text-green-400">npm install react</code>
                </div>
              </div>

              {/* Code preview */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileJson size={14} className="text-white/50" />
                    <span className="text-sm text-white/70">Component code</span>
                  </div>
                  <button
                    onClick={handleCopyCode}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                      copiedCode
                        ? "bg-green-500/20 border-green-500/30 text-green-400"
                        : "bg-orange-500/20 border-orange-500/30 text-orange-400 hover:bg-orange-500/30"
                    )}
                  >
                    {copiedCode ? <Check size={14} /> : <Copy size={14} />}
                    {copiedCode ? "Copied!" : "Copy"}
                  </button>
                </div>
                <div className="bg-black/50 rounded-lg p-4 border border-white/5 max-h-64 overflow-y-auto">
                  <pre className="text-xs text-white/80 whitespace-pre-wrap font-mono leading-relaxed">
                    {componentCode}
                  </pre>
                </div>
              </div>

              {/* Settings JSON */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileJson size={14} className="text-white/50" />
                    <span className="text-sm text-white/70">Settings (JSON)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowImport(!showImport)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white transition-all"
                    >
                      <Upload size={14} />
                      Import
                    </button>
                    <button
                      onClick={handleCopyJSON}
                      className={cn(
                        "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                        copiedJSON
                          ? "bg-green-500/20 border-green-500/30 text-green-400"
                          : "bg-cyan-500/20 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/30"
                      )}
                    >
                      {copiedJSON ? <Check size={14} /> : <Download size={14} />}
                      {copiedJSON ? "Copied!" : "Copy JSON"}
                    </button>
                  </div>
                </div>

                {/* Import field */}
                {showImport && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2"
                  >
                    <textarea
                      value={importJSON}
                      onChange={(e) => setImportJSON(e.target.value)}
                      placeholder="Paste settings JSON here..."
                      className="w-full h-24 bg-black/50 rounded-lg p-3 border border-white/10 text-xs text-white/80 font-mono resize-none focus:outline-none focus-visible:outline-none focus:border-white/20 focus:ring-0 focus-visible:ring-0"
                    />
                    <button
                      onClick={handleImport}
                      disabled={!importJSON.trim()}
                      className="px-4 py-2 rounded-lg text-sm font-medium bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Apply Settings
                    </button>
                  </motion.div>
                )}

                <div className="bg-black/50 rounded-lg p-4 border border-white/5 max-h-32 overflow-y-auto">
                  <pre className="text-xs text-white/60 whitespace-pre-wrap font-mono">
                    {generateSettingsJSON(settings)}
                  </pre>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-white/5 flex items-center justify-between flex-shrink-0">
              <p className="text-xs text-white/40">
                Generated code matches the current preview 1:1
              </p>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-all"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default HeroExportPanel;
