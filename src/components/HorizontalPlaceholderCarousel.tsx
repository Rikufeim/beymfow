import React, { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ComponentShowcasePage from "@/components/ComponentShowcasePage";

interface ComponentData {
  title: string;
  description: string;
  videoSrc: string;
  creator: { name: string; username: string };
  installCommand: string;
  importCode: string;
  usageCode: string;
  accentColor: string;
}

const landingPageComponents: ComponentData[] = [
  {
    title: "Modern Landing Page",
    description: "A sleek modern landing page design with smooth animations.",
    videoSrc: "/videos/landing-page-1.mp4",
    creator: { name: "Beymflow", username: "beymflow" },
    installCommand: "https://beymflow.com/templates/modern-landing",
    importCode: "@/pages/ModernLanding",
    usageCode: "<ModernLanding />",
    accentColor: "emerald"
  },
  {
    title: "Pixel Trail",
    description: "A beautiful smooth cursor pixel trail effect.",
    videoSrc: "/videos/pixel-trail-demo.mp4",
    creator: { name: "Jatin Yadav", username: "jatin-yadav05" },
    installCommand: "https://21st.dev/r/jatin-yadav05/pixel-trail",
    importCode: "@/components/ui/pixel-trail",
    usageCode: "<PixelCursorTrail />",
    accentColor: "purple"
  },
  {
    title: "Hero Animation",
    description: "A stunning hero section with smooth animations.",
    videoSrc: "/videos/landing-hero-new.mp4",
    creator: { name: "Beymflow", username: "beymflow" },
    installCommand: "https://beymflow.com/templates/hero-animation",
    importCode: "@/components/ui/hero-animation",
    usageCode: "<HeroAnimation />",
    accentColor: "cyan"
  }
];

const componentsData: ComponentData[] = [
  {
    title: "New Component",
    description: "A fresh new component demo.",
    videoSrc: "/videos/components-new-1.mp4",
    creator: { name: "Beymflow", username: "beymflow" },
    installCommand: "https://beymflow.com/components/new",
    importCode: "@/components/ui/new-component",
    usageCode: "<NewComponent />",
    accentColor: "cyan"
  },
  {
    title: "Interactive UI",
    description: "A beautiful interactive UI component demo.",
    videoSrc: "/videos/components-1.mp4",
    creator: { name: "Beymflow", username: "beymflow" },
    installCommand: "https://beymflow.com/components/interactive",
    importCode: "@/components/ui/interactive-ui",
    usageCode: "<InteractiveUI />",
    accentColor: "purple"
  },
];

const readyToUseLandingPagesData: ComponentData[] = [
  {
    title: "Landing Page Template",
    description: "A ready-to-use landing page with modern design.",
    videoSrc: "/videos/landing-pages-demo.mp4",
    creator: { name: "Beymflow", username: "beymflow" },
    installCommand: "https://beymflow.com/templates/landing-page",
    importCode: "@/pages/LandingPage",
    usageCode: "<LandingPage />",
    accentColor: "emerald"
  },
  {
    title: "Creative Landing Page",
    description: "A creative landing page design with unique animations.",
    videoSrc: "/videos/landing-pages-demo-2.mp4",
    creator: { name: "Beymflow", username: "beymflow" },
    installCommand: "https://beymflow.com/templates/creative-landing",
    importCode: "@/pages/CreativeLanding",
    usageCode: "<CreativeLanding />",
    accentColor: "purple"
  },
  {
    title: "Minimal Landing Page",
    description: "A clean minimal landing page with elegant transitions.",
    videoSrc: "/videos/landing-pages-demo-3.mp4",
    creator: { name: "Beymflow", username: "beymflow" },
    installCommand: "https://beymflow.com/templates/minimal-landing",
    importCode: "@/pages/MinimalLanding",
    usageCode: "<MinimalLanding />",
    accentColor: "cyan"
  }
];

interface HorizontalPlaceholderCarouselProps {
  title: string;
  itemCount?: number;
  className?: string;
}

export const HorizontalPlaceholderCarousel: React.FC<HorizontalPlaceholderCarouselProps> = ({
  title,
  itemCount = 6,
  className = "",
}) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [showComponentPage, setShowComponentPage] = useState<number | null>(null);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 0) {
      e.preventDefault();
      const el = rowRef.current;
      if (!el) return;
      el.scrollBy({ left: e.deltaX, behavior: "smooth" });
    }
  };

  const scrollByAmount = (dir: number) => {
    const el = rowRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.7 * dir;
    el.scrollBy({ left: amount, behavior: "smooth" });
  };

  const getDataArray = (): ComponentData[] => {
    if (title === "Landing page heros") return landingPageComponents;
    if (title === "Components") return componentsData;
    if (title === "Full - Landing Pages") return readyToUseLandingPagesData;
    return [];
  };

  const handleCardClick = (idx: number) => {
    const dataArray = getDataArray();
    if (idx < dataArray.length) {
      setShowComponentPage(idx);
      setActiveSection(title);
    }
  };

  const getComponentData = (idx: number): ComponentData | null => {
    const dataArray = getDataArray();
    if (idx < dataArray.length) {
      return dataArray[idx];
    }
    return null;
  };

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showComponentPage !== null) {
        setShowComponentPage(null);
        setActiveSection(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showComponentPage]);

  const dataArray = getDataArray();
  const selectedComponent = showComponentPage !== null && activeSection === title ? dataArray[showComponentPage] : null;

  return (
    <>
      <div className={`w-full mb-10 ${className}`}>
        <div className="flex items-center justify-between px-1 mb-4">
          <h3 className="text-white/85 font-semibold text-lg">{title}</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => scrollByAmount(-1)}
              className="h-8 w-8 rounded-full bg-[#1a1a1a] border border-white/10 text-white/70 hover:bg-[#252525] hover:text-white flex items-center justify-center transition-all"
              aria-label="Scroll left"
            >
              <ArrowLeft size={16} />
            </button>
            <button
              onClick={() => scrollByAmount(1)}
              className="h-8 w-8 rounded-full bg-[#1a1a1a] border border-white/10 text-white/70 hover:bg-[#252525] hover:text-white flex items-center justify-center transition-all"
              aria-label="Scroll right"
            >
              <ArrowRight size={16} />
            </button>
            <button
              className="text-white/60 text-sm font-medium hover:text-white transition-colors ml-2"
              onClick={() => navigate("/prompt-lab-page")}
            >
              Open lab
            </button>
          </div>
        </div>
        <div
          ref={rowRef}
          onWheel={handleWheel}
          className="flex flex-nowrap gap-6 overflow-hidden pb-2 px-2"
        >
          {Array.from({ length: itemCount }).map((_, idx) => {
            const componentData = getComponentData(idx);
            const isComponentCard = componentData !== null;
            
            return (
              <div
                key={`${title}-${idx}`}
                onClick={() => handleCardClick(idx)}
                className={`relative min-w-[380px] max-w-[420px] h-[240px] rounded-xl border border-white/10 bg-[#0a0a0a] overflow-hidden flex-shrink-0 ${isComponentCard ? `cursor-pointer hover:border-white/30 transition-colors group` : ''}`}
              >
                {isComponentCard ? (
                  <>
                    {/* Video thumbnail - using object-contain to show full video */}
                    <video
                      src={componentData.videoSrc}
                      muted
                      loop
                      playsInline
                      autoPlay
                      className="absolute inset-2 w-[calc(100%-16px)] h-[calc(100%-16px)] object-contain rounded-lg"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="relative h-full w-full px-6 py-5 flex flex-col justify-end z-10">
                      <div>
                        <h4 className="text-white font-semibold text-lg mb-1">{componentData.title}</h4>
                        <p className="text-white/50 text-sm">{componentData.description}</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="relative h-full w-full px-6 py-5 flex flex-col justify-between">
                    <div className="h-4 w-3/4 rounded-full bg-white/10" />
                    <div className="space-y-3">
                      <div className="h-3.5 w-5/6 rounded-full bg-white/8" />
                      <div className="h-3.5 w-2/3 rounded-full bg-white/6" />
                    </div>
                    <div className="flex justify-end items-center gap-3">
                      <CheckCircle2 className="text-white/50" size={16} />
                      <div className="h-9 w-28 rounded-full bg-white/10" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Component Showcase Modal */}
      {showComponentPage !== null && selectedComponent && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm"
          onClick={() => setShowComponentPage(null)}
        >
          <div 
            className="relative w-full h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowComponentPage(null)}
              className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-black/50 border border-white/20 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
              aria-label="Close"
            >
              <X size={20} />
            </button>
            <ComponentShowcasePage
              onBack={() => setShowComponentPage(null)}
              videoSrc={selectedComponent.videoSrc}
              title={selectedComponent.title}
              description={selectedComponent.description}
              creator={selectedComponent.creator}
              installCommand={selectedComponent.installCommand}
              importCode={selectedComponent.importCode}
              usageCode={selectedComponent.usageCode}
            />
          </div>
        </div>
      )}
    </>
  );
};