import { useState, useEffect, useRef } from "react";
import { GlassButton } from "@/components/ui/glass-button";
import { Zap, Settings, Send, Plus, X, Image as ImageIcon, Loader2, ChevronDown, FileText, FileCode } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/lib/notifications";
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
  const [promptType, setPromptType] = useState<"lovable" | "gemini" | "image" | null>(null);
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<Array<{ file: File; preview: string; base64: string; mimeType: string }>>([]);
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ file: File; name: string; content: string; extension: string }>>([]);
  const [pastedContents, setPastedContents] = useState<Array<{ id: string; content: string; preview: string; lineCount: number; byteSize: string }>>([]);
  const [showPastedModal, setShowPastedModal] = useState(false);
  const [selectedPastedIndex, setSelectedPastedIndex] = useState<number>(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [contextText, setContextText] = useState("");
  const [showContextInput, setShowContextInput] = useState(false);
  const contextInputRef = useRef<HTMLTextAreaElement>(null);
  const codeFileInputRef = useRef<HTMLInputElement>(null);
  
  const MAX_IMAGES = 3;
  const MAX_CODE_FILES = 5;
  const MAX_PASTED = 5;

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
      // Reset height to auto to get correct scrollHeight
      textareaRef.current.style.height = "auto";
      // Set new height with max limit
      const newHeight = Math.min(textareaRef.current.scrollHeight, 300);
      textareaRef.current.style.height = `${newHeight}px`;
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
    if (!input.trim() && uploadedImages.length === 0 && !contextText.trim()) {
      setGeneratedPrompt("");
    }
  }, [input, uploadedImages, contextText]);

  // Format byte size for display
  const formatByteSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // Handle pasted content (text or image)
  const handlePastedContent = (text: string) => {
    if (pastedContents.length >= MAX_PASTED) {
      toast.error(`Maximum ${MAX_PASTED} pasted contents allowed`);
      return;
    }

    const lineCount = text.split('\n').length;
    const byteSize = formatByteSize(new Blob([text]).size);
    const preview = text.slice(0, 100).replace(/\n/g, ' ');

    setPastedContents(prev => [...prev, {
      id: `pasted-${Date.now()}`,
      content: text,
      preview: preview.length < text.length ? `${preview}...` : preview,
      lineCount,
      byteSize
    }]);
  };

  const handlePastedRemove = (index: number) => {
    setPastedContents(prev => prev.filter((_, i) => i !== index));
  };

  // Handle paste image or text
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      let hasImage = false;
      let textContent = '';

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          hasImage = true;
          e.preventDefault();
          const file = items[i].getAsFile();
          if (file) {
            handleImageSelect(file);
          }
          break;
        }
        if (items[i].type === 'text/plain') {
          textContent = e.clipboardData?.getData('text/plain') || '';
        }
      }

      // If no image and text is substantial (more than 150 chars or has multiple lines), treat as pasted content
      if (!hasImage && textContent && (textContent.length > 150 || textContent.split('\n').length > 3)) {
        e.preventDefault();
        handlePastedContent(textContent);
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [pastedContents.length]);

  // Handle ESC key to close image modal
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showImageModal) {
        setShowImageModal(false);
      }
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [showImageModal]);

  const MAX_IMAGE_BYTES = 3.5 * 1024 * 1024; // ~3.5MB raw -> ~4.9MB base64 (<5MB Edge limit)
  const MAX_IMAGE_BASE64_LENGTH = 5 * 1024 * 1024; // mirrors backend validator

  const handleImageSelect = (file: File) => {
    if (uploadedImages.length >= MAX_IMAGES) {
      toast.error(`Maximum ${MAX_IMAGES} images allowed`);
      return;
    }
    
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Keep raw file small enough so the base64 payload stays under the 5MB Edge cap
    if (file.size > MAX_IMAGE_BYTES) {
      toast.error("Image must be under ~3.5MB to analyze");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;

      // Defensive: if encoding still pushes us over the 5MB string limit, block before calling Edge
      if (result.length > MAX_IMAGE_BASE64_LENGTH) {
        toast.error("Encoded image is too large. Please choose a smaller image (<~3.5MB).");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }

      // Extract base64 and mime type
      const mimeMatch = result.match(/^data:(image\/[^;]+);base64,(.+)$/);
      if (mimeMatch) {
        setUploadedImages(prev => [...prev, {
          file,
          preview: result,
          base64: mimeMatch[2],
          mimeType: mimeMatch[1]
        }]);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleImageRemove = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => handleImageSelect(file));
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle code file selection
  const CODE_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx', '.py', '.html', '.css', '.scss', '.json', '.md', '.txt', '.yaml', '.yml', '.xml', '.sql', '.sh', '.env', '.gitignore', '.dockerfile', '.go', '.rs', '.java', '.kt', '.swift', '.vue', '.svelte'];
  
  const handleCodeFileSelect = async (file: File) => {
    if (uploadedFiles.length >= MAX_CODE_FILES) {
      toast.error(`Maximum ${MAX_CODE_FILES} code files allowed`);
      return;
    }

    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    const isCodeFile = CODE_EXTENSIONS.includes(extension) || file.type.startsWith('text/');
    
    if (!isCodeFile && file.size > 100 * 1024) {
      toast.error("File too large. Code files should be under 100KB.");
      return;
    }

    try {
      const content = await file.text();
      setUploadedFiles(prev => [...prev, {
        file,
        name: file.name,
        content: content.slice(0, 50000), // Limit content to 50k chars
        extension
      }]);
    } catch (error) {
      toast.error("Could not read file");
    }
  };

  const handleCodeFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => handleCodeFileSelect(file));
    }
    if (codeFileInputRef.current) {
      codeFileInputRef.current.value = "";
    }
  };

  const handleCodeFileRemove = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    if (codeFileInputRef.current) {
      codeFileInputRef.current.value = "";
    }
  };

  const handleAnalyzeImage = async () => {
    if (!isSupabaseConfigured) {
      toast.error("Supabase ei ole konfiguroitu (VITE_SUPABASE_URL / KEY puuttuu).");
      return;
    }

    if (uploadedImages.length === 0) {
      toast.error("Please select an image first");
      return;
    }

    setIsAnalyzingImage(true);
    try {
      // Use the first image for analyze-image-for-prompt (it only supports single image)
      const firstImage = uploadedImages[0];
      const invokeAttempt = async () => {
        const { data, error } = await supabase.functions.invoke("analyze-image-for-prompt", {
          body: {
            image: firstImage.preview,
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
          body: JSON.stringify({ image: firstImage.preview }),
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
    if (!input.trim() && uploadedImages.length === 0) {
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
      let finalInput = input.trim() || (uploadedImages.length > 1 
        ? `Analyze these ${uploadedImages.length} images and create a detailed prompt that can recreate this design with high fidelity.`
        : "Analyze this image and create a detailed prompt that can recreate this design with high fidelity.");

      // Add context text if provided
      if (contextText.trim()) {
        finalInput = `${finalInput}\n\n[ADDITIONAL CONTEXT]:\n${contextText.trim()}`;
      }

      // Add pasted contents as reference material
      if (pastedContents.length > 0) {
        const pastedSection = pastedContents.map((p, i) => 
          `[PASTED CONTENT ${i + 1}]:\n${p.content}`
        ).join('\n\n');
        finalInput = `${finalInput}\n\n${pastedSection}`;
      }

      // Add code files as reference material
      if (uploadedFiles.length > 0) {
        const codeSection = uploadedFiles.map(f => 
          `[CODE FILE: ${f.name}]:\n\`\`\`${f.extension.slice(1)}\n${f.content}\n\`\`\``
        ).join('\n\n');
        finalInput = `${finalInput}\n\n${codeSection}`;
      }

      // Add instruction for fast model
      if (selectedModel === "fast" && uploadedImages.length === 0) {
        finalInput = `${input} (Create a comprehensive and detailed prompt based on this idea, aiming for maximum clarity and actionable steps)`;
        if (contextText.trim()) {
          finalInput = `${finalInput}\n\n[ADDITIONAL CONTEXT]:\n${contextText.trim()}`;
        }
        if (pastedContents.length > 0) {
          const pastedSection = pastedContents.map((p, i) => 
            `[PASTED CONTENT ${i + 1}]:\n${p.content}`
          ).join('\n\n');
          finalInput = `${finalInput}\n\n${pastedSection}`;
        }
        if (uploadedFiles.length > 0) {
          const codeSection = uploadedFiles.map(f => 
            `[CODE FILE: ${f.name}]:\n\`\`\`${f.extension.slice(1)}\n${f.content}\n\`\`\``
          ).join('\n\n');
          finalInput = `${finalInput}\n\n${codeSection}`;
        }
      }

      // Prepare body with optional images
      const requestBody: Record<string, unknown> = {
        userInput: finalInput,
        model: selectedModel,
        category: selectedCategory !== "all" ? selectedCategory : undefined,
        promptType: promptType,
      };

      // If images are present, include them in the request
      if (uploadedImages.length > 0) {
        requestBody.images = uploadedImages.map(img => ({
          data: img.base64,
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
    setUploadedFiles([]);
    setPastedContents([]);
    setContextText("");
    setShowContextInput(false);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (codeFileInputRef.current) {
      codeFileInputRef.current.value = "";
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
          {/* Selected Tool, Image Previews, Code Files & Pasted Contents */}
          {(promptType || uploadedImages.length > 0 || uploadedFiles.length > 0 || pastedContents.length > 0) && (
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {/* Selected Tool Chip */}
              {promptType && (
                <div className="relative flex items-center bg-white/5 border border-white/20 rounded-lg px-3 py-1.5 gap-2">
                  <span className="text-xs text-white/80">
                    {promptType === "lovable" && "Lovable Prompts"}
                    {promptType === "gemini" && "Gemini Prompts"}
                    {promptType === "image" && "Image Prompts"}
                  </span>
                  <button
                    onClick={() => setPromptType(null)}
                    className="text-white/40 hover:text-white/70 transition-colors"
                    title="Remove tool"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              
              {/* Pasted Content Chips */}
              {pastedContents.map((pasted, index) => (
                <div key={pasted.id} className="relative group">
                  <button
                    onClick={() => {
                      setSelectedPastedIndex(index);
                      setShowPastedModal(true);
                    }}
                    className="relative flex flex-col items-start bg-neutral-800/80 border border-white/20 rounded-lg px-3 py-2 hover:border-white/30 transition-colors cursor-pointer max-w-[180px]"
                    title="Click to view full content"
                  >
                    <span className="text-[10px] text-white/50 mb-0.5">{pasted.byteSize} • {pasted.lineCount} lines</span>
                    <span className="text-xs text-white/80 line-clamp-2 text-left leading-tight">
                      {pasted.preview}
                    </span>
                    <span className="text-[10px] uppercase tracking-wide text-white/40 mt-1 font-medium border border-white/20 rounded px-1.5 py-0.5">
                      PASTED
                    </span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePastedRemove(index);
                    }}
                    className="absolute -top-1 -right-1 p-0.5 rounded-full bg-black/80 hover:bg-black border border-white/20 text-white transition-colors"
                    title="Remove pasted content"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </div>
              ))}

              {/* Image Previews */}
              {uploadedImages.map((img, index) => (
                <div key={`img-${index}`} className="relative group">
                  <button
                    onClick={() => {
                      setSelectedImageIndex(index);
                      setShowImageModal(true);
                    }}
                    className="relative w-10 h-10 rounded-lg overflow-hidden border border-white/10 hover:border-white/20 transition-colors cursor-pointer flex-shrink-0"
                  >
                    <img
                      src={img.preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleImageRemove(index);
                    }}
                    className="absolute -top-1 -right-1 p-0.5 rounded-full bg-black/80 hover:bg-black border border-white/20 text-white transition-colors"
                    title="Remove image"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </div>
              ))}

              {/* Code File Chips */}
              {uploadedFiles.map((codeFile, index) => (
                <div key={`file-${index}`} className="relative flex items-center bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-2.5 py-1.5 gap-2">
                  <FileCode className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-xs text-white/80 max-w-24 truncate" title={codeFile.name}>
                    {codeFile.name}
                  </span>
                  <button
                    onClick={() => handleCodeFileRemove(index)}
                    className="text-white/40 hover:text-white/70 transition-colors"
                    title="Remove file"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-start gap-2 sm:gap-3">
            <div className="pt-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileInputChange}
                className="hidden"
              />
              <input
                ref={codeFileInputRef}
                type="file"
                accept=".js,.jsx,.ts,.tsx,.py,.html,.css,.scss,.json,.md,.txt,.yaml,.yml,.xml,.sql,.sh,.env,.dockerfile,.go,.rs,.java,.kt,.swift,.vue,.svelte"
                multiple
                onChange={handleCodeFileInputChange}
                className="hidden"
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex-shrink-0 rounded-full bg-white/5 backdrop-blur-md border border-white/20 text-white/70 hover:border-white/30 hover:text-white hover:bg-white/10 transition-all duration-300 h-8 w-8 flex items-center justify-center p-0">
                    <Plus className="w-4 h-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-black/90 backdrop-blur-md border-white/10 z-50 w-52">
                  <div className="px-2 py-2">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadedImages.length >= MAX_IMAGES}
                      className="w-full text-left px-3 py-2 text-sm rounded transition-all text-white/80 hover:bg-white/10 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ImageIcon className="w-4 h-4" />
                      Upload image
                    </button>
                    <button
                      onClick={() => codeFileInputRef.current?.click()}
                      disabled={uploadedFiles.length >= MAX_CODE_FILES}
                      className="w-full text-left px-3 py-2 text-sm rounded transition-all text-white/80 hover:bg-white/10 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FileCode className="w-4 h-4" />
                      Upload code file
                    </button>
                    <button
                      onClick={() => {
                        setShowContextInput(true);
                        setTimeout(() => contextInputRef.current?.focus(), 100);
                      }}
                      className="w-full text-left px-3 py-2 text-sm rounded transition-all text-white/80 hover:bg-white/10 flex items-center gap-3"
                    >
                      <FileText className="w-4 h-4" />
                      Add text content
                    </button>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Context Text Preview */}
            {(showContextInput || contextText) && (
              <div className="flex items-center gap-2 pt-2">
                <div className="relative flex items-center bg-white/5 border border-white/20 rounded-lg px-2 py-1">
                  <FileText className="w-3 h-3 text-white/50 mr-1" />
                  <input
                    ref={contextInputRef as any}
                    type="text"
                    value={contextText}
                    onChange={(e) => setContextText(e.target.value)}
                    placeholder="Add context..."
                    className="bg-transparent border-none outline-none text-xs text-white w-20 sm:w-32"
                    onBlur={() => {
                      if (!contextText.trim()) {
                        setShowContextInput(false);
                      }
                    }}
                  />
                  {contextText && (
                    <button
                      onClick={() => {
                        setContextText("");
                        setShowContextInput(false);
                      }}
                      className="ml-1 text-white/40 hover:text-white/70"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            )}

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
                className="w-full bg-transparent border-none outline-none text-sm sm:text-base text-white resize-none overflow-hidden py-2 leading-relaxed text-left transition-[height] duration-150 ease-out"
                style={{ minHeight: "24px", maxHeight: "300px" }}
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
          
          {/* Pick Tool Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border bg-white/5 border-white/20 text-white/70 hover:border-white/30 hover:text-white hover:bg-white/10 flex items-center gap-2">
                Pick tool
                <ChevronDown className="w-3 h-3" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-black/90 backdrop-blur-md border-white/10 z-50 w-52">
              <DropdownMenuItem 
                onClick={() => setPromptType("lovable")}
                className={`px-3 py-2 text-sm cursor-pointer ${
                  promptType === "lovable" 
                    ? "bg-white/15 text-white" 
                    : "text-white/70 hover:bg-white/10"
                }`}
              >
                Lovable Prompts
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setPromptType("gemini")}
                className={`px-3 py-2 text-sm cursor-pointer ${
                  promptType === "gemini" 
                    ? "bg-white/15 text-white" 
                    : "text-white/70 hover:bg-white/10"
                }`}
              >
                Gemini Prompts
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setPromptType("image")}
                className={`px-3 py-2 text-sm cursor-pointer ${
                  promptType === "image" 
                    ? "bg-white/15 text-white" 
                    : "text-white/70 hover:bg-white/10"
                }`}
              >
                Image Prompts
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
        {showImageModal && uploadedImages.length > 0 && (
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
                src={uploadedImages[selectedImageIndex]?.preview}
                alt="Full size preview"
                className="w-full h-full object-contain rounded-lg"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pasted Content Modal */}
      <AnimatePresence>
        {showPastedModal && pastedContents.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowPastedModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-3xl w-full max-h-[80vh] bg-neutral-900 border border-white/20 rounded-xl overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
                <div className="flex flex-col">
                  <h3 className="text-white font-medium">Pasted content</h3>
                  <span className="text-xs text-white/50">
                    {pastedContents[selectedPastedIndex]?.byteSize} • {pastedContents[selectedPastedIndex]?.lineCount} lines • Formatting may be inconsistent from source
                  </span>
                </div>
                <button
                  onClick={() => setShowPastedModal(false)}
                  className="p-1 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {/* Content */}
              <div className="flex-1 overflow-auto p-5">
                <pre className="text-sm text-white/80 whitespace-pre-wrap font-mono bg-neutral-800/50 rounded-lg p-4 border border-white/10 leading-relaxed">
                  {pastedContents[selectedPastedIndex]?.content}
                </pre>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

