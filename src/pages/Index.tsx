import Layout from "@/components/Layout";
import Hero from "@/components/Hero";
import { useNavigate } from "react-router-dom";
import { useImagePreloader } from "@/hooks/useImagePreloader";
import { GlowingEffectDemo } from "@/components/ui/glowing-effect-demo";
import { FlowFeaturesSection } from "@/components/FlowFeaturesSection";
import PricingCarousel from "@/components/PricingCarousel";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { GlassButton } from "@/components/ui/glass-button";
import { cn } from "@/lib/utils";
import { Pen, Cpu, Share2, Target, FileText, Layers, Zap, Lightbulb, CheckCircle, ArrowLeft, ArrowRight } from "lucide-react";
import { useMemo, lazy, Suspense } from "react";
// HorizontalPlaceholderCarousel moved to Hero component
import ColorWorkspaceDemo from "@/components/demo/ColorWorkspaceDemo";
import { GradientButton } from "@/components/ui/gradient-button";

// Lazy load heavy components
const Products = lazy(() => import("@/components/Products"));
const ProductsGrid = lazy(() => import("@/components/ProductsGrid"));

const Index = () => {
  const navigate = useNavigate();

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
      <main className="relative min-h-screen">
        {/* Hero Section */}
        <div className="relative">
          <Hero />
        </div>
        
        {/* Content after Hero */}
        <div className="relative bg-black">

            {/* Start Building showcase */}
            <section className="relative w-full px-6 md:px-8 lg:px-12 py-16 sm:py-20 md:py-24 lg:py-32">
              <div className="max-w-6xl mx-auto grid gap-10 md:grid-cols-2 items-center">
                <div className="space-y-6">
                  <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-white tracking-tight">
                    Start Building
                  </h2>
                  <p className="text-white/65 max-w-xl">
                    Jump into Flow Engine or Prompt Lab with premium, interactive previews inspired by Aceternity UI.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => navigate("/flow-engine")}
                      className="rounded-full px-5 py-2 border border-white/10 bg-white/[0.03] text-white/80 transition-all duration-200 hover:border-white/20 hover:text-white hover:bg-white/[0.06] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40"
                    >
                      Flow Engine
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
                      backgroundPosition: "0 0, 0 0",
                    }}
                  />
                  <div className="relative z-10">
                    <ColorWorkspaceDemo className="min-h-[280px]" />
                  </div>
                </div>
              </div>
            </section>

            {/* Video carousels moved to Hero component */}

            {/* Flow Features Section */}
            <FlowFeaturesSection className="py-16 sm:py-20 md:py-24 lg:py-32" />

            {/* Products Grid Section */}
            <div className="py-16 sm:py-20 md:py-24 lg:py-32">
              <ProductsGrid />
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

            {/* Pricing Section */}
            <div className="py-16 sm:py-20 md:py-24 lg:py-32">
              <PricingCarousel />
            </div>
            {/* Prompt Lab Section */}


            {/* How It Works Section */}
            <section className="py-16 sm:py-20 md:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 xl:px-12 bg-transparent">
              <div className="max-w-7xl mx-auto">
                <div className="text-center mb-10 sm:mb-12 lg:mb-16">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 px-4">
                    Create Perfect AI Prompts in Seconds
                  </h2>
                  <p className="text-sm sm:text-base md:text-lg text-muted-foreground px-4 max-w-3xl mx-auto">
                    Follow these simple steps to create optimized prompts for AI models in seconds
                  </p>
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
            <section className="py-16 sm:py-20 md:py-24 lg:py-32 px-4 sm:px-6 md:px-8 lg:px-12 bg-transparent">
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12 sm:mb-16">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 px-4">
                    Essential Steps for Writing AI Prompts
                  </h2>
                  <p className="text-sm sm:text-base md:text-lg text-muted-foreground px-4">
                    Follow these proven steps to create effective AI prompts
                  </p>
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

            {/* Why Choose Section */}
            <section className="py-16 sm:py-20 md:py-24 lg:py-32 px-4 sm:px-6 md:px-8 lg:px-12 bg-transparent">
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                  <h2 className="text-4xl md:text-5xl font-bold mb-4">
                    {["Why", "Choose", "BEYMFLOW", "Prompt", "Generators?"].map((word, index) => <span key={index} className="inline-block transition-all duration-200 ease-out hover:translate-y-2 hover:scale-105 cursor-pointer mr-2 last:mr-0" style={{
                    willChange: "transform"
                  }}>
                        {word}
                      </span>)}
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
                  {[{
                  icon: <Zap className="h-4 w-4 text-blue-400" />,
                  title: "Instant Enhancement",
                  description: "Get immediate improvements to your prompts using advanced AI techniques."
                }, {
                  icon: <Lightbulb className="h-4 w-4 text-purple-400" />,
                  title: "Smart Analysis",
                  description: "Our system uses sophisticated analysis techniques to understand your prompt context and provide optimal suggestions."
                }, {
                  icon: <CheckCircle className="h-4 w-4 text-pink-400" />,
                  title: "Precision Results",
                  description: "Get accurate and relevant responses from AI with our enhanced prompts."
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
                                <h3 className="text-lg sm:text-xl md:text-2xl font-semibold tracking-tight text-white/85">
                                  {item.title}
                                </h3>
                                <p className="text-xs leading-relaxed text-white/70 sm:text-lg">
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

            <div className="py-16 sm:py-20 md:py-24 lg:py-32">
              <Suspense fallback={<div className="min-h-[400px] flex items-center justify-center"><div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" /></div>}>
                <Products />
              </Suspense>
            </div>

            {/* CTA Section Before Footer */}
            <section className="py-16 sm:py-20 md:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 xl:px-12 bg-transparent">
              <div className="max-w-4xl mx-auto text-center">
                <style>{`
                  @keyframes gradient-shift {
                    0% {
                      background-position: 0% 50%;
                    }
                    50% {
                      background-position: 100% 50%;
                    }
                    100% {
                      background-position: 0% 50%;
                    }
                  }
                  .animated-gradient-text {
                    background-image: linear-gradient(to right, #a855f7 0%, #06b6d4 25%, #a855f7 50%, #06b6d4 75%, #a855f7 100%);
                    background-size: 200% auto;
                    background-clip: text;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    animation: gradient-shift 3s ease infinite;
                    padding-bottom: 0.2em;
                    line-height: 1.2;
                  }
                `}</style>
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-12 tracking-tight">
                  <span className="animated-gradient-text inline-block leading-tight">
                    This website is made by<br />
                    100% prompting
                  </span>
                </h2>
                <p className="text-white/70 text-lg mb-10">
                  IT'S ALL ABOUT THE PROMPT
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <div className="relative w-full sm:w-auto">
                    <GlassButton
                      size="default"
                      onClick={() => navigate("/auth")}
                      contentClassName="flex items-center gap-1.5"
                      isSelected={false}
                    >
                      Start for free
                    </GlassButton>
                  </div>
                  <div className="relative w-full sm:w-auto">
                    <GlassButton
                      size="default"
                      onClick={() => navigate("/premium")}
                      contentClassName="flex items-center gap-1.5"
                      isSelected={false}
                    >
                      Beymflow Premium
                    </GlassButton>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </main>
    </Layout>
  );
};
export default Index;