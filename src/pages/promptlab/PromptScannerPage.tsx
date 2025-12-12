import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GlassButton } from "@/components/ui/glass-button";
import { Home, ArrowLeft, Copy, Check, CheckCircle2, X } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

type ActionType = "full" | "metadata" | "compress" | "models" | "template";

type MetadataKey = "targetAudience" | "tone" | "outputFormat" | "constraints" | "perspective" | "examples";

type MetadataStatus = "detected" | "missing";

interface MetadataField {
  key: MetadataKey;
  label: string;
  status: MetadataStatus;
  existingText?: string;
  suggestion?: string;
  included: boolean;
}

interface AnalysisResult {
  metadataPrompt: string;
  compressedPrompt: string;
  modelPrompts: {
    gpt: string;
    claude: string;
    gemini: string;
    llama: string;
  };
  templatePrompt: string;
}

const PromptScannerPage = () => {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");
  const [activeAction, setActiveAction] = useState<ActionType>("full");
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [metadataFields, setMetadataFields] = useState<MetadataField[]>([]);
  const [metadataPrompt, setMetadataPrompt] = useState<string>("");

  // Analyze metadata function
  const analyzeMetadata = (promptText: string): MetadataField[] => {
    const lower = promptText.toLowerCase();
    const fields: MetadataField[] = [];

    // Target audience detection
    const audiencePatterns = [
      /for\s+(?:users|developers|designers|marketers|students|beginners|experts|professionals|businesses|customers|buyers)/i,
      /target\s+audience/i,
      /audience/i,
      /customer/i,
      /buyer/i,
    ];
    const audienceDetected = audiencePatterns.some((pattern) => pattern.test(promptText));
    let audienceText: string | undefined;
    if (audienceDetected) {
      const match = promptText.match(/(?:for|target\s+audience|audience)[^.]{0,100}/i);
      audienceText = match ? match[0].substring(0, 120) : undefined;
    }
    fields.push({
      key: "targetAudience",
      label: "Target audience",
      status: audienceDetected ? "detected" : "missing",
      existingText: audienceText,
      suggestion: audienceDetected
        ? undefined
        : "Target audience: [Describe who this is for, e.g. SaaS founders building their first landing page].",
      included: audienceDetected, // Detected fields included by default
    });

    // Tone detection
    const toneWords = ["friendly", "casual", "conversational", "professional", "formal", "playful", "serious", "authoritative", "neutral"];
    const toneDetected = toneWords.some((word) => lower.includes(word));
    let toneText: string | undefined;
    if (toneDetected) {
      const toneMatch = toneWords.find((word) => lower.includes(word));
      if (toneMatch) {
        const match = promptText.match(new RegExp(`[^.]{0,50}${toneMatch}[^.]{0,50}`, "i"));
        toneText = match ? match[0].substring(0, 120) : undefined;
      }
    }
    fields.push({
      key: "tone",
      label: "Tone",
      status: toneDetected ? "detected" : "missing",
      existingText: toneText,
      suggestion: toneDetected ? undefined : "Tone: Professional, clear, but still approachable.",
      included: toneDetected,
    });

    // Output format detection
    const formatPatterns = [
      /json/i,
      /table/i,
      /markdown/i,
      /bullet\s+points/i,
      /step-by-step/i,
      /list/i,
      /code\s+block/i,
      /html/i,
      /plain\s+text/i,
    ];
    const formatDetected = formatPatterns.some((pattern) => pattern.test(promptText));
    let formatText: string | undefined;
    if (formatDetected) {
      const match = promptText.match(/(?:format|output|as|in)[^.]{0,100}(?:json|table|markdown|bullet|list|code|html)/i);
      formatText = match ? match[0].substring(0, 120) : undefined;
    }
    fields.push({
      key: "outputFormat",
      label: "Output format",
      status: formatDetected ? "detected" : "missing",
      existingText: formatText,
      suggestion: formatDetected
        ? undefined
        : "Output format: Respond as a structured markdown document with headings, bullet points and a short summary.",
      included: formatDetected,
    });

    // Constraints detection
    const constraintPatterns = [
      /no\s+more\s+than/i,
      /at\s+most/i,
      /limit\s+to/i,
      /\bavoid\b/i,
      /\bdo\s+not\b/i,
      /\bnever\b/i,
      /\bmust\s+include\b/i,
      /\bmust\s+not\s+include\b/i,
      /within\s+\d+\s+words/i,
      /under\s+\d+\s+characters/i,
    ];
    const constraintsDetected = constraintPatterns.some((pattern) => pattern.test(promptText));
    let constraintsText: string | undefined;
    if (constraintsDetected) {
      const match = promptText.match(/(?:no\s+more|at\s+most|limit|avoid|do\s+not|never|must|within|under)[^.]{0,100}/i);
      constraintsText = match ? match[0].substring(0, 120) : undefined;
    }
    fields.push({
      key: "constraints",
      label: "Constraints",
      status: constraintsDetected ? "detected" : "missing",
      existingText: constraintsText,
      suggestion: constraintsDetected ? undefined : "Constraints: Max 800 words. Avoid generic advice; give specific, actionable examples.",
      included: constraintsDetected,
    });

    // Perspective detection
    const perspectivePatterns = [
      /you\s+are\s+(?:a|an)\s+[^.]{0,50}/i,
      /act\s+as/i,
      /from\s+the\s+perspective\s+of/i,
      /write\s+as\s+if\s+you\s+were/i,
      /as\s+a\s+senior/i,
    ];
    const perspectiveDetected = perspectivePatterns.some((pattern) => pattern.test(promptText));
    let perspectiveText: string | undefined;
    if (perspectiveDetected) {
      const match = promptText.match(/(?:you\s+are|act\s+as|perspective|write\s+as|as\s+a)[^.]{0,100}/i);
      perspectiveText = match ? match[0].substring(0, 120) : undefined;
    }
    fields.push({
      key: "perspective",
      label: "Perspective",
      status: perspectiveDetected ? "detected" : "missing",
      existingText: perspectiveText,
      suggestion: perspectiveDetected ? undefined : "Perspective: You are an experienced [ROLE], sharing practical expertise.",
      included: perspectiveDetected,
    });

    // Examples detection
    const examplesPatterns = [/for\s+example/i, /\be\.g\./i, /example:/i, /examples:/i, /such\s+as/i];
    const examplesDetected = examplesPatterns.some((pattern) => pattern.test(promptText));
    let examplesText: string | undefined;
    if (examplesDetected) {
      const match = promptText.match(/(?:for\s+example|e\.g\.|example|examples|such\s+as)[^.]{0,100}/i);
      examplesText = match ? match[0].substring(0, 120) : undefined;
    }
    fields.push({
      key: "examples",
      label: "Examples",
      status: examplesDetected ? "detected" : "missing",
      existingText: examplesText,
      suggestion: examplesDetected ? undefined : "Examples: Include at least 2–3 concrete examples related to the user's context.",
      included: examplesDetected,
    });

    return fields;
  };

  // Build metadata prompt from selected fields
  const buildMetadataPrompt = (promptText: string, fields: MetadataField[]): string => {
    const included = fields.filter((f) => f.included);

    if (included.length === 0) {
      return promptText;
    }

    const lines: string[] = [];
    lines.push("---");
    lines.push("METADATA FOR THIS PROMPT");

    for (const field of included) {
      const label = field.label;
      let value: string;

      if (field.status === "detected" && field.existingText) {
        value = field.existingText.trim();
      } else if (field.suggestion) {
        // Extract the value part from suggestion (remove label if present)
        const suggestionMatch = field.suggestion.match(/:\s*(.+)/);
        value = suggestionMatch ? suggestionMatch[1].trim() : field.suggestion.trim();
      } else {
        value = "(to be defined)";
      }

      lines.push(`${label}: ${value}`);
    }

    const block = lines.join("\n");
    return `${promptText.trim()}\n\n${block}`;
  };

  const buildCompressedVersion = (promptText: string): string => {
    return `[Compressed version]
${promptText
  .replace(/\s+/g, " ")
  .replace(/\n\s*\n/g, "\n")
  .replace(/You are an/g, "You're")
  .replace(/Please provide/g, "Provide")
  .replace(/I would like/g, "Need")
  .replace(/in order to/g, "to")
  .trim()}`;
  };

  const buildModelVersions = (promptText: string) => {
    return {
      gpt: `For OpenAI GPT, respond using this instruction style:\n\n${promptText}`,
      claude: `For Claude, respond using this instruction style:\n\n${promptText}`,
      gemini: `For Gemini, respond using this instruction style:\n\n${promptText}`,
      llama: `For Llama, respond using this instruction style:\n\n${promptText}`,
    };
  };

  const buildTemplateVersion = (promptText: string): string => {
    return `{{ROLE}}: You are an expert assistant

{{GOAL}}: ${promptText.split("\n")[0] || "Complete the task"}

{{CONTEXT}}: ${promptText.split("\n").slice(1, 3).join(" ") || "User provided context"}

{{OUTPUT_FORMAT}}: ${promptText.includes("format") ? "Specify format" : "Standard format"}

{{CONSTRAINTS}}: ${promptText.includes("constraint") ? "See constraints" : "None specified"}

${promptText}`;
  };

  const toggleMetadataField = (key: MetadataKey) => {
    setMetadataFields((prev) => {
      const updated = prev.map((field) => (field.key === key ? { ...field, included: !field.included } : field));
      // Rebuild metadataPrompt after updating selection
      setMetadataPrompt(buildMetadataPrompt(prompt, updated));
      return updated;
    });
  };

  const handleActionClick = (action: ActionType) => {
    if (!prompt.trim()) {
      setAnalysis(null);
      setMetadataFields([]);
      setMetadataPrompt("");
      setActiveAction(action);
      return;
    }

    setActiveAction(action);

    // If metadata action, analyze metadata
    if (action === "metadata") {
      const analyzed = analyzeMetadata(prompt);
      setMetadataFields(analyzed);
      setMetadataPrompt(buildMetadataPrompt(prompt, analyzed));
    }

    // Generate analysis for all actions
    const analyzedFields = analyzeMetadata(prompt);
    const metadataPrompt = buildMetadataPrompt(prompt, analyzedFields);
    const compressedPrompt = buildCompressedVersion(prompt);
    const modelPrompts = buildModelVersions(prompt);
    const templatePrompt = buildTemplateVersion(prompt);

    setAnalysis({
      metadataPrompt,
      compressedPrompt,
      modelPrompts,
      templatePrompt,
    });
  };

  // Update metadata when prompt changes and metadata tab is active
  useEffect(() => {
    if (activeAction === "metadata" && prompt.trim()) {
      const analyzed = analyzeMetadata(prompt);
      setMetadataFields(analyzed);
      setMetadataPrompt(buildMetadataPrompt(prompt, analyzed));
    }
  }, [prompt, activeAction]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(null), 2000);
  };

  const actions: { id: ActionType; label: string }[] = [
    { id: "full", label: "Full Scan" },
    { id: "metadata", label: "Add Metadata" },
    { id: "compress", label: "Compress" },
    { id: "models", label: "Model Optimizer" },
    { id: "template", label: "Export Template" },
  ];

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

        {/* Prompt Input */}
        <div className="w-full max-w-4xl mx-auto mb-8">
          <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Paste your prompt here for analysis..."
              className="w-full h-48 bg-black/30 border border-white/10 rounded-xl p-4 text-white placeholder:text-white/40 resize-none focus:outline-none focus:border-cyan-500/40 transition-colors font-mono text-sm"
            />
          </div>
        </div>

        {/* Action Bar */}
        <div className="w-full max-w-4xl mx-auto mb-6">
          <div className="flex flex-wrap gap-2 justify-center">
            {actions.map((action) => (
              <button
                key={action.id}
                onClick={() => handleActionClick(action.id)}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-medium transition-all",
                  activeAction === action.id
                    ? "bg-white/10 text-white border border-white/20"
                    : "bg-white/5 text-white/50 hover:text-white/70 border border-transparent hover:bg-white/5"
                )}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>

        {/* Workspace Card */}
        <div className="w-full max-w-4xl mx-auto">
          <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6">
            {!prompt.trim() ? (
              <div className="text-center py-8">
                <p className="text-white/60 text-sm">Paste a prompt first to use Prompt Scanner.</p>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                {activeAction === "full" && (
                  <motion.div
                    key="full"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">Full Scan</h3>
                      <p className="text-white/70 text-sm mb-6">
                        Get a quick overview: metadata suggestions, compression, model-optimized versions and a reusable template scaffold.
                      </p>

                      <div className="space-y-4">
                        <div className="bg-black/30 border border-white/5 rounded-xl p-4">
                          <p className="text-xs text-white/50 mb-2">Prompt Overview</p>
                          <p className="text-sm text-white/70">
                            Your prompt contains {prompt.split(/\s+/).length} words and {prompt.length} characters.
                          </p>
                        </div>

                        <div className="bg-black/30 border border-white/5 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-medium text-white">Metadata preview</p>
                            <button
                              onClick={() => handleActionClick("metadata")}
                              className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                            >
                              Go to Metadata →
                            </button>
                          </div>
                          <pre className="text-xs text-white/60 font-mono line-clamp-2">
                            {analysis?.metadataPrompt.split("\n").slice(0, 2).join("\n") || buildMetadataPrompt(prompt, analyzeMetadata(prompt)).split("\n").slice(0, 2).join("\n")}
                          </pre>
                        </div>

                        <div className="bg-black/30 border border-white/5 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-medium text-white">Compressed preview</p>
                            <button
                              onClick={() => handleActionClick("compress")}
                              className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                            >
                              Go to Compression →
                            </button>
                          </div>
                          <pre className="text-xs text-white/60 font-mono line-clamp-2">
                            {analysis?.compressedPrompt.split("\n").slice(0, 2).join("\n") || buildCompressedVersion(prompt).split("\n").slice(0, 2).join("\n")}
                          </pre>
                        </div>

                        <div className="bg-black/30 border border-white/5 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-medium text-white">Models preview</p>
                            <button
                              onClick={() => handleActionClick("models")}
                              className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                            >
                              Go to Models →
                            </button>
                          </div>
                          <div className="text-xs text-white/60 space-y-1">
                            <p>• OpenAI GPT - Optimized version available</p>
                            <p>• Claude - Optimized version available</p>
                            <p>• Gemini - Optimized version available</p>
                            <p>• Llama - Optimized version available</p>
                          </div>
                        </div>

                        <div className="bg-black/30 border border-white/5 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-medium text-white">Template preview</p>
                            <button
                              onClick={() => handleActionClick("template")}
                              className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                            >
                              Go to Template →
                            </button>
                          </div>
                          <pre className="text-xs text-white/60 font-mono line-clamp-3">
                            {analysis?.templatePrompt.split("\n").slice(0, 3).join("\n") || buildTemplateVersion(prompt).split("\n").slice(0, 3).join("\n")}
                          </pre>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeAction === "metadata" && (
                  <motion.div
                    key="metadata"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">Add Missing Metadata</h3>
                      <p className="text-white/70 text-sm mb-6">
                        Scanner adds the missing pieces so your prompt becomes an engineer-level tool.
                      </p>

                      <div className="space-y-3 mb-6">
                        {metadataFields.length > 0
                          ? metadataFields.map((field) => (
                              <div
                                key={field.key}
                                className="flex items-start justify-between gap-3 p-3 rounded-lg bg-black/30 border border-white/5"
                              >
                                <div className="flex items-start gap-3 flex-1">
                                  {field.status === "detected" ? (
                                    <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                                  ) : (
                                    <X className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                                  )}
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-sm font-medium text-white">{field.label}</span>
                                      {field.status === "detected" ? (
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
                                          Detected
                                        </span>
                                      ) : (
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                                          Missing (suggested addition)
                                        </span>
                                      )}
                                    </div>
                                    {field.status === "detected" && field.existingText && (
                                      <p className="text-xs text-white/60 mt-1">
                                        From prompt: <span className="text-white/80">{field.existingText}</span>
                                      </p>
                                    )}
                                    {field.status === "missing" && field.suggestion && (
                                      <p className="text-xs text-white/60 mt-1">{field.suggestion}</p>
                                    )}
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => toggleMetadataField(field.key)}
                                  className={cn(
                                    "ml-4 rounded-full px-3 py-1.5 text-xs font-medium border transition-colors flex-shrink-0",
                                    field.included
                                      ? "border-emerald-400 text-emerald-300 bg-emerald-400/10 hover:bg-emerald-400/20"
                                      : "border-neutral-600 text-neutral-300 bg-transparent hover:bg-neutral-800 hover:border-neutral-500"
                                  )}
                                >
                                  {field.included ? "Included" : "Add to prompt"}
                                </button>
                              </div>
                            ))
                          : [
                              "Target audience",
                              "Tone",
                              "Output format",
                              "Constraints",
                              "Perspective",
                              "Examples",
                            ].map((field, index) => (
                              <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-black/30 border border-white/5">
                                <X className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-white">{field}</span>
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                                      Missing (suggested addition)
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                      </div>

                      <div className="relative">
                        <h3 className="text-sm font-semibold text-white mb-3">Prompt with Metadata Added</h3>
                        <pre className="bg-black/30 border border-white/10 rounded-xl p-4 text-xs text-white/80 font-mono whitespace-pre-wrap overflow-x-auto max-h-64 overflow-y-auto">
                          {metadataPrompt || analysis?.metadataPrompt || ""}
                        </pre>
                        <button
                          onClick={() => copyToClipboard(metadataPrompt || analysis?.metadataPrompt || "", "metadata")}
                          className="absolute top-12 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                        >
                          {copied === "metadata" ? (
                            <Check className="w-4 h-4 text-green-400" />
                          ) : (
                            <Copy className="w-4 h-4 text-white/60" />
                          )}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeAction === "compress" && (
                  <motion.div
                    key="compress"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">Prompt Compression</h3>
                      <p className="text-white/70 text-sm mb-4">
                        Make your prompt ultra-compact while keeping the same intent – ideal for API-heavy workflows.
                      </p>

                      <div className="text-xs text-white/50 mb-4 space-y-1">
                        <p>Original length: {prompt.length} characters</p>
                        <p>
                          Compressed length: {(analysis?.compressedPrompt || buildCompressedVersion(prompt)).length} characters
                        </p>
                      </div>

                      <div className="relative">
                        <pre className="bg-black/30 border border-white/10 rounded-xl p-4 text-xs text-white/80 font-mono whitespace-pre-wrap overflow-x-auto max-h-64 overflow-y-auto">
                          {analysis?.compressedPrompt || buildCompressedVersion(prompt)}
                        </pre>
                        <button
                          onClick={() => copyToClipboard(analysis?.compressedPrompt || buildCompressedVersion(prompt), "compressed")}
                          className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                        >
                          {copied === "compressed" ? (
                            <Check className="w-4 h-4 text-green-400" />
                          ) : (
                            <Copy className="w-4 h-4 text-white/60" />
                          )}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeAction === "models" && (
                  <motion.div
                    key="models"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">Model Optimizer</h3>
                      <p className="text-white/70 text-sm mb-6">
                        Different models prefer slightly different structures. Scanner gives you tuned versions for each.
                      </p>

                      <div className="space-y-4">
                        {[
                          { key: "gpt", name: "OpenAI GPT", explanation: "Optimized for GPT's instruction-following style." },
                          { key: "claude", name: "Claude", explanation: "Structured for Claude's preference for detailed context." },
                          { key: "gemini", name: "Gemini", explanation: "Formatted for Gemini's strength in multi-step tasks." },
                          { key: "llama", name: "Llama", explanation: "Simplified for Llama's direct instruction format." },
                        ].map((model) => {
                          const modelPrompts = analysis?.modelPrompts || buildModelVersions(prompt);
                          return (
                            <div key={model.key} className="bg-black/30 border border-white/10 rounded-xl p-4">
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <h4 className="text-sm font-semibold text-white mb-1">{model.name}</h4>
                                  <p className="text-xs text-white/60">{model.explanation}</p>
                                </div>
                                <button
                                  onClick={() => copyToClipboard(modelPrompts[model.key as keyof typeof modelPrompts], `model-${model.key}`)}
                                  className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0"
                                >
                                  {copied === `model-${model.key}` ? (
                                    <Check className="w-4 h-4 text-green-400" />
                                  ) : (
                                    <Copy className="w-4 h-4 text-white/60" />
                                  )}
                                </button>
                              </div>
                              <pre className="bg-black/50 border border-white/5 rounded-lg p-3 text-xs text-white/80 font-mono whitespace-pre-wrap overflow-x-auto max-h-48 overflow-y-auto">
                                {modelPrompts[model.key as keyof typeof modelPrompts]}
                              </pre>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeAction === "template" && (
                  <motion.div
                    key="template"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">Export as Template</h3>
                      <p className="text-white/70 text-sm mb-4">
                        Turn this into a reusable prompt template you can plug into Beymflow node flows.
                      </p>

                      <div className="relative mb-4">
                        <pre className="bg-black/30 border border-white/10 rounded-xl p-4 text-xs text-white/80 font-mono whitespace-pre-wrap overflow-x-auto max-h-64 overflow-y-auto">
                          {analysis?.templatePrompt || buildTemplateVersion(prompt)}
                        </pre>
                        <button
                          onClick={() => copyToClipboard(analysis?.templatePrompt || buildTemplateVersion(prompt), "template")}
                          className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                        >
                          {copied === "template" ? (
                            <Check className="w-4 h-4 text-green-400" />
                          ) : (
                            <Copy className="w-4 h-4 text-white/60" />
                          )}
                        </button>
                      </div>

                      <p className="text-xs text-white/50 italic">
                        Use this as a starting point for a prompt node inside your Beymflow flows.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromptScannerPage;
