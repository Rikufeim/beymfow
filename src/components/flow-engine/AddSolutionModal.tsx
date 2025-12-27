import React from "react";
import { X, Bot, Layout, Package } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export type SolutionType = "ai-tool" | "website-ui" | "import-package";

interface AddSolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (type: SolutionType) => void;
}

const solutionTypes = [
  {
    id: "ai-tool" as SolutionType,
    title: "AI Tool",
    description: "AI-powered tool or automation.",
    icon: Bot,
  },
  {
    id: "website-ui" as SolutionType,
    title: "Website / UI",
    description: "Landing page or web interface.",
    icon: Layout,
  },
  {
    id: "import-package" as SolutionType,
    title: "Import Package",
    description: "Import from package file.",
    icon: Package,
  },
];

export const AddSolutionModal: React.FC<AddSolutionModalProps> = ({
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-2xl rounded-xl border border-neutral-700 bg-neutral-900 p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-lg font-semibold text-white">Add New Solution</h2>
                <p className="text-sm text-neutral-400">Select solution type</p>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-lg hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Solution Types Grid */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              {solutionTypes.map((solution) => (
                <button
                  key={solution.id}
                  onClick={() => {
                    onSelect(solution.id);
                    onClose();
                  }}
                  className="flex flex-col items-center p-6 rounded-xl bg-neutral-800/50 border border-neutral-700/50 hover:border-blue-500/50 hover:bg-neutral-800 transition-all group"
                >
                  <div className="w-14 h-14 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-colors">
                    <solution.icon className="w-7 h-7 text-blue-400" />
                  </div>
                  <h3 className="text-white font-medium text-sm mb-1">{solution.title}</h3>
                  <p className="text-neutral-500 text-xs text-center">{solution.description}</p>
                </button>
              ))}
            </div>

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-neutral-800">
              <p className="text-neutral-500 text-xs">Select solution type</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
