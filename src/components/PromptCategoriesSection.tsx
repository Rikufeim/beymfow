import { useNavigate } from "react-router-dom";

import coolCharacter from "@/assets/cool-character-new.png";

const CATEGORY_CARDS = [
  {
    title: "Business",
    description:
      "Strategies, marketing, operations and growth prompts to scale your company.",
    emoji: "💼",
    prompts: 180,
    slug: "business-strategy",
    accent: "from-cyan-400/20 via-cyan-500/10 to-transparent",
  },
  {
    title: "Personal",
    description:
      "Self-improvement, productivity and personal development prompts for daily life.",
    emoji: "🧠",
    prompts: 140,
    slug: "personal-growth",
    accent: "from-rose-400/20 via-rose-500/10 to-transparent",
  },
  {
    title: "Crypto",
    description:
      "Market analysis, research and blockchain prompts for the web3 frontier.",
    emoji: "🪙",
    prompts: 160,
    slug: "finance-and-crypto",
    accent: "from-amber-400/20 via-amber-500/10 to-transparent",
  },
] as const;

export const PromptCategoriesSection = () => {
  const navigate = useNavigate();

  return (
    <section className="pb-12 sm:pb-16 md:pb-24 px-4 sm:px-6 md:px-8 lg:px-12">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black px-6 sm:px-10 md:px-12 lg:px-16 py-12 sm:py-16 md:py-20">
          <div
            className="absolute -top-24 -left-10 w-40 sm:w-52 h-40 sm:h-52 rounded-full bg-purple-500/30 blur-3xl"
            aria-hidden
          />
          <div className="relative z-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(220px,320px)] items-center">
            <div className="text-center lg:text-left space-y-5">
              <p className="text-xs sm:text-sm uppercase tracking-[0.4em] text-white/60 font-semibold">
                Prompt Library
              </p>
              <h3 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight">
                Premium AI Prompt Library
              </h3>
              <p className="text-sm sm:text-base md:text-lg text-white/70 max-w-xl mx-auto lg:mx-0">
                Precision-crafted prompts built to instantly enhance your workflow, output and creative flow.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
                <button
                  type="button"
                  onClick={() => navigate("/prompt-library/explore")}
                  className="inline-flex items-center justify-center px-6 sm:px-7 py-3 text-base font-semibold rounded-full border border-white/30 text-white/90 transition-all hover:-translate-y-0.5 hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60"
                >
                  Explore Prompts
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/settings/billing")}
                  className="inline-flex items-center justify-center px-6 sm:px-7 py-3 text-base font-semibold rounded-full border border-white/20 text-white hover:bg-white/10 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60"
                >
                  Unlock Full Bundle
                </button>
              </div>
            </div>
            <div className="mx-auto w-48 sm:w-60 md:w-64 lg:w-72 xl:w-80">
              <img
                src={coolCharacter}
                alt="Cool character with laptop"
                className="w-full h-auto drop-shadow-[0_20px_35px_rgba(0,0,0,0.4)]"
                loading="lazy"
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-white/80 uppercase tracking-[0.25em] mb-6 text-center">
            Categories
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {CATEGORY_CARDS.map((category) => (
              <button
                key={category.slug}
                type="button"
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 text-left transition-all hover:-translate-y-1 hover:border-white/20 hover:bg-white/10"
                onClick={() => navigate("/prompt-library/explore")}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    navigate("/prompt-library/explore");
                  }
                }}
              >
                <div
                  className={`absolute -top-10 right-0 h-32 w-32 bg-gradient-to-br ${category.accent} blur-2xl opacity-70 transition-opacity group-hover:opacity-90`}
                  aria-hidden
                />
                <div className="relative z-10 flex flex-col gap-4">
                  <div className="text-3xl">{category.emoji}</div>
                  <div>
                    <h4 className="text-lg font-semibold text-white">{category.title}</h4>
                    <p className="text-sm text-white/70 mt-2 leading-relaxed">
                      {category.description}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-white/60">
                    <span>{category.prompts} Prompts</span>
                    <span className="inline-flex items-center gap-2 transition-colors group-hover:text-white">
                      Explore
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PromptCategoriesSection;
