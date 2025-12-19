/**
 * Hero Background Project Store
 * Handles persistence for hero background projects (localStorage + cloud)
 */

import type { HeroBackgroundSettings } from "@/components/flow-engine/HeroBackgroundWorkspace";

export interface HeroBackgroundProject {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  thumbnail?: string;
  settings: HeroBackgroundSettings;
}

const LOCAL_STORAGE_KEY = "beymflow.hero-projects";
const DRAFT_KEY = "beymflow.hero-draft";

// --- Local Storage Operations ---

export function loadLocalProjects(): HeroBackgroundProject[] {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveLocalProjects(projects: HeroBackgroundProject[]): void {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(projects));
}

export function loadDraft(): HeroBackgroundProject | null {
  try {
    const stored = localStorage.getItem(DRAFT_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export function saveDraft(project: Partial<HeroBackgroundProject> & { settings: HeroBackgroundSettings }): void {
  const draft: HeroBackgroundProject = {
    id: project.id || `draft-${Date.now()}`,
    name: project.name || "Untitled Draft",
    createdAt: project.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    settings: project.settings,
    thumbnail: project.thumbnail,
  };
  localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}

export function clearDraft(): void {
  localStorage.removeItem(DRAFT_KEY);
}

// --- Project Operations ---

export function createProject(
  name: string,
  settings: HeroBackgroundSettings,
  thumbnail?: string
): HeroBackgroundProject {
  const now = new Date().toISOString();
  return {
    id: `hero-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name,
    createdAt: now,
    updatedAt: now,
    settings,
    thumbnail,
  };
}

export function saveProject(project: HeroBackgroundProject, userId?: string): HeroBackgroundProject {
  const projects = loadLocalProjects();
  const existingIndex = projects.findIndex((p) => p.id === project.id);
  
  const updatedProject = {
    ...project,
    updatedAt: new Date().toISOString(),
  };

  if (existingIndex >= 0) {
    projects[existingIndex] = updatedProject;
  } else {
    projects.unshift(updatedProject);
  }

  saveLocalProjects(projects);
  return updatedProject;
}

export function deleteProject(projectId: string): void {
  const projects = loadLocalProjects();
  const filtered = projects.filter((p) => p.id !== projectId);
  saveLocalProjects(filtered);
}

export function getProject(projectId: string): HeroBackgroundProject | null {
  const projects = loadLocalProjects();
  return projects.find((p) => p.id === projectId) || null;
}

// --- Auto-naming ---

export function generateProjectName(): string {
  const projects = loadLocalProjects();
  const heroProjects = projects.filter((p) => p.name.startsWith("Hero Background"));
  const maxNumber = heroProjects.reduce((max, p) => {
    const match = p.name.match(/Hero Background (\d+)/);
    if (match) {
      return Math.max(max, parseInt(match[1], 10));
    }
    return max;
  }, 0);
  
  return `Hero Background ${String(maxNumber + 1).padStart(3, "0")}`;
}

// --- Thumbnail Generation ---

export function generateThumbnail(
  settings: HeroBackgroundSettings,
  width = 512,
  height = 288
): Promise<string> {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    
    if (!ctx) {
      resolve("");
      return;
    }

    const { color1, color2, color3, color4, singleColorMode, gradientStyle, brightness, environmentEnabled } = settings;

    // Draw base gradient
    if (singleColorMode) {
      ctx.fillStyle = color1;
      ctx.fillRect(0, 0, width, height);
    } else {
      switch (gradientStyle) {
        case "halo": {
          const gradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, Math.max(width, height) / 2);
          gradient.addColorStop(0, color3 + "66");
          gradient.addColorStop(0.4, color2 + "99");
          gradient.addColorStop(1, color1);
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, width, height);
          break;
        }
        case "soft-sweep": {
          const gradient = ctx.createLinearGradient(0, 0, width, height);
          gradient.addColorStop(0, color1);
          gradient.addColorStop(0.3, color2);
          gradient.addColorStop(0.6, color3 + "80");
          gradient.addColorStop(1, color4 + "4d");
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, width, height);
          break;
        }
        case "orb": {
          ctx.fillStyle = color1;
          ctx.fillRect(0, 0, width, height);
          
          const orb1 = ctx.createRadialGradient(width * 0.3, height * 0.7, 0, width * 0.3, height * 0.7, width * 0.4);
          orb1.addColorStop(0, color3 + "99");
          orb1.addColorStop(1, "transparent");
          ctx.fillStyle = orb1;
          ctx.fillRect(0, 0, width, height);
          
          const orb2 = ctx.createRadialGradient(width * 0.7, height * 0.3, 0, width * 0.7, height * 0.3, width * 0.4);
          orb2.addColorStop(0, color4 + "99");
          orb2.addColorStop(1, "transparent");
          ctx.fillStyle = orb2;
          ctx.fillRect(0, 0, width, height);
          break;
        }
        case "diagonal-blend": {
          const gradient = ctx.createLinearGradient(0, height, width, 0);
          gradient.addColorStop(0, color1);
          gradient.addColorStop(0.25, color2);
          gradient.addColorStop(0.5, color3 + "cc");
          gradient.addColorStop(0.75, color4 + "99");
          gradient.addColorStop(1, color1);
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, width, height);
          break;
        }
        case "noise-wash": {
          const gradient = ctx.createLinearGradient(0, 0, 0, height);
          gradient.addColorStop(0, color1);
          gradient.addColorStop(0.3, color2 + "e6");
          gradient.addColorStop(0.7, color3 + "66");
          gradient.addColorStop(1, color1);
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, width, height);
          break;
        }
      }
    }

    // Add environment glow
    if (environmentEnabled && !singleColorMode) {
      const envGlow = ctx.createRadialGradient(width / 2, height * 0.3, 0, width / 2, height * 0.3, width * 0.6);
      envGlow.addColorStop(0, color3 + "26");
      envGlow.addColorStop(1, "transparent");
      ctx.fillStyle = envGlow;
      ctx.fillRect(0, 0, width, height);
    }

    // Apply brightness (approximate)
    if (brightness !== 1) {
      ctx.globalCompositeOperation = "source-atop";
      ctx.fillStyle = brightness > 1 ? `rgba(255,255,255,${(brightness - 1) * 0.3})` : `rgba(0,0,0,${(1 - brightness) * 0.5})`;
      ctx.fillRect(0, 0, width, height);
    }

    resolve(canvas.toDataURL("image/jpeg", 0.8));
  });
}
