import React, { useState, useRef, useEffect } from "react";
import { PromptCard } from "./prompt-card";
import { PromptModal } from "./prompt-modal";
import { PROMPTS, type PromptItem } from "@/data/prompts";
import { cn } from "@/lib/utils";

export function PromptSidebar({ className }: { className?: string }) {
  const [selectedPrompt, setSelectedPrompt] = useState<PromptItem | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isMouseActiveRef = useRef(false);
  const mouseMoveRafRef = useRef<number | null>(null);

  const handleCardClick = (prompt: PromptItem) => {
    setSelectedPrompt(prompt);
    setIsModalOpen(true);
  };

  const handleCloseModal = (open: boolean) => {
    setIsModalOpen(open);
    if (!open) {
      setTimeout(() => {
        setSelectedPrompt(null);
      }, 200);
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    let scrollTimeout: NodeJS.Timeout;
    let animationFrameId: number | null = null;
    let rafScheduled = false;

    // Passive 3D effect - optimized and systematic
    const updatePassive3D = () => {
      rafScheduled = false;
      
      if (isMouseActiveRef.current) {
        scheduleNextFrame();
        return;
      }

      const containerRect = container.getBoundingClientRect();
      if (containerRect.width === 0 || containerRect.height === 0) {
        scheduleNextFrame();
        return;
      }

      const containerWidth = containerRect.width;
      const containerCenterX = containerRect.left + containerWidth / 2;
      const cards = container.querySelectorAll('.prompt-card-3d');
      
      // Limit to visible cards for performance - only process what's needed
      const maxCards = Math.min(cards.length, 8);
      
      for (let i = 0; i < maxCards; i++) {
        const card = cards[i] as HTMLElement;
        if (!card) continue;
        
        const cardRect = card.getBoundingClientRect();
        
        // Only process visible cards (tighter bounds for performance)
        if (cardRect.right < containerRect.left - 250 || cardRect.left > containerRect.right + 250) {
          continue;
        }
        
        // Calculate position relative to container center
        const cardCenterX = cardRect.left + cardRect.width / 2;
        const offsetX = (cardCenterX - containerCenterX) / (containerWidth / 2);
        const absOffset = Math.abs(offsetX);
        
        // Systematic depth effect - cards in center come forward
        // Simplified calculation for better performance
        const depthFactor = Math.max(0, 1 - absOffset * 1.5);
        const translateZ = depthFactor * 15; // Reduced for smoother performance
        
        // Subtle rotation for perspective
        const rotateY = offsetX * 0.8;
        
        // Use translate3d for GPU acceleration
        card.style.transform = `translate3d(0, 0, ${translateZ}px) rotateY(${rotateY}deg)`;
        card.style.zIndex = `${Math.round(translateZ)}`;
      }

      scheduleNextFrame();
    };

    let lastUpdateTime = 0;
    const UPDATE_INTERVAL = 100; // Update every 100ms for better performance
    
    const scheduleNextFrame = () => {
      if (!rafScheduled) {
        rafScheduled = true;
        animationFrameId = requestAnimationFrame((timestamp) => {
          // Throttle updates for better performance
          if (timestamp - lastUpdateTime >= UPDATE_INTERVAL) {
            lastUpdateTime = timestamp;
            updatePassive3D();
          } else {
            scheduleNextFrame();
          }
        });
      }
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      
      const marquee = container.querySelector('.animate-marquee') as HTMLElement;
      if (marquee) {
        marquee.style.animationPlayState = 'paused';
      }
      
      container.scrollLeft += e.deltaY * 0.5;
      
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const marquee = container.querySelector('.animate-marquee') as HTMLElement;
        if (marquee && !container.matches(':hover')) {
          marquee.style.animationPlayState = 'running';
        }
      }, 150);
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    scheduleNextFrame();

    return () => {
      container.removeEventListener('wheel', handleWheel);
      clearTimeout(scrollTimeout);
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  return (
    <>
      <div className={cn("relative flex w-full flex-col items-center justify-center", className)}>
        <div 
          ref={scrollContainerRef}
          className="group flex overflow-x-auto overflow-y-hidden [--gap:1rem] [gap:var(--gap)] flex-row [--duration:120s] w-full scrollbar-hide"
          style={{ 
            scrollBehavior: 'smooth',
            perspective: '1200px',
            perspectiveOrigin: 'center center',
            transformStyle: 'preserve-3d',
            transform: 'translateZ(0)',
            willChange: 'scroll-position'
          }}
          onMouseEnter={(e) => {
            const container = e.currentTarget;
            const marquee = container.querySelector('.animate-marquee') as HTMLElement;
            if (marquee) {
              marquee.style.animationPlayState = 'paused';
            }
            isMouseActiveRef.current = true;
          }}
          onMouseMove={(e) => {
            const container = e.currentTarget;
            const rect = container.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0) return;
            
            const mouseX = e.clientX;
            const mouseY = e.clientY;
            const containerCenterX = rect.left + rect.width / 2;
            const containerCenterY = rect.top + rect.height / 2;
            
            // Smooth 3D effect when carousel is paused
            if (mouseMoveRafRef.current === null) {
              mouseMoveRafRef.current = requestAnimationFrame(() => {
                mouseMoveRafRef.current = null;
                
                const cards = container.querySelectorAll('.prompt-card-3d');
                const maxCards = Math.min(cards.length, 8);
                
                for (let i = 0; i < maxCards; i++) {
                  const card = cards[i] as HTMLElement;
                  if (!card) continue;
                  
                  const cardRect = card.getBoundingClientRect();
                  
                  // Only process visible cards
                  if (cardRect.right < rect.left - 250 || cardRect.left > rect.right + 250) {
                    continue;
                  }
                  
                  const cardCenterX = cardRect.left + cardRect.width / 2;
                  const cardCenterY = cardRect.top + cardRect.height / 2;
                  
                  // Calculate distance from mouse to card center
                  const deltaX = mouseX - cardCenterX;
                  const deltaY = mouseY - cardCenterY;
                  const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                  const maxDistance = Math.max(rect.width, rect.height) * 0.7;
                  const normalizedDistance = Math.min(distance / maxDistance, 1);
                  
                  // Calculate position relative to container center
                  const offsetX = (cardCenterX - containerCenterX) / (rect.width / 2);
                  const offsetY = (cardCenterY - containerCenterY) / (rect.height / 2);
                  
                  // Elegant 3D transform - smooth and refined
                  const baseDepth = Math.max(0, 1 - Math.abs(offsetX) * 1.3);
                  const mouseDepth = (1 - normalizedDistance) * 0.7;
                  const translateZ = Math.min(baseDepth * 25 + mouseDepth * 45, 70);
                  
                  // Smooth rotation
                  const rotateY = offsetX * 1.2 + (deltaX / rect.width) * 4;
                  const rotateX = -(deltaY / rect.height) * 1.5;
                  
                  // Smooth easing curve
                  const easeOut = 1 - Math.pow(normalizedDistance, 1.5);
                  
                  // Subtle scale for depth
                  const scale = 1 + (1 - normalizedDistance) * 0.02;
                  
                  // Parallax movement for smooth effect
                  const parallaxX = offsetX * 2;
                  const parallaxY = offsetY * 1;
                  
                  // Set z-index based on translateZ to prevent overlap
                  const zIndex = Math.round(translateZ * easeOut);
                  card.style.zIndex = `${zIndex}`;
                  
                  card.style.transform = `translate3d(${parallaxX * easeOut}px, ${parallaxY * easeOut}px, ${translateZ * easeOut}px) rotateY(${rotateY * easeOut}deg) rotateX(${rotateX * easeOut}deg) scale(${scale})`;
                }
              });
            }
          }}
          onMouseLeave={(e) => {
            const container = e.currentTarget;
            const marquee = container.querySelector('.animate-marquee') as HTMLElement;
            if (marquee) {
              marquee.style.animationPlayState = 'running';
            }
            
            isMouseActiveRef.current = false;
            
            // Reset z-index and transforms smoothly
            const cards = container.querySelectorAll('.prompt-card-3d');
            cards.forEach((card) => {
              const cardElement = card as HTMLElement;
              cardElement.style.zIndex = '0';
              // Transform reset will be handled by passive 3D effect
            });
          }}
        >
          <div 
            className="flex shrink-0 justify-around [gap:var(--gap)] animate-marquee flex-row will-change-transform group-hover:[animation-play-state:paused]" 
            style={{ 
              transformStyle: 'preserve-3d',
              transform: 'translateZ(0)',
              backfaceVisibility: 'hidden'
            }}
          >
            {/* Render prompts multiple times for seamless loop - more copies for smoother infinite scroll */}
            {[...Array(6)].map((_, setIndex) =>
              PROMPTS.map((prompt) => (
                <PromptCard
                  key={`${setIndex}-${prompt.id}`}
                  id={prompt.id}
                  title={prompt.title}
                  subtitle={prompt.subtitle}
                  onClick={() => handleCardClick(prompt)}
                />
              ))
            )}
          </div>
        </div>

        {/* Gradient fades removed for edge-to-edge layout */}
      </div>

      {/* Modal for full prompt */}
      {selectedPrompt && (
        <PromptModal
          open={isModalOpen}
          onOpenChange={handleCloseModal}
          title={selectedPrompt.title}
          fullPrompt={selectedPrompt.fullPrompt}
        />
      )}
    </>
  );
}

