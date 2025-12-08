import React from "react";
import ColorPickerField from "./ColorPickerField";
import FontSelect from "./FontSelect";

export type BrandIdentityFields = {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  styleMood: string;
  toneOfVoice: string;
};

type BrandIdentityNodeProps = {
  id: string;
  data: {
    title: string;
    fields: BrandIdentityFields;
    onChange: (fields: BrandIdentityFields) => void;
  };
};

const BrandIdentityNode: React.FC<BrandIdentityNodeProps> = ({ id, data }) => {
  const { fields, onChange } = data;

  const updateField = (key: keyof BrandIdentityFields, value: string) => {
    onChange({ ...fields, [key]: value });
  };

  return (
    <div className="flow-node w-full h-full rounded-xl border border-white/10 bg-gradient-to-br from-[#000000] via-[#050505] to-[#000000] text-white shadow-md flex flex-col">
      {/* Header */}
      <div className="px-4 py-2 border-b border-white/10 flex-shrink-0">
        <span className="node-title text-sm font-semibold text-white">
          Brand Identity
        </span>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-auto px-4 py-3 space-y-3 text-xs leading-relaxed">
        {/* Colors */}
        <section className="space-y-2">
          <p className="text-[10px] uppercase tracking-[0.18em] text-white/40">
            Colors
          </p>
          {/* color pickers row */}
          <div className="grid grid-cols-3 gap-2">
            {/* Primary */}
            <ColorPickerField
              label="Primary"
              value={fields.primaryColor}
              onChange={(value) => updateField("primaryColor", value)}
            />
            {/* Secondary */}
            <ColorPickerField
              label="Secondary"
              value={fields.secondaryColor}
              onChange={(value) => updateField("secondaryColor", value)}
            />
            {/* Accent */}
            <ColorPickerField
              label="Accent"
              value={fields.accentColor}
              onChange={(value) => updateField("accentColor", value)}
            />
          </div>
        </section>

        {/* Font family */}
        <section className="space-y-2">
          <p className="text-[10px] uppercase tracking-[0.18em] text-white/40">
            Font
          </p>
          <FontSelect
            value={fields.fontFamily}
            onChange={(value) => updateField("fontFamily", value)}
          />
        </section>

        {/* Style / mood */}
        <section className="space-y-2">
          <p className="text-[10px] uppercase tracking-[0.18em] text-white/40">
            Style / Moodboard
          </p>
          <textarea
            className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-white/90 placeholder:text-white/30 resize-none outline-none focus:border-white/30 leading-relaxed"
            placeholder="Modern, minimal, high contrast, bold headings..."
            value={fields.styleMood}
            onChange={(e) => updateField("styleMood", e.target.value)}
            style={{ minHeight: "48px" }}
          />
        </section>

        {/* Tone of voice */}
        <section className="space-y-2">
          <p className="text-[10px] uppercase tracking-[0.18em] text-white/40">
            Tone of voice
          </p>
          <textarea
            className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-white/90 placeholder:text-white/30 resize-none outline-none focus:border-white/30 leading-relaxed"
            placeholder="Friendly, expert, playful, premium..."
            value={fields.toneOfVoice}
            onChange={(e) => updateField("toneOfVoice", e.target.value)}
            style={{ minHeight: "48px" }}
          />
        </section>
      </div>
    </div>
  );
};

export default BrandIdentityNode;
