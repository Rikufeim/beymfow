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
      className={`relative rounded-2xl border border-white/10 overflow-hidden transition-all duration-300 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setActiveColorIndex(null);
      }}
      style={{ minHeight: 280 }}
    >
      {/* Gradient Preview */}
      <div
        className="absolute inset-0 transition-all duration-500"
        style={gradientStyle}
      />

      {/* Overlay Content */}
      <div className="relative z-10 h-full flex flex-col justify-between p-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-wider text-white/40">
            Hero Background Preview
          </span>
          {isHovered && (
            <span className="text-[10px] text-white/50 animate-fade-in">
              Click colors to edit
            </span>
          )}
        </div>

        {/* Center text that fades when editing */}
        <div
          className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
            activeColorIndex !== null ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        >
          <span className="text-white/70 text-lg font-medium">
            {isHovered ? "Try it out" : "Hover over me"}
          </span>
        </div>

        {/* Color Picker (appears when a color is selected) */}
        {activeColorIndex !== null && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 animate-scale-in">
            <div className="bg-neutral-900/95 backdrop-blur-xl rounded-xl p-3 border border-white/10 shadow-2xl">
              <HexColorPicker
                color={colors[activeColorIndex]}
                onChange={handleColorChange}
                style={{ width: 160, height: 120 }}
              />
              <div className="mt-2 text-center">
                <span className="text-[10px] text-white/50 uppercase tracking-wider">
                  Color {activeColorIndex + 1}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Controls */}
        <div className="space-y-3">
          {/* Color Pills */}
          <div
            className={`flex gap-2 justify-center transition-all duration-300 ${
              isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            }`}
          >
            {colors.map((color, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveColorIndex(activeColorIndex === index ? null : index);
                }}
                className={`w-6 h-6 rounded-full border-2 transition-all duration-200 hover:scale-110 ${
                  activeColorIndex === index
                    ? "border-white ring-2 ring-white/30"
                    : "border-white/30 hover:border-white/60"
                }`}
                style={{ backgroundColor: color }}
                title={`Color ${index + 1}`}
              />
            ))}
          </div>

          {/* Preset Buttons */}
          <div
            className={`flex gap-2 justify-center transition-all duration-300 delay-75 ${
              isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            }`}
          >
            {PRESETS.map((preset) => (
              <button
                key={preset.name}
                onClick={(e) => {
                  e.stopPropagation();
                  applyPreset(preset.colors);
                }}
                className="px-2 py-1 text-[9px] uppercase tracking-wider rounded-full border border-white/10 bg-black/40 text-white/60 hover:bg-white/10 hover:text-white/90 transition-all duration-200"
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorWorkspaceDemo;
