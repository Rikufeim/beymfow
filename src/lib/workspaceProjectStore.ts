// Workspace & Project Store - Local Storage based

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  icon?: string; // emoji or icon name
  iconColor?: string; // background color for icon
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceProject {
  id: string;
  workspaceId: string;
  name: string;
  description?: string;
  thumbnail?: string;
  createdAt: string;
  updatedAt: string;
}

const WORKSPACES_KEY = "beymflow.workspaces";
const PROJECTS_KEY = "beymflow.workspace.projects";

// ============ WORKSPACES ============

function loadAllWorkspaces(): Workspace[] {
  try {
    return JSON.parse(localStorage.getItem(WORKSPACES_KEY) || "[]") || [];
  } catch {
    return [];
  }
}

function saveAllWorkspaces(workspaces: Workspace[]) {
  localStorage.setItem(WORKSPACES_KEY, JSON.stringify(workspaces));
}

export function getWorkspaces(): Workspace[] {
  return loadAllWorkspaces();
}

export function getWorkspace(id: string): Workspace | undefined {
  return loadAllWorkspaces().find((w) => w.id === id);
}

export function createWorkspace(name: string, description?: string): Workspace {
  const workspaces = loadAllWorkspaces();
  const now = new Date().toISOString();
  
  const newWorkspace: Workspace = {
    id: crypto.randomUUID(),
    name,
    description,
    iconColor: getRandomIconColor(),
    createdAt: now,
    updatedAt: now,
  };
  
  workspaces.push(newWorkspace);
  saveAllWorkspaces(workspaces);
  return newWorkspace;
}

export function updateWorkspace(id: string, updates: Partial<Omit<Workspace, "id" | "createdAt">>): Workspace | undefined {
  const workspaces = loadAllWorkspaces();
  const idx = workspaces.findIndex((w) => w.id === id);
  
  if (idx === -1) return undefined;
  
  workspaces[idx] = {
    ...workspaces[idx],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  saveAllWorkspaces(workspaces);
  return workspaces[idx];
}

export function deleteWorkspace(id: string): boolean {
  const workspaces = loadAllWorkspaces();
  const filtered = workspaces.filter((w) => w.id !== id);
  
  if (filtered.length === workspaces.length) return false;
  
  saveAllWorkspaces(filtered);
  
  // Also delete all projects in this workspace
  const projects = loadAllProjects().filter((p) => p.workspaceId !== id);
  saveAllProjects(projects);
  
  return true;
}

// ============ PROJECTS ============

function loadAllProjects(): WorkspaceProject[] {
  try {
    return JSON.parse(localStorage.getItem(PROJECTS_KEY) || "[]") || [];
  } catch {
    return [];
  }
}

function saveAllProjects(projects: WorkspaceProject[]) {
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
}

export function getWorkspaceProjects(workspaceId: string): WorkspaceProject[] {
  return loadAllProjects().filter((p) => p.workspaceId === workspaceId);
}

export function createWorkspaceProject(
  workspaceId: string,
  name: string,
  description?: string
): WorkspaceProject {
  const projects = loadAllProjects();
  const now = new Date().toISOString();
  
  const newProject: WorkspaceProject = {
    id: crypto.randomUUID(),
    workspaceId,
    name,
    description,
    createdAt: now,
    updatedAt: now,
  };
  
  projects.push(newProject);
  saveAllProjects(projects);
  return newProject;
}

export function updateWorkspaceProject(
  id: string,
  updates: Partial<Omit<WorkspaceProject, "id" | "workspaceId" | "createdAt">>
): WorkspaceProject | undefined {
  const projects = loadAllProjects();
  const idx = projects.findIndex((p) => p.id === id);
  
  if (idx === -1) return undefined;
  
  projects[idx] = {
    ...projects[idx],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  saveAllProjects(projects);
  return projects[idx];
}

export function deleteWorkspaceProject(id: string): boolean {
  const projects = loadAllProjects();
  const filtered = projects.filter((p) => p.id !== id);
  
  if (filtered.length === projects.length) return false;
  
  saveAllProjects(filtered);
  return true;
}

// ============ HELPERS ============

function getRandomIconColor(): string {
  const colors = [
    "#f97316", // orange
    "#ef4444", // red
    "#22c55e", // green
    "#3b82f6", // blue
    "#a855f7", // purple
    "#ec4899", // pink
    "#14b8a6", // teal
    "#eab308", // yellow
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

export function getWorkspaceInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
