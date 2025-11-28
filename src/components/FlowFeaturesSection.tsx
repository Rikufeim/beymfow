import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import beymflowBg from "@/assets/beymflow-background.png";

const Button = ({
  className = "",
  size = "default",
  children,
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
  const sizeStyles = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    lg: "h-11 rounded-md px-8",
    icon: "h-10 w-10"
  };
  return <button className={`${baseStyles} ${sizeStyles[size] || sizeStyles.default} ${className}`} {...props}>
      {children}
    </button>;
};

export const FlowFeaturesSection = ({
  className = ""
}) => {
  let navigate;
  try {
    navigate = useNavigate();
  } catch (e) {
    navigate = path => console.log(`Navigating to ${path}`);
  }
  
  return <section className={`py-8 sm:py-12 md:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 ${className}`}>
      <div className="w-full mx-auto space-y-16 md:space-y-24">
        {/* Flow Engine Section - Text Left, Image Right */}
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} whileInView={{
        opacity: 1,
        y: 0
      }} viewport={{
        once: true,
        amount: 0.2
      }} transition={{
        duration: 0.6
      }} className="grid md:grid-cols-2 gap-6 lg:gap-8 items-stretch">
          {/* Text Content - Left (Rounded corners) */}
          <div className="flex flex-col justify-center p-8 md:p-12 lg:p-16 relative overflow-hidden bg-card dark:bg-card/90 rounded-3xl w-full h-full border border-border">
            {/* Purple glow - left corner */}
            <span className="pointer-events-none absolute -top-24 -left-10 h-44 w-44 rounded-full bg-accent-foreground/20 dark:bg-accent-foreground/25 blur-3xl" aria-hidden="true" />

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 lg:mb-6 relative z-10">
              Flow Engine
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground mb-6 lg:mb-8 max-w-lg relative z-10">The Flow Engine turns your ideas into clean, build-ready prompts for apps, websites, and games. It supports vibe coding and sharpens the way you build, and it works with all major AI models.</p>
            <div className="relative z-10">
              <Button size="lg" className="bg-foreground text-background hover:bg-foreground/90 font-semibold px-8 rounded-full" onClick={() => navigate("/flow-engine")}>
                Start building
              </Button>
            </div>
          </div>

          {/* Image - Right (No rounding as requested) */}
          <div className="relative min-h-[300px] md:min-h-[400px] overflow-hidden w-full h-full">
            <img src={beymflowBg} alt="Flow Engine" className="absolute inset-0 w-full h-full object-cover rounded-3xl" />
          </div>
        </motion.div>

        {/* Prompt Lab Section - Image Left, Text Right */}
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} whileInView={{
        opacity: 1,
        y: 0
      }} viewport={{
        once: true,
        amount: 0.2
      }} transition={{
        duration: 0.6,
        delay: 0.2
      }} className="grid md:grid-cols-2 gap-6 lg:gap-8 items-stretch">
          {/* Image - Left (Order 2 on mobile, 1 on desktop - No rounding) */}
          <div className="relative min-h-[300px] md:min-h-[400px] overflow-hidden w-full h-full order-2 md:order-1 cursor-pointer" onClick={() => navigate("/prompt-lab-page")}>
            <img src={beymflowBg} alt="Prompt Lab" className="absolute inset-0 w-full h-full object-cover rounded-3xl" />
          </div>

          {/* Text Content - Right (Order 1 on mobile, 2 on desktop - Rounded corners) */}
          <div className="flex flex-col justify-center p-8 md:p-12 lg:p-16 order-1 md:order-2 relative overflow-hidden bg-card dark:bg-card/90 rounded-3xl w-full h-full border border-border">
            {/* Purple glow - right corner */}
            <span className="pointer-events-none absolute -top-24 -right-10 h-44 w-44 rounded-full bg-accent-foreground/20 dark:bg-accent-foreground/25 blur-3xl" aria-hidden="true" />

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 lg:mb-6 relative z-10">
              Prompt Lab
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground mb-6 lg:mb-8 max-w-lg relative z-10">Test ideas, refine prompts, and build full workflows that plug into your favorite AI tools. </p>
            <div className="text-sm text-accent-foreground hover:text-primary font-medium relative z-10 cursor-pointer inline-flex items-center gap-2" onClick={() => navigate("/prompt-lab-page")}>
              Click to explore <span>→</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>;
};