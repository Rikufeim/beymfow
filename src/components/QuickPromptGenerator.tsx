import { useState, useEffect, useRef, useCallback } from "react";
import { GlassButton } from "@/components/ui/glass-button";
import { getColorPromptPayload, clearColorPromptPayload } from "@/lib/colorPromptBridge";
import { Zap, Settings, Send, Plus, X, Image as ImageIcon, Loader2, FileText, FileCode, Wrench, ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthDialog } from "@/contexts/AuthDialogContext";
import { useNavigate } from "react-router-dom";
import { toast } from "@/lib/notifications";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GeneratedPromptDisplay } from "./GeneratedPromptDisplay";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const PROMPT_ENGINEER_SYSTEM_PROMPT = `
You are an expert-level prompt engineer and AI workflow designer.
Your task is to generate high-quality, highly optimized, tool-specific prompts that maximize output quality, usefulness, and accuracy.

2. Prompt Structure (Default Template)
Role: Define the AI’s role clearly.
Objective: State the main goal.
Context: Provide relevant background.
Requirements: List clear constraints (Tech stack, Style, Tone, Format, Performance, Accessibility, SEO).
Output Format: Define how the answer must be delivered.
Quality Criteria: Explain what “good” means.

3. Tool-Specific Optimization Rules:
- Lovable: Focus on Full-stack web/app generation, UX/UI, Auth, Database.
- Gemini: Focus on Multimodal reasoning, Analysis, Step-by-step thinking.
- Image: Focus on Visual composition, Lighting, Style, Camera, Mood.
`;

const LOVABLE_PRODUCT_ARCHITECT_PROMPT = `
You are a senior product engineer, startup CTO, and UX lead combined into one.
Your task is to generate complete, production-ready web and app products, not demos, not templates, and not placeholders.
Every output must be something that could realistically be launched as a real business.
Never generate generic websites. Never generate shallow landing pages. Always think like a founder building a scalable product.

When generating prompts for Lovable, always format them as detailed build instructions.
Use natural language. No bullet points. No markdown. No symbols. No headings. No role labels. No decorative formatting.
Only clear professional instructions.

Always describe: Exact features, Exact pages, Exact flows, Exact components, Exact data models, Exact integrations, Exact UI behavior.
Never say things like "Build a modern website". Replace them with concrete specifications.
If user input is vague, you must intelligently expand it into a strong product idea.
Infer. Design. Decide. Execute.
`;

export const QuickPromptGenerator = () => {
  const { user, session, usageInfo } = useAuth();
  const { openAuthDialog } = useAuthDialog();
  const navigate = useNavigate();
  const { toast: uiToast } = useToast();
  const isPro = usageInfo?.subscriptionTier === "premium";
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey =
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    import.meta.env.VITE_SUPABASE_ANON_KEY;
  const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);
  const analyzeEndpoint = supabaseUrl ? `${supabaseUrl}/functions/v1/analyze-image-for-prompt` : null;
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const [input, setInput] = useState("");
  const [colorPaletteAttachment, setColorPaletteAttachment] = useState<{ colors: { color1: string; color2: string; color3: string; color4: string }; gradientStyle: string; summary: string } | null>(null);
  const [selectedModel, setSelectedModel] = useState<"fast" | "advanced" | "premium">("fast");
  const [selectedCategory, setSelectedCategory] = useState<"all" | "creativity" | "personal" | "business" | "crypto">(
    "all",
  );
  const [promptType, setPromptType] = useState<"lovable" | "gemini" | "chatgpt" | "image">("chatgpt");
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [showPremiumGate, setShowPremiumGate] = useState(false);
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

  // Check for incoming color prompt from Color Codes workspace
  useEffect(() => {
    const payload = getColorPromptPayload();
    if (payload && Date.now() - payload.timestamp < 60_000) {
      setColorPaletteAttachment({
        colors: payload.colors,
        gradientStyle: payload.gradientStyle,
        summary: payload.summary,
      });
      setPromptType("lovable");
      clearColorPromptPayload();
      toast.success("Color palette attached — describe your project and hit Generate!");
    }
  }, []);

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

  // Handle upgrade to pro
  const handleUpgradeToPro = useCallback(async () => {
    if (!user || !session) {
      sessionStorage.setItem('pending_checkout', 'true');
      setShowPremiumGate(false);
      openAuthDialog();
      return;
    }
    
    setCheckoutLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { tier: "pro" },
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      uiToast({
        title: "Error",
        description: err.message || "Failed to start checkout",
        variant: "destructive"
      });
    } finally {
      setCheckoutLoading(false);
      setShowPremiumGate(false);
    }
  }, [user, session, openAuthDialog, uiToast]);

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

    if (selectedModel === "premium" && !isPro) {
      setShowPremiumGate(true);
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

      // Inject color palette context if attached
      if (colorPaletteAttachment) {
        const { colors, gradientStyle } = colorPaletteAttachment;
        finalInput = `${finalInput}\n\n[COLOR PALETTE ATTACHMENT - USE THESE COLORS IN THE DESIGN]:\nPrimary/Base: ${colors.color1}\nSurface: ${colors.color2}\nAccent: ${colors.color3}\nHighlight: ${colors.color4}\nGradient Style: ${gradientStyle}\n\nIMPORTANT: The generated prompt MUST incorporate these exact colors as the website/app color scheme. Map them to backgrounds, text, accents, borders, buttons, and interactive elements. Create CSS custom properties and Tailwind config using these colors.`;
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
        // Color palette for fast model too
        if (colorPaletteAttachment) {
          const { colors, gradientStyle } = colorPaletteAttachment;
          finalInput = `${finalInput}\n\n[COLOR PALETTE ATTACHMENT - USE THESE COLORS IN THE DESIGN]:\nPrimary/Base: ${colors.color1}\nSurface: ${colors.color2}\nAccent: ${colors.color3}\nHighlight: ${colors.color4}\nGradient Style: ${gradientStyle}\n\nIMPORTANT: The generated prompt MUST incorporate these exact colors as the website/app color scheme.`;
        }
      }

      // Prepare body with optional images
      const requestBody: Record<string, unknown> = {
        userInput: finalInput,
        model: selectedModel,
        category: selectedCategory !== "all" ? selectedCategory : undefined,
        promptType: promptType,
        systemPrompt: promptType === 'lovable' ? LOVABLE_PRODUCT_ARCHITECT_PROMPT : PROMPT_ENGINEER_SYSTEM_PROMPT,
      };

      if (uploadedImages.length > 0) {
        requestBody.images = uploadedImages.map(img => ({
          data: img.base64,
          mimeType: img.mimeType
        }));
      }

      if (!isSupabaseConfigured) {
        // Mock delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        throw new Error("Supabase not configured (Mocking)");
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
          throw new Error(data.error || "Backend error");
        }
        return;
      }

      if (data?.prompt) {
        setGeneratedPrompt(data.prompt);
        toast.success("Prompt generated!");
      } else {
        throw new Error("No prompt received");
      }
    } catch (error) {
      console.error("Error generating prompt:", error);

      // HIGH QUALITY MOCK FALLBACK - Demonstrates the Expert Agent capability
      let mockResponse = "";

      if (promptType === 'lovable') {
        // LOVABLE MOCK: Narrative, no markdown, detailed product architecture
        mockResponse = `Build a comprehensive, production-ready ${input || "digital product"} that functions as a scalable SaaS platform. The system must include a robust authentication flow using Supabase Auth with support for email/password and social providers, leading to a personalized dashboard. The backend architecture should rely on a Supabase database with distinct tables for users, profiles, subscriptions, and core application data, ensuring row-level security is enabled for all interactions. The frontend must be built with React and TypeScript, utilizing TailwindCSS for a highly responsive, pixel-perfect UI that adapts seamlessly to desktop, tablet, and mobile devices. Key features must include a multi-tenant workspace environment, real-time data synchronization, granular role-based access control, and an integrated billing system connected to Stripe. Incorporate sophisticated error handling and loading states to ensure a polished user experience. The design should utilize a modern, clean aesthetic with a focus on usability and conversion optimization, avoiding generic placeholders in favor of realistic content structure. Ensure the application is deployed with proper SEO meta tags and open graph data for maximum visibility. Implement a comprehensive settings panel allowing users to manage their profile, security preferences, and notification settings. The final output must be a fully functional, commercially viable product foundation ready for deployment.`;

      } else {
        // DEFAULT MOCK: Structured Markdown
        const mockRole = promptType === 'image' ? "Professional Photographer & Art Director" : "Senior Full-Stack Developer & UX Architect";
        const mockObjective = promptType === 'image'
          ? `Create a stunning, photorealistic image of ${input || "the subject"}.`
          : `Design and implement a production-ready solution for: ${input || "the detailed requirements"}.`;

        mockResponse = `### Expert Prompt Generated

**Role**
${mockRole}

**Objective**
${mockObjective}

**Context**
The target intended use requires high fidelity, professional standards, and optimization for the specific tool capabilities.

**Requirements**
${promptType === 'image' ?
            `- **Lighting**: Volumetric, Cinematic, Golden Hour
- **Camera**: 85mm lens, f/1.8 aperture
- **Style**: Photorealistic, 8k Resolution, Unreal Engine 5 render style
- **Composition**: Rule of thirds, dynamic depth of field`
            :
            `- **Tech Stack**: React, TypeScript, TailwindCSS, Supabase
- **Architecture**: Clean, modular component structure with proper separation of concerns
- **Accessibility**: WCAG 2.1 AA compliant
- **Performance**: Optimized for Core Web Vitals, lazy loading implemented`}

**Output Format**
${promptType === 'image' ? "Midjourney / DALL-E 3 optimized prompt string." : "Complete, commented source code files with setup instructions."}

**Quality Criteria**
- No placeholders
- Production-ready output
- Strict adherence to the specified style and constraints
`;
      }

      setGeneratedPrompt(mockResponse);
      toast.success("Prompt generated (Active Fallback)");
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

  const hasContent = !!generatedPrompt || isLoading;

  return (
    <div className={`w-full mx-auto flex flex-col transition-all duration-700 ease-in-out ${hasContent ? 'justify-end min-h-[85vh] pb-8' : 'justify-center min-h-[60vh]'}`}>

      {/* Premium Model Gate Dialog */}
      <AlertDialog open={showPremiumGate} onOpenChange={setShowPremiumGate}>
        <AlertDialogContent className="bg-black border-2 border-white/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-bold text-white text-center">
              ⚡ Premium Model
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground text-center text-lg">
              Premium Model uses GPT-5 for the highest quality prompts. Upgrade to Pro to unlock this feature.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={() => setShowPremiumGate(false)}
              className="bg-transparent border-white/30 text-white hover:bg-white/10 hover:border-white/50"
            >
              Not Now
            </Button>
            <AlertDialogAction
              onClick={handleUpgradeToPro}
              disabled={checkoutLoading}
              className="bg-foreground text-background border-2 border-border hover:bg-foreground/90 font-bold px-8 py-6 text-lg"
            >
              {checkoutLoading ? "Loading..." : "Upgrade to Pro — €9.90/month"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AnimatePresence>
        {hasContent && (
          <div className="w-full max-w-4xl mx-auto mb-6 px-4">
            <GeneratedPromptDisplay
              prompt={generatedPrompt}
              selectedModel={selectedModel}
              selectedCategory={selectedCategory}
              onPromptUpdate={setGeneratedPrompt}
              onClear={clearPrompt}
              userInput={input}
            />
          </div>
        )}
      </AnimatePresence>

      <div className="w-full max-w-4xl mx-auto relative z-20">
        <div className={`flex justify-center transition-all duration-700 ease-in-out ${hasContent ? 'opacity-0 h-0 mb-0 overflow-hidden' : 'opacity-100 mb-10 scale-110'}`}>
          <img src="/images/beymflow-logo.png" alt="Beymflow" className="h-24 w-auto object-contain" />
        </div>

        <div className="w-full space-y-6 relative p-6 rounded-3xl">
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
                {/* Pasted Contents, Code Files, Images & Tool Chip (largest first) */}
                {(uploadedImages.length > 0 || uploadedFiles.length > 0 || pastedContents.length > 0 || colorPaletteAttachment) && (
                  <div className="flex items-start gap-2 mb-2 flex-wrap">
                    {/* Pasted Content Chips - Largest, comes first */}
                    {pastedContents.map((pasted, index) => (
                      <div key={pasted.id} className="relative group">
                        <button
                          onClick={() => {
                            setSelectedPastedIndex(index);
                            setShowPastedModal(true);
                          }}
                          className="relative flex flex-col items-start bg-neutral-800/80 border border-white/20 rounded-lg px-3 py-2 hover:border-white/30 transition-colors cursor-pointer max-w-[200px]"
                          title="Click to view full content"
                        >
                          <span className="text-[10px] text-white/50 mb-0.5">{pasted.byteSize} • {pasted.lineCount} lines</span>
                          <span className="text-xs text-white/80 line-clamp-2 text-left leading-tight">
                            {pasted.preview}
                          </span>
                          <span className="text-[10px] uppercase tracking-wide text-white/40 mt-1.5 font-medium border border-white/20 rounded px-1.5 py-0.5">
                            PASTED
                          </span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePastedRemove(index);
                          }}
                          className="absolute -top-1.5 -right-1.5 p-0.5 rounded-full bg-black/80 hover:bg-black border border-white/20 text-white transition-colors"
                          title="Remove pasted content"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}

                    {/* Code File Chips - Medium size */}
                    {uploadedFiles.map((codeFile, index) => (
                      <div key={`file-${index}`} className="relative flex items-center bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-3 py-2 gap-2">
                        <FileCode className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs text-white/80 max-w-28 truncate" title={codeFile.name}>
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

                    {/* Color Palette Chip */}
                    {colorPaletteAttachment && (
                      <div className="relative flex items-center bg-purple-500/10 border border-purple-500/30 rounded-lg px-3 py-2 gap-2">
                        <div className="flex gap-0.5">
                          {Object.values(colorPaletteAttachment.colors).map((c, i) => (
                            <div key={i} className="w-3.5 h-3.5 rounded-sm border border-white/20" style={{ backgroundColor: c }} />
                          ))}
                        </div>
                        <span className="text-xs text-purple-300 font-medium">Color Palette</span>
                        <span className="text-[9px] text-white/40 uppercase tracking-wide border border-white/15 rounded px-1 py-0.5">PRO</span>
                        <button
                          onClick={() => setColorPaletteAttachment(null)}
                          className="text-white/40 hover:text-white/70 transition-colors"
                          title="Remove color palette"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}

                    {/* Image Previews - Medium size */}
                    {uploadedImages.map((img, index) => (
                      <div key={`img-${index}`} className="relative group">
                        <button
                          onClick={() => {
                            setSelectedImageIndex(index);
                            setShowImageModal(true);
                          }}
                          className="relative w-11 h-11 rounded-lg overflow-hidden border border-white/10 hover:border-white/20 transition-colors cursor-pointer flex-shrink-0"
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
                          className="absolute -top-2 -right-2 p-1 rounded-full bg-neutral-900 hover:bg-black border border-white/20 text-white transition-colors shadow-sm z-10"
                          title="Remove image"
                        >
                          <X className="w-3.5 h-3.5" />
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
                            className={`inline-block w-0.5 h-4 sm:h-5 bg-white/50 ml-0.5 align-middle transition-opacity duration-300 ${showCursor ? "opacity-100" : "opacity-0"
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
              <GlassButton
                size="sm"
                onClick={() => setSelectedModel("premium")}
                contentClassName="flex items-center gap-1.5"
                isSelected={selectedModel === "premium"}
                className={selectedModel === "premium" ? "ring-2 ring-yellow-500/60" : ""}
              >
                Premium Model
              </GlassButton>

              <div className="w-px h-6 bg-white/20 mx-1 hidden sm:block" />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div>
                    <GlassButton
                      size="sm"
                      contentClassName="flex items-center gap-1.5"
                      isSelected={promptType !== "chatgpt"}
                    >
                      <Wrench className="w-3 h-3" />
                      {promptType === "lovable" ? "Lovable" : promptType === "gemini" ? "Gemini" : promptType === "image" ? "Image AI" : "Tools"}
                      <ChevronDown className="w-3 h-3 opacity-60" />
                    </GlassButton>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="center"
                  className="bg-black/95 backdrop-blur-xl border border-white/20 rounded-xl min-w-[200px] p-1"
                >
                  <DropdownMenuItem
                    onClick={() => setPromptType("chatgpt")}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${promptType === "chatgpt" ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5 hover:text-white"}`}
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">ChatGPT</span>
                      <span className="text-[10px] text-white/40">Optimoitu GPT-malleille</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setPromptType("lovable")}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${promptType === "lovable" ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5 hover:text-white"}`}
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">Lovable</span>
                      <span className="text-[10px] text-white/40">Full-stack app builder promptit</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setPromptType("gemini")}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${promptType === "gemini" ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5 hover:text-white"}`}
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">Gemini</span>
                      <span className="text-[10px] text-white/40">Multimodal & reasoning</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setPromptType("image")}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${promptType === "image" ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5 hover:text-white"}`}
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">Image AI</span>
                      <span className="text-[10px] text-white/40">Midjourney, DALL-E, Flux</span>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>


          </div>

          {/* Image Modal */}
          <AnimatePresence>
            {showImageModal && uploadedImages.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md"
                onClick={() => setShowImageModal(false)}
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  onClick={(e) => e.stopPropagation()}
                  className="relative w-full h-full flex items-center justify-center"
                >
                  <button
                    onClick={() => setShowImageModal(false)}
                    className="fixed top-24 right-6 z-[101] p-3 rounded-full bg-neutral-900/90 hover:bg-black border border-white/40 text-white shadow-2xl transition-all hover:scale-105"
                    aria-label="Close image preview"
                  >
                    <X className="w-6 h-6 text-white" />
                  </button>
                  <img
                    src={uploadedImages[selectedImageIndex]?.preview}
                    alt="Full size preview"
                    className="max-w-full max-h-full object-contain"
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
      </div>
    </div>
  );
};

