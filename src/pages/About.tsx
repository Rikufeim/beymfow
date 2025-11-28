import React from "react";
import { useNavigate } from "react-router-dom";

type InfoCard = {
  question: string;
  answer: string;
};

const infoCards: InfoCard[] = [
  {
    question: "WHAT IS BEYMFLOW?",
    answer:
      "Beymflow is a creative AI platform designed to help you craft perfect prompts in seconds. Simply share your idea, whether it's a task, goal, or rough prompt, and our advanced prompt generators transform it into tailored AI instructions.",
  },
  {
    question: "WHY BEYMFLOW?",
    answer:
      "AI + Web3 Synergy combines artificial intelligence with the next era of digital innovation. Smart analysis suggests the optimal structure and wording so your prompts return accurate, relevant answers every time.",
  },
  {
    question: "HOW IT WORKS",
    answer:
      "Enter your idea, let our AI enhance and structure the prompt for clarity, then copy it directly into your favourite AI model for immediate results.",
  },
  {
    question: "BEYOND PROMPTS",
    answer:
      "Beymflow isn't just about text prompts. Create stunning AI images, translate visuals into detailed prompts, and unlock creative workflows built for every medium.",
  },
  {
    question: "ALWAYS EVOLVING",
    answer:
      "We continuously add new generators and tools to support your creativity. Join us on the frontier of AI creation and see how easy it is to Beymflow your potential.",
  },
];

// Erotetaan kortti omaksi komponentikseen
const FlowCard = ({ card, index }: { card: InfoCard; index: number }) => {
  const isEven = index % 2 === 0;

  return (
    <div
      className={`relative flex w-full items-center justify-center md:justify-between ${isEven ? "md:flex-row" : "md:flex-row-reverse"}`}
    >
      {/* Tyhjä tila toisella puolella desktopissa tasapainottamaan layoutia */}
      <div className="hidden w-5/12 md:block" />

      {/* Keskiviivan pallo (Timeline node) - GLOW POISTETTU, NYT YKSINKERTAINEN */}
      <div className="absolute left-1/2 z-20 hidden h-4 w-4 -translate-x-1/2 transform items-center justify-center rounded-full border border-cyan-500 bg-black md:flex">
        <div className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
      </div>

      {/* Itse kortti */}
      <div className="group relative w-full md:w-5/12">
        {/* Kortin container - GLOW BLOBIT POISTETTU SISÄLTÄ */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 text-left backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-white/20">
          <div className="relative z-10 flex flex-col gap-4">
            <div className="flex items-center gap-4 border-b border-white/5 pb-4">
              {/* Numero pallura */}
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/5 text-sm font-bold text-cyan-300 ring-1 ring-white/10 backdrop-blur-md">
                0{index + 1}
              </span>
              {/* Otsikko */}
              <h3 className="text-lg font-bold uppercase tracking-widest text-white">{card.question}</h3>
            </div>

            {/* Leipäteksti */}
            <p className="text-base leading-relaxed text-gray-300/90">{card.answer}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen bg-black text-white selection:bg-cyan-500/30 selection:text-cyan-100">

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center pt-20">
          {/* GLOW POISTETTU TAUSTALTA */}

          <div className="relative mb-8 z-10">
            <h1 className="relative text-6xl font-extrabold tracking-tighter sm:text-7xl md:text-9xl text-white drop-shadow-2xl">
              The Future
              <br />
              {/* pr-4 (padding-right) estää w-kirjaimen leikkautumisen */}
              <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent pr-4 pb-2">
                in Flow
              </span>
            </h1>
          </div>

          <p className="max-w-2xl text-lg text-gray-400 sm:text-xl leading-relaxed z-10">
            Where ideas evolve into systems and systems{" "}
            <span className="text-white font-semibold border-b border-cyan-500/50 pb-0.5">Beymflow</span> results.
          </p>

          {/* SCROLL TEKSTI JA ANIMAATIO POISTETTU TÄSTÄ */}
        </section>

        {/* Timeline Section */}
        <section className="relative px-4 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            {/* Keskiviiva */}
            <div className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-white/10 to-transparent md:block" />

            <div className="flex flex-col gap-24 md:gap-32 pb-32">
              {infoCards.map((card, index) => (
                <FlowCard key={card.question} card={card} index={index} />
              ))}
            </div>
          </div>
        </section>

        {/* Footer CTA Area */}
        <section className="py-32 text-center relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-4xl font-bold mb-8 text-white">Ready to find your flow?</h2>
            <button
              onClick={() => navigate("/")}
              className="group relative inline-flex items-center justify-center px-8 py-4 font-semibold text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-gray-900"
            >
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 transition-all duration-200 group-hover:scale-105 opacity-100" />
              <span className="relative flex items-center gap-2">
                Launch Beymflow
                <svg
                  className="w-5 h-5 transition-transform group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;
