import dagre from 'dagre';
import type { Node, Edge } from './types/diagram';
import { wrapLabel } from './text/measure';

type Rankdir = 'TB' | 'LR';
type LayoutOpts = { rankdir?: Rankdir; nodesep?: number; ranksep?: number; edgesep?: number };

// Tunables
const FONT = '600 14px Inter, ui-sans-serif, system-ui'; // match your text class
const PAD_X = 24;   // horizontal padding inside node
const PAD_Y = 16;   // vertical padding inside node
const MIN_W = 120;
const MAX_W = 240;  // desktop; consider 180 on mobile
const LINE_H = 20;  // align with text-[14px] ~ 20px line-box

function sizeForNode(n: Node): { width: number; height: number; lines: string[]; lineHeight: number } {
  if (n.type === 'external') {
    // circle: allow slight growth if label is wide
    const wrapped = wrapLabel(n.label, 2 * (n.radius ?? 50) - PAD_X, FONT, LINE_H);
    const needed = Math.max(wrapped.width + PAD_X, (n.radius ?? 50) * 2);
    const radius = Math.max(n.radius ?? 50, Math.ceil(needed / 2));
    n.radius = radius;
    return { width: radius * 2, height: radius * 2, lines: wrapped.lines, lineHeight: wrapped.lineHeight };
  }

  const wrapped = wrapLabel(n.label, MAX_W - PAD_X, FONT, LINE_H);
  const width = Math.max(MIN_W, Math.min(MAX_W, Math.ceil(wrapped.width + PAD_X)));
  // For cylinder, add space for the ellipses top/bottom
  if (n.type === 'datastore') {
    const bodyH = Math.max(56, wrapped.height + PAD_Y);
    const ellipseH = 30; // top + bottom ellipses (15 + 15)
    const height = bodyH + ellipseH;
    return { width, height, lines: wrapped.lines, lineHeight: wrapped.lineHeight };
  }

  const height = Math.max(56, wrapped.height + PAD_Y);
  return { width, height, lines: wrapped.lines, lineHeight: wrapped.lineHeight };
}

export function computeLayout(nodes: Node[], edges: Edge[], _cw: number, _ch: number, opts: LayoutOpts = {}) {
  const g = new dagre.graphlib.Graph({ multigraph: true, compound: false });
  g.setGraph({
    rankdir: opts.rankdir ?? 'TB',
    nodesep: opts.nodesep ?? 80, // Increased from 60
    edgesep: opts.edgesep ?? 50, // Increased from 30
    ranksep: opts.ranksep ?? 140, // Increased from 110
    marginx: 40, // Increased from 20
    marginy: 40, // Increased from 20
    // important to leave label space:
    acyclicer: 'greedy',
    edgeLabelSpace: true,
    // Additional spacing for labels
    labeloffset: 10,
    // Prevent edge overlap
    multiedge: true
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
    g.setEdge(
      { v: e.source, w: e.target, name },
      { label: e.label ?? '', labelpos: 'c' }, // dagre will compute x/y for label
      name
    );
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
    const de = g.edge({ v: e.source, w: e.target, name });
    return {
      ...e,
      points: de.points as Array<{ x: number; y: number }>, // routed polyline
      labelX: de.x,  // dagre-computed label center
      labelY: de.y
    };
  });

  return { nodes: outNodes, edges: outEdges };
}
