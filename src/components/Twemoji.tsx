import React, { memo, useEffect, useRef } from "react";

declare global {
  interface Window {
    twemoji?: {
      parse: (node: HTMLElement | string, options?: object) => void;
    };
  }
}

interface TwemojiProps {
  emoji: string;
  className?: string;
}

/**
 * Twemoji component renders iOS-style Apple emojis using Twitter's Twemoji
 * Works cross-platform (Windows, Linux, macOS, Android)
 */
export const Twemoji = memo(({ emoji, className = "" }: TwemojiProps) => {
  const spanRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (spanRef.current && window.twemoji) {
      window.twemoji.parse(spanRef.current, {
        base: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/",
        folder: "svg",
        ext: ".svg",
      });
    }
  }, [emoji]);

  return (
    <span
      ref={spanRef}
      className={`inline-flex items-center justify-center ${className}`}
      style={{ fontSize: "1.2em", lineHeight: 1 }}
    >
      {emoji}
    </span>
  );
});

Twemoji.displayName = "Twemoji";
