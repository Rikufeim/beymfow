import React, { useEffect, useRef, useState } from "react";

// --- TYPES ---
type InfoCard = {
  question: string;
  answer: string;
};

// --- DATA ---
const infoCards: InfoCard[] = [{
  question: "WHAT IS BEYMFLOW?",
  answer: "Beymflow is a creative AI platform designed to help you craft perfect prompts in seconds. Simply share your idea, whether it's a task, goal, or rough prompt, and our advanced prompt generators transform it into tailored AI instructions."
}, {
  question: "WHY BEYMFLOW?",
  answer: "AI + Web3 Synergy combines artificial intelligence with the next era of digital innovation. Smart analysis suggests the optimal structure and wording so your prompts return accurate, relevant answers every time."
}, {
  question: "HOW IT WORKS",
  answer: "Enter your idea, let our AI enhance and structure the prompt for clarity, then copy it directly into your favourite AI model for immediate results."
}, {
  question: "BEYOND PROMPTS",
  answer: "Beymflow isn't just about text prompts. Create stunning AI images, translate visuals into detailed prompts, and unlock creative workflows built for every medium."
}, {
  question: "ALWAYS EVOLVING",
  answer: "We continuously add new generators and tools to support your creativity. Join us on the frontier of AI creation and see how easy it is to Beymflow your potential."
}];

// --- COMPONENTS ---

// 1. FlowCard Component
const FlowCard = ({
  card,
  index,
  isActive
}: {
  card: InfoCard;
  index: number;
  isActive: boolean;
}) => {
  const isEven = index % 2 === 0;
  return <div className={`relative flex w-full items-center justify-center md:justify-between ${isEven ? "md:flex-row" : "md:flex-row-reverse"}`}>
      {/* Empty space for desktop layout balance */}
      <div className="hidden w-5/12 md:block" />

      {/* Center Timeline Node */}
      <div className="absolute left-1/2 z-20 flex -translate-x-1/2 transform items-center justify-center">
        <div className={`flex h-12 w-12 items-center justify-center rounded-full border-2 bg-black transition-all duration-500 ${isActive ? "border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.6)] scale-110" : "border-white/10 opacity-70"}`}>
          <span className={`text-sm font-bold transition-colors duration-500 ${isActive ? "text-cyan-300" : "text-gray-500"}`}>
            0{index + 1}
          </span>
        </div>
      </div>

      {/* Content Card */}
      <div className="group relative w-full md:w-5/12">
        <div className={`relative overflow-hidden rounded-3xl border p-8 text-left backdrop-blur-xl transition-all duration-500 ${isActive ? "border-cyan-500/30 bg-white/10 translate-y-0" : "border-white/10 bg-white/5 md:opacity-60"}`}>
          <div className="relative z-10 flex flex-col gap-4">
            <div className="flex items-center gap-4 border-b border-white/5 pb-4">
              {/* Mobile Index Indicator */}
              <span className="flex md:hidden h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/5 text-xs font-bold text-cyan-300 ring-1 ring-white/10">
                0{index + 1}
              </span>

              <h3 className={`text-lg font-bold uppercase tracking-widest transition-colors duration-300 ${isActive ? "text-white" : "text-gray-300"}`}>
                {card.question}
              </h3>
            </div>

            <p className="text-base leading-relaxed text-gray-300/90">{card.answer}</p>
          </div>
        </div>
      </div>
    </div>;
};

// 2. About Page Component
const About = ({
  onNavigateHome
}: {
  onNavigateHome: () => void;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Scroll Progress Logic
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const {
        top,
        height
      } = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Start drawing when the top of the section is somewhat visible (offset for visual appeal)
      const startOffset = windowHeight / 1.8;
      const dist = startOffset - top;
      let percentage = dist / height * 100;

      // Clamp between 0-100%
      percentage = Math.max(0, Math.min(100, percentage));
      requestAnimationFrame(() => {
        setScrollProgress(percentage);
      });
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial check

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  return <div className="relative min-h-screen bg-black text-white selection:bg-cyan-500/30 selection:text-cyan-100">
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center pt-20 pb-10">
          <div className="relative mb-8 z-10">
            <h1 className="relative text-6xl font-extrabold tracking-tighter sm:text-7xl md:text-9xl text-white drop-shadow-2xl">The future
in Flow<br />
              <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent pr-4 pb-2">
                in Flow
              </span>
            </h1>
          </div>

          <p className="max-w-2xl text-lg text-gray-400 sm:text-xl leading-relaxed z-10">Where ideas evolve.</p>
        </section>

        {/* Timeline Section */}
        <section className="relative px-4 py-12 sm:px-6 lg:px-8" ref={containerRef}>
          <div className="mx-auto max-w-6xl relative">
            {/* --- LINE CONTAINER --- */}
            {/* Muutos: bottom-64 (256px), jotta viiva loppuu suurinpiirtein viimeisen ympyrän kohdalle */}
            <div className="absolute left-1/2 top-0 bottom-64 hidden w-px -translate-x-1/2 md:block">
              {/* Background Line (Gray) */}
              <div className="h-full w-full bg-white/10" />

              {/* Active Progress Line (Gradient) */}
              <div className="absolute top-0 w-full bg-gradient-to-b from-cyan-400 via-blue-500 to-purple-600 shadow-[0_0_10px_rgba(34,211,238,0.8)] transition-[height] duration-75 ease-linear" style={{
              height: `${scrollProgress}%`
            }} />
            </div>

            <div className="flex flex-col gap-24 md:gap-32 pb-32 pt-10">
              {infoCards.map((card, index) => {
              // Calculate threshold for card activation
              const cardThreshold = index / (infoCards.length - 0.5) * 100;
              const isCardActive = scrollProgress > cardThreshold;
              return <FlowCard key={card.question} card={card} index={index} isActive={isCardActive} />;
            })}
            </div>
          </div>
        </section>

        {/* Footer CTA Area */}
        <section className="pt-0 pb-32 text-center relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-4xl font-bold mb-8 text-white">Find your flow.</h2>
            <button onClick={onNavigateHome} className="group relative inline-flex items-center justify-center px-8 py-4 font-semibold text-white bg-white/5 backdrop-blur-md border border-white/20 rounded-full hover:bg-white/10 hover:border-white/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-gray-900">
              <span className="relative flex items-center gap-2">
                Start creating
                <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </button>
          </div>
        </section>
      </div>
    </div>;
};

// 3. Main App Component (Handles Navigation State)
const App = () => {
  const [view, setView] = useState<"about" | "home">("about");

  // Simple view switching instead of Router
  if (view === "home") {
    return <div className="flex min-h-screen w-full flex-col items-center justify-center bg-black text-white p-4 text-center">
        <h1 className="mb-4 text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-600">
          Home Page
        </h1>
        <p className="mb-8 text-gray-400">This is a placeholder for the home page.</p>
        <button onClick={() => setView("about")} className="rounded-full border border-cyan-500/50 bg-cyan-500/10 px-8 py-3 text-cyan-300 hover:bg-cyan-500/20 transition-all">
          View About Page
        </button>
      </div>;
  }
  return <About onNavigateHome={() => setView("home")} />;
};
export default App;