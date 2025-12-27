import React, { useState } from "react";
import { X, Bot, Layout, Package, ArrowLeft, Clipboard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createSolution, SolutionType, RuntimeType } from "@/lib/solutionStore";
import { toast } from "sonner";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { cn } from "@/lib/utils";

interface AddSolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSolutionCreated?: () => void;
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

const runtimeTypes: { id: RuntimeType; label: string }[] = [
  { id: "prompt-tool", label: "Prompt Tool (Template)" },
  { id: "api-tool", label: "API Tool (REST Wrapper)" },
  { id: "nodejs-function", label: "Node.js Function (Runner Disabled)" },
];

type Step = "select" | "ai-tool" | "website-ui" | "import-package";

export const AddSolutionModal: React.FC<AddSolutionModalProps> = ({
  isOpen,
  onClose,
  onSolutionCreated,
}) => {
  const [step, setStep] = useState<Step>("select");
  
  // AI Tool form state
  const [aiToolName, setAiToolName] = useState("");
  const [aiToolRuntime, setAiToolRuntime] = useState<RuntimeType>("prompt-tool");
  
  // Website/UI form state
  const [websiteName, setWebsiteName] = useState("");
  const [websiteCode, setWebsiteCode] = useState("");
  
  // Import Package form state
  const [manifestJson, setManifestJson] = useState("");

  const resetForm = () => {
    setStep("select");
    setAiToolName("");
    setAiToolRuntime("prompt-tool");
    setWebsiteName("");
    setWebsiteCode("");
    setManifestJson("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSelectType = (type: SolutionType) => {
    setStep(type);
  };

  const handleBack = () => {
    setStep("select");
  };

  const handleCreateAiTool = () => {
    if (!aiToolName.trim()) {
      toast.error("Please enter a name");
      return;
    }
    
    createSolution({
      type: "ai-tool",
      name: aiToolName.trim(),
      runtimeType: aiToolRuntime,
    });
    
    toast.success("AI Tool created!");
    onSolutionCreated?.();
    handleClose();
  };

  const handleCreateWebsite = () => {
    if (!websiteName.trim()) {
      toast.error("Please enter a solution name");
      return;
    }
    if (!websiteCode.trim()) {
      toast.error("Please enter HTML/Code");
      return;
    }
    
    createSolution({
      type: "website-ui",
      name: websiteName.trim(),
      htmlCode: websiteCode.trim(),
    });
    
    toast.success("Website/UI solution created!");
    onSolutionCreated?.();
    handleClose();
  };

  const handleCreateFromManifest = () => {
    if (!manifestJson.trim()) {
      toast.error("Please paste manifest content");
      return;
    }
    
    try {
      const manifest = JSON.parse(manifestJson);
      createSolution({
        type: "import-package",
        name: manifest.name || "Imported Package",
        manifest,
      });
      
      toast.success("Package imported successfully!");
      onSolutionCreated?.();
      handleClose();
    } catch (e) {
      toast.error("Invalid JSON format");
    }
  };

  const handlePasteManifest = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setManifestJson(text);
      toast.success("Manifest pasted from clipboard");
    } catch {
      toast.error("Could not read clipboard");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-2xl rounded-2xl border border-neutral-800 bg-[#0a0a0a] p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-lg font-semibold text-white">Add New Solution</h2>
                <p className="text-sm text-neutral-500">Select solution type</p>
              </div>
              <button
                onClick={handleClose}
                className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <AnimatePresence mode="wait">
              {/* Step 1: Select Type */}
              {step === "select" && (
                <motion.div
                  key="select"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <div className="grid grid-cols-3 gap-4 mt-6">
                    {solutionTypes.map((solution) => (
                      <div key={solution.id} className="min-h-[10rem]">
                        <div 
                          className={cn("relative h-full rounded-2xl border border-white/10 p-[1px] cursor-pointer")} 
                          style={{ transform: 'translateZ(0)', willChange: 'transform' }}
                          onClick={() => handleSelectType(solution.id)}
                        >
                          <GlowingEffect 
                            spread={40} 
                            glow 
                            disabled={false} 
                            proximity={64} 
                            inactiveZone={0.01} 
                            borderWidth={2} 
                            className="opacity-70" 
                          />
                          <div 
                            className="group relative flex h-full flex-col items-center justify-center gap-4 rounded-[1.05rem] bg-gradient-to-br from-[#000000] via-[#050505] to-[#000000] p-5 overflow-hidden will-change-transform hover:bg-gradient-to-br hover:from-[#050505] hover:via-[#0a0a0a] hover:to-[#050505] transition-all"
                            style={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden' }}
                          >
                            <div className="w-14 h-14 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center group-hover:bg-teal-500/20 group-hover:border-teal-500/40 transition-colors">
                              <solution.icon className="w-7 h-7 text-teal-400" />
                            </div>
                            <div className="text-center">
                              <h3 className="text-white font-medium text-sm mb-1">{solution.title}</h3>
                              <p className="text-neutral-500 text-xs">{solution.description}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 pt-4 border-t border-neutral-800/50">
                    <p className="text-neutral-600 text-xs">Select solution type</p>
                  </div>
                </motion.div>
              )}

              {/* Step 2: AI Tool Form */}
              {step === "ai-tool" && (
                <motion.div
                  key="ai-tool"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="mt-6 space-y-5"
                >
                  <div>
                    <label className="block text-sm text-neutral-400 mb-2">Name</label>
                    <input
                      type="text"
                      value={aiToolName}
                      onChange={(e) => setAiToolName(e.target.value)}
                      placeholder="My AI Tool"
                      className="w-full px-4 py-3 rounded-lg bg-neutral-900 border border-neutral-800 text-white placeholder:text-neutral-600 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/20 transition-all"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-neutral-400 mb-2">Runtime Type</label>
                    <select
                      value={aiToolRuntime}
                      onChange={(e) => setAiToolRuntime(e.target.value as RuntimeType)}
                      className="w-full px-4 py-3 rounded-lg bg-neutral-900 border border-neutral-800 text-white focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/20 transition-all"
                    >
                      {runtimeTypes.map((rt) => (
                        <option key={rt.id} value={rt.id}>{rt.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-neutral-800/50">
                    <button
                      onClick={handleBack}
                      className="flex items-center gap-2 text-neutral-500 hover:text-white transition-colors text-sm"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back
                    </button>
                    <button
                      onClick={handleCreateAiTool}
                      className="px-5 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-sm font-medium transition-colors shadow-lg shadow-teal-900/20"
                    >
                      Create
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Website/UI Form */}
              {step === "website-ui" && (
                <motion.div
                  key="website-ui"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="mt-6 space-y-5"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
                      <Layout className="w-5 h-5 text-teal-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-medium">Add UI Solution</h3>
                      <p className="text-neutral-500 text-xs">Landing page or web interface.</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-neutral-400 mb-2">Solution Name *</label>
                    <input
                      type="text"
                      value={websiteName}
                      onChange={(e) => setWebsiteName(e.target.value)}
                      placeholder="My Sales Landing Page"
                      className="w-full px-4 py-3 rounded-lg bg-neutral-900 border border-neutral-800 text-white placeholder:text-neutral-600 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/20 transition-all"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-neutral-400 mb-2">HTML / Code *</label>
                    <textarea
                      value={websiteCode}
                      onChange={(e) => setWebsiteCode(e.target.value)}
                      placeholder="<!DOCTYPE html><html>..."
                      rows={6}
                      className="w-full px-4 py-3 rounded-lg bg-neutral-900 border border-neutral-800 text-white placeholder:text-neutral-600 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/20 font-mono text-sm resize-none transition-all"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-neutral-800/50">
                    <button
                      onClick={handleBack}
                      className="flex items-center gap-2 text-neutral-500 hover:text-white transition-colors text-sm"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back
                    </button>
                    <button
                      onClick={handleCreateWebsite}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-sm font-medium transition-colors shadow-lg shadow-teal-900/20"
                    >
                      <Layout className="w-4 h-4" />
                      Save and Preview
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Import Package Form */}
              {step === "import-package" && (
                <motion.div
                  key="import-package"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="mt-6 space-y-5"
                >
                  <button
                    onClick={handlePasteManifest}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-sm font-medium transition-colors shadow-lg shadow-teal-900/20"
                  >
                    <Clipboard className="w-4 h-4" />
                    Paste Manifest
                  </button>
                  
                  <div>
                    <label className="block text-sm text-neutral-400 mb-2">
                      Paste manifest content here. <span className="text-neutral-600">keepline.manifest.json</span>
                    </label>
                    <textarea
                      value={manifestJson}
                      onChange={(e) => setManifestJson(e.target.value)}
                      placeholder='{ "name": "My Tool", "runtime": { ... } }'
                      rows={6}
                      className="w-full px-4 py-3 rounded-lg bg-neutral-900 border border-neutral-800 text-white placeholder:text-neutral-600 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/20 font-mono text-sm resize-none transition-all"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-neutral-800/50">
                    <button
                      onClick={handleBack}
                      className="flex items-center gap-2 text-neutral-500 hover:text-white transition-colors text-sm"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back
                    </button>
                    <button
                      onClick={handleCreateFromManifest}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-sm font-medium transition-colors shadow-lg shadow-teal-900/20"
                    >
                      Create from Manifest
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
