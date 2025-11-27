"use client";
import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { ImagePromptGenerator } from "@/components/promptlab/ImagePromptGenerator";
import { TextPromptGenerator } from "@/components/promptlab/TextPromptGenerator";
import { LogoGenerator } from "@/components/promptlab/LogoGenerator";
import { BusinessGenerator } from "@/components/promptlab/BusinessGenerator";
import type { BusinessPlan } from "@/components/promptlab/BusinessPlanCanvas";
import { CutoutGenerator } from "@/components/promptlab/CutoutGenerator";

type Category = "creativity" | "personal" | "business" | "crypto";

type LabTool = {
  question: string;
  color: string;
  id?: ActiveTool;
};

type ActiveTool =
  | "business"
  | "sales"
  | "brand"
  | "image"
  | "animation"
  | "logo"
  | "token"
  | "narrative"
  | "defi";

const categoryColorMap: Record<Category, "purple" | "red" | "cyan" | "green"> = {
  creativity: "purple",
  personal: "red",
  business: "cyan",
  crypto: "green",
};

const categoryActiveClasses: Record<Category, string> = {
  creativity: "bg-purple-500/20 border border-purple-500 text-purple-300",
  personal: "bg-red-500/20 border border-red-500 text-red-300",
  business: "bg-cyan-500/20 border border-cyan-500 text-cyan-300",
  crypto: "bg-green-500/20 border border-green-500 text-green-300",
};

const toolPrompts: Record<ActiveTool, string> = {
  business: "Describe your idea. We'll build you a business model, offer and angle.",
  sales: "Who are you selling to and what are you offering? I'll write the pitch.",
  brand: "Tell me what you want your brand to feel like. We'll define voice, story, identity.",
  image: "Tell me the visual you want",
  animation: "What movement / scene do you see? I'll build the animation concept.",
  logo: "Describe the vibe of your brand. I'll create logo directions and styles.",
  token: "Name the token. I'll break down utility, use case and adoption potential.",
  narrative: "Which sector are you watching? I'll find the next narrative and why it matters.",
  defi: "How much capital and risk level",
};

const labTools: Record<Category, LabTool[]> = {
  creativity: [
    { question: "Make Image", color: categoryColorMap.creativity, id: "image" },
    { question: "Remove Background", color: categoryColorMap.creativity, id: "animation" },
    { question: "Design Logo", color: categoryColorMap.creativity, id: "logo" },
  ],
  personal: [
    { question: "Reflect Mind", color: categoryColorMap.personal },
    { question: "Build Vision", color: categoryColorMap.personal },
    { question: "Create System", color: categoryColorMap.personal },
  ],
  business: [
    { question: "Build Business", color: categoryColorMap.business, id: "business" },
    { question: "Write Script", color: categoryColorMap.business, id: "sales" },
    { question: "Define Brand", color: categoryColorMap.business, id: "brand" },
  ],
  crypto: [
    { question: "TOKEN RESEARCH", color: categoryColorMap.crypto, id: "token" },
    { question: "NARRATIVE FINDER", color: categoryColorMap.crypto, id: "narrative" },
    { question: "DEFI BUILDER", color: categoryColorMap.crypto, id: "defi" },
  ],
};

function useActiveCategoryColor(category: Category) {
  return categoryColorMap[category];
}

function getNodeClasses(color: string, isActive: boolean) {
  if (!isActive) return "bg-black border-white/40";

  const map: Record<string, string> = {
    green: "bg-green-500 border-green-400 shadow-[0_0_20px_rgba(34,197,94,0.8)]",
    purple: "bg-purple-500 border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.8)]",
    cyan: "bg-cyan-500 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.8)]",
    red: "bg-red-500 border-red-400 shadow-[0_0_20px_rgba(239,68,68,0.8)]",
  };
  return map[color] || "bg-white border-white/40";
}

function getColorValue(color: string) {
  const map: Record<string, string> = {
    green: "rgb(34,197,94)",
    purple: "rgb(168,85,247)",
    cyan: "rgb(6,182,212)",
    red: "rgb(239,68,68)",
  };
  return map[color] || "rgb(148,163,184)";
}

export default function GeneratorPanel() {
  const [selectedCategory, setSelectedCategory] = useState<Category>("creativity");
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const [activeTool, setActiveTool] = useState<ActiveTool>("business");
  const [businessPlan, setBusinessPlan] = useState<BusinessPlan | null>(null);

  const tools = useMemo(() => labTools[selectedCategory], [selectedCategory]);
  const accentColor = useActiveCategoryColor(selectedCategory);

  useEffect(() => {
    if (selectedCard === null) return;
    const active = tools[selectedCard];
    if (active?.id) {
      setActiveTool(active.id);
    }
  }, [selectedCard, tools]);

  const renderGenerator = () => {
    if (selectedCard === null) return null;

    const toolName = tools[selectedCard]?.question;
    const toolColor = tools[selectedCard]?.color || accentColor;

    if (!toolName) return null;

    if (toolName === "Make Image") {
      return <ImagePromptGenerator toolColor={toolColor} />;
    }
    if (toolName === "Design Logo") {
      return <LogoGenerator toolColor={toolColor} />;
    }
    if (toolName === "Build Business") {
      return (
        <BusinessGenerator
          businessPlan={businessPlan}
          onPlanGenerated={(plan) => setBusinessPlan(plan)}
          onPlanUpdate={handlePlanUpdate}
        />
      );
    }
    if (toolName === "Remove Background") {
      return <CutoutGenerator toolColor={toolColor} />;
    }
    if (toolName === "Write Script") {
      return <TextPromptGenerator toolColor={toolColor} category={selectedCategory} placeholder={toolPrompts.sales} />;
    }
    if (toolName === "Define Brand") {
      return <TextPromptGenerator toolColor={toolColor} category={selectedCategory} placeholder={toolPrompts.brand} />;
    }
    return (
      <TextPromptGenerator
        toolColor={toolColor}
        category={selectedCategory}
        placeholder={toolPrompts[activeTool]}
      />
    );
  };

  function handlePlanUpdate(field: keyof BusinessPlan, value: string | string[]) {
    setBusinessPlan((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [field]: value,
      };
    });
  }

  useEffect(() => {
    (window as any).__generatorState = {
      selectedCategory,
      selectedCard,
      activeTool,
      businessPlan,
    };
  }, [selectedCategory, selectedCard, activeTool, businessPlan]);

  const handleCardClick = (index: number) => {
    const tool = tools[index];
    if (!tool) return;

    setSelectedCard((prev) => {
      const next = prev === index ? null : index;
      if (next !== null && tool.id) {
        setActiveTool(tool.id);
      }
      if (tool.id !== "business") {
        setBusinessPlan(null);
      }
      return next;
    });
  };

  return (
    <div className="h-full overflow-y-auto bg-black/60">
      <div className="sticky top-0 z-10 px-4 py-3 bg-black/80 backdrop-blur border-b border-white/10">
        <div className="flex flex-wrap gap-2">
          {(Object.keys(labTools) as Category[]).map((category) => {
            const isActive = selectedCategory === category;
            return (
              <button
                key={category}
                onClick={() => {
                  setSelectedCategory(category);
                  setSelectedCard(null);
                  setBusinessPlan(null);
                }}
                className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase transition-colors duration-200 ${
                  isActive
                    ? categoryActiveClasses[category]
                    : "bg-transparent border border-white/10 text-white/70 hover:border-white/30"
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {tools.map((tool, index) => (
          <Card
            key={index}
            onClick={() => handleCardClick(index)}
            className={`transition-all duration-300 p-4 backdrop-blur-sm shadow-xl cursor-pointer ${
              selectedCard === index
                ? "bg-white/10 border-white/30"
                : "bg-black/80 border-white/20 hover:bg-black/60"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`relative w-3 h-3 rounded-full border-2 transition-all duration-300 ${getNodeClasses(
                  tool.color,
                  selectedCard === index
                )}`}
              >
                {selectedCard === index && (
                  <div
                    className="absolute inset-0 rounded-full animate-ping opacity-75"
                    style={{ backgroundColor: getColorValue(tool.color) }}
                  />
                )}
              </div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wide">{tool.question}</h3>
            </div>
          </Card>
        ))}

        {selectedCard !== null && <div className="mt-4">{renderGenerator()}</div>}
      </div>
    </div>
  );
}
