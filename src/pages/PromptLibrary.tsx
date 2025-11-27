import Layout from "@/components/Layout";

const CATEGORY_BUTTONS = [
  "Innovation & Growth",
  "Business Strategy",
  "Business Communications",
  "Business Management",
  "Analytics & Research",
  "Business Development",
  "Business Automation",
  "Risk Management",
  "Business Operations"
];

const LIBRARY_CATEGORIES = [
  {
    id: "business",
    label: "Business",
    description: "Strategies, marketing, operations and growth prompts to scale your company.",
    color: "from-cyan-400/20 via-cyan-500/10 to-transparent",
    icon: "💼"
  },
  {
    id: "personal",
    label: "Personal",
    description: "Self-improvement, productivity and personal development prompts for daily life.",
    color: "from-rose-400/20 via-rose-500/10 to-transparent",
    icon: "🧠"
  },
  {
    id: "crypto",
    label: "Crypto",
    description: "Market analysis, research and blockchain prompts for the web3 frontier.",
    color: "from-emerald-400/20 via-emerald-500/10 to-transparent",
    icon: "🪙"
  }
];

const PromptLibrary = () => {
  const placeholderCount = 479;

  return (
    <Layout>
      <main className="bg-black min-h-screen text-white pt-[140px] sm:pt-[160px] pb-20">
        <section className="px-4 sm:px-6 md:px-8 lg:px-12">
          <div className="max-w-5xl mx-auto text-center relative overflow-hidden rounded-3xl border border-white/10 bg-black px-6 sm:px-10 md:px-12 lg:px-16 py-12 sm:py-16 md:py-20">
            <div className="absolute -top-24 -left-10 w-40 sm:w-52 h-40 sm:h-52 rounded-full bg-purple-500/30 blur-3xl" aria-hidden />
            <div className="relative z-10 flex flex-col items-center gap-8">
              <div className="flex flex-col gap-3 text-center">
                <p className="text-xs sm:text-sm font-semibold tracking-[0.3em] uppercase text-white/60">Prompt Library</p>
                <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight">
                  {placeholderCount} ChatGPT Prompts for Business
                </h1>
                <p className="max-w-3xl text-base sm:text-lg text-white/70 mx-auto">
                  Explore curated prompt playbooks built for teams who want to move faster.
                  Search instantly and filter by the way you work.
                </p>
              </div>

              <div className="max-w-2xl mx-auto w-full">
                <label htmlFor="prompt-search" className="sr-only">
                  Search prompts
                </label>
                <div className="relative">
                  <input
                    id="prompt-search"
                    type="search"
                    placeholder="Search prompts..."
                    className="w-full rounded-full border border-white/15 bg-black/60 px-6 py-4 text-base shadow-[0_12px_30px_rgba(88,28,135,0.25)] backdrop-blur focus:border-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                  />
                  <div className="pointer-events-none absolute inset-y-0 right-6 flex items-center text-white/40">⌘K</div>
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-3">
                {CATEGORY_BUTTONS.map((label) => (
                  <button
                    key={label}
                    className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/70 transition-colors hover:border-white/30 hover:bg-white/10 hover:text-white"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-14 px-4 sm:px-6 md:px-8 lg:px-12">
          <div className="max-w-5xl mx-auto">
            <h3 className="text-xl font-semibold text-white/80 uppercase tracking-[0.25em] mb-6 text-center">Categories</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {LIBRARY_CATEGORIES.map((category) => (
                <div
                  key={category.id}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 transition-all hover:-translate-y-1 hover:border-white/20 hover:bg-white/10"
                >
                  <div
                    className={`absolute -top-10 right-0 h-32 w-32 bg-gradient-to-br ${category.color} blur-2xl opacity-70 transition-opacity group-hover:opacity-90`}
                    aria-hidden
                  />
                  <div className="relative z-10 flex flex-col gap-4">
                    <div className="text-3xl">{category.icon}</div>
                    <div>
                      <h4 className="text-lg font-semibold text-white">{category.label}</h4>
                      <p className="text-sm text-white/70 mt-2 leading-relaxed">{category.description}</p>
                    </div>
                    <button className="self-start rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white/70 transition-colors hover:border-white/40 hover:bg-white/15 hover:text-white">
                      Explore
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
};

export default PromptLibrary;
