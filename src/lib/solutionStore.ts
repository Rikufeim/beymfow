// Solution Store - Local Storage based for imported solutions

export type SolutionType = "ai-tool" | "website-ui" | "import-package";
export type RuntimeType = "prompt-tool" | "api-tool" | "nodejs-function";

export interface Solution {
  id: string;
  type: SolutionType;
  name: string;
  description?: string;
  thumbnail?: string;
  createdAt: string;
  updatedAt: string;
  // For AI Tools
  runtimeType?: RuntimeType;
  toolConfig?: Record<string, any>;
  // For Website/UI
  htmlCode?: string;
  // For Import Package
  manifest?: Record<string, any>;
}

const SOLUTIONS_KEY = "beymflow.solutions";

function loadAllSolutions(): Solution[] {
  try {
    return JSON.parse(localStorage.getItem(SOLUTIONS_KEY) || "[]") || [];
  } catch {
    return [];
  }
}

function saveAllSolutions(solutions: Solution[]) {
  localStorage.setItem(SOLUTIONS_KEY, JSON.stringify(solutions));
}

export function getSolutions(): Solution[] {
  return loadAllSolutions();
}

export function getSolution(id: string): Solution | undefined {
  return loadAllSolutions().find((s) => s.id === id);
}

export function createSolution(data: Omit<Solution, "id" | "createdAt" | "updatedAt">): Solution {
  const solutions = loadAllSolutions();
  const now = new Date().toISOString();
  
  const newSolution: Solution = {
    ...data,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  };
  
  solutions.push(newSolution);
  saveAllSolutions(solutions);
  return newSolution;
}

export function updateSolution(
  id: string,
  updates: Partial<Omit<Solution, "id" | "createdAt">>
): Solution | undefined {
  const solutions = loadAllSolutions();
  const idx = solutions.findIndex((s) => s.id === id);
  
  if (idx === -1) return undefined;
  
  solutions[idx] = {
    ...solutions[idx],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  saveAllSolutions(solutions);
  return solutions[idx];
}

export function deleteSolution(id: string): boolean {
  const solutions = loadAllSolutions();
  const filtered = solutions.filter((s) => s.id !== id);
  
  if (filtered.length === solutions.length) return false;
  
  saveAllSolutions(filtered);
  return true;
}

// Get icon based on solution type
export function getSolutionIcon(type: SolutionType): string {
  switch (type) {
    case "ai-tool":
      return "🤖";
    case "website-ui":
      return "🌐";
    case "import-package":
      return "📦";
    default:
      return "📄";
  }
}
