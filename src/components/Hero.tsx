import { memo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Cover } from "./ui/cover";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthDialog } from "@/contexts/AuthDialogContext";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

const Hero = memo(function Hero() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { openAuthDialog } = useAuthDialog();

  const handleFlowClick = useCallback(() => {
    if (user) {
      navigate("/flow");
    } else {
      sessionStorage.setItem('auth_redirect_after', '/flow');
      openAuthDialog(() => navigate("/flow"));
    }
  }, [user, navigate, openAuthDialog]);

  const handleAccessClick = useCallback(() => {
    navigate("/premium");
  }, [navigate]);
  return (
    <section className="relative w-full min-h-screen flex flex-col items-center justify-center px-6 md:px-10 overflow-hidden">
      <motion.div
        className="relative z-10 max-w-4xl mr-auto w-full text-left flex flex-col items-start"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Main Heading */}
        <motion.h1
          variants={itemVariants}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight tracking-normal"
          style={{ fontFamily: "Rubik, sans-serif" }}
        >
          <span className="bg-gradient-to-r from-teal-400 to-purple-600 bg-clip-text text-transparent">The world </span>
          <span className="text-white opacity-90">wants</span>
          <br />
          <Cover className="w-full block -mt-1.5 md:-mt-2">
            <span className="text-white my-0 mb-0 whitespace-nowrap opacity-90">
              to see your vision
            </span>
          </Cover>
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="text-lg md:text-xl text-white/70 max-w-2xl mb-8 leading-relaxed"
        >
          Create prompts in seconds, generate perfect color codes, and build stunning backgrounds and visual elements for websites, apps, and projects.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div variants={itemVariants} className="flex flex-wrap gap-4">
          <button onClick={handleFlowClick} className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-black text-white text-sm font-medium border border-white/20 transition-all duration-200 hover:border-white active:scale-95">
            Go to Flow
            <ArrowRight className="w-4 h-4" />
          </button>

          <button onClick={handleAccessClick} className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-white text-black text-sm font-medium border border-transparent transition-all duration-200 hover:bg-gray-200 active:scale-95 shadow-lg shadow-white/5">
            Get All-Access
          </button>
        </motion.div>
      </motion.div>
    </section>
  );
});
export default Hero;