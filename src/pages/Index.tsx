import Products from "@/components/Products";
import ProductsGrid from "@/components/ProductsGrid";
import Footer from "@/components/Footer";
import Layout from "@/components/Layout";
import Hero from "@/components/Hero";
import { motion, useScroll, useTransform } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { useImagePreloader } from "@/hooks/useImagePreloader";
import promptLabLogo from "@/assets/prompt-lab-logo.jpg";
import coolCharacter from "@/assets/cool-character-new.png";
import { GlowingEffectDemo } from "@/components/ui/glowing-effect-demo";
import BeymflowPremiumSection from "@/components/ui/beymflow-premium-section";
import { FlowFeaturesSection } from "@/components/FlowFeaturesSection";
import PricingCarousel from "@/components/PricingCarousel";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { GlassButton } from "@/components/ui/glass-button";
import { cn } from "@/lib/utils";
import { Pen, Cpu, Share2, Target, FileText, Layers, Zap, Lightbulb, CheckCircle, ArrowLeft, ArrowRight } from "lucide-react";
import { useRef } from "react";
import { HorizontalPlaceholderCarousel } from "@/components/HorizontalPlaceholderCarousel";
import HolographicCard from "@/components/demo/HolographicCard";
import HyperTextCard from "@/components/demo/HyperTextCard";
import UploadTile from "@/components/demo/UploadTile";

const Index = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Transform scroll progress to darken background - page gets darker as you scroll
  const backgroundOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 0.5, 1]);

  // Preload all homepage images for instant loading
  const homepageImages = [
  // Products section card backgrounds
  "/lovable-uploads/45481b23-2d43-4186-a282-479adb37456b.png",
  // CRYPTO GUIDES
  "/lovable-uploads/65f7d709-a319-4bd3-ae8b-fb7acfb196db.png" // PROMPTS
  ];
  useImagePreloader({
    images: homepageImages
  });
  return <>
      <Layout>
        <main ref={containerRef} className="relative overflow-y-auto bg-black min-h-screen pt-4 sm:pt-6 md:pt-8">
          {/* Darkening overlay - page gets darker as you scroll */}
          <motion.div
            className="fixed inset-0 pointer-events-none z-0 bg-black"
            style={{
              opacity: backgroundOpacity,
            }}
          />
          <div className="relative z-10">
            {/* Hero Section */}
            <Hero />

            {/* Start Building showcase */}
            <section className="relative w-full px-6 md:px-8 lg:px-12 mt-14 mb-14">
              <div className="max-w-6xl mx-auto grid gap-10 md:grid-cols-2 items-center">
                <div className="space-y-6">
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight">
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
                    <button
                      onClick={() => navigate("/prompt-lab-page")}
                      className="rounded-full px-5 py-2 border border-white/10 bg-white/[0.03] text-white/80 transition-all duration-200 hover:border-white/20 hover:text-white hover:bg-white/[0.06] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40"
                    >
                      Prompt Lab
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
                  <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 md:grid-rows-2 gap-4 lg:gap-6 items-stretch">
                    <HolographicCard className="md:row-span-1" />
                    <HyperTextCard className="md:row-span-1" />
                    <UploadTile className="md:row-span-2" />
                  </div>
                </div>
              </div>
            </section>

            {/* Prompt Packs (placeholder carousels) */}
            <section className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 mt-16">
              <HorizontalPlaceholderCarousel title="Landing Pages" />
              <HorizontalPlaceholderCarousel title="Popular" />
              <HorizontalPlaceholderCarousel title="Components" />
            </section>

            {/* Flow Features Section */}
            <FlowFeaturesSection className="my-[100px] py-[300px]" />

            {/* Products Grid Section */}
            <ProductsGrid />

            {/* Beymflow Premium highlight */}
            

            {/* Feature Showcase Cards */}

            {/* Prompt CTA Section */}
            

            {/* Engineered for Flow Section */}
            <section className="px-4 sm:px-6 lg:px-8 xl:px-12 pb-8 sm:pb-12 md:pb-16 lg:pb-24 py-[30px]">
              <motion.div initial={{
              opacity: 0,
              y: 20
            }} whileInView={{
              opacity: 1,
              y: 0
            }} viewport={{
              once: true,
              amount: 0.3
            }} transition={{
              duration: 0.6
            }} className="max-w-7xl mx-auto">
                <GlowingEffectDemo />
              </motion.div>
            </section>

            {/* Pricing Section */}
            <PricingCarousel />
            {/* Prompt Lab Section */}


            {/* How It Works Section */}
            <section className="py-8 sm:py-12 md:py-16 lg:py-24 px-4 sm:px-6 lg:px-8 xl:px-12 bg-transparent">
              <div className="max-w-7xl mx-auto">
                <motion.div initial={{
                opacity: 0
              }} whileInView={{
                opacity: 1
              }} viewport={{
                once: true,
                amount: 0.3
              }} transition={{
                duration: 0.6
              }} className="text-center mb-10 sm:mb-12 lg:mb-16">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 px-4">
                    Create Perfect AI Prompts in Seconds
                  </h2>
                  <p className="text-sm sm:text-base md:text-lg text-muted-foreground px-4 max-w-3xl mx-auto">
                    Follow these simple steps to create optimized prompts for AI models in seconds
                  </p>
                </motion.div>

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
            <section className="py-12 sm:py-16 md:py-24 px-4 sm:px-6 md:px-8 lg:px-12 bg-transparent">
              <div className="max-w-6xl mx-auto">
                <motion.div initial={{
                opacity: 0
              }} whileInView={{
                opacity: 1
              }} viewport={{
                once: true,
                amount: 0.3
              }} transition={{
                duration: 0.6
              }} className="text-center mb-12 sm:mb-16">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 px-4">
                    Essential Steps for Writing AI Prompts
                  </h2>
                  <p className="text-sm sm:text-base md:text-lg text-muted-foreground px-4">
                    Follow these proven steps to create effective AI prompts
                  </p>
                </motion.div>

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
            <section className="py-12 sm:py-16 md:py-24 px-4 sm:px-6 md:px-8 lg:px-12 bg-transparent">
              <div className="max-w-6xl mx-auto">
                <motion.div initial={{
                opacity: 0
              }} whileInView={{
                opacity: 1
              }} viewport={{
                once: true,
                amount: 0.3
              }} transition={{
                duration: 0.6
              }} className="text-center mb-16">
                  <h2 className="text-4xl md:text-5xl font-bold mb-4">
                    {["Why", "Choose", "BEYMFLOW", "Prompt", "Generators?"].map((word, index) => <span key={index} className="inline-block transition-all duration-200 ease-out hover:translate-y-2 hover:scale-105 cursor-pointer mr-2 last:mr-0" style={{
                    willChange: "transform"
                  }}>
                        {word}
                      </span>)}
                  </h2>
                </motion.div>

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
                }].map((item, idx) => <motion.div key={idx} initial={{
                  opacity: 0
                }} whileInView={{
                  opacity: 1
                }} viewport={{
                  once: true,
                  amount: 0.3
                }} transition={{
                  duration: 0.6,
                  delay: idx * 0.1
                }} className="min-h-[11rem]">
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
                    </motion.div>)}
                </div>
              </div>
            </section>

            <Products />

            {/* CTA Section Before Footer */}
            <section className="py-24 px-4 sm:px-6 lg:px-8 xl:px-12 bg-transparent">
              <div className="max-w-4xl mx-auto text-center">
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.6 }}
                  className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-12 tracking-tight"
                >
                  <motion.span
                    animate={{
                      backgroundPosition: ["0% center", "-200% center"],
                    }}
                    transition={{
                      backgroundPosition: { duration: 6, ease: "easeInOut", repeat: Infinity },
                    }}
                    className="text-transparent bg-clip-text bg-[length:200%_auto] inline-block"
                    style={{
                      backgroundImage:
                        "linear-gradient(to right, #a855f7 0%, #06b6d4 25%, #a855f7 50%, #06b6d4 75%, #a855f7 100%)",
                    }}
                  >
                    IT'S ALL ABOUT THE PROMPT
                  </motion.span>
                </motion.h2>
                <p className="text-white/70 text-lg mb-10">
                  This website is made by 100% prompting.
                </p>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                >
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
                </motion.div>
              </div>
            </section>
          </div>
        </main>
      </Layout>
    </>;
};
export default Index;