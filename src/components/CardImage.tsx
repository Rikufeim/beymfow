
import React, { useState } from "react";
import { motion } from "framer-motion";
import { ImageOff } from "lucide-react";

interface CardImageProps {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  onLoadCallback?: (ok?: boolean) => void;
}

const CardImage: React.FC<CardImageProps> = ({
  src,
  alt,
  className = "",
  style = {},
  onLoadCallback,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [error, setError] = useState(false);

  // Preload image for better performance
  React.useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImageLoaded(true);
      if (onLoadCallback) {
        onLoadCallback(true);
      }
    };
    img.onerror = () => {
      setError(true);
      if (onLoadCallback) {
        onLoadCallback(false);
      }
    };
    img.src = src;
  }, [src, onLoadCallback]);

  const handleLoad = () => {
    setImageLoaded(true);
    if (onLoadCallback) {
      onLoadCallback(true);
    }
  };

  const handleError = () => {
    setError(true);
    if (onLoadCallback) {
      onLoadCallback(false);
    }
  };

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
    <div className={`relative overflow-hidden rounded-lg ${className}`} style={style}>
      {!imageLoaded && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover object-center rounded-lg transition-opacity duration-200 ${
          imageLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        draggable={false}
        loading="eager"
        decoding="async"
        onLoad={handleLoad}
        onError={handleError}
        style={{ 
          display: 'block',
          maxWidth: '100%',
          height: 'auto',
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
          willChange: 'opacity'
        }}
      />
    </div>
  );
};

export default CardImage;

