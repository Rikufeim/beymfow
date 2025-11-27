export type PlatformKey = "chatgpt" | "midjourney";

export type PromptCategory = {
  emoji: string;
  title: string;
  prompts: number;
  slug: string;
  description: string;
};

export const PROMPT_CATEGORIES: Record<PlatformKey, PromptCategory[]> = {
  chatgpt: [
    {
      emoji: "🖼️",
      title: "Image Creation",
      prompts: 150,
      slug: "image-creation",
      description:
        "Craft detailed image prompts that help you visualize new product ideas, marketing concepts, and unique brand assets with precision.",
    },
    {
      emoji: "✍️",
      title: "Content Writing",
      prompts: 200,
      slug: "content-writing",
      description:
        "Unlock ready-made writing workflows for newsletters, blogs, email campaigns, and persuasive copy tailored to your business voice.",
    },
    {
      emoji: "💼",
      title: "Business Strategy",
      prompts: 180,
      slug: "business-strategy",
      description:
        "Design long-term growth roadmaps, launch playbooks, and market analyses that accelerate decision-making across your teams.",
    },
    {
      emoji: "🎨",
      title: "Creative Design",
      prompts: 120,
      slug: "creative-design",
      description:
        "Supercharge your creative sprints with prompts that generate moodboards, campaign visuals, and UI concepts in minutes.",
    },
    {
      emoji: "🔬",
      title: "Research & Analysis",
      prompts: 95,
      slug: "research-and-analysis",
      description:
        "Collect insights faster with prompts that summarize reports, compare competitors, and highlight emerging market signals.",
    },
    {
      emoji: "📊",
      title: "Data Visualization",
      prompts: 110,
      slug: "data-visualization",
      description:
        "Transform raw metrics into compelling charts, dashboards, and narratives that keep stakeholders aligned.",
    },
    {
      emoji: "🎯",
      title: "Marketing",
      prompts: 175,
      slug: "marketing",
      description:
        "Plan campaigns, refine messaging, and draft irresistible offers with prompts built for revenue-focused teams.",
    },
    {
      emoji: "🧠",
      title: "Personal Growth",
      prompts: 140,
      slug: "personal-growth",
      description:
        "Invest in leadership, productivity, and mindset upgrades through guided prompts that foster daily improvement.",
    },
    {
      emoji: "💰",
      title: "Finance & Crypto",
      prompts: 160,
      slug: "finance-and-crypto",
      description:
        "Explore investment theses, risk assessments, and treasury strategies while keeping compliance front and center.",
    },
  ],
  midjourney: [
    {
      emoji: "🎨",
      title: "Art & Design",
      prompts: 135,
      slug: "art-and-design",
      description:
        "Generate striking Midjourney compositions and art directions that bring your visual storytelling to life.",
    },
    {
      emoji: "💻",
      title: "Web Design",
      prompts: 120,
      slug: "web-design",
      description:
        "Prototype product pages, landing screens, and UI systems with Midjourney-ready prompts tailored for designers.",
    },
    {
      emoji: "📣",
      title: "Marketing",
      prompts: 150,
      slug: "marketing",
      description:
        "Experiment with campaign concepts, brand visuals, and ad creatives optimized for Midjourney workflows.",
    },
  ],
};

export const getCategoryBySlug = (
  platform: PlatformKey,
  slug: string | undefined
): PromptCategory | undefined => {
  if (!slug) return undefined;
  return PROMPT_CATEGORIES[platform]?.find((category) => category.slug === slug);
};

export const getValidPlatform = (platform: string | undefined): PlatformKey => {
  return platform === "midjourney" ? "midjourney" : "chatgpt";
};

export const getTotalPromptsForPlatform = (platform: PlatformKey) =>
  PROMPT_CATEGORIES[platform].reduce((total, category) => total + category.prompts, 0);
