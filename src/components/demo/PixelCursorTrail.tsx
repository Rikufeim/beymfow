"use client"

import React, { useEffect, useRef, useState, useCallback } from "react"
import { cn } from "@/lib/utils"

interface Pixel {
  id: number
  x: number
  y: number
  opacity: number
  age: number
}

const PIXEL_SIZE = 5
const TRAIL_LENGTH = 100
const FADE_SPEED = 0.05
const SPAWN_PER_FRAME = 8

type PixelCursorTrailProps = {
  className?: string
}

export function PixelCursorTrail({ className }: PixelCursorTrailProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [pixels, setPixels] = useState<Pixel[]>([])
  const pixelIdRef = useRef(0)
  const lastPositionRef = useRef<{ x: number; y: number } | null>(null)
  const targetPositionRef = useRef<{ x: number; y: number } | null>(null)
  const animationRef = useRef<number>()

  const createPixel = useCallback((x: number, y: number) => {
    return {
      id: pixelIdRef.current++,
      x,
      y,
      opacity: 1,
      age: 0,
    }
  }, [])

  const updateTarget = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const rawX = e.clientX - rect.left
    const rawY = e.clientY - rect.top
    const x = Math.min(Math.max(0, rawX), rect.width)
    const y = Math.min(Math.max(0, rawY), rect.height)
    targetPositionRef.current = { x, y }
    if (!lastPositionRef.current) {
      lastPositionRef.current = { x, y }
    }
  }, [])

  const handleMouseMove = useCallback(updateTarget, [updateTarget])

  const handleMouseEnter = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      updateTarget(e)
      if (lastPositionRef.current) {
        const { x, y } = lastPositionRef.current
        setPixels((prev) => [...prev.slice(-TRAIL_LENGTH), createPixel(x, y)])
      }
    },
    [updateTarget, createPixel],
  )

  const handleMouseLeave = useCallback(() => {
    targetPositionRef.current = null
    lastPositionRef.current = null
    setPixels([])
  }, [])

  useEffect(() => {
    const animate = () => {
      setPixels((prev) =>
        prev
          .map((pixel) => ({
            ...pixel,
            opacity: pixel.opacity - FADE_SPEED,
            age: pixel.age + 1,
          }))
          .filter((pixel) => pixel.opacity > 0),
      )

      const last = lastPositionRef.current
      const target = targetPositionRef.current
      if (last && target) {
        const dx = target.x - last.x
        const dy = target.y - last.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        const steps = Math.min(
          SPAWN_PER_FRAME,
          Math.max(1, Math.floor(Math.max(distance, PIXEL_SIZE) / (PIXEL_SIZE / 1.5))),
        )
        const pixelsToAdd: Pixel[] = []
        for (let i = 1; i <= steps; i++) {
          const ix = last.x + (dx / steps) * i
          const iy = last.y + (dy / steps) * i
          pixelsToAdd.push(createPixel(ix, iy))
        }
        lastPositionRef.current = { x: target.x, y: target.y }
        if (pixelsToAdd.length) {
          setPixels((prev) => [...prev.slice(-TRAIL_LENGTH), ...pixelsToAdd])
        }
      }
      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "relative w-full h-full overflow-hidden select-none",
        className
      )}
    >
      {pixels.map((pixel) => {
        const sizeMultiplier = Math.max(0.3, 1 - pixel.age / 100)
        const currentSize = PIXEL_SIZE * sizeMultiplier

        return (
          <div
            key={pixel.id}
            className="absolute pointer-events-none bg-white/60"
            style={{
              left: pixel.x - currentSize / 2,
              top: pixel.y - currentSize / 2,
              width: currentSize,
              height: currentSize,
              opacity: pixel.opacity,
              transition: "width 0.1s ease-out, height 0.1s ease-out",
            }}
          />
        )
      })}
    </div>
  )
}

