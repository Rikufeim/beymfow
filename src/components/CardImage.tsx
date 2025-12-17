
import React, { useState, useEffect, useCallback, memo } from "react";
import { ImageOff } from "lucide-react";

interface CardImageProps {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  onLoadCallback?: (ok?: boolean) => void;
  priority?: boolean; // For critical images that should load eagerly
}

const CardImage: React.FC<CardImageProps> = ({
  src,
  alt,
  className = "",
  style = {},
  onLoadCallback,
  priority = false,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [error, setError] = useState(false);

  const handleLoad = useCallback(() => {
    setImageLoaded(true);
    onLoadCallback?.(true);
  }, [onLoadCallback]);

  const handleError = useCallback(() => {
    setError(true);
    onLoadCallback?.(false);
  }, [onLoadCallback]);

  // Preload image for better performance
  useEffect(() => {
    if (error) return;
    
    const img = new Image();
    img.onload = handleLoad;
    img.onerror = handleError;
    img.src = src;
  }, [src, handleLoad, handleError, error]);

  if (error) {
    return (
      <div
        className={`flex items-center justify-center bg-muted rounded-lg ${className}`}
        style={style}
      >
        <ImageOff className="w-12 h-12 text-white" />
      </div>
    );
  }

  // Outer container with optimized loading
  return (
    <div className={`relative overflow-hidden rounded-lg group ${className}`} style={style}>
      {!imageLoaded && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover object-center rounded-lg transition-all duration-500 grayscale group-hover:grayscale-0 ${
          imageLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        draggable={false}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        onLoad={handleLoad}
        onError={handleError}
        style={{ 
          display: 'block',
          maxWidth: '100%',
          height: 'auto',
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
          willChange: 'opacity, filter'
        }}
      />
    </div>
  );
};

export default memo(CardImage);

