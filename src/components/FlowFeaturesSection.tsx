import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import beymflowBg from "@/assets/beymflow-background.png";

// Määritellään yksinkertainen Button-komponentti tässä tiedostossa,
// koska emme voi tuoda sitä ulkoisesta tiedostosta esikatselussa.
// Projektissasi voit käyttää: import { Button } from "@/components/ui/button";
const Button = ({ className = "", size = "default", children, ...props }) => {
  const baseStyles =
    "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
  const sizeStyles = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    lg: "h-11 rounded-md px-8",
    icon: "h-10 w-10",
  };

  return (
    <button className={`${baseStyles} ${sizeStyles[size] || sizeStyles.default} ${className}`} {...props}>
      {children}
    </button>
  );
};

export const FlowFeaturesSection = ({ className = "" }) => {
  // Hookin käyttö turvallisesti (jos Router ei ole saatavilla esikatselussa, tämä voi vaatia providerin)
  // Tässä oletetaan, että ympäristössä on Router tai tämä jätetään huomiotta virheen sattuessa.
  let navigate;
  try {
    navigate = useNavigate();
  } catch (e) {
    // Fallback jos Router context puuttuu esikatselusta
    navigate = (path) => console.log(`Navigating to ${path}`);
  }

  return (
    <section className={`py-8 sm:py-12 md:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 ${className}`}>
      <div className="w-full mx-auto space-y-16 md:space-y-24">
        {/* Flow Engine Section - Text Left, Image Right with overlap */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="relative grid md:grid-cols-2 gap-0 items-stretch"
        >
          {/* Text Content - Left (Black rounded card) */}
          <div className="relative z-10 flex flex-col justify-center p-8 md:p-12 lg:p-16 bg-black rounded-3xl md:mr-[-10%]">
            <span
              className="pointer-events-none absolute -top-24 -left-10 h-44 w-44 rounded-full bg-purple-500/25 blur-3xl"
              aria-hidden="true"
            />

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 lg:mb-6 relative z-10">
              Flow Engine
            </h2>
            <p className="text-base sm:text-lg text-neutral-400 mb-6 lg:mb-8 max-w-lg relative z-10">
              The Flow Engine turns ideas into a clean, high-impact prompt. It transforms your input into a precise,
              ready-to-use command in seconds and makes your entire workflow faster and more effective. Built to work
              with ChatGPT, Claude, Grok, Llama, and every major model.
            </p>
            <div className="relative z-10">
              <Button
                size="lg"
                className="bg-white text-black hover:bg-neutral-200 font-semibold px-8 rounded-full"
                onClick={() => navigate("/flow-engine")}
              >
                Start building
              </Button>
            </div>
          </div>

          {/* Image - Right (Overlapping gradient card) */}
          <div className="relative min-h-[300px] md:min-h-[400px] overflow-hidden rounded-3xl mt-8 md:mt-0">
            <img
              src={beymflowBg}
              alt="Flow Engine"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
        </motion.div>

        {/* Prompt Lab Section - Image Left, Text Right with overlap */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative grid md:grid-cols-2 gap-0 items-stretch"
        >
          {/* Image - Left (Overlapping gradient card - Order 2 mobile, 1 desktop) */}
          <div
            className="relative min-h-[300px] md:min-h-[400px] overflow-hidden rounded-3xl order-2 md:order-1 mt-8 md:mt-0 cursor-pointer"
            onClick={() => navigate("/prompt-lab-page")}
          >
            <img
              src={beymflowBg}
              alt="Prompt Lab"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>

          {/* Text Content - Right (Black rounded card - Order 1 mobile, 2 desktop) */}
          <div className="relative z-10 flex flex-col justify-center p-8 md:p-12 lg:p-16 order-1 md:order-2 bg-black rounded-3xl md:ml-[-10%]">
            <span
              className="pointer-events-none absolute -top-24 -right-10 h-44 w-44 rounded-full bg-purple-500/25 blur-3xl"
              aria-hidden="true"
            />

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 lg:mb-6 relative z-10">
              Prompt Lab
            </h2>
            <p className="text-base sm:text-lg text-neutral-400 mb-6 lg:mb-8 max-w-lg relative z-10">
              Beymflow's Prompt Lab is your experimental zone. Test ideas, refine prompts, and build full workflows that
              plug into your favorite AI tools. From rough thought to polished command, the Lab turns chaos into clean,
              repeatable systems.
            </p>
            <div
              className="text-sm text-purple-400 hover:text-purple-300 font-medium relative z-10 cursor-pointer inline-flex items-center gap-2"
              onClick={() => navigate("/prompt-lab-page")}
            >
              Click to explore <span>→</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
