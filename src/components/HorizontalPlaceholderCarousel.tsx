import React, { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
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
  fullCode?: string;
}

const landingPageComponents: ComponentData[] = [
  {
    title: "Modern Landing Page",
    description: "A sleek modern landing page design with smooth animations.",
    videoSrc: "/videos/landing-page-1.mp4",
    creator: { name: "Beymflow", username: "beymflow" },
    installCommand: "https://beymflow.com/templates/modern-landing",
    importCode: "@/pages/ModernLanding",
    usageCode: `Create a landing page with a stark, high-contrast black and white theme, using a full-screen, dramatic monochrome photograph of a vast natural landscape (like a canyon or mountains) as the background. At the top, a semi-transparent black navigation bar features a white, 8-bit pixel-style logo ("SMALL WRLD") on the left, followed by bold, uppercase sans-serif menu links, and a solid black button with a white Discord icon and text "JOIN DISCORD" on the far right. Centered in the hero section is the large headline "THE WEB3 TRAVEL AGENCY" in an extra-bold, extended uppercase sans-serif font with "WEB3" in solid black and the rest in white, positioned above a central black rectangular "EXPLORE" button and a vertical bar of circular social media icons fixed to the right edge.`,
    accentColor: "emerald",
    fullCode: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SMALL WRLD | The Web3 Travel Agency</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Oswald:wght@700&family=Press+Start+2P&family=Inter:wght@400;600;800&display=swap" rel="stylesheet">
    <!-- Lucide Icons -->
    <script src="https://unpkg.com/lucide@latest"></script>
    <style>
        /* Custom font classes */
        .font-pixel {
            font-family: 'Press Start 2P', cursive;
        }
        .font-headline {
            font-family: 'Oswald', sans-serif;
            letter-spacing: 0.05em;
        }
        .font-body {
            font-family: 'Inter', sans-serif;
        }
        
        /* Smooth scrolling */
        html {
            scroll-behavior: smooth;
        }

        /* Custom selection color */
        ::selection {
            background-color: #ffffff;
            color: #000000;
        }

        /* Animation for the Explore button */
        .explore-btn {
            transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
        }
        .explore-btn:hover {
            transform: scale(1.05);
            letter-spacing: 0.2em;
        }

        /* Glitch effect on hover for the Logo */
        .logo-glitch:hover {
            animation: glitch 0.3s cubic-bezier(.25, .46, .45, .94) both infinite;
            color: #d1d1d1;
        }
        @keyframes glitch {
            0% { transform: translate(0) }
            20% { transform: translate(-2px, 2px) }
            40% { transform: translate(-2px, -2px) }
            60% { transform: translate(2px, 2px) }
            80% { transform: translate(2px, -2px) }
            100% { transform: translate(0) }
        }
    </style>
</head>
<body class="bg-black text-white font-body h-screen w-screen overflow-hidden relative">

    <!-- Background Image -->
    <div class="absolute inset-0 z-0">
        <!-- Dramatic monochrome canyon/mountain landscape -->
        <img 
            src="https://images.unsplash.com/photo-1480497490787-505ec076689f?q=80&w=2069&auto=format&fit=crop&ixlib=rb-4.0.3" 
            alt="Dramatic Monochrome Landscape" 
            class="w-full h-full object-cover filter grayscale contrast-125 brightness-75"
        >
        <!-- Overlay to ensure text readability -->
        <div class="absolute inset-0 bg-black/20"></div>
    </div>

    <!-- Navigation Bar -->
    <nav class="fixed top-0 left-0 w-full z-50 bg-black/80 backdrop-blur-sm border-b border-white/10">
        <div class="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <!-- Logo -->
            <a href="#" class="font-pixel text-xl tracking-tighter logo-glitch select-none">
                SMALL WRLD
            </a>

            <!-- Desktop Menu -->
            <div class="hidden md:flex items-center space-x-12">
                <a href="#" class="font-headline text-sm uppercase tracking-widest hover:text-gray-400 transition-colors">Destinations</a>
                <a href="#" class="font-headline text-sm uppercase tracking-widest hover:text-gray-400 transition-colors">Manifesto</a>
                <a href="#" class="font-headline text-sm uppercase tracking-widest hover:text-gray-400 transition-colors">Roadmap</a>
            </div>

            <!-- Discord CTA -->
            <a href="#" class="hidden md:flex items-center gap-3 bg-white text-black px-6 py-3 font-headline font-bold text-sm tracking-wide hover:bg-gray-200 transition-colors group">
                <!-- Simple SVG Discord Icon since Lucide doesn't have brand icons by default -->
                <svg class="w-5 h-5 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037 26.153 26.153 0 0 0-1.258 2.573 18.353 18.353 0 0 0-4.187 0 26.16 26.16 0 0 0-1.26-2.573.074.074 0 0 0-.08-.037 19.736 19.736 0 0 0-4.885 1.515.077.077 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.074.074 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.086 2.157 2.419 0 1.334-.956 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.086 2.157 2.419 0 1.334-.946 2.419-2.157 2.419z"/>
                </svg>
                JOIN DISCORD
            </a>
            
            <!-- Mobile Menu Button -->
            <button class="md:hidden text-white hover:text-gray-300">
                <i data-lucide="menu" class="w-8 h-8"></i>
            </button>
        </div>
    </nav>

    <!-- Main Hero Section -->
    <main class="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
        
        <!-- Headline -->
        <h1 class="font-headline text-5xl md:text-7xl lg:text-9xl font-bold uppercase leading-tight mb-12 tracking-tighter">
            <span class="block mb-2 md:mb-4 drop-shadow-2xl">The</span>
            <span class="bg-white text-black px-4 md:px-8 inline-block transform -skew-x-6 mx-2">WEB3</span>
            <span class="drop-shadow-2xl">Travel Agency</span>
        </h1>

        <!-- Explore Button -->
        <button class="explore-btn bg-black border-2 border-white text-white font-headline text-xl md:text-2xl py-4 px-12 md:px-16 uppercase tracking-widest hover:bg-white hover:text-black hover:border-transparent cursor-pointer">
            Explore
        </button>

    </main>

    <!-- Right Social Sidebar -->
    <aside class="fixed right-0 top-1/2 transform -translate-y-1/2 z-40 hidden lg:flex flex-col items-center gap-6 pr-6 md:pr-8">
        <!-- Vertical Line Top -->
        <div class="w-px h-24 bg-white/50"></div>
        
        <a href="#" class="group relative flex items-center justify-center w-12 h-12 rounded-full border border-white/30 bg-black/50 backdrop-blur hover:bg-white hover:border-white transition-all duration-300">
            <i data-lucide="twitter" class="w-5 h-5 text-white group-hover:text-black transition-colors"></i>
        </a>

        <a href="#" class="group relative flex items-center justify-center w-12 h-12 rounded-full border border-white/30 bg-black/50 backdrop-blur hover:bg-white hover:border-white transition-all duration-300">
            <i data-lucide="instagram" class="w-5 h-5 text-white group-hover:text-black transition-colors"></i>
        </a>

        <a href="#" class="group relative flex items-center justify-center w-12 h-12 rounded-full border border-white/30 bg-black/50 backdrop-blur hover:bg-white hover:border-white transition-all duration-300">
            <i data-lucide="globe" class="w-5 h-5 text-white group-hover:text-black transition-colors"></i>
        </a>

        <!-- Vertical Line Bottom -->
        <div class="w-px h-24 bg-white/50"></div>
    </aside>

    <!-- Mobile Bottom Bar (Alternative for sidebar on mobile) -->
    <div class="fixed bottom-0 left-0 w-full z-40 lg:hidden flex justify-center pb-8 pt-4 bg-gradient-to-t from-black to-transparent">
        <div class="flex gap-6">
            <a href="#" class="text-white hover:text-gray-300"><i data-lucide="twitter"></i></a>
            <a href="#" class="text-white hover:text-gray-300"><i data-lucide="instagram"></i></a>
            <a href="#" class="text-white hover:text-gray-300"><i data-lucide="globe"></i></a>
        </div>
    </div>

    <!-- Init Icons -->
    <script>
        lucide.createIcons();
    </script>
</body>
</html>`
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
    title: "Component Demo",
    description: "A stylish component demonstration with smooth animations.",
    videoSrc: "/videos/components-demo-3.mp4",
    creator: { name: "Beymflow", username: "beymflow" },
    installCommand: "https://beymflow.com/components/demo",
    importCode: "@/components/ui/component-demo",
    usageCode: "<ComponentDemo />",
    accentColor: "purple"
  },
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
    description: "A modern landing page template with smooth animations.",
    videoSrc: "/videos/landing-page-template-1.mp4",
    creator: { name: "Beymflow", username: "beymflow" },
    installCommand: "https://beymflow.com/templates/landing-page-1",
    importCode: "@/pages/LandingPageTemplate",
    usageCode: `Create a landing page with a stark, high-contrast black and white theme, using a full-screen, dramatic monochrome photograph of a vast natural landscape (like a canyon or mountains) as the background. At the top, a semi-transparent black navigation bar features a white, 8-bit pixel-style logo ("SMALL WRLD") on the left, followed by bold, uppercase sans-serif menu links, and a solid black button with a white Discord icon and text "JOIN DISCORD" on the far right. Centered in the hero section is the large headline "THE WEB3 TRAVEL AGENCY" in an extra-bold, extended uppercase sans-serif font with "WEB3" in solid black and the rest in white, positioned above a central black rectangular "EXPLORE" button and a vertical bar of circular social media icons fixed to the right edge.`,
    accentColor: "emerald"
  },
  {
    title: "Landing Page Template 2",
    description: "A ready-to-use landing page with modern design.",
    videoSrc: "/videos/landing-pages-demo.mp4",
    creator: { name: "Beymflow", username: "beymflow" },
    installCommand: "https://beymflow.com/templates/landing-page",
    importCode: "@/pages/LandingPage",
    usageCode: "<LandingPage />",
    accentColor: "cyan"
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
    if (title === "Hero templates") return landingPageComponents;
    if (title === "Components") return componentsData;
    if (title === "Landing page template") return readyToUseLandingPagesData;
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

  // Lock body scroll and ensure header is hidden when showcase is open
  React.useEffect(() => {
    if (showComponentPage !== null) {
      // Store current scroll position
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      // Prevent scrolling on html element too
      document.documentElement.style.overflow = 'hidden';
      
      // Ensure header is hidden
      const header = document.querySelector('header');
      if (header) {
        (header as HTMLElement).style.display = 'none';
        (header as HTMLElement).style.visibility = 'hidden';
        (header as HTMLElement).style.opacity = '0';
        (header as HTMLElement).style.pointerEvents = 'none';
      }
    } else {
      // Restore scroll position
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
      
      // Restore header
      const header = document.querySelector('header');
      if (header) {
        (header as HTMLElement).style.display = '';
        (header as HTMLElement).style.visibility = '';
        (header as HTMLElement).style.opacity = '';
        (header as HTMLElement).style.pointerEvents = '';
      }
    }
    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      const header = document.querySelector('header');
      if (header) {
        (header as HTMLElement).style.display = '';
        (header as HTMLElement).style.visibility = '';
        (header as HTMLElement).style.opacity = '';
        (header as HTMLElement).style.pointerEvents = '';
      }
    };
  }, [showComponentPage, activeSection]);

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
                className={`relative min-w-[380px] max-w-[420px] rounded-2xl bg-[#1a1a1a] overflow-hidden flex-shrink-0 flex flex-col shadow-2xl shadow-black/50 backdrop-blur-sm transition-all duration-300 ${isComponentCard ? `cursor-pointer hover:opacity-90 hover:shadow-black/70 group` : ''}`}
              >
                {isComponentCard ? (
                  <>
                    {/* Header Section */}
                    <div className="px-4 py-3 bg-[#1a1a1a]">
                      <h4 className="text-white font-semibold text-sm truncate text-left">{componentData.title}</h4>
                    </div>
                    {/* Video Section */}
                    <div className="relative w-full h-[220px] bg-[#1a1a1a] flex items-center justify-center p-3">
                      <div className="relative w-full h-full rounded-lg overflow-hidden bg-black">
                        <video
                          src={componentData.videoSrc}
                          muted
                          loop
                          playsInline
                          autoPlay
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col w-full">
                    {/* Placeholder header */}
                    <div className="px-4 py-3 bg-[#1a1a1a]">
                      <div className="h-4 w-32 rounded-full bg-white/10" />
                    </div>
                    {/* Placeholder video area */}
                    <div className="relative w-full h-[220px] bg-[#1a1a1a] p-3">
                      <div className="w-full h-full rounded-lg bg-black" />
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
          className="fixed inset-0 z-[10000] bg-black"
          style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0,
            overflow: 'hidden',
            zIndex: 10000
          }}
          onClick={() => {
            setShowComponentPage(null);
            setActiveSection(null);
          }}
        >
          <div 
            className="relative w-full h-full overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            style={{ 
              height: '100vh', 
              overflowY: 'auto',
              position: 'relative'
            }}
          >
            <ComponentShowcasePage
              onBack={() => {
                setShowComponentPage(null);
                setActiveSection(null);
              }}
              videoSrc={selectedComponent.videoSrc}
              title={selectedComponent.title}
              description={selectedComponent.description}
              creator={selectedComponent.creator}
              installCommand={selectedComponent.installCommand}
              importCode={selectedComponent.importCode}
              usageCode={selectedComponent.usageCode}
              fullCode={selectedComponent.fullCode}
              category={activeSection}
              relatedComponents={dataArray}
              onComponentClick={(index) => {
                setShowComponentPage(index);
              }}
            />
          </div>
        </div>
      )}
    </>
  );
};