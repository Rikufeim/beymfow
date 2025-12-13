// Full-screen grid background fix for Beymflow workspace
// Single source of truth: canvasTransform state controls both node transforms and background grid
// Background grid uses the same translate/scale transform as nodes for perfect synchronization
// Fixed zoom range: 0.25 to 2.0 (Flowise-like range)
// Background grid: CSS-based radial-gradient pattern, always visible, covers full viewport
// Grid rendered as absolute positioned layer with z-index: 0, behind all content (z-index: 1+)
// UPDATED: Removed nested BrowserRouter to avoid conflicts with app-level routing.
// UPDATED: Moved "Prompt Window" button to be a top-level item BELOW "Templates" for better visibility.
// UPDATED: Changed selection highlight color from Blue to Gray (Neutral).
// UPDATED: Added Zoom In (+) and Zoom Out (-) buttons to the bottom toolbar between Hand and Text tools.
// UPDATED: Fixed background grid logic to use CSS background properties for stable zooming/panning.
// UPDATED: Unified background color to #050509.
// UPDATED: Made Prompt Window dynamic (connectable), added Copy functionality, and fixed template loading to append instead of replace.
// UPDATED (FIX): Removed usage of deprecated `window.event` in handleMouseUp to fix cross-browser/environment issues.

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast, Toaster } from "sonner";
import { HexColorPicker } from "react-colorful";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { GlassButton } from "@/components/ui/glass-button";
import { cn } from "@/lib/utils";
import BrandIdentityNode, { BrandIdentityFields } from "@/components/flow-nodes/BrandIdentityNode";
import { AVAILABLE_FONTS } from "@/components/flow-nodes/FontSelect";
// import ResizableNode from "@/components/flow-nodes/ResizableNode"; // Temporarily disabled - react-rnd not installed
import { getLayoutedElements } from "@/lib/flowLayout";
import { ResizableNodeWrapper } from "@/components/flow-nodes/ResizableNodeWrapper";

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
  Send,
  SquareStack,
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
  LogIn,
  LayoutTemplate,
  FolderKanban,
  LogOut,
  MousePointer2,
  Hand,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  RefreshCcw,
  Minus,
  Trash2,
  UserCheck,
  MessageCircle,
  Eye,
  EyeOff,
  Edit3,
  Clipboard,
  Paperclip,
} from "lucide-react";

// --- Mock Auth Context (Local Implementation) ---

interface UserType {
  id: string;
  email: string;
}

interface AuthContextType {
  user: UserType | null;
  login: () => void;
  logout: () => void;
}

const AuthContext = React.createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
});

const useAuth = () => React.useContext(AuthContext);

const MockAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Try to recover user from localStorage for persistence in demo
  const [user, setUser] = useState<UserType | null>(() => {
    try {
      const saved = localStorage.getItem("beymflow.demo.user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const login = () => {
    const demoUser = { id: "demo-user-123", email: "demo@beymflow.com" };
    setUser(demoUser);
    localStorage.setItem("beymflow.demo.user", JSON.stringify(demoUser));
    toast.success("Signed in as Demo User");
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("beymflow.demo.user");
    toast.success("Signed out");
  };

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
};

// --- Types & Interfaces ---

interface Category {
  id: string;
  name: string;
  icon: any;
  color: string;
  description?: string;
}

interface WidgetTextStyle {
  fontSize: number;
  textAlign: "left" | "center" | "right";
  color: string;
  fontFamily: string;
}

// Website module data structure
type WebsiteModuleData = {
  title: string;
  fields: Record<string, string>; // key = field id, value = user text
};

// Website specification collected from all website nodes
type WebsiteSpec = {
  userInput?: string;
  brandIdentity?: WebsiteModuleData;
  websitePurpose?: WebsiteModuleData;
  seoStructure?: WebsiteModuleData;
  functionalRequirements?: WebsiteModuleData;
  contentInputs?: WebsiteModuleData;
};

interface Widget {
  id: string;
  // Added "prompt-window", "website-section", and "brandIdentity" to the type definition
  type:
    | "prompt"
    | "category"
    | "flow-input"
    | "flow-text-gen"
    | "flow-agent"
    | "flow-state"
    | "flow-tool"
    | "text"
    | "prompt-window"
    | "website-section"
    | "brandIdentity"
    | "prompt-scanner"
    | "prompt-library";
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
  // New style property for text widgets
  style?: WidgetTextStyle;
  // New property for Prompt Window mode
  promptMode?: "edit" | "preview";
  // Flag to mark the special Prompt Output node
  isPromptNode?: boolean;
  // Website section data (for website-section nodes)
  websiteData?: WebsiteModuleData;
  // Brand identity data (for brandIdentity nodes)
  brandIdentityData?: {
    title: string;
    fields: {
      primaryColor: string;
      secondaryColor: string;
      accentColor: string;
      fontFamily: string;
      styleMood: string;
      toneOfVoice: string;
    };
  };
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
  { label: "Website" as const, icon: Globe },
  { label: "App" as const, icon: Smartphone },
  { label: "Game" as const, icon: Gamepad2 },
];

type ModeId = "website" | "app" | "game" | null;

const MODES = [
  { id: "website", label: "Website", icon: Globe },
  { id: "app", label: "App", icon: Smartphone },
  { id: "game", label: "Game", icon: Gamepad2 },
];

const PROMPT_PLACEHOLDER = "Prompt will be generated here...";

const DEFAULT_PROMPT_WINDOW_SIZE = {
  width: 420,
  height: 360,
};

const orderByCanvasPosition = (a: Widget, b: Widget) => {
  if (a.y === b.y) return a.x - b.x;
  return a.y - b.y;
};

const getPromptWindowPosition = (widgets: Widget[]) => {
  if (widgets.length === 0) {
    return { x: 820, y: 200 };
  }

  const maxX = Math.max(...widgets.map((w) => w.x + (w.width || 0)));
  const avgY = widgets.reduce((sum, w) => sum + w.y, 0) / widgets.length;

  return {
    x: maxX + 140,
    y: avgY - DEFAULT_PROMPT_WINDOW_SIZE.height / 2,
  };
};

const createPromptWindowWidget = (widgets: Widget[] = []): Widget => {
  const position = getPromptWindowPosition(widgets);

  return {
    id: `prompt-window-${Date.now()}`,
    type: "prompt-window",
    title: "Prompt Window",
    content: "",
    promptMode: "preview",
    x: position.x,
    y: position.y,
    width: DEFAULT_PROMPT_WINDOW_SIZE.width,
    height: DEFAULT_PROMPT_WINDOW_SIZE.height,
  };
};

const createPromptScannerWidget = (widgets: Widget[] = []): Widget => {
  const position = getPromptWindowPosition(widgets);

  return {
    id: `prompt-scanner-${Date.now()}`,
    type: "prompt-scanner",
    title: "Prompt Scanner",
    content: "",
    x: position.x,
    y: position.y + 200,
    width: 400,
    height: 300,
  };
};

const createPromptLibraryWidget = (widgets: Widget[] = []): Widget => {
  const position = getPromptWindowPosition(widgets);

  return {
    id: `prompt-library-${Date.now()}`,
    type: "prompt-library",
    title: "Prompt Library",
    content: "",
    x: position.x,
    y: position.y + 400,
    width: 400,
    height: 300,
  };
};

const ensurePromptWindowPresence = (widgets: Widget[]): Widget[] => {
  const promptWindows = widgets.filter((w) => w.type === "prompt-window");

  if (promptWindows.length === 0) {
    return [...widgets, createPromptWindowWidget(widgets)];
  }

  // ENSURE ONLY ONE PROMPT WINDOW - Remove duplicates
  if (promptWindows.length > 1) {
    // Keep the first one (or the one with specific ID if exists)
    const primaryPromptWindow = promptWindows.find(w => w.id === "website-prompt-window") || promptWindows[0];
    const filtered = widgets.filter((w) => w.type !== "prompt-window");
    return [...filtered, primaryPromptWindow];
  }

  return widgets;
};

// --- GLOBAL FLOW STATE CONTEXT (Flowise-like node communication) ---
interface FlowNodeData {
  // User Input
  userInput?: string;
  // Brand Identity
  brandIdentity?: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    fontFamily: string;
    styleMood: string;
    toneOfVoice: string;
  };
  // Website Purpose
  websitePurpose?: {
    problem: string;
    targetAudience: string;
    goals?: string;
  };
  // SEO & Structure
  seoStructure?: {
    keywords: string;
    metaDescriptions: string;
    pageStructure?: string;
  };
  // Functional Requirements
  functionalRequirements?: {
    ctas: string;
    animations: string;
    layouts?: string;
  };
  // Content Inputs
  contentInputs?: {
    copy: string;
    offers: string;
    references?: string;
  };
}

interface FlowStateContextType {
  nodeData: FlowNodeData;
  updateNodeData: (nodeId: string, data: Partial<FlowNodeData>) => void;
  getNodeData: (nodeId: string) => any;
}

const FlowStateContext = React.createContext<FlowStateContextType>({
  nodeData: {},
  updateNodeData: () => {},
  getNodeData: () => null,
});

const useFlowState = () => React.useContext(FlowStateContext);

// Build website specification from all website nodes (independent of edges)
const buildWebsiteSpec = (nodes: Widget[]): WebsiteSpec => {
  const spec: WebsiteSpec = {};

  // Find user input node
  const userInputNode = nodes.find((n) => n.id === "website-user-input" && n.type === "flow-input");
  if (userInputNode) {
    spec.userInput = userInputNode.content || "";
  }

  // Find brand identity node
  const brandIdentityNode = nodes.find((n) => n.id === "website-brand-identity" && n.type === "brandIdentity");
  if (brandIdentityNode?.brandIdentityData) {
    // Convert brandIdentityData to WebsiteModuleData format for compatibility
    spec.brandIdentity = {
      title: brandIdentityNode.brandIdentityData.title,
      fields: {
        primaryColor: brandIdentityNode.brandIdentityData.fields.primaryColor || "",
        secondaryColor: brandIdentityNode.brandIdentityData.fields.secondaryColor || "",
        accentColor: brandIdentityNode.brandIdentityData.fields.accentColor || "",
        fontFamily: brandIdentityNode.brandIdentityData.fields.fontFamily || "",
        styleMood: brandIdentityNode.brandIdentityData.fields.styleMood || "",
        toneOfVoice: brandIdentityNode.brandIdentityData.fields.toneOfVoice || "",
      },
    };
  }

  // Find website purpose node
  const purposeNode = nodes.find((n) => n.id === "website-purpose" && n.type === "website-section");
  if (purposeNode?.websiteData) {
    spec.websitePurpose = purposeNode.websiteData;
  }

  // Find SEO & structure node
  const seoNode = nodes.find((n) => n.id === "website-seo-structure" && n.type === "website-section");
  if (seoNode?.websiteData) {
    spec.seoStructure = seoNode.websiteData;
  }

  // Find functional requirements node
  const functionalNode = nodes.find((n) => n.id === "website-functional-requirements" && n.type === "website-section");
  if (functionalNode?.websiteData) {
    spec.functionalRequirements = functionalNode.websiteData;
  }

  // Find content inputs node
  const contentNode = nodes.find((n) => n.id === "website-content-inputs" && n.type === "website-section");
  if (contentNode?.websiteData) {
    spec.contentInputs = contentNode.websiteData;
  }

  return spec;
};

// Generate website prompt from specification - Intelligent Prompt Architect
const generateWebsitePrompt = (spec: WebsiteSpec): string => {
  // Extract and synthesize data
  const projectDescription = spec.userInput?.trim() || "";
  const brand = spec.brandIdentity?.fields || {};
  const purpose = spec.websitePurpose?.fields || {};
  const seo = spec.seoStructure?.fields || {};
  const functional = spec.functionalRequirements?.fields || {};
  const content = spec.contentInputs?.fields || {};

  // Determine project type and infer context
  const hasVisualIdentity = brand.primaryColor || brand.styleMood || brand.fontFamily;
  const hasAudienceData = purpose.targetAudience || purpose.problem;
  const hasSeoData = seo.keywords || seo.pageStructure;
  const hasFunctionalData = functional.ctas || functional.animations || functional.layouts;
  const hasContentData = content.copy || content.offers || content.references;

  // Infer tone and style
  const inferredTone = brand.toneOfVoice || "professional and approachable";
  const inferredStyle = brand.styleMood || "modern and clean";
  const inferredFont = brand.fontFamily || "a refined sans-serif typeface";

  // Build the synthesized prompt
  let prompt = `## Role & Perspective

You are acting as a senior product designer, brand strategist, and frontend architect. Your task is to design and build a complete, polished website that feels intentional, premium, and conversion-optimized.

## Project Overview

`;

  if (projectDescription) {
    prompt += `${projectDescription}\n\n`;
  } else {
    prompt += `Create a modern, responsive website that serves its intended purpose with clarity and visual sophistication.\n\n`;
  }

  // Audience & Experience Goals
  prompt += `## Audience & Experience Goals\n\n`;

  if (hasAudienceData) {
    if (purpose.targetAudience) {
      prompt += `This website is designed for ${purpose.targetAudience}. `;
    }
    if (purpose.problem) {
      prompt += `It exists to solve a core challenge: ${purpose.problem}. `;
    }
    if (purpose.goals) {
      prompt += `The primary objective is to ${purpose.goals}.\n\n`;
    } else {
      prompt += `\n\n`;
    }
  } else {
    prompt += `Design for users who value clarity, speed, and trust. The experience should feel intuitive from the first interaction, guiding visitors naturally toward the primary action.\n\n`;
  }

  // Design & Logic Principles
  prompt += `## Design & Logic Principles\n\n`;

  prompt += `**Visual Identity:** `;
  if (hasVisualIdentity) {
    const colors = [
      brand.primaryColor && `primary color ${brand.primaryColor}`,
      brand.secondaryColor && `secondary ${brand.secondaryColor}`,
      brand.accentColor && `accent ${brand.accentColor}`,
    ].filter(Boolean).join(", ");
    
    prompt += colors ? `Use a palette built around ${colors}. ` : "";
    prompt += `The typography should leverage ${inferredFont} for a ${inferredStyle} aesthetic. `;
    if (brand.styleMood) {
      prompt += `The overall mood should feel ${brand.styleMood}.\n\n`;
    } else {
      prompt += `\n\n`;
    }
  } else {
    prompt += `Establish a cohesive color system with strong contrast. Use modern typography that balances readability with character. Embrace generous whitespace and intentional hierarchy.\n\n`;
  }

  prompt += `**Tone & Voice:** Communicate in a tone that is ${inferredTone}. Every piece of copy should feel deliberate, concise, and aligned with the brand personality.\n\n`;

  if (hasSeoData) {
    prompt += `**Structure & Discoverability:** `;
    if (seo.keywords) {
      prompt += `Optimize for keywords including: ${seo.keywords}. `;
    }
    if (seo.pageStructure) {
      prompt += `Structure the site as: ${seo.pageStructure}. `;
    }
    if (seo.metaDescriptions) {
      prompt += `Meta descriptions should emphasize: ${seo.metaDescriptions}. `;
    }
    prompt += `\n\n`;
  }

  if (hasFunctionalData) {
    prompt += `**Interactions & Functionality:** `;
    if (functional.ctas) {
      prompt += `Primary calls-to-action: ${functional.ctas}. `;
    }
    if (functional.animations) {
      prompt += `Motion design approach: ${functional.animations}. `;
    }
    if (functional.layouts) {
      prompt += `Layout preferences: ${functional.layouts}. `;
    }
    prompt += `\n\n`;
  }

  // Execution Instructions
  prompt += `## Execution Instructions\n\n`;

  prompt += `1. **Think systematically** - Build with a component-first mindset. Every element should be reusable and consistent.\n\n`;
  
  prompt += `2. **Prioritize hierarchy** - The most important information should be immediately visible. Use size, color, and spacing to guide attention.\n\n`;
  
  prompt += `3. **Design for conversion** - Every page should have a clear purpose. Remove friction, minimize distractions, and make the next step obvious.\n\n`;
  
  prompt += `4. **Responsive by default** - The experience must be flawless on mobile, tablet, and desktop. Design mobile-first.\n\n`;
  
  prompt += `5. **Performance matters** - Optimize for speed. Lazy load images, minimize dependencies, and keep the DOM clean.\n\n`;

  if (hasContentData) {
    prompt += `## Content Direction\n\n`;
    if (content.copy) {
      prompt += `Core messaging: ${content.copy}\n\n`;
    }
    if (content.offers) {
      prompt += `Value proposition / offers: ${content.offers}\n\n`;
    }
    if (content.references) {
      prompt += `Reference materials and inspiration: ${content.references}\n\n`;
    }
  }

  prompt += `---\n\nDeliver a complete, production-ready implementation that embodies these principles. The result should feel like the work of a senior design team, not a template.`;

  return prompt;
};

const generatePromptFromGraph = (nodes: Widget[], edges: Edge[]): string => {
  // Check if this is a Website Flow (has website-section nodes)
  const hasWebsiteSections = nodes.some((n) => n.type === "website-section");
  
  if (hasWebsiteSections) {
    // Use website spec builder instead of edge-based logic
    const spec = buildWebsiteSpec(nodes);
    return generateWebsitePrompt(spec);
  }

  // Fallback to original edge-based logic for other flow types
  const promptWindow = nodes.find((node) => node.type === "prompt-window");
  if (!promptWindow) return "";

  const upstreamIds = new Set<string>();
  const queue: string[] = [promptWindow.id];

  while (queue.length > 0) {
    const currentTarget = queue.shift()!;
    const incomingEdges = edges.filter((edge) => edge.target === currentTarget);

    incomingEdges.forEach((edge) => {
      if (!upstreamIds.has(edge.source)) {
        upstreamIds.add(edge.source);
        queue.push(edge.source);
      }
    });
  }

  const connectedNodes = nodes.filter(
    (node) => upstreamIds.has(node.id) && node.type !== "prompt-window",
  );

  if (connectedNodes.length === 0) return "";

  const relevantEdges = edges.filter(
    (edge) => upstreamIds.has(edge.source) && upstreamIds.has(edge.target),
  );

  const nodeMap = new Map<string, Widget>();
  const indegree = new Map<string, number>();
  const adjacency = new Map<string, string[]>();

  connectedNodes.forEach((node) => {
    nodeMap.set(node.id, node);
    indegree.set(node.id, 0);
    adjacency.set(node.id, []);
  });

  relevantEdges.forEach((edge) => {
    if (!adjacency.has(edge.source) || !indegree.has(edge.target)) return;
    adjacency.get(edge.source)!.push(edge.target);
    indegree.set(edge.target, (indegree.get(edge.target) || 0) + 1);
  });

  const queueIds = connectedNodes
    .filter((node) => (indegree.get(node.id) || 0) === 0)
    .sort(orderByCanvasPosition)
    .map((node) => node.id);

  const orderedNodes: Widget[] = [];
  const visited = new Set<string>();

  while (queueIds.length > 0) {
    const nodeId = queueIds.shift()!;
    const node = nodeMap.get(nodeId);
    if (!node || visited.has(nodeId)) continue;

    orderedNodes.push(node);
    visited.add(nodeId);

    const neighbors = adjacency.get(nodeId) || [];
    neighbors.forEach((neighborId) => {
      if (!indegree.has(neighborId)) return;
      const nextIndegree = (indegree.get(neighborId) || 0) - 1;
      indegree.set(neighborId, nextIndegree);
      if (nextIndegree === 0) {
        queueIds.push(neighborId);
      }
    });

    queueIds.sort((aId, bId) => {
      const aNode = nodeMap.get(aId);
      const bNode = nodeMap.get(bId);
      if (!aNode || !bNode) return 0;
      return orderByCanvasPosition(aNode, bNode);
    });
  }

  const remaining = connectedNodes.filter((node) => !visited.has(node.id)).sort(orderByCanvasPosition);
  orderedNodes.push(...remaining);

  const promptSections = orderedNodes.map((node, index) => {
    const title = node.title || `Step ${index + 1}`;
    const parts: string[] = [`### ${title}`];

    const bodySegments = [node.content, node.basePrompt].filter(Boolean) as string[];
    if (bodySegments.length > 0) {
      parts.push(bodySegments.join("\n\n"));
    }

    return parts.join("\n");
  });

  return promptSections.filter(Boolean).join("\n\n");
};

// --- Saved Project Types ---
interface SavedFlowProject {
  id: string;
  name: string;
  domain: string;
  createdAt: string;
  updatedAt: string;
  widgets: Widget[];
  edges: Edge[];
  nodeOutputMap?: any;
  mainPromptState?: any;
  canvasTransform?: { translateX: number; translateY: number; scale: number };
}

const FLOW_PROJECTS_KEY = "beymflow.flow-engine.projects";

const loadSavedProjects = (userId?: string): SavedFlowProject[] => {
  try {
    if (userId) {
      const userKey = `${FLOW_PROJECTS_KEY}.${userId}`;
      return JSON.parse(localStorage.getItem(userKey) || "[]") || [];
    }
    return JSON.parse(localStorage.getItem(FLOW_PROJECTS_KEY) || "[]") || [];
  } catch {
    return [];
  }
};

const saveProjectsToStorage = (projects: SavedFlowProject[]) => {
  localStorage.setItem(FLOW_PROJECTS_KEY, JSON.stringify(projects));
};

// FlowStateProvider - Global state for all nodes
const FlowStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [nodeData, setNodeData] = useState<FlowNodeData>({});

  const updateNodeData = useCallback((nodeId: string, data: Partial<FlowNodeData>) => {
    setNodeData((prev) => {
      const updated = { ...prev };
      
      // Map node IDs to data structure
      if (nodeId === "website-user-input") {
        if (data.userInput !== undefined) updated.userInput = data.userInput;
      } else if (nodeId === "website-brand-identity") {
        if (data.brandIdentity) updated.brandIdentity = { ...prev.brandIdentity, ...data.brandIdentity };
      } else if (nodeId === "website-purpose") {
        if (data.websitePurpose) updated.websitePurpose = { ...prev.websitePurpose, ...data.websitePurpose };
      } else if (nodeId === "website-seo-structure") {
        if (data.seoStructure) updated.seoStructure = { ...prev.seoStructure, ...data.seoStructure };
      } else if (nodeId === "website-functional-requirements") {
        if (data.functionalRequirements) updated.functionalRequirements = { ...prev.functionalRequirements, ...data.functionalRequirements };
      } else if (nodeId === "website-content-inputs") {
        if (data.contentInputs) updated.contentInputs = { ...prev.contentInputs, ...data.contentInputs };
      }
      
      return updated;
    });
  }, []);

  const getNodeData = useCallback((nodeId: string) => {
    if (nodeId === "website-user-input") return nodeData.userInput;
    if (nodeId === "website-brand-identity") return nodeData.brandIdentity;
    if (nodeId === "website-purpose") return nodeData.websitePurpose;
    if (nodeId === "website-seo-structure") return nodeData.seoStructure;
    if (nodeId === "website-functional-requirements") return nodeData.functionalRequirements;
    if (nodeId === "website-content-inputs") return nodeData.contentInputs;
    return null;
  }, [nodeData]);

  return (
    <FlowStateContext.Provider value={{ nodeData, updateNodeData, getNodeData }}>
      {children}
    </FlowStateContext.Provider>
  );
};

const FlowEngineContent: React.FC<FlowEngineProps> = ({ onBack }) => {
  const navigate = useNavigate();
  const { user, login, logout } = useAuth();
  const { nodeData, updateNodeData } = useFlowState();

  // --- State ---
  const [viewMode, setViewMode] = useState<"landing" | "workspace">("landing");
  const [landingTab, setLandingTab] = useState<"projects" | "templates">("projects");
  const [landingChatInput, setLandingChatInput] = useState("");
  const landingChatTextareaRef = useRef<HTMLTextAreaElement>(null);
  const landingChatContainerRef = useRef<HTMLDivElement>(null);
  const [showProjectsDropdown, setShowProjectsDropdown] = useState(false);
  const [referenceProject, setReferenceProject] = useState<SavedFlowProject | null>(null);
  const projectsTabRef = useRef<HTMLButtonElement>(null);
  const templatesTabRef = useRef<HTMLButtonElement>(null);
  const [activeTabWidth, setActiveTabWidth] = useState<number | null>(null);
  
  // Animated placeholder text for landing chat
  const [landingPlaceholderIndex, setLandingPlaceholderIndex] = useState(0);
  const [landingDisplayedText, setLandingDisplayedText] = useState("");
  const [landingIsDeleting, setLandingIsDeleting] = useState(false);
  const [landingIsFocused, setLandingIsFocused] = useState(false);
  const [landingShowCursor, setLandingShowCursor] = useState(true);
  
  const landingPlaceholders = [
    "Build a complete website flow...",
    "Create a mobile app workflow...",
    "Design a game development pipeline...",
    "Generate a custom project template...",
  ];
  
  const landingPauseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const landingAnimationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const landingSwitchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Update active tab width when tab changes
  useEffect(() => {
    if (landingTab === "projects" && projectsTabRef.current) {
      setActiveTabWidth(projectsTabRef.current.offsetWidth);
    } else if (landingTab === "templates" && templatesTabRef.current) {
      setActiveTabWidth(templatesTabRef.current.offsetWidth);
    }
  }, [landingTab]);

  const [activeDomain, setActiveDomain] = useState<"Website" | "App" | "Game">("Website");
  const [selectedMode, setSelectedMode] = useState<ModeId>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [savedProjects, setSavedProjects] = useState<SavedFlowProject[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [projectName, setProjectName] = useState("Untitled Project");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // --- Workspace Tool State ---
  type ToolType = "select" | "hand" | "text";
  const [activeTool, setActiveTool] = useState<ToolType>("select");
  const [textToolSettings, setTextToolSettings] = useState<WidgetTextStyle>({
    fontSize: 16,
    textAlign: "left",
    color: "#ffffff",
    fontFamily: AVAILABLE_FONTS[0].value, // Use full font stack value
  });

  // Workspace State
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [showCategories, setShowCategories] = useState(false);
  // Memoize prompt generation to avoid recomputing on every render/drag
  const livePrompt = useMemo(() => {
    // Only recompute if widgets actually changed (not just position)
    return generatePromptFromGraph(widgets, edges);
  }, [widgets, edges]);
  const hasPromptWindow = useMemo(() => widgets.some((widget) => widget.type === "prompt-window"), [widgets]);

  // Selection & Manipulation State
  const [selectedWidgetIds, setSelectedWidgetIds] = useState<Set<string>>(new Set());
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [selectionBox, setSelectionBox] = useState<{
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
  } | null>(null);

  const [dragging, setDragging] = useState<{ id: string; startX: number; startY: number } | null>(null);
  const [lastDragPos, setLastDragPos] = useState<{ x: number; y: number } | null>(null);

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
    templates: false, // New templates section
    beymflowTools: false, // Beymflow tools subcategory
  });

  const [showSettings, setShowSettings] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showBackgroundPattern, setShowBackgroundPattern] = useState(true);

  // Removed automatic prompt window creation - user must add it manually

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

  // Auto-resize landing chat textarea
  useEffect(() => {
    if (landingChatTextareaRef.current) {
      landingChatTextareaRef.current.style.height = "auto";
      landingChatTextareaRef.current.style.height = `${Math.min(landingChatTextareaRef.current.scrollHeight, 200)}px`;
    }
  }, [landingChatInput]);

  // Update glow effect based on text input and cursor position
  useEffect(() => {
    if (!landingChatTextareaRef.current || !landingChatContainerRef.current) return;
    
    const textarea = landingChatTextareaRef.current;
    const container = landingChatContainerRef.current;
    
    // Find the glow element (the div with --start CSS variable)
    const glowElement = container.querySelector('[style*="--start"]') as HTMLElement;
    if (!glowElement) return;
    
    const updateGlow = () => {
      const cursorPos = textarea.selectionStart;
      const textLength = textarea.value.length;
      
      // Calculate cursor position as percentage (0-1)
      const cursorPercent = textLength > 0 
        ? Math.max(0, Math.min(1, cursorPos / textLength)) 
        : 0.5;
      
      // Map cursor position to angle (0-360 degrees)
      // Start from top (90 degrees) and go clockwise based on text position
      const angle = 90 + (cursorPercent * 360);
      
      // Set active state - glow is active when there's text or when focused
      const isActive = textLength > 0 || landingIsFocused;
      glowElement.style.setProperty("--active", isActive ? "1" : "0");
      
      // Smoothly interpolate angle
      const currentAngle = parseFloat(glowElement.style.getPropertyValue("--start")) || 0;
      const angleDiff = ((angle - currentAngle + 180) % 360) - 180;
      const newAngle = currentAngle + angleDiff * 0.2; // Smooth interpolation
      glowElement.style.setProperty("--start", String(newAngle));
    };
    
    updateGlow();
    
    // Update on various events
    const handleUpdate = () => {
      requestAnimationFrame(updateGlow);
    };
    
    textarea.addEventListener('input', handleUpdate);
    textarea.addEventListener('click', handleUpdate);
    textarea.addEventListener('keyup', handleUpdate);
    textarea.addEventListener('keydown', handleUpdate);
    
    // Use selectionchange if available
    document.addEventListener('selectionchange', handleUpdate);
    
    return () => {
      textarea.removeEventListener('input', handleUpdate);
      textarea.removeEventListener('click', handleUpdate);
      textarea.removeEventListener('keyup', handleUpdate);
      textarea.removeEventListener('keydown', handleUpdate);
      document.removeEventListener('selectionchange', handleUpdate);
    };
  }, [landingChatInput, landingIsFocused]);

  // Cursor blink animation for landing chat
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setLandingShowCursor((prev) => !prev);
    }, 530);
    return () => clearInterval(cursorInterval);
  }, []);

  // Animated placeholder for landing chat (sophisticated version matching QuickPromptGenerator)
  useEffect(() => {
    if (landingIsFocused || landingChatInput.trim()) {
      setLandingDisplayedText("");
      if (landingPauseTimeoutRef.current) {
        clearTimeout(landingPauseTimeoutRef.current);
        landingPauseTimeoutRef.current = null;
      }
      if (landingAnimationTimeoutRef.current) {
        clearTimeout(landingAnimationTimeoutRef.current);
        landingAnimationTimeoutRef.current = null;
      }
      if (landingSwitchTimeoutRef.current) {
        clearTimeout(landingSwitchTimeoutRef.current);
        landingSwitchTimeoutRef.current = null;
      }
      return;
    }
    
    const currentText = landingPlaceholders[landingPlaceholderIndex];
    
    // If text is complete and we're not deleting yet, wait before starting to delete
    if (!landingIsDeleting && landingDisplayedText.length === currentText.length) {
      if (!landingPauseTimeoutRef.current) {
        landingPauseTimeoutRef.current = setTimeout(() => {
          setLandingIsDeleting(true);
          landingPauseTimeoutRef.current = null;
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
    
    const speed = landingIsDeleting
      ? getDeletingSpeed(landingDisplayedText.length, currentText.length)
      : getTypingSpeed(landingDisplayedText.length, currentText.length);
    
    landingAnimationTimeoutRef.current = setTimeout(
      () => {
        if (!landingIsDeleting) {
          if (landingDisplayedText.length < currentText.length) {
            setLandingDisplayedText(currentText.slice(0, landingDisplayedText.length + 1));
          }
        } else {
          if (landingDisplayedText.length > 0) {
            setLandingDisplayedText(landingDisplayedText.slice(0, -1));
          } else {
            // Small pause before switching to next placeholder for smooth flow
            landingSwitchTimeoutRef.current = setTimeout(() => {
              setLandingIsDeleting(false);
              setLandingPlaceholderIndex((prev) => (prev + 1) % landingPlaceholders.length);
              landingSwitchTimeoutRef.current = null;
            }, 400);
          }
        }
      },
      speed,
    );
    
    return () => {
      if (landingAnimationTimeoutRef.current) {
        clearTimeout(landingAnimationTimeoutRef.current);
        landingAnimationTimeoutRef.current = null;
      }
      if (landingPauseTimeoutRef.current) {
        clearTimeout(landingPauseTimeoutRef.current);
        landingPauseTimeoutRef.current = null;
      }
      if (landingSwitchTimeoutRef.current) {
        clearTimeout(landingSwitchTimeoutRef.current);
        landingSwitchTimeoutRef.current = null;
      }
    };
  }, [landingDisplayedText, landingIsDeleting, landingPlaceholderIndex, landingIsFocused, landingChatInput, landingPlaceholders]);

  useEffect(() => {
    if (!landingIsFocused && !landingChatInput.trim()) {
      setLandingDisplayedText("");
      setLandingIsDeleting(false);
      setLandingPlaceholderIndex(0);
    }
  }, [landingIsFocused, landingChatInput]);

  // --- Domain Selection Logic & Template Loading (MOVED UP) ---
  const handleDomainSelection = (domainLabel: "Website" | "App" | "Game") => {
    // Only update the mode and clear input, don't switch to workspace yet
    setActiveDomain(domainLabel);
    // Map to selectedMode format
    const modeMap: Record<"Website" | "App" | "Game", "website" | "app" | "game"> = {
      Website: "website",
      App: "app",
      Game: "game",
    };
    setSelectedMode(modeMap[domainLabel]);
    setLandingChatInput(""); // Clear the input when mode is selected
  };

  // Helper to generate unique IDs for template nodes to avoid collisions when appending
  const generateUniqueNodesAndEdges = (templateNodes: Widget[], templateEdges: Edge[], existingNodes: Widget[]) => {
    const idMap: Record<string, string> = {};
    const timestamp = Date.now();

    // Map old IDs to new unique IDs
    const newNodes = templateNodes.map((node, index) => {
      const newId = `${node.type}-${timestamp}-${index}`;
      idMap[node.id] = newId;

      // Calculate offset to place new nodes slightly shifted if there are existing nodes
      const offsetX = existingNodes.length > 0 ? 50 : 0;
      const offsetY = existingNodes.length > 0 ? 50 : 0;

      return {
        ...node,
        id: newId,
        x: node.x + offsetX,
        y: node.y + offsetY,
      };
    });

    const newEdges = templateEdges.map((edge, index) => ({
      ...edge,
      id: `edge-${timestamp}-${index}`,
      source: idMap[edge.source],
      target: idMap[edge.target],
    }));

    return { newNodes, newEdges };
  };

  // Parse user input to determine domain type
  const detectDomainFromInput = (input: string): "Website" | "App" | "Game" => {
    const lowerInput = input.toLowerCase();
    
    // Check for game-related keywords
    if (lowerInput.includes("game") || lowerInput.includes("gaming") || lowerInput.includes("play")) {
      return "Game";
    }
    
    // Check for app-related keywords
    if (lowerInput.includes("app") || lowerInput.includes("mobile") || lowerInput.includes("ios") || 
        lowerInput.includes("android") || lowerInput.includes("application")) {
      return "App";
    }
    
    // Default to Website (most common)
    return "Website";
  };

  // Generate template from user input
  const handleGenerateTemplateFromInput = (input: string) => {
    setIsLoading(true);
    // Use the explicitly selected mode, map to domain format
    // Default to "Website" if no mode is selected
    const modeToDomain: Record<"website" | "app" | "game", "Website" | "App" | "Game"> = {
      website: "Website",
      app: "App",
      game: "Game",
    };
    const selectedDomain = selectedMode ? modeToDomain[selectedMode] : "Website";
    
    // If we have a reference project, we're developing it; otherwise create new
    const isDevelopingExisting = !!referenceProject;
    
    // Don't change activeDomain if we're developing an existing project
    // (it's already set from the project)

    setTimeout(() => {
      let presetData;
      if (selectedDomain === "Website") presetData = createWebsiteFlowPreset();
      else if (selectedDomain === "App") presetData = createAppFlowPreset();
      else presetData = createGameFlowPreset();

      const { nodes: rawNodes, edges: rawEdges } = presetData;

      // Update the first input node with user's input
      const updatedNodes = rawNodes.map((node) => {
        if (node.type === "flow-input") {
          // For website flow, update the website-user-input node specifically
          if (selectedDomain === "Website" && node.id === "website-user-input") {
            return { ...node, content: input };
          }
          // For other flows, update any flow-input node
          if (selectedDomain !== "Website") {
            return { ...node, content: input };
          }
        }
        // For website flow, also populate initial content in Website Purpose and Content Inputs
        if (selectedDomain === "Website" && node.type === "website-section") {
          if (node.id === "website-purpose" && node.websiteData) {
            return {
              ...node,
              websiteData: {
                ...node.websiteData,
                fields: {
                  ...node.websiteData.fields,
                  problem: input, // Pre-fill problem with user input
                },
              },
            };
          }
          if (node.id === "website-content-inputs" && node.websiteData) {
            return {
              ...node,
              websiteData: {
                ...node.websiteData,
                fields: {
                  ...node.websiteData.fields,
                  copy: input, // Pre-fill copy with user input
                },
              },
            };
          }
        }
        return node;
      });

      // UPDATED: Append nodes instead of replacing, generate unique IDs
      const { newNodes, newEdges } = generateUniqueNodesAndEdges(updatedNodes, rawEdges, widgets);

      // Ensure prompt window is present and connected to the final output node
      const finalOutputNode = newNodes.find((n) => n.isPromptNode);
      
      // Create prompt window positioned next to final output node
      let promptWindow: Widget | undefined;
      let nodesWithPromptWindow = [...newNodes];
      
      // Check if prompt window already exists in existing widgets
      const existingPromptWindow = widgets.find((w) => w.type === "prompt-window");
      
      if (!existingPromptWindow && finalOutputNode) {
        // Create new prompt window positioned to the right of final output node
        promptWindow = {
          id: `prompt-window-${Date.now()}`,
          type: "prompt-window",
          title: "Prompt Window",
          x: finalOutputNode.x + (finalOutputNode.width || 360) + 50,
          y: finalOutputNode.y,
          width: 400,
          height: 500,
          content: "",
          promptMode: "preview",
        };
        nodesWithPromptWindow.push(promptWindow);
      } else if (existingPromptWindow) {
        promptWindow = existingPromptWindow;
      }
      
      // Create edges array with prompt window connection if needed
      let finalEdges = [...newEdges];
      if (promptWindow && finalOutputNode) {
        // Check if edge already exists
        const edgeExists = finalEdges.some(
          (e) => e.source === finalOutputNode.id && e.target === promptWindow!.id
        );
        if (!edgeExists) {
          const promptWindowEdge: Edge = {
            id: `edge-prompt-${Date.now()}`,
            source: finalOutputNode.id,
            target: promptWindow.id,
          };
          finalEdges.push(promptWindowEdge);
        }
      }
      
      // Update widgets and edges
      const updatedWidgets = (() => {
        if (promptWindow && !existingPromptWindow) {
          return [...widgets, ...nodesWithPromptWindow];
        }
        return [...widgets, ...newNodes];
      })();
      
      const updatedEdges = [...edges, ...finalEdges];
      
      setWidgets(updatedWidgets);
      setEdges(updatedEdges);

      // If developing existing project, save it automatically
      if (isDevelopingExisting && referenceProject) {
        // Update the reference project with new nodes
        const updatedProject: SavedFlowProject = {
          ...referenceProject,
          widgets: updatedWidgets,
          edges: updatedEdges,
          updatedAt: new Date().toISOString(),
        };
        
        // Save to storage
        if (user) {
          const savedProjects = loadSavedProjects(user.id);
          const updatedProjects = savedProjects.map((p) =>
            p.id === referenceProject.id ? updatedProject : p
          );
          const userKey = `${FLOW_PROJECTS_KEY}.${user.id}`;
          localStorage.setItem(userKey, JSON.stringify(updatedProjects));
          setSavedProjects(updatedProjects);
        }
        setReferenceProject(updatedProject);
        
        toast.success(`Added to ${referenceProject.name}`);
      } else {
        // Only reset view/transform if it's a fresh project
        if (widgets.length === 0) {
          // Center and zoom to the freshly created template so it's immediately visible
          fitViewToNodes(updatedWidgets);
          setCurrentProjectId(null);
          setProjectName(`${selectedDomain} Flow Template`);
        } else {
          toast.success(`${selectedDomain} Flow added to workspace`);
        }
      }

      // Don't switch to workspace if we have a reference project - keep split view
      if (!referenceProject) {
        setViewMode("workspace");
      }
      setIsLoading(false);
      setShowCategories(false);
      setLandingChatInput(""); // Clear input after generation
    }, 300);
  };

  const handleLoadTemplate = (templateType: "Website" | "App" | "Game") => {
    setIsLoading(true);
    setActiveDomain(templateType);

    setTimeout(() => {
      let presetData;
      if (templateType === "Website") presetData = createWebsiteFlowPreset();
      else if (templateType === "App") presetData = createAppFlowPreset();
      else presetData = createGameFlowPreset();

      const { nodes: rawNodes, edges: rawEdges } = presetData;

      // UPDATED: Append nodes instead of replacing, generate unique IDs
      const { newNodes, newEdges } = generateUniqueNodesAndEdges(rawNodes, rawEdges, widgets);

      // ENSURE ONLY ONE PROMPT WINDOW - Remove duplicates
      const allNodes = [...widgets, ...newNodes];
      const cleanedNodes = ensurePromptWindowPresence(allNodes);
      setWidgets(cleanedNodes);
      setEdges((prev) => [...prev, ...newEdges]);

      // Only reset view/transform if it's a fresh project
      if (widgets.length === 0) {
        setCurrentProjectId(null);
        setProjectName(`${templateType} Flow Template`);
        // Fit view to show all nodes with padding (no delay so the first render is close)
        fitViewToNodes(cleanedNodes);
      } else {
        toast.success(`${templateType} Flow added to workspace`);
      }

      setViewMode("workspace");
      setIsLoading(false);
      setShowCategories(false);
    }, 300);
  };

  // Load saved projects on mount (user-specific)
  useEffect(() => {
    if (user) {
      const userKey = `${FLOW_PROJECTS_KEY}.${user.id}`;
      try {
        const projects = JSON.parse(localStorage.getItem(userKey) || "[]") || [];
        setSavedProjects(projects);
      } catch {
        setSavedProjects([]);
      }
    } else {
      setSavedProjects([]);
    }
  }, [user]);

  // --- Keyboard Event Listeners (Space, Delete, Tool Shortcuts) ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === "Space" && !e.repeat) {
        setIsSpacePressed(true);
      }

      // Tool Shortcuts
      if (e.key.toLowerCase() === "v") setActiveTool("select");
      if (e.key.toLowerCase() === "h") setActiveTool("hand");
      if (e.key.toLowerCase() === "t") setActiveTool("text");

      // Delete with Delete, Backspace, or Ctrl+X
      if (e.key === "Delete" || e.key === "Backspace" || (e.ctrlKey && e.key.toLowerCase() === "x")) {
        if (selectedWidgetIds.size > 0) {
          e.preventDefault();
          setWidgets((prev) => prev.filter((w) => !selectedWidgetIds.has(w.id)));
          setEdges((prev) =>
            prev.filter((edge) => !selectedWidgetIds.has(edge.source) && !selectedWidgetIds.has(edge.target)),
          );
          setSelectedWidgetIds(new Set());

          const idsToRemove = Array.from(selectedWidgetIds);
          setMainPromptState((prev) => ({
            ...prev,
            sections: prev.sections.filter((s) => !idsToRemove.includes(s.nodeId)),
            combinedPrompt: buildCombinedPrompt(prev.sections.filter((s) => !idsToRemove.includes(s.nodeId))),
          }));
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        setIsSpacePressed(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [selectedWidgetIds]);

  // --- Save/Load Project Functions ---
  const saveCurrentProject = useCallback(
    (silent = false) => {
      if (!user) {
        if (!silent) {
          toast.error("Sign in to save projects", {
            action: {
              label: "Sign in",
              onClick: login,
            },
          });
        }
        return;
      }

      if (widgets.length === 0) return;

      setIsSaving(true);
      const now = new Date().toISOString();
      const projectId = currentProjectId || crypto.randomUUID();

      const project: SavedFlowProject = {
        id: projectId,
        name: projectName,
        domain: activeDomain,
        createdAt: currentProjectId ? savedProjects.find((p) => p.id === currentProjectId)?.createdAt || now : now,
        updatedAt: now,
        widgets,
        edges,
        nodeOutputMap,
        mainPromptState,
        canvasTransform,
      };

      const updated = currentProjectId
        ? savedProjects.map((p) => (p.id === currentProjectId ? project : p))
        : [...savedProjects, project];

      const userKey = `${FLOW_PROJECTS_KEY}.${user.id}`;
      localStorage.setItem(userKey, JSON.stringify(updated));
      setSavedProjects(updated);
      setCurrentProjectId(projectId);
      setLastSaved(new Date());
      setIsSaving(false);

      if (!silent) {
        toast.success("Project saved");
      }
    },
    [
      user,
      widgets,
      edges,
      projectName,
      activeDomain,
      currentProjectId,
      savedProjects,
      canvasTransform,
      navigate,
      nodeOutputMap,
      mainPromptState,
      login,
    ],
  );

  // Auto-save
  useEffect(() => {
    if (viewMode !== "workspace" || !user || widgets.length === 0) return;
    const autoSaveInterval = setInterval(() => {
      saveCurrentProject(true);
    }, 30000);
    return () => clearInterval(autoSaveInterval);
  }, [viewMode, user, widgets, saveCurrentProject]);

  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (viewMode !== "workspace" || !user || widgets.length === 0) return;
    if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);
    autoSaveTimeoutRef.current = setTimeout(() => {
      saveCurrentProject(true);
    }, 5000);
    return () => {
      if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);
    };
  }, [widgets, edges, viewMode, user]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (user && widgets.length > 0 && viewMode === "workspace") {
        saveCurrentProject(true);
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [user, widgets, viewMode, saveCurrentProject]);

  // Load saved projects when user is available
  useEffect(() => {
    if (user) {
      const projects = loadSavedProjects(user.id);
      setSavedProjects(projects);
    } else {
      setSavedProjects([]);
    }
  }, [user]);

  const loadProject = (project: SavedFlowProject) => {
    setCurrentProjectId(project.id);
    setProjectName(project.name);
    setActiveDomain(project.domain as "Website" | "App" | "Game");
    setWidgets(project.widgets); // Load project widgets as-is, don't force prompt window
    setEdges(project.edges);
    if (project.nodeOutputMap) setNodeOutputMap(project.nodeOutputMap);
    if (project.mainPromptState) setMainPromptState(project.mainPromptState);
    if (project.canvasTransform) setCanvasTransform(project.canvasTransform);
    setViewMode("workspace");
  };

  const deleteProject = (projectId: string) => {
    if (!user) return;
    const updated = savedProjects.filter((p) => p.id !== projectId);
    const userKey = `${FLOW_PROJECTS_KEY}.${user.id}`;
    localStorage.setItem(userKey, JSON.stringify(updated));
    setSavedProjects(updated);
  };

  const createNewProject = () => {
    setCurrentProjectId(null);
    setProjectName("Untitled Project");
    setWidgets([]); // Start with empty workspace
    setEdges([]);
    setNodeOutputMap({});
    setMainPromptState({ sections: [], combinedPrompt: "" });
    setCanvasTransform({ translateX: 0, translateY: 0, scale: 1 });
  };

  const getMainPromptNodeId = (): string | null => {
    const promptNode = widgets.find((w) => w.isPromptNode);
    return promptNode ? promptNode.id : null;
  };

  const getUpstreamNodes = (nodeId: string, nodes: Widget[], edges: Edge[]): Widget[] => {
    const incomingEdges = edges.filter((e) => e.target === nodeId);
    const upstreamNodeIds = incomingEdges.map((e) => e.source);
    return nodes.filter((n) => upstreamNodeIds.includes(n.id));
  };

  const isConnectedToMain = (nodeId: string, mainNodeId: string | null, edges: Edge[]): boolean => {
    if (!mainNodeId) return false;
    return edges.some((e) => e.source === nodeId && e.target === mainNodeId);
  };

  const buildCombinedPrompt = (sections: MainPromptState["sections"]): string => {
    if (sections.length === 0) return "";
    const sortedSections = [...sections].sort((a, b) => a.order - b.order);
    return sortedSections.map((section) => `### ${section.title}\n\n${section.content}\n\n`).join("");
  };

  const buildPromptForPromptNode = useCallback(
    (promptNodeId: string, allWidgets: Widget[], allEdges: Edge[]): string => {
      // Special handling for "Step 7 - Prompt Structure" node (website-prompt-output)
      // This node should aggregate all website node data from GLOBAL STATE
      if (promptNodeId === "website-prompt-output" || 
          allWidgets.find(w => w.id === promptNodeId)?.title === "Step 7 – Prompt Structure") {
        const hasWebsiteSections = allWidgets.some((w) => w.type === "website-section" || w.type === "brandIdentity");
        if (hasWebsiteSections) {
          // Use global state to build spec
          const spec: WebsiteSpec = {};
          
          // Get data from global state
          if (nodeData.userInput) {
            spec.userInput = nodeData.userInput;
          }
          
          if (nodeData.brandIdentity) {
            spec.brandIdentity = {
              title: "Brand Identity",
              fields: {
                primaryColor: nodeData.brandIdentity.primaryColor || "",
                secondaryColor: nodeData.brandIdentity.secondaryColor || "",
                accentColor: nodeData.brandIdentity.accentColor || "",
                fontFamily: nodeData.brandIdentity.fontFamily || "",
                styleMood: nodeData.brandIdentity.styleMood || "",
                toneOfVoice: nodeData.brandIdentity.toneOfVoice || "",
              },
            };
          }
          
          if (nodeData.websitePurpose) {
            spec.websitePurpose = {
              title: "Website Purpose",
              fields: {
                problem: nodeData.websitePurpose.problem || "",
                targetAudience: nodeData.websitePurpose.targetAudience || "",
                goals: nodeData.websitePurpose.goals || "",
              },
            };
          }
          
          if (nodeData.seoStructure) {
            spec.seoStructure = {
              title: "SEO & Structure",
              fields: {
                keywords: nodeData.seoStructure.keywords || "",
                metaDescriptions: nodeData.seoStructure.metaDescriptions || "",
                pageStructure: nodeData.seoStructure.pageStructure || "",
              },
            };
          }
          
          if (nodeData.functionalRequirements) {
            spec.functionalRequirements = {
              title: "Functional Requirements",
              fields: {
                ctas: nodeData.functionalRequirements.ctas || "",
                animations: nodeData.functionalRequirements.animations || "",
                layouts: nodeData.functionalRequirements.layouts || "",
              },
            };
          }
          
          if (nodeData.contentInputs) {
            spec.contentInputs = {
              title: "Content Inputs",
              fields: {
                copy: nodeData.contentInputs.copy || "",
                offers: nodeData.contentInputs.offers || "",
                references: nodeData.contentInputs.references || "",
              },
            };
          }
          
          return generateWebsitePrompt(spec);
        }
      }

      // Default behavior: collect data from connected nodes via edges
      const incomingEdges = allEdges.filter((edge) => edge.target === promptNodeId);
      const connectedNodes = incomingEdges
        .map((edge) => allWidgets.find((widget) => widget.id === edge.source))
        .filter((widget): widget is Widget => Boolean(widget));

      const sortedNodes = [...connectedNodes].sort((a, b) => {
        if (a.x === b.x) return a.y - b.y;
        return a.x - b.x;
      });

      return sortedNodes
        .map((node) => {
          const title = node.title || "Untitled Node";
          const content = node.content || "";
          return `[${title}]\n${content}`.trimEnd();
        })
        .filter(Boolean)
        .join("\n\n");
    },
    [nodeData],
  );

  // Auto-update prompt nodes (including Step 7 - Prompt Structure)
  // REACTIVE: Updates whenever widgets, edges, OR global state changes
  useEffect(() => {
    const promptNodes = widgets.filter((widget) => widget.isPromptNode);
    const step7Node = widgets.find((w) => w.id === "website-prompt-output" || w.title === "Step 7 – Prompt Structure");
    
    // Include Step 7 node even if it doesn't have isPromptNode flag
    const nodesToUpdate = step7Node && !promptNodes.includes(step7Node) 
      ? [...promptNodes, step7Node]
      : promptNodes;
    
    if (nodesToUpdate.length === 0) return;

    let changed = false;
    const updatedWidgets = widgets.map((widget) => {
      const isPromptNode = widget.isPromptNode || widget.id === "website-prompt-output" || widget.title === "Step 7 – Prompt Structure";
      if (!isPromptNode) return widget;

      const builtPrompt = buildPromptForPromptNode(widget.id, widgets, edges);
      const finalContent = builtPrompt || PROMPT_PLACEHOLDER;

      if (widget.content === finalContent) return widget;
      changed = true;
      return { ...widget, content: finalContent };
    });

    if (changed) {
      setWidgets(updatedWidgets);
    }
  }, [widgets, edges, buildPromptForPromptNode, nodeData]); // Added nodeData dependency for reactivity

  // --- Content Generation Functions (Simplified for brevity) ---
  const generateIdeaSummary = (userInput: string) => ({ generatedText: "Summary...", jsonPayload: {} });
  const generateCleanSummary = (upstreamOutputs: NodeOutputMap) => ({ generatedText: "Clean...", jsonPayload: {} });
  const generatePageStructure = (upstreamOutputs: NodeOutputMap) => ({
    generatedText: "Structure...",
    jsonPayload: {},
  });
  const generateDesignSystem = (upstreamOutputs: NodeOutputMap) => ({ generatedText: "Design...", jsonPayload: {} });
  const generateSeoPlan = (upstreamOutputs: NodeOutputMap) => ({ generatedText: "SEO...", jsonPayload: {} });

  // --- Missing Helper Functions ---
  const updateWidget = (widgetId: string, field: string, value: any) => {
    setWidgets((prev) => {
      const updated = prev.map((w) => (w.id === widgetId ? { ...w, [field]: value } : w));
      const widget = updated.find(w => w.id === widgetId);
      
      // BROADCAST TO GLOBAL STATE - Flowise-like node communication
      if (widget) {
        // Update global state based on node type and field
        if (widgetId === "website-user-input" && field === "content") {
          updateNodeData(widgetId, { userInput: value });
        } else if (widgetId === "website-brand-identity" && field === "brandIdentityData") {
          if (value?.fields) {
            updateNodeData(widgetId, {
              brandIdentity: {
                primaryColor: value.fields.primaryColor || "",
                secondaryColor: value.fields.secondaryColor || "",
                accentColor: value.fields.accentColor || "",
                fontFamily: value.fields.fontFamily || "",
                styleMood: value.fields.styleMood || "",
                toneOfVoice: value.fields.toneOfVoice || "",
              },
            });
          }
        } else if (widget.type === "website-section" && field === "websiteData") {
          if (value?.fields) {
            if (widgetId === "website-purpose") {
              updateNodeData(widgetId, {
                websitePurpose: {
                  problem: value.fields.problem || "",
                  targetAudience: value.fields.targetAudience || "",
                  goals: value.fields.goals || "",
                },
              });
            } else if (widgetId === "website-seo-structure") {
              updateNodeData(widgetId, {
                seoStructure: {
                  keywords: value.fields.keywords || "",
                  metaDescriptions: value.fields.metaDescriptions || "",
                  pageStructure: value.fields.pageStructure || "",
                },
              });
            } else if (widgetId === "website-functional-requirements") {
              updateNodeData(widgetId, {
                functionalRequirements: {
                  ctas: value.fields.ctas || "",
                  animations: value.fields.animations || "",
                  layouts: value.fields.layouts || "",
                },
              });
            } else if (widgetId === "website-content-inputs") {
              updateNodeData(widgetId, {
                contentInputs: {
                  copy: value.fields.copy || "",
                  offers: value.fields.offers || "",
                  references: value.fields.references || "",
                },
              });
            }
          }
        }
      }
      
      return updated;
    });
  };

  // SYNC WIDGETS TO GLOBAL STATE - Initialize global state from loaded widgets
  useEffect(() => {
    widgets.forEach((widget) => {
      if (widget.id === "website-user-input" && widget.content) {
        updateNodeData(widget.id, { userInput: widget.content });
      } else if (widget.id === "website-brand-identity" && widget.brandIdentityData?.fields) {
        updateNodeData(widget.id, {
          brandIdentity: {
            primaryColor: widget.brandIdentityData.fields.primaryColor || "",
            secondaryColor: widget.brandIdentityData.fields.secondaryColor || "",
            accentColor: widget.brandIdentityData.fields.accentColor || "",
            fontFamily: widget.brandIdentityData.fields.fontFamily || "",
            styleMood: widget.brandIdentityData.fields.styleMood || "",
            toneOfVoice: widget.brandIdentityData.fields.toneOfVoice || "",
          },
        });
      } else if (widget.type === "website-section" && widget.websiteData?.fields) {
        if (widget.id === "website-purpose") {
          updateNodeData(widget.id, {
            websitePurpose: {
              problem: widget.websiteData.fields.problem || "",
              targetAudience: widget.websiteData.fields.targetAudience || "",
              goals: widget.websiteData.fields.goals || "",
            },
          });
        } else if (widget.id === "website-seo-structure") {
          updateNodeData(widget.id, {
            seoStructure: {
              keywords: widget.websiteData.fields.keywords || "",
              metaDescriptions: widget.websiteData.fields.metaDescriptions || "",
              pageStructure: widget.websiteData.fields.pageStructure || "",
            },
          });
        } else if (widget.id === "website-functional-requirements") {
          updateNodeData(widget.id, {
            functionalRequirements: {
              ctas: widget.websiteData.fields.ctas || "",
              animations: widget.websiteData.fields.animations || "",
              layouts: widget.websiteData.fields.layouts || "",
            },
          });
        } else if (widget.id === "website-content-inputs") {
          updateNodeData(widget.id, {
            contentInputs: {
              copy: widget.websiteData.fields.copy || "",
              offers: widget.websiteData.fields.offers || "",
              references: widget.websiteData.fields.references || "",
            },
          });
        }
      }
    });
  }, []); // Only run once on mount to initialize from loaded widgets

  // AUTO-UPDATE PROMPT NODE: Update Step 7 (website-prompt-output) when any website node content changes
  useEffect(() => {
    // Check if we have website flow nodes
    const hasWebsiteSections = widgets.some(
      (w) => w.type === "website-section" || w.type === "brandIdentity" || w.id === "website-user-input"
    );
    
    if (!hasWebsiteSections) return;
    
    // Find the prompt output node (Step 7)
    const promptOutputNode = widgets.find((w) => w.id === "website-prompt-output");
    if (!promptOutputNode) return;
    
    // Build the website spec from current widgets and generate prompt
    const spec = buildWebsiteSpec(widgets);
    const generatedPrompt = generateWebsitePrompt(spec);
    
    // Only update if the prompt has changed
    if (promptOutputNode.content !== generatedPrompt) {
      setWidgets((prev) =>
        prev.map((w) =>
          w.id === "website-prompt-output"
            ? { ...w, content: generatedPrompt }
            : w
        )
      );
    }
  }, [
    // Watch specific fields that affect prompt generation
    widgets.find((w) => w.id === "website-user-input")?.content,
    widgets.find((w) => w.id === "website-brand-identity")?.brandIdentityData,
    widgets.find((w) => w.id === "website-purpose")?.websiteData,
    widgets.find((w) => w.id === "website-seo-structure")?.websiteData,
    widgets.find((w) => w.id === "website-functional-requirements")?.websiteData,
    widgets.find((w) => w.id === "website-content-inputs")?.websiteData,
  ]);

  // Handler for resizing nodes using ResizableNode component
  const onResizeNode = useCallback((id: string, width: number, height: number) => {
    setWidgets((prev) =>
      prev.map((widget) =>
        widget.id === id
          ? {
              ...widget,
              width,
              height,
            }
          : widget
      )
    );
  }, []);

  const handleResizeNode = useCallback((id: string, width: number, height: number) => {
    setWidgets((prev) =>
      prev.map((w) =>
        w.id === id
          ? {
              ...w,
              width,
              height,
            }
          : w
      )
    );
  }, []);

  // Fit view to show all nodes (auto-layout helper)
  const fitViewToNodes = useCallback((nodesToFit: Widget[]) => {
    if (nodesToFit.length === 0) return;
    
    // Calculate bounding box
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    
    nodesToFit.forEach((node) => {
      minX = Math.min(minX, node.x);
      minY = Math.min(minY, node.y);
      maxX = Math.max(maxX, node.x + (node.width || 320));
      maxY = Math.max(maxY, node.y + (node.height || 280));
    });
    
    const width = maxX - minX;
    const height = maxY - minY;
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    
    // Get viewport dimensions
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Calculate scale to fit with padding
    const padding = 0.15; // Smaller padding so initial view is closer to nodes
    const scaleX = (viewportWidth * (1 - padding * 2)) / width;
    const scaleY = (viewportHeight * (1 - padding * 2)) / height;
    const desiredScale = Math.min(scaleX, scaleY);
    // Allow a modest zoom-in for small templates but keep within the global zoom range
    const scale = Math.max(0.25, Math.min(desiredScale, 1.35));
    
    // Center the view
    const translateX = viewportWidth / 2 - centerX * scale;
    const translateY = viewportHeight / 2 - centerY * scale;
    
    setCanvasTransform({
      translateX,
      translateY,
      scale,
    });
  }, []);

  const handleCategoryAdd = (category: Category) => {
    const newWidget: Widget = {
      id: `cat-${category.id}-${Date.now()}`,
      type: "category",
      category,
      title: category.name,
      content: "",
      x: 100 + Math.random() * 200,
      y: 100 + Math.random() * 200,
      width: 280,
      height: 200,
    };
    setWidgets((prev) => [...prev, newWidget]);
  };

  const handleAddPromptWindow = () => {
    if (widgets.some((w) => w.type === "prompt-window")) {
      toast.info("Prompt Window is already in this workspace");
      return;
    }

    const newWidget = createPromptWindowWidget(widgets);
    setWidgets((prev) => [...prev, newWidget]);
    toast.success("Prompt Window Added");
  };

  const handleAddPromptScanner = () => {
    if (widgets.some((w) => w.type === "prompt-scanner")) {
      toast.info("Prompt Scanner is already in this workspace");
      return;
    }

    const newWidget = createPromptScannerWidget(widgets);
    setWidgets((prev) => [...prev, newWidget]);
    toast.success("Prompt Scanner Added");
  };

  const handleAddPromptLibrary = () => {
    if (widgets.some((w) => w.type === "prompt-library")) {
      toast.info("Prompt Library is already in this workspace");
      return;
    }

    const newWidget = createPromptLibraryWidget(widgets);
    setWidgets((prev) => [...prev, newWidget]);
    toast.success("Prompt Library Added");
  };

  const handleCopyPrompt = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast.success("Prompt copied to clipboard");
      })
      .catch(() => {
        toast.error("Failed to copy");
      });
  };

  const refreshPromptNode = (promptNodeId: string) => {
    const builtPrompt = buildPromptForPromptNode(promptNodeId, widgets, edges);
    const finalContent = builtPrompt || PROMPT_PLACEHOLDER;

    setWidgets((prev) => prev.map((widget) => (widget.id === promptNodeId ? { ...widget, content: finalContent } : widget)));
  };

  // --- Helper Functions for Button Zoom ---
  const handleZoomIn = () => {
    setCanvasTransform((prev) => ({
      ...prev,
      scale: Math.min(2.0, prev.scale + 0.25),
    }));
  };

  const handleZoomOut = () => {
    setCanvasTransform((prev) => ({
      ...prev,
      scale: Math.max(0.25, prev.scale - 0.25),
    }));
  };

  // --- Flow Preset Creators ---
  const createWebsiteFlowPreset = () => {
    // Simple linear pipeline layout with proper spacing
    const startX = -200; // Shift slightly left so the pipeline is centered
    const startY = 40; // A bit below the very top
    const horizontalGap = 380; // MORE space between steps
    const outputRowOffset = 340; // MORE vertical space between rows

    const nodes: Widget[] = [
      // Main pipeline row
      {
        id: "website-user-input",
        type: "flow-input",
        title: "Step 1 – User Input",
        placeholder: "Describe the website / client / product...",
        x: startX,
        y: startY,
        width: 320,
        height: 200,
        content: "",
      },
      {
        id: "website-brand-identity",
        type: "brandIdentity",
        title: "Step 2 – Brand Identity",
        x: startX + horizontalGap * 1,
        y: startY,
        width: 360,
        height: 400,
        brandIdentityData: {
          title: "Brand Identity",
          fields: {
            primaryColor: "#3B82F6",
            secondaryColor: "#0F172A",
            accentColor: "#F97316",
            fontFamily: AVAILABLE_FONTS[0].value,
            styleMood: "",
            toneOfVoice: "",
          },
        },
      },
      {
        id: "website-purpose",
        type: "website-section",
        title: "Step 3 – Website Purpose",
        x: startX + horizontalGap * 2,
        y: startY,
        width: 320,
        height: 280,
        websiteData: {
          title: "Website Purpose",
          fields: {
            problem: "",
            targetAudience: "",
            goals: "",
          },
        },
      },
      {
        id: "website-seo-structure",
        type: "website-section",
        title: "Step 4 – SEO & Structure",
        x: startX + horizontalGap * 3,
        y: startY,
        width: 320,
        height: 280,
        websiteData: {
          title: "SEO & Structure",
          fields: {
            keywords: "",
            metaDescriptions: "",
            pageStructure: "",
          },
        },
      },
      {
        id: "website-functional-requirements",
        type: "website-section",
        title: "Step 5 – Functional Requirements",
        x: startX + horizontalGap * 4,
        y: startY,
        width: 320,
        height: 280,
        websiteData: {
          title: "Functional Requirements",
          fields: {
            ctas: "",
            animations: "",
            layouts: "",
          },
        },
      },
      {
        id: "website-content-inputs",
        type: "website-section",
        title: "Step 6 – Content Inputs",
        x: startX + horizontalGap * 5,
        y: startY,
        width: 320,
        height: 280,
        websiteData: {
          title: "Content Inputs",
          fields: {
            copy: "",
            offers: "",
            references: "",
          },
        },
      },

      // Output row (below the main pipeline, clearly separated)
      {
        id: "website-prompt-output",
        type: "flow-text-gen",
        title: "Step 7 – Prompt Structure",
        x: startX + horizontalGap * 2,
        y: startY + outputRowOffset,
        width: 400,
        height: 600,
        content: PROMPT_PLACEHOLDER,
        isPromptNode: true,
      },
      {
        id: "website-prompt-window",
        type: "prompt-window",
        title: "Step 8 – Final Website Prompt",
        x: startX + horizontalGap * 4,
        y: startY + outputRowOffset,
        width: 400,
        height: 600,
        content: "",
        promptMode: "preview",
      },
    ];

    // Simple linear pipeline edges
    const edges: Edge[] = [
      {
        id: "e-1-user-to-brand",
        source: "website-user-input",
        target: "website-brand-identity",
      },
      {
        id: "e-2-brand-to-purpose",
        source: "website-brand-identity",
        target: "website-purpose",
      },
      {
        id: "e-3-purpose-to-seo",
        source: "website-purpose",
        target: "website-seo-structure",
      },
      {
        id: "e-4-seo-to-functional",
        source: "website-seo-structure",
        target: "website-functional-requirements",
      },
      {
        id: "e-5-functional-to-content",
        source: "website-functional-requirements",
        target: "website-content-inputs",
      },
      {
        id: "e-6-content-to-output",
        source: "website-content-inputs",
        target: "website-prompt-output",
      },
      {
        id: "e-7-output-to-window",
        source: "website-prompt-output",
        target: "website-prompt-window",
      },
    ];

    return { nodes, edges };
  };

  const createAppFlowPreset = () => {
    const nodes: Widget[] = [
      {
        id: "flow-input-1",
        type: "flow-input",
        title: "App Idea",
        x: 50,
        y: 200,
        width: 200,
        height: 120,
        content: "",
      },
      { id: "flow-text-1", type: "flow-text-gen", title: "Features", x: 300, y: 100, width: 220, height: 150 },
      { id: "flow-text-2", type: "flow-text-gen", title: "Tech Stack", x: 300, y: 300, width: 220, height: 150 },
      {
        id: "flow-text-final",
        type: "flow-text-gen",
        title: "Prompt Output",
        x: 600,
        y: 200,
        width: 260,
        height: 200,
        content: PROMPT_PLACEHOLDER,
        isPromptNode: true,
      },
    ];
    const edges: Edge[] = [
      { id: "e1", source: "flow-input-1", target: "flow-text-1" },
      { id: "e2", source: "flow-input-1", target: "flow-text-2" },
      { id: "e3", source: "flow-text-1", target: "flow-text-final" },
      { id: "e4", source: "flow-text-2", target: "flow-text-final" },
    ];
    return { nodes, edges };
  };

  const createGameFlowPreset = () => {
    const nodes: Widget[] = [
      {
        id: "flow-input-1",
        type: "flow-input",
        title: "Game Concept",
        x: 50,
        y: 200,
        width: 200,
        height: 120,
        content: "",
      },
      { id: "flow-text-1", type: "flow-text-gen", title: "Mechanics", x: 300, y: 100, width: 220, height: 150 },
      { id: "flow-text-2", type: "flow-text-gen", title: "Art Style", x: 300, y: 300, width: 220, height: 150 },
      {
        id: "flow-text-final",
        type: "flow-text-gen",
        title: "Prompt Output",
        x: 600,
        y: 200,
        width: 260,
        height: 200,
        content: PROMPT_PLACEHOLDER,
        isPromptNode: true,
      },
    ];
    const edges: Edge[] = [
      { id: "e1", source: "flow-input-1", target: "flow-text-1" },
      { id: "e2", source: "flow-input-1", target: "flow-text-2" },
      { id: "e3", source: "flow-text-1", target: "flow-text-final" },
      { id: "e4", source: "flow-text-2", target: "flow-text-final" },
    ];
    return { nodes, edges };
  };

  const handleCreateWebsiteFlowPreset = () => handleLoadTemplate("Website");
  const handleCreateAppFlowPreset = () => handleLoadTemplate("App");
  const handleCreateGameFlowPreset = () => handleLoadTemplate("Game");

  const handleCreateLoginFlowTemplate = () => {
    const nodes: Widget[] = [
      {
        id: "flow-input-1",
        type: "flow-input",
        title: "User Credentials",
        x: 50,
        y: 200,
        width: 200,
        height: 120,
        content: "",
      },
      { id: "flow-agent-1", type: "flow-agent", title: "Auth Agent", x: 300, y: 200, width: 220, height: 150 },
      { id: "flow-state-1", type: "flow-state", title: "Session State", x: 550, y: 200, width: 200, height: 120 },
    ];
    const edges: Edge[] = [
      { id: "e1", source: "flow-input-1", target: "flow-agent-1" },
      { id: "e2", source: "flow-agent-1", target: "flow-state-1" },
    ];
    // For manual additions, we can just set them, or use the generator to be safe
    // For simplicity, manual additions replace for now as per original logic,
    // BUT the user asked for templates to add. These are "templates" too technically.
    // Let's use the generator for these too to be consistent.
    const { newNodes, newEdges } = generateUniqueNodesAndEdges(nodes, edges, widgets);
    setWidgets((prev) => [...prev, ...newNodes]);
    setEdges((prev) => [...prev, ...newEdges]);
    toast.success("Login Flow added");
  };

  const handleCreateFeedbackFlowTemplate = () => {
    const nodes: Widget[] = [
      {
        id: "flow-input-1",
        type: "flow-input",
        title: "User Feedback",
        x: 50,
        y: 200,
        width: 200,
        height: 120,
        content: "",
      },
      {
        id: "flow-text-1",
        type: "flow-text-gen",
        title: "Sentiment Analysis",
        x: 300,
        y: 200,
        width: 220,
        height: 150,
      },
      { id: "flow-state-1", type: "flow-state", title: "Save Result", x: 550, y: 200, width: 200, height: 120 },
    ];
    const edges: Edge[] = [
      { id: "e1", source: "flow-input-1", target: "flow-text-1" },
      { id: "e2", source: "flow-text-1", target: "flow-state-1" },
    ];
    const { newNodes, newEdges } = generateUniqueNodesAndEdges(nodes, edges, widgets);
    setWidgets((prev) => [...prev, ...newNodes]);
    setEdges((prev) => [...prev, ...newEdges]);
    toast.success("Feedback Loop added");
  };

  // --- Canvas Logic ---
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(".widget-container, button, input, textarea, .pointer-events-auto")) return;

    if (e.button === 0 && !dragging && !resizing) {
      e.preventDefault();

      // LOGIC SWITCH BASED ON TOOL
      if (activeTool === "hand" || isSpacePressed) {
        // Pan Mode
        setPanning({
          startX: e.clientX,
          startY: e.clientY,
          startTranslateX: canvasTransform.translateX,
          startTranslateY: canvasTransform.translateY,
        });
      } else if (activeTool === "text") {
        // Text Create Mode
        const canvasX =
          (e.clientX - canvasRef.current!.getBoundingClientRect().left - canvasTransform.translateX) /
          canvasTransform.scale;
        const canvasY =
          (e.clientY - canvasRef.current!.getBoundingClientRect().top - canvasTransform.translateY) /
          canvasTransform.scale;

        const newTextWidget: Widget = {
          id: `text-${Date.now()}`,
          type: "text",
          x: canvasX,
          y: canvasY,
          width: 200,
          height: 50,
          content: "Text",
          style: { ...textToolSettings },
        };

        setWidgets((prev) => [...prev, newTextWidget]);
        // Switch back to select tool after creating text (optional, but common)
        // setActiveTool("select");
      } else {
        // Box Selection Mode (Select Tool)
        setSelectionBox({
          startX: e.clientX,
          startY: e.clientY,
          currentX: e.clientX,
          currentY: e.clientY,
        });

        if (!e.shiftKey) {
          setSelectedWidgetIds(new Set());
        }
      }
    }

    // Middle mouse pan
    if (e.button === 1) {
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
    if ((e.target as HTMLElement).closest(".widget-container, .custom-scrollbar, textarea, input")) return;

    e.preventDefault();
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (e.shiftKey) {
      setCanvasTransform((prev) => ({ ...prev, translateX: prev.translateX - e.deltaY * 0.5 }));
      return;
    }
    if (e.altKey) {
      setCanvasTransform((prev) => ({ ...prev, translateY: prev.translateY - e.deltaY * 0.5 }));
      return;
    }

    const zoomSpeed = 0.1;
    const zoomFactor = e.deltaY > 0 ? 1 - zoomSpeed : 1 + zoomSpeed;
    const newScale = Math.max(0.25, Math.min(2.0, canvasTransform.scale * zoomFactor));
    const canvasX = (mouseX - canvasTransform.translateX) / canvasTransform.scale;
    const canvasY = (mouseY - canvasTransform.translateY) / canvasTransform.scale;
    const newTranslateX = mouseX - canvasX * newScale;
    const newTranslateY = mouseY - canvasY * newScale;

    setCanvasTransform({ translateX: newTranslateX, translateY: newTranslateY, scale: newScale });
  };

  // --- Drag/Resize/Move Logic ---
  const handleMouseDown = (e: React.MouseEvent, widgetId: string, action: "move" | "resize") => {
    // Don't handle if clicking on interactive elements or connection handles
    if ((e.target as HTMLElement).closest("textarea, input, button, .flow-handle")) return;
    e.stopPropagation();

    // Prevent dragging if in Hand or Text mode
    if (activeTool !== "select") return;

    // Handle Selection on click
    if (action === "move") {
      if (e.shiftKey) {
        // Toggle selection
        setSelectedWidgetIds((prev) => {
          const next = new Set(prev);
          if (next.has(widgetId)) next.delete(widgetId);
          else next.add(widgetId);
          return next;
        });
      } else {
        // If not holding shift and widget is not already selected, select only this one
        if (!selectedWidgetIds.has(widgetId)) {
          setSelectedWidgetIds(new Set([widgetId]));
        }
      }
    }

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
      setLastDragPos({ x: e.clientX, y: e.clientY });
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
        } else if (selectionBox) {
          // Update selection box dimensions
          setSelectionBox((prev) =>
            prev
              ? {
                  ...prev,
                  currentX: e.clientX,
                  currentY: e.clientY,
                }
              : null,
          );
        } else if (connecting || draggingHandle) {
          // Update mouse position for connection line when dragging from handle
          const canvasX = (e.clientX - canvasTransform.translateX) / canvasTransform.scale;
          const canvasY = (e.clientY - canvasTransform.translateY) / canvasTransform.scale;
          setMousePosition({ x: canvasX, y: canvasY });

          if (draggingHandle) {
            // Check if dragged far enough from handle to disconnect
            const handlePos = getHandlePosition(draggingHandle.nodeId, draggingHandle.handleType, widgets);
          const distance = Math.sqrt(Math.pow(canvasX - handlePos.x, 2) + Math.pow(canvasY - handlePos.y, 2));

          // If dragged more than 50px away, disconnect (will be finalized on mouse up)
          // Visual feedback: show disconnection state
          }
        } else if (dragging && lastDragPos && activeTool === "select") {
          // Calculate delta movement
          const dx = (e.clientX - lastDragPos.x) / canvasTransform.scale;
          const dy = (e.clientY - lastDragPos.y) / canvasTransform.scale;

          setLastDragPos({ x: e.clientX, y: e.clientY });

          // Move all selected widgets
          setWidgets((prev) =>
            prev.map((w) => {
              if (selectedWidgetIds.has(w.id) || w.id === dragging.id) {
                return { ...w, x: w.x + dx, y: w.y + dy };
              }
              return w;
            }),
          );
        } else if (resizing) {
          const deltaX = (e.clientX - resizing.startX) / canvasTransform.scale;
          const deltaY = (e.clientY - resizing.startY) / canvasTransform.scale;

          setWidgets((prev) =>
            prev.map((w) =>
              w.id === resizing.id
                ? {
                    ...w,
                    width: Math.max(100, resizing.startWidth + deltaX),
                    height: Math.max(30, resizing.startHeight + deltaY),
                  }
                : w,
            ),
          );
        }
      });
    };

    const handleMouseUp = (e: MouseEvent) => {
      // Handle Selection Box Finalization
      if (selectionBox) {
        // Calculate box in canvas coordinates
        const rect = {
          x: Math.min(selectionBox.startX, selectionBox.currentX),
          y: Math.min(selectionBox.startY, selectionBox.currentY),
          w: Math.abs(selectionBox.currentX - selectionBox.startX),
          h: Math.abs(selectionBox.currentY - selectionBox.startY),
        };

        // Check intersection with all widgets
        const newSelected = new Set(selectedWidgetIds);

        widgets.forEach((w) => {
          // Convert widget position to screen space to check intersection
          const screenX = w.x * canvasTransform.scale + canvasTransform.translateX;
          const screenY = w.y * canvasTransform.scale + canvasTransform.translateY;
          const screenW = w.width * canvasTransform.scale;
          const screenH = w.height * canvasTransform.scale;

          // Check AABB intersection
          if (
            rect.x < screenX + screenW &&
            rect.x + rect.w > screenX &&
            rect.y < screenY + screenH &&
            rect.y + rect.h > screenY
          ) {
            newSelected.add(w.id);
          }
        });

        setSelectedWidgetIds(newSelected);
        setSelectionBox(null);
      }

      // Check if handle was dragged away to disconnect
      if (draggingHandle) {
        const handlePos = getHandlePosition(draggingHandle.nodeId, draggingHandle.handleType, widgets);

        const canvasX = (draggingHandle.startX - canvasTransform.translateX) / canvasTransform.scale;
        const canvasY = (draggingHandle.startY - canvasTransform.translateY) / canvasTransform.scale;

        // Use the passed event `e` instead of window.event
        const endX = (e.clientX - canvasTransform.translateX) / canvasTransform.scale;
        const endY = (e.clientY - canvasTransform.translateY) / canvasTransform.scale;

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

      // Cancel connection if mouse is released without connecting
      if (connecting) {
        setConnecting(null);
        setMousePosition(null);
      }

      setDragging(null);
      setLastDragPos(null);
      setResizing(null);
      setPanning(null);
    };

    if (panning || dragging || resizing || draggingHandle || selectionBox || connecting) {
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
    canvasTransform.scale,
    canvasTransform.translateX,
    canvasTransform.translateY,
    selectionBox,
    draggingHandle,
    widgets,
    selectedWidgetIds,
    lastDragPos,
    activeTool,
  ]);

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

    // Calculate initial mouse position in canvas coordinates
    const canvasX = (e.clientX - canvasTransform.translateX) / canvasTransform.scale;
    const canvasY = (e.clientY - canvasTransform.translateY) / canvasTransform.scale;
    setMousePosition({ x: canvasX, y: canvasY });

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
      setMousePosition(null);
    }
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    // Cancel connection if clicking on canvas (but not on handles or widgets)
    const target = e.target as HTMLElement;
    if (connecting && !target.closest(".flow-handle, .widget-container")) {
      setConnecting(null);
      setMousePosition(null);
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

    // For prompt window, prompt scanner, and prompt library, balls are centered on the edge (half outside, half inside)
    // For other nodes, balls are positioned at -7px from edge (half of 14px ball diameter)
    if (widget.type === "prompt-window" || widget.type === "prompt-scanner" || widget.type === "prompt-library") {
      const handleX = handleType === "input" ? widget.x : widget.x + widget.width;
    return { x: handleX, y: handleY };
    } else {
      const handleX = handleType === "input" ? widget.x - 7 : widget.x + widget.width + 7;
      return { x: handleX, y: handleY };
    }
  };

  // --- RENDER ---
  return (
    <div className="h-screen bg-black text-neutral-200 relative flex flex-col font-sans overflow-hidden selection:bg-neutral-800 selection:text-white">
      <AnimatePresence mode="wait">
        {viewMode === "landing" ? (
          // --- LANDING VIEW ---
          <motion.main
            key="landing"
            exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
            className="flex-1 flex flex-col min-h-screen overflow-y-auto relative"
          >
            {/* Home Button - Top Left */}
            <button
              onClick={() => {
                if (onBack) onBack();
                else navigate("/");
              }}
              className="absolute top-6 left-6 p-2 rounded-full bg-neutral-900/50 backdrop-blur-md border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all flex items-center gap-2 font-sans z-50"
            >
              <Home size={20} />
              <span className="text-sm font-medium pr-1">Home</span>
            </button>

            {/* Login/New Project Button - Top Right */}
            {user ? (
              <button
                onClick={createNewProject}
                className="absolute top-6 right-6 p-2 rounded-full bg-neutral-900/50 backdrop-blur-md border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all flex items-center gap-2 font-sans z-50"
              >
                <Plus size={20} />
                <span className="text-sm font-medium pr-1">Project</span>
              </button>
            ) : (
              <button
                onClick={login}
                className="absolute top-6 right-6 p-2 rounded-full bg-neutral-900/50 backdrop-blur-md border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all flex items-center gap-2 font-sans z-50"
              >
                <LogIn size={20} />
                <span className="text-sm font-medium pr-1">Sign in</span>
              </button>
            )}

            {/* Main Content Container - Centered with max-width */}
            <div className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="flex flex-col gap-8"
              >
                {/* 1. Beymflow Brand Section */}
                <div className="flex items-center justify-center gap-0 mt-4 mb-3 w-full max-w-3xl mx-auto">
                  <img
                    src="/images/BeymflowlogoREAL.png"
                    alt="Beymflow Logo"
                    className="h-20 w-auto object-contain -ml-2"
                  />
                  <span className="text-white font-semibold text-4xl -ml-1">
                    Beymflow
                  </span>
                </div>

                {/* 2. Prompt Input Section */}
                <div className="w-full max-w-4xl mx-auto">
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
                      className={cn(
                        "relative bg-transparent rounded-[2rem] px-3 sm:px-4 border border-white/10 transition-all duration-300",
                        selectedMode ? "py-4 flex flex-col gap-2" : "py-3 flex items-start gap-2 sm:gap-3"
                      )}
                      ref={landingChatContainerRef}
                    >
                      {/* SINGLE MODE CHIP – only visible if a mode is selected */}
                      {selectedMode && (
                        <div className="flex items-center">
                          {MODES.filter((m) => m.id === selectedMode).map((mode) => {
                            const Icon = mode.icon;
                            return (
                              <div
                                key={mode.id}
                                className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 bg-white/10 text-white/90 border border-white/10 text-xs md:text-sm"
                              >
                                <Icon className="w-4 h-4" />
                                <span>{mode.label}</span>
                                {/* X BUTTON TO REMOVE MODE */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedMode(null);
                                    setActiveDomain("Website"); // Reset to default
                                    setLandingChatInput(""); // Clear input when mode is removed
                                  }}
                                  className="ml-2 flex items-center justify-center w-4 h-4 text-white/70 hover:text-white/90 transition"
                                >
                                  ×
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* BOTTOM ROW: INPUT */}
                      <div className="flex items-start gap-2 sm:gap-3 w-full">
                        <div className="pt-2 relative">
                          <button
                            type="button"
                            onClick={() => setShowProjectsDropdown(!showProjectsDropdown)}
                            className="flex-shrink-0 rounded-full bg-white/5 backdrop-blur-md border border-white/20 text-white/70 hover:border-white/30 hover:text-white hover:bg-white/10 transition-all duration-300 h-8 w-8 flex items-center justify-center p-0"
                          >
                            <Paperclip className="w-4 h-4" />
                          </button>
                          
                          {/* Projects Dropdown */}
                          {showProjectsDropdown && (
                            <>
                              <div 
                                className="fixed inset-0 z-40" 
                                onClick={() => setShowProjectsDropdown(false)}
                              />
                              <div className="absolute top-full left-0 mt-2 bg-black rounded-xl p-2 min-w-[180px] z-50 max-h-96 overflow-y-auto border border-white/10">
                                {savedProjects.length > 0 ? (
                                  <div className="space-y-1">
                                    {savedProjects.map((project) => (
                                      <button
                                        key={project.id}
                                        onClick={() => {
                                          setReferenceProject(project);
                                          setCurrentProjectId(project.id);
                                          setProjectName(project.name);
                                          setActiveDomain(project.domain as "Website" | "App" | "Game");
                                          const modeMap: Record<"Website" | "App" | "Game", "website" | "app" | "game"> = {
                                            Website: "website",
                                            App: "app",
                                            Game: "game",
                                          };
                                          setSelectedMode(modeMap[project.domain]);
                                          setWidgets(project.widgets);
                                          setEdges(project.edges);
                                          if (project.nodeOutputMap) setNodeOutputMap(project.nodeOutputMap);
                                          if (project.mainPromptState) setMainPromptState(project.mainPromptState);
                                          if (project.canvasTransform) setCanvasTransform(project.canvasTransform);
                                          setShowProjectsDropdown(false);
                                        }}
                                        className="w-full text-left flex items-center gap-3 px-3 py-2 text-white rounded-lg cursor-pointer transition-all duration-300 hover:scale-105 group"
                                      >
                                        <FolderKanban className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                                        <span className="transition-all duration-300 group-hover:font-semibold truncate">{project.name}</span>
                                      </button>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="px-3 py-2 text-sm text-white/50">
                                    No projects yet
                                  </div>
                                )}
                              </div>
                            </>
                          )}
                        </div>

                        {/* Text Input */}
                        <div className="relative flex-1 min-w-0">
                          {!landingChatInput && !landingIsFocused && (
                            <div className="absolute inset-0 flex items-center pointer-events-none z-0">
                              <span className="text-sm sm:text-base text-white/50 leading-relaxed">
                                {landingDisplayedText}
                                {landingShowCursor && <span className="inline-block w-0.5 h-4 bg-white/50 ml-1 animate-pulse" />}
                              </span>
                            </div>
                          )}
                          <textarea
                            ref={landingChatTextareaRef}
                            value={landingChatInput}
                            onChange={(e) => setLandingChatInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                if (!isLoading && landingChatInput.trim()) {
                                  handleGenerateTemplateFromInput(landingChatInput.trim());
                                }
                              }
                            }}
                            onFocus={() => setLandingIsFocused(true)}
                            onBlur={() => setLandingIsFocused(false)}
                            placeholder=""
                            rows={1}
                            className="w-full bg-transparent border-none outline-none text-sm sm:text-base text-white placeholder:text-white/50 resize-none overflow-hidden py-2 leading-relaxed text-left"
                            style={{ minHeight: "24px", maxHeight: "200px" }}
                            maxLength={2000}
                          />
                        </div>

                        {/* Send Button */}
                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={() => {
                              if (!isLoading && landingChatInput.trim()) {
                                handleGenerateTemplateFromInput(landingChatInput.trim());
                              }
                            }}
                            disabled={isLoading || !landingChatInput.trim()}
                            className="flex-shrink-0 rounded-full bg-white/5 backdrop-blur-md border border-white/20 text-white/70 hover:border-white/30 hover:text-white hover:bg-white/10 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed h-8 w-8 flex items-center justify-center p-0"
                          >
                            {isLoading ? (
                              <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            ) : (
                              <SquareStack className="w-4 h-4 sm:w-5 sm:h-5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Bottom Mode Buttons - Outside but linked to the same state */}
                <div className="mt-6 flex items-center justify-center gap-4">
                  {MODES.map((mode) => {
                    const Icon = mode.icon;
                    return (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => {
                          const domainMap: Record<"website" | "app" | "game", "Website" | "App" | "Game"> = {
                            website: "Website",
                            app: "App",
                            game: "Game",
                          };
                          setSelectedMode(mode.id as Exclude<ModeId, null>);
                          setActiveDomain(domainMap[mode.id]);
                          setLandingChatInput(""); // Clear input when mode changes
                        }}
                        disabled={isLoading}
                        className="flex items-center gap-2 rounded-full px-6 py-2 text-sm bg-white/5 border border-white/15 hover:bg-white/10 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Icon className="w-4 h-4 text-white/70" />
                        <span className="text-white/70">{mode.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* 4. Tabs (My Projects / Templates) */}
                <div className="flex items-center justify-center gap-6 pb-2 relative">
                  <button
                    ref={projectsTabRef}
                    onClick={(e) => {
                      e.preventDefault();
                      setLandingTab("projects");
                      if (projectsTabRef.current) {
                        setActiveTabWidth(projectsTabRef.current.offsetWidth);
                      }
                    }}
                    className={`pb-2 px-2 text-sm font-medium transition-colors relative ${
                      landingTab === "projects" ? "text-white" : "text-neutral-500 hover:text-neutral-300"
                    }`}
                  >
                    My Projects
                    {landingTab === "projects" && (
                      <motion.div 
                        layoutId="activeTab" 
                        initial={false}
                        transition={{ 
                          type: "spring", 
                          stiffness: 500, 
                          damping: 30,
                          mass: 0.5
                        }}
                        className="absolute bottom-0 left-0 h-0.5 bg-cyan-500"
                        style={{ width: activeTabWidth || "auto" }}
                      />
                    )}
                  </button>
                  <button
                    ref={templatesTabRef}
                    onClick={(e) => {
                      e.preventDefault();
                      setLandingTab("templates");
                      if (templatesTabRef.current) {
                        setActiveTabWidth(templatesTabRef.current.offsetWidth);
                      }
                    }}
                    className={`pb-2 px-2 text-sm font-medium transition-colors relative ${
                      landingTab === "templates" ? "text-white" : "text-neutral-500 hover:text-neutral-300"
                    }`}
                  >
                    Templates
                    {landingTab === "templates" && (
                      <motion.div
                        layoutId="activeTab"
                        initial={false}
                        transition={{ 
                          type: "spring", 
                          stiffness: 500, 
                          damping: 30,
                          mass: 0.5
                        }}
                        className="absolute bottom-0 left-0 h-0.5 bg-cyan-500"
                        style={{ width: activeTabWidth || "auto" }}
                      />
                    )}
                  </button>
                </div>

                {/* 5. Cards Container - Left-aligned grid */}
                <div className="w-full pb-20">
                  <AnimatePresence mode="wait">
                    {landingTab === "projects" ? (
                      <motion.div
                        key="projects"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="w-full"
                      >
                        {user && savedProjects.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {savedProjects.map((project) => {
                          const DomainIcon = suggestionChips.find((c) => c.label === project.domain)?.icon || Globe;
                          return (
                              <div key={project.id} className="min-h-[11rem]">
                                <div className={cn("relative h-full rounded-2xl border border-white/10 p-[1px]")} style={{ transform: 'translateZ(0)', willChange: 'transform' }}>
                                  <GlowingEffect spread={40} glow disabled={false} proximity={64} inactiveZone={0.01} borderWidth={2} className="opacity-70" />
                            <div
                                    className="group relative flex h-full flex-col justify-between gap-4 rounded-[1.05rem] bg-gradient-to-br from-[#000000] via-[#050505] to-[#000000] p-5 sm:p-6 md:p-8 overflow-hidden will-change-transform cursor-pointer text-left"
                                    style={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden' }}
                              onClick={() => loadProject(project)}
                            >
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        deleteProject(project.id);
                                      }}
                                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-neutral-700 text-neutral-500 hover:text-red-400 transition-all z-20"
                                    >
                                      <X size={14} />
                                    </button>
                                    <div className="relative z-10 flex flex-col justify-between gap-4 h-full">
                                      <div className="flex flex-col gap-3">
                                        <div className="flex items-center gap-3">
                                          <div className="w-fit rounded-lg border border-white/10 bg-white/5 p-2">
                                            <DomainIcon className="w-5 h-5 text-white" />
                                          </div>
                                          <h3 className="text-lg md:text-xl font-semibold tracking-tight text-white/85 truncate">{project.name}</h3>
                                        </div>
                                        <div className="space-y-2">
                                          <p className="text-xs text-neutral-500">
                                            {new Date(project.updatedAt).toLocaleDateString()}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                            </div>
                          );
                        })}
                      </div>
                  ) : (
                        <div className="text-neutral-500 py-20 text-center">
                      {user ? "No saved projects yet." : "Sign in to see your projects."}
                    </div>
                  )}

                  {/* Login prompt for non-logged in users */}
                  {!user && (
                        <div className="w-full mt-8">
                      <div className="p-6 rounded-xl bg-neutral-900/50 border border-neutral-800 text-center">
                        <LogIn className="w-8 h-8 text-neutral-500 mx-auto mb-3" />
                        <p className="text-neutral-400 mb-4">Sign in to save projects</p>
                        <button
                          onClick={login}
                          className="px-6 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-all"
                        >
                          Sign in
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
                  ) : (
                <motion.div
                      key="templates"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                  className="w-full"
                >
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                          {/* Website Template */}
                    <div className="min-h-[11rem]">
                      <div className={cn("relative h-full rounded-2xl border border-white/10 p-[1px]")} style={{ transform: 'translateZ(0)', willChange: 'transform' }}>
                        <GlowingEffect spread={40} glow disabled={false} proximity={64} inactiveZone={0.01} borderWidth={2} className="opacity-70" />
                    <div
                          className="group relative flex h-full flex-col justify-between gap-4 rounded-[1.05rem] bg-gradient-to-br from-[#000000] via-[#050505] to-[#000000] p-5 sm:p-6 md:p-8 overflow-hidden will-change-transform cursor-pointer text-left"
                          style={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden' }}
                      onClick={() => !isLoading && handleLoadTemplate("Website")}
                    >
                          <div className="absolute top-2 right-2 z-20">
                            <div className="px-2 py-0.5 rounded text-[10px] bg-white/5 text-white/70 border border-white/10">
                              Complete Flow
                            </div>
                          </div>
                          <div className="relative z-10 flex flex-col justify-between gap-4 h-full">
                            <div className="flex flex-col gap-3">
                              <div className="flex items-center gap-3">
                                <div className="w-fit rounded-lg border border-white/10 bg-white/5 p-2">
                                  <LayoutTemplate className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="text-lg md:text-xl font-semibold tracking-tight text-white/85">
                                  Website Builder Flow
                                </h3>
                              </div>
                              <div className="space-y-2">
                                <p className="text-xs leading-relaxed text-white/70 md:text-base">
                                  Complete workflow for website design. Includes idea structuring, module planning, and SEO optimization.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* App Template */}
                    <div className="min-h-[11rem]">
                      <div className={cn("relative h-full rounded-2xl border border-white/10 p-[1px]")} style={{ transform: 'translateZ(0)', willChange: 'transform' }}>
                        <GlowingEffect spread={40} glow disabled={false} proximity={64} inactiveZone={0.01} borderWidth={2} className="opacity-70" />
                    <div
                          className="group relative flex h-full flex-col justify-between gap-4 rounded-[1.05rem] bg-gradient-to-br from-[#000000] via-[#050505] to-[#000000] p-5 sm:p-6 md:p-8 overflow-hidden will-change-transform cursor-pointer text-left"
                          style={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden' }}
                      onClick={() => !isLoading && handleLoadTemplate("App")}
                    >
                          <div className="absolute top-2 right-2 z-20">
                            <div className="px-2 py-0.5 rounded text-[10px] bg-white/5 text-white/70 border border-white/10">
                              Mobile Flow
                            </div>
                          </div>
                          <div className="relative z-10 flex flex-col justify-between gap-4 h-full">
                            <div className="flex flex-col gap-3">
                              <div className="flex items-center gap-3">
                                <div className="w-fit rounded-lg border border-white/10 bg-white/5 p-2">
                                  <Smartphone className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="text-lg md:text-xl font-semibold tracking-tight text-white/85">
                                  Mobile App Flow
                                </h3>
                              </div>
                              <div className="space-y-2">
                                <p className="text-xs leading-relaxed text-white/70 md:text-base">
                                  Mobile app development pipeline. Feature mapping, screen design, and technical requirements.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Game Template */}
                    <div className="min-h-[11rem]">
                      <div className={cn("relative h-full rounded-2xl border border-white/10 p-[1px]")} style={{ transform: 'translateZ(0)', willChange: 'transform' }}>
                        <GlowingEffect spread={40} glow disabled={false} proximity={64} inactiveZone={0.01} borderWidth={2} className="opacity-70" />
                    <div
                          className="group relative flex h-full flex-col justify-between gap-4 rounded-[1.05rem] bg-gradient-to-br from-[#000000] via-[#050505] to-[#000000] p-5 sm:p-6 md:p-8 overflow-hidden will-change-transform cursor-pointer text-left"
                          style={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden' }}
                      onClick={() => !isLoading && handleLoadTemplate("Game")}
                    >
                          <div className="absolute top-2 right-2 z-20">
                            <div className="px-2 py-0.5 rounded text-[10px] bg-white/5 text-white/70 border border-white/10">
                              Game Design
                            </div>
                          </div>
                          <div className="relative z-10 flex flex-col justify-between gap-4 h-full">
                            <div className="flex flex-col gap-3">
                              <div className="flex items-center gap-3">
                                <div className="w-fit rounded-lg border border-white/10 bg-white/5 p-2">
                                  <Gamepad2 className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="text-lg md:text-xl font-semibold tracking-tight text-white/85">
                                  Game Development Flow
                                </h3>
                              </div>
                              <div className="space-y-2">
                                <p className="text-xs leading-relaxed text-white/70 md:text-base">
                                  Game design workflow. Concept development, mechanics planning, and technical architecture.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            </div>
          </motion.main>
        ) : (
          // --- WORKSPACE VIEW ---
          <motion.div
              key="workspace"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`flex-1 relative w-full h-full flex flex-col bg-black ${activeTool === "hand" || isSpacePressed ? "cursor-grab active:cursor-grabbing" : activeTool === "text" ? "cursor-text" : "cursor-default"}`}
            >
            {/* Top Bar */}
            <div className="absolute top-0 left-0 right-0 h-14 bg-black border-b border-neutral-800 flex items-center justify-between px-4 z-30">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <button
                  onClick={() => {
                    // Save current project before clearing
                    if (widgets.length > 0 && user) {
                      saveCurrentProject(true);
                    }
                    // Clear workspace when going back to landing
                    createNewProject();
                    setViewMode("landing");
                  }}
                  className="h-8 px-3 rounded-md bg-neutral-900/50 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-white flex items-center gap-2 transition-all cursor-pointer font-sans text-sm flex-shrink-0"
                >
                  <ArrowLeft size={16} /> <span>Back</span>
                </button>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="text-base font-medium text-neutral-300 px-2 py-1 bg-transparent border-none outline-none rounded transition-colors truncate max-w-[200px]"
                  placeholder="Project name..."
                />
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => saveCurrentProject(false)}
                  disabled={isSaving}
                  className="h-10 px-4 rounded-lg border border-neutral-800 flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer backdrop-blur-md bg-neutral-900/80 text-neutral-400 hover:bg-neutral-800 hover:text-white disabled:opacity-50"
                >
                  {isSaving ? (
                    <div className="w-4 h-4 border-2 border-neutral-500 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  <span className="text-sm">{isSaving ? "Saving..." : "Save"}</span>
                </button>
                <button
                  onClick={() => setShowCategories(!showCategories)}
                  className="h-10 w-10 rounded-lg border border-neutral-800 flex items-center justify-center transition-all shadow-lg cursor-pointer backdrop-blur-md bg-neutral-900/80 text-neutral-400 hover:bg-neutral-800 hover:text-white"
                >
                  <Plus size={20} className={showCategories ? "rotate-45" : ""} />
                </button>
              </div>
            </div>

            {/* --- BOTTOM TOOLBAR (Figma-like) --- */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2">
              {/* Text Tool Options Panel (Appears Above Toolbar) */}
              <AnimatePresence>
                {activeTool === "text" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="flex items-center gap-2 p-2 bg-[#1b1b1f] border border-neutral-800 rounded-xl shadow-2xl mb-2"
                  >
                    {/* Font Family */}
                    <select
                      value={textToolSettings.fontFamily || AVAILABLE_FONTS[0].value}
                      onChange={(e) => setTextToolSettings((prev) => ({ ...prev, fontFamily: e.target.value }))}
                      className="dark-select"
                      style={{ fontFamily: textToolSettings.fontFamily || AVAILABLE_FONTS[0].value }}
                    >
                      {AVAILABLE_FONTS.map((font) => (
                        <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                          {font.label}
                        </option>
                      ))}
                    </select>

                    <div className="w-px h-4 bg-neutral-700 mx-1" />

                    {/* Font Size */}
                    <div className="flex items-center gap-1 bg-neutral-800 rounded border border-neutral-700 px-1">
                      <span className="text-[10px] text-neutral-500 pl-1">Size</span>
                      <input
                        type="number"
                        value={textToolSettings.fontSize}
                        onChange={(e) =>
                          setTextToolSettings((prev) => ({ ...prev, fontSize: parseInt(e.target.value) || 12 }))
                        }
                        className="w-10 bg-transparent text-xs text-white p-1 outline-none text-center"
                      />
                    </div>

                    <div className="w-px h-4 bg-neutral-700 mx-1" />

                    {/* Alignment */}
                    <div className="flex bg-neutral-800 rounded border border-neutral-700 p-0.5">
                      <button
                        onClick={() => setTextToolSettings((prev) => ({ ...prev, textAlign: "left" }))}
                        className={`p-1 rounded ${textToolSettings.textAlign === "left" ? "bg-neutral-600 text-white" : "text-neutral-400 hover:text-white"}`}
                      >
                        <AlignLeft size={14} />
                      </button>
                      <button
                        onClick={() => setTextToolSettings((prev) => ({ ...prev, textAlign: "center" }))}
                        className={`p-1 rounded ${textToolSettings.textAlign === "center" ? "bg-neutral-600 text-white" : "text-neutral-400 hover:text-white"}`}
                      >
                        <AlignCenter size={14} />
                      </button>
                      <button
                        onClick={() => setTextToolSettings((prev) => ({ ...prev, textAlign: "right" }))}
                        className={`p-1 rounded ${textToolSettings.textAlign === "right" ? "bg-neutral-600 text-white" : "text-neutral-400 hover:text-white"}`}
                      >
                        <AlignRight size={14} />
                      </button>
                    </div>

                    <div className="w-px h-4 bg-neutral-700 mx-1" />

                    {/* Color */}
                    <div className="relative">
                      <button
                        onClick={() => setShowColorPicker(!showColorPicker)}
                        className="w-6 h-6 rounded border border-neutral-600 cursor-pointer"
                        style={{ backgroundColor: textToolSettings.color }}
                        title="Text Color"
                      />
                      {showColorPicker && (
                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 p-3 bg-neutral-800 border border-neutral-700 rounded-lg shadow-xl z-50">
                          <HexColorPicker
                            color={textToolSettings.color}
                            onChange={(color) => setTextToolSettings((prev) => ({ ...prev, color }))}
                          />
                          <div className="mt-2 flex items-center gap-2">
                            <input
                              type="text"
                              value={textToolSettings.color}
                              onChange={(e) => setTextToolSettings((prev) => ({ ...prev, color: e.target.value }))}
                              className="flex-1 bg-neutral-700 text-white text-xs px-2 py-1 rounded border border-neutral-600 outline-none"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Main Toolbar */}
              <div className="flex items-center gap-1 p-1.5 bg-[#1b1b1f] border border-neutral-800 rounded-full shadow-xl">
                <button
                  onClick={() => setActiveTool("select")}
                  className={`p-2.5 rounded-full transition-all ${activeTool === "select" ? "bg-neutral-600 text-white" : "text-neutral-400 hover:text-white hover:bg-neutral-800"}`}
                  title="Move / Select (V)"
                >
                  <MousePointer2 size={18} />
                </button>
                <button
                  onClick={() => setActiveTool("hand")}
                  className={`p-2.5 rounded-full transition-all ${activeTool === "hand" ? "bg-neutral-600 text-white" : "text-neutral-400 hover:text-white hover:bg-neutral-800"}`}
                  title="Hand Tool (H)"
                >
                  <Hand size={18} />
                </button>

                {/* ZOOM CONTROLS (Between Hand and Text) */}
                <div className="w-px h-6 bg-neutral-700 mx-1" />
                <button
                  onClick={handleZoomOut}
                  className="p-2.5 rounded-full transition-all text-neutral-400 hover:text-white hover:bg-neutral-800"
                  title="Zoom Out (-)"
                >
                  <Minus size={16} />
                </button>
                <button
                  onClick={handleZoomIn}
                  className="p-2.5 rounded-full transition-all text-neutral-400 hover:text-white hover:bg-neutral-800"
                  title="Zoom In (+)"
                >
                  <Plus size={16} />
                </button>
                <div className="w-px h-6 bg-neutral-700 mx-1" />

                <button
                  onClick={() => setActiveTool("text")}
                  className={`p-2.5 rounded-full transition-all ${activeTool === "text" ? "bg-neutral-600 text-white" : "text-neutral-400 hover:text-white hover:bg-neutral-800"}`}
                  title="Text Tool (T)"
                >
                  <Type size={18} />
                </button>
                <button
                  onClick={() => setShowBackgroundPattern((prev) => !prev)}
                  className={`p-2.5 rounded-full transition-all ${
                    !showBackgroundPattern ? "bg-neutral-600 text-white" : "text-neutral-400 hover:text-white hover:bg-neutral-800"
                  }`}
                  title={showBackgroundPattern ? "Hide Background Pattern" : "Show Background Pattern"}
                >
                  {showBackgroundPattern ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Canvas */}
            <div
              ref={canvasRef}
              className="flex-1 relative overflow-hidden z-0 min-h-screen outline-none"
              style={{ marginTop: "56px", width: "100%", height: "100%", backgroundColor: "#000000" }}
              tabIndex={0}
              onMouseDown={handleCanvasMouseDown}
              onWheel={handleCanvasWheel}
              onClick={handleCanvasClick}
            >
              {/* Background Grid */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  zIndex: 0,
                  backgroundColor: "#000000",
                  backgroundImage: showBackgroundPattern
                    ? "radial-gradient(circle, rgba(255, 255, 255, 0.06) 1px, transparent 1px)"
                    : "none",
                  backgroundSize: showBackgroundPattern
                    ? `${26 * canvasTransform.scale}px ${26 * canvasTransform.scale}px`
                    : undefined,
                  backgroundPosition: showBackgroundPattern
                    ? `${canvasTransform.translateX}px ${canvasTransform.translateY}px`
                    : undefined,
                }}
              />

              {/* Selection Box */}
              {selectionBox && (
                <div
                  className="absolute z-50 pointer-events-none border border-neutral-500 bg-neutral-700/30"
                  style={{
                    left:
                      Math.min(selectionBox.startX, selectionBox.currentX) -
                      (canvasRef.current?.getBoundingClientRect().left || 0),
                    top:
                      Math.min(selectionBox.startY, selectionBox.currentY) -
                      (canvasRef.current?.getBoundingClientRect().top || 0),
                    width: Math.abs(selectionBox.currentX - selectionBox.startX),
                    height: Math.abs(selectionBox.currentY - selectionBox.startY),
                  }}
                />
              )}

              {/* Edges */}
              <svg
                className="absolute inset-0"
                style={{
                  zIndex: 1,
                  transform: `translate(${canvasTransform.translateX}px, ${canvasTransform.translateY}px) scale(${canvasTransform.scale})`,
                  transformOrigin: "0 0",
                  overflow: "visible",
                }}
              >
                {edges.map((edge) => {
                  const sourcePos = getHandlePosition(edge.source, "output", widgets);
                  const targetPos = getHandlePosition(edge.target, "input", widgets);
                  if (!sourcePos || !targetPos) return null;
                  
                  // Smoothstep curve with better control points
                  const dx = targetPos.x - sourcePos.x;
                  const dy = targetPos.y - sourcePos.y;
                  const controlPointOffset = Math.min(Math.abs(dx) * 0.5, 100);
                  
                  return (
                    <path
                      key={edge.id}
                      d={`M ${sourcePos.x} ${sourcePos.y} C ${sourcePos.x + controlPointOffset} ${sourcePos.y}, ${targetPos.x - controlPointOffset} ${targetPos.y}, ${targetPos.x} ${targetPos.y}`}
                      stroke="rgba(255, 255, 255, 0.4)"
                      strokeWidth="2"
                      fill="none"
                      strokeLinecap="round"
                      style={{ pointerEvents: "none" }}
                    />
                  );
                })}
                {connecting &&
                  mousePosition &&
                  (() => {
                    const sourcePos = getHandlePosition(connecting.sourceId, "output", widgets);
                    return sourcePos ? (
                      <path
                        d={`M ${sourcePos.x} ${sourcePos.y} C ${sourcePos.x + 50} ${sourcePos.y}, ${mousePosition.x - 50} ${mousePosition.y}, ${mousePosition.x} ${mousePosition.y}`}
                        stroke="rgba(255, 255, 255, 0.5)"
                        strokeWidth="2"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray="6 4"
                        style={{ pointerEvents: "none" }}
                      />
                    ) : null;
                  })()}
              </svg>

              {/* Widgets */}
              <div
                className="absolute inset-0"
                style={{
                  zIndex: 1,
                  transform: `translate(${canvasTransform.translateX}px, ${canvasTransform.translateY}px) scale(${canvasTransform.scale})`,
                  transformOrigin: "0 0",
                }}
              >
                {widgets.map((widget) => {
                  const isSelected = selectedWidgetIds.has(widget.id);

                  // --- RENDER PROMPT SCANNER ---
                  if (widget.type === "prompt-scanner") {
                    return (
                      <div
                        key={widget.id}
                        className="absolute z-20"
                        style={{ left: widget.x, top: widget.y }}
                      >
                        <ResizableNodeWrapper
                          id={widget.id}
                          width={widget.width || 400}
                          height={widget.height || 300}
                          onResizeNode={onResizeNode}
                          onMouseDown={(e) => handleMouseDown(e, widget.id, "move")}
                        >
                          <div className="w-full h-full flex flex-col rounded-xl border border-white/10 bg-gradient-to-br from-[#000000] via-[#050505] to-[#000000] text-white shadow-md">
                            {/* Handles */}
                            <div
                              className={`absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 flow-handle flow-handle-target w-3.5 h-3.5 rounded-full border-2 cursor-pointer transition-all duration-200 shadow-lg ${
                                draggingHandle?.nodeId === widget.id && draggingHandle?.handleType === "input"
                                  ? "bg-neutral-400 border-neutral-200 scale-150 shadow-neutral-400/50"
                                  : connecting && connecting.sourceId !== widget.id
                                    ? "bg-neutral-500/90 border-neutral-300 scale-110 shadow-neutral-300/50"
                                    : "bg-neutral-600/70 border-neutral-400/80 hover:bg-neutral-500/80 hover:scale-125 hover:border-neutral-300"
                              }`}
                              style={{ pointerEvents: "auto", zIndex: 1000 }}
                              onMouseDown={(e) => {
                                e.stopPropagation();
                                handleHandleMouseDown(e, widget.id, "input");
                              }}
                            />
                            <div
                              className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 flow-handle flow-handle-source w-3.5 h-3.5 rounded-full border-2 cursor-pointer transition-all duration-200 shadow-lg ${
                                draggingHandle?.nodeId === widget.id && draggingHandle?.handleType === "output"
                                  ? "bg-neutral-400 border-neutral-200 scale-150 shadow-neutral-400/50"
                                  : connecting && connecting.sourceId === widget.id
                                    ? "bg-neutral-500/90 border-neutral-300 scale-110 shadow-neutral-300/50"
                                    : "bg-neutral-600/70 border-neutral-400/80 hover:bg-neutral-500/80 hover:scale-125 hover:border-neutral-300"
                              }`}
                              style={{ pointerEvents: "auto", zIndex: 1000 }}
                              onMouseDown={(e) => {
                                e.stopPropagation();
                                handleHandleMouseDown(e, widget.id, "output");
                              }}
                            />
                            {/* Header */}
                            <div className="flex items-center justify-between p-3 border-b border-white/10">
                              <div className="flex items-center gap-2">
                                <Search size={16} className="text-neutral-400" />
                                <h3 className="text-sm font-semibold text-white">{widget.title || "Prompt Scanner"}</h3>
                              </div>
                            </div>
                            {/* Content */}
                            <div className="flex-1 p-4 flow-node-scroll">
                              <p className="text-xs text-neutral-400">
                                Connect this node to verify that all prompts in your flow work correctly.
                              </p>
                            </div>
                          </div>
                        </ResizableNodeWrapper>
                      </div>
                    );
                  }

                  // --- RENDER PROMPT LIBRARY ---
                  if (widget.type === "prompt-library") {
                    return (
                      <div
                        key={widget.id}
                        className="absolute z-20"
                        style={{ left: widget.x, top: widget.y }}
                      >
                        <ResizableNodeWrapper
                          id={widget.id}
                          width={widget.width || 400}
                          height={widget.height || 300}
                          onResizeNode={onResizeNode}
                          onMouseDown={(e) => handleMouseDown(e, widget.id, "move")}
                        >
                          <div className="w-full h-full flex flex-col rounded-xl border border-white/10 bg-gradient-to-br from-[#000000] via-[#050505] to-[#000000] text-white shadow-md">
                            {/* Handles */}
                            <div
                              className={`absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 flow-handle flow-handle-target w-3.5 h-3.5 rounded-full border-2 cursor-pointer transition-all duration-200 shadow-lg ${
                                draggingHandle?.nodeId === widget.id && draggingHandle?.handleType === "input"
                                  ? "bg-neutral-400 border-neutral-200 scale-150 shadow-neutral-400/50"
                                  : connecting && connecting.sourceId !== widget.id
                                    ? "bg-neutral-500/90 border-neutral-300 scale-110 shadow-neutral-300/50"
                                    : "bg-neutral-600/70 border-neutral-400/80 hover:bg-neutral-500/80 hover:scale-125 hover:border-neutral-300"
                              }`}
                              style={{ pointerEvents: "auto", zIndex: 1000 }}
                              onMouseDown={(e) => {
                                e.stopPropagation();
                                handleHandleMouseDown(e, widget.id, "input");
                              }}
                            />
                            <div
                              className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 flow-handle flow-handle-source w-3.5 h-3.5 rounded-full border-2 cursor-pointer transition-all duration-200 shadow-lg ${
                                draggingHandle?.nodeId === widget.id && draggingHandle?.handleType === "output"
                                  ? "bg-neutral-400 border-neutral-200 scale-150 shadow-neutral-400/50"
                                  : connecting && connecting.sourceId === widget.id
                                    ? "bg-neutral-500/90 border-neutral-300 scale-110 shadow-neutral-300/50"
                                    : "bg-neutral-600/70 border-neutral-400/80 hover:bg-neutral-500/80 hover:scale-125 hover:border-neutral-300"
                              }`}
                              style={{ pointerEvents: "auto", zIndex: 1000 }}
                              onMouseDown={(e) => {
                                e.stopPropagation();
                                handleHandleMouseDown(e, widget.id, "output");
                              }}
                            />
                            {/* Header */}
                            <div className="flex items-center justify-between p-3 border-b border-white/10">
                              <div className="flex items-center gap-2">
                                <FolderKanban size={16} className="text-neutral-400" />
                                <h3 className="text-sm font-semibold text-white">{widget.title || "Prompt Library"}</h3>
                              </div>
                            </div>
                            {/* Content */}
                            <div className="flex-1 p-4 flow-node-scroll">
                              <p className="text-xs text-neutral-400">
                                Access your purchased prompts here. Connect to add them to your flow.
                              </p>
                            </div>
                          </div>
                        </ResizableNodeWrapper>
                      </div>
                    );
                  }

                  // --- RENDER PROMPT WINDOW (INTELLIGENT GENERATOR) ---
                  if (widget.type === "prompt-window") {
                    // PROMPT WINDOW LISTENS ONLY TO PROMPT STRUCTURE (Step 7)
                    // Find Step 7 - Prompt Structure node
                    const step7Node = widgets.find(
                      (w) => w.id === "website-prompt-output" || w.title === "Step 7 – Prompt Structure"
                    );
                    
                    // Get content from Step 7 node (which is continuously updated from global state)
                    const step7Content = step7Node?.content || "";
                    
                    // For website flows, always use Step 7 content in preview mode
                    const hasWebsiteSections = widgets.some((w) => w.type === "website-section" || w.type === "brandIdentity");
                    const promptContent = hasWebsiteSections ? step7Content : (livePrompt || "");
                    
                    // In preview mode, always show Step 7 content (real-time updates)
                    // In edit mode, allow manual editing
                    const displayContent = widget.promptMode === "preview" 
                      ? promptContent 
                      : widget.content || promptContent;
                    
                    // Calculate input status for visual feedback
                    const userInputNode = widgets.find((w) => w.id === "website-user-input");
                    const brandNode = widgets.find((w) => w.id === "website-brand-identity");
                    const purposeNode = widgets.find((w) => w.id === "website-purpose");
                    const seoNode = widgets.find((w) => w.id === "website-seo-structure");
                    const functionalNode = widgets.find((w) => w.id === "website-functional-requirements");
                    const contentNode = widgets.find((w) => w.id === "website-content-inputs");
                    
                    const inputStatus = {
                      userInput: !!userInputNode?.content?.trim(),
                      brand: !!(brandNode?.brandIdentityData?.fields?.styleMood || brandNode?.brandIdentityData?.fields?.toneOfVoice),
                      purpose: !!(purposeNode?.websiteData?.fields?.problem || purposeNode?.websiteData?.fields?.targetAudience),
                      seo: !!(seoNode?.websiteData?.fields?.keywords || seoNode?.websiteData?.fields?.pageStructure),
                      functional: !!(functionalNode?.websiteData?.fields?.ctas || functionalNode?.websiteData?.fields?.animations),
                      content: !!(contentNode?.websiteData?.fields?.copy || contentNode?.websiteData?.fields?.offers),
                    };
                    
                    const filledCount = Object.values(inputStatus).filter(Boolean).length;
                    const totalCount = Object.values(inputStatus).length;
                    const completionPercent = Math.round((filledCount / totalCount) * 100);
                    
                    return (
                      <div
                        key={widget.id}
                        className="absolute z-20"
                        style={{ left: widget.x, top: widget.y }}
                      >
                        <ResizableNodeWrapper
                          id={widget.id}
                          width={widget.width || 400}
                          height={widget.height || 300}
                          onResizeNode={onResizeNode}
                          onMouseDown={(e) => handleMouseDown(e, widget.id, "move")}
                        >
                        <div className="w-full h-full flex flex-col rounded-xl border border-white/10 bg-gradient-to-br from-[#000000] via-[#050505] to-[#000000] text-white shadow-md">
                        {/* Handles - INPUT AND OUTPUT BALLS INTEGRATED INTO BORDER */}
                        <div
                          className={`absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 flow-handle flow-handle-target w-3.5 h-3.5 rounded-full border-2 cursor-pointer transition-all duration-200 shadow-lg ${
                            draggingHandle?.nodeId === widget.id && draggingHandle?.handleType === "input"
                              ? "bg-neutral-400 border-neutral-200 scale-150 shadow-neutral-400/50"
                              : connecting && connecting.sourceId !== widget.id
                                ? "bg-neutral-500/90 border-neutral-300 scale-110 shadow-neutral-300/50"
                                : "bg-neutral-600/70 border-neutral-400/80 hover:bg-neutral-500/80 hover:scale-125 hover:border-neutral-300"
                          }`}
                          style={{ left: "0px", pointerEvents: "auto", zIndex: 1000 }}
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            handleHandleMouseDown(e, widget.id, "input");
                          }}
                        />
                        <div
                          className={`absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 flow-handle flow-handle-source w-3.5 h-3.5 rounded-full border-2 cursor-pointer transition-all duration-200 shadow-lg ${
                            draggingHandle?.nodeId === widget.id && draggingHandle?.handleType === "output"
                              ? "bg-neutral-400 border-neutral-200 scale-150 shadow-neutral-400/50"
                              : connecting && connecting.sourceId === widget.id
                                ? "bg-neutral-500/90 border-neutral-300 scale-110 shadow-neutral-300/50"
                                : "bg-neutral-600/70 border-neutral-400/80 hover:bg-neutral-500/80 hover:scale-125 hover:border-neutral-300"
                          }`}
                          style={{ right: "0px", pointerEvents: "auto", zIndex: 1000 }}
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            handleHandleMouseDown(e, widget.id, "output");
                          }}
                        />

                          {/* Prompt Window Header */}
                          <div className="px-3 py-2 border-b border-neutral-800 bg-gradient-to-br from-[#000000] via-[#050505] to-[#000000] flex items-center justify-between handle flex-shrink-0">
                            <div className="flex items-center gap-2">
                              <div className="relative">
                                <Sparkles size={14} className={filledCount > 0 ? "text-yellow-400" : "text-neutral-500"} />
                                {filledCount > 0 && (
                                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                )}
                              </div>
                              <span className="text-sm font-semibold text-neutral-200">
                                Prompt Generator
                              </span>
                            </div>
                          <div className="flex gap-1 bg-neutral-900 rounded-md p-0.5 border border-neutral-800">
                            {/* Copy Button */}
                            <button
                              onClick={() => displayContent && handleCopyPrompt(displayContent)}
                              className="p-1 rounded text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800"
                              title="Copy Prompt"
                            >
                              <Copy size={12} />
                            </button>
                            <div className="w-px bg-neutral-800 mx-0.5" />
                            <button
                              onClick={() => {
                                // If switching to Edit, pre-fill if empty
                                if (widget.promptMode !== "edit" && !widget.content) {
                                  updateWidget(widget.id, "content", promptContent);
                                }
                                updateWidget(widget.id, "promptMode", "edit");
                              }}
                              className={`p-1 rounded ${
                                widget.promptMode === "edit"
                                  ? "bg-neutral-700 text-white"
                                  : "text-neutral-500 hover:text-neutral-300"
                              }`}
                              title="Edit Mode"
                            >
                              <Edit3 size={12} />
                            </button>
                            <button
                              onClick={() => updateWidget(widget.id, "promptMode", "preview")}
                              className={`p-1 rounded ${
                                widget.promptMode === "preview" || !widget.promptMode
                                  ? "bg-neutral-700 text-white"
                                  : "text-neutral-500 hover:text-neutral-300"
                              }`}
                              title="Preview Mode"
                            >
                              <Eye size={12} />
                            </button>
                          </div>
                        </div>

                          {/* Input Status Bar */}
                          {hasWebsiteSections && (
                            <div className="px-3 py-2 border-b border-neutral-800/50 bg-neutral-900/30 flex-shrink-0">
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="text-[10px] uppercase tracking-wider text-neutral-500">
                                  Inputs Detected
                                </span>
                                <span className={`text-[10px] font-medium ${completionPercent === 100 ? "text-green-400" : completionPercent > 50 ? "text-yellow-400" : "text-neutral-500"}`}>
                                  {completionPercent}%
                                </span>
                              </div>
                              <div className="flex gap-1">
                                <div className={`flex-1 h-1 rounded-full transition-colors ${inputStatus.userInput ? "bg-blue-500" : "bg-neutral-800"}`} title="User Input" />
                                <div className={`flex-1 h-1 rounded-full transition-colors ${inputStatus.brand ? "bg-purple-500" : "bg-neutral-800"}`} title="Brand Identity" />
                                <div className={`flex-1 h-1 rounded-full transition-colors ${inputStatus.purpose ? "bg-green-500" : "bg-neutral-800"}`} title="Purpose" />
                                <div className={`flex-1 h-1 rounded-full transition-colors ${inputStatus.seo ? "bg-orange-500" : "bg-neutral-800"}`} title="SEO" />
                                <div className={`flex-1 h-1 rounded-full transition-colors ${inputStatus.functional ? "bg-pink-500" : "bg-neutral-800"}`} title="Functional" />
                                <div className={`flex-1 h-1 rounded-full transition-colors ${inputStatus.content ? "bg-cyan-500" : "bg-neutral-800"}`} title="Content" />
                              </div>
                            </div>
                          )}

                          {/* Prompt Window Content */}
                          <div className="flex-1 bg-gradient-to-br from-[#000000] via-[#050505] to-[#000000] overflow-hidden">
                            {widget.promptMode === "preview" ? (
                              <div className="p-4 flow-node-scroll h-full">
                                {displayContent ? (
                                  <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-white/90">
                                    {displayContent}
                                  </pre>
                                ) : (
                                  <div className="flex flex-col items-center justify-center h-full text-neutral-600 gap-3 p-4 text-center">
                                    <div className="w-12 h-12 rounded-full bg-neutral-800/50 flex items-center justify-center">
                                      <Sparkles size={24} className="text-neutral-600" />
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-neutral-400 mb-1">
                                        Waiting for input...
                                      </p>
                                      <p className="text-xs text-neutral-600">
                                        {hasWebsiteSections 
                                          ? "Start filling in the nodes to generate your prompt."
                                          : "Connect nodes to this window to generate a prompt."}
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <textarea
                                className="w-full h-full bg-gradient-to-br from-[#000000] via-[#050505] to-[#000000] text-neutral-300 p-4 font-mono text-sm resize-none outline-none leading-relaxed flow-node-scroll"
                                value={widget.content || ""}
                                onChange={(e) => updateWidget(widget.id, "content", e.target.value)}
                                placeholder="Write your custom prompt here..."
                                onMouseDown={(e) => e.stopPropagation()}
                                disabled={hasWebsiteSections} // Disable manual editing for website flows
                              />
                            )}
                          </div>
                        </div>
                        </ResizableNodeWrapper>
                      </div>
                    );
                  }

                  // --- RENDER BRAND IDENTITY NODE ---
                  if (widget.type === "brandIdentity") {
                    const brandData = widget.brandIdentityData || {
                      title: "Brand Identity",
                      fields: {
                        primaryColor: "#3B82F6",
                        secondaryColor: "#0F172A",
                        accentColor: "#F97316",
                        fontFamily: AVAILABLE_FONTS[0].value,
                        styleMood: "",
                        toneOfVoice: "",
                      },
                    };

                    return (
                      <div
                        key={widget.id}
                        className="absolute z-20"
                        style={{ left: widget.x, top: widget.y }}
                      >
                        <ResizableNodeWrapper
                          id={widget.id}
                          width={widget.width || 280}
                          height={widget.height || 400}
                          onResizeNode={onResizeNode}
                          onMouseDown={(e) => handleMouseDown(e, widget.id, "move")}
                        >
                        <div className="relative w-full h-full">
                          {/* Handles */}
                          <div
                            className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 flow-handle flow-handle-target w-3.5 h-3.5 rounded-full border-2 cursor-pointer transition-all duration-200 shadow-lg ${
                              draggingHandle?.nodeId === widget.id && draggingHandle?.handleType === "input"
                                ? "bg-neutral-400 border-neutral-200 scale-150 shadow-neutral-400/50"
                                : connecting && connecting.sourceId !== widget.id
                                  ? "bg-neutral-500/90 border-neutral-300 scale-110 shadow-neutral-300/50"
                                  : "bg-neutral-600/70 border-neutral-400/80 hover:bg-neutral-500/80 hover:scale-125 hover:border-neutral-300"
                            }`}
                            style={{ pointerEvents: "auto", zIndex: 1000 }}
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              handleHandleMouseDown(e, widget.id, "input");
                            }}
                          />
                          <div
                            className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 flow-handle flow-handle-source w-3.5 h-3.5 rounded-full border-2 cursor-pointer transition-all duration-200 shadow-lg ${
                              draggingHandle?.nodeId === widget.id && draggingHandle?.handleType === "output"
                                ? "bg-neutral-400 border-neutral-200 scale-150 shadow-neutral-400/50"
                                : connecting && connecting.sourceId === widget.id
                                  ? "bg-neutral-500/90 border-neutral-300 scale-110 shadow-neutral-300/50"
                                  : "bg-neutral-600/70 border-neutral-400/80 hover:bg-neutral-500/80 hover:scale-125 hover:border-neutral-300"
                            }`}
                            style={{ pointerEvents: "auto", zIndex: 1000 }}
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              handleHandleMouseDown(e, widget.id, "output");
                            }}
                          />
                          {/* Brand Identity Node Component */}
                          <BrandIdentityNode
                            id={widget.id}
                            data={{
                              title: brandData.title,
                              fields: brandData.fields,
                              onChange: (newFields: BrandIdentityFields) => {
                                updateWidget(widget.id, "brandIdentityData", {
                                  ...brandData,
                                  fields: newFields,
                                });
                              },
                            }}
                          />
                        </div>
                        </ResizableNodeWrapper>
                      </div>
                    );
                  }

                  // --- RENDER WEBSITE SECTION WIDGET ---
                  if (widget.type === "website-section") {
                    const websiteData = widget.websiteData || { title: widget.title || "Section", fields: {} };
                    
                    return (
                      <div
                        key={widget.id}
                        className="absolute z-20"
                        style={{ left: widget.x, top: widget.y }}
                      >
                        <ResizableNodeWrapper
                          id={widget.id}
                          width={widget.width || 280}
                          height={widget.height || 300}
                          onResizeNode={onResizeNode}
                          onMouseDown={(e) => handleMouseDown(e, widget.id, "move")}
                        >
                        <div className="flow-node w-full h-full rounded-xl border border-white/10 bg-gradient-to-br from-[#000000] via-[#050505] to-[#000000] text-white shadow-md flex flex-col">
                          {/* Handles */}
                          <div
                            className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 flow-handle flow-handle-target w-3.5 h-3.5 rounded-full border-2 cursor-pointer transition-all duration-200 shadow-lg ${
                              draggingHandle?.nodeId === widget.id && draggingHandle?.handleType === "input"
                                ? "bg-neutral-400 border-neutral-200 scale-150 shadow-neutral-400/50"
                                : connecting && connecting.sourceId !== widget.id
                                  ? "bg-neutral-500/90 border-neutral-300 scale-110 shadow-neutral-300/50"
                                  : "bg-neutral-600/70 border-neutral-400/80 hover:bg-neutral-500/80 hover:scale-125 hover:border-neutral-300"
                            }`}
                            style={{ pointerEvents: "auto", zIndex: 1000 }}
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              handleHandleMouseDown(e, widget.id, "input");
                            }}
                          />
                          <div
                            className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 flow-handle flow-handle-source w-3.5 h-3.5 rounded-full border-2 cursor-pointer transition-all duration-200 shadow-lg ${
                              draggingHandle?.nodeId === widget.id && draggingHandle?.handleType === "output"
                                ? "bg-neutral-400 border-neutral-200 scale-150 shadow-neutral-400/50"
                                : connecting && connecting.sourceId === widget.id
                                  ? "bg-neutral-500/90 border-neutral-300 scale-110 shadow-neutral-300/50"
                                  : "bg-neutral-600/70 border-neutral-400/80 hover:bg-neutral-500/80 hover:scale-125 hover:border-neutral-300"
                            }`}
                            style={{ pointerEvents: "auto", zIndex: 1000 }}
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              handleHandleMouseDown(e, widget.id, "output");
                            }}
                          />

                          {/* Header */}
                          <div className="px-4 py-2 border-b border-white/10 flex-shrink-0">
                            <span className="node-title text-sm font-semibold text-white">
                              {websiteData.title}
                            </span>
                          </div>

                          {/* Fields */}
                          <div className="flex-1 flow-node-scroll px-4 py-3 space-y-3 text-sm leading-relaxed">
                            {Object.entries(websiteData.fields).map(([fieldKey, fieldValue]) => (
                              <section key={fieldKey} className="space-y-2">
                                <p className="text-xs uppercase tracking-[0.18em] text-white/40">
                                  {fieldKey.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                                </p>
                                <textarea
                                  value={fieldValue}
                                  onChange={(e) => {
                                    const updatedData = {
                                      ...websiteData,
                                      fields: {
                                        ...websiteData.fields,
                                        [fieldKey]: e.target.value,
                                      },
                                    };
                                    updateWidget(widget.id, "websiteData", updatedData);
                                  }}
                                  placeholder={`Enter ${fieldKey}...`}
                                  className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white/90 placeholder:text-white/30 resize-none outline-none focus:border-white/30 leading-relaxed"
                                  onMouseDown={(e) => e.stopPropagation()}
                                  style={{ minHeight: "48px" }}
                                />
                              </section>
                            ))}
                          </div>
                        </div>
                        </ResizableNodeWrapper>
                      </div>
                    );
                  }

                  // --- RENDER TEXT WIDGET ---
                  if (widget.type === "text") {
                    // Calculate text widget dimensions for handle positioning
                    const textWidth = Math.max(100, (widget.content?.length || 0) * (widget.style?.fontSize || 16) * 0.7);
                    const textHeight = (widget.style?.fontSize || 16) * 1.5;
                    
                    return (
                      <div
                        key={widget.id}
                        className={`absolute flex items-center justify-center p-1 border-0`}
                        style={{
                          left: widget.x,
                          top: widget.y,
                          width: textWidth,
                          height: textHeight,
                        }}
                        onMouseDown={(e) => handleMouseDown(e, widget.id, "move")}
                      >
                        {/* Handles - INPUT AND OUTPUT BALLS FOR TEXT WIDGET */}
                        <div
                          className={`absolute left-0 top-1/2 -translate-y-1/2 flow-handle flow-handle-target w-3.5 h-3.5 rounded-full border-2 cursor-pointer transition-all duration-200 shadow-lg ${
                            draggingHandle?.nodeId === widget.id && draggingHandle?.handleType === "input"
                              ? "bg-neutral-400 border-neutral-200 scale-150 shadow-neutral-400/50"
                              : connecting && connecting.sourceId !== widget.id
                                ? "bg-neutral-500/90 border-neutral-300 scale-110 shadow-neutral-300/50"
                                : "bg-neutral-600/70 border-neutral-400/80 hover:bg-neutral-500/80 hover:scale-125 hover:border-neutral-300"
                          }`}
                          style={{ left: "-7px", pointerEvents: "auto", zIndex: 1000 }}
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            handleHandleMouseDown(e, widget.id, "input");
                          }}
                        />
                        <div
                          className={`absolute right-0 top-1/2 -translate-y-1/2 flow-handle flow-handle-source w-3.5 h-3.5 rounded-full border-2 cursor-pointer transition-all duration-200 shadow-lg ${
                            draggingHandle?.nodeId === widget.id && draggingHandle?.handleType === "output"
                              ? "bg-neutral-400 border-neutral-200 scale-150 shadow-neutral-400/50"
                              : connecting && connecting.sourceId === widget.id
                                ? "bg-neutral-500/90 border-neutral-300 scale-110 shadow-neutral-300/50"
                                : "bg-neutral-600/70 border-neutral-400/80 hover:bg-neutral-500/80 hover:scale-125 hover:border-neutral-300"
                          }`}
                          style={{ right: "-7px", pointerEvents: "auto", zIndex: 1000 }}
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            handleHandleMouseDown(e, widget.id, "output");
                          }}
                        />
                        <textarea
                          className="bg-transparent outline-none resize-none overflow-hidden"
                          style={{
                            fontSize: widget.style?.fontSize || 16,
                            textAlign: widget.style?.textAlign || "left",
                            color: widget.style?.color || "#ffffff",
                            fontFamily: widget.style?.fontFamily || "Inter",
                            width: `${textWidth}px`,
                            minWidth: "100px",
                            height: `${textHeight}px`,
                          }}
                          value={widget.content}
                          onChange={(e) => updateWidget(widget.id, "content", e.target.value)}
                          placeholder="Type something..."
                        />
                        {isSelected && (
                          <div className="absolute -top-6 left-0 bg-neutral-600 text-white text-[10px] px-1 rounded">
                            Text
                          </div>
                        )}
                      </div>
                    );
                  }

                  // --- RENDER STANDARD NODES ---
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

                  const isPromptNode = widget.isPromptNode;

                  return (
                    <div
                      key={widget.id}
                      className="absolute z-20"
                      style={{ left: widget.x, top: widget.y }}
                    >
                      <ResizableNodeWrapper
                        id={widget.id}
                        width={widget.width || 280}
                        height={widget.height || 200}
                        onResizeNode={onResizeNode}
                        onMouseDown={(e) => handleMouseDown(e, widget.id, "move")}
                      >
                      <div className="flow-node w-full h-full bg-gradient-to-br from-[#000000] via-[#050505] to-[#000000] border-0 rounded-xl flex flex-col">
                      {/* Handles - INPUT AND OUTPUT BALLS */}
                      <div
                        className={`absolute left-0 top-1/2 -translate-y-1/2 flow-handle flow-handle-target w-3.5 h-3.5 rounded-full border-2 cursor-pointer transition-all duration-200 shadow-lg ${
                          draggingHandle?.nodeId === widget.id && draggingHandle?.handleType === "input"
                            ? "bg-neutral-400 border-neutral-200 scale-150 shadow-neutral-400/50"
                            : connecting && connecting.sourceId !== widget.id
                              ? "bg-neutral-500/90 border-neutral-300 scale-110 shadow-neutral-300/50"
                              : "bg-neutral-600/70 border-neutral-400/80 hover:bg-neutral-500/80 hover:scale-125 hover:border-neutral-300"
                        }`}
                        style={{ left: "-7px", pointerEvents: "auto", zIndex: 1000 }}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          handleHandleMouseDown(e, widget.id, "input");
                        }}
                      />
                      <div
                        className={`absolute right-0 top-1/2 -translate-y-1/2 flow-handle flow-handle-source w-3.5 h-3.5 rounded-full border-2 cursor-pointer transition-all duration-200 shadow-lg ${
                          draggingHandle?.nodeId === widget.id && draggingHandle?.handleType === "output"
                            ? "bg-neutral-400 border-neutral-200 scale-150 shadow-neutral-400/50"
                            : connecting && connecting.sourceId === widget.id
                              ? "bg-neutral-500/90 border-neutral-300 scale-110 shadow-neutral-300/50"
                              : "bg-neutral-600/70 border-neutral-400/80 hover:bg-neutral-500/80 hover:scale-125 hover:border-neutral-300"
                        }`}
                        style={{ right: "-7px", pointerEvents: "auto", zIndex: 1000 }}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          handleHandleMouseDown(e, widget.id, "output");
                        }}
                      />

                        {/* Content */}
                        <div className="px-3 py-2 border-b border-neutral-800 bg-gradient-to-br from-[#000000] via-[#050505] to-[#000000] flex items-center gap-2 flex-shrink-0">
                          <div className={`p-1 rounded-md bg-neutral-800/50 ${accentColor}`}>
                            <Icon size={14} />
                          </div>
                          <span className="node-title text-sm font-semibold text-neutral-200">
                            {widget.title || "Node"}
                          </span>
                        {isPromptNode && (
                          <div className="ml-auto flex items-center gap-1 text-neutral-400">
                            <button
                              className="p-1 rounded hover:bg-neutral-800"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopyPrompt(widget.content || "");
                              }}
                              title="Copy prompt"
                            >
                              <Copy size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                        
                        {/* Generate Button for Prompt Nodes */}
                        {isPromptNode && (
                          <div className="px-3 py-2 border-b border-neutral-800/50 bg-neutral-900/30 flex-shrink-0">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                refreshPromptNode(widget.id);
                                toast.success("Prompt generated!");
                              }}
                              className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white text-sm font-medium rounded-lg transition-all duration-200 shadow-lg shadow-purple-900/30"
                            >
                              <Sparkles size={14} className="animate-pulse" />
                              Generate Prompt
                            </button>
                          </div>
                        )}
                        
                        <div className="flex-1 bg-gradient-to-br from-[#000000] via-[#050505] to-[#000000] p-4 flow-node-scroll">
                          {isPromptNode ? (
                            <textarea
                              readOnly
                              className="w-full h-full bg-gradient-to-br from-[#000000] via-[#050505] to-[#000000] text-neutral-200 text-sm font-mono resize-none outline-none leading-relaxed flow-node-scroll"
                              value={widget.content || PROMPT_PLACEHOLDER}
                              onMouseDown={(e) => e.stopPropagation()}
                            />
                          ) : (
                            <textarea
                              className="w-full h-full bg-gradient-to-br from-[#000000] via-[#050505] to-[#000000] text-neutral-200 text-sm font-mono resize-none outline-none leading-relaxed flow-node-scroll"
                              value={widget.content || ""}
                              onChange={(e) => updateWidget(widget.id, "content", e.target.value)}
                              onMouseDown={(e) => e.stopPropagation()}
                              placeholder="Content..."
                            />
                          )}
                        </div>
                      </div>
                    </ResizableNodeWrapper>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Side Drawer (Categories) */}
            <AnimatePresence>
              {showCategories && (
                <motion.div
                  initial={{ x: 320, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 320, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="absolute top-20 right-4 w-80 bg-gradient-to-br from-[#000000] via-[#050505] to-[#000000] border border-neutral-800 rounded-xl z-40 flex flex-col max-h-[calc(100vh-100px)] overflow-hidden"
                >
                  {/* Drawer Header */}
                  <div className="p-4 border-b border-neutral-800 bg-gradient-to-br from-[#000000] via-[#050505] to-[#000000]">
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
                  <div className="flex-1 overflow-y-auto custom-scrollbar p-2 bg-gradient-to-br from-[#000000] via-[#050505] to-[#000000]">
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

                    {/* NEW: Flows Section (Renamed from Templates) */}
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
                              {/* Website Template Button */}
                              <button
                                onClick={() => handleCreateWebsiteFlowPreset()}
                                className="w-full flex items-center gap-3 p-2 hover:bg-neutral-800/50 rounded-lg group transition-colors text-left cursor-pointer"
                              >
                                <div className="p-1.5 rounded-md bg-neutral-900 text-neutral-300 group-hover:bg-neutral-800 flex-shrink-0">
                                  <Globe size={14} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <span className="block text-xs font-medium text-neutral-300 group-hover:text-white">
                                    Website
                                  </span>
                                  <span className="block text-[10px] text-neutral-500 truncate">
                                    Complete website flow preset
                                  </span>
                                </div>
                                <Plus
                                  size={12}
                                  className="text-neutral-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                                />
                              </button>

                              {/* App Template Button */}
                              <button
                                onClick={() => handleCreateAppFlowPreset()}
                                className="w-full flex items-center gap-3 p-2 hover:bg-neutral-800/50 rounded-lg group transition-colors text-left cursor-pointer"
                              >
                                <div className="p-1.5 rounded-md bg-neutral-900 text-neutral-300 group-hover:bg-neutral-800 flex-shrink-0">
                                  <Smartphone size={14} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <span className="block text-xs font-medium text-neutral-300 group-hover:text-white">
                                    App
                                  </span>
                                  <span className="block text-[10px] text-neutral-500 truncate">
                                    Complete app flow preset
                                  </span>
                                </div>
                                <Plus
                                  size={12}
                                  className="text-neutral-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                                />
                              </button>

                              {/* Game Template Button */}
                              <button
                                onClick={() => handleCreateGameFlowPreset()}
                                className="w-full flex items-center gap-3 p-2 hover:bg-neutral-800/50 rounded-lg group transition-colors text-left cursor-pointer"
                              >
                                <div className="p-1.5 rounded-md bg-neutral-900 text-neutral-300 group-hover:bg-neutral-800 flex-shrink-0">
                                  <Gamepad2 size={14} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <span className="block text-xs font-medium text-neutral-300 group-hover:text-white">
                                    Game
                                  </span>
                                  <span className="block text-[10px] text-neutral-500 truncate">
                                    Complete game flow preset
                                  </span>
                                </div>
                                <Plus
                                  size={12}
                                  className="text-neutral-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                                />
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* NEW: Templates Section (Under Flows) */}
                    <div className="mb-2">
                      <button
                        onClick={() => toggleSection("templates")}
                        className="w-full flex items-center justify-between p-2 text-xs font-semibold text-neutral-400 hover:text-white transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <LayoutTemplate size={14} className="text-neutral-500" />
                          Templates
                        </div>

                        {expandedSections.templates ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </button>

                      <AnimatePresence>
                        {expandedSections.templates && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: "auto" }}
                            exit={{ height: 0 }}
                            transition={{ duration: 0.2, ease: "easeInOut" }}
                            className="overflow-hidden"
                          >
                            <div className="pl-2 space-y-1 mt-1">
                              {/* Login Flow Template */}
                              <button
                                onClick={() => handleCreateLoginFlowTemplate()}
                                className="w-full flex items-center gap-3 p-2 hover:bg-neutral-800/50 rounded-lg group transition-colors text-left cursor-pointer"
                              >
                                <div className="p-1.5 rounded-md bg-neutral-900 text-neutral-300 group-hover:bg-neutral-800 flex-shrink-0">
                                  <UserCheck size={14} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <span className="block text-xs font-medium text-neutral-300 group-hover:text-white">
                                    Login Flow
                                  </span>
                                  <span className="block text-[10px] text-neutral-500 truncate">
                                    Simple auth process
                                  </span>
                                </div>
                                <Plus
                                  size={12}
                                  className="text-neutral-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                                />
                              </button>

                              {/* Feedback Flow Template */}
                              <button
                                onClick={() => handleCreateFeedbackFlowTemplate()}
                                className="w-full flex items-center gap-3 p-2 hover:bg-neutral-800/50 rounded-lg group transition-colors text-left cursor-pointer"
                              >
                                <div className="p-1.5 rounded-md bg-neutral-900 text-neutral-300 group-hover:bg-neutral-800 flex-shrink-0">
                                  <MessageCircle size={14} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <span className="block text-xs font-medium text-neutral-300 group-hover:text-white">
                                    Feedback Loop
                                  </span>
                                  <span className="block text-[10px] text-neutral-500 truncate">
                                    Input {"->"} Sentiment {"->"} Save
                                  </span>
                                </div>
                                <Plus
                                  size={12}
                                  className="text-neutral-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                                />
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* NEW: Beymflow Tools Section (Under Templates) */}
                    <div className="mb-2">
                      <button
                        onClick={() => toggleSection("beymflowTools")}
                        className="w-full flex items-center justify-between p-2 text-xs font-semibold text-neutral-400 hover:text-white transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Box size={14} className="text-neutral-500" />
                          Beymflow tools
                        </div>
                        {expandedSections.beymflowTools ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </button>

                      <AnimatePresence>
                        {expandedSections.beymflowTools && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="pl-2 space-y-1 mt-1">
                              {/* Prompt Scanner Node */}
                              <button
                                onClick={() => handleAddPromptScanner()}
                                className="w-full flex items-center gap-3 p-2 hover:bg-neutral-800/50 rounded-lg group transition-colors text-left cursor-pointer"
                              >
                                <div className="p-1.5 rounded-md bg-neutral-900 text-neutral-300 group-hover:bg-neutral-800 flex-shrink-0">
                                  <Search size={14} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <span className="block text-xs font-medium text-neutral-300 group-hover:text-white">
                                    Prompt Scanner
                                  </span>
                                  <span className="block text-[10px] text-neutral-500 truncate">
                                    Verify prompt functionality
                                  </span>
                                </div>
                                <Plus
                                  size={12}
                                  className="text-neutral-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                                />
                              </button>

                              {/* Prompt Library Node */}
                              <button
                                onClick={() => handleAddPromptLibrary()}
                                className="w-full flex items-center gap-3 p-2 hover:bg-neutral-800/50 rounded-lg group transition-colors text-left cursor-pointer"
                              >
                                <div className="p-1.5 rounded-md bg-neutral-900 text-neutral-300 group-hover:bg-neutral-800 flex-shrink-0">
                                  <FolderKanban size={14} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <span className="block text-xs font-medium text-neutral-300 group-hover:text-white">
                                    Prompt Library
                                  </span>
                                  <span className="block text-[10px] text-neutral-500 truncate">
                                    Your purchased prompts
                                  </span>
                                </div>
                                <Plus
                                  size={12}
                                  className="text-neutral-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                                />
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* NEW: Prompt Window (Top Level) */}
                    <div className="mb-2 border-t border-neutral-800 pt-2 mt-2">
                      <button
                        onClick={() => !hasPromptWindow && handleAddPromptWindow()}
                        disabled={hasPromptWindow}
                        className={`w-full flex items-center gap-3 p-2 rounded-lg group transition-colors text-left cursor-pointer ${
                          hasPromptWindow
                            ? "opacity-60 cursor-not-allowed"
                            : "hover:bg-neutral-800/50"
                        }`}
                      >
                        <div className="p-1.5 rounded-md bg-neutral-900 text-neutral-300 group-hover:bg-neutral-800 flex-shrink-0">
                          <Layout size={14} className="text-yellow-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="block text-xs font-medium text-neutral-300 group-hover:text-white">
                            Prompt Window
                          </span>
                          <span className="block text-[10px] text-neutral-500 truncate">Prompt preview & editor</span>
                        </div>
                        <Plus
                          size={12}
                          className={`text-neutral-500 transition-opacity flex-shrink-0 ${
                            hasPromptWindow ? "opacity-40" : "opacity-0 group-hover:opacity-100"
                          }`}
                        />
                      </button>
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
  return (
    <MockAuthProvider>
      <FlowStateProvider>
        <Toaster position="top-center" />
        <FlowEngineContent {...props} />
      </FlowStateProvider>
    </MockAuthProvider>
  );
};

export default FlowEngineUnified;
