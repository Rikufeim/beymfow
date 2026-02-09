import type { OverlayEntry, VariantName } from "@/data/overlayBackgrounds";

export interface OverlayRenderProps {
  entry: OverlayEntry;
  variant: VariantName;
  intensity: number;
  reduceMotion: boolean;
  visible: boolean;
  /** Container width/height for canvas/svg (from ResizeObserver or props) */
  width: number;
  height: number;
}
