import React, { useState, useRef, useEffect, useCallback } from "react";

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
  Upload,
  Bot,
  Save,
  Link2,
  DollarSign,
  Menu,
  Eye,
} from "lucide-react";

// --- Types & Interfaces ---

interface Category {
  id: string;

  name: string;

  icon: any;

  color: string;

  description?: string;
}

// Smart Block Types
interface SmartBlock {
  type: "dropdown" | "tag-pills" | "text-field" | "option-selector";
  id: string;
  label: string;
  value?: any;
  options?: string[];
  placeholder?: string;
}

interface Widget {
  id: string;

  type:
    | "prompt"
    | "category"
    | "flow-input"
    | "flow-text-gen"
    | "flow-agent"
    | "flow-state"
    | "flow-tool"
    | "prompt-inspector";

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

  // Smart Blocks support
  smartBlocks?: SmartBlock[];

  // Data passing info for connections
  dataPassing?: {
    layout?: boolean;
    pages?: boolean;
    brandInfo?: boolean;
    [key: string]: boolean | undefined;
  };

  // Prompt Inspector specific
  promptText?: string;
  previewSummary?: string;
  previewOutdated?: boolean;
}

interface Edge {
  id: string;

  source: string;

  target: string;

  // Data passing info
  dataTypes?: string[];
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

    { id: "notes", name: "Notes", icon: FileText, color: "text-neutral-300", description: "Quick notes and reminders" },
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
    domain: true,

    general: true,
  });

  // New Feature States

  const [mode, setMode] = useState<"simple" | "advanced">("simple");

  const [showPreviewPanel, setShowPreviewPanel] = useState(false);

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const [hoveredEdgeId, setHoveredEdgeId] = useState<string | null>(null);

  const [showFinalPromptComposer, setShowFinalPromptComposer] = useState(true);

  const [finalPromptExpanded, setFinalPromptExpanded] = useState(false);

  const [canvasZoom, setCanvasZoom] = useState(1);

  const [gridSnap, setGridSnap] = useState(true);

  // Update canvas zoom range (40% - 300%)
  useEffect(() => {
    if (canvasTransform.scale < 0.4) {
      setCanvasTransform((prev) => ({ ...prev, scale: 0.4 }));
    } else if (canvasTransform.scale > 3) {
      setCanvasTransform((prev) => ({ ...prev, scale: 3 }));
    }
  }, [canvasTransform.scale]);

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

      .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }

      .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }

      .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(55, 65, 81, 0.3); border-radius: 2px; }

      .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(75, 85, 99, 0.5); }

      .custom-scrollbar { scrollbar-width: thin; scrollbar-color: rgba(55, 65, 81, 0.3) transparent; }
      
      /* Hide scrollbars on main canvas */
      .canvas-container {
        scrollbar-width: none !important;
        -ms-overflow-style: none !important;
      }
      .canvas-container::-webkit-scrollbar {
        display: none !important;
        width: 0 !important;
        height: 0 !important;
      }

      

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

        box-shadow: 0 0 8px rgba(255, 255, 255, 0.3);

      }

      .flow-handle:hover {

        box-shadow: 0 0 12px rgba(255, 255, 255, 0.5);

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
          performIntegration(nodeId, updatedOutput);
        }
      }, 100);

      return;
    }

    performIntegration(nodeId, nodeOutput);
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
      // Reset canvas transform when entering workspace

      setCanvasTransform({ translateX: 100, translateY: 100, scale: 1 });

      // Start with empty workspace - no default widgets

      setWidgets([]);

      setViewMode("workspace");

      setIsLoading(false);

      setShowCategories(false); // Drawer starts closed
    }, 600);
  };

  // --- Widget Management ---

  const handleCategoryAdd = (category: Category) => {
    const offset = widgets.length * 30;

    // Calculate position relative to current canvas view

    const baseX = -canvasTransform.translateX / canvasTransform.scale + 600;

    const baseY = -canvasTransform.translateY / canvasTransform.scale + 100;

    // Special handling for Notes node
    if (category.id === "notes") {
      const newWidget: Widget = {
        id: `notes-${Date.now()}`,
        type: "category",
        category: category,
        title: "Notes",
        content: "",
        placeholder: "Write your notes here...",
        integrated: false,
        x: baseX + Math.random() * 50,
        y: baseY + offset,
        width: 320,
        height: 250,
      };
      setWidgets((prev) => [...prev, newWidget]);
      return;
    }

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

  const handlePromptInspectorAdd = () => {
    const baseX = -canvasTransform.translateX / canvasTransform.scale + 600;

    const baseY = -canvasTransform.translateY / canvasTransform.scale + 100;

    const newWidget: Widget = {
      id: `prompt-inspector-${Date.now()}`,

      type: "prompt-inspector",

      title: "Prompt Inspector",

      promptText: "",

      previewSummary: undefined,

      previewOutdated: false,

      x: baseX,

      y: baseY,

      width: 500,

      height: 400,
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

    // Normal scroll = zoom in/out (like Figma/Flowise)
    // Smooth zoom with proper calculation
    const zoomSpeed = 0.1;
    const zoomFactor = e.deltaY > 0 ? 1 - zoomSpeed : 1 + zoomSpeed;

    // Calculate new scale - allow unlimited zoom (0.01 = 1% to 10 = 1000%)
    const newScale = Math.max(0.01, Math.min(10, canvasTransform.scale * zoomFactor));

    // Calculate the point under mouse in canvas coordinates (before zoom)
    const canvasX = (mouseX - canvasTransform.translateX) / canvasTransform.scale;
    const canvasY = (mouseY - canvasTransform.translateY) / canvasTransform.scale;

    // Calculate new translate to keep the point under mouse fixed
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

  // Get handle position for a node (in canvas coordinates)

  const getHandlePosition = (
    nodeId: string,
    handleType: "input" | "output",
    widgets: Widget[],
  ): { x: number; y: number } => {
    const widget = widgets.find((w) => w.id === nodeId);

    if (!widget) return { x: 0, y: 0 };

    const handleY = widget.y + widget.height / 2; // Center vertically

    // Handles are positioned at -4.5px from edge (half of 9px handle width)

    const handleX = handleType === "input" ? widget.x - 4.5 : widget.x + widget.width + 4.5;

    return { x: handleX, y: handleY };
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
        } else if (connecting) {
          // Update mouse position for connection line

          const canvasX = (e.clientX - canvasTransform.translateX) / canvasTransform.scale;

          const canvasY = (e.clientY - canvasTransform.translateY) / canvasTransform.scale;

          setMousePosition({ x: canvasX, y: canvasY });

          // Check if mouse is over a valid input handle (optimized - check all node types)
          const targetWidget = widgets.find((w) => {
            if (
              (!w.type.startsWith("flow-") && w.type !== "category" && w.type !== "prompt-inspector") ||
              w.id === connecting.sourceId
            )
              return false;

            const handlePos = getHandlePosition(w.id, "input", widgets);

            const distance = Math.sqrt(Math.pow(canvasX - handlePos.x, 2) + Math.pow(canvasY - handlePos.y, 2));

            return distance < 20; // 20px threshold for easier connection
          });

          // Don't auto-connect here - let user release mouse to connect

          // Auto-connect will happen on mouse up if still hovering
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

          let canvasX = (e.clientX - dragging.startX - canvasTransform.translateX) / canvasTransform.scale;
          let canvasY = (e.clientY - dragging.startY - canvasTransform.translateY) / canvasTransform.scale;

          // Grid snap (if enabled)
          if (gridSnap) {
            const snapSize = 20;
            canvasX = Math.round(canvasX / snapSize) * snapSize;
            canvasY = Math.round(canvasY / snapSize) * snapSize;
          }

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

    const handleMouseUp = (e: MouseEvent) => {
      // Complete connection if mouse up over a valid input handle

      if (connecting && mousePosition) {
        const canvasX = (e.clientX - canvasTransform.translateX) / canvasTransform.scale;

        const canvasY = (e.clientY - canvasTransform.translateY) / canvasTransform.scale;

        const targetWidget = widgets.find((w) => {
          if (!w.type.startsWith("flow-") || w.id === connecting.sourceId) return false;

          const handlePos = getHandlePosition(w.id, "input", widgets);

          const distance = Math.sqrt(Math.pow(canvasX - handlePos.x, 2) + Math.pow(canvasY - handlePos.y, 2));

          return distance < 20; // 20px threshold for connection
        });

        if (targetWidget) {
          // Complete connection

          const newEdge: Edge = {
            id: `edge-${connecting.sourceId}-${targetWidget.id}-${Date.now()}`,

            source: connecting.sourceId,

            target: targetWidget.id,
          };

          setEdges((prev) => {
            const exists = prev.some((e) => e.source === connecting.sourceId && e.target === targetWidget.id);

            if (exists) return prev;

            return [...prev, newEdge];
          });
        }

        setConnecting(null);

        setMousePosition(null);
      }

      // Check if handle was dragged away to disconnect

      if (draggingHandle) {
        // Use stored start position and current mouse position

        // Distance check happens in mouse move, so just clear here

        setDraggingHandle(null);
      }

      setDragging(null);

      setResizing(null);

      setPanning(null);
    };

    if (panning || dragging || resizing || draggingHandle || connecting) {
      window.addEventListener("mousemove", handleMouseMove);

      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);

      window.removeEventListener("mouseup", handleMouseUp);

      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [
    panning,
    dragging,
    resizing,
    draggingHandle,
    connecting,
    canvasTransform.scale,
    canvasTransform.translateX,
    canvasTransform.translateY,
    widgets,
    mousePosition,
  ]);

  // --- Prompt Inspector Preview Generation ---
  const generatePromptPreview = async (promptText: string): Promise<string> => {
    // Simple mock implementation - in production, this would call an LLM
    // For now, we'll create a structured breakdown
    const sections: string[] = [];

    // Try to identify sections by common patterns
    if (promptText.includes("You are") || promptText.includes("You're")) {
      sections.push(
        "**Role / System Instructions**\nDefines the AI's role and behavior. This sets the context for how the AI should respond.",
      );
    }

    if (promptText.includes("CONTEXT") || promptText.includes("Context:")) {
      sections.push(
        "**Context**\nProvides background information and situational details that inform the AI's understanding.",
      );
    }

    if (promptText.includes("INPUT") || promptText.includes("Input:")) {
      sections.push("**Input**\nSpecifies what data or information the AI should process.");
    }

    if (promptText.includes("OUTPUT") || promptText.includes("Output:") || promptText.includes("Return:")) {
      sections.push("**Output Format**\nDefines the expected structure and format of the AI's response.");
    }

    if (promptText.includes("CONSTRAINTS") || promptText.includes("Constraints:") || promptText.includes("Do not")) {
      sections.push("**Constraints**\nLists limitations, restrictions, or requirements that must be followed.");
    }

    if (promptText.includes("EXAMPLES") || promptText.includes("Example:")) {
      sections.push("**Examples**\nProvides sample inputs and outputs to guide the AI's behavior.");
    }

    // If no sections found, create a general explanation
    if (sections.length === 0) {
      sections.push(
        "**Prompt Overview**\nThis prompt contains instructions for the AI. Break it down into logical sections for better understanding.",
      );
    }

    return sections.join("\n\n");
  };

  // --- Prompt Inspector Component ---
  const PromptInspectorContent: React.FC<{ widget: Widget; onUpdate: (updates: Partial<Widget>) => void }> = ({
    widget,
    onUpdate,
  }) => {
    const [activeTab, setActiveTab] = useState<"prompt" | "preview">("prompt");
    const [isGenerating, setIsGenerating] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handlePromptChange = (value: string) => {
      onUpdate({
        promptText: value,
        previewOutdated: true,
      });
    };

    const handleGeneratePreview = async () => {
      if (!widget.promptText) return;

      setIsGenerating(true);
      try {
        const preview = await generatePromptPreview(widget.promptText);
        onUpdate({
          previewSummary: preview,
          previewOutdated: false,
        });
      } catch (error) {
        console.error("Failed to generate preview:", error);
      } finally {
        setIsGenerating(false);
      }
    };

    // Keyboard shortcut: Cmd/Ctrl + Enter
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        setActiveTab("preview");
        if (widget.promptText) {
          handleGeneratePreview();
        }
      }
    };

    return (
      <div className="flex flex-col h-full">
        {/* Tabs */}
        <div className="flex border-b border-neutral-800 bg-[#121214]">
          <button
            onClick={() => setActiveTab("prompt")}
            className={`flex-1 px-4 py-2 text-xs font-medium transition-colors ${
              activeTab === "prompt"
                ? "text-white border-b-2 border-indigo-400 bg-neutral-900/50"
                : "text-neutral-400 hover:text-neutral-300"
            }`}
          >
            Your prompt
          </button>
          <button
            onClick={() => setActiveTab("preview")}
            className={`flex-1 px-4 py-2 text-xs font-medium transition-colors relative ${
              activeTab === "preview"
                ? "text-white border-b-2 border-indigo-400 bg-neutral-900/50"
                : "text-neutral-400 hover:text-neutral-300"
            }`}
          >
            Preview
            {widget.previewOutdated && activeTab !== "preview" && (
              <span
                className="absolute top-1 right-2 w-1.5 h-1.5 bg-amber-500 rounded-full"
                title="Preview is outdated"
              />
            )}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === "prompt" ? (
            <textarea
              ref={textareaRef}
              className="w-full h-full bg-transparent p-4 text-sm text-neutral-300 resize-none focus:outline-none placeholder:text-neutral-600 font-mono custom-scrollbar"
              value={widget.promptText || ""}
              onChange={(e) => handlePromptChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Write your prompt here... (Cmd/Ctrl + Enter to generate preview)"
              onMouseDown={(e) => e.stopPropagation()}
            />
          ) : (
            <div className="h-full flex flex-col">
              <div className="p-3 border-b border-neutral-800 bg-neutral-900/30 flex items-center justify-between">
                <span className="text-xs text-neutral-400">
                  {widget.previewOutdated && "Preview is outdated – press Generate Preview to refresh."}
                </span>
                <button
                  onClick={handleGeneratePreview}
                  disabled={!widget.promptText || isGenerating}
                  className="px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 transition-all bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-3 h-3 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles size={12} />
                      Generate Preview
                    </>
                  )}
                </button>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
                {widget.previewSummary ? (
                  <div className="space-y-4">
                    {/* Show the original prompt first - prominently */}
                    <div className="bg-indigo-900/20 border-2 border-indigo-800/50 rounded-lg p-4 mb-4">
                      <h4 className="text-sm font-semibold text-indigo-300 mb-3 flex items-center gap-2">
                        <FileText size={16} />
                        Your Prompt
                      </h4>
                      <pre className="text-xs text-neutral-200 whitespace-pre-wrap leading-relaxed font-mono bg-neutral-900/70 p-3 rounded border border-neutral-800/50 max-h-48 overflow-y-auto custom-scrollbar">
                        {widget.promptText || "No prompt text"}
                      </pre>
                    </div>

                    {/* Then show the explanation */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-2">
                        Explanation
                      </h4>
                      {widget.previewSummary.split("\n\n").map((section, idx) => {
                        const lines = section.split("\n");
                        const title = lines[0]?.replace(/\*\*/g, "") || "";
                        const description = lines.slice(1).join("\n");

                        return (
                          <div key={idx} className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-3">
                            <h5 className="text-sm font-semibold text-white mb-1.5">{title}</h5>
                            <p className="text-xs text-neutral-400 leading-relaxed">{description}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-neutral-500 text-center py-8">
                    Click "Generate Preview" to see an explanation of your prompt
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

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

    // Handle double-click for disconnection

    if (e.detail > 1) {
      // Double-click to disconnect

      if (handleType === "input") {
        setEdges((prev) => {
          const edgesToRemove = prev.filter((ed) => ed.target === nodeId);

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

          return prev.filter((ed) => ed.target !== nodeId);
        });
      } else if (handleType === "output") {
        setEdges((prev) => {
          const edgesToRemove = prev.filter((ed) => ed.source === nodeId);

          if (edgesToRemove.length > 0) {
            setMainPromptState((prevState) => {
              const newSections = prevState.sections.filter((s) => s.nodeId !== nodeId);

              return {
                sections: newSections,

                combinedPrompt: buildCombinedPrompt(newSections),
              };
            });
          }

          return prev.filter((ed) => ed.source !== nodeId);
        });
      }

      return;
    }

    // Normal connection flow

    if (handleType === "output") {
      // Start connecting from output handle

      setConnecting({ sourceId: nodeId, sourceHandle: "output" });

      const canvasX = (e.clientX - canvasTransform.translateX) / canvasTransform.scale;

      const canvasY = (e.clientY - canvasTransform.translateY) / canvasTransform.scale;

      setMousePosition({ x: canvasX, y: canvasY });
    } else if (handleType === "input" && connecting) {
      // Complete connection by clicking input handle

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

      setMousePosition(null);
    } else if (handleType === "input") {
      // Start dragging input handle - can be used to disconnect by dragging away

      setDraggingHandle({
        nodeId,

        handleType,

        startX: e.clientX,

        startY: e.clientY,
      });
    }
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    // Cancel connection if clicking on canvas (but not on handles or widgets)

    const target = e.target as HTMLElement;

    if (connecting && !target.closest(".flow-handle, .widget-container")) {
      setConnecting(null);
    }
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
                {/* Simple/Advanced Mode Toggle */}
                <div className="flex items-center gap-1 bg-neutral-900/80 backdrop-blur-md border border-neutral-800 rounded-lg p-1">
                  <button
                    onClick={() => setMode("simple")}
                    className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                      mode === "simple" ? "bg-neutral-800 text-white" : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    Simple
                  </button>
                  <button
                    onClick={() => setMode("advanced")}
                    className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                      mode === "advanced" ? "bg-neutral-800 text-white" : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    Advanced
                  </button>
                </div>

                {/* Preview Panel Toggle */}
                <button
                  onClick={() => setShowPreviewPanel(!showPreviewPanel)}
                  className={`h-10 px-4 rounded-lg backdrop-blur-md border transition-all shadow-lg cursor-pointer font-sans flex items-center gap-2 ${
                    showPreviewPanel
                      ? "bg-blue-500/20 border-blue-500/50 text-blue-400"
                      : "bg-neutral-900/80 border-neutral-800 text-neutral-400 hover:bg-neutral-800 hover:text-white"
                  }`}
                >
                  <Eye size={16} />
                  <span className="text-sm font-medium">Preview</span>
                </button>

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
              className="flex-1 relative overflow-hidden z-0 cursor-grab active:cursor-grabbing canvas-container"
              onMouseDown={handleCanvasMouseDown}
              onWheel={handleCanvasWheel}
              onClick={handleCanvasClick}
              style={{ overflow: "hidden" }}
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

              {/* Edges Container with Transform */}

              <svg
                className="absolute inset-0"
                style={{
                  transform: `translate(${canvasTransform.translateX}px, ${canvasTransform.translateY}px) scale(${canvasTransform.scale})`,

                  transformOrigin: "0 0",

                  overflow: "visible",
                }}
              >
                {/* Active connection line (while dragging) - follows mouse */}

                {connecting &&
                  mousePosition &&
                  (() => {
                    const sourcePos = getHandlePosition(connecting.sourceId, "output", widgets);

                    // Check if mouse is over a valid input handle

                    const targetWidget = widgets.find((w) => {
                      if (!w.type.startsWith("flow-") || w.id === connecting.sourceId) return false;

                      const handlePos = getHandlePosition(w.id, "input", widgets);

                      const distance = Math.sqrt(
                        Math.pow(mousePosition.x - handlePos.x, 2) + Math.pow(mousePosition.y - handlePos.y, 2),
                      );

                      return distance < 15;
                    });

                    const targetX = targetWidget
                      ? getHandlePosition(targetWidget.id, "input", widgets).x
                      : mousePosition.x;

                    const targetY = targetWidget
                      ? getHandlePosition(targetWidget.id, "input", widgets).y
                      : mousePosition.y;

                    return (
                      <g style={{ pointerEvents: "none" }}>
                        <path
                          d={`M ${sourcePos.x} ${sourcePos.y} C ${sourcePos.x + 50} ${sourcePos.y}, ${targetX - 50} ${targetY}, ${targetX} ${targetY}`}
                          stroke={targetWidget ? "rgba(34, 197, 94, 0.8)" : "rgba(148, 163, 184, 0.8)"}
                          strokeWidth="2"
                          fill="none"
                        />

                        {/* Highlight target handle when hovering */}

                        {targetWidget && (
                          <circle
                            cx={targetX}
                            cy={targetY}
                            r="8"
                            fill="rgba(34, 197, 94, 0.2)"
                            stroke="rgba(34, 197, 94, 0.8)"
                            strokeWidth="2"
                          />
                        )}
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

                  const edgeDataTypes = edge.dataTypes || [];
                  const dataTypesText =
                    edgeDataTypes.length > 0
                      ? edgeDataTypes.join(", ")
                      : sourceWidget.dataPassing
                        ? Object.keys(sourceWidget.dataPassing)
                            .filter((k) => sourceWidget.dataPassing?.[k])
                            .join(", ")
                        : "data";

                  return (
                    <g
                      key={edge.id}
                      style={{ pointerEvents: "stroke" }}
                      onMouseEnter={() => setHoveredEdgeId(edge.id)}
                      onMouseLeave={() => setHoveredEdgeId(null)}
                      onClick={(e) => {
                        e.stopPropagation();
                        // Show data passing info
                        if (edgeDataTypes.length > 0 || sourceWidget.dataPassing) {
                          alert(`Passing: ${dataTypesText}`);
                        }
                      }}
                      className="cursor-pointer"
                    >
                      {/* Visible edge line - simple and clean */}

                      <path
                        d={`M ${sourcePos.x} ${sourcePos.y} C ${sourcePos.x + 50} ${sourcePos.y}, ${targetPos.x - 50} ${targetPos.y}, ${targetPos.x} ${targetPos.y}`}
                        stroke={hoveredEdgeId === edge.id ? "rgba(148, 163, 184, 0.9)" : "rgba(148, 163, 184, 0.6)"}
                        strokeWidth={hoveredEdgeId === edge.id ? "2" : "1.5"}
                        fill="none"
                      />

                      {/* Tooltip on hover */}
                      {hoveredEdgeId === edge.id && (
                        <foreignObject
                          x={(sourcePos.x + targetPos.x) / 2 - 60}
                          y={(sourcePos.y + targetPos.y) / 2 - 20}
                          width="120"
                          height="40"
                          style={{ pointerEvents: "none" }}
                        >
                          <div className="bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-xs text-neutral-300 font-sans shadow-lg">
                            Passing: {dataTypesText}
                          </div>
                        </foreignObject>
                      )}
                    </g>
                  );
                })}
              </svg>

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
                  } else if (widget.type === "prompt-inspector") {
                    Icon = FileText;

                    accentColor = "text-indigo-400";
                  }

                  return (
                    <div
                      key={widget.id}
                      className="absolute bg-[#121214] border border-neutral-800 rounded-xl shadow-2xl flex flex-col hover:border-neutral-700 transition-colors font-sans widget-container"
                      style={{
                        left: widget.x,

                        top: widget.y,

                        width: widget.width,

                        height: widget.height,

                        boxShadow: "0 10px 40px -10px rgba(0, 0, 0, 0.5)",

                        overflow: "visible",
                      }}
                      onMouseDown={(e) => {
                        // Don't start dragging if clicking on handle

                        if (!(e.target as HTMLElement).closest(".flow-handle")) {
                          handleMouseDown(e, widget.id, "move");
                        }
                      }}
                    >
                      {/* Input Handle (Left) - Inside card, visible */}
                      {/* All nodes get handles for connections */}
                      {(widget.type.startsWith("flow-") || widget.type === "category") && (
                        <div
                          className="absolute left-0 top-1/2 -translate-y-1/2 flow-handle flow-handle-target"
                          style={{
                            left: "-4.5px",

                            pointerEvents: "auto",

                            zIndex: 1000,
                          }}
                          onMouseDown={(e) => {
                            e.stopPropagation();

                            e.preventDefault();

                            handleHandleMouseDown(e, widget.id, "input");
                          }}
                          onDoubleClick={(e) => {
                            e.stopPropagation();

                            e.preventDefault();

                            // Double-click to disconnect all edges from this handle

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
                          onClick={(e) => e.stopPropagation()}
                          title="Input connection point - drag to connect"
                        />
                      )}

                      {/* Output Handle (Right) - Inside card, visible */}
                      {/* All nodes get output handles except final prompt */}
                      {(widget.type.startsWith("flow-") ||
                        widget.type === "category" ||
                        widget.type === "prompt-inspector") &&
                        widget.id !== "flow-text-final" && (
                          <div
                            className="absolute right-0 top-1/2 -translate-y-1/2 flow-handle flow-handle-source"
                            style={{
                              right: "-4.5px",

                              pointerEvents: "auto",

                              zIndex: 1000,
                            }}
                            onMouseDown={(e) => {
                              e.stopPropagation();

                              e.preventDefault();

                              handleHandleMouseDown(e, widget.id, "output");
                            }}
                            onDoubleClick={(e) => {
                              e.stopPropagation();

                              e.preventDefault();

                              // Double-click to disconnect all edges from this handle

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
                            onClick={(e) => e.stopPropagation()}
                            title="Output connection point - drag to connect"
                          />
                        )}

                      {/* Header */}

                      <div className="px-4 py-3 border-b border-neutral-800 bg-[#121214] flex items-center justify-between cursor-move select-none">
                        <div className="flex items-center gap-3">
                          <div className={`p-1.5 rounded-md bg-neutral-800/50 ${accentColor}`}>
                            <Icon size={16} />
                          </div>

                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-white leading-tight font-sans">
                              {widget.type === "category" && widget.category ? widget.category.name : widget.title}
                            </span>

                            {widget.subtitle && (
                              <span className="text-[10px] text-neutral-400 mt-0.5 font-sans">{widget.subtitle}</span>
                            )}

                            {widget.type === "prompt" && widgets.some((w) => w.type === "category" && w.integrated) && (
                              <span className="text-[10px] text-green-500 flex items-center gap-1 mt-0.5 font-sans">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                Live Syncing
                              </span>
                            )}

                            {widget.type.startsWith("flow-") && nodeOutputMap[widget.id]?.generatedText && (
                              <span className="text-[10px] text-blue-500 flex items-center gap-1 mt-0.5 font-sans">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                                Generated
                              </span>
                            )}

                            {widget.type.startsWith("flow-") && nodeOutputMap[widget.id]?.integrated && (
                              <span className="text-[10px] text-green-500 flex items-center gap-1 mt-0.5 font-sans">
                                <Check size={10} />
                                Integrated
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

                          {widget.type.startsWith("flow-") && widget.id !== "flow-text-final" && (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();

                                  handleGenerateNode(widget.id);
                                }}
                                className="px-2 py-1 rounded text-xs font-medium flex items-center gap-1 transition-all font-sans bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"
                                title="Generate content for this node"
                              >
                                <Sparkles size={12} />
                                Generate
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
                                className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 transition-all font-sans ${
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
                                {nodeOutputMap[widget.id]?.integrated ? <Check size={12} /> : <Plus size={12} />}

                                {nodeOutputMap[widget.id]?.integrated ? "Integrated" : "Integrate"}
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
                                className="p-1.5 text-neutral-500 hover:text-white hover:bg-neutral-800 rounded transition-colors"
                              >
                                <X size={14} />
                              </button>
                            </>
                          )}

                          {widget.id === "flow-text-final" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();

                                if (mainPromptState.combinedPrompt) {
                                  navigator.clipboard.writeText(mainPromptState.combinedPrompt);
                                }
                              }}
                              className="px-2 py-1 rounded text-xs font-medium flex items-center gap-1 transition-all font-sans bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white"
                              title="Copy combined prompt to clipboard"
                            >
                              <Copy size={12} />
                              Copy Prompt
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Content */}

                      <div className="flex-1 bg-[#121214] flex flex-col relative" style={{ overflow: "visible" }}>
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

                        {widget.type === "prompt-inspector" && (
                          <PromptInspectorContent
                            widget={widget}
                            onUpdate={(updates) => {
                              setWidgets((prev) => prev.map((w) => (w.id === widget.id ? { ...w, ...updates } : w)));
                            }}
                          />
                        )}

                        {widget.type.startsWith("flow-") && (
                          <div className="p-4 overflow-y-auto h-full custom-scrollbar flex flex-col gap-3">
                            {/* Smart Blocks */}
                            {widget.smartBlocks && widget.smartBlocks.length > 0 && (
                              <div className="flex flex-col gap-2 mb-2">
                                {widget.smartBlocks.map((block) => (
                                  <div key={block.id} className="flex flex-col gap-1">
                                    <label className="text-[10px] text-neutral-500 font-sans">{block.label}</label>
                                    {block.type === "dropdown" && (
                                      <select
                                        className="bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-xs text-neutral-300 focus:outline-none focus:border-neutral-700"
                                        value={block.value || ""}
                                        onChange={(e) => {
                                          const updatedBlocks = widget.smartBlocks?.map((b) =>
                                            b.id === block.id ? { ...b, value: e.target.value } : b,
                                          );
                                          setWidgets((prev) =>
                                            prev.map((w) =>
                                              w.id === widget.id ? { ...w, smartBlocks: updatedBlocks } : w,
                                            ),
                                          );
                                        }}
                                        onMouseDown={(e) => e.stopPropagation()}
                                      >
                                        {block.options?.map((opt) => (
                                          <option key={opt} value={opt}>
                                            {opt}
                                          </option>
                                        ))}
                                      </select>
                                    )}
                                    {block.type === "tag-pills" && (
                                      <div className="flex flex-wrap gap-1">
                                        {block.options?.map((opt) => {
                                          const isSelected = Array.isArray(block.value) && block.value.includes(opt);
                                          return (
                                            <button
                                              key={opt}
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                const current = Array.isArray(block.value) ? block.value : [];
                                                const updated = isSelected
                                                  ? current.filter((v) => v !== opt)
                                                  : [...current, opt];
                                                const updatedBlocks = widget.smartBlocks?.map((b) =>
                                                  b.id === block.id ? { ...b, value: updated } : b,
                                                );
                                                setWidgets((prev) =>
                                                  prev.map((w) =>
                                                    w.id === widget.id ? { ...w, smartBlocks: updatedBlocks } : w,
                                                  ),
                                                );
                                              }}
                                              className={`px-2 py-0.5 rounded text-[10px] font-sans transition-colors ${
                                                isSelected
                                                  ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                                                  : "bg-neutral-800 text-neutral-400 border border-neutral-700 hover:bg-neutral-700"
                                              }`}
                                            >
                                              {opt}
                                            </button>
                                          );
                                        })}
                                      </div>
                                    )}
                                    {block.type === "text-field" && (
                                      <input
                                        type="text"
                                        className="bg-neutral-900 border border-neutral-800 rounded px-2 py-1 text-xs text-neutral-300 focus:outline-none focus:border-neutral-700"
                                        value={block.value || ""}
                                        onChange={(e) => {
                                          const updatedBlocks = widget.smartBlocks?.map((b) =>
                                            b.id === block.id ? { ...b, value: e.target.value } : b,
                                          );
                                          setWidgets((prev) =>
                                            prev.map((w) =>
                                              w.id === widget.id ? { ...w, smartBlocks: updatedBlocks } : w,
                                            ),
                                          );
                                        }}
                                        placeholder={block.placeholder}
                                        onMouseDown={(e) => e.stopPropagation()}
                                      />
                                    )}
                                    {block.type === "option-selector" && (
                                      <div className="flex gap-1">
                                        {block.options?.map((opt) => {
                                          const isSelected = block.value === opt;
                                          return (
                                            <button
                                              key={opt}
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                const updatedBlocks = widget.smartBlocks?.map((b) =>
                                                  b.id === block.id ? { ...b, value: opt } : b,
                                                );
                                                setWidgets((prev) =>
                                                  prev.map((w) =>
                                                    w.id === widget.id ? { ...w, smartBlocks: updatedBlocks } : w,
                                                  ),
                                                );
                                              }}
                                              className={`px-2 py-1 rounded text-[10px] font-sans transition-colors ${
                                                isSelected
                                                  ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                                                  : "bg-neutral-800 text-neutral-400 border border-neutral-700 hover:bg-neutral-700"
                                              }`}
                                            >
                                              {opt}
                                            </button>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}

                            {widget.id === "flow-input-idea" ? (
                              <textarea
                                className="w-full flex-1 bg-transparent text-sm text-neutral-300 resize-none focus:outline-none placeholder:text-neutral-600 font-mono"
                                value={widget.content || ""}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  updateWidget(widget.id, "content", value);
                                  // AI suggestions based on input
                                  if (
                                    value.toLowerCase().includes("saas") ||
                                    value.toLowerCase().includes("landing page")
                                  ) {
                                    // Could trigger suggestions UI here
                                  }
                                }}
                                placeholder={widget.placeholder}
                                onMouseDown={(e) => e.stopPropagation()}
                                onFocus={() => setSelectedNodeId(widget.id)}
                              />
                            ) : (
                              <pre className="font-mono text-xs md:text-sm text-neutral-300 whitespace-pre-wrap leading-relaxed flex-1">
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

                              {/* Prompt Inspector Node */}
                              <button
                                onClick={handlePromptInspectorAdd}
                                className="w-full flex items-center gap-3 p-2 hover:bg-neutral-800/50 rounded-lg group transition-colors text-left cursor-pointer"
                              >
                                <div className="p-1.5 rounded-md bg-neutral-900 text-indigo-400 group-hover:bg-neutral-800">
                                  <FileText size={14} />
                                </div>

                                <div className="flex-1">
                                  <span className="block text-xs font-medium text-neutral-300 group-hover:text-white">
                                    Prompt Inspector
                                  </span>

                                  <span className="block text-[10px] text-neutral-500 truncate">
                                    Develop and refine prompts with preview
                                  </span>
                                </div>

                                <Plus
                                  size={12}
                                  className="text-neutral-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                />
                              </button>
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
