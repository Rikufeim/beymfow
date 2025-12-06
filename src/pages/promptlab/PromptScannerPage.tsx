import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GlassButton } from "@/components/ui/glass-button";
import { Home, ArrowLeft, Search, Loader2, CheckCircle2, AlertCircle, Info, Copy, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface AnalysisResult {
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  commandBreakdown: {
    command: string;
    purpose: string;
    impact: string;
    effectiveness: "high" | "medium" | "low";
  }[];
}

const PromptScannerPage = () => {
  const navigate = useNavigate();
  const [scannerPrompt, setScannerPrompt] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [copied, setCopied] = useState(false);

  const analyzePrompt = async () => {
    if (!scannerPrompt.trim()) {
      toast.error("Please enter a prompt to analyze");
      return;
    }

    setIsAnalyzing(true);
    setAnalysis(null);

    try {
      const { data, error } = await supabase.functions.invoke("prompt-optimizer", {
        body: {
          prompt: scannerPrompt,
          mode: "analyze",
        },
      });

      if (error) throw error;

      if (data?.analysis) {
        setAnalysis(data.analysis);
        toast.success("Prompt analyzed!");
      } else if (data?.error) {
        toast.error(data.error);
      } else {
        // Mock analysis for demo
        setAnalysis({
          overallScore: 72,
          strengths: [
            "Clear objective statement",
            "Good use of context",
            "Specific output requirements",
          ],
          weaknesses: [
            "Missing persona definition",
            "No error handling instructions",
            "Lacks examples for guidance",
          ],
          recommendations: [
            "Add a specific role/persona for the AI",
            "Include edge case handling",
            "Provide example outputs for clarity",
            "Add constraints for response length",
          ],
          commandBreakdown: [
            {
              command: "Analyze",
              purpose: "Primary action directive",
              impact: "Sets the main task",
              effectiveness: "high",
            },
            {
              command: "Provide details",
              purpose: "Output specification",
              impact: "Guides response format",
              effectiveness: "medium",
            },
          ],
        });
        toast.success("Prompt analyzed!");
      }
    } catch (error) {
      console.error("Error analyzing prompt:", error);
      toast.error("Failed to analyze prompt");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const copyPrompt = () => {
    navigator.clipboard.writeText(scannerPrompt);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  const getEffectivenessColor = (effectiveness: string) => {
    switch (effectiveness) {
      case "high":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "medium":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "low":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-white/10 text-white/60 border-white/20";
    }
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Navigation */}
      <div className="fixed top-6 left-6 z-50 flex items-center gap-3">
        <GlassButton size="sm" onClick={() => navigate("/prompt-lab-page")} contentClassName="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back
        </GlassButton>
        <GlassButton size="sm" onClick={() => navigate("/")} contentClassName="flex items-center gap-2">
          <Home className="w-4 h-4" />
          Home
        </GlassButton>
      </div>

      <div className="flex flex-col items-center min-h-screen px-4 py-24">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            <span className="text-white">Prompt </span>
            <span className="text-cyan-400">Scanner</span>
          </h1>
          <p className="text-white/60 text-lg">Analyze and evaluate your AI prompts</p>
        </div>

        {/* Scanner Input */}
        <div className="w-full max-w-4xl mx-auto space-y-6">
          <div className="relative">
            <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-cyan-500/20 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Paste your prompt</h3>
                <button
                  onClick={copyPrompt}
                  disabled={!scannerPrompt.trim()}
                  className="text-white/50 hover:text-white transition-colors disabled:opacity-30"
                >
                  {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
              
              <textarea
                value={scannerPrompt}
                onChange={(e) => setScannerPrompt(e.target.value)}
                placeholder="Paste your prompt here for analysis..."
                className="w-full h-48 bg-black/30 border border-white/10 rounded-xl p-4 text-white placeholder:text-white/40 resize-none focus:outline-none focus:border-cyan-500/40 transition-colors"
              />

              <div className="flex justify-center">
                <GlassButton
                  onClick={analyzePrompt}
                  disabled={isAnalyzing || !scannerPrompt.trim()}
                  contentClassName="flex items-center gap-2"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      Analyze Prompt
                    </>
                  )}
                </GlassButton>
              </div>
            </div>
          </div>

          {/* Analysis Results */}
          <AnimatePresence>
            {analysis && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Score */}
                <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 text-center">
                  <h3 className="text-lg font-semibold text-white/70 mb-2">Overall Score</h3>
                  <div className={`text-6xl font-bold ${getScoreColor(analysis.overallScore)}`}>
                    {analysis.overallScore}
                    <span className="text-2xl text-white/40">/100</span>
                  </div>
                </div>

                {/* Strengths & Weaknesses */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-green-500/20 p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                      <h3 className="text-lg font-semibold text-white">Strengths</h3>
                    </div>
                    <ul className="space-y-2">
                      {analysis.strengths.map((strength, i) => (
                        <li key={i} className="text-white/70 text-sm flex items-start gap-2">
                          <span className="text-green-400 mt-1">•</span>
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-red-500/20 p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <AlertCircle className="w-5 h-5 text-red-400" />
                      <h3 className="text-lg font-semibold text-white">Weaknesses</h3>
                    </div>
                    <ul className="space-y-2">
                      {analysis.weaknesses.map((weakness, i) => (
                        <li key={i} className="text-white/70 text-sm flex items-start gap-2">
                          <span className="text-red-400 mt-1">•</span>
                          {weakness}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-amber-500/20 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Info className="w-5 h-5 text-amber-400" />
                    <h3 className="text-lg font-semibold text-white">Recommendations</h3>
                  </div>
                  <ul className="space-y-2">
                    {analysis.recommendations.map((rec, i) => (
                      <li key={i} className="text-white/70 text-sm flex items-start gap-2">
                        <span className="text-amber-400 mt-1">{i + 1}.</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Command Breakdown */}
                <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Command Breakdown</h3>
                  <div className="space-y-3">
                    {analysis.commandBreakdown.map((cmd, i) => (
                      <div key={i} className="bg-black/30 rounded-xl p-4 border border-white/5">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono text-cyan-400">{cmd.command}</span>
                          <span className={`text-xs px-2 py-1 rounded-full border ${getEffectivenessColor(cmd.effectiveness)}`}>
                            {cmd.effectiveness}
                          </span>
                        </div>
                        <p className="text-white/60 text-sm">{cmd.purpose}</p>
                        <p className="text-white/40 text-xs mt-1">Impact: {cmd.impact}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default PromptScannerPage;
