import React from "react";
import { Link } from "react-router-dom";
import { Sparkles, User, Briefcase, Coins, Zap, Target } from "lucide-react";

/**
 * PromptLabFlowDiagram
 *
 * A Flowise-style process illustration for the Prompt Lab landing page.
 * Nodes with icons connected by lines that flow through them.
 *
 * Layout: Assistant → [Creativity | Personal | Business | Crypto] → LAB → Optimize
 */
export default function PromptLabFlowDiagram() {
  const nodeBase = "group relative flex items-center gap-3 px-6 py-4 rounded-2xl bg-black/80 text-zinc-100 border border-white/10 shadow-lg backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl";
  const nodeGlow = "hover:border-violet-500/50 hover:shadow-[0_0_30px_rgba(139,92,246,0.3)]";
  const nodeGlowYellow = "hover:border-yellow-500/50 hover:shadow-[0_0_30px_rgba(234,179,8,0.3)]";
  return <section className="w-full max-w-7xl mx-auto px-4 md:px-6 py-12">
      {/* Header + CTA */}
      <div className="text-center mb-12 md:mb-16">
        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-zinc-100">
          Prompt Lab — Your AI Workspace
        </h2>
        <p className="mt-3 md:mt-4 text-zinc-400 max-w-2xl mx-auto">
          A simple flow that shows how ideas move through the Lab. Start with
          the Assistant, branch into specialized labs, and finish by optimizing your result.
        </p>
        <Link to="/prompt-lab-page" className="inline-flex mt-6 items-center gap-2 rounded-xl px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 border border-zinc-700">
          Start Building
          <Zap className="w-4 h-4" />
        </Link>
      </div>

      {/* Flow Canvas */}
      <div className="relative mx-auto w-full overflow-x-auto pb-8">
        <div className="relative min-w-[900px] h-[500px]">
          {/* SVG for connection lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{
          zIndex: 0
        }}>
            <defs>
              <marker id="arrowhead-purple" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                <polygon points="0 0, 10 3, 0 6" fill="rgba(139, 92, 246, 0.8)" />
              </marker>
              <marker id="arrowhead-yellow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                <polygon points="0 0, 10 3, 0 6" fill="rgba(234, 179, 8, 0.8)" />
              </marker>
            </defs>

            {/* Assistant to Categories */}
            <line x1="200" y1="250" x2="320" y2="100" stroke="rgba(139, 92, 246, 0.6)" strokeWidth="2" markerEnd="url(#arrowhead-purple)" />
            <line x1="200" y1="250" x2="320" y2="180" stroke="rgba(139, 92, 246, 0.6)" strokeWidth="2" markerEnd="url(#arrowhead-purple)" />
            <line x1="200" y1="250" x2="320" y2="320" stroke="rgba(139, 92, 246, 0.6)" strokeWidth="2" markerEnd="url(#arrowhead-purple)" />
            <line x1="200" y1="250" x2="320" y2="400" stroke="rgba(139, 92, 246, 0.6)" strokeWidth="2" markerEnd="url(#arrowhead-purple)" />

            {/* Categories to LAB */}
            <line x1="530" y1="100" x2="620" y2="250" stroke="rgba(139, 92, 246, 0.6)" strokeWidth="2" markerEnd="url(#arrowhead-purple)" />
            <line x1="530" y1="180" x2="620" y2="250" stroke="rgba(139, 92, 246, 0.6)" strokeWidth="2" markerEnd="url(#arrowhead-purple)" />
            <line x1="530" y1="320" x2="620" y2="250" stroke="rgba(139, 92, 246, 0.6)" strokeWidth="2" markerEnd="url(#arrowhead-purple)" />
            <line x1="530" y1="400" x2="620" y2="250" stroke="rgba(139, 92, 246, 0.6)" strokeWidth="2" markerEnd="url(#arrowhead-purple)" />

            {/* LAB to Optimize */}
            <line x1="760" y1="250" x2="880" y2="250" stroke="rgba(234, 179, 8, 0.7)" strokeWidth="2.5" markerEnd="url(#arrowhead-yellow)" />
          </svg>

          {/* Nodes */}
          <div className="absolute" style={{
          left: '50px',
          top: '220px'
        }}>
            <div className={`${nodeBase} ${nodeGlow}`}>
              <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-violet-400" />
              </div>
              <span className="text-sm font-semibold tracking-wide">ASSISTANT</span>
            </div>
          </div>

          {/* Category Nodes */}
          <div className="absolute" style={{
          left: '320px',
          top: '70px'
        }}>
            <div className={`${nodeBase} ${nodeGlow}`}>
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-cyan-400" />
              </div>
              <span className="text-sm font-medium">Creativity</span>
            </div>
          </div>

          <div className="absolute" style={{
          left: '320px',
          top: '150px'
        }}>
            <div className={`${nodeBase} ${nodeGlow}`}>
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <User className="w-5 h-5 text-blue-400" />
              </div>
              <span className="text-sm font-medium">Personal</span>
            </div>
          </div>

          <div className="absolute" style={{
          left: '320px',
          top: '290px'
        }}>
            <div className={`${nodeBase} ${nodeGlow}`}>
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-purple-400" />
              </div>
              <span className="text-sm font-medium">Business</span>
            </div>
          </div>

          <div className="absolute" style={{
          left: '320px',
          top: '370px'
        }}>
            <div className={`${nodeBase} ${nodeGlow}`}>
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <Coins className="w-5 h-5 text-amber-400" />
              </div>
              <span className="text-sm font-medium">Crypto</span>
            </div>
          </div>

          {/* LAB Node */}
          <div className="absolute" style={{
          left: '620px',
          top: '220px'
        }}>
            <div className={`${nodeBase} ${nodeGlowYellow}`}>
              <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                <Zap className="w-5 h-5 text-yellow-400" />
              </div>
              <span className="text-sm font-semibold tracking-wide">LAB</span>
            </div>
          </div>

          {/* Optimize Node */}
          <div className="absolute" style={{
          left: '880px',
          top: '220px'
        }}>
            <div className={`${nodeBase} ${nodeGlowYellow}`}>
              <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                <Target className="w-5 h-5 text-yellow-400" />
              </div>
              <span className="text-sm font-semibold tracking-wide">OPTIMIZE</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mini legend */}
      
    </section>;
}