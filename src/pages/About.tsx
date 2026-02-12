import React, { useEffect, useRef, useState, MouseEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { GlassButton } from "@/components/ui/glass-button";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { cn } from "@/lib/utils";
import BackgroundShader from "@/components/ui/background-shader";

// --- TYPES ---
type InfoCard = {
  question: string;
  answer: string;
};

// --- DATA ---
const infoCards: InfoCard[] = [{
  question: "WHAT IS BEYMFLOW?",
  answer: "Beymflow is a modern creative platform built for developers, vibe coders, and digital creators. It combines a powerful AI prompt generator, advanced color code generation (HEX, RGB, gradients), and tools for creating visually striking backgrounds and UI elements — all in one place.\n\nWhether you're building a landing page, SaaS product, portfolio, or full web application, Beymflow helps you generate production-ready creative assets in seconds."
}, {
  question: "WHY BEYMFLOW?",
  answer: "Beymflow helps you move faster without sacrificing creativity.\n\nDevelopers use it to speed up workflows, improve visual quality, and generate structured, high-performing AI prompts effortlessly.\n\nBy combining intelligent prompt engineering with modern design tools, Beymflow turns ideas into ready-to-use outputs — instantly and efficiently."
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

// 0. Spotlight Text Component (FINAL FIX: Prevents clipping by extending overlay box)
const SpotlightText = () => {
  const containerRef = useRef<HTMLSpanElement>(null);
  const [position, setPosition] = useState({
    x: 0,
    y: 0
  });
  const [opacity, setOpacity] = useState(0);
  const handleMouseMove = (e: MouseEvent<HTMLSpanElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setOpacity(1);
  };
  const handleMouseLeave = () => {
    setOpacity(0);
  };
  return <span ref={containerRef} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}
    // Lisätään whitespace-nowrap estämään rivitys
    className="relative inline-block cursor-default select-none whitespace-nowrap pr-8 pb-2">
    {/* 1. Base Layer: Transparent Text */}
    <span className="text-white/40 transition-colors duration-300">in Flow</span>

    {/* 2. Overlay Layer: Gradient Text with Dynamic Mask */}
    <span className="pointer-events-none absolute left-0 top-0 bg-gradient-to-r from-purple-500 via-cyan-400 to-purple-500 bg-clip-text text-transparent pr-4" // Lisätty pr-4 suoraan tähän
      style={{
        // Maski leikkaa elementin rajojen mukaan. Lisäämällä paddingia (pr-4 yllä)
        // laajennamme elementin rajoja, jolloin W-kirjain ei leikkaudu maskin reunasta.
        maskImage: `radial-gradient(250px circle at ${position.x}px ${position.y}px, black, transparent)`,
        WebkitMaskImage: `radial-gradient(250px circle at ${position.x}px ${position.y}px, black, transparent)`,
        opacity: opacity,
        transition: "opacity 0.3s ease"
      }}>
      in Flow
    </span>
  </span>;
};

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
      <div className={`flex h-12 w-12 cursor-default items-center justify-center rounded-full border-2 bg-black transition-all duration-300 ease-out hover:scale-110 hover:border-cyan-300 hover:brightness-125 ${isActive ? "border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.6)] scale-110" : "border-white/10 opacity-70 hover:opacity-100"}`}>
        <span className={`text-sm font-bold transition-colors duration-500 ${isActive ? "text-cyan-300" : "text-gray-500 group-hover:text-cyan-200"}`}>
          0{index + 1}
        </span>
      </div>
    </div>

    {/* Content without Card */}
    <div className="group relative w-full md:w-5/12">
      <div className="relative flex flex-col gap-4 p-8">
        <div className="flex items-center gap-4 border-b border-white/10 pb-4">
          {/* Mobile Index Indicator */}
          <span className="flex md:hidden h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/5 text-xs font-bold text-white ring-1 ring-white/10">
            0{index + 1}
          </span>

          <h3 className="text-lg font-semibold uppercase tracking-widest text-white">
            {card.question}
          </h3>
        </div>

        <p className="text-base leading-relaxed text-white/70 whitespace-pre-line">{card.answer}</p>
      </div>
    </div>
  </div>;
};

// 2. About Page Component
const About = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const navigate = useNavigate();
  const {
    user
  } = useAuth();
  const handleStartCreating = () => {
    if (user) {
      navigate("/");
    } else {
      navigate("/auth");
    }
  };

  // Scroll Progress Logic
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const {
        top,
        height
      } = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const startOffset = windowHeight / 1.8;
      const dist = startOffset - top;
      let percentage = dist / height * 100;
      percentage = Math.max(0, Math.min(100, percentage));
      requestAnimationFrame(() => {
        setScrollProgress(percentage);
      });
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  return <BackgroundShader>
    <div className="relative min-h-screen bg-transparent text-white selection:bg-cyan-500/30 selection:text-cyan-100">
      {/* Custom Styles for Animations */}
      <style>{`
        @keyframes border-shine {
          0% { background-position: 100% 0; }
          100% { background-position: -100% 0; }
        }
        .animate-border-shine {
          animation: border-shine 3s linear infinite;
        }
      `}</style>

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center pt-20 pb-10">
          <div className="relative mb-8 z-10">
            <h1 className="relative text-6xl font-extrabold tracking-tighter sm:text-7xl text-white drop-shadow-2xl md:text-7xl">
              The Future
              <br />
              {/* KÄYTETÄÄN PÄIVITETTYÄ SPOTLIGHT-KOMPONENTTIA */}
              <SpotlightText />
            </h1>
          </div>
        </section>

        {/* Timeline Section */}
        <section className="relative px-4 py-12 sm:px-6 lg:px-8" ref={containerRef}>
          <div className="mx-auto max-w-6xl relative">
            {/* --- LINE CONTAINER --- */}
            <div className="absolute left-1/2 top-0 bottom-64 hidden w-1 -translate-x-1/2 md:block">
              <div className="h-full w-full bg-white/10" />
              <div className="absolute top-0 w-full bg-gradient-to-b from-purple-500 via-cyan-400 to-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.5)] transition-[height] duration-75 ease-linear" style={{
                height: `${scrollProgress}%`
              }} />
            </div>

            <div className="flex flex-col gap-24 md:gap-32 pb-32 pt-10">
              {infoCards.map((card, index) => {
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
            <GlassButton onClick={handleStartCreating} size="lg">
              Start creating
            </GlassButton>
          </div>
        </section>

      </div>
    </div>
  </BackgroundShader>;
};
export default About;