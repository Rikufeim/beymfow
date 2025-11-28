"use client";

import { QuickPromptGenerator } from "./QuickPromptGenerator";
export default function Hero() {
  return <section id="hero"
  className="relative mx-auto w-full pt-32 px-6 text-center md:px-8 
      min-h-screen overflow-hidden 
      bg-background flex flex-col items-center justify-start">

      {/* Otsikko */}
      <h1 className="animate-fade-in mx-auto max-w-6xl
        py-2 text-5xl font-bold leading-tight tracking-tighter 
        opacity-0 sm:text-6xl md:text-7xl lg:text-8xl" style={{
      animationDelay: "0.1s",
      animationFillMode: "forwards"
    }}>
        <span className="block text-foreground mb-2 md:mb-4 text-center mx-0 text-7xl py-px my-0 font-semibold pb-0">
          Make powerful prompts
        </span>
        <span className="block bg-gradient-to-r from-primary to-accent-foreground bg-clip-text text-transparent text-center text-7xl py-0 my-px pb-0 font-medium">with pure flow</span>
      </h1>

      {/* Teksti */}
      <p className="animate-fade-in mx-auto mt-6 max-w-2xl text-balance 
        text-lg tracking-tight text-muted-foreground 
        opacity-0 md:text-xl mb-12" style={{
      animationDelay: "0.2s",
      animationFillMode: "forwards"
    }}>
        Let your ideas move clean.
      </p>

      {/* PROMPT GENERATOR */}
      <div className="w-full max-w-4xl mx-auto relative z-20 animate-fade-in opacity-0" style={{
      animationDelay: "0.3s",
      animationFillMode: "forwards"
    }}>
        <QuickPromptGenerator />
      </div>

      {/* Bottom Fade / Glow effect */}
      <div className="absolute bottom-0 left-0 right-0 h-32 
        bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </section>;
}