import React, { useState, useRef, useEffect, useCallback } from "react";
import { HexColorPicker } from "react-colorful";
import { motion, AnimatePresence } from "framer-motion";

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

  // Force close from parent
  useEffect(() => {
    if (forceClose && open) {
      setOpen(false);
    }
  }, [forceClose, open]);

  const isValidHexColor = useCallback((input: string) => {
    return /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(input);
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
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [open, onOpenChange]);

  const displayColor = isValidHexColor(value) ? value : "#ffffff";

  const handleToggle = () => {
    const newOpen = !open;
    setOpen(newOpen);
    onOpenChange?.(newOpen);
  };

  return (
    <div className="relative w-full">
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
      
      <AnimatePresence>
        {open && (
          <motion.div
            ref={pickerRef}
            initial={{ opacity: 0, scaleX: 0.8, y: -10 }}
            animate={{ opacity: 1, scaleX: 1, y: 0 }}
            exit={{ opacity: 0, scaleX: 0.8, y: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute top-full left-0 mt-2 w-full"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="mb-2">
              <span className="text-[10px] text-white/50 uppercase tracking-wider">{label}</span>
            </div>
            <div style={{ transform: 'scale(0.85)', transformOrigin: 'top left' }}>
              <HexColorPicker color={displayColor} onChange={onChange} />
            </div>
            <input
              type="text"
              className="mt-2 w-full rounded-lg border border-white/15 bg-black/60 px-2 py-1.5 text-xs text-white/90 outline-none focus:outline-none focus-visible:outline-none focus:border-white/30 focus:ring-0 focus-visible:ring-0 transition-colors"
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ColorPickerField;
