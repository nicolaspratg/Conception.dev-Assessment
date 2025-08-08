import dagre from 'dagre';
import type { Node, Edge } from './types/diagram.js';

export function computeLayout(nodes: Node[], edges: Edge[], containerWidth: number = 600, containerHeight: number = 400) {
  // If no edges, return nodes with their original positions
  if (edges.length === 0) {
    return nodes.map(n => ({
      ...n,
      width: n.width || (n.type === 'component' ? 150 : n.type === 'datastore' ? 120 : 100),
      height: n.height || (n.type === 'component' ? 80 : n.type === 'datastore' ? 90 : 100)
    }));
  }

  const g = new dagre.graphlib.Graph()
    .setGraph({ 
      rankdir: 'TB', 
      marginx: 40, 
      marginy: 40,
      nodesep: 60,
      ranksep: 120
    })
    .setDefaultEdgeLabel(() => ({}));

  // Define accurate node dimensions per type
  const NODE_SIZES = {
    component: { w: 150, h: 80 },
    external: { w: 100, h: 100 },  // diameter
    datastore: { w: 120, h: 90 },  // cylinder incl. ellipses
  };

  // Add nodes to the graph with their accurate dimensions
  nodes.forEach(n => {
    const { w, h } = NODE_SIZES[n.type];
    g.setNode(n.id, { width: w, height: h });
  });

  // Add edges to the graph
  edges.forEach(e => g.setEdge(e.source, e.target));

  // Compute the layout
  dagre.layout(g);

  // Return nodes with dagre-computed positions
  // Dagre provides center positions, so we need to convert to top-left for rendering
  return nodes.map(n => {
    const nodeData = g.node(n.id);
    const { w, h } = NODE_SIZES[n.type];
    
    return {
      ...n,
      x: nodeData.x - w / 2,
      y: nodeData.y - h / 2,
      width: w,
      height: h
    };
  });
}
