import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Zap, Palette, Code, BookOpen, Layers, Download } from "lucide-react";
import SEOHead from "@/components/SEOHead";

const Documentation = () => {
  return (
    <>
      <SEOHead pathname="/flow/documentation" overrides={{ title: "Documentation — Beymflow", description: "Learn how to build visual systems, animated backgrounds, and color environments with Beymflow." }} />
      <div className="min-h-screen bg-neutral-950 text-white">
        <header className="sticky top-0 z-50 flex items-center gap-4 px-6 md:px-10 h-16 border-b border-white/5 bg-neutral-950/80 backdrop-blur-xl">
          <Link to="/flow" className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors text-sm">
            <ArrowLeft size={16} />
            Back to Flow
          </Link>
          <h1 className="text-sm font-semibold tracking-wide">Documentation</h1>
        </header>

        <main className="max-w-2xl px-6 md:px-10 py-16 space-y-16">
          {/* Hero intro */}
          <section>
            <h2 className="text-2xl font-bold tracking-tight mb-3">Build visual systems that ship</h2>
            <p className="text-neutral-400 leading-relaxed">
              Beymflow is a creative engine for developers and designers who care about craft. Generate animated backgrounds, color palettes, gradient systems, and shader-based visuals — then export production-ready code.
            </p>
            <p className="text-neutral-400 leading-relaxed mt-3">
              No plugins. No boilerplate. Just beautiful output you can use immediately.
            </p>
          </section>

          {/* What you can build */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Layers size={16} className="text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold">What you can build</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { title: "Animated backgrounds", desc: "Shader-driven, GPU-accelerated hero sections and ambient visuals" },
                { title: "Color systems", desc: "Full palettes with semantic tokens, contrast ratios, and theme support" },
                { title: "Gradient environments", desc: "Multi-stop gradients with noise, glow, and blend modes" },
                { title: "UI color codes", desc: "HSL, HEX, RGB values with dark/light mode variants" },
                { title: "Visual identities", desc: "Cohesive color and motion systems for brands and products" },
                { title: "Prompt-driven visuals", desc: "Describe what you want — Beymflow generates the visual system" },
              ].map(({ title, desc }) => (
                <div key={title} className="bg-white/[0.03] border border-white/5 rounded-xl p-4 space-y-1">
                  <p className="text-sm font-medium text-neutral-200">{title}</p>
                  <p className="text-xs text-neutral-500">{desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Getting Started */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                <Zap size={16} className="text-cyan-400" />
              </div>
              <h3 className="text-lg font-semibold">Getting started</h3>
            </div>
            <ol className="text-sm text-neutral-400 space-y-4">
              <li className="flex gap-4 items-start">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-xs font-semibold text-neutral-300">1</span>
                <div>
                  <p className="text-neutral-200 font-medium">Open the Flow workspace</p>
                  <p className="text-neutral-500 mt-0.5">Navigate to <code className="text-xs bg-white/5 px-1.5 py-0.5 rounded">/flow</code> and choose Color Codes or Prompt Generator.</p>
                </div>
              </li>
              <li className="flex gap-4 items-start">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-xs font-semibold text-neutral-300">2</span>
                <div>
                  <p className="text-neutral-200 font-medium">Create or describe</p>
                  <p className="text-neutral-500 mt-0.5">Use the visual editor for hands-on control, or type a prompt to generate a visual system instantly.</p>
                </div>
              </li>
              <li className="flex gap-4 items-start">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-xs font-semibold text-neutral-300">3</span>
                <div>
                  <p className="text-neutral-200 font-medium">Refine and export</p>
                  <p className="text-neutral-500 mt-0.5">Tweak parameters, preview in real time, then export to your project.</p>
                </div>
              </li>
            </ol>
          </section>

          {/* Export Formats */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                <Download size={16} className="text-indigo-400" />
              </div>
              <h3 className="text-lg font-semibold">Export formats</h3>
            </div>
            <p className="text-neutral-400 leading-relaxed">
              Every visual you create can be exported in the format your project needs.
            </p>
            <div className="flex flex-wrap gap-2">
              {["React / JSX", "CSS", "Tailwind Config", "JSON Tokens", "PNG / SVG"].map((fmt) => (
                <span key={fmt} className="text-xs px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/5 text-neutral-300">
                  {fmt}
                </span>
              ))}
            </div>
          </section>

          {/* Resources */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <BookOpen size={16} className="text-amber-400" />
              </div>
              <h3 className="text-lg font-semibold">Guides and resources</h3>
            </div>
            <ul className="text-sm text-neutral-400 space-y-3">
              <li className="flex gap-3 items-start">
                <span className="text-white/60 mt-0.5">→</span>
                <span><strong className="text-neutral-200">Color Codes workspace</strong> — Deep dive into building and exporting color environments</span>
              </li>
              <li className="flex gap-3 items-start">
                <span className="text-white/60 mt-0.5">→</span>
                <span><strong className="text-neutral-200">Prompt Generator</strong> — Learn how to write effective prompts for visual generation</span>
              </li>
              <li className="flex gap-3 items-start">
                <span className="text-white/60 mt-0.5">→</span>
                <span><strong className="text-neutral-200">Shader backgrounds</strong> — Understanding and customizing GPU-accelerated visuals</span>
              </li>
              <li className="flex gap-3 items-start">
                <span className="text-white/60 mt-0.5">→</span>
                <span><strong className="text-neutral-200">Integration guides</strong> — Using Beymflow exports in React, Next.js, and Tailwind projects</span>
              </li>
            </ul>
          </section>
        </main>
      </div>
    </>
  );
};

export default Documentation;
