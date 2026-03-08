// Flow Path Selection Page
// Simple page with 2 cards: Prompt Generator and Color Codes
// Each card opens its own workspace

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NeuroNoise } from "@paper-design/shaders-react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Palette, ArrowLeft, FolderOpen, Trash2, Settings, Plus, Users, BookOpen, MessageSquare, FileText, Copy } from "lucide-react";
import { toast } from "@/lib/notifications";
import { cn } from "@/lib/utils";
import SEOHead from "@/components/SEOHead";
import { buildOrganizationSchema, buildBreadcrumbSchema, SITE_URL } from "@/lib/seo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";

// Import workspace components
import { HeroBackgroundWorkspace, DEFAULT_SETTINGS } from "@/components/flow-engine/HeroBackgroundWorkspace";
import {
  generateProjectName as generateHeroProjectName,
  loadLocalProjects,
  getProject as getHeroProject,
  deleteProject as deleteHeroProject,
  saveProject as saveHeroProject,
  type HeroBackgroundProject
} from "@/lib/heroProjectStore";

// Prompt Generator Workspace - simplified view
import { QuickPromptGenerator } from "@/components/QuickPromptGenerator";
import { loadPromptProjects, deletePromptProject, type PromptProject } from "@/lib/promptProjectStore";

type WorkspaceType = "selection" | "prompt-generator" | "color-codes";

interface FlowEngineProps {
  onBack?: () => void;
  initialWorkspace?: WorkspaceType;
}

const FlowEnginePage: React.FC<FlowEngineProps> = ({ initialWorkspace = "selection" }) => {
  const navigate = useNavigate();
  const isPro = false;
  const [activeWorkspace, setActiveWorkspace] = useState<WorkspaceType>(initialWorkspace);
  const [savedProjects, setSavedProjects] = useState<HeroBackgroundProject[]>([]);
  const [selectionTab, setSelectionTab] = useState<"color-codes" | "prompt-generator">("color-codes");
  const [savedPrompts, setSavedPrompts] = useState<PromptProject[]>([]);
  const [renamingProjectId, setRenamingProjectId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  // Resolve editing project from sessionStorage
  const editingProjectId = initialWorkspace === "color-codes"
    ? sessionStorage.getItem('beymflow.editing-project-id')
    : null;
  const selectedHeroProject = editingProjectId ? getHeroProject(editingProjectId) : null;

  // Clear the editing flag when entering color-codes from the card (no project selected)
  useEffect(() => {
    if (initialWorkspace === "color-codes" && !editingProjectId) {
      sessionStorage.removeItem('beymflow.editing-project-id');
    }
  }, [initialWorkspace, editingProjectId]);

  // Load saved projects & prompts
  useEffect(() => {
    setSavedProjects(loadLocalProjects());
    setSavedPrompts(loadPromptProjects());
  }, [activeWorkspace, selectionTab]);

  const handleDeleteProject = (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    deleteHeroProject(projectId);
    setSavedProjects(loadLocalProjects());
  };

  const handleDeletePromptProject = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deletePromptProject(id);
    setSavedPrompts(loadPromptProjects());
  };

  const handleRenameProject = (project: HeroBackgroundProject, newName: string) => {
    const trimmed = newName.trim();
    if (trimmed && trimmed !== project.name) {
      saveHeroProject({ ...project, name: trimmed });
      setSavedProjects(loadLocalProjects());
    }
    setRenamingProjectId(null);
  };

  const handleOpenProject = (project: HeroBackgroundProject) => {
    // Store selected project ID in sessionStorage so it persists across route changes
    sessionStorage.setItem('beymflow.editing-project-id', project.id);
    navigate("/flow/color-codes");
  };

  useEffect(() => {
    setActiveWorkspace(initialWorkspace);
  }, [initialWorkspace]);

  // Auth is optional - workspace is usable without login

  // Card data
  const cards = [
    {
      id: "prompt-generator",
      title: "Prompt Generator",
      description: "Generate prompts for your projects",
      icon: Sparkles,
      gradient: "from-purple-500/20 via-purple-600/10 to-transparent",
      iconColor: "text-purple-400",
      borderColor: "border-purple-500/30",
    },
    {
      id: "color-codes",
      title: "Color Codes",
      description: "Browse and copy color palettes & codes",
      icon: Palette,
      gradient: "from-cyan-500/20 via-cyan-600/10 to-transparent",
      iconColor: "text-cyan-400",
      borderColor: "border-cyan-500/30",
    },
  ];

  const handleCardClick = (cardId: string) => {
    if (cardId === "prompt-generator") {
      navigate("/flow/prompt-generator");
    } else if (cardId === "color-codes") {
      sessionStorage.removeItem('beymflow.editing-project-id');
      navigate("/flow/color-codes");
    }
  };

  const handleBack = () => {
    if (activeWorkspace !== "selection") {
      navigate("/flow");
    } else {
      navigate("/");
    }
  };

  const handleHeroWorkspaceBack = () => {
    navigate("/flow");
  };

  const handleHeroProjectSave = (project: HeroBackgroundProject) => {
    // Save logic can be implemented here
    console.log("Project saved:", project);
  };

  // Render Color Codes Workspace
  if (activeWorkspace === "color-codes") {
    return (
      <>
        <SEOHead
          pathname="/flow/color-codes"
          schemas={[
            buildOrganizationSchema(),
            buildBreadcrumbSchema([
              { name: "Beymflow", url: `${SITE_URL}/` },
              { name: "Flow", url: `${SITE_URL}/flow` },
              { name: "Color Codes", url: `${SITE_URL}/flow/color-codes` },
            ]),
          ]}
        />
        <HeroBackgroundWorkspace
          projectId={selectedHeroProject?.id}
          projectName={selectedHeroProject?.name || generateHeroProjectName()}
          initialSettings={selectedHeroProject?.settings || DEFAULT_SETTINGS}
          initialAnimatedBg={selectedHeroProject?.animatedBg}
          isLoggedIn={true}
          onBack={handleHeroWorkspaceBack}
          onSave={handleHeroProjectSave}
        />
      </>
    );
  }

  // Render Prompt Generator Workspace
  if (activeWorkspace === "prompt-generator") {
    return (
      <div className="relative min-h-screen bg-transparent text-white">
        <SEOHead
          pathname="/flow/prompt-generator"
          schemas={[
            buildOrganizationSchema(),
            buildBreadcrumbSchema([
              { name: "Beymflow", url: `${SITE_URL}/` },
              { name: "Flow", url: `${SITE_URL}/flow` },
              { name: "Prompt Generator", url: `${SITE_URL}/flow/prompt-generator` },
            ]),
          ]}
        />
        <div
          className="fixed inset-0 z-[-1]"
          style={{
            background: "radial-gradient(at 40% 20%, #3e18fb60 0px, #3e18fb30 15%, transparent 55%), radial-gradient(at 80% 5%, #00000055 0px, #00000025 15%, transparent 55%), radial-gradient(at 5% 55%, #00605570 0px, #00605535 15%, transparent 55%), radial-gradient(at 85% 55%, #3e18fb45 0px, #3e18fb20 15%, transparent 55%), radial-gradient(at 10% 95%, #00000060 0px, #00000030 15%, transparent 55%), radial-gradient(at 85% 95%, #00605550 0px, #00605525 15%, transparent 55%), #000000",
            filter: "brightness(1.05)",
          }}
        />
        {/* Header */}
        <div className="sticky top-0 z-50">
          <div className="w-full px-4 sm:px-6 py-3 sm:py-4 flex items-center gap-3 sm:gap-4">
            <button
              onClick={handleBack}
              className="p-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              <ArrowLeft size={20} className="text-neutral-400" />
            </button>
            <h1 className="text-lg sm:text-xl font-semibold">Prompt Generator</h1>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-5xl mx-auto px-3 sm:px-6 py-6 sm:py-12">
          <QuickPromptGenerator />
        </div>
      </div>
    );
  }


  const tabs = [
    { id: "color-codes" as const, label: "Color Codes", icon: Palette },
    { id: "prompt-generator" as const, label: "Prompt Generator", icon: Sparkles },
  ];

  const userInitials = "U";

  // Render Selection View
  return (
    <div className="relative min-h-screen bg-transparent text-white flex flex-col">
      <SEOHead
        pathname="/flow"
        schemas={[
          buildOrganizationSchema(),
          buildBreadcrumbSchema([
            { name: "Beymflow", url: `${SITE_URL}/` },
            { name: "Flow", url: `${SITE_URL}/flow` },
          ]),
        ]}
      />
      {/* Layered ambient background */}
      <div className="fixed inset-0 z-[-1] overflow-hidden">
        {/* Base */}
        <div className="absolute inset-0" style={{ background: "#050507" }} />
        {/* Primary glow – deep indigo */}
        <div className="absolute inset-0" style={{
          background: "radial-gradient(ellipse 70% 55% at 35% 25%, rgba(62,24,251,0.35) 0%, transparent 70%)",
        }} />
        {/* Secondary glow – teal accent */}
        <div className="absolute inset-0" style={{
          background: "radial-gradient(ellipse 60% 50% at 75% 65%, rgba(0,180,160,0.18) 0%, transparent 65%)",
        }} />
        {/* Warm highlight – subtle amber kiss */}
        <div className="absolute inset-0" style={{
          background: "radial-gradient(ellipse 45% 40% at 60% 15%, rgba(255,140,50,0.07) 0%, transparent 60%)",
        }} />
        {/* Depth shadow – bottom corners */}
        <div className="absolute inset-0" style={{
          background: "radial-gradient(ellipse 80% 50% at 50% 100%, rgba(0,0,0,0.6) 0%, transparent 60%)",
        }} />
        {/* Subtle noise grain via CSS */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: "128px 128px",
        }} />
      </div>

      {/* Top Nav Bar - ShortSync style */}
      <header className="sticky top-0 z-50 w-full px-4 sm:px-8 py-4 flex items-center justify-between relative">
        {/* Logo */}
        <div className="flex items-center">
          <img
            src="/images/beymflow-logo.png"
            alt="Beymflow"
            className="h-12 sm:h-14 md:h-16 w-auto object-contain"
            loading="eager"
          />
        </div>

        {/* Center Tabs */}
        <nav className="absolute left-1/2 -translate-x-1/2 flex items-center bg-black/60 backdrop-blur-md border border-white/[0.1] rounded-full p-0.5 gap-0.5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setSelectionTab(tab.id as typeof selectionTab);
              }}
              className={cn(
                "px-3 sm:px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 whitespace-nowrap",
                selectionTab === tab.id
                  ? "bg-white/[0.15] text-white shadow-sm"
                  : "text-neutral-400 hover:text-white hover:bg-white/[0.06]"
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-10 h-10 rounded-full bg-black/70 hover:bg-black/80 backdrop-blur-md transition-colors flex items-center justify-center text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-white/20">
              {userInitials}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" sideOffset={8} className="w-72 border-none rounded-xl shadow-2xl p-0 overflow-hidden bg-neutral-900 border border-white/10">
            <div className="px-5 pt-5 pb-3">
              <p className="text-[11px] font-semibold text-purple-400 uppercase tracking-wider mb-3">Workspace</p>
              <div className="flex items-center gap-2.5 py-1.5 text-sm text-white font-medium">
                <FolderOpen size={16} className="text-neutral-500" />
                <span className="truncate flex-1">My Workspace</span>
                <span className="text-purple-400">✓</span>
              </div>
              <button className="flex items-center gap-2.5 py-1.5 text-sm text-neutral-400 hover:text-white transition-colors w-full mt-1">
                <Plus size={16} className="text-neutral-500" />
                Create Workspace
              </button>
            </div>
            <div className="border-t border-white/10" />
            <div className="px-3 py-2 space-y-0.5">
              <DropdownMenuItem asChild className="text-neutral-300 hover:bg-white/10 cursor-pointer rounded-lg px-3 py-2.5 text-sm focus:bg-white/10 focus:text-white">
                <Link to="/flow/team-settings" className="flex items-center">
                  <Users size={16} className="mr-2.5 text-neutral-500" />
                  Team Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="text-neutral-300 hover:bg-white/10 cursor-pointer rounded-lg px-3 py-2.5 text-sm focus:bg-white/10 focus:text-white">
                <Link to="/flow/account-settings" className="flex items-center">
                  <Settings size={16} className="mr-2.5 text-neutral-500" />
                  Account Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="text-neutral-300 hover:bg-white/10 cursor-pointer rounded-lg px-3 py-2.5 text-sm focus:bg-white/10 focus:text-white">
                <Link to="/flow/documentation" className="flex items-center">
                  <BookOpen size={16} className="mr-2.5 text-neutral-500" />
                  Documentation
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="text-neutral-300 hover:bg-white/10 cursor-pointer rounded-lg px-3 py-2.5 text-sm focus:bg-white/10 focus:text-white">
                <Link to="/flow/feedback" className="flex items-center">
                  <MessageSquare size={16} className="mr-2.5 text-neutral-500" />
                  Give Feedback
                </Link>
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* Tab Content */}
      <div className="flex-1 px-4 sm:px-6 py-8">
        <div className="w-full">

          {/* Shared persistent background — never unmounts */}
          <div className="fixed inset-0 z-30 overflow-hidden pointer-events-none">
            <NeuroNoise
              style={{ width: "100%", height: "100%" }}
              colorFront="#000000"
              colorBack={selectionTab === "color-codes" ? "#6366f1" : "#7c3aed"}
              speed={0.5}
              scale={1}
              brightness={1.2}
            />
            {/* Color accent overlay that fades between tabs */}
            <AnimatePresence mode="wait">
              <motion.div
                key={selectionTab}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="absolute inset-0"
                style={{
                  background: selectionTab === "color-codes"
                    ? "radial-gradient(ellipse 70% 55% at 35% 25%, rgba(99,102,241,0.25) 0%, transparent 70%)"
                    : "radial-gradient(ellipse 70% 55% at 65% 35%, rgba(124,58,237,0.25) 0%, transparent 70%)",
                  mixBlendMode: "screen",
                }}
              />
            </AnimatePresence>
          </div>

          {/* Persistent center button — stays in place across tab switches */}
          <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
            <button
              onClick={() => {
                if (selectionTab === "color-codes") {
                  sessionStorage.removeItem('beymflow.editing-project-id');
                  navigate("/flow/color-codes");
                } else {
                  navigate("/flow/prompt-generator");
                }
              }}
              className="pointer-events-auto px-8 py-3.5 bg-black/70 backdrop-blur-md text-white font-semibold rounded-xl border border-white/15 hover:bg-black/80 transition-all duration-200 shadow-2xl"
            >
              Open Workspace
            </button>
          </div>

          <AnimatePresence mode="wait">
          {/* Color Codes Tab */}
          {selectionTab === "color-codes" && (
            <motion.div
              key="color-codes"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="fixed inset-0 z-40 flex flex-col items-center justify-center"
            >
              <div className="absolute inset-0 overflow-hidden">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.3 }}
                  transition={{ duration: 0.4 }}
                  className="absolute inset-0 flex flex-col items-center pt-20 gap-6"
                  style={{ filter: "blur(4px)" }}
                >
                  <div className="w-[80%] max-w-4xl h-16 rounded-xl bg-white/5 border border-white/10" />
                  <div className="w-[80%] max-w-4xl flex gap-4">
                    <div className="flex-1 h-64 rounded-xl bg-white/5 border border-white/10" />
                    <div className="w-64 h-64 rounded-xl bg-white/5 border border-white/10" />
                  </div>
                  <div className="w-[80%] max-w-4xl h-32 rounded-xl bg-white/5 border border-white/10" />
                </motion.div>
              </div>




              {/* Saved Color Projects at bottom */}
              {savedProjects.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                  className="relative z-10 mt-auto pb-6 w-full px-6"
                >
                  <p className="text-sm font-semibold text-white tracking-wide mb-4">Saved Projects</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pb-2">
                    {savedProjects.map((project) => (
                      <div
                        key={project.id}
                        className="group relative rounded-xl border border-white/10 hover:border-white/20 bg-black/60 hover:bg-black/70 transition-all overflow-hidden cursor-pointer backdrop-blur-sm"
                        onClick={() => handleOpenProject(project)}
                      >
                        <div className="aspect-[16/9] w-full overflow-hidden">
                          {project.thumbnail ? (
                            <img src={project.thumbnail} alt={project.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                          ) : (
                            <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${project.settings.color1}, ${project.settings.color2})` }} />
                          )}
                        </div>
                        <div className="p-3 flex items-center justify-between gap-2">
                          {renamingProjectId === project.id ? (
                            <input
                              autoFocus
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              onBlur={() => handleRenameProject(project, editingName)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleRenameProject(project, editingName);
                                if (e.key === "Escape") setRenamingProjectId(null);
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className="flex-1 bg-transparent border border-white/20 rounded px-2 py-0.5 text-xs text-white outline-none focus:border-white/40"
                            />
                          ) : (
                            <span
                              className="text-xs text-white/70 truncate flex-1 cursor-text hover:text-white transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                setRenamingProjectId(project.id);
                                setEditingName(project.name);
                              }}
                            >
                              {project.name}
                            </span>
                          )}
                          <button
                            onClick={(e) => handleDeleteProject(e, project.id)}
                            className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-white/10 transition-all flex-shrink-0"
                          >
                            <Trash2 size={12} className="text-neutral-500 hover:text-red-400" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Prompt Generator Tab */}
          {selectionTab === "prompt-generator" && (
            <motion.div
              key="prompt-generator"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="fixed inset-0 z-40 flex flex-col"
            >
              <div className="absolute inset-0 overflow-hidden">
                {/* Darkening overlay for prompt tab */}
                <div className="absolute inset-0 bg-black/50 z-[1]" />
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.3 }}
                  transition={{ duration: 0.4 }}
                  className="absolute inset-0 z-[2] flex flex-col items-center pt-20 gap-6"
                  style={{ filter: "blur(4px)" }}
                >
                  <div className="w-[80%] max-w-3xl h-12 rounded-xl bg-white/5 border border-white/10" />
                  <div className="w-[80%] max-w-3xl h-40 rounded-xl bg-white/5 border border-white/10" />
                  <div className="w-[80%] max-w-3xl flex gap-3">
                    <div className="flex-1 h-10 rounded-lg bg-white/5 border border-white/10" />
                    <div className="flex-1 h-10 rounded-lg bg-white/5 border border-white/10" />
                    <div className="flex-1 h-10 rounded-lg bg-white/5 border border-white/10" />
                  </div>
                  <div className="w-[80%] max-w-3xl h-64 rounded-xl bg-white/5 border border-white/10" />
                </motion.div>
              </div>


              {/* Saved Prompts at bottom */}
              {savedPrompts.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                  className="relative z-10 mt-auto pb-6 w-full px-6"
                >
                  <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-3">Saved Prompts</p>
                  <div className="flex flex-col gap-2 max-h-48 overflow-y-auto scrollbar-hide">
                    {savedPrompts.slice(0, 6).map((sp) => (
                      <div
                        key={sp.id}
                        className="group flex items-center gap-3 px-4 py-3 rounded-xl border border-white/5 hover:border-white/10 bg-white/[0.03] hover:bg-white/[0.06] transition-all"
                      >
                        <FileText size={14} className="text-purple-400/60 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-white/80 truncate">{sp.name}</p>
                          <p className="text-[10px] text-neutral-500 truncate">{sp.prompt.slice(0, 80)}...</p>
                        </div>
                        <button
                          onClick={(e) => {
                            navigator.clipboard.writeText(sp.prompt);
                            toast.success("Copied!");
                          }}
                          className="p-1.5 rounded opacity-0 group-hover:opacity-100 hover:bg-white/10 transition-all flex-shrink-0"
                        >
                          <Copy size={12} className="text-neutral-400" />
                        </button>
                        <button
                          onClick={(e) => handleDeletePromptProject(e, sp.id)}
                          className="p-1.5 rounded opacity-0 group-hover:opacity-100 hover:bg-white/10 transition-all flex-shrink-0"
                        >
                          <Trash2 size={12} className="text-neutral-500 hover:text-red-400" />
                        </button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default FlowEnginePage;
