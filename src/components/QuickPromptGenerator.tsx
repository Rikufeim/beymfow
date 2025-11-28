import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Zap, Settings, Send, Plus, Crown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GeneratedPromptDisplay } from "./GeneratedPromptDisplay";

export const QuickPromptGenerator = () => {
  const { user, usageInfo } = useAuth();
  const navigate = useNavigate();

  const [input, setInput] = useState("");
  const [selectedModel, setSelectedModel] = useState<"fast" | "advanced" | "premium">("fast");
  const [selectedCategory, setSelectedCategory] = useState<"all" | "creativity" | "personal" | "business" | "crypto">(
    "all",
  );
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const placeholders = ["your idea......", "Start your business now......", "Enter your first thought......"];

  const categoryColors = {
    all: "border-white/20 hover:border-white/30",
    crypto: "border-green-500/40 hover:border-green-500/60",
    business: "border-cyan-500/40 hover:border-cyan-500/60",
    personal: "border-red-500/40 hover:border-red-500/60",
    creativity: "border-purple-500/40 hover:border-purple-500/60",
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  useEffect(() => {
    if (isFocused || input.trim()) {
      setDisplayedText("");
      return;
    }
    const currentText = placeholders[placeholderIndex];
    const timeout = setTimeout(
      () => {
        if (!isDeleting) {
          if (displayedText.length < currentText.length) {
            setDisplayedText(currentText.slice(0, displayedText.length + 1));
          } else {
            setTimeout(() => setIsDeleting(true), 2000);
          }
        } else {
          if (displayedText.length > 0) {
            setDisplayedText(displayedText.slice(0, -1));
          } else {
            setIsDeleting(false);
            setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
          }
        }
      },
      isDeleting ? 50 : 100,
    );
    return () => clearTimeout(timeout);
  }, [displayedText, isDeleting, placeholderIndex, isFocused, input]);

  useEffect(() => {
    if (!isFocused && !input.trim()) {
      setDisplayedText("");
      setIsDeleting(false);
      setPlaceholderIndex(0);
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  }, [isFocused, input]);

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

    if ((selectedModel === "advanced" || selectedModel === "premium") && !user) {
      toast.error("Please sign in to use Advanced or Premium models");
      navigate("/auth");
      return;
    }
    if (selectedModel === "premium" && usageInfo?.subscriptionTier !== "premium") {
      toast.error("Premium model requires Beymflow Premium subscription");
      navigate("/premium");
      return;
    }

    setIsLoading(true);
    setGeneratedPrompt("");

    try {
      let finalInput = input;
      if (selectedModel === "fast") {
        // Lisäohje Fast-mallille kattavuuden parantamiseksi
        finalInput = `${input} (Create a comprehensive and detailed prompt based on this idea, aiming for maximum clarity and actionable steps)`;
      }

      const { data, error } = await supabase.functions.invoke("quick-prompt", {
        body: {
          userInput: finalInput,
          model: selectedModel,
          category: selectedCategory !== "all" ? selectedCategory : undefined,
        },
      });

      if (error) throw error;

      if (data?.error) {
        if (data.error.includes("Rate limit")) {
          toast.error("Rate limit exceeded. Please try again.");
        } else if (data.error.includes("Payment required")) {
          toast.error("Credits required.");
        } else {
          toast.error("Failed to generate prompt.");
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
      toast.error("Failed to generate prompt.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && input.trim()) {
        handleGenerate();
      }
    }
  };

  const clearPrompt = () => {
    setGeneratedPrompt("");
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    toast.success("Cleared!");
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2"></div>

      <div className="relative">
        <div
          className={`flex items-end gap-2 sm:gap-3 bg-transparent rounded-[2rem] px-3 sm:px-4 py-3 border transition-all duration-300 ${categoryColors[selectedCategory]}`}
        >
          <div className="pb-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex-shrink-0 px-2 py-1 rounded-full bg-white/5 backdrop-blur-md border border-white/20 text-white/70 hover:border-white/30 hover:text-white hover:bg-white/10 transition-all duration-300 h-8 w-8 flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-black/60 backdrop-blur-md border-white/10 z-50 w-48">
                <DropdownMenuItem
                  onClick={() => toast.info("Feature coming soon")}
                  className="text-white cursor-pointer hover:bg-white/10"
                >
                  Attach file
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => toast.info("Prompt Library feature coming soon")}
                  className="text-white cursor-pointer hover:bg-white/10"
                >
                  Open Prompt Library
                </DropdownMenuItem>
                <div className="border-t border-white/10 my-2" />
                <div className="px-2 py-2">
                  <p className="text-xs font-semibold text-white/50 mb-2 px-2">CATEGORIES</p>
                  <div className="space-y-1">
                    {(["all", "creativity", "personal", "business", "crypto"] as const).map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`w-full text-left px-3 py-1.5 text-xs rounded transition-all capitalize ${selectedCategory === cat ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/10"}`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="relative flex-1 min-w-0">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={displayedText}
              rows={1}
              className="w-full bg-transparent border-none outline-none text-sm sm:text-base text-white placeholder:text-white/50 resize-none overflow-hidden py-2 leading-relaxed text-left"
              style={{ minHeight: "24px", maxHeight: "200px" }}
              maxLength={2000}
            />
          </div>

          <div className="pb-1">
            <button
              onClick={handleGenerate}
              disabled={isLoading || !input.trim()}
              className="flex-shrink-0 px-2 py-1 rounded-full bg-white/5 backdrop-blur-md border border-white/20 text-white/70 hover:border-white/30 hover:text-white hover:bg-white/10 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed h-8 w-8 flex items-center justify-center"
            >
              {isLoading ? (
                <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
        <Button
          variant="outline"
          size="sm"
          className={`rounded-full px-4 py-2 text-xs sm:text-sm bg-white/5 backdrop-blur-md transition-all duration-300 ${selectedModel === "fast" ? "border-white/40 text-white shadow-[0_0_10px_rgba(255,255,255,0.2)]" : "border-white/20 text-white/70 hover:border-white/30 hover:text-white hover:bg-white/10"}`}
          onClick={() => setSelectedModel("fast")}
        >
          <Zap className="w-3 h-3 mr-1.5" />
          Fast Model
        </Button>
        <Button
          variant="outline"
          size="sm"
          className={`rounded-full px-4 py-2 text-xs sm:text-sm bg-white/5 backdrop-blur-md transition-all duration-300 ${selectedModel === "advanced" ? "border-white/40 text-white shadow-[0_0_10px_rgba(255,255,255,0.2)]" : "border-white/20 text-white/70 hover:border-white/30 hover:text-white hover:bg-white/10"}`}
          onClick={() => setSelectedModel("advanced")}
        >
          <Settings className="w-3 h-3 mr-1.5" />
          Advanced Model
        </Button>
        <Button
          variant="outline"
          size="sm"
          className={`rounded-full px-4 py-2 text-xs sm:text-sm bg-white/5 backdrop-blur-md transition-all duration-300 ${selectedModel === "premium" ? "border-yellow-500/60 text-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.4)]" : "border-yellow-500/30 text-yellow-400/70 hover:border-yellow-500/50 hover:text-yellow-400 hover:bg-white/10"}`}
          onClick={() => setSelectedModel("premium")}
        >
          <Crown className="w-3 h-3 mr-1.5" />
          Beymflow Premium
        </Button>
      </div>

      <GeneratedPromptDisplay
        prompt={generatedPrompt}
        selectedModel={selectedModel}
        selectedCategory={selectedCategory}
        onPromptUpdate={setGeneratedPrompt}
        onClear={clearPrompt}
      />
    </div>
  );
};
