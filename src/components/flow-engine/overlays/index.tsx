import React, { useState, useEffect, useRef } from "react";
import type { OverlayEntry, OverlayState } from "@/data/overlayBackgrounds";
import type { OverlayRenderProps } from "./types";

import CSSLiteOverlay from "./CSSLiteOverlay";
import SVGNoiseOverlay from "./SVGNoiseOverlay";
import Canvas2DOverlay from "./Canvas2DOverlay";
import WebGLOverlay from "./WebGLOverlay";

export { CSSLiteOverlay, SVGNoiseOverlay, Canvas2DOverlay, WebGLOverlay };
export type { OverlayRenderProps } from "./types";

function useOverlaySize(containerRef: React.RefObject<HTMLDivElement | null>) {
  const [size, setSize] = useState({ width: 800, height: 450 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0]?.contentRect ?? { width: 800, height: 450 };
      setSize({ width: Math.max(1, width), height: Math.max(1, height) });
    });
    ro.observe(el);
    setSize({ width: Math.max(1, el.clientWidth), height: Math.max(1, el.clientHeight) });
    return () => ro.disconnect();
  }, [containerRef]);

  return size;
}

function useVisibility() {
  const [visible, setVisible] = useState(
    typeof document !== "undefined" ? document.visibilityState === "visible" : true,
  );
  useEffect(() => {
    const onVisibility = () => setVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);
  return visible;
}

export interface OverlayRendererSwitchProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  entry: OverlayEntry | null;
  overlayState: OverlayState;
}

/**
 * Mounts the correct overlay renderer based on entry.renderMode.
 * Unmounts cleanly when overlay changes.
 */
export function OverlayRendererSwitch({
  containerRef,
  entry,
  overlayState,
}: OverlayRendererSwitchProps) {
  const { width, height } = useOverlaySize(containerRef);
  const visible = useVisibility();

  if (!entry || !overlayState.enabled || overlayState.intensity <= 0) {
    return null;
  }

  const props: OverlayRenderProps = {
    entry,
    variant: overlayState.variant,
    intensity: overlayState.intensity,
    reduceMotion: overlayState.reduceMotion,
    visible,
    width,
    height,
  };

  switch (entry.renderMode) {
    case "css-lite":
      return <CSSLiteOverlay {...props} />;
    case "svg-noise":
      return <SVGNoiseOverlay {...props} />;
    case "canvas-2d":
      return <Canvas2DOverlay {...props} />;
    case "webgl-shader":
      return <WebGLOverlay {...props} />;
    default:
      return null;
  }
}
