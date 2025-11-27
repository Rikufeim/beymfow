import { useState } from "react";
import { Lock, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import BusinessPlanCanvas, {
  BusinessPlan,
} from "@/components/promptlab/BusinessPlanCanvas";

interface BusinessGeneratorProps {
  businessPlan: BusinessPlan | null;
  onPlanGenerated: (plan: BusinessPlan) => void;
  onPlanUpdate: (field: keyof BusinessPlan, value: string | string[]) => void;
}

const ComingSoonCard = () => (
  <div className="p-6 sm:p-8 rounded-2xl bg-black border border-white/10 shadow-[0_0_45px_rgba(148,163,184,0.22)] transition-all duration-500 relative overflow-hidden">
    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm rounded-2xl flex items-center justify-center z-10 border border-white/10">
      <div className="text-center space-y-4">
        <Lock className="w-12 h-12 text-white/50 mx-auto" />
        <p className="text-white/80 font-bold text-lg">Coming Soon</p>
        <p className="text-white/60 text-sm">Video generation will be available soon</p>
      </div>
    </div>

    <div className="opacity-30 pointer-events-none">
      <textarea
        placeholder="Describe the animation you want to create..."
        className="w-full min-h-[120px] sm:min-h-[150px] bg-black/60 border border-white/15 rounded-xl p-4 text-white placeholder:text-white/50 resize-none"
        disabled
      />
    </div>
  </div>
);

export const BusinessGenerator = ({
  businessPlan,
  onPlanGenerated,
  onPlanUpdate,
}: BusinessGeneratorProps) => {
  const [idea, setIdea] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    if (!idea.trim() || isLoading) {
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("business-plan", {
        body: { idea: idea.trim() },
      });

      if (error) {
        console.error("Business plan generation failed", error);
        return;
      }

      const rawPlan = data?.plan;

      if (typeof rawPlan !== "string") {
        return;
      }

      try {
        const parsedPlan = JSON.parse(rawPlan);
        onPlanGenerated(parsedPlan);
        setIdea("");
      } catch (parseError) {
        console.error("Failed to parse business plan", parseError);
      }
    } catch (invokeError) {
      console.error("Unexpected error generating business plan", invokeError);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="p-6 sm:p-8 rounded-2xl bg-black border border-white/10 shadow-[0_0_45px_rgba(148,163,184,0.22)] transition-all duration-500 space-y-6">
        <div className="flex items-center gap-2 sm:gap-3 bg-black/60 rounded-full px-3 sm:px-4 py-3 sm:py-4 border border-white/15 transition-all duration-300 focus-within:border-white/30">
          <div className="relative flex-1">
            <input
              type="text"
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isLoading && idea.trim()) {
                  handleGenerate();
                }
              }}
              placeholder="Describe your idea. We'll build you a business model, offer and angle."
              className="w-full bg-transparent border-none outline-none text-sm sm:text-base text-white placeholder:text-white/50"
              maxLength={1000}
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={isLoading || !idea.trim()}
            className="flex-shrink-0 px-3 py-1.5 rounded-full border border-white/15 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
          </button>
        </div>
      </div>

      {businessPlan ? (
        <BusinessPlanCanvas plan={businessPlan} onUpdate={onPlanUpdate} />
      ) : (
        <ComingSoonCard />
      )}
    </div>
  );
};

export default BusinessGenerator;
