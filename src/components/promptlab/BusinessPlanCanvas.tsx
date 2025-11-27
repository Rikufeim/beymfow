import { useState, useEffect } from "react";

export type BusinessPlan = {
  targetAudience: string;
  offer: string;
  marketing: string;
  pricing: string;
  delivery: string;
  nextMoves: string[];
};

export type BusinessPlanCanvasProps = {
  plan: BusinessPlan;
  onUpdate: (field: keyof BusinessPlan, value: string | string[]) => void;
};

type PlanSectionProps = {
  title: string;
  value: string | string[];
  isList?: boolean;
  onSave: (newValue: string | string[]) => void;
};

const PlanSection = ({ title, value, isList = false, onSave }: PlanSectionProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draftValue, setDraftValue] = useState<string | string[]>(value);

  useEffect(() => {
    if (!isEditing) {
      setDraftValue(value);
    }
  }, [value, isEditing]);

  const handleSave = () => {
    if (isList) {
      const listValue = Array.isArray(draftValue) ? draftValue : [];
      const normalized = listValue.map((item) => item.trim());
      while (normalized.length < 3) {
        normalized.push("");
      }
      onSave(normalized.slice(0, 3));
    } else if (typeof draftValue === "string") {
      onSave(draftValue.trim());
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setDraftValue(value);
    setIsEditing(false);
  };

  const renderDisplayValue = () => {
    if (isList) {
      const items = Array.isArray(value) ? [...value] : [];
      while (items.length < 3) {
        items.push("");
      }
      return (
        <ul className="list-disc list-inside space-y-2 text-white/80 text-sm sm:text-base">
          {items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      );
    }

    return (
      <p className="text-white/80 text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
        {typeof value === "string" ? value : ""}
      </p>
    );
  };

  const renderEditor = () => {
    if (isList) {
      const listValue = Array.isArray(draftValue) ? draftValue : [];
      const inputs = [...listValue];
      while (inputs.length < 3) {
        inputs.push("");
      }

      return (
        <div className="space-y-3">
          {inputs.slice(0, 3).map((item, index) => (
            <input
              key={index}
              value={item}
              onChange={(event) => {
                const updated = [...inputs];
                updated[index] = event.target.value;
                setDraftValue(updated);
              }}
              className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm sm:text-base text-white placeholder:text-white/50 focus:outline-none focus:border-white/40"
              placeholder={`Step ${index + 1}`}
            />
          ))}
        </div>
      );
    }

    return (
      <textarea
        value={typeof draftValue === "string" ? draftValue : ""}
        onChange={(event) => setDraftValue(event.target.value)}
        className="w-full min-h-[120px] bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm sm:text-base text-white placeholder:text-white/50 focus:outline-none focus:border-white/40"
      />
    );
  };

  return (
    <div className="bg-black/60 border border-white/15 rounded-xl p-4 sm:p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs sm:text-sm font-semibold tracking-widest text-white/70">
          {title}
        </h3>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                className="px-3 py-1 text-xs font-semibold uppercase rounded-full border border-cyan-400/40 text-cyan-200 hover:bg-cyan-500/10 transition"
              >
                Save
              </button>
              <button
                onClick={handleCancel}
                className="px-3 py-1 text-xs font-semibold uppercase rounded-full border border-white/20 text-white/70 hover:bg-white/10 transition"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                setIsEditing(true);
                setDraftValue(value);
              }}
              className="px-3 py-1 text-xs font-semibold uppercase rounded-full border border-white/20 text-white/70 hover:bg-white/10 transition"
            >
              Edit
            </button>
          )}
        </div>
      </div>

      <div>{isEditing ? renderEditor() : renderDisplayValue()}</div>
    </div>
  );
};

const BusinessPlanCanvas = ({ plan, onUpdate }: BusinessPlanCanvasProps) => {
  return (
    <div className="p-6 sm:p-8 rounded-2xl bg-black border border-white/10 shadow-[0_0_45px_rgba(148,163,184,0.22)] transition-all duration-500 space-y-5 sm:space-y-6">
      <PlanSection
        title="TARGET AUDIENCE"
        value={plan.targetAudience}
        onSave={(newValue) =>
          onUpdate("targetAudience", typeof newValue === "string" ? newValue : "")
        }
      />
      <PlanSection
        title="OFFER"
        value={plan.offer}
        onSave={(newValue) =>
          onUpdate("offer", typeof newValue === "string" ? newValue : "")
        }
      />
      <PlanSection
        title="MARKETING"
        value={plan.marketing}
        onSave={(newValue) =>
          onUpdate("marketing", typeof newValue === "string" ? newValue : "")
        }
      />
      <PlanSection
        title="PRICING"
        value={plan.pricing}
        onSave={(newValue) =>
          onUpdate("pricing", typeof newValue === "string" ? newValue : "")
        }
      />
      <PlanSection
        title="DELIVERY"
        value={plan.delivery}
        onSave={(newValue) =>
          onUpdate("delivery", typeof newValue === "string" ? newValue : "")
        }
      />
      <PlanSection
        title="NEXT MOVES"
        value={plan.nextMoves}
        isList
        onSave={(newValue) =>
          onUpdate(
            "nextMoves",
            Array.isArray(newValue) ? newValue : plan.nextMoves
          )
        }
      />
    </div>
  );
};

export default BusinessPlanCanvas;
