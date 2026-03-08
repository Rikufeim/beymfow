import { memo, useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { buildBreadcrumbSchema, SITE_URL } from "@/lib/seo";

/* ── Section data ── */

interface CardItem {
  id: string;
  title: string;
  thumbnail?: string;
}

interface Section {
  id: string;
  title: string;
  viewAllHref?: string;
  cards: CardItem[];
  /** Optional featured block instead of carousel */
  featured?: {
    heading: string;
    description: string;
    cta: string;
    badges: { icon: string; label: string; sub: string }[];
  };
}

const SECTIONS: Section[] = [
  {
    id: "landing-pages",
    title: "Landing Pages",
    viewAllHref: "#",
    cards: [
      { id: "lp-1", title: "SaaS Landing" },
      { id: "lp-2", title: "Startup Hero" },
      { id: "lp-3", title: "Portfolio Minimal" },
      { id: "lp-4", title: "E-commerce Elite" },
    ],
  },
  {
    id: "ui-components",
    title: "UI Components",
    viewAllHref: "#",
    cards: [
      { id: "ui-1", title: "Audio Player" },
      { id: "ui-2", title: "Code Generator" },
      { id: "ui-3", title: "Chat Widget" },
      { id: "ui-4", title: "Gradient Card" },
    ],
  },
  {
    id: "agents-sdk",
    title: "Agents SDK",
    featured: {
      heading: "The fastest way to ship AI agents",
      description:
        "Built-in UI, chat history, spend limits, sandbox execution, and observability. Works with Claude and OpenAI.",
      cta: "Get started",
      badges: [
        { icon: "○", label: "E2B Sandboxes", sub: "Isolated VM per session" },
        { icon: "⚡", label: "Streaming", sub: "Token-by-token via SSE" },
        { icon: "$", label: "Auth & Limits", sub: "Tokens, rate limits, spend caps" },
        { icon: "◎", label: "Observability", sub: "Session replay & traces" },
      ],
    },
    cards: [],
  },
  {
    id: "templates",
    title: "Agent Templates",
    viewAllHref: "#",
    cards: [
      { id: "tmpl-1", title: "Chat Bot" },
      { id: "tmpl-2", title: "Terminal Agent" },
      { id: "tmpl-3", title: "Email Agent" },
      { id: "tmpl-4", title: "Doc Agent" },
    ],
  },
];

/* ── Horizontal carousel ── */

function Carousel({ cards }: { cards: CardItem[] }) {
  const ref = useRef<HTMLDivElement>(null);

  const scroll = (dir: number) => {
    ref.current?.scrollBy({ left: dir * 320, behavior: "smooth" });
  };

  return (
    <div className="relative group">
      {/* Left arrow */}
      <button
        onClick={() => scroll(-1)}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-foreground/10 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <ChevronLeft size={20} className="text-foreground" />
      </button>

      <div
        ref={ref}
        className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory px-1 py-1"
      >
        {cards.map((card) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="snap-start flex-shrink-0 w-[300px] aspect-video rounded-xl border border-border bg-card overflow-hidden flex items-center justify-center cursor-pointer hover:border-primary/40 transition-colors"
          >
            <span className="text-muted-foreground text-sm tracking-wider uppercase">
              Coming Soon
            </span>
          </motion.div>
        ))}
      </div>

      {/* Right arrow */}
      <button
        onClick={() => scroll(1)}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-foreground/10 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <ChevronRight size={20} className="text-foreground" />
      </button>
    </div>
  );
}

/* ── Featured block (Agents SDK style) ── */

function FeaturedBlock({ data }: { data: NonNullable<Section["featured"]> }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-8 flex flex-col lg:flex-row gap-8 items-start">
      <div className="flex-1 space-y-4">
        <h3 className="text-lg font-bold text-foreground">{data.heading}</h3>
        <p className="text-muted-foreground text-sm leading-relaxed max-w-lg">
          {data.description}
        </p>
        <div className="flex gap-3 pt-2">
          <button className="px-5 py-2 rounded-lg bg-foreground text-background text-sm font-medium flex items-center gap-2 hover:opacity-90 transition-opacity">
            {data.cta} <ArrowRight size={14} />
          </button>
          <button className="px-5 py-2 rounded-lg border border-border text-foreground text-sm font-medium hover:bg-accent transition-colors">
            Documentation
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 flex-shrink-0">
        {data.badges.map((b) => (
          <div
            key={b.label}
            className="rounded-xl border border-border px-5 py-4 min-w-[180px]"
          >
            <span className="text-muted-foreground text-xs">{b.icon}</span>
            <p className="text-foreground text-sm font-semibold mt-1">{b.label}</p>
            <p className="text-muted-foreground text-xs">{b.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Page ── */

const LandingPageLibrary = memo(function LandingPageLibrary() {
  return (
    <div className="min-h-screen bg-background text-foreground pt-8 pb-20">
      <SEOHead
        pathname="/landing-pages"
        schemas={[
          buildBreadcrumbSchema([
            { name: "Beymflow", url: `${SITE_URL}/` },
            { name: "Landing Pages", url: `${SITE_URL}/landing-pages` },
          ]),
        ]}
      />

      <div className="max-w-[1400px] mx-auto px-6 space-y-12">
        {SECTIONS.map((section) => (
          <section key={section.id} className="space-y-5">
            {/* Section header */}
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-sm font-semibold text-foreground tracking-wide">
                {section.title}
              </h2>
              {section.viewAllHref && (
                <a
                  href={section.viewAllHref}
                  className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                >
                  View all <ChevronRight size={14} />
                </a>
              )}
            </div>

            {/* Content */}
            {section.featured ? (
              <FeaturedBlock data={section.featured} />
            ) : (
              <Carousel cards={section.cards} />
            )}
          </section>
        ))}
      </div>
    </div>
  );
});

export default LandingPageLibrary;
