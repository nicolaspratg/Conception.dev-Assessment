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
    return {
      nodes: nodes.map(n => ({
        ...n,
        width: n.width || NODE_SIZES[n.type]?.w || 120,
        height: n.height || NODE_SIZES[n.type]?.h || 80
      })),
      edges: []
    };
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

  // Add edges to the graph with label information
  edges.forEach(edge => {
    g.setEdge(edge.source, edge.target, {
      label: edge.label,
      width: Math.max(edge.label.length * 7, 40),
      height: 20
    });
  });

  // Compute the layout
  dagre.layout(g);

  // Extract the layout results for nodes
  const layoutNodes = nodes.map(node => {
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

  // Extract edge layout information including label positions
  const layoutEdges = edges.map(edge => {
    const edgeData = g.edge(edge.source, edge.target);
    return {
      ...edge,
      points: edgeData.points || [],
      labelPos: {
        x: edgeData.x || 0,
        y: edgeData.y || 0,
        width: edgeData.width || Math.max(edge.label.length * 7, 40),
        height: edgeData.height || 20
      }
    };
  });

  return {
    nodes: layoutNodes,
    edges: layoutEdges
  };
}
