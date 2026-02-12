"use client";
import React, { useEffect, useId, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRef } from "react";
import { cn } from "@/lib/utils";
import { SparklesCore } from "@/components/ui/sparkles";

export const Cover = ({
    children,
    className,
}: {
    children?: React.ReactNode;
    className?: string;
}) => {
    const ref = useRef<HTMLDivElement>(null);

    const [containerWidth, setContainerWidth] = useState(0);
    const [beamPositions, setBeamPositions] = useState<number[]>([]);

    useEffect(() => {
        if (ref.current) {
            setContainerWidth(ref.current?.clientWidth ?? 0);

            const height = ref.current?.clientHeight ?? 0;
            const numberOfBeams = Math.floor(height / 10);
            const positions = Array.from(
                { length: numberOfBeams },
                (_, i) => (i + 1) * (height / (numberOfBeams + 1))
            );
            setBeamPositions(positions);
        }
    }, [ref.current]);

    return (
        <div
            ref={ref}
            className={cn(
                "relative group/cover block w-full px-2 py-2 transition-all duration-500 rounded-sm",
                className
            )}
        >
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                    opacity: {
                        duration: 0.8,
                    },
                }}
                className="h-full w-full overflow-hidden absolute inset-0 backdrop-blur-[2px]"
            >
                <motion.div
                    animate={{
                        translateX: ["-50%", "0%"],
                    }}
                    transition={{
                        translateX: {
                            duration: 15,
                            ease: "easeInOut",
                            repeat: Infinity,
                        },
                    }}
                    className="w-[200%] h-full flex"
                >
                    <SparklesCore
                        background="transparent"
                        minSize={0.3}
                        maxSize={0.8}
                        particleDensity={400}
                        className="w-full h-full"
                        particleColor="#FFFFFF"
                        speed={2}
                    />
                    <SparklesCore
                        background="transparent"
                        minSize={0.3}
                        maxSize={0.8}
                        particleDensity={400}
                        className="w-full h-full"
                        particleColor="#FFFFFF"
                        speed={2}
                    />
                </motion.div>
            </motion.div>
            {beamPositions.map((position, index) => (
                <Beam
                    key={index}
                    duration={Math.random() * 3 + 2}
                    delay={Math.random() * 3 + 1}
                    width={containerWidth}
                    style={{
                        top: `${position}px`,
                    }}
                />
            ))}
            <span
                className={cn(
                    "dark:text-white inline-block text-neutral-900 relative z-20 transition-all duration-500",
                    className
                )}
                style={{
                    textRendering: "optimizeLegibility",
                    WebkitFontSmoothing: "antialiased",
                }}
            >
                {children}
            </span>
        </div>
    );
};

export const Beam = ({
    className,
    delay,
    duration,
    width = 600,
    ...svgProps
}: {
    className?: string;
    delay?: number;
    duration?: number;
    width?: number;
} & React.ComponentProps<typeof motion.svg>) => {
    const id = useId();

    return (
        <motion.svg
            width={width ?? "600"}
            height="1"
            viewBox={`0 0 ${width ?? "600"} 1`}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={cn("absolute inset-x-0 w-full opacity-70", className)}
            {...svgProps}
        >
            <motion.path
                d={`M0 0.5H${width ?? "600"}`}
                stroke={`url(#svgGradient-${id})`}
            />

            <defs>
                <motion.linearGradient
                    id={`svgGradient-${id}`}
                    gradientUnits="userSpaceOnUse"
                    initial={{
                        x1: "0%",
                        x2: "-5%",
                        y1: 0,
                        y2: 0,
                    }}
                    animate={{
                        x1: "110%",
                        x2: "105%",
                        y1: 0,
                        y2: 0,
                    }}
                    transition={{
                        duration: duration ?? 4,
                        ease: "easeInOut",
                        repeat: Infinity,
                        delay: 0,
                        repeatDelay: delay ?? 2,
                    }}
                >
                    <stop stopColor="#2EB9DF" stopOpacity="0" />
                    <stop stopColor="#3b82f6" stopOpacity="0.6" />
                    <stop offset="1" stopColor="#3b82f6" stopOpacity="0" />
                </motion.linearGradient>
            </defs>
        </motion.svg>
    );
};
