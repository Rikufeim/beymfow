/**
 * Bridge between Color Codes workspace and Prompt Generator.
 * Stores the latest color palette so the Prompt Generator can pre-fill context.
 */

export interface ColorPromptPayload {
  colors: { color1: string; color2: string; color3: string; color4: string };
  gradientStyle: string;
  brightness: number;
  grainEnabled: boolean;
  /** Human-readable summary for the prompt input */
  summary: string;
  timestamp: number;
}

const STORAGE_KEY = "beymflow_color_prompt_bridge";

export const setColorPromptPayload = (payload: ColorPromptPayload) => {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // fallback: module-level variable
    (window as any).__colorPromptPayload = payload;
  }
};

export const getColorPromptPayload = (): ColorPromptPayload | null => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // noop
  }
  return (window as any).__colorPromptPayload ?? null;
};

export const clearColorPromptPayload = () => {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // noop
  }
  delete (window as any).__colorPromptPayload;
};

/**
 * Build a human-readable color summary from settings.
 */
export const buildColorSummary = (
  colors: ColorPromptPayload["colors"],
  gradientStyle: string,
): string => {
  return `Color palette: ${colors.color1}, ${colors.color2}, ${colors.color3}, ${colors.color4}. Gradient style: ${gradientStyle}. Create a complete website color theme and design system prompt based on these colors. Include background, text, accent, border, and interactive element colors. Make it production-ready for a modern web application.`;
};
