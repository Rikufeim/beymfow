import { memo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Cover } from "./ui/cover";

const Hero = memo(function Hero() {
  const navigate = useNavigate();
  const handleFlowClick = useCallback(() => {
    navigate("/flow-engine");
  }, [navigate]);

  const handleAccessClick = useCallback(() => {
    navigate("/premium");
  }, [navigate]);
  return (
    <section className="relative w-full min-h-screen flex flex-col items-center justify-center px-6 md:px-10 overflow-hidden">
      <div className="relative z-10 max-w-4xl mr-auto w-full text-left flex flex-col items-start">
        {/* Main Heading */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight" style={{
          fontFamily: "Rubik, sans-serif"
        }}>
          <span className="bg-gradient-to-r from-teal-400 to-purple-600 bg-clip-text text-transparent">The world </span>
          <span className="text-white opacity-90">wants</span>
          <br />
          <Cover className="w-full block -mt-1 md:-mt-3">
            <span className="text-white my-0 mb-0 whitespace-nowrap opacity-90">
              to see your vision
            </span>
          </Cover>
        </h1>

        <p className="text-lg md:text-xl text-white/70 max-w-2xl mb-8 leading-relaxed">
          Create prompts in seconds, generate perfect color codes, and build stunning backgrounds and visual elements for websites, apps, and projects — without the unnecessary hassle.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap gap-4">
          <button onClick={handleFlowClick} className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-black text-white text-sm font-medium border border-white/20 transition-all duration-200 hover:bg-white/10 hover:border-white/30 active:scale-95">
            Go to Flow Engine
            <ArrowRight className="w-4 h-4" />
          </button>

          <button onClick={handleAccessClick} className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-white text-black text-sm font-medium border border-transparent transition-all duration-200 hover:bg-gray-200 active:scale-95 shadow-lg shadow-white/5">
            Get All-Access
          </button>
        </div>
      </div>
    </section>
  );
});
export default Hero;