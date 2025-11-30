import React, { useState, useRef, useEffect } from "react";

import { AnimatePresence, motion } from "framer-motion";

import { useNavigate } from "react-router-dom";

import {
  ArrowRight,
  Copy,
  Sparkles,
  MessageSquare,
  Briefcase,
  Brain,
  User,
  FileText,
  Target,
  Settings,
  Plus,
  X,
  Check,
  ArrowLeft,
  Home,
  Globe,
  Smartphone,
  Gamepad2,
  Palette,
  Code,
  Layout,
  Search,
  Zap,
  Shield,
  Wifi,
  Database,
  Layers,
  Ghost,
  Swords,
  Scroll,
  MonitorPlay,
  ChevronDown,
  ChevronRight,
  Box,
  Wrench,
} from "lucide-react";

// --- Types & Interfaces ---

interface Category {
  id: string;

  name: string;

  icon: any;

  color: string;

  description?: string;
}

interface Widget {
  id: string;

  type: "prompt" | "category";

  title?: string;

  basePrompt?: string;

  content?: string;

  placeholder?: string;

  category?: Category;

  integrated?: boolean;

  x: number;

  y: number;

  width: number;

  height: number;
}

interface FlowEngineProps {
  onBack?: () => void;
}

// --- Domain Configuration ---

const domainConfig: Record<string, Category[]> = {
  Website: [
    {
      id: "ui_ux",
      name: "UI/UX Design",
      icon: Palette,
      color: "text-neutral-300",
      description: "Layouts, colors, typography",
    },

    {
      id: "tech_stack",
      name: "Tech Stack",
      icon: Code,
      color: "text-neutral-300",
      description: "Frontend frameworks, backend",
    },

    {
      id: "structure",
      name: "Site Structure",
      icon: Layout,
      color: "text-neutral-300",
      description: "Sitemap, navigation flow",
    },

    {
      id: "seo",
      name: "SEO & Content",
      icon: Search,
      color: "text-neutral-300",
      description: "Keywords, meta tags, strategy",
    },

    {
      id: "goal",
      name: "Business Goal",
      icon: Target,
      color: "text-neutral-300",
      description: "Conversion targets, KPIs",
    },
  ],

  App: [
    { id: "features", name: "Core Features", icon: Zap, color: "text-neutral-300", description: "Key functionalities" },

    {
      id: "platform",
      name: "Platform & OS",
      icon: Smartphone,
      color: "text-neutral-300",
      description: "iOS, Android, Cross-platform",
    },

    {
      id: "security",
      name: "Auth & Security",
      icon: Shield,
      color: "text-neutral-300",
      description: "Authentication, encryption",
    },

    {
      id: "connectivity",
      name: "Offline/Online",
      icon: Wifi,
      color: "text-neutral-300",
      description: "Sync strategies, API",
    },

    { id: "data", name: "Data Model", icon: Database, color: "text-neutral-300", description: "Schema, storage types" },
  ],

  Game: [
    {
      id: "mechanics",
      name: "Game Mechanics",
      icon: Layers,
      color: "text-neutral-300",
      description: "Rules, interactions, physics",
    },

    {
      id: "art_style",
      name: "Art & Audio",
      icon: Ghost,
      color: "text-neutral-300",
      description: "Visual style, sound design",
    },

    {
      id: "combat",
      name: "Combat/Controls",
      icon: Swords,
      color: "text-neutral-300",
      description: "Input mapping, combat systems",
    },

    {
      id: "lore",
      name: "Story & Lore",
      icon: Scroll,
      color: "text-neutral-300",
      description: "World building, narrative",
    },

    {
      id: "progression",
      name: "Progression Loop",
      icon: MonitorPlay,
      color: "text-neutral-300",
      description: "Leveling, rewards, loops",
    },
  ],

  General: [
    {
      id: "communication",
      name: "Tone of Voice",
      icon: MessageSquare,
      color: "text-neutral-300",
      description: "Style of communication",
    },

    {
      id: "constraints",
      name: "Constraints",
      icon: Settings,
      color: "text-neutral-300",
      description: "Technical or budget limits",
    },

    {
      id: "analysis",
      name: "Deep Analysis",
      icon: Brain,
      color: "text-neutral-300",
      description: "Critical thinking, pros/cons",
    },
  ],
};

const suggestionChips = [
  { label: "Website", icon: Globe },

  { label: "App", icon: Smartphone },

  { label: "Game", icon: Gamepad2 },
];

const FlowEngineContent: React.FC<FlowEngineProps> = ({ onBack }) => {
  const navigate = useNavigate();

  // --- State ---

  const [viewMode, setViewMode] = useState<"landing" | "workspace">("landing");

  const [activeDomain, setActiveDomain] = useState<string>("Website");

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

  // Canvas Pan-Zoom State

  const [canvasTransform, setCanvasTransform] = useState({
    translateX: 0,

    translateY: 0,

    scale: 1,
  });

  const [panning, setPanning] = useState<{
    startX: number;
    startY: number;
    startTranslateX: number;
    startTranslateY: number;
  } | null>(null);

  // Drawer State

  const [searchQuery, setSearchQuery] = useState("");

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    domain: true,

    general: true,
  });

  const canvasRef = useRef<HTMLDivElement>(null);

  // --- Scrollbar CSS ---

  useEffect(() => {
    const style = document.createElement("style");

    style.innerHTML = `

      .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }

      .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }

      .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 3px; }

      .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #555; }

      .custom-scrollbar { scrollbar-width: thin; scrollbar-color: #333 transparent; }

    `;

    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // --- Logic: Prompt Reconstruction ---

  const rebuildPrompt = () => {
    setWidgets((prevWidgets) => {
      const promptWidget = prevWidgets.find((w) => w.type === "prompt");

      if (!promptWidget) return prevWidgets;

      const integratedCategories = prevWidgets.filter((w) => w.type === "category" && w.integrated);

      let newContent = `You are an expert ${activeDomain} developer and architect.\n\nCONTEXT:\nI am building a ${activeDomain}.`;

      if (integratedCategories.length > 0) {
        newContent += "\n\n" + "═".repeat(40);

        newContent += "\n\nSPECIFICATIONS & REQUIREMENTS:\n";

        integratedCategories.forEach((category) => {
          if (category.content && category.content.trim() && category.category) {
            newContent += `\n[${category.category.name.toUpperCase()}]\n${category.content.trim()}\n`;
          }
        });
      }

      newContent += `\n\nYOUR TASK:\nProvide a comprehensive implementation plan, file structure, and key code examples based on the specifications above.`;

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
    activeDomain,

    JSON.stringify(
      widgets

        .filter((w) => w.type === "category")

        .map((w) => ({ id: w.id, integrated: w.integrated, content: w.content })),
    ),
  ]);

  // --- Domain Selection Logic ---

  const handleDomainSelection = (domainLabel: string) => {
    setIsLoading(true);

    setActiveDomain(domainLabel);

    setTimeout(() => {
      const mainPromptWidget: Widget = {
        id: `prompt-main`,

        type: "prompt",

        title: `${domainLabel} Architecture`,

        content: `Initializing ${domainLabel} context...`,

        x: 0,

        y: 0,

        width: 550,

        height: 600,
      };

      // Reset canvas transform when entering workspace

      setCanvasTransform({ translateX: 100, translateY: 100, scale: 1 });

      setWidgets([mainPromptWidget]);

      setViewMode("workspace");

      setIsLoading(false);

      setShowCategories(true);
    }, 600);
  };

  // --- Widget Management ---

  const handleCategoryAdd = (category: Category) => {
    const offset = widgets.length * 30;

    // Calculate position relative to current canvas view

    const baseX = -canvasTransform.translateX / canvasTransform.scale + 600;

    const baseY = -canvasTransform.translateY / canvasTransform.scale + 100;

    const newWidget: Widget = {
      id: `${category.id}-${Date.now()}`,

      type: "category",

      category: category,

      content: "",

      placeholder: `Define ${category.name}...`,

      integrated: true,

      x: baseX + Math.random() * 50,

      y: baseY + offset,

      width: 350,

      height: 220,
    };

    setWidgets((prev) => [...prev, newWidget]);
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

  // --- Canvas Pan-Zoom Logic ---

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    // Don't pan if clicking on widgets or interactive elements

    if ((e.target as HTMLElement).closest(".widget-container, button, input, textarea, .pointer-events-auto")) return;

    if (e.button === 0 && !dragging && !resizing) {
      // Left mouse button

      e.preventDefault();

      setPanning({
        startX: e.clientX,

        startY: e.clientY,

        startTranslateX: canvasTransform.translateX,

        startTranslateY: canvasTransform.translateY,
      });
    }
  };

  const handleCanvasWheel = (e: React.WheelEvent) => {
    if (!canvasRef.current) return;

    e.preventDefault();

    const rect = canvasRef.current.getBoundingClientRect();

    const mouseX = e.clientX - rect.left;

    const mouseY = e.clientY - rect.top;

    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;

    const newScale = Math.max(0.1, Math.min(3, canvasTransform.scale * zoomFactor));

    // Zoom towards mouse position

    const scaleChange = newScale / canvasTransform.scale;

    const newTranslateX = mouseX - (mouseX - canvasTransform.translateX) * scaleChange;

    const newTranslateY = mouseY - (mouseY - canvasTransform.translateY) * scaleChange;

    setCanvasTransform({
      translateX: newTranslateX,

      translateY: newTranslateY,

      scale: newScale,
    });
  };

  // --- Drag & Resize Logic ---

  const handleMouseDown = (e: React.MouseEvent, widgetId: string, action: "move" | "resize") => {
    if ((e.target as HTMLElement).closest("textarea, input, button")) return;

    e.stopPropagation();

    const widget = widgets.find((w) => w.id === widgetId);

    if (!widget) return;

    // Convert widget position to screen coordinates

    const screenX = widget.x * canvasTransform.scale + canvasTransform.translateX;

    const screenY = widget.y * canvasTransform.scale + canvasTransform.translateY;

    if (action === "move") {
      setDragging({
        id: widgetId,

        startX: e.clientX - screenX,

        startY: e.clientY - screenY,
      });
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
      if (panning) {
        const deltaX = e.clientX - panning.startX;

        const deltaY = e.clientY - panning.startY;

        setCanvasTransform((prev) => ({
          ...prev,

          translateX: panning.startTranslateX + deltaX,

          translateY: panning.startTranslateY + deltaY,
        }));
      } else if (dragging) {
        // Convert screen coordinates to canvas coordinates

        const canvasX = (e.clientX - dragging.startX - canvasTransform.translateX) / canvasTransform.scale;

        const canvasY = (e.clientY - dragging.startY - canvasTransform.translateY) / canvasTransform.scale;

        setWidgets((prev) => prev.map((w) => (w.id === dragging.id ? { ...w, x: canvasX, y: canvasY } : w)));
      } else if (resizing) {
        const deltaX = (e.clientX - resizing.startX) / canvasTransform.scale;

        const deltaY = (e.clientY - resizing.startY) / canvasTransform.scale;

        setWidgets((prev) =>
          prev.map((w) =>
            w.id === resizing.id
              ? {
                  ...w,

                  width: Math.max(300, resizing.startWidth + deltaX),

                  height: Math.max(150, resizing.startHeight + deltaY),
                }
              : w,
          ),
        );
      }
    };

    const handleMouseUp = () => {
      setDragging(null);

      setResizing(null);

      setPanning(null);
    };

    if (panning || dragging || resizing) {
      window.addEventListener("mousemove", handleMouseMove);

      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);

      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [panning, dragging, resizing, canvasTransform.scale, canvasTransform.translateX, canvasTransform.translateY]);

  // --- Drawer Helper Components ---

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const filterCategories = (cats: Category[]) => {
    if (!searchQuery) return cats;

    return cats.filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
  };

  // --- RENDER ---

  return (
    <div className="h-screen bg-[#09090b] text-neutral-200 relative flex flex-col font-sans overflow-hidden selection:bg-neutral-800 selection:text-white">
      <AnimatePresence mode="wait">
        {viewMode === "landing" ? (
          // --- LANDING VIEW ---

          <motion.main
            key="landing"
            exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
            className="flex-1 flex flex-col items-center justify-center p-4 w-full max-w-4xl mx-auto z-10 pb-32 text-center h-screen"
          >
            <button
              onClick={() => {
                if (onBack) onBack();
                else navigate("/");
              }}
              className="absolute top-6 left-6 p-2 rounded-full bg-neutral-900/50 backdrop-blur-md border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all flex items-center gap-2 font-sans"
            >
              <Home size={20} />

              <span className="text-sm font-medium pr-1">Home</span>
            </button>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
              <motion.h1
                className="text-3xl md:text-4xl font-bold tracking-tight text-white pb-6"
                style={{
                  fontFamily:
                    '"SF Pro Display", Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                }}
              >
                What are we building today?
              </motion.h1>

              <div className="flex flex-wrap justify-center gap-4">
                {suggestionChips.map((chip) => {
                  const Icon = chip.icon;

                  return (
                    <button
                      key={chip.label}
                      onClick={() => !isLoading && handleDomainSelection(chip.label)}
                      disabled={isLoading}
                      className={`

                        px-8 py-4 rounded-xl bg-neutral-900 border border-neutral-800 

                        text-neutral-300 hover:bg-neutral-800 hover:text-white hover:border-neutral-700 

                        transition-all cursor-pointer font-sans 

                        flex flex-col items-center gap-3 group min-w-[140px]

                        ${isLoading ? "opacity-50 cursor-wait" : ""}

                      `}
                    >
                      {isLoading && activeDomain === chip.label ? (
                        <div className="w-8 h-8 border-2 border-neutral-500 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Icon className="w-8 h-8 text-neutral-500 group-hover:text-white transition-colors" />
                      )}

                      <span className="text-sm font-medium">{chip.label}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </motion.main>
        ) : (
          // --- WORKSPACE VIEW ---

          <motion.div
            key="workspace"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 relative w-full h-full flex flex-col bg-[#09090b]"
          >
            {/* Top Bar */}

            <div className="absolute top-4 left-4 right-4 flex justify-between z-30 pointer-events-none">
              <button
                onClick={() => setViewMode("landing")}
                className="pointer-events-auto h-10 px-4 rounded-lg bg-neutral-900/80 backdrop-blur-md border border-neutral-800 text-neutral-400 hover:bg-neutral-800 hover:text-white flex items-center gap-2 transition-all shadow-lg cursor-pointer font-sans"
              >
                <ArrowLeft size={18} />

                <span className="text-sm font-medium">Back</span>
              </button>

              <div className="flex items-center gap-2 pointer-events-auto">
                <button
                  onClick={() => setShowCategories(!showCategories)}
                  className={`h-10 w-10 rounded-lg border border-neutral-800 flex items-center justify-center transition-all shadow-lg cursor-pointer backdrop-blur-md ${showCategories ? "bg-neutral-800 text-white" : "bg-neutral-900/80 text-neutral-400 hover:bg-neutral-800 hover:text-white"}`}
                >
                  <Plus
                    size={20}
                    className={showCategories ? "rotate-45 transition-transform" : "transition-transform"}
                  />
                </button>
              </div>
            </div>

            {/* Canvas */}

            <div
              ref={canvasRef}
              className="flex-1 relative overflow-hidden z-0 min-h-screen cursor-grab active:cursor-grabbing"
              onMouseDown={handleCanvasMouseDown}
              onWheel={handleCanvasWheel}
            >
              {/* Infinite Background Pattern */}

              <div
                className="absolute pointer-events-none opacity-20"
                style={{
                  backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",

                  backgroundSize: "24px 24px",

                  width: "20000px",

                  height: "20000px",

                  left: `${-10000 + (canvasTransform.translateX % 24)}px`,

                  top: `${-10000 + (canvasTransform.translateY % 24)}px`,
                }}
              />

              {/* Widgets Container with Transform */}

              <div
                className="absolute inset-0"
                style={{
                  transform: `translate(${canvasTransform.translateX}px, ${canvasTransform.translateY}px) scale(${canvasTransform.scale})`,

                  transformOrigin: "0 0",
                }}
              >
                {widgets.map((widget) => {
                  let Icon = Sparkles;

                  let accentColor = "text-neutral-400";

                  if (widget.type === "category" && widget.category) {
                    Icon = widget.category.icon;

                    accentColor = widget.category.color;
                  }

                  return (
                    <div
                      key={widget.id}
                      className="absolute bg-[#121214] border border-neutral-800 rounded-xl shadow-2xl flex flex-col overflow-hidden hover:border-neutral-700 transition-colors font-sans widget-container"
                      style={{
                        left: widget.x,

                        top: widget.y,

                        width: widget.width,

                        height: widget.height,

                        boxShadow: "0 10px 40px -10px rgba(0, 0, 0, 0.5)",
                      }}
                      onMouseDown={(e) => handleMouseDown(e, widget.id, "move")}
                    >
                      {/* Header */}

                      <div className="px-4 py-3 border-b border-neutral-800 bg-[#121214] flex items-center justify-between cursor-move select-none">
                        <div className="flex items-center gap-3">
                          <div className={`p-1.5 rounded-md bg-neutral-800/50 ${accentColor}`}>
                            <Icon size={16} />
                          </div>

                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-neutral-200 leading-tight font-sans">
                              {widget.type === "category" && widget.category ? widget.category.name : widget.title}
                            </span>

                            {widget.type === "prompt" && widgets.some((w) => w.type === "category" && w.integrated) && (
                              <span className="text-[10px] text-green-500 flex items-center gap-1 mt-0.5 font-sans">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                Live Syncing
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
                                  ? "bg-green-500/10 text-green-500 hover:bg-green-500/20"
                                  : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white disabled:opacity-50"
                              }`}
                            >
                              {widget.integrated ? <Check size={12} /> : <Plus size={12} />}

                              {widget.integrated ? "In Prompt" : "Add"}
                            </button>
                          )}

                          <button
                            onClick={(e) => {
                              e.stopPropagation();

                              copyWidget(widget);
                            }}
                            className="p-1.5 text-neutral-500 hover:text-white hover:bg-neutral-800 rounded transition-colors"
                          >
                            <Copy size={14} />
                          </button>

                          {widget.type !== "prompt" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();

                                deleteWidget(widget.id);
                              }}
                              className="p-1.5 text-neutral-500 hover:text-white hover:bg-neutral-800 rounded transition-colors"
                            >
                              <X size={14} />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Content */}

                      <div className="flex-1 bg-[#121214] overflow-hidden flex flex-col relative">
                        {widget.type === "prompt" && (
                          <div className="p-4 overflow-y-auto h-full custom-scrollbar">
                            <pre className="font-mono text-xs md:text-sm text-neutral-300 whitespace-pre-wrap leading-relaxed">
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
                      </div>

                      {/* Resize Handle */}

                      <div
                        className="absolute bottom-0 right-0 w-6 h-6 cursor-se-resize opacity-0 hover:opacity-100 transition-opacity z-20 flex items-end justify-end p-1"
                        onMouseDown={(e) => handleMouseDown(e, widget.id, "resize")}
                      >
                        <div className="border-r-2 border-b-2 border-neutral-600 w-2 h-2" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* NEW: Node Drawer (Side Menu) */}

            <AnimatePresence>
              {showCategories && (
                <motion.div
                  initial={{ x: 320, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 320, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="absolute top-20 right-4 w-80 bg-[#121214] border border-neutral-800 rounded-xl shadow-2xl z-40 flex flex-col max-h-[calc(100vh-100px)] overflow-hidden"
                >
                  {/* Drawer Header */}

                  <div className="p-4 border-b border-neutral-800 bg-[#121214]">
                    <h3 className="text-sm font-semibold text-white mb-3">Add Nodes</h3>

                    {/* Domain Switcher */}

                    <div className="flex p-1 bg-neutral-900 rounded-lg mb-3">
                      {suggestionChips.map((chip) => {
                        const Icon = chip.icon;

                        const isActive = activeDomain === chip.label;

                        return (
                          <button
                            key={chip.label}
                            onClick={() => setActiveDomain(chip.label)}
                            className={`flex-1 flex items-center justify-center py-1.5 rounded-md transition-all ${
                              isActive
                                ? "bg-neutral-800 text-white shadow-sm"
                                : "text-neutral-500 hover:text-neutral-300"
                            }`}
                            title={chip.label}
                          >
                            <Icon size={14} />
                          </button>
                        );
                      })}
                    </div>

                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={14} />

                      <input
                        type="text"
                        placeholder="Search nodes..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-lg py-2 pl-9 pr-3 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-neutral-700"
                      />
                    </div>
                  </div>

                  {/* Drawer Content */}

                  <div className="flex-1 overflow-y-auto custom-scrollbar p-2 bg-[#121214]">
                    {/* Section 1 */}

                    <div className="mb-2">
                      <button
                        onClick={() => toggleSection("domain")}
                        className="w-full flex items-center justify-between p-2 text-xs font-semibold text-neutral-400 hover:text-white transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Box size={14} className="text-neutral-500" />
                          {activeDomain} Modules
                        </div>

                        {expandedSections.domain ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </button>

                      <AnimatePresence>
                        {expandedSections.domain && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="pl-2 space-y-1 mt-1">
                              {filterCategories(domainConfig[activeDomain] || []).map((cat) => (
                                <button
                                  key={cat.id}
                                  onClick={() => handleCategoryAdd(cat)}
                                  className="w-full flex items-center gap-3 p-2 hover:bg-neutral-800/50 rounded-lg group transition-colors text-left cursor-pointer"
                                >
                                  <div
                                    className={`p-1.5 rounded-md bg-neutral-900 ${cat.color} group-hover:bg-neutral-800`}
                                  >
                                    <cat.icon size={14} />
                                  </div>

                                  <div className="flex-1">
                                    <span className="block text-xs font-medium text-neutral-300 group-hover:text-white">
                                      {cat.name}
                                    </span>

                                    {cat.description && (
                                      <span className="block text-[10px] text-neutral-500 truncate">
                                        {cat.description}
                                      </span>
                                    )}
                                  </div>

                                  <Plus
                                    size={12}
                                    className="text-neutral-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                  />
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Section 2 */}

                    <div className="mb-2">
                      <button
                        onClick={() => toggleSection("general")}
                        className="w-full flex items-center justify-between p-2 text-xs font-semibold text-neutral-400 hover:text-white transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Wrench size={14} className="text-neutral-500" />
                          Utilities & General
                        </div>

                        {expandedSections.general ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </button>

                      <AnimatePresence>
                        {expandedSections.general && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="pl-2 space-y-1 mt-1">
                              {filterCategories(domainConfig["General"] || []).map((cat) => (
                                <button
                                  key={cat.id}
                                  onClick={() => handleCategoryAdd(cat)}
                                  className="w-full flex items-center gap-3 p-2 hover:bg-neutral-800/50 rounded-lg group transition-colors text-left cursor-pointer"
                                >
                                  <div
                                    className={`p-1.5 rounded-md bg-neutral-900 ${cat.color} group-hover:bg-neutral-800`}
                                  >
                                    <cat.icon size={14} />
                                  </div>

                                  <div className="flex-1">
                                    <span className="block text-xs font-medium text-neutral-300 group-hover:text-white">
                                      {cat.name}
                                    </span>

                                    {cat.description && (
                                      <span className="block text-[10px] text-neutral-500 truncate">
                                        {cat.description}
                                      </span>
                                    )}
                                  </div>

                                  <Plus
                                    size={12}
                                    className="text-neutral-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                  />
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FlowEngineUnified: React.FC<FlowEngineProps> = (props) => {
  return <FlowEngineContent {...props} />;
};

export default FlowEngineUnified;
