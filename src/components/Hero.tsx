import { Search } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

// Feature cards data - you can add images later
const FEATURE_CARDS = [
  {
    id: 1,
    title: "Explore the Marketplace",
    description: "Browse 240k+ quality, tested prompts",
    placeholder: true,
  },
  {
    id: 2,
    title: "Sell Your Prompts",
    description: "Create, share and earn",
    placeholder: true,
  },
  {
    id: 3,
    title: "Get a Custom Prompt",
    description: "Work with expert prompt engineers",
    placeholder: true,
  },
  {
    id: 4,
    title: "Generate AI Content",
    description: "Create images, videos & more",
    placeholder: true,
  },
];

export default function Hero() {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/prompt-library?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <section className="relative w-full min-h-[70vh] bg-background pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-background/80" />
      
      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Main heading */}
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground mb-4">
            Prompt Marketplace
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground mb-2">
            Access 240k high-quality AI prompts
          </p>
          <p className="text-lg sm:text-xl bg-gradient-to-r from-teal-400 via-purple-500 to-pink-500 bg-clip-text text-transparent font-medium">
            Midjourney, ChatGPT, Veo, Gemini & more
          </p>
        </div>

        {/* Large Search Window */}
        <form onSubmit={handleSearch} className="w-full max-w-2xl mx-auto mb-12">
          <div className="relative flex items-center">
            <input
              type="text"
              placeholder="Search prompts"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-14 pl-5 pr-16 rounded-xl bg-card/80 backdrop-blur-sm border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
            <button
              type="submit"
              className="absolute right-2 h-10 w-10 flex items-center justify-center rounded-lg bg-gradient-to-r from-pink-500 to-orange-400 text-white hover:opacity-90 transition-opacity"
            >
              <Search className="h-5 w-5" />
            </button>
          </div>
        </form>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {FEATURE_CARDS.map((card) => (
            <div
              key={card.id}
              className="group relative aspect-[4/3] rounded-xl overflow-hidden bg-card/60 backdrop-blur-sm border border-border/30 hover:border-border/60 transition-all cursor-pointer"
            >
              {/* Placeholder for future images */}
              <div className="absolute inset-0 bg-gradient-to-br from-muted/20 to-muted/40 flex items-center justify-center">
                <div className="w-16 h-16 rounded-lg bg-muted/30 border border-border/20" />
              </div>
              
              {/* Card content overlay */}
              <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-background/90 to-transparent">
                <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1">
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

      {/* Bottom text - outside hero */}
      <div className="relative z-10 text-center mt-8">
        <p className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-teal-400 to-purple-600 bg-clip-text text-transparent">
          The biggest collection of prompt templates
        </p>
      </div>
    </section>
  );
}
