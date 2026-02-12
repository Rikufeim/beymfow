import type { HeroBackgroundSettings } from "./HeroBackgroundWorkspace";

const normalizeHex = (hex: string): string => {
  const clean = hex.replace("#", "").trim();
  if (clean.length === 3) {
    return `#${clean[0]}${clean[0]}${clean[1]}${clean[1]}${clean[2]}${clean[2]}`;
  }
  return `#${clean.padEnd(6, "0")}`; // Fallback for partial inputs
};

export const buildHeroGradient = (settings: HeroBackgroundSettings): string => {
  const { singleColorMode, gradientStyle, environmentEnabled } = settings;
  const color1 = normalizeHex(settings.color1);
  const color2 = normalizeHex(settings.color2);
  const color3 = normalizeHex(settings.color3);
  const color4 = normalizeHex(settings.color4);

  let background: string;

  if (singleColorMode) {
    return color1;
  }

  switch (gradientStyle) {
    case "halo":
      background = `radial-gradient(ellipse 140% 100% at 50% 50%, ${color3}35 0%, ${color3}20 15%, ${color2}60 40%, ${color2}30 60%, ${color1} 100%)`;
      break;
    case "soft-sweep":
      background = `linear-gradient(135deg, ${color1} 0%, ${color1}90 10%, ${color2} 25%, ${color2}80 40%, ${color3}45 55%, ${color3}25 70%, ${color4}30 85%, ${color1} 100%)`;
      break;
    case "orb":
      background = `radial-gradient(circle at 25% 75%, ${color3}55 0%, ${color3}25 20%, transparent 55%), radial-gradient(circle at 75% 25%, ${color4}55 0%, ${color4}25 20%, transparent 55%), linear-gradient(180deg, ${color1} 0%, ${color2}80 40%, ${color2} 100%)`;
      break;
    case "diagonal-blend":
      background = `linear-gradient(45deg, ${color1} 0%, ${color1}80 12%, ${color2} 25%, ${color2}70 38%, ${color3}65 50%, ${color3}40 62%, ${color4}50 75%, ${color4}25 88%, ${color1} 100%)`;
      break;
    case "noise-wash":
      background = `linear-gradient(180deg, ${color1} 0%, ${color1}85 15%, ${color2}90 30%, ${color2}60 45%, ${color3}40 60%, ${color3}20 75%, ${color1}80 90%, ${color1} 100%)`;
      break;
    case "aurora":
      background = `linear-gradient(180deg, ${color1} 0%, ${color2}90 25%, transparent 55%), radial-gradient(ellipse 180% 60% at 50% 0%, ${color3}45 0%, ${color3}20 30%, transparent 65%), radial-gradient(ellipse 120% 50% at 35% 15%, ${color4}40 0%, ${color4}15 25%, transparent 55%), linear-gradient(180deg, ${color1} 0%, ${color2}50 50%, ${color2} 100%)`;
      break;
    case "mesh":
      background = `radial-gradient(at 40% 20%, ${color3}60 0px, ${color3}30 15%, transparent 55%), radial-gradient(at 80% 5%, ${color4}55 0px, ${color4}25 15%, transparent 55%), radial-gradient(at 5% 55%, ${color2}70 0px, ${color2}35 15%, transparent 55%), radial-gradient(at 85% 55%, ${color3}45 0px, ${color3}20 15%, transparent 55%), radial-gradient(at 10% 95%, ${color4}60 0px, ${color4}30 15%, transparent 55%), radial-gradient(at 85% 95%, ${color2}50 0px, ${color2}25 15%, transparent 55%), ${color1}`;
      break;
    case "spotlight":
      background = `radial-gradient(ellipse 90% 70% at 50% 30%, ${color3}40 0%, ${color3}20 25%, transparent 65%), radial-gradient(ellipse 70% 50% at 50% 35%, ${color4}30 0%, ${color4}15 20%, transparent 55%), linear-gradient(180deg, ${color1} 0%, ${color2}60 50%, ${color2} 100%)`;
      break;
    case "wave":
      background = `linear-gradient(180deg, ${color1} 0%, ${color2}70 35%, ${color2} 50%), radial-gradient(ellipse 220% 120% at 50% 100%, ${color3}55 0%, ${color3}25 25%, transparent 55%), radial-gradient(ellipse 180% 100% at 50% 115%, ${color4}50 0%, ${color4}20 20%, transparent 45%)`;
      break;
    case "crystal":
      background = `linear-gradient(125deg, ${color1} 0%, ${color1}80 10%, ${color2} 22%, ${color2}70 35%, ${color3}35 48%, ${color3}20 58%, ${color4}25 70%, ${color2}60 82%, ${color1} 100%), linear-gradient(45deg, transparent 25%, ${color3}12 50%, transparent 75%)`;
      break;
    case "sunset":
      background = `linear-gradient(180deg, ${color3}75 0%, ${color3}50 12%, ${color4}65 25%, ${color4}40 40%, ${color2}70 55%, ${color2}40 70%, ${color1}80 85%, ${color1} 100%)`;
      break;
    case "cosmic":
      background = `radial-gradient(ellipse at 20% 80%, ${color3}40 0%, ${color3}18 20%, transparent 50%), radial-gradient(ellipse at 80% 20%, ${color4}40 0%, ${color4}18 20%, transparent 50%), radial-gradient(ellipse at 50% 50%, ${color2}25 0%, ${color2}10 30%, transparent 65%), radial-gradient(circle at 30% 30%, ${color3}25 0%, ${color3}10 15%, transparent 35%), radial-gradient(circle at 70% 70%, ${color4}25 0%, ${color4}10 15%, transparent 35%), ${color1}`;
      break;

    // --- 20 New Premium Styles ---

    // --- 20 New Premium Styles (Refined for High Quality & Palette Strictness) ---

    case "nebula-cloud": // Deep, soft, ambient clusters
      background = `
        radial-gradient(circle at 15% 50%, ${color3}40 0%, transparent 50%),
        radial-gradient(circle at 85% 30%, ${color4}40 0%, transparent 50%),
        radial-gradient(circle at 50% 80%, ${color2}50 0%, transparent 60%),
        radial-gradient(at 50% 0%, ${color3}30 0%, transparent 50%),
        radial-gradient(at 0% 0%, ${color2}40 0%, transparent 50%),
        linear-gradient(180deg, transparent 0%, ${color1} 100%),
        ${color1}
      `;
      break;

    case "radial-pulse": // Soft, emanating ripples
      background = `
        radial-gradient(circle at 50% 50%, transparent 0%, ${color1} 100%),
        radial-gradient(circle at 50% 50%, ${color3}25 0%, transparent 20%),
        radial-gradient(circle at 50% 50%, transparent 20%, ${color4}25 25%, transparent 35%),
        radial-gradient(circle at 50% 50%, transparent 40%, ${color2}25 45%, transparent 55%),
        radial-gradient(circle at 50% 50%, transparent 60%, ${color3}15 65%, transparent 80%),
        radial-gradient(circle at 50% 50%, ${color2}15 0%, ${color1} 100%),
        ${color1}
      `;
      break;

    case "glass-shards": // Subtle, refractive-looking angles
      background = `
        linear-gradient(115deg, transparent 40%, ${color3}35 45%, transparent 50%),
        linear-gradient(225deg, transparent 40%, ${color4}35 45%, transparent 50%),
        linear-gradient(65deg, transparent 30%, ${color2}30 35%, transparent 40%),
        linear-gradient(180deg, ${color1} 0%, transparent 100%),
        linear-gradient(45deg, ${color1} 20%, ${color2}40 100%),
        ${color1}
      `;
      break;

    case "grid-perspective": // High-end fading grid
      background = `
        linear-gradient(180deg, ${color1} 20%, transparent 100%),
        repeating-linear-gradient(90deg, transparent 0, transparent 40px, ${color3}25 40px, ${color3}00 41px),
        repeating-linear-gradient(0deg, transparent 0, transparent 40px, ${color4}25 40px, ${color4}00 41px),
        radial-gradient(ellipse at 50% 0%, ${color2}50 0%, transparent 70%),
        ${color1}
      `;
      break;

    case "fluid-flow": // Smooth, organic liquid motion
      background = `
        radial-gradient(70% 70% at 20% 30%, ${color3}50 0%, transparent 100%),
        radial-gradient(80% 80% at 80% 20%, ${color4}50 0%, transparent 100%),
        radial-gradient(90% 60% at 50% 90%, ${color2}60 0%, transparent 100%),
        linear-gradient(135deg, ${color1} 0%, ${color1}80 50%, ${color1} 100%),
        ${color1}
      `;
      break;

    case "cyber-grid": // Glowing, technical grid
      background = `
        linear-gradient(0deg, transparent 24%, ${color3}30 25%, ${color3}30 26%, transparent 27%, transparent 74%, ${color3}30 75%, ${color3}30 76%, transparent 77%),
        linear-gradient(90deg, transparent 24%, ${color3}30 25%, ${color3}30 26%, transparent 27%, transparent 74%, ${color3}30 75%, ${color3}30 76%, transparent 77%),
        radial-gradient(circle at 50% 50%, ${color4}35 0%, transparent 60%),
        ${color1}
      `;
      break;

    case "bokeh-lights": // Cinematic out-of-focus orbs
      background = `
        radial-gradient(circle at 20% 20%, ${color3}40 5%, transparent 20%),
        radial-gradient(circle at 80% 30%, ${color4}40 10%, transparent 25%),
        radial-gradient(circle at 40% 70%, ${color2}40 15%, transparent 35%),
        radial-gradient(circle at 70% 80%, ${color3}35 10%, transparent 30%),
        radial-gradient(circle at 50% 50%, ${color1}00, ${color1} 100%),
        ${color1}
      `;
      break;

    case "velvet-wrap": // Rich, deep folds
      background = `
        linear-gradient(105deg, ${color1} 20%, ${color2}40 40%, ${color1} 60%),
        linear-gradient(160deg, transparent 30%, ${color3}30 50%, transparent 70%),
        radial-gradient(ellipse at 50% 0%, ${color4}30 0%, transparent 80%),
        ${color1}
      `;
      break;

    case "prism-refraction": // Glass dispersion effects
      background = `
        linear-gradient(120deg, transparent 30%, ${color3}40 48%, transparent 52%),
        linear-gradient(125deg, transparent 35%, ${color4}40 52%, transparent 58%),
        linear-gradient(115deg, transparent 25%, ${color2}40 44%, transparent 50%),
        radial-gradient(circle at 0% 0%, ${color3}20 0%, transparent 40%),
        ${color1}
      `;
      break;

    case "midnight-mist": // Heavy, atmospheric fog
      background = `
        linear-gradient(0deg, ${color1} 0%, transparent 80%),
        radial-gradient(ellipse at 50% 100%, ${color3}40 0%, transparent 60%),
        radial-gradient(ellipse at 20% 80%, ${color2}35 0%, transparent 50%),
        radial-gradient(ellipse at 80% 80%, ${color4}35 0%, transparent 50%),
        ${color1}
      `;
      break;

    case "solar-wind": // Directional energy flow
      background = `
        linear-gradient(100deg, ${color1} 0%, transparent 50%, ${color1} 100%),
        linear-gradient(95deg, transparent 20%, ${color3}30 50%, transparent 80%),
        linear-gradient(105deg, transparent 10%, ${color4}30 60%, transparent 90%),
        radial-gradient(circle at 0% 50%, ${color2}50 0%, transparent 50%),
        ${color1}
      `;
      break;

    case "digital-rain": // Subtle vertical data streams
      background = `
        linear-gradient(180deg, ${color1} 0%, transparent 20%, ${color1} 100%),
        linear-gradient(90deg, ${color1} 20%, transparent 20%, transparent 21%, ${color1} 21%),
        repeating-linear-gradient(180deg, transparent 0, transparent 10px, ${color3}25 10px, ${color3}00 20px),
        radial-gradient(ellipse at 50% 0%, ${color4}40 0%, transparent 60%),
        ${color1}
      `;
      break;

    case "abstract-curves": // Large sweeping geometry
      background = `
        radial-gradient(circle at 100% 0%, ${color3}45 0%, transparent 40%),
        radial-gradient(circle at 0% 100%, ${color4}45 0%, transparent 40%),
        radial-gradient(circle at 0% 0%, ${color2}40 0%, transparent 50%),
        radial-gradient(circle at 100% 100%, ${color3}35 0%, transparent 50%),
        ${color1}
      `;
      break;

    case "neon-smoke": // Vibrant, hazy colored smoke
      background = `
        radial-gradient(circle at 30% 40%, ${color3}45, transparent 60%),
        radial-gradient(circle at 70% 60%, ${color4}45, transparent 60%),
        radial-gradient(circle at 50% 50%, ${color2}40, transparent 70%),
        linear-gradient(0deg, ${color1} 0%, transparent 50%, ${color1} 100%),
        ${color1}
      `;
      break;

    case "geometric-shapes": // Modern subtle polygons
      background = `
        linear-gradient(30deg, transparent 40%, ${color3}25 40%, ${color3}25 60%, transparent 60%),
        linear-gradient(150deg, transparent 35%, ${color4}25 35%, ${color4}25 65%, transparent 65%),
        linear-gradient(90deg, transparent 45%, ${color2}25 45%, ${color2}25 55%, transparent 55%),
        radial-gradient(circle at 50% 50%, transparent 0%, ${color1} 100%),
        ${color1}
      `;
      break;

    case "silk-drape": // Flowing fabric
      background = `
        linear-gradient(110deg, ${color1} 30%, ${color2}30 45%, ${color1} 60%),
        linear-gradient(115deg, transparent 35%, ${color3}25 50%, transparent 65%),
        radial-gradient(ellipse at 50% 0%, ${color4}30 0%, transparent 70%),
        ${color1}
      `;
      break;

    case "vortex-spin": // Soft spiral
      background = `
        conic-gradient(from 180deg at 50% 50%, ${color1} 0deg, ${color3}30 120deg, ${color1} 180deg, ${color4}30 240deg, ${color1} 360deg),
        radial-gradient(circle at 50% 50%, ${color2}40 0%, transparent 60%),
        ${color1}
      `;
      break;

    case "glitch-noise": // High-tech digital artifacts
      background = `
        repeating-linear-gradient(90deg, transparent 0, transparent 4px, ${color1} 4px, ${color1} 8px),
        linear-gradient(90deg, ${color3}25 0%, transparent 100%),
        repeating-linear-gradient(0deg, transparent 0, transparent 2px, ${color4}15 2px, ${color4}00 4px),
        ${color1}
      `;
      break;

    case "star-cluster": // Varied star field
      background = `
        radial-gradient(1px 1px at 10% 10%, ${color3}80, transparent),
        radial-gradient(1.5px 1.5px at 35% 65%, ${color4}90, transparent),
        radial-gradient(2px 2px at 85% 25%, ${color3}70, transparent),
        radial-gradient(1px 1px at 55% 45%, ${color2}80, transparent),
        radial-gradient(circle at 50% 20%, ${color4}30, transparent 50%),
        ${color1}
      `;
      break;

    case "liquid-metal": // Glossy, reflective
      background = `
        linear-gradient(145deg, ${color1} 20%, ${color2}40 40%, ${color3}50 50%, ${color2}40 60%, ${color1} 80%),
        radial-gradient(circle at 80% 20%, ${color4}40 0%, transparent 40%),
        radial-gradient(circle at 20% 80%, ${color3}40 0%, transparent 40%),
        ${color1}
      `;
      break;

    default:
      background = color1;
  }

  if (environmentEnabled) {
    background = `${background}, radial-gradient(ellipse 100% 50% at 50% 25%, ${color3}40 0%, transparent 70%)`;
  }

  return background;
};

