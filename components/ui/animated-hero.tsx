import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

type CTAConfig = {
  text: string;
  href?: string;
  onClick?: () => void;
};

type CTAButtonProps = React.ComponentPropsWithoutRef<"button"> & {
  asChild?: boolean;
};

export const GradientButton = React.forwardRef<
  HTMLButtonElement,
  CTAButtonProps
>(({ className, asChild = false, children, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      ref={ref}
      className={cn(
        "relative inline-flex items-center justify-center rounded-full px-6 py-3 text-xs font-semibold uppercase tracking-[0.4em] text-white transition-transform duration-300 ease-out",
        "bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 shadow-[0_0_2.5rem_rgba(79,70,229,0.45)] hover:scale-[1.04] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300",
        className,
      )}
      {...props}
    >
      {children}
    </Comp>
  );
});
GradientButton.displayName = "GradientButton";

export const OutlineButton = React.forwardRef<
  HTMLButtonElement,
  CTAButtonProps
>(({ className, asChild = false, children, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-full border border-white/30 px-6 py-3 text-xs font-semibold uppercase tracking-[0.4em] text-white transition duration-300 ease-out",
        "bg-white/0 hover:bg-white/5 hover:border-white/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300",
        className,
      )}
      {...props}
    >
      {children}
    </Comp>
  );
});
OutlineButton.displayName = "OutlineButton";

type ParticleDefinition = {
  key: string;
  normalizedX: number;
  normalizedY: number;
  distance: number;
  baseScale: number;
  baseOpacity: number;
  color: string;
  glow: string;
  phase: number;
};

export interface ParticleHeroProps {
  title?: string;
  subtitle?: string;
  description?: string;
  particleCount?: number;
  interactiveHint?: string;
  primaryButton?: CTAConfig;
  secondaryButton?: CTAConfig;
  className?: string;
}

const DEFAULT_TITLE = "Power for creators.";
const DEFAULT_SUBTITLE = "Flow for everyone.";
const DEFAULT_DESCRIPTION =
  "Turn ideas into prompts, content, and systems inside the Beymflow Lab.";
const DEFAULT_HINT = "Move to shape the flow";

export function ParticleHero({
  title = DEFAULT_TITLE,
  subtitle = DEFAULT_SUBTITLE,
  description = DEFAULT_DESCRIPTION,
  interactiveHint = DEFAULT_HINT,
  primaryButton,
  secondaryButton,
  particleCount = 15,
  className,
}: ParticleHeroProps) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const targetRef = React.useRef({ x: 0, y: 0 });
  const offsetRef = React.useRef({ x: 0, y: 0 });
  const lastInteractionRef = React.useRef<number>(performance.now());
  const animationFrameRef = React.useRef<number>();

  const [animationState, setAnimationState] = React.useState({
    offset: { x: 0, y: 0 },
    time: 0,
  });

  const count = React.useMemo(() => clamp(Math.round(particleCount), 10, 18), [
    particleCount,
  ]);

  const particles = React.useMemo<ParticleDefinition[]>(() => {
    const result: ParticleDefinition[] = [];
    const maxDistance = Math.sqrt(2);

    for (let y = 0; y < count; y++) {
      for (let x = 0; x < count; x++) {
        const normalizedX = count === 1 ? 0 : (x / (count - 1)) * 2 - 1;
        const normalizedY = count === 1 ? 0 : (y / (count - 1)) * 2 - 1;
        const distance = Math.min(
          Math.sqrt(normalizedX ** 2 + normalizedY ** 2) / maxDistance,
          1,
        );

        const hue = clamp(220 + distance * 40, 190, 270);
        const lightness = clamp(70 - distance * 25, 45, 70);
        const color = `hsl(${hue}, 90%, ${lightness}%)`;
        const glow = `0 0 0.75rem hsla(${hue}, 90%, 60%, 0.85)`;
        const baseScale = clamp(1 - distance * 0.55, 0.25, 1.05);
        const baseOpacity = clamp(0.95 - distance * 0.55, 0.25, 0.95);

        result.push({
          key: `${x}-${y}`,
          normalizedX,
          normalizedY,
          distance,
          baseScale,
          baseOpacity,
          color,
          glow,
          phase: Math.random() * Math.PI * 2,
        });
      }
    }

    return result;
  }, [count]);

  const animate = React.useCallback(
    (time: number) => {
      const seconds = time / 1000;
      const now = performance.now();
      const isIdle = now - lastInteractionRef.current > 1500;
      const idleTarget = {
        x: Math.sin(seconds * 0.35) * 0.35,
        y: Math.cos(seconds * 0.4) * 0.35,
      };
      const target = isIdle ? idleTarget : targetRef.current;
      const smoothing = isIdle ? 0.06 : 0.1;

      const nextX = offsetRef.current.x + (target.x - offsetRef.current.x) * smoothing;
      const nextY = offsetRef.current.y + (target.y - offsetRef.current.y) * smoothing;

      const ambientDriftX = Math.sin(seconds * 0.9) * 0.05;
      const ambientDriftY = Math.cos(seconds * 1.1) * 0.05;

      const offset = {
        x: nextX + ambientDriftX,
        y: nextY + ambientDriftY,
      };

      offsetRef.current = offset;
      setAnimationState({
        offset,
        time: seconds,
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    },
    [],
  );

  React.useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [animate]);

  const handlePointerMove = React.useCallback<
    React.PointerEventHandler<HTMLDivElement>
  >((event) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = ((event.clientY - rect.top) / rect.height) * 2 - 1;
    targetRef.current = { x, y };
    lastInteractionRef.current = performance.now();
  }, []);

  const handlePointerLeave = React.useCallback(() => {
    targetRef.current = { x: 0, y: 0 };
  }, []);

  const renderCTA = (
    config: CTAConfig | undefined,
    Variant: typeof GradientButton | typeof OutlineButton,
  ) => {
    if (!config) return null;
    const { text, href, onClick } = config;
    const content = text.toUpperCase();

    if (href) {
      return (
        <Variant asChild key={content} onClick={onClick}>
          <a href={href}>{content}</a>
        </Variant>
      );
    }

    return (
      <Variant key={content} onClick={onClick}>
        {content}
      </Variant>
    );
  };

  return (
    <section
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={cn(
        "relative isolate overflow-hidden bg-black text-white",
        "py-24 sm:py-32",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -left-24 h-72 w-72 rounded-full bg-cyan-400/30 blur-3xl" />
        <div className="absolute -bottom-40 -right-24 h-80 w-80 rounded-full bg-purple-600/30 blur-3xl" />
      </div>

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div
          className="grid"
          style={{
            gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))`,
            gap: "clamp(0.75rem, 1.5vw, 1.4rem)",
            width: "min(60rem, 90vw)",
            height: "min(60rem, 90vw)",
          }}
        >
          {particles.map((particle) => {
            const translationStrength = 42 * (1 - particle.distance) + 6;
            const translateX =
              animationState.offset.x * translationStrength +
              Math.cos(animationState.time * 0.9 + particle.phase) * 4;
            const translateY =
              animationState.offset.y * translationStrength +
              Math.sin(animationState.time * 0.9 + particle.phase) * 4;

            const scale = clamp(
              particle.baseScale +
                Math.sin(animationState.time * 1.4 + particle.phase) * 0.15,
              0.2,
              1.1,
            );
            const opacity = clamp(
              particle.baseOpacity +
                Math.cos(animationState.time * 1.1 + particle.phase) * 0.2,
              0.2,
              1,
            );

            return (
              <div
                key={particle.key}
                className="flex items-center justify-center"
                style={{
                  transform: `translate3d(${translateX}px, ${translateY}px, 0)`
                    .concat(" ")
                    .concat(`scale(${scale})`),
                  transition: "transform 0.05s linear",
                  willChange: "transform",
                }}
              >
                <span
                  className="block h-3.5 w-3.5 rounded-full mix-blend-screen"
                  style={{
                    background: particle.color,
                    boxShadow: particle.glow,
                    opacity,
                    transition: "opacity 0.2s ease-out",
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>

      <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-16 px-6 sm:px-10">
        <div className="max-w-3xl space-y-6">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-cyan-300/80">
            {interactiveHint}
          </p>
          <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl md:text-6xl">
            <span className="block">{title}</span>
            <span className="block text-white/90">{subtitle}</span>
          </h1>
          {description ? (
            <p className="max-w-xl text-base text-white/70 sm:text-lg">
              {description}
            </p>
          ) : null}
          <div className="flex flex-wrap items-center gap-4">
            {renderCTA(primaryButton, GradientButton)}
            {renderCTA(secondaryButton, OutlineButton)}
          </div>
        </div>
      </div>
    </section>
  );
}
