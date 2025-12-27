import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { toast, Toaster } from "@/lib/notifications";
import { cn } from "@/lib/utils";
import { 
  loadLocalProjects as loadHeroProjects, 
  deleteProject as deleteHeroProject,
  type HeroBackgroundProject 
} from "@/lib/heroProjectStore";
import {
  Plus,
  X,
  Globe,
  Smartphone,
  Gamepad2,
  LogIn,
  LayoutTemplate,
  Bookmark,
  Sparkles,
  Puzzle,
  PresentationIcon,
  AppWindow,
  Bot,
  Image,
  Video,
  FileText,
  Wand2,
  ChevronDown,
} from "lucide-react";

// --- Mock Auth Context ---
interface UserType {
  id: string;
  email: string;
}

interface AuthContextType {
  user: UserType | null;
  login: () => void;
  logout: () => void;
}

const AuthContext = React.createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
});

const useAuth = () => React.useContext(AuthContext);

const MockAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserType | null>(() => {
    try {
      const saved = localStorage.getItem("beymflow.demo.user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const login = () => {
    const demoUser = { id: "demo-user-123", email: "demo@beymflow.com" };
    setUser(demoUser);
    localStorage.setItem("beymflow.demo.user", JSON.stringify(demoUser));
    toast.success("Signed in as Demo User");
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("beymflow.demo.user");
    toast.success("Signed out");
  };

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
};

// --- Project Types ---
interface SavedProject {
  id: string;
  name: string;
  domain: string;
  updatedAt: string;
  thumbnail?: string;
}

// --- Category Tabs Configuration ---
const CATEGORY_TABS = [
  { id: "ai-tools", label: "AI Tools", icon: Bot },
  { id: "components", label: "Components", icon: Puzzle },
  { id: "landing-pages", label: "Landing Pages", icon: AppWindow },
  { id: "prompts", label: "Prompts", icon: Wand2 },
  { id: "images", label: "Images", icon: Image },
  { id: "videos", label: "Videos", icon: Video },
];

// --- Filter Tags ---
const FILTER_TAGS = [
  { id: "saved", label: "Saved", icon: Bookmark },
  { id: "design", label: "Design resources", hasDropdown: true },
  { id: "prompt-gen", label: "Prompt Generator", icon: Sparkles },
  { id: "templates", label: "Templates", hasDropdown: true },
  { id: "presentations", label: "Presentations", icon: PresentationIcon, hasDropdown: true },
  { id: "websites", label: "Websites", icon: Globe, hasDropdown: true },
];

// --- Sample Project Cards for Demo ---
const SAMPLE_PROJECTS = [
  {
    id: "1",
    title: "Website Builder",
    author: "Beymflow",
    likes: "2.3k",
    uses: "14.7k",
    thumbnail: "/lovable-uploads/flow-engine-bg.png",
    type: "landing-pages",
  },
  {
    id: "2",
    title: "AI Prompt Generator",
    author: "Community",
    likes: "4.7k",
    uses: "20.8k",
    thumbnail: "/lovable-uploads/prompt-lab-bg.png",
    type: "ai-tools",
  },
  {
    id: "3",
    title: "Component Library",
    author: "Beymflow",
    likes: "4k",
    uses: "15.9k",
    thumbnail: "/lovable-uploads/card-bg-turquoise.png",
    type: "components",
  },
  {
    id: "4",
    title: "Image Prompt Creator",
    author: "Community",
    likes: "2.1k",
    uses: "11.1k",
    thumbnail: "/lovable-uploads/card-bg-purple.png",
    type: "images",
  },
];

// --- Main Component ---
const FlowEngineContent: React.FC = () => {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const [activeCategory, setActiveCategory] = useState<string>("ai-tools");
  const [activeFilter, setActiveFilter] = useState<string>("saved");
  const [savedProjects, setSavedProjects] = useState<SavedProject[]>([]);
  const [heroProjects, setHeroProjects] = useState<HeroBackgroundProject[]>([]);

  // Load saved projects
  useEffect(() => {
    try {
      const stored = localStorage.getItem("beymflow.projects");
      if (stored) {
        setSavedProjects(JSON.parse(stored));
      }
    } catch {
      console.error("Failed to load projects");
    }

    // Load hero projects
    const heroP = loadHeroProjects();
    setHeroProjects(heroP);
  }, []);

  const deleteProject = (id: string) => {
    const updated = savedProjects.filter((p) => p.id !== id);
    setSavedProjects(updated);
    localStorage.setItem("beymflow.projects", JSON.stringify(updated));
    toast.success("Project deleted");
  };

  const handleDeleteHeroProject = (id: string) => {
    deleteHeroProject(id);
    setHeroProjects(loadHeroProjects());
    toast.success("Project deleted");
  };

  const allProjects = [...heroProjects.map(p => ({
    id: p.id,
    title: p.name,
    author: "You",
    likes: "-",
    uses: "-",
    thumbnail: p.thumbnail,
    type: "hero-bg",
    isUserProject: true,
  })), ...savedProjects.map(p => ({
    id: p.id,
    title: p.name,
    author: "You",
    likes: "-",
    uses: "-",
    thumbnail: p.thumbnail,
    type: p.domain.toLowerCase(),
    isUserProject: true,
  }))];

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white font-sans">
      <Toaster />
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0d0d0d]/95 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center justify-between px-6 py-3">
          {/* Left - Logo */}
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition">
            <img
              src="/images/beymflow-logo.png"
              alt="Beymflow Logo"
              className="h-8 w-auto object-contain"
            />
            <span className="text-white font-semibold text-lg">Beymflow</span>
          </Link>

          {/* Right - Project Button Only */}
          <button
            onClick={() => navigate("/flow-engine/workspace")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500 text-white hover:bg-cyan-600 transition-all text-sm font-medium"
          >
            <Plus size={16} />
            <span>Project</span>
          </button>
        </div>
      </header>

      {/* Hero Section with floating icons */}
      <section className="relative py-16 overflow-hidden">
        {/* Floating Icons Background */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative w-full max-w-3xl h-40">
            {/* Floating icons */}
            <motion.div 
              animate={{ y: [0, -10, 0] }} 
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-0 left-[20%] p-3 rounded-xl bg-gradient-to-br from-pink-500 to-red-500 shadow-lg"
            >
              <Wand2 size={24} className="text-white" />
            </motion.div>
            <motion.div 
              animate={{ y: [0, 10, 0] }} 
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="absolute top-8 left-[35%] p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg"
            >
              <Globe size={24} className="text-white" />
            </motion.div>
            <motion.div 
              animate={{ y: [0, -8, 0] }} 
              transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
              className="absolute top-2 right-[35%] p-3 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg"
            >
              <Sparkles size={24} className="text-white" />
            </motion.div>
            <motion.div 
              animate={{ y: [0, 12, 0] }} 
              transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", delay: 0.7 }}
              className="absolute top-10 right-[20%] p-3 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 shadow-lg"
            >
              <Bot size={24} className="text-white" />
            </motion.div>
            <motion.div 
              animate={{ y: [0, -6, 0] }} 
              transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute bottom-0 left-[40%] p-3 rounded-xl bg-gradient-to-br from-orange-500 to-yellow-500 shadow-lg"
            >
              <Puzzle size={24} className="text-white" />
            </motion.div>
            <motion.div 
              animate={{ y: [0, 8, 0] }} 
              transition={{ duration: 2.9, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
              className="absolute bottom-4 right-[30%] p-3 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-400 shadow-lg"
            >
              <FileText size={24} className="text-white" />
            </motion.div>
          </div>
        </div>

        {/* Hero Text */}
        <div className="relative z-10 text-center px-4">
          <h1 className="text-2xl md:text-3xl font-medium text-white/90 mb-2">
            Discover community-made <span className="text-cyan-400">AI tools</span>,
          </h1>
          <p className="text-2xl md:text-3xl font-medium text-white/90">
            <span className="text-orange-400">components</span>, <span className="text-purple-400">templates</span>, and more
          </p>
        </div>
      </section>

      {/* Filter Tags Bar */}
      <div className="px-6 py-4 border-b border-white/5">
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {FILTER_TAGS.map((tag) => {
            const Icon = tag.icon;
            const isActive = activeFilter === tag.id;
            return (
              <button
                key={tag.id}
                onClick={() => setActiveFilter(tag.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all border",
                  isActive
                    ? "bg-white/10 text-white border-white/20"
                    : "bg-transparent text-neutral-400 border-white/10 hover:text-white hover:bg-white/5"
                )}
              >
                {Icon && <Icon size={14} />}
                <span>{tag.label}</span>
                {tag.hasDropdown && <ChevronDown size={14} className="opacity-50" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Section Title */}
      <div className="px-6 pt-8 pb-4">
        <div className="flex items-center gap-2">
          <span className="text-white/90 font-medium">Prompt to Code with Beymflow</span>
          <span className="text-white/40">›</span>
        </div>
      </div>

      {/* Project Cards Grid */}
      <div className="px-6 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* User Projects */}
          {allProjects.map((project) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="group cursor-pointer"
              onClick={() => toast.info(`Opening: ${project.title}`)}
            >
              {/* Card Thumbnail */}
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-3 border border-white/10">
                {project.thumbnail ? (
                  <img 
                    src={project.thumbnail} 
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-neutral-800 to-neutral-900 flex items-center justify-center">
                    <Sparkles size={32} className="text-neutral-600" />
                  </div>
                )}
                {/* Delete button for user projects */}
                {project.isUserProject && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (project.type === "hero-bg") {
                        handleDeleteHeroProject(project.id);
                      } else {
                        deleteProject(project.id);
                      }
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/50 text-white/70 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Card Info */}
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                  <Sparkles size={16} className="text-white/70" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white/90 font-medium truncate">{project.title}</h3>
                  <p className="text-neutral-500 text-sm">
                    by {project.author} · ♡ {project.likes} · 👤 {project.uses}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}

        </div>

      </div>
    </div>
  );
};

// --- Export with Provider ---
const FlowEngineUnified: React.FC = () => {
  return (
    <MockAuthProvider>
      <FlowEngineContent />
    </MockAuthProvider>
  );
};

export default FlowEngineUnified;
