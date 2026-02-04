import { memo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const Hero = memo(function Hero() {
  const navigate = useNavigate();

  const handleFlowClick = useCallback(() => {
    navigate("/flow-engine");
  }, [navigate]);

  return (
    <section className="relative w-full min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background gradient */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: "radial-gradient(ellipse 140% 100% at 50% 50%, #00000035 0%, #00000020 15%, #00000060 40%, #00000030 60%, #4400ff 100%)",
          filter: "brightness(0.85)",
        }}
      />
      
      {/* Environment glow */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 80% 60% at 50% 100%, rgba(68, 0, 255, 0.15) 0%, transparent 60%)",
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto w-full text-center">
        {/* Main Heading */}
        <h1 
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6"
          style={{ fontFamily: "Outfit, sans-serif" }}
        >
          <span className="bg-gradient-to-r from-teal-400 to-purple-600 bg-clip-text text-transparent">
            Vibe coding
          </span>{" "}
          <span className="text-white">starts here</span>
        </h1>

        {/* CTA Button - smaller, black */}
        <button
          onClick={handleFlowClick}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-black text-white text-sm font-medium border border-white/20 transition-all duration-200 hover:bg-white/10 hover:border-white/30 active:scale-95"
        >
          Go to Flow Engine
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
});

export default Hero;
