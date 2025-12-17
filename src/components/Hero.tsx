import { motion } from "framer-motion";
import { PromptSidebar } from "@/components/ui/prompt-sidebar";
import heroWallpaper from "@/assets/hero-wallpaper.png";
import heroWallpaperMobile from "@/assets/hero-wallpaper-mobile.png";

// 3D Carousel component - continuous smooth rotating carousel
const DynamicLines = () => {
  const items = ["Landing pages", "Mobile Apps", "Beats", "Web Apps", "Components", "Templates"];

  return (
    <div 
      className="relative h-16 sm:h-20 md:h-24 flex items-center justify-center overflow-hidden"
      style={{ perspective: "1000px" }}
    >
      <motion.div 
        className="relative w-full flex items-center justify-center"
        style={{ 
          transformStyle: "preserve-3d",
        }}
        animate={{
          rotateY: 360,
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        {items.map((item, index) => {
          const angle = (index * 360) / items.length;
          const radius = 100;
          const x = Math.sin((angle * Math.PI) / 180) * radius;
          const z = Math.cos((angle * Math.PI) / 180) * radius;
          const isFront = z > 50;
          
          return (
            <motion.span
              key={item}
              style={{
                position: "absolute",
                transformStyle: "preserve-3d",
                transform: `translate3d(${x}px, 0, ${z}px) rotateY(${-angle}deg)`,
                opacity: isFront ? 1 : 0.2,
                scale: isFront ? 1 : 0.6,
              }}
              className="inline-block bg-gradient-to-r from-teal-400 to-purple-600 bg-clip-text text-transparent font-medium text-sm sm:text-base md:text-lg lg:text-xl whitespace-nowrap"
            >
              {item}
            </motion.span>
          );
        })}
      </motion.div>
    </div>
  );
};

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative w-full min-h-screen px-6 md:px-8 flex flex-col items-center justify-center pt-20 pb-16 text-center"
      style={{ position: 'relative', zIndex: 1 }}
    >
      {/* Mobile background */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-[center_25%] bg-no-repeat md:hidden"
        style={{
          backgroundImage: `url(${heroWallpaperMobile})`,
        }}
      />
      {/* Desktop background */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-no-repeat hidden md:block bg-[center_-15%]"
        style={{
          backgroundImage: `url(${heroWallpaper})`,
        }}
      />
      {/* Top gradient fade to black */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black to-transparent z-[1]" />
      
      <div className="relative z-10 w-full flex flex-col items-center gap-6">
        {/* Otsikko */}
        <h1
          className="mx-auto max-w-6xl text-5xl font-bold leading-none tracking-tight sm:text-6xl md:text-7xl lg:text-8xl"
        >
          <span className="block text-white/90 text-center text-5xl sm:text-6xl md:text-7xl font-semibold" style={{ fontFamily: "Outfit, sans-serif" }}>
            Make powerful
          </span>
          <span className="block bg-gradient-to-r from-teal-400 to-purple-600 bg-clip-text text-transparent text-center text-5xl sm:text-6xl md:text-7xl font-medium mt-1 pb-2">
            prompts with pure flow
          </span>
        </h1>

        {/* Dynamic Lines */}
        <div className="mx-auto mt-2 max-w-4xl mb-6">
          <DynamicLines />
        </div>


        {/* PROMPT CARDS BANNER - Below QuickPromptGenerator */}
        <div className="w-full max-w-7xl mx-auto relative z-20 mt-8">
          <PromptSidebar />
        </div>
      </div>
    </section>
  );
}