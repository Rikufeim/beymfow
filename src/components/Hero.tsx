import { memo, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Loader2 } from "lucide-react";
import { Cover } from "./ui/cover";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/contexts/AuthContext";

const GoogleIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const Hero = memo(function Hero() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleFlowClick = useCallback(() => {
    if (user) {
      // User is logged in, go directly to Flow
      navigate("/flow");
    } else {
      // User is not logged in, redirect to auth with intended destination
      sessionStorage.setItem('auth_redirect_after', '/flow');
      navigate("/auth");
    }
  }, [navigate, user]);

  const handleGoogleSignIn = useCallback(async () => {
    // If already logged in, go directly to flow
    if (user) {
      navigate("/flow");
      return;
    }

    setGoogleLoading(true);
    try {
      // Set redirect destination after Google auth
      sessionStorage.setItem('auth_redirect_after', '/flow');
      
      await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
    } catch {
      setGoogleLoading(false);
    }
  }, [navigate, user]);

  return (
    <section className="relative w-full min-h-[100svh] flex flex-col items-center justify-center px-4 sm:px-6 md:px-10 overflow-hidden">
      <div className="relative z-10 max-w-4xl mr-auto w-full text-left flex flex-col items-start">
        <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 sm:mb-6 leading-tight tracking-normal" style={{
          fontFamily: "Rubik, sans-serif"
        }}>
          <span className="bg-gradient-to-r from-teal-400 to-purple-600 bg-clip-text text-transparent">The world </span>
          <span className="text-white opacity-90">wants</span>
          <br />
          <Cover className="w-full block -mt-1 sm:-mt-1.5 md:-mt-2">
            <span className="text-white my-0 mb-0 whitespace-nowrap opacity-90">
              to see your vision
            </span>
          </Cover>
        </h1>

        <p className="text-lg md:text-xl text-white/70 max-w-2xl mb-8 leading-relaxed">
          Create prompts in seconds, generate perfect color codes, and build stunning backgrounds and visual elements for websites, apps, and projects.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          {/* Primary CTA - Go to Flow (requires login) */}
          <button 
            onClick={handleFlowClick}
            disabled={loading}
            className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full bg-white text-black text-sm font-medium transition-all duration-200 hover:bg-white/90 active:scale-95 disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                Go to Flow
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Secondary CTA - Google Sign In (Account-based onboarding) */}
          <button 
            onClick={handleGoogleSignIn}
            disabled={googleLoading || loading}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-black/50 text-white text-sm font-medium border border-white/20 backdrop-blur-sm transition-all duration-200 hover:bg-black/70 hover:border-white/40 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {googleLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <GoogleIcon />
                {user ? "Go to Workspace" : "Continue with Google"}
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
});

export default Hero;
