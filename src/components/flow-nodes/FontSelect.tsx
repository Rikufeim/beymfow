import React from "react";

export const AVAILABLE_FONTS = [
  { label: "Inter", value: "Inter, system-ui, sans-serif" },
  { label: "Roboto", value: "Roboto, system-ui, sans-serif" },
  { label: "Open Sans", value: '"Open Sans", system-ui, sans-serif' },
  { label: "Lato", value: "Lato, system-ui, sans-serif" },
  { label: "Montserrat", value: "Montserrat, system-ui, sans-serif" },
  { label: "Poppins", value: "Poppins, system-ui, sans-serif" },
  { label: "Playfair Display", value: '"Playfair Display", serif' },
  { label: "Merriweather", value: "Merriweather, serif" },
  { label: "Nunito", value: "Nunito, system-ui, sans-serif" },
  { label: "Ubuntu", value: "Ubuntu, system-ui, sans-serif" },
];

type FontSelectProps = {
  value: string;
  onChange: (value: string) => void;
};

const FontSelect: React.FC<FontSelectProps> = ({ value, onChange }) => {
  const current =
    AVAILABLE_FONTS.find((f) => f.value === value) ?? AVAILABLE_FONTS[0];

  return (
    <div className="space-y-2">
      <select
        className="dark-select w-full"
        value={current.value}
        onChange={(e) => onChange(e.target.value)}
        style={{ fontFamily: current.value }}
      >
        {AVAILABLE_FONTS.map((font) => (
          <option
            key={font.value}
            value={font.value}
            style={{ fontFamily: font.value }}
          >
            {font.label}
          </option>
        ))}
      </select>
      {/* Live preview line */}
      <div
        className="rounded-md border border-white/10 bg-black/40 px-3 py-1.5 text-[11px] text-white/80"
        style={{ fontFamily: current.value }}
      >
        Aa Bb Cc – {current.label} preview
      </div>
    </div>
  );
};

export default FontSelect;





