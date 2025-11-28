import React, { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
// POISTETTU: import { PremiumGate } from "@/components/PremiumGate";
import {
  ArrowRight,
  Copy,
  Sparkles,
  Terminal,
  MessageSquare,
  Briefcase,
  Brain,
  User,
  FileText,
  Target,
  Settings,
  Plus,
  X,
  Bot,
  Minimize2,
  Check,
  Send,
  ArrowLeft,
  Home,
} from "lucide-react";

// --- Types & Interfaces ---
interface Category {
  id: string;
  name: string;
  icon: any;
  color: string;
}

interface Widget {
  id: string;
  type: "prompt" | "category" | "agent";
  title?: string;
  basePrompt?: string;
  content?: string;
  placeholder?: string;
  category?: Category;
  integrated?: boolean;
  messages?: { role: "user" | "agent"; content: string }[];
  input?: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface FlowEngineProps {
  onBack?: () => void; // Parent callback to return to main app/home
}

// --- Constants ---
// UPDATED: Changed suggestion chips to requested values
const suggestionChips = ["Website", "App", "Game"];

const categories: Category[] = [
  { id: "communication", name: "Communication Style", icon: MessageSquare, color: "text-blue-400" },
  { id: "business", name: "Business Context", icon: Briefcase, color: "text-purple-400" },
  { id: "analysis", name: "Deep Analysis", icon: Brain, color: "text-pink-400" },
  { id: "personal", name: "Personal Context", icon: User, color: "text-green-400" },
  { id: "format", name: "Output Format", icon: FileText, color: "text-orange-400" },
  { id: "goal", name: "Goal/Objective", icon: Target, color: "text-indigo-400" },
  { id: "constraints", name: "Constraints", icon: Settings, color: "text-red-400" },
];

const FlowEngineUnified: React.FC<FlowEngineProps> = ({ onBack }) => {
  const navigate = useNavigate();

  // --- State ---
  const [viewMode, setViewMode] = useState<"landing" | "workspace">("landing");
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Workspace State
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [showCategories, setShowCategories] = useState(false);
  const [dragging, setDragging] = useState<{ id: string; startX: number; startY: number } | null>(null);
  const [resizing, setResizing] = useState<{
    id: string;
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
  } | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);

  // --- Custom Scrollbar CSS ---
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      .custom-scrollbar::-webkit-scrollbar {
        width: 8px;
        height: 8px;
      }
      .custom-scrollbar::-webkit-scrollbar-track {
        background: #1E1E20;
        border-radius: 4px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #333;
        border-radius: 4px;
        border: 2px solid #1E1E20;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: #555;
      }
      .custom-scrollbar {
        scrollbar-width: thin;
        scrollbar-color: #333 #1E1E20;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // --- Logic: Prompt Generation ---
  const generatePromptLogic = (idea: string) => {
    const lowerIdea = idea.toLowerCase();

    // Business Logic
    if (lowerIdea.includes("business") || lowerIdea.includes("money") || lowerIdea.includes("startup")) {
      return `You are a strategic business consultant.

CONTEXT:
I am focusing on business development: ${idea}

YOUR TASK:
Create a comprehensive business strategy.

PLEASE PROVIDE:
1. Market Analysis & Opportunity
2. Business Model Canvas (Value Prop, Revenue Streams)
3. Go-to-Market Strategy
4. Financial Projections & Key Metrics
5. Risk Assessment

OUTPUT FORMAT:
- Professional, structured, actionable.`;
    }

    // Mindset Logic
    if (lowerIdea.includes("mindset") || lowerIdea.includes("growth") || lowerIdea.includes("psychology")) {
      return `You are a performance psychologist and mindset coach.

CONTEXT:
I want to improve my mindset regarding: ${idea}

YOUR TASK:
Provide a framework for mental resilience and growth.

PLEASE PROVIDE:
1. Limiting Belief Identification
2. Cognitive Reframing Techniques
3. Daily Habits for Mental Strength
4. Visualization & Affirmation Strategies

OUTPUT FORMAT:
- Empathetic, motivating, practical.`;
    }

    // Health Logic
    if (lowerIdea.includes("health") || lowerIdea.includes("fitness") || lowerIdea.includes("diet")) {
      return `You are a holistic health expert (combining nutrition, fitness, and longevity).

CONTEXT:
My goal is related to health: ${idea}

YOUR TASK:
Create a personalized health protocol.

PLEASE PROVIDE:
1. Nutritional Guidelines
2. Exercise Regime (Strength & Cardio)
3. Sleep & Recovery Optimization
4. Supplementation Strategy (Evidence-based)

OUTPUT FORMAT:
- Science-backed, clear, sustainable.`;
    }

    // Default Logic
    return `You are an expert consultant.

CONTEXT:
I need help with: ${idea}

YOUR TASK:
Provide comprehensive, actionable guidance.

PLEASE PROVIDE:
1. Problem Understanding
2. Solution Approach
3. Step-by-Step Implementation
4. Resources & Tools

OUTPUT FORMAT:
- Structured, clear, practical.`;
  };

  const rebuildPrompt = () => {
    setWidgets((prevWidgets) => {
      const promptWidget = prevWidgets.find((w) => w.type === "prompt");
      if (!promptWidget) return prevWidgets;

      const integratedCategories = prevWidgets.filter((w) => w.type === "category" && w.integrated);

      let newContent = promptWidget.basePrompt || "";

      if (integratedCategories.length > 0) {
        newContent += "\n\n" + "═".repeat(40);
        newContent += "\n\nADDITIONAL CONTEXT & REFINEMENTS:\n";

        integratedCategories.forEach((category) => {
          if (category.content && category.content.trim() && category.category) {
            newContent += `\n${category.category.name.toUpperCase()}:\n${category.content.trim()}\n`;
          }
        });
      }

      if (promptWidget.content === newContent) return prevWidgets;

      return prevWidgets.map((w) => (w.id === promptWidget.id ? { ...w, content: newContent } : w));
    });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      rebuildPrompt();
    }, 100);
    return () => clearTimeout(timer);
  }, [
    JSON.stringify(
      widgets
        .filter((w) => w.type === "category")
        .map((w) => ({
          id: w.id,
          integrated: w.integrated,
          content: w.content,
        })),
    ),
  ]);

  const getInitialX = () => {
    if (typeof window !== "undefined") {
      return window.innerWidth - 500;
    }
    return 800;
  };

  const processInitialPrompt = (text: string) => {
    setIsLoading(true);

    setTimeout(() => {
      const generatedContent = generatePromptLogic(text);

      const initialWidget: Widget = {
        id: `prompt-${Date.now()}`,
        type: "prompt",
        title: "Generated Flow",
        basePrompt: generatedContent,
        content: generatedContent,
        x: 100,
        y: 100,
        width: 600,
        height: 500,
      };

      setWidgets([initialWidget]);
      setViewMode("workspace");
      setIsLoading(false);
    }, 800);
  };

  const handleSuggestion = (text: string) => {
    setPrompt(text);
    processInitialPrompt(text);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!prompt.trim()) return;
    processInitialPrompt(prompt);
  };

  const handleCategoryDrop = (category: Category) => {
    const newWidget: Widget = {
      id: `${category.id}-${Date.now()}`,
      type: "category",
      category: category,
      content: "",
      placeholder: `Add ${category.name.toLowerCase()} details here...`,
      integrated: false,
      x: 150 + widgets.length * 30,
      y: 150 + widgets.length * 30,
      width: 400,
      height: 250,
    };
    setWidgets((prev) => [...prev, newWidget]);
    setShowCategories(false);
  };

  const createAIAgent = () => {
    const agentWidget: Widget = {
      id: `agent-${Date.now()}`,
      type: "agent",
      title: "AI Assistant",
      messages: [],
      input: "",
      x: getInitialX(),
      y: 100,
      width: 400,
      height: 500,
    };
    setWidgets((prev) => [...prev, agentWidget]);
  };

  const toggleIntegration = (widgetId: string) => {
    setWidgets((prev) =>
      prev.map((w) => {
        if (w.id !== widgetId) return w;
        return { ...w, integrated: !w.integrated };
      }),
    );
  };

  const deleteWidget = (widgetId: string) => {
    setWidgets((prev) => prev.filter((w) => w.id !== widgetId));
  };

  const updateWidget = (widgetId: string, field: keyof Widget, value: any) => {
    setWidgets((prev) => prev.map((w) => (w.id === widgetId ? { ...w, [field]: value } : w)));
  };

  const copyWidget = (widget: Widget) => {
    if (widget.content) {
      navigator.clipboard.writeText(widget.content);
    }
  };

  const sendAgentMessage = (agentId: string, message: string) => {
    const widget = widgets.find((w) => w.id === agentId);
    if (!widget || !message.trim()) return;

    const updatedMessages = [...(widget.messages || []), { role: "user", content: message } as const];
    setWidgets((prev) => prev.map((w) => (w.id === agentId ? { ...w, messages: updatedMessages, input: "" } : w)));

    setTimeout(() => {
      let response = "";
      const lowerMsg = message.toLowerCase();
      if (lowerMsg.includes("help") || lowerMsg.includes("improve")) {
        response = "I can help refine your prompt! Try adding a 'Constraints' category to set boundaries.";
      } else {
        response = "That's a great start. I suggest adding specific constraints to make the output more reliable.";
      }

      setWidgets((prev) =>
        prev.map((w) => {
          if (w.id !== agentId) return w;
          return {
            ...w,
            messages: [...(w.messages || []), { role: "agent", content: response }],
          };
        }),
      );
    }, 800);
  };

  const handleMouseDown = (e: React.MouseEvent, widgetId: string, action: "move" | "resize") => {
    if ((e.target as HTMLElement).closest("textarea, input, button")) {
      if (action === "move") return;
    }
    e.stopPropagation();
    const widget = widgets.find((w) => w.id === widgetId);
    if (!widget) return;

    if (action === "move") {
      setDragging({ id: widgetId, startX: e.clientX - widget.x, startY: e.clientY - widget.y });
    } else if (action === "resize") {
      setResizing({
        id: widgetId,
        startX: e.clientX,
        startY: e.clientY,
        startWidth: widget.width,
        startHeight: widget.height,
      });
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (dragging) {
        setWidgets((prev) =>
          prev.map((w) =>
            w.id === dragging.id ? { ...w, x: e.clientX - dragging.startX, y: e.clientY - dragging.startY } : w,
          ),
        );
      } else if (resizing) {
        const deltaX = e.clientX - resizing.startX;
        const deltaY = e.clientY - resizing.startY;
        setWidgets((prev) =>
          prev.map((w) =>
            w.id === resizing.id
              ? {
                  ...w,
                  width: Math.max(300, resizing.startWidth + deltaX),
                  height: Math.max(200, resizing.startHeight + deltaY),
                }
              : w,
          ),
        );
      }
    };
    const handleMouseUp = () => {
      setDragging(null);
      setResizing(null);
    };
    if (dragging || resizing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging, resizing]);

  // --- RENDER ---
  return (
    // <PremiumGate> POISTETTU TÄSTÄ
    <div className="min-h-screen bg-[#131314] text-white relative flex flex-col font-sans overflow-hidden">
      {/* --- ADDED BACKGROUND --- */}
      <div
        className="fixed inset-0 z-0 opacity-30"
        style={{
          backgroundImage: 'url("/lovable-uploads/IMG_0468.JPEG")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />
      <div className="pointer-events-none fixed inset-0 z-0 bg-black/60" />
      <div className="pointer-events-none fixed inset-0 z-0 bg-gradient-to-b from-black via-purple-900/40 to-purple-900" />
      {/* ------------------------ */}

      <AnimatePresence mode="wait">
        {viewMode === "landing" ? (
          // --- LANDING VIEW ---
          <motion.main
            key="landing"
            exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
            className="flex-1 flex flex-col items-center justify-center p-4 w-full max-w-4xl mx-auto z-10 pb-32 text-center h-screen"
          >
            {/* Back Button (Landing -> Home) - FIX: Navigates to home */}
            <button
              onClick={() => {
                setPrompt(""); // Clear prompt
                if (onBack) {
                  onBack(); // Call parent back if available
                } else {
                  navigate("/"); // Navigate to home page
                }
              }}
              className="absolute top-6 left-6 p-2 rounded-full bg-white/5 border border-white/10 text-neutral-400 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2 font-sans"
            >
              <Home size={20} />
              <span className="text-sm font-medium pr-1">Home</span>
            </button>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
              {/* UPDATED: Transparent text with animated gradient colors - turquoise-blue-purple only */}
              {/* BUG FIX: Added pb-2 to prevent descender clipping on 'g' */}
              <motion.h1
                animate={{ backgroundPosition: ["0% center", "-200% center"] }}
                transition={{ backgroundPosition: { duration: 8, ease: "linear", repeat: Infinity } }}
                className="text-6xl md:text-7xl font-extrabold tracking-[-0.02em] text-transparent bg-clip-text bg-[length:200%_auto] pb-2"
                style={{
                  fontFamily: '"SF Pro Display", Inter, "Helvetica Neue", "Arial Nova", Arial, sans-serif',
                  backgroundImage: "linear-gradient(to right, #06b6d4 0%, #3b82f6 33%, #a855f7 66%, #06b6d4 100%)",
                }}
              >
                What are we building?
              </motion.h1>
              <div className="flex flex-wrap justify-center gap-3">
                {suggestionChips.map((chip) => (
                  <button
                    key={chip}
                    onClick={() => handleSuggestion(chip)}
                    // UPDATED: Font-sans explicitly
                    className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-neutral-300 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer font-sans"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </motion.div>

            <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#131314] via-[#131314] to-transparent z-20">
              <div className="max-w-3xl mx-auto">
                <form onSubmit={handleSubmit} className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
                  <div className="relative flex items-center bg-[#1E1E20] border border-white/10 rounded-full px-2 py-2 shadow-2xl transition-all group-focus-within:border-white/20 group-focus-within:ring-1 group-focus-within:ring-white/10">
                    <input
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder={isLoading ? "Designing architecture..." : "Describe the prompt you need..."}
                      // UPDATED: Font-sans explicitly
                      className="flex-1 bg-transparent border-none focus:outline-none text-white placeholder:text-neutral-500 px-4 py-2 min-h-[44px] font-sans"
                      disabled={isLoading}
                    />
                    <button
                      type="submit"
                      disabled={!prompt.trim() || isLoading}
                      className="p-2.5 rounded-full bg-white text-black hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                      ) : (
                        <ArrowRight size={20} />
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </motion.main>
        ) : (
          // --- WORKSPACE VIEW ---
          <motion.div
            key="workspace"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 relative w-full h-screen flex flex-col"
          >
            {/* Background Pattern (Stays relative, but now sits on top of fixed background) */}
            <div
              className="absolute inset-0 pointer-events-none opacity-20"
              style={{
                backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }}
            />

            {/* Back Button (Workspace -> Landing) */}
            <div className="absolute top-4 left-4 z-30">
              <button
                onClick={() => setViewMode("landing")}
                className="h-10 px-4 rounded-lg bg-[#1E1E20] border border-white/10 text-neutral-300 hover:bg-white/5 hover:text-white flex items-center gap-2 transition-all shadow-lg cursor-pointer font-sans"
              >
                <ArrowLeft size={18} />
                <span className="text-sm font-medium">Back</span>
              </button>
            </div>

            {/* Toolbar */}
            <div className="absolute top-4 right-4 flex gap-2 z-30">
              <button
                onClick={createAIAgent}
                className="h-10 px-4 rounded-lg bg-[#1E1E20] border border-white/10 text-neutral-300 hover:bg-white/5 hover:text-white flex items-center gap-2 transition-all shadow-lg cursor-pointer font-sans"
              >
                <Bot size={18} />
                <span className="text-sm">AI Agent</span>
              </button>
              <button
                onClick={() => setShowCategories(!showCategories)}
                className={`h-10 w-10 rounded-lg border border-white/10 flex items-center justify-center transition-all shadow-lg cursor-pointer ${showCategories ? "bg-white text-black" : "bg-[#1E1E20] text-neutral-300 hover:bg-white/5"}`}
              >
                <Plus
                  size={20}
                  className={showCategories ? "rotate-45 transition-transform" : "transition-transform"}
                />
              </button>
            </div>

            {/* Canvas */}
            <div ref={canvasRef} className="flex-1 relative overflow-hidden z-0">
              {widgets.map((widget) => {
                let Icon = Sparkles;
                let accentColor = "text-neutral-400";

                if (widget.type === "category" && widget.category) {
                  Icon = widget.category.icon;
                  accentColor = widget.category.color;
                } else if (widget.type === "agent") {
                  Icon = Bot;
                  accentColor = "text-purple-400";
                }

                return (
                  <div
                    key={widget.id}
                    className="absolute bg-[#1E1E20] border border-white/10 rounded-xl shadow-2xl flex flex-col overflow-hidden hover:border-white/20 transition-colors font-sans"
                    style={{
                      left: widget.x,
                      top: widget.y,
                      width: widget.width,
                      height: widget.height,
                      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
                    }}
                    onMouseDown={(e) => handleMouseDown(e, widget.id, "move")}
                  >
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-white/5 bg-white/[0.02] flex items-center justify-between cursor-move select-none">
                      <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded-md bg-white/5 ${accentColor}`}>
                          <Icon size={16} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-neutral-200 leading-tight font-sans">
                            {widget.type === "category" && widget.category ? widget.category.name : widget.title}
                          </span>
                          {widget.type === "prompt" && widgets.some((w) => w.type === "category" && w.integrated) && (
                            <span className="text-[10px] text-green-400 flex items-center gap-1 mt-0.5 font-sans">
                              <span className="w-1 h-1 rounded-full bg-green-400 animate-pulse" />
                              Live Updating
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        {widget.type === "category" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleIntegration(widget.id);
                            }}
                            disabled={!widget.content?.trim()}
                            className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 transition-all font-sans ${
                              widget.integrated
                                ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                                : "bg-white/10 text-neutral-400 hover:bg-white/20 hover:text-white disabled:opacity-50"
                            }`}
                          >
                            {widget.integrated ? <Check size={12} /> : <Plus size={12} />}
                            {widget.integrated ? "Integrated" : "Add"}
                          </button>
                        )}
                        {widget.type !== "agent" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              copyWidget(widget);
                            }}
                            className="p-1.5 text-neutral-500 hover:text-white hover:bg-white/10 rounded transition-colors"
                          >
                            <Copy size={14} />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteWidget(widget.id);
                          }}
                          className="p-1.5 text-neutral-500 hover:text-white hover:bg-white/10 rounded transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 bg-[#161618] overflow-hidden flex flex-col relative">
                      {widget.type === "prompt" && (
                        <div className="p-4 overflow-y-auto h-full custom-scrollbar">
                          <pre className="font-mono text-sm text-neutral-300 whitespace-pre-wrap leading-relaxed">
                            {widget.content}
                          </pre>
                        </div>
                      )}

                      {widget.type === "category" && (
                        <textarea
                          className="w-full h-full bg-transparent p-4 text-sm text-neutral-300 resize-none focus:outline-none placeholder:text-neutral-600 font-mono custom-scrollbar"
                          value={widget.content}
                          onChange={(e) => updateWidget(widget.id, "content", e.target.value)}
                          placeholder={widget.placeholder}
                          onMouseDown={(e) => e.stopPropagation()}
                        />
                      )}

                      {widget.type === "agent" && (
                        <>
                          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                            {(!widget.messages || widget.messages.length === 0) && (
                              <div className="text-center text-neutral-600 mt-10">
                                <Bot className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                <p className="text-xs font-sans">Ask me how to improve your prompts.</p>
                              </div>
                            )}
                            {widget.messages?.map((msg, i) => (
                              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                                <div
                                  className={`max-w-[85%] p-3 rounded-lg text-sm font-sans ${
                                    msg.role === "user" ? "bg-white/10 text-white" : "bg-[#2A2A2D] text-neutral-300"
                                  }`}
                                >
                                  {msg.content}
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="p-3 border-t border-white/5 bg-[#1E1E20]">
                            <div className="relative">
                              <input
                                className="w-full bg-[#131314] border border-white/10 rounded-md py-2 pl-3 pr-10 text-sm text-white focus:border-white/30 focus:outline-none font-sans"
                                placeholder="Ask AI..."
                                value={widget.input}
                                onChange={(e) => updateWidget(widget.id, "input", e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && sendAgentMessage(widget.id, widget.input || "")}
                                onMouseDown={(e) => e.stopPropagation()}
                              />
                              <button
                                onClick={() => sendAgentMessage(widget.id, widget.input || "")}
                                className="absolute right-1 top-1 p-1.5 text-neutral-400 hover:text-white"
                              >
                                <Send size={14} />
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Resize Handle */}
                    <div
                      className="absolute bottom-0 right-0 w-6 h-6 cursor-se-resize opacity-0 hover:opacity-100 transition-opacity z-20 flex items-end justify-end p-1"
                      onMouseDown={(e) => handleMouseDown(e, widget.id, "resize")}
                    >
                      <div className="border-r-2 border-b-2 border-neutral-500 w-2 h-2" />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Category Drawer */}
            <AnimatePresence>
              {showCategories && (
                <motion.div
                  initial={{ x: 300, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 300, opacity: 0 }}
                  className="absolute top-16 right-4 w-72 bg-[#1E1E20] border border-white/10 rounded-xl shadow-2xl p-2 z-30 overflow-y-auto custom-scrollbar max-h-[80vh]"
                >
                  <div className="space-y-1">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => handleCategoryDrop(cat)}
                        className="w-full flex items-center gap-3 p-3 hover:bg-white/5 rounded-lg group transition-colors text-left cursor-pointer border border-transparent hover:border-white/5"
                      >
                        <div className={`p-1.5 rounded bg-[#131314] ${cat.color} border border-white/5`}>
                          <cat.icon size={16} />
                        </div>
                        <div>
                          <span className="block text-sm font-medium text-neutral-200 group-hover:text-white font-sans">
                            {cat.name}
                          </span>
                          <span className="block text-[10px] text-neutral-500 font-sans">Drag to refine prompt</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bottom Input */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-3xl px-4 z-30">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-full blur-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
                <div className="relative flex items-center bg-[#1E1E20]/90 backdrop-blur-md border border-white/10 rounded-full px-2 py-2 shadow-2xl">
                  <input
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSuggestion(prompt);
                        setPrompt("");
                      }
                    }}
                    placeholder="Add another prompt logic block..."
                    className="flex-1 bg-transparent border-none focus:outline-none text-white placeholder:text-neutral-500 px-4 py-2 font-sans"
                  />
                  <button
                    onClick={() => {
                      handleSuggestion(prompt);
                      setPrompt("");
                    }}
                    disabled={!prompt.trim()}
                    className="p-2.5 rounded-full bg-white/10 text-white hover:bg-white hover:text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Sparkles size={18} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    // </PremiumGate> POISTETTU TÄSTÄ
  );
};

export default FlowEngineUnified;
