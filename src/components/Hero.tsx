import { Search } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { HorizontalPlaceholderCarousel } from "@/components/HorizontalPlaceholderCarousel";

// Feature cards data - you can add images later
const FEATURE_CARDS = [
  {
    id: 1,
    title: "Explore the collection",
    description: "Growing collection",
    route: "/prompt-lab-page",
  },
  {
    id: 2,
    title: "Make prompts",
    description: "Lovable, Gemini & more",
    route: "/flow-engine?view=prompt-generator",
  },
  {
    id: 3,
    title: "Test prompts and code",
    description: "Test and share your projects",
    route: "/flow-engine",
  },
  {
    id: 4,
    title: "Idea to color",
    description: "Create dynamic backgrounds",
    route: "/flow-engine?workspace=hero-background",
  },
];

export default function Hero() {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/prompt-lab-page`);
    }
  };

  return (
    <>
      {/* Hero Section - Full viewport height */}
      <section className="relative w-full min-h-screen bg-background pt-24 pb-16 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
        <div className="max-w-7xl mx-auto w-full">
          {/* Main Hero Window - Left aligned content */}
          <div className="relative rounded-2xl border border-border/30 bg-card/40 backdrop-blur-sm p-6 sm:p-8 md:p-10 lg:p-12 mb-8">
            {/* Left-aligned heading and description */}
            <div className="text-left mb-8">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4" style={{ fontFamily: "Outfit, sans-serif" }}>
                <span className="bg-gradient-to-r from-teal-400 to-purple-600 bg-clip-text text-transparent font-medium">Vibe coding</span> <span className="font-medium">starts here</span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-400 font-medium">
                Growing collection of prompts
              </p>
            </div>

            {/* Search Window */}
            <form onSubmit={handleSearch} className="w-full max-w-2xl mb-4">
              <div className="relative flex items-center">
                <input
                  type="text"
                  placeholder="Search prompts"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-14 pl-5 pr-16 rounded-xl bg-muted/60 backdrop-blur-sm border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-0 focus-visible:ring-0 focus:border-border/50 focus-visible:border-border/50 focus:shadow-none"
                />
                <button
                  type="submit"
                  className="absolute right-2 h-10 w-10 flex items-center justify-center rounded-lg bg-black text-white hover:opacity-90 transition-opacity"
                >
                  <Search className="h-5 w-5" />
                </button>
              </div>
            </form>
          </div>

          {/* Feature Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURE_CARDS.map((card) => (
              <div
                key={card.id}
                onClick={() => navigate(card.route)}
                className="group relative aspect-[4/3] rounded-xl overflow-hidden bg-card/60 backdrop-blur-sm border border-border/30 hover:border-border/60 transition-all cursor-pointer flex flex-col"
              >
                {/* Placeholder for future images */}
                <div className="absolute inset-0 bg-gradient-to-br from-muted/20 to-muted/40 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-lg bg-muted/30 border border-border/20" />
                </div>
                
                {/* Card content overlay */}
                <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-background/90 to-transparent">
                  <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1 whitespace-nowrap min-h-[1.5rem] flex items-center">
                    {card.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {card.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Video Carousel Section - Full viewport height */}
      <section className="relative w-full min-h-screen bg-background px-4 sm:px-6 lg:px-8 py-16 sm:py-20 flex flex-col justify-center">
        <div className="max-w-7xl mx-auto w-full">
          {/* Section Header */}
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-foreground tracking-tight">
              The biggest collection<br />of <span className="bg-gradient-to-r from-teal-400 to-purple-600 bg-clip-text text-transparent font-medium">prompt templates</span>
            </h2>
            <p className="text-muted-foreground text-lg sm:text-xl md:text-2xl mt-4">
              ChatGPT, Gemini, Lovable & more
            </p>
          </div>

          {/* Video Carousels */}
          <div className="space-y-8">
            <HorizontalPlaceholderCarousel title="Hero templates" />
            <HorizontalPlaceholderCarousel title="Landing page template" />
            <HorizontalPlaceholderCarousel title="Components" />
          </div>
        </div>
      </section>
    </>
  );
}
