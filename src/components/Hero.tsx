import { memo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Cover } from "./ui/cover";
import { useAuth } from "@/contexts/AuthContext";
import { usePrefetchRoute } from "@/hooks/usePrefetchRoute";
import { lovable } from "@/integrations/lovable/index";

const Hero = memo(function Hero() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { openAuthDialog } = useAuthDialog();

  const handleFlowClick = useCallback(() => {
    if (user) {
      navigate("/flow");
    } else {
      navigate("/auth?redirect=/flow");
    }
  }, [user, navigate]);

  const handleGoogleLogin = useCallback(async () => {
    if (user) {
      navigate("/flow");
      return;
    }
    const { error } = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (error) {
      console.error("Google sign-in error:", error);
    }
  }, [user, navigate]);
  return (
    <section className="relative w-full min-h-screen flex flex-col items-center justify-center px-6 md:px-10 overflow-hidden">
      <div className="relative z-10 max-w-4xl mr-auto w-full text-left flex flex-col items-start">
        {/* Main Heading */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight tracking-normal" style={{
          fontFamily: "Rubik, sans-serif"
        }}>
          <span className="bg-gradient-to-r from-teal-400 to-purple-600 bg-clip-text text-transparent">The world </span>
          <span className="text-white opacity-90">wants</span>
          <br />
          <Cover className="w-full block -mt-1.5 md:-mt-2">
            <span className="text-white my-0 mb-0 whitespace-nowrap opacity-90">
              to see your vision
            </span>
          </Cover>
        </h1>

        <p className="text-lg md:text-xl text-white/70 max-w-2xl mb-8 leading-relaxed">
          Create prompts in seconds, generate perfect color codes, and build stunning backgrounds and visual elements for websites, apps, and projects.     
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap gap-4">
          <button onClick={handleFlowClick} className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-black text-white text-sm font-medium border border-white/20 transition-all duration-200 hover:border-white active:scale-95">
            Go to Flow
            <ArrowRight className="w-4 h-4" />
          </button>

          <button onClick={handleGoogleLogin} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-black text-sm font-medium border border-transparent transition-all duration-200 hover:bg-gray-200 active:scale-95 shadow-lg shadow-white/5">
            <svg className="w-4 h-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Join with Google
          </button>
        </div>
      </div>
    </section>);

});
export default Hero;