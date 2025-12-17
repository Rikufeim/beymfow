import { useCallback } from "react";

// Route to component mapping for prefetching
const routeMap: Record<string, () => Promise<any>> = {
  "/": () => import("../pages/Index"),
  "/features": () => import("../pages/Features"),
  "/premium": () => import("../pages/Premium"),
  "/flow-engine": () => import("../pages/FlowEnginePage"),
  "/prompt-lab-page": () => import("../pages/PromptLabPage"),
  "/auth": () => import("../pages/Auth"),
  "/about": () => import("../pages/About"),
  "/templates": () => import("../pages/TemplatesPage"),
  "/business-prompts": () => import("../pages/BusinessPrompts"),
  "/prompt-lab": () => import("../pages/PromptLab"),
  "/prompt-library": () => import("../pages/PromptLibrary"),
  "/image-generator": () => import("../pages/ImageGenerator"),
  "/planningsystem": () => import("../pages/PlanningSystem"),
  "/prompt-lab/ai-generator": () => import("../pages/promptlab/AIGenerator"),
  "/prompt-lab/checking": () => import("../pages/promptlab/PromptChecking"),
  "/prompt-lab/image-prompts": () => import("../pages/promptlab/ImagePrompts"),
  "/prompt-lab/video-prompts": () => import("../pages/promptlab/VideoPrompts"),
  "/prompt-lab/text-detector": () => import("../pages/promptlab/TextDetector"),
  "/prompt-lab/humanizer": () => import("../pages/promptlab/Humanizer"),
  "/multiagentpage": () => import("../pages/Multiagentpage"),
};

/**
 * Hook to prefetch a route component on hover
 * This improves perceived performance by loading components before navigation
 */
export const usePrefetchRoute = () => {
  const prefetchRoute = useCallback((path: string) => {
    const prefetchFn = routeMap[path];
    if (prefetchFn) {
      // Prefetch in the background without blocking
      requestIdleCallback(() => {
        prefetchFn();
      }, { timeout: 2000 });
    }
  }, []);

  return { prefetchRoute };
};

// Polyfill for requestIdleCallback if not available
if (typeof window !== "undefined" && !window.requestIdleCallback) {
  (window as any).requestIdleCallback = (callback: IdleRequestCallback, options?: IdleRequestOptions) => {
    const timeout = options?.timeout || 0;
    const start = Date.now();
    return setTimeout(() => {
      callback({
        didTimeout: false,
        timeRemaining: () => Math.max(0, 50 - (Date.now() - start)),
      });
    }, timeout);
  };
}

