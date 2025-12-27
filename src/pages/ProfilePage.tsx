import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { loadProjects } from "@/lib/workspaceStore";
import { loadLocalProjects } from "@/lib/heroProjectStore";
import { Edit2, Calendar } from "lucide-react";
import Layout from "@/components/Layout";
import Footer from "@/components/Footer";

interface SavedFlowProject {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

const FLOW_PROJECTS_KEY = "beymflow.flow-engine.projects";

const loadSavedProjects = (userId?: string): SavedFlowProject[] => {
  try {
    if (userId) {
      const userKey = `${FLOW_PROJECTS_KEY}.${userId}`;
      return JSON.parse(localStorage.getItem(userKey) || "[]") || [];
    }
    return JSON.parse(localStorage.getItem(FLOW_PROJECTS_KEY) || "[]") || [];
  } catch {
    return [];
  }
};

export default function ProfilePage() {
  const { user, loading, usageInfo } = useAuth();
  const navigate = useNavigate();
  const [promptLabProjects, setPromptLabProjects] = useState<any[]>([]);
  const [flowProjects, setFlowProjects] = useState<SavedFlowProject[]>([]);
  const [heroProjects, setHeroProjects] = useState<any[]>([]);
  const [promptsCount, setPromptsCount] = useState(0);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
      return;
    }

    if (user) {
      // Load all projects
      const promptLab = loadProjects();
      const flow = loadSavedProjects(user.id);
      const hero = loadLocalProjects();

      setPromptLabProjects(promptLab);
      setFlowProjects(flow);
      setHeroProjects(hero);

      // Calculate prompts count (placeholder - you can implement actual counting later)
      // For now, we'll use a placeholder value
      setPromptsCount(0); // TODO: Implement actual prompt counting
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
          <div className="text-white text-lg">Loading...</div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return null;
  }

  const totalProjects = promptLabProjects.length + flowProjects.length + heroProjects.length;
  const username = user.email?.split("@")[0] || "user";
  const userName = username.charAt(0).toUpperCase() + username.slice(1); // Capitalize first letter for name
  const displayName = userName; // Use name instead of email-based username
  const userEmail = user.email || "";
  const subscriptionTier = usageInfo?.subscriptionTier || "free";
  const hasActiveSubscription = usageInfo?.hasActiveSubscription || false;

  // Get user's name from metadata or fallback to email-based name
  const getUserName = () => {
    return user.user_metadata?.name || userName;
  };

  // Get first letter of name for avatar
  const getAvatarInitial = () => {
    const name = getUserName();
    return name?.charAt(0).toUpperCase() || "U";
  };

  // Get user's profile picture URL or null
  const getProfilePictureUrl = () => {
    return user.user_metadata?.avatar_url || null;
  };

  return (
    <Layout hideFooter={true}>
      <div className="min-h-screen bg-neutral-900 text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Profile Card */}
          <div className="rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 shadow-2xl">
            {/* Banner */}
            <div className="h-56 bg-transparent relative">
              {/* Edit profile button */}
              <button className="absolute top-4 right-4 px-4 py-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-medium hover:bg-white/20 transition-all">
                <Edit2 className="h-4 w-4 inline-block mr-2" />
                Edit profile
              </button>
            </div>

            {/* Profile Content */}
            <div className="px-6 pb-6 relative bg-zinc-900">
              {/* Profile Picture */}
              <div className="relative -mt-16 mb-4">
                {getProfilePictureUrl() ? (
                  <img 
                    src={getProfilePictureUrl()!} 
                    alt="Profile" 
                    className="w-32 h-32 rounded-full bg-neutral-900 border-4 border-zinc-800 object-cover"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-neutral-900 border-4 border-zinc-800 flex items-center justify-center text-white text-4xl font-semibold">
                    {getAvatarInitial()}
                  </div>
                )}
              </div>

              {/* Username */}
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-white mb-4 tracking-tight">{displayName}</h1>
                
                {/* User Info - Side by side, left aligned */}
                <div className="flex flex-wrap gap-12 md:gap-16 lg:gap-20 items-start">
                  {/* Name */}
                  <div className="flex-1 min-w-[200px]">
                    <div className="text-sm text-zinc-400 mb-1">Name</div>
                    <div className="text-white font-medium">{userName}</div>
                    <a href="#" className="text-sm text-zinc-400 hover:text-zinc-300 underline mt-1 inline-block">Change name</a>
                  </div>

                  {/* Email */}
                  <div className="flex-1 min-w-[200px]">
                    <div className="text-sm text-zinc-400 mb-1">Email</div>
                    <div className="text-white font-medium">{userEmail}</div>
                    <a href="#" className="text-sm text-zinc-400 hover:text-zinc-300 underline mt-1 inline-block">Change email</a>
                  </div>

                  {/* Role */}
                  <div className="flex-1 min-w-[200px]">
                    <div className="text-sm text-zinc-400 mb-1">Role</div>
                    <div className="text-white font-medium">Flow</div>
                    <a href="#" className="text-sm text-zinc-400 hover:text-zinc-300 underline mt-1 inline-block">Change flow</a>
                  </div>
                </div>

                {/* Plan Section */}
                {!hasActiveSubscription ? (
                  <div className="mt-6 pt-6 border-t border-zinc-700">
                    <div className="text-sm text-zinc-400 mb-2">Upgrade Beymflow plan</div>
                    <p className="text-sm text-zinc-500 mb-4">Upgrade plan for unlimited prompts and features.</p>
                    <a 
                      href="/premium" 
                      className="inline-block px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
                    >
                      View plans
                    </a>
                  </div>
                ) : (
                  <div className="mt-6 pt-6 border-t border-zinc-700">
                    <div className="text-sm text-zinc-400 mb-1">Plan</div>
                    <div className="text-white font-medium capitalize">{subscriptionTier}</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Projects Section */}
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-white mb-6">Projects ({totalProjects})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* PromptLab Projects */}
              {promptLabProjects.map((project) => (
                <div
                  key={project.id || `promptlab-${project.name}`}
                  className="rounded-xl bg-zinc-900 border border-zinc-800 p-4 hover:border-zinc-700 transition-colors cursor-pointer"
                >
                  <h3 className="text-white font-semibold mb-2 truncate">{project.name}</h3>
                  <p className="text-zinc-400 text-sm">PromptLab Project</p>
                  {project.createdAt && (
                    <p className="text-zinc-500 text-xs mt-2">
                      <Calendar className="h-3 w-3 inline-block mr-1" />
                      {new Date(project.createdAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ))}

              {/* Flow Projects */}
              {flowProjects.map((project) => (
                <div
                  key={project.id}
                  className="rounded-xl bg-zinc-900 border border-zinc-800 p-4 hover:border-zinc-700 transition-colors cursor-pointer"
                >
                  <h3 className="text-white font-semibold mb-2 truncate">{project.name}</h3>
                  <p className="text-zinc-400 text-sm">Flow Project</p>
                  {project.createdAt && (
                    <p className="text-zinc-500 text-xs mt-2">
                      <Calendar className="h-3 w-3 inline-block mr-1" />
                      {new Date(project.createdAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ))}

              {/* Hero Projects */}
              {heroProjects.map((project) => (
                <div
                  key={project.id}
                  className="rounded-xl bg-zinc-900 border border-zinc-800 p-4 hover:border-zinc-700 transition-colors cursor-pointer"
                >
                  <h3 className="text-white font-semibold mb-2 truncate">{project.name}</h3>
                  <p className="text-zinc-400 text-sm">Hero Background</p>
                  {project.createdAt && (
                    <p className="text-zinc-500 text-xs mt-2">
                      <Calendar className="h-3 w-3 inline-block mr-1" />
                      {new Date(project.createdAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ))}

              {/* Empty State */}
              {totalProjects === 0 && (
                <div className="col-span-full text-center py-12 text-zinc-400">
                  <p>No projects yet. Start creating!</p>
                </div>
              )}
            </div>
          </div>

          {/* Prompts Section */}
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-white mb-6">Prompts ({promptsCount})</h2>
            <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-8">
              {promptsCount === 0 ? (
                <div className="text-center text-zinc-400">
                  <p>No prompts yet. Start creating prompts to see them here!</p>
                </div>
              ) : (
                <div className="text-zinc-400">
                  <p>Prompts will be displayed here</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </Layout>
  );
}

