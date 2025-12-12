"use client";

import { QuickPromptGenerator } from "./QuickPromptGenerator";
import { PromptSidebar } from "@/components/ui/prompt-sidebar";
import heroWallpaper from "@/assets/hero-wallpaper.png";

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative mx-auto w-full min-h-screen px-6 md:px-8 overflow-hidden flex flex-col items-center justify-center pt-20 pb-16 text-center"
      style={{
        backgroundImage: `url(${heroWallpaper})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center 70%',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="relative z-10 w-full flex flex-col items-center gap-6">
        {/* Otsikko */}
        <h1
          className="animate-fade-in mx-auto max-w-6xl py-2 text-5xl font-bold leading-tight tracking-tighter opacity-0 sm:text-6xl md:text-7xl lg:text-8xl overflow-visible"
          style={{
            animationDelay: "0.1s",
            animationFillMode: "forwards",
          }}
        >
          <span className="block text-white/85 mb-2 md:mb-4 text-center mx-0 text-7xl py-px my-0 font-semibold pb-0">
            <span className="whitespace-nowrap" style={{ fontFamily: "Outfit, sans-serif" }}>
              Make powerful
            </span>
          </span>
          <span className="block bg-gradient-to-r from-teal-400 to-purple-600 bg-clip-text text-transparent text-center text-7xl py-2 my-px pb-2 font-medium">
            <span className="whitespace-nowrap">prompts with pure flow</span>
          </span>
        </h1>

        {/* Teksti */}
        <p
          className="animate-fade-in mx-auto mt-4 max-w-2xl text-balance text-lg tracking-tight text-gray-400 opacity-0 md:text-xl mb-8"
          style={{
            animationDelay: "0.2s",
            animationFillMode: "forwards",
          }}
        >
          Let your ideas move clean.
        </p>

        {/* PROMPT GENERATOR */}
        <div
          className="w-full max-w-4xl mx-auto relative z-20 animate-fade-in opacity-0"
          style={{
            animationDelay: "0.3s",
            animationFillMode: "forwards",
          }}
        >
          <QuickPromptGenerator />
        </div>

        {/* PROMPT CARDS BANNER - Below QuickPromptGenerator */}
        <div
          className="w-full max-w-7xl mx-auto relative z-20 animate-fade-in opacity-0 mt-8"
          style={{
            animationDelay: "0.4s",
            animationFillMode: "forwards",
          }}
        >
          <PromptSidebar />
        </div>
      </div>
    </section>
  );
}