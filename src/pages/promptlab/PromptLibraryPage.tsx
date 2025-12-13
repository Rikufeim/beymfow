import { useState, useMemo, useCallback, memo } from "react";
import { useNavigate } from "react-router-dom";
import { GlassButton } from "@/components/ui/glass-button";
import { Home, ArrowLeft, Search, Lock, Copy, Check, Tag, Expand, ShoppingCart, X, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Twemoji } from "@/components/Twemoji";

type Domain = "creativity" | "personal" | "business" | "crypto";
type PromptTier = "free" | "premium";

interface LibraryPrompt {
  id: string;
  title: string;
  description: string;
  prompt: string;
  domain: Domain;
  tags: string[];
  tier: PromptTier;
  price?: string;
}

const DOMAINS: {
  key: Domain;
  label: string;
  emoji: string;
  desc: string;
  color: string;
  gradient: string;
  subcategories: string[];
}[] = [
  {
    key: "business",
    label: "Business",
    emoji: "💼",
    desc: "Strategy, market & scale",
    color: "text-cyan-400",
    gradient: "from-cyan-500/20 to-blue-600/5",
    subcategories: ["Sales", "Marketing", "SEO", "Strategy", "Management"],
  },
  {
    key: "creativity",
    label: "Creativity",
    emoji: "🎨",
    desc: "Art, design & vision",
    color: "text-purple-400",
    gradient: "from-purple-500/20 to-pink-600/5",
    subcategories: ["Writing", "Art", "Design", "Content", "Viral"],
  },
  {
    key: "personal",
    label: "Personal",
    emoji: "🧠",
    desc: "Growth, habits & life",
    color: "text-red-400",
    gradient: "from-red-500/20 to-orange-600/5",
    subcategories: ["Mind", "Wellness", "Habits", "Learning", "Biohacking"],
  },
  {
    key: "crypto",
    label: "Crypto",
    emoji: "🪙",
    desc: "Web3, tokens & analysis",
    color: "text-green-400",
    gradient: "from-green-500/20 to-emerald-600/5",
    subcategories: ["Trading", "DeFi", "NFT", "Analysis", "Security"],
  },
];

const PROMPTS: LibraryPrompt[] = [
  {
    id: "1",
    title: "Blue Ocean Strategy Generator",
    description: "Identify uncontested market spaces for your business.",
    prompt: "Act as a strategic consultant with 20 years of experience. Analyze the [INDUSTRY] market and identify potential blue ocean opportunities. Consider: 1) Current industry pain points, 2) Underserved customer segments, 3) Value innovation possibilities. Provide a detailed framework with actionable steps.",
    domain: "business",
    tags: ["Strategy"],
    tier: "free",
  },
  {
    id: "2",
    title: "SEO Keyword Cluster Builder",
    description: "Generate a topical authority map for content strategy.",
    prompt: "Act as an SEO specialist. Create a comprehensive keyword cluster for [TOPIC]. Include: main pillar content, supporting articles, long-tail variations, and internal linking strategy. Format as a structured content calendar.",
    domain: "business",
    tags: ["SEO"],
    tier: "free",
  },
  {
    id: "3",
    title: "Visual Style Mixer",
    description: "Combine artistic styles for unique AI art prompts.",
    prompt: "Create a visual art prompt that combines the style of [ARTIST 1] with the color palette of [ARTIST 2] and the composition techniques of [ARTIST 3]. Subject: [SUBJECT]. Include lighting, mood, and technical specifications for Midjourney/DALL-E.",
    domain: "creativity",
    tags: ["Art"],
    tier: "free",
  },
  {
    id: "4",
    title: "Morning Routine Optimizer",
    description: "Build a science-backed habit stack for peak performance.",
    prompt: "Create a personalized morning routine based on: Wake time: [TIME], Goals: [GOALS], Constraints: [TIME AVAILABLE]. Include habit stacking, circadian rhythm optimization, and energy management principles. Provide weekly progression plan.",
    domain: "personal",
    tags: ["Habits"],
    tier: "free",
  },
  {
    id: "5",
    title: "Viral Hook Framework",
    description: "Create attention-grabbing content hooks.",
    prompt: "Generate 10 viral hook variations for [TOPIC/PRODUCT]. Use psychological triggers: curiosity gap, social proof, controversy, specificity, urgency. Format for: Twitter threads, YouTube thumbnails, and email subject lines.",
    domain: "creativity",
    tags: ["Viral", "Content"],
    tier: "free",
  },
  {
    id: "p1",
    title: "Enterprise Scale Operating System",
    description: "Complete framework for scaling operations from startup to enterprise.",
    prompt: "## Enterprise Scale Framework\n\nA comprehensive operating system covering: Organizational design, Process automation, Team scaling, Culture preservation, Financial modeling, and Risk management. Includes templates and KPI dashboards.",
    domain: "business",
    tags: ["Management", "Strategy"],
    tier: "premium",
    price: "$49",
  },
  {
    id: "p2",
    title: "Crypto Alpha Hunter Bot Logic",
    description: "Advanced Python framework for identifying crypto opportunities.",
    prompt: "## Alpha Hunter Logic\n\nComplete trading bot framework with: On-chain analysis, Social sentiment parsing, Whale wallet tracking, Arbitrage detection, Risk management protocols. Includes backtesting methodology.",
    domain: "crypto",
    tags: ["Trading", "Analysis"],
    tier: "premium",
    price: "$129",
  },
  {
    id: "p3",
    title: "Viral Content Architect",
    description: "Psychological framework for creating viral content at scale.",
    prompt: "## Viral Content Framework\n\nMaster system for viral content creation: Hook psychology, Emotional arc engineering, Platform-specific optimization, A/B testing protocols, Engagement multiplication strategies.",
    domain: "creativity",
    tags: ["Viral", "Content"],
    tier: "premium",
    price: "$29",
  },
  {
    id: "p4",
    title: "Cognitive Performance Protocol",
    description: "Bio-hacking masterclass for peak mental performance.",
    prompt: "## Cognitive Protocol\n\nAdvanced optimization covering: Nootropic stacks, Sleep architecture, Focus protocols, Recovery optimization, Long-term brain health. Personalized to your biomarkers.",
    domain: "personal",
    tags: ["Biohacking", "Wellness"],
    tier: "premium",
    price: "$39",
  },
];

// Memoized card component for better performance
const PromptCardItem = memo(({ 
  prompt, 
  domainConfig, 
  isPremiumUnlocked,
  onClick 
}: { 
  prompt: LibraryPrompt; 
  domainConfig: typeof DOMAINS[0] | undefined;
  isPremiumUnlocked: boolean;
  onClick: () => void;
}) => {
  const isPremium = prompt.tier === "premium";
  
  return (
    <div
      onClick={onClick}
      className="group relative min-h-[11rem] cursor-pointer"
    >
      <div className="relative h-full rounded-2xl border border-white/10 bg-black p-6 overflow-hidden transition-all duration-200 hover:border-white/20 hover:bg-white/[0.02]">
        <div className="relative z-10 flex flex-col justify-between h-full">
          <div className="flex items-start justify-between mb-4">
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 border border-white/5 text-xs font-bold uppercase tracking-wider ${domainConfig?.color}`}>
              <Twemoji emoji={domainConfig?.emoji || "📝"} />
              <span>{domainConfig?.label}</span>
            </div>
            {isPremium ? (
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border ${isPremiumUnlocked ? "text-green-400 bg-green-900/20 border-green-500/20" : "text-amber-400 bg-amber-900/20 border-amber-500/20"}`}>
                {isPremiumUnlocked ? <CheckCircle2 size={12} /> : <Lock size={12} />}
                <span>{isPremiumUnlocked ? "Unlocked" : "Premium"}</span>
              </div>
            ) : (
              <div className="p-2 rounded-lg bg-transparent text-neutral-500 group-hover:text-white transition-colors">
                <Expand size={16} />
              </div>
            )}
          </div>
          <h3 className="text-xl font-bold mb-2 text-white">{prompt.title}</h3>
          <p className="text-neutral-400 text-sm mb-6 leading-relaxed line-clamp-2">{prompt.description}</p>
          <div className="bg-white/5 rounded-xl p-4 mb-4 border border-white/5 relative overflow-hidden h-24">
            {isPremium && !isPremiumUnlocked ? (
              <>
                <p className="text-sm text-neutral-300 font-mono line-clamp-3 opacity-30 blur-sm select-none">{prompt.prompt}</p>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Lock className="text-amber-500/50" size={24} />
                </div>
              </>
            ) : (
              <p className="text-sm text-neutral-300 font-mono line-clamp-3 opacity-70">{prompt.prompt}</p>
            )}
          </div>
        </div>
        <div className="relative z-10 flex items-center justify-between mt-auto pt-4 border-t border-white/5">
          <div className="flex items-center gap-2 flex-wrap">
            <Tag size={14} className="text-neutral-600" />
            {prompt.tags.map((tag) => (
              <span key={tag} className="text-xs text-neutral-500">#{tag}</span>
            ))}
          </div>
          {isPremium && !isPremiumUnlocked && (
            <button className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg text-xs font-bold hover:bg-neutral-200 transition-colors">
              <span>Unlock {prompt.price}</span>
              <ShoppingCart size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

PromptCardItem.displayName = "PromptCardItem";

const PromptLibraryPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDomain, setFilterDomain] = useState<Domain | "all">("all");
  const [selectedTier, setSelectedTier] = useState<PromptTier>("free");
  const [activePrompt, setActivePrompt] = useState<LibraryPrompt | null>(null);
  const [copied, setCopied] = useState(false);
  const [isPremiumUnlocked] = useState(false);

  const filteredPrompts = useMemo(() => {
    const searchLower = searchQuery.toLowerCase();
    return PROMPTS.filter((p) => {
      const matchesSearch =
        !searchLower ||
        p.title.toLowerCase().includes(searchLower) ||
        p.tags.some((t) => t.toLowerCase().includes(searchLower));
      const matchesDomain = filterDomain === "all" || p.domain === filterDomain;
      const matchesTier = p.tier === selectedTier;
      return matchesSearch && matchesDomain && matchesTier;
    });
  }, [searchQuery, filterDomain, selectedTier]);

  const getDomainConfig = useCallback((domain: Domain) => DOMAINS.find((d) => d.key === domain), []);

  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  }, []);

  const handleCardClick = useCallback((prompt: LibraryPrompt) => {
    setActivePrompt(prompt);
  }, []);

  const handleCloseModal = useCallback(() => {
    setActivePrompt(null);
  }, []);

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
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            <span className="text-white">Prompt </span>
            <span className="text-amber-400">Library</span>
          </h1>
          <p className="text-white/60 text-lg">Curated collection of powerful AI prompts</p>
        </div>

        {/* Filters */}
        <div className="w-full max-w-6xl mx-auto space-y-6 mb-8">
          {/* Search */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search prompts..."
              className="w-full bg-white/5 border border-white/10 rounded-full pl-12 pr-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-white/30 transition-colors"
            />
          </div>

          {/* Tier Toggle */}
          <div className="flex justify-center gap-2">
            <GlassButton
              size="sm"
              onClick={() => setSelectedTier("free")}
              className={selectedTier === "free" ? "ring-2 ring-white/40" : ""}
            >
              Free
            </GlassButton>
            <GlassButton
              size="sm"
              onClick={() => setSelectedTier("premium")}
              className={selectedTier === "premium" ? "ring-2 ring-amber-500/60" : ""}
              contentClassName="flex items-center gap-1.5"
            >
              <Lock className="w-3 h-3" />
              Premium
            </GlassButton>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2">
            <button
              onClick={() => setFilterDomain("all")}
              className={`px-4 py-2 rounded-full text-sm transition-all ${filterDomain === "all" ? "bg-white/10 text-white border border-white/20" : "text-white/50 hover:text-white/70"}`}
            >
              All
            </button>
            {DOMAINS.map((domain) => (
              <button
                key={domain.key}
                onClick={() => setFilterDomain(domain.key)}
                className={`px-4 py-2 rounded-full text-sm transition-all flex items-center gap-2 ${filterDomain === domain.key ? `bg-white/10 ${domain.color} border border-white/20` : "text-white/50 hover:text-white/70"}`}
              >
                <Twemoji emoji={domain.emoji} />
                {domain.label}
              </button>
            ))}
          </div>
        </div>

        {/* Prompts Grid */}
        <div className="w-full max-w-6xl mx-auto">
          {filteredPrompts.length === 0 ? (
            <div className="text-center py-12 text-white/40">
              No prompts found matching your criteria
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPrompts.map((prompt) => (
                <PromptCardItem
                  key={prompt.id}
                  prompt={prompt}
                  domainConfig={getDomainConfig(prompt.domain)}
                  isPremiumUnlocked={isPremiumUnlocked}
                  onClick={() => handleCardClick(prompt)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Modal */}
        <AnimatePresence>
          {activePrompt && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
              onClick={handleCloseModal}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.15 }}
                onClick={(e) => e.stopPropagation()}
                className="relative rounded-2xl border border-white/10 bg-black p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto scrollbar-hide"
              >
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 border border-white/5 text-xs font-bold uppercase tracking-wider mb-3 ${getDomainConfig(activePrompt.domain)?.color}`}>
                      <Twemoji emoji={getDomainConfig(activePrompt.domain)?.emoji || "📝"} />
                      <span>{getDomainConfig(activePrompt.domain)?.label}</span>
                    </div>
                    <h2 className="text-2xl font-bold text-white">{activePrompt.title}</h2>
                  </div>
                  <button
                    onClick={handleCloseModal}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <X className="w-5 h-5 text-white/60" />
                  </button>
                </div>

                <p className="text-white/60 mb-6">{activePrompt.description}</p>

                <div className="bg-white/5 rounded-xl p-6 mb-6">
                  {activePrompt.tier === "premium" && !isPremiumUnlocked ? (
                    <div className="text-center py-8">
                      <Lock className="w-12 h-12 text-amber-500/50 mx-auto mb-4" />
                      <p className="text-white/60 mb-4">This premium prompt is locked</p>
                      <button className="flex items-center gap-2 bg-amber-500 text-black px-6 py-3 rounded-lg font-bold hover:bg-amber-400 transition-colors mx-auto">
                        Unlock for {activePrompt.price}
                        <ShoppingCart size={16} />
                      </button>
                    </div>
                  ) : (
                    <pre className="text-sm text-white/80 font-mono whitespace-pre-wrap">{activePrompt.prompt}</pre>
                  )}
                </div>

                {(activePrompt.tier === "free" || isPremiumUnlocked) && (
                  <div className="flex justify-end">
                    <GlassButton
                      onClick={() => copyToClipboard(activePrompt.prompt)}
                      contentClassName="flex items-center gap-2"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copy Prompt
                        </>
                      )}
                    </GlassButton>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PromptLibraryPage;
