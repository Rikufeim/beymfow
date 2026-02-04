import { memo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const Hero = memo(function Hero() {
  const navigate = useNavigate();

  const handleFlowClick = useCallback(() => {
    navigate("/flow-engine");
  }, [navigate]);

  return (
    <section className="relative w-full min-h-screen bg-background flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto w-full text-center">
        {/* Main Heading */}
        <h1 
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-8"
          style={{ fontFamily: "Outfit, sans-serif" }}
        >
          <span className="bg-gradient-to-r from-teal-400 to-purple-600 bg-clip-text text-transparent">
            Vibe coding
          </span>{" "}
          <span className="text-white">starts here</span>
        </h1>

        {/* CTA Button */}
        <button
          onClick={handleFlowClick}
          className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-black font-semibold text-base sm:text-lg transition-all duration-200 hover:bg-white/90 hover:scale-105 active:scale-100"
        >
          Go to Flow Engine
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </section>
  );
});

export default Hero;
