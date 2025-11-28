import { GlassButton } from "@/components/ui/glass-button";
import { Zap, Sparkles, Send, Home } from "lucide-react";

const DottedBackground = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height="100%"
    width="100%"
    className="pointer-events-none absolute inset-0 z-0"
  >
    <defs>
      <pattern
        patternUnits="userSpaceOnUse"
        height="30"
        width="30"
        id="dottedGrid"
      >
        <circle
          fill="oklch(from var(--foreground) l c h / 30%)"
          r="1"
          cy="2"
          cx="2"
        ></circle>
      </pattern>
    </defs>
    <rect fill="url(#dottedGrid)" height="100%" width="100%"></rect>
  </svg>
);

const GlassButtonDemo = () => {
  return (
    <div className="relative flex h-screen w-full flex-col items-center justify-center gap-8 bg-black p-10">
      <DottedBackground />
      
      <div className="z-10 text-center space-y-12">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Glass Button Component</h1>
          <p className="text-neutral-400">Beautiful glassmorphic buttons for modern UIs</p>
        </div>

        <div className="space-y-8">
          <div>
            <h3 className="text-sm text-neutral-500 mb-4 uppercase tracking-wider">Sizes</h3>
            <div className="flex flex-wrap items-center justify-center gap-6">
              <GlassButton size="sm">
                Small
              </GlassButton>
              <GlassButton size="default">
                Default
              </GlassButton>
              <GlassButton size="lg">
                Large
              </GlassButton>
            </div>
          </div>

          <div>
            <h3 className="text-sm text-neutral-500 mb-4 uppercase tracking-wider">With Icons</h3>
            <div className="flex flex-wrap items-center justify-center gap-6">
              <GlassButton
                size="default"
                contentClassName="flex items-center gap-2"
              >
                <span>Generate</span>
                <Zap className="h-5 w-5" />
              </GlassButton>
              
              <GlassButton
                size="default"
                contentClassName="flex items-center gap-2"
              >
                <Sparkles className="h-5 w-5" />
                <span>Create</span>
              </GlassButton>

              <GlassButton
                size="default"
                contentClassName="flex items-center gap-2"
              >
                <span>Send</span>
                <Send className="h-5 w-5" />
              </GlassButton>
            </div>
          </div>

          <div>
            <h3 className="text-sm text-neutral-500 mb-4 uppercase tracking-wider">Icon Only</h3>
            <div className="flex flex-wrap items-center justify-center gap-6">
              <GlassButton size="icon">
                <Zap className="h-5 w-5" />
              </GlassButton>
              
              <GlassButton size="icon">
                <Sparkles className="h-5 w-5" />
              </GlassButton>

              <GlassButton size="icon">
                <Send className="h-5 w-5" />
              </GlassButton>

              <GlassButton size="icon">
                <Home className="h-5 w-5" />
              </GlassButton>
            </div>
          </div>

          <div>
            <h3 className="text-sm text-neutral-500 mb-4 uppercase tracking-wider">States</h3>
            <div className="flex flex-wrap items-center justify-center gap-6">
              <GlassButton size="default">
                Enabled
              </GlassButton>
              
              <GlassButton size="default" disabled>
                Disabled
              </GlassButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlassButtonDemo;
