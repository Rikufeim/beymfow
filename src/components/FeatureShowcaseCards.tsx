import { Terminal, Cloud, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { cn } from "@/lib/utils";

const FeatureShowcaseCards = () => {
  const navigate = useNavigate();
  const cards = [
    {
      title: "Prompt Lab",
      description: "Generate ideas in the Lab.",
      icon: Terminal,
      visual: (
        <div className="relative w-full h-full flex items-center justify-center">
          <div className="bg-black/40 border border-green-500/30 rounded-2xl p-6 w-[80%]">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-green-400 text-sm font-mono">&gt;_</span>
              <span className="text-green-400/60 text-sm font-mono">generate prompt</span>
            </div>
            <div className="space-y-2">
              <div className="h-2 bg-green-500/20 rounded w-3/4"></div>
              <div className="h-2 bg-green-500/20 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      ),
      color: "green",
    },
    {
      title: "Optimize (Beymflow Premium)",
      description: "Optimize with Beymflow Premium.",
      icon: Sparkles,
      visual: (
        <div className="relative w-full h-full flex items-center justify-center">
          <div className="grid grid-cols-3 gap-3 w-[80%]">
            <div className="aspect-square bg-black/40 border border-purple-500/30 rounded-xl flex items-center justify-center">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-lg"></div>
            </div>
            <div className="aspect-square bg-black/40 border border-purple-500/30 rounded-xl flex items-center justify-center">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500/30 to-purple-500/30 rounded-lg"></div>
            </div>
            <div className="aspect-square bg-black/40 border border-purple-500/30 rounded-xl flex items-center justify-center">
              <div className="w-8 h-8 bg-gradient-to-br from-pink-500/30 to-purple-500/30 rounded-lg"></div>
            </div>
          </div>
        </div>
      ),
      color: "purple",
    },
    {
      title: "Integration",
      description: "Integrate into real workflows.",
      icon: Cloud,
      visual: (
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
          {/* Binary background */}
          <div className="absolute inset-0 flex flex-col items-center justify-center opacity-20 font-mono text-cyan-500/50 text-xs leading-tight overflow-hidden">
            {Array.from({ length: 15 }).map((_, i) => (
              <div key={i}>
                {Array.from({ length: 20 })
                  .map(() => Math.round(Math.random()))
                  .join("")}
              </div>
            ))}
          </div>
          
          {/* Center elements */}
          <div className="relative flex items-center gap-6">
            <div className="bg-black/60 border border-cyan-500/30 rounded-2xl p-4">
              <Terminal className="w-8 h-8 text-cyan-400" />
            </div>
            <div className="bg-black/60 border border-cyan-500/30 rounded-2xl p-4">
              <Cloud className="w-8 h-8 text-cyan-400" />
            </div>
          </div>
        </div>
      ),
      color: "cyan",
    },
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { border: string; glow: string; button: string }> = {
      green: {
        border: "border-green-500/20",
        glow: "group-hover:shadow-[0_0_30px_rgba(34,197,94,0.3)]",
        button: "bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30",
      },
      purple: {
        border: "border-purple-500/20",
        glow: "group-hover:shadow-[0_0_30px_rgba(168,85,247,0.3)]",
        button: "bg-purple-500/20 text-purple-400 border-purple-500/30 hover:bg-purple-500/30",
      },
      cyan: {
        border: "border-cyan-500/20",
        glow: "group-hover:shadow-[0_0_30px_rgba(6,182,212,0.3)]",
        button: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/30",
      },
    };
    return colors[color];
  };

  return (
    <section className="py-8 sm:py-12 md:py-16 lg:py-24 px-0">
      <div className="w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {cards.map((card) => {
            const colors = getColorClasses(card.color);
            return (
              <div key={card.title} className="flex flex-col gap-3">
                {/* Small title above card */}
                <h3 className="text-xs sm:text-sm font-medium text-white/70 pl-2">
                  {card.title}
                </h3>

                {/* Card */}
                <div className={cn("relative h-full rounded-2xl border border-white/10 p-[1px]")}>
                  <GlowingEffect spread={40} glow disabled={false} proximity={64} inactiveZone={0.01} borderWidth={2} className="opacity-70" />
                  <div
                    className={`group relative flex h-full flex-col justify-between rounded-[1.05rem] bg-gradient-to-br from-[#000000] via-[#050505] to-[#000000] overflow-hidden transition-all duration-500 ${colors.glow}`}
                  >
                  {/* Visual Content Area */}
                  <div className="aspect-[4/3] relative grayscale group-hover:grayscale-0 transition-all duration-500">
                    {card.visual}
                  </div>

                  {/* Bottom Action Bar */}
                  <div className="p-3 sm:p-4 border-t border-white/5 flex items-center justify-between gap-3 sm:gap-4">
                    <div className="relative flex-1">
                      <GlowingEffect 
                        spread={40} 
                        glow 
                        disabled={false} 
                        proximity={0} 
                        inactiveZone={1} 
                        borderWidth={2} 
                        className="opacity-30 rounded-xl" 
                      />
                      <button
                        className={`relative z-10 flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-transparent transition-all duration-500 font-medium text-xs sm:text-sm
                          bg-white/5 text-white/50
                          ${card.color === 'green' ? 'group-hover:bg-green-500/20 group-hover:text-green-400' : ''}
                          ${card.color === 'purple' ? 'group-hover:bg-purple-500/20 group-hover:text-purple-400' : ''}
                          ${card.color === 'cyan' ? 'group-hover:bg-cyan-500/20 group-hover:text-cyan-400' : ''}`}
                      >
                        <card.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span className="hidden xs:inline">{card.title}</span>
                      </button>
                    </div>
                    <div className="relative">
                      <GlowingEffect 
                        spread={40} 
                        glow 
                        disabled={false} 
                        proximity={0} 
                        inactiveZone={1} 
                        borderWidth={2} 
                        className="opacity-30 rounded-xl" 
                      />
                      <button 
                        onClick={() => navigate(`/features?active=${cards.findIndex(c => c.title === card.title)}`)}
                        className="relative z-10 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-transparent bg-white/5 text-white/50 hover:bg-white/10 hover:text-white transition-all duration-300 text-xs sm:text-sm font-medium"
                      >
                        Learn More
                      </button>
                    </div>
                  </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom tagline */}
        <div className="mt-8 sm:mt-10 lg:mt-12 text-left px-2">
          <p className="text-sm sm:text-base md:text-lg text-white/70 mb-1">
            Generate ideas in the Lab.
          </p>
          <p className="text-sm sm:text-base md:text-lg text-white/70 mb-1">
            Optimize with Beymflow Premium.
          </p>
          <p className="text-sm sm:text-base md:text-lg text-white/70 mb-1">
            Integrate into real workflows.
          </p>
          <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white/85 mt-3 sm:mt-4">
            Build. Optimize. Deploy.
          </p>
        </div>
      </div>
    </section>
  );
};

export default FeatureShowcaseCards;
