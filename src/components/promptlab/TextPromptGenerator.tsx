import { useState, useEffect } from "react";
import { GlassButton } from "@/components/ui/glass-button";
import { Send, Copy, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/lib/notifications";

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
  const [displayedPrompt, setDisplayedPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Streaming effect for the prompt
  useEffect(() => {
    if (!generatedPrompt) {
      setDisplayedPrompt("");
      return;
    }

    setDisplayedPrompt("");
    let i = 0;
    const interval = setInterval(() => {
      setDisplayedPrompt((prev) => {
        if (i >= generatedPrompt.length) {
          clearInterval(interval);
          return generatedPrompt;
        }
        i++;
        return generatedPrompt.slice(0, i);
      });
    }, 15); // Speed of typing

    return () => clearInterval(interval);
  }, [generatedPrompt]);

  const handleGenerate = async () => {
    if (!input.trim()) {
      toast.error("Please enter what you want the AI to do");
      return;
    }

    setIsLoading(true);
    setGeneratedPrompt("");
    setDisplayedPrompt("");

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
    setDisplayedPrompt("");
    setInput("");
    toast.success("Cleared!");
  };

  return (
    <div className="p-6 sm:p-8 rounded-2xl bg-black/30 backdrop-blur-md border border-white/10 shadow-[0_0_45px_rgba(148,163,184,0.1)] transition-all duration-500 space-y-6">
      <div className="flex items-center gap-2 sm:gap-3 bg-black/40 rounded-full px-3 sm:px-4 py-3 sm:py-4 border border-white/10 transition-all duration-300 focus-within:border-white/20 focus-within:bg-black/60 shadow-inner">
        <div className="relative flex-1">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !isLoading && input.trim() && handleGenerate()}
            placeholder={placeholder}
            className="w-full bg-transparent border-none outline-none text-sm sm:text-base text-white placeholder:text-white/40 font-light tracking-wide"
            maxLength={1000}
          />
        </div>

        <button
          onClick={handleGenerate}
          disabled={isLoading || !input.trim()}
          className="flex-shrink-0 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
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
            <h4 className="text-base sm:text-lg font-bold text-white/90">Enhanced Prompt:</h4>
            <div className="flex items-center gap-2">
              <GlassButton
                size="sm"
                onClick={copyToClipboard}
                contentClassName="flex items-center gap-2 bg-white/5 hover:bg-white/10"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
                    <span className="text-green-400">Copied</span>
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
                contentClassName="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-red-400/80 hover:text-red-400"
              >
                <X className="w-3 h-3 sm:w-4 sm:h-4" />
                Delete
              </GlassButton>
            </div>
          </div>
          <div className="relative p-6 rounded-xl bg-white/5 border border-white/10 shadow-inner">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-xl pointer-events-none" />
            <p className="relative text-sm sm:text-base leading-relaxed whitespace-pre-wrap text-white/90 font-light">
              {displayedPrompt}
              {displayedPrompt.length < generatedPrompt.length && (
                <span className="inline-block w-1.5 h-4 ml-1 bg-cyan-400 animate-pulse align-middle" />
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
