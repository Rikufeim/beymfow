import { useEffect, useRef, useCallback } from 'react';

/**
 * Optimized scroll handler with RAF throttling and passive listeners
 */
export function useOptimizedScroll(
  callback: (scrollY: number) => void,
  deps: React.DependencyList = []
) {
  const rafRef = useRef<number | null>(null);
  const lastScrollY = useRef<number>(0);

  const handleScroll = useCallback(() => {
    // Cancel any pending RAF
    if (rafRef.current !== null) {
      return; // Already scheduled
    }

    rafRef.current = requestAnimationFrame(() => {
      const scrollY = window.scrollY;
      if (scrollY !== lastScrollY.current) {
        lastScrollY.current = scrollY;
        callback(scrollY);
      }
      rafRef.current = null;
    });
  }, [callback]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [handleScroll, ...deps]);
}

/**
 * Throttled scroll handler for scroll-linked animations
 */
export function useThrottledCallback<T extends (...args: any[]) => void>(
  callback: T,
  delay: number = 16 // ~60fps
): T {
  const rafRef = useRef<number | null>(null);
  const lastArgs = useRef<Parameters<T> | null>(null);
  const lastCall = useRef<number>(0);

  return useCallback((...args: Parameters<T>) => {
    lastArgs.current = args;
    const now = performance.now();
    
    if (now - lastCall.current >= delay) {
      lastCall.current = now;
      callback(...args);
      return;
    }

    if (rafRef.current === null) {
      rafRef.current = requestAnimationFrame(() => {
        if (lastArgs.current) {
          callback(...lastArgs.current);
          lastCall.current = performance.now();
        }
        rafRef.current = null;
      });
    }
  }, [callback, delay]) as T;
}
