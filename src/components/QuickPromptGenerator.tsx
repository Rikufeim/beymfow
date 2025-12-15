import { useState, useEffect, useRef } from "react";
import { GlassButton } from "@/components/ui/glass-button";
import { Zap, Settings, Send, Plus, Crown, X, Image as ImageIcon, Loader2 } from "lucide-react";
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
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { motion, AnimatePresence } from "framer-motion";

export const QuickPromptGenerator = () => {
  const { user, usageInfo } = useAuth();
  const navigate = useNavigate();

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey =
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    import.meta.env.VITE_SUPABASE_ANON_KEY;
  const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);
  const analyzeEndpoint = supabaseUrl ? `${supabaseUrl}/functions/v1/analyze-image-for-prompt` : null;

  const [input, setInput] = useState("");
  const [selectedModel, setSelectedModel] = useState<"fast" | "advanced" | "premium">("fast");
  const [selectedCategory, setSelectedCategory] = useState<"all" | "creativity" | "personal" | "business" | "crypto">(
    "all",
  );
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);

  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [showCursor, setShowCursor] = useState(true);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pauseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const switchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const placeholders = ["your idea......", "Start your business now......", "Enter your first thought......"];

  // Cursor blink animation
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 530);
    return () => clearInterval(cursorInterval);
  }, []);

  const categoryColors = {
    all: "border-white/20 hover:border-white/30",
    crypto: "border-neutral-500/40 hover:border-neutral-500/60",
    business: "border-neutral-500/40 hover:border-neutral-500/60",
    personal: "border-neutral-500/40 hover:border-neutral-500/60",
    creativity: "border-neutral-500/40 hover:border-neutral-500/60",
  };

  const getCategoryGradient = (category: typeof selectedCategory) => {
    // Kaikki kategoriat käyttävät nyt harmaata gradienttia
    return `radial-gradient(circle at 10% 0%, #737373 0%, #73737300 30%),
            radial-gradient(circle at 80% 20%, #a3a3a3 0%, #a3a3a300 35%),
            radial-gradient(circle at 20% 80%, #737373 0%, #73737300 35%), 
            radial-gradient(circle at 90% 90%, #737373 0%, #73737300 40%),
            repeating-conic-gradient(
              from 236.84deg at 50% 50%,
              #737373 0%,
              #a3a3a3 calc(33.33% / 5),
              #737373 calc(66.66% / 5), 
              #737373 calc(100% / 5)
            )`;
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
      if (pauseTimeoutRef.current) {
        clearTimeout(pauseTimeoutRef.current);
        pauseTimeoutRef.current = null;
      }
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
        animationTimeoutRef.current = null;
      }
      if (switchTimeoutRef.current) {
        clearTimeout(switchTimeoutRef.current);
        switchTimeoutRef.current = null;
      }
      return;
    }
    
    const currentText = placeholders[placeholderIndex];
    
    // If text is complete and we're not deleting yet, wait before starting to delete
    if (!isDeleting && displayedText.length === currentText.length) {
      if (!pauseTimeoutRef.current) {
        pauseTimeoutRef.current = setTimeout(() => {
          setIsDeleting(true);
          pauseTimeoutRef.current = null;
        }, 3000);
      }
      return;
    }
    
    // Dynamic speed calculation for smoother, more natural animation
    const getTypingSpeed = (position: number, totalLength: number) => {
      // Natural typing rhythm: smooth and flowing
      const progress = position / totalLength;
      // Add slight randomness for natural feel
      const baseRandom = Math.random() * 25;
      
      if (progress < 0.2) return 150 + baseRandom; // Gentle start: 150-175ms
      if (progress < 0.8) return 100 + baseRandom; // Comfortable flow: 100-125ms
      return 120 + baseRandom; // Gentle finish: 120-145ms
    };
    
    const getDeletingSpeed = (remainingLength: number, totalLength: number) => {
      // Smooth deleting: consistent and flowing
      const progress = remainingLength / totalLength;
      const baseRandom = Math.random() * 20;
      
      if (progress > 0.7) return 60 + baseRandom; // Smooth start: 60-80ms
      if (progress > 0.4) return 50 + baseRandom; // Steady middle: 50-70ms
      return 45 + baseRandom; // Slightly faster end: 45-65ms
    };
    
    const speed = isDeleting
      ? getDeletingSpeed(displayedText.length, currentText.length)
      : getTypingSpeed(displayedText.length, currentText.length);
    
    animationTimeoutRef.current = setTimeout(
      () => {
        if (!isDeleting) {
          if (displayedText.length < currentText.length) {
            setDisplayedText(currentText.slice(0, displayedText.length + 1));
          }
        } else {
          if (displayedText.length > 0) {
            setDisplayedText(displayedText.slice(0, -1));
          } else {
            // Small pause before switching to next placeholder for smooth flow
            switchTimeoutRef.current = setTimeout(() => {
              setIsDeleting(false);
              setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
              switchTimeoutRef.current = null;
            }, 400);
          }
        }
      },
      speed,
    );
    
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
        animationTimeoutRef.current = null;
      }
      if (pauseTimeoutRef.current) {
        clearTimeout(pauseTimeoutRef.current);
        pauseTimeoutRef.current = null;
      }
      if (switchTimeoutRef.current) {
        clearTimeout(switchTimeoutRef.current);
        switchTimeoutRef.current = null;
      }
    };
  }, [displayedText, isDeleting, placeholderIndex, isFocused, input]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [isFocused, input]);

  // Reset animation when focus changes
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [isFocused, input]);

  useEffect(() => {
    if (!input.trim() && !imageFile) {
      setGeneratedPrompt("");
    }
  }, [input, imageFile]);

  // Handle paste image
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          e.preventDefault();
          const file = items[i].getAsFile();
          if (file) {
            handleImageSelect(file);
          }
          break;
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, []);

  const MAX_IMAGE_BYTES = 3.5 * 1024 * 1024; // ~3.5MB raw -> ~4.9MB base64 (<5MB Edge limit)
  const MAX_IMAGE_BASE64_LENGTH = 5 * 1024 * 1024; // mirrors backend validator

  const handleImageSelect = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Keep raw file small enough so the base64 payload stays under the 5MB Edge cap
    if (file.size > MAX_IMAGE_BYTES) {
      toast.error("Image must be under ~3.5MB to analyze");
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;

      // Defensive: if encoding still pushes us over the 5MB string limit, block before calling Edge
      if (result.length > MAX_IMAGE_BASE64_LENGTH) {
        toast.error("Encoded image is too large. Please choose a smaller image (<~3.5MB).");
        setImageFile(null);
        setImagePreview(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }

      setImagePreview(result);
    };
    reader.readAsDataURL(file);
    toast.success("Image added! Click 'Analyze & fill prompt' to analyze it.");
  };

  const handleImageRemove = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageSelect(file);
    }
  };

  // Analyze image and populate prompt input
  const handleAnalyzeImage = async () => {
    if (!isSupabaseConfigured) {
      toast.error("Supabase ei ole konfiguroitu (VITE_SUPABASE_URL / KEY puuttuu).");
      return;
    }

    if (!imagePreview) {
      toast.error("Please select an image first");
      return;
    }

    setIsAnalyzingImage(true);
    try {
      const invokeAttempt = async () => {
        const { data, error } = await supabase.functions.invoke("analyze-image-for-prompt", {
          body: {
            image: imagePreview,
          },
        });
        return { data, error };
      };

      const fetchFallback = async () => {
        if (!analyzeEndpoint || !supabaseKey) {
          throw new Error("Analyze endpoint not configured");
        }
        const resp = await fetch(analyzeEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${supabaseKey}`,
          },
          body: JSON.stringify({ image: imagePreview }),
        });
        let json: any = null;
        try {
          json = await resp.json();
        } catch {
          /* ignore */
        }
        if (!resp.ok) {
          const msg = json?.error || `HTTP ${resp.status}`;
          throw new Error(msg);
        }
        return { data: json, error: null as any };
      };

      let result;
      try {
        result = await invokeAttempt();
      } catch (err) {
        console.error("Supabase invoke network error, trying fetch fallback", err);
        result = await fetchFallback();
      }

      const { data, error } = result;

      if (error) {
        console.error("Supabase analyze-image error:", error);
        toast.error(error.message || "Failed to analyze image");
        return;
      }

      if (data?.error) {
        if (data.error.includes("Rate limit")) {
          toast.error("Rate limit exceeded. Please try again.");
        } else if (data.error.includes("Payment required")) {
          toast.error("Credits required.");
        } else {
          toast.error(data.error || "Failed to analyze image");
        }
        return;
      }

      if (data?.prompt) {
        // Set the generated prompt to display area (same format as other prompts)
        setGeneratedPrompt(data.prompt);
        toast.success("Image analyzed! Prompt generated.");
      } else {
        toast.error("No prompt generated. Please try again.");
      }
    } catch (error) {
      console.error("Error analyzing image:", error);
      toast.error(error instanceof Error ? error.message : "Failed to analyze image. Please try again.");
    } finally {
      setIsAnalyzingImage(false);
    }
  };

  const handleGenerate = async () => {
    if (!input.trim() && !imagePreview) {
      toast.error("Please enter what you want the AI to do or add an image");
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
      let finalInput = input.trim() || "Analyze this image and create a detailed prompt that can recreate this design with high fidelity.";

      // Add instruction for fast model
      if (selectedModel === "fast" && !imagePreview) {
        finalInput = `${input} (Create a comprehensive and detailed prompt based on this idea, aiming for maximum clarity and actionable steps)`;
      }

      // Prepare body with optional image
      const requestBody: Record<string, unknown> = {
        userInput: finalInput,
        model: selectedModel,
        category: selectedCategory !== "all" ? selectedCategory : undefined,
      };

      // If image is present, include it in the request
      if (imagePreview && imageFile) {
        // Extract base64 and mime type from data URL
        const mimeMatch = imagePreview.match(/^data:(image\/[^;]+);base64,(.+)$/);
        if (mimeMatch) {
          requestBody.imageMimeType = mimeMatch[1];
          requestBody.image = mimeMatch[2];
        }
      }

      const { data, error } = await supabase.functions.invoke("quick-prompt", {
        body: requestBody,
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
    setImageFile(null);
    setImagePreview(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 relative p-6 rounded-3xl">
      <GlowingEffect
        variant="white"
        glow={true}
        disabled={false}
        className="absolute inset-0 rounded-3xl"
        borderWidth={1}
        spread={40}
        movementDuration={3}
      />
      <div className="relative z-10">
        <div className="text-center space-y-2"></div>

      <div className="relative">
        <GlowingEffect
          spread={60}
          glow
          disabled={true}
          proximity={40}
          inactiveZone={0.2}
          borderWidth={3}
          className="opacity-70 rounded-[2rem]"
          variant="default"
        />
        <div
          className="relative flex flex-col gap-2 bg-transparent rounded-[2rem] px-3 sm:px-4 py-4 border border-white/10 transition-all duration-300"
        >
          {/* Image Preview - Top Left with Analyze Button */}
          {imagePreview && (
            <div className="flex items-start gap-2 mb-2">
              <div className="relative group">
                <button
                  onClick={() => setShowImageModal(true)}
                  className="relative w-10 h-10 rounded-lg overflow-hidden border border-white/10 hover:border-white/20 transition-colors cursor-pointer flex-shrink-0"
                >
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleImageRemove();
                  }}
                  className="absolute -top-1 -right-1 p-0.5 rounded-full bg-black/80 hover:bg-black border border-white/20 text-white transition-colors"
                  title="Remove image"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </div>
              {/* Analyze button next to image preview */}
              <button
                onClick={handleAnalyzeImage}
                disabled={isAnalyzingImage}
                className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/20 text-white/80 hover:bg-white/10 hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm flex items-center gap-2"
              >
                {isAnalyzingImage ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-3 h-3" />
                    Analyze & fill prompt
                  </>
                )}
              </button>
            </div>
          )}

          <div className="flex items-start gap-2 sm:gap-3">
            <div className="pt-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInputChange}
                className="hidden"
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex-shrink-0 rounded-full bg-white/5 backdrop-blur-md border border-white/20 text-white/70 hover:border-white/30 hover:text-white hover:bg-white/10 transition-all duration-300 h-8 w-8 flex items-center justify-center p-0">
                    <Plus className="w-4 h-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-black/60 backdrop-blur-md border-white/10 z-50 w-48">
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
                    <div className="border-t border-white/10 my-2"></div>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full text-left px-3 py-1.5 text-xs rounded transition-all text-white/70 hover:bg-white/10 flex items-center gap-2"
                    >
                      <ImageIcon className="w-3 h-3" />
                      Upload Image
                    </button>
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
                placeholder=""
                rows={1}
                className="w-full bg-transparent border-none outline-none text-sm sm:text-base text-white resize-none overflow-hidden py-2 leading-relaxed text-left"
                style={{ minHeight: "24px", maxHeight: "200px" }}
                maxLength={2000}
              />
              {!input && !isFocused && (
                <div className="absolute inset-0 pointer-events-none flex items-center py-2">
                  <span className="text-sm sm:text-base text-white/50 leading-relaxed transition-opacity duration-150">
                    {displayedText}
                    <span
                      className={`inline-block w-0.5 h-4 sm:h-5 bg-white/50 ml-0.5 align-middle transition-opacity duration-300 ${
                        showCursor ? "opacity-100" : "opacity-0"
                      }`}
                    />
                  </span>
                </div>
              )}
            </div>

            <div className="pt-2">
              <button
                onClick={handleGenerate}
                disabled={isLoading || (!input.trim() && !imageFile)}
                className="flex-shrink-0 rounded-full bg-white/5 backdrop-blur-md border border-white/20 text-white/70 hover:border-white/30 hover:text-white hover:bg-white/10 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed h-8 w-8 flex items-center justify-center p-0"
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
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mt-8">
          <GlassButton
            size="sm"
            onClick={() => setSelectedModel("fast")}
            contentClassName="flex items-center gap-1.5"
            isSelected={selectedModel === "fast"}
          >
            <Zap className="w-3 h-3" />
            Fast Model
          </GlassButton>
          <GlassButton
            size="sm"
            onClick={() => setSelectedModel("advanced")}
            contentClassName="flex items-center gap-1.5"
            isSelected={selectedModel === "advanced"}
          >
            <Settings className="w-3 h-3" />
            Advanced Model
          </GlassButton>
          <GlassButton
            size="sm"
            onClick={() => setSelectedModel("premium")}
            contentClassName="flex items-center gap-1.5"
            isSelected={selectedModel === "premium"}
          >
            <Crown className="w-3 h-3" />
            Beymflow Premium
          </GlassButton>
        </div>

        <GeneratedPromptDisplay
          prompt={generatedPrompt}
          selectedModel={selectedModel}
          selectedCategory={selectedCategory}
          onPromptUpdate={setGeneratedPrompt}
          onClear={clearPrompt}
        />
      </div>

      {/* Image Modal */}
      <AnimatePresence>
        {showImageModal && imagePreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowImageModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-[98vw] max-h-[98vh] w-full h-full"
            >
              <button
                onClick={() => setShowImageModal(false)}
                className="absolute top-2 right-2 z-10 p-1 rounded-full bg-black/80 hover:bg-black border border-white/30 text-white transition-colors"
                aria-label="Close image preview"
              >
                <X className="w-4 h-4" />
              </button>
              <img
                src={imagePreview}
                alt="Full size preview"
                className="w-full h-full object-contain rounded-lg"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

