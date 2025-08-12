export type NodeType = 'component' | 'external' | 'datastore' | 'custom';
export type ShapeType = 'rectangle' | 'circle' | 'cylinder' | 'hexagon' | 'diamond' | 'triangle';

export interface Node {
  id: string;
  type: NodeType;
  label: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  shape?: ShapeType; // For custom nodes
  // NEW: computed at layout time
  labelLines?: string[];
  lineHeight?: number;
}

export interface Edge {
  id: string;
  source: string;
  target: string;
  label: string;
  // NEW: only add arrowhead if directed === true
  directed?: boolean;
  // if using dagre routing already:
  points?: Array<{ x: number; y: number }>; // dagre-computed edge routing points
  labelX?: number; // dagre-computed label x coordinate
  labelY?: number; // dagre-computed label y coordinate
}

export interface DiagramData {
  nodes: Node[];
  edges: Edge[];
} 