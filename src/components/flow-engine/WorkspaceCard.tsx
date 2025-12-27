import React from "react";
import { Plus } from "lucide-react";
import { Workspace, getWorkspaceProjects, getWorkspaceInitials } from "@/lib/workspaceProjectStore";

interface WorkspaceCardProps {
  workspace: Workspace;
  onClick: () => void;
}

export const WorkspaceCard: React.FC<WorkspaceCardProps> = ({ workspace, onClick }) => {
  const projects = getWorkspaceProjects(workspace.id);
  
  return (
    <div
      className="rounded-xl border border-neutral-700/50 bg-neutral-900/80 p-3 cursor-pointer hover:border-neutral-600 transition-all group"
      onClick={onClick}
    >
      <div className="relative">
        {/* Grid of project thumbnails */}
        <div className="grid grid-cols-2 gap-1.5 mb-3">
          {projects.slice(0, 4).map((project) => (
            <div
              key={project.id}
              className="aspect-[4/3] rounded-md overflow-hidden bg-neutral-800 border border-neutral-700/30"
            >
              {project.thumbnail ? (
                <img src={project.thumbnail} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-neutral-800 to-neutral-900" />
              )}
            </div>
          ))}
          {/* Fill empty slots */}
          {Array.from({ length: Math.max(0, 4 - projects.length) }).map((_, idx) => (
            <div
              key={`empty-${idx}`}
              className="aspect-[4/3] rounded-md bg-neutral-800 border border-neutral-700/30"
            />
          ))}
        </div>

        {/* Workspace info */}
        <h3 className="text-white font-medium text-sm">{workspace.name}</h3>
        <p className="text-neutral-500 text-xs">
          {projects.length} {projects.length === 1 ? "file" : "files"}
        </p>
      </div>
    </div>
  );
};

interface CreateWorkspaceCardProps {
  onClick: () => void;
}

export const CreateWorkspaceCard: React.FC<CreateWorkspaceCardProps> = ({ onClick }) => {
  return (
    <div
      className="rounded-xl border border-neutral-700/30 border-dashed bg-neutral-900/40 p-3 flex flex-col items-center justify-center min-h-[180px] cursor-pointer hover:border-neutral-600 transition-all"
      onClick={onClick}
    >
      <div className="grid grid-cols-2 gap-1.5 mb-3 opacity-40">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="aspect-[4/3] rounded-md bg-neutral-800 border border-neutral-700/30 w-12"
          />
        ))}
      </div>

      {/* Plus button */}
      <div className="w-8 h-8 rounded-full bg-blue-500 hover:bg-blue-400 flex items-center justify-center text-white transition-colors mb-2">
        <Plus className="w-4 h-4" />
      </div>

      <p className="text-blue-400 font-medium text-xs text-center">Create new workspace</p>
    </div>
  );
};
