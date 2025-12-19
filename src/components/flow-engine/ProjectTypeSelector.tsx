import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Layers, Palette, Globe, Smartphone, Gamepad2 } from "lucide-react";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { cn } from "@/lib/utils";

export type ProjectType = "flow" | "hero-background";

interface ProjectTypeOption {
  id: ProjectType;
  name: string;
  description: string;
  icon: React.ElementType;
  badge?: string;
  comingSoon?: boolean;
}

const PROJECT_TYPES: ProjectTypeOption[] = [
  {
    id: "hero-background",
    name: "Hero Background Generator",
    description: "Create stunning shader/gradient backgrounds for hero sections with real-time preview",
    icon: Palette,
    badge: "New",
  },
  {
    id: "flow",
    name: "Flow Workspace",
    description: "Build complex workflows with nodes, connections and AI-powered generation",
    icon: Layers,
  },
];

interface ProjectTypeSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (type: ProjectType) => void;
}

export const ProjectTypeSelector: React.FC<ProjectTypeSelectorProps> = ({
  isOpen,
  onClose,
  onSelect,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-full max-w-2xl bg-neutral-950 border border-white/10 rounded-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
              <div>
                <h2 className="text-xl font-semibold text-white">New Project</h2>
                <p className="text-sm text-white/50 mt-1">Choose a workspace type</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/5 text-white/50 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Project type grid */}
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {PROJECT_TYPES.map((type) => {
                const Icon = type.icon;
                return (
                  <div key={type.id} className="min-h-[140px]">
                    <div 
                      className={cn(
                        "relative h-full rounded-xl border border-white/10 p-[1px]",
                        type.comingSoon ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                      )} 
                      style={{ transform: 'translateZ(0)', willChange: 'transform' }}
                    >
                      {!type.comingSoon && (
                        <GlowingEffect 
                          spread={30} 
                          glow 
                          disabled={false} 
                          proximity={50} 
                          inactiveZone={0.01} 
                          borderWidth={1.5} 
                          className="opacity-60" 
                        />
                      )}
                      <button
                        onClick={() => !type.comingSoon && onSelect(type.id)}
                        disabled={type.comingSoon}
                        className="relative w-full h-full flex flex-col gap-4 rounded-[0.7rem] bg-gradient-to-br from-neutral-900 via-neutral-950 to-neutral-900 p-5 text-left hover:from-neutral-800/80 hover:to-neutral-900 transition-all group"
                      >
                        {type.badge && (
                          <div className="absolute top-3 right-3">
                            <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                              {type.badge}
                            </span>
                          </div>
                        )}
                        {type.comingSoon && (
                          <div className="absolute top-3 right-3">
                            <span className="px-2 py-0.5 rounded text-[10px] bg-white/5 text-white/50 border border-white/10">
                              Coming Soon
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                            <Icon size={20} className="text-white/80" />
                          </div>
                          <h3 className="text-base font-semibold text-white/90">{type.name}</h3>
                        </div>
                        <p className="text-sm text-white/50 leading-relaxed">{type.description}</p>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-white/5 flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/5 transition-all"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProjectTypeSelector;
