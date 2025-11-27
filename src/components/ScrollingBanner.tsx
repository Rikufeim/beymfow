
import React from "react";

interface ScrollingBannerProps {
  text: string;
  speed?: number;
  spacing?: number;
}

const ScrollingBanner: React.FC<ScrollingBannerProps> = ({
  text,
  speed = 30,
  spacing = 10,
}) => {
  // Simple scrolling effect (placeholder)
  return (
    <div className="overflow-hidden whitespace-nowrap w-full bg-black text-white py-2">
      <div
        style={{
          display: "inline-block",
          whiteSpace: "nowrap",
          animation: `banner-scroll ${speed}s linear infinite`,
        }}
      >
        {Array.from({ length: 10 }).map((_, i) => (
          <span key={i} style={{ marginRight: spacing }}>
            {text}
          </span>
        ))}
      </div>
      <style>
        {`
          @keyframes banner-scroll {
            0% { transform: translateX(0%);}
            100% { transform: translateX(-50%);}
          }
        `}
      </style>
    </div>
  );
};

export default ScrollingBanner;
