import { MeshGradient } from "@paper-design/shaders-react";
import { ReactNode, useEffect, useRef, useCallback } from "react";

// Store HSL values as [H, S, L] for interpolation
const COLORS_TOP_DATA = [
    [0, 0, 0],
    [270, 80, 25],
    [250, 70, 35],
    [0, 0, 0]
];

const COLORS_BOTTOM_DATA = [
    [0, 0, 0],
    [180, 90, 40],
    [270, 80, 40],
    [0, 0, 0]
];

const COLORS_BLACK_TOP = [
    [0, 0, 0],
    [270, 80, 10],
    [250, 70, 12],
    [0, 0, 0]
];
const COLORS_BLACK_BOTTOM = [
    [0, 0, 0],
    [180, 90, 14],
    [270, 80, 14],
    [0, 0, 0]
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
    const meshRef = useRef<HTMLDivElement>(null);
    const rafRef = useRef<number>();
    const lastT = useRef<number>(-1);

    const updateColors = useCallback(() => {
        const scrollY = window.scrollY;
        const vh = window.innerHeight;

        const p1Start = vh * 0.1;
        const p1End = vh * 1.0;
        const p2Start = vh * 2.5;
        const p2End = vh * 3.5;
        const p3Start = vh * 5.0;
        const p3End = vh * 6.0;
        const p4Start = vh * 7.0;
        const p4End = vh * 8.0;

        let t = 0;

        if (scrollY <= p1Start) {
            t = 0;
        } else if (scrollY < p1End) {
            t = (scrollY - p1Start) / (p1End - p1Start);
        } else if (scrollY < p2Start) {
            t = 1;
        } else if (scrollY < p2End) {
            t = 1 - ((scrollY - p2Start) / (p2End - p2Start));
        } else if (scrollY < p3Start) {
            t = 0;
        } else if (scrollY < p3End) {
            t = (scrollY - p3Start) / (p3End - p3Start);
        } else if (scrollY < p4Start) {
            t = 1;
        } else if (scrollY < p4End) {
            t = 1 - ((scrollY - p4Start) / (p4End - p4Start));
        } else {
            t = 0;
        }

        t = Math.max(0, Math.min(1, t));
        
        // Quantize to reduce updates - only update if t changed significantly
        const quantized = Math.round(t * 50) / 50;
        if (quantized === lastT.current) return;
        lastT.current = quantized;

        // Update MeshGradient via DOM attribute instead of React state
        const colors = getInterpolatedColors(quantized, variant);
        const el = meshRef.current;
        if (el) {
            // Set CSS custom properties for color interpolation
            el.setAttribute('data-colors', JSON.stringify(colors));
            // Dispatch custom event to update MeshGradient
            el.dispatchEvent(new CustomEvent('colors-update', { detail: colors }));
        }
    }, [variant]);

    useEffect(() => {
        const onScroll = () => {
            if (rafRef.current) return;
            rafRef.current = requestAnimationFrame(() => {
                updateColors();
                rafRef.current = undefined;
            });
        };

        window.addEventListener("scroll", onScroll, { passive: true });
        updateColors();

        return () => {
            window.removeEventListener("scroll", onScroll);
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [updateColors]);

    return (
        <div className="relative min-h-screen overflow-hidden">
            <div className="fixed inset-0 z-0 pointer-events-none" ref={meshRef}>
                <MeshGradientWrapper variant={variant} containerRef={meshRef} />
            </div>

            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
}

// Separate component to isolate re-renders from children
import { useState, memo } from "react";

const MeshGradientWrapper = memo(function MeshGradientWrapper({ 
    variant, 
    containerRef 
}: { 
    variant: "default" | "black"; 
    containerRef: React.RefObject<HTMLDivElement | null>;
}) {
    const [colors, setColors] = useState<string[]>(getInterpolatedColors(0, variant));

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const handler = (e: Event) => {
            const detail = (e as CustomEvent).detail;
            if (detail) setColors(detail);
        };

        el.addEventListener('colors-update', handler);
        return () => el.removeEventListener('colors-update', handler);
    }, [containerRef]);

    return (
        <MeshGradient
            style={{ height: "100vh", width: "100vw" }}
            distortion={0.8}
            swirl={0.1}
            offsetX={0}
            offsetY={0}
            scale={1}
            rotation={0}
            speed={0.3}
            colors={colors}
        />
    );
});
