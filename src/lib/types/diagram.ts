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
}

export interface Edge {
  id: string;
  source: string;
  target: string;
  label: string;
}

export interface DiagramData {
  nodes: Node[];
  edges: Edge[];
} 