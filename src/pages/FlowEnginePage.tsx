// Full-screen grid background fix for Beymflow workspace
// Single source of truth: canvasTransform state controls both node transforms and background grid
// Background grid uses the same translate/scale transform as nodes for perfect synchronization
// Fixed zoom range: 0.25 to 2.0 (Flowise-like range)
// Background grid: CSS-based radial-gradient pattern, always visible, covers full viewport
// Grid rendered as absolute positioned layer with z-index: 0, behind all content (z-index: 1+)
// UPDATED: Fixed duplicate function declarations and JSX syntax errors.

import React, { useState, useRef, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
// import { useAuth } from "@/contexts/AuthContext"; // REMOVED: External dependency
import { toast, Toaster } from "sonner";

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
  Minus,
  Trash2,
  UserCheck,
  MessageCircle,
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

interface Widget {
  id: string;
  type: "prompt" | "category" | "flow-input" | "flow-text-gen" | "flow-agent" | "flow-state" | "flow-tool" | "text";
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

const AVAILABLE_FONTS = [
  "Inter",
  "Roboto",
  "Open Sans",
  "Lato",
  "Montserrat",
  "Poppins",
  "Playfair Display",
  "Merriweather",
  "Nunito",
  "Ubuntu",
];

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

const loadSavedProjects = (): SavedFlowProject[] => {
  try {
    return JSON.parse(localStorage.getItem(FLOW_PROJECTS_KEY) || "[]") || [];
  } catch {
    return [];
  }
};

const saveProjectsToStorage = (projects: SavedFlowProject[]) => {
  localStorage.setItem(FLOW_PROJECTS_KEY, JSON.stringify(projects));
};

const FlowEngineContent: React.FC<FlowEngineProps> = ({ onBack }) => {
  const navigate = useNavigate();
  const { user, login, logout } = useAuth();

  // --- State ---
  const [viewMode, setViewMode] = useState<"landing" | "workspace">("landing");
  const [landingTab, setLandingTab] = useState<"projects" | "templates">("projects");

  const [activeDomain, setActiveDomain] = useState<string>("Website");
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
    fontFamily: "Inter",
  });

  // Workspace State
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [showCategories, setShowCategories] = useState(false);

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
  });

  // Settings State
  const [showSettings, setShowSettings] = useState(false);

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

  // --- Domain Selection Logic & Template Loading (MOVED UP) ---
  const handleDomainSelection = (domainLabel: string) => {
    setIsLoading(true);
    setActiveDomain(domainLabel);

    setTimeout(() => {
      // --- UPDATED: Removed the mainPromptWidget creation ---

      // Reset canvas transform when entering workspace
      setCanvasTransform({ translateX: 100, translateY: 100, scale: 1 });
      setWidgets([]); // Start with empty workspace
      setEdges([]);
      setViewMode("workspace");
      setIsLoading(false);
      setShowCategories(false);
      setProjectName(`New ${domainLabel} Project`);
    }, 600);
  };

  const handleLoadTemplate = (templateType: "Website" | "App" | "Game") => {
    setIsLoading(true);
    setActiveDomain(templateType);

    setTimeout(() => {
      let presetData;
      if (templateType === "Website") presetData = createWebsiteFlowPreset();
      else if (templateType === "App") presetData = createAppFlowPreset();
      else presetData = createGameFlowPreset();

      const { nodes, edges } = presetData;

      // Calculate center pos
      const baseX = -100; // Offset slightly
      const baseY = 100;

      setCanvasTransform({ translateX: 100, translateY: 100, scale: 0.8 }); // Zoom out slightly for flow
      setWidgets(nodes);
      setEdges(edges);

      setCurrentProjectId(null); // New project
      setProjectName(`${templateType} Flow Template`);
      setViewMode("workspace");
      setIsLoading(false);
      setShowCategories(false);
    }, 600);
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

      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedWidgetIds.size > 0) {
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

          toast.success("Deleted selected items");
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

  const loadProject = (project: SavedFlowProject) => {
    setCurrentProjectId(project.id);
    setProjectName(project.name);
    setActiveDomain(project.domain);
    setWidgets(project.widgets);
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
    setWidgets([]);
    setEdges([]);
    setNodeOutputMap({});
    setMainPromptState({ sections: [], combinedPrompt: "" });
    setCanvasTransform({ translateX: 0, translateY: 0, scale: 1 });
  };

  const getMainPromptNodeId = (): string | null => {
    const finalNode = widgets.find((w) => w.id === "flow-text-final");
    return finalNode ? finalNode.id : null;
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
    setWidgets((prev) =>
      prev.map((w) => (w.id === widgetId ? { ...w, [field]: value } : w))
    );
  };

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

  // --- Flow Preset Creators ---
  const createWebsiteFlowPreset = () => {
    const nodes: Widget[] = [
      { id: "flow-input-1", type: "flow-input", title: "User Input", x: 50, y: 200, width: 200, height: 120, content: "" },
      { id: "flow-text-1", type: "flow-text-gen", title: "Idea Summary", x: 300, y: 100, width: 220, height: 150 },
      { id: "flow-text-2", type: "flow-text-gen", title: "Page Structure", x: 300, y: 300, width: 220, height: 150 },
      { id: "flow-text-final", type: "flow-text-gen", title: "Final Output", x: 600, y: 200, width: 260, height: 200 },
    ];
    const edges: Edge[] = [
      { id: "e1", source: "flow-input-1", target: "flow-text-1" },
      { id: "e2", source: "flow-input-1", target: "flow-text-2" },
      { id: "e3", source: "flow-text-1", target: "flow-text-final" },
      { id: "e4", source: "flow-text-2", target: "flow-text-final" },
    ];
    return { nodes, edges };
  };

  const createAppFlowPreset = () => {
    const nodes: Widget[] = [
      { id: "flow-input-1", type: "flow-input", title: "App Idea", x: 50, y: 200, width: 200, height: 120, content: "" },
      { id: "flow-text-1", type: "flow-text-gen", title: "Features", x: 300, y: 100, width: 220, height: 150 },
      { id: "flow-text-2", type: "flow-text-gen", title: "Tech Stack", x: 300, y: 300, width: 220, height: 150 },
      { id: "flow-text-final", type: "flow-text-gen", title: "Final Output", x: 600, y: 200, width: 260, height: 200 },
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
      { id: "flow-input-1", type: "flow-input", title: "Game Concept", x: 50, y: 200, width: 200, height: 120, content: "" },
      { id: "flow-text-1", type: "flow-text-gen", title: "Mechanics", x: 300, y: 100, width: 220, height: 150 },
      { id: "flow-text-2", type: "flow-text-gen", title: "Art Style", x: 300, y: 300, width: 220, height: 150 },
      { id: "flow-text-final", type: "flow-text-gen", title: "Final Output", x: 600, y: 200, width: 260, height: 200 },
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
      { id: "flow-input-1", type: "flow-input", title: "User Credentials", x: 50, y: 200, width: 200, height: 120, content: "" },
      { id: "flow-agent-1", type: "flow-agent", title: "Auth Agent", x: 300, y: 200, width: 220, height: 150 },
      { id: "flow-state-1", type: "flow-state", title: "Session State", x: 550, y: 200, width: 200, height: 120 },
    ];
    const edges: Edge[] = [
      { id: "e1", source: "flow-input-1", target: "flow-agent-1" },
      { id: "e2", source: "flow-agent-1", target: "flow-state-1" },
    ];
    setWidgets(nodes);
    setEdges(edges);
    setProjectName("Login Flow");
    setCurrentProjectId(null);
  };

  const handleCreateFeedbackFlowTemplate = () => {
    const nodes: Widget[] = [
      { id: "flow-input-1", type: "flow-input", title: "User Feedback", x: 50, y: 200, width: 200, height: 120, content: "" },
      { id: "flow-text-1", type: "flow-text-gen", title: "Sentiment Analysis", x: 300, y: 200, width: 220, height: 150 },
      { id: "flow-state-1", type: "flow-state", title: "Save Result", x: 550, y: 200, width: 200, height: 120 },
    ];
    const edges: Edge[] = [
      { id: "e1", source: "flow-input-1", target: "flow-text-1" },
      { id: "e2", source: "flow-text-1", target: "flow-state-1" },
    ];
    setWidgets(nodes);
    setEdges(edges);
    setProjectName("Feedback Loop");
    setCurrentProjectId(null);
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
    if ((e.target as HTMLElement).closest("textarea, input, button")) return;
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
        } else if (draggingHandle) {
          // Check if dragged far enough from handle to disconnect
          const handlePos = getHandlePosition(draggingHandle.nodeId, draggingHandle.handleType, widgets);

          const canvasX = (e.clientX - canvasTransform.translateX) / canvasTransform.scale;
          const canvasY = (e.clientY - canvasTransform.translateY) / canvasTransform.scale;

          const distance = Math.sqrt(Math.pow(canvasX - handlePos.x, 2) + Math.pow(canvasY - handlePos.y, 2));

          // If dragged more than 50px away, disconnect (will be finalized on mouse up)
          // Visual feedback: show disconnection state
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

    const handleMouseUp = () => {
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
      setLastDragPos(null);
      setResizing(null);
      setPanning(null);
    };

    if (panning || dragging || resizing || draggingHandle || selectionBox) {
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
    if (connecting && !target.closest(".flow-handle, .widget-container")) {
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
    // Handles are positioned at -4.5px from edge (half of 9px handle width)
    const handleX = handleType === "input" ? widget.x - 4.5 : widget.x + widget.width + 4.5;

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
            className="flex-1 flex flex-col items-center p-4 w-full max-w-4xl mx-auto z-10 pt-24 text-center min-h-screen overflow-y-auto"
          >
            {/* Home Button - Top Left */}
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

            {/* Login/New Project Button - Top Right */}
            {user ? (
              <button
                onClick={createNewProject}
                className="absolute top-6 right-6 p-2 rounded-full bg-neutral-900/50 backdrop-blur-md border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all flex items-center gap-2 font-sans"
              >
                <Plus size={20} />
                <span className="text-sm font-medium pr-1">Project</span>
              </button>
            ) : (
              <button
                onClick={login}
                className="absolute top-6 right-6 p-2 rounded-full bg-neutral-900/50 backdrop-blur-md border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all flex items-center gap-2 font-sans"
              >
                <LogIn size={20} />
                <span className="text-sm font-medium pr-1">Sign in</span>
              </button>
            )}

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12 w-full">
              <motion.h1
                className="text-3xl md:text-4xl font-bold tracking-tight text-white pb-6"
                style={{
                  fontFamily:
                    '"SF Pro Display", Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                }}
              >
                What are we building today?
              </motion.h1>

              {/* Main Selection Grid */}
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

              {/* NEW: Tabs for Projects vs Templates */}
              <div className="w-full mt-12 mb-6">
                <div className="flex items-center justify-center gap-6 border-b border-neutral-800 pb-2">
                  <button
                    onClick={() => setLandingTab("projects")}
                    className={`pb-2 px-2 text-sm font-medium transition-colors relative ${
                      landingTab === "projects" ? "text-white" : "text-neutral-500 hover:text-neutral-300"
                    }`}
                  >
                    My Projects
                    {landingTab === "projects" && (
                      <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-500" />
                    )}
                  </button>
                  <button
                    onClick={() => setLandingTab("templates")}
                    className={`pb-2 px-2 text-sm font-medium transition-colors relative ${
                      landingTab === "templates" ? "text-white" : "text-neutral-500 hover:text-neutral-300"
                    }`}
                  >
                    Templates
                    {landingTab === "templates" && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500"
                      />
                    )}
                  </button>
                </div>
              </div>

              {/* Saved Projects Section */}
              {landingTab === "projects" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="w-full"
                >
                  {user && savedProjects.length > 0 ? (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {savedProjects.map((project) => {
                          const DomainIcon = suggestionChips.find((c) => c.label === project.domain)?.icon || Globe;
                          return (
                            <div
                              key={project.id}
                              className="group relative p-4 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 hover:bg-neutral-800/50 transition-all cursor-pointer text-left"
                              onClick={() => loadProject(project)}
                            >
                              <div className="flex items-start justify-between mb-3">
                                <DomainIcon className="w-5 h-5 text-neutral-500" />
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteProject(project.id);
                                  }}
                                  className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-neutral-700 text-neutral-500 hover:text-red-400 transition-all"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                              <h3 className="text-sm font-medium text-white truncate mb-1">{project.name}</h3>
                              <p className="text-xs text-neutral-500">
                                {new Date(project.updatedAt).toLocaleDateString()}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  ) : (
                    <div className="text-neutral-500 py-10">
                      {user ? "No saved projects yet." : "Sign in to see your projects."}
                    </div>
                  )}

                  {/* Login prompt for non-logged in users */}
                  {!user && (
                    <div className="w-full mt-4">
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
              )}

              {/* Templates List Section */}
              {landingTab === "templates" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="w-full"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Website Template */}
                    <div
                      className="group relative p-4 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-blue-500/30 hover:bg-neutral-800/50 transition-all cursor-pointer text-left"
                      onClick={() => !isLoading && handleLoadTemplate("Website")}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                          <LayoutTemplate size={20} />
                        </div>
                        <div className="px-2 py-0.5 rounded text-[10px] bg-neutral-800 text-neutral-400 border border-neutral-700">
                          Complete Flow
                        </div>
                      </div>
                      <h3 className="text-sm font-medium text-white truncate mb-1">Website Builder Flow</h3>
                      <p className="text-xs text-neutral-500 mb-4">
                        Complete workflow for website design. Includes idea structuring, module planning, and SEO
                        optimization.
                      </p>
                      <div className="flex items-center text-xs text-blue-400 font-medium group-hover:translate-x-1 transition-transform">
                        Use template <ArrowRight size={12} className="ml-1" />
                      </div>
                    </div>

                    {/* App Template */}
                    <div
                      className="group relative p-4 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-green-500/30 hover:bg-neutral-800/50 transition-all cursor-pointer text-left"
                      onClick={() => !isLoading && handleLoadTemplate("App")}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="p-2 bg-green-500/10 rounded-lg text-green-400">
                          <Smartphone size={20} />
                        </div>
                        <div className="px-2 py-0.5 rounded text-[10px] bg-neutral-800 text-neutral-400 border border-neutral-700">
                          Mobile Flow
                        </div>
                      </div>
                      <h3 className="text-sm font-medium text-white truncate mb-1">Mobile App Flow</h3>
                      <p className="text-xs text-neutral-500 mb-4">
                        Mobile app development pipeline. Feature mapping, screen design, and technical requirements.
                      </p>
                      <div className="flex items-center text-xs text-green-400 font-medium group-hover:translate-x-1 transition-transform">
                        Use template <ArrowRight size={12} className="ml-1" />
                      </div>
                    </div>

                    {/* Game Template */}
                    <div
                      className="group relative p-4 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-purple-500/30 hover:bg-neutral-800/50 transition-all cursor-pointer text-left"
                      onClick={() => !isLoading && handleLoadTemplate("Game")}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                          <Gamepad2 size={20} />
                        </div>
                        <div className="px-2 py-0.5 rounded text-[10px] bg-neutral-800 text-neutral-400 border border-neutral-700">
                          Game Design
                        </div>
                      </div>
                      <h3 className="text-sm font-medium text-white truncate mb-1">Game Design Flow</h3>
                      <p className="text-xs text-neutral-500 mb-4">
                        Game design workflow. Mechanics, storytelling, characters, and progression loops.
                      </p>
                      <div className="flex items-center text-xs text-purple-400 font-medium group-hover:translate-x-1 transition-transform">
                        Use template <ArrowRight size={12} className="ml-1" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </motion.main>
        ) : (
          // --- WORKSPACE VIEW ---
          <motion.div
            key="workspace"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`flex-1 relative w-full h-full flex flex-col bg-neutral-900 ${activeTool === "hand" || isSpacePressed ? "cursor-grab active:cursor-grabbing" : activeTool === "text" ? "cursor-text" : "cursor-default"}`}
          >
            {/* Top Bar */}
            <div className="absolute top-0 left-0 right-0 h-14 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between px-4 z-30">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <button
                  onClick={() => setViewMode("landing")}
                  className="h-8 px-3 rounded-md bg-neutral-900/50 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-white flex items-center gap-2 transition-all cursor-pointer font-sans text-sm flex-shrink-0"
                >
                  <ArrowLeft size={16} /> <span>Back</span>
                </button>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="text-base font-medium text-neutral-300 px-2 py-1 bg-transparent border-none outline-none hover:bg-neutral-800 focus:bg-neutral-800 rounded transition-colors truncate max-w-[200px]"
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
                    className="flex items-center gap-2 p-2 bg-[#1e1e20] border border-neutral-700 rounded-xl shadow-2xl mb-2"
                  >
                    {/* Font Family */}
                    <select
                      value={textToolSettings.fontFamily}
                      onChange={(e) => setTextToolSettings((prev) => ({ ...prev, fontFamily: e.target.value }))}
                      className="bg-neutral-800 text-xs text-white border border-neutral-700 rounded px-2 py-1 outline-none focus:border-blue-500"
                    >
                      {AVAILABLE_FONTS.map((font) => (
                        <option key={font} value={font}>
                          {font}
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
                    <input
                      type="color"
                      value={textToolSettings.color}
                      onChange={(e) => setTextToolSettings((prev) => ({ ...prev, color: e.target.value }))}
                      className="w-6 h-6 rounded cursor-pointer bg-transparent border-none"
                      title="Text Color"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Main Toolbar */}
              <div className="flex items-center gap-1 p-1.5 bg-[#1e1e20] border border-neutral-700 rounded-full shadow-xl">
                <button
                  onClick={() => setActiveTool("select")}
                  className={`p-2.5 rounded-full transition-all ${activeTool === "select" ? "bg-blue-600 text-white" : "text-neutral-400 hover:text-white hover:bg-neutral-800"}`}
                  title="Move / Select (V)"
                >
                  <MousePointer2 size={18} />
                </button>
                <button
                  onClick={() => setActiveTool("hand")}
                  className={`p-2.5 rounded-full transition-all ${activeTool === "hand" ? "bg-blue-600 text-white" : "text-neutral-400 hover:text-white hover:bg-neutral-800"}`}
                  title="Hand Tool (H)"
                >
                  <Hand size={18} />
                </button>
                <button
                  onClick={() => setActiveTool("text")}
                  className={`p-2.5 rounded-full transition-all ${activeTool === "text" ? "bg-blue-600 text-white" : "text-neutral-400 hover:text-white hover:bg-neutral-800"}`}
                  title="Text Tool (T)"
                >
                  <Type size={18} />
                </button>
              </div>
            </div>

            {/* Canvas */}
            <div
              ref={canvasRef}
              className="flex-1 relative overflow-hidden z-0 min-h-screen bg-neutral-900 outline-none"
              style={{ marginTop: "56px", width: "100%", height: "100%" }}
              tabIndex={0}
              onMouseDown={handleCanvasMouseDown}
              onWheel={handleCanvasWheel}
              onClick={handleCanvasClick}
            >
              {/* Background Grid */}
              <div
                className="absolute pointer-events-none"
                style={{
                  left: "-2000000px",
                  top: "-2000000px",
                  width: "4000000px",
                  height: "4000000px",
                  zIndex: 0,
                  backgroundColor: "#171717",
                  backgroundImage: "radial-gradient(circle, rgba(255, 255, 255, 0.15) 1px, transparent 1px)",
                  backgroundSize: "24px 24px",
                  backgroundRepeat: "repeat",
                  transform: `translate(${canvasTransform.translateX}px, ${canvasTransform.translateY}px) scale(${canvasTransform.scale})`,
                  transformOrigin: "0 0",
                  willChange: "transform",
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
                  return (
                    <path
                      key={edge.id}
                      d={`M ${sourcePos.x} ${sourcePos.y} C ${sourcePos.x + 50} ${sourcePos.y}, ${targetPos.x - 50} ${targetPos.y}, ${targetPos.x} ${targetPos.y}`}
                      stroke="rgba(148, 163, 184, 0.6)"
                      strokeWidth="1.5"
                      fill="none"
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
                        stroke="rgba(148, 163, 184, 0.6)"
                        strokeWidth="1.5"
                        fill="none"
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

                  // --- RENDER TEXT WIDGET ---
                  if (widget.type === "text") {
                    return (
                      <div
                        key={widget.id}
                        className={`absolute flex items-center justify-center p-1 ${isSelected ? "border border-blue-500" : "border border-transparent hover:border-neutral-700"}`}
                        style={{
                          left: widget.x,
                          top: widget.y,
                          // For text, width/height can be auto or fixed. Let's use auto for simplicity or drag.
                          // minWidth: "50px",
                        }}
                        onMouseDown={(e) => handleMouseDown(e, widget.id, "move")}
                      >
                        <textarea
                          className="bg-transparent outline-none resize-none overflow-hidden"
                          style={{
                            fontSize: widget.style?.fontSize || 16,
                            textAlign: widget.style?.textAlign || "left",
                            color: widget.style?.color || "#ffffff",
                            fontFamily: widget.style?.fontFamily || "Inter",
                            width: `${Math.max(50, (widget.content?.length || 0) * (widget.style?.fontSize || 16) * 0.7)}px`, // Crude auto-width
                            minWidth: "100px",
                            height: `${(widget.style?.fontSize || 16) * 1.5}px`,
                          }}
                          value={widget.content}
                          onChange={(e) => updateWidget(widget.id, "content", e.target.value)}
                          placeholder="Type something..."
                        />
                        {isSelected && (
                          <div className="absolute -top-6 left-0 bg-blue-600 text-white text-[10px] px-1 rounded">
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

                  return (
                    <div
                      key={widget.id}
                      className={`absolute bg-[#121214] border rounded-xl flex flex-col hover:border-neutral-500 transition-colors font-sans widget-container ${isSelected ? "border-blue-500 shadow-[0_0_0_1px_rgba(59,130,246,1)] z-20" : "border-neutral-800 hover:border-neutral-700"}`}
                      style={{ left: widget.x, top: widget.y, width: widget.width, height: widget.height }}
                      onMouseDown={(e) => handleMouseDown(e, widget.id, "move")}
                    >
                      {/* Handles */}
                      <div
                        className="absolute left-0 top-1/2 -translate-y-1/2 flow-handle flow-handle-target"
                        style={{ left: "-4.5px", pointerEvents: "auto", zIndex: 1000 }}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          handleHandleMouseDown(e, widget.id, "input");
                        }}
                      />
                      <div
                        className="absolute right-0 top-1/2 -translate-y-1/2 flow-handle flow-handle-source"
                        style={{ right: "-4.5px", pointerEvents: "auto", zIndex: 1000 }}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          handleHandleMouseDown(e, widget.id, "output");
                        }}
                      />

                      {/* Content */}
                      <div className="px-3 py-2 border-b border-neutral-800 bg-[#121214] flex items-center gap-2">
                        <div className={`p-1 rounded-md bg-neutral-800/50 ${accentColor}`}>
                          <Icon size={14} />
                        </div>
                        <span className="text-sm font-semibold text-neutral-200">{widget.title || "Node"}</span>
                      </div>
                      <div className="flex-1 bg-[#121214] p-4 overflow-hidden">
                        <pre className="font-mono text-xs text-neutral-300 whitespace-pre-wrap">
                          {widget.content || "Content..."}
                        </pre>
                      </div>

                      {/* Resize Handle */}
                      <div
                        className="absolute bottom-0 right-0 w-6 h-6 cursor-se-resize flex items-end justify-end p-1"
                        onMouseDown={(e) => handleMouseDown(e, widget.id, "resize")}
                      >
                        <div className="border-r-2 border-b-2 border-neutral-600 w-2 h-2" />
                      </div>
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
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
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
      <Toaster position="top-center" />
      <FlowEngineContent {...props} />
    </MockAuthProvider>
  );
};

export default FlowEngineUnified;
