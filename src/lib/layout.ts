import * as dagre from 'dagre';
import type { Node, Edge } from './types/diagram';
import { wrapLabel } from './text/measure';
import { uiScale } from './uiScale';

type Rankdir = 'TB' | 'LR';
type LayoutOpts = { rankdir?: Rankdir; nodesep?: number; ranksep?: number; edgesep?: number };

// Tunables
const FONT = '600 14px Inter, ui-sans-serif, system-ui'; // match your text class
const PAD_X = 24;   // horizontal padding inside node
const PAD_Y = 16;   // vertical padding inside node
const MIN_W = 120;
const MAX_W = 400;  // increased to accommodate longer text
const LINE_H = 20;  // align with text-[14px] ~ 20px line-box

function sizeForNode(n: Node): { width: number; height: number; lines: string[]; lineHeight: number } {
  const s = uiScale();
  
  if (n.type === 'external') {
    // circle: allow slight growth if label is wide
    const radius = (n.radius ?? 50) * s;
    const wrapped = wrapLabel(n.label, 2 * radius - PAD_X * s, FONT, LINE_H * s);
    const needed = Math.max(wrapped.width + PAD_X * s, radius * 2);
    const finalRadius = Math.max(radius, Math.ceil(needed / 2));
    n.radius = finalRadius;
    return { width: finalRadius * 2, height: finalRadius * 2, lines: wrapped.lines, lineHeight: wrapped.lineHeight };
  }

  const wrapped = wrapLabel(n.label, (MAX_W - PAD_X) * s, FONT, LINE_H * s);
  const width = Math.max(MIN_W * s, Math.min(MAX_W * s, Math.ceil(wrapped.width + PAD_X * s)));
  // For cylinder, add space for the ellipses top/bottom
  if (n.type === 'datastore') {
    const bodyH = Math.max(56 * s, wrapped.height + PAD_Y * s);
    const ellipseH = 30 * s; // top + bottom ellipses (15 + 15)
    const height = bodyH + ellipseH;
    return { width, height, lines: wrapped.lines, lineHeight: wrapped.lineHeight };
  }

  const height = Math.max(56 * s, wrapped.height + PAD_Y * s);
  return { width, height, lines: wrapped.lines, lineHeight: wrapped.lineHeight };
}

export function computeLayout(nodes: Node[], edges: Edge[], _cw: number, _ch: number, opts: LayoutOpts = {}) {
  // Return early if we're in SSR environment
  if (typeof window === 'undefined') {
    // Return nodes with basic positioning for SSR
    const outNodes = nodes.map((n, index) => {
      const s = sizeForNode(n);
      return {
        ...n,
        x: index * 200,
        y: index * 100,
        width: s.width,
        height: s.height,
        labelLines: s.lines,
        lineHeight: s.lineHeight
      };
    });
    
    const outEdges = edges.map((e) => ({
      ...e,
      points: [],
      labelX: 0,
      labelY: 0
    }));
    
    return { nodes: outNodes, edges: outEdges };
  }

  const g = new dagre.graphlib.Graph({ multigraph: true, compound: false });
  g.setGraph({
    rankdir: opts.rankdir ?? 'TB',
    nodesep: opts.nodesep ?? 120, // Increased spacing between nodes
    edgesep: opts.edgesep ?? 80, // Increased spacing between edges
    ranksep: opts.ranksep ?? 200, // Increased spacing between ranks
    marginx: 60, // Increased margins
    marginy: 60, // Increased margins
    // important to leave label space:
    acyclicer: 'greedy'
  });
  g.setDefaultEdgeLabel(() => ({}));

  // add nodes (ensure width/height set)
  for (const n of nodes) {
    const s = sizeForNode(n);
    n.width = s.width;
    n.height = s.height;
    n.labelLines = s.lines;
    n.lineHeight = s.lineHeight;
    g.setNode(n.id, { width: n.width!, height: n.height! });
  }

  // add edges — use a unique name to distinguish parallels
  for (const e of edges) {
    const name = e.id ?? `edge_${e.source}_${e.target}_${e.label?.replace(/\s+/g, '_')}`;
    g.setEdge(e.source, e.target, { label: e.label ?? '', labelpos: 'c' }, name);
  }

  dagre.layout(g);

  // build result arrays
  const outNodes = nodes.map(n => {
    const d = g.node(n.id);
    return { 
      ...n, 
      x: d.x - d.width / 2, 
      y: d.y - d.height / 2, 
      width: d.width, 
      height: d.height 
    };
  });

  const outEdges = edges.map((e) => {
    const name = e.id ?? `edge_${e.source}_${e.target}_${e.label?.replace(/\s+/g, '_')}`;
    const de = g.edge(e.source, e.target, name);
    return {
      ...e,
      points: de.points as Array<{ x: number; y: number }>, // routed polyline
      labelX: de.x,  // dagre-computed label center
      labelY: de.y
    };
  });

  return { nodes: outNodes, edges: outEdges };
}
