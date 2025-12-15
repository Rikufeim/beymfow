"use client"

import React, { useEffect, useRef, useState } from "react"

interface TextEffectProps {
  text: string
  hoverText?: string
  href?: string
  className?: string
  delay?: number
}

export function TextGlitch({ text, hoverText, href, className = "", delay = 0 }: TextEffectProps) {
  const textRef = useRef<HTMLHeadingElement>(null)
  const spanRef = useRef<HTMLSpanElement>(null)
  const [displayText] = useState(text)
  const [displayHoverText, setDisplayHoverText] = useState(hoverText || text)
  const hoverIntervalRef = useRef<number | null>(null)
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"

  useEffect(() => {
    const loadGSAP = async () => {
      try {
        const { gsap } = await import("gsap")

        if (textRef.current) {
          gsap.set(textRef.current, {
            backgroundSize: "0%",
            scale: 0.95,
            opacity: 0.9,
          })

          const tl = gsap.timeline({ delay })

          tl.to(textRef.current, {
            opacity: 1,
            scale: 1,
            duration: 0.6,
            ease: "back.out(1.7)",
          }).to(
            textRef.current,
            {
              backgroundSize: "100%",
              duration: 1.4,
              ease: "power2.out",
            },
            "-=0.2",
          )
        }
      } catch {
        // If gsap is not available, skip the intro animation gracefully.
      }
    }

    loadGSAP()
  }, [delay])

  const handleMouseEnter = () => {
    if (hoverText) {
      let iteration = 0

      if (hoverIntervalRef.current) {
        clearInterval(hoverIntervalRef.current)
      }

      hoverIntervalRef.current = window.setInterval(() => {
        setDisplayHoverText(
          hoverText
            .split("")
            .map((letter, index) => {
              if (index < iteration) {
                return hoverText[index]
              }
              return letters[Math.floor(Math.random() * 26)]
            })
            .join(""),
        )

        if (iteration >= hoverText.length) {
          clearInterval(hoverIntervalRef.current!)
        }

        iteration += 1 / 3
      }, 30)
    }

    if (spanRef.current) {
      spanRef.current.style.clipPath = "polygon(0 0, 100% 0, 100% 100%, 0 100%)"
    }
  }

  const handleMouseLeave = () => {
    if (hoverIntervalRef.current) {
      clearInterval(hoverIntervalRef.current)
    }
    setDisplayHoverText(hoverText || text)

    if (spanRef.current) {
      spanRef.current.style.clipPath = "polygon(0 50%, 100% 50%, 100% 50%, 0 50%)"
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (hoverIntervalRef.current) {
        clearInterval(hoverIntervalRef.current)
      }
    }
  }, [])

  const spanContent = hoverText ? (
    href ? (
      <a href={href} target="_blank" rel="noreferrer" className="no-underline text-inherit">
        {displayHoverText}
      </a>
    ) : (
      displayHoverText
    )
  ) : (
    text
  )

  return (
    <h1
      ref={textRef}
      className={`
        text-[10vw] font-bold leading-none tracking-tight m-0 
        text-white
        bg-transparent
        flex flex-col items-start justify-center relative
        transition-all duration-500 ease-out
        cursor-pointer
        overflow-hidden
        ${className}
      `}
      style={{
        width: "100%",
        maxWidth: "100%",
        wordBreak: "break-word",
        whiteSpace: "nowrap",
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {displayText}
      <span
        ref={spanRef}
        className="
          absolute w-full h-full 
          text-white font-bold
          flex flex-col justify-center
          transition-all duration-400 ease-out
          pointer-events-none
          overflow-hidden
        "
        style={{
          clipPath: "polygon(0 50%, 100% 50%, 100% 50%, 0 50%)",
          transformOrigin: "center",
          backgroundColor: "#000000",
          maxWidth: "100%",
          whiteSpace: "nowrap",
        }}
      >
        {spanContent}
      </span>
    </h1>
  )
}

