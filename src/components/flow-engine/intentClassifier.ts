export type PaletteIntent = "refine" | "reset" | "ambiguous";

const REFINE_KEYWORDS = ["adjust", "refine", "more", "less", "deeper", "softer", "calmer"];
const RESET_KEYWORDS = ["new", "reset", "different", "start over", "completely"];

const hasKeyword = (value: string, keyword: string): boolean => {
  if (keyword.includes(" ")) {
    return value.includes(keyword);
  }

  const pattern = new RegExp(`\\b${keyword}\\b`, "i");
  return pattern.test(value);
};

export const classifyPaletteIntent = (input: string): PaletteIntent => {
  const normalized = input.toLowerCase();
  const hasRefine = REFINE_KEYWORDS.some((keyword) => hasKeyword(normalized, keyword));
  const hasReset = RESET_KEYWORDS.some((keyword) => hasKeyword(normalized, keyword));

  if (hasReset && !hasRefine) return "reset";
  if (hasRefine && !hasReset) return "refine";
  return "ambiguous";
};
