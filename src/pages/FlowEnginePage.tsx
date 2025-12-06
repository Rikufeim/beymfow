// FlowEngine - Fixed Version
// Key fixes:
// 1. Added missing initial={{ opacity: 0 }} to AnimatePresence children
// 2. Fixed null checks for canvasRef.current
// 3. Removed TypeScript type annotations (this is JSX not TSX)
// 4. Fixed canvas height calculation

import React, { useState, useRef, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate, BrowserRouter } from "react-router-dom";
import { toast, Toaster } from "sonner";
import { HexColorPicker } from "react-colorful";

import {
  ArrowRight,
  Copy,
  Sparkles,
  MessageSquare,
  Brain,
  FileText,
  Target,
  Settings,
  Plus,
  X,
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
  MousePointer2,
  Hand,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Minus,
  UserCheck,
  MessageCircle,
  Eye,
  Edit3,
} from "lucide-react";

// --- Mock Auth Context ---
const AuthContext = React.createContext({
  user: null,
  login: () => {},
  logout: () => {},
});

const useAuth = () => React.useContext(AuthContext);

const MockAuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
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

// --- Domain Configuration ---
const domainConfig = {
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

const AVAILABLE_FONTS = ["Inter", "Roboto", "Open Sans", "Lato", "Montserrat", "Poppins"];
const FLOW_PROJECTS_KEY = "beymflow.flow-engine.projects";

const FlowEngineContent = ({ onBack }) => {
  const navigate = useNavigate();
  const { user, login, logout } = useAuth();

  // --- Core State ---
  const [viewMode, setViewMode] = useState("landing");
  const [landingTab, setLandingTab] = useState("projects");
  const [activeDomain, setActiveDomain] = useState("Website");
  const [isLoading, setIsLoading] = useState(false);
  const [savedProjects, setSavedProjects] = useState([]);
  const [currentProjectId, setCurrentProjectId] = useState(null);
  const [projectName, setProjectName] = useState("Untitled Project");
  const [isSaving, setIsSaving] = useState(false);

  // --- Tool State ---
  const [activeTool, setActiveTool] = useState("select");
  const [textToolSettings, setTextToolSettings] = useState({
    fontSize: 16,
    textAlign: "left",
    color: "#ffffff",
    fontFamily: "Inter",
  });

  // --- Workspace State ---
  const [widgets, setWidgets] = useState([]);
  const [edges, setEdges] = useState([]);
  const [showCategories, setShowCategories] = useState(false);
  const [selectedWidgetIds, setSelectedWidgetIds] = useState(new Set());
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [selectionBox, setSelectionBox] = useState(null);
  const [dragging, setDragging] = useState(null);
  const [lastDragPos, setLastDragPos] = useState(null);
  const [resizing, setResizing] = useState(null);

  // --- Canvas Transform ---
  const [canvasTransform, setCanvasTransform] = useState({
    translateX: 0,
    translateY: 0,
    scale: 1,
  });
  const [panning, setPanning] = useState(null);

  // --- Connection State ---
  const [connecting, setConnecting] = useState(null);
  const [draggingHandle, setDraggingHandle] = useState(null);

  // --- Drawer State ---
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSections, setExpandedSections] = useState({
    domain: false,
    general: false,
    flows: false,
    templates: false,
  });
  const [showColorPicker, setShowColorPicker] = useState(false);

  const canvasRef = useRef(null);
  const autoSaveTimeoutRef = useRef(null);

  // --- Prompt State ---
  const [nodeOutputMap, setNodeOutputMap] = useState({});
  const [mainPromptState, setMainPromptState] = useState({ sections: [], combinedPrompt: "" });

  // --- Helper Functions ---
  const buildCombinedPrompt = (sections) => {
    if (sections.length === 0) return "";
    const sorted = [...sections].sort((a, b) => a.order - b.order);
    return sorted.map((s) => `### ${s.title}\n\n${s.content}\n\n`).join("");
  };

  const generateUniqueNodesAndEdges = (templateNodes, templateEdges, existingNodes) => {
    const idMap = {};
    const timestamp = Date.now();
    const offsetX = existingNodes.length > 0 ? 50 : 0;
    const offsetY = existingNodes.length > 0 ? 50 : 0;

    const newNodes = templateNodes.map((node, i) => {
      const newId = `${node.type}-${timestamp}-${i}`;
      idMap[node.id] = newId;
      return { ...node, id: newId, x: node.x + offsetX, y: node.y + offsetY };
    });

    const newEdges = templateEdges.map((edge, i) => ({
      ...edge,
      id: `edge-${timestamp}-${i}`,
      source: idMap[edge.source],
      target: idMap[edge.target],
    }));

    return { newNodes, newEdges };
  };

  const getHandlePosition = (nodeId, handleType, widgetsList) => {
    const widget = widgetsList.find((w) => w.id === nodeId);
    if (!widget) return { x: 0, y: 0 };
    const handleY = widget.y + widget.height / 2;
    const handleX = handleType === "input" ? widget.x - 4.5 : widget.x + widget.width + 4.5;
    return { x: handleX, y: handleY };
  };

  const getAggregatedPrompt = (promptWindowId, allWidgets, allEdges) => {
    const incomingEdges = allEdges.filter((e) => e.target === promptWindowId);
    if (incomingEdges.length === 0) return null;

    const queue = incomingEdges.map((e) => e.source);
    const visited = new Set();
    const upstreamNodes = [];

    while (queue.length > 0) {
      const currentId = queue.shift();
      if (visited.has(currentId)) continue;
      visited.add(currentId);

      const node = allWidgets.find((w) => w.id === currentId);
      if (node && node.type !== "prompt-window") {
        upstreamNodes.push(node);
        const inputEdges = allEdges.filter((e) => e.target === currentId);
        inputEdges.forEach((e) => queue.push(e.source));
      }
    }

    return upstreamNodes
      .sort((a, b) => a.y - b.y)
      .map((w) => {
        let text = `### ${w.title || "Untitled Node"}`;
        if (w.content) text += `\n${w.content}`;
        return text;
      })
      .join("\n\n");
  };

  const updateWidget = (widgetId, field, value) => {
    setWidgets((prev) => prev.map((w) => (w.id === widgetId ? { ...w, [field]: value } : w)));
  };

  // --- Flow Presets ---
  const createWebsiteFlowPreset = () => ({
    nodes: [
      {
        id: "flow-input-1",
        type: "flow-input",
        title: "User Input",
        x: 50,
        y: 200,
        width: 200,
        height: 120,
        content: "",
      },
      { id: "flow-text-1", type: "flow-text-gen", title: "Idea Summary", x: 300, y: 100, width: 220, height: 150 },
      { id: "flow-text-2", type: "flow-text-gen", title: "Page Structure", x: 300, y: 300, width: 220, height: 150 },
      { id: "flow-text-final", type: "flow-text-gen", title: "Final Output", x: 600, y: 200, width: 260, height: 200 },
    ],
    edges: [
      { id: "e1", source: "flow-input-1", target: "flow-text-1" },
      { id: "e2", source: "flow-input-1", target: "flow-text-2" },
      { id: "e3", source: "flow-text-1", target: "flow-text-final" },
      { id: "e4", source: "flow-text-2", target: "flow-text-final" },
    ],
  });

  const createAppFlowPreset = () => ({
    nodes: [
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
      { id: "flow-text-final", type: "flow-text-gen", title: "Final Output", x: 600, y: 200, width: 260, height: 200 },
    ],
    edges: [
      { id: "e1", source: "flow-input-1", target: "flow-text-1" },
      { id: "e2", source: "flow-input-1", target: "flow-text-2" },
      { id: "e3", source: "flow-text-1", target: "flow-text-final" },
      { id: "e4", source: "flow-text-2", target: "flow-text-final" },
    ],
  });

  const createGameFlowPreset = () => ({
    nodes: [
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
      { id: "flow-text-final", type: "flow-text-gen", title: "Final Output", x: 600, y: 200, width: 260, height: 200 },
    ],
    edges: [
      { id: "e1", source: "flow-input-1", target: "flow-text-1" },
      { id: "e2", source: "flow-input-1", target: "flow-text-2" },
      { id: "e3", source: "flow-text-1", target: "flow-text-final" },
      { id: "e4", source: "flow-text-2", target: "flow-text-final" },
    ],
  });

  // --- Actions ---
  const handleDomainSelection = (domainLabel) => {
    setIsLoading(true);
    setActiveDomain(domainLabel);
    setTimeout(() => {
      setCanvasTransform({ translateX: 100, translateY: 100, scale: 1 });
      setWidgets([]);
      setEdges([]);
      setViewMode("workspace");
      setIsLoading(false);
      setShowCategories(false);
      setProjectName(`New ${domainLabel} Project`);
    }, 600);
  };

  const handleLoadTemplate = (templateType) => {
    setIsLoading(true);
    setActiveDomain(templateType);
    setTimeout(() => {
      let presetData;
      if (templateType === "Website") presetData = createWebsiteFlowPreset();
      else if (templateType === "App") presetData = createAppFlowPreset();
      else presetData = createGameFlowPreset();

      const { newNodes, newEdges } = generateUniqueNodesAndEdges(presetData.nodes, presetData.edges, widgets);
      setWidgets((prev) => [...prev, ...newNodes]);
      setEdges((prev) => [...prev, ...newEdges]);

      if (widgets.length === 0) {
        setCanvasTransform({ translateX: 100, translateY: 100, scale: 0.8 });
        setCurrentProjectId(null);
        setProjectName(`${templateType} Flow Template`);
      } else {
        toast.success(`${templateType} Flow added to workspace`);
      }
      setViewMode("workspace");
      setIsLoading(false);
      setShowCategories(false);
    }, 300);
  };

  const handleCategoryAdd = (category) => {
    const newWidget = {
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
    const rect = canvasRef.current?.getBoundingClientRect();
    const centerX = rect ? (rect.width / 2 - canvasTransform.translateX) / canvasTransform.scale : 100;
    const centerY = rect ? (rect.height / 2 - canvasTransform.translateY) / canvasTransform.scale : 100;

    const newWidget = {
      id: `prompt-window-${Date.now()}`,
      type: "prompt-window",
      title: "Prompt Window",
      content: "",
      promptMode: "preview",
      x: centerX - 200,
      y: centerY - 150,
      width: 400,
      height: 300,
    };
    setWidgets((prev) => [...prev, newWidget]);
    toast.success("Prompt Window Added");
  };

  const handleCopyPrompt = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => toast.success("Prompt copied to clipboard"))
      .catch(() => toast.error("Failed to copy"));
  };

  const handleZoomIn = () => setCanvasTransform((p) => ({ ...p, scale: Math.min(2.0, p.scale + 0.25) }));
  const handleZoomOut = () => setCanvasTransform((p) => ({ ...p, scale: Math.max(0.25, p.scale - 0.25) }));

  const toggleSection = (section) => setExpandedSections((p) => ({ ...p, [section]: !p[section] }));
  const filterCategories = (cats) =>
    searchQuery ? cats.filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase())) : cats;

  const createNewProject = () => {
    setCurrentProjectId(null);
    setProjectName("Untitled Project");
    setWidgets([]);
    setEdges([]);
    setNodeOutputMap({});
    setMainPromptState({ sections: [], combinedPrompt: "" });
    setCanvasTransform({ translateX: 0, translateY: 0, scale: 1 });
  };

  // --- Save/Load ---
  const saveCurrentProject = useCallback(
    (silent = false) => {
      if (!user) {
        if (!silent) toast.error("Sign in to save projects");
        return;
      }
      if (widgets.length === 0) return;

      setIsSaving(true);
      const now = new Date().toISOString();
      const projectId = currentProjectId || crypto.randomUUID();
      const project = {
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
      setIsSaving(false);
      if (!silent) toast.success("Project saved");
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
      nodeOutputMap,
      mainPromptState,
    ],
  );

  const loadProject = (project) => {
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

  const deleteProject = (projectId) => {
    if (!user) return;
    const updated = savedProjects.filter((p) => p.id !== projectId);
    const userKey = `${FLOW_PROJECTS_KEY}.${user.id}`;
    localStorage.setItem(userKey, JSON.stringify(updated));
    setSavedProjects(updated);
  };

  // --- Effects ---
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

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === "Space" && !e.repeat) setIsSpacePressed(true);
      if (e.key.toLowerCase() === "v") setActiveTool("select");
      if (e.key.toLowerCase() === "h") setActiveTool("hand");
      if (e.key.toLowerCase() === "t") setActiveTool("text");

      if ((e.key === "Delete" || e.key === "Backspace") && selectedWidgetIds.size > 0) {
        e.preventDefault();
        setWidgets((prev) => prev.filter((w) => !selectedWidgetIds.has(w.id)));
        setEdges((prev) =>
          prev.filter((edge) => !selectedWidgetIds.has(edge.source) && !selectedWidgetIds.has(edge.target)),
        );
        setSelectedWidgetIds(new Set());
      }
    };

    const handleKeyUp = (e) => {
      if (e.code === "Space") setIsSpacePressed(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [selectedWidgetIds]);

  // Auto-save
  useEffect(() => {
    if (viewMode !== "workspace" || !user || widgets.length === 0) return;
    if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);
    autoSaveTimeoutRef.current = setTimeout(() => saveCurrentProject(true), 5000);
    return () => {
      if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);
    };
  }, [widgets, edges, viewMode, user, saveCurrentProject]);

  // --- Canvas Event Handlers ---
  const handleCanvasMouseDown = (e) => {
    if (e.target.closest(".widget-container, button, input, textarea, .pointer-events-auto")) return;

    if (e.button === 0 && !dragging && !resizing) {
      e.preventDefault();

      if (activeTool === "hand" || isSpacePressed) {
        setPanning({
          startX: e.clientX,
          startY: e.clientY,
          startTranslateX: canvasTransform.translateX,
          startTranslateY: canvasTransform.translateY,
        });
      } else if (activeTool === "text") {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;
        const canvasX = (e.clientX - rect.left - canvasTransform.translateX) / canvasTransform.scale;
        const canvasY = (e.clientY - rect.top - canvasTransform.translateY) / canvasTransform.scale;

        const newTextWidget = {
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
      } else {
        setSelectionBox({
          startX: e.clientX,
          startY: e.clientY,
          currentX: e.clientX,
          currentY: e.clientY,
        });
        if (!e.shiftKey) setSelectedWidgetIds(new Set());
      }
    }

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

  const handleCanvasWheel = (e) => {
    if (!canvasRef.current) return;
    if (e.target.closest(".widget-container, textarea, input")) return;

    e.preventDefault();
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (e.shiftKey) {
      setCanvasTransform((p) => ({ ...p, translateX: p.translateX - e.deltaY * 0.5 }));
      return;
    }
    if (e.altKey) {
      setCanvasTransform((p) => ({ ...p, translateY: p.translateY - e.deltaY * 0.5 }));
      return;
    }

    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(0.25, Math.min(2.0, canvasTransform.scale * zoomFactor));
    const canvasX = (mouseX - canvasTransform.translateX) / canvasTransform.scale;
    const canvasY = (mouseY - canvasTransform.translateY) / canvasTransform.scale;

    setCanvasTransform({
      translateX: mouseX - canvasX * newScale,
      translateY: mouseY - canvasY * newScale,
      scale: newScale,
    });
  };

  const handleMouseDown = (e, widgetId, action) => {
    if (e.target.closest("textarea, input, button")) return;
    e.stopPropagation();
    if (activeTool !== "select") return;

    if (action === "move") {
      if (e.shiftKey) {
        setSelectedWidgetIds((prev) => {
          const next = new Set(prev);
          if (next.has(widgetId)) next.delete(widgetId);
          else next.add(widgetId);
          return next;
        });
      } else if (!selectedWidgetIds.has(widgetId)) {
        setSelectedWidgetIds(new Set([widgetId]));
      }
    }

    const widget = widgets.find((w) => w.id === widgetId);
    if (!widget) return;

    if (action === "move") {
      setDragging({ id: widgetId });
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

  const handleHandleMouseDown = (e, nodeId, handleType) => {
    e.stopPropagation();
    e.preventDefault();
    if (e.detail > 1) return;

    setDraggingHandle({ nodeId, handleType, startX: e.clientX, startY: e.clientY });

    if (handleType === "output") {
      setConnecting({ sourceId: nodeId, sourceHandle: "output" });
    } else if (handleType === "input" && connecting) {
      const newEdge = {
        id: `edge-${connecting.sourceId}-${nodeId}-${Date.now()}`,
        source: connecting.sourceId,
        target: nodeId,
      };
      setEdges((prev) => {
        if (prev.some((e) => e.source === connecting.sourceId && e.target === nodeId)) return prev;
        return [...prev, newEdge];
      });
      setConnecting(null);
      setDraggingHandle(null);
    }
  };

  const handleCanvasClick = (e) => {
    if (connecting && !e.target.closest(".flow-handle, .widget-container")) {
      setConnecting(null);
    }
  };

  // Mouse move/up effects
  useEffect(() => {
    let rafId = null;

    const handleMouseMove = (e) => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        if (panning) {
          setCanvasTransform((p) => ({
            ...p,
            translateX: panning.startTranslateX + (e.clientX - panning.startX),
            translateY: panning.startTranslateY + (e.clientY - panning.startY),
          }));
        } else if (selectionBox) {
          setSelectionBox((prev) => (prev ? { ...prev, currentX: e.clientX, currentY: e.clientY } : null));
        } else if (dragging && lastDragPos && activeTool === "select") {
          const dx = (e.clientX - lastDragPos.x) / canvasTransform.scale;
          const dy = (e.clientY - lastDragPos.y) / canvasTransform.scale;
          setLastDragPos({ x: e.clientX, y: e.clientY });

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

    const handleMouseUp = (e) => {
      if (selectionBox && canvasRef.current) {
        const rect = {
          x: Math.min(selectionBox.startX, selectionBox.currentX),
          y: Math.min(selectionBox.startY, selectionBox.currentY),
          w: Math.abs(selectionBox.currentX - selectionBox.startX),
          h: Math.abs(selectionBox.currentY - selectionBox.startY),
        };

        const newSelected = new Set(selectedWidgetIds);
        widgets.forEach((w) => {
          const screenX = w.x * canvasTransform.scale + canvasTransform.translateX;
          const screenY = w.y * canvasTransform.scale + canvasTransform.translateY;
          const screenW = w.width * canvasTransform.scale;
          const screenH = w.height * canvasTransform.scale;

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

      if (draggingHandle) {
        const endX = (e.clientX - canvasTransform.translateX) / canvasTransform.scale;
        const endY = (e.clientY - canvasTransform.translateY) / canvasTransform.scale;
        const startX = (draggingHandle.startX - canvasTransform.translateX) / canvasTransform.scale;
        const startY = (draggingHandle.startY - canvasTransform.translateY) / canvasTransform.scale;
        const distance = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));

        if (distance > 30) {
          if (draggingHandle.handleType === "input") {
            setEdges((prev) => prev.filter((ed) => ed.target !== draggingHandle.nodeId));
          } else if (draggingHandle.handleType === "output") {
            setEdges((prev) => prev.filter((ed) => ed.source !== draggingHandle.nodeId));
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

  // --- RENDER ---
  return (
    <div className="h-screen w-screen bg-[#09090b] text-neutral-200 relative flex flex-col font-sans overflow-hidden">
      <AnimatePresence mode="wait">
        {viewMode === "landing" ? (
          <motion.main
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex-1 flex flex-col items-center p-4 w-full max-w-4xl mx-auto z-10 pt-24 text-center min-h-screen overflow-y-auto"
          >
            {/* Home Button */}
            <button
              onClick={() => (onBack ? onBack() : navigate("/"))}
              className="absolute top-6 left-6 p-2 rounded-full bg-neutral-900/50 backdrop-blur-md border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all flex items-center gap-2"
            >
              <Home size={20} />
              <span className="text-sm font-medium pr-1">Home</span>
            </button>

            {/* Auth Button */}
            {user ? (
              <button
                onClick={createNewProject}
                className="absolute top-6 right-6 p-2 rounded-full bg-neutral-900/50 backdrop-blur-md border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all flex items-center gap-2"
              >
                <Plus size={20} />
                <span className="text-sm font-medium pr-1">Project</span>
              </button>
            ) : (
              <button
                onClick={login}
                className="absolute top-6 right-6 p-2 rounded-full bg-neutral-900/50 backdrop-blur-md border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all flex items-center gap-2"
              >
                <LogIn size={20} />
                <span className="text-sm font-medium pr-1">Sign in</span>
              </button>
            )}

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12 w-full">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white pb-6">
                What are we building today?
              </h1>

              {/* Domain Selection */}
              <div className="flex flex-wrap justify-center gap-4">
                {suggestionChips.map((chip) => {
                  const Icon = chip.icon;
                  return (
                    <button
                      key={chip.label}
                      onClick={() => !isLoading && handleDomainSelection(chip.label)}
                      disabled={isLoading}
                      className={`px-8 py-4 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 hover:bg-neutral-800 hover:text-white hover:border-neutral-700 transition-all cursor-pointer flex flex-col items-center gap-3 group min-w-[140px] ${isLoading ? "opacity-50 cursor-wait" : ""}`}
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

              {/* Tabs */}
              <div className="w-full mt-12 mb-6">
                <div className="flex items-center justify-center gap-6 border-b border-neutral-800 pb-2">
                  <button
                    onClick={() => setLandingTab("projects")}
                    className={`pb-2 px-2 text-sm font-medium transition-colors relative ${landingTab === "projects" ? "text-white" : "text-neutral-500 hover:text-neutral-300"}`}
                  >
                    My Projects
                    {landingTab === "projects" && (
                      <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-500" />
                    )}
                  </button>
                  <button
                    onClick={() => setLandingTab("templates")}
                    className={`pb-2 px-2 text-sm font-medium transition-colors relative ${landingTab === "templates" ? "text-white" : "text-neutral-500 hover:text-neutral-300"}`}
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

              {/* Projects Tab */}
              {landingTab === "projects" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full">
                  {user && savedProjects.length > 0 ? (
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
                  ) : (
                    <div className="text-neutral-500 py-10">
                      {user ? "No saved projects yet." : "Sign in to see your projects."}
                    </div>
                  )}
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

              {/* Templates Tab */}
              {landingTab === "templates" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      {
                        type: "Website",
                        icon: LayoutTemplate,
                        color: "blue",
                        desc: "Complete workflow for website design.",
                      },
                      { type: "App", icon: Smartphone, color: "green", desc: "Mobile app development pipeline." },
                      { type: "Game", icon: Gamepad2, color: "purple", desc: "Game design workflow." },
                    ].map((t) => (
                      <div
                        key={t.type}
                        className={`group relative p-4 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-${t.color}-500/30 hover:bg-neutral-800/50 transition-all cursor-pointer text-left`}
                        onClick={() => !isLoading && handleLoadTemplate(t.type)}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className={`p-2 bg-${t.color}-500/10 rounded-lg text-${t.color}-400`}>
                            <t.icon size={20} />
                          </div>
                        </div>
                        <h3 className="text-sm font-medium text-white truncate mb-1">{t.type} Flow</h3>
                        <p className="text-xs text-neutral-500 mb-4">{t.desc}</p>
                        <div
                          className={`flex items-center text-xs text-${t.color}-400 font-medium group-hover:translate-x-1 transition-transform`}
                        >
                          Use template <ArrowRight size={12} className="ml-1" />
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          </motion.main>
        ) : (
          // WORKSPACE VIEW
          <motion.div
            key="workspace"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`flex-1 relative w-full h-full flex flex-col bg-[#09090b] ${activeTool === "hand" || isSpacePressed ? "cursor-grab" : activeTool === "text" ? "cursor-text" : "cursor-default"}`}
          >
            {/* Top Bar */}
            <div className="absolute top-0 left-0 right-0 h-14 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between px-4 z-30">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <button
                  onClick={() => setViewMode("landing")}
                  className="h-8 px-3 rounded-md bg-neutral-900/50 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-white flex items-center gap-2 transition-all text-sm flex-shrink-0"
                >
                  <ArrowLeft size={16} /> Back
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
                  <Plus
                    size={20}
                    className={showCategories ? "rotate-45 transition-transform" : "transition-transform"}
                  />
                </button>
              </div>
            </div>

            {/* Bottom Toolbar */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2">
              <AnimatePresence>
                {activeTool === "text" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="flex items-center gap-2 p-2 bg-[#1e1e20] border border-neutral-700 rounded-xl shadow-2xl mb-2"
                  >
                    <select
                      value={textToolSettings.fontFamily}
                      onChange={(e) => setTextToolSettings((p) => ({ ...p, fontFamily: e.target.value }))}
                      className="bg-neutral-800 text-xs text-white border border-neutral-700 rounded px-2 py-1 outline-none"
                    >
                      {AVAILABLE_FONTS.map((font) => (
                        <option key={font} value={font}>
                          {font}
                        </option>
                      ))}
                    </select>
                    <div className="w-px h-4 bg-neutral-700" />
                    <input
                      type="number"
                      value={textToolSettings.fontSize}
                      onChange={(e) => setTextToolSettings((p) => ({ ...p, fontSize: parseInt(e.target.value) || 12 }))}
                      className="w-12 bg-neutral-800 text-xs text-white p-1 rounded border border-neutral-700 outline-none text-center"
                    />
                    <div className="w-px h-4 bg-neutral-700" />
                    <div className="flex bg-neutral-800 rounded border border-neutral-700 p-0.5">
                      {["left", "center", "right"].map((align) => (
                        <button
                          key={align}
                          onClick={() => setTextToolSettings((p) => ({ ...p, textAlign: align }))}
                          className={`p-1 rounded ${textToolSettings.textAlign === align ? "bg-neutral-600 text-white" : "text-neutral-400 hover:text-white"}`}
                        >
                          {align === "left" && <AlignLeft size={14} />}
                          {align === "center" && <AlignCenter size={14} />}
                          {align === "right" && <AlignRight size={14} />}
                        </button>
                      ))}
                    </div>
                    <div className="w-px h-4 bg-neutral-700" />
                    <div className="relative">
                      <button
                        onClick={() => setShowColorPicker(!showColorPicker)}
                        className="w-6 h-6 rounded border border-neutral-600"
                        style={{ backgroundColor: textToolSettings.color }}
                      />
                      {showColorPicker && (
                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 p-3 bg-neutral-800 border border-neutral-700 rounded-lg shadow-xl z-50">
                          <HexColorPicker
                            color={textToolSettings.color}
                            onChange={(color) => setTextToolSettings((p) => ({ ...p, color }))}
                          />
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex items-center gap-1 p-1.5 bg-[#1e1e20] border border-neutral-700 rounded-full shadow-xl">
                <button
                  onClick={() => setActiveTool("select")}
                  className={`p-2.5 rounded-full transition-all ${activeTool === "select" ? "bg-neutral-600 text-white" : "text-neutral-400 hover:text-white hover:bg-neutral-800"}`}
                  title="Select (V)"
                >
                  <MousePointer2 size={18} />
                </button>
                <button
                  onClick={() => setActiveTool("hand")}
                  className={`p-2.5 rounded-full transition-all ${activeTool === "hand" ? "bg-neutral-600 text-white" : "text-neutral-400 hover:text-white hover:bg-neutral-800"}`}
                  title="Hand (H)"
                >
                  <Hand size={18} />
                </button>
                <div className="w-px h-6 bg-neutral-700 mx-1" />
                <button
                  onClick={handleZoomOut}
                  className="p-2.5 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800"
                  title="Zoom Out"
                >
                  <Minus size={16} />
                </button>
                <button
                  onClick={handleZoomIn}
                  className="p-2.5 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800"
                  title="Zoom In"
                >
                  <Plus size={16} />
                </button>
                <div className="w-px h-6 bg-neutral-700 mx-1" />
                <button
                  onClick={() => setActiveTool("text")}
                  className={`p-2.5 rounded-full transition-all ${activeTool === "text" ? "bg-neutral-600 text-white" : "text-neutral-400 hover:text-white hover:bg-neutral-800"}`}
                  title="Text (T)"
                >
                  <Type size={18} />
                </button>
              </div>
            </div>

            {/* Canvas */}
            <div
              ref={canvasRef}
              className="flex-1 relative overflow-hidden z-0 bg-[#09090b] outline-none"
              style={{ marginTop: "56px" }}
              tabIndex={0}
              onMouseDown={handleCanvasMouseDown}
              onWheel={handleCanvasWheel}
              onClick={handleCanvasClick}
            >
              {/* Grid Background */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundColor: "#09090b",
                  backgroundImage: "radial-gradient(circle, rgba(255, 255, 255, 0.15) 1px, transparent 1px)",
                  backgroundSize: `${24 * canvasTransform.scale}px ${24 * canvasTransform.scale}px`,
                  backgroundPosition: `${canvasTransform.translateX}px ${canvasTransform.translateY}px`,
                }}
              />

              {/* Selection Box */}
              {selectionBox && canvasRef.current && (
                <div
                  className="absolute z-50 pointer-events-none border border-neutral-500 bg-neutral-700/30"
                  style={{
                    left:
                      Math.min(selectionBox.startX, selectionBox.currentX) -
                      canvasRef.current.getBoundingClientRect().left,
                    top:
                      Math.min(selectionBox.startY, selectionBox.currentY) -
                      canvasRef.current.getBoundingClientRect().top,
                    width: Math.abs(selectionBox.currentX - selectionBox.startX),
                    height: Math.abs(selectionBox.currentY - selectionBox.startY),
                  }}
                />
              )}

              {/* Edges SVG */}
              <svg
                className="absolute inset-0 pointer-events-none"
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
                    />
                  );
                })}
              </svg>

              {/* Widgets Container */}
              <div
                className="absolute inset-0"
                style={{
                  zIndex: 2,
                  transform: `translate(${canvasTransform.translateX}px, ${canvasTransform.translateY}px) scale(${canvasTransform.scale})`,
                  transformOrigin: "0 0",
                }}
              >
                {widgets.map((widget) => {
                  const isSelected = selectedWidgetIds.has(widget.id);

                  // Prompt Window
                  if (widget.type === "prompt-window") {
                    const aggregatedContent = getAggregatedPrompt(widget.id, widgets, edges);
                    const displayContent =
                      widget.promptMode === "preview" ? aggregatedContent : widget.content || aggregatedContent;

                    return (
                      <div
                        key={widget.id}
                        className={`absolute bg-[#121214] border rounded-xl flex flex-col font-sans widget-container overflow-hidden shadow-2xl ${isSelected ? "border-neutral-400 z-30" : "border-neutral-700 hover:border-neutral-500 z-20"}`}
                        style={{ left: widget.x, top: widget.y, width: widget.width, height: widget.height }}
                        onMouseDown={(e) => handleMouseDown(e, widget.id, "move")}
                      >
                        {/* Input Handle */}
                        <div
                          className="absolute w-3 h-3 bg-neutral-600 border-2 border-neutral-400 rounded-full cursor-crosshair hover:bg-neutral-500 flow-handle"
                          style={{ left: "-6px", top: "50%", transform: "translateY(-50%)", zIndex: 1000 }}
                          onMouseDown={(e) => handleHandleMouseDown(e, widget.id, "input")}
                        />

                        <div className="px-3 py-2 border-b border-neutral-800 bg-[#18181b] flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Sparkles size={14} className="text-yellow-400" />
                            <span className="text-sm font-semibold text-neutral-200">Prompt Window</span>
                          </div>
                          <div className="flex gap-1 bg-neutral-900 rounded-md p-0.5 border border-neutral-800">
                            <button
                              onClick={() => displayContent && handleCopyPrompt(displayContent)}
                              className="p-1 rounded text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800"
                              title="Copy"
                            >
                              <Copy size={12} />
                            </button>
                            <button
                              onClick={() => {
                                if (widget.promptMode !== "edit" && !widget.content)
                                  updateWidget(widget.id, "content", aggregatedContent);
                                updateWidget(widget.id, "promptMode", "edit");
                              }}
                              className={`p-1 rounded ${widget.promptMode === "edit" ? "bg-neutral-700 text-white" : "text-neutral-500 hover:text-neutral-300"}`}
                              title="Edit"
                            >
                              <Edit3 size={12} />
                            </button>
                            <button
                              onClick={() => updateWidget(widget.id, "promptMode", "preview")}
                              className={`p-1 rounded ${widget.promptMode === "preview" || !widget.promptMode ? "bg-neutral-700 text-white" : "text-neutral-500 hover:text-neutral-300"}`}
                              title="Preview"
                            >
                              <Eye size={12} />
                            </button>
                          </div>
                        </div>

                        <div className="flex-1 bg-[#09090b] relative overflow-hidden">
                          {widget.promptMode === "preview" ? (
                            <div className="absolute inset-0 p-4 overflow-y-auto">
                              {displayContent ? (
                                <pre className="whitespace-pre-wrap font-mono text-sm text-neutral-300">
                                  {displayContent}
                                </pre>
                              ) : (
                                <div className="flex flex-col items-center justify-center h-full text-neutral-600 gap-2 p-4 text-center">
                                  <Link2 size={24} className="opacity-50" />
                                  <p className="text-xs">Connect nodes to generate a prompt.</p>
                                </div>
                              )}
                            </div>
                          ) : (
                            <textarea
                              className="w-full h-full bg-[#09090b] text-neutral-300 p-4 font-mono text-sm resize-none outline-none"
                              value={widget.content || ""}
                              onChange={(e) => updateWidget(widget.id, "content", e.target.value)}
                              placeholder="Write your prompt..."
                              onMouseDown={(e) => e.stopPropagation()}
                            />
                          )}
                        </div>

                        <div
                          className="absolute bottom-0 right-0 w-6 h-6 cursor-se-resize flex items-end justify-end p-1 z-50"
                          onMouseDown={(e) => handleMouseDown(e, widget.id, "resize")}
                        >
                          <div className="border-r-2 border-b-2 border-neutral-600 w-2 h-2" />
                        </div>
                      </div>
                    );
                  }

                  // Text Widget
                  if (widget.type === "text") {
                    return (
                      <div
                        key={widget.id}
                        className={`absolute flex items-center justify-center p-1 widget-container ${isSelected ? "border border-neutral-400" : "border border-transparent hover:border-neutral-700"}`}
                        style={{ left: widget.x, top: widget.y }}
                        onMouseDown={(e) => handleMouseDown(e, widget.id, "move")}
                      >
                        <textarea
                          className="bg-transparent outline-none resize-none overflow-hidden"
                          style={{
                            fontSize: widget.style?.fontSize || 16,
                            textAlign: widget.style?.textAlign || "left",
                            color: widget.style?.color || "#ffffff",
                            fontFamily: widget.style?.fontFamily || "Inter",
                            minWidth: "100px",
                          }}
                          value={widget.content}
                          onChange={(e) => updateWidget(widget.id, "content", e.target.value)}
                          placeholder="Type..."
                        />
                      </div>
                    );
                  }

                  // Standard Node
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
                      className={`absolute bg-[#121214] border rounded-xl flex flex-col font-sans widget-container ${isSelected ? "border-neutral-400 z-20" : "border-neutral-800 hover:border-neutral-700"}`}
                      style={{ left: widget.x, top: widget.y, width: widget.width, height: widget.height }}
                      onMouseDown={(e) => handleMouseDown(e, widget.id, "move")}
                    >
                      {/* Handles */}
                      <div
                        className="absolute w-3 h-3 bg-neutral-600 border-2 border-neutral-400 rounded-full cursor-crosshair hover:bg-neutral-500 flow-handle"
                        style={{ left: "-6px", top: "50%", transform: "translateY(-50%)", zIndex: 1000 }}
                        onMouseDown={(e) => handleHandleMouseDown(e, widget.id, "input")}
                      />
                      <div
                        className="absolute w-3 h-3 bg-neutral-600 border-2 border-neutral-400 rounded-full cursor-crosshair hover:bg-neutral-500 flow-handle"
                        style={{ right: "-6px", top: "50%", transform: "translateY(-50%)", zIndex: 1000 }}
                        onMouseDown={(e) => handleHandleMouseDown(e, widget.id, "output")}
                      />

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

            {/* Side Drawer */}
            <AnimatePresence>
              {showCategories && (
                <motion.div
                  initial={{ x: 320, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 320, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="absolute top-20 right-4 w-80 bg-[#121214] border border-neutral-800 rounded-xl z-40 flex flex-col max-h-[calc(100vh-100px)] overflow-hidden"
                >
                  <div className="p-4 border-b border-neutral-800">
                    <h3 className="text-sm font-semibold text-white mb-3">Add Nodes</h3>

                    <div className="flex p-1 bg-neutral-900 rounded-lg mb-3">
                      {suggestionChips.map((chip) => {
                        const Icon = chip.icon;
                        return (
                          <button
                            key={chip.label}
                            onClick={() => setActiveDomain(chip.label)}
                            className={`flex-1 flex items-center justify-center py-1.5 rounded-md transition-all ${activeDomain === chip.label ? "bg-neutral-800 text-white shadow-sm" : "text-neutral-500 hover:text-neutral-300"}`}
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

                  <div className="flex-1 overflow-y-auto p-2">
                    {/* Domain Section */}
                    <div className="mb-2">
                      <button
                        onClick={() => toggleSection("domain")}
                        className="w-full flex items-center justify-between p-2 text-xs font-semibold text-neutral-400 hover:text-white"
                      >
                        <div className="flex items-center gap-2">
                          <Box size={14} />
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
                                  className="w-full flex items-center gap-3 p-2 hover:bg-neutral-800/50 rounded-lg group text-left cursor-pointer"
                                >
                                  <div
                                    className={`p-1.5 rounded-md bg-neutral-900 ${cat.color} group-hover:bg-neutral-800 flex-shrink-0`}
                                  >
                                    <cat.icon size={14} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <span className="text-xs font-medium text-neutral-300 group-hover:text-white">
                                      {cat.name}
                                    </span>
                                    {cat.description && (
                                      <span className="block text-[10px] text-neutral-500 truncate">
                                        {cat.description}
                                      </span>
                                    )}
                                  </div>
                                  <Plus size={12} className="text-neutral-500 opacity-0 group-hover:opacity-100" />
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Flows Section */}
                    <div className="mb-2">
                      <button
                        onClick={() => toggleSection("flows")}
                        className="w-full flex items-center justify-between p-2 text-xs font-semibold text-neutral-400 hover:text-white"
                      >
                        <div className="flex items-center gap-2">
                          <Sparkles size={14} />
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
                              {[
                                { name: "Website", icon: Globe, action: () => handleLoadTemplate("Website") },
                                { name: "App", icon: Smartphone, action: () => handleLoadTemplate("App") },
                                { name: "Game", icon: Gamepad2, action: () => handleLoadTemplate("Game") },
                              ].map((flow) => (
                                <button
                                  key={flow.name}
                                  onClick={flow.action}
                                  className="w-full flex items-center gap-3 p-2 hover:bg-neutral-800/50 rounded-lg group text-left cursor-pointer"
                                >
                                  <div className="p-1.5 rounded-md bg-neutral-900 text-neutral-300 group-hover:bg-neutral-800">
                                    <flow.icon size={14} />
                                  </div>
                                  <span className="text-xs font-medium text-neutral-300 group-hover:text-white">
                                    {flow.name} Flow
                                  </span>
                                  <Plus
                                    size={12}
                                    className="text-neutral-500 opacity-0 group-hover:opacity-100 ml-auto"
                                  />
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Prompt Window Button */}
                    <div className="border-t border-neutral-800 pt-2 mt-2">
                      <button
                        onClick={handleAddPromptWindow}
                        className="w-full flex items-center gap-3 p-2 hover:bg-neutral-800/50 rounded-lg group text-left cursor-pointer"
                      >
                        <div className="p-1.5 rounded-md bg-neutral-900 text-yellow-500 group-hover:bg-neutral-800">
                          <Layout size={14} />
                        </div>
                        <div className="flex-1">
                          <span className="block text-xs font-medium text-neutral-300 group-hover:text-white">
                            Prompt Window
                          </span>
                          <span className="block text-[10px] text-neutral-500">Preview & editor</span>
                        </div>
                        <Plus size={12} className="text-neutral-500 opacity-0 group-hover:opacity-100" />
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

const FlowEngineUnified = (props) => {
  return (
    <BrowserRouter>
      <MockAuthProvider>
        <Toaster position="top-center" />
        <FlowEngineContent {...props} />
      </MockAuthProvider>
    </BrowserRouter>
  );
};

export default FlowEngineUnified;
