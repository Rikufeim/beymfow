import Layout from "@/components/Layout";
import Hero from "@/components/Hero";
import { useNavigate } from "react-router-dom";
import { useImagePreloader } from "@/hooks/useImagePreloader";
import { GlowingEffectDemo } from "@/components/ui/glowing-effect-demo";
import { FlowFeaturesSection } from "@/components/FlowFeaturesSection";

import { GlowingEffect } from "@/components/ui/glowing-effect";
import { GlassButton } from "@/components/ui/glass-button";
import { cn } from "@/lib/utils";
import { CheckCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

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
      navigate("/auth?redirect=/flow");
    }
  }, [user, navigate]);

  const handleUpgradeToPro = useCallback(async () => {
    if (!user || !session) {
      navigate("/premium");
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
  }, [user, session, isPro, navigate, toast]);

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




          <section className="py-16 sm:py-20 md:py-24 lg:py-32 px-4 sm:px-6 md:px-8 lg:px-12">
            <div className="max-w-6xl mx-auto">
              {/* Header */}
              <div className="text-center mb-12 sm:mb-16">
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-3">
                  Simple, transparent pricing
                </h2>
                <p className="text-base sm:text-lg text-white/60">
                  Start for free. Cancel anytime. No credit card required.
                </p>
              </div>

              {/* 3 Cards */}
              <div className="grid md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
                {/* Free */}
                <div className="relative flex flex-col rounded-2xl border border-white/10 bg-black/80 backdrop-blur-sm p-6 sm:p-8">
                  <h3 className="text-xl font-semibold text-white mb-4">Free</h3>
                  <div className="mb-1">
                    <span className="text-4xl font-bold text-white">€0</span>
                    <span className="text-white/50 text-sm"> / mo</span>
                  </div>
                  <p className="text-sm text-white/50 mb-6">Perfect for getting started</p>
                  <ul className="space-y-2.5 flex-1 mb-8">
                    {[
                      "Basic prompt generation",
                      "Daily prompt limit",
                      "Selected templates",
                      "Community support",
                    ].map((f, i) => (
                      <li key={i} className="flex items-center gap-2.5 text-sm text-white/80">
                        <CheckCircle className="h-4 w-4 text-purple-400 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={handleStartFree}
                    className="w-full rounded-xl px-4 py-3 bg-purple-600 text-white font-semibold text-sm transition-all hover:bg-purple-500"
                  >
                    Get Started Free
                  </button>
                </div>

                {/* Creator — highlighted */}
                <div className="relative flex flex-col rounded-2xl border border-purple-500/40 bg-gradient-to-br from-[#1a0533] via-[#0d0019] to-[#0a0014] backdrop-blur-sm p-6 sm:p-8 shadow-[0_0_40px_-10px_rgba(128,0,255,0.3)]">
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="inline-block px-4 py-1 rounded-full bg-amber-400 text-black text-xs font-bold tracking-wide">
                      Most Popular
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">Creator</h3>
                  <div className="mb-1">
                    <span className="text-4xl font-bold text-white">€14.99</span>
                    <span className="text-white/50 text-sm"> / mo</span>
                  </div>
                  <p className="text-sm text-white/50 mb-6">For solo creators and makers</p>
                  <ul className="space-y-2.5 flex-1 mb-8">
                    {[
                      "Everything in Free",
                      "Unlimited prompts",
                      "Full toolkit & Color Codes",
                      "Priority support",
                    ].map((f, i) => (
                      <li key={i} className="flex items-center gap-2.5 text-sm text-white/80">
                        <CheckCircle className="h-4 w-4 text-purple-400 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={handleUpgradeToPro}
                    disabled={checkoutLoading}
                    className="w-full rounded-xl px-4 py-3 bg-white text-black font-semibold text-sm transition-all hover:bg-white/90 flex items-center justify-center gap-2"
                  >
                    {checkoutLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                    Get Started with Creator
                  </button>
                </div>

                {/* Team */}
                <div className="relative flex flex-col rounded-2xl border border-white/10 bg-black/80 backdrop-blur-sm p-6 sm:p-8">
                  <h3 className="text-xl font-semibold text-white mb-4">Team</h3>
                  <div className="mb-1">
                    <span className="text-4xl font-bold text-white">€49.99</span>
                    <span className="text-white/50 text-sm"> / mo</span>
                  </div>
                  <p className="text-sm text-white/50 mb-6">For teams and agencies</p>
                  <ul className="space-y-2.5 flex-1 mb-8">
                    {[
                      "Everything in Creator",
                      "Shared workspaces",
                      "Unlimited team prompts",
                      "Team collaboration",
                    ].map((f, i) => (
                      <li key={i} className="flex items-center gap-2.5 text-sm text-white/80">
                        <CheckCircle className="h-4 w-4 text-purple-400 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={handleStartFree}
                    className="w-full rounded-xl px-4 py-3 bg-purple-600 text-white font-semibold text-sm transition-all hover:bg-purple-500"
                  >
                    Get Started Free
                  </button>
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