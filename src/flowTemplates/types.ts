export type TemplateNodeType =
  | "prompt"
  | "category"
  | "flow-input"
  | "flow-text-gen"
  | "flow-agent"
  | "flow-state"
  | "flow-tool";

export interface TemplateNodeDefinition {
  id: string;
  title: string;
  subtitle?: string;
  type: TemplateNodeType;
  x: number;
  y: number;
  width: number;
  height: number;
  placeholder?: string;
  content?: string;
  style?: string;
}

export interface TemplateConnection {
  source: string;
  target: string;
  label?: string;
}

export interface TemplateDefinition {
  name: string;
  nodes: TemplateNodeDefinition[];
  connections: TemplateConnection[];
  thumbnail: string;
}
