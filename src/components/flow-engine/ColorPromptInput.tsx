import React from "react";
import { cn } from "@/lib/utils";

interface ColorPromptInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const ColorPromptInput: React.FC<ColorPromptInputProps> = ({
  value,
  onChange,
  placeholder = "Describe the mood or drop hex codes…",
  className,
}) => {
  return (
    <input
      type="text"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className={cn(
        "w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/80",
        "placeholder:text-white/30 shadow-[0_0_0_1px_rgba(255,255,255,0.04)]",
        "transition-all duration-200 ease-out",
        "focus:outline-none focus:border-white/25 focus:bg-white/[0.08] focus:text-white",
        "focus:shadow-[0_0_24px_rgba(255,255,255,0.12)]",
        "appearance-none",
        className,
      )}
      autoComplete="off"
      spellCheck={false}
    />
  );
};
