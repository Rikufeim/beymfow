"use client";

import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

type HyperTextProps = {
  text: string;
  className?: string;
};

export function HyperText({ text, className }: HyperTextProps) {
  const spanRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const element = spanRef.current;
    if (!element) return;

    let interval: number | undefined;

    const scramble = () => {
      let iteration = 0;
      const original = text;

      clearInterval(interval);

      interval = window.setInterval(() => {
        if (!element) return;

        const scrambled = original
          .split("")
          .map((letter, index) => {
            if (index < iteration) {
              return original[index];
            }
            return LETTERS[Math.floor(Math.random() * LETTERS.length)];
          })
          .join("");

        element.textContent = scrambled;

        iteration += 1 / 3;

        if (iteration >= original.length) {
          element.textContent = original;
          clearInterval(interval);
        }
      }, 30);
    };

    element.addEventListener("mouseenter", scramble);

    return () => {
      element.removeEventListener("mouseenter", scramble);
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [text]);

  return (
    <span
      ref={spanRef}
      className={cn(
        "inline-block font-semibold uppercase tracking-[0.2em] text-white",
        className
      )}
    >
      {text}
    </span>
  );
}

export default HyperText;


