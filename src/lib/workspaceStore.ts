"use client";
export type PromptLabProject = {
  id?: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
  // Voit lisätä tänne mitä haluat talteen
  assistantMessages?: any[];
  optimizerMessages?: any[];
  generatorState?: any;
};

async function tryServerSave(p: PromptLabProject) {
  try {
    const r = await fetch("/api/projects", {
      method: p.id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(p),
      credentials: "include",
    });
    if (!r.ok) return null;
    return await r.json(); // odotetaan { id, ... }
  } catch { return null; }
}

const LS_KEY = "multiply.promptlab.projects";

function loadAllLocal(): PromptLabProject[] {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || "[]") || []; } catch { return []; }
}
function saveAllLocal(arr: PromptLabProject[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(arr));
}

export async function saveProject(p: PromptLabProject, forceLocal = false) {
  const now = new Date().toISOString();
  const data = { ...p, updatedAt: now, createdAt: p.createdAt || now };

  if (!forceLocal) {
    const saved = await tryServerSave(data);
    if (saved?.id) return saved as PromptLabProject;
  }

  // local fallback
  const all = loadAllLocal();
  if (data.id) {
    const i = all.findIndex(x => x.id === data.id);
    if (i >= 0) all[i] = data; else all.push(data);
  } else {
    data.id = crypto.randomUUID();
    all.push(data);
  }
  saveAllLocal(all);
  return data;
}

export function loadProjects(): PromptLabProject[] { return loadAllLocal(); }
