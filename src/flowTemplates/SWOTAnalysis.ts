import { attachThumbnail, buildBlocksFromNodes } from "./utils";
import { TemplateDefinition } from "./types";

const size = 210;
const gap = 230;

const definition: TemplateDefinition = {
  name: "SWOT Analysis",
  nodes: [
    {
      id: "swot-strengths",
      title: "Strengths",
      subtitle: "Internal advantages",
      type: "flow-input",
      x: 0,
      y: 0,
      width: size,
      height: size,
      placeholder: "List what you do well...",
      style: "canvasBlock",
    },
    {
      id: "swot-weaknesses",
      title: "Weaknesses",
      subtitle: "Gaps & risks",
      type: "flow-text-gen",
      x: gap,
      y: 0,
      width: size,
      height: size,
      placeholder: "Identify internal gaps to improve...",
      style: "canvasBlock",
    },
    {
      id: "swot-opportunities",
      title: "Opportunities",
      subtitle: "Market openings",
      type: "flow-agent",
      x: 0,
      y: gap,
      width: size,
      height: size,
      placeholder: "Trends or unmet needs to capture...",
      style: "canvasBlock",
    },
    {
      id: "swot-threats",
      title: "Threats",
      subtitle: "External pressures",
      type: "flow-text-gen",
      x: gap,
      y: gap,
      width: size,
      height: size,
      placeholder: "Competitors, regulations, volatility...",
      style: "canvasBlock",
    },
    {
      id: "swot-strategy",
      title: "Strategy Synthesis",
      subtitle: "Key moves",
      type: "flow-state",
      x: gap * 0.5,
      y: gap * 1.6,
      width: size,
      height: 140,
      placeholder: "Combine SWOT insights into moves...",
      style: "canvasBlock",
    },
  ],
  connections: [
    { source: "swot-strengths", target: "swot-strategy" },
    { source: "swot-weaknesses", target: "swot-strategy" },
    { source: "swot-opportunities", target: "swot-strategy" },
    { source: "swot-threats", target: "swot-strategy" },
  ],
  thumbnail: "",
};

export const SWOTAnalysis = attachThumbnail(definition, buildBlocksFromNodes(definition.nodes));
