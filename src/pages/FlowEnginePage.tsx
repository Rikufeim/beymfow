// Flow Path Selection Page
// Simple page with 2 cards: Prompt Generator and Color Codes
// Each card opens its own workspace

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Sparkles, Palette, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { useAuth } from "@/contexts/AuthContext";

// Import workspace components
import { HeroBackgroundWorkspace, DEFAULT_SETTINGS } from "@/components/flow-engine/HeroBackgroundWorkspace";
import {
  generateProjectName as generateHeroProjectName,
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
  const { user } = useAuth();
  const [activeWorkspace, setActiveWorkspace] = useState<WorkspaceType>(initialWorkspace);
  const [selectedHeroProject, setSelectedHeroProject] = useState<HeroBackgroundProject | null>(null);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/auth?redirect=/flow');
    }
  }, [user, navigate]);

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
        isLoggedIn={false}
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
          <div className="w-full px-6 py-4 flex items-center gap-4">
            <button
              onClick={handleBack}
              className="p-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              <ArrowLeft size={20} className="text-neutral-400" />
            </button>
            <h1 className="text-xl font-semibold">Prompt Generator</h1>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-5xl mx-auto px-6 py-12">
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
        <div className="w-full px-6 py-4 flex items-center gap-4">
          <button
            onClick={handleBack}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            <ArrowLeft size={20} className="text-neutral-400" />
          </button>
          <h1 className="text-xl font-semibold">Flow Engine</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-4xl w-full">
          {/* Title */}
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent">
              Choose Your Path
            </h2>
            <p className="text-neutral-400 text-lg max-w-xl mx-auto">
              Select a workspace to start building. Each tool is designed to help you create amazing content.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {cards.map((card, index) => {
              const Icon = card.icon;
              return (
                <motion.button
                  key={card.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.4 }}
                  onClick={() => handleCardClick(card.id)}
                  className={cn(
                    "relative group text-left p-8 rounded-2xl border transition-all duration-300",
                    "bg-transparent", // Poistettu hover:bg-white/5
                    "border-white/5 hover:border-white/10",
                    "focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-black"
                  )}
                >
                  {/* Glowing effect restored */}
                  <GlowingEffect
                    spread={60}
                    glow
                    disabled={false}
                    proximity={80}
                    inactiveZone={0.01}
                    borderWidth={2}
                    className="opacity-0 group-hover:opacity-60 transition-opacity duration-300"
                  />

                  {/* Gradient overlay */}
                  {/* Gradient overlay removed */}

                  {/* Content */}
                  <div className="relative z-10">
                    {/* Icon removed */}

                    {/* Text */}
                    <h3 className="text-2xl font-semibold text-white mb-3 group-hover:text-white transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-neutral-400 text-base leading-relaxed group-hover:text-neutral-300 transition-colors">
                      {card.description}
                    </p>

                    {/* Arrow indicator */}
                    <div className="mt-6 flex items-center gap-2 text-neutral-500 group-hover:text-white transition-colors">
                      <span className="text-sm font-medium">Get started</span>
                      <svg
                        className="w-4 h-4 transform group-hover:translate-x-1 transition-transform"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlowEnginePage;
