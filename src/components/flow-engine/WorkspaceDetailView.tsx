import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  ChevronDown,
  Users,
  Settings,
  Link2,
  Pencil,
  Image,
  LogOut,
  Trash2,
  Plus,
  FolderOpen,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Workspace,
  WorkspaceProject,
  getWorkspaceProjects,
  getWorkspaceInitials,
  deleteWorkspace,
  updateWorkspace,
  softDeleteProject,
} from "@/lib/workspaceProjectStore";
import { toast } from "@/lib/notifications";

interface WorkspaceDetailViewProps {
  workspace: Workspace;
  onBack: () => void;
  onCreateProject: () => void;
  onOpenProject: (project: WorkspaceProject) => void;
  onWorkspaceUpdated: () => void;
}

export const WorkspaceDetailView: React.FC<WorkspaceDetailViewProps> = ({
  workspace,
  onBack,
  onCreateProject,
  onOpenProject,
  onWorkspaceUpdated,
}) => {
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(workspace.name);
  const [projectsList, setProjectsList] = useState<WorkspaceProject[]>([]);

  // Load projects
  React.useEffect(() => {
    setProjectsList(getWorkspaceProjects(workspace.id));
  }, [workspace.id]);

  const refreshProjects = () => {
    setProjectsList(getWorkspaceProjects(workspace.id));
  };

  const handleDeleteProject = (e: React.MouseEvent, project: WorkspaceProject) => {
    e.stopPropagation();
    softDeleteProject(project.id);
    refreshProjects();
    toast.success(`"${project.name}" moved to trash`);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/flow-engine?workspace=${workspace.id}`);
    toast.success("Link copied to clipboard");
  };

  const handleRename = () => {
    if (newName.trim() && newName !== workspace.name) {
      updateWorkspace(workspace.id, { name: newName.trim() });
      onWorkspaceUpdated();
      toast.success("Workspace renamed");
    }
    setIsRenaming(false);
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${workspace.name}"? This will also delete all projects inside.`)) {
      deleteWorkspace(workspace.id);
      onWorkspaceUpdated();
      onBack();
      toast.success("Workspace deleted");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full"
    >
      {/* Tabs row */}
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-lg bg-neutral-800 text-white text-sm font-medium hover:bg-neutral-700 transition-colors"
        >
          All workspaces
        </button>
        <button className="px-4 py-2 rounded-lg bg-neutral-800 text-white text-sm font-medium">
          All projects
        </button>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg"
            style={{ backgroundColor: workspace.iconColor || "#f97316" }}
          >
            <Users className="w-6 h-6" />
          </div>

          {/* Name with dropdown */}
          <div className="flex items-center gap-2">
            {isRenaming ? (
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onBlur={handleRename}
                onKeyDown={(e) => e.key === "Enter" && handleRename()}
                className="text-2xl font-bold text-white bg-transparent border-b border-blue-500 focus:outline-none"
                autoFocus
              />
            ) : (
              <h1 className="text-2xl font-bold text-white">{workspace.name}</h1>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1 rounded hover:bg-neutral-700 transition-colors">
                  <ChevronDown className="w-5 h-5 text-neutral-400" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-48 bg-neutral-800 border-neutral-700"
              >
                <DropdownMenuItem
                  className="flex items-center gap-2 text-neutral-200 hover:bg-neutral-700 cursor-pointer"
                  onClick={() => toast.info("View members coming soon")}
                >
                  <Users className="w-4 h-4" />
                  View members
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="flex items-center gap-2 text-neutral-200 hover:bg-neutral-700 cursor-pointer"
                  onClick={() => toast.info("Settings coming soon")}
                >
                  <Settings className="w-4 h-4" />
                  View settings
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-neutral-700" />
                <DropdownMenuItem
                  className="flex items-center gap-2 text-neutral-200 hover:bg-neutral-700 cursor-pointer"
                  onClick={handleCopyLink}
                >
                  <Link2 className="w-4 h-4" />
                  Copy link
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="flex items-center gap-2 text-neutral-200 hover:bg-neutral-700 cursor-pointer"
                  onClick={() => setIsRenaming(true)}
                >
                  <Pencil className="w-4 h-4" />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="flex items-center gap-2 text-neutral-200 hover:bg-neutral-700 cursor-pointer"
                  onClick={() => toast.info("Change icon coming soon")}
                >
                  <Image className="w-4 h-4" />
                  Change icon
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-neutral-700" />
                <DropdownMenuItem
                  className="flex items-center gap-2 text-neutral-200 hover:bg-neutral-700 cursor-pointer"
                  onClick={() => toast.info("Leave team coming soon")}
                >
                  <LogOut className="w-4 h-4" />
                  Leave team...
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="flex items-center gap-2 text-red-400 hover:bg-neutral-700 cursor-pointer"
                  onClick={handleDelete}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete...
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Right side - project count */}
        <span className="text-neutral-500 text-sm">{projectsList.length} projects</span>
      </div>


      {/* Content */}
      {projectsList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 rounded-xl bg-neutral-800 flex items-center justify-center mb-4">
            <FolderOpen className="w-8 h-8 text-neutral-500" />
          </div>
          <p className="text-neutral-400 mb-4">No solutions available yet.</p>
          <button
            onClick={onCreateProject}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add your first project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {projectsList.map((project) => (
            <div
              key={project.id}
              className="group rounded-xl border border-neutral-700/50 bg-neutral-900/80 p-3 cursor-pointer hover:border-neutral-600 transition-all relative"
              onClick={() => onOpenProject(project)}
            >
              {/* Delete button */}
              <button
                onClick={(e) => handleDeleteProject(e, project)}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-all z-10"
                title="Move to trash"
              >
                <Trash2 size={14} />
              </button>
              
              <div className="aspect-video rounded-md overflow-hidden bg-neutral-800 border border-neutral-700/30 mb-3">
                {project.thumbnail ? (
                  <img src={project.thumbnail} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-neutral-800 to-neutral-900 flex items-center justify-center">
                    <FolderOpen className="w-8 h-8 text-neutral-600" />
                  </div>
                )}
              </div>
              <h3 className="text-white font-medium text-sm truncate">{project.name}</h3>
              <p className="text-neutral-500 text-xs">
                {new Date(project.updatedAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};
