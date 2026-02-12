import React, { useEffect, useRef, useState, MouseEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { GlassButton } from "@/components/ui/glass-button";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { cn } from "@/lib/utils";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { ChevronUp } from "lucide-react";

// --- TYPES ---
type InfoCard = {
  question: string;
  answer: string;
};

type FAQItem = {
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

// --- FAQ DATA ---
const faqItems: FAQItem[] = [
  {
    question: "What is lifetime access?",
    answer: "Lifetime access means you get unlimited access to all features and updates of Beymflow forever, with no recurring fees or subscriptions."
  },
  {
    question: "What happens when I buy lifetime access?",
    answer: "After purchasing lifetime access, you'll immediately gain access to all premium features, including all prompt generators, AI tools, and future updates. Your account will be upgraded automatically."
  },
  {
    question: "How to access code for templates and Component Blocks?",
    answer: "Once you have lifetime access, you can access all templates and component blocks through your dashboard. Simply navigate to the Templates section and download or copy the code for any template you need."
  },
  {
    question: "Do you offer refunds?",
    answer: "We offer a 30-day money-back guarantee. If you're not satisfied with your purchase, contact us within 30 days for a full refund."
  },
  {
    question: "I'm stuck, how do I get help?",
    answer: "We're here to help! You can reach out to us at contact@beymflow.com or use the support chat in your dashboard. Our team typically responds within 24 hours."
  }
];

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
    {/* 1. Base Layer: Dark Gray Text */}
    <span className="text-gray-800 transition-colors duration-300">in Flow</span>

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

        <p className="text-base leading-relaxed text-white/70">{card.answer}</p>
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
  return <div className="relative min-h-screen bg-transparent text-white selection:bg-cyan-500/30 selection:text-cyan-100">
    {/* Custom Background */}
    <div
      className="fixed inset-0 z-[-1]"
      style={{
        background: "radial-gradient(ellipse at 20% 80%, #00000040 0%, #00000018 20%, transparent 50%), radial-gradient(ellipse at 80% 20%, #000a9940 0%, #000a9918 20%, transparent 50%), radial-gradient(ellipse at 50% 50%, #00000025 0%, #00000010 30%, transparent 65%), radial-gradient(circle at 30% 30%, #00000025 0%, #00000010 15%, transparent 35%), radial-gradient(circle at 70% 70%, #000a9925 0%, #000a9910 15%, transparent 35%), #000000",
        filter: "brightness(0.75)",
      }}
    />
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

        <p className="max-w-2xl text-lg text-gray-400 sm:text-xl leading-relaxed z-10">Where ideas evolve.</p>
      </section>

      {/* Timeline Section */}
      <section className="relative px-4 py-12 sm:px-6 lg:px-8" ref={containerRef}>
        <div className="mx-auto max-w-6xl relative">
          {/* --- LINE CONTAINER --- */}
          <div className="absolute left-1/2 top-0 bottom-64 hidden w-px -translate-x-1/2 md:block">
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

      {/* FAQ Section */}
      <section className="pt-16 pb-32 px-4 sm:px-6 lg:px-8 relative">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              Frequently asked questions
            </h2>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              We are here to help you with any questions you may have. If you don't find what you need, please contact us at{" "}
              <a
                href="mailto:contact@beymflow.com"
                className="text-blue-400 hover:text-blue-300 transition-colors underline"
              >
                contact@beymflow.com
              </a>
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqItems.map((item, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border border-white/10 rounded-lg bg-white/5 px-6 data-[state=open]:bg-white/10 transition-colors"
              >
                <AccordionTrigger className="text-white hover:no-underline py-6 [&>svg]:hidden [&[data-state=open]_svg]:rotate-180">
                  <div className="flex items-center gap-4 w-full">
                    <ChevronUp className="h-5 w-5 shrink-0 text-white/70 transition-transform duration-200" />
                    <span className="text-left font-medium text-lg">{item.question}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-white/70 pb-6 pl-9 leading-relaxed">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </div>
  </div>;
};
export default About;