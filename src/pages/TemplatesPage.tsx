import React, { useState } from "react";

interface Template {
  id: string;
  name: string;
  isNew?: boolean;
  description: string;
  originalPrice: number;
  currentPrice: number;
  previewImages: string[];
}

const templates: Template[] = [
  {
    id: "agenforce",
    name: "Agenforce Marketing Template",
    isNew: true,
    description: "A marketing template designed for various use cases, including AI Agents, Agency, Chatbots and SaaS. Includes delightful micro-interactions and animations.",
    originalPrice: 99,
    currentPrice: 79,
    previewImages: [
      "/images/template-preview-1.jpg",
      "/images/template-preview-2.jpg",
      "/images/template-preview-3.jpg"
    ]
  },
  {
    id: "nodus",
    name: "Nodus Marketing Template",
    isNew: true,
    description: "A modern marketing template with sleek design and smooth animations.",
    originalPrice: 99,
    currentPrice: 79,
    previewImages: []
  },
  {
    id: "ai-saas",
    name: "AI SaaS Template",
    description: "Perfect template for AI-powered SaaS products with modern UI components.",
    originalPrice: 99,
    currentPrice: 79,
    previewImages: []
  },
  {
    id: "startup",
    name: "Startup Landing Page Template",
    description: "A clean and professional landing page template for startups.",
    originalPrice: 99,
    currentPrice: 79,
    previewImages: []
  },
  {
    id: "proactiv",
    name: "Proactiv Marketing Template",
    description: "An engaging marketing template with interactive elements.",
    originalPrice: 99,
    currentPrice: 79,
    previewImages: []
  },
  {
    id: "minimal",
    name: "Minimal Portfolio Template",
    description: "A minimal and elegant portfolio template for creative professionals.",
    originalPrice: 99,
    currentPrice: 79,
    previewImages: []
  },
  {
    id: "cryptgen",
    name: "Cryptgen Marketing",
    description: "A marketing template for cryptocurrency and blockchain projects.",
    originalPrice: 99,
    currentPrice: 79,
    previewImages: []
  },
  {
    id: "playful",
    name: "Playful Marketing Template",
    description: "A fun and engaging marketing template with playful animations.",
    originalPrice: 99,
    currentPrice: 79,
    previewImages: []
  },
  {
    id: "agenlabs",
    name: "Agenlabs Agency",
    description: "A professional agency template with modern design.",
    originalPrice: 99,
    currentPrice: 79,
    previewImages: []
  },
  {
    id: "devpro",
    name: "Devpro Portfolio",
    description: "A portfolio template for developers and tech professionals.",
    originalPrice: 99,
    currentPrice: 79,
    previewImages: []
  },
  {
    id: "foxtrot",
    name: "Foxtrot Marketing",
    description: "A dynamic marketing template with bold visuals.",
    originalPrice: 99,
    currentPrice: 79,
    previewImages: []
  },
  {
    id: "sidefolio",
    name: "Sidefolio Portfolio",
    description: "A side portfolio template for showcasing work.",
    originalPrice: 99,
    currentPrice: 79,
    previewImages: []
  },
  {
    id: "schedule",
    name: "Schedule Marketing",
    description: "A marketing template focused on scheduling and time management.",
    originalPrice: 99,
    currentPrice: 79,
    previewImages: []
  }
];

const componentBlocks = [
  "Hero Sections",
  "Logo Clouds",
  "Bento Grids",
  "CTA Sections",
  "Testimonials",
  "Feature sections"
];

const TemplatesPage: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<Template>(templates[0]);

  return (
    <div className="min-h-screen bg-black">
        {/* Hero Section with textured background */}
        <div className="relative w-full bg-[#0a0a0a] border-b border-white/10">
          {/* Textured grid background */}
          <div 
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px'
            }}
          />
          
          <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-8 lg:px-12 py-8 md:py-12">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
              Templates
            </h1>
            <p className="text-white/70 text-base md:text-lg max-w-3xl">
              Modern and minimalist templates for building your next product. Built with React, NextJS, TailwindCSS, Framer Motion and Typescript.
            </p>
          </div>
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="max-w-[1600px] mx-auto px-6 md:px-8 lg:px-12 xl:px-16 pt-24 md:pt-32 lg:pt-40 pb-12 md:pb-16">
          <div className="grid lg:grid-cols-[200px_1fr] gap-6 lg:gap-8">
            {/* Left Column - Template List */}
            <div className="max-w-[200px]">
              <h2 className="text-xl font-bold text-white mb-6">Templates</h2>
              <div className="space-y-3 mb-12">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors text-gray-300"
                    onClick={() => setSelectedTemplate(template)}
                  >
                    <span className="text-sm">{template.name}</span>
                    {template.isNew && (
                      <span className="px-2 py-0.5 text-xs font-semibold bg-white/20 text-white rounded-full">
                        New
                      </span>
                    )}
                  </div>
                ))}
              </div>

              <h2 className="text-xl font-bold text-white mb-6">Component Blocks</h2>
              <div className="space-y-3">
                {componentBlocks.map((block) => (
                  <div
                    key={block}
                    className="text-gray-300 text-sm cursor-pointer hover:text-white transition-colors"
                  >
                    {block}
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column - Template Cards Grid */}
            <div>
              <div className="flex flex-wrap gap-y-[240px] gap-x-8 justify-end">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="relative w-[380px] rounded-2xl bg-[#0f0f0f] overflow-hidden flex-shrink-0 flex flex-col shadow-2xl shadow-black/50 backdrop-blur-sm"
                  >
                    {/* Placeholder header */}
                    <div className="px-4 py-3 bg-[#0f0f0f]">
                      <div className="h-4 w-32 rounded-full bg-white/10" />
                    </div>
                    {/* Placeholder video area */}
                    <div className="relative w-full h-[220px] bg-[#0f0f0f] p-3">
                      <div className="w-full h-full rounded-lg bg-black" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default TemplatesPage;

