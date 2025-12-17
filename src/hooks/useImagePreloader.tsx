
import { useEffect, useState, useRef } from 'react';

interface UseImagePreloaderProps {
  images: string[];
}

export const useImagePreloader = ({ images }: UseImagePreloaderProps) => {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [allLoaded, setAllLoaded] = useState(false);
  const imagesRef = useRef<string[]>([]);
  const loadedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Only reload if images actually changed (deep comparison)
    const imagesStr = images.join(',');
    const prevImagesStr = imagesRef.current.join(',');
    
    if (imagesStr === prevImagesStr) {
      return;
    }

    imagesRef.current = images;

    const preloadImages = async () => {
      // Skip already loaded images
      const imagesToLoad = images.filter(img => !loadedRef.current.has(img));
      
      if (imagesToLoad.length === 0) {
        setLoadedImages(new Set(loadedRef.current));
        setAllLoaded(images.every(img => loadedRef.current.has(img)));
        return;
      }

      const imagePromises = imagesToLoad.map((src) => {
        return new Promise<string>((resolve, reject) => {
          // Check if already in cache
          const img = new Image();
          img.onload = () => {
            loadedRef.current.add(src);
            resolve(src);
          };
          img.onerror = () => reject(src);
          img.src = src;
        });
      });

      try {
        const results = await Promise.allSettled(imagePromises);
        
        results.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            loadedRef.current.add(imagesToLoad[index]);
          }
        });
        
        setLoadedImages(new Set(loadedRef.current));
        setAllLoaded(images.every(img => loadedRef.current.has(img)));
      } catch (error) {
        console.error('Error preloading images:', error);
      }
    };

    if (images.length > 0) {
      preloadImages();
    }
  }, [images]);

  return { loadedImages, allLoaded };
};
