import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { GlassButton } from "@/components/ui/glass-button";
import { Zap, Settings, Send, Plus, Crown, Home, ArrowLeft, Image, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/lib/notifications";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GeneratedPromptDisplay } from "@/components/GeneratedPromptDisplay";

interface UploadedImage {
  data: string;
  mimeType: string;
  preview: string;
}

const MAX_IMAGES = 3;

const PromptGeneratorPage = () => {
  const { user, usageInfo } = useAuth();
  const navigate = useNavigate();

  const [input, setInput] = useState("");
  const [selectedModel, setSelectedModel] = useState<"fast" | "advanced" | "premium">("fast");
  const [selectedCategory, setSelectedCategory] = useState<"all" | "creativity" | "personal" | "business" | "crypto">("all");
  const [promptType, setPromptType] = useState<"lovable" | "gemini" | "image">("lovable");
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);

  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const placeholders = ["your idea......", "Start your business now......", "Enter your first thought......"];

  const categoryColors = {
    all: "border-white/20 hover:border-white/30",
    crypto: "border-green-500/40 hover:border-green-500/60",
    business: "border-cyan-500/40 hover:border-cyan-500/60",
    personal: "border-red-500/40 hover:border-red-500/60",
    creativity: "border-purple-500/40 hover:border-purple-500/60",
  };

  const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget;
    target.style.height = "auto";
    const scrollHeight = target.scrollHeight;
    const maxHeight = 200;
    if (scrollHeight <= maxHeight) {
      target.style.height = `${scrollHeight}px`;
      target.style.overflowY = "hidden";
    } else {
      target.style.height = `${maxHeight}px`;
      target.style.overflowY = "auto";
    }
  };

  // Initialize textarea height
  useEffect(() => {
    if (textareaRef.current && !input.trim()) {
      textareaRef.current.style.height = "48px";
    }
  }, []);

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
        textareaRef.current.style.height = "48px";
      }
    }
  }, [isFocused, input]);

  useEffect(() => {
    if (!input.trim()) {
      setGeneratedPrompt("");
    }
  }, [input]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remainingSlots = MAX_IMAGES - uploadedImages.length;
    if (remainingSlots <= 0) {
      toast.error(`Maximum ${MAX_IMAGES} images allowed`);
      return;
    }

    const filesToProcess = Array.from(files).slice(0, remainingSlots);
    
    for (const file of filesToProcess) {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image`);
        continue;
      }
      
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 10MB)`);
        continue;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        const base64Data = result.split(',')[1];
        
        setUploadedImages(prev => [...prev, {
          data: base64Data,
          mimeType: file.type,
          preview: result
        }]);
      };
      reader.readAsDataURL(file);
    }
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleGenerate = async () => {
    if (!input.trim() && uploadedImages.length === 0) {
      toast.error("Please enter what you want the AI to do or upload images");
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
      if (selectedModel === "fast" && !uploadedImages.length) {
        finalInput = `${input} (Create a comprehensive and detailed prompt based on this idea, aiming for maximum clarity and actionable steps)`;
      }

      const requestBody: any = {
        userInput: finalInput || "Analyze these images and create a detailed prompt for generating a similar design.",
        model: selectedModel,
        category: selectedCategory !== "all" ? selectedCategory : undefined,
        promptType: promptType,
      };

      // Add images if present
      if (uploadedImages.length > 0) {
        requestBody.images = uploadedImages.map(img => ({
          data: img.data,
          mimeType: img.mimeType
        }));
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
    setUploadedImages([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Navigation */}
      <div className="fixed top-6 left-6 z-50 flex items-center gap-3">
        <GlassButton size="sm" onClick={() => navigate("/prompt-lab-page")} contentClassName="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back
        </GlassButton>
        <GlassButton size="sm" onClick={() => navigate("/")} contentClassName="flex items-center gap-2">
          <Home className="w-4 h-4" />
          Home
        </GlassButton>
      </div>

      <div className="flex flex-col items-center justify-start px-4 pt-24 pb-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            <span className="text-white">Make powerful prompts</span>
          </h1>
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            with pure flow
          </h2>
          <p className="text-white/60 text-lg mt-8">Let your ideas move clean.</p>
        </div>

        {/* Prompt Type Selector */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
          <button
            onClick={() => setPromptType("lovable")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border ${
              promptType === "lovable"
                ? "bg-pink-500/20 border-pink-500/60 text-pink-300"
                : "bg-white/5 border-white/20 text-white/60 hover:border-white/40 hover:text-white"
            }`}
          >
            🌐 Lovable Prompts
          </button>
          <button
            onClick={() => setPromptType("gemini")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border ${
              promptType === "gemini"
                ? "bg-blue-500/20 border-blue-500/60 text-blue-300"
                : "bg-white/5 border-white/20 text-white/60 hover:border-white/40 hover:text-white"
            }`}
          >
            ✨ Gemini Prompts
          </button>
          <button
            onClick={() => setPromptType("image")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border ${
              promptType === "image"
                ? "bg-purple-500/20 border-purple-500/60 text-purple-300"
                : "bg-white/5 border-white/20 text-white/60 hover:border-white/40 hover:text-white"
            }`}
          >
            🖼️ Image Prompts
          </button>
        </div>

        {/* Prompt Type Description */}
        <p className="text-white/40 text-xs text-center mt-3 max-w-md">
          {promptType === "lovable" && "Optimized for building websites and apps with Lovable"}
          {promptType === "gemini" && "Structured prompts compatible with Google Gemini models"}
          {promptType === "image" && "Crafted prompts for high-quality AI image generation"}
        </p>

        {/* Generator */}
        <div className="w-full max-w-2xl mx-auto">
          <div className="relative mt-6">
            <div
              className={`relative bg-transparent rounded-[2rem] px-3 sm:px-4 py-3 flex flex-col gap-2 border-[0.5px] border-white/5 transition-all duration-300 ${isFocused || input.trim() || uploadedImages.length > 0 ? categoryColors[selectedCategory] : ""}`}
            >
              {/* Image previews */}
              {uploadedImages.length > 0 && (
                <div className="flex flex-wrap gap-2 px-1">
                  {uploadedImages.map((img, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={img.preview}
                        alt={`Upload ${index + 1}`}
                        className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg border border-white/10"
                      />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 w-5 h-5 bg-red-500/80 hover:bg-red-500 rounded-full flex items-center justify-center text-white transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {uploadedImages.length < MAX_IMAGES && (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-16 h-16 sm:w-20 sm:h-20 border border-dashed border-white/20 rounded-lg flex items-center justify-center text-white/40 hover:text-white/60 hover:border-white/40 transition-all"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  )}
                </div>
              )}
              
              <div className="flex items-center gap-2 sm:gap-3">
                <div>
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
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Image upload button */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadedImages.length >= MAX_IMAGES}
                  className="flex-shrink-0 rounded-full bg-white/5 backdrop-blur-md border border-white/20 text-white/70 hover:border-white/30 hover:text-white hover:bg-white/10 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed h-8 w-8 flex items-center justify-center p-0"
                  title={`Add images (${uploadedImages.length}/${MAX_IMAGES})`}
                >
                  <Image className="w-4 h-4" />
                </button>

                <div className="relative flex-1 min-w-0">
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onInput={handleInput}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder={uploadedImages.length > 0 ? "Describe what you want (optional with images)..." : displayedText}
                    rows={1}
                    className="w-full bg-transparent resize-none outline-none text-sm sm:text-base text-white placeholder:text-white/50 min-h-[48px] max-h-[200px] overflow-y-auto leading-relaxed text-left py-2"
                    maxLength={2000}
                  />
                </div>

              <div>
                <button
                  onClick={handleGenerate}
                  disabled={isLoading || (!input.trim() && uploadedImages.length === 0)}
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

          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mt-6">
            <GlassButton
              size="sm"
              onClick={() => setSelectedModel("fast")}
              contentClassName="flex items-center gap-1.5"
              className={selectedModel === "fast" ? "ring-2 ring-white/40" : ""}
            >
              <Zap className="w-3 h-3" />
              Fast Model
            </GlassButton>
            <GlassButton
              size="sm"
              onClick={() => setSelectedModel("advanced")}
              contentClassName="flex items-center gap-1.5"
              className={selectedModel === "advanced" ? "ring-2 ring-white/40" : ""}
            >
              <Settings className="w-3 h-3" />
              Advanced Model
            </GlassButton>
            <GlassButton
              size="sm"
              onClick={() => setSelectedModel("premium")}
              contentClassName="flex items-center gap-1.5"
              className={selectedModel === "premium" ? "ring-2 ring-yellow-500/60" : ""}
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
      </div>
    </div>
  );
};

export default PromptGeneratorPage;
