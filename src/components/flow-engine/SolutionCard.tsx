import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Bot, Layout, Package, ExternalLink, Trash2, Eye } from "lucide-react";
import { Solution, deleteSolution } from "@/lib/solutionStore";
import { toast } from "sonner";

interface SolutionCardProps {
  solution: Solution;
  onPreview: (solution: Solution) => void;
  onDeleted: () => void;
}

export const SolutionCard: React.FC<SolutionCardProps> = ({
  solution,
  onPreview,
  onDeleted,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const getIcon = () => {
    switch (solution.type) {
      case "ai-tool":
        return <Bot className="w-5 h-5 text-purple-400" />;
      case "website-ui":
        return <Layout className="w-5 h-5 text-blue-400" />;
      case "import-package":
        return <Package className="w-5 h-5 text-green-400" />;
      default:
        return <Layout className="w-5 h-5 text-neutral-400" />;
    }
  };

  const getTypeLabel = () => {
    switch (solution.type) {
      case "ai-tool":
        return "AI Tool";
      case "website-ui":
        return "Website / UI";
      case "import-package":
        return "Package";
      default:
        return "Unknown";
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this solution?")) {
      deleteSolution(solution.id);
      toast.success("Solution deleted");
      onDeleted();
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return "Edited just now";
    if (diffHours < 24) return `Edited ${diffHours} hours ago`;
    if (diffDays === 1) return "Edited yesterday";
    return `Edited ${diffDays} days ago`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        onClick={() => onPreview(solution)}
        className="cursor-pointer rounded-xl border border-neutral-800 bg-neutral-900/50 hover:border-neutral-700 transition-all overflow-hidden"
      >
        {/* Preview area */}
        <div className="relative h-40 bg-neutral-900 flex items-center justify-center">
          {solution.type === "website-ui" && solution.htmlCode ? (
            <div className="w-full h-full bg-white/5 flex items-center justify-center text-neutral-600">
              <Eye className="w-8 h-8" />
            </div>
          ) : (
            <div className="w-full h-full bg-neutral-900 flex items-center justify-center">
              <div className="w-12 h-12 rounded-xl bg-neutral-800 flex items-center justify-center">
                {getIcon()}
              </div>
            </div>
          )}
          
          {/* Hover overlay with actions */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 flex items-center justify-center gap-3"
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onPreview(solution);
                  }}
                  className="p-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors"
                >
                  <Eye className="w-5 h-5" />
                </button>
                <button
                  onClick={handleDelete}
                  className="p-2 rounded-lg bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Info section */}
        <div className="p-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-neutral-800 flex items-center justify-center flex-shrink-0">
            {getIcon()}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-white font-medium text-sm truncate">{solution.name}</h3>
            <p className="text-neutral-500 text-xs">{formatDate(solution.updatedAt)}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Solution Preview Modal with Live Preview
interface SolutionPreviewModalProps {
  solution: Solution | null;
  onClose: () => void;
}

export const SolutionPreviewModal: React.FC<SolutionPreviewModalProps> = ({
  solution,
  onClose,
}) => {
  if (!solution) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="w-full max-w-6xl h-[90vh] bg-neutral-900 border border-neutral-800 rounded-xl flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="h-14 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between px-4 flex-shrink-0">
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="p-2 hover:bg-neutral-800 rounded transition-colors"
              >
                <X size={20} className="text-neutral-400" />
              </button>
              <h2 className="text-white font-semibold">{solution.name}</h2>
              <span className="px-2 py-0.5 rounded text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30">
                {solution.type === "website-ui" ? "Website / UI" : solution.type === "ai-tool" ? "AI Tool" : "Package"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-neutral-800 rounded transition-colors text-neutral-400 hover:text-white">
                <ExternalLink size={18} />
              </button>
            </div>
          </div>
          
          {/* Preview Content */}
          <div className="flex-1 overflow-hidden bg-white">
            {solution.type === "website-ui" && solution.htmlCode ? (
              <iframe
                srcDoc={solution.htmlCode}
                className="w-full h-full border-0"
                title={`Preview: ${solution.name}`}
                sandbox="allow-scripts allow-same-origin"
              />
            ) : solution.type === "ai-tool" ? (
              <div className="flex flex-col items-center justify-center h-full bg-neutral-900 text-neutral-400 p-8 text-center">
                <Bot size={48} className="mb-4 text-purple-400" />
                <p className="text-lg mb-2">AI Tool: {solution.name}</p>
                <p className="text-sm text-neutral-500">
                  Runtime: {solution.runtimeType || "Not specified"}
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full bg-neutral-900 text-neutral-400 p-8 text-center">
                <Package size={48} className="mb-4 text-green-400" />
                <p className="text-lg mb-2">Imported Package</p>
                <pre className="text-xs text-left bg-neutral-800 p-4 rounded-lg max-w-lg overflow-auto">
                  {JSON.stringify(solution.manifest, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
