import { TemplateDefinition, TemplateNodeDefinition } from "./types";

type ThumbnailBlock = {
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

const VIEWBOX_WIDTH = 120;
const VIEWBOX_HEIGHT = 60;
const PADDING = 6;

const normalizeBlocks = (blocks: ThumbnailBlock[]) => {
  const minX = Math.min(...blocks.map((b) => b.x));
  const minY = Math.min(...blocks.map((b) => b.y));
  const maxX = Math.max(...blocks.map((b) => b.x + b.width));
  const maxY = Math.max(...blocks.map((b) => b.y + b.height));

  const width = Math.max(maxX - minX, 1);
  const height = Math.max(maxY - minY, 1);

  const scale = Math.min((VIEWBOX_WIDTH - PADDING * 2) / width, (VIEWBOX_HEIGHT - PADDING * 2) / height);

  return blocks.map((block) => ({
    x: (block.x - minX) * scale + PADDING,
    y: (block.y - minY) * scale + PADDING,
    width: block.width * scale,
    height: block.height * scale,
    label: block.label,
  }));
};

export const generateThumbnail = (blocks: ThumbnailBlock[]) => {
  const normalized = normalizeBlocks(blocks);

  const rects = normalized
    .map(
      (block) =>
        `<g>` +
        `<rect x="${block.x.toFixed(2)}" y="${block.y.toFixed(2)}" width="${block.width.toFixed(2)}" height="${block.height.toFixed(2)}" rx="4" fill="rgb(38,38,38)" stroke="rgb(75,85,99)" stroke-width="1" />` +
        `<text x="${(block.x + 6).toFixed(2)}" y="${(block.y + 14).toFixed(2)}" font-family="Inter, system-ui" font-size="8" fill="rgb(156,163,175)">${block.label}</text>` +
        `</g>`
    )
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${VIEWBOX_WIDTH}" height="${VIEWBOX_HEIGHT}" viewBox="0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}" role="img" aria-label="template preview">${rects}</svg>`;
};

export const buildBlocksFromNodes = (nodes: TemplateNodeDefinition[], labelFallback = ""): ThumbnailBlock[] =>
  nodes.map((node) => ({
    label: node.title || labelFallback,
    x: node.x,
    y: node.y,
    width: node.width,
    height: node.height,
  }));

export const attachThumbnail = (definition: TemplateDefinition, blocks: ThumbnailBlock[]): TemplateDefinition => ({
  ...definition,
  thumbnail: generateThumbnail(blocks),
});
