import type { ShapeType } from '$lib/diagram/constants';

export interface Node {
  id: string;
  type: ShapeType;
  label: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
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