import { GlassButton } from "@/components/ui/glass-button";
import { Sparkles, Copy, Check, X } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/lib/notifications";

interface GeneratedPromptDisplayProps {
  prompt: string;
  selectedModel: "fast" | "advanced" | "premium";
  selectedCategory: "all" | "creativity" | "personal" | "business" | "crypto";
  onPromptUpdate: (newPrompt: string) => void;
  onClear: () => void;
}

export const GeneratedPromptDisplay = ({
  prompt,
  selectedModel,
  selectedCategory,
  onPromptUpdate,
  onClear,
}: GeneratedPromptDisplayProps) => {
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [displayedPrompt, setDisplayedPrompt] = useState("");

  useEffect(() => {
    if (!prompt) {
      setDisplayedPrompt("");
      return;
    }
    setDisplayedPrompt("");
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex >= prompt.length) {
        clearInterval(interval);
        setDisplayedPrompt(prompt);
        return;
      }
      // Faster typing: 5 chars per 10ms
      const chunk = 5;
      setDisplayedPrompt(prompt.substring(0, currentIndex + chunk));
      currentIndex += chunk;
    }, 10);
    return () => clearInterval(interval);
  }, [prompt]);

  const handleEnhancePrompt = async () => {
    if (!prompt.trim()) {
      toast.error("Please generate a prompt first");
      return;
    }

    setIsEnhancing(true);
    try {
      const { data, error } = await supabase.functions.invoke("quick-prompt", {
        body: {
          userInput: prompt,
          model: selectedModel,
          category: selectedCategory !== "all" ? selectedCategory : undefined,
          isEnhancement: true,
        },
      });

      if (error) throw error;

      if (data?.error) {
        toast.error(data.error);
        return;
      }

      if (data?.prompt) {
        onPromptUpdate(data.prompt);
        toast.success("Prompt enhanced!");
      } else {
        toast.error("No enhanced prompt received. Please try again.");
      }
    } catch (error) {
      console.error("Error enhancing prompt:", error);
      toast.error("Failed to enhance prompt.");
    } finally {
      setIsEnhancing(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-8 min-h-[200px]">
      {!prompt ? (
        <div className="min-h-[200px]" />
      ) : (
        <div className="animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-base sm:text-lg font-bold text-white">Your prompt:</h4>
            <div className="flex items-center gap-2">
              <GlassButton
                size="sm"
                onClick={handleEnhancePrompt}
                disabled={isEnhancing}
                contentClassName="flex items-center gap-2"
              >
                {isEnhancing ? (
                  <div className="w-3 h-3 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                ) : (
                  <Sparkles className="w-3 h-3" />
                )}
                Enhance
              </GlassButton>
              <GlassButton
                size="sm"
                onClick={copyToClipboard}
                contentClassName="flex items-center gap-2"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? "Copied" : "Copy"}
              </GlassButton>
              <GlassButton
                size="sm"
                onClick={onClear}
                contentClassName="flex items-center gap-2"
              >
                <X className="w-3 h-3" />
                Delete
              </GlassButton>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-black/30 backdrop-blur-md border border-white/10">
            <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap text-white/90 text-left">
              {displayedPrompt}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
