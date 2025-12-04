import React, { useState, useRef, useEffect, useMemo, useCallback, memo } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Copy,
  Sparkles,
  Zap,
  FileText,
  X,
  Home,
  CheckCircle2,
  Cpu,
  Search,
  Tag,
  Lock,
  ShoppingCart,
  Expand,
  Plus,
  Save,
  Bot,
  Filter,
  Wand2,
  ChevronDown,
} from "lucide-react";

// --- TYPES ---
type Domain = "creativity" | "personal" | "business" | "crypto";

type PromptTier = "free" | "premium";

interface LibraryPrompt {
  id: string;
  title: string;
  description: string;
  prompt: string;
  domain: Domain;
  tags: string[];
  tier: PromptTier;
  price?: string;
}

// --- CONFIGURATION ---
const DOMAINS: {
  key: Domain;
  label: string;
  emoji: string;
  desc: string;
  color: string;
  gradient: string;
  subcategories: string[];
}[] = [
  {
    key: "business",
    label: "Business",
    emoji: "💼",
    desc: "Strategy, market & scale",
    color: "text-cyan-400",
    gradient: "from-cyan-500/20 to-blue-600/5",
    subcategories: ["Sales", "Marketing", "SEO", "Strategy", "Management"],
  },
  {
    key: "creativity",
    label: "Creativity",
    emoji: "🎨",
    desc: "Art, design & vision",
    color: "text-purple-400",
    gradient: "from-purple-500/20 to-pink-600/5",
    subcategories: ["Writing", "Art", "Design", "Content", "Viral"],
  },
  {
    key: "personal",
    label: "Personal",
    emoji: "🧠",
    desc: "Growth, habits & life",
    color: "text-red-400",
    gradient: "from-red-500/20 to-orange-600/5",
    subcategories: ["Mind", "Wellness", "Habits", "Learning", "Biohacking"],
  },
  {
    key: "crypto",
    label: "Crypto",
    emoji: "🪙",
    desc: "Web3, tokens & analysis",
    color: "text-green-400",
    gradient: "from-green-500/20 to-emerald-600/5",
    subcategories: ["Trading", "DeFi", "NFT", "Analysis", "Security"],
  },
];

const INITIAL_PROMPTS: LibraryPrompt[] = [
  {
    id: "1",
    title: "Blue Ocean Strategy Generator",
    description: "Identify uncontested market spaces.",
    prompt: "Act as a strategic consultant. Analyze the [INDUSTRY] market...",
    domain: "business",
    tags: ["Strategy"],
    tier: "free",
  },
  {
    id: "2",
    title: "SEO Keyword Cluster Builder",
    description: "Generate a topical authority map.",
    prompt: "Act as an SEO specialist. Create a keyword cluster...",
    domain: "business",
    tags: ["SEO"],
    tier: "free",
  },
  {
    id: "3",
    title: "Visual Style Mixer",
    description: "Combine artistic styles for Midjourney.",
    prompt: "Create a visual art prompt that combines...",
    domain: "creativity",
    tags: ["Art"],
    tier: "free",
  },
  {
    id: "4",
    title: "Morning Routine Optimizer",
    description: "Build a habit stack.",
    prompt: "Create a morning routine based on...",
    domain: "personal",
    tags: ["Habits"],
    tier: "free",
  },
  {
    id: "p1",
    title: "Enterprise Scale OS",
    description: "Complete operating system for scaling.",
    prompt: "## Enterprise Scale Framework\n...",
    domain: "business",
    tags: ["Management"],
    tier: "premium",
    price: "$49",
  },
  {
    id: "p2",
    title: "Crypto Alpha Hunter Bot",
    description: "Advanced Python logic.",
    prompt: "## Alpha Hunter Logic\n...",
    domain: "crypto",
    tags: ["Trading"],
    tier: "premium",
    price: "$129",
  },
  {
    id: "p3",
    title: "Viral Hook Architect",
    description: "Psychological framework for content.",
    prompt: "## Viral Script Structure\n...",
    domain: "creativity",
    tags: ["Viral"],
    tier: "premium",
    price: "$29",
  },
  {
    id: "p4",
    title: "Bio-Hacking Masterclass",
    description: "Protocol for cognitive endurance.",
    prompt: "## Cognitive Endurance Protocol\n...",
    domain: "personal",
    tags: ["Biohacking"],
    tier: "premium",
    price: "$39",
  },
];

const PLACEHOLDERS = [
  "What is your goal?",
  "Draft a viral thread...",
  "Analyze Q3 sales data...",
  "Create a fitness plan...",
];

const copyToClipboard = (text: string) => {
  if (!text) return;
  if (navigator?.clipboard?.writeText) {
    navigator.clipboard.writeText(text).catch(() => {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    });
  } else {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
  }
};

// --- CUSTOM COMPONENTS ---
const CustomSelect = memo(
  ({
    label,
    icon: Icon,
    value,
    options,
    onChange,
  }: {
    label: string;
    icon: any;
    value: string;
    options: string[];
    onChange: (val: string) => void;
  }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleClickOutside = useCallback((event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) setIsOpen(false);
    }, []);

    useEffect(() => {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [handleClickOutside]);

    const handleToggle = useCallback(() => setIsOpen((prev) => !prev), []);
    const handleOptionClick = useCallback(
      (opt: string) => {
        onChange(opt);
        setIsOpen(false);
      },
      [onChange],
    );

    return (
      <div className="space-y-1 relative" ref={containerRef}>
        <label className="text-[10px] uppercase font-bold text-neutral-500 flex items-center gap-1">
          <Icon size={10} /> {label}
        </label>
        <button
          onClick={handleToggle}
          className="w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-xl px-3 py-2 text-xs text-white flex items-center justify-between hover:bg-white/10 transition-colors focus:border-white/30 outline-none"
        >
          <span>{value}</span>
          <ChevronDown size={12} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </button>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="absolute top-full left-0 right-0 mt-1 bg-[#161618]/95 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden z-50 shadow-2xl"
            >
              <div className="max-h-40 overflow-y-auto custom-scrollbar p-1">
                {options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => handleOptionClick(opt)}
                    className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-colors ${value === opt ? "text-white bg-white/10 font-bold" : "text-neutral-400 hover:bg-white/10 hover:text-white"}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  },
);
CustomSelect.displayName = "CustomSelect";

// Memoized Prompt Card Component
const PromptCard = memo(
  ({
    prompt,
    domainConfig,
    isPremiumUnlocked,
    onClick,
  }: {
    prompt: LibraryPrompt;
    domainConfig: (typeof DOMAINS)[0] | undefined;
    isPremiumUnlocked: boolean;
    onClick: () => void;
  }) => {
    const isPremium = prompt.tier === "premium";

    return (
      <motion.div
        layoutId={`card-${prompt.id}`}
        onClick={onClick}
        className={`group relative bg-white/5 backdrop-blur-md border rounded-2xl p-6 flex flex-col justify-between transition-all hover:shadow-2xl overflow-hidden cursor-pointer ${isPremium ? "border-amber-500/20 hover:border-amber-500/40 hover:shadow-amber-900/10" : "border-white/10 hover:border-white/20 hover:shadow-purple-900/10"}`}
      >
        {isPremium && (
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent pointer-events-none" />
        )}
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 border border-white/5 text-xs font-bold uppercase tracking-wider ${domainConfig?.color}`}
            >
              {domainConfig?.emoji} {domainConfig?.label}
            </div>
            {isPremium ? (
              <div
                className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border ${isPremiumUnlocked ? "text-green-400 bg-green-900/20 border-green-500/20" : "text-amber-400 bg-amber-900/20 border-amber-500/20"}`}
              >
                {isPremiumUnlocked ? <CheckCircle2 size={12} /> : <Lock size={12} />}
                <span>{isPremiumUnlocked ? "Unlocked" : "Premium"}</span>
              </div>
            ) : (
              <div className="p-2 rounded-lg bg-transparent text-neutral-500 group-hover:text-white transition-colors">
                <Expand size={16} />
              </div>
            )}
          </div>
          <motion.h3 layoutId={`title-${prompt.id}`} className="text-xl font-bold mb-2 text-white">
            {prompt.title}
          </motion.h3>
          <motion.p
            layoutId={`desc-${prompt.id}`}
            className="text-neutral-400 text-sm mb-6 leading-relaxed line-clamp-2"
          >
            {prompt.description}
          </motion.p>
          <div className="bg-white/5 backdrop-blur-md rounded-xl p-4 mb-4 border border-white/5 relative overflow-hidden group-hover:border-white/10 transition-colors h-24">
            {isPremium && !isPremiumUnlocked ? (
              <>
                <p className="text-sm text-neutral-300 font-mono line-clamp-3 opacity-30 blur-sm select-none">
                  {prompt.prompt}
                </p>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Lock className="text-amber-500/50" size={24} />
                </div>
              </>
            ) : (
              <p className="text-sm text-neutral-300 font-mono line-clamp-3 opacity-70">{prompt.prompt}</p>
            )}
          </div>
        </div>
        <div className="relative z-10 flex items-center justify-between mt-auto pt-4 border-t border-white/5">
          <div className="flex items-center gap-2 flex-wrap">
            <Tag size={14} className="text-neutral-600" />
            {prompt.tags.map((tag) => (
              <span key={tag} className="text-xs text-neutral-500">
                #{tag}
              </span>
            ))}
          </div>
          {isPremium && !isPremiumUnlocked && (
            <button className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg text-xs font-bold hover:bg-neutral-200 transition-colors">
              <span>Unlock {prompt.price}</span>
              <ShoppingCart size={14} />
            </button>
          )}
          {(isPremiumUnlocked || !isPremium) && (
            <span className="text-xs font-bold text-white/50 flex items-center gap-1">
              Open <ArrowRight size={12} />
            </span>
          )}
        </div>
      </motion.div>
    );
  },
);
PromptCard.displayName = "PromptCard";

function PromptWorkspaceInner() {
  const navigate = useNavigate();

  // --- STATE ---
  const [prompts, setPrompts] = useState<LibraryPrompt[]>(INITIAL_PROMPTS);

  // Library State
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [filterDomain, setFilterDomain] = useState<Domain | "all">("all");
  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(null);
  const [selectedTier, setSelectedTier] = useState<PromptTier>("free");
  const [isPremiumUnlocked, setIsPremiumUnlocked] = useState(false);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Landing Input State
  const [landingInput, setLandingInput] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [cursorPos, setCursorPos] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const [generatedPrompts, setGeneratedPrompts] = useState<{ title: string; prompt: string }[]>([]);

  // Modal & Logic State
  const [activePrompt, setActivePrompt] = useState<LibraryPrompt | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newPromptData, setNewPromptData] = useState({
    title: "",
    description: "",
    prompt: "",
    domain: "business" as Domain,
  });

  // --- EFFECTS ---
  // Optimize placeholder animation - only run when needed
  useEffect(() => {
    if (landingInput.length > 0 || isFocused) return;
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDERS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [landingInput, isFocused]);

  // --- HELPERS & HANDLERS ---
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLandingInput(e.target.value);
    setCursorPos(e.target.selectionStart || e.target.value.length);
  }, []);

  const handleInputSelect = useCallback((e: React.SyntheticEvent<HTMLInputElement, Event>) => {
    setCursorPos((e.target as HTMLInputElement).selectionStart || 0);
  }, []);

  // Generate 3 prompt alternatives based on user input
  const generatePromptAlternatives = useCallback((input: string): { title: string; prompt: string }[] => {
    const base = input.trim();
    if (!base) return [];

    return [
      {
        title: `Strategic Approach: ${base}`,
        prompt: `**ROLE & PERSONA:**
You are a **Strategic Consultant** with 20+ years of experience. You deliver high-impact, data-driven, and actionable advice without fluff.

**CONTEXT & OBJECTIVE:**
The user needs to: "${base}".
Your goal is to provide a comprehensive strategic solution that solves this specific problem with maximum efficiency.

**REQUIRED OUTPUT STRUCTURE:**
1. **Executive Summary:** A 2-sentence hook summarizing the strategy.
2. **Step-by-Step Execution Plan:**
   * Phase 1: Foundation
   * Phase 2: Implementation
   * Phase 3: Optimization
3. **Key Success Metrics (KPIs):** How to measure the outcome.
4. **Common Pitfalls:** What to avoid.

*(Self-Correction mechanism: Before outputting, verify that the advice is actionable and specific to the context of "${base}".)*`,
      },
      {
        title: `Creative Solution: ${base}`,
        prompt: `**ROLE & PERSONA:**
You are a **Creative Problem Solver** known for innovative thinking and out-of-the-box solutions. You combine creativity with practical execution.

**CONTEXT & OBJECTIVE:**
The user wants to: "${base}".
Your goal is to provide creative, innovative solutions that are both imaginative and actionable.

**REQUIRED OUTPUT STRUCTURE:**
1. **Creative Vision:** An inspiring overview of the approach.
2. **Innovation Framework:**
   * Unique angles and perspectives
   * Creative execution methods
   * Implementation roadmap
3. **Success Indicators:** How to recognize progress.
4. **Potential Challenges & Creative Workarounds:** Anticipated obstacles and innovative solutions.

*(Ensure the solution is both creative and practical for "${base}".)*`,
      },
      {
        title: `Detailed Analysis: ${base}`,
        prompt: `**ROLE & PERSONA:**
You are an **Analytical Expert** specializing in deep-dive analysis and comprehensive problem-solving. You break down complex challenges into manageable components.

**CONTEXT & OBJECTIVE:**
The user requires: "${base}".
Your goal is to provide a thorough, analytical breakdown with actionable insights.

**REQUIRED OUTPUT STRUCTURE:**
1. **Problem Analysis:** Deep understanding of the challenge.
2. **Comprehensive Breakdown:**
   * Core components
   * Interconnections and dependencies
   * Detailed action steps
3. **Measurement Framework:** Metrics and tracking methods.
4. **Risk Assessment:** Potential issues and mitigation strategies.

*(Provide detailed, analytical insights specific to "${base}".)*`,
      },
    ];
  }, []);

  const handleFormSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (landingInput.trim()) {
        const alternatives = generatePromptAlternatives(landingInput);
        setGeneratedPrompts(alternatives);
        // Scroll to the generated prompts section
        setTimeout(() => {
          document.getElementById("prompt-alternatives")?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
      }
    },
    [landingInput, generatePromptAlternatives],
  );

  const handleInputFocus = useCallback(() => setIsFocused(true), []);
  const handleInputBlur = useCallback(() => setIsFocused(false), []);
  const handleInputContainerClick = useCallback(() => document.getElementById("main-input")?.focus(), []);

  // Memoize domain lookup map
  const domainMap = useMemo(() => {
    const map = new Map<Domain, (typeof DOMAINS)[0]>();
    DOMAINS.forEach((d) => map.set(d.key, d));
    return map;
  }, []);

  const filteredPrompts = useMemo(() => {
    const searchLower = debouncedSearchQuery.toLowerCase();
    return prompts.filter((p) => {
      const matchesSearch =
        !searchLower ||
        p.title.toLowerCase().includes(searchLower) ||
        p.tags.some((t) => t.toLowerCase().includes(searchLower));
      const matchesDomain = filterDomain === "all" || p.domain === filterDomain;
      const matchesSubcategory = activeSubcategory ? p.tags.includes(activeSubcategory) : true;
      const matchesTier = p.tier === selectedTier;
      return matchesSearch && matchesDomain && matchesSubcategory && matchesTier;
    });
  }, [debouncedSearchQuery, filterDomain, activeSubcategory, selectedTier, prompts]);

  const handleCreatePrompt = useCallback(() => {
    if (!newPromptData.title.trim() || !newPromptData.prompt.trim()) return;
    const newEntry: LibraryPrompt = {
      id: `${Date.now()}`,
      title: newPromptData.title.trim(),
      description: newPromptData.description.trim() || "User generated prompt",
      prompt: newPromptData.prompt,
      domain: newPromptData.domain,
      tags: [newPromptData.domain],
      tier: "premium",
      price: "$0",
    };
    setPrompts((prev) => [...prev, newEntry]);
    setIsCreating(false);
    setNewPromptData({ title: "", description: "", prompt: "", domain: "business" });
  }, [newPromptData]);

  // --- RENDER ---
  return (
    <div className="relative h-screen w-full bg-black text-white flex flex-col font-sans overflow-hidden selection:bg-cyan-500/30 selection:text-cyan-100">
      {/* CSS INJECTION FOR SCROLLBARS & SLIDERS */}
      <style>{`
        body { overflow: hidden; margin: 0; }
        ::-webkit-scrollbar { width: 0px; height: 0px; }
        ::-webkit-scrollbar-track { background: transparent; } 
        ::-webkit-scrollbar-thumb { background: transparent; }
        ::-webkit-scrollbar-thumb:hover { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        input[type=range] { -webkit-appearance: none; background: transparent; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; height: 14px; width: 14px; border-radius: 50%; background: #404040; border: 1px solid #666; cursor: pointer; margin-top: -5px; box-shadow: 0 0 10px rgba(0,0,0,0.5); }
        input[type=range]::-webkit-slider-runnable-track { width: 100%; height: 4px; cursor: pointer; background: #262626; border-radius: 2px; }
        input[type=range]:focus { outline: none; }
        .caret-transparent { caret-color: transparent; }
        * { scrollbar-width: none; }
      `}</style>

      <div className="fixed top-4 right-4 z-[60] flex items-center gap-2">
        <span className="text-[10px] text-neutral-500 font-mono uppercase">Simulate Subscription</span>
        <button
          onClick={() => setIsPremiumUnlocked(!isPremiumUnlocked)}
          className={`w-10 h-5 rounded-full p-1 transition-colors ${isPremiumUnlocked ? "bg-amber-500" : "bg-neutral-800"}`}
        >
          <div
            className={`w-3 h-3 bg-white rounded-full transition-transform ${isPremiumUnlocked ? "translate-x-5" : "translate-x-0"}`}
          />
        </button>
      </div>

      <motion.main
        key="landing"
        className="flex-1 flex flex-col items-center p-4 w-full max-w-7xl mx-auto z-10 relative h-full overflow-y-auto custom-scrollbar [&_input]:caret-transparent [&_input:focus]:caret-white [&_textarea]:caret-transparent [&_textarea:focus]:caret-white"
      >
        <button
          onClick={() => navigate("/")}
          className="absolute top-6 left-6 z-50 p-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-neutral-400 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2"
        >
          <Home size={20} />
          <span className="text-sm font-medium">Home</span>
        </button>
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full flex flex-col items-center justify-center min-h-[60vh] text-center py-20 px-4"
        >
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 mt-12">
            The Most Powerful Prompt{" "}
            <span className="inline-block bg-gradient-to-r from-purple-600 to-cyan-500 bg-clip-text text-transparent">
              AI Workflow
            </span>
          </h1>
          <div className="inline-block bg-white/5 backdrop-blur-md rounded-2xl px-8 py-3 mb-12 border border-white/10">
            <p className="text-lg text-white/90 font-medium text-center">By Beymflow</p>
          </div>
        </motion.section>

        {/* Lowkey Chat Input */}
        <div className="w-full max-w-4xl mx-auto mb-32 px-4 relative z-20">
          <form
            onSubmit={handleFormSubmit}
            className="relative group flex flex-col items-center justify-center"
            onClick={handleInputContainerClick}
          >
            <div className="relative flex flex-wrap justify-center items-center text-2xl md:text-4xl font-light tracking-tight cursor-text min-h-[60px] w-full text-center">
              <input
                id="main-input"
                type="text"
                value={landingInput}
                onChange={handleInputChange}
                onSelect={handleInputSelect}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-text caret-transparent text-center"
                autoComplete="off"
              />
              {landingInput.length === 0 && !isFocused ? (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
                  <AnimatePresence mode="popLayout">
                    <motion.span
                      key={placeholderIndex}
                      initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        filter: "blur(0px)",
                        backgroundPosition: ["0% center", "-200% center"],
                      }}
                      exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
                      transition={{
                        opacity: { duration: 0.5 },
                        y: { duration: 0.5 },
                        backgroundPosition: { duration: 2.5, ease: "linear", repeat: 0 },
                      }}
                      className="text-transparent bg-clip-text bg-[length:200%_auto]"
                      style={{
                        backgroundImage:
                          "linear-gradient(to right, #737373 0%, #737373 20%, #a855f7 50%, #06b6d4 80%, #737373 100%)",
                      }}
                    >
                      {PLACEHOLDERS[placeholderIndex]}
                    </motion.span>
                  </AnimatePresence>
                </div>
              ) : (
                <div className="relative z-0 flex items-center justify-center break-all">
                  <span className="text-white whitespace-pre-wrap relative">{landingInput.slice(0, cursorPos)}</span>
                  <motion.div
                    animate={{
                      opacity: [1, 0.5, 1],
                      height: ["1.2em", "1em", "1.2em"],
                      backgroundColor: ["#a855f7", "#d8b4fe", "#a855f7"],
                    }}
                    transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                    className="w-[3px] h-[1.2em] bg-purple-500 rounded-full mx-[2px] inline-block align-middle"
                  />
                  <span className="text-white whitespace-pre-wrap relative">{landingInput.slice(cursorPos)}</span>
                </div>
              )}
            </div>
            <div className="h-12 mt-4 flex items-center justify-center">
              <AnimatePresence>
                {landingInput.trim().length > 0 && (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    type="submit"
                    className="group flex items-center gap-2 px-6 py-2 bg-white/90 backdrop-blur-md text-black rounded-full font-bold text-sm hover:bg-white transition-all shadow-lg shadow-purple-500/20 cursor-pointer z-20"
                  >
                    <span>Enter the Lab</span>
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </form>
        </div>

        {/* --- PROMPT ALTERNATIVES SECTION --- */}
        <AnimatePresence>
          {generatedPrompts.length > 0 && (
            <motion.section
              id="prompt-alternatives"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="w-full max-w-6xl mx-auto px-4 mb-16"
            >
              <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold text-white mb-2">Generated Prompt Alternatives</h2>
                <p className="text-neutral-400 text-sm">Choose the prompt style that best fits your needs</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {generatedPrompts.map((alt, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 flex flex-col hover:border-white/20 transition-all"
                  >
                    <h3 className="text-lg font-bold text-white mb-3">{alt.title}</h3>
                    <div className="bg-black/30 border border-white/5 rounded-xl p-4 mb-4 flex-1 overflow-hidden">
                      <p className="text-sm text-neutral-300 font-mono line-clamp-6 opacity-70">{alt.prompt}</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(alt.prompt)}
                      className="w-full py-3 bg-white/10 border border-white/20 rounded-xl text-white font-semibold text-sm hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
                    >
                      <Copy size={16} />
                      <span>Copy Prompt</span>
                    </button>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* --- PROMPT LIBRARY SECTION --- */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="w-full py-12 px-4"
        >
          <div className="max-w-6xl mx-auto flex flex-col gap-8">
            <div className="flex flex-col items-center justify-center text-center gap-6 mb-8 relative">
              <div className="space-y-3">
                <h2 className="text-3xl font-bold text-white flex items-center justify-center gap-3">
                  <Sparkles className="text-amber-400" /> Prompt Library
                </h2>
                <p className="text-neutral-400 max-w-xl mx-auto">
                  Choose between our curated free collection or advanced premium systems designed for scale.
                </p>
              </div>
              <div className="flex items-center gap-2 p-1.5 bg-white/5 backdrop-blur-md border border-white/10 rounded-full shadow-inner">
                <button
                  onClick={() => setSelectedTier("free")}
                  className={`px-8 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${selectedTier === "free" ? "bg-white text-black shadow-lg" : "text-neutral-500 hover:text-white hover:bg-white/5"}`}
                >
                  Free
                </button>
                <button
                  onClick={() => setSelectedTier("premium")}
                  className={`px-8 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${selectedTier === "premium" ? "bg-gradient-to-r from-amber-200 to-amber-500 text-black shadow-lg" : "text-neutral-500 hover:text-white hover:bg-white/5"}`}
                >
                  Premium
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-6 border-b border-white/10 pb-8">
              <div className="flex flex-wrap gap-2 justify-center">
                <button
                  onClick={() => setFilterDomain("all")}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all border backdrop-blur-md ${filterDomain === "all" ? "bg-white/10 text-white border-white/30" : "bg-white/5 text-neutral-400 border-white/5 hover:border-white/20 hover:text-white hover:bg-white/10"}`}
                >
                  All
                </button>
                {DOMAINS.map((d) => (
                  <button
                    key={d.key}
                    onClick={() => setFilterDomain(d.key)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all border flex items-center gap-2 backdrop-blur-md ${filterDomain === d.key ? `${d.color} bg-white/10 border-current shadow-[0_0_10px_rgba(255,255,255,0.05)]` : "bg-white/5 text-neutral-400 border-white/5 hover:border-white/20 hover:text-white hover:bg-white/10"}`}
                  >
                    <span>{d.emoji}</span>
                    {d.label}
                  </button>
                ))}
              </div>
              <AnimatePresence>
                {filterDomain !== "all" && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, y: -10, height: 0 }}
                    className="flex flex-wrap gap-2 justify-center overflow-hidden"
                  >
                    {domainMap.get(filterDomain)?.subcategories.map((sub) => (
                      <button
                        key={sub}
                        onClick={() => setActiveSubcategory(activeSubcategory === sub ? null : sub)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border backdrop-blur-md ${activeSubcategory === sub ? "bg-white text-black border-white" : "bg-white/5 text-neutral-400 border-white/5 hover:border-white/20 hover:text-white"}`}
                      >
                        {sub}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="flex items-center justify-center gap-4 w-full pt-4 border-t border-white/5">
                <div className="relative w-full max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
                  <input
                    type="text"
                    placeholder={selectedTier === "premium" ? "Search premium..." : "Search free..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-colors placeholder:text-neutral-600"
                  />
                </div>
                {selectedTier === "premium" && isPremiumUnlocked && (
                  <button
                    onClick={() => setIsCreating(true)}
                    className="flex items-center gap-2 px-4 py-3 bg-white/10 backdrop-blur-md border border-white/10 rounded-xl text-sm font-bold hover:bg-white/20 hover:text-white text-neutral-200 transition-all whitespace-nowrap"
                  >
                    <Plus size={18} />
                    <span>Create New</span>
                  </button>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[400px]">
              {filteredPrompts.length > 0 ? (
                filteredPrompts.map((prompt) => {
                  const domainConfig = domainMap.get(prompt.domain);
                  return (
                    <PromptCard
                      key={prompt.id}
                      prompt={prompt}
                      domainConfig={domainConfig}
                      isPremiumUnlocked={isPremiumUnlocked}
                      onClick={() => setActivePrompt(prompt)}
                    />
                  );
                })
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-20 text-neutral-500">
                  {selectedTier === "premium" ? (
                    <Lock size={48} className="mb-4 opacity-20" />
                  ) : (
                    <Search size={48} className="mb-4 opacity-20" />
                  )}
                  <p className="text-lg font-medium">No {selectedTier} prompts found</p>
                  <p className="text-sm">Try adjusting your filters.</p>
                </div>
              )}
            </div>
          </div>
        </motion.section>

        {/* MODAL AND CREATE OVERLAYS PRESERVED ... */}
        {/* ... (Rest of the code for modals remains same, just ensuring wrapper correct) */}
        <AnimatePresence>
          {activePrompt &&
            (() => {
              const activeDomainConfig = domainMap.get(activePrompt.domain);
              return (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setActivePrompt(null)}
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
                  />
                  <motion.div
                    layoutId={`card-${activePrompt.id}`}
                    className={`w-full max-w-2xl bg-white/5 backdrop-blur-md border rounded-2xl p-6 sm:p-8 relative z-10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${activePrompt.tier === "premium" ? "border-amber-500/30" : "border-white/20"}`}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActivePrompt(null);
                      }}
                      className="absolute top-4 right-4 p-2 rounded-full bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10 transition-colors z-20"
                    >
                      <X size={20} />
                    </button>
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                      <div className="flex items-center gap-2 mb-4">
                        <span className={`text-xs font-bold uppercase tracking-wider ${activeDomainConfig?.color}`}>
                          {activeDomainConfig?.label}
                        </span>
                        {activePrompt.tier === "premium" && (
                          <span
                            className={`text-xs font-bold uppercase border px-2 py-0.5 rounded-full ${isPremiumUnlocked ? "text-green-400 border-green-500/30 bg-green-900/20" : "text-amber-400 border-amber-500/30 bg-amber-900/20"}`}
                          >
                            {isPremiumUnlocked ? "Unlocked" : "Premium"}
                          </span>
                        )}
                      </div>
                      <motion.h3
                        layoutId={`title-${activePrompt.id}`}
                        className="text-2xl sm:text-3xl font-bold text-white mb-3"
                      >
                        {activePrompt.title}
                      </motion.h3>
                      <motion.p layoutId={`desc-${activePrompt.id}`} className="text-neutral-400 text-base mb-8">
                        {activePrompt.description}
                      </motion.p>
                      <div className="relative">
                        <div
                          className={`rounded-xl border p-6 font-mono text-sm leading-relaxed whitespace-pre-wrap ${activePrompt.tier === "premium" ? "bg-amber-900/10 border-amber-500/20 text-neutral-300" : "bg-white/5 backdrop-blur-md border-white/10 text-neutral-200"}`}
                        >
                          {activePrompt.tier === "premium" && !isPremiumUnlocked ? (
                            <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
                              <Lock size={32} className="text-amber-500 opacity-60" />
                              <div className="space-y-1">
                                <p className="text-white font-bold text-lg">Premium Content Locked</p>
                                <p className="text-neutral-500 text-sm max-w-xs mx-auto">
                                  This advanced system is part of our premium collection.
                                </p>
                              </div>
                              <button
                                onClick={() => setIsPremiumUnlocked(true)}
                                className="mt-2 bg-white text-black px-6 py-2.5 rounded-full font-bold hover:bg-amber-50 transition-colors flex items-center gap-2"
                              >
                                <span>Unlock for {activePrompt.price}</span>
                                <ArrowRight size={14} />
                              </button>
                            </div>
                          ) : (
                            activePrompt.prompt
                          )}
                        </div>
                        {(activePrompt.tier === "free" || isPremiumUnlocked) && (
                          <div className="flex items-center gap-3 mt-4">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                copyToClipboard(activePrompt.prompt);
                              }}
                              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-semibold text-sm hover:bg-white/10 transition-colors"
                            >
                              <Copy size={16} />
                              <span>Copy</span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                copyToClipboard(activePrompt.prompt);
                              }}
                              className="flex-[2] flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white text-black font-bold text-sm hover:bg-neutral-200 transition-colors shadow-lg shadow-white/10"
                            >
                              <Copy size={16} fill="black" />
                              <span>Copy Prompt</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </div>
              );
            })()}
        </AnimatePresence>
        <AnimatePresence>
          {isCreating && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center px-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsCreating(false)}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              />
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="w-full max-w-lg bg-white/5 backdrop-blur-md border border-white/20 rounded-2xl p-8 relative z-10 shadow-2xl flex flex-col gap-4"
              >
                <h3 className="text-2xl font-bold text-white mb-2">Create New Prompt</h3>
                <div>
                  <label className="text-xs font-bold text-neutral-500 uppercase block mb-1">Title</label>
                  <input
                    type="text"
                    value={newPromptData.title}
                    onChange={(e) => setNewPromptData({ ...newPromptData, title: e.target.value })}
                    className="w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-lg px-4 py-2 text-white focus:border-white/40 outline-none"
                    placeholder="e.g., Q4 Marketing Strategy"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-neutral-500 uppercase block mb-1">Domain</label>
                  <div className="flex gap-2">
                    {DOMAINS.map((d) => (
                      <button
                        key={d.key}
                        onClick={() => setNewPromptData({ ...newPromptData, domain: d.key })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${newPromptData.domain === d.key ? `${d.color} bg-white/10 border-white/20` : "text-neutral-500 border-transparent hover:bg-white/5"}`}
                      >
                        {d.emoji} {d.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-neutral-500 uppercase block mb-1">Prompt Content</label>
                  <textarea
                    value={newPromptData.prompt}
                    onChange={(e) => setNewPromptData({ ...newPromptData, prompt: e.target.value })}
                    className="w-full h-32 bg-white/5 backdrop-blur-md border border-white/10 rounded-lg px-4 py-2 text-white focus:border-white/40 outline-none font-mono text-sm resize-none"
                    placeholder="Enter the detailed system prompt here..."
                  />
                </div>
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => setIsCreating(false)}
                    className="flex-1 py-3 rounded-xl border border-white/10 text-neutral-400 hover:text-white transition-colors font-bold text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreatePrompt}
                    className="flex-1 py-3 rounded-xl bg-white text-black font-bold text-sm hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2"
                  >
                    <Save size={16} />
                    Save to Library
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.main>
    </div>
  );
}

export default function PromptWorkspaceUnified() {
  return <PromptWorkspaceInner />;
}
