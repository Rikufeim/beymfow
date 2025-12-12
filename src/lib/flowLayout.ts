import dagre from "dagre";

export type LayoutDirection = "TB" | "LR"; // top-bottom, left-right

// Types matching FlowEnginePage.tsx
export interface Widget {
  id: string;
  type: string;
  title?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  [key: string]: any; // Allow additional properties
}

export interface Edge {
  id: string;
  source: string;
  target: string;
}

const DEFAULT_NODE_WIDTH = 320;
const DEFAULT_NODE_HEIGHT = 280;

/**
 * Get node dimensions from widget
 */
function getNodeDimensions(widget: Widget): { width: number; height: number } {
  return {
    width: widget.width || DEFAULT_NODE_WIDTH,
    height: widget.height || DEFAULT_NODE_HEIGHT,
  };
}

/**
 * Apply auto-layout to widgets and edges using dagre
 */
export function getLayoutedElements(
  widgets: Widget[],
  edges: Edge[],
  direction: LayoutDirection = "TB"
): { widgets: Widget[]; edges: Edge[] } {
  try {
    const g = new dagre.graphlib.Graph();
    g.setDefaultEdgeLabel(() => ({}));

    // Configure layout direction and spacing
    g.setGraph({
      rankdir: direction,
      ranksep: 100, // Vertical spacing between ranks
      nodesep: 80,  // Horizontal spacing between nodes in same rank
      edgesep: 50,  // Minimum edge length
    });

    // Add nodes to graph with their dimensions
    widgets.forEach((widget) => {
      const { width, height } = getNodeDimensions(widget);
      g.setNode(widget.id, { width, height });
    });

    // Add edges to graph
    edges.forEach((edge) => {
      g.setEdge(edge.source, edge.target);
    });

    // Compute layout
    dagre.layout(g);

    // Update widget positions based on layout
    const layoutedWidgets = widgets.map((widget) => {
      const nodeWithPosition = g.node(widget.id);
      
      if (nodeWithPosition && typeof nodeWithPosition.x === 'number' && typeof nodeWithPosition.y === 'number') {
        const { width, height } = getNodeDimensions(widget);
        // dagre returns center position, convert to top-left
        return {
          ...widget,
          x: nodeWithPosition.x - width / 2,
          y: nodeWithPosition.y - height / 2,
        };
      }
      
      return widget;
    });

    return { widgets: layoutedWidgets, edges };
  } catch (error) {
    // If layout fails, return original widgets with default positions
    console.error("Layout error:", error);
    return { widgets, edges };
  }
}




