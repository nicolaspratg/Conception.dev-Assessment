import dagre from 'dagre';
import type { Node, Edge } from './types/diagram.js';

const NODE_SIZES = {
  component: { w: 150, h: 80 },
  external: { w: 100, h: 100 },
  datastore: { w: 120, h: 90 },
  custom: { w: 120, h: 80 } // Default size for custom shapes
} as const;

export function computeLayout(nodes: Node[], edges: Edge[], containerWidth: number = 600, containerHeight: number = 400) {
  if (edges.length === 0) {
    return nodes.map(n => ({
      ...n,
      width: n.width || NODE_SIZES[n.type]?.w || 120,
      height: n.height || NODE_SIZES[n.type]?.h || 80
    }));
  }

  const g = new dagre.graphlib.Graph()
    .setGraph({ 
      rankdir: 'TB',
      nodesep: 50,
      ranksep: 50,
      marginx: 20,
      marginy: 20
    })
    .setDefaultEdgeLabel(() => ({}));

  // Add nodes to the graph
  nodes.forEach(node => {
    const size = NODE_SIZES[node.type] || NODE_SIZES.custom;
    g.setNode(node.id, { 
      width: node.width || size.w, 
      height: node.height || size.h 
    });
  });

  // Add edges to the graph
  edges.forEach(edge => {
    g.setEdge(edge.source, edge.target);
  });

  // Compute the layout
  dagre.layout(g);

  // Extract the layout results
  return nodes.map(node => {
    const nodeData = g.node(node.id);
    const size = NODE_SIZES[node.type] || NODE_SIZES.custom;
    const w = node.width || size.w;
    const h = node.height || size.h;
    
    return {
      ...node,
      x: nodeData.x - w / 2,
      y: nodeData.y - h / 2,
      width: w,
      height: h
    };
  });
}
