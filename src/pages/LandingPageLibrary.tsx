import { memo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ExternalLink, Download, Star, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SEOHead from "@/components/SEOHead";
import { buildBreadcrumbSchema, SITE_URL } from "@/lib/seo";

interface LandingPageTemplate {
    id: string;
    name: string;
    description: string;
    category: "free" | "premium";
    price?: number;
    rating: number;
    downloads: number;
    previewUrl: string;
    tags: string[];
    features: string[];
}

const TEMPLATES: LandingPageTemplate[] = [
    {
        id: "modern-saas",
        name: "Modern SaaS",
        description: "Clean and professional SaaS landing page with gradient hero section and feature showcases",
        category: "free",
        rating: 4.8,
        downloads: 1247,
        previewUrl: "#",
        tags: ["SaaS", "Modern", "Gradient"],
        features: ["Responsive", "Dark Mode", "Animated"]
    },
    {
        id: "startup-pro",
        name: "Startup Pro",
        description: "Bold and energetic startup landing page with dynamic animations and CTAs",
        category: "premium",
        price: 49,
        rating: 4.9,
        downloads: 892,
        previewUrl: "#",
        tags: ["Startup", "Bold", "Animated"],
        features: ["Premium Design", "Source Code", "24/7 Support"]
    },
    {
        id: "minimal-portfolio",
        name: "Minimal Portfolio",
        description: "Elegant minimalist portfolio template perfect for creatives and designers",
        category: "free",
        rating: 4.7,
        downloads: 2103,
        previewUrl: "#",
        tags: ["Portfolio", "Minimal", "Creative"],
        features: ["Gallery", "About Section", "Contact Form"]
    },
    {
        id: "ecommerce-elite",
        name: "E-commerce Elite",
        description: "Premium e-commerce landing page with product showcases and checkout integration",
        category: "premium",
        price: 79,
        rating: 5.0,
        downloads: 543,
        previewUrl: "#",
        tags: ["E-commerce", "Premium", "Conversion"],
        features: ["Product Grid", "Cart Integration", "Payment Ready"]
    },
    {
        id: "agency-modern",
        name: "Agency Modern",
        description: "Professional agency landing page with team showcase and project portfolio",
        category: "free",
        rating: 4.6,
        downloads: 1678,
        previewUrl: "#",
        tags: ["Agency", "Professional", "Team"],
        features: ["Team Section", "Portfolio", "Services"]
    },
    {
        id: "crypto-dashboard",
        name: "Crypto Dashboard",
        description: "Advanced crypto landing page with real-time charts and trading features",
        category: "premium",
        price: 99,
        rating: 4.9,
        downloads: 721,
        previewUrl: "#",
        tags: ["Crypto", "Dashboard", "Charts"],
        features: ["Live Charts", "Trading UI", "Wallet Integration"]
    }
];

const LandingPageLibrary = memo(function LandingPageLibrary() {
    const navigate = useNavigate();
    const [filter, setFilter] = useState<"all" | "free" | "premium">("all");

    const filteredTemplates = TEMPLATES.filter(template =>
        filter === "all" ? true : template.category === filter
    );

    return (
        <div className="min-h-screen bg-black text-white">
            <SEOHead pathname="/landing-pages" schemas={[buildBreadcrumbSchema([{ name: "Beymflow", url: `${SITE_URL}/` }, { name: "Landing Pages", url: `${SITE_URL}/landing-pages` }])]} />
            {/* Header */}
            <header className="border-b border-white/10 backdrop-blur-sm sticky top-0 z-50 bg-black/80">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center">
                    <button
                        onClick={() => navigate("/")}
                        className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
                    >
                        <ArrowLeft size={20} />
                        <span className="text-sm font-medium">Back to Home</span>
                    </button>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative py-12 px-6 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-purple-500/10 to-pink-500/10" />
                <div className="max-w-7xl mx-auto relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center max-w-3xl mx-auto"
                    >
                        {/* Filter Tabs */}
                        <div className="flex items-center justify-center gap-2 p-1 bg-white/5 border border-white/10 rounded-full max-w-md mx-auto">
                            {(["all", "free", "premium"] as const).map((filterOption) => (
                                <button
                                    key={filterOption}
                                    onClick={() => setFilter(filterOption)}
                                    className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${filter === filterOption
                                        ? "bg-white text-black"
                                        : "text-white/60 hover:text-white"
                                        }`}
                                >
                                    {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Templates Grid */}
            <section className="max-w-7xl mx-auto px-6 pb-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTemplates.map((template, index) => (
                        <motion.div
                            key={template.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="group relative bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all duration-300"
                        >
                            {/* Empty Template Container */}
                            <div className="relative aspect-video bg-gradient-to-br from-neutral-800 to-neutral-900 overflow-hidden flex items-center justify-center">
                                <div className="text-white/30 text-sm font-medium tracking-wider uppercase">Coming Soon</div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {filteredTemplates.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-white/40">No templates found</p>
                    </div>
                )}
            </section>
        </div>
    );
});

export default LandingPageLibrary;
