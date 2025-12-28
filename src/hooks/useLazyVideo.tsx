import { useEffect, useRef, useState } from 'react';

/**
 * Hook to lazy load videos when they come into viewport
 * Improves performance by only loading videos when needed
 */
export const useLazyVideo = (options?: IntersectionObserverInit) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            setShouldLoad(true);
            // Start loading video when in view
            if (video.dataset.src) {
              video.src = video.dataset.src;
              video.removeAttribute('data-src');
            }
            // Unobserve after loading
            observer.unobserve(video);
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before entering viewport
        threshold: 0.1,
        ...options,
      }
    );

    observer.observe(video);

    return () => {
      observer.disconnect();
    };
  }, []);

  return { videoRef, shouldLoad, isInView };
};


