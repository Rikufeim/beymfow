// Flow Path Selection Page
// Simple page with 2 cards: Prompt Generator and Color Codes
// Each card opens its own workspace

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Sparkles, Palette, ArrowLeft, FolderOpen, Trash2, LogOut, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthDialog } from "@/contexts/AuthDialogContext";
import SEOHead from "@/components/SEOHead";
import { buildOrganizationSchema, buildBreadcrumbSchema, SITE_URL } from "@/lib/seo";
import PlanBadge from "@/components/PlanBadge";
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
  type HeroBackgroundProject
} from "@/lib/heroProjectStore";

// Prompt Generator Workspace - simplified view
import { QuickPromptGenerator } from "@/components/QuickPromptGenerator";

type WorkspaceType = "selection" | "prompt-generator" | "color-codes";

interface FlowEngineProps {
  onBack?: () => void;
  initialWorkspace?: WorkspaceType;
}

const FlowEnginePage: React.FC<FlowEngineProps> = ({ initialWorkspace = "selection" }) => {
  const navigate = useNavigate();
  const { user, usageInfo, signOut } = useAuth();
  const { openAuthDialog } = useAuthDialog();
  const isPro = usageInfo?.subscriptionTier === 'premium';
  const [activeWorkspace, setActiveWorkspace] = useState<WorkspaceType>(initialWorkspace);
  const [savedProjects, setSavedProjects] = useState<HeroBackgroundProject[]>([]);
  const [selectionTab, setSelectionTab] = useState<"projects" | "color-codes" | "prompt-generator">("projects");

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

  // Load saved projects
  useEffect(() => {
    setSavedProjects(loadLocalProjects());
  }, [activeWorkspace]);

  const handleDeleteProject = (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    deleteHeroProject(projectId);
    setSavedProjects(loadLocalProjects());
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
    { id: "projects" as const, label: "Projects", icon: FolderOpen },
    { id: "color-codes" as const, label: "Color Codes", icon: Palette },
    { id: "prompt-generator" as const, label: "Prompt Generator", icon: Sparkles },
  ];

  const userInitials = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : "?";

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
      <div
        className="fixed inset-0 z-[-1]"
        style={{
          background: "radial-gradient(at 40% 20%, #3e18fb60 0px, #3e18fb30 15%, transparent 55%), radial-gradient(at 80% 5%, #00000055 0px, #00000025 15%, transparent 55%), radial-gradient(at 5% 55%, #00605570 0px, #00605535 15%, transparent 55%), radial-gradient(at 85% 55%, #3e18fb45 0px, #3e18fb20 15%, transparent 55%), radial-gradient(at 10% 95%, #00000060 0px, #00000030 15%, transparent 55%), radial-gradient(at 85% 95%, #00605550 0px, #00605525 15%, transparent 55%), #000000",
          filter: "brightness(1.05)",
        }}
      />

      {/* Top Nav Bar - ShortSync style */}
      <header className="sticky top-0 z-50 w-full px-4 sm:px-8 py-4 flex items-center justify-between">
        {/* Logo / Home */}
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <img
            src="/images/beymflow-logo.png"
            alt="Beymflow"
            className="h-8 w-auto object-contain"
            loading="eager"
          />
          <span className="text-sm font-semibold tracking-widest text-white hidden sm:block">Beymflow</span>
        </Link>

        {/* Center Tabs */}
        <nav className="flex items-center bg-white/[0.06] border border-white/[0.08] rounded-full p-1 gap-0.5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.id === "projects") {
                  setSelectionTab("projects");
                } else if (tab.id === "color-codes") {
                  setSelectionTab("color-codes");
                } else {
                  setSelectionTab("prompt-generator");
                }
              }}
              className={cn(
                "px-4 sm:px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap",
                selectionTab === tab.id
                  ? "bg-white/[0.12] text-white shadow-sm"
                  : "text-neutral-400 hover:text-white hover:bg-white/[0.04]"
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* User Avatar */}
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-10 h-10 rounded-full bg-neutral-700 hover:bg-neutral-600 transition-colors flex items-center justify-center text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-white/20">
                {userInitials}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={8} className="w-64 bg-white border-none rounded-xl shadow-2xl p-0 overflow-hidden">
              {/* User info */}
              <div className="px-5 pt-5 pb-4 border-b border-neutral-200">
                <p className="text-sm font-semibold text-neutral-900">{user.email?.split('@')[0] || 'User'}</p>
                <p className="text-xs text-neutral-500 mt-0.5">{user.email}</p>
              </div>

              {/* Workspace section */}
              <div className="px-3 py-3 border-b border-neutral-200">
                <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider px-2 mb-2">Workspace</p>
                <div className="flex items-center gap-2 px-2 py-1.5 text-sm text-neutral-700">
                  <FolderOpen size={16} className="text-neutral-400" />
                  <span className="truncate flex-1">{user.email?.split('@')[0]}'s Workspace</span>
                  <span className="text-purple-500">✓</span>
                </div>
              </div>

              {/* Actions */}
              <div className="px-3 py-2">
                <DropdownMenuItem asChild className="text-neutral-700 hover:bg-neutral-100 cursor-pointer rounded-lg px-2 py-2">
                  <Link to="/settings/billing" className="flex items-center gap-2">
                    <Settings size={16} className="text-neutral-400" />
                    Account Settings
                  </Link>
                </DropdownMenuItem>
              </div>

              {/* Sign out */}
              <div className="px-3 pb-3">
                <DropdownMenuItem
                  onClick={() => signOut()}
                  className="text-red-500 hover:bg-red-50 cursor-pointer rounded-lg px-2 py-2"
                >
                  <LogOut size={16} className="mr-2" />
                  Log Out
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <button
            onClick={() => openAuthDialog()}
            className="text-sm font-medium px-4 py-2 bg-white text-black rounded-full hover:bg-neutral-200 transition-colors"
          >
            Sign In
          </button>
        )}
      </header>

      {/* Tab Content */}
      <div className="flex-1 px-4 sm:px-8 py-8">
        <div className="max-w-5xl mx-auto">

          {/* Projects Tab */}
          {selectionTab === "projects" && (
            <motion.div
              key="projects"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-white">My Projects</h2>
                <span className="text-sm text-neutral-500">{savedProjects.length} project{savedProjects.length !== 1 ? 's' : ''}</span>
              </div>

              {savedProjects.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                  {savedProjects.map((project, index) => (
                    <motion.button
                      key={project.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                      onClick={() => handleOpenProject(project)}
                      className="group relative rounded-xl border border-white/5 hover:border-white/15 bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-300 overflow-hidden text-left"
                    >
                      <div className="aspect-[16/9] w-full bg-black/40 overflow-hidden">
                        {project.thumbnail ? (
                          <img
                            src={project.thumbnail}
                            alt={project.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                        ) : (
                          <div
                            className="w-full h-full"
                            style={{
                              background: `linear-gradient(135deg, ${project.settings.color1}, ${project.settings.color2}, ${project.settings.color3 || project.settings.color1})`,
                            }}
                          />
                        )}
                      </div>
                      <div className="p-3 flex items-center justify-between">
                        <p className="text-sm font-medium text-white truncate">{project.name}</p>
                        <button
                          onClick={(e) => handleDeleteProject(e, project.id)}
                          className="p-1.5 rounded-md opacity-0 group-hover:opacity-100 hover:bg-white/10 transition-all flex-shrink-0"
                          title="Delete project"
                        >
                          <Trash2 size={14} className="text-neutral-500 hover:text-red-400 transition-colors" />
                        </button>
                      </div>
                    </motion.button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl">
                  <FolderOpen size={40} className="mx-auto text-neutral-600 mb-4" />
                  <p className="text-neutral-400 text-lg mb-2">No projects yet</p>
                  <p className="text-neutral-500 text-sm mb-6">Start creating with Color Codes or Prompt Generator</p>
                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={() => setSelectionTab("color-codes")}
                      className="px-4 py-2 bg-white/[0.08] hover:bg-white/[0.12] border border-white/10 rounded-lg text-sm text-white transition-colors"
                    >
                      Color Codes
                    </button>
                    <button
                      onClick={() => setSelectionTab("prompt-generator")}
                      className="px-4 py-2 bg-white/[0.08] hover:bg-white/[0.12] border border-white/10 rounded-lg text-sm text-white transition-colors"
                    >
                      Prompt Generator
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Color Codes Tab */}
          {selectionTab === "color-codes" && (
            <motion.div
              key="color-codes"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center mb-10">
                <div className="inline-flex items-center gap-2 mb-3">
                  <Palette size={24} className="text-cyan-400" />
                  <h2 className="text-2xl font-bold text-white">Color Codes</h2>
                </div>
                <p className="text-neutral-400 text-sm max-w-md mx-auto">Browse and create stunning color palettes & gradient backgrounds</p>
              </div>
              <div className="flex justify-center">
                <button
                  onClick={() => {
                    sessionStorage.removeItem('beymflow.editing-project-id');
                    navigate("/flow/color-codes");
                  }}
                  className="px-8 py-3 bg-white/[0.08] hover:bg-white/[0.14] border border-white/10 hover:border-white/20 rounded-xl text-white font-medium transition-all duration-200 flex items-center gap-2"
                >
                  <Palette size={18} />
                  Open Workspace
                </button>
              </div>
            </motion.div>
          )}

          {/* Prompt Generator Tab */}
          {selectionTab === "prompt-generator" && (
            <motion.div
              key="prompt-generator"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center mb-10">
                <div className="inline-flex items-center gap-2 mb-3">
                  <Sparkles size={24} className="text-purple-400" />
                  <h2 className="text-2xl font-bold text-white">Prompt Generator</h2>
                </div>
                <p className="text-neutral-400 text-sm max-w-md mx-auto">Generate powerful AI prompts for your creative projects</p>
              </div>
              <div className="flex justify-center">
                <button
                  onClick={() => navigate("/flow/prompt-generator")}
                  className="px-8 py-3 bg-white/[0.08] hover:bg-white/[0.14] border border-white/10 hover:border-white/20 rounded-xl text-white font-medium transition-all duration-200 flex items-center gap-2"
                >
                  <Sparkles size={18} />
                  Open Workspace
                </button>
              </div>
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
};

export default FlowEnginePage;
