import React, { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Search } from "lucide-react";
import Layout from "@/components/Layout";
import ComponentShowcasePage from "@/components/ComponentShowcasePage";

interface VideoComponentData {
  title: string;
  description: string;
  videoSrc: string;
  creator: { name: string; username: string };
  installCommand: string;
  importCode: string;
  usageCode: string;
  accentColor: string;
  fullCode?: string;
}

// Import data from PromptLabPage (we'll need to export it or duplicate it)
// For now, let's duplicate the data structure
const landingPageHeroData: VideoComponentData[] = [
  {
    title: "Modern Landing Page",
    description: "A sleek modern landing page design with smooth animations.",
    videoSrc: "/videos/landing-page-1.mp4",
    creator: { name: "Beymflow", username: "beymflow" },
    installCommand: "https://beymflow.com/templates/modern-landing",
    importCode: "@/pages/ModernLanding",
    usageCode: "<ModernLanding />",
    accentColor: "emerald",
  },
  {
    title: "Pixel Trail",
    description: "A beautiful smooth cursor pixel trail effect.",
    videoSrc: "/videos/pixel-trail-demo.mp4",
    creator: { name: "Jatin Yadav", username: "jatin-yadav05" },
    installCommand: "https://21st.dev/r/jatin-yadav05/pixel-trail",
    importCode: "@/components/ui/pixel-trail",
    usageCode: "<PixelCursorTrail />",
    accentColor: "purple"
  },
  {
    title: "Hero Animation",
    description: "A stunning hero section with smooth animations.",
    videoSrc: "/videos/landing-hero-new.mp4",
    creator: { name: "Beymflow", username: "beymflow" },
    installCommand: "https://beymflow.com/templates/hero-animation",
    importCode: "@/components/ui/hero-animation",
    usageCode: "<HeroAnimation />",
    accentColor: "cyan"
  }
];

const componentsVideoData: VideoComponentData[] = [
  {
    title: "New Component",
    description: "A fresh new component demo.",
    videoSrc: "/videos/components-new-1.mp4",
    creator: { name: "Beymflow", username: "beymflow" },
    installCommand: "https://beymflow.com/components/new",
    importCode: "@/components/ui/new-component",
    usageCode: "<NewComponent />",
    accentColor: "cyan"
  },
  {
    title: "Interactive UI",
    description: "A beautiful interactive UI component demo.",
    videoSrc: "/videos/components-1.mp4",
    creator: { name: "Beymflow", username: "beymflow" },
    installCommand: "https://beymflow.com/components/interactive",
    importCode: "@/components/ui/interactive-ui",
    usageCode: "<InteractiveUI />",
    accentColor: "purple"
  },
];

const fullLandingPagesData: VideoComponentData[] = [
  {
    title: "Landing Page Template",
    description: "A ready-to-use landing page with modern design.",
    videoSrc: "/videos/landing-pages-demo.mp4",
    creator: { name: "Beymflow", username: "beymflow" },
    installCommand: "https://beymflow.com/templates/landing-page",
    importCode: "@/pages/LandingPage",
    usageCode: "<LandingPage />",
    accentColor: "emerald"
  },
  {
    title: "Creative Landing Page",
    description: "A creative landing page design with unique animations.",
    videoSrc: "/videos/landing-pages-demo-2.mp4",
    creator: { name: "Beymflow", username: "beymflow" },
    installCommand: "https://beymflow.com/templates/creative-landing",
    importCode: "@/pages/CreativeLanding",
    usageCode: "<CreativeLanding />",
    accentColor: "purple"
  },
  {
    title: "Minimal Landing Page",
    description: "A clean minimal landing page with elegant transitions.",
    videoSrc: "/videos/landing-pages-demo-3.mp4",
    creator: { name: "Beymflow", username: "beymflow" },
    installCommand: "https://beymflow.com/templates/minimal-landing",
    importCode: "@/pages/MinimalLanding",
    usageCode: "<MinimalLanding />",
    accentColor: "cyan"
  }
];

const mobileAppsData: VideoComponentData[] = [];
const beatsData: VideoComponentData[] = [];
const cryptosData: VideoComponentData[] = [];

const categoryDataMap: Record<string, VideoComponentData[]> = {
  "hero-templates": landingPageHeroData,
  "landing-page-templates": fullLandingPagesData,
  "components": componentsVideoData,
  "mobile-apps": mobileAppsData,
  "beats": beatsData,
  "cryptos": cryptosData,
};

const categoryTitleMap: Record<string, string> = {
  "hero-templates": "Hero templates",
  "landing-page-templates": "Landing page templates",
  "components": "Components",
  "mobile-apps": "Mobile apps",
  "beats": "Beats",
  "cryptos": "Cryptos",
};

// Map category names to relevant filter categories
const categoryFilterMap: Record<string, string[]> = {
  "hero-templates": ["All", "Web3", "Retro", "Modern", "Minimal"],
  "landing-page-templates": ["All", "Business", "Creative", "Portfolio", "SaaS"],
  "components": ["All", "UI", "Animation", "Interactive", "Navigation"],
  "mobile-apps": ["All", "iOS", "Android", "Cross-platform"],
  "beats": ["All", "House", "Trap", "Hip-hop", "Electronic"],
  "cryptos": ["All", "Bitcoin", "Ethereum", "DeFi", "NFT"],
};

// Subcategories for each filter category
const subcategories: Record<string, string[]> = {
  Website: ["Hero", "Footer", "Landing page"],
  Apps: ["Apps-mobile", "Apps-web", "Apps-desktop"],
  Beats: ["House", "Trap", "R&B", "Hiphop"],
  Cryptos: ["Bitcoin", "Ethereum", "DeFi", "NFT"],
  Business: ["Business-marketing", "Business-sales", "Business-strategy"],
  Components: ["Components-ui", "Components-animation", "Components-interactive"],
};

const CategoryViewPage = () => {
  const { categoryName } = useParams<{ categoryName: string }>();
  const navigate = useNavigate();
  const [selectedComponentIndex, setSelectedComponentIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);

  if (!categoryName || !categoryDataMap[categoryName]) {
    return (
      <Layout>
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Category not found</h1>
            <button
              onClick={() => navigate("/prompt-lab-page")}
              className="text-cyan-400 hover:text-cyan-300 underline"
            >
              Go back
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const data = categoryDataMap[categoryName];
  const categoryTitle = categoryTitleMap[categoryName] || categoryName;
  const availableFilters = categoryFilterMap[categoryName] || ["All"];

  // Generate dynamic title based on category
  const getPageTitle = () => {
    const titleMap: Record<string, { line1: string; line2: string }> = {
      "hero-templates": { 
        line1: "Customizable hero", 
        line2: "templates for every need" 
      },
      "landing-page-templates": { 
        line1: "Customizable landing&nbsp;page", 
        line2: "templates for every need" 
      },
      "components": { 
        line1: "Customizable components", 
        line2: "for every need" 
      },
      "mobile-apps": { 
        line1: "Customizable mobile app", 
        line2: "templates for every need" 
      },
      "beats": { 
        line1: "Customizable beats", 
        line2: "for every need" 
      },
    };
    const title = titleMap[categoryName];
    if (title) {
      return title;
    }
    // Fallback
    const words = categoryTitle.toLowerCase().split(' ');
    return {
      line1: `Customizable ${words.join(' ')}`,
      line2: "for every need"
    };
  };

  // Filter data based on search and category filters
  const filteredData = useMemo(() => {
    let filtered = [...data];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query)
      );
    }

    // Category filter (this is a simplified version - in a real app, you'd have metadata)
    // For now, we'll just return all items if "All" is selected, or filter by title/description keywords
    if (selectedCategory !== "All") {
      const categoryKeywords: Record<string, string[]> = {
        // Hero templates filters
        Web3: ["web3", "web 3", "crypto", "blockchain", "nft", "decentralized", "decentralize"],
        Retro: ["retro", "vintage", "80s", "90s", "nostalgic", "classic"],
        Modern: ["modern", "contemporary", "sleek", "minimalist", "clean"],
        Minimal: ["minimal", "minimalist", "simple", "clean", "bare"],
        // Landing page templates filters
        Business: ["business", "corporate", "professional", "enterprise"],
        Creative: ["creative", "artistic", "design", "portfolio", "showcase"],
        Portfolio: ["portfolio", "showcase", "work", "projects"],
        SaaS: ["saas", "software", "service", "platform", "app"],
        // Components filters
        UI: ["ui", "interface", "component", "element"],
        Animation: ["animation", "animated", "motion", "transition"],
        Interactive: ["interactive", "interaction", "hover", "click"],
        Navigation: ["navigation", "nav", "menu", "header"],
        // Mobile apps filters
        iOS: ["ios", "iphone", "apple", "swift"],
        Android: ["android", "google", "kotlin"],
        "Cross-platform": ["cross-platform", "cross platform", "react native", "flutter"],
        // Beats filters
        House: ["house", "electronic"],
        Trap: ["trap", "hip hop", "hiphop"],
        "Hip-hop": ["hip hop", "hiphop", "rap"],
        Electronic: ["electronic", "edm", "techno"],
      };

      const keywords = categoryKeywords[selectedCategory] || [];
      filtered = filtered.filter((item) => {
        const searchText = `${item.title} ${item.description}`.toLowerCase();
        return keywords.some((keyword) => searchText.includes(keyword));
      });
    }

    // Subcategory filter (simplified - not used with new category system, but kept for compatibility)
    if (selectedSubcategory) {
      const subcategoryKeywords: Record<string, string[]> = {
        Hero: ["hero"],
        Footer: ["footer"],
        "Landing page": ["landing", "page"],
        "Apps-mobile": ["mobile", "app"],
        "Apps-web": ["web", "app"],
        "Apps-desktop": ["desktop", "app"],
        House: ["house"],
        Trap: ["trap"],
        "R&B": ["r&b", "rnb"],
        Hiphop: ["hiphop", "hip-hop"],
        "Business-marketing": ["marketing"],
        "Business-sales": ["sales"],
        "Business-strategy": ["strategy"],
        "Components-ui": ["ui", "component"],
        "Components-animation": ["animation"],
        "Components-interactive": ["interactive"],
      };

      const keywords = subcategoryKeywords[selectedSubcategory] || [];
      filtered = filtered.filter((item) => {
        const searchText = `${item.title} ${item.description}`.toLowerCase();
        return keywords.some((keyword) => searchText.includes(keyword));
      });
    }

    return filtered;
  }, [data, searchQuery, selectedCategory, selectedSubcategory]);

  const handleCardClick = (index: number) => {
    // Find the actual index in the original data array
    const filteredItem = filteredData[index];
    const originalIndex = data.findIndex((item) => item.title === filteredItem.title);
    setSelectedComponentIndex(originalIndex >= 0 ? originalIndex : null);
  };

  const handleBack = () => {
    setSelectedComponentIndex(null);
  };

  if (selectedComponentIndex !== null && data[selectedComponentIndex]) {
    const selectedComponent = data[selectedComponentIndex];
    return (
      <Layout hideFooter>
        <ComponentShowcasePage
          onBack={handleBack}
          videoSrc={selectedComponent.videoSrc}
          title={selectedComponent.title}
          description={selectedComponent.description}
          creator={selectedComponent.creator}
          installCommand={selectedComponent.installCommand}
          importCode={selectedComponent.importCode}
          usageCode={selectedComponent.usageCode}
          fullCode={selectedComponent.fullCode}
          category={categoryTitle}
          relatedComponents={data}
          onComponentClick={handleCardClick}
        />
      </Layout>
    );
  }

  return (
    <Layout hideFooter>
      <div className="min-h-screen bg-black text-white relative">
        {/* Title and Search Bar - Centered, separate component */}
        <div className="w-full mb-8 pt-56 px-6 md:px-10">
          <div className="max-w-2xl mx-auto">
            {/* Title */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white/85 text-center mb-8 leading-tight">
              <span className="block whitespace-nowrap" dangerouslySetInnerHTML={{ __html: getPageTitle().line1 }} />
              <span className="block" dangerouslySetInnerHTML={{ __html: getPageTitle().line2 }} />
            </h1>
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all"
              />
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 md:px-10 pb-16">

          {/* Categories Filter Buttons */}
          <div className="w-full mb-8">
            <div className="flex flex-wrap gap-3 justify-center mb-4">
              {availableFilters.map((category) => (
                <button
                  key={category}
                  onClick={() => {
                    setSelectedCategory(category);
                    setSelectedSubcategory(null);
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    selectedCategory === category
                      ? "bg-white/10 border-2 border-blue-800 text-white/85"
                      : "bg-white/5 border border-white/10 text-white/85"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
            
            {/* Subcategories */}
            {selectedCategory !== "All" && subcategories[selectedCategory] && (
              <div className="flex flex-wrap gap-3 justify-center">
                {subcategories[selectedCategory].map((subcategory) => (
                  <button
                    key={subcategory}
                    onClick={() => setSelectedSubcategory(subcategory)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      selectedSubcategory === subcategory
                        ? "bg-white/10 border-2 border-blue-800 text-white/85"
                        : "bg-white/5 border border-white/10 text-white/85"
                    }`}
                  >
                    {subcategory}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Grid with 3 columns */}
          {filteredData.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredData.map((componentData, idx) => (
                <div
                  key={idx}
                  onClick={() => handleCardClick(idx)}
                  className="relative rounded-2xl bg-[#1a1a1a] overflow-hidden flex flex-col shadow-2xl shadow-black/50 backdrop-blur-sm transition-all duration-300 cursor-pointer hover:opacity-90 hover:shadow-black/70 group"
                >
                  {/* Header Section */}
                  <div className="px-4 py-3 bg-[#1a1a1a]">
                    <h4 className="text-white/85 font-semibold text-sm truncate text-left">
                      {componentData.title}
                    </h4>
                  </div>
                  {/* Video Section */}
                  <div className="relative w-full h-[220px] bg-[#1a1a1a] flex items-center justify-center p-3">
                    <div className="relative w-full h-full rounded-lg overflow-hidden bg-black">
                      <video
                        src={componentData.videoSrc}
                        muted
                        loop
                        playsInline
                        autoPlay
                        preload="metadata"
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          console.error('Video load error:', e);
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-white/60 text-lg">
                {searchQuery || selectedCategory !== "All" || selectedSubcategory
                  ? "No templates found matching your filters."
                  : "No templates available in this category yet."}
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default CategoryViewPage;

