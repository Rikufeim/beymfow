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
import { toast, Toaster } from "@/lib/notifications";
import { HexColorPicker } from "react-colorful";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { GlassButton } from "@/components/ui/glass-button";
import { cn } from "@/lib/utils";
import BrandIdentityNode, { BrandIdentityFields } from "@/components/flow-nodes/BrandIdentityNode";
import { AVAILABLE_FONTS } from "@/components/flow-nodes/FontSelect";
// import ResizableNode from "@/components/flow-nodes/ResizableNode"; // Temporarily disabled - react-rnd not installed
import { getLayoutedElements } from "@/lib/flowLayout";
import { ResizableNodeWrapper } from "@/components/flow-nodes/ResizableNodeWrapper";
import { QuickPromptGenerator } from "@/components/QuickPromptGenerator";
import { ProjectTypeSelector, ProjectType } from "@/components/flow-engine/ProjectTypeSelector";
import { HeroBackgroundWorkspace, DEFAULT_SETTINGS } from "@/components/flow-engine/HeroBackgroundWorkspace";
import { 
  loadLocalProjects as loadHeroProjects, 
  deleteProject as deleteHeroProject,
  generateProjectName as generateHeroProjectName,
  type HeroBackgroundProject 
} from "@/lib/heroProjectStore";
import { FlowEngineSidebar, type FlowEngineView } from "@/components/flow-engine/FlowEngineSidebar";

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
  const [showProjectsDropdown, setShowProjectsDropdown] = useState(false);
  const [referenceProject, setReferenceProject] = useState<SavedFlowProject | null>(null);
  const projectsTabRef = useRef<HTMLButtonElement>(null);
  const templatesTabRef = useRef<HTMLButtonElement>(null);
  const [activeTabWidth, setActiveTabWidth] = useState<number | null>(null);
  
  // Sidebar view state
  const [activeView, setActiveView] = useState<FlowEngineView>("recents");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

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

  // --- Preview State ---
  const [activePageSpec, setActivePageSpec] = useState<any | null>(null);
  const [showPageSpecPreview, setShowPageSpecPreview] = useState(false);

  // --- Project Type Selector State ---
  const [showProjectTypeSelector, setShowProjectTypeSelector] = useState(false);
  const [activeWorkspace, setActiveWorkspace] = useState<"flow" | "hero-background" | null>(null);
  
  // --- Hero Background Projects State ---
  const [heroProjects, setHeroProjects] = useState<HeroBackgroundProject[]>([]);
  const [selectedHeroProject, setSelectedHeroProject] = useState<HeroBackgroundProject | null>(null);

  // Load hero projects on mount
  useEffect(() => {
    setHeroProjects(loadHeroProjects());
  }, []);

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
  const [canvasTransform, setCanvasTransform] = useState({ translateX: 0, translateY: 0, scale: 1 });

  // Removed automatic prompt window creation - user must add it manually

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

  // Removed landing chat effects - QuickPromptGenerator handles its own UI

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
    // First, check if this is a PAGE_SPEC
    const pageSpec = extractPageSpec(input);
    if (pageSpec) {
      setActivePageSpec(pageSpec);
      setShowPageSpecPreview(true);
      // Input cleared by QuickPromptGenerator
      toast.success("Page spec loaded! Opening preview...");
      return;
    }

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

      // Stay in landing view - workspace removed
      setIsLoading(false);
      setShowCategories(false);
      // Input cleared by QuickPromptGenerator
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
        setProjectName(`${templateType} Template`);
        // Fit view to show all nodes with padding (no delay so the first render is close)
        fitViewToNodes(cleanedNodes);
      } else {
        toast.success(`${templateType} Template added to workspace`);
      }

      // Stay in landing view - workspace removed
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

  // Auto-save (works in landing view now)
  useEffect(() => {
    if (!user || widgets.length === 0) return;
    const autoSaveInterval = setInterval(() => {
      saveCurrentProject(true);
    }, 30000);
    return () => clearInterval(autoSaveInterval);
  }, [user, widgets, saveCurrentProject]);

  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (!user || widgets.length === 0) return;
    if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);
    autoSaveTimeoutRef.current = setTimeout(() => {
      saveCurrentProject(true);
    }, 5000);
    return () => {
      if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);
    };
  }, [widgets, edges, user]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (user && widgets.length > 0) {
        saveCurrentProject(true);
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [user, widgets, saveCurrentProject]);

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
    // Stay in landing view - workspace removed
  };

  const deleteProject = (projectId: string) => {
    if (!user) return;
    const updated = savedProjects.filter((p) => p.id !== projectId);
    const userKey = `${FLOW_PROJECTS_KEY}.${user.id}`;
    localStorage.setItem(userKey, JSON.stringify(updated));
    setSavedProjects(updated);
  };

  const createNewProject = () => {
    // Show project type selector instead of immediately creating
    setShowProjectTypeSelector(true);
  };

  const handleProjectTypeSelect = (type: ProjectType) => {
    setShowProjectTypeSelector(false);
    
    if (type === "hero-background") {
      // Create new hero project
      setSelectedHeroProject(null);
      setActiveWorkspace("hero-background");
    } else {
      // Default flow workspace behavior
      setActiveWorkspace(null);
      setCurrentProjectId(null);
      setProjectName("Untitled Project");
      setWidgets([]);
      setEdges([]);
      setNodeOutputMap({});
      setMainPromptState({ sections: [], combinedPrompt: "" });
      setCanvasTransform({ translateX: 0, translateY: 0, scale: 1 });
    }
  };

  const handleOpenHeroProject = (project: HeroBackgroundProject) => {
    setSelectedHeroProject(project);
    setActiveWorkspace("hero-background");
  };

  const handleDeleteHeroProject = (projectId: string) => {
    deleteHeroProject(projectId);
    setHeroProjects(loadHeroProjects());
  };

  const handleHeroWorkspaceBack = () => {
    setActiveWorkspace(null);
    setSelectedHeroProject(null);
    // Reload hero projects to show updated list
    setHeroProjects(loadHeroProjects());
  };

  const handleHeroProjectSave = (project: HeroBackgroundProject) => {
    setHeroProjects(loadHeroProjects());
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
      // Special handling for "Prompt Generator" node (website-prompt-output)
      // This node should aggregate all website node data from GLOBAL STATE
      const promptNode = allWidgets.find(w => w.id === promptNodeId);
      const isPromptGenerator = promptNodeId === "website-prompt-output" || 
          promptNode?.title === "Step 7 – Prompt Structure" ||
          promptNode?.title === "Prompt Generator";
      
      if (isPromptGenerator) {
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
    // Find nodes that should display generated prompts (Prompt Generator)
    const promptGeneratorNode = widgets.find(
      (w) => w.id === "website-prompt-output" || w.title === "Prompt Generator" || w.title === "Step 7 – Prompt Structure" || w.isPromptNode
    );
    
    if (!promptGeneratorNode) return;

    const builtPrompt = buildPromptForPromptNode(promptGeneratorNode.id, widgets, edges);
    const finalContent = builtPrompt || PROMPT_PLACEHOLDER;

    // Only update if content changed
    if (promptGeneratorNode.content !== finalContent) {
      setWidgets((prev) =>
        prev.map((widget) =>
          widget.id === promptGeneratorNode.id ? { ...widget, content: finalContent } : widget
        )
      );
    }
  }, [nodeData, edges, buildPromptForPromptNode]); // React to nodeData changes for real-time updates

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

  // Manual generation for website prompt is triggered via the Step 7 button.
  // AUTO-UPDATE DISABLED for website-prompt-output to allow users to write custom notes.


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
    // Special handling: website flow uses Step 7 node to generate prompt into Prompt Generator window
    if (promptNodeId === "website-prompt-output") {
      const hasWebsiteSections = widgets.some(
        (w) => w.type === "website-section" || w.type === "brandIdentity"
      );

      if (!hasWebsiteSections) return;

      const spec = buildWebsiteSpec(widgets);
      const builtPrompt = generateWebsitePrompt(spec);
      const finalContent = builtPrompt || PROMPT_PLACEHOLDER;

      setWidgets((prev) =>
        prev.map((widget) =>
          widget.id === "website-prompt-window"
            ? { ...widget, content: finalContent }
            : widget
        )
      );
      return;
    }

    const builtPrompt = buildPromptForPromptNode(promptNodeId, widgets, edges);
    const finalContent = builtPrompt || PROMPT_PLACEHOLDER;

    setWidgets((prev) =>
      prev.map((widget) =>
        widget.id === promptNodeId ? { ...widget, content: finalContent } : widget
      )
    );
  };


  // --- Flow Preset Creators ---
  const createWebsiteFlowPreset = () => {
    // ALL NODES ON SAME ROW - Horizontal layout for better visibility
    const startX = -200;
    const startY = 100; // Single row
    const horizontalGap = 340; // Space between nodes

    const nodes: Widget[] = [
      // All nodes on the same horizontal row
      {
        id: "website-user-input",
        type: "flow-input",
        title: "Step 1 – User Input",
        placeholder: "Describe the website / client / product...",
        x: startX,
        y: startY,
        width: 280,
        height: 180,
        content: "",
      },
      {
        id: "website-brand-identity",
        type: "brandIdentity",
        title: "Brand Identity",
        x: startX + horizontalGap * 1,
        y: startY,
        width: 320,
        height: 320,
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
        title: "Website Purpose",
        x: startX + horizontalGap * 2,
        y: startY,
        width: 280,
        height: 240,
        websiteData: {
          title: "Website Purpose",
          fields: {
            problem: "",
            targetAudience: "",
          },
        },
      },
      {
        id: "website-seo-structure",
        type: "website-section",
        title: "SEO & Structure",
        x: startX + horizontalGap * 3,
        y: startY,
        width: 280,
        height: 240,
        websiteData: {
          title: "SEO & Structure",
          fields: {
            keywords: "",
            metaDescriptions: "",
          },
        },
      },
      {
        id: "website-functional-requirements",
        type: "website-section",
        title: "Functional Requirements",
        x: startX + horizontalGap * 4,
        y: startY,
        width: 280,
        height: 240,
        websiteData: {
          title: "Functional Requirements",
          fields: {
            ctas: "",
            animations: "",
          },
        },
      },
      {
        id: "website-content-inputs",
        type: "website-section",
        title: "Content Inputs",
        x: startX + horizontalGap * 5,
        y: startY,
        width: 280,
        height: 240,
        websiteData: {
          title: "Content Inputs",
          fields: {
            copy: "",
            offers: "",
          },
        },
      },
      // Internal prompt source node (not the visible generator)
      {
        id: "website-prompt-output",
        type: "flow-text-gen",
        title: "Prompt Source",
        x: startX + horizontalGap * 6,
        y: startY,
        width: 360,
        height: 400,
        content: "",
        isPromptNode: true,
      },
      // Visible Prompt Generator window (connected to Prompt Source)
      {
        id: "website-prompt-window",
        type: "prompt-window",
        title: "Prompt Generator",
        x: startX + horizontalGap * 7,
        y: startY,
        width: 420,
        height: 420,
        content: "",
        promptMode: "preview",
      },
    ];

    // Linear pipeline edges - all nodes feed into Prompt Source, then Prompt Generator window
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

  // Extract and parse PAGE_SPEC from message
  const extractPageSpec = useCallback((message: string): any | null => {
    try {
      // Find content between <PAGE_SPEC> and </PAGE_SPEC> tags
      // Support both <PAGE_SPEC> and <PAGE_SPEC version="1"> formats
      const regex = /<PAGE_SPEC(?:\s+[^>]*)?>([\s\S]*?)<\/PAGE_SPEC>/i;
      const match = message.match(regex);
      
      if (!match || !match[1]) {
        return null;
      }

      const specContent = match[1].trim();
      const parsed = JSON.parse(specContent);

      // Validate minimal shape
      if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.sections)) {
        console.warn('Invalid PAGE_SPEC: missing sections array');
        return null;
      }

      return parsed;
    } catch (error) {
      console.error('Failed to parse PAGE_SPEC:', error);
      return null;
    }
  }, []);

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
        if (selectionBox) {
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
    };

    if (dragging || resizing || draggingHandle || selectionBox || connecting) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [
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
  // Always show landing view - workspace removed
  return (
    <div className="h-screen bg-black text-neutral-200 relative flex font-sans overflow-hidden selection:bg-neutral-800 selection:text-white">
      {/* Sidebar */}
      <FlowEngineSidebar
        activeView={activeView}
        onViewChange={setActiveView}
        isCollapsed={isSidebarCollapsed}
        onCollapsedChange={setIsSidebarCollapsed}
        className="flex-shrink-0"
      />

      <main className="flex-1 flex flex-col min-h-screen overflow-y-auto relative">
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
              <AnimatePresence mode="wait">
                {activeView === "prompt-generator" ? (
                  <motion.div 
                    key="prompt-generator"
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, y: -20 }}
                    className="flex flex-col gap-8"
                  >
                    {/* Beymflow Brand Section */}
                    <div className="flex items-center justify-center gap-0 mt-4 mb-3 w-full max-w-3xl mx-auto">
                      <img
                        src="/images/beymflow-logo.png"
                        alt="Beymflow Logo"
                        className="h-14 sm:h-16 md:h-20 w-auto object-contain flex-shrink-0"
                      />
                      <span className="text-white font-semibold text-4xl -ml-1">
                        Beymflow
                      </span>
                    </div>

                    {/* Prompt Input Section */}
                    <div className="w-full max-w-4xl mx-auto">
                      <QuickPromptGenerator />
                    </div>

                    {/* Mode Buttons */}
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
                  </motion.div>
                ) : (
                  <motion.div 
                    key="projects-view"
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, y: -20 }}
                    className="flex flex-col gap-8"
                  >
                    {/* Page Title */}
                    <div className="mt-4 mb-3">
                      <h1 className="text-3xl font-semibold text-white">
                        {activeView === "recents" ? "Recent Projects" : 
                         activeView === "all-projects" ? "All Projects" :
                         activeView === "drafts" ? "Drafts" :
                         activeView === "resources" ? "Resources" :
                         activeView === "trash" ? "Trash" : "Projects"}
                      </h1>
                      <p className="text-neutral-400 mt-2">
                        {activeView === "recents" ? "Your recently opened projects" : 
                         activeView === "all-projects" ? "All your projects in one place" :
                         activeView === "drafts" ? "Work in progress" :
                         activeView === "resources" ? "Templates and resources" :
                         activeView === "trash" ? "Deleted projects" : ""}
                      </p>
                    </div>

                    {/* Tabs (My Projects / Templates) */}
                    <div className="flex items-center gap-6 pb-2 relative">
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
                        {(user && (savedProjects.length > 0 || heroProjects.length > 0)) ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Hero Background Projects */}
                        {heroProjects.map((project) => (
                          <div key={project.id} className="min-h-[11rem]">
                            <div className={cn("relative h-full rounded-2xl border border-white/10 p-[1px]")} style={{ transform: 'translateZ(0)', willChange: 'transform' }}>
                              <GlowingEffect spread={40} glow disabled={false} proximity={64} inactiveZone={0.01} borderWidth={2} className="opacity-70" />
                              <div
                                className="group relative flex h-full flex-col justify-between gap-4 rounded-[1.05rem] overflow-hidden will-change-transform cursor-pointer text-left"
                                style={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden' }}
                                onClick={() => handleOpenHeroProject(project)}
                              >
                                {/* Thumbnail background */}
                                {project.thumbnail ? (
                                  <div className="absolute inset-0 z-0">
                                    <img src={project.thumbnail} alt="" className="w-full h-full object-cover opacity-60" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                                  </div>
                                ) : (
                                  <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#000000] via-[#050505] to-[#000000]" />
                                )}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteHeroProject(project.id);
                                  }}
                                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-neutral-700 text-neutral-500 hover:text-red-400 transition-all z-20"
                                >
                                  <X size={14} />
                                </button>
                                <div className="relative z-10 flex flex-col justify-end gap-2 h-full p-5 sm:p-6">
                                  <div className="flex items-center gap-2">
                                    <div className="px-2 py-0.5 rounded text-[10px] bg-orange-500/20 text-orange-400 border border-orange-500/30">
                                      Hero BG
                                    </div>
                                  </div>
                                  <h3 className="text-lg font-semibold tracking-tight text-white/90 truncate">{project.name}</h3>
                                  <p className="text-xs text-neutral-400">
                                    {new Date(project.updatedAt).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                        {/* Flow Projects */}
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

                    {/* Add Template */}
                    <div className="min-h-[11rem]">
                      <div className={cn("relative h-full rounded-2xl border border-white/10 p-[1px]")} style={{ transform: 'translateZ(0)', willChange: 'transform' }}>
                        <GlowingEffect spread={40} glow disabled={false} proximity={64} inactiveZone={0.01} borderWidth={2} className="opacity-70" />
                    <div
                          className="group relative flex h-full flex-col justify-between gap-4 rounded-[1.05rem] bg-gradient-to-br from-[#000000] via-[#050505] to-[#000000] p-5 sm:p-6 md:p-8 overflow-hidden will-change-transform cursor-default text-left"
                          style={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden' }}
                    >
                          <div className="absolute top-2 right-2 z-20">
                            <div className="px-2 py-0.5 rounded text-[10px] bg-white/5 text-white/70 border border-white/10">
                              Coming Soon
                            </div>
                          </div>
                          <div className="relative z-10 flex flex-col justify-between gap-4 h-full">
                            <div className="flex flex-col gap-3">
                              <div className="flex items-center gap-3">
                                <div className="w-fit rounded-lg border border-white/10 bg-white/5 p-2">
                                  <Plus className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="text-lg md:text-xl font-semibold tracking-tight text-white/85">
                                  Add Template
                                </h3>
                              </div>
                              <div className="space-y-2">
                                <p className="text-xs leading-relaxed text-white/70 md:text-base">
                                  Bring your own flow template. Upload and reuse custom workflows (coming soon).
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
                )}
              </AnimatePresence>
            </div>
          </main>

      {/* PageSpec Preview Modal */}
      <AnimatePresence>
        {showPageSpecPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-6xl h-[90vh] bg-neutral-900 border border-neutral-800 rounded-xl flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="h-14 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between px-4 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowPageSpecPreview(false)}
                    className="p-2 hover:bg-neutral-800 rounded transition-colors"
                  >
                    <X size={20} className="text-neutral-400" />
                  </button>
                  <h2 className="text-white font-semibold">
                    {activePageSpec?.metadata?.title || "Landing Page Preview"}
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral-500">
                    {activePageSpec?.sections?.length || 0} sections
                  </span>
                </div>
              </div>
              
              {/* Preview Content */}
              <div className="flex-1 overflow-hidden">
                {activePageSpec ? (
                  <div className="flex flex-col items-center justify-center h-full text-neutral-500 p-8 text-center">
                    <LayoutTemplate size={48} className="mb-4 text-neutral-600" />
                    <p className="text-lg mb-2">Page spec preview coming soon</p>
                    <p className="text-sm text-neutral-600">
                      Feature is under development
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-neutral-500 p-8 text-center">
                    <LayoutTemplate size={48} className="mb-4 text-neutral-600" />
                    <p className="text-lg mb-2">No page spec loaded</p>
                    <p className="text-sm text-neutral-600">
                      Paste a PAGE_SPEC into the chat input to preview a landing page
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Project Type Selector Modal */}
      <ProjectTypeSelector
        isOpen={showProjectTypeSelector}
        onClose={() => setShowProjectTypeSelector(false)}
        onSelect={handleProjectTypeSelect}
      />

      {/* Hero Background Workspace */}
      {activeWorkspace === "hero-background" && (
        <HeroBackgroundWorkspace
          projectId={selectedHeroProject?.id}
          projectName={selectedHeroProject?.name || generateHeroProjectName()}
          initialSettings={selectedHeroProject?.settings || DEFAULT_SETTINGS}
          isLoggedIn={!!user}
          onBack={handleHeroWorkspaceBack}
          onSave={handleHeroProjectSave}
        />
      )}

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
