import React, { useState, useRef, useEffect, useCallback } from "react";
import { HexColorPicker } from "react-colorful";
import { createPortal } from "react-dom";

type ColorPickerFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onOpenChange?: (isOpen: boolean) => void;
  forceClose?: boolean;
};

const ColorPickerField: React.FC<ColorPickerFieldProps> = ({
  label,
  value,
  onChange,
  onOpenChange,
  forceClose,
}) => {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  const [pickerPosition, setPickerPosition] = useState({ top: 0, left: 0 });

  // Force close from parent
  useEffect(() => {
    if (forceClose && open) {
      setOpen(false);
    }
  }, [forceClose, open]);

  // Calculate position for picker to open ABOVE the button
  const updatePosition = useCallback(() => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const pickerHeight = 280; // Approximate height of picker
      const pickerWidth = 220;
      
      // Position above the button
      let top = rect.top - pickerHeight - 8;
      let left = rect.left + (rect.width / 2) - (pickerWidth / 2);
      
      // Keep within viewport bounds
      if (top < 10) {
        top = rect.bottom + 8; // Fall back to below if not enough space above
      }
      if (left < 10) {
        left = 10;
      }
      if (left + pickerWidth > window.innerWidth - 10) {
        left = window.innerWidth - pickerWidth - 10;
      }
      
      setPickerPosition({ top, left });
    }
  }, []);

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        buttonRef.current && 
        !buttonRef.current.contains(event.target as Node) &&
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
        onOpenChange?.(false);
      }
    };

    if (open) {
      updatePosition();
      document.addEventListener("mousedown", handleClickOutside);
      window.addEventListener("scroll", updatePosition, true);
      window.addEventListener("resize", updatePosition);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        window.removeEventListener("scroll", updatePosition, true);
        window.removeEventListener("resize", updatePosition);
      };
    }
  }, [open, updatePosition, onOpenChange]);

  const displayColor = value || "#ffffff";

  const handleToggle = () => {
    const newOpen = !open;
    setOpen(newOpen);
    onOpenChange?.(newOpen);
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
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
      
      {open && createPortal(
        <div 
          ref={pickerRef}
          className="fixed z-[100] rounded-xl border border-white/10 bg-neutral-900 p-4 shadow-2xl"
          style={{ 
            top: pickerPosition.top, 
            left: pickerPosition.left,
            minWidth: 220,
          }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="mb-3">
            <span className="text-xs text-white/50 uppercase tracking-wider">{label}</span>
          </div>
          <HexColorPicker color={displayColor} onChange={onChange} />
          <input
            type="text"
            className="mt-3 w-full rounded-lg border border-white/15 bg-black/60 px-3 py-2 text-sm text-white/90 outline-none focus:border-white/30 transition-colors"
            value={value || ""}
            onMouseDown={(e) => e.stopPropagation()}
            onChange={(e) => {
              const hex = e.target.value;
              // Allow partial input for hex colors
              if (hex === "" || hex.startsWith("#")) {
                onChange(hex);
              } else {
                onChange("#" + hex);
              }
            }}
            placeholder="#ffffff"
          />
        </div>,
        document.body
      )}
    </div>
  );
};

export default ColorPickerField;
