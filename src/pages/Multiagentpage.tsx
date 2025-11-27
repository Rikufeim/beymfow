import { useEffect, useState } from "react";

type Mode = "Personal" | "Business" | "Crypto";
type PipelineStep = "idle" | "running" | "input_done" | "refined" | "created";

const CATEGORIES = [
  "Content Creation",
  "Marketing",
  "Design",
  "Business Strategy",
  "Social Media",
  "Image Creation",
  "Product Mockups",
];

const PROMPT_LAB_CATEGORY_CARDS = [
  {
    title: "Personal",
    description:
      "Daily productivity systems, learning workflows and growth prompts tailored to your life goals.",
    gradient: "from-purple-500/40 via-transparent to-transparent",
  },
  {
    title: "Business",
    description:
      "Marketing strategies, operations playbooks and growth prompts to scale your company faster.",
    gradient: "from-cyan-500/40 via-transparent to-transparent",
  },
  {
    title: "Crypto",
    description:
      "Market intelligence, investor updates and Web3 research prompts for the next frontier.",
    gradient: "from-amber-500/40 via-transparent to-transparent",
  },
];

export default function Multiagentpage() {
  const [mode, setMode] = useState<Mode>("Personal");
  const [categories, setCategories] = useState<string[]>([]);
  const [userGoal, setUserGoal] = useState("");
  const [context, setContext] = useState("");
  const [contextSuggestions, setContextSuggestions] = useState<string[]>([]);
  const [analyzingContext, setAnalyzingContext] = useState(false);
  const [timeframeDays, setTimeframeDays] = useState(7);
  const [expertTone, setExpertTone] = useState(true);
  const [optimizedPrompt, setOptimizedPrompt] = useState("");
  const [finalOutput, setFinalOutput] = useState("");
  const [pipelineStep, setPipelineStep] = useState<PipelineStep>("idle");
  const [progress, setProgress] = useState(0);

  const handleBack = () => {
    window.history.back();
  };

  useEffect(() => {
    console.log("useEffect triggered - userGoal:", userGoal.length, "chars");

    if (!userGoal || userGoal.length < 15) {
      setContextSuggestions([]);
      setAnalyzingContext(false);
      return;
    }

    setAnalyzingContext(true);

    const timer = window.setTimeout(() => {
      console.log("Smart analyzing context for goal:", userGoal.substring(0, 50));

      const goalLower = userGoal.toLowerCase();
      let suggestions: string[] = [];

      const hasNumbers = /\d+/.test(userGoal);
      const hasTimeframe = /\b(week|month|day|year)\b/i.test(userGoal);
      const isGrowth = /\b(grow|increase|scale|expand|boost)\b/i.test(goalLower);
      const isLearning = /\b(learn|study|master|understand|skill)\b/i.test(goalLower);
      const isCreating = /\b(create|make|develop|launch)\b/i.test(goalLower);
      const isRevenue = /\b(revenue|money|income|profit|sales|customers)\b/i.test(goalLower);

      let numberInGoal: string | null = null;
      const numberMatch = userGoal.match(/(\d+(?:,?\d+)*(?:k|K)?)/);
      if (numberMatch) {
        numberInGoal = numberMatch[1];
      }

      const isHabit = /\b(habit|routine|daily|morning|evening|consistent)\b/i.test(goalLower);
      const isPersonalWellness = /\b(meditation|meditate|mindful|yoga|journal|journaling|sleep|wake|read|reading|exercise|workout|fitness)\b/i.test(
        goalLower,
      );
      const isBuildingHabit = /\b(build|create|establish|develop|form|start).{0,30}(habit|routine|practice|daily)\b/i.test(
        goalLower,
      );

      if (isHabit || isPersonalWellness || isBuildingHabit) {
        const habitType = goalLower.includes("meditation") || goalLower.includes("meditate")
          ? "meditation"
          : goalLower.includes("exercise") || goalLower.includes("workout")
          ? "exercise"
          : goalLower.includes("reading") || (goalLower.includes("read") && goalLower.includes("book"))
          ? "reading"
          : goalLower.includes("yoga")
          ? "yoga"
          : goalLower.includes("journal")
          ? "journaling"
          : goalLower.includes("wake") || goalLower.includes("morning")
          ? "morning routine"
          : goalLower.includes("sleep")
          ? "sleep routine"
          : "healthy habit";

        if (hasNumbers && hasTimeframe && numberInGoal) {
          suggestions = [
            `Individual building ${habitType} practice, ${numberInGoal} ${goalLower.includes("minute") ? "minutes" : "days"} commitment, daily tracking`,
            `Professional integrating ${habitType} into busy schedule, early morning/evening blocks`,
            `Person focused on sustainable lifestyle change, ${habitType} as foundation for wellness`,
            `Self-improvement enthusiast using apps/journals, accountability partner, celebrating wins`,
          ];
        } else {
          suggestions = [
            `Individual committed to ${habitType}, tracking daily progress, long-term mindset`,
            `Busy professional making time for ${habitType}, structured approach, consistency first`,
            `Person on wellness journey, ${habitType} for mental/physical health benefits`,
            `Self-directed practitioner, ${habitType} as keystone habit, building momentum`,
          ];
        }
      } else if (
        (goalLower.includes("fitness") ||
          goalLower.includes("weight") ||
          goalLower.includes("health") ||
          goalLower.includes("lose") ||
          goalLower.includes("gain")) &&
        !isHabit
      ) {
        if (numberInGoal) {
          suggestions = [
            `Busy professional, 30-45 min daily workouts, goal: ${numberInGoal} ${goalLower.includes("lbs") || goalLower.includes("pounds") ? "lbs" : "kg"} change`,
            `Fitness beginner at home, tracking progress with apps, targeting ${numberInGoal} ${goalLower.includes("lbs") ? "lbs" : "kg"} in ${timeframeDays} days`,
            `Health-focused individual, balanced approach with diet + exercise, ${numberInGoal} target`,
            `Intermediate athlete, structured program, body recomp goal with accountability`,
          ];
        } else {
          suggestions = [
            "Beginner starting fitness journey from home, sustainable approach",
            "Busy professional fitting workouts around schedule (mornings/lunch)",
            "Health-conscious individual, holistic wellness focus",
            "Athlete training for performance, structured program",
          ];
        }
      } else if (
        goalLower.includes("social media") ||
        goalLower.includes("followers") ||
        goalLower.includes("instagram") ||
        goalLower.includes("tiktok") ||
        goalLower.includes("youtube")
      ) {
        const platform = goalLower.includes("instagram")
          ? "Instagram"
          : goalLower.includes("tiktok")
          ? "TikTok"
          : goalLower.includes("youtube")
          ? "YouTube"
          : "social media";

        if (numberInGoal) {
          const followerCount = parseInt(numberInGoal.replace(/k/i, "000"), 10);
          suggestions = [
            `Content creator posting daily on ${platform}, currently at ${Number.isNaN(followerCount) ? "?" : Math.floor(followerCount * 0.1)} followers`,
            `${mode} brand using ${platform} for audience building, budget $500-2k/month`,
            `Influencer in ${categories[0] || "lifestyle"} niche, engaging community actively`,
            `Professional/business establishing ${platform} presence, 3-5 posts weekly`,
          ];
        } else {
          suggestions = [
            `Content creator starting ${platform} journey, committed to daily posting`,
            `Small business using ${platform} for customer acquisition`,
            `Personal brand building authority in ${categories[0] || "your niche"}`,
            `${mode} professional networking and building thought leadership`,
          ];
        }
      } else if (isLearning || goalLower.includes("course") || goalLower.includes("certification")) {
        const skill = goalLower.match(/\b(python|javascript|design|marketing|sales|coding|programming|language|spanish|french|german)\b/i);
        const skillName = skill ? skill[0] : "new skill";

        if (hasTimeframe) {
          suggestions = [
            `Working professional dedicating 1-2 hours daily to master ${skillName}`,
            `Career-focused learner, taking ${skillName} course with ${timeframeDays}-day goal`,
            `Entrepreneur upskilling in ${skillName} for business advantage`,
            `Student/bootcamp participant, intensive learning mode (3-4 hrs/day)`,
          ];
        } else {
          suggestions = [
            `Self-directed learner, evenings/weekends, seeking ${skillName} mastery`,
            `Career changer transitioning to ${skillName}, committed to daily practice`,
            `Professional adding ${skillName} to toolkit, structured learning approach`,
            `Beginner starting ${skillName} journey, building strong foundation`,
          ];
        }
      } else if (
        goalLower.includes("business") ||
        goalLower.includes("startup") ||
        goalLower.includes("company") ||
        (goalLower.includes("launch") && isRevenue)
      ) {
        if (isRevenue && numberInGoal) {
          const revenueTarget = parseInt(numberInGoal.replace(/k/i, "000"), 10);
          suggestions = [
            `Solo founder/bootstrapper, current MRR $${Number.isNaN(revenueTarget) ? "?" : Math.floor(revenueTarget * 0.3)}, targeting $${numberInGoal}`,
            `Small team (2-5 people), B2B SaaS, seeking ${numberInGoal} in revenue`,
            `Service business scaling operations, ${numberInGoal} revenue target`,
            `E-commerce/product business, optimizing for ${numberInGoal} monthly sales`,
          ];
        } else if (goalLower.includes("customer") && numberInGoal) {
          const customerTarget = parseInt(numberInGoal.replace(/k/i, "000"), 10);
          suggestions = [
            `Early-stage startup with ${Number.isNaN(customerTarget) ? "?" : Math.floor(customerTarget * 0.2)} customers, targeting ${numberInGoal}`,
            `B2B SaaS targeting SMBs, currently validating product-market fit`,
            `Service/agency business, seeking ${numberInGoal} paying clients`,
            `Digital product/course creator building customer base to ${numberInGoal}`,
          ];
        } else {
          suggestions = [
            "Solo founder building MVP, bootstrapped, lean approach",
            "Small business (5-10 people) scaling operations efficiently",
            "Service business pivoting to productized offerings",
            "Agency/consultancy expanding service lines and team",
          ];
        }
      } else if (
        goalLower.includes("content") ||
        goalLower.includes("blog") ||
        goalLower.includes("write") ||
        goalLower.includes("article")
      ) {
        const contentType = goalLower.includes("video")
          ? "video content"
          : goalLower.includes("blog")
          ? "blog posts"
          : "content";

        if (numberInGoal) {
          suggestions = [
            `Content creator publishing ${contentType} ${numberInGoal}x per week, building audience`,
            `${mode} marketer creating ${contentType} for ${categories[0] || "brand"}, SEO focus`,
            `Thought leader producing ${numberInGoal} ${contentType}/week, LinkedIn/Medium`,
            `Creator monetizing ${contentType}, current audience 1-5k, growing`,
          ];
        } else {
          suggestions = [
            "Consistent content creator, daily/weekly publishing schedule",
            `${mode} professional building authority through ${contentType}`,
            "Creator starting content journey, committed to regular output",
            `Marketer developing content strategy for ${categories[0] || "brand growth"}`,
          ];
        }
      } else if (
        goalLower.includes("product") ||
        goalLower.includes("app") ||
        goalLower.includes("software") ||
        goalLower.includes("saas")
      ) {
        if (goalLower.includes("mvp") || goalLower.includes("prototype")) {
          suggestions = [
            "Solo founder building MVP, technical background, moving fast",
            "Product manager at startup, coordinating dev team, agile",
            "Technical founder, pre-launch phase, seeking first 100 users",
            "Indie hacker building in public, shipping weekly updates",
          ];
        } else {
          suggestions = [
            "Product team (3-5 people) at tech company, agile methodology",
            "Solo developer/designer building product nights/weekends",
            "Startup founder coordinating remote team, lean approach",
            "Product-led company optimizing features based on user data",
          ];
        }
      } else if (
        goalLower.includes("crypto") ||
        goalLower.includes("web3") ||
        goalLower.includes("blockchain") ||
        goalLower.includes("defi") ||
        goalLower.includes("nft")
      ) {
        const cryptoType = goalLower.includes("nft")
          ? "NFT"
          : goalLower.includes("defi")
          ? "DeFi"
          : goalLower.includes("trading")
          ? "trading"
          : "crypto";

        suggestions = [
          `${cryptoType} enthusiast, researching opportunities, risk-aware`,
          `Web3 builder/developer entering ${cryptoType} space`,
          `Investor/trader with ${cryptoType} focus, data-driven approach`,
          `Creator/entrepreneur exploring ${cryptoType} business models`,
        ];
      } else if (isRevenue || goalLower.includes("monetize") || goalLower.includes("passive income")) {
        if (numberInGoal) {
          const revenueTarget = parseInt(numberInGoal.replace(/k/i, "000"), 10);
          suggestions = [
            `Entrepreneur/freelancer scaling to $${numberInGoal}/month consistently`,
            `Creator monetizing audience, currently at $${Number.isNaN(revenueTarget) ? "?" : Math.floor(revenueTarget * 0.3)}/mo`,
            `Side hustler turning project into $${numberInGoal}/month income`,
            `Business owner optimizing revenue streams to hit $${numberInGoal}/mo`,
          ];
        } else {
          suggestions = [
            "Entrepreneur diversifying income streams, multiple revenue sources",
            "Freelancer/consultant scaling to consistent high income",
            "Creator monetizing content through sponsorships/products",
            "Business owner optimizing pricing and conversion funnels",
          ];
        }
      } else if (mode === "Personal") {
        suggestions = [
          `Individual with 1-2 hours daily, ${isGrowth ? "growth-focused" : "improvement-focused"}, tracking progress`,
          `Professional balancing ${goalLower.split(" ")[0] || "goals"} with life, structured approach`,
          `Self-motivated person, ${hasTimeframe ? "deadline-driven" : "consistent daily practice"}, measurable goals`,
          `Person committed to ${goalLower.split(" ").slice(0, 3).join(" ") || "personal development"}, long-term vision`,
        ];
      } else if (mode === "Business") {
        suggestions = [
          `${isCreating ? "Growing" : "Established"} business, ${isRevenue ? "revenue-focused" : "efficiency-focused"}, lean operations`,
          `Small team (2-5 people) working on ${goalLower.split(" ").slice(0, 3).join(" ") || "growth"}`,
          `Solo founder/entrepreneur, ${hasNumbers ? "quantitative goals" : "strategic focus"}, moving fast`,
          `${categories[0] || "Service"} business scaling ${isGrowth ? "aggressively" : "sustainably"}`,
        ];
      } else {
        suggestions = [
          `Crypto ${isLearning ? "learner" : "participant"} researching opportunities, educated approach`,
          `Web3 ${isCreating ? "builder" : "investor"} exploring decentralized tech`,
          `DeFi user optimizing ${isRevenue ? "yield strategies" : "portfolio"}`,
          `${isCreating ? "NFT creator" : "Crypto trader"} data-driven, risk-managed`,
        ];
      }

      console.log("Smart suggestions generated:", suggestions.length);
      setContextSuggestions(suggestions);
      setAnalyzingContext(false);
    }, 200);

    return () => window.clearTimeout(timer);
  }, [userGoal, mode, categories, timeframeDays]);

  const toggleCategory = (category: string) => {
    setCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    );
  };

  const quickExamples: Record<Mode, string[]> = {
    Personal: [
      "I want to build a daily meditation habit and meditate for 20 minutes every morning for 30 days",
      "I want to learn Spanish and be able to have basic conversations in 90 days",
      "I want to read 12 books this year and improve my knowledge in personal development",
      "I want to wake up at 6am consistently and create a powerful morning routine",
    ],
    Business: [
      "I want to grow my SaaS startup from $5k to $20k MRR in the next 6 months",
      "I want to launch my first digital product and get 100 paying customers in 60 days",
      "I want to scale my agency's revenue to $50k/month by landing 5 new enterprise clients",
      "I want to build my personal brand on LinkedIn and reach 10k followers in 3 months",
    ],
    Crypto: [
      "I want to learn blockchain development and build my first Web3 application in 90 days",
      "I want to research and create a diversified crypto portfolio strategy for long-term investing",
      "I want to understand DeFi protocols and start yield farming with proper risk management",
      "I want to launch an NFT collection and build a community of 1000+ holders",
    ],
  };

  const setQuickExample = (example: string) => {
    setUserGoal(example);
  };

  const handleGenerate = () => {
    console.log("Generate clicked! Goal length:", userGoal.length);

    if (userGoal.length < 15) {
      window.alert("Please describe what you want in more detail (min. 15 characters).");
      return;
    }

    console.log("Starting pipeline...");
    setPipelineStep("running");
    setProgress(0);
    setOptimizedPrompt("");
    setFinalOutput("");

    window.setTimeout(() => {
      console.log("Stage 1: Input Agent");
      setProgress(33);
      setPipelineStep("input_done");

      window.setTimeout(() => {
        console.log("Stage 2: Refine Agent");

        let prompt = "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
        prompt += "📝 " + mode.toUpperCase() + " PLAN GENERATION REQUEST\n";
        prompt += "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";
        prompt += "🎯 USER GOAL\n" + userGoal + "\n\n";

        if (context) {
          prompt += "👤 CONTEXT\n" + context + "\n\n";
        }

        prompt += "📋 REQUIREMENTS\n";
        prompt += "• Timeframe: " + timeframeDays + " days\n";
        prompt += "• Tone: " + (expertTone ? "Expert, professional" : "Casual, friendly") + "\n";
        prompt += "• Mode: " + mode + "\n";

        if (categories.length > 0) {
          prompt += "\n🎨 FOCUS\n" + categories.join(", ") + "\n";
        }

        setOptimizedPrompt(prompt);
        setProgress(66);
        setPipelineStep("refined");

        window.setTimeout(() => {
          console.log("Stage 3: Creator Agent");

          const phase1Days = Math.ceil(timeframeDays * 0.3);
          const phase2Days = Math.ceil(timeframeDays * 0.4);

          let output = mode === "Crypto" ? "⚠️ Educational content. Not financial advice.\n\n" : "";

          output += "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
          output += "📋 YOUR " + mode.toUpperCase() + " ACTION PLAN\n";
          output += "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";

          output += "🎯 GOAL\n" + userGoal + "\n\n";

          if (context) {
            output += "👤 YOUR PROFILE\n" + context + "\n\n";
          }

          output += "⏱️ TIMEFRAME: " + timeframeDays + " days\n";
          output += "📊 MODE: " + mode + "\n";
          if (categories.length > 0) {
            output += "🎨 FOCUS: " + categories.join(", ") + "\n";
          }
          output += "\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";

          output += "🌱 PHASE 1: FOUNDATION (Days 1-" + phase1Days + ")\n";
          output += "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";

          output += "📅 DAY 1 - Strategic Planning\n\n";
          output += "Morning:\n";
          output += "  ✅ Define 3 specific success metrics\n";
          output += "  ✅ Create progress tracking system\n";
          output += "  ✅ Block time in calendar\n\n";
          output += "Afternoon:\n";
          output += "  🔍 Research 3-5 successful case studies\n";
          output += "  📚 Identify top 3 tools/resources\n";
          output += "  💡 Document key learnings\n\n";
          output += "Evening:\n";
          output += "  🎯 Write your \"why\"\n";
          output += "  📝 Set up workspace\n";
          output += "  ✍️ Journal: Visualize success\n\n";

          for (let i = 2; i <= phase1Days; i += 1) {
            output += "📅 DAY " + i + " - Foundation Building\n";
            output += "  🔄 Build core skills\n";
            output += "  📝 Document learnings\n";
            output += "  🎯 Practice consistently\n\n";
          }

          output += "\n🚀 PHASE 2: EXECUTION (Days " + (phase1Days + 1) + "-" + (phase1Days + phase2Days) + ")\n";
          output += "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";

          for (let i = phase1Days + 1; i <= phase1Days + phase2Days; i += 1) {
            output += "📅 DAY " + i + " - Execute & Create\n";
            output += "  🎨 Create deliverable\n";
            output += "  📊 Track metrics\n";
            output += "  🔍 Analyze results\n\n";
          }

          output += "\n⚡ PHASE 3: OPTIMIZATION (Days " + (phase1Days + phase2Days + 1) + "-" + timeframeDays + ")\n";
          output += "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";

          for (let i = phase1Days + phase2Days + 1; i <= timeframeDays; i += 1) {
            if (i === timeframeDays) {
              output += "📅 DAY " + i + " - Final Day\n";
              output += "  🎯 Complete deliverables\n";
              output += "  📊 Results analysis\n";
              output += "  🎉 Celebrate!\n\n";
            } else {
              output += "📅 DAY " + i + " - Scale & Multiply\n";
              output += "  📈 2x successful tactics\n";
              output += "  🤖 Automate tasks\n\n";
            }
          }

          output += "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
          output += "🎯 SUCCESS FRAMEWORK\n";
          output += "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";

          output += "1️⃣ CONSISTENCY\n";
          output += "   Daily action beats intensity\n\n";

          output += "2️⃣ MEASUREMENT\n";
          output += "   Track 3 key metrics daily\n\n";

          output += "3️⃣ ITERATION\n";
          output += "   Try → Measure → Learn → Adjust\n\n";

          output += "4️⃣ ACCOUNTABILITY\n";
          output += "   Share progress publicly\n\n";

          output += "5️⃣ ENERGY\n";
          output += "   Schedule hard work at peak energy\n\n";

          output += "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
          output += "🚀 START NOW\n";
          output += "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";

          output += "✅ NEXT 5 MINUTES:\n";
          output += "  1. Copy this plan\n";
          output += "  2. Block calendar time\n";
          output += "  3. Tell someone\n\n";

          output += "✅ TODAY:\n";
          output += "  1. Set up tracking\n";
          output += "  2. Join 2 communities\n";
          output += "  3. Define metrics\n\n";

          if (expertTone) {
            output += "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
            output += "💡 EXPERT INSIGHTS\n";
            output += "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";
            output += "🎯 30-30-40 RULE\n";
            output += "   Foundation → Execution → Optimization\n\n";
            output += "📈 COMPOUND EFFECT\n";
            output += "   1% daily = 37x yearly\n\n";
          }

          output += "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
          output += "🎉 YOU'VE GOT THIS! GO EXECUTE. 🚀\n";
          output += "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";

          console.log("Output generated, length:", output.length);
          setFinalOutput(output);
          setProgress(100);
          setPipelineStep("created");
          window.alert("✅ Your plan is ready!");
        }, 1500);
      }, 1500);
    }, 1500);
  };

  const handleStartOver = () => {
    setOptimizedPrompt("");
    setFinalOutput("");
    setPipelineStep("idle");
    setProgress(0);
    setUserGoal("");
    setContext("");
    setContextSuggestions([]);
    setCategories([]);
    setTimeframeDays(7);
    setExpertTone(true);
  };

  const copyToClipboard = (text: string) => {
    void navigator.clipboard.writeText(text);
    window.alert("Copied!");
  };

  const getProgressLabel = () => {
    if (pipelineStep === "idle") return "Waiting";
    if (pipelineStep === "running") return "Input Agent ⏳";
    if (pipelineStep === "input_done") return "Input Agent ✅";
    if (pipelineStep === "refined") return "Refine Agent ✅";
    if (pipelineStep === "created") return "Creator Agent ✅";
    return "";
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-5xl mx-auto">
        <button
          type="button"
          onClick={handleBack}
          className="px-4 py-2 rounded-lg bg-white/5 border border-white/20 hover:bg-white/10 transition-all mb-8"
        >
          Back
        </button>
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <svg className="h-8 w-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
              />
            </svg>
            <h1 className="text-5xl font-bold">PromptLab</h1>
          </div>
          <p className="text-gray-400 text-lg">Multi-Agent Prompt Generator: Input → Refine → Creator</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3 mb-12">
          {PROMPT_LAB_CATEGORY_CARDS.map(({ title, description, gradient }) => (
            <div
              key={title}
              className="relative overflow-hidden rounded-lg border border-white/10 bg-white/5 backdrop-blur p-6"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-80`} />
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center mb-5">
                  {title === "Personal" && (
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  )}
                  {title === "Business" && (
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  )}
                  {title === "Crypto" && (
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  )}
                </div>
                <h3 className="text-xl font-semibold mb-2">{title}</h3>
                <p className="text-sm text-white/70 leading-relaxed">{description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gray-900/50 border border-white/10 rounded-lg p-6 mb-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Mode</label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as Mode)}
                className="w-full bg-gray-800 border border-white/10 rounded-md px-3 py-2 text-white"
              >
                <option value="Personal">Personal</option>
                <option value="Business">Business</option>
                <option value="Crypto">Crypto</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Categories</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleCategory(cat)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      categories.includes(cat)
                        ? "bg-cyan-500 text-white"
                        : "bg-white/10 text-white/70 hover:bg-white/20"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium">What do you want to achieve?</label>
                <button
                  type="button"
                  onClick={() => {
                    const examples = document.getElementById("quick-examples");
                    if (examples) {
                      examples.style.display = examples.style.display === "none" ? "block" : "none";
                    }
                  }}
                  className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
                >
                  <span role="img" aria-label="idea">
                    💡
                  </span>
                  <span>Quick Examples</span>
                </button>
              </div>

              <div
                id="quick-examples"
                style={{ display: "none" }}
                className="mb-3 p-3 bg-gray-800/50 rounded-lg border border-cyan-500/20"
              >
                <p className="text-xs text-gray-400 mb-2">💡 Click an example to use it as inspiration:</p>
                <div className="space-y-1.5">
                  {quickExamples[mode].map((example, index) => (
                    <button
                      key={example}
                      type="button"
                      onClick={() => {
                        setQuickExample(example);
                        const examples = document.getElementById("quick-examples");
                        if (examples) {
                          examples.style.display = "none";
                        }
                      }}
                      className="w-full text-left text-xs p-2 rounded bg-gray-700/50 hover:bg-cyan-500/10 hover:border-cyan-500/50 border border-transparent transition-all"
                    >
                      <span className="text-cyan-400 mr-1.5">→</span>
                      <span className="text-gray-300">{example}</span>
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                value={userGoal}
                onChange={(e) => setUserGoal(e.target.value)}
                placeholder="What do you want to achieve? Be as specific as possible. Click 'Quick Examples' for inspiration!"
                className="w-full bg-gray-800 border border-white/10 rounded-md px-3 py-2 text-white min-h-[100px]"
              />
              {analyzingContext && (
                <p className="text-xs text-cyan-400 mt-2 flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Context Agent analyzing your goal...
                </p>
              )}
              {!analyzingContext && contextSuggestions.length > 0 && (
                <p className="text-xs text-green-400 mt-2">
                  ✅ Agent understood: {userGoal.match(/\b(grow|learn|build|create|increase|launch|scale|improve)\b/i)?.[0] || "your goal"} — {contextSuggestions.length} contexts ready
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Context
                <span className="ml-2 text-xs text-cyan-400">🤖 AI-Powered Smart Agent</span>
              </label>

              {contextSuggestions.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-400">Smart suggestions based on your goal:</p>
                    <span className="text-xs text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded">
                      {contextSuggestions.length} matches
                    </span>
                  </div>
                  <div className="grid gap-2">
                    {contextSuggestions.map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => setContext(suggestion)}
                        className={`text-left p-3 rounded-lg border transition-all ${
                          context === suggestion
                            ? "border-cyan-500 bg-cyan-500/10 text-white shadow-lg shadow-cyan-500/20"
                            : "border-white/10 bg-gray-800/50 text-gray-300 hover:border-cyan-500/50 hover:bg-gray-800"
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <span className="text-cyan-400 text-lg flex-shrink-0 mt-0.5">
                            {context === suggestion ? "✅" : "💡"}
                          </span>
                          <span className="text-sm leading-relaxed">{suggestion}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="pt-2 border-t border-white/5">
                    <p className="text-xs text-gray-500 mb-2">💬 Or describe your own context:</p>
                    <textarea
                      value={context}
                      onChange={(e) => setContext(e.target.value)}
                      placeholder="Custom context (optional)..."
                      className="w-full bg-gray-800 border border-white/10 rounded-md px-3 py-2 text-white min-h-[60px] text-sm"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <textarea
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    placeholder="✍️ Describe your goal above (15+ chars) and I'll suggest perfect contexts for you..."
                    className="w-full bg-gray-800 border border-white/10 rounded-md px-3 py-2 text-white min-h-[80px]"
                    disabled={!userGoal || userGoal.length < 15}
                  />
                  {(!userGoal || userGoal.length < 15) && (
                    <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                      <span role="img" aria-label="lightbulb">
                        💡
                      </span>
                      <span>AI Agent will analyze your goal and suggest 4 perfect contexts automatically</span>
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Timeframe (days)</label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={timeframeDays}
                  onChange={(e) => setTimeframeDays(Number.parseInt(e.target.value, 10) || 7)}
                  className="w-full bg-gray-800 border border-white/10 rounded-md px-3 py-2 text-white"
                />
              </div>
              <div className="flex items-center space-x-2 pt-8">
                <input
                  type="checkbox"
                  id="expertTone"
                  checked={expertTone}
                  onChange={(e) => setExpertTone(e.target.checked)}
                  className="w-4 h-4"
                />
                <label htmlFor="expertTone" className="cursor-pointer text-sm">
                  Expert tone
                </label>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGenerate}
              disabled={pipelineStep === "running"}
              className="w-full bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-600 text-white font-medium py-3 px-4 rounded-md transition-colors"
            >
              {pipelineStep === "running" ? "Generating..." : "Generate"}
            </button>
          </div>
        </div>

        {pipelineStep !== "idle" && (
          <div className="bg-gray-900/50 border border-white/10 rounded-lg p-6 mb-8">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>{getProgressLabel()}</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div
                  className="bg-cyan-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {(optimizedPrompt || finalOutput) && (
          <div className="space-y-6">
            {optimizedPrompt && (
              <div className="bg-gray-900/50 border border-white/10 rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <label className="text-lg font-semibold">Optimized Prompt</label>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(optimizedPrompt)}
                    className="bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded-md text-sm"
                  >
                    Copy
                  </button>
                </div>
                <textarea
                  value={optimizedPrompt}
                  readOnly
                  className="w-full bg-gray-800 border border-white/10 rounded-md px-3 py-2 text-white min-h-[400px] font-mono text-sm"
                />
              </div>
            )}

            {finalOutput && (
              <div className="bg-gray-900/50 border border-white/10 rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <label className="text-lg font-semibold">Final Output</label>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(finalOutput)}
                    className="bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded-md text-sm"
                  >
                    Copy
                  </button>
                </div>
                <textarea
                  value={finalOutput}
                  readOnly
                  className="w-full bg-gray-800 border border-white/10 rounded-md px-3 py-2 text-white min-h-[600px] whitespace-pre-wrap"
                />
              </div>
            )}

            <button
              type="button"
              onClick={handleStartOver}
              className="w-full bg-white/10 hover:bg-white/20 text-white font-medium py-3 px-4 rounded-md"
            >
              🔄 Start Over
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

