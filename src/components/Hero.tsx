"use client";

import { QuickPromptGenerator } from "./QuickPromptGenerator";
import { PromptSidebar } from "@/components/ui/prompt-sidebar";
import heroWallpaper from "@/assets/hero-wallpaper.png";
import heroWallpaperMobile from "@/assets/hero-wallpaper-mobile.png";

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative mx-auto w-full min-h-screen px-6 md:px-8 overflow-visible flex flex-col items-center justify-center pt-20 pb-16 text-center bg-black"
    >
      {/* Mobile background */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-[center_30%] bg-no-repeat md:hidden"
        style={{
          backgroundImage: `url(${heroWallpaperMobile})`,
        }}
      />
      {/* Desktop background */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-no-repeat hidden md:block md:bg-[center_35%] lg:bg-[center_20%]"
        style={{
          backgroundImage: `url(${heroWallpaper})`,
        }}
      />
      {/* Top gradient fade to black */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black to-transparent z-[1]" />
      
      <div className="relative z-10 w-full flex flex-col items-center gap-6">
        {/* Otsikko */}
        <h1
          className="animate-fade-in mx-auto max-w-6xl text-5xl font-bold leading-none tracking-tight opacity-0 sm:text-6xl md:text-7xl lg:text-8xl"
          style={{
            animationDelay: "0.1s",
            animationFillMode: "forwards",
          }}
        >
          <span className="block text-white/90 text-center text-5xl sm:text-6xl md:text-7xl font-semibold" style={{ fontFamily: "Outfit, sans-serif" }}>
            Make powerful
          </span>
          <span className="block bg-gradient-to-r from-teal-400 to-purple-600 bg-clip-text text-transparent text-center text-5xl sm:text-6xl md:text-7xl font-medium mt-1 pb-2">
            prompts with pure flow
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