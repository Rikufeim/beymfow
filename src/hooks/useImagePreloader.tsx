
import { useEffect, useState } from 'react';

interface UseImagePreloaderProps {
  images: string[];
}

export const useImagePreloader = ({ images }: UseImagePreloaderProps) => {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [allLoaded, setAllLoaded] = useState(false);

  useEffect(() => {
    const preloadImages = async () => {
      const imagePromises = images.map((src) => {
        return new Promise<string>((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(src);
          img.onerror = () => reject(src);
          img.src = src;
        });
      });

      try {
        const results = await Promise.allSettled(imagePromises);
        const loaded = new Set<string>();
        
        results.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            loaded.add(images[index]);
          }
        });
        
        setLoadedImages(loaded);
        setAllLoaded(loaded.size === images.length);
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
