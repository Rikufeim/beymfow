import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, RotateCcw, X } from "lucide-react";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { cn } from "@/lib/utils";
import { 
  WorkspaceProject, 
  getTrashedProjects, 
  restoreProject, 
  permanentlyDeleteProject,
  getWorkspace
} from "@/lib/workspaceProjectStore";
import { toast } from "@/lib/notifications";

interface TrashViewProps {
  onRefresh?: () => void;
}

export const TrashView: React.FC<TrashViewProps> = ({ onRefresh }) => {
  const [trashedProjects, setTrashedProjects] = React.useState<WorkspaceProject[]>([]);

  const loadTrashedProjects = React.useCallback(() => {
    setTrashedProjects(getTrashedProjects());
  }, []);

  React.useEffect(() => {
    loadTrashedProjects();
  }, [loadTrashedProjects]);

  const handleRestore = (project: WorkspaceProject) => {
    const success = restoreProject(project.id);
    if (success) {
      toast.success(`"${project.name}" restored`);
      loadTrashedProjects();
      onRefresh?.();
    }
  };

  const handlePermanentDelete = (project: WorkspaceProject) => {
    const success = permanentlyDeleteProject(project.id);
    if (success) {
      toast.success(`"${project.name}" permanently deleted`);
      loadTrashedProjects();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full"
    >

      {/* Content */}
      {trashedProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 rounded-xl bg-neutral-800 flex items-center justify-center mb-4">
            <Trash2 className="w-8 h-8 text-neutral-500" />
          </div>
          <p className="text-neutral-400">Trash is empty</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {trashedProjects.map((project) => {
              const workspace = getWorkspace(project.workspaceId);
              return (
                <motion.div
                  key={project.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="min-h-[11rem]"
                >
                  <div className={cn("relative h-full rounded-2xl border border-white/10 p-[1px]")} style={{ transform: 'translateZ(0)', willChange: 'transform' }}>
                    <GlowingEffect spread={40} glow disabled={false} proximity={64} inactiveZone={0.01} borderWidth={2} className="opacity-50" />
                    <div
                      className="group relative flex h-full flex-col justify-between gap-4 rounded-[1.05rem] bg-gradient-to-br from-[#0a0a0a] via-[#080808] to-[#0a0a0a] p-5 sm:p-6 overflow-hidden will-change-transform"
                      style={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden' }}
                    >
                      {/* Action buttons */}
                      <div className="absolute top-3 right-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                        <button
                          onClick={() => handleRestore(project)}
                          className="p-1.5 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 text-teal-400 transition-colors"
                          title="Restore"
                        >
                          <RotateCcw size={14} />
                        </button>
                        <button
                          onClick={() => handlePermanentDelete(project)}
                          className="p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors"
                          title="Delete permanently"
                        >
                          <X size={14} />
                        </button>
                      </div>

                      {/* Content */}
                      <div className="relative z-10 flex flex-col justify-between gap-4 h-full opacity-60">
                        <div className="flex flex-col gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-fit rounded-lg border border-white/10 bg-white/5 p-2">
                              <Trash2 className="w-5 h-5 text-neutral-400" />
                            </div>
                            <h3 className="text-lg font-semibold tracking-tight text-white/70 truncate line-through">
                              {project.name}
                            </h3>
                          </div>
                          <div className="space-y-1">
                            {workspace && (
                              <p className="text-xs text-neutral-500">
                                From: {workspace.name}
                              </p>
                            )}
                            <p className="text-xs text-neutral-500">
                              Deleted: {project.deletedAt ? new Date(project.deletedAt).toLocaleDateString() : "Unknown"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
};

export default TrashView;
