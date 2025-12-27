import React, { useState, useRef, memo } from 'react';
import { Copy, Maximize2, Code, Bookmark, MoreVertical, Check, X, ArrowLeft, ArrowRight, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface VideoComponentData {
  title: string;
  description: string;
  videoSrc: string;
  creator: { name: string; username: string };
  installCommand: string;
  importCode: string;
  usageCode: string;
  accentColor: string;
}

interface ComponentShowcasePageProps {
  onBack: () => void;
  videoSrc: string;
  title: string;
  description: string;
  creator: {
    name: string;
    username: string;
    avatar?: string;
  };
  installCommand: string;
  importCode: string;
  usageCode: string;
  fullCode?: string; // Full code content to display
  category?: string; // Category name (e.g., "Hero templates", "Components", "Landing page template")
  relatedComponents?: VideoComponentData[]; // Related components in the same category
  onComponentClick?: (index: number) => void; // Handler for clicking related components
}

const ComponentShowcasePage: React.FC<ComponentShowcasePageProps> = ({
  onBack,
  videoSrc,
  title,
  description,
  creator,
  importCode,
  usageCode,
  fullCode,
  category,
  relatedComponents = [],
  onComponentClick,
}) => {
  const [copiedButton, setCopiedButton] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedButton(label);
    setTimeout(() => setCopiedButton(null), 2000);
  };

  // Get preview of code (first 5 lines)
  const getCodePreview = (code: string | undefined): string => {
    if (!code) return '// Code will be added here...';
    const lines = code.split('\n');
    const preview = lines.slice(0, 5).join('\n');
    return preview + '\n\n// ... (rest of the code)';
  };

  const scrollCarousel = (direction: number) => {
    const el = carouselRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.7 * direction;
    el.scrollBy({ left: amount, behavior: 'smooth' });
  };

  // Build breadcrumb path
  const breadcrumbPath = category ? `Components / ${category} / ${title}` : `Components / ${title}`;

  // Filter out the current component from the carousel
  const filteredRelatedComponents = relatedComponents.filter(
    (component) => component.title !== title
  );

  return (
    <div className="h-screen w-full bg-black text-white flex flex-col overflow-hidden">
      {/* Main Content - Split Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Panel - Documentation */}
        <div className="w-full md:w-[35%] lg:w-[30%] h-full pl-6 pr-6 pt-6 pb-32 lg:pl-8 lg:pr-10 lg:pt-8 lg:pb-40 overflow-y-auto overflow-x-hidden flex flex-col items-start [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] relative z-20">
          {/* Breadcrumb */}
          <div className="mb-6">
            <button
              onClick={onBack}
              className="text-white/60 hover:text-white text-sm transition-colors flex items-center gap-2"
            >
              <Home size={14} />
              <span className="text-white/40">/</span>
              <span className="text-white/60 hover:text-white">{category || 'Components'}</span>
              <span className="text-white/40">/</span>
              <span className="text-white">{title}</span>
            </button>
          </div>

          {/* Title & Description */}
          <h1 className="text-3xl font-bold mb-4">{title}</h1>
          <p className="text-white/60 mb-12 leading-relaxed">{description}</p>

        {/* How to use */}
        <div>
          <h3 className="text-white/50 text-sm uppercase tracking-wider mb-4">How to use</h3>
          <p className="text-white/60 text-sm leading-relaxed mb-5">
            You can paste the prompt into Cursor, Gemini, Lovable, or any other AI platform. Edit and refine the code and prompt to achieve better and better results, so the final outcome looks exactly like you or your brand.
          </p>
          
          <div className="flex flex-col gap-3">
            <Button
              variant="outline"
              size="sm"
              className="bg-transparent border-white/20 hover:bg-white/10 text-white px-4 py-2 w-fit"
              onClick={() => copyToClipboard(usageCode, 'Prompt')}
            >
              <span className="mr-2 relative w-[14px] h-[14px]">
                <Copy size={14} className={`absolute inset-0 transition-all duration-300 ${copiedButton === 'Prompt' ? 'opacity-0 scale-75' : 'opacity-100 scale-100'}`} />
                <Check size={14} className={`absolute inset-0 transition-all duration-300 ${copiedButton === 'Prompt' ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`} />
              </span>
              Copy prompt
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-transparent border-white/20 hover:bg-white/10 text-white px-4 py-2 w-fit"
              onClick={() => copyToClipboard(fullCode || importCode + '\n\n' + usageCode, 'Code')}
            >
              <span className="mr-2 relative w-[14px] h-[14px]">
                <Copy size={14} className={`absolute inset-0 transition-all duration-300 ${copiedButton === 'Code' ? 'opacity-0 scale-75' : 'opacity-100 scale-100'}`} />
                <Check size={14} className={`absolute inset-0 transition-all duration-300 ${copiedButton === 'Code' ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`} />
              </span>
              Copy code
            </Button>
            
            {/* Code Display Section */}
            <div className="mt-4 w-full">
              <div className="bg-black border border-white/10 rounded-lg p-4 font-mono text-sm text-white/90 overflow-x-auto overflow-y-auto min-h-[300px] max-h-[400px]">
                <pre className="whitespace-pre-wrap text-xs leading-relaxed">
                  {getCodePreview(fullCode)}
                </pre>
              </div>
            </div>
          </div>
        </div>
        </div>

        {/* Right Panel - Video Preview (Scrollable) */}
        <div className="hidden md:flex flex-1 flex-col bg-black relative z-0 overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {/* Main Video */}
          <div className="flex flex-col items-center justify-center p-4 lg:p-8" style={{ minHeight: '100vh' }}>
            {/* Buttons above video */}
            <div className="flex items-center justify-between w-full max-w-6xl mb-4">
              <button 
                onClick={() => setIsFullscreen(true)}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors"
              >
                <Maximize2 size={14} />
              </button>
              <div className="flex items-center gap-2">
                <button className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors">
                  <Code size={14} />
                </button>
                <button className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors">
                  <Bookmark size={14} />
                </button>
                <button className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors">
                  <MoreVertical size={14} />
                </button>
              </div>
            </div>
            
            <div className="relative w-full max-w-6xl flex items-center justify-center">
              <video
                src={videoSrc}
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
                className="w-full h-full object-contain"
                onError={(e) => {
                  console.error('Video load error:', e);
                }}
              />
            </div>
          </div>

          {/* Related Components Carousel Section - Scrollable */}
          {filteredRelatedComponents.length > 0 && (
            <div className="w-full py-16 px-6 lg:px-8 border-t border-white/10 bg-black">
              <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-white">{category || 'Related Components'}</h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => scrollCarousel(-1)}
                      className="h-8 w-8 rounded-full bg-[#1a1a1a] border border-white/10 text-white/70 hover:bg-[#252525] hover:text-white flex items-center justify-center transition-all"
                      aria-label="Scroll left"
                    >
                      <ArrowLeft size={16} />
                    </button>
                    <button
                      onClick={() => scrollCarousel(1)}
                      className="h-8 w-8 rounded-full bg-[#1a1a1a] border border-white/10 text-white/70 hover:bg-[#252525] hover:text-white flex items-center justify-center transition-all"
                      aria-label="Scroll right"
                    >
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
                <div
                  ref={carouselRef}
                  onWheel={(e) => e.preventDefault()}
                  className="flex flex-nowrap gap-6 overflow-hidden pb-2 px-2"
                >
                  {filteredRelatedComponents.map((component, idx) => {
                    // Find the original index in relatedComponents for onComponentClick
                    const originalIndex = relatedComponents.findIndex(
                      (c) => c.title === component.title
                    );
                    return (
                    <div
                      key={idx}
                      onClick={() => onComponentClick?.(originalIndex)}
                      className="relative min-w-[380px] max-w-[420px] h-[240px] rounded-xl bg-[#0a0a0a] overflow-hidden flex-shrink-0 cursor-pointer hover:opacity-90 transition-opacity group"
                    >
                      <video
                        src={component.videoSrc}
                        muted
                        loop
                        playsInline
                        autoPlay
                        preload="metadata"
                        className="absolute inset-2 w-[calc(100%-16px)] h-[calc(100%-16px)] object-contain rounded-lg"
                        onError={(e) => {
                          console.error('Video load error:', e);
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      <div className="relative h-full w-full px-6 py-5 flex flex-col justify-end z-10">
                        <div>
                          <h4 className="text-white font-semibold text-lg mb-1">{component.title}</h4>
                          <p className="text-white/50 text-sm">{component.description}</p>
                        </div>
                      </div>
                    </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div 
          className="fixed inset-0 z-[9999] bg-black flex items-center justify-center p-4"
          onClick={() => setIsFullscreen(false)}
        >
          <div 
            className="w-full h-full max-w-7xl flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <video
              src={videoSrc}
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              className="w-full h-full object-contain"
              onError={(e) => {
                console.error('Video load error:', e);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(ComponentShowcasePage);
