// Flow Path Selection Page
// Simple page with 2 cards: Prompt Generator and Color Codes
// Each card opens its own workspace

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Sparkles, Palette, ArrowLeft, FolderOpen, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthDialog } from "@/contexts/AuthDialogContext";
import { Lock } from "lucide-react";

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
  const { user, usageInfo } = useAuth();
  const { openAuthDialog } = useAuthDialog();
  const isPro = usageInfo?.subscriptionTier === 'premium';
  const [activeWorkspace, setActiveWorkspace] = useState<WorkspaceType>(initialWorkspace);
  const [savedProjects, setSavedProjects] = useState<HeroBackgroundProject[]>([]);

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
      <HeroBackgroundWorkspace
        projectId={selectedHeroProject?.id}
        projectName={selectedHeroProject?.name || generateHeroProjectName()}
        initialSettings={selectedHeroProject?.settings || DEFAULT_SETTINGS}
        isLoggedIn={true}
        onBack={handleHeroWorkspaceBack}
        onSave={handleHeroProjectSave}
      />
    );
  }

  // Render Prompt Generator Workspace
  if (activeWorkspace === "prompt-generator") {
    return (
      <div className="relative min-h-screen bg-transparent text-white">
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

  // Render Selection View
  return (
    <div className="relative min-h-screen bg-transparent text-white flex flex-col">
      <div
        className="fixed inset-0 z-[-1]"
        style={{
          background: "radial-gradient(at 40% 20%, #3e18fb60 0px, #3e18fb30 15%, transparent 55%), radial-gradient(at 80% 5%, #00000055 0px, #00000025 15%, transparent 55%), radial-gradient(at 5% 55%, #00605570 0px, #00605535 15%, transparent 55%), radial-gradient(at 85% 55%, #3e18fb45 0px, #3e18fb20 15%, transparent 55%), radial-gradient(at 10% 95%, #00000060 0px, #00000030 15%, transparent 55%), radial-gradient(at 85% 95%, #00605550 0px, #00605525 15%, transparent 55%), #000000",
          filter: "brightness(1.05)",
        }}
      />
      {/* Header */}
      <div className="sticky top-0 z-50 bg-transparent">
        <div className="w-full px-4 sm:px-6 py-3 sm:py-4 flex items-center gap-3 sm:gap-4">
          <button
            onClick={handleBack}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            <ArrowLeft size={20} className="text-neutral-400" />
          </button>
          <h1 className="text-lg sm:text-xl font-semibold">Flow</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-6 sm:py-12">
        <div className="max-w-4xl w-full">
          {/* Title */}
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-3xl md:text-5xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent">
              Choose Your Path
            </h2>
            <p className="text-neutral-400 text-base sm:text-lg max-w-xl mx-auto">
              Select a workspace to start building. Each tool is designed to help you create amazing content.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {cards.map((card, index) => {
              const Icon = card.icon;
              const isLocked = false;
              return (
                <motion.button
                  key={card.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.4 }}
                  onClick={() => handleCardClick(card.id)}
                  className={cn(
                    "relative group text-left p-5 sm:p-8 rounded-2xl border transition-all duration-300",
                    "bg-transparent",
                    "border-white/5 hover:border-white/10",
                    "focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-black"
                  )}
                >
                  <GlowingEffect
                    spread={60}
                    glow
                    disabled={false}
                    proximity={80}
                    inactiveZone={0.01}
                    borderWidth={2}
                    className="opacity-0 group-hover:opacity-60 transition-opacity duration-300"
                  />

                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-2xl font-semibold text-white group-hover:text-white transition-colors">
                        {card.title}
                      </h3>
                      {isLocked && (
                        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-medium">
                          <Lock size={12} />
                          Pro
                        </span>
                      )}
                    </div>
                    <p className="text-neutral-400 text-base leading-relaxed group-hover:text-neutral-300 transition-colors">
                      {card.description}
                    </p>

                    <div className="mt-6 flex items-center gap-2 text-neutral-500 group-hover:text-white transition-colors">
                      <span className="text-sm font-medium">{isLocked ? 'Upgrade to Pro' : 'Get started'}</span>
                      <svg
                        className="w-4 h-4 transform group-hover:translate-x-1 transition-transform"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* My Projects Section */}
          {savedProjects.length > 0 && (
            <div className="mt-16">
              <div className="flex items-center gap-3 mb-6">
                <FolderOpen size={20} className="text-neutral-400" />
                <h3 className="text-xl font-semibold text-white">My Projects</h3>
                <span className="text-sm text-neutral-500">({savedProjects.length})</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {savedProjects.map((project, index) => (
                  <motion.button
                    key={project.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                    onClick={() => handleOpenProject(project)}
                    className="group relative rounded-xl border border-white/5 hover:border-white/15 bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-300 overflow-hidden text-left"
                  >
                    {/* Thumbnail */}
                    <div className="aspect-video w-full bg-black/40 overflow-hidden">
                      {project.thumbnail ? (
                        <img
                          src={project.thumbnail}
                          alt={project.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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

                    {/* Info */}
                    <div className="p-3 flex items-center justify-between">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate">{project.name}</p>
                        <p className="text-xs text-neutral-500 mt-0.5">
                          {new Date(project.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={(e) => handleDeleteProject(e, project.id)}
                        className="p-1.5 rounded-md opacity-0 group-hover:opacity-100 hover:bg-white/10 transition-all"
                        title="Delete project"
                      >
                        <Trash2 size={14} className="text-neutral-500 hover:text-red-400 transition-colors" />
                      </button>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FlowEnginePage;
