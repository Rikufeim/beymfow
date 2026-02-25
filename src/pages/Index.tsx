import Layout from "@/components/Layout";
import Hero from "@/components/Hero";
import { useNavigate } from "react-router-dom";
import { useImagePreloader } from "@/hooks/useImagePreloader";
import { GlowingEffectDemo } from "@/components/ui/glowing-effect-demo";
import { FlowFeaturesSection } from "@/components/FlowFeaturesSection";

import { GlowingEffect } from "@/components/ui/glowing-effect";
import { GlassButton } from "@/components/ui/glass-button";
import { cn } from "@/lib/utils";
import { Pen, Cpu, Share2, Target, FileText, Layers, Zap, Lightbulb, CheckCircle, ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthDialog } from "@/contexts/AuthDialogContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState, useMemo, useCallback, useEffect, useRef } from "react";

import ColorWorkspaceDemo from "@/components/demo/ColorWorkspaceDemo";
import BackgroundShader from "@/components/ui/background-shader";
import { GradientButton } from "@/components/ui/gradient-button";
import { HeroBackground } from "@/components/ui/hero-background";
import Products from "@/components/Products";
import SEOHead from "@/components/SEOHead";
import { buildOrganizationSchema, buildWebSiteSchema, buildWebApplicationSchema, buildBreadcrumbSchema, SITE_URL } from "@/lib/seo";


const Index = () => {
  const navigate = useNavigate();
  const { user, session, usageInfo } = useAuth();
  const { openAuthDialog } = useAuthDialog();
  const { toast } = useToast();
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const isPro = usageInfo?.subscriptionTier === "premium";
  const pendingCheckoutRef = useRef(false);

  // Auto-trigger checkout after login if pending
  useEffect(() => {
    if (user && session && sessionStorage.getItem('pending_checkout') === 'true' && !pendingCheckoutRef.current) {
      pendingCheckoutRef.current = true;
      sessionStorage.removeItem('pending_checkout');
      (async () => {
        setCheckoutLoading(true);
        try {
          const { data, error } = await supabase.functions.invoke("create-checkout", {
            body: { tier: "pro" },
            headers: { Authorization: `Bearer ${session.access_token}` }
          });
          if (error) throw error;
          if (data?.error) throw new Error(data.error);
          if (data?.url) {
            window.location.href = data.url;
          }
        } catch (err: any) {
          toast({
            title: "Error",
            description: err.message || "Failed to start checkout",
            variant: "destructive"
          });
        } finally {
          setCheckoutLoading(false);
          pendingCheckoutRef.current = false;
        }
      })();
    }
  }, [user, session, toast]);

  const handleStartFree = useCallback(() => {
    if (user) {
      navigate("/flow");
    } else {
      // Store redirect so OAuth flow also lands here
      sessionStorage.setItem('auth_redirect_after', '/flow');
      openAuthDialog(() => navigate("/flow"));
    }
  }, [user, navigate, openAuthDialog]);

  const handleUpgradeToPro = useCallback(async () => {
    if (!user || !session) {
      sessionStorage.setItem('pending_checkout', 'true');
      openAuthDialog();
      return;
    }
    if (isPro) {
      navigate("/flow");
      return;
    }
    setCheckoutLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { tier: "pro" },
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to start checkout",
        variant: "destructive"
      });
    } finally {
      setCheckoutLoading(false);
    }
  }, [user, session, isPro, navigate, openAuthDialog, toast]);

  // Preload all homepage images for instant loading
  // Memoize to prevent re-creation on every render
  const homepageImages = useMemo(() => [
    // Products section card backgrounds
    "/lovable-uploads/45481b23-2d43-4186-a282-479adb37456b.png",
    // CRYPTO GUIDES
    "/lovable-uploads/65f7d709-a319-4bd3-ae8b-fb7acfb196db.png" // PROMPTS
  ], []);
  useImagePreloader({
    images: homepageImages
  });

  return (
    <Layout>
      <SEOHead
        pathname="/"
        schemas={[
          buildOrganizationSchema(),
          buildWebSiteSchema(),
          buildWebApplicationSchema(),
          buildBreadcrumbSchema([
            { name: "Beymflow", url: `${SITE_URL}/` },
          ]),
        ]}
      />
      <BackgroundShader>
        {/* Hero Section */}
        <div className="relative">
          <Hero />
        </div>

        {/* Content after Hero */}
        <div className="relative">

          {/* Creative Tools Section */}
          <section className="py-24 sm:py-32 px-6 md:px-10 lg:px-16 w-full">
            <div className="w-full">
              <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-12 tracking-tight max-w-[90vw]">
                Creative tools for <span className="text-white/60">modern developers</span>
              </h2>
              <div className="grid md:grid-cols-2 gap-10 lg:gap-20 text-lg sm:text-xl text-white/70 leading-relaxed">
                <p>
                  Beymflow is a modern creative platform built for developers, vibe coders, and digital creators who design websites, apps, and interactive experiences. The platform combines a powerful prompt generator for AI tools, advanced color code generation (HEX, RGB, gradients), and tools for creating visually striking website backgrounds and UI elements.
                </p>
                <p>
                  Developers use Beymflow to speed up their workflow, improve visual quality, and generate production-ready design assets in seconds. Whether you're building a landing page, SaaS product, portfolio, or full-scale web application, Beymflow helps you move faster — without sacrificing creativity.
                </p>
              </div>
              {/* Start Building showcase */}
              <div className="mt-16 sm:mt-20 md:mt-24 grid gap-10 md:grid-cols-2 items-center max-w-6xl">
                <div className="space-y-6 bg-black/40 backdrop-blur-sm border border-white/10 rounded-3xl p-8 md:p-10">
                  <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-white tracking-tight">
                    Start Building
                  </h2>
                  <p className="text-white/65 max-w-xl">
                    Create impressive backgrounds for websites, apps, or anything — quickly.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={handleStartFree}
                      className="rounded-full px-5 py-2 border border-white/10 bg-white/[0.03] text-white/80 transition-all duration-200 hover:border-white/20 hover:text-white hover:bg-white/[0.06] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40">
                      Start your flow
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <div
                    className="pointer-events-none absolute inset-0 rounded-3xl opacity-45 z-0"
                    style={{
                      backgroundImage:
                        "linear-gradient(to right, rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.12) 1px, transparent 1px)",
                      backgroundSize: "80px 80px, 80px 80px",
                      backgroundRepeat: "repeat, repeat",
                      backgroundPosition: "0 0, 0 0"
                    }} />
                  <div className="relative z-10">
                    <ColorWorkspaceDemo className="min-h-[280px]" />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Video carousels moved to Hero component */}

          {/* Flow Features Section */}
          <div className="">
            <FlowFeaturesSection className="py-16 sm:py-20 md:py-24 lg:py-32" />
          </div>

          {/* Beymflow Premium highlight */}


          {/* Feature Showcase Cards */}

          {/* Prompt CTA Section */}


          {/* Engineered for Flow Section */}
          <section className="px-4 sm:px-6 lg:px-8 xl:px-12 py-16 sm:py-20 md:py-24 lg:py-32">
            <div className="max-w-7xl mx-auto">
              <GlowingEffectDemo />
            </div>
          </section>


          {/* Prompt Lab Section */}


          {/* How It Works Section */}
          <section className="py-16 sm:py-20 md:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 xl:px-12">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-10 sm:mb-12 lg:mb-16">
                <div className="inline-block relative bg-black/40 backdrop-blur-sm border border-white/10 rounded-3xl p-8 md:p-10 max-w-4xl mx-auto">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 px-4 text-white">
                    Create Perfect AI Prompts <span className="text-white/60">in Seconds</span>
                  </h2>
                  <p className="text-sm sm:text-base md:text-lg text-white/60 px-4 max-w-3xl mx-auto">
                    Follow these simple steps to create optimized prompts for AI models in seconds
                  </p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                {[{
                  icon: <Pen className="h-4 w-4 text-cyan-300" />,
                  title: "Enter Your Idea",
                  description: "Simply input your task, goal, or a simple prompt. Our tool works with any type of input to create custom AI instructions."
                }, {
                  icon: <Cpu className="h-4 w-4 text-cyan-300" />,
                  title: "AI-Powered Enhancements",
                  description: "Our AI analyzes your input and generates a comprehensive, optimized prompt tailored for various AI models."
                }, {
                  icon: <Share2 className="h-4 w-4 text-purple-300" />,
                  title: "Usage and Refinement",
                  description: "You can instantly view the generated prompt. Copy and paste it directly into ChatGPT, Claude, Gemini, or any other AI model."
                }].map((item, idx) => <div key={idx} className="min-h-[11rem]">
                  <div className={cn("relative h-full rounded-2xl border border-white/10 p-[1px]")} style={{ transform: 'translateZ(0)', willChange: 'transform' }}>
                    <GlowingEffect spread={40} glow disabled={false} proximity={64} inactiveZone={0.01} borderWidth={2} className="opacity-70" />
                    <div className="relative flex h-full flex-col justify-between gap-4 rounded-[1.05rem] bg-gradient-to-br from-[#000000] via-[#050505] to-[#000000] p-5 sm:p-6 md:p-8 overflow-hidden will-change-transform" style={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden' }}>
                      <div className="relative z-10 flex flex-col justify-between gap-4 h-full">
                        <div className="flex flex-col gap-3">
                          <div className="w-fit rounded-lg border border-white/10 bg-white/5 p-2">
                            {item.icon}
                          </div>
                          <div className="space-y-2">
                            <h3 className="text-base sm:text-lg md:text-xl font-semibold tracking-tight text-white">
                              {item.title}
                            </h3>
                            <p className="text-xs sm:text-sm leading-relaxed text-white/70 md:text-lg">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>)}
              </div>
            </div>
          </section>

          {/* Essential Steps Section */}
          <section className="py-16 sm:py-20 md:py-24 lg:py-32 px-4 sm:px-6 md:px-8 lg:px-12">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12 sm:mb-16">
                <div className="inline-block relative bg-black/40 backdrop-blur-sm border border-white/10 rounded-3xl p-8 md:p-10 max-w-4xl mx-auto">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 px-4">
                    Essential Steps for Writing AI Prompts
                  </h2>
                  <p className="text-sm sm:text-base md:text-lg text-muted-foreground px-4">
                    Follow these proven steps to create effective AI prompts
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[{
                  number: "01",
                  icon: <Target className="h-4 w-4 text-cyan-300" />,
                  title: "Define Clear Objectives",
                  description: "Start with a clear goal and specific requirements for your prompt"
                }, {
                  number: "02",
                  icon: <FileText className="h-4 w-4 text-cyan-300" />,
                  title: "Provide Context",
                  description: "Include relevant background information and specific details"
                }, {
                  number: "03",
                  icon: <Layers className="h-4 w-4 text-purple-300" />,
                  title: "Structure Your Prompt",
                  description: "Organize information logically with clear sections and formatting"
                }, {
                  number: "04",
                  icon: <Zap className="h-4 w-4 text-purple-300" />,
                  title: "Refine and Test",
                  description: "Iterate and improve your prompt based on the results"
                }].map((item, idx) => <div key={idx} className="min-h-[11rem]">
                  <div className={cn("relative h-full rounded-2xl border border-white/10 p-[1px]")} style={{ transform: 'translateZ(0)', willChange: 'transform' }}>
                    <GlowingEffect spread={40} glow disabled={false} proximity={64} inactiveZone={0.01} borderWidth={2} className="opacity-70" />
                    <div className="relative flex h-full flex-col justify-between gap-4 rounded-[1.05rem] bg-gradient-to-br from-[#000000] via-[#050505] to-[#000000] p-5 sm:p-6 md:p-8 overflow-hidden will-change-transform" style={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden' }}>
                      <div className="relative z-10 flex flex-col justify-between gap-4 h-full">
                        <div className="flex flex-col gap-3">
                          <div className="flex items-center justify-between">
                            <div className="text-4xl font-bold text-gray-400">{item.number}</div>
                            <div className="w-fit rounded-lg border border-white/10 bg-white/5 p-2">
                              {item.icon}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <h3 className="text-lg md:text-xl font-semibold tracking-tight text-white/85">
                              {item.title}
                            </h3>
                            <p className="text-xs leading-relaxed text-white/70 md:text-lg">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>)}
              </div>
            </div>
          </section>

          {/* Pricing Section */}
          <section className="py-16 sm:py-20 md:py-24 lg:py-32 px-4 sm:px-6 md:px-8 lg:px-12">
            <div className="max-w-6xl mx-auto">
              <div className="grid lg:grid-cols-5 gap-10 lg:gap-12 items-center">
                {/* Left: Headline & Subheadline */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-3xl p-6 md:p-8 w-fit">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight">
                      Pricing
                    </h2>
                    <p className="text-sm sm:text-base md:text-lg text-white/70 mt-2">
                      Upgrade when you need full creative flow
                    </p>
                  </div>
                </div>

                {/* Right: Two black pricing cards */}
                <div className="lg:col-span-3 grid sm:grid-cols-2 gap-6">
                  {/* Free Plan Card */}
                  <div className="relative flex flex-col rounded-2xl border border-white/10 bg-black/90 backdrop-blur-sm p-6 sm:p-8">
                    <h3 className="text-xl font-semibold text-white mb-1">Free Plan</h3>
                    <div className="mb-6">
                      <span className="text-3xl font-bold text-white">€0</span>
                      <span className="text-white/60"> / month</span>
                    </div>
                    <ul className="space-y-3 flex-1 mb-6">
                      {[
                        "Basic prompt generation",
                        "Limited daily prompts",
                        "Access to selected templates",
                        "Standard background styles",
                        "Community support"].
                        map((feature, i) =>
                          <li key={i} className="flex items-center gap-2 text-sm text-white/80">
                            <CheckCircle className="h-4 w-4 text-cyan-400 shrink-0" />
                            {feature}
                          </li>
                        )}
                    </ul>
                    <button
                      onClick={handleStartFree}
                      className="w-full rounded-lg px-4 py-3 border border-white/20 bg-white/10 text-white font-medium transition-all hover:bg-white/20 hover:border-white/30">

                      Start Free
                    </button>
                  </div>

                  {/* Pro Plan Card (Most Popular) */}
                  <div className="relative flex flex-col rounded-2xl border border-white/10 bg-black/90 backdrop-blur-sm p-6 sm:p-8">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">



                    </div>
                    <h3 className="text-xl font-semibold text-white mb-1">Pro Plan</h3>
                    <div className="mb-6">
                      <span className="text-3xl font-bold text-white">€9.99</span>
                      <span className="text-white/60"> / month</span>
                    </div>
                    <ul className="space-y-3 flex-1 mb-6">
                      {[
                        "Unlimited prompt generation",
                        "Full access to all Prompt Generator tools",
                        "Complete access to Color Codes section",
                        "Advanced model options",
                        "All background styles",
                        "Premium templates",
                        "Faster processing",
                        "Priority support"].
                        map((feature, i) =>
                          <li key={i} className="flex items-center gap-2 text-sm text-white/80">
                            <CheckCircle className="h-4 w-4 text-cyan-400 shrink-0" />
                            {feature}
                          </li>
                        )}
                    </ul>
                    <button
                      onClick={handleUpgradeToPro}
                      disabled={checkoutLoading}
                      className="w-full rounded-lg px-4 py-3 bg-white text-black font-medium border border-white transition-all hover:bg-white/90 flex items-center justify-center gap-2">

                      {checkoutLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                      {isPro ? "Go to Flow" : "Upgrade to Pro"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="py-16 sm:py-20 md:py-24 lg:py-32">
            <Products />
          </div>

          {/* CTA Section Before Footer */}
          <section className="py-16 sm:py-20 md:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 xl:px-12 bg-transparent">














































          </section>
        </div>
      </BackgroundShader>
    </Layout>);

};
export default Index;