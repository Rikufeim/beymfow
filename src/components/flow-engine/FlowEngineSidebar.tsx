import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Clock,
  FolderKanban,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ElementType;
  isActive?: boolean;
}

export type FlowEngineView = "recents" | "prompt-generator" | "all-projects" | "trash";

interface FlowEngineSidebarProps {
  activeView: FlowEngineView;
  onViewChange: (view: FlowEngineView) => void;
  isCollapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
  className?: string;
}

const mainItems: SidebarItem[] = [
  { id: "recents", label: "Recents", icon: Clock },
  { id: "prompt-generator", label: "Prompt generator", icon: Sparkles },
  { id: "all-projects", label: "All projects", icon: FolderKanban },
  { id: "trash", label: "Trash", icon: Trash2 },
];


export const FlowEngineSidebar: React.FC<FlowEngineSidebarProps> = ({
  activeView,
  onViewChange,
  isCollapsed,
  onCollapsedChange,
  className,
}) => {
  const navigate = useNavigate();

  const handleItemClick = (itemId: string) => {
    onViewChange(itemId as FlowEngineView);
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 56 : 224 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className={cn(
        "h-full bg-black border-r border-neutral-800/50 flex flex-col z-40 overflow-hidden",
        className
      )}
    >
      {/* Home Button / Collapsed Header */}
      <div className="p-3 border-b border-neutral-800/50">
        {isCollapsed ? (
          <button
            onClick={() => onCollapsedChange(false)}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-neutral-900 transition-colors"
          >
            <Home size={18} className="text-neutral-400" />
          </button>
        ) : (
          <button
            onClick={() => navigate("/")}
            className="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm text-neutral-400 hover:bg-neutral-900 hover:text-white transition-colors"
          >
            <Home size={18} className="flex-shrink-0" />
            <span>Home</span>
          </button>
        )}
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto py-2 px-2">
        <ul className="space-y-0.5">
          {mainItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => handleItemClick(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm transition-colors",
                    isActive
                      ? "bg-neutral-800 text-white"
                      : "text-neutral-400 hover:bg-neutral-900 hover:text-neutral-200"
                  )}
                >
                  <Icon size={18} className="flex-shrink-0" />
                  <AnimatePresence mode="wait">
                    {!isCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.15 }}
                        className="truncate"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Collapse Toggle */}
      <div className="p-3 border-t border-neutral-800/50">
        <button
          onClick={() => onCollapsedChange(!isCollapsed)}
          className={cn(
            "flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm text-neutral-400 hover:bg-neutral-900 hover:text-neutral-200 transition-colors",
            isCollapsed ? "w-8 justify-center" : "w-full"
          )}
        >
          {isCollapsed ? (
            <ChevronRight size={18} />
          ) : (
            <>
              <ChevronLeft size={18} />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </motion.aside>
  );
};

export default FlowEngineSidebar;
