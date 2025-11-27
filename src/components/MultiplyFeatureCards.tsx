const MultiplyFeatureCards = () => {
  const features = [
    {
      title: "Prompt Lab",
      borderColor: "border-green-500",
      glowColor: "shadow-[0_0_40px_rgba(34,197,94,0.8),0_0_80px_rgba(34,197,94,0.4)]",
      hoverGlow: "hover:shadow-[0_0_50px_rgba(34,197,94,1),0_0_100px_rgba(34,197,94,0.5)]",
      innerGlow: "rgba(34, 197, 94, 0.15)",
      description: "Advanced AI-powered prompt generation and refinement tools for creative workflows",
      icon: "✨",
    },
    {
      title: "Optimize (Multiply Premium)",
      borderColor: "border-purple-500",
      glowColor: "shadow-[0_0_40px_rgba(168,85,247,0.8),0_0_80px_rgba(168,85,247,0.4)]",
      hoverGlow: "hover:shadow-[0_0_50px_rgba(168,85,247,1),0_0_100px_rgba(168,85,247,0.5)]",
      innerGlow: "rgba(168, 85, 247, 0.15)",
      description: "Discover and share premium prompts with the community marketplace",
      icon: "🛒",
    },
    {
      title: "Integration",
      borderColor: "border-cyan-500",
      glowColor: "shadow-[0_0_40px_rgba(6,182,212,0.8),0_0_80px_rgba(6,182,212,0.4)]",
      hoverGlow: "hover:shadow-[0_0_50px_rgba(6,182,212,1),0_0_100px_rgba(6,182,212,0.5)]",
      innerGlow: "rgba(6, 182, 212, 0.15)",
      description: "Seamlessly connect with your favorite AI platforms and automation tools",
      icon: "🔗",
    }
  ];

  return (
    <section className="py-12 sm:py-16 md:py-24 px-4 sm:px-6 md:px-8 lg:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <div key={feature.title} className="flex flex-col gap-3">
              {/* Small title above card */}
              <h3 className="text-sm font-medium text-white/70 pl-2">
                {feature.title}
              </h3>

              {/* Transparent card with fading bottom and colored inner glow from borders */}
              <div
                className={`group relative backdrop-blur-sm border-[2.5px] border-b-0 ${feature.borderColor} rounded-[32px] rounded-b-none p-8 min-h-[240px] overflow-visible transition-all duration-500 cursor-pointer
                  shadow-[0_0_0px_rgba(0,0,0,0)] hover:${feature.glowColor.replace('shadow-', '')}`}
                style={{
                  maskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)',
                  WebkitMaskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)'
                }}
              >
                {/* Colored inner glow from edges (no bottom) - appears on hover */}
                <div 
                  className="absolute inset-0 rounded-[32px] rounded-b-none pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: `
                      linear-gradient(to right, ${feature.innerGlow}, transparent 30%),
                      linear-gradient(to left, ${feature.innerGlow}, transparent 30%),
                      linear-gradient(to bottom, ${feature.innerGlow}, transparent 35%)
                    `
                  }}
                />
                
                {/* Content - fades in on hover */}
                <div className="relative z-10 flex flex-col gap-4 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
                  <div className="text-5xl">{feature.icon}</div>
                  <p className="text-white/80 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MultiplyFeatureCards;
