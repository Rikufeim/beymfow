import React, { useRef, useEffect, useState, Suspense, lazy } from "react";
import type { OverlayRenderProps } from "./types";

const R3FCanvas = lazy(() =>
  import("@react-three/fiber").then((m) => ({ default: m.Canvas })),
);

const DeepSpaceScene = lazy(() =>
  import("./scenes/DeepSpaceScene").then((m) => ({ default: m.default })),
);

const NebulaCoreScene = lazy(() =>
  import("./scenes/NebulaCoreScene").then((m) => ({ default: m.default })),
);

const DPR = typeof window !== "undefined" ? Math.min(window.devicePixelRatio, 1.5) : 1;

/**
 * WebGL overlay container: mounts R3F Canvas and the correct scene by rendererId.
 * Respects visible (pause when tab hidden), reduceMotion, intensity.
 */
const WebGLOverlay: React.FC<OverlayRenderProps> = ({
  entry,
  variant,
  intensity,
  reduceMotion,
  visible,
  width,
  height,
}) => {
  const [mounted, setMounted] = useState(false);
  const mod = entry.variantMods[variant];
  const opacity = (intensity / 100) * mod.opacityScale;

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(t);
  }, []);

  if (opacity <= 0 || width < 10 || height < 10) return null;

  const Scene =
    entry.rendererId === "nebula-core" ? NebulaCoreScene : DeepSpaceScene;

  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{ opacity }}
      aria-hidden
    >
      {mounted && (
        <Suspense fallback={null}>
          <R3FCanvas
            gl={{
              alpha: true,
              antialias: true,
              powerPreference: "high-performance",
              preserveDrawingBuffer: false,
            }}
            onCreated={({ gl }) => {
              gl.setClearColor(0x000000, 0);
            }}
            camera={{ position: [0, 0, 5], fov: 60 }}
            frameloop={visible ? "always" : "never"}
            dpr={[1, DPR]}
            style={{ width, height, display: "block", background: "transparent" }}
          >
            <Scene
              variant={variant}
              speedScale={reduceMotion ? 0 : mod.speedScale}
              opacityScale={mod.opacityScale}
            />
          </R3FCanvas>
        </Suspense>
      )}
    </div>
  );
};

export default WebGLOverlay;
