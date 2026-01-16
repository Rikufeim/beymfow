import { memo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { GlassButton } from "@/components/ui/glass-button";
import { cn } from "@/lib/utils";
import { usePrefetchRoute } from "@/hooks/usePrefetchRoute";

export const PricingCarousel = memo(function PricingCarousel() {
  const { prefetchRoute } = usePrefetchRoute();
  
  return <section className="px-4 sm:px-6 lg:px-8 py-24 bg-transparent overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* MUUTOS: gap-12 -> gap-24. Tämä tekee ison välin korttien ja tekstin väliin. */}
        <div className="grid lg:grid-cols-5 gap-24 items-center">
          {/* VASEN SARAKE: Kortit */}
          <div className="lg:col-span-3 grid sm:grid-cols-2 gap-6">
            {/* KORTTI 1: Start for free */}
            <motion.div initial={{
            opacity: 0,
            x: -20
          }} whileInView={{
            opacity: 1,
            x: 0
          }} viewport={{
            once: true
          }} transition={{
            duration: 0.5
          }} className="min-h-[380px]">
              <div className={cn("relative h-full rounded-2xl border border-white/10 p-[1px]")} style={{ transform: 'translateZ(0)', willChange: 'transform' }}>
                <GlowingEffect spread={40} glow disabled={false} proximity={64} inactiveZone={0.01} borderWidth={2} className="opacity-70" />
                <div className="relative flex h-full flex-col justify-between rounded-[1.05rem] bg-gradient-to-br from-[#000000] via-[#050505] to-[#000000] p-6 sm:p-7 md:p-8 overflow-hidden will-change-transform" style={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden' }}>
                  <div className="relative z-10 flex flex-col justify-between h-full">
                    <div>
                      <h3 className="text-2xl sm:text-3xl font-medium tracking-tight text-white mb-6">Start for free</h3>

                      <p className="text-sm sm:text-base text-white/70 mb-6">Get access to:</p>

                      <ul className="space-y-3">
                        {["Unlimited prompt creation", "Access to Prompt Generator", "Basic Flow Engine tools", "Community support"].map((item, index) => <li key={index} className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-white/10 flex items-center justify-center mt-0.5">
                              <Check className="w-3 h-3 text-white/80 stroke-[3]" />
                            </div>
                            <span className="text-xs text-white/70 leading-snug sm:text-lg">{item}</span>
                          </li>)}
                      </ul>
                    </div>

                    <div className="relative mt-8 w-fit">
                      <Link to="/prompt-lab-page">
                        <GlassButton
                          size="sm"
                          contentClassName="flex items-center gap-1.5"
                          isSelected={false}
                        >
                          Start building
                        </GlassButton>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* KORTTI 2: Premium */}
            <motion.div initial={{
            opacity: 0,
            x: -20
          }} whileInView={{
            opacity: 1,
            x: 0
          }} viewport={{
            once: true
          }} transition={{
            duration: 0.5,
            delay: 0.1
          }} className="min-h-[380px]">
              <div className={cn("relative h-full rounded-2xl border border-white/10 p-[1px]")} style={{ transform: 'translateZ(0)', willChange: 'transform' }}>
                <GlowingEffect spread={40} glow disabled={false} proximity={64} inactiveZone={0.01} borderWidth={2} className="opacity-70" />
                <div className="relative flex h-full flex-col justify-between rounded-[1.05rem] bg-gradient-to-br from-[#000000] via-[#050505] to-[#000000] p-6 sm:p-7 md:p-8 overflow-hidden will-change-transform" style={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden' }}>
                  <div className="relative z-10 flex flex-col justify-between h-full">
                    <div>
                      <h3 className="text-2xl sm:text-3xl font-medium tracking-tight text-white leading-tight mb-2">Starter</h3>
                      <div className="flex items-baseline gap-1 mb-6">
                        <span className="text-3xl sm:text-5xl font-bold text-white">€12</span>
                        <span className="text-lg sm:text-2xl font-medium text-white/70">/month</span>
                      </div>

                      <p className="text-sm text-white/70 leading-relaxed sm:text-lg">
                        Upgrade as you go for more credits, more features, and more support.
                      </p>
                    </div>

                    <div className="relative mt-8 w-fit">
                      <Link to="/premium">
                        <GlassButton
                          size="sm"
                          contentClassName="flex items-center gap-1.5"
                          isSelected={false}
                        >
                          See all plans
                        </GlassButton>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* OIKEA SARAKE: Teksti */}
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} transition={{
          duration: 0.5,
          delay: 0.2
        }} className="lg:col-span-2 text-left">
            {/* BADGE: Turkoosi */}
            <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-6">
              BEYMFLOW PRICING
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white/80 mb-6 leading-tight tracking-tight">Pricing plans  </h2>
            <p className="text-lg text-white/70 leading-relaxed max-w-md">
              Scale as you go with plans designed to match your flow.
            </p>
          </motion.div>
        </div>
      </div>
    </section>;
});

export default PricingCarousel;