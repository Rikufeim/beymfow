import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

// Poistettu GlowingEffect import, koska tiedostoa ei löytynyt ympäristöstä.
// import { GlowingEffect } from "@/components/ui/glowing-effect";

export const PricingCarousel = () => {
  return (
    <section className="px-4 sm:px-6 lg:px-8 py-24 bg-black overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Asettelumuutos:
          gap-12 lg:gap-32 xl:gap-48: Tämä luo suuren välin korttien ja tekstin välille isoilla näytöillä.
          items-center: Keskittää sisällön pystysuunnassa.
        */}
        <div className="grid lg:grid-cols-5 gap-12 lg:gap-32 xl:gap-48 items-center">
          {/* VASEN SARAKE: Kortit (Vie 3/5 leveydestä, eli enemmän vasemmalla) */}
          <div className="lg:col-span-3 grid sm:grid-cols-2 gap-6">
            {/* KORTTI 1: Start for free */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="min-h-[380px]"
            >
              <div
                className={cn(
                  "relative h-full rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 via-white/0 to-purple-500/10 p-[1px]",
                )}
              >
                {/* GlowingEffect poistettu virheen välttämiseksi */}

                <div className="relative flex h-full flex-col justify-between rounded-[1.05rem] bg-black/80 p-6 shadow-[0_0_40px_rgba(0,0,0,0.75)] backdrop-blur">
                  <div className="relative z-10">
                    <h3 className="text-2xl sm:text-3xl font-medium tracking-tight text-white mb-6">Start for free</h3>

                    <p className="text-sm sm:text-base text-neutral-400 mb-6">Get access to:</p>

                    <ul className="space-y-3">
                      {[
                        "Unlimited prompt creation",
                        "Access to Prompt Generator",
                        "Basic Flow Engine tools",
                        "Community support",
                      ].map((item, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-white/10 flex items-center justify-center mt-0.5">
                            <Check className="w-3 h-3 text-white stroke-[3]" />
                          </div>
                          <span className="text-xs text-neutral-300 leading-snug sm:text-lg">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button className="relative z-10 mt-8 w-fit bg-white text-black text-sm font-semibold rounded-full px-6 py-2.5 hover:bg-neutral-200 transition-colors">
                    Start building
                  </button>
                </div>
              </div>
            </motion.div>

            {/* KORTTI 2: Premium */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="min-h-[380px]"
            >
              <div
                className={cn(
                  "relative h-full rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 via-white/0 to-purple-500/10 p-[1px]",
                )}
              >
                {/* GlowingEffect poistettu virheen välttämiseksi */}

                <div className="relative flex h-full flex-col justify-between rounded-[1.05rem] bg-black/80 p-6 shadow-[0_0_40px_rgba(0,0,0,0.75)] backdrop-blur">
                  <div className="relative z-10">
                    <h3 className="text-2xl sm:text-3xl font-medium tracking-tight text-white leading-tight mb-2">
                      Premium
                    </h3>
                    <div className="flex items-baseline gap-1 mb-6">
                      <span className="text-3xl sm:text-5xl font-bold text-white">€9,90</span>
                      <span className="text-lg sm:text-2xl font-medium text-neutral-400">/mo</span>
                    </div>

                    <p className="text-sm text-neutral-300 leading-relaxed sm:text-lg">
                      Upgrade as you go for more credits, more features, and more support.
                    </p>
                  </div>

                  <button className="relative z-10 mt-8 w-fit bg-white text-black text-sm font-semibold rounded-full px-6 py-2.5 hover:bg-neutral-200 transition-colors">
                    See all plans
                  </button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* OIKEA SARAKE: Teksti (Vie 2/5 leveydestä, erotettu suurella gapillä) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2 text-left"
          >
            {/* BADGE: Turkoosi */}
            <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-6">
              BEYMFLOW PRICING
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6 leading-tight tracking-tight">
              Pricing plans
            </h2>
            <p className="text-lg text-white/70 leading-relaxed max-w-md">
              Scale as you go with plans designed to match your flow.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default PricingCarousel;
