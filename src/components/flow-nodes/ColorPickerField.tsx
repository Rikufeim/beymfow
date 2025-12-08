import React, { useState, useRef, useEffect } from "react";
import { HexColorPicker } from "react-colorful";

type ColorPickerFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

const ColorPickerField: React.FC<ColorPickerFieldProps> = ({
  label,
  value,
  onChange,
}) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  const displayColor = value || "#ffffff";

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        onMouseDown={(e) => e.stopPropagation()}
        className="flex flex-col items-start gap-1 w-full"
      >
        <span className="text-[10px] text-white/40 uppercase tracking-[0.16em]">
          {label}
        </span>
        <div className="flex items-center gap-2 w-full rounded-full border border-white/15 bg-black/50 px-2 py-1">
          <span
            className="h-4 w-4 rounded-full border border-white/40 flex-shrink-0"
            style={{ backgroundColor: displayColor }}
          />
          <span className="text-[11px] text-white/80 truncate flex-1">
            {displayColor}
          </span>
        </div>
      </button>
      {open && (
        <div 
          className="absolute z-50 mt-2 rounded-lg border border-white/10 bg-[#111] p-3 shadow-xl"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <HexColorPicker color={displayColor} onChange={onChange} />
          <input
            type="text"
            className="mt-2 w-full rounded-md border border-white/15 bg-black/60 px-2 py-1 text-xs text-white/90 outline-none focus:border-white/30"
            value={value || ""}
            onMouseDown={(e) => e.stopPropagation()}
            onChange={(e) => {
              const hex = e.target.value;
              // Validate hex color
              if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex) || hex === "") {
                onChange(hex);
              }
            }}
            placeholder="#ffffff"
          />
        </div>
      )}
    </div>
  );
};

export default ColorPickerField;

