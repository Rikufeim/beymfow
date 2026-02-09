// ─── Background Library Data ────────────────────────────────────────
// Each entry provides full CSS recipes per variant so the library is
// self-contained and does not depend on the HeroBackgroundWorkspace
// gradient builder.

export type BackgroundCategory =
  | "Soft/Ambient"
  | "Futuristic"
  | "Dark/Editorial"
  | "Expressive"
  | "Space"
  | "Vivid/Alive";

export const BACKGROUND_CATEGORIES: BackgroundCategory[] = [
  "Soft/Ambient",
  "Futuristic",
  "Dark/Editorial",
  "Expressive",
  "Space",
  "Vivid/Alive",
];

export type VariantName = "soft" | "deep" | "highContrast" | "minimal";

export const VARIANT_LABELS: Record<VariantName, string> = {
  soft: "Soft",
  deep: "Deep",
  highContrast: "High Contrast",
  minimal: "Minimal",
};

export interface Overlay {
  kind: "radial" | "linear" | "conic" | "noise" | "stars";
  cssLayer: string;
  opacity?: number;
  blendMode?: string;
}

export interface BackgroundTokens {
  colors: string[];
  stops?: number[];
  blendModes?: string[];
  overlays?: Overlay[];
}

export interface BackgroundRecipe {
  type: "gradient" | "layered" | "noise" | "stars";
  css: string;
  filter?: string;
  tokens: BackgroundTokens;
  supportsSvg: boolean;
  grain?: { enabled: boolean; intensity: number };
}

export interface BackgroundEntry {
  id: string;
  name: string;
  category: BackgroundCategory;
  tags: string[];
  variants: Record<VariantName, BackgroundRecipe>;
}

// ─── Helpers ────────────────────────────────────────────────────────

const GRAIN_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='5' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

function gr(
  colors: { c1: string; c2: string; c3: string; c4: string },
  style: string,
  env: boolean,
): string {
  const { c1, c2, c3, c4 } = colors;
  let bg: string;
  switch (style) {
    case "halo":
      bg = `radial-gradient(ellipse 140% 100% at 50% 50%, ${c3}35 0%, ${c3}20 15%, ${c2}60 40%, ${c2}30 60%, ${c1} 100%)`;
      break;
    case "soft-sweep":
      bg = `linear-gradient(135deg, ${c1} 0%, ${c1}90 10%, ${c2} 25%, ${c2}80 40%, ${c3}45 55%, ${c3}25 70%, ${c4}30 85%, ${c1} 100%)`;
      break;
    case "orb":
      bg = `radial-gradient(circle at 25% 75%, ${c3}55 0%, ${c3}25 20%, transparent 55%), radial-gradient(circle at 75% 25%, ${c4}55 0%, ${c4}25 20%, transparent 55%), linear-gradient(180deg, ${c1} 0%, ${c2}80 40%, ${c2} 100%)`;
      break;
    case "diagonal-blend":
      bg = `linear-gradient(45deg, ${c1} 0%, ${c1}80 12%, ${c2} 25%, ${c2}70 38%, ${c3}65 50%, ${c3}40 62%, ${c4}50 75%, ${c4}25 88%, ${c1} 100%)`;
      break;
    case "noise-wash":
      bg = `linear-gradient(180deg, ${c1} 0%, ${c1}85 15%, ${c2}90 30%, ${c2}60 45%, ${c3}40 60%, ${c3}20 75%, ${c1}80 90%, ${c1} 100%)`;
      break;
    case "aurora":
      bg = `linear-gradient(180deg, ${c1} 0%, ${c2}90 25%, transparent 55%), radial-gradient(ellipse 180% 60% at 50% 0%, ${c3}45 0%, ${c3}20 30%, transparent 65%), radial-gradient(ellipse 120% 50% at 35% 15%, ${c4}40 0%, ${c4}15 25%, transparent 55%), linear-gradient(180deg, ${c1} 0%, ${c2}50 50%, ${c2} 100%)`;
      break;
    case "mesh":
      bg = `radial-gradient(at 40% 20%, ${c3}60 0px, ${c3}30 15%, transparent 55%), radial-gradient(at 80% 5%, ${c4}55 0px, ${c4}25 15%, transparent 55%), radial-gradient(at 5% 55%, ${c2}70 0px, ${c2}35 15%, transparent 55%), radial-gradient(at 85% 55%, ${c3}45 0px, ${c3}20 15%, transparent 55%), radial-gradient(at 10% 95%, ${c4}60 0px, ${c4}30 15%, transparent 55%), radial-gradient(at 85% 95%, ${c2}50 0px, ${c2}25 15%, transparent 55%), ${c1}`;
      break;
    case "spotlight":
      bg = `radial-gradient(ellipse 90% 70% at 50% 30%, ${c3}40 0%, ${c3}20 25%, transparent 65%), radial-gradient(ellipse 70% 50% at 50% 35%, ${c4}30 0%, ${c4}15 20%, transparent 55%), linear-gradient(180deg, ${c1} 0%, ${c2}60 50%, ${c2} 100%)`;
      break;
    case "wave":
      bg = `linear-gradient(180deg, ${c1} 0%, ${c2}70 35%, ${c2} 50%), radial-gradient(ellipse 220% 120% at 50% 100%, ${c3}55 0%, ${c3}25 25%, transparent 55%), radial-gradient(ellipse 180% 100% at 50% 115%, ${c4}50 0%, ${c4}20 20%, transparent 45%)`;
      break;
    case "crystal":
      bg = `linear-gradient(125deg, ${c1} 0%, ${c1}80 10%, ${c2} 22%, ${c2}70 35%, ${c3}35 48%, ${c3}20 58%, ${c4}25 70%, ${c2}60 82%, ${c1} 100%), linear-gradient(45deg, transparent 25%, ${c3}12 50%, transparent 75%)`;
      break;
    case "sunset":
      bg = `linear-gradient(180deg, ${c3}75 0%, ${c3}50 12%, ${c4}65 25%, ${c4}40 40%, ${c2}70 55%, ${c2}40 70%, ${c1}80 85%, ${c1} 100%)`;
      break;
    case "cosmic":
      bg = `radial-gradient(ellipse at 20% 80%, ${c3}40 0%, ${c3}18 20%, transparent 50%), radial-gradient(ellipse at 80% 20%, ${c4}40 0%, ${c4}18 20%, transparent 50%), radial-gradient(ellipse at 50% 50%, ${c2}25 0%, ${c2}10 30%, transparent 65%), radial-gradient(circle at 30% 30%, ${c3}25 0%, ${c3}10 15%, transparent 35%), radial-gradient(circle at 70% 70%, ${c4}25 0%, ${c4}10 15%, transparent 35%), ${c1}`;
      break;
    default:
      bg = c1;
  }
  if (env) {
    bg = `${bg}, radial-gradient(ellipse 100% 50% at 50% 25%, ${c3}20 0%, transparent 70%)`;
  }
  return bg;
}

type Palette = { c1: string; c2: string; c3: string; c4: string };

const P: Record<string, Palette> = {
  obsidian:  { c1: "#0c0c0e", c2: "#18181c", c3: "#3b82f6", c4: "#6366f1" },
  midnight:  { c1: "#0f0f1a", c2: "#1a1a2e", c3: "#4f46e5", c4: "#7c3aed" },
  charcoal:  { c1: "#121214", c2: "#1c1c20", c3: "#64748b", c4: "#94a3b8" },
  aurora:    { c1: "#0a0a12", c2: "#0f172a", c3: "#06b6d4", c4: "#8b5cf6" },
  ember:     { c1: "#0c0a09", c2: "#1c1917", c3: "#f97316", c4: "#ef4444" },
  forest:    { c1: "#0a0f0a", c2: "#14241a", c3: "#22c55e", c4: "#10b981" },
  sapphire:  { c1: "#0a0a14", c2: "#101828", c3: "#2563eb", c4: "#3b82f6" },
  amethyst:  { c1: "#0f0a14", c2: "#1a1028", c3: "#a855f7", c4: "#c084fc" },
  rose:      { c1: "#0f0a0c", c2: "#1c1418", c3: "#ec4899", c4: "#f472b6" },
  sunset:    { c1: "#0c0908", c2: "#1a1410", c3: "#f59e0b", c4: "#fb923c" },
  copper:    { c1: "#0c0a08", c2: "#1c1610", c3: "#d97706", c4: "#ea580c" },
  arctic:    { c1: "#0a0e12", c2: "#0f1720", c3: "#38bdf8", c4: "#22d3ee" },
  slate:     { c1: "#0f1115", c2: "#1e2128", c3: "#475569", c4: "#64748b" },
};

function makeVariants(
  palette: Palette,
  style: string,
  opts?: { grainSoft?: boolean; grainAll?: boolean },
): Record<VariantName, BackgroundRecipe> {
  const isPure = !opts?.grainAll;
  const colors = [palette.c1, palette.c2, palette.c3, palette.c4];

  const base = (brightness: number, env: boolean, grain?: { enabled: boolean; intensity: number }): BackgroundRecipe => ({
    type: grain?.enabled ? "noise" : "gradient",
    css: gr(palette, style, env),
    filter: `brightness(${brightness})`,
    tokens: { colors },
    supportsSvg: !grain?.enabled,
    grain,
  });

  return {
    soft: base(1.15, true, opts?.grainSoft ? { enabled: true, intensity: 0.12 } : undefined),
    deep: base(0.88, true, { enabled: true, intensity: 0.22 }),
    highContrast: base(1.32, true, opts?.grainAll ? { enabled: true, intensity: 0.15 } : undefined),
    minimal: base(1.05, false, undefined),
  };
}

// ─── Library ────────────────────────────────────────────────────────

export const BACKGROUND_LIBRARY: BackgroundEntry[] = [
  // ── Soft / Ambient ──────────────────────────────────────
  {
    id: "fog-bloom",
    name: "Fog Bloom",
    category: "Soft/Ambient",
    tags: ["fog", "soft", "mist", "gentle"],
    variants: makeVariants(P.arctic, "soft-sweep"),
  },
  {
    id: "satin-haze",
    name: "Satin Haze",
    category: "Soft/Ambient",
    tags: ["satin", "haze", "smooth", "ambient"],
    variants: makeVariants(P.amethyst, "halo"),
  },
  {
    id: "warm-dusk",
    name: "Warm Dusk",
    category: "Soft/Ambient",
    tags: ["warm", "dusk", "sunset", "calm"],
    variants: makeVariants(P.sunset, "aurora"),
  },
  {
    id: "cool-mist",
    name: "Cool Mist",
    category: "Soft/Ambient",
    tags: ["cool", "mist", "gentle", "minimal"],
    variants: makeVariants(P.slate, "orb"),
  },

  // ── Futuristic ──────────────────────────────────────────
  {
    id: "neon-sheen",
    name: "Neon Sheen",
    category: "Futuristic",
    tags: ["neon", "sheen", "grid", "future"],
    variants: makeVariants(P.aurora, "mesh"),
  },
  {
    id: "ion-sweep",
    name: "Ion Sweep",
    category: "Futuristic",
    tags: ["ion", "sweep", "wave", "pulse"],
    variants: makeVariants(P.sapphire, "wave"),
  },
  {
    id: "holo-edge",
    name: "Holo Edge",
    category: "Futuristic",
    tags: ["holo", "edge", "crystal", "sharp"],
    variants: makeVariants(P.arctic, "crystal"),
  },

  // ── Dark / Editorial ────────────────────────────────────
  {
    id: "ink-gradient",
    name: "Ink Gradient",
    category: "Dark/Editorial",
    tags: ["ink", "editorial", "dark", "deep"],
    variants: makeVariants(P.obsidian, "noise-wash", { grainSoft: true }),
  },
  {
    id: "carbon-night",
    name: "Carbon Night",
    category: "Dark/Editorial",
    tags: ["carbon", "night", "noir", "shadow"],
    variants: makeVariants(P.charcoal, "diagonal-blend"),
  },
  {
    id: "velvet-shadow",
    name: "Velvet Shadow",
    category: "Dark/Editorial",
    tags: ["velvet", "shadow", "moody", "dark"],
    variants: makeVariants(P.midnight, "halo", { grainSoft: true }),
  },

  // ── Expressive ──────────────────────────────────────────
  {
    id: "sunset-flare",
    name: "Sunset Flare",
    category: "Expressive",
    tags: ["sunset", "flare", "warm", "bold"],
    variants: makeVariants(P.ember, "sunset"),
  },
  {
    id: "magma-flow",
    name: "Magma Flow",
    category: "Expressive",
    tags: ["magma", "flow", "lava", "hot"],
    variants: makeVariants(P.copper, "wave"),
  },
  {
    id: "tropical-pulse",
    name: "Tropical Pulse",
    category: "Expressive",
    tags: ["tropical", "pulse", "vivid", "energy"],
    variants: makeVariants(P.forest, "aurora"),
  },

  // ── Space ───────────────────────────────────────────────
  {
    id: "galaxy-core",
    name: "Galaxy Core",
    category: "Space",
    tags: ["space", "galaxy", "core", "stars"],
    variants: makeVariants(P.amethyst, "cosmic", { grainAll: true }),
  },
  {
    id: "void-horizon",
    name: "Void Horizon",
    category: "Space",
    tags: ["space", "void", "horizon", "dark"],
    variants: makeVariants(P.sapphire, "diagonal-blend", { grainAll: true }),
  },
  {
    id: "aurora-glow",
    name: "Aurora Glow",
    category: "Space",
    tags: ["space", "aurora", "glow", "northern-lights"],
    variants: makeVariants(P.aurora, "aurora", { grainSoft: true }),
  },
  {
    id: "nebula-drift",
    name: "Nebula Drift",
    category: "Space",
    tags: ["space", "nebula", "drift", "cosmic"],
    variants: makeVariants(P.midnight, "cosmic", { grainAll: true }),
  },
  {
    id: "starfield-fade",
    name: "Starfield Fade",
    category: "Space",
    tags: ["space", "stars", "starfield", "night"],
    variants: makeVariants(P.obsidian, "orb", { grainAll: true }),
  },
  {
    id: "deep-orbit",
    name: "Deep Orbit",
    category: "Space",
    tags: ["space", "orbit", "deep", "dark"],
    variants: makeVariants(P.charcoal, "spotlight", { grainAll: true }),
  },

  // ── Vivid / Alive ──────────────────────────────────────
  {
    id: "candy-aurora",
    name: "Candy Aurora",
    category: "Vivid/Alive",
    tags: ["candy", "aurora", "vivid", "glow"],
    variants: makeVariants(P.rose, "aurora"),
  },
  {
    id: "prism-wave",
    name: "Prism Wave",
    category: "Vivid/Alive",
    tags: ["prism", "wave", "vivid", "dynamic"],
    variants: makeVariants(P.aurora, "wave"),
  },
];

// ─── Filtering Utilities ────────────────────────────────────────────

export function filterBackgrounds(
  entries: BackgroundEntry[],
  options: {
    category?: BackgroundCategory;
    search?: string;
    tags?: string[];
  },
): BackgroundEntry[] {
  let results = entries;

  if (options.category) {
    results = results.filter((e) => e.category === options.category);
  }

  if (options.tags && options.tags.length > 0) {
    const required = options.tags.map((t) => t.toLowerCase());
    results = results.filter((e) =>
      required.every((rt) => e.tags.some((et) => et.toLowerCase().includes(rt))),
    );
  }

  if (options.search) {
    const q = options.search.trim().toLowerCase();
    if (q) {
      results = results.filter((e) => {
        const haystack = `${e.name} ${e.tags.join(" ")} ${e.category}`.toLowerCase();
        return haystack.includes(q);
      });
    }
  }

  return results;
}

// ─── CSS / Token Export Helpers ──────────────────────────────────────

export function recipeToCssString(recipe: BackgroundRecipe): string {
  let result = `background: ${recipe.css};`;
  if (recipe.filter) {
    result += `\nfilter: ${recipe.filter};`;
  }
  return result;
}

export function recipeToTailwind(recipe: BackgroundRecipe): string {
  // Tailwind can't express complex layered gradients inline.
  // Return an arbitrary value approach.
  const escaped = recipe.css.replace(/'/g, "\\'");
  let tw = `bg-[${escaped}]`;
  if (recipe.filter) {
    tw += ` [filter:${recipe.filter}]`;
  }
  return tw;
}

export function recipeToTokensJson(recipe: BackgroundRecipe): string {
  return JSON.stringify(
    {
      type: recipe.type,
      colors: recipe.tokens.colors,
      stops: recipe.tokens.stops,
      blendModes: recipe.tokens.blendModes,
      grain: recipe.grain,
      filter: recipe.filter,
      css: recipe.css,
    },
    null,
    2,
  );
}

export { GRAIN_SVG };
