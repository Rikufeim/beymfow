import type { HeroBackgroundSettings } from "./HeroBackgroundWorkspace";

export type PaletteTarget = Pick<
  HeroBackgroundSettings,
  "color1" | "color2" | "color3" | "color4" | "gradientStyle" | "brightness"
>;

interface ColorIntentAdjustments {
  saturation: number;
  temperature: number;
  contrast: number;
  stopShift: number;
  brightness: number;
  gradientStyle?: HeroBackgroundSettings["gradientStyle"];
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const hexToRgb = (hex: string) => {
  const normalized = hex.replace("#", "");
  const full = normalized.length === 3
    ? normalized.split("").map((char) => `${char}${char}`).join("")
    : normalized;
  const int = parseInt(full, 16);
  return {
    r: (int >> 16) & 255,
    g: (int >> 8) & 255,
    b: int & 255,
  };
};

const rgbToHex = (r: number, g: number, b: number) => {
  const toHex = (value: number) => value.toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

const rgbToHsl = (r: number, g: number, b: number) => {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const delta = max - min;

  let h = 0;
  if (delta !== 0) {
    if (max === rn) h = ((gn - bn) / delta) % 6;
    if (max === gn) h = (bn - rn) / delta + 2;
    if (max === bn) h = (rn - gn) / delta + 4;
  }

  const l = (max + min) / 2;
  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

  return {
    h: (h * 60 + 360) % 360,
    s: s * 100,
    l: l * 100,
  };
};

const hslToRgb = (h: number, s: number, l: number) => {
  const sn = s / 100;
  const ln = l / 100;
  const c = (1 - Math.abs(2 * ln - 1)) * sn;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = ln - c / 2;

  let r = 0;
  let g = 0;
  let b = 0;

  if (h >= 0 && h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
};

const applyColorAdjustments = (
  hex: string,
  intent: ColorIntentAdjustments,
  stopBias: number,
) => {
  const { r, g, b } = hexToRgb(hex);
  const hsl = rgbToHsl(r, g, b);

  const hueShift = intent.temperature * 24;
  const saturation = clamp(hsl.s + intent.saturation * 100, 0, 100);
  const contrastFactor = 1 + intent.contrast;
  const contrastedLightness = 50 + (hsl.l - 50) * contrastFactor;
  const stopLightness = stopBias * intent.stopShift * 12;
  const lightness = clamp(contrastedLightness + stopLightness, 0, 100);
  const hue = (hsl.h + hueShift + 360) % 360;

  const nextRgb = hslToRgb(hue, saturation, lightness);
  return rgbToHex(nextRgb.r, nextRgb.g, nextRgb.b);
};

export const parseColorIntent = (input: string): ColorIntentAdjustments => {
  const tokens = input.toLowerCase().match(/[a-z]+/g) ?? [];
  const intent: ColorIntentAdjustments = {
    saturation: 0,
    temperature: 0,
    contrast: 0,
    stopShift: 0,
    brightness: 0,
  };

  const apply = (next: Partial<ColorIntentAdjustments>) => {
    intent.saturation += next.saturation ?? 0;
    intent.temperature += next.temperature ?? 0;
    intent.contrast += next.contrast ?? 0;
    intent.stopShift += next.stopShift ?? 0;
    intent.brightness += next.brightness ?? 0;
    if (next.gradientStyle) {
      intent.gradientStyle = next.gradientStyle;
    }
  };

  tokens.forEach((token) => {
    switch (token) {
      case "calm":
      case "serene":
        apply({ saturation: -0.15, contrast: -0.1, temperature: -0.05, stopShift: -0.05 });
        break;
      case "deep":
      case "moody":
        apply({ contrast: 0.2, brightness: -0.12, stopShift: -0.08 });
        break;
      case "warm":
        apply({ temperature: 0.2, saturation: 0.1, brightness: 0.05 });
        break;
      case "cool":
      case "cold":
        apply({ temperature: -0.2, saturation: -0.05 });
        break;
      case "futuristic":
        apply({ temperature: -0.18, contrast: 0.25, saturation: 0.12, gradientStyle: "crystal" });
        break;
      case "soft":
        apply({ contrast: -0.15, saturation: -0.05, gradientStyle: "soft-sweep" });
        break;
      case "vivid":
      case "bold":
        apply({ saturation: 0.2, contrast: 0.15, stopShift: 0.08 });
        break;
      case "neon":
        apply({ saturation: 0.3, contrast: 0.2, brightness: 0.08, gradientStyle: "orb" });
        break;
      case "sunset":
        apply({ temperature: 0.25, saturation: 0.12, gradientStyle: "sunset" });
        break;
      case "aurora":
        apply({ temperature: -0.08, saturation: 0.15, gradientStyle: "aurora" });
        break;
      case "cosmic":
        apply({ temperature: -0.1, contrast: 0.15, gradientStyle: "cosmic" });
        break;
      case "mesh":
        apply({ gradientStyle: "mesh" });
        break;
      case "halo":
        apply({ gradientStyle: "halo" });
        break;
      case "spotlight":
        apply({ gradientStyle: "spotlight" });
        break;
      case "diagonal":
        apply({ gradientStyle: "diagonal-blend" });
        break;
      case "wave":
        apply({ gradientStyle: "wave" });
        break;
      case "crystal":
        apply({ gradientStyle: "crystal" });
        break;
      default:
        break;
    }
  });

  return intent;
};

export const buildPaletteFromIntent = (
  settings: HeroBackgroundSettings,
  input: string,
): PaletteTarget => {
  const intent = parseColorIntent(input);
  const stopBiases = [-1.5, -0.5, 0.5, 1.5];

  return {
    color1: applyColorAdjustments(settings.color1, intent, stopBiases[0]),
    color2: applyColorAdjustments(settings.color2, intent, stopBiases[1]),
    color3: applyColorAdjustments(settings.color3, intent, stopBiases[2]),
    color4: applyColorAdjustments(settings.color4, intent, stopBiases[3]),
    brightness: clamp(settings.brightness + intent.brightness, 0.6, 1.8),
    gradientStyle: intent.gradientStyle ?? settings.gradientStyle,
  };
};
