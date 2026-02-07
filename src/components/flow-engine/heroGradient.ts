import type { HeroBackgroundSettings } from "./HeroBackgroundWorkspace";

export const buildHeroGradient = (settings: HeroBackgroundSettings): string => {
  const { color1, color2, color3, color4, singleColorMode, gradientStyle, environmentEnabled } = settings;

  let background: string;

  switch (gradientStyle) {
    case "halo":
      background = singleColorMode
        ? color1
        : `radial-gradient(ellipse 140% 100% at 50% 50%, ${color3}35 0%, ${color3}20 15%, ${color2}60 40%, ${color2}30 60%, ${color1} 100%)`;
      break;
    case "soft-sweep":
      background = singleColorMode
        ? color1
        : `linear-gradient(135deg, ${color1} 0%, ${color1}90 10%, ${color2} 25%, ${color2}80 40%, ${color3}45 55%, ${color3}25 70%, ${color4}30 85%, ${color1} 100%)`;
      break;
    case "orb":
      background = singleColorMode
        ? color1
        : `radial-gradient(circle at 25% 75%, ${color3}55 0%, ${color3}25 20%, transparent 55%), radial-gradient(circle at 75% 25%, ${color4}55 0%, ${color4}25 20%, transparent 55%), linear-gradient(180deg, ${color1} 0%, ${color2}80 40%, ${color2} 100%)`;
      break;
    case "diagonal-blend":
      background = singleColorMode
        ? color1
        : `linear-gradient(45deg, ${color1} 0%, ${color1}80 12%, ${color2} 25%, ${color2}70 38%, ${color3}65 50%, ${color3}40 62%, ${color4}50 75%, ${color4}25 88%, ${color1} 100%)`;
      break;
    case "noise-wash":
      background = singleColorMode
        ? color1
        : `linear-gradient(180deg, ${color1} 0%, ${color1}85 15%, ${color2}90 30%, ${color2}60 45%, ${color3}40 60%, ${color3}20 75%, ${color1}80 90%, ${color1} 100%)`;
      break;
    case "aurora":
      background = singleColorMode
        ? color1
        : `linear-gradient(180deg, ${color1} 0%, ${color2}90 25%, transparent 55%), radial-gradient(ellipse 180% 60% at 50% 0%, ${color3}45 0%, ${color3}20 30%, transparent 65%), radial-gradient(ellipse 120% 50% at 35% 15%, ${color4}40 0%, ${color4}15 25%, transparent 55%), linear-gradient(180deg, ${color1} 0%, ${color2}50 50%, ${color2} 100%)`;
      break;
    case "mesh":
      background = singleColorMode
        ? color1
        : `radial-gradient(at 40% 20%, ${color3}60 0px, ${color3}30 15%, transparent 55%), radial-gradient(at 80% 5%, ${color4}55 0px, ${color4}25 15%, transparent 55%), radial-gradient(at 5% 55%, ${color2}70 0px, ${color2}35 15%, transparent 55%), radial-gradient(at 85% 55%, ${color3}45 0px, ${color3}20 15%, transparent 55%), radial-gradient(at 10% 95%, ${color4}60 0px, ${color4}30 15%, transparent 55%), radial-gradient(at 85% 95%, ${color2}50 0px, ${color2}25 15%, transparent 55%), ${color1}`;
      break;
    case "spotlight":
      background = singleColorMode
        ? color1
        : `radial-gradient(ellipse 90% 70% at 50% 30%, ${color3}40 0%, ${color3}20 25%, transparent 65%), radial-gradient(ellipse 70% 50% at 50% 35%, ${color4}30 0%, ${color4}15 20%, transparent 55%), linear-gradient(180deg, ${color1} 0%, ${color2}60 50%, ${color2} 100%)`;
      break;
    case "wave":
      background = singleColorMode
        ? color1
        : `linear-gradient(180deg, ${color1} 0%, ${color2}70 35%, ${color2} 50%), radial-gradient(ellipse 220% 120% at 50% 100%, ${color3}55 0%, ${color3}25 25%, transparent 55%), radial-gradient(ellipse 180% 100% at 50% 115%, ${color4}50 0%, ${color4}20 20%, transparent 45%)`;
      break;
    case "crystal":
      background = singleColorMode
        ? color1
        : `linear-gradient(125deg, ${color1} 0%, ${color1}80 10%, ${color2} 22%, ${color2}70 35%, ${color3}35 48%, ${color3}20 58%, ${color4}25 70%, ${color2}60 82%, ${color1} 100%), linear-gradient(45deg, transparent 25%, ${color3}12 50%, transparent 75%)`;
      break;
    case "sunset":
      background = singleColorMode
        ? color1
        : `linear-gradient(180deg, ${color3}75 0%, ${color3}50 12%, ${color4}65 25%, ${color4}40 40%, ${color2}70 55%, ${color2}40 70%, ${color1}80 85%, ${color1} 100%)`;
      break;
    case "cosmic":
      background = singleColorMode
        ? color1
        : `radial-gradient(ellipse at 20% 80%, ${color3}40 0%, ${color3}18 20%, transparent 50%), radial-gradient(ellipse at 80% 20%, ${color4}40 0%, ${color4}18 20%, transparent 50%), radial-gradient(ellipse at 50% 50%, ${color2}25 0%, ${color2}10 30%, transparent 65%), radial-gradient(circle at 30% 30%, ${color3}25 0%, ${color3}10 15%, transparent 35%), radial-gradient(circle at 70% 70%, ${color4}25 0%, ${color4}10 15%, transparent 35%), ${color1}`;
      break;
    default:
      background = color1;
  }

  if (environmentEnabled && !singleColorMode) {
    background = `${background}, radial-gradient(ellipse 100% 50% at 50% 25%, ${color3}20 0%, transparent 70%)`;
  }

  return background;
};
