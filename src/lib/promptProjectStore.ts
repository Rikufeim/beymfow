/**
 * Prompt Project Store
 * Handles persistence for saved prompts (localStorage)
 */

export interface PromptProject {
  id: string;
  name: string;
  prompt: string;
  input: string;
  model: "fast" | "advanced" | "premium";
  category: string;
  createdAt: string;
  updatedAt: string;
}

const LOCAL_STORAGE_KEY = "beymflow.prompt-projects";

export function loadPromptProjects(): PromptProject[] {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function savePromptProjects(projects: PromptProject[]): void {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(projects));
}

export function savePromptProject(project: PromptProject): PromptProject {
  const projects = loadPromptProjects();
  const existingIndex = projects.findIndex((p) => p.id === project.id);
  const updated = { ...project, updatedAt: new Date().toISOString() };

  if (existingIndex >= 0) {
    projects[existingIndex] = updated;
  } else {
    projects.unshift(updated);
  }

  savePromptProjects(projects);
  return updated;
}

export function deletePromptProject(id: string): void {
  const projects = loadPromptProjects();
  savePromptProjects(projects.filter((p) => p.id !== id));
}

export function createPromptProject(
  prompt: string,
  input: string,
  model: "fast" | "advanced" | "premium",
  category: string
): PromptProject {
  const now = new Date().toISOString();
  const name = input.trim().slice(0, 50) || "Untitled Prompt";
  return {
    id: `prompt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name,
    prompt,
    input,
    model,
    category,
    createdAt: now,
    updatedAt: now,
  };
}
