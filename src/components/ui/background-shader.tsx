import { MeshGradient } from "@paper-design/shaders-react";
import { ReactNode, useEffect, useRef, useState } from "react";

// Store HSL values as [H, S, L] for interpolation
const COLORS_TOP_DATA = [
    [0, 0, 0],     // hsl(0, 0%, 0%)
    [270, 80, 25], // hsl(270, 80%, 25%) - Vibrant Purple
    [250, 70, 35], // hsl(250, 70%, 35%) - Deep Blue/Purple
    [0, 0, 0]      // hsl(0, 0%, 0%)
];

const COLORS_BOTTOM_DATA = [
    [0, 0, 0],     // hsl(0, 0%, 0%)
    [180, 90, 40], // hsl(180, 90%, 40%) - Vibrant Cyan
    [270, 80, 40], // hsl(270, 80%, 40%) - Bright Purple
    [0, 0, 0]      // hsl(0, 0%, 0%)
];

// Black variant - same structure as default but dark tones (black as main color)
const COLORS_BLACK_TOP = [
    [0, 0, 0],       // black
    [270, 80, 10],   // dark purple (same hue/sat as default, low lightness)
    [250, 70, 12],   // dark blue-purple
    [0, 0, 0]        // black
];
const COLORS_BLACK_BOTTOM = [
    [0, 0, 0],       // black
    [180, 90, 14],   // dark cyan
    [270, 80, 14],   // dark purple
    [0, 0, 0]        // black
];

function lerp(start: number, end: number, t: number) {
    return start * (1 - t) + end * t;
}

function getInterpolatedColors(t: number, variant: "default" | "black" = "default") {
    const top = variant === "black" ? COLORS_BLACK_TOP : COLORS_TOP_DATA;
    const bottom = variant === "black" ? COLORS_BLACK_BOTTOM : COLORS_BOTTOM_DATA;
    return top.map((c1, i) => {
        const c2 = bottom[i];
        const h = lerp(c1[0], c2[0], t);
        const s = lerp(c1[1], c2[1], t);
        const l = lerp(c1[2], c2[2], t);
        return `hsl(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%)`;
    });
}

export default function BackgroundShader({ children, variant = "default" }: { children?: ReactNode; variant?: "default" | "black" }) {
    // Initial colors
    const [colors, setColors] = useState<string[]>(getInterpolatedColors(0, variant));
    const requestRef = useRef<number>();

    useEffect(() => {
        const handleScroll = () => {
            const scrollY = window.scrollY;
            const vh = window.innerHeight;

            // Phase 1: Hero (Black) -> Turquoise
            const p1Start = vh * 0.1;
            const p1End = vh * 1.0;

            // Phase 2: Turquoise -> Engineered (Black)
            const p2Start = vh * 2.5;
            const p2End = vh * 3.5;

            let t = 0;

            if (scrollY <= p1Start) {
                t = 0;
            } else if (scrollY < p1End) {
                t = (scrollY - p1Start) / (p1End - p1Start);
            } else if (scrollY < p2Start) {
                t = 1;
            } else if (scrollY < p2End) {
                t = 1 - ((scrollY - p2Start) / (p2End - p2Start));
            } else {
                t = 0;
            }

            if (t < 0) t = 0;
            if (t > 1) t = 1;

            setColors(getInterpolatedColors(t, variant));
        };

        const onScroll = () => {
            if (requestRef.current) return;
            requestRef.current = requestAnimationFrame(() => {
                handleScroll();
                requestRef.current = undefined;
            });
        };

        window.addEventListener("scroll", onScroll);
        handleScroll();

        return () => {
            window.removeEventListener("scroll", onScroll);
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [variant]);

    return (
        <div className="relative min-h-screen overflow-hidden">
            <div className="fixed inset-0 z-0 pointer-events-none">
                <MeshGradient
                    style={{ height: "100vh", width: "100vw" }}
                    distortion={0.8}
                    swirl={0.1}
                    offsetX={0}
                    offsetY={0}
                    scale={1}
                    rotation={0}
                    speed={0.5}
                    colors={colors}
                />
            </div>

            <div className="relative z-10 transition-colors duration-500">
                {children}
            </div>
        </div>
    );
}
