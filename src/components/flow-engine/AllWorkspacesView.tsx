import React from "react";
import { motion } from "framer-motion";
import { FolderOpen, Plus } from "lucide-react";
import { Workspace } from "@/lib/workspaceProjectStore";
import { WorkspaceCard, CreateWorkspaceCard } from "./WorkspaceCard";

interface AllWorkspacesViewProps {
  workspaces: Workspace[];
  onCreateWorkspace: () => void;
  onOpenWorkspace: (workspace: Workspace) => void;
}

export const AllWorkspacesView: React.FC<AllWorkspacesViewProps> = ({
  workspaces,
  onCreateWorkspace,
  onOpenWorkspace,
}) => {
  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full"
    >
      {/* Header - simplified, buttons moved to global header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-1">
          {getGreeting()}, Platform.
        </h1>
        <p className="text-blue-400 text-sm">Solution Showcase environment.</p>
      </div>

      {/* Tabs - Design/FigJam style */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-1 p-1 rounded-lg bg-neutral-900/80 border border-neutral-800">
          <button className="flex items-center gap-2 px-4 py-2 rounded-md bg-neutral-800 text-white text-sm font-medium transition-colors">
            <svg className="w-4 h-4 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            All projects
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800/50 text-sm font-medium transition-colors">
            <svg className="w-4 h-4 text-orange-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M9 3v18M15 3v18M3 9h18M3 15h18" />
            </svg>
            All workspaces
          </button>
        </div>
        <span className="text-neutral-500 text-sm">{workspaces.length} workspaces</span>
      </div>

      {/* Content */}
      {workspaces.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 rounded-xl bg-neutral-800 flex items-center justify-center mb-4">
            <FolderOpen className="w-8 h-8 text-neutral-500" />
          </div>
          <p className="text-neutral-400 mb-4">No workspaces yet</p>
          <button
            onClick={onCreateWorkspace}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create your first workspace
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {workspaces.map((workspace) => (
            <WorkspaceCard
              key={workspace.id}
              workspace={workspace}
              onClick={() => onOpenWorkspace(workspace)}
            />
          ))}
          <CreateWorkspaceCard onClick={onCreateWorkspace} />
        </div>
      )}
    </motion.div>
  );
};
