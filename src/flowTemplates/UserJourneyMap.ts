import { attachThumbnail, buildBlocksFromNodes } from "./utils";
import { TemplateDefinition } from "./types";

const width = 220;
const height = 130;
const step = 230;

const definition: TemplateDefinition = {
  name: "User Journey Map",
  nodes: [
    {
      id: "journey-awareness",
      title: "Awareness",
      subtitle: "First touch",
      type: "flow-input",
      x: 0,
      y: 0,
      width,
      height,
      placeholder: "How users discover you (ads, search, word-of-mouth)...",
      style: "canvasBlock",
    },
    {
      id: "journey-consideration",
      title: "Consideration",
      subtitle: "Research & compare",
      type: "flow-text-gen",
      x: step,
      y: 0,
      width,
      height,
      placeholder: "What users evaluate before choosing you...",
      style: "canvasBlock",
    },
    {
      id: "journey-conversion",
      title: "Conversion",
      subtitle: "Sign-up / purchase",
      type: "flow-agent",
      x: step * 2,
      y: 0,
      width,
      height,
      placeholder: "How the user completes the action...",
      style: "canvasBlock",
    },
    {
      id: "journey-onboarding",
      title: "Onboarding",
      subtitle: "First experience",
      type: "flow-text-gen",
      x: step * 3,
      y: 0,
      width,
      height,
      placeholder: "Guides, welcome tours, activation steps...",
      style: "canvasBlock",
    },
    {
      id: "journey-retention",
      title: "Retention",
      subtitle: "Habit building",
      type: "flow-state",
      x: step,
      y: step * 0.8,
      width,
      height,
      placeholder: "Emails, value loops, in-product nudges...",
      style: "canvasBlock",
    },
    {
      id: "journey-advocacy",
      title: "Advocacy",
      subtitle: "Referrals & reviews",
      type: "flow-text-gen",
      x: step * 2,
      y: step * 0.8,
      width,
      height,
      placeholder: "Moments that spark sharing or community...",
      style: "canvasBlock",
    },
  ],
  connections: [
    { source: "journey-awareness", target: "journey-consideration" },
    { source: "journey-consideration", target: "journey-conversion" },
    { source: "journey-conversion", target: "journey-onboarding" },
    { source: "journey-onboarding", target: "journey-retention" },
    { source: "journey-retention", target: "journey-advocacy" },
  ],
  thumbnail: "",
};

export const UserJourneyMap = attachThumbnail(definition, buildBlocksFromNodes(definition.nodes));
