import React, { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom"; 
import { AnimatePresence, motion } from "framer-motion";
import { 
  ArrowRight, Copy, Sparkles, Activity, Layers, Zap, FileText, 
  X, ArrowLeft, Home, RefreshCw, CheckCircle2, Cpu, Search, Tag, Lock, ShoppingCart, Expand, Plus, Play, Save, 
  PanelRight, MousePointer2, Bot, LayoutTemplate, Filter, Wand2, SlidersHorizontal, User, MessageSquare, FileType, Gauge, ChevronDown, Send, Loader2, Box, Trash2, GripHorizontal, AlertCircle
} from "lucide-react";

// --- TYPES ---
type Domain = "creativity" | "personal" | "business" | "crypto";
type Stage = "idle" | "goal" | "agent" | "result";
type WidgetType = "input" | "engine" | "output" | "multi-model";

interface AgentLog {
  id: number;
  text: string;
  status: "pending" | "done";
  timestamp: string;
}

// Widget Data Interfaces
interface MultiModelData {
  prompt: string;
  selectedModels: string[];
  isTesting: boolean;
  results: {
    model: string;
    response: string | null;
    status: "idle" | "loading" | "success" | "error";
    error?: string;
  }[];
}

interface Widget {
  id: string;
  type: WidgetType;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  data?: any; // Generic data storage for widget specific state
}

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
}[] = [{
  key: "business",
  label: "Business",
  emoji: "💼",
  desc: "Strategy, market & scale",
  color: "text-cyan-400",
  gradient: "from-cyan-500/20 to-blue-600/5",
  subcategories: ["Sales", "Marketing", "SEO", "Strategy", "Management"]
}, {
  key: "creativity",
  label: "Creativity",
  emoji: "🎨",
  desc: "Art, design & vision",
  color: "text-purple-400",
  gradient: "from-purple-500/20 to-pink-600/5",
  subcategories: ["Writing", "Art", "Design", "Content", "Viral"]
}, {
  key: "personal",
  label: "Personal",
  emoji: "🧠",
  desc: "Growth, habits & life",
  color: "text-red-400",
  gradient: "from-red-500/20 to-orange-600/5",
  subcategories: ["Mind", "Wellness", "Habits", "Learning", "Biohacking"]
}, {
  key: "crypto",
  label: "Crypto",
  emoji: "🪙",
  desc: "Web3, tokens & analysis",
  color: "text-green-400",
  gradient: "from-green-500/20 to-emerald-600/5",
  subcategories: ["Trading", "DeFi", "NFT", "Analysis", "Security"]
}];

const AVAILABLE_MODELS = [
  { id: "gpt-4o", name: "GPT-4o", icon: Zap, color: "text-green-400" },
  { id: "claude-3-5", name: "Claude 3.5 Sonnet", icon: Bot, color: "text-orange-400" },
  { id: "gemini-1-5", name: "Gemini 1.5 Pro", icon: Sparkles, color: "text-blue-400" },
  { id: "llama-3", name: "Llama 3", icon: Cpu, color: "text-purple-400" }
];

const WIDGET_CATALOG = [
  { type: 'input', title: 'User Protocol', desc: 'Primary input interface for defining goals.', icon: FileText, color: 'text-cyan-400' },
  { type: 'engine', title: 'Neural Engine', desc: 'Visualizes the AI processing steps.', icon: Cpu, color: 'text-amber-400' },
  { type: 'output', title: 'Prompt Refiner', desc: 'Displays the optimized prompt output.', icon: Wand2, color: 'text-purple-400' },
  { type: 'multi-model', title: 'Multi-Model Test', desc: 'Test prompts against GPT-4, Claude & Gemini.', icon: Box, color: 'text-green-400' }
];

const INITIAL_PROMPTS: LibraryPrompt[] = [
  { id: "1", title: "Blue Ocean Strategy Generator", description: "Identify uncontested market spaces.", prompt: "Act as a strategic consultant. Analyze the [INDUSTRY] market...", domain: "business", tags: ["Strategy"], tier: "free" },
  { id: "2", title: "SEO Keyword Cluster Builder", description: "Generate a topical authority map.", prompt: "Act as an SEO specialist. Create a keyword cluster...", domain: "business", tags: ["SEO"], tier: "free" },
  { id: "3", title: "Visual Style Mixer", description: "Combine artistic styles for Midjourney.", prompt: "Create a visual art prompt that combines...", domain: "creativity", tags: ["Art"], tier: "free" },
  { id: "4", title: "Morning Routine Optimizer", description: "Build a habit stack.", prompt: "Create a morning routine based on...", domain: "personal", tags: ["Habits"], tier: "free" },
  { id: "p1", title: "Enterprise Scale OS", description: "Complete operating system for scaling.", prompt: "## Enterprise Scale Framework\n...", domain: "business", tags: ["Management"], tier: "premium", price: "$49" },
  { id: "p2", title: "Crypto Alpha Hunter Bot", description: "Advanced Python logic.", prompt: "## Alpha Hunter Logic\n...", domain: "crypto", tags: ["Trading"], tier: "premium", price: "$129" },
  { id: "p3", title: "Viral Hook Architect", description: "Psychological framework for content.", prompt: "## Viral Script Structure\n...", domain: "creativity", tags: ["Viral"], tier: "premium", price: "$29" },
  { id: "p4", title: "Bio-Hacking Masterclass", description: "Protocol for cognitive endurance.", prompt: "## Cognitive Endurance Protocol\n...", domain: "personal", tags: ["Biohacking"], tier: "premium", price: "$39" }
];

const PLACEHOLDERS = ["What is your goal?", "Draft a viral thread...", "Analyze Q3 sales data...", "Create a fitness plan..."];

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
const CustomSelect = ({ label, icon: Icon, value, options, onChange }: { label: string, icon: any, value: string, options: string[], onChange: (val: string) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  return (
    <div className="space-y-1 relative" ref={containerRef}>
      <label className="text-[10px] uppercase font-bold text-neutral-500 flex items-center gap-1"><Icon size={10} /> {label}</label>
      <button onClick={() => setIsOpen(!isOpen)} className="w-full bg-black backdrop-blur-md border border-white/10 rounded-xl px-3 py-2 text-xs text-white flex items-center justify-between hover:bg-white/10 transition-colors focus:border-white/30 outline-none"><span>{value}</span><ChevronDown size={12} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} /></button>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} className="absolute top-full left-0 right-0 mt-1 bg-[#161618]/95 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden z-50 shadow-2xl">
            <div className="max-h-40 overflow-y-auto custom-scrollbar p-1">
                {options.map((opt) => (<button key={opt} onClick={() => { onChange(opt); setIsOpen(false); }} className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-colors ${value === opt ? "text-white bg-white/10 font-bold" : "text-neutral-400 hover:bg-white/10 hover:text-white"}`}>{opt}</button>))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

function PromptWorkspaceInner() {
  const navigate = useNavigate();

  // --- STATE ---
  const [viewMode, setViewMode] = useState<"landing" | "workspace">("landing");
  const [domain, setDomain] = useState<Domain | null>(null);
  const [prompts, setPrompts] = useState<LibraryPrompt[]>(INITIAL_PROMPTS); 
  
  // Library State
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDomain, setFilterDomain] = useState<Domain | "all">("all");
  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(null);
  const [selectedTier, setSelectedTier] = useState<PromptTier>("free");
  const [isPremiumUnlocked, setIsPremiumUnlocked] = useState(false); 
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [libraryTab, setLibraryTab] = useState<"prompts" | "widgets">("prompts"); 
  const [pinnedPrompts, setPinnedPrompts] = useState<{item: LibraryPrompt, x: number, y: number}[]>([]);
  
  // Landing Input State
  const [landingInput, setLandingInput] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [cursorPos, setCursorPos] = useState(0);
  const [isFocused, setIsFocused] = useState(false);

  // Modal & Logic State
  const [activePrompt, setActivePrompt] = useState<LibraryPrompt | null>(null); 
  const [isCreating, setIsCreating] = useState(false);
  const [newPromptData, setNewPromptData] = useState({ title: "", description: "", prompt: "", domain: "business" as Domain });
  const [userText, setUserText] = useState("");
  const [selectedGoal, setSelectedGoal] = useState("");
  const [stage, setStage] = useState<Stage>("idle");
  const [progress, setProgress] = useState(0);
  const [agentLogs, setAgentLogs] = useState<AgentLog[]>([]);
  const [refinementSettings, setRefinementSettings] = useState({ role: "Expert", tone: "Professional", format: "Step-by-Step", complexity: 50 });
  const [resultPrompt, setResultPrompt] = useState<string | null>(null);
  const [goalVariation, setGoalVariation] = useState(0);
  const [runId, setRunId] = useState(0);

  // Workspace Widget State
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [dragging, setDragging] = useState<{ type: "widget" | "pinned" | "new-widget", id: string, index?: number, startX: number, startY: number, widgetType?: WidgetType } | null>(null);
  const [resizing, setResizing] = useState<{ id: string, startX: number, startY: number, startWidth: number, startHeight: number } | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);

  // --- EFFECTS ---
  useEffect(() => {
    if (viewMode !== "landing" || landingInput.length > 0) return;
    const interval = setInterval(() => setPlaceholderIndex(prev => (prev + 1) % PLACEHOLDERS.length), 4000);
    return () => clearInterval(interval);
  }, [viewMode, landingInput]);

  // --- HELPERS & HANDLERS ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => { setLandingInput(e.target.value); setCursorPos(e.target.selectionStart || e.target.value.length); };
  const handleInputSelect = (e: React.SyntheticEvent<HTMLInputElement, Event>) => { setCursorPos((e.target as HTMLInputElement).selectionStart || 0); };
  
  const filteredPrompts = useMemo(() => {
    return prompts.filter(p => {
      const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesDomain = filterDomain === "all" || p.domain === filterDomain;
      const matchesSubcategory = activeSubcategory ? p.tags.includes(activeSubcategory) : true;
      const matchesTier = p.tier === selectedTier;
      return matchesSearch && matchesDomain && matchesSubcategory && matchesTier;
    });
  }, [searchQuery, filterDomain, activeSubcategory, selectedTier, prompts]);

  const goalOptions = useMemo(() => {
    const base = userText.trim();
    if (!base) return [] as string[];
    return [`Improve: ${base}`, `Analyze: ${base}`, `Expand: ${base}`]; 
  }, [userText]);

  // --- SIMULATION LOGIC (MAIN WORKFLOW) ---
  useEffect(() => {
    if (!selectedGoal) return;
    let isMounted = true;
    setStage("agent"); setAgentLogs([]); setResultPrompt(null); setProgress(0);
    const addLog = (text: string) => setAgentLogs(prev => [...prev, { id: Date.now(), text, status: "done", timestamp: new Date().toLocaleTimeString() }]);
    
    const runSimulation = async () => {
      if (!isMounted) return;
      addLog("🔍 Analyzing user intent..."); setProgress(30); await new Promise(r => setTimeout(r, 600));
      addLog("🧠 Applying advanced prompt engineering..."); setProgress(70); await new Promise(r => setTimeout(r, 600));
      addLog("✨ Finalizing output structure..."); setProgress(100); await new Promise(r => setTimeout(r, 500));
      if (!isMounted) return;
      setStage("result");
      generateFinalPrompt();
    };
    runSimulation();
    return () => { isMounted = false; };
  }, [selectedGoal, runId]);

  // --- PROMPT GENERATOR (HIGH QUALITY) ---
  const generateFinalPrompt = () => {
      const base = selectedGoal.split(": ")[1] || selectedGoal || userText || "your task";
      const { role, tone, format, complexity } = refinementSettings;
      
      let calculatedRole = role;
      if (role === "Expert") {
          const txt = base.toLowerCase();
          if (txt.includes("business") || txt.includes("strategy")) calculatedRole = "Chief Strategy Officer (CSO)";
          else if (txt.includes("code") || txt.includes("react") || txt.includes("python")) calculatedRole = "Senior Principal Engineer";
          else if (txt.includes("marketing") || txt.includes("viral")) calculatedRole = "World-Class Growth Marketer";
          else if (txt.includes("fitness") || txt.includes("health")) calculatedRole = "Elite Performance Coach";
          else calculatedRole = "Domain Expert";
      }

      const prompt = `**ROLE & PERSONA:**
You are a **${calculatedRole}**. You have 20+ years of experience in this field, known for delivering high-impact, data-driven, and actionable advice without fluff.

**CONTEXT & OBJECTIVE:**
The user needs to: "${base}".
Your goal is to provide a comprehensive solution that solves this specific problem with maximum efficiency.

**CONSTRAINTS:**
- **Tone:** ${tone}
- **Complexity:** ${complexity > 70 ? "High (Technical/Deep)" : complexity < 30 ? "Low (Simple/ELI5)" : "Balanced"}
- **Format:** ${format}
- Avoid generic advice. Be specific.

**REQUIRED OUTPUT STRUCTURE:**
1.  **Executive Summary:** A 2-sentence hook summarizing the strategy.
2.  **Step-by-Step Execution Plan:**
    * Phase 1: Foundation
    * Phase 2: Implementation
    * Phase 3: Optimization
3.  **Key Success Metrics (KPIs):** How to measure the outcome.
4.  **Common Pitfalls:** What to avoid.

*(Self-Correction mechanism: Before outputting, verify that the advice is actionable and specific to the context of "${base}".)*`;
      
      setResultPrompt(prompt);
  };


  // --- MULTI-MODEL TEST LOGIC ---
  const handleRunMultiModelTest = (widgetId: string) => {
    setWidgets(prev => prev.map(w => {
      if (w.id !== widgetId || !w.data) return w;
      const newData = { ...w.data, isTesting: true, results: [] } as MultiModelData;
      w.data.selectedModels.forEach((modelId: string) => {
        newData.results.push({ model: modelId, response: null, status: "loading" });
      });
      return { ...w, data: newData };
    }));

    const widget = widgets.find(w => w.id === widgetId);
    if (!widget || !widget.data) return;

    widget.data.selectedModels.forEach((modelId: string) => {
      setTimeout(() => {
        setWidgets(currentWidgets => currentWidgets.map(w => {
          if (w.id !== widgetId) return w;
           const updatedResults = w.data.results.map((r: any) => {
             if (r.model === modelId) {
               return { 
                 ...r, 
                 status: "success", 
                 response: `[${AVAILABLE_MODELS.find(m => m.id === modelId)?.name} Response]\n\nBased on your input, here is a ${modelId}-style analysis.\n\n1. Observation.\n2. Insight.\n3. Recommendation.` 
               };
             }
             return r;
           });
           return { ...w, data: { ...w.data, isTesting: false, results: updatedResults }};
        }));
      }, 1500 + Math.random() * 2000);
    });
  };
  const handleToggleModel = (widgetId: string, modelId: string) => {
    setWidgets(prev => prev.map(w => {
      if (w.id !== widgetId) return w;
      const currentModels = w.data.selectedModels || [];
      const newModels = currentModels.includes(modelId) ? currentModels.filter((m: string) => m !== modelId) : [...currentModels, modelId];
      return { ...w, data: { ...w.data, selectedModels: newModels } };
    }));
  };

  const handleWidgetPromptChange = (widgetId: string, text: string) => {
    setWidgets(prev => prev.map(w => w.id === widgetId ? { ...w, data: { ...w.data, prompt: text } } : w));
  };

  const handleDeleteWidget = (id: string) => {
    setWidgets(prev => prev.filter(w => w.id !== id));
  };

  const handleCreatePrompt = () => {
    if (!newPromptData.title.trim() || !newPromptData.prompt.trim()) return;
    const newEntry: LibraryPrompt = {
      id: `${Date.now()}`,
      title: newPromptData.title.trim(),
      description: newPromptData.description.trim() || "User generated prompt",
      prompt: newPromptData.prompt,
      domain: newPromptData.domain,
      tags: [newPromptData.domain],
      tier: "premium",
      price: "$0"
    };
    setPrompts(prev => [...prev, newEntry]);
    setIsCreating(false);
    setNewPromptData({ title: "", description: "", prompt: "", domain: "business" });
  };

  // --- WORKSPACE INIT ---
  const initializeWorkspace = (selectedDomain: Domain, initialText?: string, autoRun: boolean = false) => {
    setDomain(selectedDomain);
    setViewMode("workspace");
    setPinnedPrompts([]);
    if (initialText) {
       setUserText(initialText);
       if (autoRun) setTimeout(() => setSelectedGoal(`Optimization for: ${initialText}`), 100);
    } else {
      setUserText(""); setSelectedGoal("");
    }
    setStage(initialText && autoRun ? "goal" : "idle");
    
    // Default widgets
    setWidgets([
      { id: "input", type: "input", title: "User Protocol", x: 50, y: 100, width: 400, height: 500 },
      { id: "engine", type: "engine", title: "Neural Engine", x: 480, y: 100, width: 350, height: 500 },
      { id: "output", type: "output", title: "Prompt Refiner", x: 860, y: 100, width: 500, height: 600 }
    ]);
  };

  // --- WIDGET ADD LOGIC ---
  const handleAddWidget = (widgetDef: typeof WIDGET_CATALOG[0]) => {
     const exists = widgets.some(w => w.type === widgetDef.type);
     if (exists) return; 

     const newWidget: Widget = {
       id: widgetDef.type === 'multi-model' ? Date.now().toString() : widgetDef.type, 
       type: widgetDef.type as WidgetType,
       title: widgetDef.title,
       x: window.innerWidth / 2 - 200, 
       y: window.innerHeight / 2 - 300,
       width: widgetDef.type === 'multi-model' ? 500 : 400,
       height: 600,
       data: widgetDef.type === 'multi-model' ? { prompt: "", selectedModels: [], isTesting: false, results: [] } : {}
     };
     setWidgets(prev => [...prev, newWidget]);
  };

  // --- DRAG & DROP LOGIC ---
  const handleMouseDown = (e: React.MouseEvent, type: "widget" | "pinned", id: string, index?: number) => {
    if ((e.target as HTMLElement).closest("textarea, input, button, select, .no-drag")) return;
    e.stopPropagation();
    
    let startX = 0, startY = 0;

    if (type === "widget") {
      const widget = widgets.find(w => w.id === id);
      if (widget) { 
        startX = e.clientX - widget.x; 
        startY = e.clientY - widget.y; 
      }
    } else if (type === "pinned" && index !== undefined) {
      const pinned = pinnedPrompts[index];
      if (pinned) { 
        startX = e.clientX - pinned.x; 
        startY = e.clientY - pinned.y; 
      }
    }

    setDragging({ type, id, index, startX, startY });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragging) return;

      if (dragging.type === "widget") {
        setWidgets(prev => prev.map(w => w.id === dragging.id ? { ...w, x: e.clientX - dragging.startX, y: e.clientY - dragging.startY } : w));
      } else if (dragging.type === "pinned" && dragging.index !== undefined) {
        const newX = e.clientX - dragging.startX;
        const newY = e.clientY - dragging.startY;
        setPinnedPrompts(prev => prev.map((p, i) => i === dragging.index ? { ...p, x: newX, y: newY } : p));
        
        const targetWidget = widgets.find(w => w.type === "multi-model" && e.clientX >= w.x && e.clientX <= w.x + w.width && e.clientY >= w.y && e.clientY <= w.y + w.height);
        setDropTargetId(targetWidget ? targetWidget.id : null);
      }
    };
    
    const handleMouseUp = (e: MouseEvent) => {
      if (dragging) {
        if (dragging.type === "pinned" && dropTargetId && dragging.index !== undefined) {
           const promptText = pinnedPrompts[dragging.index].item.prompt;
           setWidgets(prev => prev.map(w => w.id === dropTargetId ? { ...w, data: { ...w.data, prompt: promptText } } : w));
           setDropTargetId(null);
        }
      }
      setDragging(null); setResizing(null);
    };
    
    window.addEventListener("mousemove", handleMouseMove); 
    window.addEventListener("mouseup", handleMouseUp); 
    
    return () => { 
      window.removeEventListener("mousemove", handleMouseMove); 
      window.removeEventListener("mouseup", handleMouseUp); 
    };
  }, [dragging, resizing, pinnedPrompts, widgets, dropTargetId]);

  // Separate resize effect
  useEffect(() => {
      const handleMouseMove = (e: MouseEvent) => { if (resizing) setWidgets(prev => prev.map(w => w.id === resizing.id ? { ...w, width: Math.max(300, resizing.startWidth + (e.clientX - resizing.startX)), height: Math.max(200, resizing.startHeight + (e.clientY - resizing.startY)) } : w)); };
      const handleMouseUp = () => setResizing(null);
      if(resizing) { window.addEventListener("mousemove", handleMouseMove); window.addEventListener("mouseup", handleMouseUp); }
      return () => { window.removeEventListener("mousemove", handleMouseMove); window.removeEventListener("mouseup", handleMouseUp); }
  }, [resizing]);

  // --- RENDER ---
  return (
    <div className="relative h-screen w-full bg-black text-white flex flex-col font-sans overflow-hidden selection:bg-cyan-500/30 selection:text-cyan-100">
      <div className="fixed inset-0 z-0 opacity-30 pointer-events-none" style={{ backgroundImage: 'url("/lovable-uploads/IMG_0468.JPEG")', backgroundSize: "cover", backgroundPosition: "center" }} />
      <div className="pointer-events-none fixed inset-0 z-0 bg-black/60" />
      <div className="pointer-events-none fixed inset-0 z-0 bg-gradient-to-b from-black via-transparent to-purple-900/20" />

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
         <button onClick={() => setIsPremiumUnlocked(!isPremiumUnlocked)} className={`w-10 h-5 rounded-full p-1 transition-colors ${isPremiumUnlocked ? "bg-amber-500" : "bg-neutral-800"}`}><div className={`w-3 h-3 bg-white rounded-full transition-transform ${isPremiumUnlocked ? "translate-x-5" : "translate-x-0"}`} /></button>
      </div>

      <AnimatePresence mode="wait">
        {viewMode === "landing" ? (
          <motion.main key="landing" exit={{ opacity: 0, filter: "blur(10px)" }} className="flex-1 flex flex-col items-center p-4 w-full max-w-7xl mx-auto z-10 relative h-full overflow-y-auto custom-scrollbar [&_input]:caret-transparent [&_input:focus]:caret-white [&_textarea]:caret-transparent [&_textarea:focus]:caret-white">
              <button onClick={() => navigate("/")} className="absolute top-4 left-4 z-50 p-2 rounded-full bg-black border border-white/10 text-neutral-400 hover:text-white hover:bg-white/10 flex items-center gap-2"><Home size={20} /><span className="text-sm font-medium">Home</span></button>
              <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full flex flex-col items-center justify-center min-h-[60vh] text-center py-20 px-4">
                <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 mt-12">The Most Powerful Prompt <span className="inline-block bg-gradient-to-r from-purple-600 to-cyan-500 bg-clip-text text-transparent">AI Workflow</span></h1>
                <div className="inline-block bg-black rounded-2xl px-8 py-3 mb-12 border border-white/10"><p className="text-lg text-white/90 font-medium text-center">By Beymflow</p></div>
              </motion.section>
              
              {/* Lowkey Chat Input */}
              <div className="w-full max-w-4xl mx-auto mb-32 px-4 relative z-20">
                <form onSubmit={(e) => { e.preventDefault(); if(landingInput.trim()) initializeWorkspace("business", landingInput, true); }} className="relative group flex flex-col items-center justify-center" onClick={() => document.getElementById('main-input')?.focus()}>
                  <div className="relative flex flex-wrap justify-center items-center text-2xl md:text-4xl font-light tracking-tight cursor-text min-h-[60px] w-full text-center">
                      <input id="main-input" type="text" value={landingInput} onChange={handleInputChange} onSelect={handleInputSelect} onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)} className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-text caret-transparent text-center" autoComplete="off" />
                      {landingInput.length === 0 && !isFocused ? (<div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden"><AnimatePresence mode="popLayout"><motion.span key={placeholderIndex} initial={{ opacity: 0, y: 20, filter: "blur(10px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)", backgroundPosition: ["0% center", "-200% center"] }} exit={{ opacity: 0, y: -20, filter: "blur(10px)" }} transition={{ opacity: { duration: 0.5 }, y: { duration: 0.5 }, backgroundPosition: { duration: 2.5, ease: "linear", repeat: 0 } }} className="text-transparent bg-clip-text bg-[length:200%_auto]" style={{ backgroundImage: "linear-gradient(to right, #737373 0%, #737373 20%, #a855f7 50%, #06b6d4 80%, #737373 100%)" }}>{PLACEHOLDERS[placeholderIndex]}</motion.span></AnimatePresence></div>) : (<div className="relative z-0 flex items-center justify-center break-all"><span className="text-white whitespace-pre-wrap relative">{landingInput.slice(0, cursorPos)}</span><motion.div animate={{ opacity: [1, 0.5, 1], height: ["1.2em", "1em", "1.2em"], backgroundColor: ["#a855f7", "#d8b4fe", "#a855f7"] }} transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }} className="w-[3px] h-[1.2em] bg-purple-500 rounded-full mx-[2px] inline-block align-middle" /><span className="text-white whitespace-pre-wrap relative">{landingInput.slice(cursorPos)}</span></div>)}
                  </div>
                  <div className="h-12 mt-4 flex items-center justify-center"><AnimatePresence>{landingInput.trim().length > 0 && (<motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} type="submit" className="group flex items-center gap-2 px-6 py-2 bg-white text-black rounded-full font-bold text-sm hover:bg-neutral-200 transition-all shadow-lg shadow-purple-500/20 cursor-pointer z-20"><span>Enter the Lab</span><ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" /></motion.button>)}</AnimatePresence></div>
                </form>
              </div>

              {/* --- PROMPT LIBRARY SECTION --- */}
              <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="w-full py-12 px-4">
                <div className="max-w-6xl mx-auto flex flex-col gap-8">
                  <div className="flex flex-col items-center justify-center text-center gap-6 mb-8 relative">
                    <div className="space-y-3"><h2 className="text-3xl font-bold text-white flex items-center justify-center gap-3"><Sparkles className="text-amber-400" /> Prompt Library</h2><p className="text-neutral-400 max-w-xl mx-auto">Choose between our curated free collection or advanced premium systems designed for scale.</p></div>
                    <div className="flex items-center gap-2 p-1.5 bg-black border border-white/10 rounded-full shadow-inner"><button onClick={() => setSelectedTier("free")} className={`px-8 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${selectedTier === "free" ? "bg-white text-black shadow-lg" : "text-neutral-500 hover:text-white"}`}>Free</button><button onClick={() => setSelectedTier("premium")} className={`px-8 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${selectedTier === "premium" ? "bg-gradient-to-r from-amber-200 to-amber-500 text-black shadow-lg" : "text-neutral-500 hover:text-white"}`}>Premium</button></div>
                  </div>
                  <div className="flex flex-col gap-6 border-b border-white/10 pb-8">
                    <div className="flex flex-wrap gap-2 justify-center"><button onClick={() => setFilterDomain("all")} className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${filterDomain === "all" ? "bg-white/10 text-white border-white/30" : "bg-transparent text-neutral-400 border-white/5 hover:border-white/20 hover:text-white"}`}>All</button>{DOMAINS.map(d => (<button key={d.key} onClick={() => setFilterDomain(d.key)} className={`px-4 py-2 rounded-full text-sm font-medium transition-all border flex items-center gap-2 ${filterDomain === d.key ? `${d.color} bg-black border-current shadow-[0_0_10px_rgba(255,255,255,0.05)]` : "bg-transparent text-neutral-400 border-white/5 hover:border-white/20 hover:text-white"}`}><span>{d.emoji}</span>{d.label}</button>))}</div>
                    <AnimatePresence>{filterDomain !== "all" && (<motion.div initial={{ opacity: 0, y: -10, height: 0 }} animate={{ opacity: 1, y: 0, height: "auto" }} exit={{ opacity: 0, y: -10, height: 0 }} className="flex flex-wrap gap-2 justify-center overflow-hidden">{DOMAINS.find(d => d.key === filterDomain)?.subcategories.map(sub => (<button key={sub} onClick={() => setActiveSubcategory(activeSubcategory === sub ? null : sub)} className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${activeSubcategory === sub ? "bg-white text-black border-white" : "bg-black text-neutral-400 border-white/5 hover:border-white/20 hover:text-white"}`}>{sub}</button>))}</motion.div>)}</AnimatePresence>
                    <div className="flex items-center justify-center gap-4 w-full pt-4 border-t border-white/5">
                      <div className="relative w-full max-w-md"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={18} /><input type="text" placeholder={selectedTier === 'premium' ? "Search premium..." : "Search free..."} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-black border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-colors placeholder:text-neutral-600" /></div>
                      {selectedTier === "premium" && isPremiumUnlocked && (<button onClick={() => setIsCreating(true)} className="flex items-center gap-2 px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-sm font-bold hover:bg-white/20 hover:text-white text-neutral-200 transition-all whitespace-nowrap"><Plus size={18} /><span>Create New</span></button>)}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[400px]">
                    {filteredPrompts.length > 0 ? (filteredPrompts.map((prompt) => { const domainConfig = DOMAINS.find(d => d.key === prompt.domain); const isPremium = prompt.tier === "premium"; return (<motion.div layoutId={`card-${prompt.id}`} key={prompt.id} onClick={() => setActivePrompt(prompt)} className={`group relative bg-[#0F0F10] border rounded-2xl p-6 flex flex-col justify-between transition-all hover:shadow-2xl overflow-hidden cursor-pointer ${isPremium ? "border-amber-500/20 hover:border-amber-500/40 hover:shadow-amber-900/10" : "border-white/10 hover:border-white/20 hover:shadow-purple-900/10"}`}>{isPremium && <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent pointer-events-none" />}<div className="relative z-10"><div className="flex items-start justify-between mb-4"><div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 border border-white/5 text-xs font-bold uppercase tracking-wider ${domainConfig?.color}`}>{domainConfig?.emoji} {domainConfig?.label}</div>{isPremium ? (<div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border ${isPremiumUnlocked ? "text-green-400 bg-green-900/20 border-green-500/20" : "text-amber-400 bg-amber-900/20 border-amber-500/20"}`}>{isPremiumUnlocked ? <CheckCircle2 size={12} /> : <Lock size={12} />}<span>{isPremiumUnlocked ? "Unlocked" : "Premium"}</span></div>) : (<div className="p-2 rounded-lg bg-transparent text-neutral-500 group-hover:text-white transition-colors"><Expand size={16} /></div>)}</div><motion.h3 layoutId={`title-${prompt.id}`} className="text-xl font-bold mb-2 text-white">{prompt.title}</motion.h3><motion.p layoutId={`desc-${prompt.id}`} className="text-neutral-400 text-sm mb-6 leading-relaxed line-clamp-2">{prompt.description}</motion.p><div className="bg-[#18181B] rounded-xl p-4 mb-4 border border-white/5 relative overflow-hidden group-hover:border-white/10 transition-colors h-24">{isPremium && !isPremiumUnlocked ? (<><p className="text-sm text-neutral-300 font-mono line-clamp-3 opacity-30 blur-sm select-none">{prompt.prompt}</p><div className="absolute inset-0 flex items-center justify-center"><Lock className="text-amber-500/50" size={24} /></div></>) : (<p className="text-sm text-neutral-300 font-mono line-clamp-3 opacity-70">{prompt.prompt}</p>)}</div></div><div className="relative z-10 flex items-center justify-between mt-auto pt-4 border-t border-white/5"><div className="flex items-center gap-2 flex-wrap"><Tag size={14} className="text-neutral-600" />{prompt.tags.map(tag => (<span key={tag} className="text-xs text-neutral-500">#{tag}</span>))}</div>{isPremium && !isPremiumUnlocked && (<button className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg text-xs font-bold hover:bg-neutral-200 transition-colors"><span>Unlock {prompt.price}</span><ShoppingCart size={14} /></button>)}{(isPremiumUnlocked || !isPremium) && (<span className="text-xs font-bold text-white/50 flex items-center gap-1">Open <ArrowRight size={12} /></span>)}</div></motion.div>);})) : (<div className="col-span-full flex flex-col items-center justify-center py-20 text-neutral-500">{selectedTier === 'premium' ? <Lock size={48} className="mb-4 opacity-20" /> : <Search size={48} className="mb-4 opacity-20" />}<p className="text-lg font-medium">No {selectedTier} prompts found</p><p className="text-sm">Try adjusting your filters.</p></div>)}
                  </div>
                </div>
              </motion.section>

              {/* MODAL AND CREATE OVERLAYS PRESERVED ... */}
              {/* ... (Rest of the code for modals remains same, just ensuring wrapper correct) */}
              <AnimatePresence>{activePrompt && (<div className="fixed inset-0 z-[100] flex items-center justify-center px-4"><motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActivePrompt(null)} className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer" /><motion.div layoutId={`card-${activePrompt.id}`} className={`w-full max-w-2xl bg-[#121214] border rounded-2xl p-6 sm:p-8 relative z-10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${activePrompt.tier === "premium" ? "border-amber-500/30" : "border-white/20"}`}><button onClick={(e) => { e.stopPropagation(); setActivePrompt(null); }} className="absolute top-4 right-4 p-2 rounded-full bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10 transition-colors z-20"><X size={20} /></button><div className="flex-1 overflow-y-auto custom-scrollbar"><div className="flex items-center gap-2 mb-4"><span className={`text-xs font-bold uppercase tracking-wider ${DOMAINS.find(d => d.key === activePrompt.domain)?.color}`}>{DOMAINS.find(d => d.key === activePrompt.domain)?.label}</span>{activePrompt.tier === "premium" && (<span className={`text-xs font-bold uppercase border px-2 py-0.5 rounded-full ${isPremiumUnlocked ? "text-green-400 border-green-500/30 bg-green-900/20" : "text-amber-400 border-amber-500/30 bg-amber-900/20"}`}>{isPremiumUnlocked ? "Unlocked" : "Premium"}</span>)}</div><motion.h3 layoutId={`title-${activePrompt.id}`} className="text-2xl sm:text-3xl font-bold text-white mb-3">{activePrompt.title}</motion.h3><motion.p layoutId={`desc-${activePrompt.id}`} className="text-neutral-400 text-base mb-8">{activePrompt.description}</motion.p><div className="relative"><div className={`rounded-xl border p-6 font-mono text-sm leading-relaxed whitespace-pre-wrap ${activePrompt.tier === "premium" ? "bg-amber-900/10 border-amber-500/20 text-neutral-300" : "bg-black/40 border-white/10 text-neutral-200"}`}>{activePrompt.tier === "premium" && !isPremiumUnlocked ? (<div className="flex flex-col items-center justify-center py-12 gap-4 text-center"><Lock size={32} className="text-amber-500 opacity-60" /><div className="space-y-1"><p className="text-white font-bold text-lg">Premium Content Locked</p><p className="text-neutral-500 text-sm max-w-xs mx-auto">This advanced system is part of our premium collection.</p></div><button onClick={() => setIsPremiumUnlocked(true)} className="mt-2 bg-white text-black px-6 py-2.5 rounded-full font-bold hover:bg-amber-50 transition-colors flex items-center gap-2"><span>Unlock for {activePrompt.price}</span><ArrowRight size={14} /></button></div>) : (activePrompt.prompt)}</div>{(activePrompt.tier === "free" || isPremiumUnlocked) && (<div className="flex items-center gap-3 mt-4"><button onClick={(e) => { e.stopPropagation(); copyToClipboard(activePrompt.prompt); }} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-semibold text-sm hover:bg-white/10 transition-colors"><Copy size={16} /><span>Copy</span></button><button onClick={(e) => { e.stopPropagation(); initializeWorkspace(activePrompt.domain, activePrompt.prompt, true); }} className="flex-[2] flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white text-black font-bold text-sm hover:bg-neutral-200 transition-colors shadow-lg shadow-white/10"><Play size={16} fill="black" /><span>Open in Workspace & Run</span></button></div>)}</div></div></motion.div></div>)}</AnimatePresence>
              <AnimatePresence>{isCreating && (<div className="fixed inset-0 z-[110] flex items-center justify-center px-4"><motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCreating(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" /><motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="w-full max-w-lg bg-[#121214] border border-white/20 rounded-2xl p-8 relative z-10 shadow-2xl flex flex-col gap-4"><h3 className="text-2xl font-bold text-white mb-2">Create New Prompt</h3><div><label className="text-xs font-bold text-neutral-500 uppercase block mb-1">Title</label><input type="text" value={newPromptData.title} onChange={e => setNewPromptData({...newPromptData, title: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-white/40 outline-none" placeholder="e.g., Q4 Marketing Strategy" /></div><div><label className="text-xs font-bold text-neutral-500 uppercase block mb-1">Domain</label><div className="flex gap-2">{DOMAINS.map(d => (<button key={d.key} onClick={() => setNewPromptData({...newPromptData, domain: d.key})} className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${newPromptData.domain === d.key ? `${d.color} bg-white/10 border-white/20` : "text-neutral-500 border-transparent hover:bg-white/5"}`}>{d.emoji} {d.label}</button>))}</div></div><div><label className="text-xs font-bold text-neutral-500 uppercase block mb-1">Prompt Content</label><textarea value={newPromptData.prompt} onChange={e => setNewPromptData({...newPromptData, prompt: e.target.value})} className="w-full h-32 bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-white/40 outline-none font-mono text-sm resize-none" placeholder="Enter the detailed system prompt here..." /></div><div className="flex gap-3 mt-4"><button onClick={() => setIsCreating(false)} className="flex-1 py-3 rounded-xl border border-white/10 text-neutral-400 hover:text-white transition-colors font-bold text-sm">Cancel</button><button onClick={handleCreatePrompt} className="flex-1 py-3 rounded-xl bg-white text-black font-bold text-sm hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2"><Save size={16} />Save to Library</button></div></motion.div></div>)}</AnimatePresence>

           </motion.main>
        ) : (
          <motion.div key="workspace" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 relative w-full h-full flex flex-col z-10">
            {/* Grid Overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-10" style={{ backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)", backgroundSize: "24px 24px" }} />

            {/* Nav */}
            <div className="absolute top-4 left-4 z-30"><button onClick={() => setViewMode("landing")} className="h-10 px-4 rounded-lg bg-[#1E1E20]/80 backdrop-blur-md border border-white/10 text-neutral-300 hover:bg-white/10 hover:text-white flex items-center gap-2 transition-all shadow-lg cursor-pointer font-sans"><ArrowLeft size={18} /><span className="text-sm font-medium">Back</span></button></div>
            <div className="absolute top-4 right-4 z-30 flex items-center gap-3"><button onClick={() => setIsLibraryOpen(!isLibraryOpen)} className={`h-10 px-4 rounded-lg backdrop-blur-md border flex items-center gap-2 shadow-lg transition-all ${isLibraryOpen ? "bg-white text-black border-white" : "bg-[#1E1E20]/80 border-white/10 text-neutral-300 hover:text-white"}`}><PanelRight size={18} /><span className="text-sm font-bold">Library</span></button></div>

            {/* Canvas */}
            <div ref={canvasRef} className="flex-1 relative overflow-auto z-0 custom-scrollbar">
              {widgets.map(widget => {
                let Icon = Layers;
                let accentColor = "text-neutral-400";
                if (widget.type === "input") { Icon = FileText; accentColor = "text-cyan-400"; }
                if (widget.type === "engine") { Icon = Cpu; accentColor = "text-amber-400"; }
                if (widget.type === "output") { Icon = Wand2; accentColor = "text-purple-400"; }
                if (widget.type === "multi-model") { Icon = Box; accentColor = "text-green-400"; }

                const isDropTarget = dropTargetId === widget.id;

                return (
                  <div 
                    key={widget.id} 
                    className={`absolute bg-[#1E1E20] border rounded-xl shadow-2xl flex flex-col overflow-hidden transition-colors font-sans ${isDropTarget ? "border-purple-500 ring-1 ring-purple-500 bg-[#252528]" : "border-white/10 hover:border-white/20"}`}
                    style={{ left: widget.x, top: widget.y, width: widget.width, height: widget.height, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)", zIndex: isDropTarget ? 50 : 10 }}
                    onMouseDown={e => handleMouseDown(e, "widget", widget.id)}
                  >
                    {/* ... Widget Headers & Content from previous Step ... */}
                    <div className="px-4 py-3 border-b border-white/5 bg-white/[0.02] flex items-center justify-between cursor-move select-none">
                      <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded-md bg-white/5 ${accentColor}`}><Icon size={16} /></div>
                        <span className="text-sm font-semibold text-neutral-200 leading-tight font-sans">{widget.title}</span>
                      </div>
                      <button onClick={() => handleDeleteWidget(widget.id)} className="text-neutral-600 hover:text-red-400 transition-colors no-drag"><Trash2 size={14}/></button>
                    </div>

                    <div className="flex-1 bg-[#161618] overflow-hidden flex flex-col relative">
                      
                      {widget.type === "multi-model" && widget.data && (
                        <div className="flex flex-col h-full p-4 gap-4 scroll-container overflow-y-auto custom-scrollbar">
                           {/* ... Multi Model Content ... */}
                           <div className="flex flex-col gap-2">
                             <label className="text-[10px] font-bold text-neutral-500 uppercase">Prompt Input</label>
                             <textarea value={widget.data.prompt} onChange={(e) => handleWidgetPromptChange(widget.id, e.target.value)} placeholder="Drag & drop a prompt here or type..." className={`w-full h-32 bg-black/30 border rounded-lg p-3 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-white/30 resize-none font-mono transition-colors ${isDropTarget ? "border-purple-500/50 bg-purple-500/10" : "border-white/10"}`} />
                           </div>
                           <div className="flex flex-col gap-2">
                             <label className="text-[10px] font-bold text-neutral-500 uppercase">Select Models</label>
                             <div className="grid grid-cols-2 gap-2">
                               {AVAILABLE_MODELS.map(model => {
                                 const isSelected = widget.data.selectedModels.includes(model.id);
                                 return (
                                   <button key={model.id} onClick={() => handleToggleModel(widget.id, model.id)} className={`flex items-center gap-2 p-2 rounded-lg border text-xs transition-all ${isSelected ? `bg-white/10 border-white/30 text-white` : "bg-transparent border-white/5 text-neutral-500 hover:bg-white/5"}`}>
                                     <div className={`w-3 h-3 rounded-full ${isSelected ? "bg-green-500" : "bg-neutral-700"}`} />
                                     <model.icon size={12} className={model.color} />
                                     <span>{model.name}</span>
                                   </button>
                                 )
                               })}
                             </div>
                           </div>
                           <button onClick={() => handleRunMultiModelTest(widget.id)} disabled={widget.data.isTesting || !widget.data.prompt || widget.data.selectedModels.length === 0} className="w-full py-3 bg-white text-black rounded-lg text-xs font-bold uppercase hover:bg-neutral-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">{widget.data.isTesting ? <Loader2 size={14} className="animate-spin"/> : <Play size={14} fill="black"/>}{widget.data.isTesting ? "Testing..." : "Test Prompt"}</button>
                           <div className="grid grid-cols-1 gap-4 mt-2 pb-4">
                              {widget.data.results.map((res: any) => {
                                const modelInfo = AVAILABLE_MODELS.find(m => m.id === res.model);
                                return (
                                  <div key={res.model} className="bg-[#0F0F10] border border-white/10 rounded-lg overflow-hidden">
                                    <div className="px-3 py-2 bg-white/5 border-b border-white/5 flex items-center justify-between"><div className="flex items-center gap-2"><modelInfo.icon size={12} className={modelInfo?.color} /><span className="text-xs font-bold text-neutral-300">{modelInfo?.name}</span></div>{res.status === "loading" && <Loader2 size={12} className="animate-spin text-neutral-500"/>}{res.status === "success" && <CheckCircle2 size={12} className="text-green-500"/>}{res.status === "error" && <AlertCircle size={12} className="text-red-500"/>}</div>
                                    <div className="p-3 text-xs text-neutral-300 font-mono leading-relaxed min-h-[60px]">{res.status === "loading" ? <span className="text-neutral-600 animate-pulse">Fetching response...</span> : (res.response || <span className="text-neutral-700 italic">Waiting to run</span>)}</div>
                                  </div>
                                )
                              })}
                           </div>
                        </div>
                      )}
                      
                      {widget.type === "input" && (
                         <div className="flex flex-col h-full p-4 gap-4 scroll-container overflow-y-auto custom-scrollbar">
                           <textarea value={userText} onChange={e => { setUserText(e.target.value); setSelectedGoal(""); setStage("goal"); }} placeholder="Describe your objective..." className="w-full bg-[#131314] border border-white/10 rounded-lg p-4 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-white/30 resize-none min-h-[120px] font-sans" onMouseDown={e => e.stopPropagation()} />
                           <div className="flex items-center justify-between border-b border-white/5 pb-2"><span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Select Goal</span><button onClick={() => setGoalVariation(p => p + 1)} className="p-1.5 hover:bg-white/5 rounded text-neutral-500 hover:text-white transition-colors"><RefreshCw size={12} /></button></div>
                           <div className="space-y-2 flex-1">{userText.trim().length === 0 ? (<div className="h-24 flex items-center justify-center text-neutral-700 text-xs italic border border-dashed border-white/5 rounded-lg">Input text required</div>) : (goalOptions.map((g, i) => (<button key={i} onClick={() => setSelectedGoal(g)} className={`w-full text-left p-3 rounded-lg border text-xs transition-all ${selectedGoal === g ? `bg-white/5 border-${DOMAINS[0].color.replace("text-", "border-")}` : "border-white/5 text-neutral-400 hover:bg-white/5 hover:text-white"}`}>{g}</button>)))}</div>
                         </div>
                      )}
                      {widget.type === "engine" && (
                        <div className="flex flex-col h-full p-4 scroll-container overflow-y-auto custom-scrollbar bg-[#0a0a0a]">
                          {agentLogs.length > 0 ? (
                            <div className="space-y-3 font-mono text-xs">
                              {agentLogs.map(log => (<motion.div key={log.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex gap-3 items-start"><span className="text-neutral-600 shrink-0">{log.timestamp}</span><span className={log.text.includes("✓") ? "text-green-400" : "text-neutral-300"}>{log.text}</span></motion.div>))}
                              {stage === "agent" && <div className="text-amber-500 animate-pulse mt-4 pl-16">PROCESSING_THREAD...</div>}
                            </div>
                          ) : (<div className="h-full flex flex-col items-center justify-center text-neutral-700 gap-2"><Zap size={24} className="opacity-20" /><span className="text-xs uppercase tracking-widest">System Idle</span></div>)}
                          {stage !== "idle" && (<div className="absolute bottom-0 left-0 right-0 h-1 bg-[#1E1E20]"><motion.div className="h-full bg-amber-500" animate={{ width: `${progress}%` }} /></div>)}
                        </div>
                      )}
                      {widget.type === "output" && (
                        <div className="flex flex-col h-full p-0 scroll-container overflow-hidden">
                           <div className="flex-1 p-4 overflow-y-auto custom-scrollbar bg-[#0F0F10]">
                             {resultPrompt ? <textarea readOnly className="w-full h-full bg-transparent text-neutral-200 font-mono text-sm leading-relaxed resize-none focus:outline-none" value={resultPrompt} /> : <div className="h-full flex items-center justify-center flex-col gap-4 text-neutral-600"><Wand2 size={32} className="opacity-20" /><span className="text-xs uppercase tracking-widest">Ready to Optimize</span></div>}
                           </div>
                           <div className="border-t border-white/10 bg-black/40 backdrop-blur-md p-4 flex flex-col gap-4 no-drag" onMouseDown={(e) => e.stopPropagation()}>
                              <div className="grid grid-cols-2 gap-3">
                                  <CustomSelect label="Role" icon={User} value={refinementSettings.role} options={["Expert", "Critic", "Teacher", "Consultant", "Visionary"]} onChange={(val) => setRefinementSettings({...refinementSettings, role: val})} />
                                  <CustomSelect label="Tone" icon={MessageSquare} value={refinementSettings.tone} options={["Professional", "Creative", "Direct", "Empathetic", "Witty"]} onChange={(val) => setRefinementSettings({...refinementSettings, tone: val})} />
                                  <CustomSelect label="Format" icon={FileType} value={refinementSettings.format} options={["Step-by-Step", "Essay", "Code Block", "Bullet Points", "Email"]} onChange={(val) => setRefinementSettings({...refinementSettings, format: val})} />
                                  <div className="space-y-1"><label className="text-[10px] uppercase font-bold text-neutral-500 flex items-center gap-1"><Gauge size={10}/> Complexity</label><input type="range" min="0" max="100" value={refinementSettings.complexity} onChange={(e) => setRefinementSettings({...refinementSettings, complexity: parseInt(e.target.value)})} className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer" /></div>
                              </div>
                              <div className="flex gap-3 pt-2 border-t border-white/5">
                                  <button onClick={() => copyToClipboard(resultPrompt || "")} disabled={!resultPrompt} className="flex-1 py-2 rounded-xl text-xs font-bold uppercase text-neutral-400 hover:bg-white/5 hover:text-white border border-transparent hover:border-white/10 disabled:opacity-30 flex items-center justify-center gap-2"><Copy size={14}/> Copy</button>
                                  <button onClick={generateFinalPrompt} disabled={!selectedGoal} className="flex-[2] py-2 bg-purple-500/20 border border-purple-500/30 rounded-xl text-xs font-bold uppercase text-purple-300 hover:bg-purple-500/30 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"><SlidersHorizontal size={14}/> Update Prompt</button>
                              </div>
                           </div>
                        </div>
                      )}

                    </div>
                    <div className="absolute bottom-0 right-0 w-6 h-6 cursor-se-resize opacity-0 hover:opacity-100 transition-opacity z-20 flex items-end justify-end p-1" onMouseDown={e => { e.stopPropagation(); setResizing({ id: widget.id, startX: e.clientX, startY: e.clientY, startWidth: widget.width, startHeight: widget.height }); }}><div className="border-r-2 border-b-2 border-neutral-500 w-2 h-2" /></div>
                  </div>
                );
              })}

              {pinnedPrompts.map((pinned, i) => (
                <div key={i} className="absolute z-20 w-80 bg-[#0a0a0a] border border-white/20 rounded-xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-md" style={{ left: pinned.x, top: pinned.y, boxShadow: "0 20px 40px rgba(0,0,0,0.6)" }} onMouseDown={(e) => handleMouseDown(e, "pinned", pinned.item.id, i)}>
                    <div className="px-3 py-2 bg-white/10 flex items-center justify-between cursor-move border-b border-white/10"><span className="text-xs font-bold text-white flex items-center gap-2"><GripHorizontal size={14} className="text-neutral-500" /> {pinned.item.title}</span><button onClick={() => setPinnedPrompts(p => p.filter((_, idx) => idx !== i))} className="text-neutral-400 hover:text-white"><X size={14}/></button></div>
                    <div className="p-3 text-xs text-neutral-300 font-mono max-h-48 overflow-y-auto custom-scrollbar leading-relaxed pointer-events-none">{pinned.item.prompt}</div>
                    <div className="p-2 border-t border-white/10 bg-black/40 flex justify-center text-[10px] text-neutral-500 font-bold uppercase">Drag & Drop to Widget</div>
                </div>
              ))}
            </div>

            {/* --- LIBRARY OVERLAY --- */}
            <AnimatePresence>
              {isLibraryOpen && (
                <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", stiffness: 300, damping: 30 }} className="absolute top-0 right-0 bottom-0 w-[400px] z-40 bg-[#0F0F10]/95 backdrop-blur-xl border-l border-white/10 flex flex-col shadow-2xl">
                    <div className="p-6 border-b border-white/10 flex items-center justify-between">
                      <h2 className="text-xl font-bold text-white flex items-center gap-2"><PanelRight size={20} className="text-neutral-400"/> Library</h2>
                      <button onClick={() => setIsLibraryOpen(false)} className="p-2 bg-white/5 rounded-full text-neutral-400 hover:text-white"><X size={16} /></button>
                    </div>
                    <div className="flex border-b border-white/10">
                      <button onClick={() => setLibraryTab("prompts")} className={`flex-1 py-3 text-sm font-bold uppercase tracking-wide transition-colors ${libraryTab === "prompts" ? "text-white border-b-2 border-white bg-white/5" : "text-neutral-500 hover:text-neutral-300"}`}>Prompts</button>
                      <button onClick={() => setLibraryTab("widgets")} className={`flex-1 py-3 text-sm font-bold uppercase tracking-wide transition-colors ${libraryTab === "widgets" ? "text-white border-b-2 border-white bg-white/5" : "text-neutral-500 hover:text-neutral-300"}`}>Widgets</button>
                    </div>
                    {libraryTab === "prompts" && (
                       <>
                        <div className="p-4 border-b border-white/5"><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={14} /><input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-lg py-2 pl-9 pr-4 text-xs text-white focus:outline-none focus:border-white/30" /></div></div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
                            {filteredPrompts.map(prompt => (
                                <div key={prompt.id} onClick={() => setPinnedPrompts(p => [...p, { item: prompt, x: 100 + p.length * 20, y: 100 + p.length * 20 }])} className="group p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]">
                                    <div className="flex justify-between items-start mb-2"><div className="flex items-center gap-2"><span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-white/10 text-neutral-400">{prompt.tier}</span><span className="text-[10px] uppercase font-bold text-cyan-400">{prompt.domain}</span></div><MousePointer2 size={12} className="opacity-0 group-hover:opacity-50" /></div>
                                    <h4 className="font-bold text-sm text-white mb-1">{prompt.title}</h4>
                                </div>
                            ))}
                        </div>
                       </>
                    )}
                    {libraryTab === "widgets" && (
                       <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
                          <p className="text-xs text-neutral-500 mb-4 uppercase font-bold tracking-wider">Click to Add</p>
                          {WIDGET_CATALOG.map(w => {
                             const isActive = widgets.some(existing => existing.type === w.type);
                             return (
                               <button 
                                 key={w.type}
                                 onClick={() => handleAddWidget(w)}
                                 disabled={isActive && w.type !== 'multi-model'} 
                                 className={`w-full text-left p-4 rounded-xl border transition-all group ${isActive && w.type !== 'multi-model' ? "border-white/5 bg-white/5 opacity-50 cursor-not-allowed" : "border-white/10 bg-white/5 hover:bg-white/10 cursor-pointer"}`}
                               >
                                  <div className="flex items-center justify-between mb-2">
                                     <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg bg-white/5 ${w.color}`}><w.icon size={20} /></div>
                                        <h4 className="font-bold text-sm text-white">{w.title}</h4>
                                     </div>
                                     {isActive && w.type !== 'multi-model' && <span className="text-[10px] uppercase font-bold text-green-400 bg-green-900/20 px-2 py-1 rounded">Active</span>}
                                  </div>
                                  <p className="text-xs text-neutral-400 pl-[44px]">{w.desc}</p>
                               </button>
                             )
                          })}
                       </div>
                    )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function PromptWorkspaceUnified() {
  return <PromptWorkspaceInner />;
}
