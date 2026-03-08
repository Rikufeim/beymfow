import { useCallback } from "react";

// Route to component mapping for prefetching
const routeMap: Record<string, () => Promise<any>> = {
  "/": () => import("../pages/Index"),
  "/flow-engine": () => import("../pages/FlowEnginePage"),
  "/about": () => import("../pages/About"),
  "/image-generator": () => import("../pages/ImageGenerator"),
  "/planningsystem": () => import("../pages/PlanningSystem"),
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

