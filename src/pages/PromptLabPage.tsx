import React, { useState, useRef, useEffect, useMemo, useCallback, memo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { cn } from "@/lib/utils";
import { GlassButton } from "@/components/ui/glass-button";
import {
  Copy,
  Sparkles,
  Home,
  Search,
  Wand2,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Info,
  Tag,
  Lock,
  ShoppingCart,
  Expand,
  Plus,
  Save,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import ComponentShowcasePage from "@/components/ComponentShowcasePage";

interface VideoComponentData {
  title: string;
  description: string;
  videoSrc: string;
  creator: { name: string; username: string };
  installCommand: string;
  importCode: string;
  usageCode: string;
  accentColor: string;
}

const landingPageHeroData: VideoComponentData[] = [
  {
    title: "Modern Landing Page",
    description: "A sleek modern landing page design with smooth animations.",
    videoSrc: "/videos/landing-page-1.mp4",
    creator: { name: "Beymflow", username: "beymflow" },
    installCommand: "https://beymflow.com/templates/modern-landing",
    importCode: "@/pages/ModernLanding",
    usageCode: "<ModernLanding />",
    accentColor: "emerald"
  },
  {
    title: "Pixel Trail",
    description: "A beautiful smooth cursor pixel trail effect.",
    videoSrc: "/videos/pixel-trail-demo.mp4",
    creator: { name: "Jatin Yadav", username: "jatin-yadav05" },
    installCommand: "https://21st.dev/r/jatin-yadav05/pixel-trail",
    importCode: "@/components/ui/pixel-trail",
    usageCode: "<PixelCursorTrail />",
    accentColor: "purple"
  },
  {
    title: "Glow Button",
    description: "An animated glowing button with hover effects.",
    videoSrc: "/videos/component-demo-2.mp4",
    creator: { name: "Demo User", username: "demo-user" },
    installCommand: "https://21st.dev/r/demo-user/glow-button",
    importCode: "@/components/ui/glow-button",
    usageCode: "<GlowButton />",
    accentColor: "cyan"
  }
];

const componentsVideoData: VideoComponentData[] = [
  {
    title: "New Component",
    description: "A fresh new component demo.",
    videoSrc: "/videos/components-new-1.mp4",
    creator: { name: "Beymflow", username: "beymflow" },
    installCommand: "https://beymflow.com/components/new",
    importCode: "@/components/ui/new-component",
    usageCode: "<NewComponent />",
    accentColor: "cyan"
  },
  {
    title: "Interactive UI",
    description: "A beautiful interactive UI component demo.",
    videoSrc: "/videos/components-1.mp4",
    creator: { name: "Beymflow", username: "beymflow" },
    installCommand: "https://beymflow.com/components/interactive",
    importCode: "@/components/ui/interactive-ui",
    usageCode: "<InteractiveUI />",
    accentColor: "purple"
  },
];

const fullLandingPagesData: VideoComponentData[] = [
  {
    title: "Landing Page Template",
    description: "A ready-to-use landing page with modern design.",
    videoSrc: "/videos/landing-pages-demo.mp4",
    creator: { name: "Beymflow", username: "beymflow" },
    installCommand: "https://beymflow.com/templates/landing-page",
    importCode: "@/pages/LandingPage",
    usageCode: "<LandingPage />",
    accentColor: "emerald"
  },
  {
    title: "Creative Landing Page",
    description: "A creative landing page design with unique animations.",
    videoSrc: "/videos/landing-pages-demo-2.mp4",
    creator: { name: "Beymflow", username: "beymflow" },
    installCommand: "https://beymflow.com/templates/creative-landing",
    importCode: "@/pages/CreativeLanding",
    usageCode: "<CreativeLanding />",
    accentColor: "purple"
  },
  {
    title: "Minimal Landing Page",
    description: "A clean minimal landing page with elegant transitions.",
    videoSrc: "/videos/landing-pages-demo-3.mp4",
    creator: { name: "Beymflow", username: "beymflow" },
    installCommand: "https://beymflow.com/templates/minimal-landing",
    importCode: "@/pages/MinimalLanding",
    usageCode: "<MinimalLanding />",
    accentColor: "cyan"
  }
];

const PROMPT_BUNDLES = [
  {
    title: "Landing Pages",
    tag: "Landing",
    bullets: [
      "Generate a base landing page layout",
      "Includes hero, features, CTA scaffolding",
      "Extend with your product details",
    ],
  },
  {
    title: "Mobile App",
    tag: "App",
    bullets: [
      "Starter prompt for core mobile app screens",
      "Flows for auth, dashboard, and settings",
      "Structure you can refine per feature",
    ],
  },
  {
    title: "Mobile Games",
    tag: "Games",
    bullets: [
      "Kickoff prompt for casual mobile games",
      "Loops, levels, and core gameplay beats",
      "Extend with art style and monetization",
    ],
  },
  {
    title: "Prompts for business",
    tag: "UI",
    bullets: [
      "Generate reusable UI component structures",
      "Props, variants, and accessibility hints",
      "Plug into landing, app, or game flows",
    ],
  },
];

const copyToClipboard = (text: string) => {
  if (!text) return;
  if (navigator?.clipboard?.writeText) {
    navigator.clipboard.writeText(text).catch(() => {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    });
  } else {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
  }
};

// --- TYPES ---
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

// --- CONFIGURATION ---
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

const INITIAL_PROMPTS: LibraryPrompt[] = [
  {
    id: "1",
    title: "Blue Ocean Strategy Generator",
    description: "Identify uncontested market spaces.",
    prompt: "Act as a strategic consultant. Analyze the [INDUSTRY] market...",
    domain: "business",
    tags: ["Strategy"],
    tier: "free",
  },
  {
    id: "2",
    title: "SEO Keyword Cluster Builder",
    description: "Generate a topical authority map.",
    prompt: "Act as an SEO specialist. Create a keyword cluster...",
    domain: "business",
    tags: ["SEO"],
    tier: "free",
  },
  {
    id: "3",
    title: "Visual Style Mixer",
    description: "Combine artistic styles for Midjourney.",
    prompt: "Create a visual art prompt that combines...",
    domain: "creativity",
    tags: ["Art"],
    tier: "free",
  },
  {
    id: "4",
    title: "Morning Routine Optimizer",
    description: "Build a habit stack.",
    prompt: "Create a morning routine based on...",
    domain: "personal",
    tags: ["Habits"],
    tier: "free",
  },
  {
    id: "p1",
    title: "Enterprise Scale OS",
    description: "Complete operating system for scaling.",
    prompt: "## Enterprise Scale Framework\n...",
    domain: "business",
    tags: ["Management"],
    tier: "premium",
    price: "$49",
  },
  {
    id: "p2",
    title: "Crypto Alpha Hunter Bot",
    description: "Advanced Python logic.",
    prompt: "## Alpha Hunter Logic\n...",
    domain: "crypto",
    tags: ["Trading"],
    tier: "premium",
    price: "$129",
  },
  {
    id: "p3",
    title: "Viral Hook Architect",
    description: "Psychological framework for content.",
    prompt: "## Viral Script Structure\n...",
    domain: "creativity",
    tags: ["Viral"],
    tier: "premium",
    price: "$29",
  },
  {
    id: "p4",
    title: "Bio-Hacking Masterclass",
    description: "Protocol for cognitive endurance.",
    prompt: "## Cognitive Endurance Protocol\n...",
    domain: "personal",
    tags: ["Biohacking"],
    tier: "premium",
    price: "$39",
  },
];

// Memoized Prompt Card Component
const PromptCard = memo(
  ({
    prompt,
    domainConfig,
    isPremiumUnlocked,
    onClick,
  }: {
    prompt: LibraryPrompt;
    domainConfig: (typeof DOMAINS)[0] | undefined;
    isPremiumUnlocked: boolean;
    onClick: () => void;
  }) => {
    const isPremium = prompt.tier === "premium";

    return (
      <motion.div
        layoutId={`card-${prompt.id}`}
        onClick={onClick}
        className={`group relative bg-white/5 backdrop-blur-md border rounded-2xl p-6 flex flex-col justify-between transition-all hover:shadow-2xl overflow-hidden cursor-pointer ${isPremium ? "border-amber-500/20 hover:border-amber-500/40 hover:shadow-amber-900/10" : "border-white/10 hover:border-white/20 hover:shadow-purple-900/10"}`}
      >
        {isPremium && (
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent pointer-events-none" />
        )}
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 border border-white/5 text-xs font-bold uppercase tracking-wider ${domainConfig?.color}`}
            >
              {domainConfig?.emoji} {domainConfig?.label}
            </div>
            {isPremium ? (
              <div
                className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border ${isPremiumUnlocked ? "text-green-400 bg-green-900/20 border-green-500/20" : "text-amber-400 bg-amber-900/20 border-amber-500/20"}`}
              >
                {isPremiumUnlocked ? <CheckCircle2 size={12} /> : <Lock size={12} />}
                <span>{isPremiumUnlocked ? "Unlocked" : "Premium"}</span>
              </div>
            ) : (
              <div className="p-2 rounded-lg bg-transparent text-neutral-500 group-hover:text-white transition-colors">
                <Expand size={16} />
              </div>
            )}
          </div>
          <motion.h3 layoutId={`title-${prompt.id}`} className="text-xl font-bold mb-2 text-white">
            {prompt.title}
          </motion.h3>
          <motion.p
            layoutId={`desc-${prompt.id}`}
            className="text-neutral-400 text-sm mb-6 leading-relaxed line-clamp-2"
          >
            {prompt.description}
          </motion.p>
          <div className="bg-white/5 backdrop-blur-md rounded-xl p-4 mb-4 border border-white/5 relative overflow-hidden group-hover:border-white/10 transition-colors h-24">
            {isPremium && !isPremiumUnlocked ? (
              <>
                <p className="text-sm text-neutral-300 font-mono line-clamp-3 opacity-30 blur-sm select-none">
                  {prompt.prompt}
                </p>
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
              <span key={tag} className="text-xs text-neutral-500">
                #{tag}
              </span>
            ))}
          </div>
          {isPremium && !isPremiumUnlocked && (
            <button className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg text-xs font-bold hover:bg-neutral-200 transition-colors">
              <span>Unlock {prompt.price}</span>
              <ShoppingCart size={14} />
            </button>
          )}
          {(isPremiumUnlocked || !isPremium) && (
            <span className="text-xs font-bold text-white/50 flex items-center gap-1">
              Open <ArrowRight size={12} />
            </span>
          )}
        </div>
      </motion.div>
    );
  },
);
PromptCard.displayName = "PromptCard";

function PromptWorkspaceInner() {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine current view based on URL
  const currentView = location.pathname.includes("/generator")
    ? "generator"
    : location.pathname.includes("/scanner")
      ? "scanner"
      : location.pathname.includes("/library")
        ? "library"
        : "landing";

  // Landing Input State
  const [landingInput, setLandingInput] = useState("");
  const [generatedPrompts, setGeneratedPrompts] = useState<{ title: string; prompt: string }[]>([]);

  // Generator State
  const [generatorInput, setGeneratorInput] = useState("");
  const [generatorPrompts, setGeneratorPrompts] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Scanner State
  const [scannerPrompt, setScannerPrompt] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  // Library State
  const [prompts, setPrompts] = useState<LibraryPrompt[]>(INITIAL_PROMPTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [filterDomain, setFilterDomain] = useState<Domain | "all">("all");
  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(null);
  const [selectedTier, setSelectedTier] = useState<PromptTier>("free");
  const [isPremiumUnlocked, setIsPremiumUnlocked] = useState(false);
  const [activePrompt, setActivePrompt] = useState<LibraryPrompt | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newPromptData, setNewPromptData] = useState({
    title: "",
    description: "",
    prompt: "",
    domain: "business" as Domain,
  });

  // Bundle scroller state
  const bundlesRef = useRef<HTMLDivElement>(null);
  const bundlesCarouselRef = useRef<HTMLDivElement>(null);
  const [bundleScroll, setBundleScroll] = useState({ scroll: 0, max: 1 });
  const componentsCarouselRef = useRef<HTMLDivElement>(null);
  const landingPageHeroCarouselRef = useRef<HTMLDivElement>(null);
  const fullLandingPagesCarouselRef = useRef<HTMLDivElement>(null);
  
  // Video showcase state
  const [showComponentPage, setShowComponentPage] = useState<number | null>(null);
  const [activeVideoSection, setActiveVideoSection] = useState<string | null>(null);

  // --- EFFECTS ---
  // Debounce search query for library
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Generator: Auto-generate prompts when user types
  useEffect(() => {
    if (currentView !== "generator") return;
    const timer = setTimeout(() => {
      generatePromptsForGenerator(generatorInput);
    }, 1000);
    return () => clearTimeout(timer);
  }, [generatorInput, currentView]);

  // Bundle scroller sync
  useEffect(() => {
    const el = bundlesRef.current;
    if (!el) return;
    const update = () => {
      const max = Math.max(el.scrollWidth - el.clientWidth, 1);
      setBundleScroll({ scroll: el.scrollLeft, max });
    };
    update();
    el.addEventListener("scroll", update);
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  // Memoize domain lookup map
  const domainMap = useMemo(() => {
    const map = new Map<Domain, (typeof DOMAINS)[0]>();
    DOMAINS.forEach((d) => map.set(d.key, d));
    return map;
  }, []);

  const filteredPrompts = useMemo(() => {
    const searchLower = debouncedSearchQuery.toLowerCase();
    return prompts.filter((p) => {
      const matchesSearch =
        !searchLower ||
        p.title.toLowerCase().includes(searchLower) ||
        p.tags.some((t) => t.toLowerCase().includes(searchLower));
      const matchesDomain = filterDomain === "all" || p.domain === filterDomain;
      const matchesSubcategory = activeSubcategory ? p.tags.includes(activeSubcategory) : true;
      const matchesTier = p.tier === selectedTier;
      return matchesSearch && matchesDomain && matchesSubcategory && matchesTier;
    });
  }, [debouncedSearchQuery, filterDomain, activeSubcategory, selectedTier, prompts]);

  // --- HELPERS & HANDLERS ---
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLandingInput(e.target.value);
    setCursorPos(e.target.selectionStart || e.target.value.length);
  }, []);

  const handleInputSelect = useCallback((e: React.SyntheticEvent<HTMLInputElement, Event>) => {
    setCursorPos((e.target as HTMLInputElement).selectionStart || 0);
  }, []);

  // Generate 3 high-quality prompt alternatives based on user input
  const generatePromptAlternatives = useCallback((input: string): { title: string; prompt: string }[] => {
    const base = input.trim();
    if (!base) return [];

    return [
      {
        title: `Strategic Mastery: ${base}`,
        prompt: `**ROLE & PERSONA:**
You are a **World-Class Strategic Consultant** with 25+ years of experience across Fortune 500 companies and high-growth startups. You have a proven track record of delivering transformative strategies that drive measurable results. Your expertise combines deep analytical thinking with practical execution frameworks.

**CONTEXT & OBJECTIVE:**
The user's goal is: "${base}".

Your mission is to provide a comprehensive, battle-tested strategic framework that addresses this objective with precision, depth, and actionable clarity. Every recommendation must be specific, measurable, and immediately implementable.

**CORE PRINCIPLES:**
- Data-driven decision making with clear metrics
- Risk-aware but opportunity-focused approach
- Scalable solutions that grow with the user
- Industry best practices adapted to specific context
- Long-term sustainability over short-term gains

**REQUIRED OUTPUT STRUCTURE:**

1. **Executive Summary (2-3 sentences)**
   - Compelling hook that captures the essence of the strategy
   - Key value proposition and expected outcomes
   - Why this approach works for "${base}"

2. **Strategic Foundation**
   - Market/context analysis specific to "${base}"
   - Core assumptions and prerequisites
   - Critical success factors
   - Competitive landscape considerations

3. **Detailed Execution Roadmap**
   **Phase 1: Foundation (Weeks 1-4)**
   - Specific setup tasks with clear deliverables
   - Required resources and tools
   - Initial milestones and checkpoints
   
   **Phase 2: Implementation (Weeks 5-12)**
   - Step-by-step action items with priorities
   - Integration points and dependencies
   - Quality control measures
   
   **Phase 3: Optimization (Ongoing)**
   - Continuous improvement processes
   - Performance tuning strategies
   - Scaling considerations

4. **Success Metrics & KPIs**
   - Leading indicators (early warning signals)
   - Lagging indicators (outcome measurements)
   - Benchmark targets and timelines
   - How to track and measure progress

5. **Risk Management**
   - Potential obstacles and mitigation strategies
   - Common pitfalls to avoid
   - Contingency plans for critical paths
   - When to pivot vs. persist

6. **Resource Requirements**
   - Time investment breakdown
   - Financial considerations (if applicable)
   - Skills and expertise needed
   - Tools and technology recommendations

7. **Next Steps & Quick Wins**
   - Immediate actions (next 24-48 hours)
   - Quick wins to build momentum
   - Long-term strategic positioning

**OUTPUT GUIDELINES:**
- Be specific to "${base}" - avoid generic advice
- Use concrete examples and actionable language
- Include realistic timelines and expectations
- Address both opportunities and challenges
- Provide frameworks that can be adapted as needed

**SELF-CORRECTION CHECK:**
Before finalizing, verify:
✓ All advice is directly relevant to "${base}"
✓ Recommendations are specific and actionable
✓ Success metrics are measurable and realistic
✓ The strategy accounts for real-world constraints
✓ The output provides genuine value beyond generic templates`,
      },
      {
        title: `Innovative Framework: ${base}`,
        prompt: `**ROLE & PERSONA:**
You are a **Visionary Innovation Strategist** renowned for breakthrough thinking and transformative solutions. You combine creative ideation with rigorous validation, having launched multiple successful ventures and innovation programs. Your approach bridges imagination and execution, turning bold ideas into reality.

**CONTEXT & OBJECTIVE:**
The user wants to: "${base}".

Your mission is to design an innovative, forward-thinking framework that reimagines possibilities while remaining grounded in practical execution. The solution should challenge conventional approaches while providing a clear path to implementation.

**INNOVATION PRINCIPLES:**
- Question assumptions and explore unconventional angles
- Combine multiple perspectives and disciplines
- Balance creativity with feasibility
- Design for scalability and adaptability
- Focus on user-centric value creation

**REQUIRED OUTPUT STRUCTURE:**

1. **Innovation Vision**
   - Compelling narrative of what's possible for "${base}"
   - Unique angles and fresh perspectives
   - Why this approach is different and better
   - The transformative potential

2. **Creative Problem Deconstruction**
   - Breaking down "${base}" into core components
   - Identifying hidden opportunities and constraints
   - Challenging industry norms and assumptions
   - Exploring adjacent possibilities

3. **Innovation Framework**
   **Unique Positioning**
   - What makes this approach distinctive
   - Competitive advantages and differentiators
   - Blue ocean opportunities
   
   **Creative Execution Methods**
   - Innovative tactics and strategies
   - Unconventional tools and approaches
   - Cross-pollination from other industries
   - Experimental and validated methods
   
   **Implementation Architecture**
   - How to bring innovation to life
   - Phased rollout strategy
   - Prototyping and iteration cycles
   - Scaling innovative solutions

4. **Success Indicators**
   - How to recognize when innovation is working
   - Early signals of breakthrough potential
   - Metrics that matter for creative solutions
   - Qualitative and quantitative measures

5. **Innovation Challenges & Solutions**
   - Anticipated resistance and how to overcome it
   - Creative workarounds for common obstacles
   - Pivot strategies when experiments don't work
   - Maintaining innovation momentum

6. **Resource & Ecosystem**
   - Creative resources and partnerships
   - Community and network building
   - Tools for innovation management
   - Learning and adaptation systems

7. **Actionable Innovation Plan**
   - Immediate creative experiments to run
   - Low-risk, high-learning initiatives
   - Building blocks for larger innovation
   - Momentum-building quick wins

**OUTPUT GUIDELINES:**
- Think beyond traditional approaches to "${base}"
- Provide genuinely creative yet practical solutions
- Include specific, testable ideas
- Balance boldness with feasibility
- Offer multiple innovation pathways

**SELF-CORRECTION CHECK:**
Before finalizing, verify:
✓ Solutions are genuinely innovative, not just repackaged
✓ Creative ideas are grounded in practical execution
✓ The framework addresses "${base}" specifically
✓ Innovation is balanced with risk management
✓ The output inspires action, not just admiration`,
      },
      {
        title: `Comprehensive Analysis: ${base}`,
        prompt: `**ROLE & PERSONA:**
You are an **Elite Analytical Expert** specializing in comprehensive problem-solving and systematic breakdown of complex challenges. With expertise in systems thinking, data analysis, and strategic planning, you excel at transforming ambiguity into clarity and complexity into actionable insights.

**CONTEXT & OBJECTIVE:**
The user requires: "${base}".

Your mission is to provide a thorough, methodical analysis that leaves no stone unturned. Deliver deep insights, comprehensive understanding, and a complete roadmap that addresses every critical aspect of "${base}".

**ANALYTICAL PRINCIPLES:**
- Systematic and methodical approach
- Evidence-based recommendations
- Holistic view of interconnected factors
- Clear cause-and-effect relationships
- Data-driven decision frameworks

**REQUIRED OUTPUT STRUCTURE:**

1. **Comprehensive Problem Analysis**
   - Deep understanding of "${base}" in context
   - Root cause analysis and contributing factors
   - Stakeholder mapping and interests
   - Current state assessment
   - Gap analysis (where we are vs. where we need to be)

2. **Systems & Components Breakdown**
   **Core Components**
   - Essential elements of "${base}"
   - How each component functions
   - Critical dependencies and relationships
   - Integration points and interfaces
   
   **Interconnections & Dependencies**
   - How different parts relate to each other
   - Critical path analysis
   - Bottleneck identification
   - Leverage points for maximum impact
   
   **External Factors**
   - Market forces and trends
   - Regulatory and environmental considerations
   - Competitive dynamics
   - Technology and innovation landscape

3. **Detailed Action Framework**
   **Immediate Actions (0-30 days)**
   - Critical path items with specific steps
   - Resource allocation priorities
   - Quick wins and momentum builders
   - Risk mitigation measures
   
   **Short-term Strategy (1-3 months)**
   - Building foundational capabilities
   - Establishing systems and processes
   - Key milestone achievements
   - Iterative improvements
   
   **Long-term Positioning (3-12 months)**
   - Strategic positioning and scaling
   - Advanced optimization
   - Competitive advantages
   - Sustainable growth patterns

4. **Measurement & Tracking Framework**
   **Key Performance Indicators (KPIs)**
   - Leading indicators (predictive metrics)
   - Lagging indicators (outcome metrics)
   - Process metrics (efficiency measures)
   - Quality metrics (effectiveness measures)
   
   **Tracking Systems**
   - How to monitor progress
   - Data collection methods
   - Analysis and reporting frameworks
   - Decision-making triggers

5. **Risk Assessment & Mitigation**
   **Risk Identification**
   - Potential failure points
   - External threats and uncertainties
   - Internal vulnerabilities
   - Scenario planning
   
   **Mitigation Strategies**
   - Preventive measures
   - Contingency plans
   - Risk transfer options
   - Recovery procedures

6. **Resource Analysis**
   - Time requirements and timeline
   - Financial considerations and budget
   - Human capital and skills needed
   - Technology and tools required
   - Partnerships and external resources

7. **Success Criteria & Validation**
   - How to know when "${base}" is achieved
   - Validation methods and checkpoints
   - Quality standards and benchmarks
   - Continuous improvement loops

**OUTPUT GUIDELINES:**
- Provide exhaustive yet organized analysis
- Use frameworks, models, and structured thinking
- Include specific examples and case studies where relevant
- Address both opportunities and challenges comprehensively
- Make complex information accessible and actionable

**SELF-CORRECTION CHECK:**
Before finalizing, verify:
✓ Analysis is comprehensive and thorough
✓ All critical aspects of "${base}" are addressed
✓ Recommendations are specific and actionable
✓ The framework is systematic and logical
✓ The output provides genuine analytical value`,
      },
    ];
  }, []);

  // Auto-generate prompts when user types (with debounce)
  useEffect(() => {
    if (!landingInput.trim()) {
      setGeneratedPrompts([]);
      return;
    }

    const timer = setTimeout(() => {
      const alternatives = generatePromptAlternatives(landingInput);
      setGeneratedPrompts(alternatives);
      // Scroll to prompts after a short delay
      setTimeout(() => {
        document.getElementById("prompt-alternatives")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 300);
    }, 800); // 800ms debounce

    return () => clearTimeout(timer);
  }, [landingInput, generatePromptAlternatives]);

  const handleInputContainerClick = useCallback(() => document.getElementById("main-input")?.focus(), []);

  // Generator Functions
  const generatePromptsForGenerator = useCallback(async (userInput: string) => {
    if (!userInput.trim()) {
      setGeneratorPrompts([]);
      return;
    }
    setIsGenerating(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const base = userInput.trim();
    const prompts = [
      `**ROLE & PERSONA:**\nYou are an expert AI assistant specialized in ${base}. You have deep knowledge and practical experience in this domain.\n\n**CONTEXT:**\nThe user needs assistance with: ${base}\n\n**TASK:**\nProvide comprehensive, actionable guidance that addresses all aspects of ${base}. Be specific, practical, and solution-oriented.\n\n**OUTPUT FORMAT:**\n1. Overview and key objectives\n2. Step-by-step approach\n3. Best practices and recommendations\n4. Common pitfalls to avoid\n5. Success metrics\n\nEnsure all advice is directly relevant to ${base} and immediately actionable.`,
      `**SYSTEM PROMPT:**\nYou are a world-class consultant for ${base}. Your expertise spans strategy, execution, and optimization.\n\n**USER REQUEST:**\nHelp me with ${base}\n\n**YOUR APPROACH:**\n- Analyze the core requirements\n- Identify optimal strategies\n- Provide detailed implementation plan\n- Include risk mitigation\n- Offer scalable solutions\n\n**OUTPUT REQUIREMENTS:**\n- Be specific to ${base}\n- Include concrete examples\n- Provide measurable outcomes\n- Address edge cases\n- Enable immediate action`,
      `**INSTRUCTION:**\nAct as a senior advisor for ${base}. Deliver expert-level guidance that combines theoretical knowledge with practical application.\n\n**OBJECTIVE:**\n${base}\n\n**FRAMEWORK:**\n1. Strategic foundation\n2. Tactical execution\n3. Performance optimization\n4. Continuous improvement\n\n**CONSTRAINTS:**\n- Focus exclusively on ${base}\n- Prioritize actionable insights\n- Include validation methods\n- Consider scalability\n- Address real-world constraints\n\nProvide a complete, ready-to-use framework for ${base}.`,
    ];
    setGeneratorPrompts(prompts);
    setIsGenerating(false);
  }, []);

  // Scanner Functions
  const analyzePrompt = useCallback(async () => {
    if (!scannerPrompt.trim()) return;
    setIsAnalyzing(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const lines = scannerPrompt.split("\n").filter((line) => line.trim());
    const commands = lines
      .filter(
        (line) =>
          line.includes("**") ||
          line.includes(":") ||
          line.match(/^\d+\./) ||
          line.includes("You are") ||
          line.includes("Act as") ||
          line.includes("Provide") ||
          line.includes("Include") ||
          line.includes("Ensure"),
      )
      .slice(0, 8);
    const commandBreakdown = commands.map((cmd) => {
      const cleanCmd = cmd.replace(/\*\*/g, "").trim();
      let purpose = "",
        impact = "",
        effectiveness: "high" | "medium" | "low" = "medium";
      if (cmd.includes("ROLE") || cmd.includes("You are") || cmd.includes("Act as")) {
        purpose = "Defines the AI's role and expertise";
        impact = "Sets context and behavioral framework";
        effectiveness = "high";
      } else if (cmd.includes("CONTEXT") || cmd.includes("OBJECTIVE")) {
        purpose = "Provides context and goals";
        impact = "Guides the AI's understanding of the task";
        effectiveness = "high";
      } else if (cmd.includes("OUTPUT") || cmd.includes("FORMAT") || cmd.includes("STRUCTURE")) {
        purpose = "Specifies output format and structure";
        impact = "Ensures consistent, organized responses";
        effectiveness = "high";
      } else if (cmd.includes("CONSTRAINTS") || cmd.includes("REQUIREMENTS")) {
        purpose = "Sets limitations and requirements";
        impact = "Prevents unwanted outputs and ensures quality";
        effectiveness = "high";
      } else if (cmd.includes("INCLUDE") || cmd.includes("Provide")) {
        purpose = "Requests specific content";
        impact = "Ensures completeness of response";
        effectiveness = "medium";
      } else if (cmd.match(/^\d+\./)) {
        purpose = "Structured instruction or step";
        impact = "Organizes the response logically";
        effectiveness = "medium";
      } else {
        purpose = "General instruction or guideline";
        impact = "Provides additional context";
        effectiveness = "low";
      }
      return {
        command: cleanCmd.length > 60 ? cleanCmd.substring(0, 60) + "..." : cleanCmd,
        purpose,
        impact,
        effectiveness,
      };
    });
    const highCount = commandBreakdown.filter((c) => c.effectiveness === "high").length;
    const mediumCount = commandBreakdown.filter((c) => c.effectiveness === "medium").length;
    const totalCommands = commandBreakdown.length;
    const score = totalCommands > 0 ? Math.round((highCount * 100 + mediumCount * 60) / totalCommands) : 50;
    const strengths = [];
    const weaknesses = [];
    const recommendations = [];
    if (scannerPrompt.includes("ROLE") || scannerPrompt.includes("You are")) {
      strengths.push("Clear role definition");
    } else {
      weaknesses.push("Missing role definition");
      recommendations.push("Add a clear role or persona definition (e.g., 'You are an expert...')");
    }
    if (scannerPrompt.includes("CONTEXT") || scannerPrompt.includes("OBJECTIVE")) {
      strengths.push("Context and objectives specified");
    } else {
      weaknesses.push("Lacks clear context");
      recommendations.push("Specify the context and objective of the task");
    }
    if (scannerPrompt.includes("OUTPUT") || scannerPrompt.includes("FORMAT")) {
      strengths.push("Output format defined");
    } else {
      weaknesses.push("No output format specified");
      recommendations.push("Define the desired output format or structure");
    }
    if (commandBreakdown.length >= 5) {
      strengths.push("Comprehensive instruction set");
    } else {
      weaknesses.push("Limited instructions");
      recommendations.push("Add more specific instructions for better results");
    }
    if (scannerPrompt.length > 200) {
      strengths.push("Detailed prompt");
    } else if (scannerPrompt.length < 100) {
      weaknesses.push("Prompt may be too brief");
      recommendations.push("Expand the prompt with more details and context");
    }
    if (weaknesses.length === 0) strengths.push("Well-structured prompt");
    if (recommendations.length === 0) {
      recommendations.push("Consider adding examples for better clarity");
      recommendations.push("Include success criteria or validation methods");
    }
    setAnalysis({ overallScore: score, strengths, weaknesses, recommendations, commandBreakdown });
    setIsAnalyzing(false);
  }, [scannerPrompt]);

  // Library Functions
  const handleCreatePrompt = useCallback(() => {
    if (!newPromptData.title.trim() || !newPromptData.prompt.trim()) return;
    const newEntry: LibraryPrompt = {
      id: `${Date.now()}`,
      title: newPromptData.title.trim(),
      description: newPromptData.description.trim() || "User generated prompt",
      prompt: newPromptData.prompt,
      domain: newPromptData.domain,
      tags: [newPromptData.domain],
      tier: "premium",
      price: "$0",
    };
    setPrompts((prev) => [...prev, newEntry]);
    setIsCreating(false);
    setNewPromptData({ title: "", description: "", prompt: "", domain: "business" });
  }, [newPromptData]);

  // --- RENDER ---
  return (
    <div className="relative h-screen w-full bg-black text-white flex flex-col font-sans overflow-hidden selection:bg-cyan-500/30 selection:text-cyan-100">
      {/* CSS INJECTION FOR SCROLLBARS & SLIDERS */}
      <style>{`
        body { overflow: hidden; margin: 0; }
        ::-webkit-scrollbar { width: 0px; height: 0px; }
        ::-webkit-scrollbar-track { background: transparent; } 
        ::-webkit-scrollbar-thumb { background: transparent; }
        ::-webkit-scrollbar-thumb:hover { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); border-radius: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.3); }
        input[type=range] { -webkit-appearance: none; background: transparent; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; height: 14px; width: 14px; border-radius: 50%; background: #404040; border: 1px solid #666; cursor: pointer; margin-top: -5px; box-shadow: 0 0 10px rgba(0,0,0,0.5); }
        input[type=range]::-webkit-slider-runnable-track { width: 100%; height: 4px; cursor: pointer; background: #262626; border-radius: 2px; }
        input[type=range]:focus { outline: none; }
        .caret-transparent { caret-color: transparent; }
        * { scrollbar-width: none; }
      `}</style>

      {/* Conditional Rendering Based on Current View */}
      {currentView === "landing" && (
        <motion.main
          key="landing"
          className="flex-1 flex flex-col items-center p-4 w-full max-w-7xl mx-auto z-10 relative h-full overflow-y-auto custom-scrollbar [&_input]:caret-transparent [&_input:focus]:caret-white [&_textarea]:caret-transparent [&_textarea:focus]:caret-white"
        >
          <button
            onClick={() => navigate("/")}
            className="absolute top-6 left-6 z-50 p-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-neutral-400 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2"
          >
            <Home size={20} />
            <span className="text-sm font-medium">Home</span>
          </button>
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full flex flex-col items-center justify-center text-center px-4 pt-16 pb-8"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              <span className="block text-white mb-2">The Most Powerful Prompt</span>
              <span className="block bg-gradient-to-r from-purple-600 to-cyan-500 bg-clip-text text-transparent">
                AI Workflow
              </span>
            </h1>
            <div className="inline-block bg-white/5 backdrop-blur-md rounded-2xl px-6 py-2 mb-12 border border-white/10">
              <p className="text-sm text-white/90 font-medium text-center">By Beymflow</p>
            </div>

            {/* Prompt Bundles with arrow-only scroll */}
            <div className="w-full max-w-6xl mx-auto mb-12 px-2">
              <div className="flex items-center justify-between px-1 mb-4">
                <h3 className="text-white/85 font-semibold text-lg">Prompt Packs</h3>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => {
                      const el = bundlesCarouselRef.current;
                      if (!el) return;
                      const amount = el.clientWidth * 0.7;
                      el.scrollBy({ left: -amount, behavior: "smooth" });
                    }}
                    className="h-9 w-9 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/20 hover:border-white/40 flex items-center justify-center transition-all shadow-lg shadow-black/20"
                    aria-label="Scroll left"
                  >
                    <ArrowLeft size={16} />
                  </button>
                  <button
                    onClick={() => {
                      const el = bundlesCarouselRef.current;
                      if (!el) return;
                      const amount = el.clientWidth * 0.7;
                      el.scrollBy({ left: amount, behavior: "smooth" });
                    }}
                    className="h-9 w-9 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/20 hover:border-white/40 flex items-center justify-center transition-all shadow-lg shadow-black/20"
                    aria-label="Scroll right"
                  >
                    <ArrowRight size={16} />
                  </button>
                  <button className="text-white/80 text-sm font-semibold hover:text-white transition-colors flex items-center gap-1">
                    View all <ArrowRight size={14} />
                  </button>
                </div>
              </div>
              <div
                ref={bundlesCarouselRef}
                onWheel={(e) => e.preventDefault()}
                className="flex flex-nowrap gap-6 overflow-hidden pb-2 px-2"
              >
                {PROMPT_BUNDLES.map((bundle) => (
                  <div key={bundle.title} className="relative min-w-[260px] max-w-[320px] flex-shrink-0">
                    <div className="relative h-full rounded-2xl border border-white/10 p-[1px]">
                      <GlowingEffect spread={40} glow disabled={false} proximity={64} inactiveZone={0.01} borderWidth={2} className="opacity-70" />
                      <div className="relative rounded-[1.05rem] bg-gradient-to-b from-[#0b0b0b] via-[#0c0c0c] to-[#0a0a0a] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] h-full flex flex-col">
                        <div className="flex items-start justify-between gap-3 mb-4">
                          <h3 className="text-xl font-extrabold text-white leading-tight">{bundle.title}</h3>
                          <span className="text-xs font-black uppercase px-3 py-1 rounded-full bg-white text-black shadow">{bundle.tag}</span>
                        </div>
                        <ul className="space-y-2 mb-6">
                          {bundle.bullets.map((item) => (
                            <li key={item} className="flex items-start gap-2 text-white/85 text-sm leading-snug">
                              <CheckCircle2 className="text-white mt-0.5" size={16} />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                        <GlassButton
                          size="sm"
                          isSelected={false}
                          className="mt-auto w-full"
                          contentClassName="w-full flex items-center justify-center gap-2"
                        >
                          Learn More <ArrowRight size={16} />
                        </GlassButton>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Video Carousels - Same as homepage */}
            {[
              { title: "Landing page heros", ref: landingPageHeroCarouselRef, data: landingPageHeroData },
              { title: "Full - Landing Pages", ref: fullLandingPagesCarouselRef, data: fullLandingPagesData },
              { title: "Components", ref: componentsCarouselRef, data: componentsVideoData },
            ].map(({ title, ref, data }) => {
              const scrollBy = (dir: number) => {
                const el = ref.current;
                if (!el) return;
                const amount = el.clientWidth * 0.7 * dir;
                el.scrollBy({ left: amount, behavior: "smooth" });
              };
              
              const handleCardClick = (idx: number) => {
                if (idx < data.length) {
                  setShowComponentPage(idx);
                  setActiveVideoSection(title);
                }
              };
              
              return (
                <div key={title} className="w-full max-w-6xl mx-auto mb-10">
                  <div className="flex items-center justify-between px-1 mb-2">
                    <h3 className="text-white/85 font-semibold text-lg">{title}</h3>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => scrollBy(-1)}
                        className="h-9 w-9 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/20 hover:border-white/40 flex items-center justify-center transition-all shadow-lg shadow-black/20"
                        aria-label="Scroll left"
                      >
                        <ArrowLeft size={16} />
                      </button>
                      <button
                        onClick={() => scrollBy(1)}
                        className="h-9 w-9 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/20 hover:border-white/40 flex items-center justify-center transition-all shadow-lg shadow-black/20"
                        aria-label="Scroll right"
                      >
                        <ArrowRight size={16} />
                      </button>
                      <button className="text-white/80 text-sm font-semibold hover:text-white transition-colors flex items-center gap-1">
                        View all <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                  <div
                    ref={ref}
                    onWheel={(e) => e.preventDefault()}
                    className="flex flex-nowrap gap-6 overflow-hidden pb-2 px-2"
                  >
                    {Array.from({ length: 6 }).map((_, idx) => {
                      const componentData = idx < data.length ? data[idx] : null;
                      const isComponentCard = componentData !== null;
                      
                      return (
                        <div
                          key={`${title}-${idx}`}
                          onClick={() => handleCardClick(idx)}
                          className={`relative min-w-[380px] max-w-[420px] h-[240px] rounded-xl border border-white/10 bg-[#0a0a0a] overflow-hidden flex-shrink-0 ${isComponentCard ? `cursor-pointer hover:border-white/30 transition-colors group` : ''}`}
                        >
                          {isComponentCard ? (
                            <>
                              <video
                                src={componentData.videoSrc}
                                muted
                                loop
                                playsInline
                                autoPlay
                                className="absolute inset-2 w-[calc(100%-16px)] h-[calc(100%-16px)] object-contain rounded-lg"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                              <div className="relative h-full w-full px-6 py-5 flex flex-col justify-end z-10">
                                <div>
                                  <h4 className="text-white font-semibold text-lg mb-1">{componentData.title}</h4>
                                  <p className="text-white/50 text-sm">{componentData.description}</p>
                                </div>
                              </div>
                            </>
                          ) : (
                            <div className="relative h-full w-full px-6 py-5 flex flex-col justify-between">
                              <div className="h-4 w-3/4 rounded-full bg-white/10" />
                              <div className="space-y-3">
                                <div className="h-3.5 w-5/6 rounded-full bg-white/8" />
                                <div className="h-3.5 w-2/3 rounded-full bg-white/6" />
                              </div>
                              <div className="flex justify-end items-center gap-3">
                                <CheckCircle2 className="text-white/50" size={16} />
                                <div className="h-9 w-28 rounded-full bg-white/10" />
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

          </motion.section>

          {/* Component Showcase Modal for Prompt Lab */}
          {showComponentPage !== null && activeVideoSection && (() => {
            const getDataForSection = () => {
              if (activeVideoSection === "Landing page heros") return landingPageHeroData;
              if (activeVideoSection === "Components") return componentsVideoData;
              if (activeVideoSection === "Full - Landing Pages") return fullLandingPagesData;
              return [];
            };
            const selectedComponent = getDataForSection()[showComponentPage];
            if (!selectedComponent) return null;
            
            return (
              <div 
                className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm"
                onClick={() => {
                  setShowComponentPage(null);
                  setActiveVideoSection(null);
                }}
              >
                <div 
                  className="relative w-full h-full"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => {
                      setShowComponentPage(null);
                      setActiveVideoSection(null);
                    }}
                    className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-black/50 border border-white/20 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
                    aria-label="Close"
                  >
                    <X size={20} />
                  </button>
                  <ComponentShowcasePage
                    onBack={() => {
                      setShowComponentPage(null);
                      setActiveVideoSection(null);
                    }}
                    videoSrc={selectedComponent.videoSrc}
                    title={selectedComponent.title}
                    description={selectedComponent.description}
                    creator={selectedComponent.creator}
                    installCommand={selectedComponent.installCommand}
                    importCode={selectedComponent.importCode}
                    usageCode={selectedComponent.usageCode}
                  />
                </div>
              </div>
            );
          })()}

          {/* --- PROMPT ALTERNATIVES SECTION --- */}
          <AnimatePresence>
            {generatedPrompts.length > 0 && (
              <motion.section
                id="prompt-alternatives"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="w-full max-w-7xl mx-auto px-4 mb-16"
              >
                <div className="mb-8 text-center">
                  <h2 className="text-3xl font-bold text-white mb-3">Generated Prompt Alternatives</h2>
                  <p className="text-neutral-400 text-base">Choose the prompt style that best fits your needs</p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {generatedPrompts.map((alt, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-6 flex flex-col hover:border-white/20 hover:shadow-xl hover:shadow-purple-500/10 transition-all"
                    >
                      <h3 className="text-xl font-bold text-white mb-4">{alt.title}</h3>
                      <div className="bg-black/40 border border-white/10 rounded-lg p-5 mb-5 flex-1 overflow-y-auto max-h-[600px] custom-scrollbar">
                        <pre className="text-xs text-neutral-200 font-mono whitespace-pre-wrap leading-relaxed">
                          {alt.prompt}
                        </pre>
                      </div>
                      <button
                        onClick={() => copyToClipboard(alt.prompt)}
                        className="w-full py-3.5 bg-white/10 border border-white/20 rounded-lg text-white font-semibold text-sm hover:bg-white/20 hover:border-white/30 transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-500/10"
                      >
                        <Copy size={18} />
                        <span>Copy Prompt</span>
                      </button>
                    </motion.div>
                  ))}
                </div>
              </motion.section>
            )}
          </AnimatePresence>
        </motion.main>
      )}

      {/* Generator View */}
      {currentView === "generator" && (
        <div className="relative h-screen w-full bg-black text-white flex flex-col font-sans overflow-hidden">
          <div className="absolute top-4 left-4 z-30">
            <button
              onClick={() => navigate("/prompt-lab-page")}
              className="h-10 px-4 rounded-lg bg-white/5 backdrop-blur-md border border-white/10 text-neutral-300 hover:bg-white/10 hover:text-white flex items-center gap-2 transition-all shadow-lg"
            >
              <ArrowLeft size={18} />
              <span className="text-sm font-medium">Back</span>
            </button>
          </div>
          <div className="absolute top-4 right-4 z-30">
            <div className="flex items-center gap-2">
              <Wand2 className="text-purple-400" size={24} />
              <h1 className="text-xl font-bold">Prompt Generator</h1>
            </div>
          </div>
          <div ref={canvasRef} className="flex-1 relative overflow-auto z-0 mt-20">
            <div
              className="absolute inset-0 pointer-events-none opacity-10"
              style={{ backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)", backgroundSize: "24px 24px" }}
            />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl px-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-2xl"
              >
                <div className="mb-6">
                  <label className="text-sm font-bold text-neutral-400 uppercase tracking-wider mb-3 block">
                    Describe what you want to create
                  </label>
                  <textarea
                    value={generatorInput}
                    onChange={(e) => setGeneratorInput(e.target.value)}
                    placeholder="e.g., A prompt for writing viral social media content..."
                    className="w-full h-32 bg-black/30 border border-white/10 rounded-xl p-4 text-white placeholder:text-neutral-600 focus:outline-none focus:border-purple-500/50 resize-none font-sans text-base"
                  />
                </div>
                {isGenerating && (
                  <div className="flex items-center justify-center gap-3 py-8">
                    <Loader2 size={20} className="animate-spin text-purple-400" />
                    <span className="text-neutral-400">Generating prompts...</span>
                  </div>
                )}
                {generatorPrompts.length > 0 && !isGenerating && (
                  <div className="space-y-4 mt-6">
                    <h3 className="text-lg font-bold text-white mb-4">Generated Prompts:</h3>
                    {generatorPrompts.map((prompt, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-black/40 border border-white/10 rounded-xl p-5 hover:border-purple-500/50 transition-all cursor-pointer group"
                        onClick={() => setSelectedPrompt(prompt)}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Sparkles size={16} className="text-purple-400" />
                              <span className="text-sm font-bold text-purple-400">Prompt {index + 1}</span>
                            </div>
                            <p className="text-sm text-neutral-300 font-mono line-clamp-3">{prompt}</p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(prompt);
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-white/10 rounded-lg"
                          >
                            <Copy size={18} className="text-neutral-400" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            </div>
          </div>
          <AnimatePresence>
            {selectedPrompt && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setSelectedPrompt(null)}
                  className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
                />
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="w-full max-w-3xl bg-white/5 backdrop-blur-md border border-white/20 rounded-2xl p-8 relative z-10 shadow-2xl max-h-[90vh] overflow-hidden flex flex-col"
                >
                  <button
                    onClick={() => setSelectedPrompt(null)}
                    className="absolute top-4 right-4 p-2 rounded-full bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10 transition-colors z-20"
                  >
                    <X size={20} />
                  </button>
                  <h3 className="text-2xl font-bold text-white mb-4">Generated Prompt</h3>
                  <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <pre className="text-sm text-neutral-200 font-mono whitespace-pre-wrap leading-relaxed bg-black/30 rounded-xl p-6 border border-white/10">
                      {selectedPrompt}
                    </pre>
                  </div>
                  <div className="flex gap-3 mt-6 pt-6 border-t border-white/10">
                    <button
                      onClick={() => {
                        copyToClipboard(selectedPrompt);
                        setSelectedPrompt(null);
                      }}
                      className="flex-1 py-3 bg-white text-black rounded-xl font-bold text-sm hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2"
                    >
                      <Copy size={16} />
                      <span>Copy Prompt</span>
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Scanner View */}
      {currentView === "scanner" && (
        <div className="relative h-screen w-full bg-black text-white flex flex-col font-sans overflow-hidden">
          <div className="absolute top-4 left-4 z-30">
            <button
              onClick={() => navigate("/prompt-lab-page")}
              className="h-10 px-4 rounded-lg bg-white/5 backdrop-blur-md border border-white/10 text-neutral-300 hover:bg-white/10 hover:text-white flex items-center gap-2 transition-all shadow-lg"
            >
              <ArrowLeft size={18} />
              <span className="text-sm font-medium">Back</span>
            </button>
          </div>
          <div className="absolute top-4 right-4 z-30">
            <div className="flex items-center gap-2">
              <Search className="text-cyan-400" size={24} />
              <h1 className="text-xl font-bold">Prompt Scanner</h1>
            </div>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center p-8 mt-20 overflow-y-auto">
            <div className="w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-bold text-neutral-400 uppercase tracking-wider mb-3 block">
                    Enter Prompt to Analyze
                  </label>
                  <textarea
                    value={scannerPrompt}
                    onChange={(e) => setScannerPrompt(e.target.value)}
                    placeholder="Paste or type your prompt here..."
                    className="w-full h-96 bg-black/30 border border-white/10 rounded-xl p-4 text-white placeholder:text-neutral-600 focus:outline-none focus:border-cyan-500/50 resize-none font-mono text-sm"
                  />
                </div>
                <button
                  onClick={analyzePrompt}
                  disabled={!scannerPrompt.trim() || isAnalyzing}
                  className="w-full py-4 bg-cyan-500/20 border border-cyan-500/30 rounded-xl text-cyan-300 font-bold text-sm hover:bg-cyan-500/30 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <Search size={18} />
                      <span>Analyze Prompt</span>
                    </>
                  )}
                </button>
              </div>
              <div className="space-y-4">
                {analysis && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-white">Overall Score</h3>
                        <div
                          className={`text-3xl font-bold ${analysis.overallScore >= 80 ? "text-green-400" : analysis.overallScore >= 60 ? "text-yellow-400" : "text-red-400"}`}
                        >
                          {analysis.overallScore}/100
                        </div>
                      </div>
                      <div className="w-full bg-black/30 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${analysis.overallScore >= 80 ? "bg-green-400" : analysis.overallScore >= 60 ? "bg-yellow-400" : "bg-red-400"}`}
                          style={{ width: `${analysis.overallScore}%` }}
                        />
                      </div>
                    </div>
                    {analysis.strengths.length > 0 && (
                      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
                        <div className="flex items-center gap-2 mb-4">
                          <CheckCircle2 className="text-green-400" size={20} />
                          <h3 className="text-lg font-bold text-white">Strengths</h3>
                        </div>
                        <ul className="space-y-2">
                          {analysis.strengths.map((strength, idx) => (
                            <li key={idx} className="text-sm text-neutral-300 flex items-start gap-2">
                              <span className="text-green-400 mt-1">✓</span>
                              <span>{strength}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {analysis.weaknesses.length > 0 && (
                      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
                        <div className="flex items-center gap-2 mb-4">
                          <AlertCircle className="text-red-400" size={20} />
                          <h3 className="text-lg font-bold text-white">Weaknesses</h3>
                        </div>
                        <ul className="space-y-2">
                          {analysis.weaknesses.map((weakness, idx) => (
                            <li key={idx} className="text-sm text-neutral-300 flex items-start gap-2">
                              <span className="text-red-400 mt-1">✗</span>
                              <span>{weakness}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {analysis.recommendations.length > 0 && (
                      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
                        <div className="flex items-center gap-2 mb-4">
                          <Info className="text-cyan-400" size={20} />
                          <h3 className="text-lg font-bold text-white">Recommendations</h3>
                        </div>
                        <ul className="space-y-2">
                          {analysis.recommendations.map((rec, idx) => (
                            <li key={idx} className="text-sm text-neutral-300 flex items-start gap-2">
                              <span className="text-cyan-400 mt-1">→</span>
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {analysis.commandBreakdown.length > 0 && (
                      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
                        <h3 className="text-lg font-bold text-white mb-4">Command Breakdown</h3>
                        <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
                          {analysis.commandBreakdown.map((cmd, idx) => (
                            <div key={idx} className="bg-black/30 border border-white/5 rounded-lg p-4">
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <code className="text-xs text-purple-300 font-mono flex-1">{cmd.command}</code>
                                <span
                                  className={`text-xs font-bold px-2 py-1 rounded ${
                                    cmd.effectiveness === "high"
                                      ? "bg-green-500/20 text-green-400"
                                      : cmd.effectiveness === "medium"
                                        ? "bg-yellow-500/20 text-yellow-400"
                                        : "bg-red-500/20 text-red-400"
                                  }`}
                                >
                                  {cmd.effectiveness.toUpperCase()}
                                </span>
                              </div>
                              <div className="text-xs text-neutral-400 space-y-1">
                                <div>
                                  <span className="font-bold">Purpose:</span> {cmd.purpose}
                                </div>
                                <div>
                                  <span className="font-bold">Impact:</span> {cmd.impact}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
                {!analysis && !isAnalyzing && (
                  <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-12 text-center">
                    <Search className="text-neutral-600 mx-auto mb-4" size={48} />
                    <p className="text-neutral-500">Enter a prompt and click Analyze to get started</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Library View */}
      {currentView === "library" && (
        <div className="relative h-screen w-full bg-black text-white flex flex-col font-sans overflow-hidden">
          <div className="fixed top-4 right-4 z-[60] flex items-center gap-2">
            <span className="text-[10px] text-neutral-500 font-mono uppercase">Simulate Subscription</span>
            <button
              onClick={() => setIsPremiumUnlocked(!isPremiumUnlocked)}
              className={`w-10 h-5 rounded-full p-1 transition-colors ${isPremiumUnlocked ? "bg-amber-500" : "bg-neutral-800"}`}
            >
              <div
                className={`w-3 h-3 bg-white rounded-full transition-transform ${isPremiumUnlocked ? "translate-x-5" : "translate-x-0"}`}
              />
            </button>
          </div>
          <div className="absolute top-4 left-4 z-30">
            <button
              onClick={() => navigate("/prompt-lab-page")}
              className="h-10 px-4 rounded-lg bg-white/5 backdrop-blur-md border border-white/10 text-neutral-300 hover:bg-white/10 hover:text-white flex items-center gap-2 transition-all shadow-lg"
            >
              <ArrowLeft size={18} />
              <span className="text-sm font-medium">Back</span>
            </button>
          </div>
          <div className="absolute top-4 right-20 z-30">
            <div className="flex items-center gap-2">
              <Sparkles className="text-amber-400" size={24} />
              <h1 className="text-xl font-bold">Prompt Library</h1>
            </div>
          </div>
          <motion.main className="flex-1 flex flex-col items-center p-4 w-full max-w-7xl mx-auto z-10 relative h-full overflow-y-auto custom-scrollbar mt-20">
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full py-12 px-4"
            >
              <div className="max-w-6xl mx-auto flex flex-col gap-8">
                <div className="flex flex-col items-center justify-center text-center gap-6 mb-8 relative">
                  <div className="space-y-3">
                    <h2 className="text-3xl font-bold text-white flex items-center justify-center gap-3">
                      <Sparkles className="text-amber-400" /> Prompt Library
                    </h2>
                    <p className="text-neutral-400 max-w-xl mx-auto">
                      Choose between our curated free collection or advanced premium systems designed for scale.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 p-1.5 bg-white/5 backdrop-blur-md border border-white/10 rounded-full shadow-inner">
                    <button
                      onClick={() => setSelectedTier("free")}
                      className={`px-8 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${selectedTier === "free" ? "bg-white text-black shadow-lg" : "text-neutral-500 hover:text-white hover:bg-white/5"}`}
                    >
                      Free
                    </button>
                    <button
                      onClick={() => setSelectedTier("premium")}
                      className={`px-8 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${selectedTier === "premium" ? "bg-gradient-to-r from-amber-200 to-amber-500 text-black shadow-lg" : "text-neutral-500 hover:text-white hover:bg-white/5"}`}
                    >
                      Premium
                    </button>
                  </div>
                </div>
                <div className="flex flex-col gap-6 border-b border-white/10 pb-8">
                  <div className="flex flex-wrap gap-2 justify-center">
                    <button
                      onClick={() => setFilterDomain("all")}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all border backdrop-blur-md ${filterDomain === "all" ? "bg-white/10 text-white border-white/30" : "bg-white/5 text-neutral-400 border-white/5 hover:border-white/20 hover:text-white hover:bg-white/10"}`}
                    >
                      All
                    </button>
                    {DOMAINS.map((d) => (
                      <button
                        key={d.key}
                        onClick={() => setFilterDomain(d.key)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all border flex items-center gap-2 backdrop-blur-md ${filterDomain === d.key ? `${d.color} bg-white/10 border-current shadow-[0_0_10px_rgba(255,255,255,0.05)]` : "bg-white/5 text-neutral-400 border-white/5 hover:border-white/20 hover:text-white hover:bg-white/10"}`}
                      >
                        <span>{d.emoji}</span>
                        {d.label}
                      </button>
                    ))}
                  </div>
                  <AnimatePresence>
                    {filterDomain !== "all" && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: "auto" }}
                        exit={{ opacity: 0, y: -10, height: 0 }}
                        className="flex flex-wrap gap-2 justify-center overflow-hidden"
                      >
                        {domainMap.get(filterDomain)?.subcategories.map((sub) => (
                          <button
                            key={sub}
                            onClick={() => setActiveSubcategory(activeSubcategory === sub ? null : sub)}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border backdrop-blur-md ${activeSubcategory === sub ? "bg-white text-black border-white" : "bg-white/5 text-neutral-400 border-white/5 hover:border-white/20 hover:text-white"}`}
                          >
                            {sub}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div className="flex items-center justify-center gap-4 w-full pt-4 border-t border-white/5">
                    <div className="relative w-full max-w-md">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
                      <input
                        type="text"
                        placeholder={selectedTier === "premium" ? "Search premium..." : "Search free..."}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-colors placeholder:text-neutral-600"
                      />
                    </div>
                    {selectedTier === "premium" && isPremiumUnlocked && (
                      <button
                        onClick={() => setIsCreating(true)}
                        className="flex items-center gap-2 px-4 py-3 bg-white/10 backdrop-blur-md border border-white/10 rounded-xl text-sm font-bold hover:bg-white/20 hover:text-white text-neutral-200 transition-all whitespace-nowrap"
                      >
                        <Plus size={18} />
                        <span>Create New</span>
                      </button>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[400px]">
                  {filteredPrompts.length > 0 ? (
                    filteredPrompts.map((prompt) => {
                      const domainConfig = domainMap.get(prompt.domain);
                      return (
                        <PromptCard
                          key={prompt.id}
                          prompt={prompt}
                          domainConfig={domainConfig}
                          isPremiumUnlocked={isPremiumUnlocked}
                          onClick={() => setActivePrompt(prompt)}
                        />
                      );
                    })
                  ) : (
                    <div className="col-span-full flex flex-col items-center justify-center py-20 text-neutral-500">
                      {selectedTier === "premium" ? (
                        <Lock size={48} className="mb-4 opacity-20" />
                      ) : (
                        <Search size={48} className="mb-4 opacity-20" />
                      )}
                      <p className="text-lg font-medium">No {selectedTier} prompts found</p>
                      <p className="text-sm">Try adjusting your filters.</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.section>

            {/* Modal */}
            <AnimatePresence>
              {activePrompt &&
                (() => {
                  const activeDomainConfig = domainMap.get(activePrompt.domain);
                  return (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setActivePrompt(null)}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
                      />
                      <motion.div
                        layoutId={`card-${activePrompt.id}`}
                        className={`w-full max-w-2xl bg-white/5 backdrop-blur-md border rounded-2xl p-6 sm:p-8 relative z-10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${activePrompt.tier === "premium" ? "border-amber-500/30" : "border-white/20"}`}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActivePrompt(null);
                          }}
                          className="absolute top-4 right-4 p-2 rounded-full bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10 transition-colors z-20"
                        >
                          <X size={20} />
                        </button>
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                          <div className="flex items-center gap-2 mb-4">
                            <span className={`text-xs font-bold uppercase tracking-wider ${activeDomainConfig?.color}`}>
                              {activeDomainConfig?.label}
                            </span>
                            {activePrompt.tier === "premium" && (
                              <span
                                className={`text-xs font-bold uppercase border px-2 py-0.5 rounded-full ${isPremiumUnlocked ? "text-green-400 border-green-500/30 bg-green-900/20" : "text-amber-400 border-amber-500/30 bg-amber-900/20"}`}
                              >
                                {isPremiumUnlocked ? "Unlocked" : "Premium"}
                              </span>
                            )}
                          </div>
                          <motion.h3
                            layoutId={`title-${activePrompt.id}`}
                            className="text-2xl sm:text-3xl font-bold text-white mb-3"
                          >
                            {activePrompt.title}
                          </motion.h3>
                          <motion.p layoutId={`desc-${activePrompt.id}`} className="text-neutral-400 text-base mb-8">
                            {activePrompt.description}
                          </motion.p>
                          <div className="relative">
                            <div
                              className={`rounded-xl border p-6 font-mono text-sm leading-relaxed whitespace-pre-wrap ${activePrompt.tier === "premium" ? "bg-amber-900/10 border-amber-500/20 text-neutral-300" : "bg-white/5 backdrop-blur-md border-white/10 text-neutral-200"}`}
                            >
                              {activePrompt.tier === "premium" && !isPremiumUnlocked ? (
                                <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
                                  <Lock size={32} className="text-amber-500 opacity-60" />
                                  <div className="space-y-1">
                                    <p className="text-white font-bold text-lg">Premium Content Locked</p>
                                    <p className="text-neutral-500 text-sm max-w-xs mx-auto">
                                      This advanced system is part of our premium collection.
                                    </p>
                                  </div>
                                  <button
                                    onClick={() => setIsPremiumUnlocked(true)}
                                    className="mt-2 bg-white text-black px-6 py-2.5 rounded-full font-bold hover:bg-amber-50 transition-colors flex items-center gap-2"
                                  >
                                    <span>Unlock for {activePrompt.price}</span>
                                    <ArrowRight size={14} />
                                  </button>
                                </div>
                              ) : (
                                activePrompt.prompt
                              )}
                            </div>
                            {(activePrompt.tier === "free" || isPremiumUnlocked) && (
                              <div className="flex items-center gap-3 mt-4">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    copyToClipboard(activePrompt.prompt);
                                  }}
                                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-semibold text-sm hover:bg-white/10 transition-colors"
                                >
                                  <Copy size={16} />
                                  <span>Copy</span>
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    copyToClipboard(activePrompt.prompt);
                                  }}
                                  className="flex-[2] flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white text-black font-bold text-sm hover:bg-neutral-200 transition-colors shadow-lg shadow-white/10"
                                >
                                  <Copy size={16} fill="black" />
                                  <span>Copy Prompt</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  );
                })()}
            </AnimatePresence>

            {/* Create Modal */}
            <AnimatePresence>
              {isCreating && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center px-4">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsCreating(false)}
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                  />
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="w-full max-w-lg bg-white/5 backdrop-blur-md border border-white/20 rounded-2xl p-8 relative z-10 shadow-2xl flex flex-col gap-4"
                  >
                    <h3 className="text-2xl font-bold text-white mb-2">Create New Prompt</h3>
                    <div>
                      <label className="text-xs font-bold text-neutral-500 uppercase block mb-1">Title</label>
                      <input
                        type="text"
                        value={newPromptData.title}
                        onChange={(e) => setNewPromptData({ ...newPromptData, title: e.target.value })}
                        className="w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-lg px-4 py-2 text-white focus:border-white/40 outline-none"
                        placeholder="e.g., Q4 Marketing Strategy"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-neutral-500 uppercase block mb-1">Domain</label>
                      <div className="flex gap-2">
                        {DOMAINS.map((d) => (
                          <button
                            key={d.key}
                            onClick={() => setNewPromptData({ ...newPromptData, domain: d.key })}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${newPromptData.domain === d.key ? `${d.color} bg-white/10 border-white/20` : "text-neutral-500 border-transparent hover:bg-white/5"}`}
                          >
                            {d.emoji} {d.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-neutral-500 uppercase block mb-1">Prompt Content</label>
                      <textarea
                        value={newPromptData.prompt}
                        onChange={(e) => setNewPromptData({ ...newPromptData, prompt: e.target.value })}
                        className="w-full h-32 bg-white/5 backdrop-blur-md border border-white/10 rounded-lg px-4 py-2 text-white focus:border-white/40 outline-none font-mono text-sm resize-none"
                        placeholder="Enter the detailed system prompt here..."
                      />
                    </div>
                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={() => setIsCreating(false)}
                        className="flex-1 py-3 rounded-xl border border-white/10 text-neutral-400 hover:text-white transition-colors font-bold text-sm"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleCreatePrompt}
                        className="flex-1 py-3 rounded-xl bg-white text-black font-bold text-sm hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2"
                      >
                        <Save size={16} />
                        Save to Library
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </motion.main>
        </div>
      )}
    </div>
  );
}

export default function PromptWorkspaceUnified() {
  return <PromptWorkspaceInner />;
}
