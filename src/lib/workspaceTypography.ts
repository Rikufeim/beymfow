/**
 * Typography helper for workspace nodes
 * Maps nodeScale to font size multipliers
 */
export function getFontScale(nodeScale: number): number {
  // Keep it in a reasonable range
  const clamped = Math.min(Math.max(nodeScale, 0.9), 1.4);
  return clamped;
}

/**
 * Typography scale for different text levels
 */
export const typographyScale = {
  // Node header title
  header: (fontScale: number) => 13 * fontScale,
  // Section labels (COLORS, FONT, etc.)
  label: (fontScale: number) => 10 * fontScale,
  // Body text / textarea content
  body: (fontScale: number) => 12 * fontScale,
  // Prompt Window (slightly larger)
  promptWindow: (fontScale: number) => 13 * fontScale,
  promptWindowHeader: (fontScale: number) => 13.5 * fontScale,
};

