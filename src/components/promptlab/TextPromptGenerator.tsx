import { useState, useEffect } from "react";
import { GlassButton } from "@/components/ui/glass-button";
import { Send, Copy, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TextPromptGeneratorProps {
  toolColor: string;
  category: string;
  placeholder: string;
}

export const TextPromptGenerator = ({
  toolColor: _toolColor,
  category,
  placeholder,
}: TextPromptGeneratorProps) => {
  const [input, setInput] = useState("");
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!input.trim()) {
      setGeneratedPrompt("");
    }
  }, [input]);

  const handleGenerate = async () => {
    if (!input.trim()) {
      toast.error("Please enter what you want the AI to do");
      return;
    }

    setIsLoading(true);
    setGeneratedPrompt("");

    try {
      const { data, error } = await supabase.functions.invoke("quick-prompt", {
        body: {
          userInput: input,
          model: "fast",
          category: category,
        },
      });

      if (error) {
        console.error("Supabase function error:", error);
        toast.error("Failed to generate prompt. Please try again in a moment.");
        return;
      }

      if (data?.error) {
        console.error("Edge function returned error:", data.error);
        if (data.error.includes("Rate limit")) {
          toast.error("Rate limit exceeded. Please try again in a moment.");
        } else if (data.error.includes("Payment required")) {
          toast.error("Credits required. Please add credits to continue.");
        } else {
          toast.error("Failed to generate prompt. Please try again.");
        }
        return;
      }

      if (data?.prompt) {
        setGeneratedPrompt(data.prompt);
        toast.success("Prompt generated!");
      } else {
        toast.error("No prompt received. Please try again.");
      }
    } catch (error) {
      console.error("Error generating prompt:", error);
      toast.error("Failed to generate prompt. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedPrompt);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const clearPrompt = () => {
    setGeneratedPrompt("");
    setInput("");
    toast.success("Cleared!");
  };

  return (
    <div className="p-6 sm:p-8 rounded-2xl bg-black border border-white/10 shadow-[0_0_45px_rgba(148,163,184,0.22)] transition-all duration-500 space-y-6">
      <div className="flex items-center gap-2 sm:gap-3 bg-black/60 rounded-full px-3 sm:px-4 py-3 sm:py-4 border border-white/15 transition-all duration-300 focus-within:border-white/30">
        <div className="relative flex-1">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !isLoading && input.trim() && handleGenerate()}
            placeholder={placeholder}
            className="w-full bg-transparent border-none outline-none text-sm sm:text-base text-white placeholder:text-white/50"
            maxLength={1000}
          />
        </div>

        <button
          onClick={handleGenerate}
          disabled={isLoading || !input.trim()}
          className="flex-shrink-0 px-3 py-1.5 rounded-full border border-white/15 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          ) : (
            <Send className="w-4 h-4 sm:w-5 sm:h-5" />
          )}
        </button>
      </div>

      {generatedPrompt && (
        <div className="animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-base sm:text-lg font-bold text-white">Enhanced Prompt:</h4>
            <div className="flex items-center gap-2">
              <GlassButton
                size="sm"
                onClick={copyToClipboard}
                contentClassName="flex items-center gap-2"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
                    Copy
                  </>
                )}
              </GlassButton>
              <GlassButton
                size="sm"
                onClick={clearPrompt}
                contentClassName="flex items-center gap-2"
              >
                <X className="w-3 h-3 sm:w-4 sm:h-4" />
                Delete
              </GlassButton>
            </div>
          </div>
          <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap text-white/80">
            {generatedPrompt}
          </p>
        </div>
      )}
    </div>
  );
};
