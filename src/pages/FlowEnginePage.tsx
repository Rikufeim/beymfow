// Full-screen grid background fix for Beymflow workspace
// Single source of truth: canvasTransform state controls both node transforms and background grid
// Background grid uses the same translate/scale transform as nodes for perfect synchronization
// Fixed zoom range: 0.25 to 2.0 (Flowise-like range)
// Background grid: CSS-based radial-gradient pattern, always visible, covers full viewport
// Grid uses large fixed size (200000px) positioned to cover entire workspace at all zoom/pan levels
// Grid rendered as absolute positioned layer with z-index: 0, behind all content (z-index: 1+)

import React, { useState, useRef, useEffect } from "react";

import { AnimatePresence, motion } from "framer-motion";

import { useNavigate } from "react-router-dom";

import { NodeAnchor } from "@/components/NodeAnchor";

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
  Upload,
  Bot,
  Save,
  Link2,
  Minus,
  Lock,
  Sun,
  FileStack,
} from "lucide-react";

import {
  BusinessModelCanvas,
  LeanCanvas,
  SWOTAnalysis,
  UserJourneyMap,
  AIPromptBlueprint,
  TemplateDefinition,
} from "@/flowTemplates";

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
  type: "prompt" | "category" | "flow-input" | "flow-text-gen" | "flow-agent" | "flow-state" | "flow-tool";
  title?: string;
  basePrompt?: string;
  content?: string;
  placeholder?: string;
  category?: Category;
  integrated?: boolean;
  subtitle?: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Edge {
  id: string;
  source: string;
  target: string;
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
  const [edges, setEdges] = useState<Edge[]>([]);
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

  // Connection State
  const [connecting, setConnecting] = useState<{ sourceId: string; sourceHandle: "output" } | null>(null);
  const [draggingHandle, setDraggingHandle] = useState<{
    nodeId: string;
    handleType: "input" | "output";
    startX: number;
    startY: number;
  } | null>(null);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null);

  // Drawer State
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    domain: false,
    general: false,
    flows: false,
    templates: false,
  });

  // Settings State
  const [showSettings, setShowSettings] = useState(false);

  // Control Panel State
  const [widgetsLocked, setWidgetsLocked] = useState(false);
  const [backgroundVisible, setBackgroundVisible] = useState(true);

  const canvasRef = useRef<HTMLDivElement>(null);

  // --- Shared State for Node Data Flow ---
  type NodeOutputMap = {
    [nodeId: string]: {
      generatedText?: string;
      jsonPayload?: any;
      integrated?: boolean;
    };
  };

  type MainPromptState = {
    sections: {
      nodeId: string;
      title: string;
      content: string;
      order: number;
    }[];
    combinedPrompt: string;
  };

  const [nodeOutputMap, setNodeOutputMap] = useState<NodeOutputMap>({});
  const [mainPromptState, setMainPromptState] = useState<MainPromptState>({
    sections: [],
    combinedPrompt: "",
  });

  // Find Main Prompt Node (the final TEXT GENERATION node)
  const getMainPromptNodeId = (): string | null => {
    const finalNode = widgets.find((w) => w.id === "flow-text-final");
    return finalNode ? finalNode.id : null;
  };

  // --- Helper Functions ---
  const getUpstreamNodes = (nodeId: string, nodes: Widget[], edges: Edge[]): Widget[] => {
    const incomingEdges = edges.filter((e) => e.target === nodeId);
    const upstreamNodeIds = incomingEdges.map((e) => e.source);
    return nodes.filter((n) => upstreamNodeIds.includes(n.id));
  };

  const isConnectedToMain = (nodeId: string, mainNodeId: string | null, edges: Edge[]): boolean => {
    if (!mainNodeId) return false;
    // For MVP: check direct edge
    return edges.some((e) => e.source === nodeId && e.target === mainNodeId);
  };

  const buildCombinedPrompt = (sections: MainPromptState["sections"]): string => {
    if (sections.length === 0) return "";
    const sortedSections = [...sections].sort((a, b) => a.order - b.order);
    return sortedSections.map((section) => `### ${section.title}\n\n${section.content}\n\n`).join("");
  };

  // --- Content Generation Functions ---
  const generateIdeaSummary = (userInput: string): { generatedText: string; jsonPayload: any } => {
    if (!userInput.trim()) return { generatedText: "", jsonPayload: null };

    const systemPrompt = `You take the user's short description or URL and convert it into a full business summary used to build a website. If the user gives incomplete information, intelligently infer missing details. Your output MUST include: industry, business_type, services, target_audience, location, tone_style, goal. Always return both JSON and a human-readable explanation.`;

    // Simulate AI processing (in real app, this would call an API)
    const json = {
      industry: userInput.includes("tech")
        ? "Technology"
        : userInput.includes("restaurant")
          ? "Food & Beverage"
          : "General Business",
      business_type: "Service Provider",
      services: "Web development, consulting, digital solutions",
      target_audience: "Small to medium businesses",
      location: "Global",
      tone_style: "Professional, friendly, modern",
      goal: "Generate leads and establish online presence",
    };

    const generatedText = `Based on your input "${userInput}", I've identified this as a ${json.industry} business targeting ${json.target_audience}. The website should have a ${json.tone_style} tone and focus on ${json.goal}.`;

    return {
      generatedText,
      jsonPayload: json,
    };
  };

  const generateCleanSummary = (upstreamOutputs: NodeOutputMap): { generatedText: string; jsonPayload: any } => {
    const ideaNodeOutput = Object.values(upstreamOutputs).find((output) => output.jsonPayload);

    if (!ideaNodeOutput?.jsonPayload) {
      return { generatedText: "No upstream data available. Generate IDEA INPUT first.", jsonPayload: null };
    }

    const systemPrompt = `Using the raw ideaSummary, create a clear structured summary. Do NOT change meanings. Output: clean summary + JSON structure for downstream nodes.`;

    const generatedText = `This summary has been cleaned and structured for use in downstream processing nodes. All key information has been preserved and organized for website planning.\n\nIndustry: ${ideaNodeOutput.jsonPayload.industry}\nBusiness Type: ${ideaNodeOutput.jsonPayload.business_type}\nServices: ${ideaNodeOutput.jsonPayload.services}\nTarget Audience: ${ideaNodeOutput.jsonPayload.target_audience}`;

    return {
      generatedText,
      jsonPayload: ideaNodeOutput.jsonPayload,
    };
  };

  const generatePageStructure = (upstreamOutputs: NodeOutputMap): { generatedText: string; jsonPayload: any } => {
    const summaryOutput = Object.values(upstreamOutputs).find((output) => output.jsonPayload);

    if (!summaryOutput?.jsonPayload) {
      return {
        generatedText: "No upstream data available. Generate TEXT GENERATION (Summary) first.",
        jsonPayload: null,
      };
    }

    const systemPrompt = `Using cleanSummary, generate a full landing page structure: ordered sections, titles, bullets, CTA placements, image placements. Return JSON + human-readable structure.`;

    const structure = {
      sections: [
        { order: 1, title: "Hero Section", cta: "Get Started", image: "hero-image.jpg" },
        { order: 2, title: "Services Overview", cta: "Learn More", image: "services-image.jpg" },
        { order: 3, title: "About Us", cta: null, image: "about-image.jpg" },
        { order: 4, title: "Case Studies", cta: "View Portfolio", image: "cases-image.jpg" },
        { order: 5, title: "Pricing", cta: "Choose Plan", image: null },
        { order: 6, title: "Contact", cta: "Send Message", image: null },
        { order: 7, title: "FAQ", cta: null, image: null },
      ],
    };

    const generatedText = `The landing page will consist of 7 main sections: Hero, Services, About, Cases, Pricing, Contact, and FAQ. Each section includes strategic CTA placements and image recommendations.`;

    return {
      generatedText,
      jsonPayload: structure,
    };
  };

  const generateDesignSystem = (upstreamOutputs: NodeOutputMap): { generatedText: string; jsonPayload: any } => {
    const summaryOutput = Object.values(upstreamOutputs).find((output) => output.jsonPayload);
    const structureOutput = Object.values(upstreamOutputs).find((output) => output.jsonPayload?.sections);

    if (!summaryOutput || !structureOutput) {
      return {
        generatedText: "No upstream data available. Generate Summary and Structure nodes first.",
        jsonPayload: null,
      };
    }

    const systemPrompt = `Create a full design system for the website. Include: primary_color, secondary_color, background_color, heading_font, body_font, button_style, animation_style, layout_style, image_direction. Return JSON + readable text.`;

    const designSystem = {
      primary_color: "#3b82f6",
      secondary_color: "#8b5cf6",
      background_color: "#0a0a0a",
      heading_font: "Inter, sans-serif",
      body_font: "Inter, sans-serif",
      button_style: "Rounded, gradient, hover effects",
      animation_style: "Smooth transitions, fade-ins",
      layout_style: "Modern, clean, spacious",
      image_direction: "High-quality, professional, brand-aligned",
    };

    const generatedText = `The website will use a modern color palette with ${designSystem.primary_color} as primary and ${designSystem.secondary_color} as secondary. Typography uses ${designSystem.heading_font} for a clean, professional look. Buttons feature ${designSystem.button_style} with ${designSystem.animation_style}.`;

    return {
      generatedText,
      jsonPayload: designSystem,
    };
  };

  const generateSeoPlan = (upstreamOutputs: NodeOutputMap): { generatedText: string; jsonPayload: any } => {
    const designOutput = Object.values(upstreamOutputs).find((output) => output.jsonPayload?.primary_color);
    const structureOutput = Object.values(upstreamOutputs).find((output) => output.jsonPayload?.sections);

    if (!designOutput || !structureOutput) {
      return {
        generatedText: "No upstream data available. Generate Design System and Structure nodes first.",
        jsonPayload: null,
      };
    }

    const systemPrompt = `Using designSystem + pageStructure, generate an SEO plan: primary keyword, secondary keywords, meta description guidelines, tone of voice, optional schema markup. Return JSON + readable notes.`;

    const seoPlan = {
      primary_keyword: "website development services",
      secondary_keywords: ["web design", "digital solutions", "online presence", "business website"],
      meta_description:
        "Professional website development services to help your business establish a strong online presence.",
      tone_of_voice: "Professional, approachable, solution-focused",
      schema_markup: "Organization, Service, LocalBusiness",
    };

    const generatedText = `Primary keyword: "${seoPlan.primary_keyword}". Secondary keywords include ${seoPlan.secondary_keywords.join(", ")}. Meta descriptions should be ${seoPlan.tone_of_voice}. Schema markup recommended: ${seoPlan.schema_markup}.`;

    return {
      generatedText,
      jsonPayload: seoPlan,
    };
  };

  // Final prompt is built from MainPromptState.combinedPrompt, not generated separately

  // --- Scrollbar CSS ---
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
      .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
      .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 3px; }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #555; }
      .custom-scrollbar { scrollbar-width: thin; scrollbar-color: #333 transparent; }
      
      /* Legacy flow-handle styles for backward compatibility */
      .flow-handle {
        width: 9px;
        height: 9px;
        border-radius: 9999px;
        background: rgba(255, 255, 255, 0.85);
        border: 1px solid rgba(15, 23, 42, 0.8);
        z-index: 1000;
        pointer-events: auto !important;
        cursor: crosshair;
        transition: all 0.15s;
      }
      
      .flow-handle:hover {
        background: rgba(255, 255, 255, 1);
        border-color: rgba(148, 163, 184, 1);
        transform: scale(1.3);
        box-shadow: 0 0 4px rgba(148, 163, 184, 0.5);
      }
      
      .flow-handle-source {
        background: rgba(255, 255, 255, 0.85);
      }
      
      .flow-handle-target {
        background: rgba(255, 255, 255, 0.85);
      }
      
      /* NodeAnchor styles - ensures anchors stay visible at all zoom levels */
      .node-anchor {
        /* Anchors will scale with parent but maintain minimum visibility */
        will-change: transform, background-color, border-color;
        /* Ensure good visibility even when zoomed out */
        box-shadow: 0 0 2px rgba(0, 0, 0, 0.3);
      }
      
      /* Enhanced visibility for anchors at all zoom levels */
      .widget-container .node-anchor {
        /* Maintain consistent styling */
        display: block;
        flex-shrink: 0;
      }
      
      /* Ensure anchors are always interactive */
      .node-anchor:hover {
        z-index: 1001 !important;
      }
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

  // Track mouse position for smooth connection line
  useEffect(() => {
    if (!connecting || !canvasRef.current) {
      setMousePosition(null);
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      // Convert mouse position to canvas coordinates
      const canvasX = (e.clientX - rect.left - canvasTransform.translateX) / canvasTransform.scale;
      const canvasY = (e.clientY - rect.top - canvasTransform.translateY) / canvasTransform.scale;
      setMousePosition({ x: canvasX, y: canvasY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [connecting, canvasTransform.translateX, canvasTransform.translateY, canvasTransform.scale]);

  // --- Manual Generation Handlers ---
  const handleGenerateNode = (nodeId: string) => {
    const node = widgets.find((w) => w.id === nodeId);
    if (!node) return;

    let result: { generatedText: string; jsonPayload: any };

    if (nodeId === "flow-input-idea") {
      // IDEA INPUT: uses user input directly
      if (!node.content || !node.content.trim()) {
        return; // No input to generate from
      }
      result = generateIdeaSummary(node.content);
    } else {
      // Other nodes: collect upstream outputs
      const upstreamNodes = getUpstreamNodes(nodeId, widgets, edges);
      const upstreamOutputs: NodeOutputMap = {};
      upstreamNodes.forEach((upstreamNode) => {
        if (nodeOutputMap[upstreamNode.id]) {
          upstreamOutputs[upstreamNode.id] = nodeOutputMap[upstreamNode.id];
        }
      });

      if (nodeId === "flow-text-summary") {
        result = generateCleanSummary(upstreamOutputs);
      } else if (nodeId === "flow-agent-planner") {
        result = generatePageStructure(upstreamOutputs);
      } else if (nodeId === "flow-state-config") {
        result = generateDesignSystem(upstreamOutputs);
      } else if (nodeId === "flow-tool-seo") {
        result = generateSeoPlan(upstreamOutputs);
      } else {
        return; // Unknown node type
      }
    }

    // Store result in NodeOutputMap
    setNodeOutputMap((prev) => ({
      ...prev,
      [nodeId]: {
        generatedText: result.generatedText,
        jsonPayload: result.jsonPayload,
        integrated: prev[nodeId]?.integrated || false,
      },
    }));

    // Update widget content to show generated text
    setWidgets((prev) => prev.map((w) => (w.id === nodeId ? { ...w, content: result.generatedText } : w)));
  };

  // --- Integration Handler ---
  const handleIntegrateToMainPrompt = (nodeId: string) => {
    const mainNodeId = getMainPromptNodeId();
    if (!mainNodeId) return;

    // Check if connected to main prompt
    if (!isConnectedToMain(nodeId, mainNodeId, edges)) {
      // Option A: Show message (for now, just return silently)
      // In a real app, you might show a toast or disable the button
      return;
    }

    // Get node output
    const nodeOutput = nodeOutputMap[nodeId];
    if (!nodeOutput || !nodeOutput.generatedText) {
      // Auto-generate if not generated yet
      handleGenerateNode(nodeId);
      // Wait a bit then try again (in real app, use async/await)
      setTimeout(() => {
        const updatedOutput = nodeOutputMap[nodeId];
        if (updatedOutput?.generatedText) {
          performIntegration(nodeId, updatedOutput as { generatedText: string; jsonPayload?: any });
        }
      }, 100);
      return;
    }

    performIntegration(nodeId, nodeOutput as { generatedText: string; jsonPayload?: any });
  };

  const performIntegration = (nodeId: string, nodeOutput: { generatedText: string; jsonPayload?: any }) => {
    const node = widgets.find((w) => w.id === nodeId);
    if (!node) return;

    const title = node.title || node.subtitle || "Untitled Section";
    const order = mainPromptState.sections.length;

    // Upsert section
    setMainPromptState((prev) => {
      const existingIndex = prev.sections.findIndex((s) => s.nodeId === nodeId);
      const newSections =
        existingIndex >= 0
          ? prev.sections.map((s, i) => (i === existingIndex ? { ...s, title, content: nodeOutput.generatedText } : s))
          : [...prev.sections, { nodeId, title, content: nodeOutput.generatedText, order }];

      const combinedPrompt = buildCombinedPrompt(newSections);

      return {
        sections: newSections,
        combinedPrompt,
      };
    });

    // Mark as integrated
    setNodeOutputMap((prev) => ({
      ...prev,
      [nodeId]: { ...prev[nodeId], integrated: true },
    }));
  };

  // Update final prompt node when mainPromptState changes
  useEffect(() => {
    const finalNode = widgets.find((w) => w.id === "flow-text-final");
    if (!finalNode) return;

    setWidgets((prev) =>
      prev.map((w) => (w.id === "flow-text-final" ? { ...w, content: mainPromptState.combinedPrompt } : w)),
    );
  }, [mainPromptState.combinedPrompt]);

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
      setShowCategories(false);
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
      width: 420,
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

  // --- Website Flow Preset ---
  const createWebsiteFlowPreset = (): { nodes: Widget[]; edges: Edge[] } => {
    // Calculate starting position to avoid overlapping with existing nodes
    const baseX = 700;
    const baseY = 200;
    const nodeWidth = 320;
    const nodeHeight = 180;
    const horizontalSpacing = 400;
    const verticalOffset = 0;

    const nodes: Widget[] = [
      // IDEA INPUT
      {
        id: "flow-input-idea",
        type: "flow-input",
        title: "IDEA INPUT",
        subtitle: "Paste a URL to an existing website or describe the idea for the new landing page.",
        content: "",
        placeholder: "Enter URL or describe your website idea...",
        x: baseX,
        y: baseY,
        width: nodeWidth,
        height: nodeHeight,
      },
      // Text Generation: Website Summary
      {
        id: "flow-text-summary",
        type: "flow-text-gen",
        title: "TEXT GENERATION",
        subtitle: "Summarize website / idea",
        content: "",
        placeholder: "Summary will be generated here...",
        x: baseX + horizontalSpacing,
        y: baseY,
        width: nodeWidth,
        height: nodeHeight,
      },
      // AI Agent: Website Modules Planner
      {
        id: "flow-agent-planner",
        type: "flow-agent",
        title: "AI STUDIO AGENT",
        subtitle: "Plan website modules",
        content: "",
        placeholder: "Planning Hero, Services, About, Cases, Pricing, Contact, FAQ...",
        x: baseX + horizontalSpacing * 2,
        y: baseY,
        width: nodeWidth,
        height: nodeHeight,
      },
      // Set State: Save layout + config
      {
        id: "flow-state-config",
        type: "flow-state",
        title: "SET STATE",
        subtitle: "Save layout + config",
        content: "",
        placeholder: "Saving website configuration...",
        x: baseX + horizontalSpacing * 3,
        y: baseY,
        width: nodeWidth,
        height: nodeHeight,
      },
      // Tool Calling: SEO & Structure
      {
        id: "flow-tool-seo",
        type: "flow-tool",
        title: "TOOL CALLING",
        subtitle: "Generate SEO & structure",
        content: "",
        placeholder: "Generating SEO metadata and site structure...",
        x: baseX + horizontalSpacing * 4,
        y: baseY,
        width: nodeWidth,
        height: nodeHeight,
      },
      // Final Prompt: Output
      {
        id: "flow-text-final",
        type: "flow-text-gen",
        title: "TEXT GENERATION",
        subtitle: "Output final website prompt",
        content: "",
        placeholder: "Final website prompt will appear here...",
        x: baseX + horizontalSpacing * 5,
        y: baseY,
        width: nodeWidth,
        height: nodeHeight,
      },
    ];

    const edges: Edge[] = [
      { id: "edge-1", source: "flow-input-idea", target: "flow-text-summary" },
      { id: "edge-2", source: "flow-text-summary", target: "flow-agent-planner" },
      { id: "edge-3", source: "flow-agent-planner", target: "flow-state-config" },
      { id: "edge-4", source: "flow-state-config", target: "flow-tool-seo" },
      { id: "edge-5", source: "flow-tool-seo", target: "flow-text-final" },
    ];

    return { nodes, edges };
  };

  const handleCreateWebsiteFlowPreset = () => {
    const { nodes, edges } = createWebsiteFlowPreset();
    // Merge with existing widgets, avoiding duplicate IDs
    setWidgets((prev) => {
      const existingIds = new Set(prev.map((w) => w.id));
      const newNodes = nodes.filter((n) => !existingIds.has(n.id));
      return [...prev, ...newNodes];
    });
    // Merge with existing edges, avoiding duplicate IDs
    setEdges((prev) => {
      const existingIds = new Set(prev.map((e) => e.id));
      const newEdges = edges.filter((e) => !existingIds.has(e.id));
      return [...prev, ...newEdges];
    });
  };

  // --- App Flow Preset ---
  const createAppFlowPreset = (): { nodes: Widget[]; edges: Edge[] } => {
    const baseX = 700;
    const baseY = 200;
    const nodeWidth = 320;
    const nodeHeight = 180;
    const horizontalSpacing = 400;

    const nodes: Widget[] = [
      {
        id: "flow-input-idea-app",
        type: "flow-input",
        title: "IDEA INPUT",
        subtitle: "Describe your app idea or paste a reference URL.",
        content: "",
        placeholder: "Enter URL or describe your app idea...",
        x: baseX,
        y: baseY,
        width: nodeWidth,
        height: nodeHeight,
      },
      {
        id: "flow-text-summary-app",
        type: "flow-text-gen",
        title: "TEXT GENERATION",
        subtitle: "Summarize app / idea",
        content: "",
        placeholder: "Summary will be generated here...",
        x: baseX + horizontalSpacing,
        y: baseY,
        width: nodeWidth,
        height: nodeHeight,
      },
      {
        id: "flow-agent-planner-app",
        type: "flow-agent",
        title: "AI STUDIO AGENT",
        subtitle: "Plan app features & modules",
        content: "",
        placeholder: "Planning features, screens, navigation...",
        x: baseX + horizontalSpacing * 2,
        y: baseY,
        width: nodeWidth,
        height: nodeHeight,
      },
      {
        id: "flow-state-config-app",
        type: "flow-state",
        title: "SET STATE",
        subtitle: "Save app config",
        content: "",
        placeholder: "Saving app configuration...",
        x: baseX + horizontalSpacing * 3,
        y: baseY,
        width: nodeWidth,
        height: nodeHeight,
      },
      {
        id: "flow-tool-seo-app",
        type: "flow-tool",
        title: "TOOL CALLING",
        subtitle: "Generate app structure",
        content: "",
        placeholder: "Generating app metadata and structure...",
        x: baseX + horizontalSpacing * 4,
        y: baseY,
        width: nodeWidth,
        height: nodeHeight,
      },
      {
        id: "flow-text-final-app",
        type: "flow-text-gen",
        title: "TEXT GENERATION",
        subtitle: "Output final app prompt",
        content: "",
        placeholder: "Final app prompt will appear here...",
        x: baseX + horizontalSpacing * 5,
        y: baseY,
        width: nodeWidth,
        height: nodeHeight,
      },
    ];

    const edges: Edge[] = [
      { id: "edge-app-1", source: "flow-input-idea-app", target: "flow-text-summary-app" },
      { id: "edge-app-2", source: "flow-text-summary-app", target: "flow-agent-planner-app" },
      { id: "edge-app-3", source: "flow-agent-planner-app", target: "flow-state-config-app" },
      { id: "edge-app-4", source: "flow-state-config-app", target: "flow-tool-seo-app" },
      { id: "edge-app-5", source: "flow-tool-seo-app", target: "flow-text-final-app" },
    ];

    return { nodes, edges };
  };

  const handleCreateAppFlowPreset = () => {
    const { nodes, edges } = createAppFlowPreset();
    setWidgets((prev) => {
      const existingIds = new Set(prev.map((w) => w.id));
      const newNodes = nodes.filter((n) => !existingIds.has(n.id));
      return [...prev, ...newNodes];
    });
    setEdges((prev) => {
      const existingIds = new Set(prev.map((e) => e.id));
      const newEdges = edges.filter((e) => !existingIds.has(e.id));
      return [...prev, ...newEdges];
    });
  };

  // --- Game Flow Preset ---
  const createGameFlowPreset = (): { nodes: Widget[]; edges: Edge[] } => {
    const baseX = 700;
    const baseY = 200;
    const nodeWidth = 320;
    const nodeHeight = 180;
    const horizontalSpacing = 400;

    const nodes: Widget[] = [
      {
        id: "flow-input-idea-game",
        type: "flow-input",
        title: "IDEA INPUT",
        subtitle: "Describe your game idea or paste a reference URL.",
        content: "",
        placeholder: "Enter URL or describe your game idea...",
        x: baseX,
        y: baseY,
        width: nodeWidth,
        height: nodeHeight,
      },
      {
        id: "flow-text-summary-game",
        type: "flow-text-gen",
        title: "TEXT GENERATION",
        subtitle: "Summarize game / idea",
        content: "",
        placeholder: "Summary will be generated here...",
        x: baseX + horizontalSpacing,
        y: baseY,
        width: nodeWidth,
        height: nodeHeight,
      },
      {
        id: "flow-agent-planner-game",
        type: "flow-agent",
        title: "AI STUDIO AGENT",
        subtitle: "Plan game mechanics & systems",
        content: "",
        placeholder: "Planning mechanics, progression, systems...",
        x: baseX + horizontalSpacing * 2,
        y: baseY,
        width: nodeWidth,
        height: nodeHeight,
      },
      {
        id: "flow-state-config-game",
        type: "flow-state",
        title: "SET STATE",
        subtitle: "Save game config",
        content: "",
        placeholder: "Saving game configuration...",
        x: baseX + horizontalSpacing * 3,
        y: baseY,
        width: nodeWidth,
        height: nodeHeight,
      },
      {
        id: "flow-tool-seo-game",
        type: "flow-tool",
        title: "TOOL CALLING",
        subtitle: "Generate game structure",
        content: "",
        placeholder: "Generating game metadata and structure...",
        x: baseX + horizontalSpacing * 4,
        y: baseY,
        width: nodeWidth,
        height: nodeHeight,
      },
      {
        id: "flow-text-final-game",
        type: "flow-text-gen",
        title: "TEXT GENERATION",
        subtitle: "Output final game prompt",
        content: "",
        placeholder: "Final game prompt will appear here...",
        x: baseX + horizontalSpacing * 5,
        y: baseY,
        width: nodeWidth,
        height: nodeHeight,
      },
    ];

    const edges: Edge[] = [
      { id: "edge-game-1", source: "flow-input-idea-game", target: "flow-text-summary-game" },
      { id: "edge-game-2", source: "flow-text-summary-game", target: "flow-agent-planner-game" },
      { id: "edge-game-3", source: "flow-agent-planner-game", target: "flow-state-config-game" },
      { id: "edge-game-4", source: "flow-state-config-game", target: "flow-tool-seo-game" },
      { id: "edge-game-5", source: "flow-tool-seo-game", target: "flow-text-final-game" },
    ];

    return { nodes, edges };
  };

  const handleCreateGameFlowPreset = () => {
    const { nodes, edges } = createGameFlowPreset();
    setWidgets((prev) => {
      const existingIds = new Set(prev.map((w) => w.id));
      const newNodes = nodes.filter((n) => !existingIds.has(n.id));
      return [...prev, ...newNodes];
    });
    setEdges((prev) => {
      const existingIds = new Set(prev.map((e) => e.id));
      const newEdges = edges.filter((e) => !existingIds.has(e.id));
      return [...prev, ...newEdges];
    });
  };

  // --- Template Insertion Logic ---
  const handleInsertTemplate = (template: TemplateDefinition) => {
    if (!canvasRef.current) return;

    // Calculate viewport center in canvas coordinates
    const rect = canvasRef.current.getBoundingClientRect();
    const viewportCenterX = (rect.width / 2 - canvasTransform.translateX) / canvasTransform.scale;
    const viewportCenterY = (rect.height / 2 - canvasTransform.translateY) / canvasTransform.scale;

    // Calculate template bounding box
    const templateBounds = {
      minX: Math.min(...template.nodes.map((n) => n.x)),
      minY: Math.min(...template.nodes.map((n) => n.y)),
      maxX: Math.max(...template.nodes.map((n) => n.x + n.width)),
      maxY: Math.max(...template.nodes.map((n) => n.y + n.height)),
    };

    const templateWidth = templateBounds.maxX - templateBounds.minX;
    const templateHeight = templateBounds.maxY - templateBounds.minY;

    // Calculate template origin (top-left) to center it on viewport
    let templateOriginX = viewportCenterX - templateWidth / 2;
    let templateOriginY = viewportCenterY - templateHeight / 2;

    // Check for overlap with existing nodes
    const offsetX = 200;
    const offsetY = 200;
    let adjustedX = templateOriginX;
    let adjustedY = templateOriginY;

    for (const existingWidget of widgets) {
      const templateBoundsAdjusted = {
        minX: adjustedX + templateBounds.minX,
        minY: adjustedY + templateBounds.minY,
        maxX: adjustedX + templateBounds.maxX,
        maxY: adjustedY + templateBounds.maxY,
      };

      const existingBounds = {
        minX: existingWidget.x,
        minY: existingWidget.y,
        maxX: existingWidget.x + existingWidget.width,
        maxY: existingWidget.y + existingWidget.height,
      };

      // Check if bounding boxes overlap
      const overlaps =
        templateBoundsAdjusted.minX < existingBounds.maxX &&
        templateBoundsAdjusted.maxX > existingBounds.minX &&
        templateBoundsAdjusted.minY < existingBounds.maxY &&
        templateBoundsAdjusted.maxY > existingBounds.minY;

      if (overlaps) {
        // Apply offset
        adjustedX = existingBounds.maxX + offsetX;
        adjustedY = existingBounds.minY;
        break;
      }
    }

    // Generate unique IDs for template nodes
    const timestamp = Date.now();
    const nodeIdMap = new Map<string, string>();

    // Map template node IDs to unique generated IDs
    template.nodes.forEach((node) => {
      const uniqueId = `${node.id}-${timestamp}`;
      nodeIdMap.set(node.id, uniqueId);
    });

    // Create nodes with unique IDs and adjusted positions
    const newNodes: Widget[] = template.nodes.map((node) => {
      const uniqueId = nodeIdMap.get(node.id) || `${node.id}-${timestamp}`;
      return {
        id: uniqueId,
        type: node.type,
        title: node.title,
        subtitle: node.subtitle,
        content: node.content,
        placeholder: node.placeholder,
        x: adjustedX + node.x - templateBounds.minX,
        y: adjustedY + node.y - templateBounds.minY,
        width: node.width,
        height: node.height,
      };
    });

    // Create edges with mapped node IDs
    const newEdges: Edge[] = template.connections
      .map((conn, index) => {
        const sourceId = nodeIdMap.get(conn.source);
        const targetId = nodeIdMap.get(conn.target);

        // Skip if source or target not found
        if (!sourceId || !targetId) {
          return null;
        }

        return {
          id: `edge-${sourceId}-${targetId}-${timestamp}-${index}`,
          source: sourceId,
          target: targetId,
        };
      })
      .filter((edge): edge is Edge => edge !== null);

    // Add nodes and edges to state
    setWidgets((prev) => [...prev, ...newNodes]);
    setEdges((prev) => [...prev, ...newEdges]);

    // Close the categories drawer
    setShowCategories(false);
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

  // KEEP CURRENT WORKING ZOOM LOGIC
  const handleCanvasWheel = (e: React.WheelEvent) => {
    if (!canvasRef.current) return;

    // Don't zoom if scrolling inside a widget or textarea
    if ((e.target as HTMLElement).closest(".widget-container, .custom-scrollbar, textarea, input")) return;

    e.preventDefault();

    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Handle scroll with Shift key for horizontal panning
    if (e.shiftKey) {
      setCanvasTransform((prev) => ({
        ...prev,
        translateX: prev.translateX - e.deltaY * 0.5,
      }));
      return;
    }

    // Handle Alt/Option + scroll for vertical panning
    if (e.altKey) {
      setCanvasTransform((prev) => ({
        ...prev,
        translateY: prev.translateY - e.deltaY * 0.5,
      }));
      return;
    }

    // Normal scroll = zoom in/out (like Flowise)
    // Zoom around mouse cursor position for intuitive UX
    const zoomSpeed = 0.1;
    const zoomFactor = e.deltaY > 0 ? 1 - zoomSpeed : 1 + zoomSpeed;

    // Calculate new scale with reasonable limits (0.25 = 25% to 2.0 = 200%) - Flowise-like range
    const newScale = Math.max(0.25, Math.min(2.0, canvasTransform.scale * zoomFactor));

    // Zoom around mouse cursor position
    // Calculate the point under the mouse in canvas coordinates before zoom
    const canvasX = (mouseX - canvasTransform.translateX) / canvasTransform.scale;
    const canvasY = (mouseY - canvasTransform.translateY) / canvasTransform.scale;

    // Calculate new translate to keep the same point under the mouse after zoom
    const newTranslateX = mouseX - canvasX * newScale;
    const newTranslateY = mouseY - canvasY * newScale;

    setCanvasTransform({
      translateX: newTranslateX,
      translateY: newTranslateY,
      scale: newScale,
    });
  };

  // --- Drag & Resize Logic ---
  const handleMouseDown = (e: React.MouseEvent, widgetId: string, action: "move" | "resize") => {
    if ((e.target as HTMLElement).closest("textarea, input, button")) return;

    // Prevent dragging if widgets are locked
    if (widgetsLocked && action === "move") return;

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
    let rafId: number | null = null;

    const handleMouseMove = (e: MouseEvent) => {
      // Use requestAnimationFrame for smoother updates
      if (rafId) cancelAnimationFrame(rafId);

      rafId = requestAnimationFrame(() => {
        if (panning) {
          const deltaX = e.clientX - panning.startX;
          const deltaY = e.clientY - panning.startY;

          setCanvasTransform((prev) => ({
            ...prev,
            translateX: panning.startTranslateX + deltaX,
            translateY: panning.startTranslateY + deltaY,
          }));
        } else if (draggingHandle) {
          // Check if dragged far enough from handle to disconnect
          const handlePos = getHandlePosition(draggingHandle.nodeId, draggingHandle.handleType, widgets);

          const canvasX = (e.clientX - canvasTransform.translateX) / canvasTransform.scale;
          const canvasY = (e.clientY - canvasTransform.translateY) / canvasTransform.scale;

          const distance = Math.sqrt(Math.pow(canvasX - handlePos.x, 2) + Math.pow(canvasY - handlePos.y, 2));

          // If dragged more than 50px away, disconnect (will be finalized on mouse up)
          // Visual feedback: show disconnection state
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
      });
    };

    const handleMouseUp = () => {
      // Check if handle was dragged away to disconnect
      if (draggingHandle) {
        const handlePos = getHandlePosition(draggingHandle.nodeId, draggingHandle.handleType, widgets);

        const canvasX = (draggingHandle.startX - canvasTransform.translateX) / canvasTransform.scale;
        const canvasY = (draggingHandle.startY - canvasTransform.translateY) / canvasTransform.scale;

        const endX =
          (window.event ? (window.event as MouseEvent).clientX : draggingHandle.startX - canvasTransform.translateX) /
          canvasTransform.scale;

        const endY =
          (window.event ? (window.event as MouseEvent).clientY : draggingHandle.startY - canvasTransform.translateY) /
          canvasTransform.scale;

        // Use a simpler approach: check if mouse moved significantly
        const deltaX = Math.abs(endX - canvasX);
        const deltaY = Math.abs(endY - canvasY);
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        // If dragged more than 30px away, disconnect
        if (distance > 30) {
          if (draggingHandle.handleType === "input") {
            // Disconnect all edges coming into this node
            setEdges((prev) => {
              const edgesToRemove = prev.filter((ed) => ed.target === draggingHandle.nodeId);

              if (edgesToRemove.length > 0) {
                const sourceIds = edgesToRemove.map((ed) => ed.source);

                setMainPromptState((prevState) => {
                  const newSections = prevState.sections.filter((s) => !sourceIds.includes(s.nodeId));

                  return {
                    sections: newSections,
                    combinedPrompt: buildCombinedPrompt(newSections),
                  };
                });
              }

              return prev.filter((ed) => ed.target !== draggingHandle.nodeId);
            });
          } else if (draggingHandle.handleType === "output") {
            // Disconnect all edges going out from this node
            setEdges((prev) => {
              const edgesToRemove = prev.filter((ed) => ed.source === draggingHandle.nodeId);

              if (edgesToRemove.length > 0) {
                setMainPromptState((prevState) => {
                  const newSections = prevState.sections.filter((s) => s.nodeId !== draggingHandle.nodeId);

                  return {
                    sections: newSections,
                    combinedPrompt: buildCombinedPrompt(newSections),
                  };
                });
              }

              return prev.filter((ed) => ed.source !== draggingHandle.nodeId);
            });
          }
        }

        setDraggingHandle(null);
      }

      setDragging(null);
      setResizing(null);
      setPanning(null);
    };

    if (panning || dragging || resizing || draggingHandle) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      if (rafId) cancelAnimationFrame(rafId);
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

  // --- Connection Handlers ---
  const handleHandleMouseDown = (e: React.MouseEvent, nodeId: string, handleType: "input" | "output") => {
    e.stopPropagation();
    e.preventDefault();

    // Prevent double-click issues
    if (e.detail > 1) return; // Ignore double-clicks

    // Start dragging handle - can be used to disconnect by dragging away
    setDraggingHandle({
      nodeId,
      handleType,
      startX: e.clientX,
      startY: e.clientY,
    });

    // Normal connection flow
    if (handleType === "output") {
      setConnecting({ sourceId: nodeId, sourceHandle: "output" });
    } else if (handleType === "input" && connecting) {
      // Complete connection
      const newEdge: Edge = {
        id: `edge-${connecting.sourceId}-${nodeId}-${Date.now()}`,
        source: connecting.sourceId,
        target: nodeId,
      };

      setEdges((prev) => {
        // Check if edge already exists
        const exists = prev.some((e) => e.source === connecting.sourceId && e.target === nodeId);
        if (exists) return prev;
        return [...prev, newEdge];
      });

      setConnecting(null);
      setDraggingHandle(null);
    }
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    // Cancel connection if clicking on canvas (but not on handles or widgets)
    const target = e.target as HTMLElement;
    if (connecting && !target.closest(".node-anchor, .widget-container")) {
      setConnecting(null);
    }
  };

  // Get handle position for a node (in canvas coordinates)
  const getHandlePosition = (
    nodeId: string,
    handleType: "input" | "output",
    widgets: Widget[],
  ): { x: number; y: number } => {
    const widget = widgets.find((w) => w.id === nodeId);
    if (!widget) return { x: 0, y: 0 };

    const handleY = widget.y + widget.height / 2; // Center vertically
    // Anchors are positioned at -5px from edge (half of 10px anchor width)
    const handleX = handleType === "input" ? widget.x - 5 : widget.x + widget.width + 5;

    return { x: handleX, y: handleY };
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
            className="flex-1 relative w-full h-full flex flex-col bg-neutral-900"
          >
            {/* Top Bar - Flowise Style */}
            <div className="absolute top-0 left-0 right-0 h-14 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between px-4 z-30">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <button
                  onClick={() => setViewMode("landing")}
                  className="h-8 px-3 rounded-md bg-neutral-900/50 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-white flex items-center gap-2 transition-all cursor-pointer font-sans text-sm flex-shrink-0"
                >
                  <ArrowLeft size={16} />
                  <span>Back</span>
                </button>

                {/* Project Name - Static */}
                <div className="flex items-center min-w-0 flex-1">
                  <span className="text-base font-medium text-neutral-300 px-2 py-1 truncate">Your flow</span>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => setShowCategories(!showCategories)}
                  className={`h-10 w-10 rounded-lg border border-neutral-800 flex items-center justify-center transition-all shadow-lg cursor-pointer backdrop-blur-md ${showCategories ? "bg-neutral-800 text-white" : "bg-neutral-900/80 text-neutral-400 hover:bg-neutral-800 hover:text-white"}`}
                >
                  <Plus
                    size={20}
                    className={showCategories ? "rotate-45 transition-transform" : "transition-transform"}
                  />
                </button>
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className={`h-10 w-10 rounded-lg border border-neutral-800 flex items-center justify-center transition-all shadow-lg cursor-pointer backdrop-blur-md ${showSettings ? "bg-neutral-800 text-white" : "bg-neutral-900/80 text-neutral-400 hover:bg-neutral-800 hover:text-white"}`}
                >
                  <Settings size={20} />
                </button>
              </div>
            </div>

            {/* Settings Dropdown */}
            <AnimatePresence>
              {showSettings && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-14 right-4 w-64 bg-[#121214] border border-neutral-800 rounded-lg z-40 overflow-hidden"
                >
                  <div className="p-3">
                    <h3 className="text-sm font-semibold text-white mb-3 px-2">Settings</h3>
                    <div className="space-y-1">
                      <label className="block">
                        <input
                          type="file"
                          accept=".json"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                try {
                                  const data = JSON.parse(event.target?.result as string);
                                  if (data.widgets && data.edges) {
                                    setWidgets(data.widgets);
                                    setEdges(data.edges);
                                    if (data.nodeOutputMap) {
                                      setNodeOutputMap(data.nodeOutputMap);
                                    }
                                    if (data.mainPromptState) {
                                      setMainPromptState(data.mainPromptState);
                                    }
                                    if (data.canvasTransform) {
                                      setCanvasTransform(data.canvasTransform);
                                    }
                                    setShowSettings(false);
                                  } else {
                                    alert("Invalid flow file format");
                                  }
                                } catch (error) {
                                  alert("Error loading flow file");
                                  console.error(error);
                                }
                              };
                              reader.readAsText(file);
                            }
                            // Reset input
                            e.target.value = "";
                          }}
                        />
                        <button
                          onClick={() => {
                            const input = document.createElement("input");
                            input.type = "file";
                            input.accept = ".json";
                            input.onchange = (e) => {
                              const file = (e.target as HTMLInputElement).files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                  try {
                                    const data = JSON.parse(event.target?.result as string);
                                    if (data.widgets && data.edges) {
                                      setWidgets(data.widgets);
                                      setEdges(data.edges);
                                      if (data.nodeOutputMap) {
                                        setNodeOutputMap(data.nodeOutputMap);
                                      }
                                      if (data.mainPromptState) {
                                        setMainPromptState(data.mainPromptState);
                                      }
                                      if (data.canvasTransform) {
                                        setCanvasTransform(data.canvasTransform);
                                      }
                                      setShowSettings(false);
                                    } else {
                                      alert("Invalid flow file format");
                                    }
                                  } catch (error) {
                                    alert("Error loading flow file");
                                    console.error(error);
                                  }
                                };
                                reader.readAsText(file);
                              }
                            };
                            input.click();
                          }}
                          className="w-full px-3 py-2 text-left text-sm text-neutral-300 hover:bg-neutral-800 rounded-md transition-colors flex items-center gap-2"
                        >
                          <Upload size={14} />
                          Load Flow
                        </button>
                      </label>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Canvas - Full viewport workspace container */}
            <div
              ref={canvasRef}
              className="flex-1 relative overflow-hidden z-0 min-h-screen cursor-grab active:cursor-grabbing bg-neutral-900"
              style={{
                marginTop: "56px",
                width: "100%",
                height: "100%",
                position: "relative",
              }}
              onMouseDown={handleCanvasMouseDown}
              onWheel={handleCanvasWheel}
              onClick={handleCanvasClick}
            >
              {/* Background Grid - Always visible, full-screen coverage, synced with canvas transform */}
              {/* 
                Grid implementation: CSS radial-gradient pattern creating dot grid
                Alignment: Uses same transform (translate + scale) as nodes for perfect sync
                Coverage: Very large fixed size (1000000px x 1000000px) positioned to cover entire viewport at all zoom/pan levels
                Visibility: Always rendered, never conditionally hidden, z-index: 0 (behind content)
                The large size ensures grid is always visible even when zoomed out to 0.25x and panned far
              */}
              {backgroundVisible && (
                <div
                  className="absolute pointer-events-none"
                  style={{
                    // Extremely large fixed size to cover entire workspace at all zoom/pan levels
                    // Positioned to cover massive area: from -2000000 to +2000000 in canvas coordinates
                    // This ensures dots are always visible even when zoomed out to 0.25x and panned extensively
                    left: "-2000000px",
                    top: "-2000000px",
                    width: "4000000px",
                    height: "4000000px",
                    zIndex: 0,
                    // Dark gray base (neutral-900) - professional workspace background
                    backgroundColor: "#171717",
                    // Clean dot pattern only - no grid lines, classic canvas style
                    // Consistent rendering: all dots look identical at all zoom levels
                    // Using precise pixel values to ensure uniform appearance
                    backgroundImage: "radial-gradient(circle, rgba(255, 255, 255, 0.15) 1px, transparent 1px)",
                    // Fixed spacing: 24px ensures all dots are identical and evenly spaced
                    // backgroundSize scales with transform, keeping dots uniform
                    backgroundSize: "24px 24px",
                    backgroundRepeat: "repeat",
                    // Ensure consistent rendering quality
                    imageRendering: "auto",
                    // Same transform as nodes - single source of truth for zoom/pan synchronization
                    // The massive size ensures background always covers viewport even when zoomed out far
                    transform: `translate(${canvasTransform.translateX}px, ${canvasTransform.translateY}px) scale(${canvasTransform.scale})`,
                    transformOrigin: "0 0",
                    willChange: "transform",
                  }}
                />
              )}

              {/* Edges Container with Transform */}
              <svg
                className="absolute inset-0"
                style={{
                  zIndex: 1,
                  transform: `translate(${canvasTransform.translateX}px, ${canvasTransform.translateY}px) scale(${canvasTransform.scale})`,
                  transformOrigin: "0 0",
                  overflow: "visible",
                }}
              >
                {/* Active connection line (while dragging) */}
                {connecting &&
                  mousePosition &&
                  (() => {
                    const sourcePos = getHandlePosition(connecting.sourceId, "output", widgets);
                    const sourceWidget = widgets.find((w) => w.id === connecting.sourceId);
                    if (!sourceWidget) return null;

                    // Use mouse position for smooth connection line
                    const targetX = mousePosition.x;
                    const targetY = mousePosition.y;

                    return (
                      <g style={{ pointerEvents: "none" }}>
                        <path
                          d={`M ${sourcePos.x} ${sourcePos.y} C ${sourcePos.x + 50} ${sourcePos.y}, ${targetX - 50} ${targetY}, ${targetX} ${targetY}`}
                          stroke="rgba(148, 163, 184, 0.6)"
                          strokeWidth="1.5"
                          fill="none"
                        />
                      </g>
                    );
                  })()}

                {edges.map((edge) => {
                  const sourceWidget = widgets.find((w) => w.id === edge.source);
                  const targetWidget = widgets.find((w) => w.id === edge.target);

                  if (!sourceWidget || !targetWidget) return null;

                  // Connect handle to handle
                  const sourcePos = getHandlePosition(edge.source, "output", widgets);
                  const targetPos = getHandlePosition(edge.target, "input", widgets);

                  return (
                    <g key={edge.id} style={{ pointerEvents: "none" }}>
                      {/* Visible edge line - simple and clean */}
                      <path
                        d={`M ${sourcePos.x} ${sourcePos.y} C ${sourcePos.x + 50} ${sourcePos.y}, ${targetPos.x - 50} ${targetPos.y}, ${targetPos.x} ${targetPos.y}`}
                        stroke="rgba(148, 163, 184, 0.6)"
                        strokeWidth="1.5"
                        fill="none"
                      />
                    </g>
                  );
                })}
              </svg>

              {/* Widgets Container with Transform */}
              <div
                className="absolute inset-0"
                style={{
                  zIndex: 1,
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
                  } else if (widget.type === "flow-input") {
                    Icon = Upload;
                    accentColor = "text-blue-400";
                  } else if (widget.type === "flow-text-gen") {
                    Icon = FileText;
                    accentColor = "text-purple-400";
                  } else if (widget.type === "flow-agent") {
                    Icon = Bot;
                    accentColor = "text-green-400";
                  } else if (widget.type === "flow-state") {
                    Icon = Save;
                    accentColor = "text-amber-400";
                  } else if (widget.type === "flow-tool") {
                    Icon = Link2;
                    accentColor = "text-cyan-400";
                  }

                  return (
                    <div
                      key={widget.id}
                      className="absolute bg-[#121214] border border-neutral-800 rounded-xl flex flex-col hover:border-neutral-700 transition-colors font-sans widget-container"
                      style={{
                        left: widget.x,
                        top: widget.y,
                        width: widget.width,
                        height: widget.height,
                        overflow: "visible",
                        writingMode: "horizontal-tb",
                        textOrientation: "mixed",
                      }}
                      onMouseDown={(e) => {
                        // Don't start dragging if clicking on anchor
                        if (!(e.target as HTMLElement).closest(".node-anchor")) {
                          handleMouseDown(e, widget.id, "move");
                        }
                      }}
                    >
                      {/* Input Anchor (Left) - Automatically included on ALL nodes */}
                      <NodeAnchor
                        type="input"
                        nodeId={widget.id}
                        onMouseDown={handleHandleMouseDown}
                        onDoubleClick={(e) => {
                          // Double-click to disconnect all edges from this anchor
                          setEdges((prev) => {
                            const edgesToRemove = prev.filter((ed) => ed.target === widget.id);

                            if (edgesToRemove.length > 0) {
                              const sourceIds = edgesToRemove.map((ed) => ed.source);

                              setMainPromptState((prevState) => {
                                const newSections = prevState.sections.filter((s) => !sourceIds.includes(s.nodeId));

                                return {
                                  sections: newSections,
                                  combinedPrompt: buildCombinedPrompt(newSections),
                                };
                              });
                            }

                            return prev.filter((ed) => ed.target !== widget.id);
                          });
                        }}
                        onClick={(e) => {
                          // Complete connection if connecting is active
                          if (connecting && connecting.sourceId !== widget.id) {
                            const newEdge: Edge = {
                              id: `edge-${connecting.sourceId}-${widget.id}-${Date.now()}`,
                              source: connecting.sourceId,
                              target: widget.id,
                            };

                            setEdges((prev) => {
                              // Check if edge already exists
                              const exists = prev.some(
                                (e) => e.source === connecting.sourceId && e.target === widget.id,
                              );
                              if (exists) return prev;
                              return [...prev, newEdge];
                            });

                            setConnecting(null);
                            setDraggingHandle(null);
                          }
                        }}
                        onMouseUp={(e) => {
                          // Complete connection if connecting is active (when releasing mouse)
                          if (connecting && connecting.sourceId !== widget.id) {
                            const newEdge: Edge = {
                              id: `edge-${connecting.sourceId}-${widget.id}-${Date.now()}`,
                              source: connecting.sourceId,
                              target: widget.id,
                            };

                            setEdges((prev) => {
                              // Check if edge already exists
                              const exists = prev.some(
                                (e) => e.source === connecting.sourceId && e.target === widget.id,
                              );
                              if (exists) return prev;
                              return [...prev, newEdge];
                            });

                            setConnecting(null);
                            setDraggingHandle(null);
                          }
                        }}
                      />

                      {/* Output Anchor (Right) - Automatically included on ALL nodes (except final nodes) */}
                      {widget.id !== "flow-text-final" &&
                        widget.id !== "flow-text-final-app" &&
                        widget.id !== "flow-text-final-game" && (
                          <NodeAnchor
                            type="output"
                            nodeId={widget.id}
                            onMouseDown={handleHandleMouseDown}
                            onDoubleClick={(e) => {
                              // Double-click to disconnect all edges from this anchor
                              setEdges((prev) => {
                                const edgesToRemove = prev.filter((ed) => ed.source === widget.id);

                                if (edgesToRemove.length > 0) {
                                  setMainPromptState((prevState) => {
                                    const newSections = prevState.sections.filter((s) => s.nodeId !== widget.id);

                                    return {
                                      sections: newSections,
                                      combinedPrompt: buildCombinedPrompt(newSections),
                                    };
                                  });
                                }

                                return prev.filter((ed) => ed.source !== widget.id);
                              });
                            }}
                          />
                        )}

                      {/* Header */}
                      <div className="px-3 py-2 border-b border-neutral-800 bg-[#121214] flex items-center justify-between cursor-move select-none gap-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0 pr-2">
                          <div className={`p-1 rounded-md bg-neutral-800/50 ${accentColor} flex-shrink-0`}>
                            <Icon size={14} />
                          </div>
                          <span
                            className="text-sm font-semibold text-neutral-200 leading-tight font-sans"
                            style={{
                              writingMode: "horizontal-tb",
                              textOrientation: "mixed",
                              letterSpacing: "0",
                              wordSpacing: "normal",
                              whiteSpace: "nowrap",
                              overflow: "visible",
                              flex: "1",
                              minWidth: 0,
                            }}
                          >
                            {widget.type === "category" && widget.category ? widget.category.name : widget.title}
                          </span>
                        </div>

                        <div className="flex items-center gap-0.5 flex-shrink-0 ml-2">
                          {widget.type === "category" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleIntegration(widget.id);
                              }}
                              disabled={!widget.content?.trim()}
                              className={`px-1.5 py-0.5 rounded text-[10px] font-medium flex items-center gap-0.5 transition-all font-sans ${
                                widget.integrated
                                  ? "bg-green-500/10 text-green-500 hover:bg-green-500/20"
                                  : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white disabled:opacity-50"
                              }`}
                            >
                              {widget.integrated ? <Check size={10} /> : <Plus size={10} />}
                              <span className="hidden sm:inline">{widget.integrated ? "In Prompt" : "Add"}</span>
                            </button>
                          )}

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              copyWidget(widget);
                            }}
                            className="p-1 text-neutral-500 hover:text-white hover:bg-neutral-800 rounded transition-colors"
                          >
                            <Copy size={12} />
                          </button>

                          {widget.type !== "prompt" && !widget.type.startsWith("flow-") && (
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

                          {widget.type.startsWith("flow-") &&
                            widget.id !== "flow-text-final" &&
                            widget.id !== "flow-text-final-app" &&
                            widget.id !== "flow-text-final-game" && (
                              <>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleGenerateNode(widget.id);
                                  }}
                                  className="px-1.5 py-0.5 rounded text-[10px] font-medium flex items-center gap-0.5 transition-all font-sans bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"
                                  title="Generate content for this node"
                                >
                                  <Sparkles size={10} />
                                  <span className="hidden sm:inline">Generate</span>
                                </button>

                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleIntegrateToMainPrompt(widget.id);
                                  }}
                                  disabled={
                                    !isConnectedToMain(widget.id, getMainPromptNodeId(), edges) ||
                                    !nodeOutputMap[widget.id]?.generatedText
                                  }
                                  className={`px-1.5 py-0.5 rounded text-[10px] font-medium flex items-center gap-0.5 transition-all font-sans ${
                                    nodeOutputMap[widget.id]?.integrated
                                      ? "bg-green-500/10 text-green-500 hover:bg-green-500/20"
                                      : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                  }`}
                                  title={
                                    !isConnectedToMain(widget.id, getMainPromptNodeId(), edges)
                                      ? "Connect this node to Main Prompt to integrate"
                                      : "Integrate to Main Prompt"
                                  }
                                >
                                  {nodeOutputMap[widget.id]?.integrated ? <Check size={10} /> : <Plus size={10} />}
                                  <span className="hidden sm:inline">
                                    {nodeOutputMap[widget.id]?.integrated ? "Integrated" : "Integrate"}
                                  </span>
                                </button>

                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteWidget(widget.id);
                                    // Also delete connected edges and remove from state
                                    setEdges((prev) =>
                                      prev.filter((e) => e.source !== widget.id && e.target !== widget.id),
                                    );
                                    setNodeOutputMap((prev) => {
                                      const newMap = { ...prev };
                                      delete newMap[widget.id];
                                      return newMap;
                                    });
                                    setMainPromptState((prev) => ({
                                      ...prev,
                                      sections: prev.sections.filter((s) => s.nodeId !== widget.id),
                                      combinedPrompt: buildCombinedPrompt(
                                        prev.sections.filter((s) => s.nodeId !== widget.id),
                                      ),
                                    }));
                                  }}
                                  className="p-1 text-neutral-500 hover:text-white hover:bg-neutral-800 rounded transition-colors"
                                >
                                  <X size={12} />
                                </button>
                              </>
                            )}

                          {(widget.id === "flow-text-final" ||
                            widget.id === "flow-text-final-app" ||
                            widget.id === "flow-text-final-game") && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (mainPromptState.combinedPrompt) {
                                  navigator.clipboard.writeText(mainPromptState.combinedPrompt);
                                }
                              }}
                              className="px-1.5 py-0.5 rounded text-[10px] font-medium flex items-center gap-0.5 transition-all font-sans bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white"
                              title="Copy combined prompt to clipboard"
                            >
                              <Copy size={10} />
                              <span className="hidden sm:inline">Copy Prompt</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 bg-[#121214] flex flex-col relative" style={{ overflow: "visible" }}>
                        {widget.type === "prompt" && (
                          <div
                            className="p-4 overflow-y-auto overflow-x-auto h-full custom-scrollbar"
                            style={{ writingMode: "horizontal-tb", textOrientation: "mixed" }}
                          >
                            <pre
                              className="font-mono text-xs md:text-sm text-neutral-300 whitespace-pre-wrap break-words leading-relaxed"
                              style={{
                                writingMode: "horizontal-tb",
                                textOrientation: "mixed",
                                letterSpacing: "0",
                                wordSpacing: "normal",
                                whiteSpace: "pre-wrap",
                              }}
                            >
                              {widget.content}
                            </pre>
                          </div>
                        )}

                        {widget.type === "category" && (
                          <textarea
                            className="w-full h-full bg-transparent p-4 text-sm text-neutral-300 resize-none focus:outline-none placeholder:text-neutral-600 font-mono custom-scrollbar"
                            style={{
                              writingMode: "horizontal-tb",
                              textOrientation: "mixed",
                              letterSpacing: "0",
                              wordSpacing: "normal",
                              whiteSpace: "pre-wrap",
                            }}
                            value={widget.content}
                            onChange={(e) => updateWidget(widget.id, "content", e.target.value)}
                            placeholder={widget.placeholder}
                            onMouseDown={(e) => e.stopPropagation()}
                          />
                        )}

                        {widget.type.startsWith("flow-") && (
                          <div
                            className="p-4 overflow-y-auto overflow-x-auto h-full custom-scrollbar"
                            style={{ writingMode: "horizontal-tb", textOrientation: "mixed" }}
                          >
                            {widget.id === "flow-input-idea" ||
                            widget.id === "flow-input-idea-app" ||
                            widget.id === "flow-input-idea-game" ? (
                              <textarea
                                className="w-full h-full bg-transparent text-sm text-neutral-300 resize-none focus:outline-none placeholder:text-neutral-600 font-mono whitespace-pre-wrap break-words"
                                style={{
                                  writingMode: "horizontal-tb",
                                  textOrientation: "mixed",
                                  letterSpacing: "0",
                                  wordSpacing: "normal",
                                  whiteSpace: "pre-wrap",
                                }}
                                value={widget.content || ""}
                                onChange={(e) => updateWidget(widget.id, "content", e.target.value)}
                                placeholder={widget.placeholder}
                                onMouseDown={(e) => e.stopPropagation()}
                              />
                            ) : (
                              <pre
                                className="font-mono text-xs md:text-sm text-neutral-300 whitespace-pre-wrap break-words leading-relaxed"
                                style={{
                                  writingMode: "horizontal-tb",
                                  textOrientation: "mixed",
                                  letterSpacing: "0",
                                  wordSpacing: "normal",
                                  whiteSpace: "pre-wrap",
                                }}
                              >
                                {nodeOutputMap[widget.id]?.generatedText ||
                                  widget.content ||
                                  widget.placeholder ||
                                  "Click 'Generate' to create content..."}
                              </pre>
                            )}
                          </div>
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

              {/* Control Panel Banner - Bottom Center */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
                <div className="bg-[#121214] border border-neutral-800 rounded-xl px-3 py-2 flex items-center gap-2 shadow-lg pointer-events-auto">
                  {/* Zoom Out */}
                  <button
                    onClick={() => {
                      const newScale = Math.max(0.25, canvasTransform.scale - 0.1);
                      setCanvasTransform((prev) => ({
                        ...prev,
                        scale: newScale,
                      }));
                    }}
                    className="p-2 hover:bg-neutral-800 rounded-lg transition-colors text-neutral-400 hover:text-white"
                    title="Zoom out"
                  >
                    <Minus size={16} />
                  </button>

                  {/* Zoom In */}
                  <button
                    onClick={() => {
                      const newScale = Math.min(2.0, canvasTransform.scale + 0.1);
                      setCanvasTransform((prev) => ({
                        ...prev,
                        scale: newScale,
                      }));
                    }}
                    className="p-2 hover:bg-neutral-800 rounded-lg transition-colors text-neutral-400 hover:text-white"
                    title="Zoom in"
                  >
                    <Plus size={16} />
                  </button>

                  {/* Divider */}
                  <div className="w-px h-6 bg-neutral-800" />

                  {/* Lock/Unlock Widgets */}
                  <button
                    onClick={() => setWidgetsLocked(!widgetsLocked)}
                    className={`p-2 hover:bg-neutral-800 rounded-lg transition-colors ${
                      widgetsLocked ? "text-amber-400" : "text-neutral-400 hover:text-white"
                    }`}
                    title={widgetsLocked ? "Unlock widgets" : "Lock widgets"}
                  >
                    <Lock size={16} className={widgetsLocked ? "fill-current" : ""} />
                  </button>

                  {/* Divider */}
                  <div className="w-px h-6 bg-neutral-800" />

                  {/* Toggle Background */}
                  <button
                    onClick={() => setBackgroundVisible(!backgroundVisible)}
                    className={`p-2 hover:bg-neutral-800 rounded-lg transition-colors relative ${
                      !backgroundVisible ? "text-amber-400" : "text-neutral-400 hover:text-white"
                    }`}
                    title={backgroundVisible ? "Hide background" : "Show background"}
                  >
                    <Sun size={16} />
                    {!backgroundVisible && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-4 h-0.5 bg-amber-400 rotate-45 absolute" />
                        <div className="w-4 h-0.5 bg-amber-400 -rotate-45 absolute" />
                      </div>
                    )}
                  </button>
                </div>
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
                  className="absolute top-20 right-4 w-80 bg-[#121214] border border-neutral-800 rounded-xl z-40 flex flex-col max-h-[calc(100vh-100px)] overflow-hidden"
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
                                    className={`p-1.5 rounded-md bg-neutral-900 ${cat.color} group-hover:bg-neutral-800 flex-shrink-0`}
                                  >
                                    <cat.icon size={14} />
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs font-medium text-neutral-300 group-hover:text-white whitespace-nowrap flex-shrink-0">
                                        {cat.name}
                                      </span>
                                      {cat.description && (
                                        <span className="text-[10px] text-neutral-500 truncate flex-1 min-w-0">
                                          {cat.description}
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  <Plus
                                    size={12}
                                    className="text-neutral-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
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
                                    className={`p-1.5 rounded-md bg-neutral-900 ${cat.color} group-hover:bg-neutral-800 flex-shrink-0`}
                                  >
                                    <cat.icon size={14} />
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs font-medium text-neutral-300 group-hover:text-white whitespace-nowrap flex-shrink-0">
                                        {cat.name}
                                      </span>
                                      {cat.description && (
                                        <span className="text-[10px] text-neutral-500 truncate flex-1 min-w-0">
                                          {cat.description}
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  <Plus
                                    size={12}
                                    className="text-neutral-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                                  />
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Flows Subsection */}
                    <div className="mb-2">
                      <button
                        onClick={() => toggleSection("flows")}
                        className="w-full flex items-center justify-between p-2 text-xs font-semibold text-neutral-400 hover:text-white transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Sparkles size={14} className="text-neutral-500" />
                          Flows
                        </div>

                        {expandedSections.flows ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </button>

                      <AnimatePresence>
                        {expandedSections.flows && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="pl-2 space-y-1 mt-1">
                              <button
                                onClick={() => handleCreateWebsiteFlowPreset()}
                                className="w-full flex items-center gap-3 p-2 hover:bg-neutral-800/50 rounded-lg group transition-colors text-left cursor-pointer"
                              >
                                <div className="p-1.5 rounded-md bg-neutral-900 text-neutral-300 group-hover:bg-neutral-800">
                                  <Globe size={14} />
                                </div>

                                <div className="flex-1">
                                  <span className="block text-xs font-medium text-neutral-300 group-hover:text-white">
                                    Website
                                  </span>
                                  <span className="block text-[10px] text-neutral-500 truncate">
                                    Complete website flow preset
                                  </span>
                                </div>

                                <Plus
                                  size={12}
                                  className="text-neutral-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                />
                              </button>

                              <button
                                onClick={() => handleCreateAppFlowPreset()}
                                className="w-full flex items-center gap-3 p-2 hover:bg-neutral-800/50 rounded-lg group transition-colors text-left cursor-pointer"
                              >
                                <div className="p-1.5 rounded-md bg-neutral-900 text-neutral-300 group-hover:bg-neutral-800">
                                  <Smartphone size={14} />
                                </div>

                                <div className="flex-1">
                                  <span className="block text-xs font-medium text-neutral-300 group-hover:text-white">
                                    App
                                  </span>
                                  <span className="block text-[10px] text-neutral-500 truncate">
                                    Complete app flow preset
                                  </span>
                                </div>

                                <Plus
                                  size={12}
                                  className="text-neutral-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                />
                              </button>

                              <button
                                onClick={() => handleCreateGameFlowPreset()}
                                className="w-full flex items-center gap-3 p-2 hover:bg-neutral-800/50 rounded-lg group transition-colors text-left cursor-pointer"
                              >
                                <div className="p-1.5 rounded-md bg-neutral-900 text-neutral-300 group-hover:bg-neutral-800">
                                  <Gamepad2 size={14} />
                                </div>

                                <div className="flex-1">
                                  <span className="block text-xs font-medium text-neutral-300 group-hover:text-white">
                                    Game
                                  </span>
                                  <span className="block text-[10px] text-neutral-500 truncate">
                                    Complete game flow preset
                                  </span>
                                </div>

                                <Plus
                                  size={12}
                                  className="text-neutral-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                />
                              </button>

                              {/* Templates Subsection */}
                              <div className="mt-2 pt-2 border-t border-neutral-800">
                                <button
                                  onClick={() => toggleSection("templates")}
                                  className="w-full flex items-center justify-between p-2 text-xs font-semibold text-neutral-400 hover:text-white transition-colors"
                                >
                                  <div className="flex items-center gap-2">
                                    <FileStack size={12} className="text-neutral-500" />
                                    Templates
                                  </div>
                                  {expandedSections.templates ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                                </button>

                                <AnimatePresence>
                                  {expandedSections.templates && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: "auto", opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      className="overflow-hidden"
                                    >
                                      <div className="pl-2 space-y-1 mt-1">
                                        {[
                                          BusinessModelCanvas,
                                          LeanCanvas,
                                          SWOTAnalysis,
                                          UserJourneyMap,
                                          AIPromptBlueprint,
                                        ].map((template) => (
                                          <button
                                            key={template.name}
                                            onClick={() => handleInsertTemplate(template)}
                                            className="w-full flex items-center gap-3 p-2 hover:bg-neutral-800/50 rounded-lg group transition-colors text-left cursor-pointer"
                                          >
                                            <div
                                              className="flex-shrink-0 w-[60px] h-[30px] rounded border border-neutral-700 bg-neutral-900 overflow-hidden"
                                              dangerouslySetInnerHTML={{ __html: template.thumbnail }}
                                            />
                                            <div className="flex-1 min-w-0">
                                              <span className="block text-xs font-medium text-neutral-300 group-hover:text-white truncate">
                                                {template.name}
                                              </span>
                                              <span className="block text-[10px] text-neutral-500 truncate">
                                                {template.nodes.length} nodes
                                              </span>
                                            </div>
                                            <Plus
                                              size={12}
                                              className="text-neutral-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
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
