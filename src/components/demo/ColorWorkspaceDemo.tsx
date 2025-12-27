import React, { useState } from "react";
import { HexColorPicker } from "react-colorful";

const PRESETS = [
  { name: "Carbon", colors: ["#000000", "#1a1a1a", "#389cff", "#8b5cf6"] },
  { name: "Neon Fog", colors: ["#0a0a0a", "#1e293b", "#22d3ee", "#a855f7"] },
  { name: "Sunset", colors: ["#1a1a2e", "#16213e", "#e94560", "#ff6b6b"] },
  { name: "Ocean", colors: ["#0d1b2a", "#1b263b", "#415a77", "#778da9"] },
];

interface ColorWorkspaceDemoProps {
  className?: string;
}

const ColorWorkspaceDemo: React.FC<ColorWorkspaceDemoProps> = ({ className }) => {
  const [colors, setColors] = useState(PRESETS[0].colors);
  const [activeColorIndex, setActiveColorIndex] = useState<number | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleColorChange = (newColor: string) => {
    if (activeColorIndex !== null) {
      const newColors = [...colors];
      newColors[activeColorIndex] = newColor;
      setColors(newColors);
    }
  };

  const applyPreset = (presetColors: string[]) => {
    setColors([...presetColors]);
    setActiveColorIndex(null);
  };

  // Generate gradient background from colors
  const gradientStyle = {
    background: `radial-gradient(ellipse at 30% 40%, ${colors[2]}30 0%, transparent 50%),
                 radial-gradient(ellipse at 70% 60%, ${colors[3]}25 0%, transparent 45%),
                 linear-gradient(135deg, ${colors[0]} 0%, ${colors[1]} 100%)`,
  };

  return (
    <div
      className={`relative rounded-2xl border border-white/10 overflow-hidden bg-neutral-950 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Gradient Preview Area - fixed height to prevent layout shift */}
      <div
        className="w-full h-full min-h-[200px]"
        style={{
          ...gradientStyle,
        }}
      />

      {/* Bottom Control Bar - only render when hovered to avoid layout artifacts */}
      {isHovered && (
        <div
          className="absolute bottom-0 left-0 right-0 bg-neutral-900 border-t border-white/10"
          style={{
            animation: "fadeSlideUp 0.25s ease-out forwards",
          }}
        >
          <div className="p-3 space-y-3">
          {/* Color Picker Row */}
          <div className="flex items-center gap-3">
            {/* Color Buttons */}
            <div className="flex gap-2">
              {colors.map((color, index) => (
                <button
                  key={index}
                  onClick={() => setActiveColorIndex(activeColorIndex === index ? null : index)}
                  className={`w-7 h-7 rounded-full border-2 ${
                    activeColorIndex === index
                      ? "border-white ring-2 ring-white/30"
                      : "border-white/30 hover:border-white/60"
                  }`}
                  style={{
                    backgroundColor: color,
                    transform: activeColorIndex === index ? "scale(1.15)" : "scale(1)",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                  title={`Color ${index + 1}`}
                />
              ))}
            </div>

            {/* Divider */}
            <div className="w-px h-6 bg-white/10" />

            {/* Preset Buttons */}
            <div className="flex gap-1.5 flex-wrap">
              {PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => applyPreset(preset.colors)}
                  className="px-2 py-1 text-[9px] uppercase tracking-wider rounded-full border border-white/10 bg-black/40 text-white/60 hover:bg-white/10 hover:text-white/90"
                  style={{ transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)" }}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Horizontal Color Picker (only mounted when open to avoid lag/layout artifacts) */}
          {isHovered && activeColorIndex !== null && (
            <div className="flex items-center gap-3 pt-2 border-t border-white/10 overflow-hidden">
              <span className="text-[10px] text-white/50 uppercase tracking-wider whitespace-nowrap">
                Color {(activeColorIndex ?? 0) + 1}
              </span>
              <div className="flex-1">
                <HexColorPicker
                  color={colors[activeColorIndex]}
                  onChange={handleColorChange}
                  style={{ width: "100%", height: 80 }}
                />
              </div>
              <div
                className="w-10 h-10 rounded-lg border border-white/20"
                style={{
                  backgroundColor: colors[activeColorIndex],
                  transition: "background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              />
            </div>
          )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ColorWorkspaceDemo;
